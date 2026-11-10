<template>
  <div class="wrapper">
    <div class="left">
      <Swiper
        :navigation="true"
        :pagination="pagination"
        :modules="modules"
        :autoplay="autoplay"
        :loop="bannerList.length > 2"
        :spaceBetween="0"
        class="mySwiper"
        style="height: 100%"
      >
        <SwiperSlide v-for="(item, index) in bannerList" :key="index">
          <div class="slide-content">
            <MyImg :imgUrl="item.thumbnail" />
            <div class="item-overlay">
              <div class="item-title">{{ item.title }}</div>
            </div>
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
                <div class="item-info">
                  <div class="total_view">
                    <el-icon><View /></el-icon>
                    {{ item.total_view }}
                  </div>
                  <div class="total_bookmarks">
                    <el-icon><Star /></el-icon>
                    {{ item.total_bookmarks }}
                  </div>
                </div>
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
import { Refresh, Star, View } from '@element-plus/icons-vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { getPixivRelatedImg, getPixivsionSpotlights } from '@/service/module/vip'
import myLocalCache from '@/utils/cacheStorage'
import MyImg from '@/components/myImg/myImg.vue'
import { useRouter } from 'vue-router'
import useVip from '@/sotre/module/vip'

const router = useRouter()
const vipStore = useVip()
const modules = [Navigation, Pagination, Autoplay]
const pagination = {
  clickable: true,
  dynamicBullets: true,
}
const autoplay = {
  delay: 5000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}
const bannerList = ref([])
const yourLike = ref(new Array(6))
// bannerList
const getBannerList = async () => {
  const res = await getPixivsionSpotlights()
  bannerList.value = res.data.spotlight_articles
}
getBannerList()

// 猜你喜欢
const isNSFW = myLocalCache.get('isNSFW') ? 'nsfw' : 'sfw'
const collectionKey = `${isNSFW}_collectionList`
const likeList = myLocalCache.get(collectionKey) ?? []

// 推荐数据池：存储待展示的推荐数据（已去重，未展示）
const recommendPool = ref([])
// 用户收藏的ID集合：这些内容永远不推荐
const userCollectionIds = new Set(likeList)
// 正在加载中的标志
const isLoading = ref(false)

// 流式智能推荐算法
const streamYourLike = async () => {
  const SEED_LIMIT = 6 // 最多使用6个种子作品
  const DISPLAY_COUNT = 6 // 展示数量

  isLoading.value = true

  // 从用户收藏中随机选择种子作品
  let seeds = [...likeList]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(SEED_LIMIT, likeList.length))

  if (!seeds.length) {
    seeds = [139397638, 106403528, 138959428]
  }

  // 用于本次加载的去重
  const loadedIds = new Set([...userCollectionIds])

  // 并发发起所有请求，但不等待全部完成
  const loadPromises = seeds.map(async (pid) => {
    try {
      const response = await getPixivRelatedImg(pid)
      const data = response?.data

      if (!data || data.error || !data.illusts) {
        return []
      }

      // 处理单个请求的数据
      const validItems = data.illusts
        .filter((item) => item && item.id && !loadedIds.has(item.id))
        .map((item) => {
          loadedIds.add(item.id) // 立即标记为已加载
          return {
            img: item.image_urls.large,
            title: item.title,
            pid: item.id,
            uid: item.user.id,
            coverImg: item.image_urls,
            total_view: item.total_view,
            total_bookmarks: item.total_bookmarks,
            ...item,
          }
        })

      // 随机打乱本批数据
      const shuffledItems = validItems.sort(() => Math.random() - 0.5)

      // 立即添加到推荐池
      recommendPool.value.push(...shuffledItems)

      // 实时更新展示：如果当前展示数量不足，立即补充
      updateDisplay()

      return shuffledItems
    } catch (err) {
      console.warn(`获取相关推荐失败 (pid: ${pid}):`, err)
      return []
    }
  })

  // 兜底方案：如果500ms后仍无数据，使用降级推荐
  setTimeout(async () => {
    if (recommendPool.value.length === 0) {
      console.warn('推荐数据加载较慢，触发兜底方案')
      try {
        const res = await getPixivsionSpotlights()
        const fallbackItems = res.data.spotlight_articles
          .filter((item) => !loadedIds.has(item.id))
          .slice(0, DISPLAY_COUNT)
          .map((item) => {
            loadedIds.add(item.id)
            return {
              img: item.thumbnail,
              title: item.title,
              pid: item.id,
            }
          })

        recommendPool.value.push(...fallbackItems)
        updateDisplay()
      } catch (fallbackErr) {
        console.error('降级推荐也失败了:', fallbackErr)
      }
    }
  }, 500)

  // 等待所有请求完成
  await Promise.allSettled(loadPromises)
  isLoading.value = false
}

// 更新展示列表：从推荐池中随机抽取数据展示并移出推荐池
const updateDisplay = () => {
  const DISPLAY_COUNT = 6

  if (recommendPool.value.length === 0) return

  // 如果当前展示的数量已满，不自动替换（等待用户点击"换一批"）
  const currentValidCount = yourLike.value.filter((item) => item?.pid).length
  if (currentValidCount >= DISPLAY_COUNT) {
    return
  }

  // 从推荐池中随机抽取并移除
  const shuffled = [...recommendPool.value].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, DISPLAY_COUNT)

  // 从推荐池中移除已展示的
  const selectedIds = new Set(selected.map((item) => item.pid))
  recommendPool.value = recommendPool.value.filter((item) => !selectedIds.has(item.pid))

  yourLike.value = selected
}

// 发起猜你喜欢请求
streamYourLike()

// 换一批：从推荐池中随机抽取新的数据展示，并从池中移除
const changeList = () => {
  const DISPLAY_COUNT = 6

  // 如果推荐池数据不足6条，清空并重新加载
  if (recommendPool.value.length < DISPLAY_COUNT) {
    console.log('推荐池数据不足，重新加载...')
    // 清空当前展示
    yourLike.value = new Array(6)
    // 清空推荐池
    recommendPool.value = []
    // 重新请求
    streamYourLike()
    return
  }

  // 从推荐池中随机抽取
  const shuffled = [...recommendPool.value].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, DISPLAY_COUNT)

  // 从推荐池中移除已展示的
  const selectedIds = new Set(selected.map((item) => item.pid))
  recommendPool.value = recommendPool.value.filter((item) => !selectedIds.has(item.pid))

  // 更新展示
  yourLike.value = selected

  console.log(`已展示 ${selected.length} 条，推荐池剩余 ${recommendPool.value.length} 条`)
}

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
  @media (max-width: 1000px) {
    flex-direction: column;
    height: auto;
  }
  .left {
    flex: 1;
    height: 100%;
    max-height: 400px;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--comics-headerIcon-color);
    @media (max-width: 1000px) {
      max-height: 200px;
    }
    .mySwiper {
      @media (max-width: 1000px) {
        height: 200px !important;
      }
    }
    .slide-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
      .item-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        transition: transform 0.3s ease;
        z-index: 2;
        .item-title {
          color: white;
          font-size: 20px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
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
            border-radius: 1px;
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
      @media (max-width: 1000px) {
        height: 400px;
      }
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
          .item-info {
            display: flex;
            gap: 10px;
            color: #aaa;
            font-size: 12px;
            margin-top: 4px;
            .total_view,
            .total_bookmarks {
              display: flex;
              align-items: center;
              gap: 4px;
            }
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
