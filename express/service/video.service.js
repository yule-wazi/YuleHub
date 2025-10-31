import { LIMITSIZE, USE_MOCK } from '../config/globalVar.js'
import videoMockService from './video.mock.service.js'

// 是否使用mock数据（从配置文件读取，环境变量优先）
const USE_MOCK_MODE = USE_MOCK

// 延迟导入数据库连接（避免mock模式下尝试连接数据库导致错误）
let connection = null
const getConnection = async () => {
  if (!USE_MOCK_MODE && !connection) {
    try {
      const dbModule = await import('../database/database.js')
      connection = dbModule.default
    } catch (err) {
      console.error('数据库连接失败，请检查数据库配置或启用USE_MOCK=true', err)
    }
  }
  return connection
}

class VideoService {
  async list(offset) {
    if (USE_MOCK_MODE) {
      return videoMockService.list(offset)
    }
    try {
      const statement = `SELECT v.*, JSON_ARRAYAGG(l.name) labels FROM videolist v
        LEFT JOIN video_label vl ON v.id = vl.video_id
        LEFT JOIN label l ON vl.label_id = l.id
      GROUP BY v.id
      LIMIT ${LIMITSIZE} OFFSET ?;`
      const conn = await getConnection()
      if (!conn) throw new Error('数据库连接不可用')
      const [result] = await conn.execute(statement, [String(offset)])
      return result
    } catch (err) {
      console.log(err)
    }
  }
  async author(name) {
    if (USE_MOCK_MODE) {
      return videoMockService.author(name)
    }
    try {
      const statement = 'SELECT * FROM author WHERE name = ?;'
      const conn = await getConnection()
      if (!conn) throw new Error('数据库连接不可用')
      const [result] = await conn.execute(statement, [name])
      return result
    } catch (err) {
      console.log(err)
    }
  }
  async search(keyword, offset) {
    if (USE_MOCK_MODE) {
      return videoMockService.search(keyword, offset)
    }
    try {
      const statement = `SELECT v.*,JSON_ARRAYAGG(l.name) AS labels FROM videolist v
        LEFT JOIN video_label vl ON v.id = vl.video_id
        LEFT JOIN label l ON vl.label_id = l.id
      GROUP BY v.id
      HAVING JSON_SEARCH(labels, 'one', '%${keyword}%') IS NOT NULL
      LIMIT ${LIMITSIZE} OFFSET ?;`
      const conn = await getConnection()
      if (!conn) throw new Error('数据库连接不可用')
      const [result] = await conn.execute(statement, [String(offset)])
      return result || []
    } catch (err) {
      console.log(err)
      return []
    }
  }
  async count() {
    if (USE_MOCK_MODE) {
      return videoMockService.count()
    }
    try {
      const statement = 'SELECT COUNT(*) count FROM `videolist`;'
      const conn = await getConnection()
      if (!conn) throw new Error('数据库连接不可用')
      const [result] = await conn.execute(statement)
      return result[0]
    } catch (err) {
      console.log(err)
    }
  }
  async feed(limit) {
    if (USE_MOCK_MODE) {
      return videoMockService.feed(limit)
    }
    try {
      const statement = `
        SELECT v.*, JSON_ARRAYAGG(l.name) AS labels
          FROM videolist v
          LEFT JOIN video_label vl ON v.id = vl.video_id
          LEFT JOIN label l ON vl.label_id = l.id
        GROUP BY v.id
        ORDER BY RAND()
        LIMIT ?;`
      const conn = await getConnection()
      if (!conn) throw new Error('数据库连接不可用')
      const [result] = await conn.execute(statement, [limit])
      return result
    } catch (err) {
      console.log(err)
    }
  }
}

export default new VideoService()
