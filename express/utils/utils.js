// 新建一个工具函数文件 utils.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

async function fetchProxy(targetUrl) {
  try {
    const response = await fetch(targetUrl)
    return await response.text()
  } catch (error) {
    throw new Error('代理请求失败')
  }
}

export default fetchProxy
