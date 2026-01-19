<template>
  <div class="myImg" ref="imgContainerRef">
    <img v-if="isLoaded" :src="showImg" @error="triggerEmit" />
    <div v-else class="img-placeholder"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { preLoadImg } from '@/utils/preLoadImg'

const props = defineProps({
  imgUrl: {
    type: String,
    default: '',
  },
  showOriginal: {
    type: Boolean,
    default: false,
  },
  lazyLoad: {
    type: Boolean,
    default: true,
  },
  rootMargin: {
    type: String,
    default: '0px 0px 500px 0px', // 底部提前1000px开始加载
  },
})

const emit = defineEmits(['error'])

const imgContainerRef = ref(null)
const showImg = ref(null)
const isLoaded = ref(false)
const isInView = ref(false)
let observer = null

const loadImg = async () => {
  if (!props.imgUrl) {
    return
  }

  try {
    // 先加载低质量图片
    const LQIPImg = switchImgResolutionUrl(props.imgUrl)
    showImg.value = LQIPImg
    isLoaded.value = true

    // 加载原始质量图片
    const master = switchImgResolutionUrl(props.imgUrl, 'origin')
    const { src } = await preLoadImg(master)
    showImg.value = src

    // 如果需要，加载最高质量图片
    if (props.showOriginal) {
      const { src: originalSrc } = await preLoadImg(
        switchImgResolutionUrl(props.imgUrl, 'original'),
      )
      showImg.value = originalSrc
    }
  } catch (error) {
    console.error('Image load error:', error)
  }
}

const triggerEmit = () => {
  emit('error')
}

const setupObserver = () => {
  if (!props.lazyLoad) {
    loadImg()
    return
  }

  // 清理旧的 observer
  if (observer) {
    observer.disconnect()
    observer = null
  }

  // 查找最近的滚动容器
  const findScrollParent = (element) => {
    if (!element) return null
    let parent = element.parentElement
    while (parent) {
      const overflow = window.getComputedStyle(parent).overflow
      const overflowY = window.getComputedStyle(parent).overflowY

      if (
        overflow === 'auto' ||
        overflow === 'scroll' ||
        overflowY === 'auto' ||
        overflowY === 'scroll'
      ) {
        return parent
      }
      parent = parent.parentElement
    }
    return null
  }
  const scrollRoot = findScrollParent(imgContainerRef.value)
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isInView.value) {
          isInView.value = true
          loadImg()
          // 加载后停止观察
          if (observer && imgContainerRef.value) {
            observer.unobserve(imgContainerRef.value)
          }
        }
      })
    },
    {
      root: scrollRoot, // 使用找到的滚动容器
      rootMargin: props.rootMargin,
      threshold: 0.01,
    },
  )
  if (imgContainerRef.value) {
    observer.observe(imgContainerRef.value)
  }
}

onMounted(() => {
  setupObserver()
})

onBeforeUnmount(() => {
  if (observer) {
    if (imgContainerRef.value) {
      observer.unobserve(imgContainerRef.value)
    }
    observer.disconnect()
    observer = null
  }
})
</script>

<style lang="less" scoped>
.myImg {
  width: 100%;
  height: 100%;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .img-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
}
</style>
