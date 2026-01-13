<template>
  <div class="schedule-card" @click="goDetail(itemData)">
    <div class="schedule-time">
      <span class="time-text">{{ formatTime(itemData.vod_time) }}</span>
      <span class="time-dot"></span>
    </div>
    <div class="schedule-cover">
      <img :src="showImg" :alt="itemData.vod_name" @error="switchErrorImg()" />
      <div class="schedule-score" v-if="itemData.vod_douban_score > 0">
        {{ itemData.vod_douban_score }}
      </div>
    </div>
    <div class="schedule-title">{{ itemData.vod_name }}</div>
    <div class="schedule-remarks">{{ itemData.vod_remarks }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useVideo from '@/sotre/module/video'

const props = defineProps({
  itemData: {
    type: Object,
    default: {},
  },
})
const videoStore = useVideo()
const router = useRouter()
const showImg = ref(props.itemData.vod_pic)
const switchErrorImg = () => {
  console.log('图片加载异常')
  showImg.value = 'https://s.pximg.net/common/images/no_profile.png'
}

const goDetail = (item) => {
  videoStore.videoDetail = item
  router.push('/video/detail')
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${weekDay} ${hours}:${minutes}`
}
</script>

<style lang="less" scoped>
.schedule-card {
  cursor: pointer;
  position: relative;
  .schedule-time {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    .time-text {
      font-size: 12px;
      color: #ff007a;
      font-weight: 500;
      white-space: nowrap;
      padding: 2px 8px;
      background: var(--comics-bg-color);
      border: 1px solid rgba(255, 0, 122, 0.3);
      border-radius: 12px;
    }
    .time-dot {
      width: 8px;
      height: 8px;
      background: #ff007a;
      border-radius: 50%;
      margin-top: 2px;
      box-shadow: 0 0 6px rgba(255, 0, 122, 0.5);
    }
  }
  .schedule-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 6px;
    overflow: hidden;
    background: #1a1a2e;

    @media (min-width: 1000px) {
      aspect-ratio: 3/4;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    &:hover img {
      transform: scale(1.05);
    }
    .schedule-score {
      position: absolute;
      bottom: 6px;
      left: 6px;
      background: rgba(255, 0, 122, 0.9);
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 3px;
    }
  }
  .schedule-title {
    margin-top: 8px;
    font-size: 13px;
    color: var(--comics-cardTitle-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .schedule-remarks {
    margin-top: 4px;
    font-size: 11px;
    color: #888;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
