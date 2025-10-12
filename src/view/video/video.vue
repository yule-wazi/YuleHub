<template>
  <div class="video">
    <HeaderCompoment title="YULE动画" @searchClickEmit="searchClick" />
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
