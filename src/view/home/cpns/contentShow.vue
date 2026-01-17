<template>
  <div class="contentShow">
    <div class="latestArea">
      <Latest partition="Yule插画" />
      <latest partition="Yule动漫" />
      <Latest v-if="showPica" partition="Yule漫画" />
      <Latest partition="Yule小说" />
    </div>
    <div class="recommendArea">
      <Recommend :dataList="hotMonthComics" partition="Yule插画" />
    </div>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { useNavClick } from '@/utils/useNavClick'
import usePica from '@/sotre/module/pica'
import Latest from './latest.vue'
import useNovel from '@/sotre/module/novel'
import useVideo from '@/sotre/module/video'
import Recommend from './recommend.vue'
import { ref } from 'vue'
import { getPixivRankList } from '@/service/module/vip'
import { getYesterdayDate } from '@/utils/formatTime'

const vipStore = useVip()
const picaStore = usePica()
const novelStore = useNovel()
const videoStore = useVideo()
const { filteredNavList } = useNavClick()
// 获取每日插画数据
const getComics = async () => {
  await vipStore.fetchGroupImgList({ isRefresh: true })
}
// 获取每日漫画数据
const showPica = filteredNavList.value.find((item) => item.text === '漫画')
if (showPica) {
  const getPica = async () => {
    await picaStore.fetchCategoryDetail({ isRefresh: true })
  }
  getPica()
}
// 获取每日小说数据
const getNovel = async () => {
  novelStore.getHomeNovel()
}
// 获取每日动漫数据
const getVideo = async () => {
  videoStore.fetchAnimeList(videoStore.baseUrl)
}
// 获取本月最火插画
const hotMonthComics = ref(null)
const getHotMonthComics = async () => {
  let currentDate = getYesterdayDate(7)
  const res = await getPixivRankList(null, currentDate, 'week')
  const formatList = res.data.illusts.map((item) => {
    return {
      pid: item.id,
      uid: item.user.id,
      title: item.title,
      user: item.user.name,
      tags: item.tags,
      coverImg: item.image_urls,
      pageList: item.meta_pages,
      x_restrict: item.x_restrict,
      width: item.width,
      height: item.height,
    }
  })
  hotMonthComics.value = formatList
}

getComics()
getNovel()
getVideo()
getHotMonthComics()
</script>

<style lang="less" scoped>
.contentShow {
  display: flex;
  align-items: start;
  gap: 20px;
  .latestArea {
    flex: 1;
  }
  .recommendArea {
    width: 300px;
    flex-shrink: 0;
    background-color: var(--comics-cardBg-color);
    border-radius: 5px;
    border: 1px solid var(--comics-border-color);
    @media (max-width: 1000px) {
      display: none;
    }
  }
}
</style>
