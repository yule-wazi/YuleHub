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
    currentDetailShowImg: vipStore.currentDetailShowImg,
    timestamp: Date.now(),
  }
  sessionCache.set(storageKey, cacheData)
}
// 从 sessionStorage 恢复数据
const restoreFromSession = (pid) => {
  if (!pid) return null
  const storageKey = getStorageKey(pid)
  const cached = sessionCache.get(storageKey)
  if (cached && cached.detailDataAll) {
    vipStore.detailDataAll = cached.detailDataAll
    vipStore.detailData = cached.detailData
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
const initDetailData = async () => {
  const pid = Number(route.query.pid)
  if (!pid) {
    return
  }
  const cached = restoreFromSession(pid)
  if (cached) {
    detailDataAll.value = cached.detailDataAll
    // 恢复滚动位置
    const scrollTop = cached.detailDataAll?.scrollTop || 0
    restoreScrollPosition(scrollTop)
  } else {
    await vipStore.fetchImgDetailAll(pid, vipStore.detailData.uid)
    detailDataAll.value = vipStore.detailDataAll
    vipStore.currentDetailShowImg = vipStore.detailDataAll.imgDetail.coverImg.large
    // 首次加载，滚动到顶部
    const scrollContainer = getScrollContainer()
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'auto' })
    }
    // 首次拿到数据缓存
    saveToSession(pid)
  }
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
      // 再加载新的 pid 数据
      initDetailData()
    }
    getPixivImgComments(route.query.pid).then((res) => {
      comments.value = res.data.comments
    })
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
  getPixivImgComments(route.query.pid).then((res) => {
    comments.value = res.data.comments
  })
  getPixivRelatedArtist(vipStore.detailData.uid).then((res) => {
    relatedArtist.value = res.data.user_previews
  })
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
