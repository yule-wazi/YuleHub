<template>
  <div class="card">
    <div class="header">
      <div class="left">
        <slot name="headerLeft"></slot>
      </div>
      <div class="right">
        <slot name="headerRight"></slot>
      </div>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup></script>

<style lang="less" scoped>
.card {
  padding: 16px;
  border-radius: 10px;
  background-color: var(--comics-cardBg-color);
  border: var(--comics-border-color) 1px solid;
  box-shadow: 0 1px 1px 0 rgba(131, 131, 131, 0.5);
  .header {
    font-size: 15px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 12px;
  }
}
</style>
