<template>
  <div class="tag" @click="getTag(tag)">#{{ tag }}</div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { useRouter } from 'vue-router'

defineProps({
  tag: {
    type: String,
    default: '',
  },
})
const vipStore = useVip()
const router = useRouter()
const getTag = (tag) => {
  // 删除之前列表
  vipStore.tagName = tag
  vipStore.vipImgData = []
  if (!vipStore.vipImgData.length) {
    vipStore.fetchGroupImgList({ isRefresh: true, options: { keyword: vipStore.tagName } })
  }
  router.replace({
    path: '/comics/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.tag {
  color: #ff007a;
  font-weight: 600;
  margin: 5px 10px 0 0;
  white-space: nowrap;
}
</style>
