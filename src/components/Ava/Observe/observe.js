// 判断元素是否可见
function isDeeplyVisible(el) {
  const rect = el.getBoundingClientRect()
  // 1. 基础视口检测 (只看当前屏幕)
  const inViewport =
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  if (!inViewport) return false
  // 2. 遮挡检测 (防止点击到被弹窗遮住的按钮)
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const topEl = document.elementFromPoint(cx, cy)
  // 如果最顶层元素不是当前元素，也不是当前元素的后代/祖先，说明被遮挡了
  if (topEl && !el.contains(topEl) && !topEl.contains(el)) {
    return false
  }
  return true
}
// 核心：判断元素是否可交互
function isInteractive(el) {
  const tagName = el.tagName.toLowerCase()
  const role = el.getAttribute('role')
  const tabIndex = el.getAttribute('tabindex')
  const style = window.getComputedStyle(el)

  // 1. 排除禁用的元素
  if (el.disabled || el.getAttribute('aria-disabled') === 'true') {
    return false
  }
  // 2. 原生交互元素
  if (['button', 'a', 'input', 'textarea', 'select', 'details', 'summary'].includes(tagName)) {
    // 特殊处理：没有 href 的 a 标签通常不是链接，除非它是锚点或有 click 事件
    if (tagName === 'a' && !el.hasAttribute('href') && !el.onclick && style.cursor !== 'pointer') {
      return false
    }
    // 排除 hidden input
    if (tagName === 'input' && el.type === 'hidden') {
      return false
    }
    return true
  }
  // 3. 显式声明角色的元素
  if (role && ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio', 'switch'].includes(role)) {
    return true
  }
  // 4. 可聚焦元素 (通常意味着可交互)
  // 排除 tabIndex -1 (通常是程序聚焦，非用户交互)
  if (tabIndex !== null && parseInt(tabIndex) >= 0) {
    return true
  }
  // 5. 【重要】根据鼠标样式判断 (SPA中最常用)
  // 如果开发者设置了 cursor: pointer，说明他们希望用户点击
  if (style.cursor === 'pointer') {
    return true
  }
  // 6. 可编辑元素
  if (el.isContentEditable) {
    return true
  }

  return false
}
// 查找交互元素的兄弟节点，提取最近的文本作为标签
function findClosestLabel(interactiveElement) {
  const parent = interactiveElement.parentElement
  if (!parent) return ''

  const labelText = []

  // 遍历父级容器的所有子元素
  for (const child of parent.children) {
    // 跳过交互元素本身
    if (child === interactiveElement) continue

    // 查找兄弟元素中的文本块 (class="text" 或 纯文本 div/span)
    const textContent = child.innerText || child.textContent
    if (textContent && textContent.trim()) {
      labelText.push(textContent.trim().replace(/\s+/g, ' '))
    }
  }

  // 优先使用 el-switch 自身的 aria-label
  if (interactiveElement.hasAttribute('aria-label')) {
    labelText.unshift(interactiveElement.getAttribute('aria-label'))
  }

  return labelText.join(' ')
}
// 清除旧标记
function clearOldIdentifiers() {
  const oldElements = document.querySelectorAll('[data-agent-id]')
  oldElements.forEach((el) => {
    el.removeAttribute('data-agent-id')
  })
}
// 提取所有交互元素并赋予唯一ID
export function getInteractables() {
  clearOldIdentifiers()
  const allElements = document.querySelectorAll('*')
  const interactables = []
  let counter = 1
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'svg', 'path']
  allElements.forEach((el) => {
    const tagName = el.tagName.toLowerCase()
    if (skipTags.includes(tagName)) return
    if (!isInteractive(el) || !isDeeplyVisible(el)) return
    // 检查是否有祖先元素已经被我们标记了 ID
    const nearestMarkedAncestor = el.closest('[data-agent-id]')

    if (nearestMarkedAncestor) {
      // 为了稳定，只要父级已标记，且当前元素不是输入/选择框，就忽略。
      if (tagName !== 'input' && tagName !== 'textarea' && tagName !== 'select') {
        return
      }
    }


    const agentId = counter++
    el.setAttribute('data-agent-id', agentId)
    interactables.push({
      id: agentId,
      tagName: el.tagName.toLowerCase(),
      className: el.className,
      type: el.getAttribute('type') || null,
      text: (el.innerText || el.value || el.getAttribute('aria-label') || el.placeholder || '')
        .slice(0, 50)
        .replace(/\s+/g, ' ')
        .trim(),
      rect: el.getBoundingClientRect(), // 用来在截图中定位
    })
  })

  return interactables
}
