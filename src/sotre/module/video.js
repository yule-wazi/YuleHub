import { getVideoList, searchVideo } from '@/service/module/video'
import { defineStore } from 'pinia'

const useVideo = defineStore('videoStore', {
  state: () => {
    return {
      videoList: [],
      videoDetail: {},
      tagName: '',
      currentPage: 1,
      scrollTop: 0,
    }
  },
  actions: {
    async fetchVideoList(page) {
      const res = await getVideoList(page)
      this.videoList = res.data.result
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
  },
})
export default useVideo
