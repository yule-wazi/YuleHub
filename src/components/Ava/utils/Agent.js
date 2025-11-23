import { ActionExecutor } from './ActExe'
import { getInteractables } from './Observe'
import { visualizeElements } from './test'

async function askLLM(prompt) {
  console.log('🤖 AI Thinking...')
  // 假设 AI 总是想点第一个元素
  return { type: 'click', targetId: null }
}

export async function runAgentTask() {
  const executor = new ActionExecutor()

  try {
    console.log('👀 Observing page...')
    const elements = getInteractables()
    console.log(elements)
    // 调试标注
    visualizeElements(elements)

    if (elements.length === 0) {
      console.log('No interactive elements found.')
      return
    }
    // 构建给 AI 看的简化版 Prompt
    const elementList = elements.map((e) => `[ID: ${e.id}] <${e.tagName}> ${e.text} class="${e.className}"`).join('\n')
    console.log('elementList=', elementList)
    const prompt = `当前页面元素:\n${elementList}\n请决定下一步操作。`

    const decision = await askLLM(prompt)

    if (decision.targetId) {
      const selector = `[data-agent-id="${decision.targetId}"]`

      await executor.perform({
        type: decision.type,
        selector: selector,
        value: decision.value,
        waitAfter: 1000,
      })
    }
  } catch (error) {
    console.error('Agent Error:', error)
  }
}
