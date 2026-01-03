<template>
  <div class="contentShow">
    <div class="latestArea">
      <Latest partition="Yule插画" />
      <Latest v-if="showPica" partition="Yule漫画" />
      <Latest partition="Yule小说" />
    </div>
    <div class="recommendArea">
      <div class="latest">
        <div class="title">最新插画</div>
        <div class="latestList">
          <template v-for="(item, index) of latestList">
            <template v-if="index <= 2">
              <div class="top3Item">
                <div class="left">
                  <img :src="item.img" alt="" />
                  <div class="index">{{ index + 1 }}</div>
                </div>
                <div class="right">{{ item.title }}</div>
              </div>
            </template>
            <template v-else>
              <div class="latestItem">
                <div class="index">{{ index + 1 }}</div>
                <div class="text">{{ item.title }}</div>
              </div>
            </template>
          </template>
        </div>
        <div class="viewMore">
          <el-button color="#ff007a" style="width: 100%">查看更多</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import useVip from '@/sotre/module/vip'
import { useNavClick } from '@/utils/useNavClick'
import usePica from '@/sotre/module/pica'
import Latest from './latest.vue'
import useNovel from '@/sotre/module/novel'

const latestList = ref([
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
  {
    title: 'adadasdaa',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/00/00/21/139239132_p0_master1200.jpg',
  },
])
const vipStore = useVip()
const picaStore = usePica()
const novelStore = useNovel()
const { filteredNavList } = useNavClick()
// 获取每日插画数据
const getComics = async () => {
  await vipStore.fetchGroupImgList({ isRefresh: true })
}
getComics()
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
getNovel()
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
    .latest {
      width: 100%;
      display: flex;
      flex-direction: column;
      padding-bottom: 10px;
      border-radius: 5px;
      overflow: hidden;
      .title {
        height: 35px;
        line-height: 35px;
        background-color: var(--comics-cardSubTitle-color);
        font-size: 18px;
        font-weight: 500;
        text-align: center;
        color: #fff;
      }
      .latestList {
        font-size: 16px;
        color: var(--comics-cardSubTitle-color);
        .top3Item {
          display: flex;
          height: 60px;
          padding: 5px 10px;
          .left {
            position: relative;
            height: 100%;
            width: 40%;
            border-radius: 5px;
            overflow: hidden;
            img {
              height: 100%;
              width: 100%;
              object-fit: cover;
            }
            .index {
              position: absolute;
              top: 0;
              left: 0;
              width: 16px;
              height: 16px;
              line-height: 16px;
              text-align: center;
              font-size: 14px;
              padding: 3px;
              background-color: var(--primary-pink-color);
              color: #fff;
              border-radius: 4px 0;
              margin-right: 10px;
            }
          }
          .right {
            flex: 1;
            margin-left: 5px;
            font-size: 20px;
            font-weight: 500;
            color: var(--comics-cardText-color);
          }
        }
        .latestItem {
          display: flex;
          padding: 5px 10px;
          .index {
            width: 16px;
            height: 16px;
            line-height: 16px;
            text-align: center;
            font-size: 14px;
            padding: 3px;
            background-color: #666;
            color: #fff;
            border-radius: 4px;
            margin-right: 10px;
          }
        }
      }
      .viewMore {
        padding: 10px;
      }
    }
  }
}
</style>
