import appState from './app-state.service'
import { BehaviorSubject, Observable } from 'rxjs'

export class VouchersAuthService {
  _loginSubject = new BehaviorSubject()

  get loginRequest () {
    return this._loginSubject.asObservable().filter(value => !!value)
  }

  loginRequired (delegate) {
    let loginObservable = () => {
      let userId = appState.userId
      console.log(`begin login:(userId:${userId})...`)
      return userId ? Observable.of(userId) : Observable
        .create(emitter => {
          console.log(`STEP: 2`)
          this._loginSubject.next((userNo, err) => {
            if (err) {
              console.log(`login failed with error:${err}`)
              emitter.err(err)
            }
            else {
              console.log(`login success with userNo:${userNo}`)
              appState.userId = userNo
              emitter.next(userNo)
              emitter.complete()
            }
          })
        })
    }
    return loginObservable()
      .switchMap(userId => delegate(userId))
      .catch((err, caugth) => {
        console.log(`err=${JSON.stringify(err)}`)
        if (err.code === 631) {
          // 登录失败，清除本地缓存的用户id
          appState.userId = undefined
          console.log(`try login again...`)
          return loginObservable().switchMap(userId => delegate(userId))
        }
        return Observable.throw(err)
      })
  }
}

export default new VouchersAuthService()
