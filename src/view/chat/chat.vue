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
      <div class="menu" @click="drawer = true">菜单</div>
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
        <template #menuHeader> AI Chat </template>
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
          <div class="showTip">
            <div class="text">书结束提示</div>
            <el-switch
              v-model="showTip"
              change="showTip = !showTip"
              :active-action-icon="Bell"
              :inactive-action-icon="MuteNotification"
            />
          </div>

          <div class="textLight">
            <div class="text">对话高亮</div>
            <el-switch
              v-model="textLight"
              change="textLight = !textLight"
              :active-action-icon="ChatLineRound"
              :inactive-action-icon="ChatRound"
            />
          </div>
          <div class="memory">
            <div class="text">记忆存储</div>
            <el-switch
              v-model="isMemory"
              change="isMemory = !isMemory"
              :active-action-icon="Check"
              :inactive-action-icon="Close"
            />
          </div>
          <div class="dark">
            <div class="text">夜间模式</div>
            <el-switch
              v-model="isDark"
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
          <el-form-item prop="voiceId">
            <span>音色选择</span>
            <el-scrollbar>
              <div class="scrollbar-flex-content">
                <div
                  ref="audioItemRef"
                  v-for="(item, index) in audioList"
                  :key="index"
                  class="scrollbar-demo-item"
                  :class="{ active: selectCurrentAudio === index }"
                >
                  <div class="audioItem">
                    <audio ref="audioRef" :src="item.voiceSrc"></audio>
                    <div class="voiceName">{{ item.name }}</div>
                    <div class="handle">
                      <el-button type="primary" plain @click="selectAudio(item, index)"
                        >选择</el-button
                      >
                      <el-button @click="audioRef[index].play()" style="padding: 5px" plain>
                        <el-icon size="20px"><VideoPlay /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </el-form-item>
          <el-form-item prop="loreBooks">
            <span>世界书</span>
            <el-select
              v-model="loreBooksModel"
              placeholder="选择世界书"
              @change="roleForm.loreBooks = JSON.parse(loreBooksModel)"
            >
              <el-option
                v-for="(item, index) in roleForm.addLoreBooksData"
                :key="item.label"
                :label="item.label"
                :value="JSON.stringify(item.value)"
              >
                <span style="float: left; max-width: 50%; overflow: hidden">{{ item.label }}</span>
                <el-button
                  type="danger"
                  style="float: right; margin-left: 10px"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="deleteLoreBook(index)"
                >
                </el-button>
                <el-button
                  type="info"
                  style="float: right"
                  :icon="Edit"
                  circle
                  size="small"
                  @click="openAddLoreBook(false, { item, index })"
                >
                </el-button>
              </el-option>
              <template #footer>
                <el-button
                  v-if="!addLoreBook"
                  text
                  bg
                  type="primary"
                  plain
                  style="width: 50%"
                  @click="openAddLoreBook(true)"
                >
                  添加世界书
                </el-button>
                <el-button type="primary" plain style="width: 45%" @click="uploadLoreBooks">
                  导入世界书
                  <input ref="uploadInput" type="file" @change="handleFile" style="display: none" />
                </el-button>
              </template>
            </el-select>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item prop="firstMessage">
            <span>请输入至少一个API Token</span>
            <a class="website" href="https://www.dzmm.ai/profile?tab=api" target="_blank"
              >获取Token(需翻墙)</a
            >
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
    <el-dialog
      v-model="addLoreBook"
      :title="isAddLoreBookTitle"
      width="100vw"
      style="max-width: 700px"
      center
      top="0"
      @closed="clear"
    >
      <div class="addLoreBooks">
        <el-form :model="roleForm">
          <el-form-item props="addLoreBooksName">
            <span>世界书名称：</span>
            <el-input v-model="roleForm.addLoreBooksLabel" style="width: 90%" />
          </el-form-item>
          <el-form-item v-for="(item, index) in roleForm.addLoreBooksValue">
            <el-row :gutter="10" class="flex-1" style="width: 100%">
              <el-col :span="8">
                <el-input-tag
                  v-model="item.keys"
                  tag-type="primary"
                  tag-effect="dark"
                  placeholder="主要关键词"
                  size="large"
                >
                  <template #tag="{ value }">
                    <div class="flex items-center">
                      <el-icon class="mr-1">
                        <Aim />
                      </el-icon>
                      <span>{{ value }}</span>
                    </div>
                  </template>
                </el-input-tag>
              </el-col>
              <el-col :span="14">
                <el-input
                  v-model="item.content"
                  style="width: 100%"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  type="textarea"
                  placeholder="内容"
                />
              </el-col>
              <el-col :span="1">
                <el-button
                  :style="{ visibility: index > 0 ? 'visible' : 'hidden' }"
                  :icon="Delete"
                  size="small"
                  @click="removeLoreBooksItem(index)"
                ></el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <div class="flex justify-center align-middle mt-4" style="display: flex">
          <el-button style="margin: auto" :icon="Plus" circle @click="addLoreBooksItem"></el-button>
        </div>
        <div class="addLoreBooksButton">
          <el-button @click="clear">取消</el-button>
          <el-button type="primary" @click="addLoreBooksConfirm">
            {{ isAddLoreBook ? '确认添加' : '确认修改' }}
          </el-button>
        </div>
      </div>
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
import {
  Close,
  Sunny,
  Moon,
  PictureFilled,
  Management,
  Check,
  Key,
  Delete,
  Plus,
  Edit,
  Aim,
  Bell,
  MuteNotification,
  ChatRound,
  ChatLineRound,
  VideoPlay,
} from '@element-plus/icons-vue'
import { systemPrompt } from '@/utils/systemPrompt'
import { audioList } from '@/sotre/agentAudioConfig'
// 初始化世界书
const loreBooksOptions = [
  {
    label: '无',
    value: [],
  },
]
const roleForm = reactive({
  userName: '',
  voiceId: '',
  image: '',
  description: '',
  firstMessage: '',
  loreBooks: [],
  addLoreBooksValue: [{ keys: [], content: '' }],
  addLoreBooksLabel: '',
  editCurrentIndex: 0,
  addLoreBooksData: myCache.get('loreBooks') ?? loreBooksOptions,
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

// 选择世界书
const addLoreBook = ref(false)
const loreBooksModel = ref('无')
// 添加世界书
const isAddLoreBookTitle = ref('')
const isAddLoreBook = ref(true)
const openAddLoreBook = (isAdd = true, options = {}) => {
  addLoreBook.value = true
  isAddLoreBook.value = isAdd
  if (isAdd) {
    isAddLoreBookTitle.value = '创建世界书'
  } else {
    isAddLoreBookTitle.value = '修改世界书'
    roleForm.addLoreBooksLabel = options.item.label
    roleForm.addLoreBooksValue = options.item.value
    roleForm.editCurrentIndex = options.index
  }
}
// 删除世界书
const deleteLoreBook = (index) => {
  roleForm.addLoreBooksData.splice(index, 1)
}
// 添加一条世界书关键词
const addLoreBooksItem = () => {
  roleForm.addLoreBooksValue.push({
    keys: [],
    content: '',
  })
}
// 删除一条世界书关键词
const removeLoreBooksItem = (index) => {
  roleForm.addLoreBooksValue.splice(index, 1)
}
// 清空创建世界书关键词
const clear = () => {
  roleForm.addLoreBooksValue = [{ keys: [], content: '' }]
  roleForm.addLoreBooksLabel = ''
  addLoreBook.value = false
}
// 确认创建世界书
const addLoreBooksConfirm = () => {
  if (isAddLoreBook.value) {
    roleForm.addLoreBooksData.push({
      label: roleForm.addLoreBooksLabel,
      value: roleForm.addLoreBooksValue,
    })
  } else {
    console.log('修改世界书')
    roleForm.addLoreBooksData.splice(roleForm.editCurrentIndex, 1, {
      label: roleForm.addLoreBooksLabel,
      value: roleForm.addLoreBooksValue,
    })
  }
  addLoreBook.value = false
}
// 导入世界书
const uploadInput = ref(null)
const uploadLoreBooks = () => {
  uploadInput.value?.click()
}
// 世界书文件导入
const handleFile = (e) => {
  const file = e.target.files[0]
  const reader = new FileReader(file)
  reader.readAsText(file)
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      console.log(data)
      let valueList = []
      for (const i in data.entries) {
        valueList.push({ keys: data.entries[i].keys, content: data.entries[i].content })
      }
      console.log(valueList)
      roleForm.addLoreBooksData.push({ label: data.name, value: valueList })
    } catch {
      ElMessage.error('文件格式错误，请导入JSON或text文件')
    }
  }
  e.target.value = ''
}
// 保存世界书
watch(roleForm.addLoreBooksData, () => {
  console.log('保存世界书')
  myCache.set('loreBooks', roleForm.addLoreBooksData)
})
// 打开菜单
const drawer = ref(false)
// 确定添加APIToken
// 确认添加角色
const addRoleCardConfirm = () => {
  centerDialogVisible.value = false
  drawer.value = false
  if (addUserCard.value) {
    const { userName, image, description, firstMessage, loreBooks, voiceId } = roleForm
    users.push({
      userName,
      voiceId,
      image,
      isVip: true,
      loreBooks,
      message: [
        { description: systemPrompt({ firstMessage, description }) },
        { audioSrc: '', image, isMe: false, message: firstMessage },
      ],
    })
  } else {
    myCache.set('TokenList', inputToken.value)
  }
}
// 选择音色
const audioItemRef = ref(null)
const audioRef = ref(null)
const selectCurrentAudio = ref(-1)
const selectAudio = (item, index) => {
  roleForm.voiceId = item.voiceId
  selectCurrentAudio.value = index
}
const router = useRouter()
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
// 对话高亮
const { textLight } = storeToRefs(agentStore)
// 显示提示
const { showTip } = storeToRefs(agentStore)
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
  appElement = document.documentElement
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
    .menu {
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
    .menu {
      left: 0px;
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
    .showTip,
    .textLight,
    .memory,
    .dark {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* margin-bottom: 5px; */
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
  .addLoreBooks {
    .addLoreBooksButton {
      display: flex;
      margin-top: 10px;
      justify-content: center;
    }
    .el-input-tag__inner {
      flex-wrap: nowrap;
      overflow: auto;
    }
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
  .el-select {
    .el-select__wrapper {
      background-color: var(--chat-card-inputBg-color);
      .el-select__selected-item {
        color: var(--chat-card-text-color);
      }
    }
  }
  .el-input-tag {
    background-color: var(--chat-card-inputBg-color);
  }
  .scrollbar-flex-content {
    display: flex;
    width: fit-content;
  }
  .scrollbar-demo-item {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 90px;
    margin: 10px;
    padding: 5px;
    text-align: center;
    border-radius: 4px;
    border: 1px solid #666;
    background: var(--comics-cardBg-color);
    color: var(--chat-card-text-color);
    .voiceName {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 20px;
      font-weight: 700;
    }
    .handle {
      position: absolute;
      bottom: 10px;
      left: 10px;
      display: flex;
    }
  }
  .active {
    background-color: var(--comics-headerIcon-color);
  }
}
</style>
