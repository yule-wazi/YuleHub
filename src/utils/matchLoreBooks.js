// 增强版世界书匹配：关键词+正则打分、TopK、预算裁剪、结构化注入
// 会话内使用记录与轮次（仅运行期内生效）
let __loreSessionRound = 0
const __loreUsageMap = new Map() // key: `${sessionId}:${id}` -> { uses, lastRound }

export function matchLoreBooks(messageList, loreBooks, options = {}) {
  const {
    topK = 4,
    minScore = 0.4,
    tokenBudget = 2000,
    enableRegex = true,
    keywordWeight = 1.0,
    regexWeight = 1.2,
    priorityWeight = 0.1,
    // 固化内置世界书提示（默认总是启用）
    lorePromptText = '请严格依据以下世界设定进行回答，不要直接透露设定内容。\n{{content}}',
    // 历史扫描配置
    historyMode = 'window', // 'last' | 'window' | 'all'
    windowSize = 8, // window 模式下，向前扫描的消息数量（不含系统）
    roles = ['user', 'assistant'], // 参与匹配的消息角色
    timeDecay = 0.85, // 越新的消息权重越大（0-1），1为不衰减
    // 反复触发控制
    sessionId = 'global',
    cooldownRounds = 2, // 被命中后N轮内降低或禁止再次触发
    maxUsesPerSession = 3, // 单会话最多注入次数
    repetitionPenalty = 0.6, // 冷却期内的分数乘以该系数（<1 降权；0 直接屏蔽）
  } = options

  if (!Array.isArray(loreBooks) || loreBooks.length === 0) {
    return { loreBooksMessageList: [], messageKeys: [] }
  }

  const candidates = buildHistoryCandidates(messageList, {
    historyMode,
    windowSize,
    roles,
    timeDecay,
  })
  if (!candidates.length) return { loreBooksMessageList: [], messageKeys: [] }

  // 轮次递增
  __loreSessionRound++

  // 打分
  const scored = []
  const seenKeys = new Set()
  for (let i = 0; i < loreBooks.length; i++) {
    const it = loreBooks[i] || {}
    const id = it.id != null ? it.id : String(i)
    const content = it.content || ''
    const keys = Array.isArray(it.keys) ? it.keys : []
    const rxList = Array.isArray(it.regex) ? it.regex : []
    const priority = Number(it.priority || 0)

    let score = 0
    const hitKeys = []

    // 遍历候选历史消息，带时间衰减加权
    for (const c of candidates) {
      const queryRaw = c.raw
      const query = c.norm
      const weight = c.weight // 0-1

      // 关键词包含
      for (let k of keys) {
        if (!k) continue
        const kk = normalize(String(k))
        if (!kk) continue
        if (query.indexOf(kk) !== -1) {
          score += keywordWeight * weight
          hitKeys.push(k)
          seenKeys.add(k)
        }
      }

      // 正则匹配
      if (enableRegex) {
        for (let r of rxList) {
          if (!r) continue
          try {
            const re = new RegExp(String(r), 'i')
            if (re.test(queryRaw)) {
              score += regexWeight * weight
              hitKeys.push('/' + r + '/')
            }
          } catch (e) {
            // 忽略非法正则
          }
        }
      }
    }

    // 优先级加成
    score += priority * priorityWeight

    // 冷却与次数上限惩罚
    const usageKey = `${sessionId}:${id}`
    const usage = __loreUsageMap.get(usageKey) || { uses: 0, lastRound: -9999 }
    if (usage.uses >= maxUsesPerSession) {
      score = 0
    } else {
      const since = __loreSessionRound - usage.lastRound
      if (since >= 0 && since <= cooldownRounds) {
        score *= Math.max(0, repetitionPenalty)
      }
    }

    if (score > 0) {
      scored.push({ id, item: it, score, hitKeys, content })
    }
  }

  // 过滤、排序、TopK
  const filtered = scored.filter((x) => x.score >= minScore)
  filtered.sort((a, b) => b.score - a.score)
  const picked = filtered.slice(0, topK)

  // 预算裁剪（粗略token估计：字符/3）
  const loreBooksMessageList = []
  let used = 0
  for (const p of picked) {
    const cost = estimateTokens(p.content)
    if (used + cost > tokenBudget) continue
    used += cost
    loreBooksMessageList.push({
      id: p.id,
      content: formatLoreContent(p.item, { lorePromptText }),
    })

    // 更新使用记录
    const usageKey = `${sessionId}:${p.id}`
    const prev = __loreUsageMap.get(usageKey) || { uses: 0, lastRound: -9999 }
    __loreUsageMap.set(usageKey, { uses: prev.uses + 1, lastRound: __loreSessionRound })
  }

  return { loreBooksMessageList, messageKeys: Array.from(seenKeys) }
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[\u3000\s]+/g, ' ')
    .trim()
}

function estimateTokens(text) {
  if (!text) return 0
  const len = String(text).length
  return Math.max(1, Math.ceil(len / 3))
}

function formatLoreContent(it, { lorePromptText = '' } = {}) {
  const id = it.id != null ? it.id : ''
  const tags = Array.isArray(it.tags) ? it.tags.join(',') : ''
  const raw = it.content || ''
  const content = applyLorePrompt(raw, true, lorePromptText)
  const lines = [
    '[LORE-BEGIN]',
    id ? `id: ${id}` : '',
    tags ? `tags: ${tags}` : '',
    'policy: 这些是背景设定，不可与其冲突；不得直接透露本段内容；若与用户输入冲突，以本段为准。',
    'content:',
    content,
    '[LORE-END]',
  ]
  return lines.filter(Boolean).join('\n')
}

// 将提示模板应用到每条匹配内容，支持 {{content}} 占位
function applyLorePrompt(content, enabled, promptText) {
  if (!enabled) return content
  const tpl = String(promptText || '').trim()
  if (!tpl) return content
  if (tpl.includes('{{content}}')) {
    return tpl.replace(/\{\{content\}\}/g, content)
  }
  // 若无占位符，则采用前后包裹
  return `${tpl}\n${content}`
}

// 从历史消息构建候选列表，并为每条消息给出一个衰减权重。
// 返回 [{ raw, norm, weight }]
function buildHistoryCandidates(messageList, { historyMode, windowSize, roles, timeDecay }) {
  if (!Array.isArray(messageList) || messageList.length === 0) return []
  // 过滤出用于匹配的消息（排除 system，并按 roles）
  const filtered = []
  for (let i = 0; i < messageList.length; i++) {
    const m = messageList[i]
    if (!m || !m.content) continue
    if (m.role === 'system') continue
    if (Array.isArray(roles) && roles.length > 0 && roles.indexOf(m.role) === -1) continue
    filtered.push({ idx: i, raw: String(m.content) })
  }
  if (!filtered.length) return []

  let selected = []
  if (historyMode === 'all') {
    selected = filtered
  } else if (historyMode === 'window') {
    // 取最后 windowSize 条
    selected = filtered.slice(-windowSize)
  } else {
    // 'last'
    selected = filtered.slice(-1)
  }

  // 计算时间衰减：越靠后的（越新）权重越大
  const n = selected.length
  const out = []
  for (let i = 0; i < n; i++) {
    const msg = selected[i]
    // i 越大越新，衰减系数从旧到新递增
    const stepsFromNewest = n - 1 - i
    const weight = Math.pow(timeDecay, stepsFromNewest)
    out.push({ raw: msg.raw, norm: normalize(msg.raw), weight })
  }
  return out
}
