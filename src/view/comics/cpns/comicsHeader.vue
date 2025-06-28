<template>
  <div class="header">
    <div class="menu">
      <img src="@/assets/img/切换表格.png" alt="" />
    </div>
    <div class="title">YULE漫画</div>
    <div class="search">
      <img :src="isCollapsed ? searchImg : closeImg" alt="" @click="isCollapsed = !isCollapsed" />
    </div>
  </div>
  <div ref="searchAreaRef" class="searchArea">
    <el-input
      v-model="input1"
      size="large"
      style="height: 60px"
      placeholder="搜索关键词"
      :suffix-icon="Search"
      @change="searchClick"
    />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect } from 'vue'
import { Search } from '@element-plus/icons-vue'
import searchImg from '@/assets/img/搜索.png'
import closeImg from '@/assets/img/关闭.png'
import useVip from '@/sotre/module/vip'
import { useRouter } from 'vue-router'

const input1 = ref('')
// 点击搜索
const searchAreaRef = ref(null)
const isCollapsed = ref(true)

watch(isCollapsed, () => {
  if (isCollapsed.value) {
    searchAreaRef.value && (searchAreaRef.value.style.top = '0px')
  } else {
    searchAreaRef.value && (searchAreaRef.value.style.top = '60px')
  }
})
// 搜索
const vipStore = useVip()
const router = useRouter()
const searchClick = (tag) => {
  isCollapsed.value = true
  console.log(tag)
  vipStore.tagName = tag
  // 清空之前列表
  vipStore.vipImgData = []
  // 清空搜索内容
  input1.value = ''
  vipStore.fetchGroupImgList({ isRefresh: true, options: { keyword: tag } })

  router.push({
    path: '/comics/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 60px;
  line-height: 60px;
  justify-content: space-between;
  align-self: center;
  color: #333;
  background-color: aliceblue;
  border-bottom: 1px solid #999;
  z-index: 10;
  .menu {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
    overflow: hidden;
    img {
      height: 60%;
      width: 50%;
    }
  }
  .title {
    flex: 3;
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  }
  .search {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
    overflow: hidden;
    img {
      height: 60%;
      width: 50%;
    }
  }
}
.searchArea {
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
  top: 0px;
  z-index: 0;
  transition: 0.3s;
  :deep(.el-input__wrapper) {
    border-radius: 0px !important;
    font-size: 22px;
    .el-input__inner {
      background-color: #f5f5f5;
      padding-left: 10px;
    }
  }
}
</style>
