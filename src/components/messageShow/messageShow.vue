<template>
  <div class="messageShow" :class="{ isMe: messageInfo.isMe }">
    <template v-if="messageInfo.isMe">
      <div class="message">
        <div class="text">{{ messageInfo.message }}</div>
      </div>
      <div class="image">
        <img :src="messageInfo.image" alt="" />
      </div>
    </template>
    <template v-else>
      <div class="image">
        <img :src="messageInfo.image" alt="" />
      </div>
      <div class="message">
        <div class="text">{{ messageInfo.message }}</div>
        <div class="audio" @click="playAudioClick">
          <img class="audioImg" src="@/assets/img/audio.png" alt="" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { createAudio, playAudio } from '@/utils/createAudio'

const props = defineProps({
  messageInfo: {
    type: Object,
    default: {},
  },
})
const playAudioClick = () => {
  const audioElem = createAudio(props.messageInfo.audioSrc)
  playAudio(audioElem)
}
</script>

<style lang="less" scoped>
.messageShow {
  display: flex;
  padding: 20px 20px 0 20px;
  width: 100%;
  box-sizing: border-box;
  .image {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .message {
    position: relative;
    .text {
      background-color: #6666668f;
      border: 1px solid #aaa;
      color: #fff;
      line-height: 40px;
      word-wrap: break-word;
      font-size: 18px;
      margin: 0 10px 35px;
      padding: 0 8px;
      border-radius: 8px;
    }
    .audio {
      position: absolute;
      display: none;
      height: 20px;
      width: 20px;
      left: 10px;
      bottom: 0px;
      padding: 5px;
      border-radius: 5px;
      background-color: #555;
      cursor: pointer;
      .audioImg {
        height: 100%;
        width: 100%;
      }
      &:active {
        background-color: #777;
      }
    }
    &:hover {
      .audio {
        display: block;
      }
    }
  }
}
.isMe {
  justify-content: end;
  .message {
    .text {
      background-color: #6666668f;
    }
  }
}
</style>
