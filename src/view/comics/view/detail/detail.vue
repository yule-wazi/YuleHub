<template>
  <div class="detail">
    <div class="title">{{ detailData.title }}</div>
    <div class="headerImg">
      <img :src="showImg" alt="" />
    </div>
    <div class="desc">
      <div class="author">
        <div class="text">作者:</div>
        <div class="name">{{ detailData.user }}</div>
      </div>
      <div class="tagArea">
        <div class="tagTitle">文本标签</div>
        <div class="tagList">
          <template v-for="item in detailData.tags">
            <div class="tag">#{{ item }}</div>
          </template>
        </div>
      </div>
      <div class="otherArts">
        <div class="artsTitle">其他作品</div>
        <div class="imgList"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { onUnmounted, ref } from 'vue'
import myCache from '@/utils/cacheStorage'

const vipStore = useVip()
// 数据持久化保存
let detailData = {}
if (Object.keys(vipStore.detailData).length !== 0) {
  detailData = vipStore.detailData
  myCache.set('detailData', detailData)
} else {
  detailData = myCache.get('detailData')
}
console.log(detailData)
// p站获取高清图片
const showImg = ref(detailData.url)
const origin = switchImgResolutionUrl(detailData.url, 'origin')
preLoadImg(origin).then(() => {
  showImg.value = origin
})

onUnmounted(() => {
  myCache.remove('detailData')
})
</script>

<style lang="less" scoped>
.detail {
  .title {
    margin: 15px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: #323232;
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
    padding: 0 15px;
    .author {
      display: flex;
      justify-content: end;
      font-weight: 700;
      color: #9a9a9a;
      margin-top: 10px;
      .text {
        margin-right: 10px;
      }
    }
    .tagArea {
      margin-top: 10px;
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
          font-weight: 600;
          color: #ff007a;
          border-radius: 5px;
          padding: 7px 13px;
          border: 1px solid #969696;
          margin: 0 14px 14px 0;
        }
      }
    }
    .otherArts {
      margin-top: 10px;
      .artsTitle {
        font-weight: 900;
        font-size: 18px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
