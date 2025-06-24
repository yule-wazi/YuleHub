<template>
  <div class="comics">
    <div class="header">
      <div class="nav">menu</div>
      <div class="title">YULE漫画</div>
      <div class="search">search</div>
    </div>
    <div class="showArea">
      <template v-for="item in vipStore.vipImgData">
        <ImageItem :itemData="item" />
      </template>
      <div ref="loadingRef" class="loading">加载中···</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import useVip from '@/sotre/module/vip'
import ImageItem from './cpns/imageItem.vue'

const vipStore = useVip()
// 发起图片组请求
vipStore.fetchGroupImgList()
// 触底刷新
let ob = null
const loadingRef = ref(null)
onMounted(() => {
  ob = new IntersectionObserver(
    (entires) => {
      if (entires[0].isIntersecting) {
        console.log('刷新···')
        vipStore.fetchGroupImgList()
      }
    },
    {
      threshold: 0,
    },
  )
  ob.observe(loadingRef.value)
})
</script>

<style lang="less" scoped>
.comics {
  height: 100vh;
  width: 100%;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    height: 60px;
    line-height: 60px;
    padding: 0 20px;
    justify-content: space-between;
    align-self: center;
    font-size: 20px;
    color: aliceblue;
    background-color: orange;
  }
  .showArea {
    display: flex;
    margin-top: 60px;
    flex-direction: column;
    align-items: center;
    background-color: #f4f4f4;
    .loading {
      height: 100px;
      line-height: 100px;
      font-size: 20px;
      font-weight: 600;
      color: #444;
    }
  }
}
</style>
