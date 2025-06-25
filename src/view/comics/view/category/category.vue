<template>
  <div class="category">
    <div class="title">
      <div class="tag">#{{ route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="showList">
      <template v-for="item in vipStore.vipImgData">
        <ImageItem :itemData="item" />
      </template>
    </div>
    <Loading :options="{ keyword: route.query.tag }" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import useVip from '@/sotre/module/vip'
import Loading from '../../cpns/loading.vue'
import { watch, watchEffect } from 'vue'
const route = useRoute()
const vipStore = useVip()
// 页面刷新自动给tagName赋值
vipStore.tagName = route.query.tag
// 发起图片组请求
watch(
  () => vipStore.vipImgData,
  () => {
    if (!vipStore.vipImgData.length) {
      vipStore.fetchGroupImgList({ isRefresh: true, options: { keyword: vipStore.tagName } })
    }
  },
  { immediate: true },
)
</script>

<style lang="less" scoped>
.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f4f4f4;
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
    background-color: #fff;
    .tag {
      color: #ff007a;
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
    }
  }
}
</style>
