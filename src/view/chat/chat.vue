<template>
  <div class="chat">
    <div class="left">
      <template v-for="({ userName, image, isVip }, index) in users" :key="index">
        <ChatUser
          v-if="!isVip || (isVip && vipStore.isVip)"
          :userName
          :image
          :class="{ active: activeIndex === index }"
          @click="userClick(userName, index, image)"
        />
      </template>
      <div v-if="userInfo.role === 1" class="comics" @click="comicsClick">插画</div>
      <div class="menu" @click="drawer = true">菜单</div>
      <div class="logout" @click="logoutClick">登出</div>
    </div>
    <div
      class="right"
      :style="{
        '--background-img': `url('${agentStore.backgroundImg}')`,
      }"
    >
      <ChatPage :title="agentStore.currentUser" />
    </div>
    <div class="menuDrawer">
      <MenuDrawer :isDrawer="drawer" @closeDrawerEmit="drawer = false">
        <template #menuHeader> AI聊天室 </template>
        <template #menuDefault>
          <div class="home" @click="comicsClick">插画</div>
        </template>
        <template #other>
          <div class="addUserCard" @click="centerDialogVisible = true">添加角色卡</div>
        </template>
        <template #switch>
          <div class="memory">
            <div class="text">记忆存储</div>
            <el-switch
              v-model="isMemory"
              size="large"
              change="isMemory = !isMemory"
              :active-action-icon="Check"
              :inactive-action-icon="Close"
            />
          </div>
        </template>
      </MenuDrawer>
    </div>
  </div>
  <el-dialog v-model="centerDialogVisible" title="添加角色卡" width="90vw" center>
    <el-form ref="ruleFormRef" :model="roleForm">
      <el-form-item prop="userName">
        <span>角色名</span>
        <el-input
          v-model="roleForm.userName"
          style="width: 100%"
          :autosize="{ minRows: 1, maxRows: 2 }"
          type="textarea"
          placeholder="请输入角色名称"
        />
      </el-form-item>
      <el-form-item prop="image">
        <span>头像</span>
        <el-input v-model="roleForm.image" style="width: 100%" placeholder="请输入URL" />
      </el-form-item>
      <el-form-item prop="description">
        <span>角色卡介绍</span>
        <el-input
          v-model="roleForm.description"
          style="width: 100%"
          :autosize="{ minRows: 4, maxRows: 8 }"
          type="textarea"
          placeholder="请输入角色介绍"
        />
      </el-form-item>
      <el-form-item prop="firstMessage">
        <span>首条消息</span>
        <el-input
          v-model="roleForm.firstMessage"
          style="width: 100%"
          :autosize="{ minRows: 4, maxRows: 8 }"
          type="textarea"
          placeholder="请输入角色发起的第一条消息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addRoleCardConfirm"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ChatPage from './cpns/chatPage/chatPage.vue'
import ChatUser from './cpns/chatUser/chatUser.vue'
import useAgent from '@/sotre/module/agent'
import useVip from '@/sotre/module/vip'
import allUsers from '@/sotre/agentUsersConfig'
import myCache from '@/utils/cacheStorage'
import { storeToRefs } from 'pinia'
import MenuDrawer from '@/components/menuDrawer/menuDrawer.vue'
import { Close, Check } from '@element-plus/icons-vue'
import { systemPrompt } from '@/utils/systemPrompt'

const roleForm = reactive({
  userName: '',
  image: '',
  description: '',
  firstMessage: '',
})

const agentStore = useAgent()
const vipStore = useVip()
const users = agentStore.users
// 检测角色等级
const userInfo = myCache.get('userInfo')
if (userInfo.role) {
  vipStore.isVip = true
} else {
  vipStore.isVip = false
}
// 根据角色动态插入agent
if (!agentStore.users.length) {
  allUsers.forEach((item) => {
    if (!item.isVip || (item.isVip && vipStore.isVip)) {
      agentStore.users.push(item)
    }
  })
}
// 用户点击
const { activeIndex } = storeToRefs(agentStore)
const userClick = (userName, index, image) => {
  activeIndex.value = index
  agentStore.currentUser = userName
  agentStore.backgroundImg = image
}
// 添加角色卡
const centerDialogVisible = ref(false)
const addRoleCardConfirm = () => {
  centerDialogVisible.value = false
  drawer.value = false
  const { userName, image, description, firstMessage } = roleForm
  users.push({
    userName,
    image,
    isVip: true,
    message: [
      { description: systemPrompt({ firstMessage, description }) },
      { audioSrc: '', image, isMe: false, message: firstMessage },
    ],
  })
}
const router = useRouter()
// 用户登出
const logoutClick = () => {
  myCache.remove('userInfo')
  router.replace('/login')
}
// 进入漫画
const comicsClick = () => {
  router.push('/comics')
}
// 打开菜单
const drawer = ref(false)
// 记忆功能
const isMemory = ref(myCache.get('isMemory') ?? false)
watch(
  isMemory,
  () => {
    myCache.set('isMemory', isMemory.value)
  },
  { immediate: true },
)
</script>

<style scoped>
.chat {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: 85%;
  display: flex;
  background-color: #666;
  @media (max-width: 1000px) {
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    transform: none;
  }
  .left {
    width: 25%;
    min-width: 70px;
    height: 100%;
    background-color: #282828;
    .menu,
    .logout,
    .comics {
      position: fixed;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 0 5px;
      font-size: 20px;
      background-color: var(--primary-deep-color);
      cursor: pointer;
      @media (max-width: 1000px) {
        position: static;
      }
    }
    .comics {
      left: 50px;
      background-color: #0096fa;
    }
    .menu {
      left: 100px;
      background-color: var(--primary-color);
    }
    @media (max-width: 1000px) {
      position: fixed;
      left: 150px;
      display: flex;
      height: auto;
      width: calc(100% - 150px);
      overflow: auto;
      background-color: transparent;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  .right {
    height: 100%;
    width: 75%;
    flex: 1;
    background-image: linear-gradient(60deg, #29323c 0%, #485563 100%);
    @media (max-width: 1000px) {
      background: var(--background-img) center / cover;
    }
  }
  .active {
    background-color: #5c5ad87d;
  }
  .menuDrawer {
    .memory {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  }
}
</style>
