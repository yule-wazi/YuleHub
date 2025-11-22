/**
 * 角色卡数据映射工具
 * 将角色卡数据转换为应用内部格式
 */

import { CharacterCardError, ErrorCodes } from './parseCharacterCard.js'

/**
 * 将角色卡数据映射为应用内部格式
 * @param {Object} cardData - 解析后的角色卡数据
 * @returns {Object} 内部格式的角色数据
 */
export function mapToInternalFormat(cardData) {
  console.log('[MapCharacterCard] 开始映射角色卡数据')

  const isV3 = cardData.spec === 'chara_card_v3'
  const coreData = isV3 ? cardData.data : cardData

  // 验证必填字段
  if (!coreData.name || coreData.name.trim() === '') {
    throw new CharacterCardError(ErrorCodes.MISSING_REQUIRED, '角色名称不能为空', {
      field: '角色名',
    })
  }

  const mapped = {
    userName: coreData.name.trim(),
    image: extractAvatar(coreData),
    voiceId: coreData.extensions?.voiceId || '',
    description: buildDescription(coreData),
    firstMessage: coreData.first_mes || '',
    alternateGreetings: coreData.alternate_greetings || [],
    loreBooks: mapLorebook(coreData),
    regexScripts: coreData.extensions?.regex_scripts || [],
    systemPrompt: coreData.system_prompt || '',
    postHistoryInstructions: coreData.post_history_instructions || '',
    creatorNotes: coreData.creator_notes || '',
    depthPrompt: coreData.extensions?.depth_prompt || null,
    metadata: {
      spec: cardData.spec || 'V1/V2',
      version: cardData.spec_version || '',
      creator: coreData.creator || '',
      characterVersion: coreData.character_version || '',
      tags: coreData.tags || [],
      createDate: cardData.create_date || '',
    },
  }

  console.log('[MapCharacterCard] 映射完成，角色名:', mapped.userName)
  return mapped
}

/**
 * 构建完整的角色描述
 * @param {Object} coreData - 核心数据
 * @returns {string} 组合后的描述
 */
function buildDescription(coreData) {
  const parts = []

  if (coreData.description) {
    parts.push(coreData.description.trim())
  }

  if (coreData.personality) {
    parts.push(`\n性格: ${coreData.personality.trim()}`)
  }

  if (coreData.scenario) {
    parts.push(`\n场景: ${coreData.scenario.trim()}`)
  }

  if (coreData.mes_example) {
    parts.push(`\n示例对话:\n${coreData.mes_example.trim()}`)
  }

  return parts.join('\n')
}

/**
 * 提取头像数据
 * @param {Object} coreData - 核心数据
 * @returns {string} 头像 URL 或默认值
 */
function extractAvatar(coreData) {
  // 尝试多个可能的字段
  const avatarSources = [
    coreData.avatar,
    coreData.image,
    coreData.extensions?.avatar,
    coreData.extensions?.image,
  ]

  for (const source of avatarSources) {
    if (!source) continue

    const src = String(source).trim()
    if (!src) continue

    // 如果是 base64 数据
    if (src.startsWith('data:image/')) {
      return src
    }

    // 如果是 URL
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
      return src
    }

    // 尝试作为 base64 转换
    if (src.length > 100) {
      try {
        // 检查是否是有效的 base64
        atob(src.substring(0, 100))
        return `data:image/png;base64,${src}`
      } catch (e) {
        // 不是有效的 base64
      }
    }
  }

  // 返回默认头像
  return '/userImg/default-avatar.png'
}

/**
 * 映射世界书数据
 * @param {Object} coreData - 核心数据
 * @returns {Object|null} 世界书对象
 */
function mapLorebook(coreData) {
  const book = coreData.character_book || coreData.lorebook

  if (!book || !book.entries || !Array.isArray(book.entries)) {
    console.log('[MapCharacterCard] 未找到世界书数据')
    return null
  }

  console.log('[MapCharacterCard] 映射世界书，条目数:', book.entries.length)

  const mappedEntries = book.entries
    .map((entry, index) => {
      try {
        return mapLorebookEntry(entry, index)
      } catch (error) {
        console.warn(`[MapCharacterCard] 跳过无效的世界书条目 ${index}:`, error.message)
        return null
      }
    })
    .filter((entry) => entry !== null)

  return {
    label: book.name || '导入的世界书',
    value: mappedEntries,
  }
}

/**
 * 映射单个世界书条目
 * @param {Object} entry - 原始条目
 * @param {number} index - 条目索引
 * @returns {Object} 映射后的条目
 */
function mapLorebookEntry(entry, index) {
  // 基本验证
  if (!entry.keys || !Array.isArray(entry.keys)) {
    entry.keys = []
  }

  if (typeof entry.content !== 'string') {
    entry.content = ''
  }

  return {
    // 基本信息
    id: entry.id ?? index,
    name: entry.comment || entry.name || `条目 #${index}`,
    keys: entry.keys,
    secondaryKeys: entry.secondary_keys || [],
    content: entry.content,

    // 核心属性
    enabled: entry.enabled !== false,
    insertionOrder: entry.insertion_order ?? entry.extensions?.priority ?? 0,
    depth: entry.extensions?.depth ?? entry.depth ?? 4,
    position: mapPosition(entry),
    probability: entry.extensions?.probability ?? 100,

    // 标志
    constant: entry.constant ?? false,
    selective: entry.selective ?? false,
    useProbability: entry.extensions?.useProbability ?? true,

    // 高级属性
    caseSensitive: entry.extensions?.case_sensitive ?? false,
    matchWholeWords: entry.extensions?.match_whole_words ?? false,
    useGroupScoring: entry.extensions?.use_group_scoring ?? false,
    excludeRecursion:
      entry.extensions?.exclude_recursion ?? entry.extensions?.prevent_recursion ?? false,

    // 组相关
    group: entry.extensions?.group || '',
    groupWeight: entry.extensions?.group_weight || 100,
    groupOverride: entry.extensions?.group_override ?? false,

    // 其他
    scanDepth: entry.extensions?.scan_depth || null,
    automationId: entry.extensions?.automation_id || '',
    regex: entry.regex || [],
  }
}

/**
 * 映射位置属性
 * @param {Object} entry - 条目数据
 * @returns {number} 位置代码 (0-4)
 */
function mapPosition(entry) {
  // 优先使用 extensions.position
  const extPos = entry.extensions?.position
  if (extPos != null && typeof extPos === 'number') {
    return extPos
  }

  // 尝试字符串位置
  if (typeof entry.position === 'string') {
    const posMap = {
      before_char: 0,
      after_char: 1,
      an_top: 2,
      an_bottom: 3,
      at_depth: 4,
    }
    return posMap[entry.position] ?? 0
  }

  // 尝试数字位置
  if (typeof entry.position === 'number') {
    return entry.position
  }

  // 默认：角色前
  return 0
}

/**
 * 验证角色卡数据完整性
 * @param {Object} cardData - 角色卡数据
 * @throws {CharacterCardError} 验证失败时抛出
 * @returns {boolean}
 */
export function validateCharacterCard(cardData) {
  const coreData = cardData.spec === 'chara_card_v3' ? cardData.data : cardData

  // 必填字段检查
  if (!coreData.name || coreData.name.trim() === '') {
    throw new CharacterCardError(ErrorCodes.MISSING_REQUIRED, '角色名称不能为空', {
      field: '角色名',
    })
  }

  // 世界书格式检查
  const book = coreData.character_book || coreData.lorebook
  if (book && book.entries) {
    if (!Array.isArray(book.entries)) {
      throw new CharacterCardError(ErrorCodes.INVALID_FORMAT, '世界书条目格式错误', {
        field: 'character_book.entries',
      })
    }

    // 检查每个条目
    book.entries.forEach((entry, index) => {
      if (!entry.keys || !Array.isArray(entry.keys)) {
        console.warn(`[Validation] 世界书条目 ${index} 缺少 keys 数组`)
      }
      if (typeof entry.content !== 'string') {
        console.warn(`[Validation] 世界书条目 ${index} 的 content 格式无效`)
      }
    })
  }

  console.log('[Validation] 角色卡数据验证通过')
  return true
}
