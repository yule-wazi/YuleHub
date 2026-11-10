import { defineStore } from 'pinia'
import {
  getPixivSearchList,
  getPixivMemberIllust,
  getPixivRankList,
  getPixivImgDetail,
  getPixivArtistDetail,
  getPixivRelatedImg,
} from '@/service/module/vip'
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
      detailDataAll: {},
      authorDetail: {},
      currentDetailShowImg: '',
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
          list = await getPixivRankList({ page: this.currentPage }, currentDate)
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
      const list = await getPixivSearchList(options)
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
      const illustRes = await getPixivMemberIllust(options)
      const artistRes = await getPixivArtistDetail(options.id)
      this.authorDetail = { ...artistRes.data.user, ...artistRes.data.profile }
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
    // 获取详情页数据集合（旧方法，保留兼容性）
    async fetchImgDetailAll(pid, uid) {
      const [imgRes, artistRes, moreImgRes, moreRelatedImgRes] = await Promise.all([
        getPixivImgDetail(pid),
        getPixivArtistDetail(uid),
        getPixivMemberIllust({ id: uid, page: 1 }),
        getPixivRelatedImg(pid, 1),
      ])
      const { name, account, profile_image_urls } = artistRes.data.user
      const { total_illusts, total_follow_users, total_mypixiv_users } = artistRes.data.profile
      const {
        id,
        image_urls,
        meta_pages,
        total_view,
        total_bookmarks,
        total_comments,
        title,
        caption,
        create_date,
        tags,
        width,
        height,
        type,
        x_restrict,
        sanity_level,
      } = imgRes.data.illust
      const { illusts } = moreRelatedImgRes.data

      this.detailDataAll.moreImgFromArtist = moreImgRes.data.illusts.slice(0, 6)
      this.detailDataAll.artistDetail = {
        id: uid,
        name,
        account,
        profile_image_urls,
        total_illusts,
        total_follow_users,
        total_mypixiv_users,
      }
      this.authorDetail = { ...artistRes.data.user, ...artistRes.data.profile }
      this.detailDataAll.imgDetail = {
        pid: id,
        uid: uid,
        artist: name,
        coverImg: image_urls,
        pageList: meta_pages,
        total_view,
        total_bookmarks,
        total_comments,
        title,
        caption,
        create_date,
        tags,
        width,
        height,
        type,
        x_restrict,
        sanity_level,
      }
      // 将 relatedImgList 改为对象结构，包含 list 和 page
      this.detailDataAll.relatedImgList = {
        list: illusts,
        page: 1,
      }
    },
    // 【优化】获取核心详情数据（作品详情 + 作者详情）
    async fetchImgDetailCore(pid, uid) {
      try {
        const imgRes = await getPixivImgDetail(pid)
        const {
          id,
          image_urls,
          meta_pages,
          total_view,
          total_bookmarks,
          total_comments,
          title,
          caption,
          create_date,
          tags,
          width,
          height,
          type,
          x_restrict,
          sanity_level,
          user,
        } = imgRes.data.illust

        // 立即更新作品详情
        this.detailDataAll.imgDetail = {
          pid: id,
          uid: uid,
          artist: user.name,
          coverImg: image_urls,
          pageList: meta_pages,
          total_view,
          total_bookmarks,
          total_comments,
          title,
          caption,
          create_date,
          tags,
          width,
          height,
          type,
          x_restrict,
          sanity_level,
        }

        return imgRes
      } catch (error) {
        console.error('获取作品详情失败:', error)
        throw error
      }
    },
    // 【优化】获取作者详情
    async fetchArtistDetail(uid) {
      try {
        const artistRes = await getPixivArtistDetail(uid)
        const { name, account, profile_image_urls } = artistRes.data.user
        const { total_illusts, total_follow_users, total_mypixiv_users } = artistRes.data.profile

        // 立即更新作者详情
        this.detailDataAll.artistDetail = {
          id: uid,
          name,
          account,
          profile_image_urls,
          total_illusts,
          total_follow_users,
          total_mypixiv_users,
        }
        this.authorDetail = { ...artistRes.data.user, ...artistRes.data.profile }

        return artistRes
      } catch (error) {
        console.error('获取作者详情失败:', error)
        throw error
      }
    },
    // 【优化】获取作者更多作品
    async fetchArtistMoreWorks(uid) {
      try {
        const moreImgRes = await getPixivMemberIllust({ id: uid, page: 1 })
        this.detailDataAll.moreImgFromArtist = moreImgRes.data.illusts.slice(0, 6)
        return moreImgRes
      } catch (error) {
        console.error('获取作者更多作品失败:', error)
        // 失败不阻塞，返回空数组
        this.detailDataAll.moreImgFromArtist = []
        return null
      }
    },
    // 【优化】初始化相关作品（第一页）
    async fetchRelatedImgInit(pid) {
      try {
        const relatedImgRes = await getPixivRelatedImg(pid, 1)
        const { illusts } = relatedImgRes.data

        this.detailDataAll.relatedImgList = {
          list: illusts,
          page: 1,
        }
        return relatedImgRes
      } catch (error) {
        console.error('获取相关作品失败:', error)
        // 失败不阻塞，返回空数组
        this.detailDataAll.relatedImgList = {
          list: [],
          page: 1,
        }
        return null
      }
    },
    // 获取相关作品（支持加载更多）
    async fetchRelatedImgList({ isRefresh = false, pid } = {}) {
      // 如果没有初始化，先初始化
      if (!this.detailDataAll.relatedImgList) {
        this.detailDataAll.relatedImgList = {
          list: [],
          page: 1,
        }
      }
      // 基于当前 page 请求下一页
      const currentPage = isRefresh ? 1 : this.detailDataAll.relatedImgList.page + 1
      const res = await getPixivRelatedImg(pid, currentPage)
      const illusts = res.data.illusts || []

      if (isRefresh) {
        // 刷新：重置数据
        this.detailDataAll.relatedImgList = {
          list: illusts,
          page: 1,
        }
      } else {
        // 追加数据
        this.detailDataAll.relatedImgList.list.push(...illusts)
        this.detailDataAll.relatedImgList.page = currentPage
      }
    },
  },
})
export default useVip
