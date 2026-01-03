<template>
  <div class="latest">
    <div class="latestHeader">
      <div class="title">{{ partition }}</div>
      <div class="more">
        <el-button style="width: 100%; margin-top: 12px" @click="handleNavClick(partition)">
          查看更多
          <el-icon><ArrowRightBold /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="latestList">
      <template v-if="partition === 'Yule插画'">
        <template v-for="item of latestComics">
          <div class="latestItem">
            <ImageItemComics v-if="item" :itemData="item" :dataList="vipStore.vipImgData" />
          </div>
        </template>
      </template>
      <template v-else-if="partition === 'Yule漫画'">
        <template v-for="item of latestPica">
          <div class="latestItem">
            <ImageItemPica v-if="item" :itemData="item" :dataList="picaStore.categoryList" />
          </div>
        </template>
      </template>
      <template v-else-if="partition === 'Yule小说'">
        <template v-for="item in latestNovel">
          <div class="latestItem">
            <ImageItemNovel v-if="item" :itemData="item" />
          </div>
        </template>
      </template>
      <template v-else-if="partition === 'Yule动漫'">
        <template v-for="item in latestVideo">
          <div class="latestItem">
            <ImageItemVideo v-if="item" :itemData="item" />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ArrowRightBold } from '@element-plus/icons-vue'
import ImageItemComics from '@/view/comics/cpns/imageItem.vue'
import ImageItemNovel from '@/view/novel/cpns/imageItem.vue'
import ImageItemPica from '@/view/pica/cpns/imageItem.vue'
import ImageItemVideo from '@/view/video/cpns/imageItem.vue'
import { useNavClick } from '@/utils/useNavClick'
import { sessionCache } from '@/utils/cacheStorage'
import usePica from '@/sotre/module/pica'
import useNovel from '@/sotre/module/novel'
import useVip from '@/sotre/module/vip'
import useVideo from '@/sotre/module/video'

const props = defineProps({
  partition: {
    type: String,
    default: 'Yule插画',
  },
})
const vipStore = useVip()
const picaStore = usePica()
const novelStore = useNovel()
const videoStore = useVideo()
const iconAction = ref(sessionCache.get('iconAction') ?? '')
const { handleNavClick } = useNavClick(null, iconAction)

const latestComics = computed(() => {
  return vipStore.vipImgData.length ? vipStore.vipImgData.slice(0, 10) : new Array(10)
})
const latestPica = computed(() => {
  return picaStore.categoryList.length ? picaStore.categoryList.slice(0, 10) : new Array(10)
})
const latestNovel = computed(() => {
  return novelStore.novelList.length ? novelStore.novelList.slice(0, 10) : new Array(10)
})
const latestVideo = computed(() => {
  return videoStore.videoList.length ? videoStore.videoList.slice(0, 10) : new Array(10)
})
</script>

<style lang="less" scoped>
.latest {
  margin-bottom: 20px;
  .latestHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--comics-border-color);
    :deep(.el-button) {
      transition: 0.2s;
      background-color: transparent;
      border: 1px var(--comics-border-color) solid;
      border: none;
      color: var(--comics-cardText-color);
      margin: 0 !important;
      &:hover {
        background-color: var(--primary-pink-color);
        color: #edeef5;
      }
    }
    .title {
      position: relative;
      font-size: 18px;
      font-weight: 500;
      color: var(--comics-cardText-color);
      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--primary-pink-color), transparent);
        transition: width 0.3s ease;
      }
    }
  }
  .latestList {
    display: grid;
    margin-top: 10px;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    @media (max-width: 1000px) {
      grid-template-rows: repeat(5, 1fr);
      grid-template-columns: repeat(2, 1fr);
    }
    .latestItem {
      width: 100%;
      aspect-ratio: 2/3;
      min-width: 0;
      border-radius: 5px;
      overflow: hidden;
      background-color: var(--comics-headerIcon-color);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      :deep(.imageItem) {
        width: 100%;
        height: 100%;
        padding: 0;
        display: block;
        .image {
          width: 100%;
          height: 100%;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .item {
          height: 100%;
          width: 100%;
          margin: 0;
        }
        .content {
          transform: translateY(-95%);
          background-color: var(--comics-cardBg-color);
          height: auto;
          .title {
            font-size: clamp(10px, 1vw, 16px);
          }
          .tagList {
            flex-wrap: nowrap;
          }
        }
        .novelContent {
          position: absolute;
          // background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(5px);
        }
      }
    }
  }
}
</style>
