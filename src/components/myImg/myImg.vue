<template>
  <div class="myImg">
    <img :src="showImg" @error="triggerEmit"/>
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
  showOriginal: {
    type: Boolean,
    default: false,
  },
})
let showImg = ref(null)
const loadImg = async () => {
  if (!props.imgUrl) {
    return
  }
  const LQIPImg = switchImgResolutionUrl(props.imgUrl)
  showImg.value = LQIPImg
  const master = switchImgResolutionUrl(props.imgUrl, 'origin')
  const { src } = await preLoadImg(master)
  showImg.value = src
  if (props.showOriginal) {
    const { src } = await preLoadImg(switchImgResolutionUrl(props.imgUrl, 'original'))
    showImg.value = src
  }
}
const triggerEmit = () => {
  emit(e)
}
watch(
  () => props.imgUrl,
  () => {
    loadImg()
  },
  { immediate: true },
)

const emit = defineEmits(['error'])
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
