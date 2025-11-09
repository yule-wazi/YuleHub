<template>
  <div class="detail">
    <div class="main">
      <div class="imageArea">
        <div class="image">
          <img :src="showImg" />
        </div>
        <ImageInfoAndDownoad />
      </div>
      <ImageInfoCard />
      <div class="comment pc">
        <CommentsCard />
      </div>
    </div>
    <div class="sideBar">
      <ArtistCard />
      <ArtistMoreCard />
      <RelatedArtistCard />
    </div>
    <div class="comment mobel">
      <CommentsCard />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Tag from '@/components/tag/tag.vue'
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { sessionCache } from '@/utils/cacheStorage'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import ArtistCard from './cpns/artistCard.vue'
import ImageInfoCard from './cpns/imgInfoCard.vue'
import ImageInfoAndDownoad from './cpns/imageInfoAndDownoad.vue'
import ArtistMoreCard from './cpns/artistMoreCard.vue'
import RelatedArtistCard from './cpns/relatedArtistCard.vue'
import CommentsCard from './cpns/commentsCard.vue'

const vipStore = useVip()
const router = useRouter()
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
  if (!pid || !vipStore.detailData || Object.keys(vipStore.detailData).length === 0) {
    return
  }
  const storageKey = getStorageKey(pid)
  const cacheData = {
    detailData: { ...vipStore.detailData },
    authorOtherImg: [...authorOtherImg.value],
    timestamp: Date.now(),
  }
  sessionCache.set(storageKey, cacheData)
}
// 从 sessionStorage 恢复数据
const restoreFromSession = (pid) => {
  if (!pid) return null
  const storageKey = getStorageKey(pid)
  const cached = sessionCache.get(storageKey)
  if (cached && cached.detailData) {
    vipStore.detailData = cached.detailData
    vipStore.authorOtherImg = cached.authorOtherImg
    return cached
  }
  return null
}
// 初始化详情数据
let detailData = ref({})
let authorOtherImg = ref([])
const initDetailData = async () => {
  const pid = Number(route.query.pid)
  if (!pid) {
    return
  }
  const cached = restoreFromSession(pid)
  if (cached) {
    detailData.value = cached.detailData
    authorOtherImg.value = cached.authorOtherImg
  } else {
    detailData.value = vipStore.detailData
    await loadOtherArts()
  }
}
// p站获取高清图片
const showImg = ref('')
const imgList = ref([])

watch(detailData, () => {
  if (detailData.value.coverImg?.large) {
    const origin = switchImgResolutionUrl(detailData.value.coverImg.large, 'origin')
    preLoadImg(origin).then(({ src }) => (showImg.value = src))
  }
  //遍历展示所有图片
  imgList.value = detailData.value.pageList?.map((item) => item.image_urls.large)
})

// 加载其他作品（检查缓存）
const loadOtherArts = async () => {
  const pid = route.query.pid
  if (!pid) return
  if (detailData.value.uid) {
    await vipStore.fetchOtherImgList(detailData.value.uid)
    // 请求完成后保存到缓存
    authorOtherImg.value = vipStore.authorOtherImg
    authorOtherImg.value = vipStore.authorOtherImg
  }
}

// 组件挂载时加载其他作品
onMounted(async () => {
  if (!detailData.value || Object.keys(detailData.value).length === 0) {
    await initDetailData()
  }
  if (authorOtherImg.value.length === 0) {
    await loadOtherArts()
  }
})

// 路由离开前保存数据
onBeforeRouteLeave(() => {
  const pid = route.query.pid
  if (pid && detailData.value && Object.keys(detailData.value).length > 0) {
    saveToSession(pid)
  }
})

// tag搜索
const getTag = (tag) => {
  // 删除之前列表
  vipStore.tagName = tag
  vipStore.vipSearchImgData = []
  vipStore.searchCurrentPage = 1
  vipStore.fetchSearchImgList({
    isRefresh: true,
    options: { word: vipStore.tagName, page: vipStore.searchCurrentPage },
  })
  router.push({
    path: '/comics/category',
    query: { tag },
  })
}

const goAuthor = async (detail) => {
  const detailObj = detail && detail.value ? detail.value : detail
  vipStore.tagName = detailObj.user
  vipStore.vipSearchImgData = []
  vipStore.searchCurrentPage = 1

  router.push({
    path: '/comics/category',
    query: { author: detailObj.user, uid: detailObj.uid },
  })
}
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
    .imageArea {
      .image {
        width: 100%;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 24px;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
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
</style>
