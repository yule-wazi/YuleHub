<template>
  <div class="artistMoreCard">
    <Card>
      <template #headerLeft>
        <div class="title">其他作品</div>
      </template>
      <template #content>
        <div class="content">
          <div class="imgList">
            <template v-for="item in imgList">
              <div class="image">
                <img :src="switchImgResolutionUrl(item.image_urls.large, 'origin')" alt="" />
              </div>
            </template>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import Card from '@/view/comics/cpns/card.vue'

defineProps({
  imgList: {
    type: Array,
    default: [],
  },
})
</script>

<style lang="less" scoped>
.artistMoreCard {
  .content {
    width: 100%;
    .imgList {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 10px;
      .image {
        width: 100%;
        height: 100%;
        aspect-ratio: 1/1;
        border-radius: 6px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.2s ease;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
    }
  }
}
</style>
