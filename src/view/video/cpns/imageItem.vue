<template>
  <div class="imageItem" @click="getDetail">
    <div class="item">
      <div class="image">
        <img
          src="https://i.pximg.org/img-master/img/2025/10/10/12/00/08/136089959_p0_master1200.jpg"
          alt=""
          @load="handleImgLoad"
        />
        <div class="viewCount">
          <el-icon class="icon" size="16"><VideoPlay /></el-icon>
          <span class="countText">{{ itemData.viewCount }}</span>
        </div>
        <div class="duration">{{ itemData.duration }}</div>
      </div>
      <div class="content">
        <div class="title">{{ itemData.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import { flowFlex, throttledFlowFlex } from '@/utils/waterflow'
import { VideoPlay } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  itemData: {
    type: Object,
    default: {},
  },
})
const videoStore = useVideo()

const router = useRouter()
const getDetail = () => {
  router.push('/video/detail')
  videoStore.videoDetail = props.itemData
}

// 封装获取图片宽度的函数
const getImgWidth = () => (window.innerWidth < 800 ? 180 : 300)

let imgWidth = getImgWidth()

const handleImgLoad = () => {
  flowFlex({ imgList: videoStore.videoList, imgWidth })
}

window.addEventListener('resize', () => {
  imgWidth = getImgWidth()
  throttledFlowFlex({ imgList: videoStore.videoList, imgWidth })
})
</script>

<style lang="less" scoped>
.imageItem {
  transition: 0.3s;
  display: none;
  .item {
    height: 280px;
    width: 100%;
    background-color: var(--comics-cardBg-color);
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 1px 1px 0 rgba(131, 131, 131, 0.5);
    .image {
      position: relative;
      width: 100%;
      height: 70%;
      color: #fff;
      font-size: 14px;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .viewCount {
        position: absolute;
        display: flex;
        align-items: center;
        bottom: 10px;
        left: 10px;
        .countText {
          margin-left: 5px;
        }
      }
      .duration {
        position: absolute;
        bottom: 10px;
        right: 10px;
      }
    }
    .content {
      height: 100px;
      width: 100%;
      padding: 10px 6px;
      box-sizing: border-box;
      .title {
        font-size: 18px;
        text-align: justify;
        color: var(--comics-cardTitle-color);
        font-weight: 500;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
}
</style>
