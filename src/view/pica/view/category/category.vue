<template>
  <div class="category">
    <div class="title">
      <div class="tag">#{{ route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="showList">
      <template v-for="item in picaStore.categoryList">
        <ImageItem :itemData="item" />
      </template>
    </div>
    <Loading :dataList="picaStore.categoryList" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import Loading from '@/components/loading/loading.vue'
import usePica from '@/sotre/module/pica'
const route = useRoute()
const picaStore = usePica()
// 页面刷新自动给tagName赋值
picaStore.tagName = route.query.tag
// 发起图片组请求
if (!picaStore.categoryList.length) {
  picaStore.currentPage = 1
  picaStore.searchPicaList({ isRefresh: true, keyword: picaStore.tagName })
}
// loading加载发起请求
const loadingFetch = () => {
  picaStore.currentPage++
  picaStore.searchPicaList({ keyword: picaStore.tagName })
}
</script>

<style scoped>
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
