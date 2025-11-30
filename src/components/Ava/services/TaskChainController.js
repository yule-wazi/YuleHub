import { TaskPlanner } from './TaskPlanner.js'

/**
 * TaskChainController - 任务链总控制器
 * 协调任务规划和执行的完整流程
 */
export class TaskChainController {
  constructor(agentService) {
    this.agentService = agentService
    this.taskPlanner = new TaskPlanner()
  }

  // 执行任务链的主入口
  async executeTaskChain(userPrompt, options = {}) {
    const { onProgress = null, onPlanReady = null } = options
    try {
      // 1. 观察页面，获取可交互元素
      const elements = await this.agentService.observePage()

      // 2. 任务规划阶段（传入可交互元素）
      const plan = await this.planTasks(userPrompt, elements)

      // 3. 验证计划
      const validation = this.taskPlanner.validatePlan(plan)
      if (!validation.valid) {
        return {
          success: false,
          message: `任务计划验证失败: ${validation.errors.join(', ')}`,
          error: new Error('计划验证失败'),
        }
      }
      // 4. 如果有计划就绪回调，调用它（用于显示预览）
      if (onPlanReady) {
        await onPlanReady(plan)
      }
      // 5. 执行任务序列
      const sequenceResult = await this.executeSequence(plan.tasks, onProgress)
      console.log('[TaskChainController] 任务链执行完成:', sequenceResult)
      return {
        success: sequenceResult.success,
        message: sequenceResult.message,
        plan: plan,
        results: sequenceResult.results,
        error: null,
      }
    } catch (error) {
      console.error('[TaskChainController] 任务链执行失败:', error)
      return {
        success: false,
        message: `任务链执行失败: ${error.message}`,
        error: error,
      }
    }
  }

  // 规划任务
  async planTasks(userPrompt, elements = []) {
    const plan = await this.taskPlanner.planTasks(userPrompt, elements)
    return plan
  }

  // 执行单个子任务
  async executeTask(task) {
    const startTime = Date.now()

    try {
      // 记录任务开始时的 URL
      const initialUrl = window.location.href

      // 1. 重新扫描页面元素
      const elements = await this.agentService.observePage()

      // 2. 构建 Prompt（添加任务目标）
      let prompt = this.agentService.buildPrompt(task.description, elements)
      prompt += `\n\n当前任务目标：${task.goal}`

      // 3. 调用 AI 服务获取操作指令
      console.log('actionPrompt=', prompt)
      const tool_calls = await this.agentService.callAI(prompt)

      // 4. 解析 AI 响应
      const instructions = this.agentService.parseAIResponse(tool_calls)

      // 5. 执行操作
      await this.agentService.executeActions(instructions)

      // 等待一小段时间，确保路由变化能被捕获
      await this.sleep(300)

      // 检查 URL 是否变化
      const finalUrl = window.location.href
      if (finalUrl !== initialUrl) {
        console.log(`[TaskChainController] 🔄 URL 发生变化: ${initialUrl} -> ${finalUrl}`)
      }

      const duration = Date.now() - startTime
      return {
        taskId: task.id,
        success: true,
        duration,
        urlChanged: finalUrl !== initialUrl,
        error: null,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[TaskChainController] 任务执行失败: ${task.id}`, error)
      return {
        taskId: task.id,
        success: false,
        duration,
        error: error.message,
      }
    }
  }

  // 执行任务序列
  async executeSequence(tasks, onProgress = null) {
    const results = []
    let completedCount = 0
    let failedCount = 0

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]

      // 执行任务
      const result = await this.executeTask(task)
      results.push(result)

      // 更新统计
      if (result.success) {
        completedCount++
      } else {
        failedCount++
        console.log(`[TaskChainController] 任务 ${task.id} 失败，暂停执行`)
        if (onProgress) {
          onProgress(i + 1, tasks.length, result)
        }
        break
      }
      // 调用进度回调
      if (onProgress) {
        onProgress(i + 1, tasks.length, result)
      }
      // 任务间等待（给页面反应时间）
      await this.sleep(500)
    }

    // 生成结果消息
    const message = this.generateSequenceMessage(completedCount, failedCount, tasks.length)

    return {
      success: failedCount === 0,
      results,
      message,
    }
  }

  // 生成序列执行结果消息
  generateSequenceMessage(completedCount, failedCount, total) {
    if (failedCount === 0 && completedCount === total) {
      return `✅ 任务链执行成功！完成了全部 ${total} 个任务`
    } else if (completedCount === 0) {
      return `❌ 任务链执行失败，第一个任务就失败了`
    } else {
      return `⚠️ 任务链部分完成：${completedCount}/${total} 个任务成功，${failedCount} 个任务失败`
    }
  }

  // 等待指定时间
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
