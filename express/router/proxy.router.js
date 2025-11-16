import express from 'express'

const proxyRouter = express.Router()

proxyRouter.get('/', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) {
    return res.status(400).send('缺少目标URL参数')
  }
  try {
    // 动态导入node-fetch
    const { default: fetch } = await import('node-fetch')

    const response = await fetch(targetUrl)

    if (!response.ok) {
      console.error('图片请求失败:', response.status, response.statusText)
      return res.status(response.status).send(`请求失败: ${response.statusText}`)
    }
    // 获取图片数据
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    // 直接返回图片数据
    res.setHeader('Content-Type', contentType)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('代理请求失败:', error)
    res.status(500).send('代理请求失败: ' + error.message)
  }
})

export default proxyRouter
