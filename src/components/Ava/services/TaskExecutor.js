import { observePage } from '../core/observer.js'
import { Executor } from '../core/executor.js'
import { callAI } from '../core/actionClient.js'
import { parseAIResponse, convertToAction } from '../core/parser.js'
import { buildPrompt } from '../config/prompts.js'
import { TaskChainController } from './TaskChainController.js'
import { ErrorHandler } from '../utils/ErrorHandler.js'

export class TaskExecutor {
  constructor() {
    this.executor = new Executor()
    this.taskChainController = new TaskChainController(this)
  }

  observePage() {
    try {
      return observePage()
    } catch (error) {
      console.error('[TaskExecutor] 页面扫描失败:', error)
      throw new Error('页面扫描失败，请刷新页面后重试')
    }
  }

  buildPrompt(userPrompt, elements) {
    return buildPrompt(userPrompt, elements)
  }

  async callAI(prompt) {
    try {
      return await callAI(prompt)
    } catch (error) {
      console.error('[AgentService] AI 服务调用失败:', error)
      throw new Error(`AI 服务调用失败: ${error.message}`)
    }
  }

  parseAIResponse(tool_calls) {
    return parseAIResponse(tool_calls)
  }

  async executeActions(instructions) {
    const results = []
    for (const instruction of instructions) {
      const startTime = Date.now()
      try {
        // 转换为 Action 对象
        const action = convertToAction(instruction)
        // 执行操作
        const result = await this.executor.perform(action)
        const duration = Date.now() - startTime
        results.push({
          instruction: instruction,
          success: result.success,
          duration: duration,
          error: result.error,
        })
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

  async runTaskChain(userPrompt, options = {}) {
    try {
      const result = await this.taskChainController.executeTaskChain(userPrompt, options)
      return result
    } catch (error) {
      console.error('[AgentService] 任务链执行失败:', error)
      const handledError = ErrorHandler.handle(error, 'AgentService.runTaskChain')
      return {
        success: false,
        message: handledError.message,
        error: handledError,
      }
    }
  }
}
