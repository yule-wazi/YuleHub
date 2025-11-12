<template>
  <div class="artistCard">
    <Card>
      <template #headerLeft>
        <div class="artist">
          <div class="image">
            <img :src="switchImgResolutionUrl(profile_image_urls.medium)" alt="" />
          </div>
          <div class="info">
            <div class="name">{{ name }}</div>
            <div class="account">@{{ account }}</div>
            <div class="UID">UID：{{ id }}</div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="content">
          <div class="viewBtn">
            <el-button color="#ff007a" style="width: 100%" size="large" @click="viewArtist"
              >查看作者</el-button
            >
          </div>
          <div class="artistInfo">
            <div class="works">
              <div class="data">{{ total_illusts }}</div>
              <div class="name">作品数</div>
            </div>
            <div class="followers">
              <div class="data">{{ total_follow_users }}</div>
              <div class="name">粉丝数</div>
            </div>
            <div class="following">
              <div class="data">{{ total_mypixiv_users }}</div>
              <div class="name">关注数</div>
            </div>
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
import { useRouter } from 'vue-router'
const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  profile_image_urls: {
    type: Object,
    default: {},
  },
  name: {
    type: String,
    default: '',
  },
  account: {
    type: String,
    default: '',
  },
  total_illusts: {
    type: Number,
    default: 0,
  },
  total_follow_users: {
    type: Number,
    default: 0,
  },
  total_mypixiv_users: {
    type: Number,
    default: 0,
  },
})
const router = useRouter()
const vipStore = useVip()
const viewArtist = () => {
  vipStore.vipSearchImgData = []
  vipStore.searchCurrentPage = 1

  router.push({
    path: '/comics/category',
    query: { author: props.name, uid: props.id },
  })
}
</script>

<style lang="less" scoped>
.artistCard {
  .artist {
    display: flex;
    align-items: center;
    .image {
      width: 50px;
      height: 50px;
      overflow: hidden;
      border: 2px solid var(--primary-pink-color);
      border-radius: 50%;
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
      justify-content: start;
      color: var(--comics-cardText-color);
      .account,
      .UID {
        font-size: 12px;
        font-weight: 400;
        color: var(--comics-cardSubTitle-color);
      }
    }
  }
  .content {
    margin-top: 40px;
    .artistInfo {
      display: flex;
      margin-top: 35px;
      .works,
      .followers,
      .following {
        flex: 1;
        text-align: center;
        .data {
          font-weight: 700;
          font-size: 16px;
          color: var(--comics-cardText-color);
        }
        .name {
          font-size: 14px;
          color: var(--comics-cardSubTitle-color);
        }
      }
    }
  }
}
</style>
