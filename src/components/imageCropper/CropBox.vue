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
  const maintainRatio = cropStore.maintainRatio
  const aspectRatio = cropStore.aspectRatio

  // 角落控制点：同时调整宽高
  if (['nw', 'ne', 'se', 'sw'].includes(handle)) {
    if (maintainRatio && aspectRatio) {
      // 等比缩放：根据主要拖拽方向决定
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)

      if (handle === 'se') {
        if (isHorizontal) {
          width = Math.max(MIN_SIZE, width + deltaX)
          height = Math.max(MIN_SIZE, width / aspectRatio)
        } else {
          height = Math.max(MIN_SIZE, height + deltaY)
          width = Math.max(MIN_SIZE, height * aspectRatio)
        }
      } else if (handle === 'nw') {
        if (isHorizontal) {
          const newWidth = Math.max(MIN_SIZE, width - deltaX)
          const newHeight = Math.max(MIN_SIZE, newWidth / aspectRatio)
          x = x + (width - newWidth)
          y = y + (height - newHeight)
          width = newWidth
          height = newHeight
        } else {
          const newHeight = Math.max(MIN_SIZE, height - deltaY)
          const newWidth = Math.max(MIN_SIZE, newHeight * aspectRatio)
          x = x + (width - newWidth)
          y = y + (height - newHeight)
          width = newWidth
          height = newHeight
        }
      } else if (handle === 'ne') {
        if (isHorizontal) {
          width = Math.max(MIN_SIZE, width + deltaX)
          const newHeight = Math.max(MIN_SIZE, width / aspectRatio)
          y = y + (height - newHeight)
          height = newHeight
        } else {
          const newHeight = Math.max(MIN_SIZE, height - deltaY)
          width = Math.max(MIN_SIZE, newHeight * aspectRatio)
          y = y + (height - newHeight)
          height = newHeight
        }
      } else if (handle === 'sw') {
        if (isHorizontal) {
          const newWidth = Math.max(MIN_SIZE, width - deltaX)
          height = Math.max(MIN_SIZE, newWidth / aspectRatio)
          x = x + (width - newWidth)
          width = newWidth
        } else {
          height = Math.max(MIN_SIZE, height + deltaY)
          const newWidth = Math.max(MIN_SIZE, height * aspectRatio)
          x = x + (width - newWidth)
          width = newWidth
        }
      }
    } else {
      // 自由缩放
      switch (handle) {
        case 'se':
          width = Math.max(MIN_SIZE, width + deltaX)
          height = Math.max(MIN_SIZE, height + deltaY)
          break
        case 'nw':
          const newWidth = Math.max(MIN_SIZE, width - deltaX)
          const newHeight = Math.max(MIN_SIZE, height - deltaY)
          x = x + (width - newWidth)
          y = y + (height - newHeight)
          width = newWidth
          height = newHeight
          break
        case 'ne':
          width = Math.max(MIN_SIZE, width + deltaX)
          const newH = Math.max(MIN_SIZE, height - deltaY)
          y = y + (height - newH)
          height = newH
          break
        case 'sw':
          const newW = Math.max(MIN_SIZE, width - deltaX)
          x = x + (width - newW)
          width = newW
          height = Math.max(MIN_SIZE, height + deltaY)
          break
      }
    }
  } else {
    // 边缘控制点：只调整一个方向
    if (maintainRatio && aspectRatio) {
      // 等比缩放时，边缘控制点也要保持比例
      switch (handle) {
        case 'n':
        case 's':
          // 调整高度，宽度跟随
          if (handle === 'n') {
            const newHeight = Math.max(MIN_SIZE, height - deltaY)
            const newWidth = Math.max(MIN_SIZE, newHeight * aspectRatio)
            x = x + (width - newWidth) / 2 // 居中
            y = y + (height - newHeight)
            width = newWidth
            height = newHeight
          } else {
            height = Math.max(MIN_SIZE, height + deltaY)
            const newWidth = Math.max(MIN_SIZE, height * aspectRatio)
            x = x + (width - newWidth) / 2 // 居中
            width = newWidth
          }
          break
        case 'e':
        case 'w':
          // 调整宽度，高度跟随
          if (handle === 'e') {
            width = Math.max(MIN_SIZE, width + deltaX)
            const newHeight = Math.max(MIN_SIZE, width / aspectRatio)
            y = y + (height - newHeight) / 2 // 居中
            height = newHeight
          } else {
            const newWidth = Math.max(MIN_SIZE, width - deltaX)
            const newHeight = Math.max(MIN_SIZE, newWidth / aspectRatio)
            x = x + (width - newWidth)
            y = y + (height - newHeight) / 2 // 居中
            width = newWidth
            height = newHeight
          }
          break
      }
    } else {
      // 自由缩放
      switch (handle) {
        case 'n':
          const h = Math.max(MIN_SIZE, height - deltaY)
          y = y + (height - h)
          height = h
          break
        case 's':
          height = Math.max(MIN_SIZE, height + deltaY)
          break
        case 'e':
          width = Math.max(MIN_SIZE, width + deltaX)
          break
        case 'w':
          const w = Math.max(MIN_SIZE, width - deltaX)
          x = x + (width - w)
          width = w
          break
      }
    }
  }

  // 边界约束
  if (maintainRatio && aspectRatio) {
    // 等比缩放时的边界约束
    // 检查是否超出边界
    if (x < 0) {
      x = 0
      width = Math.min(width, imageSize.value.width)
      height = width / aspectRatio
    }
    if (y < 0) {
      y = 0
      height = Math.min(height, imageSize.value.height)
      width = height * aspectRatio
    }
    if (x + width > imageSize.value.width) {
      width = imageSize.value.width - x
      height = width / aspectRatio
    }
    if (y + height > imageSize.value.height) {
      height = imageSize.value.height - y
      width = height * aspectRatio
    }

    // 二次检查：确保调整后仍在边界内
    if (x + width > imageSize.value.width) {
      width = imageSize.value.width - x
      height = width / aspectRatio
    }
    if (y + height > imageSize.value.height) {
      height = imageSize.value.height - y
      width = height * aspectRatio
    }

    // 确保不小于最小尺寸
    if (width < MIN_SIZE) {
      width = MIN_SIZE
      height = width / aspectRatio
    }
    if (height < MIN_SIZE) {
      height = MIN_SIZE
      width = height * aspectRatio
    }
  } else {
    // 自由缩放时的边界约束
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
  }

  return { x, y, width, height }
}
</script>

<style lang="less" scoped>
.crop-box {
  position: absolute;
  border: 2px solid var(--primary-pink-color);
  cursor: move;
  user-select: none;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 0 20px 0 var(--primary-pink-color);
  }
  .size-label {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--primary-pink-color);
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
    border: 2px solid var(--primary-pink-color);
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
      height: 6px;
      border-radius: 4px;
      left: 50%;
      transform: translateX(-50%);
    }
    &.n {
      top: -6px;
    }
    &.s {
      bottom: -6px;
    }
    &.e,
    &.w {
      width: 6px;
      height: 40px;
      border-radius: 4px;
      top: 50%;
      transform: translateY(-50%);
    }
    &.e {
      right: -6px;
    }
    &.w {
      left: -6px;
    }
  }
}
</style>
