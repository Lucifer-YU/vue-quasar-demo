import './rxjs-operators'
import { Observable } from 'rxjs/Observable'

export class RefresherContext {
  tasks = 0
  finallyCallback
  errorCallback
  isFirstError = true
  constructor (finallyCallback, errorCallback = undefined) {
    this.finallyCallback = finallyCallback || function () { }
    this.errorCallback = errorCallback
  }
  add (observable) {
    return observable
      .doOnSubscribe(() => {
        this.tasks++
      })
      .catch(error => {
        if (this.errorCallback) {
          // error callback installed, redirect observable error(s) to it.
          if (this.isFirstError) {
            this.errorCallback(error)
            this.isFirstError = false // only emit first error.
          }
          console.log(`ignoring error: ${JSON.stringify(error)}.`)
          return Observable.empty()
        }
        else {
          // No error callbck, throw it.
          return Observable.throw(error)
        }
      })
      .finally(() => {
        if (!--this.tasks) {
          this.finallyCallback()
        }
      })
  }
}
