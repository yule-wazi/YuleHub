<template>
  <div class="videoPlayer">
    <div class="video-header">
      <span class="episode-title">{{ currentEpisodeName }}</span>
      <el-button type="danger" size="small" class="follow-btn">
        <el-icon><Star /></el-icon>
        追番
      </el-button>
    </div>
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-player"
        :poster="poster"
        @play="isPlay = true"
        @pause="isPlay = false"
        @timeupdate="updateCurrentTime"
        @loadedmetadata="handleLoadedMetadata"
        @click="togglePlay"
      ></video>
      <div v-if="!isPlay" class="play-overlay" @click="togglePlay">
        <el-icon class="play-icon"><VideoPlay /></el-icon>
      </div>
    </div>
    <!-- 视频控制栏 -->
    <div class="video-controls">
      <div class="controls-left">
        <el-icon class="control-btn" @click="togglePlay">
          <VideoPlay v-if="!isPlay" />
          <VideoPause v-else />
        </el-icon>
        <el-icon class="control-btn" @click="skipForward">
          <DArrowRight />
        </el-icon>
        <el-icon class="control-btn" @click="toggleMute">
          <Mute v-if="isMuted" />
          <Microphone v-else />
        </el-icon>
        <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      <div class="progress-bar" @click="handleProgressClick" ref="progressRef">
        <div class="progress-bg"></div>
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
      </div>
      <div class="controls-right">
        <el-select v-model="currentQuality" size="small" class="quality-select">
          <el-option label="1080P" value="1080" />
          <el-option label="720P" value="720" />
          <el-option label="480P" value="480" />
        </el-select>
        <el-icon class="control-btn" @click="togglePip"><PictureFilled /></el-icon>
        <el-icon class="control-btn"><Setting /></el-icon>
        <el-icon class="control-btn" @click="toggleFullscreen"><FullScreen /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  VideoPlay,
  VideoPause,
  Star,
  Setting,
  FullScreen,
  DArrowRight,
  Mute,
  Microphone,
  PictureFilled,
} from '@element-plus/icons-vue'
import parseM3U8 from '@/utils/parseM3U8'

const props = defineProps({
  poster: { type: String, default: '' },
  currentEpisodeName: { type: String, default: '第01集' },
  videoUrl: { type: String, default: '' },
})

const emit = defineEmits(['play', 'pause', 'timeUpdate'])

const videoRef = ref(null)
const progressRef = ref(null)
const isPlay = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isMuted = ref(false)
const currentQuality = ref('1080')

const progressPercent = computed(() => {
  return duration.value ? (currentTime.value / duration.value) * 100 : 0
})

// 视频控制方法
const togglePlay = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }
}

const updateCurrentTime = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    emit('timeUpdate', currentTime.value)
  }
}

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const handleProgressClick = (e) => {
  if (!progressRef.value || !videoRef.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

const skipForward = () => {
  if (videoRef.value) {
    videoRef.value.currentTime += 10
  }
}

const toggleFullscreen = () => {
  if (videoRef.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.value.requestFullscreen()
    }
  }
}

const togglePip = async () => {
  if (videoRef.value) {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoRef.value.requestPictureInPicture()
    }
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 加载视频
const loadVideo = async (url) => {
  if (url && videoRef.value) {
    await parseM3U8(videoRef.value, url)
  }
}

// 播放视频
const play = () => {
  videoRef.value?.play()
}

watch(
  () => props.videoUrl,
  (newUrl) => {
    if (newUrl) loadVideo(newUrl)
  },
  { immediate: true },
)

defineExpose({ loadVideo, play, videoRef })
</script>

<style lang="less" scoped>
.videoPlayer {
  background: #000;
  border-radius: 8px;
  overflow: hidden;

  .video-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: rgba(0, 0, 0, 0.8);

    .episode-title {
      font-size: 14px;
      color: #fff;
    }

    .follow-btn {
      background: #ff007a;
      border: none;
    }
  }

  .video-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;

    .video-player {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .play-icon {
        font-size: 60px;
        color: #00d4aa;
        filter: drop-shadow(0 0 10px rgba(0, 212, 170, 0.5));
      }
    }
  }

  .video-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    background: rgba(0, 0, 0, 0.9);

    .controls-left,
    .controls-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .control-btn {
      font-size: 20px;
      color: #fff;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #00d4aa;
      }
    }

    .time-display {
      font-size: 12px;
      color: #aaa;
    }

    .progress-bar {
      flex: 1;
      height: 4px;
      position: relative;
      cursor: pointer;
      margin: 0 10px;

      .progress-bg {
        position: absolute;
        width: 100%;
        height: 100%;
        background: #444;
        border-radius: 2px;
      }

      .progress-fill {
        position: absolute;
        height: 100%;
        background: #00d4aa;
        border-radius: 2px;
      }

      .progress-thumb {
        position: absolute;
        top: 50%;
        width: 12px;
        height: 12px;
        background: #00d4aa;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .quality-select {
      width: 80px;
      :deep(.el-input__wrapper) {
        background: transparent;
        box-shadow: none;
      }
      :deep(.el-input__inner) {
        color: #fff;
      }
    }
  }
}
</style>
