<template>
  <div class="comics">
    <ComicsHeader />
    <RouterView />
  </div>
</template>

<script setup>
import ComicsHeader from './cpns/comicsHeader.vue'
</script>

<style lang="less" scoped>
.comics {
  height: 100vh;
  width: 100%;
  overflow: auto;
  margin-top: 60px;
  background-color: #f4f4f4;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
