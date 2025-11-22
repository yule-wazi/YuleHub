# Design Document

## Overview

本设计文档描述了 PNG 角色卡导入功能的完整技术方案。该功能允许用户通过上传包含角色数据的 PNG 图片文件，自动解析并导入角色的完整信息到 AI Chat 应用中。

### 核心目标

1. **完整解析** - 支持 Character Card V1/V2/V3 规范，提取所有角色数据
2. **世界书增强** - 重构世界书匹配系统，支持所有高级属性（优先级、深度、位置、概率等）
3. **无缝集成** - 与现有 Vue 3 + Pinia 架构完美融合
4. **用户友好** - 提供预览、错误提示和导入确认机制

### 技术栈

- **前端框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **UI 组件**: Element Plus
- **文件处理**: 原生 File API + ArrayBuffer
- **数据存储**: localStorage (通过 myCache 工具)

## Architecture

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Chat.vue                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  添加角色卡对话框 (el-dialog)                         │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  [导入角色卡 PNG] 按钮                          │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  角色信息表单 (自动填充)                        │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              utils/parseCharacterCard.js                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  parsePNGCharacterCard(file)                          │   │
│  │    ├─ readPNGChunks()      // PNG 块解析             │   │
│  │    ├─ extractCharaData()   // 提取角色数据           │   │
│  │    ├─ decodeJSON()         // JSON/Base64 解码       │   │
│  │    └─ normalizeCardData()  // 版本标准化             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           utils/mapCharacterCard.js                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  mapToInternalFormat(cardData)                        │   │
│  │    ├─ mapBasicInfo()       // 基本信息映射           │   │
│  │    ├─ mapLorebook()        // 世界书转换             │   │
│  │    ├─ mapRegexScripts()    // 正则脚本提取           │   │
│  │    └─ mapAdvancedPrompts() // 高级提示词处理         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         utils/matchLoreBooks.js (重构版)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  matchLoreBooksEnhanced(messageList, loreBooks)       │   │
│  │    ├─ scoreEntries()       // 条目评分（支持所有属性)│   │
│  │    ├─ applyProbability()   // 概率过滤               │   │
│  │    ├─ sortByPriority()     // 优先级排序             │   │
│  │    ├─ injectByPosition()   // 位置注入               │   │
│  │    └─ handleConstant()     // 常驻条目处理           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    agentStore (Pinia)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  users: [...]              // 角色列表                │   │
│  │  currentUser: string       // 当前角色                │   │
│  │  addImportedCharacter()    // 添加导入的角色          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  localStorage (myCache)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  loreBooks: [...]          // 世界书数据              │   │
│  │  importedCharacters: [...]  // 导入的角色             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

1. **用户上传** → 选择 PNG 文件
2. **PNG 解析** → 提取 tEXt/iTXt 块中的 JSON 数据
3. **数据标准化** → 识别版本并转换为统一格式
4. **数据映射** → 转换为应用内部数据结构
5. **预览确认** → 显示解析结果供用户确认
6. **数据存储** → 保存到 Pinia store 和 localStorage
7. **界面更新** → 自动填充表单或直接添加角色

## Components and Interfaces

### 1. PNG 解析器 (parseCharacterCard.js)

#### 核心函数

```javascript
/**
 * 解析 PNG 角色卡文件
 * @param {File} file - PNG 文件对象
 * @returns {Promise<Object>} 解析后的角色卡数据
 * @throws {Error} 解析失败时抛出错误
 */
export async function parsePNGCharacterCard(file) {
  // 1. 读取文件为 ArrayBuffer
  // 2. 验证 PNG 签名
  // 3. 遍历 PNG 块查找 tEXt/iTXt
  // 4. 提取并解码 JSON 数据
  // 5. 返回标准化数据
}

/**
 * 读取 PNG 数据块
 * @param {Uint8Array} bytes - PNG 文件字节数组
 * @returns {Array<Object>} 数据块列表
 */
function readPNGChunks(bytes) {
  // PNG 块结构: [长度(4)] [类型(4)] [数据(n)] [CRC(4)]
}

/**
 * 从 tEXt/iTXt 块提取角色数据
 * @param {Uint8Array} chunkData - 块数据
 * @param {string} chunkType - 'tEXt' 或 'iTXt'
 * @returns {string|null} JSON 字符串
 */
function extractCharaData(chunkData, chunkType) {
  // tEXt: [key\0][value]
  // iTXt: [key\0][compression\0][method\0][language\0][translated\0][value]
}

/**
 * 解码 JSON 数据（支持 Base64）
 * @param {string} rawData - 原始数据字符串
 * @returns {Object} 解析后的 JSON 对象
 */
function decodeJSON(rawData) {
  // 1. 尝试直接 JSON.parse
  // 2. 失败则尝试 Base64 解码后再 parse
}
```

#### 数据结构

```javascript
// 解析结果
{
  success: true,
  data: {
    // V3 格式
    spec: 'chara_card_v3',
    spec_version: '3.0',
    data: { /* 角色数据 */ },
    create_date: '2025-10-19 @15h 34m 18s 375ms'
  },
  // 或 V1/V2 格式
  // data: { /* 直接的角色数据 */ }

  error: null
}
```

### 2. 数据映射器 (mapCharacterCard.js)

#### 核心函数

```javascript
/**
 * 将角色卡数据映射为应用内部格式
 * @param {Object} cardData - 解析后的角色卡数据
 * @returns {Object} 内部格式的角色数据
 */
export function mapToInternalFormat(cardData) {
  const isV3 = cardData.spec === 'chara_card_v3'
  const coreData = isV3 ? cardData.data : cardData

  return {
    userName: coreData.name || '未命名角色',
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
}

/**
 * 构建完整的角色描述
 * @param {Object} coreData - 核心数据
 * @returns {string} 组合后的描述
 */
function buildDescription(coreData) {
  const parts = []
  if (coreData.description) parts.push(coreData.description)
  if (coreData.personality) parts.push(`性格: ${coreData.personality}`)
  if (coreData.scenario) parts.push(`场景: ${coreData.scenario}`)
  if (coreData.mes_example) parts.push(`示例对话:\n${coreData.mes_example}`)
  return parts.join('\n\n')
}

/**
 * 提取头像数据
 * @param {Object} coreData - 核心数据
 * @returns {string} 头像 URL 或默认值
 */
function extractAvatar(coreData) {
  // 可能的字段: avatar, image, extensions.avatar
  // 如果是 base64，转换为 data URL
  // 否则返回 URL 或默认图片
}

/**
 * 映射世界书数据
 * @param {Object} coreData - 核心数据
 * @returns {Array} 世界书条目数组
 */
function mapLorebook(coreData) {
  const book = coreData.character_book || coreData.lorebook
  if (!book || !book.entries) return []

  return {
    label: book.name || '导入的世界书',
    value: book.entries.map((entry) => mapLorebookEntry(entry)),
  }
}

/**
 * 映射单个世界书条目
 * @param {Object} entry - 原始条目
 * @returns {Object} 映射后的条目
 */
function mapLorebookEntry(entry) {
  return {
    // 基本信息
    id: entry.id,
    name: entry.comment || entry.name || '',
    keys: entry.keys || [],
    secondaryKeys: entry.secondary_keys || [],
    content: entry.content || '',

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

    // 扫描配置
    scanDepth: entry.extensions?.scan_depth || null,
    automationId: entry.extensions?.automation_id || '',

    // 正则支持
    regex: entry.regex || [],
  }
}

/**
 * 映射位置属性
 * @param {Object} entry - 条目数据
 * @returns {number} 位置代码
 */
function mapPosition(entry) {
  // 0: 角色前, 1: 角色后, 2: AN顶部, 3: AN底部, 4: 指定深度
  const extPos = entry.extensions?.position
  if (extPos != null) return extPos

  if (entry.position === 'before_char') return 0
  if (entry.position === 'after_char') return 1

  return 0 // 默认角色前
}
```

### 3. 世界书匹配系统重构 (matchLoreBooks.js)

#### 增强功能

现有的 `matchLoreBooks` 函数需要扩展以支持角色卡中的所有世界书属性。

#### 新增配置选项

```javascript
export function matchLoreBooksEnhanced(messageList, loreBooks, options = {}) {
  const {
    // 现有选项
    topK = 4,
    minScore = 0.4,
    tokenBudget = 2000,
    enableRegex = true,

    // 新增选项
    respectPriority = true, // 是否使用 insertionOrder
    respectPosition = true, // 是否使用 position 属性
    respectProbability = true, // 是否应用概率过滤
    includeConstant = true, // 是否包含常驻条目
    caseSensitiveDefault = false, // 默认大小写敏感性
    matchWholeWordsDefault = false, // 默认完整单词匹配
  } = options

  // 实现逻辑...
}
```

#### 评分系统增强

```javascript
/**
 * 计算条目得分（支持所有属性）
 * @param {Object} entry - 世界书条目
 * @param {Array} candidates - 候选消息列表
 * @param {Object} options - 配置选项
 * @returns {number} 得分
 */
function scoreEntry(entry, candidates, options) {
  let score = 0
  const hitKeys = []

  // 1. 常驻条目直接高分
  if (entry.constant && options.includeConstant) {
    return 9999 // 确保常驻条目优先
  }

  // 2. 关键词匹配
  for (const c of candidates) {
    const query = entry.caseSensitive ? c.raw : c.norm

    for (let key of entry.keys) {
      const k = entry.caseSensitive ? key : normalize(key)

      if (entry.matchWholeWords) {
        // 完整单词匹配
        const regex = new RegExp(`\\b${escapeRegex(k)}\\b`, 'i')
        if (regex.test(query)) {
          score += options.keywordWeight * c.weight
          hitKeys.push(key)
        }
      } else {
        // 包含匹配
        if (query.indexOf(k) !== -1) {
          score += options.keywordWeight * c.weight
          hitKeys.push(key)
        }
      }
    }

    // 次要关键词（权重减半）
    for (let key of entry.secondaryKeys || []) {
      const k = entry.caseSensitive ? key : normalize(key)
      if (query.indexOf(k) !== -1) {
        score += options.keywordWeight * 0.5 * c.weight
      }
    }
  }

  // 3. 正则匹配
  if (options.enableRegex && entry.regex) {
    for (const c of candidates) {
      for (let r of entry.regex) {
        try {
          const re = new RegExp(String(r), entry.caseSensitive ? '' : 'i')
          if (re.test(c.raw)) {
            score += options.regexWeight * c.weight
            hitKeys.push('/' + r + '/')
          }
        } catch (e) {
          // 忽略非法正则
        }
      }
    }
  }

  // 4. 优先级加成
  if (options.respectPriority) {
    score += entry.insertionOrder * options.priorityWeight
  }

  // 5. 选择性条目需要更高分数
  if (entry.selective) {
    score *= 0.8 // 提高门槛
  }

  return score
}
```

#### 概率过滤

```javascript
/**
 * 应用概率过滤
 * @param {Array} entries - 条目列表
 * @returns {Array} 过滤后的条目
 */
function applyProbability(entries) {
  return entries.filter((entry) => {
    if (!entry.useProbability) return true
    if (entry.constant) return true // 常驻条目忽略概率

    const prob = entry.probability ?? 100
    const roll = Math.random() * 100
    return roll < prob
  })
}
```

#### 位置注入

```javascript
/**
 * 根据位置属性注入条目
 * @param {Array} entries - 条目列表
 * @param {Array} messageList - 消息列表
 * @returns {Object} 按位置分组的条目
 */
function injectByPosition(entries, messageList) {
  const positioned = {
    beforeChar: [], // position: 0
    afterChar: [], // position: 1
    anTop: [], // position: 2
    anBottom: [], // position: 3
    atDepth: [], // position: 4
  }

  for (const entry of entries) {
    const content = formatLoreContent(entry)

    switch (entry.position) {
      case 0:
        positioned.beforeChar.push(content)
        break
      case 1:
        positioned.afterChar.push(content)
        break
      case 2:
        positioned.anTop.push(content)
        break
      case 3:
        positioned.anBottom.push(content)
        break
      case 4:
        // 在指定深度插入
        positioned.atDepth.push({ content, depth: entry.depth })
        break
      default:
        positioned.beforeChar.push(content)
    }
  }

  return positioned
}
```

#### 深度扫描

```javascript
/**
 * 构建历史候选（支持 scanDepth）
 * @param {Array} messageList - 消息列表
 * @param {Object} options - 配置选项
 * @returns {Array} 候选消息
 */
function buildHistoryCandidates(messageList, options) {
  const {
    historyMode = 'window',
    windowSize = 8,
    scanDepth = null, // 新增：优先使用条目的 scanDepth
    roles = ['user', 'assistant'],
    timeDecay = 0.85,
  } = options

  // 如果指定了 scanDepth，覆盖 windowSize
  const effectiveWindow = scanDepth ?? windowSize

  // 其余逻辑与现有实现相同...
}
```

## Data Models

### Character Card 数据模型

#### V3 格式（完整）

```javascript
{
  spec: 'chara_card_v3',
  spec_version: '3.0',
  data: {
    name: string,
    description: string,
    personality: string,
    scenario: string,
    first_mes: string,
    mes_example: string,
    creator_notes: string,
    system_prompt: string,
    post_history_instructions: string,
    alternate_greetings: string[],
    tags: string[],
    creator: string,
    character_version: string,

    extensions: {
      talkativeness: string,
      fav: boolean,
      world: string,
      voiceId: string,

      depth_prompt: {
        prompt: string,
        depth: number,
        role: 'system' | 'user' | 'assistant'
      },

      regex_scripts: [{
        id: string,
        scriptName: string,
        findRegex: string,
        replaceString: string,
        trimStrings: string[],
        placement: number[],
        disabled: boolean,
        markdownOnly: boolean,
        promptOnly: boolean,
        runOnEdit: boolean,
        substituteRegex: number,
        minDepth: number | null,
        maxDepth: number
      }]
    },

    character_book: {
      name: string,
      entries: [{
        id: number,
        keys: string[],
        content: string,
        enabled: boolean,
        insertion_order: number,

        // 可选字段
        comment: string,
        name: string,
        constant: boolean,
        selective: boolean,
        secondary_keys: string[],
        position: string | number,
        depth: number,

        extensions: {
          priority: number,
          depth: number,
          probability: number,
          useProbability: boolean,
          position: number,
          case_sensitive: boolean,
          match_whole_words: boolean,
          use_group_scoring: boolean,
          exclude_recursion: boolean,
          prevent_recursion: boolean,
          group: string,
          group_weight: number,
          group_override: boolean,
          scan_depth: number,
          automation_id: string
        },

        regex: string[]
      }]
    }
  },

  create_date: string
}
```

### 内部数据模型

#### 角色对象（agentStore.users）

```javascript
{
  userName: string,
  voiceId: string,
  image: string,
  isVip: boolean,

  loreBooks: {
    label: string,
    value: [{
      id: number | string,
      name: string,
      keys: string[],
      secondaryKeys: string[],
      content: string,

      // 核心属性
      enabled: boolean,
      insertionOrder: number,
      depth: number,
      position: number,
      probability: number,

      // 标志
      constant: boolean,
      selective: boolean,
      useProbability: boolean,

      // 高级属性
      caseSensitive: boolean,
      matchWholeWords: boolean,
      useGroupScoring: boolean,
      excludeRecursion: boolean,

      // 组相关
      group: string,
      groupWeight: number,
      groupOverride: boolean,

      // 其他
      scanDepth: number | null,
      automationId: string,
      regex: string[]
    }]
  },

  regexScripts: [{
    id: string,
    scriptName: string,
    findRegex: string,
    replaceString: string,
    placement: number[],
    disabled: boolean,
    markdownOnly: boolean,
    promptOnly: boolean,
    runOnEdit: boolean,
    minDepth: number | null,
    maxDepth: number
  }],

  systemPrompt: string,
  postHistoryInstructions: string,
  creatorNotes: string,

  depthPrompt: {
    prompt: string,
    depth: number,
    role: string
  } | null,

  metadata: {
    spec: string,
    version: string,
    creator: string,
    characterVersion: string,
    tags: string[],
    createDate: string
  },

  message: [{
    description: string,  // 系统提示
    audioSrc: string,
    image: string,
    isMe: boolean,
    message: string
  }]
}
```

## Error Handling

### 错误类型定义

```javascript
export class CharacterCardError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'CharacterCardError'
    this.code = code
    this.details = details
  }
}

// 错误代码
export const ErrorCodes = {
  INVALID_FILE: 'INVALID_FILE', // 非 PNG 文件
  NO_CHARA_DATA: 'NO_CHARA_DATA', // 未找到角色数据
  PARSE_ERROR: 'PARSE_ERROR', // JSON 解析失败
  MISSING_REQUIRED: 'MISSING_REQUIRED', // 缺少必填字段
  INVALID_FORMAT: 'INVALID_FORMAT', // 数据格式错误
  FILE_READ_ERROR: 'FILE_READ_ERROR', // 文件读取失败
}
```

### 错误处理策略

```javascript
// 在 Chat.vue 中
const handleImportError = (error) => {
  let userMessage = '导入失败'

  if (error instanceof CharacterCardError) {
    switch (error.code) {
      case ErrorCodes.INVALID_FILE:
        userMessage = '非有效的 PNG 文件，请选择正确的角色卡图片'
        break
      case ErrorCodes.NO_CHARA_DATA:
        userMessage = '该 PNG 文件不包含角色卡数据'
        break
      case ErrorCodes.PARSE_ERROR:
        userMessage = '角色卡数据格式错误，无法解析'
        break
      case ErrorCodes.MISSING_REQUIRED:
        userMessage = `角色卡缺少必要信息：${error.details.field}`
        break
      default:
        userMessage = error.message
    }
  }

  ElMessage.error(userMessage)
  console.error('Character card import error:', error)
}
```

### 数据验证

```javascript
/**
 * 验证角色卡数据完整性
 * @param {Object} cardData - 角色卡数据
 * @throws {CharacterCardError} 验证失败时抛出
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
        console.warn(`World book entry ${index} missing keys array`)
      }
      if (typeof entry.content !== 'string') {
        console.warn(`World book entry ${index} has invalid content`)
      }
    })
  }

  return true
}
```

## Testing Strategy

### 单元测试

#### PNG 解析器测试

```javascript
describe('parsePNGCharacterCard', () => {
  test('应该正确解析 V3 格式的角色卡', async () => {
    const file = createMockPNGFile(v3CharacterData)
    const result = await parsePNGCharacterCard(file)

    expect(result.success).toBe(true)
    expect(result.data.spec).toBe('chara_card_v3')
    expect(result.data.data.name).toBe('测试角色')
  })

  test('应该正确解析 Base64 编码的数据', async () => {
    const file = createMockPNGFile(base64EncodedData)
    const result = await parsePNGCharacterCard(file)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  test('应该拒绝非 PNG 文件', async () => {
    const file = new File(['not a png'], 'test.txt', { type: 'text/plain' })

    await expect(parsePNGCharacterCard(file)).rejects.toThrow('非 PNG 文件')
  })

  test('应该处理缺少角色数据的 PNG', async () => {
    const file = createMockPNGFile(null)

    await expect(parsePNGCharacterCard(file)).rejects.toThrow('未找到角色数据块')
  })
})
```

#### 数据映射器测试

```javascript
describe('mapToInternalFormat', () => {
  test('应该正确映射 V3 格式数据', () => {
    const result = mapToInternalFormat(v3MockData)

    expect(result.userName).toBe('测试角色')
    expect(result.loreBooks.value).toHaveLength(3)
    expect(result.regexScripts).toHaveLength(1)
  })

  test('应该正确映射世界书条目的所有属性', () => {
    const result = mapToInternalFormat(mockDataWithLorebook)
    const entry = result.loreBooks.value[0]

    expect(entry.insertionOrder).toBe(100)
    expect(entry.depth).toBe(4)
    expect(entry.position).toBe(0)
    expect(entry.probability).toBe(80)
    expect(entry.caseSensitive).toBe(true)
  })

  test('应该处理缺失的可选字段', () => {
    const minimalData = { name: '简单角色' }
    const result = mapToInternalFormat(minimalData)

    expect(result.userName).toBe('简单角色')
    expect(result.loreBooks).toEqual([])
    expect(result.regexScripts).toEqual([])
  })
})
```

#### 世界书匹配测试

```javascript
describe('matchLoreBooksEnhanced', () => {
  test('应该根据 insertionOrder 排序', () => {
    const entries = [
      { keys: ['test'], content: 'A', insertionOrder: 50 },
      { keys: ['test'], content: 'B', insertionOrder: 100 },
      { keys: ['test'], content: 'C', insertionOrder: 75 },
    ]

    const result = matchLoreBooksEnhanced([{ role: 'user', content: 'test message' }], entries, {
      respectPriority: true,
    })

    expect(result.loreBooksMessageList[0].content).toContain('B')
  })

  test('应该应用概率过滤', () => {
    const entries = [{ keys: ['test'], content: 'A', probability: 0, useProbability: true }]

    const result = matchLoreBooksEnhanced([{ role: 'user', content: 'test message' }], entries, {
      respectProbability: true,
    })

    expect(result.loreBooksMessageList).toHaveLength(0)
  })

  test('应该包含常驻条目', () => {
    const entries = [{ keys: [], content: 'Constant', constant: true }]

    const result = matchLoreBooksEnhanced([{ role: 'user', content: 'any message' }], entries, {
      includeConstant: true,
    })

    expect(result.loreBooksMessageList).toHaveLength(1)
  })

  test('应该支持大小写敏感匹配', () => {
    const entries = [{ keys: ['Test'], content: 'A', caseSensitive: true }]

    const result = matchLoreBooksEnhanced([{ role: 'user', content: 'test message' }], entries)

    expect(result.loreBooksMessageList).toHaveLength(0)
  })

  test('应该支持完整单词匹配', () => {
    const entries = [{ keys: ['test'], content: 'A', matchWholeWords: true }]

    const result1 = matchLoreBooksEnhanced([{ role: 'user', content: 'testing' }], entries)
    expect(result1.loreBooksMessageList).toHaveLength(0)

    const result2 = matchLoreBooksEnhanced([{ role: 'user', content: 'test message' }], entries)
    expect(result2.loreBooksMessageList).toHaveLength(1)
  })
})
```

### 集成测试

#### 完整导入流程测试

```javascript
describe('Character Card Import Flow', () => {
  test('应该完整导入角色卡并添加到角色列表', async () => {
    const file = createMockPNGFile(completeV3Data)

    // 1. 解析
    const parsed = await parsePNGCharacterCard(file)
    expect(parsed.success).toBe(true)

    // 2. 映射
    const mapped = mapToInternalFormat(parsed.data)
    expect(mapped.userName).toBeDefined()

    // 3. 验证
    const isValid = validateCharacterCard(parsed.data)
    expect(isValid).toBe(true)

    // 4. 添加到 store（模拟）
    const store = useAgentStore()
    store.users.push(mapped)

    expect(store.users).toContain(mapped)
  })
})
```

### 手动测试清单

- [ ] 上传标准 V3 格式角色卡
- [ ] 上传 V1/V2 格式角色卡
- [ ] 上传包含完整世界书的角色卡
- [ ] 上传包含正则脚本的角色卡
- [ ] 上传包含备用开场白的角色卡
- [ ] 上传非 PNG 文件（应显示错误）
- [ ] 上传不包含角色数据的 PNG（应显示错误）
- [ ] 上传损坏的角色卡数据（应显示错误）
- [ ] 验证世界书在对话中正确触发
- [ ] 验证优先级、深度、位置等属性生效
- [ ] 验证概率过滤功能
- [ ] 验证常驻条目始终显示
- [ ] 验证大小写敏感匹配
- [ ] 验证完整单词匹配

## Implementation Details

### UI 集成（Chat.vue）

#### 添加导入按钮

在现有的"添加角色卡"对话框中添加导入按钮：

```vue
<template>
  <el-dialog v-model="centerDialogVisible" title="添加角色卡">
    <el-form ref="ruleFormRef" :model="roleForm">
      <!-- 新增：导入按钮区域 -->
      <el-form-item>
        <el-button type="primary" plain @click="triggerImportPNG" style="width: 100%">
          <el-icon><Upload /></el-icon>
          导入角色卡 PNG
        </el-button>
        <input
          ref="pngImportInput"
          type="file"
          accept=".png"
          @change="handlePNGImport"
          style="display: none"
        />
      </el-form-item>

      <!-- 现有表单字段 -->
      <el-form-item prop="userName">
        <!-- ... -->
      </el-form-item>
      <!-- ... -->
    </el-form>
  </el-dialog>
</template>

<script setup>
import { parsePNGCharacterCard } from '@/utils/parseCharacterCard'
import { mapToInternalFormat } from '@/utils/mapCharacterCard'
import { validateCharacterCard } from '@/utils/mapCharacterCard'

const pngImportInput = ref(null)

const triggerImportPNG = () => {
  pngImportInput.value?.click()
}

const handlePNGImport = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    // 显示加载提示
    const loading = ElLoading.service({
      lock: true,
      text: '正在解析角色卡...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    // 1. 解析 PNG
    const parsed = await parsePNGCharacterCard(file)

    // 2. 验证数据
    validateCharacterCard(parsed.data)

    // 3. 映射为内部格式
    const mapped = mapToInternalFormat(parsed.data)

    // 4. 显示预览对话框
    showImportPreview(mapped)

    loading.close()
  } catch (error) {
    loading.close()
    handleImportError(error)
  } finally {
    e.target.value = '' // 清空文件选择
  }
}

// 预览对话框
const importPreviewVisible = ref(false)
const previewData = ref(null)

const showImportPreview = (data) => {
  previewData.value = data
  importPreviewVisible.value = true
}

const confirmImport = () => {
  if (!previewData.value) return

  // 填充表单
  roleForm.userName = previewData.value.userName
  roleForm.image = previewData.value.image
  roleForm.description = previewData.value.description
  roleForm.firstMessage = previewData.value.firstMessage
  roleForm.voiceId = previewData.value.voiceId

  // 处理世界书
  if (previewData.value.loreBooks) {
    roleForm.addLoreBooksData.push(previewData.value.loreBooks)
    roleForm.loreBooks = previewData.value.loreBooks.value
  }

  // 存储正则脚本和高级提示词
  roleForm.regexScripts = previewData.value.regexScripts
  roleForm.systemPrompt = previewData.value.systemPrompt
  roleForm.postHistoryInstructions = previewData.value.postHistoryInstructions
  roleForm.depthPrompt = previewData.value.depthPrompt

  importPreviewVisible.value = false

  ElMessage.success('角色卡导入成功！请检查并确认信息')
}
</script>
```

#### 预览对话框

```vue
<el-dialog
  v-model="importPreviewVisible"
  title="角色卡导入预览"
  width="90vw"
  style="max-width: 800px"
>
  <div v-if="previewData" class="preview-content">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="角色名">
        {{ previewData.userName }}
      </el-descriptions-item>
      <el-descriptions-item label="规范版本">
        {{ previewData.metadata.spec }}
      </el-descriptions-item>
      <el-descriptions-item label="创建者">
        {{ previewData.metadata.creator || '未知' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建日期">
        {{ previewData.metadata.createDate || '未知' }}
      </el-descriptions-item>
      <el-descriptions-item label="世界书条目" :span="2">
        {{ previewData.loreBooks?.value?.length || 0 }} 个条目
      </el-descriptions-item>
      <el-descriptions-item label="正则脚本" :span="2">
        {{ previewData.regexScripts?.length || 0 }} 个脚本
      </el-descriptions-item>
      <el-descriptions-item label="备用开场白" :span="2">
        {{ previewData.alternateGreetings?.length || 0 }} 个
      </el-descriptions-item>
    </el-descriptions>
    
    <el-divider>角色描述预览</el-divider>
    <div class="description-preview">
      {{ previewData.description.substring(0, 200) }}
      <span v-if="previewData.description.length > 200">...</span>
    </div>
    
    <el-divider>开场白预览</el-divider>
    <div class="greeting-preview">
      {{ previewData.firstMessage.substring(0, 200) }}
      <span v-if="previewData.firstMessage.length > 200">...</span>
    </div>
    
    <el-alert
      v-if="previewData.regexScripts?.length > 0"
      type="info"
      :closable="false"
      style="margin-top: 20px"
    >
      <template #title>
        检测到 {{ previewData.regexScripts.length }} 个正则脚本，当前版本暂不执行
      </template>
    </el-alert>
  </div>
  
  <template #footer>
    <el-button @click="importPreviewVisible = false">取消</el-button>
    <el-button type="primary" @click="confirmImport">确认导入</el-button>
  </template>
</el-dialog>
```

### 文件结构

```
src/
├── utils/
│   ├── parseCharacterCard.js      # PNG 解析器（新建）
│   ├── mapCharacterCard.js        # 数据映射器（新建）
│   └── matchLoreBooks.js          # 世界书匹配（重构）
├── view/
│   └── chat/
│       └── chat.vue               # 主界面（修改）
└── sotre/
    └── module/
        └── agent.js               # 角色状态管理（可能需要扩展）
```

### 性能优化

#### 1. 大文件处理

```javascript
// 使用 Web Worker 处理大型 PNG 文件（可选）
export async function parsePNGCharacterCardAsync(file) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/workers/pngParser.worker.js')

    worker.onmessage = (e) => {
      if (e.data.success) {
        resolve(e.data.result)
      } else {
        reject(new Error(e.data.error))
      }
      worker.terminate()
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }

    file.arrayBuffer().then((buffer) => {
      worker.postMessage({ buffer }, [buffer])
    })
  })
}
```

#### 2. 世界书缓存

```javascript
// 缓存世界书匹配结果
const lorebookCache = new Map()

export function matchLoreBooksEnhanced(messageList, loreBooks, options = {}) {
  const cacheKey = generateCacheKey(messageList, loreBooks, options)

  if (lorebookCache.has(cacheKey)) {
    return lorebookCache.get(cacheKey)
  }

  const result = performMatching(messageList, loreBooks, options)

  lorebookCache.set(cacheKey, result)

  // 限制缓存大小
  if (lorebookCache.size > 100) {
    const firstKey = lorebookCache.keys().next().value
    lorebookCache.delete(firstKey)
  }

  return result
}
```

### 安全考虑

#### 1. 文件大小限制

```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function parsePNGCharacterCard(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new CharacterCardError(ErrorCodes.INVALID_FILE, '文件过大，请选择小于 10MB 的文件')
  }

  // 继续解析...
}
```

#### 2. 正则表达式安全

```javascript
// 防止 ReDoS 攻击
function isSafeRegex(pattern) {
  // 检查危险模式
  const dangerousPatterns = [
    /(\.\*){3,}/, // 多个 .*
    /(\+|\*){2,}/, // 连续量词
    /(\(.*\)){3,}/, // 嵌套捕获组
  ]

  return !dangerousPatterns.some((p) => p.test(pattern))
}

function scoreEntry(entry, candidates, options) {
  // 在使用正则前检查
  if (options.enableRegex && entry.regex) {
    for (let r of entry.regex) {
      if (!isSafeRegex(r)) {
        console.warn(`Unsafe regex detected: ${r}`)
        continue
      }
      // 使用正则...
    }
  }
}
```

### 向后兼容

确保新功能不影响现有的手动添加角色功能：

```javascript
// 在 addRoleCardConfirm 中
const addRoleCardConfirm = () => {
  centerDialogVisible.value = false
  drawer.value = false

  const { userName, image, description, firstMessage, loreBooks, voiceId } = roleForm

  // 构建角色对象（兼容新旧格式）
  const newUser = {
    userName,
    voiceId,
    image,
    isVip: true,
    loreBooks,

    // 新增字段（可选）
    regexScripts: roleForm.regexScripts || [],
    systemPrompt: roleForm.systemPrompt || '',
    postHistoryInstructions: roleForm.postHistoryInstructions || '',
    depthPrompt: roleForm.depthPrompt || null,

    message: [
      { description: systemPrompt({ firstMessage, description }) },
      { audioSrc: '', image, isMe: false, message: firstMessage },
    ],
  }

  users.push(newUser)
}
```

## Design Decisions

### 为什么重构而不是替换 matchLoreBooks？

保留现有函数的核心逻辑，通过扩展参数和增强功能来支持新属性，这样：

- 保持向后兼容
- 减少破坏性变更
- 现有角色继续正常工作

### 为什么使用预览对话框？

- 让用户在导入前确认数据
- 避免意外覆盖现有角色
- 提供透明的导入过程

### 为什么分离解析和映射？

- 单一职责原则
- 便于测试和维护
- 支持未来扩展（如导出功能）

### 为什么不立即实现正则脚本执行？

- 正则脚本涉及文本处理管道
- 需要更多的安全验证
- 可以作为后续功能迭代
  reBooks.js (重构) # 世界书匹配增强
  ├── view/
  │ └── chat/
  │ └── chat.vue # 主界面（修改）
  └── sotre/
  └── module/
  └── agent.js # 状态管理（可能需要扩展）

````

### 依赖关系

- `chat.vue` → `parseCharacterCard.js` → `mapCharacterCard.js`
- `chat.vue` → `matchLoreBooks.js` (使用重构后的版本)
- `mapCharacterCard.js` → `matchLoreBooks.js` (数据格式兼容)

## Performance Considerations

### 文件解析优化

1. **流式读取** - 对于大型 PNG 文件，使用 ArrayBuffer 一次性读取
2. **惰性解析** - 只解析必要的 PNG 块，找到角色数据后立即停止
3. **缓存机制** - 解析结果可以临时缓存，避免重复解析

```javascript
// 优化的块读取
function readPNGChunks(bytes) {
  const chunks = []
  let offset = 8 // 跳过 PNG 签名

  while (offset < bytes.length) {
    const length = readUInt32BE(bytes, offset)
    const type = readChunkType(bytes, offset + 4)

    // 只关注文本块
    if (type === 'tEXt' || type === 'iTXt') {
      chunks.push({
        type,
        data: bytes.slice(offset + 8, offset + 8 + length),
      })
    }

    // 遇到 IEND 块停止
    if (type === 'IEND') break

    offset += 12 + length
  }

  return chunks
}
````

### 世界书匹配优化

1. **索引构建** - 为关键词建立倒排索引，加速匹配
2. **批量处理** - 一次性处理所有候选消息
3. **早期退出** - 达到 topK 和 tokenBudget 后立即停止

```javascript
// 关键词索引
class LorebookIndex {
  constructor(entries) {
    this.index = new Map() // key -> [entry indices]

    entries.forEach((entry, idx) => {
      entry.keys.forEach((key) => {
        const normalized = normalize(key)
        if (!this.index.has(normalized)) {
          this.index.set(normalized, [])
        }
        this.index.get(normalized).push(idx)
      })
    })
  }

  findMatchingEntries(query) {
    const normalized = normalize(query)
    const matches = new Set()

    // 快速查找包含关键词的条目
    for (const [key, indices] of this.index.entries()) {
      if (normalized.includes(key)) {
        indices.forEach((idx) => matches.add(idx))
      }
    }

    return Array.from(matches)
  }
}
```

### 内存管理

1. **及时释放** - 解析完成后释放 ArrayBuffer
2. **分页加载** - 世界书条目过多时考虑分页
3. **图片压缩** - 导入的头像自动压缩到合理尺寸

## Security Considerations

### 输入验证

1. **文件类型检查** - 严格验证 PNG 签名
2. **文件大小限制** - 限制上传文件大小（如 10MB）
3. **JSON 深度限制** - 防止深度嵌套的 JSON 攻击

```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_JSON_DEPTH = 10

function validateFileSize(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new CharacterCardError(
      ErrorCodes.INVALID_FILE,
      `文件过大，最大支持 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    )
  }
}

function validateJSONDepth(obj, depth = 0) {
  if (depth > MAX_JSON_DEPTH) {
    throw new CharacterCardError(ErrorCodes.PARSE_ERROR, 'JSON 嵌套层级过深')
  }

  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      validateJSONDepth(obj[key], depth + 1)
    }
  }
}
```

### XSS 防护

1. **内容转义** - 显示用户输入的内容时进行 HTML 转义
2. **正则验证** - 验证正则表达式的合法性，防止 ReDoS 攻击
3. **URL 验证** - 验证头像 URL 的合法性

```javascript
// 正则表达式安全检查
function validateRegex(pattern) {
  try {
    // 检查是否包含危险模式
    const dangerous = [
      /(\.\*){3,}/, // 过多的 .*
      /(\+|\*){3,}/, // 过多的量词
      /(\\d\+){3,}/, // 过多的 \d+
    ]

    for (const check of dangerous) {
      if (check.test(pattern)) {
        console.warn('Potentially dangerous regex pattern detected:', pattern)
        return false
      }
    }

    // 尝试编译
    new RegExp(pattern)
    return true
  } catch (e) {
    return false
  }
}
```

### 数据隔离

1. **用户数据隔离** - 导入的角色数据与系统预设角色分离存储
2. **权限控制** - 导入的角色标记为 `isVip: true`，确保权限正确
3. **数据清理** - 删除角色时完全清理相关数据

## Migration Strategy

### 现有数据兼容

导入功能不影响现有手动添加的角色，两种方式共存：

```javascript
// 在 agentStore 中区分角色来源
const addCharacter = (character, source = 'manual') => {
  const newCharacter = {
    ...character,
    _source: source, // 'manual' | 'imported'
    _importDate: source === 'imported' ? new Date().toISOString() : null,
  }

  users.push(newCharacter)
}
```

### 渐进式增强

1. **阶段 1** - 基础导入功能（PNG 解析 + 基本信息映射）
2. **阶段 2** - 世界书完整支持（重构匹配系统）
3. **阶段 3** - 正则脚本执行（可选功能）
4. **阶段 4** - 高级提示词优化（深度集成）

### 回滚方案

如果导入功能出现问题，用户可以：

1. 继续使用手动添加角色功能
2. 通过 localStorage 清理导入的角色数据
3. 系统提供"重置导入角色"功能

## Future Enhancements

### 短期优化（1-2 个月）

1. **批量导入** - 支持一次导入多个角色卡
2. **导出功能** - 将应用内角色导出为标准 PNG 角色卡
3. **角色编辑** - 导入后可以编辑角色的所有属性
4. **世界书编辑器** - 可视化编辑世界书条目的所有属性

### 中期优化（3-6 个月）

1. **正则脚本执行** - 实现正则脚本的运行时处理
2. **角色市场** - 在线浏览和下载社区分享的角色卡
3. **版本管理** - 角色卡的版本控制和更新机制
4. **云同步** - 角色数据云端备份和多设备同步

### 长期优化（6-12 个月）

1. **AI 辅助创建** - 使用 AI 帮助用户创建角色卡
2. **角色对话分析** - 分析对话质量并优化角色设定
3. **动态世界书** - 根据对话内容自动生成世界书条目
4. **多模态支持** - 支持语音、图片等多模态角色卡

## Deployment Checklist

### 开发环境

- [ ] 创建 `parseCharacterCard.js` 工具函数
- [ ] 创建 `mapCharacterCard.js` 映射函数
- [ ] 重构 `matchLoreBooks.js` 支持所有属性
- [ ] 修改 `chat.vue` 添加导入功能
- [ ] 编写单元测试
- [ ] 编写集成测试

### 测试环境

- [ ] 测试各种格式的角色卡（V1/V2/V3）
- [ ] 测试边界情况（空数据、超大文件等）
- [ ] 测试世界书匹配的所有属性
- [ ] 性能测试（大型世界书、多角色）
- [ ] 兼容性测试（不同浏览器）

### 生产环境

- [ ] 代码审查
- [ ] 性能优化
- [ ] 错误监控配置
- [ ] 用户文档编写
- [ ] 发布说明准备
- [ ] 灰度发布计划

## Documentation

### 用户文档

#### 如何导入角色卡

1. 点击"添加角色卡"按钮
2. 点击"导入角色卡 PNG"按钮
3. 选择包含角色数据的 PNG 图片
4. 查看预览信息，确认无误后点击"确认导入"
5. 角色信息会自动填充到表单中
6. 可以进行微调后点击"确定"完成添加

#### 支持的角色卡格式

- Character Card V1 (旧版格式)
- Character Card V2 (标准格式)
- Character Card V3 (最新格式，推荐)

#### 世界书说明

导入的世界书会自动在对话中触发，支持以下特性：

- **关键词匹配** - 当对话中出现关键词时触发
- **优先级控制** - 高优先级条目优先显示
- **位置控制** - 可以指定条目在对话中的位置
- **概率触发** - 可以设置触发概率
- **常驻条目** - 始终显示的重要信息

### 开发者文档

#### API 参考

```javascript
// 解析 PNG 角色卡
import { parsePNGCharacterCard } from '@/utils/parseCharacterCard'

const result = await parsePNGCharacterCard(file)
// result: { success: boolean, data: Object, error: Error | null }

// 映射为内部格式
import { mapToInternalFormat } from '@/utils/mapCharacterCard'

const character = mapToInternalFormat(result.data)
// character: { userName, image, loreBooks, ... }

// 增强的世界书匹配
import { matchLoreBooksEnhanced } from '@/utils/matchLoreBooks'

const matched = matchLoreBooksEnhanced(messageList, loreBooks, {
  respectPriority: true,
  respectPosition: true,
  respectProbability: true,
})
// matched: { loreBooksMessageList: Array, messageKeys: Array }
```

#### 扩展指南

如果需要支持自定义的角色卡格式：

1. 在 `parseCharacterCard.js` 中添加新的解析逻辑
2. 在 `mapCharacterCard.js` 中添加新的映射规则
3. 更新数据模型定义
4. 添加相应的测试用例

## Conclusion

本设计文档详细描述了 PNG 角色卡导入功能的完整技术方案，包括：

- **完整的架构设计** - 模块化、可扩展的系统架构
- **详细的数据模型** - 支持所有角色卡规范和属性
- **增强的世界书系统** - 支持优先级、位置、概率等高级特性
- **全面的错误处理** - 友好的用户提示和详细的日志
- **完善的测试策略** - 单元测试、集成测试和手动测试
- **安全性考虑** - 输入验证、XSS 防护、数据隔离
- **性能优化** - 文件解析、匹配算法、内存管理
- **未来规划** - 短期、中期、长期的功能扩展路线

该设计确保了功能的完整性、可维护性和可扩展性，为后续的实现提供了清晰的指导。
