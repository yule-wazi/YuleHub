import {
  getCategoryDetail,
  getPicaDetail,
  getPicaPage,
  getPicaSeries,
  searchPica,
} from '@/service/module/pica'
import { defineStore } from 'pinia'
import myCache from '@/utils/cacheStorage'

export const tagList = [
  'Cosplay',
  '大家都在看',
  '大濕推薦',
  '官方都在看',
  'CG雜圖',
  '全彩',
  '長篇',
  '短篇',
  '單行本',
  'WEBTOON',
  '純愛',
  '後宮閃光',
  '百合花園',
  '耽美花園',
  '偽娘哲學',
  '扶他樂園',
  '姐姐系',
  '妹妹系',
  '人妻',
  '非人類',
  '性轉換',
  '足の恋',
  'SM',
  'NTR',
  '強暴',
  '重口地帶',
  '同人',
  '圓神領域',
  '艦隊收藏',
  'Love Live',
  'SAO 刀劍神域',
  'Fate',
  '東方',
  '禁書目錄',
  '嗶咔漢化',
  '生肉',
  '英語 ENG',
  '歐美',
]

const usePica = defineStore('pica', {
  state: () => {
    return {
      scrollTop: 0,
      mostLike: false,
      tagList,
      currentCategoryName: tagList[0],
      categoryList: [],
      picaSearchList: [],
      searchCurrentPage: 1,
      picaDetail: {},
      pageList: [],
      picaSeries: [],
      picaOrder: 1,
      totalCount: 0,
      currentPage: 1,
      tagName: '',
    }
  },
  actions: {
    async fetchCategoryDetail({
      isRefresh = false,
      category = this.currentCategoryName,
      page = this.currentPage,
    } = {}) {
      const res = await getCategoryDetail(category, page)
      let list = res.data.data.comics.docs
      const isNSFW = myCache.get('isNSFW')
      if (category === 'Cosplay' && isNSFW) {
        list = list.filter((item) => {
          if (!item.tags.includes('無H內容')) {
            return item
          }
        })
      }
      if (isRefresh) {
        this.categoryList = list
      } else {
        this.categoryList.push(...list)
      }
    },
    async searchPicaList({ isRefresh = false, keyword = '', page = this.searchCurrentPage } = {}) {
      const res = await searchPica(keyword, page)
      const list = res.data.data.comics.docs
      if (isRefresh) {
        this.picaSearchList = list
      } else {
        this.picaSearchList.push(...list)
      }
    },
    fetchPicaPage({ isRefresh = false, id, page = 1, order = 1 }) {
      return new Promise(async (resolve) => {
        const res = await getPicaPage(id, page, order)
        this.totalCount = res.data.data.pages.total
        if (isRefresh) {
          this.pageList = res.data.data.pages.docs
        } else {
          this.pageList.push(...res.data.data.pages.docs)
        }
        resolve(res)
      })
    },
    fetchPicaDetail(id) {
      return new Promise(async (resolve) => {
        const res = await getPicaDetail(id)
        this.picaDetail = res.data.data.comic
        resolve(res)
      })
    },
    fetchPicaSeries(id) {
      return new Promise(async (resolve) => {
        const res = await getPicaSeries(id)
        this.picaSeries = res.data.data.eps.docs
        resolve(res)
      })
    },
  },
})
export default usePica
