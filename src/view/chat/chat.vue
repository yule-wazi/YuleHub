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
          <div class="textLight">
            <div class="text">对话高亮</div>
            <el-switch
              v-model="textLight"
              change="textLight = !textLight"
              :active-action-icon="Check"
              :inactive-action-icon="Close"
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
          <el-form-item prop="loreBooks">
            <span>世界书</span>
            <el-select v-model="loreBooksModel" placeholder="选择世界书">
              <el-option
                v-for="item in roleForm.addLoreBooksData"
                :key="item.label"
                :label="item.label"
                :value="JSON.stringify(item.value)"
              />
              <template #footer>
                <el-button
                  v-if="!addLoreBook"
                  text
                  bg
                  type="primary"
                  plain
                  style="width: 100%"
                  @click="onAddOption"
                >
                  添加世界书
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
      title="创建世界书"
      width="100vw"
      style="max-width: 700px"
      center
      top="0"
      @closed="addLoreBook = false"
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
          <el-button type="primary" @click="addLoreBooksConfirm"> 确定创建 </el-button>
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
  Aim,
} from '@element-plus/icons-vue'
import { systemPrompt } from '@/utils/systemPrompt'
// 初始化世界书
const loreBooksOptions = [
  {
    label: '无',
    value: [],
  },
  {
    label: '校园书',
    value: [
      {
        keys: ['年级', '班级', '学生人数', '教师'],
        content:
          '校园中按照入学时间，分3个年级，分别为：大一年级，大二年级，大三年级。 每个年级有5班级，分别为：一班，二班，三班，四班，五班。 每个班级的学生人数在40-50之间浮动。 教师数量按照年级进行配置，每个年级有7位教师，{{user}}所在的大三年级按照教学学科分别为：语文教师，数学教师，英语教师，历史教师，生物教师，化学教师，物理教师。',
      },
      {
        keys: ['教师性别'],
        content: '所有教师均为女性。',
      },
      {
        keys: ['上课', '下课'],
        content:
          '上课是由教师讲解知识并提问学生的环节，学生会在教室中参与教师的教学活动，每次上课中的持续时间为45分钟。 下课是教师和学生在校园内的自由活动时间，下课后每次的持续时间为15分钟。 校园内上课中和下课后不断轮流循环。 每次上课时都按照随机原则由一位教师进行教学活动。',
      },
    ],
  },
]
const roleForm = reactive({
  userName: '',
  image: '',
  description: '',
  firstMessage: '',
  loreBooks: [],
  addLoreBooksValue: [{ keys: [], content: '' }],
  addLoreBooksLabel: '',
  addLoreBooksData: loreBooksOptions,
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
watch(loreBooksModel, () => {
  roleForm.loreBooks = JSON.parse(loreBooksModel.value)
})
// 添加世界书
const onAddOption = () => {
  addLoreBook.value = true
}
// 添加世界书关键词
const addLoreBooksItem = () => {
  roleForm.addLoreBooksValue.push({
    keys: [],
    content: '',
  })
}
// 删除世界书关键词
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
  console.log('label=', roleForm.addLoreBooksLabel)
  roleForm.addLoreBooksData.push({
    label: roleForm.addLoreBooksLabel,
    value: roleForm.addLoreBooksValue,
  })
  addLoreBook.value = false
}
// 打开菜单
const drawer = ref(false)
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
}
</style>
