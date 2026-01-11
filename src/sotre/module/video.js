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

      videoList: [],
      videoFeedList: [],
      videoDetail: {},
      tagName: '',
      currentPage: 1,
      scrollTop: 0,
    }
  },
  actions: {
    // async fetchVideoList({ isRefresh = false, page = this.currentPage } = {}) {
    //   const res = await getVideoList(page)
    //   const list = res.data.result
    //   if (isRefresh) {
    //     this.videoList = this.filterList(list)
    //   } else {
    //     this.videoList.push(...this.filterList(list))
    //   }
    // },
    // async searchVideoList({ isRefresh = false, keyword = '', page = this.currentPage } = {}) {
    //   const res = await searchVideo(keyword, page)
    //   const list = res.data.result
    //   if (isRefresh) {
    //     this.videoList = this.filterList(list)
    //   } else {
    //     this.videoList.push(...this.filterList(list))
    //   }
    // },
    // async fetchVideoFeedList(limit = 20) {
    //   const res = await getVideoFeedList(limit)
    //   const list = res.data.result
    //   this.videoFeedList.push(...this.filterList(list))
    // },
    // async fetchProxyVideoInfo(source) {
    //   if (typeof source === 'string' && /^BV/i.test(source)) {
    //     try {
    //       const res = await getProxyVideoInfo(source)
    //       return res?.data?.data?.[0]?.video_url || source
    //     } catch (e) {
    //       return source
    //     }
    //   }
    //   return source
    // },
    // filterList(list) {
    //   // 填充空图片
    //   list.forEach((item) => {
    //     if (!item.videoImg) {
    //       item.videoImg =
    //         'https://i.pximg.org/img-master/img/2025/10/19/01/19/28/136438244_p0_master1200.jpg'
    //     }
    //   })

    //   return list
    // },

    // 获取近一周动漫列表
    async fetchAnimeList(baseUrl) {
      const res = await getAnimeType(baseUrl)
      const classList = res.data.data.class
      // 筛选出动漫类型
      const typeList = classList.filter((item) => item.type_name.indexOf('动漫') !== -1)
      this.animeTypeList = typeList
      // 前6天的完整24小时 + 今天从0点到现在的小时数
      const now = new Date()
      const hoursToday = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
      const h = Math.ceil(6 * 24 + hoursToday)

      this.animeTypeList.forEach(async (item) => {
        const params = `t=${item.type_id}&ac=detail&h=${h}`
        const res = await getAnimeList(baseUrl, params)
        this.animeList.push(...res.data.data.list)
      })
    },
  },
})
export default useVideo
