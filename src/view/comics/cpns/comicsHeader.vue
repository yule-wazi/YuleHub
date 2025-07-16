<template>
  <div class="header">
    <div class="menu">
      <el-icon :size="30" @click="drawer = true" color="var(--comics-headerIcon-color)">
        <Expand />
      </el-icon>
    </div>
    <div class="title">YULE插画</div>
    <div class="search">
      <el-icon
        :size="30"
        @click="isCollapsed = !isCollapsed"
        color="var(--comics-headerIcon-color)"
      >
        <template v-if="isCollapsed"><Search /></template>
        <template v-else><Close /></template>
      </el-icon>
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
  <div class="menuDrawer">
    <MenuDrawer :isDrawer="drawer" @closeDrawerEmit="drawer = false">
      <template #menuHeader> YULE插画 </template>
      <template #switch>
        <div class="r18">
          <div class="text">NSFW</div>
          <el-switch
            v-model="isNSFW"
            size="large"
            change="isNSFW = !isNSFW"
            :active-action-icon="View"
            :inactive-action-icon="Hide"
          />
        </div>
        <div class="dark">
          <div class="text">夜间模式</div>
          <el-switch
            v-model="isDark"
            size="large"
            change="isDark = !isDark"
            :active-action-icon="Moon"
            :inactive-action-icon="Sunny"
          />
        </div>
      </template>
      <template #menuDefault>
        <div class="home" @click="goHome">首页</div>
      </template>
    </MenuDrawer>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useVip from '@/sotre/module/vip'
import myCache from '@/utils/cacheStorage'
import { Search, Hide, View, Expand, Close, Sunny, Moon } from '@element-plus/icons-vue'
import MenuDrawer from '@/components/menuDrawer/menuDrawer.vue'

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
// 切换NSFW
const isNSFW = ref(myCache.get('isNSFW') ?? false)
vipStore.isNSFW = isNSFW.value
watch(isNSFW, () => {
  vipStore.isNSFW = isNSFW.value
  myCache.set('isNSFW', isNSFW.value)
})
// 切换暗黑模式
const isDark = ref(myCache.get('isDark') ?? false)
let comicsElement = undefined
onMounted(() => {
  comicsElement = document.querySelector('.comics')
  watch(
    isDark,
    () => {
      myCache.set('isDark', isDark.value)
      comicsElement.classList.toggle('darkMode', isDark.value)
    },
    { immediate: true },
  )
})

// 回到首页
const goHome = () => {
  router.push('/')
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
  background-color: var(--comics-headerBg-color);
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
    color: var(--comics-headerTitle-color);
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
    background-color: var(--comics-headerBg-color);
    font-size: 22px;
    .el-input__inner {
      background-color: #f5f5f5;
      color: #333;
      background-color: var(--comics-headerSearchBg-color);
      padding-left: 10px;
    }
  }
}
.menuDrawer {
  .r18,
  .dark {
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
}
</style>
