import { ActionExecutor } from '../Act/actExe'
import { formatElementList } from '../Agent/prompts'
import { getInteractables } from '../Observe/observe'
import { visualizeElements } from './test'

// 模拟 Observe 模块：目前写死，未来这里是 AI 的大脑
function mockObserve() {
  return [
    { type: 'click', selector: '#app > div > div.chat > div.left > div.chatUser.active' },
    { type: 'input', selector: '#app > div > div.chat > div.right > div > div.inputArea > div > input[type=text]' },

  ]
}

// 主入口
export async function startAgent() {
  const executor = new ActionExecutor()
  console.log(formatElementList(getInteractables()))
  visualizeElements(getInteractables())
  // 1. Observe: 获取计划
  const actions = mockObserve()

  // 2. Act: 执行计划
  // await executor.runSequence(actions)
}
