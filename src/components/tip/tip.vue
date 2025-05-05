<template>
  <transition name="slide">
    <div v-if="show" class="tipShow">请求成功,加载中</div>
    <div v-else-if="error" class="tipError">请求失败,ID不存在</div>
  </transition>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
  fetchError: {
    type: Boolean,
    default: false,
  },
})
const show = ref(false)
const error = ref(false)

// 自动触发动画

watchEffect(() => {
  if (props.isShow) {
    show.value = true
    setTimeout(() => {
      show.value = false
    }, 2000)
  } else if (props.fetchError) {
    error.value = true
    setTimeout(() => {
      error.value = false
    }, 2000)
  }
})
</script>

<style lang="less" scoped>
.tipShow,
.tipError {
  position: fixed;
  height: 50px;
  white-space: nowrap;
  z-index: 10;
  top: 20px;
  color: var(--primary-color);
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  padding: 10px 20px;
  line-height: 50px;
  border: 2px solid #fff;
  border-radius: 20px;
  background-color: rgba(82, 82, 82, 0.538);
}
.tipError {
  border: 2px solid #ff6868;
  background-color: #8e49498a;
}
/* 进入和离开的动画 */
.slide-enter-from,
.slide-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}
.slide-enter-to,
.slide-leave-from {
  transform: translate(-50%, 0);
  opacity: 1;
}
</style>
