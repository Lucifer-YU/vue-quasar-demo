import { Subject } from 'rxjs'
import geoLocation from './geo-location.service'
import '../utils/rxjs-operators'

export class AppStateService {
  KEY_CITY_NAME = 'cityName';
  KEY_USER_ID = 'userId'
  // 事件类型
  EV_CITY_CHANGED = 'ev/city'
  EV_USER_CHANGED = 'ev/userId'
  EV_LOCATION_CHANGED = 'ev/location'

  // _subject = new BehaviorSubject({ key: this.EV_INITIAL, args: undefined })
  _subject = new Subject() // PublishSubject
  _currentLocation = geoLocation.fallbackPosition

  /**
   * 设置/获取当前城市
   */
  set city (newVal) {
    const key = this._buildKey(this.KEY_CITY_NAME)
    const curVal = localStorage[key]
    if (curVal !== newVal) {
      localStorage[key] = newVal
      this.emit(this.EV_CITY_CHANGED, newVal)
    }
  }
  get city () {
    const key = this._buildKey(this.KEY_CITY_NAME)
    const defaultCityName = '北京市'
    return localStorage[key] || defaultCityName
  }

  /**
   * 设置/获取当前用户
   */
  set userId (newVal) {
    const key = this._buildKey(this.KEY_USER_ID)
    const curVal = localStorage[key]
    if (curVal !== newVal) {
      if (!newVal) {
        localStorage.removeItem(key)
      }
      else {
        localStorage[key] = newVal
      }
      this.emit(this.EV_USER_CHANGED, newVal)
    }
  }
  get userId () {
    const key = this._buildKey(this.KEY_USER_ID)
    return localStorage[key]
  }

  /**
   * 获取当前地理位置
   */
  get location () {
    return this._currentLocation
  }

  /**
   * 生成缓存KEY
   * @param {*} names
   */
  _buildKey (...names) {
    return names.map(name => encodeURIComponent(name)).join('/')
  }
  /**
   * 发出一个事件
   * @param {*} key 事件类型
   * @param {*} args 事件参数
   */
  emit (key, args = undefined) {
    this._subject.next({ key, args })
  }
  /**
   * 监听事件
   * @param {*} key
   */
  on (...keys) {
    let useGeo = keys.find(key => key === this.EV_LOCATION_CHANGED)
    return this._subject.asObservable()
      .filter(ev => (ev && (keys.findIndex(key => key === ev.key) !== -1)))
      .doOnSubscribe(() => {
        // 是否监视地理位置变更
        if (useGeo) {
          console.log(`obtain geo-location...`)
          this._geoObtain()
        }
      })
      .finally(() => {
        if (useGeo) {
          // 停止监视地理位置变更
          console.log(`release geo-location...`)
          this._geoRelease()
        }
      })
  }

  /// ///////////////////////////
  /// 地理位置监视
  /// ///////////////////////////
  _geoObtainCount = 0
  _geoObtain () {
    if (!this._geoObtainCount++) {
      console.log(`watching geo-location...`)
      this.geoHndler = geoLocation.event.subscribe(location => {
        let oldLocation = this._currentLocation
        this._currentLocation = location
        // 过滤掉细微的地理位置抖动
        if (!oldLocation ||
        Math.abs(oldLocation.longitude - location.longitude) > 0.000001 ||
        Math.abs(oldLocation.latetude - location.latetude) > 0.000001) {
          this._subject.next({ key: this.EV_LOCATION_CHANGED, args: location })
        }
      })
    }
  }
  _geoRelease () {
    if (!--this._geoObtainCount) {
      console.log(`stop watching geo-location...`)
      this.geoHndler.unsubscribe()
      this.geoHndler = undefined
    }
  }
}

export default new AppStateService()
