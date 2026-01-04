<template>
  <div class="recommend">
    <div class="title">本周最火插画</div>
    <div class="recommendList">
      <template v-for="(item, index) of list">
        <template v-if="index <= 2">
          <div class="top3Item" @click="getDetail(item)">
            <div class="left">
              <MyImg :imgUrl="item.coverImg.large" />
              <div class="index">{{ index + 1 }}</div>
            </div>
            <div class="right">{{ item.title }}</div>
          </div>
        </template>
        <template v-else>
          <div class="recommendItem" @click="getDetail(item)">
            <div class="index">{{ index + 1 }}</div>
            <div class="text">{{ item.title }}</div>
          </div>
        </template>
      </template>
    </div>
    <div class="viewMore">
      <el-button color="#ff007a" style="width: 100%" @click="handleNavClick(partition)">
        查看更多
      </el-button>
    </div>
  </div>
</template>

<script setup>
import MyImg from '@/components/myImg/myImg.vue'
import useVip from '@/sotre/module/vip'
import { useNavClick } from '@/utils/useNavClick'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  dataList: {
    type: Array,
    default: () => [],
  },
  partition: {
    type: String,
    default: '',
  },
})
const list = computed(() => {
  return props.dataList?.slice(0, 10)
})
// 进入详情
const router = useRouter()
const vipStore = useVip()
const getDetail = (item) => {
  const pid = item.pid
  router.push({
    path: '/comics/detail',
    query: { pid },
  })
  vipStore.detailData = item
  vipStore.currentDetailShowImg = item.coverImg.large
}
const { handleNavClick } = useNavClick()
</script>

<style lang="less" scoped>
.recommend {
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
  .recommendList {
    font-size: 16px;
    color: var(--comics-cardSubTitle-color);
    box-sizing: border-box;
    .top3Item {
      display: flex;
      height: 60px;
      padding: 5px;
      margin: 5px 10px;
      border-radius: 5px;
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
        height: 100%;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
    .recommendItem {
      display: flex;
      padding: 5px;
      margin: 0px 10px;
      border-radius: 5px;
      width: auto;

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
      .text {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .top3Item,
    .recommendItem {
      transition: 0.3s ease;
      cursor: pointer;
      &:hover {
        background-color: #ff4d9475;
      }
      .text {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
  .viewMore {
    padding: 10px;
  }
}
</style>
