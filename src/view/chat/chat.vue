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
      <div v-if="userInfo.role === 1" class="comics" @click="comicsClick">漫画</div>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ChatPage from './cpns/chatPage/chatPage.vue'
import ChatUser from './cpns/chatUser/chatUser.vue'
import useAgent from '@/sotre/module/agent'
import useVip from '@/sotre/module/vip'
import allUsers from '@/sotre/agentUsersConfig'
import myCache from '@/utils/cacheStorage'
const agentStore = useAgent()
const vipStore = useVip()
const users = agentStore.users
const activeIndex = ref(0)
// 检测角色等级
const userInfo = myCache.get('userInfo')
if (userInfo.role) {
  vipStore.isVip = true
} else {
  vipStore.isVip = false
}
// 清除之前users列表
agentStore.users.length = 0
// 根据角色动态插入agent
allUsers.forEach((item) => {
  if (!item.isVip || (item.isVip && vipStore.isVip)) {
    agentStore.users.push(item)
  }
})
// 用户点击
const userClick = (userName, index, image) => {
  activeIndex.value = index
  agentStore.currentUser = userName
  agentStore.backgroundImg = image
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
// 展示vip图片
if (!vipStore.isFetch) {
  const usersUID = myCache.get('usersUID')
  // 默认展示wlop作品
  // vipStore.fetchImgList(usersUID ?? 2188232)
}
</script>

<style scoped>
.chat {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: 85%;
  /* margin: auto; */
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
}
</style>
