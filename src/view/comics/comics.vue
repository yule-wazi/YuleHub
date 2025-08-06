<template>
  <div class="comics">
    <headerCompoment title="YULE插画" @searchClickEmit="searchClick" />
    <RouterView />
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue'
import headerCompoment from '@/components/headerComponent/headerCompoment.vue'
import useVip from '@/sotre/module/vip'
import { RouterView, useRouter } from 'vue-router'

const vipStore = useVip()
// 移除图片
onUnmounted(() => {
  console.log('销毁图片列表')
  vipStore.vipImgData = []
})
// 点击搜索
const router = useRouter()
const searchClick = (tag) => {
  vipStore.tagName = tag
  // 清空之前列表
  vipStore.vipImgData = []
  vipStore.fetchGroupImgList({ isRefresh: true, options: { keyword: tag } })
  router.push({
    path: '/comics/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.comics {
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
