import { getCategoryNovel, getNewNovel, getNovelText } from '@/service/module/novel.js'
import { defineStore } from 'pinia'

const useNovel = defineStore('novelStore', {
  state: () => {
    return {
      novelList: [],
      currentNovelDetail: {},
      novelText: '',
      novelTag: '',
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
    async fetchCateNovel(word, page) {
      console.log('page=', page, 'word=', word)
      const res = await getCategoryNovel(word, page)
      this.novelList.push(...res.data.novels)
    },
  },
})
export default useNovel
