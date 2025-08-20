<template>
  <div ref="detail" class="detail" @scroll="throttleScroll">
    <div ref="headerCard" class="headerCard">
      <div class="content">
        <div class="left">
          <div class="image">
            <img :src="spliceImgUrl(detailData.thumb.path)" />
          </div>
        </div>
        <div class="right">
          <div class="title">{{ detailData.title }}{{ `(${pageList.totalCount}P)` }}</div>
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
      <div class="series">
        <el-scrollbar>
          <div class="scrollbar-flex-content">
            <div
              ref="tagRefs"
              v-for="(item, index) in detailData.picaSeries"
              :key="index"
              class="scrollbar-demo-item"
              @click="getSeriesPage(item)"
            >
              {{ item.title }}
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div ref="pageShow" class="pageShow">
      <template v-for="item in pageList.list">
        <div class="image">
          <div class="lastPage" @click="lastPageClick"></div>
          <div class="nextPage" @click="nextPageClick"></div>
          <img :src="spliceImgUrl(item.media.path)" alt="" />
        </div>
      </template>
    </div>
    <Loading
      :dataList="pageList.list"
      :text="isAllTotal ? '已近到底了' : '加载中...'"
      @loadingEmit="isLoading"
    />
    <Transition>
      <div v-if="showGoBackButton" class="backBottom" @click="goBackBottom(detailRef)">
        <el-icon size="35" color="#fff"><CaretTop /></el-icon>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import usePica from '@/sotre/module/pica'
import { spliceImgUrl } from '@/utils/ProxyUrl'
import myCache from '@/utils/cacheStorage'
import { CaretTop, Star, View } from '@element-plus/icons-vue'
import Tag from '@/components/tag/tag.vue'
import { formatTime } from '@/utils/formatTime'
import { useRoute, useRouter } from 'vue-router'
import Loading from '@/components/loading/loading.vue'
import { reactive, ref, useTemplateRef } from 'vue'
import { throttle } from '@/utils/throttle'

const picaStore = usePica()

// 数据持久化保存
let detailData = {}
if (Object.keys(picaStore.picaDetail).length !== 0) {
  detailData = picaStore.picaDetail
  detailData.picaSeries = picaStore.picaSeries
  myCache.set('picaDetail', detailData)
} else {
  detailData = myCache.get('picaDetail')
}
let pageList = reactive({
  list: [],
  totalCount: 0,
  page: 1,
})
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
    picaStore.fetchPicaPage({
      isRefresh: false,
      id: route.query.id,
      page: pageList.page,
      order: picaStore.picaOrder,
    })
  } else {
    isAllTotal.value = true
  }
}
// 跳转相关文章
const getSeriesPage = async (item) => {
  picaStore.picaOrder = item.order
  pageList.list = []
  pageList.page = 1
  await picaStore.fetchPicaPage({
    isRefresh: true,
    id: route.query.id,
    page: pageList.page,
    order: item.order,
  })
  pageList.totalCount = picaStore.totalCount
  pageList.list = picaStore.pageList
  console.log(pageList.list)
}
const detailRef = useTemplateRef('detail')
const pageShowRef = useTemplateRef('pageShow')
const headerCardRef = useTemplateRef('headerCard')
// 下一张
const nextPageClick = (e) => {
  const scrollTop = pageShowRef.value.getBoundingClientRect().top - headerCardRef.value.offsetHeight
  const targetToBottom = e.target.getBoundingClientRect().bottom
  const scrollHeight = Math.abs(scrollTop) + Math.abs(targetToBottom)
  detailRef.value.scrollTo({ top: scrollHeight })
}
// 上一张
const lastPageClick = (e) => {
  const scrollTop = pageShowRef.value.getBoundingClientRect().top - headerCardRef.value.offsetHeight
  const targetToBottom = e.target.getBoundingClientRect().bottom
  const scrollHeight = Math.abs(scrollTop) - Math.abs(targetToBottom)
  detailRef.value.scrollTo({ top: scrollHeight })
}
// 回到顶部
const showGoBackButton = ref(false)
const goBackBottom = (contentRef) => {
  const content = contentRef
  content.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
// 展示回到底部按钮
const lastScrollTop = ref(0)
const isShowGoBackButton = (e) => {
  const content = e.target
  if (content.scrollTop === 0) {
    showGoBackButton.value = false
  } else if (lastScrollTop.value > content.scrollTop) {
    showGoBackButton.value = true
  } else {
    showGoBackButton.value = false
  }
  lastScrollTop.value = content.scrollTop
}
const throttleScroll = throttle(isShowGoBackButton, 100)
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
      position: sticky;
      padding: 5px 10px;
      font-size: 12px;
      color: var(--comics-menuText-color);
    }
    .series {
      width: 100%;
      padding: 5px 10px;
      box-sizing: border-box;
      background-color: var(--comics-headerBg-color);
      :deep(.el-scrollbar__bar) {
        display: none;
      }
      .scrollbar-flex-content {
        display: flex;
        align-items: center;
        width: fit-content;
        box-sizing: border-box;
        .scrollbar-demo-item {
          display: flex;
          justify-content: center;
          text-align: center;
          flex-shrink: 0;
          color: #ff007a;
          font-weight: 600;
          margin: 5px 10px 0 0;
          font-size: 14px;
          border-radius: 5px;
          padding: 7px 13px;
          border: 1px solid #ff007a;
        }
      }
    }
  }
  .pageShow {
    width: 100%;
    .image {
      position: relative;
      .lastPage {
        position: absolute;
        height: 100%;
        width: 50%;
      }
      .nextPage {
        position: absolute;
        right: 0;
        height: 100%;
        width: 50%;
      }
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
  .backBottom {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 35px;
    height: 35px;
    padding: 5px;
    background-color: #666666c6;
    border: 2px #aaa solid;
    border-radius: 50%;
    transition: all 0.1s;
  }
  .v-enter-from,
  .v-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
  .v-leave-from,
  .v-enter-to {
    transform: translateY(20px);
    opacity: 1;
  }
}
</style>
