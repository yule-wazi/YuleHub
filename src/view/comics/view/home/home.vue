<template>
  <div class="home">
    <template v-for="item in vipStore.vipImgData">
      <ImageItem :itemData="item" />
    </template>
    <Loading />
  </div>
</template>

<script setup>
import ImageItem from '../../cpns/imageItem.vue'
import useVip from '@/sotre/module/vip'
import Loading from '../../cpns/loading.vue'

const vipStore = useVip()
// 发起图片组请求
vipStore.fetchGroupImgList()
</script>

<style lang="less" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
