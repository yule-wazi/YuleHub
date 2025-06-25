<template>
  <div class="detail">
    <div class="headerImg">
      <img :src="detailData.url" alt="">
    </div>
    <div class="title">{{ detailData.title }}</div>
    <div class="author">{{ detailData.user }}</div>
    <div class="tagList"></div>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip';

  const vipStore = useVip()
  const detailData = vipStore.detailData
  console.log(vipStore.detailData)
</script>

<style lang="less" scoped>
  
</style>