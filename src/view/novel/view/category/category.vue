<template>
  <div class="category">
    <div class="title">
      <div class="tag">#{{ route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="showList">
      <template v-for="item in novelStore.novelList">
        <ImageItem :itemData="item" />
      </template>
    </div>
    <Loading :dataList="novelStore.novelList" @loadingEmit="loadingSearch" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import useNovel from '@/sotre/module/novel.js'
import Loading from '@/components/loading/loading.vue'
const route = useRoute()
const novelStore = useNovel()
// 页面刷新自动给tagName赋值
novelStore.novelTag = route.query.tag
let pageCount = 1
// 发起图片组请求
if (!novelStore.novelList.length) {
  novelStore.fetchCateNovel(novelStore.novelTag, ++pageCount)
}
// loading发起请求
const loadingSearch = () => {
  novelStore.fetchCateNovel(novelStore.novelTag, ++pageCount)
}
</script>

<style lang="less" scoped>
.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--comics-bg-color);
  height: 100%;
  width: 100%;
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
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
}
</style>
