<template>
  <div class="interactionBar">
    <!-- 弹幕区 -->
    <div class="danmu-section">
      <div class="viewer-info">
        <span class="viewer-count">1人</span>
        <span class="text">正在看，已装填</span>
        <span class="danmu-count">3000</span>
        <span class="text">条弹幕</span>
      </div>
      <div class="danmu-input-wrapper">
        <el-icon class="danmu-icon"><ChatDotRound /></el-icon>
        <el-icon class="danmu-settings"><Setting /></el-icon>
        <el-input v-model="danmuInput" placeholder="发个友善的弹幕见证当下" class="danmu-input" />
        <el-button type="primary" class="send-btn">发送</el-button>
      </div>
    </div>
    <!-- 互动数据 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon><Pointer /></el-icon>
        <span>10万</span>
      </div>
      <div class="stat-item">
        <el-icon><Coin /></el-icon>
        <span>4.7万</span>
      </div>
      <div class="stat-item">
        <el-icon><Star /></el-icon>
        <span>1万</span>
      </div>
      <div class="stat-item">
        <el-icon><Share /></el-icon>
        <span>2.4万</span>
      </div>
      <div class="stat-item">
        <el-icon><User /></el-icon>
        <span>一起看</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChatDotRound, Setting, Pointer, Coin, Star, Share, User } from '@element-plus/icons-vue'

const danmuInput = ref('')
</script>

<style lang="less" scoped>
.interactionBar {
  margin-top: 10px;

  .danmu-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    background: var(--comics-cardBg-color);
    border-radius: 8px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .viewer-info {
      font-size: 13px;
      color: #888;

      .viewer-count,
      .danmu-count {
        color: var(--comics-cardTitle-color);
      }
    }

    .danmu-input-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      max-width: 500px;
      margin-left: 20px;

      @media (max-width: 768px) {
        margin-left: 0;
        width: 100%;
        max-width: none;
      }

      .danmu-icon,
      .danmu-settings {
        font-size: 18px;
        color: #888;
        cursor: pointer;
      }

      .danmu-input {
        flex: 1;
        --el-color-primary: #ff007a;
        :deep(.el-input__wrapper) {
          background-color: var(--comics-tagBg-color);
          border: 1px var(--comics-border-color) solid;
        }
      }

      .send-btn {
        background: var(--primary-pink-color);
        border: none;
      }
    }
  }

  .stats-bar {
    display: flex;
    gap: 30px;
    padding: 15px;
    background: var(--comics-cardBg-color);
    margin-top: 10px;
    border-radius: 8px;

    @media (max-width: 768px) {
      gap: 15px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      color: #888;
      cursor: pointer;

      &:hover {
        color: var(--primary-pink-color);
      }
    }
  }
}
</style>
