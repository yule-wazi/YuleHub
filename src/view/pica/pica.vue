<template>
  <div class="pica">
    <HeaderCompoment title="Yule漫画" @searchClickEmit="searchClick" />
    <RouterView />
  </div>
</template>

<script setup>
import HeaderCompoment from '@/components/headerComponent/headerCompoment.vue'
import usePica from '@/sotre/module/pica'
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
const picaStore = usePica()
// 移除图片
onUnmounted(() => {
  console.log('销毁图片列表')
  picaStore.categoryList = []
})
// 点击搜索
const router = useRouter()
const searchClick = (tag) => {
  // 清空列表
  picaStore.categoryList = []
  picaStore.tagName = tag
  picaStore.currentPage = 1
  picaStore.searchPicaList({ isRefresh: true, keyword: tag })
  router.push({
    path: '/pica/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.pica {
  height: 100vh;
  width: 100%;
  overflow: auto;
  padding-top: 60px;
  box-sizing: border-box;
  background-color: var(--comics-bg-color);
  
}
</style>
