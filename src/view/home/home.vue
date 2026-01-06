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
    <div class="headerBanner"></div>
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
  .headerBanner {
    height: 155px;
    flex-shrink: 0;
    background-image: url(https://i.pximg.org/img-original/img/2025/01/30/22/31/38/126727491_p0.jpg);
    background-image: url(https://i.pximg.org/img-original/img/2025/10/16/18/14/05/136342601_p0.jpg);
    background-image: url(https://i.pximg.org/img-original/img/2025/07/25/20/03/31/133100525_p0.jpg);
    background-image: url(https://i.pximg.org/img-original/img/2025/07/25/20/01/48/133100429_p0.jpg);
    background-position: center;
    background-size: cover;
    @media (max-width: 1000px) {
      display: none;
    }
  }
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
