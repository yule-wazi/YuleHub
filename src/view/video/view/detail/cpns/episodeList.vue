<template>
  <div class="episodeList">
    <div class="section-header">
      <span class="section-title">选集播放</span>
      <span class="episode-count"
        >({{ currentEpisodeIndex + 1 }}/{{ currentEpisodes.length }})</span
      >
      <div class="display-toggle">
        <el-icon :class="{ active: displayMode === 'grid' }" @click="displayMode = 'grid'"
          ><Grid
        /></el-icon>
        <el-icon :class="{ active: displayMode === 'list' }" @click="displayMode = 'list'"
          ><List
        /></el-icon>
      </div>
    </div>
    <!-- 播放源切换 -->
    <div class="source-tabs">
      <div
        v-for="(source, index) in episodeList"
        :key="index"
        class="source-tab"
        :class="{ active: currentSourceIndex === index }"
        @click="switchSource(index)"
      >
        {{ source.source }}
      </div>
    </div>
    <!-- 选集列表 -->
    <div class="episode-grid" :class="displayMode">
      <div
        v-for="(ep, index) in currentEpisodes"
        :key="index"
        class="episode-item"
        :class="{ active: currentEpisodeIndex === index }"
        @click="selectEpisode(index)"
      >
        {{ displayMode === 'grid' ? index + 1 : ep.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Grid, List } from '@element-plus/icons-vue'
import useVideo from '@/sotre/module/video'

const videoStore = useVideo()
const videoDetail = computed(() => videoStore.videoDetail)

const displayMode = ref('grid')
const currentSourceIndex = ref(0)
const currentEpisodeIndex = ref(0)

const emit = defineEmits(['episodeChange'])

// 解析播放源
const playSources = computed(() => {
  if (!videoDetail.value.vod_play_from) return []
  return videoDetail.value.vod_play_from.split('$$$')
})

// 解析选集列表
const episodeList = computed(() => {
  if (!videoDetail.value.vod_play_url) return []
  const urlGroups = videoDetail.value.vod_play_url.split('$$$')
  return urlGroups.map((group, index) => {
    const episodes = group.split('#').map((ep) => {
      const [name, url] = ep.split('$')
      return { name, url }
    })
    return { source: playSources.value[index] || `源${index + 1}`, episodes }
  })
})

// 当前源的选集
const currentEpisodes = computed(() => {
  return episodeList.value[currentSourceIndex.value]?.episodes || []
})

// 当前选集名称
const currentEpisodeName = computed(() => {
  return currentEpisodes.value[currentEpisodeIndex.value]?.name || '第01集'
})

// 当前选集URL
const currentEpisodeUrl = computed(() => {
  return currentEpisodes.value[currentEpisodeIndex.value]?.url || ''
})

// 切换播放源
const switchSource = (index) => {
  currentSourceIndex.value = index
  currentEpisodeIndex.value = 0
  emitChange()
}

// 选择集数
const selectEpisode = (index) => {
  currentEpisodeIndex.value = index
  emitChange()
}

const emitChange = () => {
  emit('episodeChange', {
    sourceIndex: currentSourceIndex.value,
    episodeIndex: currentEpisodeIndex.value,
    episode: currentEpisodes.value[currentEpisodeIndex.value],
    episodeName: currentEpisodeName.value,
  })
}

defineExpose({
  currentEpisodeName,
  currentEpisodeUrl,
  currentEpisodes,
  currentEpisodeIndex,
  selectEpisode,
})
</script>

<style lang="less" scoped>
.episodeList {
  background: var(--comics-cardBg-color);
  border-radius: 8px;
  padding: 15px;

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--comics-cardTitle-color);
    }

    .episode-count {
      font-size: 13px;
      color: #888;
      margin-left: 8px;
    }

    .display-toggle {
      margin-left: auto;
      display: flex;
      gap: 10px;

      .el-icon {
        font-size: 18px;
        color: #666;
        cursor: pointer;

        &.active {
          color: var(--primary-pink-color);
        }
      }
    }
  }

  .source-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;

    .source-tab {
      padding: 6px 12px;
      font-size: 13px;
      background: var(--comics-bg-color);
      border-radius: 4px;
      cursor: pointer;
      color: #888;

      &.active {
        background: var(--primary-pink-color);
        color: #fff;
      }

      &:hover:not(.active) {
        background: rgba(255, 0, 122, 0.2);
      }
    }
  }

  .episode-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 2px;
    }

    &.grid {
      .episode-item {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &.list {
      flex-direction: column;

      .episode-item {
        width: 100%;
        padding: 8px 12px;
      }
    }

    .episode-item {
      background: var(--comics-bg-color);
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      color: #888;

      &.active {
        background: var(--primary-pink-color);
        color: #fff;
      }

      &:hover:not(.active) {
        background: rgba(255, 0, 122, 0.2);
      }
    }
  }
}
</style>
