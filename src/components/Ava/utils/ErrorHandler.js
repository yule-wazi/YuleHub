/**
 * ErrorHandler - 统一的错误处理类
 */
export class ErrorHandler {
  /**
   * 统一错误处理入口
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @returns {Object} 处理后的错误信息
   */
  static handle(error, context = '') {
    const errorType = this.classify(error)
    const userMessage = this.getUserMessage(errorType, error)
    const recovery = this.getRecoveryAction(errorType)

    console.error(`[ErrorHandler] ${context}:`, error)

    return {
      type: errorType,
      message: userMessage,
      recovery: recovery,
      originalError: error,
    }
  }

  /**
   * 错误分类
   * @param {Error} error - 错误对象
   * @returns {string} 错误类型
   */
  static classify(error) {
    const message = error.message || ''

    if (message.includes('网络') || message.includes('fetch') || message.includes('Network')) {
      return 'NETWORK'
    }
    if (message.includes('JSON') || message.includes('parse')) {
      return 'JSON_PARSE'
    }
    if (message.includes('元素') || message.includes('element') || message.includes('selector')) {
      return 'ELEMENT_MISSING'
    }
    if (message.includes('超时') || message.includes('timeout') || message.includes('Timeout')) {
      return 'TIMEOUT'
    }
    if (message.includes('Token') || message.includes('API')) {
      return 'API_ERROR'
    }

    return 'UNKNOWN'
  }

  /**
   * 获取用户友好的错误消息
   * @param {string} errorType - 错误类型
   * @param {Error} error - 错误对象
   * @returns {string} 用户消息
   */
  static getUserMessage(errorType, error) {
    const messages = {
      NETWORK: '网络连接失败，请检查网络后重试',
      JSON_PARSE: 'AI 返回了无效的指令格式，请重新描述你的需求',
      ELEMENT_MISSING: '目标元素未找到，页面可能已更新，请刷新后重试',
      TIMEOUT: '操作执行超时，请检查页面状态',
      API_ERROR: 'API 服务出错，请检查 Token 配置或稍后重试',
      UNKNOWN: `发生未知错误: ${error.message}`,
    }

    return messages[errorType] || messages.UNKNOWN
  }

  /**
   * 获取恢复操作建议
   * @param {string} errorType - 错误类型
   * @returns {string} 恢复操作
   */
  static getRecoveryAction(errorType) {
    const actions = {
      NETWORK: 'RETRY',
      JSON_PARSE: 'REGENERATE',
      ELEMENT_MISSING: 'RESCAN',
      TIMEOUT: 'MANUAL_CHECK',
      API_ERROR: 'CHECK_CONFIG',
      UNKNOWN: 'REPORT',
    }

    return actions[errorType] || actions.UNKNOWN
  }
}
