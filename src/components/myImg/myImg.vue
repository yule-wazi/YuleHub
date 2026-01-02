<template>
  <div class="myImg">
    <img :src="showImg" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { preLoadImg } from '@/utils/preLoadImg'

const props = defineProps({
  imgUrl: {
    type: String,
    default: '',
  },
})
const LQIPImg = switchImgResolutionUrl(props.imgUrl)
const originImg = switchImgResolutionUrl(props.imgUrl, 'origin')
let showImg = ref(LQIPImg)
// 加载高清图并替换显示
preLoadImg(originImg)
  .then(({ src }) => (showImg.value = src))
  .catch(() => {})
</script>

<style lang="less" scoped>
.myImg {
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
