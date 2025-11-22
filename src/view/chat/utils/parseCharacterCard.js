/**
 * PNG 角色卡解析工具
 * 支持 Character Card V1/V2/V3 规范
 * 从 PNG 图片的 tEXt/iTXt 元数据块中提取角色数据
 */

// 错误类型定义
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

// PNG 文件签名
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

// 文件大小限制（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024

// JSON 深度限制
const MAX_JSON_DEPTH = 10

/**
 * 解析 PNG 角色卡文件
 * @param {File} file - PNG 文件对象
 * @returns {Promise<Object>} 解析后的角色卡数据
 * @throws {CharacterCardError} 解析失败时抛出错误
 */
export async function parsePNGCharacterCard(file) {
  try {
    // 0. 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new CharacterCardError(
        ErrorCodes.INVALID_FILE,
        `文件过大，最大支持 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      )
    }

    // 1. 读取文件为 ArrayBuffer
    const buffer = await readFileAsArrayBuffer(file)
    const bytes = new Uint8Array(buffer)

    // 2. 验证 PNG 签名
    if (!validatePNGSignature(bytes)) {
      throw new CharacterCardError(ErrorCodes.INVALID_FILE, '非有效的 PNG 文件')
    }

    // 3. 读取 PNG 数据块
    const chunks = readPNGChunks(bytes)

    // 4. 提取角色数据
    const rawData = extractCharacterData(chunks)
    if (!rawData) {
      throw new CharacterCardError(ErrorCodes.NO_CHARA_DATA, '该 PNG 文件不包含角色卡数据')
    }

    // 5. 解码 JSON
    const jsonData = decodeJSON(rawData)

    // 5.5 验证 JSON 深度
    validateJSONDepth(jsonData)

    // 6. 标准化数据
    const normalizedData = normalizeCardData(jsonData)

    return {
      success: true,
      data: normalizedData,
      error: null,
    }
  } catch (error) {
    console.error('[CharacterCard] 解析失败:', error)

    if (error instanceof CharacterCardError) {
      throw error
    }

    throw new CharacterCardError(ErrorCodes.FILE_READ_ERROR, '文件读取失败: ' + error.message, {
      originalError: error,
    })
  }
}

/**
 * 读取文件为 ArrayBuffer
 * @param {File} file - 文件对象
 * @returns {Promise<ArrayBuffer>}
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 验证 PNG 文件签名
 * @param {Uint8Array} bytes - 文件字节数组
 * @returns {boolean}
 */
function validatePNGSignature(bytes) {
  if (bytes.length < 8) return false

  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) {
      return false
    }
  }

  return true
}

/**
 * 读取 PNG 数据块
 * PNG 块结构: [长度(4)] [类型(4)] [数据(n)] [CRC(4)]
 * @param {Uint8Array} bytes - PNG 文件字节数组
 * @returns {Array<Object>} 数据块列表
 */
function readPNGChunks(bytes) {
  const chunks = []
  let offset = 8 // 跳过 PNG 签名

  while (offset < bytes.length) {
    // 读取块长度（大端序）
    if (offset + 12 > bytes.length) break

    const length =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]

    // 读取块类型
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    )

    // 读取块数据
    const dataStart = offset + 8
    const dataEnd = dataStart + length

    if (dataEnd > bytes.length) break

    const data = bytes.slice(dataStart, dataEnd)

    chunks.push({ type, length, data })

    // 移动到下一个块
    offset = dataEnd + 4 // +4 跳过 CRC

    // 遇到 IEND 块停止（优化：提前退出）
    if (type === 'IEND') {
      break
    }
  }

  return chunks
}

/**
 * 从数据块中提取角色数据
 * @param {Array<Object>} chunks - PNG 数据块列表
 * @returns {string|null} 角色数据字符串
 */
function extractCharacterData(chunks) {
  // 查找 tEXt 或 iTXt 块
  for (const chunk of chunks) {
    if (chunk.type === 'tEXt' || chunk.type === 'iTXt') {
      const rawData = extractFromTextChunk(chunk.data, chunk.type)
      if (rawData) {
        return rawData
      }
    }
  }

  return null
}

/**
 * 从 tEXt/iTXt 块提取数据
 * @param {Uint8Array} chunkData - 块数据
 * @param {string} chunkType - 'tEXt' 或 'iTXt'
 * @returns {string|null}
 */
function extractFromTextChunk(chunkData, chunkType) {
  try {
    // 查找第一个 null 字节（key 的结束）
    let nullIndex = 0
    while (nullIndex < chunkData.length && chunkData[nullIndex] !== 0) {
      nullIndex++
    }

    if (nullIndex >= chunkData.length) return null

    // 提取 key
    const key = new TextDecoder('latin1').decode(chunkData.slice(0, nullIndex))

    // 检查是否是角色数据的 key
    const validKeys = ['chara', 'character', 'Character', 'data']
    if (!validKeys.includes(key)) {
      return null
    }

    // 提取 value
    let valueText = ''

    if (chunkType === 'tEXt') {
      // tEXt: [key\0][value]
      valueText = new TextDecoder('utf-8').decode(chunkData.slice(nullIndex + 1))
    } else {
      // iTXt: [key\0][compression\0][method\0][language\0][translated\0][value]
      let p = nullIndex + 1

      // 跳过 compression flag
      if (p < chunkData.length) p++

      // 跳过 compression method
      while (p < chunkData.length && chunkData[p] !== 0) p++
      if (p < chunkData.length) p++

      // 跳过 language tag
      while (p < chunkData.length && chunkData[p] !== 0) p++
      if (p < chunkData.length) p++

      // 跳过 translated keyword
      while (p < chunkData.length && chunkData[p] !== 0) p++
      if (p < chunkData.length) p++

      // 剩余的就是 value
      valueText = new TextDecoder('utf-8').decode(chunkData.slice(p))
    }

    return valueText
  } catch (error) {
    console.error('[CharacterCard] 提取文本块数据失败:', error)
    return null
  }
}

/**
 * 解码 JSON 数据（支持 Base64）
 * @param {string} rawData - 原始数据字符串
 * @returns {Object} 解析后的 JSON 对象
 * @throws {CharacterCardError}
 */
function decodeJSON(rawData) {
  // 1. 尝试直接 JSON.parse
  try {
    const json = JSON.parse(rawData)
    return json
  } catch (e) {
    console.log('[CharacterCard] 直接 JSON 解析失败，尝试 Base64 解码')
  }

  // 2. 尝试 Base64 解码后再 parse
  try {
    const decoded = atob(rawData)
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0))
    const text = new TextDecoder('utf-8').decode(bytes)
    const json = JSON.parse(text)
    return json
  } catch (e) {
    console.error('[CharacterCard] Base64 解码失败:', e)
    throw new CharacterCardError(ErrorCodes.PARSE_ERROR, '角色卡数据格式错误，无法解析 JSON')
  }
}

/**
 * 标准化角色卡数据（识别版本）
 * @param {Object} jsonData - 解析后的 JSON 对象
 * @returns {Object} 标准化后的数据
 */
function normalizeCardData(jsonData) {
  // 检查是否是 V3 格式
  if (jsonData.spec === 'chara_card_v3' && jsonData.data) {
    return {
      spec: jsonData.spec,
      spec_version: jsonData.spec_version || '3.0',
      create_date: jsonData.create_date || '',
      data: ensureExtensions(jsonData.data),
    }
  }

  // V1/V2 格式
  return {
    spec: 'V1/V2',
    spec_version: '',
    create_date: '',
    data: ensureExtensions(jsonData),
  }
}

/**
 * 确保数据包含 extensions 字段
 * @param {Object} data - 角色数据
 * @returns {Object}
 */
function ensureExtensions(data) {
  if (!data.extensions) {
    data.extensions = {}
  }
  return data
}

/**
 * 验证 JSON 深度
 * @param {*} obj - 要验证的对象
 * @param {number} depth - 当前深度
 * @throws {CharacterCardError}
 */
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
