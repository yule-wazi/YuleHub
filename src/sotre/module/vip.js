import { defineStore } from 'pinia'
import {
  getAllPixivImg,
  postLoliconList,
  postNewVipList,
  postPixivRankList,
  postPixivSearchList,
} from '@/service/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { emunProxyUrl, switchProxyUrl } from '@/utils/ProxyUrl'
import { sortArray } from '@/utils/handleArray'
import myCache from '@/utils/cacheStorage'
import { filterComicsData } from '@/utils/filterData'
const useVip = defineStore('vip', {
  state: () => {
    return {
      scrollTop: 0,
      currentPage: 1,
      isVip: false,
      isFetch: false,
      fetchError: false,
      tagName: '',
      vipImgData: [],
      detailData: {},
      authorOtherImg: [],
      vipImgList: [],
      isNSFW: false,
    }
  },
  actions: {
    // 请求组图片
    async fetchGroupImgList({ isRefresh = false, options } = {}) {
      console.log('发起请求', options)
      const list = await postPixivRankList(options)
      console.log(list.data.illusts)
      const formatList = list.data.illusts.map((item) => {
        return {
          pid: item.id,
          uid: item.user.id,
          title: item.title,
          user: item.user.name,
          tags: item.tags,
          coverImg: item.image_urls,
          pageList: item.meta_pages,
          x_restrict: item.x_restrict,
        }
      })

      // const list = await postNewVipList(options)
      // const formatList = list.data

      // //LoliconAPI
      // const list = await postLoliconList(options)
      // // 格式化数据
      // const formatList = list.data.data.map((item) => {
      //   return {
      //     pid: item.pid,
      //     uid: item.uid,
      //     title: item.title,
      //     user: item.author,
      //     tags: item.tags,
      //     url: item.urls.small,
      //   }
      // })

      if (isRefresh) {
        this.vipImgData = formatList
      } else {
        this.vipImgData.push(...formatList)
      }
    },
    async fetchSearchImgList({ isRefresh = false, options } = {}) {
      const list = await postPixivSearchList(options)
      console.log(list.data.illusts)
      let formatList = list.data.illusts.map((item) => {
        return {
          pid: item.id,
          uid: item.user.id,
          title: item.title,
          user: item.user.name,
          tags: item.tags,
          coverImg: item.image_urls,
          pageList: item.meta_pages,
          x_restrict: item.x_restrict,
        }
      })
      formatList = filterComicsData(formatList)
      if (isRefresh) {
        this.vipImgData = formatList
      } else {
        this.vipImgData.push(...formatList)
      }
    },
    // 请求作者其他图片
    async fetchOtherImgList(uid) {
      const resList = await getAllPixivImg(uid)
      this.authorOtherImg = resList.map((item) => switchProxyUrl(item))
    },
  },
})
export default useVip
