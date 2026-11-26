<template>
  <Transition name="miniWindow">
    <div v-show="visible" class="miniWindow" @click="backToMainImg">
      <div class="preview">
        <MyImg :imgUrl="showImg" :lazyLoad="false" :key="showImg" />
      </div>
      <div class="info">
        <div class="title" :title="title">{{ title }}</div>
        <div v-if="artist" class="artist">{{ artist }}</div>
        <div class="stats">
          <div class="stat">
            <el-icon><View /></el-icon>
            <span class="count">{{ formatCount(viewCount) }}</span>
          </div>
          <div class="stat">
            <el-icon><Star /></el-icon>
            <span class="count">{{ formatCount(bookmarkCount) }}</span>
          </div>
        </div>
        <div class="pid">PID：{{ pid }}</div>
        <div v-if="tags.length" class="tagList">
          <span v-for="item in tags" :key="item.name" class="tag">#{{ item.name }}</span>
        </div>
        <div class="hint">
          <el-icon><ArrowUp /></el-icon>
          <span>点按返回作品主图</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import useVip from '@/sotre/module/vip'
import MyImg from '@/components/myImg/myImg.vue'
import { ArrowUp, Star, View } from '@element-plus/icons-vue'

const props = defineProps({
  // 主图容器，用来判断主图是否已经被翻出可视区域
  target: {
    type: Object,
    default: null,
  },
})

const vipStore = useVip()

// 顶部固定 header 的高度，主图被 header 遮住也算看不见
const HEADER_HEIGHT = 60

// 主图是否已经完整滚出可视区域
const visible = ref(false)
let observer = null

// 向上查找最近的滚动容器
const getScrollContainer = (element) => {
  let parent = element?.parentElement
  while (parent) {
    const style = getComputedStyle(parent)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

// 监听主图的可见性
const observeTarget = (target) => {
  observer?.disconnect()
  observer = null
  if (!target) return

  observer = new IntersectionObserver(
    ([entry]) => {
      // 主图整体位于 header 上方时，说明已经完全翻过去了
      const topEdge = entry.rootBounds?.top ?? 0
      visible.value = !entry.isIntersecting && entry.boundingClientRect.bottom <= topEdge
    },
    {
      root: getScrollContainer(target),
      // 顶部收缩 header 的高度，让主图从 header 底下消失时就触发
      rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px`,
      threshold: 0,
    },
  )
  observer.observe(target)
}

watch(() => props.target, observeTarget, { immediate: true })

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// 点击小窗回到作品主图
const backToMainImg = () => {
  if (!props.target) return
  const scrollContainer = getScrollContainer(props.target) || window
  scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
}

// 详情接口返回前，先用跳转时带过来的 detailData 兜底
const imgDetail = computed(() => vipStore.detailDataAll?.imgDetail ?? {})
const title = computed(() => imgDetail.value.title || vipStore.detailData?.title || '')
const artist = computed(() => imgDetail.value.artist || vipStore.detailData?.user || '')
const pid = computed(() => imgDetail.value.pid || vipStore.detailData?.pid || '')
const viewCount = computed(() => imgDetail.value.total_view)
const bookmarkCount = computed(() => imgDetail.value.total_bookmarks)
const tags = computed(() => (imgDetail.value.tags || vipStore.detailData?.tags || []).slice(0, 3))

// 多图作品优先展示当前翻到的那一页，否则展示封面
const showImg = computed(() => {
  const current = vipStore.currentDetailShowImg
  const pages = imgDetail.value.pageList || []
  if (current && pages.some((item) => item.image_urls?.large === current)) {
    return current
  }
  return imgDetail.value.coverImg?.large || vipStore.detailData?.coverImg?.large || current || ''
})

// 数量千分位展示，如 43846 -> 43,846
const formatCount = (num) => (Number.isFinite(num) ? num.toLocaleString('en-US') : 0)
</script>

<style lang="less" scoped>
.miniWindow {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9;
  width: 280px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid var(--comics-border-color);
  background-color: var(--comics-cardBg-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  color: var(--comics-cardText-color);
  @media (min-width: 1000px) {
    &:hover {
      border-color: var(--primary-pink-color);
      box-shadow: 0 8px 24px rgba(255, 0, 122, 0.25);
      .preview :deep(.myImg) img {
        transform: scale(1.05);
      }
    }
  }
  @media (max-width: 1000px) {
    top: 60px;
    left: 0;
    right: 0;
    bottom: auto;
    width: auto;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    box-sizing: border-box;
    border-radius: 0;
    border: none;
    border-bottom: 1px solid var(--comics-border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .preview {
    width: 100%;
    height: 160px;
    background-color: var(--comics-tagBg-color);
    @media (max-width: 1000px) {
      width: 36px;
      height: 48px;
      flex: none;
      border-radius: 4px;
    }
  }
  .info {
    padding: 12px 14px 14px;
    @media (max-width: 1000px) {
      flex: 1;
      min-width: 0;
      padding: 0;
    }
    .title {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      @media (max-width: 1000px) {
        font-size: 14px;
        line-height: 1.3;
      }
    }
    .artist {
      margin-top: 3px;
      font-size: 12px;
      color: var(--comics-cardSubTitle-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      @media (max-width: 1000px) {
        display: none;
      }
    }
    .stats {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
      font-size: 12px;
      color: var(--comics-cardSubTitle-color);
      @media (max-width: 1000px) {
        display: none;
      }
      .stat {
        display: flex;
        align-items: center;
        .count {
          margin-left: 4px;
        }
      }
    }
    .pid {
      margin-top: 4px;
      font-size: 12px;
      color: var(--comics-cardSubTitle-color);
      @media (max-width: 1000px) {
        display: none;
      }
    }
    .tagList {
      display: flex;
      margin-top: 8px;
      overflow: hidden;
      white-space: nowrap;
      @media (max-width: 1000px) {
        display: none;
      }
      .tag {
        margin-right: 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-pink-color);
      }
    }
    .hint {
      display: none;
      @media (max-width: 1000px) {
        display: flex;
        align-items: center;
        margin-top: 1px;
        font-size: 11px;
        letter-spacing: 1px;
        color: var(--primary-pink-color);
        .el-icon {
          margin-right: 3px;
          font-size: 12px;
        }
      }
    }
  }
}

// PC 从下方滑入，移动端从 header 下方滑出
.miniWindow-enter-active,
.miniWindow-leave-active {
  transition:
    transform 0.28s ease,
    opacity 0.28s ease;
}
.miniWindow-enter-from,
.miniWindow-leave-to {
  opacity: 0;
  transform: translateY(16px);
  @media (max-width: 1000px) {
    transform: translateY(-100%);
  }
}
</style>
