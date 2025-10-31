import videoService from '../service/video.service.js'
import getOffset from '../utils/getOffset.js'
import { shufflingList, shufflingPage } from '../utils/shuffling.js'
class VideoController {
  constructor() {
    this.storedPages = []
  }
  list = async (req, res, next) => {
    // 获取参数
    const { page } = req.query
    // 随机洗牌数据库数据下标
    if (!this.storedPages.length) {
      const { count } = await videoService.count()
      this.storedPages = shufflingPage(count)
    }
    if (!page) {
      next(-4001)
      return
    } else if (page > this.storedPages.length - 1) {
      next(-4002)
      return
    }
    const offset = getOffset(this.storedPages[page])
    const result = await videoService.list(offset)
    res.send({
      code: 0,
      result: shufflingList(result),
    })
  }
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
}
export default new VideoController()
