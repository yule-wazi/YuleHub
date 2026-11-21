<template>
  <div class="imageInfoAndDownoad">
    <div class="info">
      <div class="infoData">
        <div class="view">
          <el-icon><View /></el-icon>
          <span class="count">{{ imgDetail.total_view }}</span>
        </div>
        <div ref="bookmarks" class="bookmarks" @click="starClick">
          <el-icon>
            <template v-if="isStar"><StarFilled /></template>
            <template v-else><Star /></template>
          </el-icon>
          <span class="count">{{ imgDetail.total_bookmarks }}</span>
        </div>
        <div class="comments" @click="scrollToComments">
          <el-icon><ChatRound /></el-icon>
          <span class="count">{{ imgDetail.total_comments }}</span>
        </div>
        <div
          class="danmaku-toggle"
          @click="toggleDanmaku"
          :title="showDanmaku ? '关闭弹幕' : '开启弹幕'"
        >
          <el-icon>
            <ChatDotSquare v-if="showDanmaku" />
            <ChatSquare v-else />
          </el-icon>
        </div>
      </div>
      <div class="downLoad" @click="showDialog = true">
        <template v-if="showDownloadText">
          <el-button color="#ff007a" :icon="Download">下载</el-button>
        </template>
        <template v-else>
          <el-button color="#ff007a" :icon="Download" />
        </template>
      </div>
    </div>
  </div>
  <DownloadDialog v-if="showDialog" v-model="showDialog" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, useTemplateRef, watch, computed } from 'vue'
import {
  ChatRound,
  Download,
  Star,
  StarFilled,
  View,
  ChatDotSquare,
  ChatSquare,
} from '@element-plus/icons-vue'
import { throttle } from '@/utils/throttle'
import DownloadDialog from './downloadDialog.vue'
import myLocalCache from '@/utils/cacheStorage'

const props = defineProps({
  showDanmaku: {
    type: Boolean,
    default: true,
  },
  externalBookmarkTrigger: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:showDanmaku', 'bookmark-change'])

const toggleDanmaku = () => {
  emit('update:showDanmaku', !props.showDanmaku)
}

// 滚动到评论区
const scrollToComments = () => {
  // 查找评论区元素
  const commentSection = document.querySelector('.comment')
  if (!commentSection) return

  // 查找滚动容器（向上遍历DOM树找到可滚动的父元素）
  let scrollContainer = commentSection
  while (scrollContainer && scrollContainer.parentElement) {
    const parent = scrollContainer.parentElement
    const style = getComputedStyle(parent)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      scrollContainer = parent
      break
    }
    scrollContainer = parent
  }

  // 计算滚动位置
  const commentRect = commentSection.getBoundingClientRect()
  const containerRect = scrollContainer.getBoundingClientRect()
  const scrollTop = scrollContainer.scrollTop
  const targetScrollTop = scrollTop + commentRect.top - containerRect.top - 20 // 留20px间距

  // 平滑滚动
  scrollContainer.scrollTo({
    top: targetScrollTop,
    behavior: 'smooth',
  })
}

const imgDetail = defineModel({
  type: Object,
  default: () => ({
    total_bookmarks: 0,
    total_comments: 0,
    total_view: 0,
    pid: -1,
    x_restrict: 0,
  }),
})

const showDialog = ref(false)
const showDownloadText = ref(true)

// 收藏相关逻辑（从 imgInfoCard 迁移）
const collectionKey = computed(() => {
  const isNSFW = imgDetail.value.x_restrict ? 'nsfw' : 'sfw'
  return `${isNSFW}_collectionList`
})

const isStar = ref(false)
const bookmarksRef = useTemplateRef('bookmarks')

// 点击收藏（整合 localStorage 逻辑）
const starClick = () => {
  const element = bookmarksRef.value
  if (!element) return

  const pid = imgDetail.value.pid
  if (pid === undefined || pid === -1) {
    console.warn('pid 不存在，无法收藏')
    return
  }

  // 从 localStorage 读取当前收藏列表
  const currentList = myLocalCache.get(collectionKey.value) ?? []

  if (isStar.value) {
    // 取消收藏
    const index = currentList.indexOf(pid)
    if (index > -1) {
      currentList.splice(index, 1)
    }
    imgDetail.value.total_bookmarks -= 1

    // 取消收藏动画
    element.classList.add('unstar-animation')
    setTimeout(() => {
      element.classList.remove('unstar-animation')
    }, 300)
  } else {
    // 添加收藏
    if (!currentList.includes(pid)) {
      currentList.push(pid)
    }
    imgDetail.value.total_bookmarks += 1

    // 收藏动画
    element.classList.add('star-animation')
    setTimeout(() => {
      element.classList.remove('star-animation')
    }, 600)
  }

  // 保存到 localStorage
  myLocalCache.set(collectionKey.value, currentList)

  // 切换状态
  isStar.value = !isStar.value
  element.classList.toggle('isStar', isStar.value)

  // 发出事件通知其他组件收藏状态改变
  emit('bookmark-change', { pid, isBookmarked: isStar.value })
}

// 监听 pid 变化，判断是否已收藏
watch(
  () => imgDetail.value.pid,
  (newPid) => {
    if (newPid && newPid !== -1) {
      const currentList = myLocalCache.get(collectionKey.value) ?? []
      isStar.value = currentList.includes(newPid)
      if (bookmarksRef.value) {
        bookmarksRef.value.classList.toggle('isStar', isStar.value)
      }
    }
  },
  { immediate: true },
)

// 监听外部收藏触发器（从 imgInfoCard 组件触发）
watch(
  () => props.externalBookmarkTrigger,
  (newVal) => {
    if (imgDetail.value.pid && imgDetail.value.pid !== -1) {
      const currentList = myLocalCache.get(collectionKey.value) ?? []
      isStar.value = currentList.includes(imgDetail.value.pid)
      if (bookmarksRef.value) {
        bookmarksRef.value.classList.toggle('isStar', isStar.value)
      }
    }
  },
)

const checkWidth = throttle(() => {
  showDownloadText.value = window.innerWidth > 1000
}, 200)

onMounted(() => {
  checkWidth()
  window.addEventListener('resize', checkWidth)

  // 初始化收藏状态
  if (imgDetail.value.pid && imgDetail.value.pid !== -1) {
    const currentList = myLocalCache.get(collectionKey.value) ?? []
    isStar.value = currentList.includes(imgDetail.value.pid)
    if (bookmarksRef.value) {
      bookmarksRef.value.classList.toggle('isStar', isStar.value)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkWidth)
})
</script>

<style lang="less" scoped>
.imageInfoAndDownoad {
  margin-bottom: 24px;
  .info {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .infoData {
      display: flex;
      .bookmarks,
      .comments,
      .danmaku-toggle,
      .view {
        display: flex;
        align-items: center;
        color: var(--comics-cardText-color);
        padding: 0 10px;
        margin-right: 8px;
        border-radius: 5px;
        .count {
          margin-left: 8px;
        }
        &:hover {
          transition: 0.2s ease;

          background-color: var(--primary-pink-color);
          color: #fff !important;
          cursor: pointer;
        }
      }
      .isStar {
        color: var(--primary-pink-color);
      }

      // 收藏动画
      .star-animation {
        animation: starBounce 0.6s ease;
        .el-icon {
          animation: starRotate 0.6s ease;
        }
      }

      // 取消收藏动画
      .unstar-animation {
        animation: unstarShake 0.3s ease;
      }
    }
  }
}

// 收藏弹跳动画
@keyframes starBounce {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// 星星旋转动画
@keyframes starRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 取消收藏抖动动画
@keyframes unstarShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
</style>
