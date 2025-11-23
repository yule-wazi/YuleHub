import '../css/index.css'
const driver = window.driver.js.driver

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

// 核心执行类
export class ActionExecutor {
  constructor() {
    this.driver = driver({
      animate: true,
      smoothScroll: true,
      allowKeyboardControl: false,
      stagePadding: 0,
    })
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // 执行单个动作
  async perform(action) {
    try {
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
          if (action.value === 'back') {
            window.history.back()
            this.driver.destroy()
          }
          break

        default:
          console.warn('Unknown action type:', action.type)
      }
      if (action.willNavigate) {
        this.driver.destroy()
      }
      // 动作后等待 (给页面反应时间)
      await this.sleep(action.waitAfter || 500)

      return {
        success: true,
        action: action.type,
      }
    } catch (error) {
      console.error(`[Act] Failed to execute ${action.type}:`, error)
      this.driver.destroy()
      return {
        success: false,
        action: action.type,
        error: error.message,
      }
    }
  }

  // 执行完整的任务链
  async runSequence(actions) {
    for (const act of actions) {
      await this.perform(act)
    }
    // 全部完成后清理
    this.driver.destroy()
    console.log('[Act] All actions completed.')
  }
}
