import { defineStore } from 'pinia'
import { postVipList, postNewVipList } from '@/service/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
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
    async fetchImgList() {
      let list = []
      // const res = await postVipList()
      // const dataList = res.data.data
      // console.log(dataList)
      // dataList.map((item) => {
      //   item.urlsList.map((subItem) => {
      //     list.push(subItem.url)
      //   })
      // })
      const res = await postNewVipList()
      const dataList = res.data
      console.log(dataList)
      dataList.map((item) => {
        list.push(item.url)
      })

      const promises = list.map((url) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.src = url
          img.onload = () => {
            this.vipImgList.push(img.src)
            // console.log(`图片解析完成${img.src}`)
            resolve()
          }
          img.onerror = () => {
            // console.log(`图片解析失败${img.src}`)
            resolve()
          }
        })
      })
      await Promise.all(promises)
      console.log('所有图片加载完毕，再次请求新数据')
    },
    getCurrentImg() {
      if (!this.isVip) return
      for (let i = 0; i < 1; i++) {
        this.fetchImgList()
      }
      let index = 0
      let timerId = null
      const switchImage = async () => {
        const currentImgSrc = this.vipImgList[index]
        if (currentImgSrc) {
          await preLoadImg(currentImgSrc)
          this.showVipImgSrc = currentImgSrc
          console.log(index)
          index = (index + 1) % this.vipImgList.length
        }
        timerId = setTimeout(switchImage, 2000)
      }
      switchImage()
      return () => {
        clearTimeout(timerId)
      }
    },
  },
})
export default useVip
