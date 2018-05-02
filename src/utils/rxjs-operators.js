import { Observable } from 'rxjs'

// Rxjs目前没实现Reactive Extension中的一些操作.

Observable.prototype.doOnSubscribe = function (onSubscribe) {
  let self = this
  return Observable.defer(() => {
    onSubscribe()
    return self
  })
}
