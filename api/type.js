export default async function handler(req, res) {
  const { baseUrl, params } = req.query

  if (!baseUrl) {
    return res.status(400).json({ error: '缺少baseUrl参数' })
  }

  try {
    const targetUrl = params
      ? `https://${baseUrl}/api.php/provide/vod?${params}`
      : `https://${baseUrl}/api.php/provide/vod`

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Referer: `https://${baseUrl}/`,
      },
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `请求失败: ${response.statusText}` })
    }

    const data = await response.json()

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=300')

    res.status(200).json({
      code: 0,
      data,
    })
  } catch (error) {
    res.status(500).json({ error: '代理请求失败: ' + error.message })
  }
}
