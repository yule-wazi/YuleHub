import { getVideoFeedList, getVideoList, searchVideo } from '@/service/module/video'
import { defineStore } from 'pinia'

const useVideo = defineStore('videoStore', {
  state: () => {
    return {
      videoList: [],
      videoFeedList: [],
      videoDetail: {},
      tagName: '',
      currentPage: 1,
      scrollTop: 0,
    }
  },
  actions: {
    async fetchVideoList({ isRefresh = false, page = this.currentPage } = {}) {
      const res = await getVideoList(page)
      const list = res.data.result
      if (isRefresh) {
        this.videoList = this.filterList(list)
      } else {
        this.videoList.push(...this.filterList(list))
      }
    },
    async searchVideoList({ isRefresh = false, keyword = '', page = this.currentPage } = {}) {
      const res = await searchVideo(keyword, page)
      const list = res.data.result
      if (isRefresh) {
        this.videoList = this.filterList(list)
      } else {
        this.videoList.push(...this.filterList(list))
      }
    },
    async fetchVideoFeedList(limit = 20) {
      const res = await getVideoFeedList(limit)
      const list = res.data.result
      this.videoFeedList.push(...this.filterList(list))
    },
    filterList(list) {
      // 填充空图片
      list.forEach((item) => {
        if(!item.videoImg) {
          item.videoImg = 'https://i.pximg.org/img-master/img/2025/10/19/01/19/28/136438244_p0_master1200.jpg'
        } 
      })

      return list
    }
  },
})
export default useVideo
