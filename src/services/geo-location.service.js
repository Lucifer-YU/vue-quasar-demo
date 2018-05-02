import { BehaviorSubject } from 'rxjs'
import '../utils/rxjs-operators'

class Coordinate {
  longitude
  latitude
  constructor (longitude, latitude) {
    this.longitude = longitude
    this.latitude = latitude
  }
  toString () {
    return `{ lng: ${this.longitude}, lat: ${this.latitude} }`
  }
}
class GeoLocationService {
  // 默认坐标天安门
  fallbackPosition = new Coordinate(116.3972282409, 39.9096045604)
  _watchId
  _watchSubject = new BehaviorSubject(this.fallbackPosition)

  /**
   * 启动服务
   */
  _start () {
    console.log('starting GEO location service...')
    if (!this._watchId) {
      if ('geolocation' in navigator) {
        let options = { enableHighAccuracy: true, maximumAge: 5 * 60 * 1000 }
        // 获取地理位置信息
        navigator.geolocation.getCurrentPosition(position => {
          let coordinate = new Coordinate(position.coords.longitude, position.coords.latitude)
          console.log(`get current position: ${coordinate}`)
          this._watchSubject.next(coordinate)
        }, error => {
          console.warn(`get current position error: (${error.code}) ${error.message}`)
        }, options)
        // 持续监视地理位置变更
        this._watchId = navigator.geolocation.watchPosition(position => {
          let coordinate = new Coordinate(position.coords.longitude, position.coords.latitude)
          console.log(`watch current position: ${coordinate}`)
          this._watchSubject.next(coordinate)
        }, error => {
          console.warn(`watch position error: (${error.code}) ${error.message}`)
        }, options)
      }
      else {
        console.warn('GEO location service unavailable')
      }
    }
  }
  /**
   * 停止服务
   */
  _stop () {
    console.log('stopping GEO location service...')
    if (this._watchId) {
      if ('geolocation' in navigator) {
        navigator.geolocation.clearWatch(this._watchId)
      }
      // _watchSubject.complete() // remaining callers should keep watching on it.
      this._watchId = undefined
    }
  }

  /**
   * 事件源
   */
  subscribeCount = 0
  get event () {
    return this._watchSubject.asObservable()
      .doOnSubscribe(() => {
        this.subscribeCount++
        if (this.subscribeCount === 1) {
          this._start()
        }
      })
      .finally(() => {
        this.subscribeCount--
        if (!this.subscribeCount) {
          this._stop()
        }
      })
  }
}

export default new GeoLocationService()
