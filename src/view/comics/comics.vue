<template>
  <div class="comics">
    <Tip :is-show="vipStore.isFetch" />
    <div class="header">
      <div class="back" @click="backClick">
        <img class="backIcon" src="@/assets/img/left.png" alt="" />
      </div>
      <div class="searchUID">
        <input class="searchInput" type="text" v-model="searchValue" />
        <div class="searchBtn" @click="searchClick">
          <img class="searchIcon" src="@/assets/img/search.png" alt="" />
        </div>
      </div>
    </div>
    <div class="showImg">
      <template v-for="(item, index) in imgList" :key="index">
        <div class="image">
          <img :src="item" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const A = ref(false)
import { useRouter } from 'vue-router'
import useVip from '@/sotre/module/vip'
import myCache from '@/utils/cacheStorage'
import Tip from '@/components/tip/tip.vue'
const router = useRouter()
const vipStore = useVip()
const imgList = vipStore.vipImgList
// 返回
const backClick = () => {
  router.replace('/chat')
}
// 确定搜索
const searchValue = ref('')
const searchClick = () => {
  const searchUID = searchValue.value * 1
  searchValue.value = ''
  vipStore.isFetch = false
  myCache.set('usersUID', searchUID)
  vipStore.fetchImgList(searchUID)
}
</script>

<style lang="less" scoped>
.comics {
  height: 100%;
  width: 100%;
  overflow: auto;
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    padding: 10px;
    justify-content: space-between;
    .back {
      width: 30px;
      height: 30px;
      .backIcon {
        width: 100%;
        height: 100%;
      }
    }
    .searchUID {
      display: flex;
      .searchInput {
        height: 30px;
        width: 120px;
        color: var(--primary-color);
        border: 2px solid var(--primary-deep-color);
        border-radius: 8px;
        font-size: 20px;
        padding-left: 10px;
        // margin-right: 10px;
      }
      .searchBtn {
        height: 30px;
        width: 30px;
        .searchIcon {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
  .showImg {
    display: flex;
    flex-wrap: wrap;
    .image {
      width: 100%;
      margin: 0;
      padding: 0;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
