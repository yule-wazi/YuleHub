class VideoMiddleware {
  search(req, res, next) {
    const { keyword, page } = req.query
    // 检查必需参数
    if (!keyword) {
      next(-4001)
      return
    }
    // 如果没有传page，默认为1
    const pageNum = page ? parseInt(page) : 1
    if (isNaN(pageNum) || pageNum < 1) {
      next(-4001)
      return
    }
    req.query.pageNum = pageNum
    next()
  }
}

export default new VideoMiddleware()
