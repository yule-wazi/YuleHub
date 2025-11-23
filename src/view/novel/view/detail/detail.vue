<template>
  <div class="detail">
    <div class="image">
      <div class="textLength">{{ detailData.text_length }}字</div>
      <img :src="switchImgResolutionUrl(detailData.image_urls.medium, 'origin')" alt="" />
    </div>
    <div class="desc">
      <div class="title">{{ detailData.title }}</div>
      <div class="caption" v-html="detailData.caption"></div>
      <div class="tagList">
        <template v-for="tag in detailData.tags">
          <div class="tag">#{{ tag.name }}</div>
        </template>
      </div>
      <div class="tip">
        <div class="like">
          <el-icon><Star /></el-icon>
          {{ detailData.total_bookmarks }}
        </div>
        <div class="totalView">
          <el-icon><View /></el-icon>
          {{ detailData.total_view }}
        </div>
      </div>
      <div class="createTime">{{ formatTime(detailData.create_date) }}</div>
    </div>
    <div class="content" v-html="formatSpecialOutput(novelStore.novelText)"></div>
  </div>
</template>

<script setup>
import useNovel from '@/sotre/module/novel.js'
import myCahce from '@/utils/cacheStorage'
import { formatSpecialOutput } from '../../utils/formatOutput'
import { formatTime } from '@/utils/formatTime'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { Star, View } from '@element-plus/icons-vue'

const novelStore = useNovel()
let detailData = {}
if (Object.keys(novelStore.currentNovelDetail).length !== 0) {
  detailData = novelStore.currentNovelDetail
  myCahce.set('novelDetailData', detailData)
} else {
  detailData = myCahce.get('novelDetailData')
}
novelStore.fetchNovelText(detailData.id)
</script>

<style lang="less" scoped>
.detail {
  max-width: 1000px;
  height: 100%;
  overflow: auto;
  margin: auto;
  background-color: var(--comics-headerBg-color);

  .image {
    position: relative;
    height: 200px;
    background-color: var(--comics-headerBg-color);
    z-index: 0;

    .textLength {
      position: absolute;
      right: 10px;
      top: 10px;
      font-size: 12px;
      color: var(--comics-menuText-color);
      background-color: var(--comics-headerIcon-color);
      padding: 2px 5px;
      border-radius: 20px;
    }
    img {
      height: 100%;
      display: block;
      margin: auto;
    }
  }
  .desc {
    padding: 10px;
    background-color: var(--comics-headerBg-color);
    border-bottom: 1px solid #666;
    .title {
      color: var(--comics-cardTitle-color);
      font-weight: 700;
      font-size: 20px;
      text-align: center;
    }
    .caption {
      text-indent: 2em;
      color: var(--comics-headerIcon-color);
      font-size: 14px;
    }
    .tagList {
      display: flex;
      flex-wrap: wrap;
      font-size: 12px;
      margin-top: 10px;
      color: #ff007a;
      .tag {
        margin-right: 8px;
      }
    }
    .tip {
      display: flex;
      margin: 10px 0;
      font-size: 14px;
      color: var(--comics-cardTitle-color);
      .like {
        margin-right: 20px;
      }
    }
    .createTime {
      font-size: 12px;
      color: var(--comics-headerIcon-color);
    }
  }
  .content {
    padding: 10px;
    text-align: justify;
    overflow: hidden;
    line-height: 30px;
    color: var(--comics-headerIcon-color);
    font-size: 18px;
    text-indent: 2em;
  }
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
}
</style>
