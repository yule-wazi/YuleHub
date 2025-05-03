import express from 'express'
import cors from 'cors'
import fetchProxy from './utils/utils.js'

const app = express()
const PORT = 3000

// 使用CORS中间件解决跨域问题
app.use(cors())

// 修改代理请求路由，使用封装的工具函数
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) {
    return res.status(400).send('缺少目标URL参数')
  }

  try {
    const data = await fetchProxy(targetUrl)
    res.send(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// 示例API路由
app.get('/api/data', (req, res) => {
  res.json({ message: '跨域请求成功！' })
})

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器正在运行，访问地址：http://localhost:${PORT}`)
})
