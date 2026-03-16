<template>
  <div class="user-profile">
    <!-- 背景图 -->
    <div class="profile-background">
      <MyImg
        :imgUrl="userDetail.background_image_url ?? defaultImage?.coverImg.large"
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
          <div class="username">
            <div class="text">{{ userDetail.name }}</div>
            <div class="gender">
              <el-icon
                v-if="userDetail.gender === 'male'"
                style="border: 1px solid #0096fa; border-radius: 2px; color: #0096fa"
                ><Male
              /></el-icon>
              <el-icon
                v-else-if="userDetail.gender === 'female'"
                style="
                  border: 1px solid var(--primary-pink-color);
                  border-radius: 2px;
                  color: var(--primary-pink-color);
                "
                ><Female
              /></el-icon>
            </div>
          </div>

          <div class="info-row">
            <div class="user-account">@{{ userDetail.account }}</div>
            <div class="user-id">UID:{{ userDetail.id }}</div>
          </div>
          <!-- 用户粉丝&地址 -->
          <div class="info-row">
            <div class="fans">
              <span class="fans-num">{{ formatNumber(userDetail.total_follow_users) }}</span>
              粉丝
            </div>
            <div class="region" v-if="userDetail.region">
              <el-icon><LocationFilled /></el-icon> {{ userDetail.region }}
            </div>
          </div>
          <div class="user-comment" v-if="userDetail.comment">{{ userDetail.comment }}</div>
        </div>
      </div>
      <!-- 右 -->
      <div class="right">
        <div class="stat-item">
          <el-icon class="stat-icon"><PictureFilled /></el-icon>
          <span class="stat-number">{{ formatNumber(userDetail.total_illusts) || 0 }}</span>
          <span class="stat-label">作品</span>
        </div>
        <div class="stat-item">
          <el-icon class="stat-icon"><StarFilled /></el-icon>
          <span class="stat-number">{{
            formatNumber(userDetail.total_illust_bookmarks_public)
          }}</span>
          <span class="stat-label">收藏</span>
        </div>
        <div class="stat-item">
          <el-icon class="stat-icon"><UserFilled /></el-icon>
          <span class="stat-number">{{ formatNumber(userDetail.total_mypixiv_users) }}</span>
          <span class="stat-label">好友</span>
        </div>
      </div>
    </div>

    <!-- 作品标题 -->
    <div class="works-title">
      <div class="title">
        <el-icon size="20"><Picture /></el-icon>
        <div>插画作品</div>
      </div>
      <div class="numbers">
        共 <span class="works-count">{{ userDetail.total_illusts }}</span> 张
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Female,
  LocationFilled,
  Male,
  Picture,
  PictureFilled,
  StarFilled,
  UserFilled,
} from '@element-plus/icons-vue'
import formatNumber from '@/utils/formatNum'
import MyImg from '@/components/myImg/myImg.vue'

const props = defineProps({
  userDetail: {
    type: Object,
    default: () => ({}),
  },
  defaultImage: {
    type: Object,
    default: () => ({}),
  },
})
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
    height: 60vh;
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
          display: flex;
          font-size: 44px;
          font-weight: 700;
          color: var(--comics-cardText-color);
          margin-top: 4px;
          .gender {
            height: 100%;
            font-size: 16px;
            border-radius: 5px;
            margin-left: 8px;
            margin-top: 5px;
          }
        }
        .info-row {
          display: flex;
          font-size: 17px;
          margin-top: 2px;
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
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: -60px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .stat-number {
          font-size: 33px;
          font-weight: 900;
          color: #ff007a;
        }
        .stat-icon {
          font-size: 26px;
          font-weight: 500;
          color: #fff;
        }
        .stat-label {
          font-size: 18px;
          font-weight: 900;
          color: #fff;
        }
      }
    }
  }

  // 作品标题
  .works-title {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 150px;
    box-sizing: border-box;
    background-color: var(--comics-bg-color);
    font-size: 20px;
    font-weight: 600;
    color: var(--comics-cardTitle-color);
    border-top: 2px solid var(--comics-border-color);

    .title {
      display: flex;
      align-items: center;
      .el-icon {
        color: var(--primary-pink-color);
        font-size: 18px;
        margin-right: 5px;
      }
    }
    .works-count {
      margin-left: auto;
      color: var(--primary-pink-color);
    }
  }

  // 响应式设计
  @media (max-width: 1000px) {
    .profile-background {
      height: 30vh;
    }
    .profile-card {
      flex-direction: column;
      align-items: center;
      padding: 0 16px 16px;
      margin-top: -50px;
      .left {
        flex-direction: column;
        align-items: center;
        .avatar-section {
          margin: 0;
          .avatar {
            width: 100px !important;
            height: 100px !important;
          }
        }
        .user-info {
          margin: 0;
          text-align: center;
          .username {
            font-size: 28px;
            justify-content: center;
          }
          .info-row {
            justify-content: center;
            font-size: 12px;
          }
          .user-comment {
            font-size: 14px;
          }
        }
      }
      .right {
        margin-top: 10px;
        font-size: 18px;
        .stat-number {
          font-size: 20px !important;
          font-weight: 900;
        }
        .stat-icon {
          display: none;
        }
        .stat-label {
          color: var(--comics-cardText-color) !important;
          font-size: 12px !important;
        }
      }
    }

    .works-title {
      padding: 16px;
      font-size: 18px;
    }
  }
}
</style>
