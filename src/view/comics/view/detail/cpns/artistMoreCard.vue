<template>
  <div class="artistMoreCard">
    <Card>
      <template #headerLeft>
        <div class="title">其他作品</div>
      </template>
      <template #content>
        <div class="content">
          <div class="imgList">
            <template v-for="(item, index) in imgList" :key="item?.id || index">
              <div v-if="item?.image_urls" class="image" @click="getDetail(item)">
                <MyImg :imgUrl="item?.image_urls?.large" :lazyLoad="false" />
              </div>
              <div v-else class="image skeleton">
                <!-- 骨架屏由 MyImg 自动处理 -->
                <MyImg imgUrl="" :lazyLoad="false" />
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
import Card from '@/view/comics/cpns/card.vue'
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MyImg from '@/components/myImg/myImg.vue'

const vipStore = useVip()
const router = useRouter()
defineProps({
  imgList: {
    type: Array,
    default: () => [...Array(6)],
  },
})
const scrollToTop = () => {
  const container = document.querySelector('.comics')
  container.scrollTo({ top: 0 })
}

const getDetail = async (imgInfo) => {
  const pid = imgInfo.id

  // ✅ 立即更新 detailData，让主图能立即显示
  vipStore.detailData = {
    pid: imgInfo.id,
    uid: imgInfo.user?.id || vipStore.detailData.uid, // 复用当前作者ID
    title: imgInfo.title,
    coverImg: imgInfo.image_urls,
    pageList: imgInfo.meta_pages || [],
    tags: imgInfo.tags || [],
    width: imgInfo.width,
    height: imgInfo.height,
    x_restrict: imgInfo.x_restrict || 0,
  }
  vipStore.currentDetailShowImg = imgInfo.image_urls?.large

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
        cursor: pointer;
        background-color: var(--comics-headerIcon-color);
        :deep(.myImg) {
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: 0.2s ease;
          }
          &:hover img {
            transform: scale(1.1);
          }
        }
        &.skeleton {
          pointer-events: none;
        }
      }
    }
  }
}
</style>
