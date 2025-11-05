<template>
  <div ref="loadingRef" v-if="isShow && timeOut" class="loading">{{ text }}</div>
</template>

<script setup>
import { ref, watch, watchEffect, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  dataList: {
    type: Array,
    default: [],
  },
  text: {
    type: String,
    default: '加载中···',
  },
  root: {
    type: [Object, null],
    default: null,
  },
})
// 触底刷新
let ob = null
const loadingRef = ref(null)
const timeOut = ref(false)
const isShow = ref(false)
setTimeout(() => {
  timeOut.value = true
}, 3000)
function getScrollableRoot(el) {
  if (!el) return null
  let node = el.parentElement
  while (node) {
    const style = getComputedStyle(node)
    const overflowY = style.overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return node
    }
    node = node.parentElement
  }
  return null
}

watch(loadingRef, async () => {
  if (ob) {
    try {
      if (loadingRef.value) ob.unobserve(loadingRef.value)
      ob.disconnect()
    } catch {}
    ob = null
  }
  await nextTick()
  const rootElem = props.root || getScrollableRoot(loadingRef.value)
  ob = new IntersectionObserver(
    (entires) => {
      if (!entires[0]) return
      if (entires[0].isIntersecting) {
        emit('loadingEmit')
      }
    },
    {
      root: rootElem || null,
      threshold: 0,
      rootMargin: '0px 0px 1000px 0px',
    },
  )
  if (loadingRef.value) {
    ob.observe(loadingRef.value)
  }
})
watchEffect(() => {
  if (props.dataList.length > 0) {
    isShow.value = true
  } else {
    isShow.value = false
  }
})

onBeforeUnmount(() => {
  if (ob) {
    try {
      if (loadingRef.value) ob.unobserve(loadingRef.value)
      ob.disconnect()
    } catch {}
  }
})
const emit = defineEmits(['loadingEmit'])
</script>

<style lang="less" scoped>
.loading {
  height: 100px;
  text-align: center;
  line-height: 100px;
  font-size: 20px;
  font-weight: 600;
  color: #444;
}
</style>
