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
const saveToSession = (rawPid) => {
  // 路由里 pid 是字符串，接口里是数字，统一转成数字再比较，避免 === 永不相等
  const pid = Number(rawPid)
  if (!pid || !vipStore.detailDataAll || Object.keys(vipStore.detailDataAll).length === 0) {
    return
  }

  const imgDetail = vipStore.detailDataAll?.imgDetail

  // 🔒 L1 完整性闸门：
  // 只有“作品核心详情确实属于该 pid”才允许落缓存。
  // 这样“刚进下一张就立刻退回”这种没加载完的情况，根本不会写出空壳脏缓存，
  // 刷新时自然也就会走网络重新拉取，而不是拿到坏缓存。
  if (!imgDetail || Number(imgDetail.pid) !== pid) {
    return
  }

  // 获取当前滚动位置
  const scrollContainer = getScrollContainer()
  const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0
  const storageKey = getStorageKey(pid)

  // vipStore.detailData / currentDetailShowImg 是“全局可变状态”，
  // 点击下一张作品时会被点击处理器（如 imageItem.vue getDetail）提前覆盖为新作品的数据。
  // 因此只有当全局状态确实属于当前 pid 时才采用；
  // 否则用 detailDataAll.imgDetail（完整且属于该 pid）重建。
  const globalDetailData = vipStore.detailData
  let detailData
  if (globalDetailData && Number(globalDetailData.pid) === pid) {
    detailData = globalDetailData
  } else {
    detailData = {
      pid,
      uid: imgDetail.uid,
      title: imgDetail.title,
      coverImg: imgDetail.coverImg,
      pageList: imgDetail.pageList,
      tags: imgDetail.tags,
      width: imgDetail.width,
      height: imgDetail.height,
      x_restrict: imgDetail.x_restrict,
    }
  }

  // currentDetailShowImg 同理：只有属于本 pid（封面或某一页）才保存，否则留空
  const currentImgBelongsToPid =
    !!vipStore.currentDetailShowImg &&
    (vipStore.currentDetailShowImg === imgDetail.coverImg?.large ||
      (imgDetail.pageList || []).some((p) => p.image_urls?.large === vipStore.currentDetailShowImg))
  const currentDetailShowImg = currentImgBelongsToPid ? vipStore.currentDetailShowImg : ''

  const cacheData = {
    detailData,
    detailDataAll: {
      ...vipStore.detailDataAll,
      // moreImgFromArtist 未加载完时是骨架 new Array(6)，经 JSON 序列化会
      // 变成 [null,null,...]，恢复后遍历会崩；这里过滤掉空项，只存真实数据
      moreImgFromArtist: (vipStore.detailDataAll.moreImgFromArtist || []).filter(Boolean),
      scrollTop: scrollTop, // 保存滚动位置
    },
    // 🔒 作者防串味：authorDetail 是全局单例，秒退时它的作者请求可能还没回来，
    // 此时仍是上一个作品的作者。只有它确实属于本 pid（id 对得上 imgDetail.uid）
    // 才持久化，否则存空对象——避免把上一副作者迁移进本作品缓存。
    authorDetail:
      vipStore.authorDetail && Number(vipStore.authorDetail.id) === Number(imgDetail.uid)
        ? vipStore.authorDetail
        : {},
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
const restoreFromSession = (rawPid) => {
  const pid = Number(rawPid)
  if (!pid) return null
  const storageKey = getStorageKey(pid)
  const cached = sessionCache.get(storageKey)
  const cachedImg = cached?.detailDataAll?.imgDetail

  // 🔒 L2 校验：缓存必须含有属于该 pid 的核心详情，否则视为脏缓存（旧版本写入的空壳），
  // 直接忽略并返回 null，让调用方走正常网络请求，实现“刷新即可自愈”。
  if (!cached || !cached.detailDataAll || !cachedImg || Number(cachedImg.pid) !== pid) {
    return null
  }

  // 🔒 作者校验：authorDetail 是全局单例，秒退时可能把上一个作品的作者串味写进本缓存。
  // 这里只在它确实属于本 pid（id 对得上 imgDetail.uid）时才采纳，否则置空，
  // 避免“上一副作者迁移到这一份”并持久保存。置空后 loadDeferred 会后台补拉。
  const cachedAuthorBelongs =
    cached.authorDetail && Number(cached.authorDetail.id) === Number(cachedImg.uid)
  vipStore.detailDataAll = cached.detailDataAll
  vipStore.detailData = cached.detailData
  vipStore.authorDetail = cachedAuthorBelongs ? cached.authorDetail : {}
  vipStore.currentDetailShowImg = cached.currentDetailShowImg

  // 缓存里作者缺失（早存或被串味清理）时，后台补拉一次，恢复完整
  if (!vipStore.authorDetail || !vipStore.authorDetail.id) {
    setTimeout(() => {
      if (vipStore.isStale(vipStore.reqId)) return
      vipStore.fetchArtistDetail(cachedImg.uid).then((res) => {
        if (vipStore.isStale(vipStore.reqId) || !res) return
        vipStore.detailDataAll.artistDetail = res.artistDetail
        vipStore.authorDetail = res.authorDetail
        saveToSession(pid)
      }).catch(() => {})
    }, 0)
  }
  return cached
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
const loadAllComments = async (pid, myReqId) => {
  // 令牌当前是否已过期；过期即代表期间已切走，任何写入都要丢弃
  const stale = () => vipStore.isStale(myReqId)
  try {
    // 先获取作品详情，获取评论总数
    const detailRes = await getPixivImgDetail(pid)
    if (stale()) return
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
      if (stale()) return
      try {
        const res = await getPixivImgComments(pid, page)
        if (res.data?.comments && Array.isArray(res.data.comments)) {
          allComments.push(...res.data.comments)
        }
      } catch (err) {
        // 单个页面失败不影响其他页面，继续请求下一页
      }
    }

    // 写回前再验一次令牌
    if (stale()) return
    comments.value = allComments
  } catch (err) {
    // 获取详情失败时，降级为只获取第一页
    try {
      const res = await getPixivImgComments(pid, 1)
      if (!stale() && res.data?.comments) {
        comments.value = res.data.comments
      }
    } catch (fallbackErr) {
      // 完全失败时设置为空数组
      if (!stale()) {
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

// 延迟补全：作者更多作品 + 相关作品 / 相关作者
// 首次加载会调用；缓存恢复时若这两块缺失（上次没加载完就离开），也用它后台补拉
const loadDeferred = async (pid, myReqId) => {
  if (vipStore.isStale(myReqId)) return

  const [moreWorks] = await Promise.all([
    vipStore.fetchArtistMoreWorks(vipStore.detailData.uid),
    loadAllComments(pid, myReqId),
  ])
  if (vipStore.isStale(myReqId)) return
  if (moreWorks) vipStore.detailDataAll.moreImgFromArtist = moreWorks
  saveToSession(pid)

  if (vipStore.isStale(myReqId)) return
  const [relatedInit, relatedArtistRes] = await Promise.all([
    vipStore.fetchRelatedImgInit(pid),
    getPixivRelatedArtist(vipStore.detailData.uid).catch(() => null),
  ])
  if (vipStore.isStale(myReqId)) return
  if (relatedInit) vipStore.detailDataAll.relatedImgList = relatedInit
  if (relatedArtistRes?.data?.user_previews) relatedArtist.value = relatedArtistRes.data.user_previews
  saveToSession(pid)
}

const initDetailData = async () => {
  const pid = Number(route.query.pid)
  if (!pid) {
    return
  }

  // 🎫 发令牌：reqId 自增，作废上一次导航所有未完成的异步写入
  const myReqId = vipStore.beginNavigation(pid)

  // 🔄 立即清空所有旧数据，显示加载状态（包括外部进入的情况）
  relatedArtist.value = []
  comments.value = []
  if (vipStore.detailDataAll) {
    vipStore.detailDataAll.moreImgFromArtist = new Array(6) // ✅ 6个占位显示骨架屏
    vipStore.detailDataAll.relatedImgList = { list: [], page: 1 }
    vipStore.detailDataAll.artistDetail = {} // ✅ 清空作者详情
    vipStore.detailDataAll.imgDetail = {} // ✅ 清空图片信息
  }

  // 先检查缓存（restoreFromSession 内部已带 L2 校验，脏缓存会被忽略并走网络）
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

    // 若缓存里“更多作品 / 相关作品”缺失（说明上次没加载完就离开），后台补拉，避免恢复出空白
    const deferredMissing =
      !cached.detailDataAll?.moreImgFromArtist?.length ||
      !cached.detailDataAll?.relatedImgList?.list?.length
    if (deferredMissing) {
      setTimeout(() => loadDeferred(pid, myReqId), 0)
    }
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
  // action 只返回数据、不写 store；这里在各自返回时先做令牌校验再写入，
  // 既保证“谁先回来谁先渲染”，又保证过期的结果绝不落地。
  await Promise.all([
    vipStore
      .fetchImgDetailCore(pid, vipStore.detailData.uid)
      .then((res) => {
        if (vipStore.isStale(myReqId) || !res) return
        vipStore.detailDataAll.imgDetail = res
        if (res.coverImg?.large) {
          vipStore.currentDetailShowImg = res.coverImg.large
        }
      })
      .catch((err) => {
        console.error('作品详情加载失败:', err)
      }),
    vipStore
      .fetchArtistDetail(vipStore.detailData.uid)
      .then((res) => {
        if (vipStore.isStale(myReqId) || !res) return
        vipStore.detailDataAll.artistDetail = res.artistDetail
        vipStore.authorDetail = res.authorDetail
      })
      .catch((err) => {
        console.error('作者详情加载失败:', err)
      }),
  ])

  // 🚦 令牌判决：期间已切走（或被新导航作废），丢弃后续动作（滚动、落缓存）
  if (vipStore.isStale(myReqId)) {
    console.log('⚠️ 令牌已过期，终止本次详情后续流程')
    return
  }

  // 首次加载，滚动到顶部
  const scrollContainer = getScrollContainer()
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: 'auto' })
  }

  // 保存核心数据到缓存
  saveToSession(pid)

  // 延迟补全（300ms 后，避免和核心数据抢资源）
  setTimeout(() => loadDeferred(pid, myReqId), 300)
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
    // 过滤掉骨架数组经 JSON 序列化后产生的 null 项，避免 item.image_urls 崩溃
    imgList.value = (detailDataAll.value.moreImgFromArtist || [])
      .filter((item) => item && item.image_urls)
      .map((item) => switchImgResolutionUrl(item.image_urls.large, 'origin'))
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
