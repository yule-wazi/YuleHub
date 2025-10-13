<template>
  <div class="detail">
    <div class="videoArea">
      <video :src="proxyVideoSrc" controls autoplay></video>
    </div>
    <div class="content">
      <div class="author">
        <div class="image">
          <img
            src="https://i.pximg.org/img-master/img/2025/10/10/07/02/56/136084846_p0_master1200.jpg"
            alt=""
          />
        </div>
        <div class="authorName">{{ videoDetailData.author }}</div>
      </div>
      <div class="videoInfo">
        <div class="title">{{ videoDetailData.title }}</div>
        <div class="info">
          <div class="viewCount">
            <el-icon class="icon" size="16"><VideoPlay /></el-icon>
            <span class="countText">{{ videoDetailData.viewCount }}</span>
          </div>
          <div class="createAt">{{ videoDetailData.createAt }}</div>
        </div>
        <div class="desc">{{ videoDetailData.desc }}</div>
      </div>
      <div class="tagList">
        <template v-for="item in videoDetailData.labels">
          <div class="tag">
            <Tag :tag="item" :hashtag="false" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getProxyVideoInfo } from '@/service/module/video'
import useVideo from '@/sotre/module/video'
import myCache from '@/utils/cacheStorage'
import { VideoPlay } from '@element-plus/icons-vue'
import Tag from '@/components/tag/tag.vue'
import { ref } from 'vue'

const videoStore = useVideo()
// 数据持久化保存
let videoDetailData = {}
if (Object.keys(videoStore.videoDetail).length !== 0) {
  videoDetailData = videoStore.videoDetail
  myCache.set('videoDetailData', videoDetailData)
} else {
  videoDetailData = myCache.get('videoDetailData')
}
// 代理请求视频src
const proxyVideoSrc = ref('')
getProxyVideoInfo(videoDetailData.videoSrc).then((res) => {
  proxyVideoSrc.value = res.data.data[0].video_url
})
</script>

<style lang="less" scoped>
.detail {
  max-width: 1000px;
  height: 100%;
  overflow: auto;
  margin: auto;
  background-color: var(--chat-card-bg-color);
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 800px) {
    &::-webkit-scrollbar {
      display: block;
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: #ff007a;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background: var(--comics-headerBg-color);
      border-radius: 4px;
    }
  }
  .videoArea {
    width: 100%;
    video {
      width: 100%;
      max-height: 70vh;
    }
  }
  .content {
    padding: 0 10px;
    .author {
      display: flex;
      align-items: center;
      margin-top: 10px;
      color: var(--comics-menuText-color);
      .image {
        height: 40px;
        width: 40px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .authorName {
        font-size: 20px;
        margin-left: 10px;
        font-weight: 500;
      }
    }
    .videoInfo {
      .title {
        margin: 15px 0px;
        font-size: 20px;
        font-weight: 500;
        color: var(--comics-cardTitle-color);
      }
      .info {
        display: flex;
        font-size: 13px;
        color: var(--comics-menuText-color);
        .viewCount {
          display: flex;
          align-items: center;
          margin-right: 20px;
          .icon {
            margin-right: 3px;
          }
        }
      }
      .desc {
        font-size: 13px;
        color: var(--chat-card-text-color);
        margin: 10px 0;
      }
    }
    .tagList {
      display: flex;
      flex-wrap: wrap;
      .tag {
        padding: 0 3px;
        margin: 5px 5px 5px 0;
        font-size: 13px;
        border-radius: 5px;
        background-color: var(--comics-headerSearchBg-color);
      }
    }
  }
}
</style>
