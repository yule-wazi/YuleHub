import { throttle } from './throttle'

// 维护每个容器的状态：已计算索引和每列高度
const containerState = {
  lastIndex: 0,
  columnHeights: [],
}

function setPosition({ imgList, col, space, imgWidth, parentElem, isRefresh = false }) {
  // 刷新时重置状态
  if (
    isRefresh ||
    containerState.columnHeights.length !== col
  ) {
    containerState.lastIndex = 0
    containerState.columnHeights = new Array(col).fill(0)
    parentElem.style.paddingBottom = 0
  }

  // 从上次计算的索引开始，只计算新增元素
  const startIndex = containerState.lastIndex
  const nextTop = containerState.columnHeights

  for (let i = startIndex; i < imgList.length; i++) {
    const imgItem = parentElem.children[i]
    if (imgItem) {
      const miniTop = Math.min(...nextTop)
      imgItem.style.position = 'absolute'
      imgItem.style.display = 'block'
      imgItem.style.width = imgWidth + 'px'
      imgItem.style.top = miniTop + 'px'
      const index = nextTop.indexOf(miniTop)
      const left = (index + 1) * space + index * imgWidth
      imgItem.style.left = left + 'px'
      nextTop[index] += imgItem.offsetHeight + space
      const maxHeight = Math.max(...nextTop)
      parentElem.style.paddingBottom = maxHeight + 'px'
    }
  }

  // 更新已计算的索引
  containerState.lastIndex = imgList.length
}
export function flowFlex({ imgList, imgWidth, isRefresh = false }) {
  const boxElem = document.querySelector('.list')
  if (boxElem) {
    const containerWidth = boxElem.clientWidth
    const col = Math.floor(containerWidth / imgWidth)
    const colNumber = col + 1
    const leftSapce = containerWidth - imgWidth * col
    const space = leftSapce / colNumber
    setPosition({ imgList, col, space, imgWidth, parentElem: boxElem, isRefresh })
  }
}
export const throttledFlowFlex = throttle(flowFlex, 500)
