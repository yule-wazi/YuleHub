<template>
  <div class="imageItem" @click="getDetail">
    <div class="item">
      <div class="image">
        <img :src="showImg" alt="" @error="handleImgError" />
      </div>
      <div class="content">
        <div class="title">{{ itemData.title }}</div>
        <div class="desc" v-html="itemData.caption"></div>
        <div class="tagList">
          <template v-for="tag in itemData.tags.slice(0, 3)">
            <div class="tag"># {{ tag.name }}</div>
          </template>
        </div>
        <div class="tip">
          <div class="textLength">{{ itemData.text_length }}字</div>
          <div class="like">
            <el-icon><Star /></el-icon>
            {{ itemData.total_bookmarks }}
          </div>
          <div class="totalView">
            <el-icon><View /></el-icon>
            {{ itemData.total_view }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { Star, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  itemData: {
    type: Object,
    default: {},
  },
})

// 移除加载错误图片
const handleImgError = (e) => {
  const imageItem = e.target.closest('.imageItem')
  if (imageItem) {
    imageItem.remove()
  }
}
// 缩略图占位
const LQIPImg = switchImgResolutionUrl(props.itemData.image_urls.medium)
const showImg = ref(LQIPImg)
const originImg = switchImgResolutionUrl(props.itemData.image_urls.medium, 'origin')
preLoadImg(originImg).then(() => {
  showImg.value = originImg
})
// 进入详情页
const router = useRouter()
const getDetail = () => {
  router.push({ path: '/noval/detail', query: { id: props.itemData.id } })
}
</script>

<style lang="less" scoped>
.imageItem {
  @media (min-width: 800px) {
    padding: 10px;
  }
  @media (min-width: 1000px) {
    padding: 5px;
  }
  .item {
    @media (min-width: 800px) {
      width: 28vw;
    }
    @media (min-width: 1000px) {
      width: 23vw;
    }
    width: 92vw;
    height: 250px;
    margin: 10px 0;
    display: flex;
    background-color: var(--comics-cardBg-color);
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 1px 1px 0 rgba(131, 131, 131, 0.5);
    .image {
      height: 100%;
      img {
        width: 140px;
        height: 100%;
        object-fit: cover;
      }
    }
    .content {
      position: relative;
      height: 100%;
      width: 100%;
      padding: 10px 15px;
      box-sizing: border-box;
      .title {
        color: var(--comics-cardTitle-color);
        font-size: 20px;
        font-weight: 700;
        max-height: 40%;
        overflow: hidden;
      }
      .desc {
        display: -webkit-box;
        font-size: 12px;
        color: var(--comics-headerIcon-color);
        font-weight: 600;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 4;
        word-break: break-word;
        line-height: 1.5em;

        .title {
          flex: 1;
        }
      }
      .tagList {
        position: absolute;
        bottom: 32px;
        font-size: 10px;
        color: var(--comics-headerIcon-color);
        color: #ff007a;
      }
      .tip {
        display: flex;
        position: absolute;
        bottom: 10px;
        font-size: 14px;
        color: var(--comics-cardTitle-color);
        .textLength {
          margin-right: 10px;
        }
        .like {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
