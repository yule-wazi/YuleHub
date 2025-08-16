<template>
  <div ref="category" class="category">
    <div class="title">
      <div class="tag">#{{ route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="list">
      <template v-for="item in vipStore.vipImgData">
        <ImageItem :itemData="item" @errorEmit="removeErrorData(item)" />
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
import { ref, useTemplateRef, watchEffect } from 'vue'
const route = useRoute()
const vipStore = useVip()
// 页面刷新自动给tagName赋值
vipStore.tagName = route.query.tag
// 发起图片组请求
if (!vipStore.vipImgData.length) {
  vipStore.currentPage = 1
  vipStore.fetchSearchImgList({
    isRefresh: true,
    options: { word: vipStore.tagName, page: vipStore.currentPage },
  })
}
// loading加载发起请求
const loadingFetch = () => {
  vipStore.currentPage++
  vipStore.fetchSearchImgList({ options: { word: vipStore.tagName, page: vipStore.currentPage } })
}
scrollRestore('category', vipStore)
// 重新请求回到顶部
const category = ref(null)
watchEffect(() => {
  if (!vipStore.vipImgData.length) {
    vipStore.scrollTop = 0
    if (category.value) {
      console.log('回到顶部')
      category.value.scrollTo({ top: 0 })
    }
  }
})
// 清除异常数据
const removeErrorData = (errorItem) => {
  console.log('异常数据', errorItem)
  vipStore.vipImgData = vipStore.vipImgData.filter((item) => errorItem !== item)
}
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
