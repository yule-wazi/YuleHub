<template>
  <div class="pica">
    <HeaderCompoment
      title="YuLe漫画"
      @searchClickEmit="searchClick"
      :extraMenuItems="extraMenuItems"
    />
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="['home', 'category']">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>

<script setup>
import { KeepAlive, onUnmounted, ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Star, StarFilled } from '@element-plus/icons-vue'
import HeaderCompoment from '@/components/headerComponent/headerCompoment.vue'
import usePica from '@/sotre/module/pica'
import myCache from '@/utils/cacheStorage'
const picaStore = usePica()
// 移除图片
onUnmounted(() => {
  console.log('销毁图片列表')
  picaStore.picaSearchList = []
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
const route = useRoute()
const searchClick = (tag) => {
  picaStore.tagName = tag
  console.log('点击搜索', tag)
  // 清空之前列表
  picaStore.picaSearchList = []
  picaStore.searchCurrentPage = 1
  picaStore.searchPicaList({
    isRefresh: true,
    keyword: tag,
    page: picaStore.searchCurrentPage,
  })
  const targetRoute = {
    path: '/pica/category',
    query: { tag },
  }
  if (route.path === '/pica/category') {
    router.replace(targetRoute)
  } else {
    router.push(targetRoute)
  }
}

// 切换最多喜欢状态
const handleMostLike = () => {
  mostLike.value = !mostLike.value
}

// PC端和移动端的额外菜单项配置（支持动态图标）
const extraMenuItems = computed(() => [
  {
    icon: mostLike.value ? StarFilled : Star,
    onClick: handleMostLike,
    text: '最多喜欢',
    type: 'switch',
    value: mostLike.value,
    activeIcon: StarFilled,
    inactiveIcon: Star,
  },
])
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
