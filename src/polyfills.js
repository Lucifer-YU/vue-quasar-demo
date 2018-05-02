
window.Promise = Promise

if (!Element.hasOwnProperty('remove')) {
  Element.prototype.remove = function () {
    this.parentNode.removeChild(this)
  }
}
