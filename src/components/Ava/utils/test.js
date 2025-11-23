export function visualizeElements(data) {

  clearVisualization()
  // 创建容器
  const container = document.createElement('div')
  container.id = 'debug-overlay-container'
  document.body.appendChild(container)

  // 遍历所有元素数据
  data.forEach((item) => {
    // 创建矩形框
    const box = document.createElement('div')
    box.className = 'debug-box'
    box.style.cssText = `
      position: fixed;
      left: ${item.rect.left}px;
      top: ${item.rect.top}px;
      width: ${item.rect.width}px;
      height: ${item.rect.height}px;
      border: 2px solid #ff0000;
      background: rgba(255, 0, 0, 0.1);
      z-index: 999999;
      pointer-events: none;
      box-sizing: border-box;
    `

    // 创建标签
    const label = document.createElement('div')
    label.className = 'debug-label'
    label.textContent = `#${item.id} ${item.tagName}${item.text ? ` "${item.text.slice(0, 20)}"` : ''}`
    label.style.cssText = `
      position: fixed;
      left: ${item.rect.left}px;
      top: ${item.rect.top - 24}px;
      background: #ff0000;
      color: white;
      padding: 2px 8px;
      font-size: 12px;
      font-family: monospace;
      z-index: 1000000;
      pointer-events: none;
      white-space: nowrap;
      border-radius: 3px;
    `

    // 添加到容器
    container.appendChild(box)
    container.appendChild(label)
  })

  console.log(`✅ 已标记 ${data.length} 个元素`)
}

// 清除所有标记
function clearVisualization() {
  const container = document.getElementById('debug-overlay-container')
  if (container) {
    container.remove()
    console.log('✅ 已清除所有标记')
  }
}
