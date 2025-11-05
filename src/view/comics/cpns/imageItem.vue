<template>
  <div class="imageItem">
    <div class="item">
      <div class="image" :style="{ aspectRatio: imgAspectRatio }" @click="getDetail">
        <img :src="showImg" loading="lazy" @error="handleImgError" />
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tag from '@/components/tag/tag.vue'
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { throttledFlowFlex } from '@/utils/waterflow'
import { CopyDocument } from '@element-plus/icons-vue'

const props = defineProps({
  itemData: {
    type: Object,
    default: {},
  },
  dataList: {
    type: Array,
    default: [],
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
const LQIPImg = switchImgResolutionUrl(props.itemData.coverImg.large)
const originImg = switchImgResolutionUrl(props.itemData.coverImg.large, 'origin')
let showImg = ref(LQIPImg)
// 直接使用 API 返回的宽高比，避免通过图片加载获取导致的偏移
const imgAspectRatio = computed(() => {
  if (props.itemData.width && props.itemData.height) {
    return `${props.itemData.width} / ${props.itemData.height}`
  }
  return '3 / 4'
})
// 加载高清图并替换显示
preLoadImg(originImg)
  .then(({ src }) => (showImg.value = src))
  .catch(() => {})

// 监听窗口 resize：列数变化时需要重新计算
window.addEventListener('resize', function () {
  throttledFlowFlex({ imgList: props.dataList, imgWidth: 320, isRefresh: true })
})
const router = useRouter()
const route = useRoute()
// 进入详情页
const getDetail = () => {
  const pid = props.itemData.pid
  router.push({
    path: '/comics/detail',
    query: { pid },
  })
  vipStore.detailData = props.itemData
}
// 搜索tag
const getTag = (tag) => {
  // 删除之前列表
  vipStore.tagName = tag
  // vipStore.vipSearchImgData = []
  vipStore.searchCurrentPage = 1
  vipStore.fetchSearchImgList({
    isRefresh: true,
    options: { word: vipStore.tagName, page: vipStore.searchCurrentPage },
  })
  const targetRoute = {
    path: '/comics/category',
    query: { tag },
  }
  router.push(targetRoute)
}
const emit = defineEmits(['errorEmit'])
</script>

<style lang="less" scoped>
.imageItem {
  display: none;
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
      /* 使用 aspect-ratio 占位，避免初次渲染高度跳变 */
      height: auto;
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
