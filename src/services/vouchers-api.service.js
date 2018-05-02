import { Observable } from 'rxjs'
import { HttpService } from './http.service'
import auth from './vouchers-auth.service'

export class VouchersApiService extends HttpService {
  /**
   * API根路径
   */
  _baseUrl = process.env.API_BASE_URL

  /**
   * 城市列表
   */
  cityList () {
    return this._apiCall('cities')
  }

  /**
   * 批次列表
   *
   * @param {*} city 城市
   * @param {*} categoryId 分类ID
   * @param {*} page 页号
   * @param {*} size 分页大小
   * @param {*} sortBy 排序方式(0:热门,1:距离)
   * @param {*} lng 经度
   * @param {*} lat 纬度
   */
  batchList (city = undefined, categoryId = undefined, page = 0, size = 20, sortBy = 0, lng = undefined, lat = undefined) {
    const alias = 'icbc.gold.home' // 金券首页
    return this._apiCall('batches', { city, alias, categoryId, page, size, sortBy, lng, lat })
  }
  /**
   * 批次详情
   * @param {*} batchId 批次ID
   * @param {*} city 城市
   * @param {*} lng 经度
   * @param {*} lat 纬度
   */
  batchDetail (batchId, city = undefined, lng = undefined, lat = undefined) {
    return this._apiCall(`batches/detail/${batchId}`, { city, lng, lat })
  }
  /**
   * 批次计算(下单时参数验证及返回确认信息)
   * @param {*} batchId
   * @param {*} count
   */
  batchCalc (batchId, count, discountCode) {
    return auth.loginRequired(() => this._apiCall(`batches/calc/${batchId}`, { count, discountCode }))
  }
  /**
   * 分类列表
   * @param {*} parentId 父级分类id, 如果不指定则获取金券首页分类列表
   */
  categoryList (parentId = undefined) {
    const alias = 'icbc.gold.home' // 金券首页
    return this._apiCall('categories', { alias, parentId })
  }

  couponList (type, page = 0, size = 20) {
    const alias = 'icbc.gold.home'
    return this._apiCall('coupons', { type, entryAlias: alias, page, size })
  }

  /**
   * 获取HTML内容
   * @param {*} urlOrString url或者内容
   */
  pullHtmlDetail (urlOrString) {
    const pattern = /^http(s)?:\/\/+/gm
    // 现在第三方传回的详情是文本，所以需要判断是文本还是URL
    if (urlOrString.match(pattern)) {
      // 如果是URL则请求URL文本
      return this.get(urlOrString).map(response => {
        return response.data
      }).catch(error => {
        console.warn(`unable to pull content of url: ${urlOrString}, error:${error}`)
        return Observable.of('N/A')
      })
    }
    else {
      // 否则直接返回文本
      return Observable.of(urlOrString)
    }
  }

  galleryList (categoryId = undefined) {
    console.log(`categoryId=${categoryId}`)
    let gallery
    if (categoryId === 5) {
      gallery = [
        { title: '#0', imageUrl: 'statics/bnn_food_0.png' },
        { title: '#1', imageUrl: 'statics/bnn_food_1.png' },
        { title: '#2', imageUrl: 'statics/bnn_food_2.png' }
      ]
    }
    else if (categoryId === 6) {
      gallery = [
        { title: '#0', imageUrl: 'statics/bnn_skiing_0.png' },
        { title: '#1', imageUrl: 'statics/bnn_skiing_1.png' },
        { title: '#2', imageUrl: 'statics/bnn_skiing_2.png' }
      ]
    }
    else if (categoryId === 7) {
      gallery = [
        { title: '#0', imageUrl: 'statics/bnn_disco_0.png' },
        { title: '#1', imageUrl: 'statics/bnn_disco_1.png' },
        { title: '#2', imageUrl: 'statics/bnn_disco_2.png' }
      ]
    }
    else {
      gallery = [
        { title: '#0', imageUrl: 'statics/bnn_0.png' },
        { title: '#1', imageUrl: 'statics/bnn_1.png' }
      ]
    }
    return Observable.of(gallery)
  }

  /**
   * API调用(私有方法)
   *
   * @param {*} apiName API名称
   * @param {*} params 参数
   * @param {*} usePost 是否使用POST方法
   * @returns API返回数据的Observable对象
   */
  _apiCall (apiName, params = {}, usePost = false) {
    let observable = usePost
      ? this.post(this._baseUrl + apiName, { ...params })
      : this.get(this._baseUrl + apiName, { ...params })
    return observable
      .switchMap(response => {
        let data = response.data || { code: 500, msg: 'Bad response body.' }
        if (data.code !== 200) {
          // 返回代码不为200，意味着有错误发生。
          if (data.code === 631) {

          }
          return Observable.throw({ code: data.code, error: data.msg })
        }
        return Observable.of(response.data.results)
      })
  }
}

export default new VouchersApiService()
