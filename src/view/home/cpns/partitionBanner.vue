<template>
  <div class="partitionBanner">
    <template v-for="(item, index) in filteredNavList.filter((item) => item.text !== '首页')" :key="index">
      <div class="PartitionItem" @click="handleNavClick(item.action)">
        <div class="imageWrapper">
          <img :src="item.img" :alt="item.text" />
          <div class="overlay"></div>
        </div>
        <div class="labelWrapper">
          <span class="label">{{ item.text }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { sessionCache } from '@/utils/cacheStorage'
import { useNavClick } from '@/utils/useNavClick'
import { ref } from 'vue'

// 记录当前所在分区
const iconAction = ref(sessionCache.get('iconAction') ?? '')
const { filteredNavList, handleNavClick } = useNavClick(null, iconAction)
</script>

<style lang="less" scoped>
.partitionBanner {
  display: flex;
  gap: 20px;
  width: 100%;
  max-height: 200px;
  @media (max-width: 1000px) {
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .PartitionItem {
    flex: 1;
    min-width: 150px;
    aspect-ratio: 7 / 4;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    transition: all 0.5s ease;

    @media (max-width: 1000px) {
      aspect-ratio: 7 / 5;
    }

    &:hover {
      .imageWrapper {
        img {
          transform: scale(1.2) rotate(3deg);
        }

        .overlay {
          opacity: 1;
        }
      }

      .labelWrapper {
        bottom: 50%;
        left: 50%;
        transform: translate(-50%, 50%);
        .label {
          font-size: 32px;
          font-weight: 900;
          padding: 0;
          background: transparent;
          backdrop-filter: none;
          letter-spacing: 4px;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);

          &::after {
            width: 100%;
          }
        }
      }
    }
    .imageWrapper {
      width: 100%;
      height: 100%;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease-out;
        transform-origin: center center;
      }
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        opacity: 0;
        transition: opacity 0.5s ease;
        z-index: 1;
      }
    }
    .labelWrapper {
      position: absolute;
      bottom: 16px;
      left: 16px;
      bottom: 5%;
      left: 5%;

      z-index: 2;
      transition: all 0.5s ease;
      .label {
        position: relative;
        display: inline-block;
        font-size: 18px;
        font-weight: 700;
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
        transition: all 0.5s ease;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
        letter-spacing: 1px;
        white-space: nowrap;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          border-radius: 1px;
          background: linear-gradient(90deg, var(--primary-pink-color, #ff007a), transparent);
          transition: width 0.3s ease;
        }
      }
    }
  }
}
</style>
