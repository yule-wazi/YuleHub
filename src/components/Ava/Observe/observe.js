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
  // 但是要排除 Ava 组件的遮挡（Ava 组件不应该影响可见性判断）
  if (topEl && !el.contains(topEl) && !topEl.contains(el)) {
    // 检查遮挡元素是否是 Ava 组件
    const isAvaBlocking =
      topEl.closest('.ava-container') || topEl.classList.contains('ava-container')
    if (!isAvaBlocking) {
      return false
    }
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
  // 配置：最大向上查找层级，防止遍历整个 DOM 导致性能问题
  const MAX_DEPTH = 5
  let currentDepth = 0

  // 1. 优先获取自身的 aria-label (最高优先级)
  const selfLabel = interactiveElement.getAttribute('aria-label')

  // 当前正在检查的元素（初始为交互元素本身）
  let currentElement = interactiveElement
  // 当前父容器
  let parent = interactiveElement.parentElement

  // 循环向上查找，直到 body 或 达到最大层级
  while (parent && parent !== document.body && currentDepth < MAX_DEPTH) {
    const labelTextParts = []
    let hasFoundTextInThisLayer = false

    // 遍历当前层级的所有子元素
    for (const child of parent.children) {
      // 核心逻辑：跳过包含目标元素的那个分支
      // 原因：我们要找的是“旁边”的说明文字，而不是目标元素“里面”或“包裹它的容器”里的文字
      if (child === currentElement || child.contains(interactiveElement)) {
        continue
      }

      // 获取可见文本
      const textContent = child.innerText || child.textContent

      if (textContent && textContent.trim()) {
        const cleanText = textContent.trim().replace(/\s+/g, ' ')
        // 过滤掉纯符号或无意义文本（可选，视情况而定）
        if (cleanText.length > 0) {
          labelTextParts.push(cleanText)
          hasFoundTextInThisLayer = true
        }
      }
    }

    // 2. 如果在这一层找到了文本，说明这就是我们要找的“最近的标签层”
    if (hasFoundTextInThisLayer) {
      // 如果有自身 aria-label，加在最前面
      if (selfLabel) {
        labelTextParts.unshift(selfLabel)
      }
      return labelTextParts.join(' ')
    }

    // 3. 没找到，继续向上层进发
    currentElement = parent // 记录当前父级，作为下一轮的“子节点”以便排除
    parent = parent.parentElement
    currentDepth++
  }

  // 4. 如果遍历到底都没找到，仅返回自身的 aria-label 或空
  return selfLabel || ''
}
// 清除旧标记
function clearOldIdentifiers() {
  const oldElements = document.querySelectorAll('[data-agent-id]')
  oldElements.forEach((el) => {
    el.removeAttribute('data-agent-id')
  })
}

/**
 * 查找页面中具有重要文本内容，但不可交互的元素 (TXT-ID)。
 * 修复了包含 <br> 标签的纯文本 div 被错误跳过的问题。
 */
function getNonInteractiveContext(allElements) {
  const contextElements = []
  let contextCounter = 1

  // 1. 强语义文本标签：只要可见且有字，通常就是我们要的上下文
  const strongTextTags = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'li',
    'blockquote',
    'pre',
    'code',
    'th',
    'label',
    'legend',
  ]

  // 2. 通用容器标签：这些标签需要进行额外的“结构化子元素”检查
  const containerTags = [
    'div',
    'span',
    'article',
    'section',
    'td',
    'strong',
    'b',
    'i',
    'em',
    'small',
  ]

  // 定义结构化的、块级的标签。如果容器包含这些子标签，则应被跳过。
  const structuralBlockTags = new Set([
    'DIV',
    'P',
    'UL',
    'OL',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'TABLE',
    'SECTION',
    'ARTICLE',
    'HEADER',
    'FOOTER',
  ])

  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'SVG', 'PATH', 'IMG']

  allElements.forEach((el) => {
    const tagName = el.tagName.toLowerCase()

    // --- 基础过滤 ---
    if (skipTags.includes(el.tagName.toUpperCase())) return
    if (el.closest('.ava-container') || el.classList.contains('ava-container')) return
    if (!el.textContent || el.textContent.trim().length === 0) return

    // 状态检查
    if (el.hasAttribute('data-agent-id')) return
    if (el.closest('[data-agent-id^="ACT-"]')) return

    const text = el.innerText || ''
    if (text.replace(/\s/g, '').length < 2) return

    // --- 核心策略：决定是否标记为 TXT ---

    let shouldMark = false

    if (strongTextTags.includes(tagName)) {
      // 策略 A：强语义标签直接标记
      shouldMark = true
    } else if (containerTags.includes(tagName)) {
      // 策略 B：通用容器标签，检查其子元素结构
      let hasStructuralChildren = false

      // 遍历所有子元素，看是否有结构化的块级标签
      for (const child of el.children) {
        if (structuralBlockTags.has(child.tagName.toUpperCase())) {
          hasStructuralChildren = true
          break
        }
      }

      // 只有当没有结构化子元素时（即只包含文本、<br>、<i> 等格式化内容），才标记
      if (!hasStructuralChildren) {
        shouldMark = true
      }
    }

    if (!shouldMark) return

    // --- 最后检查可见性 ---
    if (!isDeeplyVisible(el)) return

    // --- 标记 ---
    const agentId = `TXT-${contextCounter++}`
    el.setAttribute('data-agent-id', agentId)

    contextElements.push({
      id: agentId,
      tagName: tagName,
      className: el.className,
      role: 'text-context',
      type: null,
      text: text.slice(0, 300).replace(/\s+/g, ' ').trim(),
      rect: el.getBoundingClientRect(),
    })
  })

  return contextElements
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

    // 跳过 Ava 组件本身及其所有子元素
    if (el.closest('.ava-container') || el.classList.contains('ava-container')) return

    if (!isInteractive(el) || !isDeeplyVisible(el)) return
    // 检查是否有祖先元素已经被我们标记了 ID
    const nearestMarkedAncestor = el.closest('[data-agent-id]')

    if (nearestMarkedAncestor) {
      // 为了稳定，只要父级已标记，且当前元素不是输入/选择框，就忽略。
      if (tagName !== 'input' && tagName !== 'textarea' && tagName !== 'select') {
        return
      }
    }
    const label = findClosestLabel(el).slice(0, 20)
    // const agentId = counter++
    const agentId = `ACT-${counter++}`
    el.setAttribute('data-agent-id', agentId)
    interactables.push({
      id: agentId,
      tagName: el.tagName.toLowerCase(),
      className: el.className,
      type: el.getAttribute('type') || null,
      text: (
        el.innerText ||
        el.value ||
        el.getAttribute('aria-label') ||
        el.placeholder ||
        label ||
        ''
      )
        .slice(0, 50)
        .replace(/\s+/g, ' ')
        .trim(),
      label: label,
      rect: el.getBoundingClientRect(),
    })
  })

  const textFrequency = new Map()
  interactables.forEach((item) => {
    const txt = item.text
    textFrequency.set(txt, (textFrequency.get(txt) || 0) + 1)
  })
  // 2. 遍历并修正重复项
  interactables.forEach((item) => {
    if (textFrequency.get(item.text) > 1 && item.label) {
      const newText = `${item.label} ${item.text}`
      item.text = newText.replace(/\s+/g, ' ').trim() // 稍微放宽一点长度限制
    }
  })

  const contextElements = getNonInteractiveContext(allElements)
  // *** 合并结果 ***
  interactables.push(...contextElements)
  return interactables
}
