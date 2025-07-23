<template>
  <div class="home">
    <div class="list">
      <template v-for="item in vipStore.vipImgData">
        <ImageItem :itemData="item" />
      </template>
    </div>
    <Loading :dataList="vipStore.vipImgData" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import ImageItem from '../../cpns/imageItem.vue'
import useVip from '@/sotre/module/vip'
import Loading from '@/components/loading/loading.vue'
const vipStore = useVip()
// 发起图片组请求
if (!vipStore.vipImgData.length) {
  vipStore.fetchGroupImgList({ isRefresh: true })
}
const loadingFetch = () => {
  vipStore.fetchGroupImgList()
}
</script>

<style lang="less" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  .list {
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (min-width: 800px) {
      display: block;
      column-count: 3;
      column-gap: 20px;
    }
    @media (min-width: 1000px) {
      display: block;
      column-count: 4;
      column-gap: 10px;
    }
  }
}
</style>
