<template>
  <div class="imageItem">
    <div class="item" :style="{ height: imgDefaultHeight }">
      <div class="image" @click="getDetail">
        <img
          :src="spliceImgUrl(itemData.thumb.path)"
          alt=""
          @error="handleImgError"
          @load="handleImgLoad"
        />
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
import { useRouter } from 'vue-router'
import Tag from '@/components/tag/tag.vue'
import { spliceImgUrl } from '@/utils/ProxyUrl'
import usePica from '@/sotre/module/pica'
import { flowFlex, throttledFlowFlex } from '@/utils/waterflow'

const props = defineProps({
  itemData: {
    type: Object,
    default: {},
  },
})
const picaStore = usePica()
// 移除加载错误图片
const handleImgError = (e) => {
  const imageItem = e.target.closest('.imageItem')
  if (imageItem) {
    imageItem.remove()
  }
}

// 初始化默认图片高度
let imgDefaultHeight = ref('70vh')
// 图片加载完毕
const handleImgLoad = () => {
  imgDefaultHeight.value = undefined
  flowFlex({ imgList: picaStore.categoryList, imgWidth: 320 })
}
const router = useRouter()
// 进入详情页
const getDetail = async () => {
  await Promise.all([
    picaStore.fetchPicaPage({ isRefresh: true, id: props.itemData._id }),
    picaStore.fetchPicaDetail(props.itemData._id),
  ])
  router.push({
    path: '/pica/detail',
    query: { id: props.itemData._id },
  })
}
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
// 监听窗口
window.addEventListener('resize', function () {
  throttledFlowFlex({ imgList: picaStore.categoryList, imgWidth: 320 })
})
</script>

<style lang="less" scoped>
.imageItem {
  transition: 0.3s;
  display: none;
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
          font-size: 12px;
          margin: 5px 10px 0 0;
        }
      }
    }
  }
}
</style>
