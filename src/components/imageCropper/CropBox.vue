<template>
  <div class="crop-box" :style="boxStyle" @mousedown="onBoxMouseDown">
    <div class="size-label">
      {{ Math.round(cropData.width) }} × {{ Math.round(cropData.height) }}
    </div>
    <!-- 8个控制点 -->
    <div
      v-for="handle in handles"
      :key="handle.position"
      :class="['crop-handle', handle.position]"
      :style="{ cursor: handle.cursor }"
      @mousedown.stop="onHandleMouseDown($event, handle.position)"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import useCropStore from '@/sotre/module/crop'

const cropStore = useCropStore()
const { cropData, imageSize, imageOffset } = storeToRefs(cropStore)

const MIN_SIZE = 50

// 8个控制点配置
const handles = [
  { position: 'nw', cursor: 'nwse-resize' }, // 西北角
  { position: 'n', cursor: 'ns-resize' }, // 北边
  { position: 'ne', cursor: 'nesw-resize' }, // 东北角
  { position: 'e', cursor: 'ew-resize' }, // 东边
  { position: 'se', cursor: 'nwse-resize' }, // 东南角
  { position: 's', cursor: 'ns-resize' }, // 南边
  { position: 'sw', cursor: 'nesw-resize' }, // 西南角
  { position: 'w', cursor: 'ew-resize' }, // 西边
]

// 裁剪框样式（加上图片偏移量）
const boxStyle = computed(() => ({
  left: `${cropData.value.x + imageOffset.value.x}px`,
  top: `${cropData.value.y + imageOffset.value.y}px`,
  width: `${cropData.value.width}px`,
  height: `${cropData.value.height}px`,
}))

// 拖拽裁剪框
const onBoxMouseDown = (e) => {
  e.preventDefault()
  cropStore.setDragging(true)
  const startX = e.clientX - cropData.value.x
  const startY = e.clientY - cropData.value.y

  let rafId = null
  const onMouseMove = (e) => {
    if (!cropStore.isDragging || rafId) return
    rafId = requestAnimationFrame(() => {
      let newX = e.clientX - startX
      let newY = e.clientY - startY
      // 边界约束
      newX = Math.max(0, Math.min(newX, imageSize.value.width - cropData.value.width))
      newY = Math.max(0, Math.min(newY, imageSize.value.height - cropData.value.height))

      cropStore.updateCropData({ x: newX, y: newY })
      rafId = null
    })
  }
  const onMouseUp = () => {
    cropStore.setDragging(false)
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 调整裁剪框大小
const onHandleMouseDown = (e, position) => {
  e.preventDefault()
  cropStore.setResizing(true, position)

  const startX = e.clientX
  const startY = e.clientY
  const startCropData = { ...cropData.value }

  let rafId = null

  const onMouseMove = (e) => {
    if (!cropStore.isResizing || rafId) return
    rafId = requestAnimationFrame(() => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const newCropData = calculateResize(startCropData, deltaX, deltaY, position)
      cropStore.updateCropData(newCropData)
      rafId = null
    })
  }
  const onMouseUp = () => {
    cropStore.setResizing(false)
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 计算调整大小后的裁剪数据
const calculateResize = (start, deltaX, deltaY, handle) => {
  let { x, y, width, height } = start

  switch (handle) {
    case 'se': // 东南角
      width = Math.max(MIN_SIZE, width + deltaX)
      height = Math.max(MIN_SIZE, height + deltaY)
      break
    case 'nw': // 西北角
      const newWidth = Math.max(MIN_SIZE, width - deltaX)
      const newHeight = Math.max(MIN_SIZE, height - deltaY)
      x = x + (width - newWidth)
      y = y + (height - newHeight)
      width = newWidth
      height = newHeight
      break
    case 'ne': // 东北角
      width = Math.max(MIN_SIZE, width + deltaX)
      const newH = Math.max(MIN_SIZE, height - deltaY)
      y = y + (height - newH)
      height = newH
      break
    case 'sw': // 西南角
      const newW = Math.max(MIN_SIZE, width - deltaX)
      x = x + (width - newW)
      width = newW
      height = Math.max(MIN_SIZE, height + deltaY)
      break
    case 'n': // 北边
      const h = Math.max(MIN_SIZE, height - deltaY)
      y = y + (height - h)
      height = h
      break
    case 's': // 南边
      height = Math.max(MIN_SIZE, height + deltaY)
      break
    case 'e': // 东边
      width = Math.max(MIN_SIZE, width + deltaX)
      break
    case 'w': // 西边
      const w = Math.max(MIN_SIZE, width - deltaX)
      x = x + (width - w)
      width = w
      break
  }

  // 边界约束
  if (x < 0) {
    width += x
    x = 0
  }
  if (y < 0) {
    height += y
    y = 0
  }
  if (x + width > imageSize.value.width) width = imageSize.value.width - x
  if (y + height > imageSize.value.height) height = imageSize.value.height - y

  return { x, y, width, height }
}
</script>

<style lang="less" scoped>
.crop-box {
  position: absolute;
  border: 2px solid #a855f7;
  cursor: move;
  user-select: none;
  .size-label {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(168, 85, 247, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    pointer-events: none;
  }
  .crop-handle {
    position: absolute;
    background: #ffffff;
    border: 2px solid #a855f7;
    /* 角落控制点 */
    &.nw,
    &.ne,
    &.se,
    &.sw {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    &.nw {
      top: -6px;
      left: -6px;
    }
    &.ne {
      top: -6px;
      right: -6px;
    }
    &.se {
      bottom: -6px;
      right: -6px;
    }
    &.sw {
      bottom: -6px;
      left: -6px;
    }
    /* 边缘控制点 */
    &.n,
    &.s {
      width: 40px;
      height: 8px;
      border-radius: 4px;
      left: 50%;
      transform: translateX(-50%);
    }
    &.n {
      top: -4px;
    }
    &.s {
      bottom: -4px;
    }
    &.e,
    &.w {
      width: 8px;
      height: 40px;
      border-radius: 4px;
      top: 50%;
      transform: translateY(-50%);
    }
    &.e {
      right: -4px;
    }
    &.w {
      left: -4px;
    }
  }
}
</style>
