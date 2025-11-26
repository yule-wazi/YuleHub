<template>
  <div class="detail">
    <div class="videoArea">
      <video ref="videoRef" controls autoplay></video>
    </div>
    <div class="content">
      <div class="author">
        <div class="image">
          <img
            :src="
              videoDetailData.authorImg ??
              'https://i.pximg.org/img-master/img/2025/09/07/22/06/19/134834046_p0_master1200.jpg'
            "
          />
        </div>
        <div class="authorName">{{ videoDetailData.author }}</div>
        <div class="feed" @click="getVideoFeed">
          <el-icon><Cellphone /></el-icon>
          <div class="iconText">竖屏</div>
        </div>
      </div>
      <div class="videoInfo">
        <div class="title">{{ videoDetailData.title }}</div>
        <div class="info">
          <div v-if="videoDetailData.viewCount > 0" class="viewCount">
            <el-icon class="icon" size="16"><VideoPlay /></el-icon>
            <span class="countText">{{ videoDetailData.viewCount }}</span>
          </div>
          <div class="createAt">{{ videoDetailData.createAt }}</div>
        </div>
        <div class="desc">{{ videoDetailData.desc }}</div>
      </div>
      <div class="tagList">
        <template v-for="item in videoDetailData.labels">
          <div class="videoTag">
            <Tag :tag="item" :hashtag="false" @getTagEmit="getTag" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import myCache from '@/utils/cacheStorage'
import { Cellphone, VideoPlay } from '@element-plus/icons-vue'
import Tag from '@/components/tag/tag.vue'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import parseM3U8 from '@/utils/parseM3U8'

const videoStore = useVideo()
// 数据持久化保存
let videoDetailData = {}
if (Object.keys(videoStore.videoDetail).length !== 0) {
  videoDetailData = videoStore.videoDetail
  myCache.set('videoDetailData', videoDetailData)
} else {
  videoDetailData = myCache.get('videoDetailData')
}
// 获取视频地址

// 解析m3u8视频
const videoRef = useTemplateRef('videoRef')
onMounted(async () => {
  videoDetailData.videoSrc = await videoStore.fetchProxyVideoInfo(videoDetailData.videoSrc)
  await parseM3U8(videoRef.value, videoDetailData.videoSrc)
})
// 进入竖屏模式
const router = useRouter()
const getVideoFeed = () => {
  videoStore.videoFeedList = [videoDetailData]
  router.replace('./feed')
}
// tag搜索
const getTag = (tag) => {
  // 删除之前列表
  videoStore.tagName = tag
  videoStore.vipImgData = []
  videoStore.currentPage = 1
  videoStore.searchVideoList({
    isRefresh: true,
    keyword: videoStore.tagName,
    page: videoStore.currentPage,
  })
  router.replace({
    path: '/video/category',
    query: { tag },
  })
}
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
      position: relative;
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
      .feed {
        position: absolute;
        right: 10px;
        font-size: 30px;
        color: var(--primary-pink-color);
        cursor: pointer;
        .iconText {
          position: absolute;
          top: -13px;
          right: -5px;
          font-size: 8px;
          padding: 2px 5px;
          border: 1px solid var(--primary-pink-color);
          border-radius: 10px;
        }
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
      .videoTag {
        padding: 5px 8px;
        margin: 5px 5px 5px 0;
        font-size: 13px;
        border-radius: 5px;
        background-color: var(--comics-headerSearchBg-color);
      }
    }
  }
}
</style>
