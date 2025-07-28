export function systemPrompt({ description, firstMessage } = {}) {
  return `description:${description}。firstMessage:${firstMessage}。（必须严格按照firstMessage格式输出）`
}

