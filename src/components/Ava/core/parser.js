/**
 * Parser - AI 响应解析器
 * 负责解析 AI 返回的 tool_calls 并提取操作指令
 */

/**
 * 解析 AI 响应
 * @param {Array} tool_calls - AI 返回的 tool_calls
 * @returns {Array} 操作指令列表
 */
export function parseAIResponse(tool_calls) {
  try {
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
    console.error('[Parser] AI 响应解析失败:', error)
    throw new Error(`AI 响应解析失败: ${error.message}`)
  }
}

/**
 * 将 AI 指令转换为 Executor 可执行的 Action 对象
 * @param {Object} instruction - AI 生成的指令
 * @returns {Object} Executor 可执行的 Action 对象
 */
export function convertToAction(instruction) {
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
