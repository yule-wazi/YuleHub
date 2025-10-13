import { LIMITSIZE } from '../config/globalVar.js'
import connection from '../database/database.js'

class VideoService {
  async list(offset) {
    try {
      const statement = `SELECT v.*, JSON_ARRAYAGG(l.name) labels FROM videolist v
        LEFT JOIN video_label vl ON v.id = vl.video_id
        LEFT JOIN label l ON vl.label_id = l.id
      GROUP BY v.id
      LIMIT ${LIMITSIZE} OFFSET ?;`
      const [result] = await connection.execute(statement, [String(offset)])
      return result
    } catch (err) {
      console.log(err)
    }
  }
  async author(name) {
    try {
      const statement = 'SELECT * FROM author WHERE name = ?;'
      const [result] = await connection.execute(statement, [name])
      return result
    } catch (err) {
      console.log(err)
    }
  }
  async search(keyword, offset) {
    try {
      const statement = `SELECT v.*,JSON_ARRAYAGG(l.name) AS labels FROM videolist v
        LEFT JOIN video_label vl ON v.id = vl.video_id
        LEFT JOIN label l ON vl.label_id = l.id
      GROUP BY v.id
      HAVING JSON_SEARCH(labels, 'one', '%${keyword}%') IS NOT NULL
      LIMIT ${LIMITSIZE} OFFSET ?;`
      const [result] = await connection.execute(statement, [String(offset)])
      return result
    } catch (err) {
      console.log(err)
    }
  }
  async count() {
    try {
      const statement = 'SELECT COUNT(*) count FROM `videolist`;'
      const [result] = await connection.execute(statement)
      return result[0]
    } catch(err) {
      console.log(err)
    }
  }
}

export default new VideoService()
