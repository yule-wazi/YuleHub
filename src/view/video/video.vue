<template>
  <div class="video">
    <HeaderCompoment
      title="YuLe动漫"
      :extraMenuItems="extraMenuItems"
      @searchClickEmit="searchClick"
    />
    <!-- 错误提示 -->
    <div v-if="showError" class="error-banner">
      <div class="error-content">
        <el-icon class="error-icon" :size="20">
          <WarningFilled />
        </el-icon>
        <span class="error-text">{{ errorMessage }}</span>
        <el-button type="primary" size="small" color="#ff007a" @click="handleSettings"> 前往设置 </el-button>
        <el-icon class="close-icon" :size="18" @click="showError = false">
          <Close />
        </el-icon>
      </div>
    </div>
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="['home', 'category']">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
    <animeResourcesSettings v-model="showSettings" @save="handleSaveSettings" />
  </div>
</template>

<script setup>
import HeaderCompoment from '@/components/headerComponent/headerCompoment.vue'
import animeResourcesSettings from './cpns/animeResourcesSettings.vue'
import useVideo from '@/sotre/module/video'
import { useRouter } from 'vue-router'
import { onMounted, ref, provide } from 'vue'
import { Setting, WarningFilled, Close } from '@element-plus/icons-vue'
import myLocalCache from '@/utils/cacheStorage'

const router = useRouter()
const videoStore = useVideo()
const showSettings = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// 提供错误处理函数给子组件
const handleFetchError = (error) => {
  errorMessage.value = error.message || '连接资源站失败，请检查配置'
  showError.value = true
}

provide('handleFetchError', handleFetchError)

const handleSettings = () => {
  showSettings.value = true
  showError.value = false
}

const handleSaveSettings = (url) => {
  console.log('保存的baseUrl:', url)
  showError.value = false
}

const extraMenuItems = [
  {
    text: '设置',
    icon: Setting,
    onClick: handleSettings,
  },
]

const searchClick = (tag) => {
  videoStore.animeSearchList = []
  videoStore.tagName = tag
  videoStore.currentPage = 1
  videoStore.searchVideoList({ isRefresh: true, keyword: tag })
  router.push({
    path: '/video/category',
    query: { tag },
  })
}
// 动态加载 HLS.js CDN
onMounted(() => {
  if (!myLocalCache.get('animeBaseUrl')) {
    showSettings.value = true
  }

  if (window.Hls) {
    return
  }
  const existingScript = document.querySelector('script[src*="hls.js"]')
  if (existingScript) {
    return
  }
  // 动态创建并加载脚本
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
  script.async = true
  document.head.appendChild(script)
})
</script>

<style lang="less" scoped>
.video {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  padding-top: 60px;
  box-sizing: border-box;
  background-color: var(--comics-bg-color);
}

.error-banner {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--comics-cardBg-color);
  border: 1px solid var(--primary-pink-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 0, 122, 0.2);
}

.error-icon {
  color: var(--primary-pink-color);
  flex-shrink: 0;
}

.error-text {
  color: var(--comics-cardText-color);
  font-size: 14px;
  white-space: nowrap;
}

.close-icon {
  color: var(--comics-headerIcon-color);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.3s;

  &:hover {
    color: var(--primary-pink-color);
  }
}
</style>
