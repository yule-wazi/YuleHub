<template>
  <div class="recommendList">
    <div class="section-header">
      <span class="section-title">相关推荐</span>
    </div>
    <div class="other-list">
      <div
        v-for="item in videoStore.recommendList"
        :key="item.vod_id"
        class="recommend-item"
        @click="goToDetail(item)"
      >
        <img :src="item.vod_pic" class="cover" />
        <div class="info">
          <div class="title">{{ item.vod_name }}</div>
          <div class="meta">{{ item.vod_remarks }}</div>
          <div class="stats">
            <span
              ><el-icon><VideoPlay /></el-icon> {{ formatCount(item.vod_hits) }}</span
            >
            <span
              ><el-icon><ChatDotRound /></el-icon> {{ formatCount(item.vod_score_num) }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VideoPlay, ChatDotRound } from '@element-plus/icons-vue'
import useVideo from '@/sotre/module/video'

const props = defineProps({
  limit: { type: Number, default: 5 },
})

const videoStore = useVideo()

// const recommendData = computed(() => {
//   return videoStore.animeList
//     .filter((item) => item.vod_id !== videoStore.videoDetail.vod_id)
//     .slice(0, props.limit)
// })

const goToDetail = (item) => {
  videoStore.videoDetail = item
  window.scrollTo(0, 0)
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}
</script>

<style lang="less" scoped>
.recommendList {
  background: var(--comics-cardBg-color);
  border-radius: 8px;
  padding: 15px;

  .section-header {
    margin-bottom: 15px;
    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--comics-cardTitle-color);
    }
  }
  .other-list {
    display: flex;
    flex-direction: column;
  }
  .recommend-item {
    display: flex;
    gap: 12px;
    cursor: pointer;
    padding: 5px;
    border-radius: 5px;

    &:hover .title {
      color: var(--primary-pink-color);
    }
    &:hover {
      background: rgba(255, 0, 122, 0.2);
    }
    .cover {
      width: 120px;
      height: 70px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .info {
      flex: 1;
      min-width: 0;

      .title {
        font-size: 14px;
        color: var(--comics-cardTitle-color);
        margin-bottom: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.2s;
      }

      .meta {
        font-size: 12px;
        color: #888;
        margin-bottom: 5px;
      }

      .stats {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #666;

        span {
          display: flex;
          align-items: center;
          gap: 3px;
        }
      }
    }
  }
}
</style>
