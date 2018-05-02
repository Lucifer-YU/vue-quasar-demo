import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { Observable } from 'rxjs'

Vue.use(VueAxios, axios)

export class HttpService {
  defaultTimeout = 30 * 1000

  get (url, params = {}, timeout = this.defaultTimeout) {
    return this._toObservable(Vue.axios.get(url, { params, timeout }))
  }
  post (url, data = {}, timeout = this.defaultTimeout) {
    return this._toObservable(Vue.axios.post(url, data, { timeout }))
  }
  _toObservable (promise) {
    return Observable.fromPromise(promise)
      .catch((err, caught) => {
        // 处理本地网络错误和服务器HTTP错误.
        let error = 'Unknown error'
        let code = -1
        if (err.response) {
          code = err.response.status
          error = `Status text: ${err.response.statusText}`
        }
        else if (err.message) {
          error = `Message: ${err.message}`
        }
        return Observable.throw({ error, code })
      })
  }
}
