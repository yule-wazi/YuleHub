<template>
  <div class="home">
    <HeaderCompoment style="background-color: transparent; border: none" title="YuLeHub" />
    <div class="headerBanner"></div>
    <div class="content">
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
          <template v-for="item in yourLike">
            <div class="likeItem">
              <img :src="item" alt="" />
            </div>
          </template>
        </div>
      </div>
      <div class="partitionBanner">
        <template v-for="item in Partition">
          <div class="PartitionItem">
            <img :src="item.img" alt="" />
            {{ item.text }}
          </div>
        </template>
      </div>
      <div class="contentShow">
        <div class="recommendArea">
          <div class="recommend">
            <div class="recommendHeader">
              <div class="title">Yule插画</div>
              <div class="more">
                <el-button
                  v-show="!showAllComments"
                  style="width: 100%; margin-top: 12px"
                  size="small"
                >
                  查看更多
                  <el-icon><ArrowRightBold /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="recommendList">
              <template v-for="item in recommendList">
                <div class="recommendItem">
                  <img :src="item" alt="" />
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="latestArea">
          <div class="latest">
            <div class="title">最新插画</div>
            <div class="latestList">
              <template v-for="(item, index) of latestList">
                <template v-if="index <= 2">
                  <div class="top3Item">
                    <div class="left">
                      <img :src="item.img" alt="" />
                      <div class="index">{{ index + 1 }}</div>
                    </div>
                    <div class="right">{{ item.title }}</div>
                  </div>
                </template>
                <template v-else>
                  <div class="latestItem">
                    <div class="index">{{ index + 1 }}</div>
                    <div class="text">{{ item.title }}</div>
                  </div>
                </template>
              </template>
            </div>
            <div class="viewMore">
              <el-button color="#ff007a" style="width: 100%">查看更多</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderCompoment from '@/components/headerComponent/headerCompoment.vue'
import { ArrowRightBold } from '@element-plus/icons-vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
const Partition = ref([
  {
    text: 'AI',
    img: 'https://i.pximg.org/img-master/img/2025/12/31/22/00/06/139328271_p0_master1200.jpg',
  },
  {
    text: '插画',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/19/36/37/139270353_p0_master1200.jpg',
  },
  {
    text: '漫画',
    img: 'https://i.pximg.org/img-master/img/2025/12/31/00/22/59/139284467_p0_master1200.jpg',
  },
  {
    text: '小说',
    img: 'https://i.pximg.org/novel-cover-master/img/2025/12/31/22/49/24/ci26869406_523de952b4ed573a317adcf6a5ce0a03_master1200.jpg',
  },
])
const recommendList = ref([
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/30/19/36/37/139270353_p0_master1200.jpg',
])
const latestList = ref([
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
])
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
    background-image: url('https://cc-img.townimg.com/uploads/2024/06/20240602000420192.gif');
    background-size: cover;
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
        display: grid;
        grid-template-columns: repeat(3, minmax(max-content, 1fr));
        grid-template-rows: repeat(2, calc(50% - 5px));
        grid-auto-flow: column;
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
    .partitionBanner {
      display: flex;
      gap: 20px;
      width: 100%;
      @media (max-width: 1000px) {
        overflow-x: auto;
      }
      .PartitionItem {
        flex: 1;
        min-width: 150px;
        aspect-ratio: 7 / 4;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        @media (max-width: 1000px) {
          overflow-x: auto;
          aspect-ratio: 7 / 5;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    .contentShow {
      display: flex;
      align-items: start;
      gap: 20px;
      .recommendArea {
        .recommend {
          .recommendHeader {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--comics-border-color);
            :deep(.el-button) {
              transition: 0.2s;
              background-color: transparent;
              border: 1px var(--comics-border-color) solid;
              border: none;
              color: var(--comics-cardText-color);
              &:hover {
                background-color: var(--primary-pink-color);
                color: #edeef5;
              }
            }
            .title {
              font-size: 18px;
              font-weight: 500;
              color: var(--comics-cardText-color);
            }
          }
          .recommendList {
            display: grid;
            margin-top: 10px;
            grid-template-rows: repeat(2, auto);
            grid-template-columns: repeat(5, 1fr);
            gap: 20px;
            @media (max-width: 1000px) {
              grid-template-rows: repeat(5, auto);
              grid-template-columns: repeat(2, 1fr);
            }
            .recommendItem {
              width: 100%;
              min-width: 0;
              aspect-ratio: 3/4;
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
          }
        }
      }
      .latestArea {
        width: 300px;
        flex-shrink: 0;
        background-color: var(--comics-cardBg-color);
        .latest {
          width: 100%;
          display: flex;
          flex-direction: column;
          padding-bottom: 10px;
          border-radius: 5px;
          overflow: hidden;
          .title {
            height: 35px;
            line-height: 35px;
            background-color: var(--comics-cardSubTitle-color);
            font-size: 18px;
            font-weight: 500;
            text-align: center;
            color: #fff;
          }
          .latestList {
            font-size: 16px;
            color: var(--comics-cardSubTitle-color);
            .top3Item {
              display: flex;
              height: 60px;
              padding: 5px 10px;
              .left {
                position: relative;
                height: 100%;
                width: 40%;
                border-radius: 5px;
                overflow: hidden;
                img {
                  height: 100%;
                  width: 100%;
                  object-fit: cover;
                }
                .index {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 16px;
                  height: 16px;
                  line-height: 16px;
                  text-align: center;
                  font-size: 14px;
                  padding: 3px;
                  background-color: var(--primary-pink-color);
                  color: #fff;
                  border-radius: 4px 0;
                  margin-right: 10px;
                }
              }
              .right {
                flex: 1;
                margin-left: 5px;
                font-size: 20px;
                font-weight: 500;
                color: var(--comics-cardText-color);
              }
            }
            .latestItem {
              display: flex;
              padding: 5px 10px;
              .index {
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                font-size: 14px;
                padding: 3px;
                background-color: #666;
                color: #fff;
                border-radius: 4px;
                margin-right: 10px;
              }
            }
          }
          .viewMore {
            padding: 10px;
          }
        }
      }
    }
  }
}
</style>
