<template>
  <transition name="slide">
    <div v-if="show" class="tip">请求成功,加载中</div>
  </transition>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
})
const show = ref(false)

// 自动触发动画

watchEffect(() => {
  if (props.isShow) {
    show.value = true
    setTimeout(() => {
      show.value = false
    }, 2000)
  }
})
</script>

<style lang="less" scoped>
.tip {
  position: fixed;
  z-index: 10;
  top: 20px;
  color: var(--primary-color);
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  padding: 10px 20px;
  line-height: 50px;
  height: 50px;
  border: 2px solid #fff;
  border-radius: 20px;
  background-color: rgba(82, 82, 82, 0.538);
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
