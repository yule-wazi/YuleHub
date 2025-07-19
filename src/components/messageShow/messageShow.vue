<template>
  <div class="messageShow" :class="{ isMe: messageInfo.isMe }">
    <template v-if="messageInfo.isMe">
      <div class="message">
        <div class="text" v-html="showMessage"></div>
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
        <div class="text" v-html="showMessage"></div>
        <div class="audio" @click="playAudioClick">
          <img class="audioImg" src="@/assets/img/audio.png" alt="" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { formatLightOutput } from '@/utils/formatOutput'
import { createAudio, playAudio } from '@/utils/createAudio'
import { ref, watchEffect } from 'vue'

const props = defineProps({
  messageInfo: {
    type: Object,
    default: {},
  },
})
// 对话高亮处理
const showMessage = ref('')
watchEffect(() => {
  showMessage.value = formatLightOutput(props.messageInfo.message)
  // console.log(
  //   'showMessage.value=',
  //   showMessage.value,
  //   'props.messageInfo.message=',
  //   props.messageInfo.message,
  // )
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
    max-width: 90%;
    .text {
      background-color: #393636;
      border: 1px solid #aaa;
      color: #fff;
      line-height: 30px;
      word-wrap: break-word;
      font-size: 17px;
      text-align: justify;
      margin: 0 5px 35px;
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
      background-color: #393636;
    }
  }
}
:deep(.desc) {
  width: 100%;
  box-sizing: border-box;
  margin: 10px 0;
  padding: 10px;
  background: rgba(60, 60, 60, 0.7);
  border-radius: 8px;
  color: #ffdca8;
  font-size: 14px;
  line-height: 1.7;
  white-space: nowrap;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}
:deep(.chat) {
  color: #f59e0b;
}
</style>
