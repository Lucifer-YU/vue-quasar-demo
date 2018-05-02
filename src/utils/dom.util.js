export class DomUtil {
  static cssTransform (val) {
    const prefix = ['-webkit-', '-moz-', '-ms-', '-o-']
    let o = { transform: val }
    prefix.forEach(p => {
      o[p + 'transform'] = val
    })
    return o
  }
}
