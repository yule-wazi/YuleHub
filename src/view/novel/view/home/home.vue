<template>
  <div class="home">
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

const novelStore = useNovel()
novelStore.getHomeNovel()
</script>

<style lang="less" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  .list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
}
</style>
