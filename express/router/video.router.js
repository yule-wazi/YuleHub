import express from 'express'
import VideoController from '../controller/video.controller.js'
import VideoMiddleware from '../middleware/video.middleware.js'

const videoRouter = express.Router()
// 获取视频列表
videoRouter.get('/list', VideoController.list)
// 获取视频作者
videoRouter.get('/author', VideoController.author)
// 搜索视频
videoRouter.get('/search', VideoMiddleware.search, VideoController.search)
// 获取竖屏视频列表
videoRouter.get('/feed', VideoController.feed)

export default videoRouter
