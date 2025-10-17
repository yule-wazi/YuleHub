<template>
  <div class="videoFeed">
    <VideoSwiper :videoList="videoFeedList" />
  </div>
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import VideoSwiper from '../../cpns/videoSwiper.vue'

const videoStore = useVideo()
videoStore.fetchVideoFeedList()
const { videoFeedList } = videoStore
</script>

<style lang="less" scoped>
.videoFeed {
  width: 100%;
  height: 100%;
  background-color: var(--comics-headerBg-color);
}
</style>
