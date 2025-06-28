<template>
  <div ref="loadingRef" v-if="vipStore.vipImgData.length" class="loading">加载中···</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import useVip from '@/sotre/module/vip'

const props = defineProps({
  options: {
    type: Object,
    default: {},
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
        console.log('刷新···')
        console.log(vipStore.vipImgData.length)
        vipStore.fetchGroupImgList({ options: props.options })
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
