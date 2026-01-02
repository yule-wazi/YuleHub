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
        <div class="title">
          <span class="title-text">猜你喜欢</span>
        </div>
        <div class="changeList">
          <el-button style="width: 100%; margin-top: 12px" @click="changeList">
            换一批
            <el-icon size="16"><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="likeList">
        <template v-for="(item, index) in yourLike.slice(0, 6)" :key="item?.pid || index">
          <div class="likeItem" @click="getDetail(item)">
            <template v-if="item?.pid">
              <MyImg :imgUrl="item?.img" />
              <div class="item-overlay">
                <div class="item-title">{{ item.title }}</div>
              </div>
            </template>
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
import { getPixivRelatedImg, getPixivsionSpotlights } from '@/service/module/vip'
import myLocalCache from '@/utils/cacheStorage'
import MyImg from '@/components/myImg/myImg.vue'
import { useRouter } from 'vue-router'
import useVip from '@/sotre/module/vip'

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
const yourLike = ref([...Array(6)])

const isNSFW = myLocalCache.get('isNSFW') ? 'nsfw' : 'sfw'
const collectionKey = `${isNSFW}_collectionList`
const likeList = myLocalCache.get(collectionKey) ?? [139397638, 106403528, 138959428]

// 智能推荐算法
const randomYourLike = async () => {
  const SEED_LIMIT = 6 // 最多使用6个种子作品
  // 从用户收藏中随机选择种子作品
  const seeds = [...likeList]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(SEED_LIMIT, likeList.length))
  try {
    // 并发请求所有种子作品的相关推荐
    const responses = await Promise.all(
      seeds.map((pid) =>
        getPixivRelatedImg(pid).catch((err) => {
          console.warn(`获取 pid:${pid} 的推荐失败:`, err)
          return { data: { illusts: [] } }
        }),
      ),
    )
    // 提取所有推荐结果
    const lists = responses.map(
      (res) => [...res.data?.illusts].sort(() => Math.random() - 0.5) || [],
    )

    const result = []
    const seen = new Set()
    likeList.forEach((id) => seen.add(id))
    const maxLen = Math.max(...lists.map((list) => list.length))
    for (let i = 0; i < maxLen; i++) {
      for (let j = 0; j < lists.length; j++) {
        const currentList = lists[j]
        const item = currentList[i]
        if (item && item.id && !seen.has(item.id)) {
          result.push({
            img: item.image_urls.large,
            title: item.title,
            pid: item.id,
            uid: item.user.id,
            coverImg: item.image_urls,
            ...item,
          })
          seen.add(item.id)
        }
      }
    }
    yourLike.value = result
  } catch (err) {
    console.error('个性化推荐获取失败:', err)
    // 降级方案：使用随机推荐
    try {
      const res = await getPixivsionSpotlights()
      yourLike.value = res.data.spotlight_articles.map((item) => ({
        img: item.thumbnail,
        title: item.title,
        pid: item.id,
      }))
    } catch (fallbackErr) {
      console.error('降级推荐也失败了:', fallbackErr)
    }
  }
}

// 发起猜你喜欢请求
randomYourLike()

// 换一批：重新打乱当前推荐列表
const changeList = () => {
  yourLike.value = [...yourLike.value].sort(() => Math.random() - 0.5)
}
const router = useRouter()
const vipStore = useVip()
// 进入详情页
const getDetail = async (item) => {
  const pid = item.pid
  router.push({
    path: '/comics/detail',
    query: { pid },
  })
  vipStore.detailData = item
  vipStore.currentDetailShowImg = item.img
}
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
    .header {
      height: 35px;
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
      .title {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 500;
        color: var(--comics-cardText-color);
        .title-text {
          position: relative;
          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--primary-pink-color), transparent);
            transition: width 0.3s ease;
          }
        }
        &:hover .title-text::after {
          width: 100%;
        }
        .title-icon {
          animation: sparkle 2s ease-in-out infinite;
        }
      }
      .changeList {
        :deep(.el-button) {
          transition: all 0.3s ease;
          background-color: transparent;
          border: 1px var(--comics-border-color) solid;
          color: var(--comics-cardText-color);
          border: none;
          margin: 0 !important;

          &:hover {
            background-color: var(--primary-pink-color);
            color: #edeef5;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(255, 0, 122, 0.3);
          }

          &:active {
            transform: translateY(0);
          }

          .el-icon {
            transition: transform 0.3s ease;
          }

          &:hover .el-icon {
            transform: rotate(180deg);
          }
        }
      }
    }
    .likeList {
      width: 100%;
      height: calc(100% - 45px);
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: repeat(2, calc(50% - 5px));
      gap: 10px;
      .likeItem {
        height: 100%;
        border-radius: 8px;
        overflow: hidden;
        position: relative;

        position: relative;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background-color: var(--comics-headerIcon-color);
        :deep(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
          display: block;
        }
        .item-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          transform: translateY(100%);
          transition: transform 0.3s ease;
          z-index: 2;

          .item-title {
            color: white;
            font-size: 15px;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        &:hover {
          :deep(img) {
            transform: scale(1.1);
          }

          .item-overlay {
            transform: translateY(0);
          }
        }

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 0, 122, 0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 1;
        }

        &:hover::before {
          opacity: 1;
        }
      }
    }
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
