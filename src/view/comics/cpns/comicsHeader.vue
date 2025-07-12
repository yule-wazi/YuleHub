<template>
  <div class="header">
    <div class="menu">
      <img src="@/assets/img/切换表格.png" @click="drawer = true" />
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
  <div class="menu">
    <el-drawer v-model="drawer" direction="ltr" size="70%">
      <template #header>
        <div class="menuTitle">YULE漫画</div>
      </template>
      <template #default>
        <div class="content">
          <div class="home">首页</div>
          <div class="r18">
            <div class="text">NSFW</div>
            <el-switch v-model="isNSFW" size="large" />
          </div>
          <div class="dark">
            <div class="text">夜间模式</div>
            <el-switch v-model="isDark" size="large" />
          </div>
          <div class="logout">
            <el-button type="primary" size="large">登出</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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

// 打开菜单
const drawer = ref(false)

const isNSFW = ref(false)
const isDark = ref(false)
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
  padding: 0 10px;
  .menu {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 60px;
    overflow: hidden;
    img {
      height: 50%;
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
    width: 60px;
    height: 100%;
    overflow: hidden;
    img {
      height: 50%;
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
.menu {
  .menuTitle {
    flex: 3;
    text-align: start;
    margin-left: 10px;
    font-size: 28px;
    font-weight: 700;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  }
  .content {
    .home {
      font-size: 22px;
      font-weight: 400;
      margin-bottom: 10px;
      padding: 10px;
      border-bottom: 1px solid #333;
    }
    .r18,
    .dark {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .logout {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #333;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
