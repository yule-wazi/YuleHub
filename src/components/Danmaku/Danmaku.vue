<template>
  <div class="danmaku-container" :style="containerStyle" @click="handleContainerClick">
    <div
      v-for="item in activeDanmakuList"
      :key="item.id"
      :data-danmaku-id="item.id"
      class="danmaku-item"
      :style="getDanmakuStyle(item)"
    >
      <!-- 文字弹幕 -->
      <span v-if="item.type === 'text'" class="danmaku-text">
        {{ item.content }}
      </span>
      <!-- 表情包弹幕 -->
      <img
        v-else-if="item.type === 'stamp'"
        :src="item.content"
        class="danmaku-stamp"
        :style="{ width: mergedConfig.stampSize + 'px', height: mergedConfig.stampSize + 'px' }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  // 弹幕数据列表 [{ content: '内容', type: 'text'|'stamp' }, ...]
  danmakuList: {
    type: Array,
    default: () => [],
  },
  // 配置项
  config: {
    type: Object,
    default: () => ({
      speed: 5, // 弹幕速度（秒），数值越小越快
      trackCount: 6, // 轨道数量
      loop: true, // 是否循环播放
      loopInterval: 0, // 循环间隔（秒），0表示无间隔
      fontSize: 24, // 字体大小
      fontColor: '#FFFFFF', // 字体颜色
      opacity: 0.9, // 透明度 0-1
      strokeColor: '#000000', // 描边颜色
      strokeWidth: 2, // 描边宽度
      stampSize: 60, // 表情包大小
      pointerEvents: 'none', // 鼠标事件：'none'(穿透) | 'auto'(可点击)
      zIndex: 100, // z-index层级
      performance: true, // 性能模式（使用 rAF）
    }),
  },
  // 是否暂停
  paused: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['danmaku-click', 'danmaku-end'])

// 合并默认配置
const mergedConfig = computed(() => {
  const defaultConfig = {
    speed: 5,
    trackCount: 6,
    loop: true,
    loopInterval: 0,
    frequency: 200, // 弹幕发射频率（毫秒），控制每条弹幕之间的时间间隔
    fontSize: 24,
    fontColor: '#FFFFFF',
    opacity: 0.9,
    strokeColor: '#000000',
    strokeWidth: 2,
    stampSize: 60,
    pointerEvents: 'none',
    zIndex: 100,
    performance: true,
  }
  return { ...defaultConfig, ...props.config }
})

// 当前显示的弹幕列表
const activeDanmakuList = ref([])
// 待发送的弹幕队列
const pendingQueue = ref([])
// 轨道占用状态 { trackIndex: lastDanmakuRight }
const trackStatus = ref({})
// 动画帧ID
let animationFrameId = null
// 上一次时间戳
let lastTimestamp = 0
// 弹幕ID计数器
let danmakuIdCounter = 0
// 已发送的弹幕索引（用于循环）
let sentIndex = 0
// 循环定时器
let loopTimer = null
// 发射频率控制
let lastShootTime = 0
// IntersectionObserver 实例
let intersectionObserver = null
// 待移除的弹幕ID集合
const danmakuToRemove = new Set()

// 容器样式
const containerStyle = computed(() => ({
  pointerEvents: mergedConfig.value.pointerEvents,
  zIndex: mergedConfig.value.zIndex,
}))

// 初始化弹幕队列
const initQueue = () => {
  pendingQueue.value = props.danmakuList.map((item, index) => ({
    ...item,
    originalIndex: index,
  }))
  sentIndex = 0
  trackStatus.value = {}
  loopTimer = null
}

// 初始化 IntersectionObserver
const initIntersectionObserver = () => {
  if (intersectionObserver) return

  const container = document.querySelector('.danmaku-container')
  if (!container) return

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 当弹幕完全离开容器时
        if (!entry.isIntersecting) {
          const danmakuId = parseInt(entry.target.dataset.danmakuId)
          danmakuToRemove.add(danmakuId)
        }
      })
    },
    {
      root: container.parentElement,
      threshold: 0,
    },
  )
}

// 观察弹幕元素
const observeDanmaku = (danmakuId) => {
  nextTick(() => {
    const element = document.querySelector(`[data-danmaku-id="${danmakuId}"]`)
    if (element && intersectionObserver) {
      intersectionObserver.observe(element)
    }
  })
}

// 获取弹幕样式
const getDanmakuStyle = (item) => {
  const baseStyle = {
    transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
    opacity: mergedConfig.value.opacity,
    fontSize: mergedConfig.value.fontSize + 'px',
    color: mergedConfig.value.fontColor,
    textShadow: `
      -${mergedConfig.value.strokeWidth}px -${mergedConfig.value.strokeWidth}px 0 ${mergedConfig.value.strokeColor},
      ${mergedConfig.value.strokeWidth}px -${mergedConfig.value.strokeWidth}px 0 ${mergedConfig.value.strokeColor},
      -${mergedConfig.value.strokeWidth}px ${mergedConfig.value.strokeWidth}px 0 ${mergedConfig.value.strokeColor},
      ${mergedConfig.value.strokeWidth}px ${mergedConfig.value.strokeWidth}px 0 ${mergedConfig.value.strokeColor}
    `,
  }
  return baseStyle
}

// 获取容器宽度
const getContainerWidth = () => {
  // 尝试获取父容器的实际宽度
  const container = document.querySelector('.danmaku-container')
  if (container && container.parentElement) {
    return container.parentElement.offsetWidth
  }
  return window.innerWidth
}

// 计算轨道高度
const getTrackHeight = () => {
  return Math.max(mergedConfig.value.fontSize, mergedConfig.value.stampSize) + 10
}

// 检查轨道是否可用
const isTrackAvailable = (trackIndex, danmakuWidth) => {
  const containerWidth = getContainerWidth()
  const lastRight = trackStatus.value[trackIndex]

  // 如果轨道为空，直接可用
  if (lastRight === undefined) {
    return true
  }

  // 如果上一个弹幕的右边缘已经离开屏幕左边，轨道可用
  // 或者上一个弹幕已经进入屏幕内部足够距离
  const minGap = 50
  return lastRight < containerWidth - minGap
}

// 获取可用轨道（从所有空闲轨道中随机选择）
const getAvailableTrack = (danmakuWidth) => {
  const availableTracks = []

  // 收集所有可用轨道
  for (let i = 0; i < mergedConfig.value.trackCount; i++) {
    if (isTrackAvailable(i, danmakuWidth)) {
      availableTracks.push(i)
    }
  }

  // 如果没有可用轨道，返回-1
  if (availableTracks.length === 0) {
    return -1
  }

  // 从可用轨道中随机选择一个
  const randomIndex = Math.floor(Math.random() * availableTracks.length)
  return availableTracks[randomIndex]
}

// 发射弹幕
const shootDanmaku = () => {
  if (props.paused || pendingQueue.value.length === 0) {
    return
  }

  const danmakuData = pendingQueue.value.shift()
  const containerWidth = getContainerWidth()
  const trackHeight = getTrackHeight()

  // 估算弹幕宽度
  let danmakuWidth
  if (danmakuData.type === 'stamp') {
    danmakuWidth = mergedConfig.value.stampSize
  } else {
    // 粗略估算文字宽度（中文按fontSize，英文按fontSize*0.6）
    const chineseCount = (danmakuData.content.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherCount = danmakuData.content.length - chineseCount
    // 增加1.2倍系数补偿估算误差
    danmakuWidth =
      (chineseCount * mergedConfig.value.fontSize +
        otherCount * mergedConfig.value.fontSize * 0.6) *
      1.2
  }

  // 获取可用轨道
  const trackIndex = getAvailableTrack(danmakuWidth)
  if (trackIndex === -1) {
    // 没有可用轨道，放回队列
    pendingQueue.value.unshift(danmakuData)
    return
  }

  // 创建弹幕对象
  const danmaku = {
    id: danmakuIdCounter++,
    type: danmakuData.type,
    content: danmakuData.content,
    x: containerWidth,
    y: trackIndex * trackHeight + 10,
    width: danmakuWidth,
    trackIndex,
    speed: containerWidth / (mergedConfig.value.speed * 60), // 统一速度：像素/帧（假设60fps）
    originalIndex: danmakuData.originalIndex,
  }

  activeDanmakuList.value.push(danmaku)
  trackStatus.value[trackIndex] = containerWidth
  sentIndex++

  // 观察这个弹幕
  observeDanmaku(danmaku.id)
}

// 更新弹幕位置
const updateDanmaku = () => {
  activeDanmakuList.value.forEach((item) => {
    // 更新位置
    item.x -= item.speed

    // 更新轨道状态
    const itemRight = item.x + item.width
    if (trackStatus.value[item.trackIndex] !== undefined) {
      trackStatus.value[item.trackIndex] = itemRight
    }
  })

  // 移除标记的弹幕（由 IntersectionObserver 标记）
  if (danmakuToRemove.size > 0) {
    activeDanmakuList.value = activeDanmakuList.value.filter((item) => {
      if (danmakuToRemove.has(item.id)) {
        emit('danmaku-end', item)
        danmakuToRemove.delete(item.id)
        return false
      }
      return true
    })
  }
}

// 动画循环（性能模式）
const animate = (timestamp) => {
  if (props.paused) {
    animationFrameId = requestAnimationFrame(animate)
    return
  }

  // 计算时间差，确保帧率稳定
  if (!lastTimestamp) lastTimestamp = timestamp
  const deltaTime = timestamp - lastTimestamp

  // 约60fps的频率更新
  if (deltaTime >= 16) {
    updateDanmaku()

    // 尝试发射新弹幕（根据频率控制，每次只发射一条）
    const timeSinceLastShoot = timestamp - lastShootTime
    if (timeSinceLastShoot >= mergedConfig.value.frequency && pendingQueue.value.length > 0) {
      shootDanmaku()
      lastShootTime = timestamp
    }

    lastTimestamp = timestamp
  }

  animationFrameId = requestAnimationFrame(animate)
}

// 定时器模式（非性能模式）
let updateTimer = null
let shootTimer = null
const startTimerMode = () => {
  updateTimer = setInterval(() => {
    if (props.paused) return
    updateDanmaku()
  }, 16) // 约60fps

  // 根据频率定时发射弹幕（每次只发射一条）
  shootTimer = setInterval(() => {
    if (props.paused || pendingQueue.value.length === 0) return
    shootDanmaku()
  }, mergedConfig.value.frequency)
}

// 检查是否需要循环
const checkLoop = () => {
  if (!mergedConfig.value.loop || loopTimer) return

  // 如果已发送完所有弹幕，且当前没有活动弹幕，则重新开始
  if (sentIndex >= props.danmakuList.length && activeDanmakuList.value.length === 0) {
    if (mergedConfig.value.loopInterval > 0) {
      // 有循环间隔，设置定时器
      loopTimer = setTimeout(() => {
        trackStatus.value = {} // 清空轨道状态
        initQueue()
      }, mergedConfig.value.loopInterval * 1000)
    } else {
      // 无间隔，立即重新开始
      trackStatus.value = {} // 清空轨道状态
      initQueue()
    }
  }
}

// 启动弹幕
const start = () => {
  // 初始化 IntersectionObserver
  initIntersectionObserver()

  // 立即发射第一条弹幕
  if (pendingQueue.value.length > 0) {
    shootDanmaku()
  }

  if (mergedConfig.value.performance) {
    animationFrameId = requestAnimationFrame(animate)
  } else {
    startTimerMode()
  }

  // 定期检查循环
  const loopCheckInterval = setInterval(() => {
    checkLoop()
  }, 100)

  onBeforeUnmount(() => {
    clearInterval(loopCheckInterval)
  })
}

// 停止弹幕
const stop = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
  if (shootTimer) {
    clearInterval(shootTimer)
    shootTimer = null
  }
  if (loopTimer) {
    clearTimeout(loopTimer)
    loopTimer = null
  }
}

// 清空弹幕
const clear = () => {
  activeDanmakuList.value = []
  trackStatus.value = {}
  danmakuToRemove.clear()
}

// 重置弹幕
const reset = () => {
  clear()
  initQueue()
  lastShootTime = 0
  lastTimestamp = 0
}

// 处理容器点击（如果启用了点击事件）
const handleContainerClick = (e) => {
  if (mergedConfig.value.pointerEvents === 'auto') {
    // 可以添加点击弹幕的逻辑
    emit('danmaku-click', e)
  }
}

// 监听弹幕数据变化
watch(
  () => props.danmakuList,
  () => {
    reset()
  },
  { deep: true },
)

// 监听暂停状态
watch(
  () => props.paused,
  (newVal) => {
    if (!newVal) {
      lastTimestamp = 0 // 重置时间戳，避免跳帧
    }
  },
)

// 暴露方法给父组件
defineExpose({
  start,
  stop,
  clear,
  reset,
  shootDanmaku,
})

onMounted(() => {
  initQueue()
  start()
})

onBeforeUnmount(() => {
  stop()
  // 断开 IntersectionObserver
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
})
</script>

<style scoped>
.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  will-change: transform;
  user-select: none;
  display: flex;
  align-items: center;
}

.danmaku-text {
  font-weight: bold;
  line-height: 1;
}

.danmaku-stamp {
  object-fit: contain;
  display: block;
}

/* 性能优化 */
.danmaku-container * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
</style>
