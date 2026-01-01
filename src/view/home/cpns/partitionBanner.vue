<template>
  <div class="partitionBanner">
    <template v-for="item in Partition">
      <div class="PartitionItem">
        <img :src="item.img" alt="" />
        {{ item.text }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const Partition = ref([
  {
    text: 'AI',
    img: 'https://i.pximg.org/img-master/img/2025/12/31/22/00/06/139328271_p0_master1200.jpg',
  },
  {
    text: '插画',
    img: 'https://i.pximg.org/img-master/img/2025/12/30/19/36/37/139270353_p0_master1200.jpg',
  },
  {
    text: '漫画',
    img: 'https://i.pximg.org/img-master/img/2025/12/31/00/22/59/139284467_p0_master1200.jpg',
  },
  {
    text: '小说',
    img: 'https://i.pximg.org/novel-cover-master/img/2025/12/31/22/49/24/ci26869406_523de952b4ed573a317adcf6a5ce0a03_master1200.jpg',
  },
])
</script>

<style lang="less" scoped>
.partitionBanner {
  display: flex;
  gap: 20px;
  width: 100%;
  @media (max-width: 1000px) {
    overflow-x: auto;
  }
  .PartitionItem {
    flex: 1;
    min-width: 150px;
    aspect-ratio: 7 / 4;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    @media (max-width: 1000px) {
      overflow-x: auto;
      aspect-ratio: 7 / 5;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
