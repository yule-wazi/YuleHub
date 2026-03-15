<template>
  <div class="user-profile">
    <!-- 背景图 -->
    <div class="profile-background">
      <MyImg
        :imgUrl="userDetail.background_image_url ?? userDetail.profile_image_urls.medium"
        alt="background"
        class="background-image"
        :lazyLoad="false"
        :key="userDetail.id"
      />
    </div>
    <!-- 用户信息卡片 -->
    <div class="profile-card">
      <!-- 左 -->
      <div class="left">
        <div class="avatar-section">
          <MyImg
            :imgUrl="userDetail.profile_image_urls.medium"
            class="avatar"
            style="border-radius: 50%"
            :key="userDetail.id"
          />
        </div>
        <div class="user-info">
          <div class="username">{{ userDetail.name }}</div>
          <div class="info-row">
            <div class="user-account">@{{ userDetail.account }}</div>
            <div class="user-id">UID:{{ userDetail.id }}</div>
          </div>
          <!-- 用户粉丝&地址 -->
          <div class="info-row">
            <div class="fans">
              <span class="fans-num">{{ userDetail.total_follow_users }}</span>
              粉丝
            </div>
            <div class="region" v-if="userDetail.region">
              <el-icon><Location /></el-icon> {{ userDetail.region }}
            </div>
          </div>
          <div class="user-comment" v-if="userDetail.comment">{{ userDetail.comment }}</div>
        </div>
      </div>
      <!-- 右 -->
      <div class="right">
        <div class="stat-item">
          <span class="stat-number">{{ userDetail.total_illusts || 0 }}</span>
          <span class="stat-label">作品</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ formatNumber(userDetail.total_follow_users) }}</span>
          <span class="stat-label">关注</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ formatNumber(userDetail.total_mypixiv_users) }}</span>
          <span class="stat-label">好P友</span>
        </div>
      </div>
    </div>

    <!-- 作品标题 -->
    <div class="works-title">
      <el-icon><Picture /></el-icon>
      <span>插画作品</span>
      <span class="works-count">共 {{ userDetail.total_illusts || 0 }} 张</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Location, Briefcase, Calendar, Link, Picture } from '@element-plus/icons-vue'
import MyImg from '@/components/myImg/myImg.vue'

const props = defineProps({
  userDetail: {
    type: Object,
    default: () => ({}),
  },
})

// 格式化数字（大于1000显示k）
const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

// 头像加载失败处理
const handleAvatarError = (e) => {
  e.target.src = '/public/userImg/userImg-2.webp' // 默认头像
}
</script>

<style lang="less" scoped>
.user-profile {
  width: 100%;
  flex-shrink: 0;
  background-color: var(--comics-cardBg-color);
  overflow: hidden;

  // 背景图区域
  .profile-background {
    width: 100%;
    height: 100%;
    max-height: 60vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;

    .background-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.8;
    }
  }

  // 用户信息卡片
  .profile-card {
    display: flex;
    justify-content: space-between;
    padding: 0 100px 24px;
    position: relative;
    margin-top: -60px;
    .left {
      display: flex;
      // 头像区域
      .avatar-section {
        display: flex;
        justify-content: left;
        margin-left: 20px;
        margin-bottom: 16px;
        .avatar {
          width: 180px;
          height: 180px;
          border: 4px solid var(--primary-pink-color);
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.05);
          }
        }
      }
      // 用户信息
      .user-info {
        margin: 55px 0 0 30px;
        .username {
          font-size: 44px;
          font-weight: 700;
          color: var(--comics-cardText-color);
          margin-top: 4px;
        }
        .info-row {
          display: flex;
          font-size: 17px;
          color: var(--comics-cardSubTitle-color);
          .user-id {
            margin-left: 10px;
          }
          .fans {
            .fans-num {
              font-weight: 700;
              color: var(--primary-pink-color);
            }
          }
          .region {
            margin-left: 10px;
          }
        }
        .user-comment {
          margin-top: 10px;
          color: var(--comics-cardText-color);
        }
      }
    }
    // 统计信息
    .right {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 20px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: #ff007a;
        }

        .stat-label {
          font-size: 12px;
          color: var(--comics-cardSubTitle-color);
        }
      }
    }
  }

  // 作品标题
  .works-title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    background-color: var(--comics-headerBg-color);
    font-size: 16px;
    font-weight: 600;
    color: var(--comics-cardTitle-color);
    border-top: 1px solid var(--comics-border-color);

    .el-icon {
      color: #ff007a;
      font-size: 18px;
    }

    .works-count {
      margin-left: auto;
      font-size: 14px;
      color: var(--comics-cardSubTitle-color);
      font-weight: 400;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .profile-background {
      height: 150px;
    }

    .profile-card {
      padding: 0 16px 16px;
      margin-top: -50px;

      .avatar-section .avatar {
        width: 100px;
        height: 100px;
      }

      .user-info {
        .username {
          font-size: 20px;
        }

        .right {
          gap: 24px;

          .stat-item .stat-number {
            font-size: 18px;
          }
        }
      }
    }

    .works-title {
      padding: 12px 16px;
      font-size: 14px;
    }
  }
}
</style>
