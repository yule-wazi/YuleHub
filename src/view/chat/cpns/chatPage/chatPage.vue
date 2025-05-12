<template>
  <div class="chatPage">
    <div class="header">
      <div class="title">{{ title }}</div>
    </div>
    <div ref="contentRef" class="content">
      <template v-for="(item, index) in targetUser.message" :key="index">
        <MessageShow :messageInfo="item" />
      </template>
    </div>
    <div class="inputArea" @click="inputAreaClick" @keydown.enter="btnClick()">
      <div class="question">
        <div class="showImg"></div>
        <input ref="inputRef" type="text" />
        <div class="mute" @click="isMute = !isMute">
          <img v-if="isMute" class="Img" src="@/assets/img/mute.png" />
          <img v-else class="Img" src="@/assets/img/sound.png" />
        </div>
        <div class="stop" @click="isPlay = !isPlay">
          <img v-if="isPlay" class="Img" src="@/assets/img/暂停.png" />
          <img v-else class="Img" src="@/assets/img/播放.png" />
        </div>
        <div class="submit">
          <button id="emit" @click="btnClick">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import MessageShow from '@/components/messageShow/messageShow.vue'
import useAgent from '@/sotre/module/agent'
import {
  checkContentFirstName,
  formatOutPutMessage,
  formatOutputMessageToAgent,
} from '@/utils/chatToAgent'
import { playAudio } from '@/utils/createAudio'
import { updateMessage } from '@/utils/pushMessage'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
})
const agentStore = useAgent()
// 监听是否继续输出
const { isPlay, isMute } = storeToRefs(agentStore)

// 监听输入按钮点击
const inputRef = ref(null)
const contentRef = ref(null)
const inputAreaClick = () => {
  inputRef.value.focus()
}
// 用来存储对话数组
const { users } = storeToRefs(agentStore)
const targetUser = computed(() =>
  users.value.find((item) => item.userName === agentStore.currentUser),
)
// 发送消息
const btnClick = () => {
  const inputValue = inputRef.value.value
  if (!inputValue) return

  // "我"的消息塞入消息队列
  targetUser.value.message.push({
    isMe: true,
    message: inputValue,
    image: '/userImg/userImg-7.png',
  })
  // 更新dom滚动底部
  nextTick(() => {
    const content = contentRef.value
    content.scrollTop = content.scrollHeight
  })

  inputRef.value.value = ''
  // 跟AI交互&&判断是否为群聊
  const currentUserName = targetUser.value.userName
  if (currentUserName === '和睦一家人') {
    const targetName = checkContentFirstName(inputValue)
    if (targetName) {
      aiResponse(inputValue, targetName)
    } else {
      for (const item of users.value) {
        if (item.userName === '和睦一家人') continue
        aiResponse(inputValue, item.userName)
      }
    }
  } else {
    aiResponse(inputValue, currentUserName)
  }
}
// AI交互逻辑
const aiResponse = async (inputValue, userName) => {
  const { audioDuration } = storeToRefs(agentStore)
  const userImg = users.value.find((item) => item.userName === userName).image
  const res = await agentStore.chatToAgent(inputValue, userName)
  let audioSrcCache = ''
  if (!isMute.value) {
    // 插入语音模型
    const [audioElem, audioSrc] = await agentStore.audioToAgent(formatOutPutMessage(res), userName)
    audioSrcCache = audioSrc
    // 播放音频&获取时长
    audioDuration.value = await playAudio(audioElem)
  }
  // 塞入智能体消息队列
  const [pushMessage, emotion] = formatOutPutMessage(res)
  updateMessage({
    targetUser: targetUser.value,
    isMe: false,
    message: pushMessage,
    image: userImg,
    audioSrc: audioSrcCache,
    content: contentRef.value,
    audioDuration: audioDuration,
  })
  // 判断是否为聊群
  if (agentStore.currentUser === '和睦一家人' && audioDuration.value >= 0) {
    setTimeout(() => {
      const targetName = checkContentFirstName(res)
      if (targetName) {
        // 对ai回复的内容进行审查是否为对第三人发出对话若是延迟递归调用aiResponse
        aiResponse(formatOutputMessageToAgent(userName, res), targetName)
      }
      audioDuration.value = 0
    }, audioDuration.value)
  }
}
</script>

<style scoped>
.chatPage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .header {
    width: 100%;
    height: 74px;
    border-bottom: 1px solid #aaaaaa76;
    .title {
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      padding: 25px 0 0 20px;
    }
  }
  .content {
    width: 100%;
    overflow: auto;
    flex: 1;
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(45deg, #8baaaa, #ae8b9c); /* 滚动条颜色 */
      border-radius: 4px; /* 圆角 */
    }
    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(45deg, #6a8a8a, #9e6b8c); /* 悬停时颜色 */
    }
    &::-webkit-scrollbar-track {
      background: #333; /* 滚动条轨道颜色 */
      border-radius: 4px;
    }
    @media (max-width: 1000px) {
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  .inputArea {
    position: relative;
    cursor: text;
    width: 100%;
    height: 20%;
    border-top: 1px solid #aaaaaa76;
    @media (max-width: 1000px) {
      height: 80px;
    }
    .question {
      height: 100%;
      width: 100%;
      overflow: hidden;
      .showImg img {
        height: 60px;
        width: 60px;
        object-fit: cover;
        margin: 10px;
        border-radius: 5px;
      }
      input {
        box-sizing: border-box;
        width: 100%;
        height: 30%;
        outline: none;
        border: none;
        background-color: transparent;
        color: #fff;
        font-size: 20px;
        padding-left: 10px;
      }
      .submit {
        position: absolute;
        right: 10px;
        bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: end;
        #emit {
          height: 40px;
          width: 100px;
          border: none;
          font-size: 18px;
          background: none;
          margin: 0;
          cursor: pointer;
          outline: none;
          background-color: #1ba784;
          background-image: linear-gradient(45deg, #8baaaa 0%, #ae8b9c 100%);
          color: #fff;
          border-radius: 5px;
        }
        #emit:active {
          background-image: linear-gradient(45deg, #8baaaa 100%, #ae8b9c 100%);
        }
      }
      .stop {
        position: absolute;
        right: 120px;
        bottom: 12px;
        height: 20px;
        width: 20px;
        padding: 7px;
        border: 2px solid #aaa;
        border-radius: 10px;
        cursor: pointer;
        .Img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .mute {
        position: absolute;
        right: 160px;
        bottom: 10px;
        height: 30px;
        width: 30px;
        padding: 7px;
        border-radius: 10px;
        cursor: pointer;
        .Img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}
</style>
