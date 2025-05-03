<template>
  <div class="login">
    <video class="bgVideo" src="https://t.alcy.cc/acgapi/acg/54687.mp4" autoplay muted loop></video>
    <div class="card">
      <div class="title">AI聊天室</div>
      <div class="line">
        <span class="leftLine"></span>
        <div class="text">账号密码登录</div>
        <span class="rightLine"></span>
      </div>
      <div class="loginForm">
        <input class="account" type="text" placeholder="请输入用户名" v-model="username" />
        <input class="password" type="password" placeholder="请输入密码" v-model="password" />
        <button class="submit" @click="formClick">提交</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import myCache from '@/utils/cacheStorage'
import userList from './userList.config'
const router = useRouter()
const username = ref('')
const password = ref('')
// 提交表单
const formClick = () => {
  console.log(username.value, password.value)
  userList.forEach((item) => {
    if (item.username === username.value && item.password === password.value) {
      const userInfo = {
        username: item.username,
        password: item.password,
        role: item.role,
      }
      myCache.set('userInfo', userInfo)
      router.push({ path: '/chat' })
    }
  })
}
</script>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  .bgVideo {
    position: fixed;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
  .card {
    display: flex;
    z-index: 10;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 500px;
    height: 600px;
    border-radius: 20px;
    border: 2px solid var(--primary-deep-color);
    backdrop-filter: blur(10px);
    background-color: #66666663;
    @media(max-width: 1000px) {
      width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    .title {
      margin: 20px;
      font-size: 60px;
      color: var(--primary-color);
      font-weight: 700;
    }
    .line {
      width: 80%;
      display: flex;
      align-items: center;
      margin: 20px 0 30px;
      .text {
        font-size: 20px;
        margin: 0 10px;
        color: var(--primary-color);
      }
      .leftLine,
      .rightLine {
        display: inline-block;
        flex: 1;
        height: 2px;
        background-color: var(--primary-color);
      }
    }
    .loginForm {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 80%;
      .account,
      .password {
        box-sizing: border-box;
        width: 100%;
        height: 60px;
        margin-bottom: 20px;
        border: 2px solid var(--primary-color);
        background-color: transparent;
        font-family: inherit;
        font-size: 25px;
        color: var(--primary-deep-color);
        color: #fff;
        border-radius: 5px;
        padding-left: 10px;
      }
      .submit {
        width: 100%;
        height: 60px;
        margin-bottom: 40px;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
        background-color: transparent;
        font-family: inherit;
        font-size: 30px;
        font-weight: 700;
        padding: 0;
        border-radius: 5px;
        &:hover {
          background-color: var(--primary-deep-color);
          color: #333;
        }
        &:active {
          background-color: #5f5e5e;
          color: #333;
        }
      }
    }
  }
}
</style>
