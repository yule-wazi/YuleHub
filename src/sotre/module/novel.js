import { getCategoryNovel, getNewNovel, getNovelText } from '@/service/module/novel.js'
import { filterNovelData } from '@/utils/filterData'
import { defineStore } from 'pinia'
import myCache from '@/utils/cacheStorage'

const useNovel = defineStore('novelStore', {
  state: () => {
    return {
      scrollTop: 0,
      novelList: [],
      currentNovelDetail: {},
      novelText: '',
      novelTag: '',
      currentPage: 1,
      isAudioBookMode: myCache.get('isAudioBookMode') ?? false, // 听书模式，从缓存读取
      currentTTSProcessor: null, // 当前的 TTS 处理器实例
      currentPlayingNovelId: null, // 当前正在播放的小说 ID
    }
  },
  actions: {
    async getHomeNovel() {
      const res = await getNewNovel()
      this.novelList = filterNovelData(res.data.novels)
    },
    async fetchNovelText(id) {
      this.novelText = ''
      const res = await getNovelText(id)
      this.novelText = res.data.novel_text
    },
    async fetchCateNovel(word) {
      const res = await getCategoryNovel(word, this.currentPage)
      this.novelList.push(...filterNovelData(res.data.novels))
    },
    // 停止当前播放
    stopCurrentTTS() {
      if (this.currentTTSProcessor) {
        console.log('⏹️ 停止当前播放的小说')
        this.currentTTSProcessor.stop()
        this.currentTTSProcessor.cleanup()
        this.currentTTSProcessor = null
        this.currentPlayingNovelId = null
      }
    },
    // 设置当前 TTS 处理器
    setCurrentTTS(processor, novelId) {
      // 如果有正在播放的，先停止
      if (this.currentTTSProcessor && this.currentPlayingNovelId !== novelId) {
        this.stopCurrentTTS()
      }
      this.currentTTSProcessor = processor
      this.currentPlayingNovelId = novelId
    },
  },
})
export default useNovel
