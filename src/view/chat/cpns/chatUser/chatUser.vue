<template>
  <div class="chatUser">
    <div class="image">
      <img :src=image />
    </div>
    <div class="name">{{ userName }}</div>
  </div>
</template>

<script setup>
defineProps({
  image: {
    type: String,
    default: '',
  },
  userName: {
    type: String,
    default: '默认名称',
  },
})
</script>

<style lang="less" scoped>
.chatUser {
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
  padding: 12px 10px;
  cursor: pointer;
  .image {
    height: 50px;
    width: 50px;
    overflow: hidden;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 添加阴影提升立体感 */
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .name {
    font-size: 18px;
    font-weight: 600;
    color: #f0f0f0;
    margin-left: 15px;
    white-space: nowrap;
    overflow: hidden;
    @media (max-width: 1000px) {
      display: none;
    }
  }
  &:hover {
    background-color: #51515e7d;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}
</style>
