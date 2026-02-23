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
          <div class="brand-content">
            <h1 class="brand-title">Yule<span class="highlight">Hub</span></h1>
            <div class="slogan-wrapper">
              <span class="slogan-line"></span>
              <p class="brand-slogan">次元无界，语你同行</p>
              <span class="slogan-line"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="right-section">
        <div class="login-box">
          <div class="login-header">
            <h2 class="login-title">
              <span class="welcome-text">欢迎来到</span>
              <span class="brand-name">Yule<span class="highlight">Hub</span></span>
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
      top: 10px;
      right: 10px;
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
      min-height: 200px;
      flex-shrink: 0;
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
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.7) 0%,
        rgba(0, 0, 0, 0.5) 50%,
        rgba(0, 0, 0, 0.7) 100%
      );

      .brand-content {
        text-align: center;
        padding: 40px;

        .brand-title {
          font-size: 80px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 30px;
          font-family:
            'Lucida Handwriting',
            Georgia Pro,
            Georgia,
            Times New Roman,
            serif;
          letter-spacing: 3px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

          @media (max-width: 1000px) {
            font-size: 48px;
            margin-bottom: 20px;
          }

          .highlight {
            color: var(--primary-pink-color);
          }
        }

        .slogan-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;

          @media (max-width: 1000px) {
            gap: 15px;
          }

          .slogan-line {
            width: 80px;
            height: 2px;
            background: rgba(255, 255, 255, 0.8);

            @media (max-width: 1000px) {
              width: 50px;
            }
          }

          .brand-slogan {
            font-size: 20px;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 400;
            letter-spacing: 4px;
            white-space: nowrap;

            @media (max-width: 1000px) {
              font-size: 16px;
              letter-spacing: 2px;
            }
          }
        }
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
      padding: 35px 25px;
    }

    .login-box {
      width: 100%;
      max-width: 450px;

      @media (max-width: 1000px) {
        max-width: 100%;
      }

      .login-header {
        margin-bottom: 50px;

        @media (max-width: 1000px) {
          margin-bottom: 35px;
        }

        .login-title {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: clamp(20px, 5vw, 42px);
          font-weight: 900;
          color: var(--comics-menuText-color);
          margin-bottom: 20px;
          line-height: 1.3;
          font-family:
            'Lucida Handwriting',
            Georgia Pro,
            Georgia,
            Times New Roman,
            serif;
          letter-spacing: 1px;
          white-space: nowrap;
          overflow: hidden;

          @media (max-width: 1000px) {
            font-size: clamp(16px, 9vw, 28px);
            margin-bottom: 15px;
            letter-spacing: 0.5px;
            gap: 6px;
          }
          .welcome-text {
            flex-shrink: 1;
            min-width: 0;
          }

          .brand-name {
            color: var(--comics-menuText-color);
            flex-shrink: 0;

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

          @media (max-width: 1000px) {
            font-size: 13px;
            line-height: 1.6;
          }
        }
      }

      .login-form {
        .form-group {
          margin-bottom: 24px;

          @media (max-width: 1000px) {
            margin-bottom: 20px;
          }

          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--comics-cardText-color);
            margin-bottom: 8px;

            @media (max-width: 1000px) {
              font-size: 13px;
            }
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

              @media (max-width: 1000px) {
                height: 48px;
                font-size: 14px;
              }

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

          @media (max-width: 1000px) {
            height: 48px;
            font-size: 15px;
            margin-top: 5px;
          }

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
