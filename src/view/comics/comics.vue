<template>
  <div class="comics">
    <ComicsHeader />
    <RouterView />
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue'
import ComicsHeader from './cpns/comicsHeader.vue'
import useVip from '@/sotre/module/vip'

const vipStore = useVip()
// 移除图片
onUnmounted(() => {
  console.log("销毁图片列表")
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
  background-color: #f4f4f4;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
