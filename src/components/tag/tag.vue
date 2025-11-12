<template>
  <div class="tag" @click="getTag(tag)">
    <span v-if="hashtag">#</span>
    {{ tag }}
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { useRouter } from 'vue-router'

defineProps({
  tag: {
    type: String,
    default: '',
  },
  hashtag: {
    type: Boolean,
    default: true,
  },
})
const vipStore = useVip()
const router = useRouter()
const getTag = (tag) => {
  emit('getTagEmit', tag)
}
const emit = defineEmits(['getTagEmit'])
</script>

<style lang="less" scoped>
.tag {
  color: #ff007a;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}
</style>
