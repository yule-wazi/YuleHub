<template>
  <div class="header_Mobile">
    <div class="menu">
      <el-icon
        :size="30"
        @click="drawer = true"
        aria-label="menu"
        style="cursor: pointer"
        color="var(--comics-headerIcon-color)"
      >
        <Expand />
      </el-icon>
    </div>
    <div class="title">{{ title }}</div>
    <div class="search">
      <el-icon
        :size="30"
        @click="isCollapsed = !isCollapsed"
        aria-label="search"
        style="cursor: pointer"
        color="var(--comics-headerIcon-color)"
      >
        <template v-if="isCollapsed"><Search /></template>
        <template v-else><Close /></template>
      </el-icon>
    </div>
  </div>
  <div class="header_PC">
    <div class="content">
      <div class="left">
        <div class="title">{{ title }}</div>
        <div class="navBar">
          <div
            v-for="item in filteredNavList"
            :key="item.text"
            class="item"
            :class="{ active: iconAction == item.action }"
            @click="handleNavClick(item.action)"
          >
            <el-icon size="20px">
              <component :is="item.icon" />
            </el-icon>
            <div class="text">{{ item.text }}</div>
          </div>
        </div>
      </div>
      <div class="searchBox">
        <div class="inputArea">
          <el-input v-model="input" placeholder="搜点什么···" @change="searchClick" />
        </div>
        <div class="postBtn">
          <el-button color="#ff007a" :icon="Search"></el-button>
        </div>
      </div>
      <div class="otherOption">
        <div class="switch">
          <div v-if="userInfo.role === 999" class="item">
            <div class="r18" @click="isNSFW = !isNSFW">
              <template v-if="isNSFW"><Hide /></template>
              <template v-else><View /></template>
            </div>
          </div>
          <div class="item">
            <div class="dark" @click="isDark = !isDark">
              <template v-if="isDark"><Moon /></template>
              <template v-else><Sunny /></template>
            </div>
          </div>
        </div>
        <div class="logout">
          <el-button color="#ff007a" @click="logoutClick" size="large">登出</el-button>
        </div>
      </div>
    </div>
  </div>
  <div ref="searchAreaRef" class="searchArea">
    <el-input
      v-model="input"
      size="large"
      style="height: 60px"
      placeholder="搜索关键词"
      :suffix-icon="Search"
      @change="searchClick"
    />
  </div>
  <div class="menuDrawer">
    <MenuDrawer :isDrawer="drawer" @closeDrawerEmit="drawer = false">
      <template #menuHeader> {{ title }} </template>
      <template #switch>
        <div class="r18" v-if="userInfo.role === 999">
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
        <div class="ohter">
          <slot name="switchOther"></slot>
        </div>
      </template>
      <template #menuDefault>
        <div
          v-for="item in filteredNavList"
          :key="item.text"
          class="item"
          @click="handleNavClick(item.action)"
        >
          <el-icon size="20px">
            <component :is="item.icon" />
          </el-icon>
          <div class="text">{{ item.text }}</div>
        </div>
      </template>
    </MenuDrawer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useVip from '@/sotre/module/vip'
import myCache, { sessionCache } from '@/utils/cacheStorage'
import { Search, Hide, View, Expand, Close, Sunny, Moon } from '@element-plus/icons-vue'
import MenuDrawer from '@/components/menuDrawer/menuDrawer.vue'
import { useNavClick } from '@/utils/useNavClick'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
})
const userInfo = myCache.get('userInfo')

const input = ref('')
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
const emit = defineEmits(['searchClickEmit'])
const searchClick = (tag) => {
  isCollapsed.value = true
  // // 清空搜索内容
  input.value = ''
  emit('searchClickEmit', tag)
}
// 记录当前所在分区
const iconAction = ref(sessionCache.get('iconAction') ?? '')
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
let appElement = undefined
onMounted(() => {
  appElement = document.getElementById('app')
  watch(
    isDark,
    () => {
      myCache.set('isDark', isDark.value)
      appElement.classList.toggle('darkMode', isDark.value)
    },
    { immediate: true },
  )
})
// 用户登出
const logoutClick = () => {
  myCache.remove('userInfo')
  router.replace('/login')
}
const { filteredNavList, handleNavClick } = useNavClick(drawer, iconAction)
</script>

<style lang="less" scoped>
.header_PC {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  justify-content: space-between;
  align-self: center;
  color: var(--comics-cardText-color);
  background-color: var(--comics-cardBg-color);
  border-bottom: 1px solid #999;
  z-index: 999;
  padding: 0 10px;
  .content {
    display: flex;
    justify-content: space-between;
    height: 100%;
    width: 90%;
    min-width: 1000px;
    line-height: 60px;
    margin: auto;
    .left {
      display: flex;
      .title {
        text-wrap: nowrap;
        text-align: center;
        color: var(--primary-pink-color);
        font-size: 30px;
        font-weight: 700;
        font-family:
          Lucida Handwriting,
          Georgia Pro,
          Georgia,
          Times New Roman,
          serif;
        margin-right: 20px;
      }
      .navBar {
        display: flex;
        margin-left: 10px;
        .item {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 55px;
          cursor: pointer;
          margin-right: 15px;
        }
        .active {
          color: var(--primary-pink-color);
        }
      }
    }
    .searchBox {
      position: relative;
      display: flex;
      width: 100%;
      max-width: 500px;
      .inputArea {
        flex: 1;
        --el-color-primary: #ff007a;
        :deep(.el-input__wrapper) {
          height: 40px;
          width: 70%;
          background-color: var(--comics-tagBg-color);
          border: 1px var(--comics-border-color) solid;
          .el-input__inner {
            color: var(--comics-cardText-color);
          }
        }
      }
      .postBtn {
        position: absolute;
        right: 5px;
        :deep(.el-button) {
          transition: 0.2s;
          background-color: transparent;
          border: 1px var(--comics-border-color) solid;
          border: none;
          color: var(--comics-cardText-color);
          &:hover {
            background-color: var(--primary-pink-color);
            color: #edeef5;
          }
        }
      }
    }
    .otherOption {
      display: flex;
      .switch {
        display: flex;
        height: 100%;
        align-items: center;
        .item {
          .r18,
          .dark {
            display: flex;
            align-items: center;
            height: 35px;
            width: 35px;
            margin-right: 5px;
            border-radius: 5px;
            cursor: pointer;
            &:hover {
              transition: 0.2s ease;
              background-color: var(--primary-pink-color);
              color: #fff !important;
              cursor: pointer;
            }
            svg {
              padding: 8px;
            }
          }
        }
      }
      .logout {
        margin-left: 15px;
      }
    }
  }
  @media (max-width: 1000px) {
    display: none !important;
  }
  @media (min-width: 1000px) {
    display: flex !important;
  }
}
.header_Mobile {
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
  background-color: var(--comics-cardBg-color);
  border-bottom: 1px solid #999;
  z-index: 999;
  padding: 0 10px;
  @media (max-width: 1000px) {
    display: flex !important;
  }
  @media (min-width: 1000px) {
    display: none !important;
  }
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
    text-wrap: nowrap;
    color: var(--primary-pink-color);
    font-size: 30px;
    font-weight: 700;
    font-family:
      Lucida Handwriting,
      Georgia Pro,
      Georgia,
      Times New Roman,
      serif;
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
  z-index: 10;
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
  --el-color-primary: #ff007a;
  :deep(.el-input__wrapper) {
    background-color: var(--comics-tagBg-color);
    border: 1px var(--comics-border-color) solid;
  }
}
.menuDrawer {
  .r18,
  .dark,
  .ohter {
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #999;
    margin-bottom: 5px;
    padding: 10px 0;
    cursor: pointer;
    .text {
      margin-left: 5px;
    }
  }
}
</style>
