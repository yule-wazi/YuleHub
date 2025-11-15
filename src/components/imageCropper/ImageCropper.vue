<template>
  <div class="image-cropper">
    <div class="cropper-canvas" ref="canvasRef">
      <img :src="imageUrl" @load="onImageLoad" @error="onImageError" />
      <div class="crop-overlay" :style="overlayStyle"></div>
      <CropBox v-if="isImageLoaded" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import useCropStore from '@/sotre/module/crop'
import CropBox from './CropBox.vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
})

const cropStore = useCropStore()
const canvasRef = ref(null)
const isImageLoaded = ref(false)

// 图片加载完成
const onImageLoad = (e) => {
  const img = e.target
  const canvas = canvasRef.value
  if (!canvas) return
  // 计算图片实际显示尺寸和偏移量（考虑 object-fit: contain）
  const { imageSize, imageOffset } = calculateImageSizeAndOffset(img, canvas)
  const containerSize = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  }
  // 初始化裁剪数据，传递图片元素用于Canvas裁剪
  cropStore.initCropData(imageSize, imageOffset, img, containerSize)
  isImageLoaded.value = true
}

// 计算图片在容器中的实际显示尺寸和偏移量
const calculateImageSizeAndOffset = (img, container) => {
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const imageAspect = img.naturalWidth / img.naturalHeight
  const containerAspect = containerWidth / containerHeight

  let displayWidth, displayHeight, offsetX, offsetY

  if (imageAspect > containerAspect) {
    // 图片更宽，以宽度为准
    displayWidth = containerWidth
    displayHeight = containerWidth / imageAspect
    offsetX = 0
    offsetY = (containerHeight - displayHeight) / 2
  } else {
    // 图片更高，以高度为准
    displayHeight = containerHeight
    displayWidth = containerHeight * imageAspect
    offsetX = (containerWidth - displayWidth) / 2
    offsetY = 0
  }

  return {
    imageSize: {
      width: displayWidth,
      height: displayHeight,
    },
    imageOffset: {
      x: offsetX,
      y: offsetY,
    },
  }
}

// 遮罩层样式
const overlayStyle = computed(() => {
  const { x, y, width, height } = cropStore.cropData
  const { x: offsetX, y: offsetY } = cropStore.imageOffset
  const actualX = x + offsetX
  const actualY = y + offsetY
  return {
    clipPath: `polygon(
      0 0, 100% 0, 100% 100%, 0 100%, 0 0,
      ${actualX}px ${actualY}px,
      ${actualX}px ${actualY + height}px,
      ${actualX + width}px ${actualY + height}px,
      ${actualX + width}px ${actualY}px,
      ${actualX}px ${actualY}px
    )`,
  }
})

// 图片加载失败
const onImageError = () => {
  ElMessage.error('图片加载失败，请重试')
  isImageLoaded.value = false
}
</script>

<style lang="less" scoped>
.image-cropper {
  width: 100%;
  height: 100%;
  position: relative;
  .cropper-canvas {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC);
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .crop-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      pointer-events: none;
    }
  }
}
</style>
