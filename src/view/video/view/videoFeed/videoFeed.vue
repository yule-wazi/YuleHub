<template>
  <div class="videoFeed">
    <VideoSwiper :videoList />
  </div>
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import VideoSwiper from '../../cpns/videoSwiper.vue'

const videoStore = useVideo()
const { videoList } = videoStore
</script>

<style lang="less" scoped>
.videoFeed {
  width: 100%;
  height: 100%;
}
</style>
