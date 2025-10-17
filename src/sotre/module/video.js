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
        this.videoList = list
      } else {
        this.videoList.push(...list)
      }
    },
    async searchVideoList({ isRefresh = false, keyword = '', page = this.currentPage } = {}) {
      const res = await searchVideo(keyword, page)
      console.log(res.data.result)
      const list = res.data.result
      if (isRefresh) {
        this.videoList = list
      } else {
        this.videoList.push(...list)
      }
    },
    async fetchVideoFeedList(limit = 20) {
      const res = await getVideoFeedList(limit)
      const list = res.data.result
      this.videoFeedList.push(...list)
    },
  },
})
export default useVideo
