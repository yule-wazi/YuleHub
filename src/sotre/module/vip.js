import { defineStore } from 'pinia'
import { getAllPixivImg, postNewVipList } from '@/service/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { emunProxyUrl } from '@/utils/ProxyUrl'
import { sortArray } from '@/utils/handleArray'
import myCache from '@/utils/cacheStorage'
const useVip = defineStore('vip', {
  state: () => {
    return {
      isVip: false,
      isFetch: false,
      fetchError: false,
      tagName: '',
      vipImgData: [],
      detailData: {},
      vipImgList: [],
    }
  },
  actions: {
    // 请求组图片
    async fetchGroupImgList({ isRefresh = false, options } = {}) {
      console.log('发起请求', options)
      const list = await postNewVipList(options)
      if (isRefresh) {
        this.vipImgData = list.data
      } else {
        this.vipImgData.push(...list.data)
      }
    },
    // 请求预加载图片(pixiv)(弃用)
    async fetchImgList(uid) {
      const list = await getAllPixivImg(uid)
      this.fetchError = !(list.length > 0)
      this.isFetch = !this.fetchError
      if (this.isFetch) {
        myCache.set('usersUID', uid)
      }
      // 遍历作品
      for (const url of list) {
        let index = 0
        let preLoadPromises = []
        let imgList = []
        const PAGESIZE = 30
        //遍历当前作品页
        while (true) {
          const newUrl = emunProxyUrl(url, index)
          const preLoadPromise = new Promise((resolve) => {
            const img = new Image()
            img.src = newUrl
            img.onload = () => {
              console.log(`找到此页,${img.src}`)
              imgList.push(img.src)
              resolve()
            }
            img.onerror = () => {
              resolve()
            }
          })
          preLoadPromises.push(preLoadPromise)
          index++
          if (index > PAGESIZE) break
        }
        await Promise.all(preLoadPromises)
        console.log(`当前作品加载完毕进入下一个作品`)
        this.vipImgList.push(...sortArray(imgList))
      }
      console.log('所有图片加载完毕，再次请求新数据')
    },
    // 单张图片展示（弃用）
    getCurrentImg(uid) {
      if (!this.isVip) return
      this.fetchImgList(uid)
      let index = 0
      let timerId = null
      const switchImage = async () => {
        const currentImgSrc = this.vipImgList[index]
        if (currentImgSrc) {
          await preLoadImg(currentImgSrc)
          this.showVipImgSrc = currentImgSrc
          // console.log(index)
          index = index + 1
        }
        timerId = setTimeout(switchImage, 3000)
      }
      switchImage()
      return () => {
        clearTimeout(timerId)
      }
    },
  },
})
export default useVip
