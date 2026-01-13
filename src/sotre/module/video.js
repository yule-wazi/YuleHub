import {
  getVideoFeedList,
  getVideoList,
  searchVideo,
  getProxyVideoInfo,
  getAnimeType,
  getAnimeList,
} from '@/service/module/video'
import { defineStore } from 'pinia'

const useVideo = defineStore('videoStore', {
  state: () => {
    return {
      animeTypeList: [],
      animeList: [],
      categoryList: [], // 分类筛选后的列表

      videoList: [],
      videoFeedList: [],
      videoDetail: {},
      tagName: '',
      currentPage: 1,
      scrollTop: 0,
      baseUrl: 'cj.lziapi.com',
      isLoading: false,
    }
  },
  actions: {
    // 获取近一周动漫列表
    async fetchAnimeList(baseUrl) {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const res = await getAnimeType(baseUrl)
        const classList = res.data.data.class
        // 筛选出动漫类型
        const typeList = classList.filter((item) => item.type_name.indexOf('动漫') !== -1)
        this.animeTypeList = typeList
        // 前6天的完整24小时 + 今天从0点到现在的小时数
        const now = new Date()
        const hoursToday = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
        const h = Math.ceil(6 * 24 + hoursToday)

        const promises = this.animeTypeList.map(async (item) => {
          const params = `t=${item.type_id}&ac=detail&h=${h}`
          const res = await getAnimeList(baseUrl, params)
          return res.data.data.list || []
        })
        const results = await Promise.all(promises)
        this.animeList = results.flat()
      } catch (e) {
        console.error('获取动漫列表失败:', e)
      } finally {
        this.isLoading = false
      }
    },

    // 按分类获取视频列表
    // API参数说明:
    // ac=detail 获取详情列表
    // t=分类ID 筛选分类
    // pg=页码 分页
    // h=小时数 获取最近N小时更新的内容
    // wd=关键词 搜索
    async fetchByCategory(baseUrl, typeId, page = 1) {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const params = `ac=detail&t=${typeId}&pg=${page}`
        const res = await getAnimeList(baseUrl, params)
        if (page === 1) {
          this.categoryList = res.data.data.list || []
        } else {
          this.categoryList.push(...(res.data.data.list || []))
        }
      } catch (e) {
        console.error('获取分类列表失败:', e)
      } finally {
        this.isLoading = false
      }
    },

    // 搜索视频
    async searchVideoList({ isRefresh = false, keyword = '', page = this.currentPage } = {}) {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const params = `ac=detail&wd=${encodeURIComponent(keyword)}&pg=${page}`
        const res = await getAnimeList(this.baseUrl, params)
        let list = res.data.data.list || []
        // 筛选出非动漫视频
        list = list.filter((item) => item.type_name.indexOf('动漫') !== -1)
        if (isRefresh) {
          this.categoryList = list
        } else {
          this.categoryList.push(...list)
        }
      } catch (e) {
        console.error('搜索失败:', e)
      } finally {
        this.isLoading = false
      }
    },

    // 获取按星期几更新的列表
    getListByWeekday(weekday) {
      // weekday: 0=周日, 1=周一, ..., 6=周六
      return this.animeList.filter((item) => {
        if (!item.vod_time) return false
        const date = new Date(item.vod_time)
        return date.getDay() === weekday
      })
    },
  },
})
export default useVideo
