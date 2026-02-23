export default async function handler(req, res) {
  const { url: targetUrl } = req.query

  if (!targetUrl) {
    return res.status(400).send('缺少目标URL参数')
  }

  try {
    const response = await fetch(targetUrl)

    if (!response.ok) {
      return res.status(response.status).send(`请求失败: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=31536000')

    res.send(Buffer.from(buffer))
  } catch (error) {
    res.status(500).send('代理请求失败: ' + error.message)
  }
}
