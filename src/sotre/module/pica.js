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
  'CG雜圖',
  '全彩',
  '長篇',
  '同人',
  '短篇',
  '純愛',
  '百合花園',
  '偽娘哲學',
  '後宮閃光',
  '扶他樂園',
  '單行本',
  'SM',
  '性轉換',
  '足の恋',
  '人妻',
  'NTR',
  '強暴',
  '艦隊收藏',
  '重口地帶',
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
