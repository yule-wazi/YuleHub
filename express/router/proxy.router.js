import express from 'express'

const proxyRouter = express.Router()

proxyRouter.get('/', async (req, res) => {
  const targetUrl = req.query.url
  const format = req.query.format || 'base64' // 默认返回base64

  if (!targetUrl) {
    return res.status(400).json({ error: '缺少目标URL参数' })
  }

  try {
    // 动态导入node-fetch
    const { default: fetch } = await import('node-fetch')
    const response = await fetch(targetUrl)

    if (!response.ok) {
      return res.status(response.status).json({ error: `请求失败: ${response.statusText}` })
    }

    if (format === 'base64') {
      // 返回base64格式
      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const contentType = response.headers.get('content-type') || 'image/jpeg'
      const dataUrl = `data:${contentType};base64,${base64}`

      res.setHeader('Content-Type', 'application/json')
      res.json({ success: true, dataUrl, contentType })
    } else {
      // 返回原始数据
      const buffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'
      res.setHeader('Content-Type', contentType)
      res.send(Buffer.from(buffer))
    }
  } catch (error) {
    console.error('代理请求失败:', error)
    res.status(500).json({ error: '代理请求失败', message: error.message })
  }
})

export default proxyRouter
