/**
 * 节流函数
 * @param {Function} fn      需要节流的函数
 * @param {Number}   delay   时间间隔（毫秒）
 * @param {Object}   options 可选配置
 *        {Boolean}  leading  是否在延迟开始前立即执行一次（默认 true）
 *        {Boolean}  trailing 是否在延迟结束后追加执行一次（默认 true）
 * @returns {Function} 节流后的函数，含 cancel 方法
 */
export function throttle(fn, delay, options = {}) {
  let timer = null
  let lastInvokeTime = 0
  const { leading = true, trailing = true } = options

  function throttled(...args) {
    const now = Date.now()
    // 第一次触发时立即执行
    if (!lastInvokeTime && !leading) lastInvokeTime = now
    const remaining = delay - (now - lastInvokeTime)

    if (remaining <= 0 || remaining > delay) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastInvokeTime = now
      fn.apply(this, args)
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        lastInvokeTime = leading ? Date.now() : 0
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
  // 取消未执行的回调
  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastInvokeTime = 0
  }
  return throttled
}
