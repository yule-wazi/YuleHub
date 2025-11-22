export function systemPrompt({
  description,
  firstMessage,
  systemPrompt = '',
  postHistoryInstructions = '',
  depthPrompt = null,
} = {}) {
  const parts = []

  // 1. 自定义系统提示（优先级最高）
  if (systemPrompt && systemPrompt.trim()) {
    parts.push(systemPrompt.trim())
  }

  // 2. 描述和首条消息（默认格式）
  if (description || firstMessage) {
    const defaultPrompt = `description:${description || ''}。firstMessage:${firstMessage || ''}。（必须严格按照firstMessage格式输出）`
    parts.push(defaultPrompt)
  }

  // 3. 历史后指令
  if (postHistoryInstructions && postHistoryInstructions.trim()) {
    parts.push('\n[历史后指令]')
    parts.push(postHistoryInstructions.trim())
  }

  // 4. 深度提示（如果有）
  if (depthPrompt && depthPrompt.prompt) {
    parts.push('\n[深度提示]')
    parts.push(depthPrompt.prompt.trim())
  }

  return parts.join('\n')
}
