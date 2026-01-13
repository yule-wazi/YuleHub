<template>
  <div
    class="videoPlayer"
    :class="{ fullscreen: isFullscreen }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousemove="onMouseMove"
  >
    <!-- 顶部标题栏 -->
    <div class="video-header" :class="{ visible: showControls }">
      <span class="episode-title">{{ currentEpisodeName }}</span>
    </div>
    <!-- 视频容器 -->
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-player"
        :poster="poster"
        playsinline
        webkit-playsinline
        x5-playsinline
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        autoplay="true"
        @play="onVideoPlay"
        @pause="isPlay = false"
        @timeupdate="updateCurrentTime"
        @loadedmetadata="handleLoadedMetadata"
        @waiting="isLoading = true"
        @canplay="isLoading = false"
        @seeking="isLoading = true"
        @seeked="onSeeked"
        @ended="onVideoEnded"
        @click="onVideoClick"
        @dblclick="onVideoDblClick"
      ></video>
      <!-- 加载中提示 -->
      <div
        v-if="isLoading"
        class="loading-overlay"
        @click="onVideoClick"
        @dblclick="onVideoDblClick"
      >
        <Icon name="loading" class="loading-icon" />
        <span class="loading-text">加载中...</span>
      </div>
      <div v-else-if="!isPlay" class="play-overlay" @click="togglePlay">
        <Icon name="play-circle" class="play-icon" />
      </div>
    </div>
    <!-- 底部控制栏 -->
    <div class="video-controls" :class="{ visible: showControls }">
      <div class="controls-left">
        <div class="control-btn" @click="togglePlay">
          <Icon :name="isPlay ? 'pause' : 'play'" />
        </div>
        <div class="control-btn" @click="$emit('nextEpisode')">
          <Icon name="next" />
        </div>
        <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      <div
        class="progress-bar"
        ref="progressRef"
        @click="handleProgressClick"
        @mousedown="startDrag"
        @touchstart="startTouchDrag"
      >
        <div class="progress-bg"></div>
        <div class="progress-fill" :style="{ width: displayPercent + '%' }"></div>
        <div
          class="progress-thumb"
          :style="{ left: displayPercent + '%' }"
          @mousedown.stop="startDrag"
          @touchstart.stop="startTouchDrag"
        ></div>
      </div>
      <div class="controls-right">
        <!-- 音量控制 -->
        <div
          class="volume-wrapper pc-only"
          @mouseenter="showVolumeSlider = true"
          @mouseleave="showVolumeSlider = false"
        >
          <div class="control-btn" @click="toggleMute">
            <Icon :name="volumeIcon" />
          </div>
          <div class="volume-slider" :class="{ visible: showVolumeSlider }">
            <div class="volume-value">{{ Math.round(volume * 100) }}</div>
            <div class="volume-track" @click="handleVolumeClick" ref="volumeTrackRef">
              <div class="volume-track-bg"></div>
              <div class="volume-track-fill" :style="{ height: volume * 100 + '%' }"></div>
              <div
                class="volume-thumb"
                :style="{ bottom: volume * 100 + '%' }"
                @mousedown.stop="startVolumeDrag"
              ></div>
            </div>
          </div>
        </div>
        <div class="control-btn pc-only" @click="togglePip">
          <Icon name="pip" />
        </div>
        <div class="control-btn pc-only">
          <Icon name="settings" />
        </div>
        <div class="control-btn" @click="toggleFullscreen">
          <Icon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Icon from './icons/index.vue'
import parseM3U8 from '@/utils/parseM3U8'

const props = defineProps({
  poster: { type: String, default: '' },
  currentEpisodeName: { type: String, default: '第01集' },
  videoUrl: { type: String, default: '' },
})

const emit = defineEmits(['play', 'pause', 'timeUpdate', 'nextEpisode'])

const videoRef = ref(null)
const progressRef = ref(null)
const volumeTrackRef = ref(null)
const isPlay = ref(false)
const isLoading = ref(false)
const isFullscreen = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isMuted = ref(false)
const volume = ref(1)
const showControls = ref(false)
const showVolumeSlider = ref(false)
const isVolumeDragging = ref(false)
const isDragging = ref(false)
const dragPercent = ref(0)
const seekingPercent = ref(null)
let seekDebounceTimer = null
let hideControlsTimer = null
let hideVolumeTimer = null

// 判断是否为移动端
const isMobile = () => window.innerWidth < 1000

const progressPercent = computed(() => {
  return duration.value ? (currentTime.value / duration.value) * 100 : 0
})

const displayPercent = computed(() => {
  if (seekingPercent.value !== null) return seekingPercent.value
  if (isDragging.value) return dragPercent.value
  return progressPercent.value
})

// PC端鼠标进入/离开
const onMouseEnter = () => {
  if (!isMobile()) {
    showControls.value = true
    resetHideTimer()
  }
}

const onMouseLeave = () => {
  if (!isMobile()) {
    showControls.value = false
    clearTimeout(hideControlsTimer)
  }
}

// PC端全屏时鼠标移动显示控制栏
const onMouseMove = () => {
  if (!isMobile() && isFullscreen.value) {
    showControls.value = true
    resetHideTimer()
  }
}

// 重置隐藏定时器
const resetHideTimer = () => {
  clearTimeout(hideControlsTimer)
  if (isFullscreen.value) {
    hideControlsTimer = setTimeout(() => {
      showControls.value = false
    }, 1000)
  }
}

// 视频播放结束，自动播放下一集
const onVideoEnded = () => {
  emit('nextEpisode')
}

// 点击视频区域
let clickTimer = null
const onVideoClick = () => {
  if (isMobile()) {
    // 移动端：切换控制栏显示
    showControls.value = !showControls.value
    // 显示后3秒自动隐藏
    if (showControls.value) {
      clearTimeout(hideControlsTimer)
      hideControlsTimer = setTimeout(() => {
        showControls.value = false
      }, 3000)
    }
  } else {
    // PC端：延迟执行，避免双击时触发
    if (clickTimer) clearTimeout(clickTimer)
    clickTimer = setTimeout(() => {
      togglePlay()
    }, 200)
  }
}

// PC端双击切换全屏
const onVideoDblClick = () => {
  if (!isMobile()) {
    if (clickTimer) clearTimeout(clickTimer)
    toggleFullscreen()
  }
}

const onVideoPlay = () => {
  isPlay.value = true
  isLoading.value = false
}

const togglePlay = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }
}

const updateCurrentTime = () => {
  if (videoRef.value && !isDragging.value && seekingPercent.value === null) {
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
  if (!progressRef.value || !videoRef.value || isDragging.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  seekToPercent(percent * 100)
}

const seekToPercent = (percent) => {
  if (!videoRef.value) return
  seekingPercent.value = percent
  isLoading.value = true
  if (seekDebounceTimer) clearTimeout(seekDebounceTimer)
  seekDebounceTimer = setTimeout(() => {
    if (videoRef.value) {
      videoRef.value.currentTime = (percent / 100) * duration.value
      currentTime.value = videoRef.value.currentTime
    }
  }, 300)
}

const onSeeked = () => {
  seekingPercent.value = null
  isLoading.value = false
}

const startDrag = (e) => {
  if (!progressRef.value || !videoRef.value) return
  isDragging.value = true
  updateDragPosition(e)
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
}

// 移动端触摸拖动
const startTouchDrag = (e) => {
  if (!progressRef.value || !videoRef.value) return
  e.preventDefault()
  isDragging.value = true
  updateTouchDragPosition(e)
  document.addEventListener('touchmove', onTouchDrag, { passive: false })
  document.addEventListener('touchend', endTouchDrag)
}

const onTouchDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  updateTouchDragPosition(e)
}

const updateTouchDragPosition = (e) => {
  if (!progressRef.value || !e.touches[0]) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = (e.touches[0].clientX - rect.left) / rect.width
  dragPercent.value = Math.max(0, Math.min(100, percent * 100))
  debouncedSeek(dragPercent.value)
}

const endTouchDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('touchmove', onTouchDrag)
  document.removeEventListener('touchend', endTouchDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return
  updateDragPosition(e)
}

const updateDragPosition = (e) => {
  if (!progressRef.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  dragPercent.value = Math.max(0, Math.min(100, percent * 100))
  debouncedSeek(dragPercent.value)
}

const debouncedSeek = (percent) => {
  if (!videoRef.value) return
  isLoading.value = true
  if (seekDebounceTimer) clearTimeout(seekDebounceTimer)
  seekDebounceTimer = setTimeout(() => {
    if (videoRef.value) {
      videoRef.value.currentTime = (percent / 100) * duration.value
      currentTime.value = videoRef.value.currentTime
    }
  }, 300)
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
}

// 音量图标
const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'mute'
  if (volume.value < 0.5) return 'volume-low'
  return 'volume'
})

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

// 设置音量
const setVolume = (val) => {
  if (!videoRef.value) return
  volume.value = Math.max(0, Math.min(1, val))
  videoRef.value.volume = volume.value
  if (volume.value > 0 && isMuted.value) {
    isMuted.value = false
    videoRef.value.muted = false
  }
}

// 点击音量条
const handleVolumeClick = (e) => {
  if (!volumeTrackRef.value) return
  const rect = volumeTrackRef.value.getBoundingClientRect()
  const percent = 1 - (e.clientY - rect.top) / rect.height
  setVolume(percent)
}

// 拖动音量
const startVolumeDrag = () => {
  isVolumeDragging.value = true
  document.addEventListener('mousemove', onVolumeDrag)
  document.addEventListener('mouseup', endVolumeDrag)
}

const onVolumeDrag = (e) => {
  if (!isVolumeDragging.value || !volumeTrackRef.value) return
  const rect = volumeTrackRef.value.getBoundingClientRect()
  const percent = 1 - (e.clientY - rect.top) / rect.height
  setVolume(percent)
}

const endVolumeDrag = () => {
  isVolumeDragging.value = false
  document.removeEventListener('mousemove', onVolumeDrag)
  document.removeEventListener('mouseup', endVolumeDrag)
}

// 显示音量滑块并自动隐藏
const showVolumeSliderTemporarily = () => {
  showVolumeSlider.value = true
  if (hideVolumeTimer) clearTimeout(hideVolumeTimer)
  hideVolumeTimer = setTimeout(() => {
    if (!isVolumeDragging.value) {
      showVolumeSlider.value = false
    }
  }, 1500)
}

// 键盘快捷键
const handleKeydown = (e) => {
  if (!videoRef.value) return

  // 全屏模式下显示控制栏
  const showControlsInFullscreen = () => {
    if (isFullscreen.value) {
      showControls.value = true
      resetHideTimer()
    }
  }

  switch (e.code) {
    case 'Space':
      e.preventDefault()
      togglePlay()
      showControlsInFullscreen()
      break
    case 'ArrowLeft':
      e.preventDefault()
      {
        const newTime = Math.max(0, videoRef.value.currentTime - 5)
        const percent = (newTime / duration.value) * 100
        seekingPercent.value = percent
        videoRef.value.currentTime = newTime
        currentTime.value = newTime
        showControlsInFullscreen()
      }
      break
    case 'ArrowRight':
      e.preventDefault()
      {
        const newTime = Math.min(duration.value, videoRef.value.currentTime + 5)
        const percent = (newTime / duration.value) * 100
        seekingPercent.value = percent
        videoRef.value.currentTime = newTime
        currentTime.value = newTime
        showControlsInFullscreen()
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      setVolume(volume.value + 0.1)
      showVolumeSliderTemporarily()
      showControlsInFullscreen()
      break
    case 'ArrowDown':
      e.preventDefault()
      setVolume(volume.value - 0.1)
      showVolumeSliderTemporarily()
      showControlsInFullscreen()
      break
    case 'KeyF':
      e.preventDefault()
      toggleFullscreen()
      break
  }
}

const toggleFullscreen = async () => {
  if (!videoRef.value) return

  const playerContainer = videoRef.value.parentElement?.parentElement

  if (document.fullscreenElement) {
    await document.exitFullscreen()
    isFullscreen.value = false
    // 移动端退出全屏时解锁屏幕方向
    if (screen.orientation?.unlock) {
      screen.orientation.unlock()
    }
  } else {
    await playerContainer?.requestFullscreen()
    isFullscreen.value = true
    // 移动端全屏时强制横屏
    if (screen.orientation?.lock && window.innerWidth < 1000) {
      try {
        await screen.orientation.lock('landscape')
      } catch (e) {
        // 部分浏览器不支持，忽略错误
      }
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

const loadVideo = async (url, autoPlay = false) => {
  if (url && videoRef.value) {
    isLoading.value = true
    await parseM3U8(videoRef.value, url)
    if (autoPlay) {
      videoRef.value.play()
    }
  }
}

const play = () => {
  videoRef.value?.play()
}

const isFirstLoad = ref(true)

watch(
  () => props.videoUrl,
  (newUrl, oldUrl) => {
    if (newUrl) {
      const autoPlay = !isFirstLoad.value && oldUrl !== newUrl
      loadVideo(newUrl, autoPlay)
      isFirstLoad.value = false
    }
  },
  { immediate: true },
)

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

// 挂载时添加键盘监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onTouchDrag)
  document.removeEventListener('touchend', endTouchDrag)
  document.removeEventListener('mousemove', onVolumeDrag)
  document.removeEventListener('mouseup', endVolumeDrag)
  document.removeEventListener('keydown', handleKeydown)
  if (seekDebounceTimer) clearTimeout(seekDebounceTimer)
  if (hideControlsTimer) clearTimeout(hideControlsTimer)
  if (hideVolumeTimer) clearTimeout(hideVolumeTimer)
})

defineExpose({ loadVideo, play, videoRef })
</script>

<style lang="less" scoped>
.videoPlayer {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;

  // 全屏样式
  &.fullscreen {
    .video-container {
      .video-player {
        object-fit: contain;
      }
    }
  }

  // 全屏时的样式
  &:fullscreen {
    width: 100vw;
    height: 100vh;
    border-radius: 0;

    .video-container {
      aspect-ratio: unset;
      width: 100%;
      height: 100%;

      .video-player {
        object-fit: contain;
      }
    }

    // 移动端全屏强制横屏
    @media (max-width: 1000px) and (orientation: portrait) {
      transform: rotate(90deg);
      transform-origin: center center;
      width: 100vh;
      height: 100vw;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -50vw;
      margin-left: -50vh;
    }
  }
  .video-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
    transform: translateY(-100%);
    transition: transform 0.3s ease;

    &.visible {
      transform: translateY(0);
    }

    .episode-title {
      font-size: 14px;
      color: #fff;
      font-weight: 500;
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
        width: 68px;
        height: 68px;
        color: var(--primary-pink-color);
        filter: drop-shadow(0 2px 8px rgba(255, 0, 122, 0.4));
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.1);
        }
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);

      .loading-icon {
        width: 40px;
        height: 40px;
        color: var(--primary-pink-color);
        animation: spin 1s linear infinite;
      }

      .loading-text {
        margin-top: 12px;
        font-size: 14px;
        color: #fff;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(-360deg);
      }
    }
  }

  .video-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    transform: translateY(100%);
    transition: transform 0.3s ease;

    &.visible {
      transform: translateY(0);
    }

    .controls-left,
    .controls-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .control-btn {
      width: 28px;
      height: 28px;
      padding: 4px;
      color: #fff;
      cursor: pointer;
      transition:
        color 0.2s,
        transform 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 100%;
        height: 100%;
      }

      &:hover {
        color: var(--primary-pink-color);
        transform: scale(1.1);
      }

      // 移动端隐藏音量、画中画、设置按钮
      &.pc-only {
        @media (max-width: 1000px) {
          display: none;
        }
      }
    }

    // 音量控制容器
    .volume-wrapper {
      position: relative;

      .volume-slider {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 8px;
        background: rgba(0, 0, 0, 0.85);
        border-radius: 6px;
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 0.2s,
          visibility 0.2s;

        &.visible {
          opacity: 1;
          visibility: visible;
        }

        .volume-value {
          text-align: center;
          font-size: 12px;
          color: #fff;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
        }

        .volume-track {
          position: relative;
          width: 6px;
          height: 80px;
          cursor: pointer;
          margin: 0 auto;

          .volume-track-bg {
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          .volume-track-fill {
            position: absolute;
            bottom: 0;
            width: 100%;
            background: var(--primary-pink-color);
            border-radius: 3px;
          }

          .volume-thumb {
            position: absolute;
            left: 50%;
            width: 12px;
            height: 12px;
            background: var(--primary-pink-color);
            border-radius: 50%;
            transform: translate(-50%, 50%);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            cursor: grab;

            &:active {
              cursor: grabbing;
            }
          }
        }
      }
    }

    .time-display {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      margin-left: 8px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .progress-bar {
      flex: 1;
      height: 4px;
      position: relative;
      cursor: pointer;
      margin: 0 8px;
      transition: height 0.2s;
      min-width: 50px;

      &:hover {
        height: 6px;

        .progress-thumb {
          transform: translate(-50%, -50%) scale(1);
        }
      }

      .progress-bg {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      .progress-fill {
        position: absolute;
        height: 100%;
        background: var(--primary-pink-color);
        border-radius: 3px;
      }

      .progress-thumb {
        position: absolute;
        top: 50%;
        width: 14px;
        height: 14px;
        background: var(--primary-pink-color);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>
