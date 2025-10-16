<template>
  <div
    class="video-progress-container"
    ref="containerRef"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @mousemove="updateHoverPosition"
    @mouseleave="isHovering = false"
    @mouseenter="isHovering = true"
    :class="{ 'is-dragging': isDragging }"
  >
    <!-- 进度条背景 -->
    <div class="progress-background">
      <!-- 缓冲进度 -->
      <div class="progress-buffered" :style="bufferedStyle"></div>
      <!-- 已播放进度 -->
      <div class="progress-played" :style="progressStyle"></div>
    </div>

    <!-- 进度条滑块 -->
    <div class="progress-thumb" :style="thumbStyle"></div>

    <!-- 悬停预览时间 -->
    <div
      class="hover-time"
      :style="hoverTimeStyle"
      v-if="showHoverTime && isHovering && !isDragging"
    >
      {{ formatTime(hoverTime) }}
    </div>

    <!-- 当前时间提示 -->
    <div class="current-time" :style="currentTimeStyle" v-if="showCurrentTime && isDragging">
      {{ formatTime(currentTime) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// 定义组件属性
const props = defineProps({
  // 当前播放时间（秒）
  currentTime: {
    type: Number,
    default: 0,
  },
  // 视频总时长（秒）
  duration: {
    type: Number,
    default: 0,
  },
  // 缓冲时间（秒）- 可选
  bufferedTime: {
    type: Number,
    default: 0,
  },
  // 进度条高度
  height: {
    type: String,
    default: '6px',
  },
  // 滑块大小
  thumbSize: {
    type: String,
    default: '12px',
  },
  // 播放进度颜色
  color: {
    type: String,
    default: '#ff4757',
  },
  // 缓冲进度颜色
  bufferedColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.5)',
  },
  // 是否显示悬停时间
  showHoverTime: {
    type: Boolean,
    default: true,
  },
  // 是否显示拖拽时的当前时间
  showCurrentTime: {
    type: Boolean,
    default: true,
  },
})

// 定义组件事件
const emit = defineEmits(['seek', 'drag-start', 'drag-end'])

// 响应式数据
const containerRef = ref(null)
const isDragging = ref(false)
const isHovering = ref(false)
const hoverPosition = ref(0)
const internalCurrentTime = ref(0)
const internalDuration = ref(0)

// 计算属性
const progressPercentage = computed(() => {
  if (internalDuration.value <= 0) return 0
  const percentage = (internalCurrentTime.value / internalDuration.value) * 100
  return Math.max(0, Math.min(100, percentage))
})

const bufferedPercentage = computed(() => {
  if (internalDuration.value <= 0) return 0
  const bufferedTime = props.bufferedTime || internalCurrentTime.value
  const percentage = (bufferedTime / internalDuration.value) * 100
  return Math.max(0, Math.min(100, percentage))
})

const hoverTime = computed(() => {
  return (hoverPosition.value / 100) * internalDuration.value
})

const progressStyle = computed(() => ({
  width: `${progressPercentage.value}%`,
  backgroundColor: props.color,
  height: props.height,
}))

const bufferedStyle = computed(() => ({
  width: `${bufferedPercentage.value}%`,
  backgroundColor: props.bufferedColor,
  height: props.height,
}))

const thumbStyle = computed(() => ({
  left: `${progressPercentage.value}%`,
  width: props.thumbSize,
  height: props.thumbSize,
  backgroundColor: props.color,
}))

const hoverTimeStyle = computed(() => ({
  left: `${hoverPosition.value}%`,
}))

const currentTimeStyle = computed(() => ({
  left: `${progressPercentage.value}%`,
}))

// 开始拖拽
const startDrag = (event) => {
  event.preventDefault()
  isDragging.value = true
  emit('drag-start')

  // 立即更新进度
  updateProgress(event)

  // 添加事件监听
  const moveHandler = (e) => updateProgress(e)
  const stopHandler = () => {
    isDragging.value = false
    emit('drag-end')
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('mouseup', stopHandler)
    document.removeEventListener('touchend', stopHandler)
  }

  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('touchmove', moveHandler)
  document.addEventListener('mouseup', stopHandler)
  document.addEventListener('touchend', stopHandler)
}

// 更新进度
const updateProgress = (event) => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  let offsetX

  if (event.type.includes('touch')) {
    offsetX = event.touches[0].clientX - rect.left
  } else {
    offsetX = event.clientX - rect.left
  }

  let percentage = (offsetX / rect.width) * 100
  percentage = Math.max(0, Math.min(100, percentage))

  const newTime = (percentage / 100) * internalDuration.value
  internalCurrentTime.value = newTime
  emit('seek', newTime)
}

// 更新悬停位置
const updateHoverPosition = (event) => {
  if (!containerRef.value || !props.showHoverTime) return

  const rect = containerRef.value.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  let percentage = (offsetX / rect.width) * 100
  percentage = Math.max(0, Math.min(100, percentage))

  hoverPosition.value = percentage
}

// 格式化时间显示 (分:秒)
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 监听外部时间变化
watch(
  () => props.currentTime,
  (newTime) => {
    if (!isDragging.value) {
      internalCurrentTime.value = newTime
    }
  },
)

watch(
  () => props.duration,
  (newDuration) => {
    internalDuration.value = newDuration
  },
)

// 初始化内部状态
onMounted(() => {
  internalCurrentTime.value = props.currentTime
  internalDuration.value = props.duration
})
</script>

<style scoped>
.video-progress-container {
  position: relative;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
}

.progress-background {
  position: relative;
  height: v-bind('props.height');
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  width: 100%;
  overflow: hidden;
}

.progress-buffered {
  position: absolute;
  height: 100%;
  border-radius: 3px;
  transition: width 0.2s ease;
}

.progress-played {
  position: absolute;
  height: 100%;
  border-radius: 3px;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
  opacity: 0;
}

.video-progress-container:hover .progress-thumb,
.video-progress-container.is-dragging .progress-thumb {
  opacity: 1;
}

.hover-time,
.current-time {
  position: absolute;
  top: -30px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.current-time {
  background: rgba(255, 71, 87, 0.9);
}
</style>
