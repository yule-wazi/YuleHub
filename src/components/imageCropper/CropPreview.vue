<template>
  <div class="crop-preview">
    <div class="preview-label">
      {{ Math.round(cropData.width) }} × {{ Math.round(cropData.height) }}
      <span v-if="originalSize" class="original-size">({{ originalSize }})</span>
    </div>
    <div class="preview-container" ref="previewRef">
      <canvas ref="canvasRef" :style="canvasStyle"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import useCropStore from '@/sotre/module/crop'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
})

const cropStore = useCropStore()
const { cropData, imageSize } = storeToRefs(cropStore)

const previewRef = ref(null)
const canvasRef = ref(null)
const containerWidth = ref(0)
const containerHeight = ref(0)

// 计算原始尺寸
const originalSize = computed(() => {
  const img = cropStore.imageElement
  if (!img || !cropData.value.width || !cropData.value.height) {
    return ''
  }
  const scaleX = img.naturalWidth / imageSize.value.width
  const scaleY = img.naturalHeight / imageSize.value.height

  const originalWidth = Math.round(cropData.value.width * scaleX)
  const originalHeight = Math.round(cropData.value.height * scaleY)

  return `${originalWidth} × ${originalHeight}`
})

// 更新容器尺寸
const updateContainerSize = () => {
  if (previewRef.value) {
    containerWidth.value = previewRef.value.clientWidth
    containerHeight.value = previewRef.value.clientHeight
  }
}

// 更新Canvas预览
const updateCanvasPreview = () => {
  const canvas = canvasRef.value
  const img = cropStore.imageElement
  if (!canvas || !img || !cropData.value.width || !cropData.value.height) {
    return
  }

  const ctx = canvas.getContext('2d', { alpha: true })

  // 启用高质量图像平滑（预览时可以用）
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 设置Canvas尺寸
  canvas.width = Math.round(cropData.value.width)
  canvas.height = Math.round(cropData.value.height)

  // 计算裁剪区域在原始图片上的位置
  const scaleX = img.naturalWidth / imageSize.value.width
  const scaleY = img.naturalHeight / imageSize.value.height

  const sourceX = Math.round(cropData.value.x * scaleX)
  const sourceY = Math.round(cropData.value.y * scaleY)
  const sourceWidth = Math.round(cropData.value.width * scaleX)
  const sourceHeight = Math.round(cropData.value.height * scaleY)

  // 清空Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制裁剪后的图片
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
}

// Canvas样式
const canvasStyle = computed(() => {
  if (!cropData.value.width || !cropData.value.height) {
    return { display: 'none' }
  }
  return {
    border: '2px solid #a855f7',
    borderRadius: '4px',
    display: 'block',
  }
})
onMounted(() => {
  nextTick(() => {
    updateContainerSize()
  })
})
// 监听cropData变化，更新预览
watch(
  () => cropData.value,
  () => {
    if (containerWidth.value === 0 || containerHeight.value === 0) {
      nextTick(() => {
        updateContainerSize()
        updateCanvasPreview()
      })
    } else {
      updateCanvasPreview()
    }
  },
  { deep: true, immediate: true },
)

// 监听容器尺寸变化
watch([containerWidth, containerHeight], () => {
  updateCanvasPreview()
})
// 监听图片加载
watch(
  () => cropStore.imageElement,
  () => {
    if (cropStore.imageElement) {
      nextTick(() => {
        updateCanvasPreview()
      })
    }
  },
)
</script>

<style lang="less" scoped>
.crop-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  .preview-label {
    background: rgba(168, 85, 247, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 12px;
    .original-size {
      opacity: 0.8;
      font-size: 12px;
      margin-left: 4px;
    }
  }
  .preview-container {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    canvas {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
</style>
