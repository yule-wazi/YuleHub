<template>
  <div class="detail">
    <div class="title">
      <div class="text">{{ detailData.title }}</div>
      <div class="pid">(PID：{{ detailData.pid }})</div>
    </div>
    <div class="headerImg">
      <img v-if="!imgList.length" :src="showImg" />
      <template v-for="item in imgList">
        <img :src="switchImgResolutionUrl(item, 'origin')" alt="加载中..." />
      </template>
    </div>
    <div class="desc">
      <div class="author" @click="goAuthor(detailData)">
        <div class="authorName">
          <div class="text">作者:</div>
          <div class="name link">{{ detailData.user }}</div>
        </div>
        <div class="uid">(UID：{{ detailData.uid }})</div>
      </div>
      <div class="tagArea">
        <div class="tagTitle">文本标签</div>
        <div class="tagList">
          <template v-for="tag in detailData.tags" :key="tag.name">
            <Tag :tag="tag.name" @getTagEmit="getTag" />
          </template>
        </div>
      </div>
      <div class="otherArts">
        <div class="artsTitle">其他作品</div>
        <div class="imgList">
          <template v-for="item in authorOtherImg" :key="item">
            <div class="image">
              <img :src="item" alt="" />
            </div>
          </template>
        </div>
      </div>
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
  // 如果还没有数据，等待初始化完成
  if (!detailData.value || Object.keys(detailData.value).length === 0) {
    await initDetailData()
  }
  // 如果从缓存恢复则不需要重新加载
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
  await vipStore.fetchAuthorIllustsList({
    isRefresh: true,
    options: {
      id: detailObj.uid,
      page: vipStore.searchCurrentPage,
    },
  })
  router.push({
    path: '/comics/category',
    query: { author: detailObj.user, uid: detailObj.uid },
  })
}
</script>

<style lang="less" scoped>
.detail {
  max-width: 800px;
  margin: auto;
  .title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #323232;
    color: var(--comics-cardTitle-color);
    padding: 0 10px;
    .pid {
      margin-bottom: 5px;
      font-size: 11px;
      color: #666;
    }
  }
  .headerImg {
    width: 100%;
    box-shadow: 0 0 5px 0 rgba(131, 131, 131, 1);
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .desc {
    .author {
      cursor: pointer;
      padding: 0 15px;
      color: var(--comics-cardTitle-color);
      font-weight: 700;
      .authorName {
        display: flex;
        justify-content: end;
        margin-top: 10px;
        .text {
          margin-right: 10px;
        }
      }
      .uid {
        margin-right: 10px;
        text-align: end;
        font-size: 11px;
        color: #666;
      }
    }
    .tagArea {
      padding: 10px 15px;
      color: var(--comics-cardTitle-color);
      margin-top: 20px;
      background-color: var(--comics-cardBg-color);
      .tagTitle {
        font-weight: 900;
        font-size: 18px;
        margin-bottom: 10px;
      }
      .tagList {
        display: flex;
        flex-wrap: wrap;
        .tag {
          font-size: 14px;
          border-radius: 5px;
          padding: 7px 13px;
          border: 1px solid #969696;
          margin: 0 14px 14px 0;
        }
      }
    }
    .otherArts {
      margin-top: 20px;
      padding-top: 10px;
      background-color: var(--comics-cardBg-color);
      color: var(--comics-cardTitle-color);
      .artsTitle {
        padding: 0 10px;
        font-weight: 900;
        font-size: 18px;
        margin-bottom: 10px;
      }
      .imgList {
        display: flex;
        flex-wrap: wrap;
        .image {
          width: 50%;
          img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
          }
        }
      }
    }
  }
}
</style>
