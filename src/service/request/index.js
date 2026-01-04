import axios from 'axios'
import { TimeOut } from './config'
import myLocalCache from '@/utils/cacheStorage'
class MyRequest {
  constructor(timeOut) {
    this.instance = axios.create({
      baseURL: '',
      timeOut,
    })
    this.token = ''
    this.instance.interceptors.request.use((config) => {
      const token = this.token
      token ? (config.headers.Authorization = `Bearer ${token}`) : ''
      return config
    })

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 检查响应数据中是否有x_restrict字段
        if (response.data) {
          if (Array.isArray(response.data.illusts) && !myLocalCache.get('isNSFW')) {
            response.data.illusts = response.data.illusts.filter((item) => {
              if (item.x_restrict === 1 || item.sanity_level > 2) {
                return false
              }
              return true
            })
          }
        }

        return response
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }

  // 动态设置baseUrl
  setBaseUrl(baseURL) {
    this.instance.defaults.baseURL = baseURL
  }
  // 动态设置token
  setToken(token) {
    this.token = token
  }
  request(config) {
    return new Promise((resolve, reject) => {
      this.instance
        .request(config)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  get(config) {
    return this.request({ ...config, method: 'get' })
  }
  post(config) {
    return this.request({ ...config, method: 'post' })
  }
}

export default new MyRequest(TimeOut)
