import { callPlanningAI } from '../core/planningClient.js'
import { buildPlanningPrompt } from '../config/planningConfig.js'

/**
 * TaskPlanner - 任务规划器
 * 负责将用户的复杂需求分解为多个有序的子任务
 */
export class TaskPlanner {
  async planTasks(userPrompt) {
    try {
      const prompt = buildPlanningPrompt(userPrompt)
      const response = await callPlanningAI(prompt)
      const plan = this.parseAIPlanResponse(response)
      console.log('[TaskPlanner] 任务规划完成:', plan)
      return plan
    } catch (error) {
      console.error('[TaskPlanner] 任务规划失败:', error)
      throw new Error(`任务规划失败: ${error.message}`)
    }
  }
  // 解析 AI 的任务规划响应
  parseAIPlanResponse(response) {
    try {
      // 清理响应文本
      let cleanedResponse = response.trim()

      // 尝试提取 JSON 部分（如果 AI 返回了额外的文字）
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0]
      }

      // 解析 JSON
      const parsed = JSON.parse(cleanedResponse)

      // 验证必需字段
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('响应中缺少 tasks 数组')
      }

      // 转换为标准的 SubTask 对象
      const tasks = parsed.tasks.map((task, index) => ({
        id: task.id || `task-${index + 1}`,
        description: task.description || '',
        goal: task.goal || '',
        dependencies: task.dependencies || [],
        estimatedSteps: task.estimatedSteps || 1,
      }))

      return {
        tasks
      }
    } catch (error) {
      console.error('[TaskPlanner] 解析 AI 响应失败:', error)
      throw new Error(`解析 AI 响应失败: ${error.message}`)
    }
  }

  // 验证任务计划的合理性
  validatePlan(plan) {
    const errors = []
    const warnings = []

    // 验证计划对象
    if (!plan || !plan.tasks) {
      errors.push('任务计划为空或格式错误')
      return { valid: false, errors, warnings }
    }
    const tasks = plan.tasks
    if (tasks.length > 8) {
      errors.push(`任务数量过多: ${tasks.length}个（最多8个）`)
    }

    // 验证每个子任务
    const taskIds = new Set()
    tasks.forEach((task, index) => {
      // 验证必需字段
      if (!task.id) {
        errors.push(`任务 ${index + 1} 缺少 id 字段`)
      } else {
        // 检查 ID 唯一性
        if (taskIds.has(task.id)) {
          errors.push(`任务 ID 重复: ${task.id}`)
        }
        taskIds.add(task.id)
      }

      if (!task.description) {
        errors.push(`任务 ${task.id || index + 1} 缺少 description 字段`)
      }

      if (!task.goal) {
        warnings.push(`任务 ${task.id || index + 1} 缺少 goal 字段`)
      }

      if (!Array.isArray(task.dependencies)) {
        errors.push(`任务 ${task.id || index + 1} 的 dependencies 必须是数组`)
      }

      if (typeof task.estimatedSteps !== 'number' || task.estimatedSteps < 1) {
        warnings.push(`任务 ${task.id || index + 1} 的 estimatedSteps 无效`)
      }
    })

    // 验证依赖关系
    const dependencyErrors = this.validateDependencies(tasks)
    errors.push(...dependencyErrors)

    // 返回验证结果
    const valid = errors.length === 0
    return { valid, errors, warnings }
  }

  // 验证依赖关系的合理性
  validateDependencies(tasks) {
    const errors = []
    const taskIds = new Set(tasks.map((t) => t.id))

    tasks.forEach((task, index) => {
      // 检查依赖的任务是否存在
      task.dependencies.forEach((depId) => {
        if (!taskIds.has(depId)) {
          errors.push(`任务 ${task.id} 依赖的任务 ${depId} 不存在`)
        }
      })

      // 检查依赖的任务是否在当前任务之前
      task.dependencies.forEach((depId) => {
        const depIndex = tasks.findIndex((t) => t.id === depId)
        if (depIndex >= index) {
          errors.push(`任务 ${task.id} 依赖的任务 ${depId} 必须在它之前`)
        }
      })
    })

    return errors
  }
}
