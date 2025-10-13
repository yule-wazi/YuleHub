<template>
  <div ref="category" class="category">
    <div class="title">
      <div class="tag">#{{ route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="list">
      <template v-for="item in videoStore.videoList">
        <ImageItem :itemData="item" />
      </template>
    </div>
  </div>
  <Loading :dataList="videoStore.videoList" @loadingEmit="loadingFetch" />
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import { useRoute } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import { scrollRestore } from '@/utils/scrollRestore'
import { ref, watchEffect } from 'vue'

const route = useRoute()
const videoStore = useVideo()

// 页面刷新自动给tagName赋值
videoStore.tagName = route.query.tag
// 发起图片组请求
if (!videoStore.videoList.length) {
  videoStore.currentPage = 1
  console.log('重新请求数据')
  videoStore.searchVideoList({ isRefresh: true, keyword: videoStore.tagName })
}
const loadingFetch = () => {
  videoStore.currentPage++
  videoStore.searchVideoList({
    keyword: videoStore.tagName,
    page: videoStore.currentPage,
  })
}
scrollRestore('category', videoStore)
// 重新请求回到顶部
const category = ref(null)
watchEffect(() => {
  if (!videoStore.videoList.length) {
    videoStore.scrollTop = 0
    if (category.value) {
      console.log('回到顶部')
      category.value.scrollTo({ top: 0 })
    }
  }
})
</script>

<style lang="less" scoped>
.category {
  background-color: var(--comics-bg-color);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
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
  .list {
    width: 100%;
    margin-top: 10px;
    position: relative;
    @media (min-width: 800px) {
      width: 80%;
    }
    @media (min-width: 1000px) {
      width: 100%;
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
