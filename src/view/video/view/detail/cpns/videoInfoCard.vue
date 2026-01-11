<template>
  <div class="videoInfoCard">
    <div class="info-left">
      <img :src="videoDetail.vod_pic" class="cover-img" />
    </div>
    <div class="info-right">
      <div class="header-row">
        <h2 class="video-title">{{ videoDetail.vod_name }}</h2>
        <div class="action-btns">
          <el-button type="primary" class="play-btn" @click="$emit('play')">
            <el-icon><VideoPlay /></el-icon>
            立即播放
          </el-button>
          <el-button :class="{ collected: isCollected }" @click="toggleCollect">
            <el-icon><Star /></el-icon>
            {{ isCollected ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>
      <div class="video-tags">
        <el-tag v-show="videoDetail.vod_year" size="small" type="info">{{ videoDetail.vod_year }}</el-tag>
        <el-tag v-show="videoDetail.vod_area" size="small" type="info">{{ videoDetail.vod_area }}</el-tag>
        <el-tag v-show="videoDetail.type_name" size="small" type="info">{{ videoDetail.type_name }}</el-tag>
      </div>
      <p class="video-desc" :class="{ expanded: isDescExpanded }">
        {{ videoDetail.vod_blurb || stripHtml(videoDetail.vod_content) }}
      </p>
      <div class="expand-btn" @click="isDescExpanded = !isDescExpanded">
        {{ isDescExpanded ? '收起' : '展开全部' }}
        <el-icon><ArrowDown v-if="!isDescExpanded" /><ArrowUp v-else /></el-icon>
      </div>
      <div class="video-meta">
        <p><span class="label">导演：</span>{{ videoDetail.vod_director || '未知' }}</p>
        <p><span class="label">主演：</span>{{ videoDetail.vod_actor || '未知' }}</p>
        <p><span class="label">更新：</span>{{ videoDetail.vod_time }}</p>
        <p><span class="label">状态：</span>{{ videoDetail.vod_remarks }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VideoPlay, Star, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import useVideo from '@/sotre/module/video'

const videoStore = useVideo()
const videoDetail = computed(() => videoStore.videoDetail)

const isDescExpanded = ref(false)
const isCollected = ref(false)

const emit = defineEmits(['play'])

const toggleCollect = () => {
  isCollected.value = !isCollected.value
}

const stripHtml = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}
</script>

<style lang="less" scoped>
.videoInfoCard {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: var(--comics-cardBg-color);
  margin-top: 10px;
  border-radius: 8px;

  .info-left {
    .cover-img {
      width: 150px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;

      @media (max-width: 768px) {
        width: 100px;
        height: 140px;
      }
    }
  }

  .info-right {
    flex: 1;

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
      }
    }

    .video-title {
      font-size: 20px;
      margin: 0;
      color: var(--comics-cardTitle-color);
    }

    .action-btns {
      display: flex;
      gap: 10px;

      .play-btn {
        background: var(--primary-pink-color);
        border: none;
      }

      .el-button:not(.play-btn) {
        background: transparent;
        border: 1px solid #888;
        color: var(--comics-cardTitle-color);

        &.collected {
          background: #ff007a;
          border-color: #ff007a;
          color: #fff;
        }
      }
    }

    .video-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;

      .el-tag {
        background: var(--comics-bg-color);
        border: none;
        color: #888;
      }
    }

    .video-desc {
      font-size: 14px;
      color: #888;
      line-height: 1.6;
      max-height: 44px;
      overflow: hidden;
      margin-bottom: 5px;

      &.expanded {
        max-height: none;
      }
    }

    .expand-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 13px;
      color: var(--primary-pink-color);
      cursor: pointer;
      margin-bottom: 10px;
    }

    .video-meta {
      font-size: 13px;
      color: #888;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      p {
        margin: 5px 0;
      }

      .label {
        color: #666;
      }

      .score {
        color: #ff9500;
        font-weight: bold;
      }
    }
  }
}
</style>
