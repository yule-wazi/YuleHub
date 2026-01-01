<template>
  <div class="contentShow">
    <div class="recommendArea">
      <div class="recommend">
        <div class="recommendHeader">
          <div class="title">Yule插画</div>
          <div class="more">
            <el-button style="width: 100%; margin-top: 12px" size="small">
              查看更多
              <el-icon><ArrowRightBold /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="recommendList">
          <template v-for="item in recommendList">
            <div class="recommendItem">
              <img :src="item" alt="" />
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="latestArea">
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
import { ArrowRightBold } from '@element-plus/icons-vue'

const recommendList = ref([
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/31/00/00/22/139282898_p0_master1200.jpg',
  'https://i.pximg.org/img-master/img/2025/12/30/19/36/37/139270353_p0_master1200.jpg',
])
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
</script>

<style lang="less" scoped>
.contentShow {
  display: flex;
  align-items: start;
  gap: 20px;
  .recommendArea {
    .recommend {
      .recommendHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--comics-border-color);
        :deep(.el-button) {
          transition: 0.2s;
          background-color: transparent;
          border: 1px var(--comics-border-color) solid;
          border: none;
          color: var(--comics-cardText-color);
          margin: 0 !important;
          &:hover {
            background-color: var(--primary-pink-color);
            color: #edeef5;
          }
        }
        .title {
          font-size: 18px;
          font-weight: 500;
          color: var(--comics-cardText-color);
        }
      }
      .recommendList {
        display: grid;
        margin-top: 10px;
        grid-template-rows: repeat(2, auto);
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
        @media (max-width: 1000px) {
          grid-template-rows: repeat(5, auto);
          grid-template-columns: repeat(2, 1fr);
        }
        .recommendItem {
          width: 100%;
          min-width: 0;
          aspect-ratio: 3/4;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
  .latestArea {
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
