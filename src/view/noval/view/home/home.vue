<template>
  <div class="home">
    <div class="list">
      <template v-for="item in novalStore.novalList">
        <ImageItem :itemData="item" />
      </template>
    </div>
  </div>
</template>

<script setup>
import useNoval from '@/sotre/module/noval'
import ImageItem from '../../cpns/imageItem.vue'

const novalStore = useNoval()
novalStore.getHomeNoval()
</script>

<style lang="less" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  .list {
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (min-width: 800px) {
      display: block;
      column-count: 3;
      column-gap: 20px;
    }
    @media (min-width: 1000px) {
      display: block;
      column-count: 4;
      column-gap: 10px;
    }
  }
}
</style>
