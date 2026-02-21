<template>
  <div class="novel">
    <headerCompoment
      title="YuLe小说"
      :extraMenuItems="extraMenuItems"
      @searchClickEmit="searchClick"
    />
    <RouterView />

    <!-- 音频配置对话框 -->
    <audioConfigDialog v-model="showAudioConfig" source="novel" @save="handleAudioConfigSave" />
  </div>
</template>

<script setup>
import headerCompoment from '@/components/headerComponent/headerCompoment.vue'
import audioConfigDialog from '@/components/audioConfigDialog/audioConfigDialog.vue'
import useNovel from '@/sotre/module/novel.js'
import { useRouter } from 'vue-router'
import { computed, watch, ref } from 'vue'
import { Headset, Reading } from '@element-plus/icons-vue'
import myCache from '@/utils/cacheStorage'
import { ElMessage } from 'element-plus'

const novelStore = useNovel()
const router = useRouter()
const showAudioConfig = ref(false)

// 听书模式切换
const toggleAudioBookMode = () => {
  const newValue = !novelStore.isAudioBookMode

  // 如果要开启听书模式，强制打开配置对话框
  if (newValue) {
    showAudioConfig.value = true
    return
  }

  // 关闭听书模式
  novelStore.isAudioBookMode = false
}

// 监听听书模式变化，保存到 localStorage
watch(
  () => novelStore.isAudioBookMode,
  (newValue) => {
    myCache.set('isAudioBookMode', newValue)
    if (newValue) {
      ElMessage.success('听书模式已开启')
    } else {
      ElMessage.info('听书模式已关闭')
    }
  },
)

// 音频配置保存回调
const handleAudioConfigSave = (config) => {
  console.log('音频配置已保存:', config)
  // 配置保存后，自动开启听书模式
  novelStore.isAudioBookMode = true
}

// 额外菜单项配置
const extraMenuItems = computed(() => [
  {
    text: '听书模式',
    type: 'switch',
    value: novelStore.isAudioBookMode,
    icon: novelStore.isAudioBookMode ? Headset : Reading,
    activeIcon: Headset,
    inactiveIcon: Reading,
    onClick: toggleAudioBookMode,
  },
])

// 点击搜索
const searchClick = (tag) => {
  novelStore.novelTag = tag
  // 清空之前列表
  novelStore.novelList = []
  novelStore.currentPage = 1
  novelStore.fetchCateNovel(novelStore.novelTag)
  router.push({
    path: '/novel/category',
    query: { tag },
  })
}
</script>

<style lang="less" scoped>
.novel {
  height: 100vh;
  width: 100%;
  overflow: auto;
  padding-top: 60px;
  box-sizing: border-box;
  background-color: var(--comics-bg-color);
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 800px) {
    &::-webkit-scrollbar {
      display: block;
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: #ff007a;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background: var(--comics-headerBg-color);
      border-radius: 4px;
    }
  }
}
</style>
