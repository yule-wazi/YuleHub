<template>
  <div class="myImg">
    <img :src="showImg" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { preLoadImg } from '@/utils/preLoadImg'

const props = defineProps({
  imgUrl: {
    type: String,
    default: '',
  },
  isOriginal: {
    type: Boolean,
    default: false,
  },
})
let showImg = ref(null)

const loadImg = async () => {
  const LQIPImg = switchImgResolutionUrl(props.imgUrl)
  showImg.value = LQIPImg
  const { src } = await preLoadImg(switchImgResolutionUrl(props.imgUrl, 'origin'))
  showImg.value = src
  if (props.isOriginal) {
    const { src } = await preLoadImg(switchImgResolutionUrl(props.imgUrl, 'original'))
    showImg.value = src
    console.log('请求原图', showImg.value)
  }
}
watch(
  () => props.imgUrl,
  () => {
    loadImg()
  },
  { immediate: true },
)
</script>

<style lang="less" scoped>
.myImg {
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
}
</style>
