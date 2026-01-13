<template>
  <div ref="home" class="home">
    <!-- 新番时间表 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">新番时间表</span>
        <div class="week-tabs">
          <span
            v-for="(day, idx) in weekDays"
            :key="idx"
            :class="['week-tab', { active: activeWeekDay === idx }]"
            @click="activeWeekDay = idx"
          >
            {{ day }}
          </span>
        </div>
      </div>
      <div class="schedule-container">
        <div class="schedule-wrapper">
          <!-- 时间线 -->
          <div class="timeline-bar"></div>
          <!-- 自定义导航按钮 -->
          <button class="nav-btn prev" @click="slidePrev">‹</button>
          <button class="nav-btn next" @click="slideNext">›</button>
          <Swiper
            :modules="[Navigation]"
            :slides-per-view="'auto'"
            :space-between="12"
            class="schedule-swiper"
            @swiper="onSwiper"
          >
            <SwiperSlide v-for="item in scheduleList" :key="item.vod_id" class="schedule-slide">
              <ScheduleCard :itemData="item" />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
    <!-- 全部列表 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">全部动漫</span>
      </div>
      <div class="video-grid">
        <template v-for="item in videoStore.animeList" :key="item.vod_id">
          <AnimeCard :item="item" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onActivated, nextTick, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import useVideo from '@/sotre/module/video'
import Loading from '@/components/loading/loading.vue'
import ScheduleCard from '../../cpns/scheduleCard.vue'
import AnimeCard from '../../cpns/animeCard.vue'

const videoStore = useVideo()
const home = ref(null)

onMounted(() => {
  videoStore.fetchAnimeList('cj.lziapi.com')
})

// KeepAlive 激活时恢复滚动位置
onActivated(async () => {
  videoStore.fetchAnimeList('cj.lziapi.com')
  await nextTick()
  if (home.value && videoStore.scrollTop > 0) {
    home.value.scrollTo({ top: videoStore.scrollTop, behavior: 'auto' })
  }
})

// 路由离开前保存滚动位置
onBeforeRouteLeave(() => {
  if (home.value) {
    videoStore.scrollTop = home.value.scrollTop
  }
})

let swiperInstance = null

const onSwiper = (swiper) => {
  swiperInstance = swiper
}

const slidePrev = () => swiperInstance?.slideTo(swiperInstance.activeIndex - 5)
const slideNext = () => swiperInstance?.slideTo(swiperInstance.activeIndex + 5)

const weekDays = ['最近更新', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
const activeWeekDay = ref(0)

const scheduleList = computed(() => {
  if (activeWeekDay.value === 0) {
    return [...videoStore.animeList].sort((a, b) => new Date(b.vod_time) - new Date(a.vod_time))
  }
  const targetDay = activeWeekDay.value === 7 ? 0 : activeWeekDay.value
  return videoStore.animeList.filter((item) => {
    if (!item.vod_time) return false
    return new Date(item.vod_time).getDay() === targetDay
  })
})

const loadingFetch = () => {
  videoStore.currentPage++
}
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  background-color: var(--comics-bg-color);
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 1000px) {
    &::-webkit-scrollbar {
      display: block;
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: #ff007a;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background: var(--comics-headerBg-color);
      border-radius: 4px;
    }
  }
}

.section {
  width: 85vw;
  margin: auto;
  margin-bottom: 25px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: start;
  }
  .section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--comics-cardTitle-color);
  }
  .week-tabs {
    margin-left: auto;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    &::-webkit-scrollbar {
      height: 0;
    }
    .week-tab {
      flex-shrink: 0;
      font-size: 13px;
      color: var(--comics-cardSubTitle-color);
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 4px;
      transition: all 0.3s;
      &:hover {
        color: var(--comics-cardTitle-color);
      }
      &.active {
        color: #ff007a;
        background: rgba(255, 0, 122, 0.15);
      }
    }
  }
}

// 时间表Swiper
.schedule-container {
  overflow: hidden;
}

.schedule-wrapper {
  position: relative;
  padding-top: 40px;

  .timeline-bar {
    position: absolute;
    top: 28px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff007a 0%, rgba(255, 0, 122, 0.3) 100%);
    z-index: 1;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 0, 122, 0.8);
    color: #fff;
    font-size: 40px;
    cursor: pointer;
    z-index: 10;
    opacity: 0;
    transition:
      opacity 0.3s,
      background 0.3s,
      transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    padding-bottom: 4px;
    box-sizing: border-box;
    &:hover {
      background: #ff007a;
      transform: translateY(-50%) scale(1.1);
    }
    &.prev {
      left: 10px;
    }
    &.next {
      right: 10px;
    }
  }
  &:hover .nav-btn {
    opacity: 1;
  }
}

.schedule-swiper {
  overflow: visible !important;
  :deep(.swiper-wrapper) {
    overflow: visible !important;
  }
}

.schedule-slide {
  width: 130px !important;
  overflow: visible !important;
  @media (min-width: 1000px) {
    width: 11vw !important;
  }
}

// Grid列表
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 15px;
  @media (min-width: 1000px) {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}
</style>
