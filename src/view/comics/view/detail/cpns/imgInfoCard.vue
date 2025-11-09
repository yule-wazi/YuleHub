<template>
  <div class="imageInfoCard">
    <Card>
      <template #headerLeft>
        <div class="artise">
          <div class="image">
            <img
              src="https://i.pximg.org/img-master/img/2025/11/06/12/29/04/137152766_p0_master1200.jpg"
              alt=""
            />
          </div>
          <div class="info">
            <div class="titl">Magical Summoning</div>
            <div class="artist">by Cyrene</div>
            <div class="date">2025-11-04 20:04</div>
          </div>
        </div>
      </template>
      <template #headerRight>
        <el-button color="#ff007a" >收藏</el-button>
      </template>
      <template #content>
        <div class="content">
          <div class="desc">
            A magical illustration depicting the art of summoning. The ethereal purple and pink
            tones create a mystical atmosphere, while the ornate frame adds a classic fantasy touch.
          </div>
          <div class="tagList">
            <template v-for="item in tagList">
              <div class="imgTag">
                <Tag :tag="item" />
              </div>
            </template>
          </div>
          <div class="metadata">
            <div class="resolution">
              <div class="name">分辨率</div>
              <div class="data">2580x3643</div>
            </div>
            <div class="views">
              <div class="name">观看次数</div>
              <div class="data">43846</div>
            </div>
            <div class="PID">
              <div class="name">PID</div>
              <div class="data">137095402</div>
            </div>
            <div class="UID">
              <div class="name">UID</div>
              <div class="data">10509347</div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/view/comics/cpns/card.vue'
import Tag from '@/components/tag/tag.vue'

const tagList = ['1231', 'adada', 'a阿萨大大', '大大大的']
</script>

<style lang="less" scoped>
.imageInfoCard {
  .artise {
    display: flex;
    align-items: start;
    .image {
      width: 50px;
      height: 50px;
      overflow: hidden;
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
      .artist,
      .date {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 3px;
        color: var(--comics-cardSubTitle-color);
      }
      .date {
        font-weight: 400;
      }
    }
  }
  .content {
    .desc {
      font-size: 14px;
      margin-bottom: 30px;
      font-weight: 500;
      color: var(--comics-cardText-color);
    }
  }
  .tagList {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
    .imgTag {
      font-size: 12px;
      padding: 6px;
      border-radius: 6px;
      margin: 0 10px 10px 0;
      background-color: var(--comics-tagBg-color);
    }
  }
  .metadata {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--comics-border-color);
    padding-top: 10px;
    .resolution,
    .views,
    .PID,
    .UID {
      width: 25%;
      font-size: 13px;
      @media(max-width: 1000px) {
        width: 50%;
      }
      .name {
        color: var(--comics-cardSubTitle-color);
      }
      .data {
        color: var(--comics-cardText-color);
        font-size: 15px;
        font-weight: 500;
      }
    }
  }
}
</style>
