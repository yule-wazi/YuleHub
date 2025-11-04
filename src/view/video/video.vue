<template>
  <div class="video">
    <HeaderCompoment title="YULE动漫" @searchClickEmit="searchClick" />
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="['home', 'category']">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>

<script setup>
import HeaderCompoment from '@/components/headerComponent/headerCompoment.vue'
import useVideo from '@/sotre/module/video'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
const videoStore = useVideo()
const searchClick = (tag) => {
  videoStore.categoryList = []
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

<style scoped>
.video {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  padding-top: 60px;
  box-sizing: border-box;
  background-color: var(--comics-bg-color);
}
</style>
