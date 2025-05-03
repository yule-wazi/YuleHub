import { defineStore } from 'pinia'
import { postVipList, postNewVipList, getAllPixivImg } from '@/service/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { emunProxyUrl } from '@/utils/ProxyUrl'
import { sortArray } from '@/utils/handleArray'
const useVip = defineStore('vip', {
  state: () => {
    return {
      isVip: false,
      vipImgList: [],
      showVipImgSrc: '',
    }
  },
  actions: {
    // 请求预加载图片
    async fetchImgList(uid) {
      const list = await getAllPixivImg(uid)
      for (const url of list) {
        let index = 0
        let preLoadPromises = []
        let imgList = []
        while (true) {
          const newUrl = emunProxyUrl(url, index)
          const preLoadPromise = new Promise((resolve, reject) => {
            const img = new Image()
            img.src = newUrl
            img.onload = () => {
              // console.log(`找到此页,${img.src}`)
              imgList.push(img.src)
              resolve()
            }
            img.onerror = () => {
              reject('end')
            }
          })
          preLoadPromises.push(preLoadPromise)
          index++
          if (index > 20) break
        }
        try {
          await Promise.all(preLoadPromises)
        } catch (error) {
          if (error === 'end') {
            console.log('当前作品加载完毕，进入下一个作品')
            this.vipImgList.push(...sortArray(imgList))
          }
        }
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
        timerId = setTimeout(switchImage, 5000)
      }
      switchImage()
      return () => {
        clearTimeout(timerId)
      }
    },
  },
})
export default useVip
