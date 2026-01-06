<template>
  <div class="home" ref="homeRef">
    <HeaderCompoment
      :style="{
        backgroundColor: isScrolled ? 'var(--comics-headerBg-color)' : 'transparent',
        color: isScrolled ? 'var(--comics-cardText-color)' : '#fff',
        borderBottom: isScrolled ? '1px solid var(--comics-border-color)' : 'none',
        transition: 'all 0.3s ease',
      }"
      title="YuLeHub"
    />
    <HeaderBanner />
    <div class="content">
      <Wrapper />
      <PartitionBanner />
      <ContentShow />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HeaderCompoment from '@/components/headerComponent/headerCompoment.vue'
import Wrapper from './cpns/wrapper.vue'
import PartitionBanner from './cpns/partitionBanner.vue'
import ContentShow from './cpns/contentShow.vue'
import HeaderBanner from './cpns/headerBanner.vue'

// 滚动状态
const homeRef = ref(null)
const isScrolled = ref(false)

// 监听滚动事件
const handleScroll = () => {
  if (homeRef.value) {
    const scrollTop = homeRef.value.scrollTop
    isScrolled.value = scrollTop > 155
  }
}

onMounted(() => {
  if (homeRef.value) {
    homeRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (homeRef.value) {
    homeRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  background-color: var(--comics-bg-color);

  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    margin: auto;
    padding-top: 20px;
    @media (min-width: 1000px) {
      width: 85%;
      min-width: 1000px;
    }
    @media (max-width: 1000px) {
      margin-top: 60px;
      padding-top: 20px;
    }
  }
}
</style>
