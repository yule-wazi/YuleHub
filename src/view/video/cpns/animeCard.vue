<template>
  <div class="animeCard" @click="goDetail(item)">
    <div class="card-cover">
      <img :src="showImg" :alt="item.vod_name" @error="switchErrorImg()" />
      <div class="card-score" v-if="item.vod_douban_score > 0">
        {{ item.vod_douban_score }}
      </div>
      <div class="card-remarks">{{ item.vod_remarks }}</div>
    </div>
    <div class="card-title">{{ item.vod_name }}</div>
  </div>
</template>

<script setup>
import useVideo from '@/sotre/module/video'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
})
const videoStore = useVideo()
const router = useRouter()

const showImg = ref(props.item.vod_pic)

const switchErrorImg = () => {
  console.log('图片加载异常')
  showImg.value = 'https://s.pximg.net/common/images/no_profile.png'
}

const goDetail = (item) => {
  videoStore.videoDetail = item
  router.push('/video/detail')
}
</script>

<style lang="less" scoped>
.animeCard {
  cursor: pointer;
  .card-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 6px;
    overflow: hidden;
    background: #1a1a2e;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    &:hover img {
      transform: scale(1.05);
    }

    .card-score {
      position: absolute;
      bottom: 6px;
      left: 6px;
      background: rgba(255, 0, 122, 0.9);
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .card-remarks {
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 3px;
    }
  }
  .card-title {
    margin-top: 8px;
    font-size: 13px;
    color: var(--comics-cardTitle-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
