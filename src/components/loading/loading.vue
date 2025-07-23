<template>
  <div ref="loadingRef" v-if="dataList.length" class="loading">加载中···</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import useVip from '@/sotre/module/vip'

const props = defineProps({
  dataList: {
    type: Array,
    default: [],
  },
})
// 触底刷新
let ob = null
const loadingRef = ref(null)
const vipStore = useVip()

watch(loadingRef, () => {
  ob = new IntersectionObserver(
    (entires) => {
      if (entires[0].isIntersecting) {
        emit('loadingEmit')
      }
    },
    {
      threshold: 0,
    },
  )
  if (loadingRef.value) {
    ob.observe(loadingRef.value)
  }
})

const emit = defineEmits(['loadingEmit'])
</script>

<style lang="less" scoped>
.loading {
  height: 100px;
  line-height: 100px;
  font-size: 20px;
  font-weight: 600;
  color: #444;
}
</style>
