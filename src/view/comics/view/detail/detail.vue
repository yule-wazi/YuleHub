<template>
  <div class="detail">
    <div class="title">
      <div class="text">{{ detailData.title }}</div>
      <div class="pid">(PID：{{ detailData.pid }})</div>
    </div>
    <div class="headerImg">
      <img v-if="!imgList.length" :src="showImg" />
      <template v-for="item in imgList">
        <img :src="switchImgResolutionUrl(item, 'origin')" alt="加载中..." />
      </template>
    </div>
    <div class="desc">
      <div class="author">
        <div class="authorName">
          <div class="text">作者:</div>
          <div class="name">{{ detailData.user }}</div>
        </div>
        <div class="uid">(UID：{{ detailData.uid }})</div>
      </div>
      <div class="tagArea">
        <div class="tagTitle">文本标签</div>
        <div class="tagList">
          <template v-for="tag in detailData.tags">
            <Tag :tag="tag.name" @getTagEmit="getTag" />
          </template>
        </div>
      </div>
      <div class="otherArts">
        <div class="artsTitle">其他作品</div>
        <div class="imgList">
          <template v-for="item in vipStore.authorOtherImg">
            <div class="image">
              <img :src="item" alt="" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Tag from '@/components/tag/tag.vue'
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import myCache from '@/utils/cacheStorage'
import { useRouter } from 'vue-router'

const vipStore = useVip()
// 清空其他作品列表
vipStore.authorOtherImg = []
// 数据持久化保存
let detailData = {}
if (Object.keys(vipStore.detailData).length !== 0) {
  detailData = vipStore.detailData
  myCache.set('detailData', detailData)
} else {
  detailData = myCache.get('detailData')
}
// p站获取高清图片
const showImg = ref(detailData.coverImg.large)
const origin = switchImgResolutionUrl(detailData.coverImg.large, 'origin')
preLoadImg(origin).then(() => {
  showImg.value = origin
})
//遍历展示所有图片
const imgList = detailData.pageList.map((item) => item.image_urls.large)
// 其他作品
vipStore.fetchOtherImgList(detailData.uid)
const router = useRouter()
// tag搜索
const getTag = (tag) => {
  // 删除之前列表
  vipStore.tagName = tag
  vipStore.vipImgData = []
  vipStore.currentPage = 1
  vipStore.fetchSearchImgList({
    isRefresh: true,
    options: { word: vipStore.tagName, page: vipStore.currentPage },
  })
  router.replace({
    path: '/comics/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.detail {
  max-width: 800px;
  margin: auto;
  .title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #323232;
    color: var(--comics-cardTitle-color);
    padding: 0 10px;
    .pid {
      margin-bottom: 5px;
      font-size: 11px;
      color: #666;
    }
  }
  .headerImg {
    width: 100%;
    box-shadow: 0 0 5px 0 rgba(131, 131, 131, 1);
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .desc {
    .author {
      padding: 0 15px;
      color: var(--comics-cardTitle-color);
      font-weight: 700;
      .authorName {
        display: flex;
        justify-content: end;
        margin-top: 10px;
        .text {
          margin-right: 10px;
        }
      }
      .uid {
        margin-right: 10px;
        text-align: end;
        font-size: 11px;
        color: #666;
      }
    }
    .tagArea {
      padding: 10px 15px;
      color: var(--comics-cardTitle-color);
      margin-top: 20px;
      background-color: var(--comics-cardBg-color);
      .tagTitle {
        font-weight: 900;
        font-size: 18px;
        margin-bottom: 10px;
      }
      .tagList {
        display: flex;
        flex-wrap: wrap;
        .tag {
          font-size: 14px;
          border-radius: 5px;
          padding: 7px 13px;
          border: 1px solid #969696;
          margin: 0 14px 14px 0;
        }
      }
    }
    .otherArts {
      margin-top: 20px;
      padding-top: 10px;
      background-color: var(--comics-cardBg-color);
      color: var(--comics-cardTitle-color);
      .artsTitle {
        padding: 0 10px;
        font-weight: 900;
        font-size: 18px;
        margin-bottom: 10px;
      }
      .imgList {
        display: flex;
        flex-wrap: wrap;
        .image {
          width: 50%;
          img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
          }
        }
      }
    }
  }
}
</style>
