<template>
  <div class="detail">
    <div class="headerCard">
      <div class="content">
        <div class="left">
          <div class="image">
            <img :src="spliceImgUrl(detailData.thumb.path)" />
          </div>
        </div>
        <div class="right">
          <div class="title">{{ detailData.title }}</div>
          <div class="author">作者：{{ detailData.author }}</div>
          <div class="category">分类：{{ detailData.categories[0] }}</div>
          <div class="tip">
            <div class="like" v-if="detailData.totalLikes">
              <el-icon :size="16" color="#ff007a"><Star /></el-icon>
              <div class="text">{{ detailData.totalLikes }}</div>
            </div>
            <div class="view" v-if="detailData.totalViews">
              <el-icon :size="16" color="#ff007a"><View /></el-icon>
              <div class="text">{{ detailData.totalViews }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="tagList">
        <template v-for="item in detailData.tags">
          <Tag :tag="item" @getTagEmit="getTag" />
        </template>
      </div>
      <div class="desc">{{ detailData.description }}</div>
      <div class="createTime">{{ formatTime(detailData.created_at) }}</div>
    </div>
    <div class="pageShow">
      <template v-for="item in pageList.list">
        <div class="image">
          <img :src="spliceImgUrl(item.media.path)" alt="" />
        </div>
      </template>
    </div>
    <Loading
      :dataList="pageList.list"
      :text="isAllTotal ? '已近到底了' : '加载中...'"
      @loadingEmit="isLoading"
    />
  </div>
</template>

<script setup>
import usePica from '@/sotre/module/pica'
import { spliceImgUrl } from '@/utils/ProxyUrl'
import myCache from '@/utils/cacheStorage'
import { Star, View } from '@element-plus/icons-vue'
import Tag from '@/components/tag/tag.vue'
import { formatTime } from '@/utils/formatTime'
import { useRoute, useRouter } from 'vue-router'
import Loading from '@/components/loading/loading.vue'
import { ref } from 'vue'

const picaStore = usePica()

// 数据持久化保存
let detailData = {}
if (Object.keys(picaStore.picaDetail).length !== 0) {
  detailData = picaStore.picaDetail
  myCache.set('picaDetail', detailData)
} else {
  detailData = myCache.get('picaDetail')
}
let pageList = {
  list: [],
  totalCount: 0,
  page: 1,
}
if (picaStore.pageList.length !== 0) {
  pageList.list = picaStore.pageList
  pageList.totalCount = picaStore.totalCount
  pageList.page = 1
  myCache.set('pageList', pageList)
} else {
  pageList = myCache.get('pageList')
}

const router = useRouter()
// tag搜索
const getTag = (tag) => {
  // 删除之前列表
  picaStore.tagName = tag
  picaStore.categoryList = []
  picaStore.currentPage = 1
  picaStore.searchPicaList({ isRefresh: true, keyword: tag })
  router.replace({
    path: '/pica/category',
    query: { tag },
  })
}
const route = useRoute()
// 上滑加载
const isAllTotal = ref(false)
const isLoading = () => {
  if (pageList.list.length < picaStore.totalCount) {
    pageList.page++
    picaStore.fetchPicaPage({ isRefresh: false, id: route.query.id, page: pageList.page })
  } else {
    isAllTotal.value = true
  }
}
</script>

<style scoped>
.detail {
  max-width: 800px;
  height: 100%;
  overflow: auto;
  margin: auto;
  color: #fff;
  background-color: var(--comics-cardBg-color);
  .headerCard {
    .content {
      display: flex;
      .left {
        width: 30%;
        .image {
          padding: 10px;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 5px;
            overflow: hidden;
          }
        }
      }
      .right {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: start;
        margin-left: 10px;
        .title {
          color: var(--comics-cardTitle-color);
          font-size: 22px;
          font-weight: 700;
        }
        .author {
          color: #ff007a;
          margin-top: 5px;
        }
        .category {
          color: var(--comics-menuText-color);
          font-size: 14px;
          margin: 5px 0;
        }
        .tip {
          display: flex;
          margin-top: 5px;
          .like,
          .view {
            display: flex;
            margin-right: 20px;
            align-items: end;
            font-size: 14px;
            .text {
              margin-left: 5px;
              color: var(--comics-headerIcon-color);
            }
          }
        }
      }
    }
    .tagList {
      display: flex;
      flex-wrap: wrap;
      padding: 10px;
    }
    .desc {
      font-size: 12px;
      color: var(--comics-menuText-color);
      padding: 0 10px;
      text-align: justify;
    }
    .createTime {
      padding: 5px 10px;
      font-size: 12px;
      color: var(--comics-menuText-color);
    }
  }
  .pageShow {
    width: 100%;
    .image {
      img {
        width: 100%;
        display: block;
      }
    }
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
