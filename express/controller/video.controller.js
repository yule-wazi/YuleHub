import videoService from '../service/video.service.js'
import getOffset from '../utils/getOffset.js'
class VideoController {
  async list(req, res, next) {
    // 获取参数
    const { page } = req.query
    const offset = getOffset(page)
    if (!page) {
      next(-4001)
      return
    }
    const result = await videoService.list(offset)
    res.send({
      code: 0,
      result,
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
    const offset = getOffset(page)
    const result = await videoService.search(keyword, offset)
    res.send({
      code: 0,
      result,
    })
  }
}
export default new VideoController()
