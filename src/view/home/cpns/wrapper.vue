<template>
  <div class="wrapper">
    <div class="left">
      <Swiper
        :navigation="true"
        :pagination="pagination"
        :modules="modules"
        :autoplay="autoplay"
        :loop="true"
        :spaceBetween="0"
        class="mySwiper"
        style="height: 100%"
      >
        <SwiperSlide v-for="(slide, index) in bannerList" :key="index">
          <div class="slide-content">
            <img :src="slide.image" :alt="slide.title" class="slide-image" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
    <div class="right">
      <div class="header">
        <div class="title">猜你喜欢</div>
        <div class="changeList">
          <el-button style="width: 100%; margin-top: 12px">
            换一批
            <el-icon size="16"><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="likeList">
        <template v-for="item in yourLike">
          <div class="likeItem">
            <img :src="item" alt="" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Refresh } from '@element-plus/icons-vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

const modules = [Navigation, Pagination, Autoplay]
const pagination = {
  clickable: true,
  dynamicBullets: true,
}
const autoplay = {
  delay: 3000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}
const bannerList = ref([
  {
    image: 'https://picsum.photos/800/350?random=1',
    title: '精彩内容 1',
    description: '探索更多精彩内容',
  },
  {
    image: 'https://picsum.photos/800/350?random=2',
    title: '精彩内容 2',
    description: '发现新的世界',
  },
  {
    image: 'https://picsum.photos/800/350?random=3',
    title: '精彩内容 3',
    description: '享受视觉盛宴',
  },
  {
    image: 'https://picsum.photos/800/350?random=4',
    title: '精彩内容 4',
    description: '更多惊喜等你来',
  },
])
const yourLike = ref([
  'https://i.pximg.org/img-master/img/2025/12/29/00/02/20/139196775_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/29/00/02/20/139196775_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/29/00/02/20/139196775_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/29/00/02/20/139196775_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/29/00/02/20/139196775_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/29/00/02/20/139196775_p0_master1200.jpg',
])
</script>

<style lang="less" scoped>
.wrapper {
  height: 400px;
  display: flex;
  gap: 20px;
  .left {
    flex: 1;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    .slide-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    :deep(.swiper-button-prev),
    :deep(.swiper-button-next) {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      opacity: 0;
      color: var(--primary-pink-color);
      transition: opacity 0.3s ease;
    }
    &:hover :deep(.swiper-button-prev),
    &:hover :deep(.swiper-button-next) {
      opacity: 1;
    }

    :deep(.swiper-pagination-bullet) {
      background-color: var(--primary-pink-color);
      opacity: 0.5;
      transition: all 0.3s ease;
      &.swiper-pagination-bullet-active {
        opacity: 1;
        background-color: var(--primary-pink-color);
      }
    }
  }
  .right {
    height: 100%;
    flex: 1.5;
    border-radius: 8px;
    .header {
      height: 35px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 500;
        color: var(--comics-cardText-color);
      }
      .changeList {
        :deep(.el-button) {
          transition: 0.2s;
          background-color: transparent;
          border: 1px var(--comics-border-color) solid;
          color: var(--comics-cardText-color);
          border: none;
          margin: 0 !important;
          &:hover {
            background-color: var(--primary-pink-color);
            color: #edeef5;
          }
        }
      }
    }
    .likeList {
      width: 100%;
      height: calc(100% - 35px);
      display: grid;
      grid-template-columns: repeat(3, minmax(max-content, 1fr));
      grid-template-rows: repeat(2, calc(50% - 5px));
      gap: 10px;
      .likeItem {
        height: 100%;
        border-radius: 5px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}
</style>
