<template>
  <div class="imageItem">
    <div class="item" :style="{ height: imgDefaultHeight }">
      <div class="image" @click="getDetail">
        <img :src="showImg" alt="" @error="handleImgError" @load="handleImgLoad" />
        <div v-if="itemData.pageList.length" class="pageIcon">
          <el-icon><CopyDocument /></el-icon>
          <span class="pageCount">{{ itemData.pageList.length }}</span>
        </div>
      </div>
      <div class="content">
        <div class="desc">
          <div class="title" @click="getDetail">{{ itemData.title }}</div>
        </div>
        <div class="tagList">
          <template v-for="tag in itemData.tags.slice(0, 3)">
            <Tag :tag="tag.name" @getTagEmit="getTag" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Tag from '@/components/tag/tag.vue'
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { flowFlex, throttledFlowFlex } from '@/utils/waterflow'
import { CopyDocument } from '@element-plus/icons-vue'

const props = defineProps({
  itemData: {
    type: Object,
    default: {},
  },
})
const vipStore = useVip()
// 移除加载错误图片
const handleImgError = (e) => {
  const imageItem = e.target.closest('.imageItem')
  if (imageItem) {
    imageItem.remove()
  }
  emit('errorEmit')
}
// 缩略图占位
const LQIPImg = switchImgResolutionUrl(props.itemData.coverImg.large)
const originImg = switchImgResolutionUrl(props.itemData.coverImg.large, 'origin')
let showImg = ref(LQIPImg)
preLoadImg(originImg).then(() => {
  showImg.value = originImg
})

// 初始化默认图片高度
let imgDefaultHeight = ref('70vh')
// 图片加载完毕
const handleImgLoad = () => {
  imgDefaultHeight.value = undefined
  flowFlex({ imgList: vipStore.vipImgData, imgWidth: 320 })
}

// 监听窗口
window.addEventListener('resize', function () {
  throttledFlowFlex({ imgList: vipStore.vipImgData, imgWidth: 320 })
})
const router = useRouter()
// 进入详情页
const getDetail = () => {
  router.push('/comics/detail')
  vipStore.detailData = props.itemData
}
// 搜索tag
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
const emit = defineEmits(['errorEmit'])
</script>

<style lang="less" scoped>
.imageItem {
  transition: 0.3s;
  .item {
    width: 100%;
    height: 100%;
    background-color: var(--comics-cardBg-color);
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 1px 1px 0 rgba(131, 131, 131, 0.5);
    .image {
      position: relative;
      width: 100%;
      height: 80%;
      .pageIcon {
        position: absolute;
        right: 5px;
        top: 5px;
        display: flex;
        align-items: center;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.4);
        padding: 3px 5px;
        border-radius: 3px;
        .pageCount {
          margin-left: 2px;
        }
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .content {
      height: 20%;
      width: 100%;
      padding: 10px 15px;
      box-sizing: border-box;
      .desc {
        display: flex;
        height: 50%;
        font-size: 18px;
        color: var(--comics-cardTitle-color);
        font-weight: 600;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        .title {
          flex: 1;
        }
      }
      .tagList {
        display: flex;
        .tag {
          font-size: 12px;
          margin: 5px 10px 0 0;
        }
      }
    }
  }
}
</style>
