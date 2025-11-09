<template>
  <div class="imageInfoAndDownoad">
    <div class="info">
      <div class="infoData">
        <div class="bookmarks">
          <el-icon><Star /></el-icon>
          <span class="count">{{ total_bookmarks }}</span>
        </div>
        <div class="comments">
          <el-icon><ChatRound /></el-icon>
          <span class="count">{{ total_comments }}</span>
        </div>
        <div class="view">
          <el-icon><View /></el-icon>
          <span class="count">{{ total_view }}</span>
        </div>
      </div>
      <div class="downLoad">
        <template v-if="showDownloadText">
          <el-button color="#ff007a" :icon="Download">下载</el-button>
        </template>
        <template v-else>
          <el-button color="#ff007a" :icon="Download" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { throttle } from '@/utils/throttle'
import { ChatRound, Download, Star, View } from '@element-plus/icons-vue'
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  total_bookmarks: {
    type: Number,
    default: 0,
  },
  total_comments: {
    type: Number,
    default: 0,
  },
  total_view: {
    type: Number,
    default: 0,
  },
})

const showDownloadText = ref(true)
const checkWidth = throttle(() => {
  showDownloadText.value = window.innerWidth > 1000
}, 200)
onMounted(() => {
  checkWidth()
  window.addEventListener('resize', checkWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkWidth)
})
</script>

<style lang="less" scoped>
.imageInfoAndDownoad {
  margin-bottom: 24px;
  .info {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .infoData {
      display: flex;
      .bookmarks,
      .comments,
      .view {
        display: flex;
        align-items: center;
        color: var(--comics-cardText-color);
        padding: 0 10px;
        margin-right: 8px;
        border-radius: 5px;
        .count {
          margin-left: 8px;
        }
        &:hover {
          transition: 0.2s ease;

          background-color: var(--primary-pink-color);
          color: #fff;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
