<template>
  <div ref="home" class="home">
    <div class="list">
      <template v-for="item in novelStore.novelList">
        <ImageItem :itemData="item" />
      </template>
    </div>
  </div>
</template>

<script setup>
import useNovel from '@/sotre/module/novel.js'
import ImageItem from '../../cpns/imageItem.vue'
import { scrollRestore } from '@/utils/scrollRestore'

const novelStore = useNovel()
novelStore.getHomeNovel()
scrollRestore('home', novelStore)
</script>

<style lang="less" scoped>
.home {
  display: flex;
  height: 100%;
  overflow: auto;
  flex-direction: column;
  align-items: center;
  .list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
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
