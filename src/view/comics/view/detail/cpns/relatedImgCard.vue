<template>
  <div class="relatedImgCard">
    <div class="title">相关作品</div>
    <div class="list">
      <template v-for="(item, index) in relatedImgList" :key="`${item.pid}-${index}`">
        <ImageItem :itemData="item" :dataList="relatedImgList" @errorEmit="removeErrorData(item)" />
      </template>
    </div>
    <Loading :dataList="relatedImgList" :root="null" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import { watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import useVip from '@/sotre/module/vip'
import ImageItem from '@/view/comics/cpns/imageItem.vue'
import Loading from '@/components/loading/loading.vue'
import { flowFlex, throttledFlowFlex } from '@/utils/waterflow'
import { storeToRefs } from 'pinia'

const vipStore = useVip()
const route = useRoute()
const { detailDataAll } = storeToRefs(vipStore)

// 格式化相关作品数据
const relatedImgList = computed(() => {
  const relatedData = detailDataAll.value.relatedImgList
  if (!relatedData || !relatedData.list || !Array.isArray(relatedData.list)) {
    return []
  }
  return relatedData.list
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
// Loading 加载更多
const loadingFetch = async () => {
  const pid = route.query.pid
  if (!pid) return
  await vipStore.fetchRelatedImgList({
    isRefresh: false,
    pid: pid,
  })
}
// 监听数据变化，触发瀑布流布局
watch(
  () => relatedImgList.value.length,
  () => {
    if (relatedImgList.value.length > 0) {
      nextTick(() => {
        throttledFlowFlex({ imgList: relatedImgList.value, imgWidth: 320, isRefresh: false })
      })
    }
  },
)
// 监听数据列表本身的变化（切换页面时数据会被替换）
watch(
  () => detailDataAll.value.relatedImgList,
  (newData, oldData) => {
    if (newData !== oldData && newData && newData.list && newData.list.length > 0) {
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
  if (vipStore.detailDataAll.relatedImgList && vipStore.detailDataAll.relatedImgList.list) {
    vipStore.detailDataAll.relatedImgList.list = vipStore.detailDataAll.relatedImgList.list.filter(
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
