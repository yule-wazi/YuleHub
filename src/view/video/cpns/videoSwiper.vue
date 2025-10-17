<template>
  <swiper
    :modules="[Virtual]"
    :slidesPerView="1"
    :centeredSlides="true"
    :virtual="true"
    :touchStartPreventDefault="false"
    :direction="'vertical'"
    class="mySwiper"
    @swiper="setSwiperRef"
    @transitionEnd="transitionEnd"
  >
    <swiper-slide v-for="(item, index) in videoList" :key="index" :virtualIndex="index">
      <VideoItem :videoItem="item" />
    </swiper-slide>
  </swiper>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/virtual'
import { Virtual } from 'swiper/modules'
import VideoItem from './videoItem.vue'

const props = defineProps({
  videoList: {
    type: Array,
    default: [],
  },
})

let swiperRef = null
const setSwiperRef = (swiper) => {
  swiperRef = swiper
}

const transitionEnd = () => {
  if (swiperRef) {
    const activeIndex = swiperRef.activeIndex
    const videoList = document.querySelectorAll('.video-player')
    videoList.forEach((videoItem) => videoItem.pause())
    if (activeIndex === 0) {
      videoList[0].play()
    } else {
      videoList[1].play()
    }
  }
}
onMounted(() => {
  nextTick(() => {
    const videoList = document.querySelectorAll('.video-player')
    videoList[0].autoplay = true
  })
})
</script>

<style lang="less" scoped>
.swiper {
  max-width: 500px;
  height: 100%;
  background-color: var(--comics-bg-color);
}
.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #444;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
