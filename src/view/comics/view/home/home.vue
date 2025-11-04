<template>
  <div ref="home" class="home">
    <div ref="list" class="list">
      <template v-for="(item, index) in vipStore.vipImgData" :key="`${item.pid}-${index}`">
        <ImageItem
          :itemData="item"
          :dataList="vipStore.vipImgData"
          @errorEmit="removeErrorData(item)"
        />
      </template>
    </div>
    <Loading :dataList="vipStore.vipImgData" @loadingEmit="loadingFetch" />
  </div>
</template>

<script setup>
import ImageItem from '../../cpns/imageItem.vue'
import useVip from '@/sotre/module/vip'
import Loading from '@/components/loading/loading.vue'
import { createQueryCache } from '@/utils/queryCache'
import myCache from '@/utils/cacheStorage'
import { ref, onMounted, onActivated, onBeforeUnmount, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const vipStore = useVip()
const home = ref(null)

// 创建查询缓存管理器（home 页面使用固定 key）
const queryCache = createQueryCache({
  prefix: 'COMICS_HOME_CACHE:',
  getR18Flag: () => myCache.get('isNSFW') ?? false,
  formatKey: (tag, uid, isR18) => {
    // home 页面使用固定 key
    const r18Flag = isR18 ? 'R18' : 'SFW'
    return `COMICS_HOME_CACHE:HOME_${r18Flag}`
  },
})

// 保存数据到缓存
const saveToSession = () => {
  if (vipStore.vipImgData.length > 0) {
    // 直接从 DOM 元素获取滚动位置
    const currentScrollTop = home.value ? home.value.scrollTop : 0
    queryCache.saveToCache(null, null, {
      list: vipStore.vipImgData,
      page: vipStore.currentPage,
      date: vipStore.validDate,
      scrollTop: currentScrollTop,
    })
  }
}

// 从缓存恢复数据
const restoreFromSession = () => {
  const cached = queryCache.restoreFromCache(null, null)
  if (cached) {
    vipStore.vipImgData = cached.list
    vipStore.currentPage = cached.page || 1
    vipStore.validDate = cached.date || null
    return cached // 返回完整缓存数据
  }
  return null
}

// 加载数据（带缓存检查）
const loadData = async () => {
  const cached = restoreFromSession()
  if (cached) {
    if (home.value && cached.scrollTop > 0) {
      home.value.scrollTo({ top: cached.scrollTop, behavior: 'smooth' })
    }
    return
  }
  // 缓存中没有，发起请求
  if (!vipStore.vipImgData.length) {
    await vipStore.fetchGroupImgList({ isRefresh: true })
  }
}


// KeepAlive 激活时（从缓存恢复）
onActivated(async () => {
  await loadData()
})

// 路由离开前保存滚动位置和缓存
onBeforeRouteLeave(() => {
  saveToSession()
})

const loadingFetch = async () => {
  vipStore.currentPage++
  await vipStore.fetchGroupImgList()
}

// 清除异常数据
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
