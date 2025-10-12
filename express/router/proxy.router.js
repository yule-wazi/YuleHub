import express from 'express'
import fetchProxy from '../utils/utils.js'

const proxyRouter = express.Router()

proxyRouter.get('/', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) {
    return res.status(400).send('缺少目标URL参数')
  }
  try {
    const data = await fetchProxy(targetUrl)
    res.send(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

export default proxyRouter