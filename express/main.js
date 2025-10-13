import express from 'express'
import cors from 'cors'
import videoRouter from './router/video.router.js'
import proxyRouter from './router/proxy.router.js'
import handleError from './utils/handleError.js'
import { PORT } from './config/globalVar.js'


const app = express()


// 使用CORS中间件解决跨域问题
app.use(cors())
app.use('/video', videoRouter)
app.use('/proxy', proxyRouter)
app.use(handleError)

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器正在运行，访问地址：http://localhost:${PORT}`)
})
