<template>
  <div ref="home" class="home">
    <div ref="list" class="list">
      <template v-for="item in vipStore.vipImgData">
        <ImageItem :itemData="item" @errorEmit="removeErrorData(item)" />
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
import { useTemplateRef } from 'vue'
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
// 清除一场数据
const removeErrorData = (errorItem) => {
  console.log('异常数据', errorItem)
  vipStore.vipImgData = vipStore.vipImgData.filter((item) => errorItem !== item)
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
