<template>
  <div class="novel">
    <headerCompoment title="YULE小说" @searchClickEmit="searchClick" />
    <RouterView />
  </div>
</template>

<script setup>
import headerCompoment from '@/components/headerComponent/headerCompoment.vue'
import useNovel from '@/sotre/module/novel.js'
import { useRouter } from 'vue-router'
const novelStore = useNovel()
const router = useRouter()
// 点击搜索
const searchClick = (tag) => {
  novelStore.novelTag = tag
  // 清空之前列表
  novelStore.novelList = []
  novelStore.currentPage = 1
  novelStore.fetchCateNovel(novelStore.novelTag)
  router.push({
    path: '/novel/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.novel {
  height: 100vh;
  width: 100%;
  overflow: auto;
  padding-top: 60px;
  box-sizing: border-box;
  background-color: var(--comics-bg-color);
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
