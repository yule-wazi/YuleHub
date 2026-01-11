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
import useVideo from '@/sotre/module/video'
import VideoPlayer from './cpns/videoPlayer.vue'
import VideoInfoCard from './cpns/videoInfoCard.vue'
import EpisodeList from './cpns/episodeList.vue'
import RecommendList from './cpns/recommendList.vue'
import InteractionBar from './cpns/interactionBar.vue'

const videoStore = useVideo()
const videoDetail = computed(() => videoStore.videoDetail)

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
  () => {
    if (episodeListRef.value) {
      episodeListRef.value.selectEpisode(0)
    }
  },
  { deep: true },
)
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
    background: #ff007a;
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
