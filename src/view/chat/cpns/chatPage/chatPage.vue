<template>
  <div class="chatPage">
    <div class="header">
      <div class="title">{{ title }}</div>
    </div>
    <div ref="contentRef" class="content" @scroll="throttleScroll">
      <template v-for="(item, index) in targetUser.message" :key="index">
        <template v-if="item.message">
          <MessageShow
            :messageInfo="item"
            @sliceEmit="(message) => sliceCurrentMessage(message, index)"
          />
        </template>
      </template>
      <Transition>
        <div v-if="showGoBackButton" class="backBottom" @click="goBackBottom(contentRef)">
          <el-icon size="35" color="#fff"><Bottom /></el-icon>
        </div>
      </Transition>
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
import { computed, nextTick, ref, watch } from 'vue'
import MessageShow from '@/components/messageShow/messageShow.vue'
import { storeToRefs } from 'pinia'
import useAgent from '@/sotre/module/agent'
import { updateMessage } from '@/utils/pushMessage'
import { throttle } from '@/utils/throttle'
import { Bottom } from '@element-plus/icons-vue'
defineProps({
  title: {
    type: String,
    default: '',
  },
})

const showGoBackButton = ref(false)
// 展示回到底部按钮
const isShowGoBackButton = (e) => {
  const content = e.target
  if (content.scrollHeight - content.scrollTop - content.offsetHeight > 100) {
    showGoBackButton.value = true
  } else {
    showGoBackButton.value = false
  }
}
const throttleScroll = throttle(isShowGoBackButton, 200)

// 回到底部
const goBackBottom = (contentRef) => {
  const content = contentRef
  content.scrollTo({
    top: content.scrollHeight,
    behavior: 'smooth',
  })
}

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
  // 清空输入框
  inputRef.value.value = ''
  aiResponse(targetUser.value.userName)
}
// AI交互逻辑
const messageText = ref('') //流式对话内容
const aiResponse = async (userName) => {
  messageText.value = ''
  const { audioDuration } = storeToRefs(agentStore)
  const userImg = users.value.find((item) => item.userName === userName).image
  let audioSrcCache = ''
  // AI返回对话
  updateMessage({
    targetUser: targetUser.value,
    isMe: false,
    image: userImg,
    audioSrc: audioSrcCache,
    contentElem: contentRef.value,
    audioDuration: audioDuration,
    getAudio: !isMute.value,
  })
}
// 截取到当前对话
const sliceCurrentMessage = (message, index) => {
  const currentMessage = targetUser.value.message
  currentMessage[index].message = message._value
  targetUser.value.message = currentMessage.slice(0, index + 1)
  aiResponse(targetUser.value.userName)
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
    .backBottom {
      position: fixed;
      bottom: 180px;
      left: 1200px;
      width: 35px;
      height: 35px;
      padding: 5px;
      background-color: #666666c6;
      border: 2px #aaa solid;
      border-radius: 50%;
      transition: all 0.1s;
      @media (max-width: 1000px) {
        left: 10px;
        bottom: 100px;
      }
    }
    .v-enter-from,
    .v-leave-to {
      opacity: 0;
      transform: translateY(20px);
    }
    .v-leave-from,
    .v-enter-to {
      opacity: 1;
      transform: translateY(20px);
    }
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
