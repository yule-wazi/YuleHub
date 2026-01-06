<template>
  <div
    class="headerBanner"
    :style="{
      backgroundImage: `url(${currentBgImage})`,
      backgroundPosition: `${bgPosition}% center`,
    }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  ></div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const bgImages = {
  morning: 'https://i.pximg.org/img-original/img/2025/01/30/22/31/38/126727491_p0.jpg', // 早晨 (6:00-11:59)
  noon: 'https://i.pximg.org/img-original/img/2025/10/16/18/14/05/136342601_p0.jpg', // 中午 (12:00-15:59)
  afternoon: 'https://i.pximg.org/img-original/img/2025/07/25/20/03/31/133100525_p0.jpg', // 下午到黄昏 (16:00-18:59)
  night: 'https://i.pximg.org/img-original/img/2025/07/25/20/01/48/133100429_p0.jpg', // 晚上 (19:00-5:59)
}

const currentBgImage = ref('')
const bgPosition = ref(50) // 背景位置，默认居中(50%)
const targetPosition = ref(50) // 目标位置
let animationFrameId = null
let lastMouseX = null // 记录上一次鼠标位置

// 根据当前时间获取对应的背景图
const getBgImageByTime = () => {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) {
    return bgImages.morning // 早晨 6:00-11:59
  } else if (hour >= 12 && hour < 15) {
    return bgImages.noon // 中午 12:00-14:59
  } else if (hour >= 15 && hour < 19) {
    return bgImages.afternoon // 下午到黄昏 15:00-18:59
  } else {
    return bgImages.night // 晚上 19:00-5:59
  }
}

// 平滑动画函数
const smoothAnimate = () => {
  const diff = targetPosition.value - bgPosition.value
  // 如果差值很小，直接设置为目标值
  if (Math.abs(diff) < 0.01) {
    bgPosition.value = targetPosition.value
    animationFrameId = null
    return
  }
  // 使用缓动函数，让动画更平滑
  bgPosition.value += diff * 0.1 // 0.1 是缓动系数，可以调整

  animationFrameId = requestAnimationFrame(smoothAnimate)
}

// 启动动画
const startAnimation = () => {
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(smoothAnimate)
  }
}

// 鼠标移动事件处理
const handleMouseMove = (e) => {
  const mouseX = e.clientX
  // 如果是第一次进入，记录初始位置
  if (lastMouseX === null) {
    lastMouseX = mouseX
    return
  }

  // 计算鼠标移动的距离
  const deltaX = mouseX - lastMouseX
  lastMouseX = mouseX

  // 根据移动距离调整目标位置
  // 移动速度系数，可以调整灵敏度
  const sensitivity = 0.02
  targetPosition.value -= deltaX * sensitivity
  // 限制范围在 40-60 之间
  targetPosition.value = Math.max(40, Math.min(60, targetPosition.value))
  startAnimation()
}

// 鼠标离开时缓慢恢复居中
const handleMouseLeave = () => {
  lastMouseX = null
  targetPosition.value = 50
  startAnimation()
}

// 暴露方法给父组件
defineExpose({
  handleMouseMove,
  handleMouseLeave,
})

// 组件卸载时清理动画
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

currentBgImage.value = getBgImageByTime()
</script>

<style lang="less" scoped>
.headerBanner {
  height: 155px;
  flex-shrink: 0;
  background-size: 110%; /* 放大图片以便有移动空间 */
  @media (max-width: 1000px) {
    display: none;
  }
}
</style>
