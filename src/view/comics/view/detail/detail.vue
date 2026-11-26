<template>
  <div class="detail">
    <div class="gridArea">
      <div class="main">
        <MainImg ref="mainImgRef" :comments="comments" v-model:showDanmaku="showDanmaku" />
        <ImageInfoAndDownoad
          v-model="detailDataAll.imgDetail"
          v-model:showDanmaku="showDanmaku"
          @bookmark-change="handleBookmarkChange"
          :externalBookmarkTrigger="bookmarkTriggerFromInfoCard"
        />
        <ImageInfoCard
          v-bind="detailDataAll.imgDetail"
          :externalBookmarkTrigger="externalBookmarkTrigger"
          @bookmark-change="handleBookmarkChangeFromInfoCard"
        />
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
    <MiniWindow :target="mainImgRef?.$el" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, useTemplateRef } from 'vue'
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
import { getPixivImgComments, getPixivRelatedArtist, getPixivImgDetail } from '@/service/module/vip'
import MainImg from './cpns/mainImg.vue'
import MiniWindow from './cpns/miniWindow.vue'
import RelatedImgCard from './cpns/relatedImgCard.vue'

const vipStore = useVip()
const route = useRoute()
// 主图容器，用于小窗判断主图是否被滚出可视区域
const mainImgRef = useTemplateRef('mainImgRef')

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
      return 0
    }

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

    const deleteCount = Math.min(count, Math.ceil(cacheData.length / 2))
    const toDelete = cacheData.slice(0, deleteCount)

    let deletedCount = 0
    toDelete.forEach((item) => {
      try {
        sessionStorage.removeItem(item.key)
        deletedCount++
      } catch (err) {
        // 忽略错误
      }
    })

    return deletedCount
  } catch (error) {
    return 0
  }
}

// 设置 sessionCache 的配额超出回调
sessionCache.onQuotaExceeded = (key, value, error) => {
  const deletedCount = clearOldestCache(20)

  if (deletedCount === 0) {
    return false
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (retryError) {
    if (retryError.name === 'QuotaExceededError') {
      const secondDeleteCount = clearOldestCache(20)
      if (secondDeleteCount === 0) {
        return false
      }

      try {
        sessionStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (finalError) {
        return false
      }
    } else {
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

  // ⚠️ 根因修复：
  // vipStore.detailData / currentDetailShowImg 是“全局可变状态”，
  // 点击下一张作品时会被点击处理器（如 imageItem.vue getDetail）提前覆盖为新作品的数据，
  // 而此处保存的却是“旧作品”的缓存，于是把新作品的信息写进了旧作品的缓存。
  // 因此只有当全局状态确实属于当前 pid 时才采用；
  // 否则用 detailDataAll.imgDetail（完整且属于该 pid）重建，避免缓存串味。
  const imgDetail = vipStore.detailDataAll?.imgDetail
  const globalDetailData = vipStore.detailData
  let detailData
  if (globalDetailData && globalDetailData.pid === pid) {
    detailData = globalDetailData
  } else if (imgDetail && imgDetail.pid === pid) {
    detailData = {
      pid: imgDetail.pid,
      uid: imgDetail.uid,
      title: imgDetail.title,
      coverImg: imgDetail.coverImg,
      pageList: imgDetail.pageList,
      tags: imgDetail.tags,
      width: imgDetail.width,
      height: imgDetail.height,
      x_restrict: imgDetail.x_restrict,
    }
  } else {
    // 无法确定属于该 pid 的数据（例如旧作品详情加载失败），存空对象避免把其它作品信息写进本缓存
    detailData = {}
  }

  // currentDetailShowImg 同理：只有属于本 pid（封面或某一页）才保存，否则留空
  const currentImgBelongsToPid =
    !!vipStore.currentDetailShowImg &&
    (vipStore.currentDetailShowImg === imgDetail?.coverImg?.large ||
      (imgDetail?.pageList || []).some((p) => p.image_urls?.large === vipStore.currentDetailShowImg))
  const currentDetailShowImg = currentImgBelongsToPid ? vipStore.currentDetailShowImg : ''

  const cacheData = {
    detailData,
    detailDataAll: {
      ...vipStore.detailDataAll,
      scrollTop: scrollTop, // 保存滚动位置
    },
    authorDetail: vipStore.authorDetail,
    currentDetailShowImg,
    comments: comments.value, // 保存评论
    relatedArtist: relatedArtist.value, // 保存相关作者
    timestamp: Date.now(), // 更新时间戳
  }

  try {
    sessionCache.set(storageKey, cacheData)
    // console.log("存入缓存",storageKey,cacheData)
  } catch (error) {
    // 保存失败时静默处理
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

// 加载所有评论（分页加载）
const loadAllComments = async (pid) => {
  try {
    // 先获取作品详情，获取评论总数
    const detailRes = await getPixivImgDetail(pid)
    const totalComments = detailRes.data?.illust?.total_comments || 0

    if (totalComments === 0) {
      comments.value = []
      return
    }

    // 计算需要请求的页数（每页30条）
    const totalPages = Math.ceil(totalComments / 30)

    // 初始化评论数组
    const allComments = []

    // 逐页请求评论（不使用 Promise.all，避免相互影响）
    for (let page = 1; page <= totalPages; page++) {
      try {
        const res = await getPixivImgComments(pid, page)
        if (res.data?.comments && Array.isArray(res.data.comments)) {
          allComments.push(...res.data.comments)
        }
      } catch (err) {
        // 单个页面失败不影响其他页面，继续请求下一页
      }
    }

    // 检查是否还在当前页面
    if (currentLoadingPid === pid) {
      comments.value = allComments
    }
  } catch (err) {
    // 获取详情失败时，降级为只获取第一页
    try {
      const res = await getPixivImgComments(pid, 1)
      if (currentLoadingPid === pid && res.data?.comments) {
        comments.value = res.data.comments
      }
    } catch (fallbackErr) {
      // 完全失败时设置为空数组
      if (currentLoadingPid === pid) {
        comments.value = []
      }
    }
  }
}

// 初始化详情数据
let detailDataAll = ref({})
let comments = ref([])
let relatedArtist = ref([])

// 弹幕显示状态 - 从 localStorage 读取，默认为 true
const DANMAKU_STORAGE_KEY = 'COMICS_DANMAKU_ENABLED'
const getDanmakuState = () => {
  try {
    const saved = localStorage.getItem(DANMAKU_STORAGE_KEY)
    return saved === null ? true : saved === 'true'
  } catch {
    return true
  }
}
let showDanmaku = ref(getDanmakuState())

// 监听弹幕状态变化，保存到 localStorage
watch(showDanmaku, (newVal) => {
  try {
    localStorage.setItem(DANMAKU_STORAGE_KEY, String(newVal))
  } catch (err) {
    console.error('保存弹幕状态失败:', err)
  }
})

// 外部收藏触发器 - 用于通知 imgInfoCard 更新收藏状态
let externalBookmarkTrigger = ref(0)
// 外部收藏触发器 - 用于通知 imageInfoAndDownoad 更新收藏状态
let bookmarkTriggerFromInfoCard = ref(0)

// 处理收藏状态变化（从 imageInfoAndDownoad 组件触发）
const handleBookmarkChange = ({ pid, isBookmarked }) => {
  externalBookmarkTrigger.value++
}

// 处理收藏状态变化（从 imgInfoCard 组件触发）
const handleBookmarkChangeFromInfoCard = ({ pid, isBookmarked }) => {
  bookmarkTriggerFromInfoCard.value++
}

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
    // console.log('✅ 从缓存恢复数据', cached)
    return
  }

  // 🎯 第一层：立即使用路由传递的数据渲染（detailData）

  // 初始化 detailDataAll 结构（防止子组件访问 undefined）
  if (!vipStore.detailDataAll || typeof vipStore.detailDataAll !== 'object') {
    vipStore.detailDataAll = {}
  }
  detailDataAll.value = vipStore.detailDataAll

  // ⚡ 第二层：并发请求核心数据（作品详情 + 作者详情）
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

  setTimeout(async () => {
    if (currentLoadingPid !== pid) return

    const extraPromises = [
      vipStore.fetchArtistMoreWorks(vipStore.detailData.uid),
      loadAllComments(pid),
    ]

    await Promise.allSettled(extraPromises)

    if (currentLoadingPid === pid) {
      saveToSession(pid)
    }
  }, 300)

  setTimeout(async () => {
    if (currentLoadingPid !== pid) return

    const expandPromises = [
      vipStore.fetchRelatedImgInit(pid),
      getPixivRelatedArtist(vipStore.detailData.uid)
        .then((res) => {
          if (currentLoadingPid === pid) {
            relatedArtist.value = res.data.user_previews
          }
        })
        .catch((err) => {
          // 相关作者加载失败时静默处理
        }),
    ]

    await Promise.allSettled(expandPromises)

    if (currentLoadingPid === pid) {
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
