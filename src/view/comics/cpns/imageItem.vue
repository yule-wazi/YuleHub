<template>
  <div class="imageItem">
    <div class="item" :style="{ height: imgDefaultHeight }">
      <div class="image" @click="getDetail">
        <img :src="itemData.url" alt="" @error="handleImgError" @load="handleImgLoad" />
      </div>
      <div class="content">
        <div class="desc">
          <div class="title" @click="getDetail">{{ itemData.title }}</div>
        </div>
        <div class="tagList">
          <template v-for="tag in itemData.tags.slice(0, 3)">
            <div class="tag" @click="getTag(tag)">#{{ tag }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { ref } from 'vue'
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
// 初始化默认图片高度
let imgDefaultHeight = ref('70vh')
// 图片加载完毕
const handleImgLoad = () => {
  imgDefaultHeight.value = undefined
}
const router = useRouter()
// 进入详情页
const getDetail = () => {
  router.push('/comics/detail')
  vipStore.detailData = props.itemData
}
const vipStore = useVip()
// 搜索分类
const getTag = (tag) => {
  console.log(tag)
  // 删除之前列表
  vipStore.tagName = tag
  vipStore.vipImgData = []
  router.replace({
    path: '/comics/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.imageItem {
  .item {
    width: 92vw;
    margin: 10px 0;
    background-color: #fff;
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
        color: #323232;
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
          font-size: 11px;
          color: #ff007a;
          font-weight: 600;
          margin: 5px 10px 0 0;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
