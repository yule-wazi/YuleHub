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
      <div class="logout" @click="logoutClick">登出</div>
    </div>
    <div
      class="right"
      :style="{
        '--background-img': vipStore.isVip
          ? `url(${vipStore.showVipImgSrc})`
          : `url('${agentStore.backgroundImg}')`,
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
import myCache from '@/utils/cacheStorage'
import allUsers from '@/sotre/agentUsersConfig'
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
  if (clearSwitchImg) clearSwitchImg()
  myCache.remove('userInfo')
  router.replace('/login')
}
// 展示vip图片
const clearSwitchImg = vipStore.getCurrentImg(6353561)
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
    .logout {
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
    transition: 0.5s all;
    @media (max-width: 1000px) {
      background: var(--background-img) center / cover;
    }
  }
  .active {
    background-color: #5c5ad87d;
  }
}
</style>
