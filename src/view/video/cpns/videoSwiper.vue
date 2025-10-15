<template>
    <swiper
      :modules="[Virtual]"
      :slidesPerView="1"
      :centeredSlides="true"
      :virtual="true"
      :direction="'vertical'"
      class="mySwiper"
      @swiper="setSwiperRef"
      @transitionEnd ="transitionEnd"
    >
      <swiper-slide
        v-for="(slideContent, index) in slides"
        :key="index"
        :virtualIndex="index"
      >
        <video
          ref="videoPlayers"
          poster="https://i.pximg.org/img-master/img/2025/10/13/00/00/15/136201011_p0_master1200.jpg"
          preload="auto"
          :src="slideContent.videoUrl"
          class="video-player"
          loop
          
        ></video>
      </swiper-slide>
    </swiper>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/virtual';
import { Virtual } from 'swiper/modules';

const props = defineProps({
  videoList: {
    type: Array,
    default: []
  }
})
console.log(props.videoList)

const slides = ref([
  { videoUrl: 'https://alimov2.a.kwimgs.com/upic/2023/02/16/18/BMjAyMzAyMTYxODI4MzJfMjQxNjI0NjA3MF85NjM0NTM0MjAxMV8xXzM=_b_B62179b3c774838cdea9025c3cc1bfc26.mp4?clientCacheKey=3xywsgbtcq2zkw2_b.mp4&tt=b&di=65ed8104&bp=14214' },
  { videoUrl: 'https://alimov2.a.kwimgs.com/upic/2023/05/21/20/BMjAyMzA1MjEyMDAyMzRfOTI2MzIyNjg0XzEwMzY1MTg0NzI4NV8xXzM=_b_B80131b36461fed9af46e68dbbc63c962.mp4?clientCacheKey=3xeyneesm8uzbgq_b.mp4&tt=b&di=65ed8104&bp=14214' },
  { videoUrl: 'https://alimov2.a.kwimgs.com/upic/2024/07/17/20/BMjAyNDA3MTcyMDA2NDlfMjMyOTA2MTY3OV8xMzgwMDI4NDY1MDdfMF8z_b_B39e8a0b3746d84c3815665bca2ae002f.mp4?clientCacheKey=3xe8k3qnake3vdm_b.mp4&tt=b&di=65ed8104&bp=14214' },
  {
    videoUrl: 'https://txmov2.a.kwimgs.com/upic/2024/03/09/10/BMjAyNDAzMDkxMDI5MjNfMzA1ODQxMzlfMTI2ODc5OTQzMzQ3XzFfMw==_b_B1ff9af1b658887a349c3c0a05269f1a0.mp4?clientCacheKey=3x5f58p658jfxts_b.mp4&tt=b&di=65ed8104&bp=14214'
  }
]);

const videoPlayers = ref([]); 

let swiperRef = null;
const setSwiperRef = (swiper) => {
  swiperRef = swiper;
};

const transitionEnd = () => {
  if (swiperRef) {
    const activeIndex = swiperRef.activeIndex;
    const videoList = document.querySelectorAll('.video-player')
    videoList.forEach((videoItem) => videoItem.pause())
    if(activeIndex === 0) {
      videoList[0].play()
    } else {
      videoList[1].play()
    }
  }
}
onMounted(() => {
  nextTick(() => {
    const videoList = document.querySelectorAll('.video-player');
    if (videoList.length > 0) {
      videoList[0].muted = true
      // videoList[0].play()
    }
  })
})
</script>

<style lang="less" scoped>
.swiper {
  width: 100%;
  height: 100%;
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