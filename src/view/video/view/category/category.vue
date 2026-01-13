<template>
  <div ref="category" class="category">
    <div class="title">
      <div class="tag">#{{ route.query.author || route.query.tag }}</div>
      <div class="text">一览</div>
    </div>
    <div class="section">
      <div class="section-header">
        <span class="section-title">全部动漫</span>
      </div>
      <div class="video-grid">
        <template v-for="item in videoStore.categoryList" :key="item.vod_id">
          <AnimeCard :item="item" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import { useRoute } from 'vue-router'
import AnimeCard from '../../cpns/animeCard.vue'
import { scrollRestore } from '@/utils/scrollRestore'
import { ref, watchEffect } from 'vue'

const route = useRoute()
const videoStore = useVideo()

// 页面刷新自动给tagName赋值
videoStore.tagName = route.query.tag
// 发起图片组请求
if (!videoStore.videoList.length) {
  videoStore.currentPage = 1
  console.log('重新请求数据')
  videoStore.searchVideoList({ isRefresh: true, keyword: videoStore.tagName })
}
const loadingFetch = () => {
  videoStore.currentPage++
  videoStore.searchVideoList({
    keyword: videoStore.tagName,
    page: videoStore.currentPage,
  })
}
scrollRestore('category', videoStore)
// 重新请求回到顶部
const category = ref(null)
watchEffect(() => {
  if (!videoStore.videoList.length) {
    videoStore.scrollTop = 0
    if (category.value) {
      console.log('回到顶部')
      category.value.scrollTo({ top: 0 })
    }
  }
})
</script>

<style lang="less" scoped>
.category {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--comics-bg-color);

  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    line-height: 50px;
    margin: 20px 0;
    font-size: 20px;
    font-weight: 700;
    background-color: var(--comics-cardBg-color);
    .tag {
      color: #ff007a;
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
    }
    .text {
      color: var(--comics-cardTitle-color);
    }
  }
  .section {
    width: 85vw;
    margin: auto;
    margin-bottom: 25px;
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      @media (max-width: 1000px) {
        flex-direction: column;
        align-items: start;
      }
      .section-title {
        font-size: 20px;
        font-weight: bold;
        color: var(--comics-cardTitle-color);
      }
      .week-tabs {
        margin-left: auto;
        display: flex;
        gap: 8px;
        overflow-x: auto;
        &::-webkit-scrollbar {
          height: 0;
        }
        .week-tab {
          flex-shrink: 0;
          font-size: 13px;
          color: var(--comics-cardSubTitle-color);
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 4px;
          transition: all 0.3s;
          &:hover {
            color: var(--comics-cardTitle-color);
          }
          &.active {
            color: #ff007a;
            background: rgba(255, 0, 122, 0.15);
          }
        }
      }
    }
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 15px;
      @media (min-width: 1000px) {
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }
    }
  }
}
</style>
