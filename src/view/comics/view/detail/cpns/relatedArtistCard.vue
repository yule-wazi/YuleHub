<template>
  <div class="relatedArtistCard">
    <Card>
      <template #headerLeft>
        <div class="title">相关作者</div>
      </template>
      <template #content>
        <div class="content">
          <div class="artistList">
            <template v-for="item in artistList">
              <div class="artistItem">
                <div class="artist">
                  <div class="image">
                    <img
                      src="https://i.pximg.org/img-master/img/2025/11/09/02/00/02/137254620_p0_master1200.jpg"
                    />
                  </div>
                  <div class="info">
                    <div class="name">SakuraPixel</div>
                    <div class="account">@sakura_pixel</div>
                    <div class="UID">UID：1034567</div>
                  </div>
                </div>
                <div class="viewBtn">
                  <el-button color="#ff007a">查看</el-button>
                </div>
              </div>
            </template>
          </div>
          <div class="viewMore">
            <el-button style="width: 100%; margin-top: 12px;" size="large">查看更多</el-button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/view/comics/cpns/card.vue'

const artistList = [1, 2, 3]
</script>

<style lang="less" scoped>
.relatedArtistCard {
  .content {
    .artistList {
      .artistItem {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        padding: 8px;
        border-radius: 8px;
        transition: .1s;
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
