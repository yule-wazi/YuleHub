<template>
  <ScrollBar :tagList="tagList" @scrollTopEmit="scrollTop" />
  <div ref="home" class="home">
    <div class="list">
      <template v-for="item in picaStore.categoryList">
        <ImageItem
          :itemData="item"
          :dataList="picaStore.categoryList"
          @errorEmit="removeErrorData(item)"
        />
      </template>
    </div>
    <Loading :dataList="picaStore.categoryList" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import ImageItem from '../../cpns/imageItem.vue'
import Loading from '@/components/loading/loading.vue'
import usePica, { tagList } from '@/sotre/module/pica'
import { scrollRestore } from '@/utils/scrollRestore'
import ScrollBar from '../../cpns/scrollBar.vue'
import { ref, useTemplateRef } from 'vue'
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
const home = ref(null)
// 回到顶部
const scrollTop = () => {
  home.value.scrollTo({ top: 0 })
}
// 回到当前位置
scrollRestore('home', picaStore)
// 清除异常数据
const removeErrorData = (errorItem) => {
  console.log('异常数据', errorItem)
  picaStore.categoryList = picaStore.categoryList.filter((item) => errorItem !== item)
}
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  .list {
    width: 100%;
    margin-top: 10px;
    position: relative;
    @media (min-width: 1000px) {
      width: 90%;
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
