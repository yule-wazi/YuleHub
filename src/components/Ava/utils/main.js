import { ActionExecutor } from './ActExe'
import { getInteractables } from './Observe'
import { visualizeElements } from './test'

// 模拟 Observe 模块：目前写死，未来这里是 AI 的大脑
function mockObserve() {
  return [
    { type: 'click', selector: 'div.header > div.menu > i' },
    { type: 'click', selector: ' div > div.menuDefault > div.comics', willNavigate: true },

    // 第 1 个项目
    { type: 'scroll', selector: 'div.list > div:nth-child(2)' },
    { type: 'click', selector: 'div.list > div:nth-child(2)', willNavigate: true },
    { type: 'observe', selector: '.imageInfoCard' },
    { type: 'navigate', value: 'back' },

    { type: 'click', selector: ' div.header > div.search > i' },
    { type: 'input', selector: '.el-input__inner', value: '白丝', willNavigate: true },
    { type: 'scroll', selector: 'div.list > div:nth-child(12)' },
    { type: 'click', selector: 'div.list > div:nth-child(12)', willNavigate: true },
    { type: 'observe', selector: '.imageInfoCard' },
    { type: 'navigate', value: 'back' },

    { type: 'click', selector: ' div.header > div.search > i' },
    { type: 'input', selector: '.el-input__inner', value: '黑丝', willNavigate: true },
    { type: 'scroll', selector: 'div.list > div:nth-child(12)' },
    { type: 'click', selector: 'div.list > div:nth-child(12)', willNavigate: true },
    { type: 'observe', selector: '.imageInfoCard' },
    { type: 'navigate', value: 'back' },

    { type: 'click', selector: 'div.header > div.menu > i' },
    { type: 'click', selector: ' div > div.menuDefault > div.home', willNavigate: true },
  ]
}

// 主入口
export async function startAgent() {
  const executor = new ActionExecutor()

  console.log(getInteractables())
  visualizeElements(getInteractables())
  // 1. Observe: 获取计划
  const actions = mockObserve()

  // 2. Act: 执行计划
  // await executor.runSequence(actions)
}
