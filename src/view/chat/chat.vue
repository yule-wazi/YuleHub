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
      <div v-if="userInfo.role === 1" class="novel" @click="novelClick">小说</div>
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
          <div class="comics" @click="goComics">
            <el-icon size="20px"><PictureFilled /></el-icon>
            <div class="text">插画</div>
          </div>
          <div class="novel" @click="goNovel">
            <el-icon size="20px"><Management /></el-icon>
            <div class="text">小说</div>
          </div>
        </template>
        <template #other>
          <div class="addUserCard" @click="openEditCard(true)">添加角色卡</div>
          <div class="apiToken" @click="openEditCard(false)">API Token</div>
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
      </MenuDrawer>
    </div>
    <el-dialog
      v-model="centerDialogVisible"
      :title="addUserCard ? '添加角色卡' : '管理API Token'"
      width="90vw"
      style="max-width: 700px"
      center
      @closed="addUserCard = false"
    >
      <el-form ref="ruleFormRef" :model="roleForm">
        <template v-if="addUserCard">
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
            <span>角色开场白</span>
            <el-input
              v-model="roleForm.firstMessage"
              style="width: 100%"
              :autosize="{ minRows: 4, maxRows: 8 }"
              type="textarea"
              placeholder="请输入角色发起的第一条消息"
            />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item prop="firstMessage">
            <span>请输入至少一个API Token</span>
            <a class="website" href="https://www.dzmm.ai/profile?tab=api" target="_blank">获取Token(需翻墙)</a>
            <el-input-tag v-model="inputToken" tag-type="primary" tag-effect="plain" draggable>
              <template #tag="{ value }">
                <div class="flex items-center">
                  <el-icon class="mr-1">
                    <Key />
                  </el-icon>
                  <span>{{ value }}</span>
                </div>
              </template>
            </el-input-tag>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addRoleCardConfirm"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ChatPage from './cpns/chatPage/chatPage.vue'
import ChatUser from './cpns/chatUser/chatUser.vue'
import useAgent from '@/sotre/module/agent'
import useVip from '@/sotre/module/vip'
import allUsers from '@/sotre/agentUsersConfig'
import myCache from '@/utils/cacheStorage'
import { storeToRefs } from 'pinia'
import MenuDrawer from '@/components/menuDrawer/menuDrawer.vue'
import { Close, Sunny, Moon, PictureFilled, Management, Check, Key } from '@element-plus/icons-vue'
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
const centerDialogVisible = ref(false)
const addUserCard = ref(false)
// 打开编辑模板
const openEditCard = (isaddUser) => {
  centerDialogVisible.value = true
  if (isaddUser) {
    addUserCard.value = true
  }
}
const inputToken = ref(myCache.get('TokenList') ?? [])
// 确定添加APIToken
// 确认添加
const addRoleCardConfirm = () => {
  centerDialogVisible.value = false
  drawer.value = false
  if (addUserCard.value) {
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
  } else {
    myCache.set('TokenList', inputToken.value)
  }
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
// 进入小说
const novelClick = () => {
  router.push('/novel')
}
// 转到漫画
const goComics = () => {
  drawer.value = false
  router.push('/comics')
}
// 转到小说
const goNovel = () => {
  drawer.value = false
  router.push('/novel')
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
    .novel,
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
    .novel {
      left: 100px;
      background-color: rgb(255, 178, 34);
    }
    .menu {
      left: 150px;
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
    .home,
    .comics,
    .novel {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #999;
      margin-bottom: 5px;
      padding: 10px 0;
      .text {
        margin-left: 5px;
      }
    }
    .memory,
    .dark {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .apiToken {
      margin: 15px 0;
    }
  }
}
:deep(.el-dialog) {
  background-color: var(--chat-card-bg-color);
  .website {
    margin-left: 10px;
    font-size: 14px;
  }
  .el-dialog__title {
    color: var(--chat-card-text-color);
    font-size: 20px;
    font-weight: 700;
  }
  .el-form-item__content {
    color: var(--chat-card-text-color);
  }
  .el-textarea__inner {
    background-color: var(--chat-card-inputBg-color);
    color: var(--chat-card-text-color);
  }
  .el-input__wrapper {
    background-color: var(--chat-card-inputBg-color);
    .el-input__inner {
      color: var(--chat-card-text-color);
    }
  }
  .is-draggable {
    background-color: var(--chat-card-inputBg-color);
    .el-tag {
      background-color: transparent;
      margin: 2px;
    }
  }
}
</style>
