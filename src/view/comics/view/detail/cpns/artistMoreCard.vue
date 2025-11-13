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
              <div class="image" @click="getDetail(item)">
                <img
                  :src="
                    switchImgResolutionUrl(item?.image_urls?.large, 'origin') ??
                    'https://s.pximg.net/common/images/no_profile.png'
                  "
                  alt=""
                />
              </div>
            </template>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import Card from '@/view/comics/cpns/card.vue'
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const vipStore = useVip()
const router = useRouter()
defineProps({
  imgList: {
    type: Array,
    default: [...Array(6)],
  },
})
const scrollToTop = () => {
  const container = document.querySelector('.comics')
  container.scrollTo({ top: 0 })
}

const getDetail = async (imgInfo) => {
  const pid = imgInfo.id
  router.push({
    path: '/comics/detail',
    query: { pid },
  })
}
const route = useRoute()
watch(
  [() => route.query, () => vipStore.detailDataAll],
  ([newQuery, newObj], [oldQuery, oldObj]) => {
    const pid = newQuery.pid
    const oldPid = oldQuery.pid
    if ((pid || oldPid) && pid !== oldPid && newObj === oldObj) {
      scrollToTop()
    }
  },
  { deep: true },
)
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
