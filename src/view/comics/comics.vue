<template>
  <div class="comics">
    <ComicsHeader />
    <RouterView v-slot="{ Component }">
      <KeepAlive include="home,category">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue'
import ComicsHeader from './cpns/comicsHeader.vue'
import useVip from '@/sotre/module/vip'
import { RouterView } from 'vue-router'

const vipStore = useVip()
// 移除图片
onUnmounted(() => {
  console.log('销毁图片列表')
  vipStore.vipImgData = []
})
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
      width:8px;
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
