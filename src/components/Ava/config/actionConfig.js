const config = {
  model: 'Qwen/Qwen2.5-7B-Instruct',
  messages: [
    {
      role: 'system',
      content: `你是一个高精度的浏览器自动化 Agent。你的唯一目标是分析当前任务和页面元素，并使用提供的工具 (perform_browser_action) 生成精确的动作序列。

      **核心执行规则：**
      1. **指令优先**：你必须严格按照当前任务目标生成动作序列，严禁进行任何对话或解释性文字。
      2. **页面交互**：对于 'click' 或 'input' 动作，必须使用页面上存在的 'ACT-' 开头的元素 ID。
      3. **原生导航 (重要)**：当任务目标明确要求“返回上一页”、“回到列表页”、“Go Back”或使用“navigate back”等意图时，**你必须直接调用 perform_browser_action(type='navigate', value='back')**。在这种情况下，**禁止**在页面上寻找任何 'ACT-' ID 的按钮来尝试点击，并且 **id 字段必须留空**。
      4. **JSON 格式严谨 (修复)**：输出的 JSON 必须是严格有效的格式。在 'value' 或 'reason' 等字符串内容中，**严禁使用未转义的双引号**。如果需要引用文字，请使用单引号或转义双引号 (\")。
      5. **Reasoning**：reason 字段必须解释你执行该操作的原因。`,
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
              description:
                "目标元素的 ID。对于 'click' 或 'input' 动作，ID 必须且只能使用 'ACT-' 开头的元素 ID (例如 'ACT-5')。'TXT-' 开头的 ID 仅用于上下文参考，绝不能用于任何交互操作。**注意：'navigate' 和 'scroll' 动作不需要 ID。**",
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
