<template>
  <div class="menuDrawer">
    <el-drawer v-model="drawer" direction="ltr" size="70%" @close="closeDrawer">
      <template #header>
        <div class="menuTitle">
          <slot name="menuHeader"></slot>
        </div>
      </template>
      <template #default>
        <div class="content">
          <div class="menuDefault">
            <slot name="menuDefault"></slot>
          </div>
          <div class="other">
            <slot name="other"></slot>
          </div>
          <div class="switch">
            <slot name="switch"></slot>
          </div>
          <div class="logout">
            <el-button color="#ff007a" size="large" @click="logoutClick">登出</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import myCache from '@/utils/cacheStorage'
import { useRouter } from 'vue-router'

const props = defineProps({
  isDrawer: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['closeDrawerEmit'])
const drawer = ref(false)
watchEffect(() => {
  drawer.value = props.isDrawer
})
// 关闭菜单
const closeDrawer = () => {
  emit('closeDrawerEmit')
}
const router = useRouter()
// 用户登出
const logoutClick = () => {
  myCache.remove('userInfo')
  router.replace('/login')
}
</script>

<style scoped>
.menuDrawer {
  :deep(.el-drawer) {
    background-color: var(--comics-bg-color);
    .el-drawer__close-btn {
      color: var(--comics-menuText-color);
    }
  }
  color: var(--comics-menuText-color);
  .menuTitle {
    flex: 3;
    text-align: start;
    margin-left: 10px;
    font-weight: 700;
    color: var(--primary-pink-color);
    font-size: 30px;
    font-family:
      Lucida Handwriting,
      Georgia Pro,
      Georgia,
      Times New Roman,
      serif;
  }
  .content {
    .menuDefault {
      font-size: 22px;
      font-weight: 400;
      margin-bottom: 10px;
      padding-bottom: 10px;
    }
    .other {
      margin: 15px 0;
    }
    .switch {
      :global(.el-switch__core) {
        --el-switch-on-color: #ff007a !important;
      }
    }
    .logout {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #999;
      .el-button {
        cursor: pointer;
        width: 100%;
      }
    }
  }
}
</style>
