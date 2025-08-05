<template>
  <div class="home">
    <div class="list">
      <template v-for="item in picaStore.categoryList">
        <ImageItem :itemData="item" />
      </template>
    </div>
    <Loading :dataList="picaStore.categoryList" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import ImageItem from '../../cpns/imageItem.vue'
import Loading from '@/components/loading/loading.vue'
import usePica from '@/sotre/module/pica'
const picaStore = usePica()
// 发起pica首页请求
if (!picaStore.categoryList.length) {
  picaStore.currentPage = 1
  picaStore.fetchCategoryDetail({ isRefresh: true })
}
const loadingFetch = () => {
  picaStore.currentPage++
  picaStore.fetchCategoryDetail()
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
