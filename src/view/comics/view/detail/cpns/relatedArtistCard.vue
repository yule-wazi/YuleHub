<template>
  <div class="relatedArtistCard">
    <Card>
      <template #headerLeft>
        <div class="title">相关作者</div>
      </template>
      <template #content>
        <div class="content">
          <div class="artistList">
            <template v-for="item in showAllArtist ? artistList : artistList.slice(0, 3)">
              <div class="artistItem">
                <div class="artist">
                  <div class="image">
                    <img :src="switchImgResolutionUrl(item.user.profile_image_urls.medium)" />
                  </div>
                  <div class="info">
                    <div class="name">{{ item.user.name }}</div>
                    <div class="account">@{{ item.user.account }}</div>
                    <div class="UID">UID：{{ item.user.id }}</div>
                  </div>
                </div>
                <div class="viewBtn">
                  <el-button color="#ff007a" @click="viewArtist(item)">查看</el-button>
                </div>
              </div>
            </template>
          </div>
          <div class="viewMore">
            <el-button
              style="width: 100%; margin-top: 12px"
              v-show="!showAllArtist"
              size="large"
              @click="showAllArtist = true"
            >
              查看更多
            </el-button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import Card from '@/view/comics/cpns/card.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  artistList: {
    type: Array,
    default: [],
  },
})
const showAllArtist = ref(false)
const router = useRouter()
const vipStore = useVip()
const viewArtist = (currentUser) => {
  vipStore.vipSearchImgData = []
  vipStore.searchCurrentPage = 1
  router.push({
    path: '/comics/category',
    query: { author: currentUser.user.name, uid: currentUser.user.id },
  })
}
</script>

<style lang="less" scoped>
.relatedArtistCard {
  .content {
    max-height: 310px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    @media (min-width: 1000px) {
      &::-webkit-scrollbar {
        display: block;
        width: 8px;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--primary-pink-color);
        border-radius: 4px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
      }
    }
    .artistList {
      .artistItem {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        padding: 8px;
        border-radius: 8px;
        transition: 0.1s;
        &:hover {
          background-color: var(--comics-tagBg-color);
        }
        .artist {
          display: flex;
          .image {
            width: 50px;
            height: 50px;
            border: 2px var(--comics-border-color) solid;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 10px;
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          .info {
            display: flex;
            flex-direction: column;
            align-items: start;
            .name {
              font-size: 14px;
              font-weight: 600;
              color: var(--comics-cardText-color);
            }
            .account,
            .UID {
              font-size: 12px;
              color: var(--comics-cardSubTitle-color);
            }
          }
        }
      }
    }
    .viewMore {
      :deep(.el-button) {
        transition: 0.2s;
        background-color: transparent;
        border: none;
        color: var(--comics-cardText-color);
        &:hover {
          background-color: var(--primary-pink-color);
          color: #edeef5;
        }
      }
    }
  }
}
</style>
