<template>
  <div class="login">
    <!-- 暗黑模式切换按钮 -->
    <div class="dark-mode-toggle" @click="toggleDarkMode">
      <el-icon :size="24">
        <Moon v-if="isDark" />
        <Sunny v-else />
      </el-icon>
    </div>

    <!-- 主容器 -->
    <div class="login-container">
      <!-- 左侧视频背景区 -->
      <div class="left-section">
        <video
          class="bg-video"
          src="https://t.alcy.cc/acgapi/acg/54687.mp4"
          autoplay
          muted
          loop
        ></video>
        <div class="brand-overlay">
          <h1 class="brand-title">YuLe<span class="highlight">Hub</span></h1>
          <p class="brand-slogan">探索精彩的娱乐世界，动漫影视，趣味聊天，动漫美图，动漫小说尽在</p>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="right-section">
        <div class="login-box">
          <div class="login-header">
            <h2 class="login-title">
              <div class="text">欢迎来到</div>
              <div class="brand-name">YuLe<span class="highlight">Hub</span></div>
            </h2>
            <p class="login-subtitle">
              登录您的账号，畅享娱乐世界，动漫影视，趣味聊天，动漫美图，动漫小说
            </p>
          </div>

          <div class="login-form">
            <div class="form-group">
              <label class="form-label">账号</label>
              <div class="input-wrapper">
                <el-icon class="input-icon" :size="20">
                  <Message />
                </el-icon>
                <input
                  type="text"
                  v-model="username"
                  placeholder="请输入账号"
                  @keyup.enter="formClick"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">密码</label>
              <div class="input-wrapper">
                <el-icon class="input-icon" :size="20">
                  <Lock />
                </el-icon>
                <input
                  type="password"
                  v-model="password"
                  placeholder="请输入密码"
                  @keyup.enter="formClick"
                  class="form-control"
                />
              </div>
            </div>

            <button class="login-btn" @click="formClick">
              <span class="btn-text">登录</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Moon, Sunny, Message, Lock } from '@element-plus/icons-vue'
import myCache from '@/utils/cacheStorage'
import userList from './userList.config'

const router = useRouter()
const username = ref('vip')
const password = ref('vip')
const isDark = ref(false)

// 初始化暗黑模式
onMounted(() => {
  const savedDarkMode = myCache.get('isDark')
  isDark.value = savedDarkMode ?? false
  updateDarkMode()
})

// 切换暗黑模式
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  myCache.set('isDark', isDark.value)
  updateDarkMode()
}

// 更新暗黑模式样式
const updateDarkMode = () => {
  const appElement = document.documentElement
  if (isDark.value) {
    appElement.classList.add('darkMode')
  } else {
    appElement.classList.remove('darkMode')
  }
}

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
      router.push({ path: '/' })
    }
  })
}
</script>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #0a0a0f;
  display: flex;
  align-items: center;
  justify-content: center;

  // 暗黑模式切换按钮
  .dark-mode-toggle {
    position: fixed;
    top: 30px;
    right: 30px;
    z-index: 1000;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--comics-cardBg-color);
    border: 2px solid var(--comics-border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .el-icon {
      color: var(--comics-cardText-color);
      transition: all 0.3s;
    }

    &:hover {
      border-color: var(--primary-pink-color);
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(255, 0, 122, 0.3);

      .el-icon {
        color: var(--primary-pink-color);
      }
    }

    @media (max-width: 1000px) {
      top: 20px;
      right: 20px;
      width: 45px;
      height: 45px;
    }
  }

  // 主容器
  .login-container {
    position: relative;
    z-index: 10;
    display: flex;
    width: 100%;
    height: 100%;
    background: var(--comics-cardBg-color);
    overflow: hidden;

    @media (max-width: 1000px) {
      flex-direction: column;
    }
  }

  // 左侧视频背景区
  .left-section {
    flex: 1;
    position: relative;
    overflow: hidden;

    @media (max-width: 1000px) {
      min-height: 250px;
    }

    .bg-video {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    .brand-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2;
      padding: 50px 60px;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.85) 0%,
        rgba(0, 0, 0, 0.6) 50%,
        transparent 100%
      );

      @media (max-width: 1000px) {
        padding: 30px 25px;
      }

      .brand-title {
        font-size: 64px;
        font-weight: 900;
        color: #fff;
        margin-bottom: 15px;
        font-family:
          'Lucida Handwriting',
          Georgia Pro,
          Georgia,
          Times New Roman,
          serif;
        letter-spacing: 2px;

        @media (max-width: 1000px) {
          font-size: 42px;
        }

        .highlight {
          color: var(--primary-pink-color);
        }
      }

      .brand-slogan {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.6;
        max-width: 450px;
      }
    }
  }

  // 右侧登录区
  .right-section {
    flex: 1;
    padding: 60px 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--comics-cardBg-color);

    @media (max-width: 1000px) {
      padding: 40px 30px;
    }

    .login-box {
      width: 100%;
      max-width: 450px;

      .login-header {
        margin-bottom: 50px;
        .text {
          font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        }
        .login-title {
          display: flex;
          justify-content: space-between;
          align-items: end;
          font-size: 42px;
          font-weight: 900;
          color: var(--comics-menuText-color);
          margin-bottom: 20px;
          line-height: 1.2;
          font-family:
            'Lucida Handwriting',
            Georgia Pro,
            Georgia,
            Times New Roman,
            serif;
          letter-spacing: 1px;

          @media (max-width: 1000px) {
            font-size: 32px;
          }

          .brand-name {
            font-size: 50px;
            color: #fff;
            color: var(--comics-menuText-color);

            .highlight {
              color: var(--primary-pink-color);
            }
          }
        }

        .login-subtitle {
          font-size: 15px;
          color: var(--comics-cardSubTitle-color);
          line-height: 1.8;
          font-weight: 400;
        }
      }

      .login-form {
        .form-group {
          margin-bottom: 24px;

          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--comics-cardText-color);
            margin-bottom: 8px;
          }

          .input-wrapper {
            position: relative;

            .input-icon {
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              color: var(--comics-cardSubTitle-color);
              pointer-events: none;
              transition: color 0.3s;
              z-index: 1;
            }

            .form-control {
              width: 100%;
              height: 50px;
              padding: 0 16px 0 48px;
              font-size: 15px;
              color: var(--comics-cardText-color);
              background: var(--comics-tagBg-color);
              border: 2px solid var(--comics-border-color);
              border-radius: 10px;
              transition: all 0.3s;
              font-family: inherit;
              outline: none;

              &::placeholder {
                color: var(--comics-cardSubTitle-color);
              }

              &:focus {
                border-color: var(--primary-pink-color);
                background: var(--comics-cardBg-color);
                box-shadow: 0 0 0 4px rgba(255, 0, 122, 0.1);

                ~ .input-icon {
                  color: var(--primary-pink-color);
                }
              }
            }

            &:focus-within .input-icon {
              color: var(--primary-pink-color);
            }
          }
        }

        .login-btn {
          width: 100%;
          height: 50px;
          margin-top: 10px;
          background: linear-gradient(135deg, var(--primary-pink-color), #be185d);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 16px rgba(255, 0, 122, 0.3);

          .btn-text {
            letter-spacing: 1px;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(255, 0, 122, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
}
</style>
