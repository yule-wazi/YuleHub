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
          <el-button style="width: 100%; margin-top: 12px" @click="changeList">
            换一批
            <el-icon size="16"><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="likeList">
        <template v-for="item in yourLike.slice(0, 6)" :key="item.title">
          <div class="likeItem">
            <MyImg :imgUrl="item.img" />
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
const yourLike = ref([])

const isNSFW = myLocalCache.get('isNSFW') ? 'nsfw' : 'sfw'
const collectionKey = `${isNSFW}_collectionList`
const likeList = myLocalCache.get(collectionKey) ?? []

// 智能推荐算法
const randomYourLike = async () => {
  if (!likeList.length) {
    try {
      const res = await getPixivsionSpotlights()
      yourLike.value = res.data.spotlight_articles.map((item) => ({
        img: item.thumbnail,
        title: item.title,
        pid: item.id,
      }))
    } catch (err) {
      console.error('获取随机推荐失败:', err)
    }
    return
  }
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
      align-items: start;
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
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: repeat(2, calc(50% - 5px));
      gap: 10px;
      .likeItem {
        height: 100%;
        border-radius: 5px;
        overflow: hidden;
      }
    }
  }
}
</style>
