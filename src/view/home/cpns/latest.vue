<template>
  <div class="latest">
    <div class="latestHeader">
      <div class="title">{{ partition }}</div>
      <div class="more">
        <el-button style="width: 100%; margin-top: 12px" @click="getMore">
          查看更多
          <el-icon><ArrowRightBold /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="latestList">
      <template v-if="partition === 'Yule插画'">
        <template v-for="item of latest">
          <div class="latestItem">
            <ImageItem v-if="item" :itemData="item" :dataList="vipStore.vipImgData" />
          </div>
        </template>
      </template>
      <template v-else>
        <template v-for="item in recommendList">
          <div class="latestItem">
            <img :src="item" alt="" />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ArrowRightBold } from '@element-plus/icons-vue'
import useVip from '@/sotre/module/vip'
import ImageItem from '@/view/comics/cpns/imageItem.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  partition: {
    type: String,
    default: 'Yule插画',
  },
})
const vipStore = useVip()
const router = useRouter()
const latest = computed(() => {
  return vipStore.vipImgData.length ? vipStore.vipImgData.slice(0, 10) : new Array(10)
})
const getMore = () => {
  const partition = props.partition
  if (partition === 'Yule插画') {
    router.push('/comics')
  }
}
</script>

<style lang="less" scoped>
.latest {
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
        .content {
          transform: translateY(-95%);
          background-color: var(--comics-cardBg-color);
        }
      }
    }
  }
}
</style>
