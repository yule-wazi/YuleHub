<template>
  <Transition name="miniWindow">
    <div v-show="visible" ref="miniWindowRef" class="miniWindow" :class="{ 'is-hover': isHover }">
      <div class="preview">
        <MyImg :imgUrl="showImg" :lazyLoad="false" :key="showImg" />
      </div>
      <div class="info">
        <div class="row row-top">
          <span v-if="artist" class="artist">@{{ artist }}</span>
          <span class="views">
            <el-icon><View /></el-icon>
            {{ formatCount(viewCount) }}
          </span>
        </div>
        <div v-if="tags.length" class="tagList">
          <span v-for="item in tags" :key="item.name" class="tag">#{{ item.name }}</span>
        </div>
        <div class="row row-bottom">
          <span class="pid">PID：{{ pid }}</span>
          <span class="bookmark">
            <el-icon><Star /></el-icon>
            {{ formatCount(bookmarkCount) }}
          </span>
        </div>
        <div class="title" :title="title">{{ title }}</div>
      </div>
      <div class="hint">
        <el-icon><ArrowUp /></el-icon>
        <span>点按返回作品主图</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
// 小窗 DOM，用来判断点击坐标是否落在小窗区域内
const miniWindowRef = ref(null)

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

// 小窗用 pointer-events: none 让滚轮事件穿透到下层滚动容器，
// 代价是小窗自身收不到点击。这里在 document 捕获阶段监听点击，
// 判断落点是否在小窗区域内，命中则拦截并模拟“点击小窗回主图”。
const handleDocumentClick = (e) => {
  if (!visible.value || !miniWindowRef.value) return
  const rect = miniWindowRef.value.getBoundingClientRect()
  const { clientX, clientY } = e
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    return
  }
  // 阻止事件继续下传到下层元素，避免误触点击穿透
  e.stopPropagation()
  e.preventDefault()
  backToMainImg()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick, true)
  window.removeEventListener('mousemove', handleMousemove)
  document.body.style.cursor = ''
})

// pointer-events: none 让小窗无法触发 CSS :hover，
// 这里用 mousemove 判断光标是否在小窗区域内，手动维护 hover 态
const isHover = ref(false)
const handleMousemove = (e) => {
  const el = miniWindowRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  if (inside !== isHover.value) {
    isHover.value = inside
    // pointer-events: none 下卡片自身的 cursor 不生效，手动在 body 上设置光标
    document.body.style.cursor = inside ? 'pointer' : ''
  }
}

// 只在可见时监听 mousemove，隐藏时移除并复位，避免无谓开销
watch(visible, (val) => {
  if (val) {
    window.addEventListener('mousemove', handleMousemove)
  } else {
    window.removeEventListener('mousemove', handleMousemove)
    isHover.value = false
    document.body.style.cursor = ''
  }
})

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
  width: 320px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--comics-border-color);
  // 让滚轮事件穿透到下层滚动容器（悬停小窗也能正常滚动）
  pointer-events: none;
  backdrop-filter: blur(6px);
  color: #fff;
  // 图片铺满整个卡片（长方形）
  .preview {
    width: 100%;
    aspect-ratio: 16 / 9;
    background-color: var(--comics-tagBg-color);
    :deep(.myImg) {
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  // 文字信息统一压在图片底部
  .info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20px 14px 12px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0));
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
    }
    .artist {
      font-weight: 600;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .views {
      display: flex;
      align-items: center;
      flex: none;
      .el-icon {
        margin-right: 4px;
      }
    }
    .tagList {
      display: flex;
      margin-top: 6px;
      overflow: hidden;
      white-space: nowrap;
      .tag {
        margin-right: 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-pink-color);
      }
    }
    .row-bottom {
      margin-top: 6px;
    }
    .bookmark {
      display: flex;
      align-items: center;
      flex: none;
      .el-icon {
        margin-right: 4px;
        color: var(--primary-pink-color);
      }
    }
    .title {
      margin-top: 8px;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .hint {
    display: none;
  }
  @media (min-width: 1000px) {
    // pointer-events: none 下 :hover 不生效，改用 JS 维护的 .is-hover 类
    &.is-hover {
      border-color: var(--primary-pink-color);
      cursor: pointer !important;
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
    // 移动端恢复原有布局：小缩略图 + 信息列
    .preview {
      width: 36px;
      height: 48px;
      flex: none;
      aspect-ratio: auto;
      border-radius: 4px;
      :deep(.myImg) img {
        border-radius: 4px;
      }
    }
    .info {
      position: static;
      flex: 1;
      min-width: 0;
      padding: 0;
      background: none;
      .row,
      .tagList {
        display: none;
      }
      .title {
        margin-top: 0;
        font-size: 14px;
        line-height: 1.3;
        color: var(--comics-cardText-color);
        text-shadow: none;
      }
    }
    .hint {
      display: flex;
      align-items: center;
      flex: none;
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

// 出现时播放过渡动画（PC 从下方滑入，移动端从 header 下方滑出）
.miniWindow-enter-active {
  transition:
    transform 0.28s ease,
    opacity 0.28s ease;
}
.miniWindow-enter-from {
  opacity: 0;
  transform: translateY(16px);
  @media (max-width: 1000px) {
    transform: translateY(-100%);
  }
}
// 隐藏时不播放动画：切换到新图片回到顶部时，不会出现上一张的收回动画
.miniWindow-leave-active {
  transition: none;
}
</style>
