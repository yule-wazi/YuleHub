/**
 * 任务规划 Prompt 模板 (优化版 - 支持长远规划)
 * 核心变化：允许模型根据用户需求推断未来页面可能需要的步骤，而不仅仅局限于当前可视元素。
 */
export const PLANNING_PROMPT_TEMPLATE = `你是一个浏览器自动化任务规划专家。请根据用户需求和当前页面状态，制定一份完整的任务执行计划。

### 1. 任务背景
用户需求："{user_prompt}"

### 2. 当前执行状态
- **执行历史** (已完成的步骤，请忽略)：
{execution_history}

### 3. 当前页面感知
- **页面概览** (Context)：
{page_summary}

- **关键可交互元素** (Interactive Elements)：
{interactive_elements}

### 4. 规划原则 (非常重要)
1. **全局视野**：请根据用户需求规划**完整**的操作流程，直到目标达成。
2. **当前 vs 未来**：
   - **当前步骤**：如果第一步操作在当前页面可见，必须精确对应上面的 [关键可交互元素]。
   - **未来步骤**：对于跳转后或弹窗后的操作（当前页面不可见），请基于 Web 交互常识进行**逻辑推断**（例如：点击"登录"按钮后，通常需要"输入账号"和"输入密码"）。
3. **动态修正**：你只需要列出计划，不需要担心未来页面元素 ID 的变化。每执行一步，我都会重新扫描页面并让你修正后续计划。
4. **增量规划**：基于 [执行历史]，不要重复已完成的步骤。
5. **循环与状态恢复**：如果用户需求是**依次浏览**、**点击全部**、或**循环操作**列表上的多个独立元素，必须在每次点击一个列表项后（即进入详情页后），立即规划一个**“返回列表页”**的步骤。
6. **任务描述具象化 (新增)**：规划点击或输入操作时，如果目标元素（ACT-ID）在 [关键可交互元素] 中有清晰的文本描述（即双引号内的内容），任务的 \`description\` **必须引用**该描述作为核心内容，而不是使用“点击第一个”、“输入框”等模糊措辞。

### 5. 输出要求
1. 每个子任务是一个原子的操作（点击、输入、滚动）。
2. **依赖关系**：正确标记 dependencies。

### 6. 输出格式
请 **严格** 按照以下 JSON 格式返回，**不要包含 Markdown 代码块** (No \`\`\`json)：
{
  "reasoning": "分析用户需求，结合当前页面元素，推断出完整的操作链路（包含当前可见和未来可能的步骤）",
  "tasks": [
    {
      "id": "task-N",
      "description": "点击登录按钮",
      "goal": "跳转到登录页面",
      "dependencies": ["task-N-1"],
      "estimatedSteps": 1
    },
    {
      "id": "task-N+1",
      "description": "输入账号 (预期步骤)",
      "goal": "填写用户信息",
      "dependencies": ["task-N"],
      "estimatedSteps": 1
    }
  ]
}`

/**
 * 构建规划 Prompt
 * (保持不变，逻辑通用)
 */
export function buildPlanningPrompt(userPrompt, elements = [], history = []) {
  // 1. 生成执行历史摘要
  let historyInfo = '无（这是第一个任务）'
  if (history && history.length > 0) {
    historyInfo = history.map((h, i) => `${i + 1}. [已完成] ${h.task.description}`).join('\n')
  }

  // 2. 生成页面概览
  const contextElements = elements.filter(
    (el) => el.id.startsWith('TXT-') && (el.tagName.match(/^H[1-6]$/) || el.text.length > 5),
  )
  const pageSummary =
    contextElements.length > 0
      ? contextElements
          .slice(0, 5)
          .map((el) => `[${el.tagName}] ${el.text}`)
          .join('; ')
      : '当前页面无显著文本上下文，请依赖交互元素判断。'

  // 3. 格式化可交互元素
  let elementsInfo = '暂无可交互元素'
  const interactiveElements = elements.filter((el) => el.id && el.id.startsWith('ACT-'))

  if (interactiveElements.length > 0) {
    elementsInfo = interactiveElements
      .map((e) => {
        const attrs = []
        if (e.className) {
          const cls = typeof e.className === 'string' ? e.className : ''
          attrs.push(`class="${cls.slice(0, 30)}${cls.length > 30 ? '...' : ''}"`)
        }
        if (e.type) attrs.push(`type="${e.type}"`)
        if (e.href) attrs.push(`href="${e.href}"`)
        if (e.placeholder) attrs.push(`placeholder="${e.placeholder}"`)

        const attrStr = attrs.length > 0 ? `(${attrs.join(' ')})` : ''
        const cleanText = (e.text || '').replace(/\s+/g, ' ').trim()

        return `[${e.id}] <${e.tagName}> "${cleanText}" ${attrStr}`
      })
      .join('\n')
  }

  return PLANNING_PROMPT_TEMPLATE.replace('{user_prompt}', userPrompt)
    .replace('{execution_history}', historyInfo)
    .replace('{page_summary}', pageSummary)
    .replace('{interactive_elements}', elementsInfo)
}

/**
 * 任务规划的 AI 配置
 */
export const planningConfig = {
  model: 'qwen-flash',
  messages: [
    {
      role: 'system',
      content: `你是一个具备全局视野的浏览器自动化规划 Agent。

核心原则：
1. **立足当下，放眼未来**：对于当前页面可见的元素，必须精准识别；对于未来页面（如跳转后），请基于 Web 常识推断后续步骤。
2. **逻辑连贯**：生成的计划应当是一个完整的故事线，从起点直到用户目标达成。
3. **格式严格**：只输出纯 JSON 字符串，严禁包含 Markdown 标记。`,
    },
  ],
  stream: false,
  max_tokens: 2048,
  temperature: 0.6, // 稍微调高一点点，允许它根据常识推断未来的步骤
  top_p: 0.9,
  response_format: { type: 'json_object' },
}
