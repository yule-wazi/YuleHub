<template>
  <div class="pica">
    <HeaderCompoment title="Yule漫画" @searchClickEmit="searchClick">
      <template #switchOther>
        <div class="text">最多喜欢</div>
        <el-switch v-model="mostLike" size="large" change="mostLike = !mostLike" />
      </template>
    </HeaderCompoment>
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="['home', 'category']">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>

<script setup>
import { KeepAlive, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeaderCompoment from '@/components/headerComponent/headerCompoment.vue'
import usePica from '@/sotre/module/pica'
import myCache from '@/utils/cacheStorage'
const picaStore = usePica()
// 移除图片
onUnmounted(() => {
  console.log('销毁图片列表')
  picaStore.categoryList = []
})
// 切换最多喜欢
const mostLike = ref(myCache.get('mostLike') ?? false)
picaStore.mostLike = mostLike.value
watch(mostLike, () => {
  picaStore.mostLike = mostLike.value
  myCache.set('mostLike', mostLike.value)
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
  overflow: hidden;
  padding-top: 60px;
  box-sizing: border-box;
  background-color: var(--comics-bg-color);
}
</style>
