<template>
  <div ref="loadingRef" v-if="vipStore.vipImgData.length" class="loading">加载中···</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import useVip from '@/sotre/module/vip'
// 触底刷新
let ob = null
const loadingRef = ref(null)
const vipStore = useVip()

watch(loadingRef, () => {
  ob = new IntersectionObserver(
    (entires) => {
      if (entires[0].isIntersecting) {
        console.log('刷新···')
        vipStore.fetchGroupImgList()
      }
    },
    {
      threshold: 0,
    },
  )
  if (loadingRef) {
    ob.observe(loadingRef.value)
  }
})

// onMounted(() => {
//   ob = new IntersectionObserver(
//     (entires) => {
//       if (entires[0].isIntersecting) {
//         console.log('刷新···')
//         vipStore.fetchGroupImgList()
//       }
//     },
//     {
//       threshold: 0,
//     },
//   )
//   ob.observe(loadingRef.value)
// })
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
