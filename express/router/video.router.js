import express from 'express'
import VideoController from '../controller/video.controller.js'

const videoRouter = express.Router()
// 获取视频列表
videoRouter.get('/list', VideoController.list)
// 获取视频作者
videoRouter.get('/author', VideoController.author)
// 搜索视频
videoRouter.get('/search', VideoController.search)

export default videoRouter