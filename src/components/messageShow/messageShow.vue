<template>
  <div class="messageShow" :class="{ isMe: messageInfo.isMe }">
    <template v-if="messageInfo.isMe">
      <div class="message">
        <div class="text" v-html="showMessage"></div>
        <div class="editPen" @click="centerDialogVisible = true">
          <el-icon :size="16" color="#fff"><EditPen /></el-icon>
        </div>
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
  <el-dialog
    v-model="centerDialogVisible"
    title="编辑用户消息"
    width="90vw"
    style="max-width: 700px"
  >
    <el-input
      v-model="showMessage"
      style="width: 100%"
      :autosize="{ minRows: 8, maxRows: 16 }"
      type="textarea"
      placeholder="请输入角色介绍"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editUserMessageConfirm"> 保存并重新生成回复 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { formatSpecialOutput } from '@/utils/formatOutput'
import { createAudio, playAudio } from '@/utils/createAudio'
import { EditPen } from '@element-plus/icons-vue'

const props = defineProps({
  messageInfo: {
    type: Object,
    default: {},
  },
})
const centerDialogVisible = ref(false)

// 对话高亮处理
const showMessage = ref('')
watchEffect(() => {
  showMessage.value = formatSpecialOutput(props.messageInfo.message)
  // console.log(
  //   'showMessage.value=',
  //   showMessage.value,
  //   'props.messageInfo.message=',
  //   props.messageInfo.message,
  // )
})
// 修改对话内容
const editUserMessageConfirm = () => {
  centerDialogVisible.value = false
  emit('sliceEmit', showMessage)
}
// 播放音频
const playAudioClick = () => {
  const audioElem = createAudio(props.messageInfo.audioSrc)
  playAudio(audioElem)
}
const emit = defineEmits(['sliceEmit'])
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
      background-color: var(--chat-card-bg-color);
      border: 1px solid #aaa;
      color: var(--chat-card-text-color);
      line-height: 30px;
      word-wrap: break-word;
      font-size: 18px;
      text-align: justify;
      margin: 0 5px 35px;
      padding: 8px;
      border-radius: 8px;
      @media (max-width: 1000px) {
        line-height: 25px;
      }
    }
    .audio,
    .editPen {
      position: absolute;
      display: none;
      height: 16px;
      width: 16px;
      right: 10px;
      bottom: 5px;
      padding: 5px;
      border-bottom: 1px #fff solid;
      border-radius: 5px;
      backdrop-filter: blur(8px);
      background-color: #66666650;
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
      .audio,
      .editPen {
        display: block;
      }
    }
  }
}
.isMe {
  justify-content: end;
  .message {
    .text {
      background-color: var(--chat-card-bg-color);
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
:deep(pre) {
  padding: 5px;
  font-weight: 700;
  text-wrap: wrap;
  line-height: 1.42857143;
  color: var(--primary-color);
  background-color: #666;
  border-radius: 4px;
}
</style>
