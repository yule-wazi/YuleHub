<template>
  <div ref="home" class="home">
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
import { scrollRestore } from '@/utils/scrollRestore'
const vipStore = useVip()
// 发起图片组请求
if (!vipStore.vipImgData.length) {
  vipStore.fetchGroupImgList({ isRefresh: true })
}
const loadingFetch = () => {
  vipStore.fetchGroupImgList()
}
// 回到当前位置
scrollRestore('home', vipStore)
</script>

<style lang="less" scoped>
.home {
  display: flex;
  height: 100%;
  overflow: auto;
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
