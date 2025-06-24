<template>
  <div class="imageItem">
    <div class="item" :style="{ height: imgDefaultHeight }">
      <div class="image">
        <img :src="itemData.url" alt="" @error="handleImgError" @load="handleImgLoad" />
      </div>
      <div class="content">
        <div class="desc">
          <div class="title">{{ itemData.title }}</div>
        </div>
        <div class="tagList">
          <template v-for="tag in itemData.tags.slice(0, 3)">
            <div class="tag">#{{ tag }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'


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
  // 修改图片高度为系统自定义高度
  imgDefaultHeight.value = undefined
}

</script>

<style lang="less" scoped>
.imageItem {
  .item {
    // height: 70vh;
    width: 92vw;
    margin: 5px 0;
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
          font-weight: 900;
          margin: 5px 10px 0 0;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
