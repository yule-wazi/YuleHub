import { getCategoryNovel, getNewNovel, getNovelText } from '@/service/module/novel.js'
import { defineStore } from 'pinia'

const useNovel = defineStore('novelStore', {
  state: () => {
    return {
      scrollTop: 0,
      novelList: [],
      currentNovelDetail: {},
      novelText: '',
      novelTag: '',
      currentPage: 1,
    }
  },
  actions: {
    async getHomeNovel() {
      const res = await getNewNovel()
      this.novelList = res.data.novels
    },
    async fetchNovelText(id) {
      this.novelText = ''
      const res = await getNovelText(id)
      this.novelText = res.data.novel_text
    },
    async fetchCateNovel(word) {
      const res = await getCategoryNovel(word, this.currentPage)
      this.novelList.push(...res.data.novels)
    },
  },
})
export default useNovel
