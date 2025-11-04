import { defineStore } from 'pinia'
import {
  getAllPixivImg,
  postPixivRankList,
  postPixivSearchList,
  postPixivMemberIllust,
} from '@/service/module/vip'
import { switchProxyUrl } from '@/utils/ProxyUrl'
import { filterComicsData } from '@/utils/filterData'
import { getYesterdayDate, getPreviousDate } from '@/utils/formatTime'
const useVip = defineStore('vip', {
  state: () => {
    return {
      scrollTop: 0,
      currentPage: 1,
      searchCurrentPage: 1,
      isVip: false,
      isFetch: false,
      fetchError: false,
      tagName: '',
      vipImgData: [],
      vipSearchImgData: [],
      detailData: {},
      authorOtherImg: [],
      isNSFW: false,
      validDate: null, // 存储有效的排名日期
    }
  },
  actions: {
    // 请求组图片
    async fetchGroupImgList({ isRefresh = false, options } = {}) {
      // 如果是刷新，重置有效日期；否则使用已存储的有效日期
      let currentDate = isRefresh ? getYesterdayDate() : this.validDate || getYesterdayDate()
      let list = null
      let attempts = 0
      const maxAttempts = 30
      while (attempts < maxAttempts) {
        try {
          list = await postPixivRankList({ page: this.currentPage }, currentDate)
          if (list.data.illusts && list.data.illusts.length > 0) {
            console.log(`成功获取数据，使用日期: ${currentDate}`)
            this.validDate = currentDate
            break
          }
          // 如果没有数据，往前回溯一天
          currentDate = getPreviousDate(currentDate, 1)
          this.currentPage = 1
          attempts++
        } catch (error) {
          console.error('请求失败:', error)
          break
        }
      }
      if (!list || !list.data.illusts || list.data.illusts.length === 0) {
        console.warn('未能获取到数据')
        return
      }
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
          width: item.width,
          height: item.height,
        }
      })
      if (isRefresh) {
        this.vipImgData = formatList
      } else {
        this.vipImgData.push(...formatList)
      }
    },
    async fetchSearchImgList({ isRefresh = false, options } = {}) {
      const list = await postPixivSearchList(options)
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
          width: item.width,
          height: item.height,
        }
      })
      formatList = filterComicsData(formatList)
      if (isRefresh) {
        this.vipSearchImgData = formatList
      } else {
        this.vipSearchImgData.push(...formatList)
      }
    },
    // 根据作者获取作品（优先使用 uid，若无则通过作者名搜索获取 uid 再查作品）
    async fetchAuthorIllustsList({ isRefresh = false, options } = {}) {
      // 使用 member_illust 接口直接获取作品列表
      const illustRes = await postPixivMemberIllust(options)
      const illusts = illustRes.data.illusts || []
      let formatList = illusts.map((item) => {
        return {
          pid: item.id,
          uid: item.user.id,
          title: item.title,
          user: item.user.name,
          tags: item.tags,
          coverImg: item.image_urls,
          pageList: item.meta_pages,
          x_restrict: item.x_restrict,
          width: item.width,
          height: item.height,
        }
      })
      formatList = filterComicsData(formatList)
      if (isRefresh) {
        this.vipSearchImgData = formatList
      } else {
        this.vipSearchImgData.push(...formatList)
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
