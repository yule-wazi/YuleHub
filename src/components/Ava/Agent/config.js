const config = {
  model: 'Qwen/Qwen2.5-7B-Instruct',
  messages: [
    {
      role: 'system',
      content:
        '你是一个浏览器自动化助手。你的唯一目标是分析用户需求和当前页面元素，并使用提供的工具 (perform_browser_action) 生成精确的动作序列，以达成用户目标。严禁回复任何解释性文字或对话。',
    },
  ],
  stream: false,
  max_tokens: 4096,
  thinking_budget: 4096,
  min_p: 0.05,
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  frequency_penalty: 0.5,
  n: 1,
  response_format: {
    type: 'text',
  },
  tools: [
    {
      type: 'function',
      function: {
        name: 'perform_browser_action',
        description:
          '执行浏览器操作。根据页面上下文 (TXT-元素) 分析，对可交互元素 (ACT-元素) 执行操作。',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['click', 'input', 'scroll', 'navigate', 'done'],
              description: '动作类型',
            },
            id: {
              type: 'string',
              // 【最严格规范】
              description:
                "目标元素的 ID。对于 'click' 或 'input' 动作，ID 必须且只能使用 'ACT-' 开头的元素 ID (例如 'ACT-5')。'TXT-' 开头的 ID 仅用于上下文参考，绝不能用于任何交互操作。违反此规则将导致任务失败。",
            },
            value: {
              type: 'string',
              description: "输入框的内容，或者 navigate 的值 ('back')",
            },
            reason: {
              type: 'string',
              description:
                '思考过程。解释执行此操作的原因，如果依赖了页面信息，请提及相关的 TXT-ID (例如：需要点击 ACT-5，因为 TXT-2 提到了...)。',
            },
          },
          required: ['type', 'reason'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ],
}
export default config
