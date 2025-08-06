<template>
  <div ref="category" class="category">
    <div class="title">
      <div class="tag">#{{ route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="showList">
      <template v-for="item in vipStore.vipImgData">
        <ImageItem :itemData="item" />
      </template>
    </div>
    <Loading :dataList="vipStore.vipImgData" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import useVip from '@/sotre/module/vip'
import Loading from '@/components/loading/loading.vue'
import { scrollRestore } from '@/utils/scrollRestore'
const route = useRoute()
const vipStore = useVip()
// 页面刷新自动给tagName赋值
vipStore.tagName = route.query.tag
// 发起图片组请求
if (!vipStore.vipImgData.length) {
  vipStore.fetchGroupImgList({ isRefresh: true, options: { keyword: vipStore.tagName } })
}
// loading加载发起请求
const loadingFetch = () => {
  vipStore.fetchGroupImgList({ options: { keyword: vipStore.tagName } })
}
scrollRestore('category', vipStore)
</script>

<style lang="less" scoped>
.category {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: auto;
  flex-direction: column;
  align-items: center;
  background-color: var(--comics-bg-color);
  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    line-height: 50px;
    margin: 20px 0;
    font-size: 20px;
    font-weight: 700;
    background-color: var(--comics-cardBg-color);
    .tag {
      color: #ff007a;
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
    }
    .text {
      color: var(--comics-cardTitle-color);
    }
  }
  .showList {
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
