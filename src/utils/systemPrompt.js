export function systemPrompt({ description, firstMessage } = {}) {
  return `description:${description}。firstMessage:${firstMessage}。（必须严格按照firstMessage:格式输出,每条输出不少于8000tokens）`
}
