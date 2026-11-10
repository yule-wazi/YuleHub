<template>
  <div class="detail">
    <div class="gridArea">
      <div class="main">
        <MainImg />
        <ImageInfoAndDownoad v-model="detailDataAll.imgDetail" />
        <ImageInfoCard v-bind="detailDataAll.imgDetail" />
        <div class="comment pc">
          <CommentsCard
            :comments="comments"
            :commentsCount="detailDataAll.imgDetail?.total_comments"
          />
        </div>
      </div>
      <div class="sideBar">
        <ArtistCard v-bind="detailDataAll.artistDetail" />
        <ArtistMoreCard :imgList="detailDataAll.moreImgFromArtist" />
        <RelatedArtistCard :artistList="relatedArtist" />
      </div>
      <div class="comment mobel">
        <CommentsCard
          :comments="comments"
          :commentsCount="detailDataAll.imgDetail?.total_comments"
        />
      </div>
    </div>
    <div class="relatedImg">
      <RelatedImgCard />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { sessionCache } from '@/utils/cacheStorage'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import ArtistCard from './cpns/artistCard.vue'
import ImageInfoCard from './cpns/imgInfoCard.vue'
import ImageInfoAndDownoad from './cpns/imageInfoAndDownoad.vue'
import ArtistMoreCard from './cpns/artistMoreCard.vue'
import RelatedArtistCard from './cpns/relatedArtistCard.vue'
import CommentsCard from './cpns/commentsCard.vue'
import { getPixivImgComments, getPixivRelatedArtist } from '@/service/module/vip'
import MainImg from './cpns/mainImg.vue'
import RelatedImgCard from './cpns/relatedImgCard.vue'

const vipStore = useVip()
const route = useRoute()

// SessionStorage key 前缀
const STORAGE_PREFIX = 'COMICS_DETAIL_CACHE:'

// 获取缓存 key（基于 pid）
const getStorageKey = (pid) => {
  if (!pid) return ''
  return `${STORAGE_PREFIX}${pid}`
}

// 清理最旧的缓存数据（一次性删除多条）
const clearOldestCache = (count = 20) => {
  try {
    const keys = Object.keys(sessionStorage)
    const cacheKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX))

    if (cacheKeys.length === 0) {
      console.warn('没有可清理的缓存')
      return 0
    }

    // 按时间戳排序，找到最旧的缓存
    const cacheData = cacheKeys
      .map((key) => {
        try {
          const data = JSON.parse(sessionStorage.getItem(key))
          return { key, timestamp: data.timestamp || 0 }
        } catch {
          return { key, timestamp: 0 }
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp)

    // 删除最旧的 N 条缓存（最多删除现有缓存的一半）
    const deleteCount = Math.min(count, Math.ceil(cacheData.length / 2))
    const toDelete = cacheData.slice(0, deleteCount)

    let deletedCount = 0
    toDelete.forEach((item) => {
      try {
        sessionStorage.removeItem(item.key)
        deletedCount++
      } catch (err) {
        console.error(`删除缓存失败: ${item.key}`, err)
      }
    })

    console.log(`✅ 清理了 ${deletedCount} 条最旧的缓存`)
    return deletedCount
  } catch (error) {
    console.error('清理缓存失败:', error)
    return 0
  }
}

// 设置 sessionCache 的配额超出回调
sessionCache.onQuotaExceeded = (key, value, error) => {
  console.warn('⚠️ SessionStorage 配额超出，开始清理最旧的 20 条缓存...')

  // 一次性清理 20 条最旧的缓存
  const deletedCount = clearOldestCache(20)

  if (deletedCount === 0) {
    console.error('❌ 没有可清理的缓存了')
    return false
  }

  // 清理后尝试重新保存
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
    console.log(`✅ 清理 ${deletedCount} 条缓存后保存成功`)
    return true
  } catch (retryError) {
    if (retryError.name === 'QuotaExceededError') {
      console.error('❌ 清理 20 条后仍然空间不足，尝试清理更多...')
      // 再清理 20 条
      const secondDeleteCount = clearOldestCache(20)
      if (secondDeleteCount === 0) {
        console.error('❌ 没有更多缓存可清理了')
        return false
      }

      // 再次尝试保存
      try {
        sessionStorage.setItem(key, JSON.stringify(value))
        console.log(`✅ 清理 ${deletedCount + secondDeleteCount} 条缓存后保存成功`)
        return true
      } catch (finalError) {
        console.error('❌ 清理 40 条缓存后仍然失败，放弃保存')
        return false
      }
    } else {
      console.error('❌ 重试时发生其他错误:', retryError)
      return false
    }
  }
}

// 获取滚动容器
const getScrollContainer = () => {
  // 查找 .comics 滚动容器
  let element = document.querySelector('.detail')
  while (element && element.parentElement) {
    const parent = element.parentElement
    const style = getComputedStyle(parent)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return parent
    }
    element = parent
  }
  return null
}

// 保存数据到 sessionStorage
const saveToSession = (pid) => {
  if (!pid || !vipStore.detailDataAll || Object.keys(vipStore.detailDataAll).length === 0) {
    return
  }

  // 获取当前滚动位置
  const scrollContainer = getScrollContainer()
  const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0
  const storageKey = getStorageKey(pid)
  const cacheData = {
    detailData: { ...vipStore.detailData },
    detailDataAll: {
      ...vipStore.detailDataAll,
      scrollTop: scrollTop, // 保存滚动位置
    },
    authorDetail: vipStore.authorDetail,
    currentDetailShowImg: vipStore.currentDetailShowImg,
    comments: comments.value, // 保存评论
    relatedArtist: relatedArtist.value, // 保存相关作者
    timestamp: Date.now(), // 更新时间戳
  }

  // 直接保存，错误处理由 sessionCache.onQuotaExceeded 回调处理
  try {
    sessionCache.set(storageKey, cacheData)
  } catch (error) {
    // 如果回调处理后仍然失败，这里只记录日志
    console.error('保存缓存最终失败:', error)
  }
}
// 从 sessionStorage 恢复数据
const restoreFromSession = (pid) => {
  if (!pid) return null
  const storageKey = getStorageKey(pid)
  const cached = sessionCache.get(storageKey)
  if (cached && cached.detailDataAll) {
    vipStore.detailDataAll = cached.detailDataAll
    vipStore.detailData = cached.detailData
    vipStore.authorDetail = cached.authorDetail
    vipStore.currentDetailShowImg = cached.currentDetailShowImg
    return cached
  }
  return null
}
// 恢复滚动位置
const restoreScrollPosition = (scrollTop) => {
  if (!scrollTop || scrollTop === 0) return

  const scrollContainer = getScrollContainer()
  if (scrollContainer) {
    // 使用 nextTick 确保 DOM 已更新
    setTimeout(() => {
      scrollContainer.scrollTo({ top: scrollTop, behavior: 'auto' })
    }, 100)
  }
}

// 初始化详情数据
let detailDataAll = ref({})
let comments = ref([])
let relatedArtist = ref([])
let currentLoadingPid = null // 当前正在加载的 pid，防止快速切换时请求交叉

const initDetailData = async () => {
  const pid = Number(route.query.pid)
  if (!pid) {
    return
  }

  // 设置当前加载的 pid
  currentLoadingPid = pid

  // 🔄 立即清空所有旧数据，显示加载状态（包括外部进入的情况）
  relatedArtist.value = []
  comments.value = []
  if (vipStore.detailDataAll) {
    vipStore.detailDataAll.moreImgFromArtist = new Array(6) // ✅ 6个占位显示骨架屏
    vipStore.detailDataAll.relatedImgList = { list: [], page: 1 }
    vipStore.detailDataAll.artistDetail = {} // ✅ 清空作者详情
    vipStore.detailDataAll.imgDetail = {} // ✅ 清空图片信息
  }

  // 先检查缓存
  const cached = restoreFromSession(pid)
  if (cached) {
    detailDataAll.value = cached.detailDataAll
    // 恢复评论和相关作者
    if (cached.comments) {
      comments.value = cached.comments
    }
    if (cached.relatedArtist) {
      relatedArtist.value = cached.relatedArtist
    }
    // 恢复滚动位置
    const scrollTop = cached.detailDataAll?.scrollTop || 0
    restoreScrollPosition(scrollTop)
    console.log('✅ 从缓存恢复数据')
    return
  }

  // 🎯 第一层：立即使用路由传递的数据渲染（detailData）
  // detailData 已经在跳转时设置，MainImg 组件可以立即展示
  console.log('🎯 使用 detailData 立即渲染主图')

  // 初始化 detailDataAll 结构（防止子组件访问 undefined）
  if (!vipStore.detailDataAll || typeof vipStore.detailDataAll !== 'object') {
    vipStore.detailDataAll = {}
  }
  detailDataAll.value = vipStore.detailDataAll

  // ⚡ 第二层：并发请求核心数据（作品详情 + 作者详情）
  console.log('⚡ 开始加载核心数据...')
  const corePromises = [
    vipStore.fetchImgDetailCore(pid, vipStore.detailData.uid).catch((err) => {
      console.error('作品详情加载失败:', err)
      return null
    }),
    vipStore.fetchArtistDetail(vipStore.detailData.uid).catch((err) => {
      console.error('作者详情加载失败:', err)
      return null
    }),
  ]

  // 等待核心数据完成
  await Promise.allSettled(corePromises)

  // 检查是否已切换到其他页面
  if (currentLoadingPid !== pid) {
    console.log('⚠️ 已切换到其他页面，终止加载')
    return
  }

  console.log('✅ 核心数据加载完成')

  // 更新当前展示图片
  if (vipStore.detailDataAll?.imgDetail?.coverImg?.large) {
    vipStore.currentDetailShowImg = vipStore.detailDataAll.imgDetail.coverImg.large
  }

  // 首次加载，滚动到顶部
  const scrollContainer = getScrollContainer()
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: 'auto' })
  }

  // 保存核心数据到缓存
  saveToSession(pid)

  // 🌊 第三层：延迟 300ms 加载补充内容（作者更多作品 + 评论）
  setTimeout(async () => {
    if (currentLoadingPid !== pid) return

    console.log('🌊 开始加载补充内容...')
    const extraPromises = [
      vipStore.fetchArtistMoreWorks(vipStore.detailData.uid),
      getPixivImgComments(pid)
        .then((res) => {
          if (currentLoadingPid === pid) {
            comments.value = res.data.comments
          }
        })
        .catch((err) => {
          console.error('评论加载失败:', err)
        }),
    ]

    await Promise.allSettled(extraPromises)

    if (currentLoadingPid === pid) {
      console.log('✅ 补充内容加载完成')
      saveToSession(pid)
    }
  }, 300)

  // 🎨 第四层：延迟 500ms 加载扩展内容（相关作品 + 相关作者）
  setTimeout(async () => {
    if (currentLoadingPid !== pid) return

    console.log('🎨 开始加载扩展内容...')
    const expandPromises = [
      vipStore.fetchRelatedImgInit(pid),
      getPixivRelatedArtist(vipStore.detailData.uid)
        .then((res) => {
          if (currentLoadingPid === pid) {
            relatedArtist.value = res.data.user_previews
          }
        })
        .catch((err) => {
          console.error('相关作者加载失败:', err)
        }),
    ]

    await Promise.allSettled(expandPromises)

    if (currentLoadingPid === pid) {
      console.log('✅ 扩展内容加载完成')
      saveToSession(pid)
    }
  }, 500)
}
// p站获取高清图片
const showImg = ref('')
const imgList = ref([])

watch(
  () => route.query,
  async (newQuery, oldQuery) => {
    const pid = newQuery.pid
    const oldPid = oldQuery.pid
    if ((pid || oldPid) && pid !== oldPid) {
      // 先保存旧的 pid 数据
      if (oldPid && vipStore.detailDataAll && Object.keys(vipStore.detailDataAll).length > 0) {
        saveToSession(oldPid)
      }

      // 🔄 立即清空所有旧数据，显示加载状态
      comments.value = []
      relatedArtist.value = []
      // 清空 detailDataAll 中的延迟加载数据
      if (vipStore.detailDataAll) {
        vipStore.detailDataAll.moreImgFromArtist = new Array(6) // ✅ 6个占位显示骨架屏
        vipStore.detailDataAll.relatedImgList = { list: [], page: 1 }
        // ✅ 清空作者详情，显示默认值
        vipStore.detailDataAll.artistDetail = {}
        // ✅ 清空图片详情，显示默认值
        vipStore.detailDataAll.imgDetail = {}
      }

      // 再加载新的 pid 数据
      initDetailData()
    }
  },
)
watch(
  detailDataAll,
  () => {
    if (detailDataAll.value.imgDetail?.coverImg?.large) {
      const origin = switchImgResolutionUrl(detailDataAll.value.imgDetail.coverImg.large, 'origin')
      preLoadImg(origin).then(({ src }) => (showImg.value = src))
    }
    //遍历展示所有图片
    imgList.value = detailDataAll.value.moreImgFromArtist?.map((item) =>
      switchImgResolutionUrl(item.image_urls.large, 'origin'),
    )
  },
  { deep: true },
)
// 组件挂载时加载其他作品
onMounted(async () => {
  if (!detailDataAll.value || Object.keys(detailDataAll.value).length === 0) {
    initDetailData()
  }
  // 评论和相关作者会在 initDetailData 中异步加载，这里不需要重复请求
})

// 路由离开前保存数据
onBeforeRouteLeave(() => {
  const pid = route.query.pid
  if (pid && detailDataAll.value && Object.keys(detailDataAll.value).length > 0) {
    saveToSession(pid)
  }
})
</script>

<style lang="less" scoped>
.detail {
  max-width: 85vw;
  margin: auto;
  @media (max-width: 1000px) {
    max-width: 100vw;
  }
  .gridArea {
    margin-top: 24px;
    display: grid;
    gap: 24px;
    @media (min-width: 1000px) {
      grid-template-columns: minmax(0, 1fr) 420px;
    }
    @media (max-width: 1000px) {
      margin-top: 0;
    }
    .main {
      max-width: 85vw;
      @media (max-width: 1000px) {
        max-width: 100vw;
      }
      .comment {
        &.pc {
          margin-top: 24px;
        }
      }
    }
    .sideBar {
      display: flex;
      flex-direction: column;
      grid-gap: 24px;
    }
    .comment {
      &.pc {
        display: block;
        @media (max-width: 1000px) {
          display: none;
        }
      }
      &.mobel {
        display: none;
        @media (max-width: 1000px) {
          display: block;
        }
      }
    }
  }
  .relatedImg {
    margin-top: 24px;
    border-top: 2px solid var(--comics-border-color);
  }
}
</style>
