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
              :src="
                videoItem.authorImg ??
                'https://i.pximg.org/img-master/img/2025/09/07/22/06/19/134834046_p0_master1200.jpg'
              "
            />
          </div>
          <div class="authorName">{{ videoItem.author }}</div>
        </div>
        <div class="title">
          <div class="text">{{ videoItem.title }}</div>
          <span v-if="videoItem.viewCount > 0" class="viewCount">{{ videoItem.viewCount }}</span>
          <div class="detail" @click="getDetail">
            <el-icon><Iphone /></el-icon>
            <div class="iconText">详情页</div>
          </div>
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
      :poster="videoItem.videoImg"
      preload="auto"
      loop
      class="video-player"
      @play="isPlay = true"
      @pause="isPlay = false"
      @timeupdate="updateCurrentTime"
      @loadedmetadata="handleLoadedMetadata"
    ></video>
  </div>
</template>

<script setup>
import { getProxyVideoInfo } from '@/service/module/video'
import { onMounted, ref, useTemplateRef } from 'vue'
import { Iphone, VideoPlay } from '@element-plus/icons-vue'
import VideoProgressBar from './videoProgressBar.vue'
import { useRouter } from 'vue-router'
import useVideo from '@/sotre/module/video'
import parseM3U8 from '@/utils/parseM3U8'

const props = defineProps({
  videoItem: {
    type: Object,
    default: {},
  },
})

const videoRef = useTemplateRef('videoRef')
const currentTime = ref(0)
const duration = ref(0)
const isPlay = ref(true)
const volume = ref(0.7)

// 解析M3U8视频
onMounted(() => {
  parseM3U8(videoRef.value, props.videoItem.videoSrc)
})

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
const router = useRouter()
const videoStore = useVideo()
const getDetail = () => {
  videoStore.videoDetail = props.videoItem
  router.replace('./detail')
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
        .detail {
          position: absolute;
          right: 18px;
          bottom: 20px;
          font-size: 30px;
          color: var(--primary-pink-color);
          .iconText {
            position: absolute;
            top: -15px;
            right: -13px;
            font-size: 8px;
            padding: 2px 4px;
            border: 1px solid var(--primary-pink-color);
            border-radius: 10px;
          }
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
