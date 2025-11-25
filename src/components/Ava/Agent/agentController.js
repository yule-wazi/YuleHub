import { getInteractables } from '../Observe/observe'
import { ActionExecutor } from '../Act/actExe'
import { buildAgentPrompt } from './prompts'
import { ErrorHandler } from '../utils/ErrorHandler'
import { chatToAgent } from '../utils/chatToAgent'

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
      const tool_calls = await this.callAI(prompt)
      // 4. 解析 AI 响应
      const instructions = this.parseAIResponse(tool_calls)
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
      const messageList = { role: 'user', content: prompt }
      const tool_calls = await chatToAgent(messageList)
      console.log('✅ AI 响应接收成功')
      return tool_calls
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
  parseAIResponse(tool_calls) {
    try {
      console.log('📝 正在解析 AI 响应...')
      const actions = []
      for (const toolCall of tool_calls) {
        let argsString = toolCall.function.arguments
        // ========== 数据清洗逻辑 ==========
        // 1. 去除首尾空白
        argsString = argsString.trim()
        // 2. 如果字符串本身被引号包裹,先去除外层引号
        if (
          (argsString.startsWith('"') && argsString.endsWith('"')) ||
          (argsString.startsWith("'") && argsString.endsWith("'"))
        ) {
          argsString = argsString.slice(1, -1)
        }
        // 3. 处理转义的引号
        argsString = argsString.replace(/\\"/g, '"')
        // 4. 移除可能存在的多余闭合括号
        const firstBrace = argsString.indexOf('{')
        if (firstBrace !== -1) {
          let braceCount = 0
          let lastValidBrace = -1
          for (let i = firstBrace; i < argsString.length; i++) {
            if (argsString[i] === '{') braceCount++
            if (argsString[i] === '}') {
              braceCount--
              if (braceCount === 0) {
                lastValidBrace = i
                break
              }
            }
          }
          if (lastValidBrace !== -1) {
            argsString = argsString.substring(firstBrace, lastValidBrace + 1)
          }
        }
        // ========== 清洗逻辑结束 ==========

        try {
          const actionsObject = JSON.parse(argsString)
          actions.push(actionsObject)
        } catch (parseError) {
          console.error('单个 action 解析失败:', argsString, parseError)
          // ========== 尝试修复 JSON ==========
          let fixedString = null
          try {
            // 尝试1: 移除末尾多余的括号和引号
            let fixed = argsString.replace(/\}\s*\}\s*["']?\s*$/, '}')
            JSON.parse(fixed)
            fixedString = fixed
          } catch (e1) {
            try {
              // 尝试2: 处理可能的数组格式
              if (argsString.startsWith('[')) {
                let fixed = argsString.replace(/\]\s*\]\s*["']?\s*$/, ']')
                JSON.parse(fixed)
                fixedString = fixed
              }
            } catch (e2) {
              // 修复失败
            }
          }
          // ========== 修复逻辑结束 ==========
          if (fixedString) {
            const actionsObject = JSON.parse(fixedString)
            console.log('actionsObject (修复后)=', actionsObject)
            actions.push(actionsObject)
          } else {
            throw parseError
          }
        }
      }
      if (actions.length === 0) {
        throw new Error('AI 响应中未找到有效的操作指令')
      }
      console.log(`✅ 解析成功,共 ${actions.length} 个操作指令:`, actions)
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
