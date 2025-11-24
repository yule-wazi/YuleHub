import { getInteractables } from './Observe'
import { ActionExecutor } from './ActExe'
import { buildAgentPrompt } from './prompts'
import { postDZMMAgent } from '@/service/module/agents'
import myCache from '@/utils/cacheStorage'
import { ErrorHandler } from './ErrorHandler'
import { chatWithDZMMAI } from '@/view/chat/utils/pushMessage'

/**
 * AgentController - 协调 Agent 任务流程的核心控制器
 * 负责页面观察、AI 决策和操作执行的完整流程
 */
export class AgentController {
  constructor() {
    this.executor = new ActionExecutor()
  }

  /**
   * 执行完整的 Agent 任务流程
   * @param {string} userPrompt - 用户输入的需求
   * @returns {Promise<AgentResult>} Agent 执行结果
   */
  async runTask(userPrompt) {
    try {
      // 1. 观察页面元素
      const elements = await this.observePage()

      if (elements.length === 0) {
        return {
          success: false,
          message: '当前页面没有可操作的元素',
          elements: [],
        }
      }

      // 2. 构建 AI Prompt
      const prompt = this.buildPrompt(userPrompt, elements)

      // 3. 调用 AI 服务
      const aiResponse = await this.callAI(prompt)

      // 4. 解析 AI 响应
      const instructions = this.parseAIResponse(aiResponse)

      // 5. 执行操作
      const results = await this.executeActions(instructions)

      // 6. 生成反馈消息
      const feedbackMessage = this.generateFeedbackMessage(results)

      return {
        success: true,
        message: feedbackMessage,
        elements: elements,
        instructions: instructions,
        results: results,
      }
    } catch (error) {
      // 使用 ErrorHandler 处理错误
      const handledError = ErrorHandler.handle(error, 'AgentController.runTask')

      return {
        success: false,
        message: handledError.message,
        error: handledError,
        recovery: handledError.recovery,
      }
    }
  }

  /**
   * 观察页面并获取可交互元素
   * @returns {Promise<Array>} 可交互元素列表
   */
  async observePage() {
    try {
      console.log('👀 正在扫描页面元素...')

      // 调用 Observe 模块扫描页面
      const elements = getInteractables()

      console.log(`✅ 扫描完成，找到 ${elements.length} 个可交互元素`)

      return elements
    } catch (error) {
      console.error('[AgentController] 页面扫描失败:', error)
      throw new Error('页面扫描失败，请刷新页面后重试')
    }
  }

  /**
   * 构建 AI Prompt
   * @param {string} userPrompt - 用户需求
   * @param {Array} elements - 元素列表
   * @returns {string} 完整的 Prompt
   */
  buildPrompt(userPrompt, elements) {
    return buildAgentPrompt(userPrompt, elements)
  }

  /**
   * 调用 AI 服务
   * @param {string} prompt - Prompt 文本
   * @returns {Promise<string>} AI 响应
   */
  async callAI(prompt) {
    try {
      console.log('🤖 正在调用 AI 服务...')
      const currentMessage = { message: '' }
      const messageList = [
        {
          role: 'user',
          content: prompt,
        },
      ]
      await chatWithDZMMAI(currentMessage, messageList, null, false, null)
      console.log('✅ AI 响应接收成功')

      return currentMessage.message
    } catch (error) {
      console.error('[AgentController] AI 服务调用失败:', error)
      throw new Error(`AI 服务调用失败: ${error.message}`)
    }
  }

  /**
   * 解析 AI 响应 - 简单文本格式
   * @param {string} response - AI 响应文本
   * @returns {Array} 操作指令列表
   */
  parseAIResponse(response) {
    try {
      console.log('📝 正在解析 AI 响应...')
      console.log('原始响应:', response)

      const actions = []

      // 按空行分割操作块
      const blocks = response.split(/\n\s*\n/).filter((block) => block.trim())
      for (const block of blocks) {
        const lines = block.split('\n').map((line) => line.trim())
        const action = {}
        for (const line of lines) {
          // 解析 key: value 格式
          const match = line.match(/^(\w+):\s*(.+)$/)
          if (match) {
            const key = match[1].toLowerCase()
            const value = match[2].trim()
            if (key === 'type') {
              action.type = value
            } else if (key === 'id') {
              action.id = parseInt(value, 10)
            } else if (key === 'value') {
              action.value = value
            } else if (key === 'reason') {
              action.reason = value
            }
          }
        }
        // 验证必需字段
        if (action.type) {
          actions.push(action)
        }
      }
      if (actions.length === 0) {
        throw new Error('AI 响应中未找到有效的操作指令')
      }

      console.log(`✅ 解析成功，共 ${actions.length} 个操作指令:`, actions)
      return actions
    } catch (error) {
      console.error('[AgentController] AI 响应解析失败:', error)
      throw new Error(`AI 响应解析失败: ${error.message}`)
    }
  }

  /**
   * 将 ActionInstruction 转换为 Action 对象
   * @param {Object} instruction - AI 生成的指令
   * @returns {Object} ActionExecutor 可执行的 Action 对象
   */
  convertToAction(instruction) {
    const action = {
      type: instruction.type,
      value: instruction.value,
      waitAfter: 1000, // 默认等待 1 秒
    }

    // 如果有元素 ID，构建 selector
    if (instruction.id) {
      action.selector = `[data-agent-id="${instruction.id}"]`
    }

    // // 如果是 input 类型，添加 value
    // if (instruction.type === 'input' && instruction.value) {
    //   action.value = instruction.value
    // }

    return action
  }

  /**
   * 执行操作指令
   * @param {Array} instructions - 指令列表
   * @returns {Promise<Array>} 执行结果列表
   */
  async executeActions(instructions) {
    const results = []

    console.log(`⚡ 开始执行 ${instructions.length} 个操作...`)

    for (const instruction of instructions) {
      const startTime = Date.now()

      try {
        // 转换为 Action 对象
        const action = this.convertToAction(instruction)

        // 执行操作
        const result = await this.executor.perform(action)

        const duration = Date.now() - startTime

        results.push({
          instruction: instruction,
          success: result.success,
          duration: duration,
          error: result.error,
        })

        console.log(`✅ 操作 ${instruction.type} 执行成功 (${duration}ms)`)
      } catch (error) {
        const duration = Date.now() - startTime

        results.push({
          instruction: instruction,
          success: false,
          duration: duration,
          error: error.message,
        })

        console.error(`❌ 操作 ${instruction.type} 执行失败:`, error)
      }
    }

    return results
  }

  /**
   * 生成反馈消息
   * @param {Array} results - 执行结果列表
   * @returns {string} 反馈消息
   */
  generateFeedbackMessage(results) {
    if (!results || results.length === 0) {
      return '没有执行任何操作'
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    let message = ''

    if (failCount === 0) {
      // 全部成功
      message = `✅ 成功执行了 ${successCount} 个操作：\n\n`
      results.forEach((r, index) => {
        const reason = r.instruction.reason || '无说明'
        message += `${index + 1}. ${r.instruction.type} - ${reason}\n`
      })
    } else if (successCount === 0) {
      // 全部失败
      message = `❌ 所有操作都执行失败了：\n\n`
      results.forEach((r, index) => {
        message += `${index + 1}. ${r.instruction.type} - ${r.error}\n`
      })
    } else {
      // 部分成功
      message = `⚠️ 部分操作执行成功 (${successCount}/${results.length})：\n\n`
      message += '成功的操作：\n'
      results
        .filter((r) => r.success)
        .forEach((r, index) => {
          const reason = r.instruction.reason || '无说明'
          message += `${index + 1}. ${r.instruction.type} - ${reason}\n`
        })
      message += '\n失败的操作：\n'
      results
        .filter((r) => !r.success)
        .forEach((r, index) => {
          message += `${index + 1}. ${r.instruction.type} - ${r.error}\n`
        })
    }

    return message
  }
}
