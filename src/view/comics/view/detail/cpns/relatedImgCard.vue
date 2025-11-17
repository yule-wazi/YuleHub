<template>
  <div class="relatedImgCard">
    <div class="title">相关作品</div>
    <div class="list">
      <template v-for="item in relatedImgList" :key="item.pid">
        <ImageItem :itemData="item" :dataList="relatedImgList" @errorEmit="removeErrorData(item)" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import useVip from '@/sotre/module/vip'
import ImageItem from '@/view/comics/cpns/imageItem.vue'
import { flowFlex } from '@/utils/waterflow'
import { storeToRefs } from 'pinia'

const vipStore = useVip()
const route = useRoute()
const { detailDataAll } = storeToRefs(vipStore)

// 格式化相关作品数据
const relatedImgList = computed(() => {
  if (!detailDataAll.value.relatedImgList || !Array.isArray(detailDataAll.value.relatedImgList)) {
    return []
  }
  return detailDataAll.value.relatedImgList
    .filter((item) => item && item.id) // 过滤无效数据
    .map((item) => ({
      pid: item.id,
      uid: item.user?.id || 0,
      title: item.title || '无标题',
      user: item.user?.name || '',
      tags: item.tags || [],
      coverImg: item.image_urls || {},
      pageList: item.meta_pages || [],
      x_restrict: item.x_restrict || 0,
      width: item.width || 0,
      height: item.height || 0,
    }))
})

watch(
  () => relatedImgList.value,
  () => {
    if (relatedImgList.value.length > 0) {
      nextTick(() => {
        flowFlex({ imgList: relatedImgList.value, imgWidth: 320, isRefresh: true })
      })
    }
  },
)
// 清除异常数据
const removeErrorData = (errorItem) => {
  console.log('异常数据', errorItem)
  // 从 store 中移除错误数据
  if (vipStore.detailDataAll.relatedImgList) {
    vipStore.detailDataAll.relatedImgList = vipStore.detailDataAll.relatedImgList.filter(
      (item) => item.id !== errorItem.pid,
    )
  }
}
</script>

<style lang="less" scoped>
.relatedImgCard {
  width: 100%;
  .title {
    margin: 24px 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--comics-cardText-color);
  }
  .list {
    width: 100%;
    position: relative;
    min-height: 200px;
  }
}
</style>
