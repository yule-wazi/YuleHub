<template>
  <div class="imageInfoCard">
    <Card>
      <template #headerLeft>
        <div class="artise">
          <div class="image">
            <MyImg :imgUrl="showImg" :lazyLoad="false" :key="showImg" />
          </div>
          <div class="info">
            <div class="title">{{ title || '加载中...' }}</div>
            <div class="artist">{{ artist || '加载中...' }}</div>
            <div class="date">
              <el-icon><Calendar /></el-icon>
              <span class="text">{{ create_date ? formatTime(create_date) : '...' }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #headerRight>
        <div ref="followBtn" class="followBtn">
          <el-button @click="followClick" color="#ff007a">{{
            isFollow ? '已收藏' : '收藏'
          }}</el-button>
        </div>
      </template>
      <template #content>
        <div class="content">
          <div class="desc" :innerHTML="caption" />
          <div class="tagList">
            <template v-for="item in tags">
              <div class="imgTag">
                <Tag :tag="item.name" @click="getTag(item.name)" />
              </div>
            </template>
          </div>
          <div class="metadata">
            <div class="resolution">
              <div class="name">
                <el-icon><Picture /></el-icon>
                <span class="text">分辨率</span>
              </div>
              <div class="data">{{ width }}x{{ height }}</div>
            </div>
            <div class="views">
              <div class="name">
                <el-icon><View /></el-icon>
                <span class="text">观看次数</span>
              </div>
              <div class="data">{{ total_view }}</div>
            </div>
            <div class="PID">
              <div class="name">PID</div>
              <div class="data">{{ pid }}</div>
            </div>
            <div class="UID">
              <div class="name">UID</div>
              <div class="data">{{ uid }}</div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/view/comics/cpns/card.vue'
import Tag from '@/components/tag/tag.vue'
import { Calendar, Picture, View } from '@element-plus/icons-vue'
import { preLoadImg } from '@/utils/preLoadImg'
import { onMounted, ref, useTemplateRef, watch, computed } from 'vue'
import { formatTime } from '@/utils/formatTime'
import useVip from '@/sotre/module/vip'
import { useRouter } from 'vue-router'
import myLocalCache from '@/utils/cacheStorage'
import MyImg from '@/components/myImg/myImg.vue'

const props = defineProps({
  coverImg: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
  artist: {
    type: String,
    default: '',
  },
  create_date: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
  tags: {
    type: Array,
    default: () => [],
  },
  height: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    default: 0,
  },
  total_view: {
    type: Number,
    default: 0,
  },
  pid: {
    type: Number,
    default: -1,
  },
  uid: {
    type: Number,
    default: 0,
  },
  x_restrict: {
    type: Number,
    default: 0,
  },
  externalBookmarkTrigger: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['bookmark-change'])
const vipStore = useVip()
const router = useRouter()
const showImg = ref('')
const collectionKey = computed(() => {
  const isNSFW = props.x_restrict ? 'nsfw' : 'sfw'
  return `${isNSFW}_collectionList`
})
const collectionList = computed(() => {
  return myLocalCache.get(collectionKey.value) ?? []
})
const isFollow = ref(false)
const followBtnRes = useTemplateRef('followBtn')

// 点击收藏
const followClick = () => {
  // 从 localStorage 读取当前收藏列表
  const currentList = myLocalCache.get(collectionKey.value) ?? []

  if (isFollow.value) {
    const index = currentList.indexOf(props.pid)
    if (index > -1) {
      currentList.splice(index, 1)
    }
  } else {
    if (!currentList.includes(props.pid)) {
      currentList.push(props.pid)
    }
  }

  myLocalCache.set(collectionKey.value, currentList)
  isFollow.value = !isFollow.value
  followBtnRes.value.classList.toggle('notFollow', !isFollow.value)

  // 发出事件通知其他组件收藏状态改变
  emit('bookmark-change', { pid: props.pid, isBookmarked: isFollow.value })
}

// 更新收藏状态的通用函数
const updateFollowState = () => {
  const currentList = myLocalCache.get(collectionKey.value) ?? []
  isFollow.value = currentList.includes(props.pid)
  if (followBtnRes.value) {
    followBtnRes.value.classList.toggle('notFollow', !isFollow.value)
  }
}

// 监听外部收藏触发器（从 imageInfoAndDownoad 组件触发）
watch(
  () => props.externalBookmarkTrigger,
  (newVal) => {
    if (props.pid && props.pid !== -1) {
      updateFollowState()
    }
  },
)
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
watch(
  () => vipStore.detailDataAll,
  () => {
    if (vipStore.detailDataAll.imgDetail?.coverImg?.large) {
      // 直接使用原始 URL，MyImg 会自动处理
      showImg.value = vipStore.detailDataAll.imgDetail.coverImg.large
    }
  },
  { deep: true },
)
watch(
  () => props.pid,
  () => {
    // 判断是否收藏过
    updateFollowState()
  },
)
onMounted(() => {
  followBtnRes.value.classList.toggle('notFollow', !isFollow.value)
  // 展示主图 - 直接使用原始 URL
  if (vipStore.detailData?.coverImg?.large) {
    showImg.value = vipStore.detailData.coverImg.large
  }
})
</script>

<style lang="less" scoped>
.imageInfoCard {
  .artise {
    display: flex;
    align-items: start;
    .image {
      width: 50px;
      height: 65px;
      overflow: hidden;
      border-radius: 4px;
      margin-right: 10px;
      @media (max-width: 1000px) {
        display: none;
      }
      :deep(.myImg) {
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    .info {
      display: flex;
      flex-direction: column;
      justify-content: start;
      color: var(--comics-cardText-color);
      .title {
        font-size: 20px;
      }
      .artist,
      .date {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 3px;
        color: var(--comics-cardSubTitle-color);
        .text {
          margin-left: 3px;
        }
      }
      .date {
        font-weight: 400;
      }
    }
  }
  .notFollow {
    :deep(.el-button) {
      transition: 0.2s;
      background-color: transparent;
      color: var(--comics-cardText-color);
      border: 1px var(--comics-border-color) solid;
      &:hover {
        background-color: var(--primary-pink-color);
        color: #edeef5;
      }
    }
  }
  .content {
    .desc {
      font-size: 14px;
      margin-bottom: 30px;
      font-weight: 500;
      color: var(--comics-cardText-color);
      line-height: 1.6;
      :deep(a) {
        word-break: break-all;
        overflow-wrap: anywhere;
        max-width: 100%;
        color: var(--primary-pink-color, #ff007a);
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  .tagList {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
    .imgTag {
      font-size: 12px;
      padding: 6px;
      border-radius: 6px;
      margin: 0 10px 10px 0;
      background-color: var(--comics-tagBg-color);
    }
  }
  .metadata {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--comics-border-color);
    padding-top: 10px;
    .resolution,
    .views,
    .PID,
    .UID {
      width: 25%;
      font-size: 13px;
      @media (max-width: 1000px) {
        width: 50%;
      }
      .name {
        color: var(--comics-cardSubTitle-color);
        .text {
          margin-left: 3px;
        }
      }
      .data {
        color: var(--comics-cardText-color);
        font-size: 15px;
        font-weight: 500;
      }
    }
  }
}
</style>
