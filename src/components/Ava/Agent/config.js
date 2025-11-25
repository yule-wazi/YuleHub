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
        description: '执行浏览器操作，如点击、输入、滚动、导航和结束任务。',
        name: 'perform_browser_action',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['click', 'input', 'navigate', 'done'],
              description: '动作类型',
            },
            id: {
              type: 'integer',
              description: '要操作的元素 ID (用于 click/input)',
            },
            value: {
              type: 'string',
              description: "输入框的内容，或者 navigate 的值 ('back')",
            },
            reason: {
              type: 'string',
              description: '分析和决策过程',
            },
          },
          required: ['type', 'reason'],
        },
        strict: true,
      },
    },
  ],
}
export default config
