<template>
  <div class="mainImg">
    <div class="image">
      <template v-if="pageList.length">
        <swiper
          :navigation="true"
          :pagination="pagination"
          :modules="modules"
          :autoHeight="true"
          :spaceBetween="1"
          class="mySwiper"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
        >
          <template v-for="item in pageList" :key="item.id || item.image_urls?.large">
            <swiper-slide>
              <img :src="switchImgResolutionUrl(item.image_urls.large, 'origin')" alt="" />
            </swiper-slide>
          </template>
        </swiper>
        <div class="page-indicator">{{ currentIndex }} / {{ pageList.length }}</div>
      </template>
      <template v-else>
        <img :src="showImg" />
      </template>
    </div>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { onMounted, ref, watch } from 'vue'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const showImg = ref('')
const vipStore = useVip()
const pageList = ref([])
const currentIndex = ref(1)
const modules = [Navigation, Pagination]
const pagination = {
  clickable: true,
}
const swiperInstance = ref(null)
const onSwiper = (swiper) => {
  swiperInstance.value = swiper
}

watch(
  () => vipStore.detailDataAll,
  () => {
    pageList.value = vipStore.detailDataAll?.imgDetail?.pageList ?? []
    swiperInstance.value?.slideTo(0, 0)
    currentIndex.value = 1
    if (vipStore.detailDataAll?.imgDetail?.coverImg?.large) {
      const origin = switchImgResolutionUrl(
        vipStore.detailDataAll.imgDetail.coverImg.large,
        'origin',
      )
      preLoadImg(origin).then(({ src }) => (showImg.value = src))
    }
  },
  { deep: true },
)

onMounted(() => {
  pageList.value = vipStore.detailData?.pageList ?? []
  currentIndex.value = 1
  if (vipStore.detailData?.coverImg?.large) {
    const origin = switchImgResolutionUrl(vipStore.detailData.coverImg.large, 'origin')
    preLoadImg(origin).then(({ src }) => (showImg.value = src))
  }
})

const onSlideChange = (swiperInstance) => {
  currentIndex.value = (swiperInstance?.realIndex ?? 0) + 1
  vipStore.currentDetailShowImg = pageList.value[swiperInstance?.realIndex ?? 0].image_urls.large
}
</script>

<style lang="less" scoped>
.mainImg {
  width: 100%;
  height: auto;
  margin-bottom: 24px;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--comics-cardBg-color);
  @media (min-width: 1000px) {
    height: calc(100vh - 100px);
  }
  .image {
    width: 100%;
    height: auto;
    border-radius: 10px;
    position: relative;
    @media (min-width: 1000px) {
      height: calc(100vh - 100px);
    }
    :deep(.mySwiper) {
      width: 100%;
      height: 100%;
    }
    :deep(.swiper-wrapper) {
      width: 100%;
      height: 100%;
    }
    :deep(.swiper-slide) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: var(--comics-cardBg-color);
    }
    :deep(.swiper-button-prev),
    :deep(.swiper-button-next) {
      color: var(--primary-pink-color);
      font-weight: 900;
      @media (max-width: 1000px) {
        display: none;
      }
    }
    :deep(.swiper-pagination) {
      bottom: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    :deep(.swiper-pagination-bullet) {
      width: 10px;
      height: 10px;
      background: rgba(255, 255, 255, 0.4);
      opacity: 1;
      border-radius: 50%;
      transition: all 0.3s ease;
      margin: 0;
    }
    :deep(.swiper-pagination-bullet-active) {
      width: 30px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.95);
    }
    img {
      width: 100%;
      height: 100%;
      margin: auto;
      display: block;
      object-fit: contain;
      border-radius: 10px;
    }
    .page-indicator {
      position: absolute;
      z-index: 9;
      top: 16px;
      right: 16px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
