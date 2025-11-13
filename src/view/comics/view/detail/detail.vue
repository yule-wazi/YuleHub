<template>
  <div class="detail">
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
      <CommentsCard :comments="comments" :commentsCount="detailDataAll.imgDetail?.total_comments" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

const vipStore = useVip()
const route = useRoute()
// SessionStorage key 前缀
const STORAGE_PREFIX = 'COMICS_DETAIL_CACHE:'
// 获取缓存 key（基于 pid）
const getStorageKey = (pid) => {
  if (!pid) return ''
  return `${STORAGE_PREFIX}${pid}`
}
// 保存数据到 sessionStorage
const saveToSession = (pid) => {
  if (!pid || !vipStore.detailDataAll || Object.keys(vipStore.detailDataAll).length === 0) {
    return
  }
  const storageKey = getStorageKey(pid)
  const cacheData = {
    detailData: { ...vipStore.detailData },
    detailDataAll: { ...vipStore.detailDataAll },
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
    return cached
  }
  return null
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
  } else {
    await vipStore.fetchImgDetailAll(pid, vipStore.detailData.uid)
    detailDataAll.value = vipStore.detailDataAll
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
  // 展示主图
  // if (vipStore.detailData?.coverImg?.large) {
  //   const origin = switchImgResolutionUrl(vipStore.detailData.coverImg.large, 'origin')
  //   preLoadImg(origin).then(({ src }) => (showImg.value = src))
  // }

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
  margin-top: 24px;
  display: grid;
  gap: 24px;
  @media (min-width: 1000px) {
    grid-template-columns: minmax(0, 1fr) 420px;
  }
  .main {
    max-width: 85vw;
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
</style>
