import { defineStore } from 'pinia'
import { postVipList, postNewVipList, getAllPixivImg } from '@/service/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { emunProxyUrl } from '@/utils/ProxyUrl'
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
        while (true) {
          const newUrl = emunProxyUrl(url, index)
          console.log(`尝试加载图片: ${newUrl}`)
          try {
            await new Promise((resolve, reject) => {
              const img = new Image()
              img.src = newUrl
              img.onload = () => {
                this.vipImgList.push(img.src)
                resolve()
              }
              img.onerror = () => {
                console.log(`作品加载完成，共加载 ${index + 1} 页`)
                reject('end')
              }
            })
            index++
          } catch (error) {
            break
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
          index = (index + 1)
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
