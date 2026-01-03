<template>
  <div class="imageItem">
    <div class="item">
      <div class="image" @click="getDetail" :style="{ aspectRatio: imgAspectRatio }">
        <img :src="showImg" alt="" @error="handleImgError" @load="handleImgLoad" />
      </div>
      <div class="content">
        <div class="desc">
          <div class="title" @click="getDetail">{{ itemData.title }}</div>
        </div>
        <div v-if="itemData.tags" class="tagList">
          <template v-for="tag in itemData.tags.slice(0, 3)">
            <Tag :tag="tag" @getTagEmit="getTag" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Tag from '@/components/tag/tag.vue'
import { spliceImgUrl } from '@/utils/ProxyUrl'
import usePica from '@/sotre/module/pica'
import { throttledFlowFlex } from '@/utils/waterflow'
import { preLoadImg } from '@/utils/preLoadImg'

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
const emit = defineEmits(['errorEmit'])
const picaStore = usePica()
// 移除加载错误图片
const handleImgError = (e) => {
  const imageItem = e.target.closest('.imageItem')
  if (imageItem) {
    imageItem.remove()
  }
  emit('errorEmit')
}

// 初始化默认图片高度
const imgAspectRatio = ref('3 / 4')
// 先用低清图拿到宽高比，立即占位
const showImg = ref(spliceImgUrl(props.itemData.thumb.path))
preLoadImg(showImg.value)
  .then(({ width, height, src }) => {
    if (width && height) imgAspectRatio.value = `${width} / ${height}`
    showImg.value = src
  })
  .catch(() => {})

// 图片加载完毕（使用节流以减少重排）
const handleImgLoad = () => {
  throttledFlowFlex({ imgList: props.dataList, imgWidth: 320, isRefresh: true })
}
const router = useRouter()
const route = useRoute()
// 进入详情页
const getDetail = async () => {
  await Promise.all([
    picaStore.fetchPicaPage({ isRefresh: true, id: props.itemData._id }),
    picaStore.fetchPicaDetail(props.itemData._id),
    picaStore.fetchPicaSeries(props.itemData._id),
  ])
  router.push({
    path: '/pica/detail',
    query: { id: props.itemData._id },
  })
}
// 搜索tag
const getTag = (tag) => {
  // 删除之前列表
  picaStore.tagName = tag
  picaStore.picaSearchList = []
  picaStore.searchCurrentPage = 1
  picaStore.searchPicaList({
    isRefresh: true,
    keyword: tag,
    page: picaStore.searchCurrentPage,
  })
  const targetRoute = {
    path: '/pica/category',
    query: { tag },
  }
  if (route.path === '/pica/category') {
    router.replace(targetRoute)
  } else {
    router.push(targetRoute)
  }
}
// 监听窗口
window.addEventListener('resize', function () {
  throttledFlowFlex({ imgList: props.dataList, imgWidth: 320, isRefresh: true })
})
</script>

<style lang="less" scoped>
.imageItem {
  display: none;
  cursor: pointer;
  .item {
    width: 100%;
    background-color: var(--comics-cardBg-color);
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 1px 1px 0 rgba(131, 131, 131, 0.5);
    .image {
      width: 100%;
      height: 80%;
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
        flex-wrap: wrap;
        .tag {
          font-size: clamp(9px, 1vw, 12px);
          margin: 5px 10px 0 0;
        }
      }
    }
  }
}
</style>
