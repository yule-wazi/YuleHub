<template>
  <div ref="home" class="home">
    <div class="list">
      <template v-for="item in videoStore.videoList">
        <ImageItem :itemData="item" />
      </template>
    </div>
  </div>
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import ImageItem from '../../cpns/imageItem.vue'

const videoStore = useVideo()
videoStore.fetchVideoList()
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  .list {
    width: 100%;
    margin-top: 10px;
    position: relative;
    @media (min-width: 800px) {
      width: 80%;
    }
    @media (min-width: 1000px) {
      width: 100%;
    }
  }
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 800px) {
    &::-webkit-scrollbar {
      display: block;
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: #ff007a;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background: var(--comics-headerBg-color);
      border-radius: 4px;
    }
  }
}
</style>
