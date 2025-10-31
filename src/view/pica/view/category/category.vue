<template>
  <div ref="category" class="category">
    <div class="title">
      <div class="tag">#{{ route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="list">
      <template v-for="item in picaStore.picaSearchList">
        <ImageItem
          :itemData="item"
          :dataList="picaStore.picaSearchList"
          @errorEmit="removeErrorData(item)"
        />
      </template>
    </div>
    <Loading :dataList="picaStore.picaSearchList" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import Loading from '@/components/loading/loading.vue'
import usePica from '@/sotre/module/pica'
import { scrollRestore } from '@/utils/scrollRestore'
import { ref, watchEffect } from 'vue'
const route = useRoute()
const picaStore = usePica()
// 页面刷新自动给tagName赋值
picaStore.tagName = route.query.tag
// 发起图片组请求
if (!picaStore.picaSearchList.length) {
  picaStore.searchCurrentPage = 1
  picaStore.searchPicaList({
    isRefresh: true,
    keyword: picaStore.tagName,
    page: picaStore.searchCurrentPage,
  })
}
// loading加载发起请求
const loadingFetch = () => {
  picaStore.searchCurrentPage++
  picaStore.searchPicaList({
    keyword: picaStore.tagName,
    page: picaStore.searchCurrentPage,
  })
}
// 回到当前位置
scrollRestore('category', picaStore)
// 重新请求回到顶部
const category = ref(null)
watchEffect(() => {
  if (!picaStore.picaSearchList.length) {
    picaStore.scrollTop = 0
    if (category.value) {
      console.log('回到顶部')
      category.value.scrollTo({ top: 0 })
    }
  }
})
// 清除异常数据
const removeErrorData = (errorItem) => {
  console.log('异常数据', errorItem)
  picaStore.picaSearchList = picaStore.picaSearchList.filter((item) => errorItem !== item)
}
</script>

<style scoped>
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
