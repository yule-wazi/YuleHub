<template>
  <div class="headerBanner" :style="{ backgroundImage: `url(${currentBgImage})` }"></div>
</template>

<script setup>
import { ref } from 'vue'
const bgImages = {
  morning: 'https://i.pximg.org/img-original/img/2025/01/30/22/31/38/126727491_p0.jpg', // 早晨 (6:00-11:59)
  noon: 'https://i.pximg.org/img-original/img/2025/10/16/18/14/05/136342601_p0.jpg', // 中午 (12:00-15:59)
  afternoon: 'https://i.pximg.org/img-original/img/2025/07/25/20/03/31/133100525_p0.jpg', // 下午到黄昏 (16:00-18:59)
  night: 'https://i.pximg.org/img-original/img/2025/07/25/20/01/48/133100429_p0.jpg', // 晚上 (19:00-5:59)
}

const currentBgImage = ref('')

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

currentBgImage.value = getBgImageByTime()
</script>

<style lang="less" scoped>
.headerBanner {
  height: 155px;
  flex-shrink: 0;
  background-position: center;
  background-size: cover;
  transition: background-image 0.5s ease-in-out;
  @media (max-width: 1000px) {
    display: none;
  }
}
</style>
