import '../css/index.css'

// 动态加载 driver.js
let driverLoaded = false
let driverLoadPromise = null

function loadDriver() {
  if (driverLoaded) {
    return Promise.resolve(window.driver.js.driver)
  }

  if (driverLoadPromise) {
    return driverLoadPromise
  }

  driverLoadPromise = new Promise((resolve, reject) => {
    // 加载 CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.css'
    document.head.appendChild(link)

    // 加载 JS
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.js.iife.js'
    script.onload = () => {
      driverLoaded = true
      resolve(window.driver.js.driver)
    }
    script.onerror = () => reject(new Error('Failed to load driver.js'))
    document.head.appendChild(script)
  })

  return driverLoadPromise
}

function waitForElement(selector, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector)
    if (el) return resolve(el)

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) {
        observer.disconnect()
        resolve(el)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Timeout waiting for element: ${selector}`))
    }, timeout)
  })
}

/**
 * Executor - 动作执行器
 * 负责在页面上执行具体的操作（点击、输入、导航等）
 */
export class Executor {
  constructor() {
    this.driver = null
    this.driverReady = loadDriver().then((driverFn) => {
      this.driver = driverFn({
        animate: true,
        smoothScroll: true,
        allowKeyboardControl: false,
        stagePadding: 0,
      })
    })
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 执行单个动作
   * @param {Object} action - 动作对象
   * @returns {Promise<Object>} 执行结果
   */
  async perform(action) {
    try {
      // 确保 driver 已加载
      await this.driverReady

      let el = null
      if (action.selector) {
        el = await waitForElement(action.selector)
      }

      // 视觉层：高亮当前操作对象
      if (el) {
        this.driver.highlight({ element: el })
        await this.sleep(800)
      }

      // 操作层：根据类型执行逻辑
      switch (action.type) {
        case 'click':
          el.click()
          break

        case 'input':
          el.focus()
          el.value = action.value
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
          el.blur()
          break

        case 'scroll':
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          break

        case 'observe':
          await this.sleep(1000)
          break

        case 'navigate':
          console.log('进入navigate', action)
          if (action.value === 'back') {
            window.history.back()
            console.log('已经执行back')
          }
          break

        case 'done':
          break

        default:
          console.warn('Unknown action type:', action.type)
      }
      this.driver.destroy()
      // 动作后等待 (给页面反应时间)
      await this.sleep(action.waitAfter || 500)

      return {
        success: true,
        action: action.type,
      }
    } catch (error) {
      console.error(`[Executor] Failed to execute ${action.type}:`, error)
      this.driver.destroy()
      return {
        success: false,
        action: action.type,
        error: error.message,
      }
    }
  }

  /**
   * 执行完整的任务链
   * @param {Array} actions - 动作列表
   */
  async runSequence(actions) {
    for (const act of actions) {
      await this.perform(act)
    }
    // 全部完成后清理
    this.driver.destroy()
    console.log('[Executor] All actions completed.')
  }
}
