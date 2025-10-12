import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config({ path: './express/config/databaseConfig.env' })

// 1.创建连接池
const connectionPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
})

// 获取连接是否成功
connectionPool.getConnection((err, connection) => {
  // 判断是否有误
  if (err) {
    console.log('获取连接失败', err)
    return
  }
  connection.connect((err) => {
    if (err) {
      console.log('和数据库交互失败')
    } else {
      console.log('数据库连接成功')
    }
  })
})

const connection = connectionPool.promise()

export default connection
