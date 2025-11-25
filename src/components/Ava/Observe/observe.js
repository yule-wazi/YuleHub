// 判断元素是否可见
function isVisible(el) {
  if (!el.getBoundingClientRect) return false
  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0 &&
    // 简单的视口检测，确保元素在屏幕内（可选，看你需要全页还是仅视口）
    rect.top < window.innerHeight &&
    rect.bottom > 0
  )
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
    if (!isInteractive(el)) return
    // 检查是否有祖先元素已经被我们标记了 ID
    const nearestMarkedAncestor = el.closest('[data-agent-id]')

    if (nearestMarkedAncestor) {
      // 为了稳定，我们采用最严格的去重方式：只要父级已标记，且当前元素不是输入/选择框，就忽略。
      if (tagName !== 'input' && tagName !== 'textarea' && tagName !== 'select') {
        // 强行忽略所有按钮/链接内部的子元素，只保留最外层的按钮/链接
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
