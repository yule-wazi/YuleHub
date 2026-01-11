<template>
  <div class="detail">
    <div class="gridArea">
      <div class="main">
        <VideoPlayer
          ref="videoPlayerRef"
          :poster="videoDetail.vod_pic"
          :currentEpisodeName="currentEpisodeName"
          :videoUrl="currentVideoUrl"
          @nextEpisode="playNextEpisode"
        />
        <InteractionBar />
        <VideoInfoCard @play="playCurrentEpisode" />
      </div>
      <div class="sideBar">
        <EpisodeList ref="episodeListRef" @episodeChange="handleEpisodeChange" />
        <RecommendList :limit="5" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave } from 'vue-router'
import useVideo from '@/sotre/module/video'
import { sessionCache } from '@/utils/cacheStorage'
import VideoPlayer from './cpns/videoPlayer.vue'
import VideoInfoCard from './cpns/videoInfoCard.vue'
import EpisodeList from './cpns/episodeList.vue'
import RecommendList from './cpns/recommendList.vue'
import InteractionBar from './cpns/interactionBar.vue'

const videoStore = useVideo()
const { videoDetail } = storeToRefs(videoStore)

// SessionStorage 缓存相关
const STORAGE_KEY = 'VIDEO_DETAIL_CACHE'

// 从 sessionStorage 恢复数据
const restoreFromSession = () => {
  const cached = sessionCache.get(STORAGE_KEY)
  if (cached) {
    // 恢复 videoDetail
    if (cached.videoDetail && Object.keys(cached.videoDetail).length > 0) {
      if (!videoStore.videoDetail || Object.keys(videoStore.videoDetail).length === 0) {
        videoStore.videoDetail = cached.videoDetail
      }
    }
    // 恢复 recommendList（仅缓存的推荐数据）
    if (cached.recommendList && cached.recommendList.length > 0) {
      if (!videoStore.animeList || videoStore.animeList.length === 0) {
        videoStore.animeList = cached.recommendList
      }
    }
    return true
  }
  return false
}

// 保存数据到 sessionStorage
const saveToSession = () => {
  if (!videoStore.videoDetail || Object.keys(videoStore.videoDetail).length === 0) {
    return
  }
  // 只缓存推荐列表显示的条数（排除当前视频，取前5条）
  const recommendList = videoStore.animeList
    .filter((item) => item.vod_id !== videoStore.videoDetail.vod_id)
    .slice(0, 5)

  const cacheData = {
    videoDetail: { ...videoStore.videoDetail },
    recommendList,
    timestamp: Date.now(),
  }
  try {
    sessionCache.set(STORAGE_KEY, cacheData)
  } catch (error) {
    console.error('保存视频详情缓存失败:', error)
  }
}

// 初始化时尝试恢复缓存
restoreFromSession()

const videoPlayerRef = ref(null)
const episodeListRef = ref(null)

const currentEpisodeName = ref('第01集')
const currentVideoUrl = ref('')

// 处理选集切换
const handleEpisodeChange = ({ episode, episodeName }) => {
  currentEpisodeName.value = episodeName
  currentVideoUrl.value = episode?.url || ''
  videoPlayerRef.value?.play()
}

// 播放当前选集
const playCurrentEpisode = () => {
  const url = episodeListRef.value?.currentEpisodeUrl
  if (url) {
    currentVideoUrl.value = url
    videoPlayerRef.value?.play()
  }
}

// 播放下一集
const playNextEpisode = () => {
  if (!episodeListRef.value) return
  const currentIndex = episodeListRef.value.currentEpisodeIndex
  const episodes = episodeListRef.value.currentEpisodes
  if (currentIndex < episodes.length - 1) {
    episodeListRef.value.selectEpisode(currentIndex + 1)
  }
}

// 初始化
onMounted(() => {
  if (episodeListRef.value) {
    currentEpisodeName.value = episodeListRef.value.currentEpisodeName
    currentVideoUrl.value = episodeListRef.value.currentEpisodeUrl
  }
})

// 监听视频详情变化（切换视频时）
watch(
  () => videoStore.videoDetail,
  (newVal, oldVal) => {
    if (episodeListRef.value && newVal?.vod_id !== oldVal?.vod_id) {
      episodeListRef.value.selectEpisode(0)
    }
    // 数据变化时保存到缓存
    if (newVal && Object.keys(newVal).length > 0) {
      console.log('进行缓存')
      saveToSession()
    }
  },
  { immediate: true },
)

// 路由离开前保存数据
onBeforeRouteLeave(() => {
  saveToSession()
})
</script>

<style lang="less" scoped>
.detail {
  height: 100%;
  overflow: auto;
  background-color: var(--comics-bg-color);
  color: var(--comics-cardTitle-color);

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--primary-pink-color);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: var(--comics-headerBg-color);
  }

  .gridArea {
    max-width: 90vw;
    margin: 20px auto;
    display: grid;
    gap: 20px;
    @media (min-width: 1000px) {
      grid-template-columns: minmax(0, 1fr) 350px;
    }
    @media (max-width: 1000px) {
      max-width: 100%;
      margin: 0;
      box-sizing: border-box;
      .main {
        .videoPlayer {
          border-radius: 0;
        }
      }
      .videoPlayer {
        padding: 0;
      }
    }
    .main {
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
    }

    .sideBar {
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-width: 100%;
      overflow: hidden;
    }
  }
}
</style>
