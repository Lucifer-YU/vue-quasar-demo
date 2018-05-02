
export class FormatUtil {
  /**
 * 人性化显示时间差
 * @param {*} time 当前时间
 * @param {*} since 之前时间
 */
  static timeLeft (time, since = Date.now()) {
    const PER_SECOND = 1000
    const PER_MINUTE = 60 * PER_SECOND
    const PER_HOUR = 60 * PER_MINUTE
    const PER_DAY = 24 * PER_HOUR

    let left = time - since
    const days = Math.floor(left / PER_DAY)
    left %= PER_DAY
    const hours = Math.floor(left / PER_HOUR)
    left %= PER_HOUR
    const minutes = Math.floor(left / PER_MINUTE)

    return `${days}天${hours}:${minutes}结束`
  }

  static date (time) {
    let options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
    let fmt = new Intl.DateTimeFormat('zh-CN', options)
    return fmt.format(time)
  }

  static error (error) {
    let str
    if (error) {
      if (typeof error === 'string') {
        str = error
      }
      else if (error.error) {
        str = ''
        if (error.code) {
          str = `[${error.code}] `
        }
        str += error.error
      }
    }
    return str
  }
}
