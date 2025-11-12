<template>
  <div class="mainImg">
    <div class="image">
      <img :src="showImg" />
    </div>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { preLoadImg } from '@/utils/preLoadImg'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { onMounted, ref, watch } from 'vue'

const showImg = ref('')
const vipStore = useVip()
watch(
  () => vipStore.detailDataAll,
  () => {
    if (vipStore.detailDataAll.imgDetail?.coverImg?.large) {
      const origin = switchImgResolutionUrl(
        vipStore.detailDataAll.imgDetail?.coverImg?.large,
        'origin',
      )
      preLoadImg(origin).then(({ src }) => (showImg.value = src))
    }
  },
  { deep: true },
)
onMounted(() => {
  // 展示主图
  if (vipStore.detailData?.coverImg?.large) {
    const origin = switchImgResolutionUrl(vipStore.detailData.coverImg.large, 'origin')
    preLoadImg(origin).then(({ src }) => (showImg.value = src))
  }
})
</script>

<style lang="less" scoped>
.image {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 24px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
