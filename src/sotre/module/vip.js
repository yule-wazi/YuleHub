import { defineStore } from 'pinia'
import { getAllPixivImg } from '@/service/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { emunProxyUrl } from '@/utils/ProxyUrl'
import { sortArray } from '@/utils/handleArray'
const useVip = defineStore('vip', {
  state: () => {
    return {
      isVip: false,
      isFetch: false,
      vipImgList: [],
    }
  },
  actions: {
    // 请求预加载图片
    async fetchImgList(uid) {
      const list = await getAllPixivImg(uid)
      this.isFetch = true
      for (const url of list) {
        let index = 0
        let preLoadPromises = []
        let imgList = []
        const PAGESIZE = 30
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
