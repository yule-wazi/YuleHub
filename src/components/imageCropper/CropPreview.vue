<template>
  <div class="crop-preview">
    <div class="preview-title">效果预览</div>
    <div class="preview-label">
      {{ Math.round(cropData.width) }} × {{ Math.round(cropData.height) }}
      <span v-if="originalSize" class="original-size">({{ originalSize }})</span>
    </div>
    <div class="preview-container" ref="previewRef">
      <div class="preview-wrapper" :style="previewWrapperStyle">
        <img :src="imageUrl" :style="previewImageStyle" />
      </div>
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
const { cropData, imageSize, imageOffset } = storeToRefs(cropStore)

const previewRef = ref(null)
const containerWidth = ref(0)
const containerHeight = ref(0)

// 更新容器尺寸
const updateContainerSize = () => {
  if (previewRef.value) {
    containerWidth.value = previewRef.value.clientWidth
    containerHeight.value = previewRef.value.clientHeight
  }
}

// 计算原始尺寸（下载时的实际尺寸）
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

// 缩放预览图比例
const scale = 0.85

// 预览容器样式
const previewWrapperStyle = computed(() => {
  if (
    !cropData.value.width ||
    !cropData.value.height ||
    !containerWidth.value ||
    !containerHeight.value
  ) {
    return { display: 'none' }
  }

  // 计算缩放比例，让预览稍微小一点（80%），但不超过容器大小
  const previewScale = Math.min(
    (containerWidth.value * scale) / cropData.value.width,
    (containerHeight.value * scale) / cropData.value.height,
    scale, // 最多显示80%大小
  )

  return {
    width: `${cropData.value.width * previewScale}px`,
    height: `${cropData.value.height * previewScale}px`,
    overflow: 'hidden',
    position: 'relative',
  }
})

// 预览图片样式
const previewImageStyle = computed(() => {
  if (
    !cropData.value.width ||
    !cropData.value.height ||
    !imageSize.value.width ||
    !containerWidth.value ||
    !containerHeight.value
  ) {
    return { display: 'none' }
  }

  // 使用相同的缩放比例
  const previewScale = Math.min(
    (containerWidth.value * scale) / cropData.value.width,
    (containerHeight.value * scale) / cropData.value.height,
    scale,
  )

  return {
    width: `${imageSize.value.width * previewScale}px`,
    height: `${imageSize.value.height * previewScale}px`,
    transform: `translate(${-cropData.value.x * previewScale}px, ${-cropData.value.y * previewScale}px)`,
    transformOrigin: 'top left',
    display: 'block',
  }
})
onMounted(() => {
  nextTick(() => {
    updateContainerSize()
  })
})
// 监听cropData变化，确保容器尺寸已更新
watch(
  () => cropData.value,
  () => {
    if (containerWidth.value === 0 || containerHeight.value === 0) {
      nextTick(() => {
        updateContainerSize()
      })
    }
  },
  { deep: true, immediate: true },
)
</script>

<style lang="less" scoped>
.crop-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  .preview-title {
    position: absolute;
    top: 10px;
    left: 10px;
    color: var(--comics-cardText-color);
    font-size: 16px;
    font-weight: 700;
  }
  .preview-label {
    position: absolute;
    z-index: 9;
    top: 10px;
    right: 40px;
    background-color: var(--primary-pink-color);
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
    .preview-wrapper {
      border: 2px solid var(--primary-pink-color);
      border-radius: 4px;
      overflow: hidden;
      img {
        display: block;
      }
    }
  }
}
</style>
