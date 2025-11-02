<template>
  <div ref="category" class="category">
    <div class="title">
      <div class="tag">#{{ route.query.author || route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="list">
      <template v-for="(item, index) in vipStore.vipSearchImgData" :key="`${item.pid}-${index}`">
        <ImageItem
          :itemData="item"
          :dataList="vipStore.vipSearchImgData"
          @errorEmit="removeErrorData(item)"
        />
      </template>
    </div>
    <Loading :dataList="vipStore.vipSearchImgData" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import ImageItem from '../../cpns/imageItem.vue'
import useVip from '@/sotre/module/vip'
import Loading from '@/components/loading/loading.vue'
import { createQueryCache } from '@/utils/queryCache'
import myCache from '@/utils/cacheStorage'
import { ref, watchEffect, onMounted, onActivated, onBeforeUnmount, watch, nextTick } from 'vue'

const route = useRoute()
const vipStore = useVip()
const category = ref(null)
// 创建查询缓存管理器
const queryCache = createQueryCache({
  prefix: 'COMICS_CACHE:',
  getR18Flag: () => myCache.get('isNSFW') ?? false,
})

// 保存数据到缓存
const saveToSession = (tag, uid) => {
  if (vipStore.vipSearchImgData.length > 0) {
    // 直接从 DOM 元素获取滚动位置
    const currentScrollTop = category.value ? category.value.scrollTop : 0
    queryCache.saveToCache(tag, uid, {
      list: vipStore.vipSearchImgData,
      page: vipStore.searchCurrentPage,
      date: vipStore.validDate,
      scrollTop: currentScrollTop,
    })
  }
}

// 从缓存恢复数据
const restoreFromSession = (tag, uid) => {
  const cached = queryCache.restoreFromCache(tag, uid)
  if (cached) {
    vipStore.vipSearchImgData = cached.list
    vipStore.searchCurrentPage = cached.page || 1
    vipStore.validDate = cached.date || null
    vipStore.tagName = tag || ''
    return cached // 返回完整缓存数据
  }
  return null
}

// 加载数据（带缓存检查）
const loadData = async () => {
  const tag = route.query.tag
  const uid = route.query.uid
  const cached = restoreFromSession(tag, uid)
  if (cached) {
    if (category.value && cached.scrollTop > 0) {
      category.value.scrollTo({ top: cached.scrollTop, behavior: 'smooth' })
    }
    return
  }
  vipStore.tagName = tag || ''
  vipStore.searchCurrentPage = 1
  if (uid) {
    await vipStore.fetchAuthorIllustsList({
      isRefresh: true,
      options: {
        id: uid,
        page: vipStore.searchCurrentPage,
      },
    })
  } else if (tag) {
    await vipStore.fetchSearchImgList({
      isRefresh: true,
      options: { word: tag, page: vipStore.searchCurrentPage },
    })
  }
}

// 初始加载
onMounted(async () => {
  await loadData()
})
// KeepAlive 激活时（从缓存恢复）
onActivated(async () => {
  await loadData()
})

// 路由离开前保存滚动位置和缓存
onBeforeRouteLeave(() => {
  saveToSession(route.query.tag, route.query.uid)
})

// 监听路由变化
watch(
  () => route.query,
  async (newQuery, oldQuery) => {
    const tag = newQuery.tag
    const uid = newQuery.uid
    const oldTag = oldQuery?.tag
    const oldUid = oldQuery?.uid
    // 如果 tag 或 uid 确实发生变化，才清空数据
    if ((tag || uid) && (tag !== oldTag || uid !== oldUid)) {
      saveToSession(oldTag, oldUid)
      vipStore.vipSearchImgData = []
      vipStore.searchCurrentPage = 1
      await loadData()
      // loadData 内部已经处理了滚动位置恢复
    }
  },
  { immediate: false },
)
// loading加载发起请求
const loadingFetch = async () => {
  vipStore.searchCurrentPage++
  const tag = route.query.tag
  const uid = route.query.uid
  if (uid) {
    await vipStore.fetchAuthorIllustsList({
      options: { id: uid, page: vipStore.searchCurrentPage },
    })
  } else if (tag) {
    await vipStore.fetchSearchImgList({
      options: { word: tag, page: vipStore.searchCurrentPage },
    })
  }
}

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
