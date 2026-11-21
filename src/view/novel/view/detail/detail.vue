<template>
  <div class="detail">
    <div class="image">
      <div class="textLength">{{ detailData.text_length }}字</div>
      <img :src="switchImgResolutionUrl(detailData.image_urls.medium, 'origin')" alt="" />
    </div>
    <div class="desc">
      <div class="title">{{ detailData.title }}</div>
      <div class="caption" v-html="detailData.caption"></div>
      <div class="tagList">
        <template v-for="tag in detailData.tags">
          <div class="tag">#{{ tag.name }}</div>
        </template>
      </div>
      <div class="tip">
        <div class="like">
          <el-icon><Star /></el-icon>
          {{ detailData.total_bookmarks }}
        </div>
        <div class="totalView">
          <el-icon><View /></el-icon>
          {{ detailData.total_view }}
        </div>
      </div>
      <div class="createTime">{{ formatTime(detailData.create_date) }}</div>
    </div>
    <div class="content" v-html="formatSpecialOutput(novelStore.novelText)"></div>

    <!-- 听书模式浮动按钮 -->
    <Transition name="audio-button">
      <div
        v-if="novelStore.isAudioBookMode"
        class="audioBookButton"
        :class="{ playing: isPlaying }"
        @click="toggleAudioBook"
      >
        <div
          class="coverImage"
          :style="{
            backgroundImage: `url(${switchImgResolutionUrl(detailData.image_urls.medium, 'origin')})`,
          }"
        ></div>
        <div class="playIcon">
          <el-icon :size="30">
            <VideoPause v-if="isPlaying" />
            <VideoPlay v-else />
          </el-icon>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import useNovel from '@/sotre/module/novel.js'
import myCahce from '@/utils/cacheStorage'
import { formatSpecialOutput } from '../../utils/formatOutput'
import { formatTime } from '@/utils/formatTime'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { Star, View, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { NovelTTSProcessor } from '@/utils/novelTTSProcessor'
import { ElMessage, ElLoading } from 'element-plus'

const novelStore = useNovel()
let detailData = {}
if (Object.keys(novelStore.currentNovelDetail).length !== 0) {
  detailData = novelStore.currentNovelDetail
  myCahce.set('novelDetailData', detailData)
} else {
  detailData = myCahce.get('novelDetailData')
}
novelStore.fetchNovelText(detailData.id)

// 听书模式状态
const isLoading = ref(false)
let loadingInstance = null

// 当前小说是否正在播放（从 store 中判断）
const isPlaying = computed(() => {
  return novelStore.currentPlayingNovelId === detailData.id
})

// 获取纯文本内容（去除 HTML 标签）
const getPlainText = (htmlText) => {
  if (!htmlText) return ''
  const temp = document.createElement('div')
  temp.innerHTML = htmlText
  return temp.textContent || temp.innerText || ''
}

// 切换播放/暂停
const toggleAudioBook = async () => {
  // 如果正在加载，不响应点击
  if (isLoading.value) return

  // 如果当前小说正在播放，停止
  if (isPlaying.value) {
    stopAudioBook()
    return
  }

  // 开始播放当前小说
  await startAudioBook()
}

// 开始播放听书
const startAudioBook = async () => {
  // 检查是否有文本
  if (!novelStore.novelText) {
    ElMessage.warning('小说内容加载中，请稍候...')
    return
  }

  // 获取音频配置
  const audioData = myCahce.get('audioData')
  if (!audioData || !audioData.apiKey) {
    ElMessage.error('请先配置音频设置')
    novelStore.isAudioBookMode = false
    return
  }

  // 使用小说专用音色，如果没有则提示配置
  if (!audioData.novelVoice) {
    ElMessage.error('请先配置小说音色')
    novelStore.isAudioBookMode = false
    return
  }

  // 获取纯文本
  const plainText = getPlainText(novelStore.novelText)
  if (!plainText || plainText.trim().length === 0) {
    ElMessage.error('小说内容为空')
    return
  }

  isLoading.value = true
  loadingInstance = ElLoading.service({
    lock: true,
    text: '正在准备听书...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 检查是否是克隆音色（使用小说专用音色）
    const novelVoice = audioData.novelVoice
    const clonedVoice = audioData.clonedVoices?.find((v) => v.reference_id === novelVoice)
    let voice = null
    if (clonedVoice) {
      voice = clonedVoice.uri
    } else {
      voice = `${audioData.model}:${novelVoice}`
    }

    // 创建 TTS 处理器配置
    const ttsConfig = {
      voice: voice,
      model: audioData.model,
      token: audioData.apiKey,
      speed: audioData.speed || 1.0,
    }

    // 创建流式 TTS 处理器
    const ttsProcessor = new NovelTTSProcessor(ttsConfig)

    ttsProcessor.onFirstReady = () => {
      isLoading.value = false
      if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
      }
      ElMessage.success('开始播放听书')
    }

    ttsProcessor.onError = (error, index) => {
      // TTS 错误时静默处理
    }

    ttsProcessor.onComplete = () => {
      if (novelStore.currentPlayingNovelId === detailData.id) {
        novelStore.currentTTSProcessor = null
        novelStore.currentPlayingNovelId = null
      }
      ElMessage.info('播放完成')
    }

    // 将处理器设置到 store（会自动停止之前的播放）
    novelStore.setCurrentTTS(ttsProcessor, detailData.id)

    // 开始处理（分段大小 150 字符）
    await ttsProcessor.start(plainText, 150)
  } catch (error) {
    ElMessage.error('播放失败: ' + (error.message || '未知错误'))
    isLoading.value = false
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    // 清除 store 中的引用
    if (novelStore.currentPlayingNovelId === detailData.id) {
      novelStore.currentTTSProcessor = null
      novelStore.currentPlayingNovelId = null
    }
  }
}

const stopAudioBook = () => {
  novelStore.stopCurrentTTS()
  ElMessage.info('已停止播放')
}

// 监听听书模式变化
watch(
  () => novelStore.isAudioBookMode,
  (newValue) => {
    // 如果关闭听书模式，停止所有播放
    if (!newValue) {
      novelStore.stopCurrentTTS()
    }
  },
)

// 组件卸载时不清理（允许后台播放）
onUnmounted(() => {
  // 不做任何清理，让音频在后台继续播放
})
</script>

<style lang="less" scoped>
.detail {
  max-width: 1000px;
  height: 100%;
  overflow: auto;
  margin: auto;
  background-color: var(--comics-headerBg-color);

  .image {
    position: relative;
    height: 200px;
    background-color: var(--comics-headerBg-color);
    z-index: 0;

    .textLength {
      position: absolute;
      right: 10px;
      top: 10px;
      font-size: 12px;
      color: var(--comics-menuText-color);
      background-color: var(--comics-headerIcon-color);
      padding: 2px 5px;
      border-radius: 20px;
    }
    img {
      height: 100%;
      display: block;
      margin: auto;
    }
  }
  .desc {
    padding: 10px;
    background-color: var(--comics-headerBg-color);
    border-bottom: 1px solid #666;
    .title {
      color: var(--comics-cardTitle-color);
      font-weight: 700;
      font-size: 20px;
      text-align: center;
    }
    .caption {
      text-indent: 2em;
      color: var(--comics-headerIcon-color);
      font-size: 14px;
    }
    .tagList {
      display: flex;
      flex-wrap: wrap;
      font-size: 12px;
      margin-top: 10px;
      color: #ff007a;
      .tag {
        margin-right: 8px;
      }
    }
    .tip {
      display: flex;
      margin: 10px 0;
      font-size: 14px;
      color: var(--comics-cardTitle-color);
      .like {
        margin-right: 20px;
      }
    }
    .createTime {
      font-size: 12px;
      color: var(--comics-headerIcon-color);
    }
  }
  .content {
    padding: 10px;
    text-align: justify;
    overflow: hidden;
    line-height: 30px;
    color: var(--comics-headerIcon-color);
    font-size: 18px;
    text-indent: 2em;
  }

  // 听书模式浮动按钮
  .audioBookButton {
    position: fixed;
    bottom: 80px;
    right: 30px;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 0, 122, 0.3);
    transition: all 0.3s ease;
    z-index: 100;
    overflow: hidden;

    .coverImage {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }

    .playIcon {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(255, 0, 122, 0.5);

      .playIcon {
        opacity: 1;
      }
    }

    &.playing {
      animation: rotate 10s linear infinite;

      .coverImage {
        transform: scale(1.05);
      }
    }

    @media (max-width: 800px) {
      width: 60px;
      height: 60px;
      bottom: 70px;
      right: 20px;

      .playIcon {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.3);
      }
    }
  }

  // 按钮进入/离开动画
  .audio-button-enter-active,
  .audio-button-leave-active {
    transition: all 0.3s ease;
  }

  .audio-button-enter-from {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }

  .audio-button-leave-to {
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 800px) {
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
</style>
