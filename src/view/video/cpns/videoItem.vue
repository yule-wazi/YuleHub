<template>
  <div class="videoItem">
    <div class="mask" @click="playVideo">
      <div v-if="!isPlay" class="pauseIcon">
        <el-icon><VideoPlay /></el-icon>
      </div>
      <div class="info" @click.stop>
        <div class="author">
          <div class="image">
            <img
              src="https://i.pximg.org/img-master/img/2025/10/15/00/00/18/136283304_p0_master1200.jpg"
              alt=""
            />
          </div>
          <div class="authorName">{{ videoItem.author }}</div>
        </div>
        <div class="title">
          <div class="text">{{ videoItem.title }}</div>
          <span class="viewCount">{{ videoItem.viewCount }}</span>
        </div>
        <div class="progressBar">
          <VideoProgressBar
            :current-time="currentTime"
            :duration="duration"
            @seek="handleSeek"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          />
        </div>
      </div>
    </div>
    <video
      ref="videoRef"
      poster="https://i.pximg.org/img-master/img/2025/10/14/16/08/08/136265208_p0_master1200.jpg"
      preload="auto"
      loop
      class="video-player"
      :src="proxyVideoSrc"
      @play="isPlay = true"
      @pause="isPlay = false"
      @timeupdate="updateCurrentTime"
      @loadedmetadata="handleLoadedMetadata"
    ></video>
  </div>
</template>

<script setup>
import { getProxyVideoInfo } from '@/service/module/video'
import { ref, useTemplateRef } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import VideoProgressBar from './videoProgressBar.vue'

const props = defineProps({
  videoItem: {
    type: Object,
    default: {},
  },
})
// 代理请求视频src
const proxyVideoSrc = ref('')
getProxyVideoInfo(props.videoItem.videoSrc).then((res) => {
  proxyVideoSrc.value = res.data.data[0].video_url
})

const videoRef = useTemplateRef('videoRef')
const currentTime = ref(0)
const duration = ref(0)
const isPlay = ref(true)
const volume = ref(0.7)

// 播放暂停
const playVideo = () => {
  if (videoRef.value.paused) {
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }
}
// 视频元数据加载完成
const handleLoadedMetadata = () => {
  duration.value = videoRef.value.duration
  videoRef.value.volume = volume.value
}
// 更新当前时间
const updateCurrentTime = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
}
// 处理跳转请求
const handleSeek = (newTime) => {
  if (videoRef.value) {
    videoRef.value.currentTime = newTime
    currentTime.value = newTime
  }
}
// 拖拽开始
const onDragStart = () => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
}

// 拖拽结束
const onDragEnd = () => {
  if (videoRef.value) {
    videoRef.value.play()
  }
}
</script>

<style lang="less" scoped>
.videoItem {
  position: relative;
  width: 100%;
  height: 100%;
  .mask {
    position: absolute;
    width: 100%;
    height: 100%;
    .pauseIcon {
      position: fixed;
      z-index: 9;
      font-size: 80px;
      color: var(--comics-cardTitle-color);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .info {
      position: absolute;
      box-sizing: border-box;
      width: 100%;
      bottom: 10px;
      padding: 0 15px;
      color: var(--comics-cardTitle-color);
      .author {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .image {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          border: 2px solid var(--comics-cardTitle-color);
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .authorName {
          font-size: 18px;
          margin-left: 10px;
        }
      }
      .title {
        display: flex;
        align-items: end;
        margin-bottom: 10px;
        .text {
          font-size: 16px;
          margin-right: 5px;
          max-width: 60%;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .viewCount {
          font-size: 14px;
        }
      }
      .progressBar {
        width: 100%;
        height: 100%;
      }
    }
  }
  video {
    width: 100%;
    height: 100%;
    &::-webkit-media-controls {
      display: none;
    }
  }
}
</style>
