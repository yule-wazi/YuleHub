import videoService from '../service/video.service.js'
import getOffset from '../utils/getOffset.js'
import { shufflingList, shufflingPage } from '../utils/shuffling.js'
class VideoController {
  constructor() {
    this.storedPages = []
  }
  // list = async (req, res, next) => {
  //   // 获取参数
  //   const { page } = req.query
  //   // 随机洗牌数据库数据下标
  //   if (!this.storedPages.length) {
  //     const { count } = await videoService.count()
  //     this.storedPages = shufflingPage(count)
  //   }
  //   if (!page) {
  //     next(-4001)
  //     return
  //   } else if (page > this.storedPages.length - 1) {
  //     next(-4002)
  //     return
  //   }
  //   const offset = getOffset(this.storedPages[page])
  //   const result = await videoService.list(offset)
  //   res.send({
  //     code: 0,
  //     result: shufflingList(result),
  //   })
  // }
  async author(req, res, next) {
    const { name } = req.query
    const [result] = await videoService.author(name)
    res.send({
      code: 0,
      result,
    })
  }
  async search(req, res, next) {
    const { keyword, page } = req.query
    const pageNum = page ? parseInt(page) : 1
    const offset = getOffset(pageNum)
    const result = await videoService.search(keyword, offset)
    res.send({
      code: 0,
      result: result || [],
    })
  }
  async feed(req, res, next) {
    // 获取参数
    const { limit } = req.query
    const result = await videoService.feed(limit)
    res.send({
      code: 0,
      result,
    })
  }
  list = async (req, res) => {
    const baseUrl = req.query.baseUrl
    const params = req.query.params || ''
    if (!baseUrl) {
      console.error('没有传baseUrl')
    }
    try {
      const { default: fetch } = await import('node-fetch')

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
        console.error('请求失败:', response.status, response.statusText)
        return res.status(response.status).json({ error: `请求失败: ${response.statusText}` })
      }
      const data = await response.json()
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.send({
        code: 0,
        data,
      })
    } catch (error) {
      console.error('代理请求失败:', error.message)
      res.status(500).json({
        error: '代理请求失败: ' + error.message,
      })
    }
  }
}
export default new VideoController()
