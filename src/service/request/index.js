import axios from "axios";
import { BaseUrl, TimeOut } from "./config";
class MyRequest {
  constructor(baseUrl, timeOut) {
    this.instance = axios.create({
      baseURL: baseUrl || "",
      timeOut
    })
    this.token = ""
    this.instance.interceptors.request.use((config) => {
      const token = this.token
      token ? config.headers.Authorization = `Bearer ${token}`: '';
      return config;
    });
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
      this.instance.request(config).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
  get(config)  {
    return this.request({...config, method: "get"})
  }
  post(config) {
    return this.request({...config, method: "post"})
  }
}

export default new MyRequest(BaseUrl, TimeOut)