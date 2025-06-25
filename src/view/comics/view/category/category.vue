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
    <Loading />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import useVip from '@/sotre/module/vip'
import { watch } from 'vue'
import Loading from '../../cpns/loading.vue'
const route = useRoute()
const vipStore = useVip()
// 发起图片组请求
vipStore.fetchGroupImgList({ isRefresh: true, options: { keyword: route.query.tag } })
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
    }
  }
}
</style>
