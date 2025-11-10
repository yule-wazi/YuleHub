<template>
  <div class="commentsCard">
    <Card>
      <template #headerLeft>评论（{{ commentsCount }}）</template>
      <template #content>
        <div class="content">
          <div class="commentArea">
            <div class="inputArea">
              <el-input v-model="input" placeholder="发表评论" />
            </div>
            <div class="postBtn">
              <el-button color="#ff007a">发送</el-button>
            </div>
          </div>
          <div class="showComments">
            <template v-for="item in comments.slice(0, 3)">
              <div class="commentItem">
                <div class="image">
                  <img
                    :src="switchImgResolutionUrl(item.user.profile_image_urls.medium)"
                    @error="
                      (e) => {
                        e.target.src = 'https://s.pximg.net/common/images/no_profile.png'
                      }
                    "
                  />
                </div>
                <div class="data">
                  <div class="user">
                    <div class="name">{{ item.user?.name }}</div>
                    <div class="date">{{ formatTime(item.date) }}</div>
                  </div>
                  <div class="text">{{ item.comment }}</div>
                </div>
              </div>
            </template>
          </div>
          <div class="viewMore">
            <el-button style="width: 100%; margin-top: 12px" size="large">查看更多</el-button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { formatTime } from '@/utils/formatTime'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import Card from '@/view/comics/cpns/card.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  comments: {
    type: Array,
    default: [],
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
})

const input = ref('')
</script>

<style lang="less" scoped>
.commentsCard {
  .content {
    .commentArea {
      display: flex;
      .inputArea {
        flex: 1;
        --el-color-primary: #ff007a;
        :deep(.el-input__wrapper) {
          background-color: var(--comics-tagBg-color);
          border: 1px var(--comics-border-color) solid;
        }
      }
      .postBtn {
        margin-left: 8px;
      }
    }
    .showComments {
      margin-top: 40px;
      .commentItem {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        .image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 10px;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .data {
          display: flex;
          flex-direction: column;
          align-items: start;
          font-size: 14px;
          color: var(--comics-cardText-color);
          .user {
            display: flex;
            align-items: end;
            .date {
              margin-left: 5px;
              font-size: 12px;
              color: var(--comics-cardSubTitle-color);
            }
          }
          .text {
            margin-top: 4px;
          }
        }
      }
    }
    .viewMore {
      :deep(.el-button) {
        transition: .2s;
        background-color: transparent;
        border: 1px var(--comics-border-color) solid;
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
