<template>
  <div class="mainImg">
    <div class="image">
      <template v-if="pageList.length">
        <swiper
          :navigation="true"
          :pagination="pagination"
          :modules="modules"
          :autoHeight="true"
          :spaceBetween="1"
          class="mySwiper"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
        >
          <template v-for="item in pageList" :key="item.id || item.image_urls?.large">
            <swiper-slide>
              <MyImg :imgUrl="item.image_urls.large" />
            </swiper-slide>
          </template>
        </swiper>
        <div class="page-indicator">{{ currentIndex }} / {{ pageList.length }}</div>
      </template>
      <template v-else-if="isUgoira">
        <!-- 动图播放 -->
        <canvas v-show="isPlaying" ref="canvasRef" class="ugoira-canvas"></canvas>
        <img v-show="!isPlaying" :src="showImg" />
        <div class="play-button" @click="togglePlay">
          <el-icon :size="60">
            <VideoPlay v-if="!isPlaying" />
            <VideoPause v-else />
          </el-icon>
        </div>
        <div v-if="isLoading" class="loading-overlay">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <div class="loading-text">加载动图中...</div>
        </div>
      </template>
      <template v-else>
        <MyImg :imgUrl="showImg" :showOriginal="true" />
      </template>
    </div>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { onMounted, ref, watch, computed, onBeforeUnmount } from 'vue'
import { getPixivUgoiraMetadata } from '@/service/module/vip'
import { VideoPlay, VideoPause, Loading } from '@element-plus/icons-vue'
import JSZip from 'jszip'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import MyImg from '@/components/myImg/myImg.vue'

const showImg = ref('')
const vipStore = useVip()
const pageList = ref([])
const currentIndex = ref(1)
const modules = [Navigation, Pagination]
const pagination = {
  clickable: true,
}
const swiperInstance = ref(null)
const onSwiper = (swiper) => {
  swiperInstance.value = swiper
}

// 动图相关
const canvasRef = ref(null)
const isUgoira = computed(() => vipStore.detailDataAll?.imgDetail?.type === 'ugoira')
const isPlaying = ref(false)
const isLoading = ref(false)
const ugoiraFrames = ref([])
const ugoiraDelays = ref([])
let animationFrameId = null

// 播放动图
const playUgoira = () => {
  if (!canvasRef.value || ugoiraFrames.value.length === 0) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  let currentFrame = 0

  const renderFrame = () => {
    if (!isPlaying.value) return

    const img = ugoiraFrames.value[currentFrame]
    const delay = ugoiraDelays.value[currentFrame]

    // 设置 canvas 尺寸
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width
      canvas.height = img.height
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    currentFrame = (currentFrame + 1) % ugoiraFrames.value.length

    animationFrameId = setTimeout(() => {
      requestAnimationFrame(renderFrame)
    }, delay)
  }

  renderFrame()
}
// 停止播放
const stopUgoira = () => {
  if (animationFrameId) {
    clearTimeout(animationFrameId)
    animationFrameId = null
  }
}
// 加载动图数据
const loadUgoira = async () => {
  const pid = vipStore.detailDataAll?.imgDetail?.pid
  if (!pid) return

  isLoading.value = true
  try {
    // 获取动图元数据
    const res = await getPixivUgoiraMetadata(pid)
    const metadata = res.data.ugoira_metadata
    if (!metadata || !metadata.zip_urls) {
      console.error('动图元数据获取失败')
      return
    }
    // 下载 ZIP 文件
    const zipUrl = switchImgResolutionUrl(metadata.zip_urls.medium, 'origin')
    const zipResponse = await fetch(zipUrl)
    const zipBlob = await zipResponse.blob()
    // 解压 ZIP
    const zip = new JSZip()
    const zipData = await zip.loadAsync(zipBlob)
    // 加载所有帧
    const frames = []
    const delays = []
    const fileNames = Object.keys(zipData.files).sort()

    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i]
      if (zipData.files[fileName].dir) continue
      const blob = await zipData.files[fileName].async('blob')
      const url = URL.createObjectURL(blob)
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })
      frames.push(img)
      delays.push(metadata.frames[i]?.delay || 100)
    }
    ugoiraFrames.value = frames
    ugoiraDelays.value = delays
    console.log('动图加载完成，帧数:', frames.length)
  } catch (error) {
    console.error('加载动图失败:', error)
  } finally {
    isLoading.value = false
  }
}
// 切换播放状态
const togglePlay = async () => {
  if (ugoiraFrames.value.length === 0) {
    await loadUgoira()
  }
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    playUgoira()
  } else {
    stopUgoira()
  }
}

watch(
  () => vipStore.detailDataAll,
  async () => {
    // 重置动图状态
    stopUgoira()
    isPlaying.value = false
    ugoiraFrames.value = []
    ugoiraDelays.value = []

    pageList.value = vipStore.detailDataAll?.imgDetail?.pageList ?? []
    swiperInstance.value?.slideTo(0, 0)
    currentIndex.value = 1
    if (vipStore.detailDataAll?.imgDetail?.coverImg?.large) {
      showImg.value = vipStore.detailDataAll.imgDetail.coverImg.large
    }
    // 如果是动图，自动加载并播放
    if (isUgoira.value) {
      await loadUgoira()
      if (ugoiraFrames.value.length > 0) {
        isPlaying.value = true
        playUgoira()
      }
    }
  },
  { deep: true },
)

onMounted(() => {
  pageList.value = vipStore.detailData?.pageList ?? []
  currentIndex.value = 1
  if (vipStore.detailData?.coverImg?.large) {
    showImg.value = vipStore.detailData.coverImg.large
  }
})

onBeforeUnmount(() => {
  stopUgoira()
})

const onSlideChange = (swiperInstance) => {
  currentIndex.value = (swiperInstance?.realIndex ?? 0) + 1
  vipStore.currentDetailShowImg = pageList.value[swiperInstance?.realIndex ?? 0].image_urls.large
}
</script>

<style lang="less" scoped>
.mainImg {
  width: 100%;
  height: auto;
  margin-bottom: 24px;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--comics-cardBg-color);
  @media (min-width: 1000px) {
    height: calc(100vh - 100px);
  }
  .image {
    width: 100%;
    height: auto;
    border-radius: 10px;
    position: relative;
    @media (min-width: 1000px) {
      height: calc(100vh - 100px);
    }
    :deep(.mySwiper) {
      width: 100%;
      height: 100%;
    }
    :deep(.swiper-wrapper) {
      width: 100%;
      height: 100%;
    }
    :deep(.swiper-slide) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: var(--comics-cardBg-color);
    }
    :deep(.swiper-button-prev),
    :deep(.swiper-button-next) {
      color: var(--primary-pink-color);
      font-weight: 900;
      @media (max-width: 1000px) {
        display: none;
      }
    }
    :deep(.swiper-pagination) {
      bottom: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    :deep(.swiper-pagination-bullet) {
      width: 10px;
      height: 10px;
      background: rgba(255, 255, 255, 0.4);
      opacity: 1;
      border-radius: 50%;
      transition: all 0.3s ease;
      margin: 0;
    }
    :deep(.swiper-pagination-bullet-active) {
      width: 30px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.95);
    }
    :deep(.myImg) {
      img {
        width: 100%;
        height: 100%;
        margin: auto;
        display: block;
        object-fit: contain;
        border-radius: 10px;
      }
    }

    .ugoira-canvas {
      width: 100%;
      height: 100%;
      margin: auto;
      display: block;
      object-fit: contain;
      border-radius: 10px;
    }
    .play-button {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--primary-pink-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(255, 0, 122, 0.4);
      &:hover {
        background: #ff1a8a;
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(255, 0, 122, 0.6);
      }
      &:active {
        transform: scale(0.95);
      }
      .el-icon {
        color: #fff;
        font-size: 28px;
      }
    }
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 20;
      .el-icon {
        color: #fff;
        margin-bottom: 12px;
      }
      .loading-text {
        color: #fff;
        font-size: 14px;
      }
    }
    .page-indicator {
      position: absolute;
      z-index: 9;
      top: 16px;
      right: 16px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
