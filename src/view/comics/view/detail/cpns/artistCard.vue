<template>
  <div class="artistCard">
    <Card>
      <template #headerLeft>
        <div class="artist">
          <div class="image">
            <img
              src="https://i.pximg.org/img-master/img/2025/11/06/12/29/04/137152766_p0_master1200.jpg"
              alt=""
            />
          </div>
          <div class="info">
            <div class="name">寺田てら</div>
            <div class="account">@trcoot</div>
            <div class="UID">UID：10509347</div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="content">
          <div class="viewBtn">
            <el-button color="#ff007a" style="width: 100%" size="large">查看作者</el-button>
          </div>
          <div class="artistInfo">
            <div class="works">
              <div class="data">288</div>
              <div class="name">作品数</div>
            </div>
            <div class="followers">
              <div class="data">720</div>
              <div class="name">粉丝数</div>
            </div>
            <div class="following">
              <div class="data">79</div>
              <div class="name">关注数</div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/view/comics/cpns/card.vue'
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
