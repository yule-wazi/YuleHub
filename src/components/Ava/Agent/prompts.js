/**
 * Prompt 模板和构建函数
 */

/**
 * Agent Prompt 模板 - 使用简单文本格式而非 JSON
 */
export const AGENT_PROMPT_TEMPLATE = `
请分析当前页面元素，并根据用户需求，使用提供的工具 (perform_browser_action) 生成达成目标所需的所有精确动作序列。

用户的需求是："{user_prompt}"

当前页面可见的可交互元素：
---------------------------------------------------
{element_list}
---------------------------------------------------
`

/**
 * 格式化元素列表为可读文本
 * @param {Array} elements - 元素列表
 * @returns {string}
 */
export function formatElementList(elements) {
  if (!elements || elements.length === 0) {
    return '(当前屏幕无可见交互元素)'
  }

  return elements
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

/**
 * 构建完整的 Agent Prompt
 * @param {string} userPrompt - 用户输入的需求
 * @param {Array} elements - 可交互元素列表
 * @returns {string} 完整的 Prompt
 */
export function buildAgentPrompt(userPrompt, elements) {
  const elementList = formatElementList(elements)

  return AGENT_PROMPT_TEMPLATE.replace('{user_prompt}', userPrompt).replace(
    '{element_list}',
    elementList,
  )
}
