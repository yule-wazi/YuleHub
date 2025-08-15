function setPosition({ imgList, col, space, imgWidth, parentElem }) {
  let nextTop = new Array(col)
  nextTop.fill(0)
  for (let i = 0; i < imgList.length; i++) {
    const imgItem = parentElem.children[i]
    if (imgItem) {
      const miniTop = Math.min(...nextTop)
      imgItem.style.position = 'absolute'
      imgItem.style.width = imgWidth + 'px'
      imgItem.style.top = miniTop + 'px'
      const index = nextTop.indexOf(miniTop)
      nextTop[index] += imgItem.offsetHeight + space
      const left = (index + 1) * space + index * imgWidth
      imgItem.style.left = left + 'px'
      const maxHeight = Math.max(...nextTop)
      parentElem.style.paddingBottom = maxHeight + 'px'
    }
  }
}
export function flowFlex({ imgList, imgWidth }) {
  const boxElem = document.querySelector('.list')
  const containerWidth = boxElem.clientWidth
  const col = Math.floor(containerWidth / imgWidth)
  const colNumber = col + 1
  const leftSapce = containerWidth - imgWidth * col
  const space = leftSapce / colNumber
  setPosition({ imgList, col, space, imgWidth, parentElem: boxElem })
}
