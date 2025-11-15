import { defineStore } from 'pinia'
import { PORT } from '../../../express/config/globalVar'
const HOST = import.meta.env.VITE_HOST || 'localhost'

const useCropStore = defineStore('crop', {
  state: () => {
    return {
      // 图片信息
      imageUrl: '',
      imageSize: {
        width: 0,
        height: 0,
      },
      // 图片偏移量（居中显示时的偏移）
      imageOffset: {
        x: 0,
        y: 0,
      },
      // 原始图片元素（用于Canvas裁剪）
      imageElement: null,
      // 容器尺寸
      containerSize: {
        width: 0,
        height: 0,
      },

      // 裁剪数据
      cropData: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },

      // 交互状态
      isDragging: false,
      isResizing: false,
      resizeHandle: null,
    }
  },

  actions: {
    // 初始化裁剪数据
    initCropData(imageSize, imageOffset, imageElement, containerSize) {
      this.imageSize = imageSize
      this.imageOffset = imageOffset
      this.imageElement = imageElement
      this.containerSize = containerSize
      this.cropData = {
        x: imageSize.width * 0.25,
        y: imageSize.height * 0.25,
        width: imageSize.width * 0.5,
        height: imageSize.height * 0.5,
      }
    },
    // 更新裁剪数据
    updateCropData(data) {
      this.cropData = { ...this.cropData, ...data }
    },
    // 设置拖拽状态
    setDragging(isDragging) {
      this.isDragging = isDragging
    },
    // 设置调整大小状态
    setResizing(isResizing, handle = null) {
      this.isResizing = isResizing
      this.resizeHandle = handle
    },
    // 重置状态
    reset() {
      this.cropData = { x: 0, y: 0, width: 0, height: 0 }
      this.isDragging = false
      this.isResizing = false
      this.resizeHandle = null
      this.imageElement = null
    },

    // 获取裁剪后的图片（返回Canvas或Blob）
    async getCroppedImage(format = 'blob', useOriginalQuality = true) {
      if (!this.imageElement) {
        throw new Error('图片未加载')
      }
      // 计算裁剪区域在原始图片上的位置
      const scaleX = this.imageElement.naturalWidth / this.imageSize.width
      const scaleY = this.imageElement.naturalHeight / this.imageSize.height
      const sourceX = Math.round(this.cropData.x * scaleX)
      const sourceY = Math.round(this.cropData.y * scaleY)
      const sourceWidth = Math.round(this.cropData.width * scaleX)
      const sourceHeight = Math.round(this.cropData.height * scaleY)

      // 直接使用fetch重新加载图片，避免CORS问题
      const img = await this.loadImageWithFetch(this.imageElement.src)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { alpha: true })

      // 禁用图像平滑，保持像素完美
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // 设置Canvas尺寸为裁剪区域的原始尺寸（整数像素）
      canvas.width = sourceWidth
      canvas.height = sourceHeight

      // 绘制裁剪后的图片
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight,
      )
      if (format === 'blob') {
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas转换失败'))
            }
          }, 'image/png')
        })
      } else if (format === 'dataURL') {
        return canvas.toDataURL('image/png')
      } else if (format === 'canvas') {
        return canvas
      }
    },
    // 通过后端代理加载图片（解决CORS问题）
    async loadImageWithFetch(url) {
      console.log('通过代理加载图片:', url)
      const proxyUrl = `http://${HOST}:${PORT}/proxy?url=${encodeURIComponent(url)}&format=base64`
      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`代理请求失败: ${response.status}`)
      }
      const data = await response.json()
      if (!data.success || !data.dataUrl) {
        throw new Error('代理返回数据格式错误')
      }
      // 使用base64 dataURL创建图片
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = data.dataUrl
        img.onload = () => {
          resolve(img)
        }
        img.onerror = () => {
          reject(new Error('base64图片加载失败'))
        }
      })
    },

    // 下载裁剪后的图片
    async downloadCroppedImage(filename = 'cropped-image.png') {
      try {
        const blob = await this.getCroppedImage('blob')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载失败:', error)
        throw error
      }
    },
  },
})

export default useCropStore
