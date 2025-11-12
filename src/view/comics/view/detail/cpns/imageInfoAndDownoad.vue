<template>
  <div class="imageInfoAndDownoad">
    <div class="info">
      <div class="infoData">
        <div ref="bookmarks" class="bookmarks" @click="starClick">
          <el-icon>
            <template v-if="isStar"><StarFilled /></template>
            <template v-else><Star /></template>
          </el-icon>
          <span class="count">{{ imgDetail.total_bookmarks }}</span>
        </div>
        <div class="comments">
          <el-icon><ChatRound /></el-icon>
          <span class="count">{{ imgDetail.total_comments }}</span>
        </div>
        <div class="view">
          <el-icon><View /></el-icon>
          <span class="count">{{ imgDetail.total_view }}</span>
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
import { ChatRound, Download, Star, StarFilled, View } from '@element-plus/icons-vue'
import { ref, onMounted, onUnmounted, toRef, useTemplateRef } from 'vue'

const imgDetail = defineModel({
  type: Object,
  default: () => ({
    total_bookmarks: 0,
    total_comments: 0,
    total_view: 0,
  }),
})
const showDownloadText = ref(true)
const isStar = ref(false)
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
// 点击收藏
const bookmarksRef = useTemplateRef('bookmarks')
const starClick = () => {
  if (!isStar.value) {
    isStar.value = true
    imgDetail.value.total_bookmarks += 1
  } else {
    isStar.value = false
    imgDetail.value.total_bookmarks -= 1
  }
  bookmarksRef.value.classList.toggle('isStar', isStar.value)
}
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
          color: #fff !important;
          cursor: pointer;
        }
      }
      .isStar {
        color: var(--primary-pink-color);
      }
    }
  }
}
</style>
