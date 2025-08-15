<template>
  <div class="scrollBar">
    <el-scrollbar>
      <div class="scrollbar-flex-content">
        <div
          ref="tagRefs"
          v-for="(item, index) in tagList"
          :key="index"
          class="scrollbar-demo-item"
          @click="categoryClick(item)"
        >
          {{ item }}
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import usePica from '@/sotre/module/pica'
import { onMounted, useTemplateRef } from 'vue'
defineProps({
  tagList: {
    type: Array,
    default: [],
  },
})
const colors = [
  '#afdd22',
  '#ff4777',
  '#1685a9',
  '#f05654',
  '#426666',
  '#8c4356',
  '#574266',
  '#75878a',
  '#3de1ad',
  '#845a33',
  '#41555d',
  '#44cef6',
  '#fbafaf',
  '#9e579d',
  '#1fab89',
  '#fc5c9c',
  '#e61c5d',
  '#a7ff83',
  '#c264fe',
  '#283149',
  '#f57170',
  '#a2d5f2',
  '#625772',
  '#b693fe',
  '#9df3c4',
  '#fcefee',
]
const tagRefs = useTemplateRef('tagRefs')
onMounted(() => {
  tagRefs.value.forEach((item, index) => {
    item.style.background = colors[index]
  })
})
const picaStore = usePica()
const categoryClick = (categoryName) => {
  picaStore.categoryList = []
  picaStore.currentCategoryName = categoryName
  picaStore.currentPage = 1
  picaStore.fetchCategoryDetail({ isRefresh: true, category: categoryName })
  emit('scrollTopEmit')
}
const emit = defineEmits(['scrollTopEmit'])
</script>

<style lang="less" scoped>
.scrollBar {
  width: 100%;
  background-color: var(--comics-headerBg-color);
  :deep(.el-scrollbar__bar) {
    display: none;
  }
  .scrollbar-flex-content {
    display: flex;
    align-items: center;
    width: fit-content;
    box-sizing: border-box;

    .scrollbar-demo-item {
      display: flex;
      justify-content: center;
      text-align: center;
      flex-shrink: 0;
      padding: 0 5px;
      margin: 8px;
      line-height: 30px;
      border-radius: 4px;
      color: #fff;
      font-weight: 500;
    }
  }
}
</style>
