<template>
  <div class="ava-container">
    <!-- 对话框 -->
    <transition name="dialog-fade">
      <div v-if="isExpanded" class="ava-dialog">
        <div class="dialog-header">
          <span class="dialog-title">Ava AI 助理</span>
          <button class="close-btn" @click="toggleDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="message-list">
            <div class="message assistant">
              <div class="message-text">你好！我是 Ava，有什么可以帮助你的吗？</div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <input
            type="text"
            class="input-box"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
          />
          <button class="send-btn">发送</button>
        </div>
      </div>
    </transition>
    <div
      class="ava-button"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @mousedown="startDrag"
      @click="handleClick"
    >
      <div class="avatar-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
// import { testHandle } from './utils/aiHandle'
// import { startAgent } from './utils/main'
import { runAgentTask } from './utils/Agent'

const isExpanded = ref(false)
const isDragging = ref(false)
const dragStartTime = ref(0)
const position = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })
// 初始化位置（右下角）
onMounted(() => {
  position.value = {
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  }
})
const toggleDialog = () => {
  isExpanded.value = !isExpanded.value
}
const handleClick = () => {
  if (!isDragging.value) {
    // testHandle()
    // startAgent()
    // toggleDialog()
    runAgentTask()
  }
}
const startDrag = (e) => {
  isDragging.value = false
  dragStartTime.value = Date.now()

  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}
const onDrag = (e) => {
  const dragDuration = Date.now() - dragStartTime.value
  if (dragDuration > 100) {
    isDragging.value = true
  }

  let newX = e.clientX - dragOffset.value.x
  let newY = e.clientY - dragOffset.value.y

  // 边界限制
  const buttonSize = 60
  newX = Math.max(0, Math.min(window.innerWidth - buttonSize, newX))
  newY = Math.max(0, Math.min(window.innerHeight - buttonSize, newY))

  position.value = { x: newX, y: newY }
}
const stopDrag = () => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)

  // 延迟重置拖动状态，避免触发点击
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}
// 发送消息
const sendMessage = (e) => {
  const message = e.target.value.trim()
  if (message) {
    console.log('发送消息:', message)
    e.target.value = ''
  }
}

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style lang="less" scoped>
.ava-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;

  * {
    pointer-events: auto;
  }

  .ava-button {
    position: fixed;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow:
      0 4px 12px rgba(102, 126, 234, 0.4),
      0 0 20px rgba(102, 126, 234, 0.3),
      0 0 40px rgba(118, 75, 162, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.2s,
      box-shadow 0.3s;
    user-select: none;
    animation: button-glow 3s ease-in-out infinite;

    &:hover {
      transform: scale(1.1);
      box-shadow:
        0 6px 16px rgba(102, 126, 234, 0.6),
        0 0 30px rgba(102, 126, 234, 0.5),
        0 0 60px rgba(118, 75, 162, 0.4);
      animation: button-glow-hover 1.5s ease-in-out infinite;
    }

    &:active {
      transform: scale(0.95);
    }

    @keyframes button-glow {
      0%,
      100% {
        box-shadow:
          0 4px 12px rgba(102, 126, 234, 0.4),
          0 0 20px rgba(102, 126, 234, 0.3),
          0 0 40px rgba(118, 75, 162, 0.2);
      }
      50% {
        box-shadow:
          0 4px 12px rgba(118, 75, 162, 0.5),
          0 0 25px rgba(118, 75, 162, 0.4),
          0 0 50px rgba(102, 126, 234, 0.3);
      }
    }

    @keyframes button-glow-hover {
      0%,
      100% {
        box-shadow:
          0 6px 16px rgba(102, 126, 234, 0.6),
          0 0 30px rgba(102, 126, 234, 0.5),
          0 0 60px rgba(118, 75, 162, 0.4);
      }
      50% {
        box-shadow:
          0 6px 16px rgba(118, 75, 162, 0.7),
          0 0 40px rgba(118, 75, 162, 0.6),
          0 0 80px rgba(102, 126, 234, 0.5);
      }
    }

    .avatar-icon {
      width: 32px;
      height: 32px;
      color: white;

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  .ava-dialog {
    position: fixed;
    right: 20px;
    bottom: 90px;
    width: 360px;
    height: 500px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .dialog-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow:
        0 2px 8px rgba(102, 126, 234, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .dialog-title {
        font-size: 16px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .dialog-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f5f7fa;

      .message-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .message {
          max-width: 80%;

          .message-text {
            padding: 12px 16px;
          }

          &.assistant {
            align-self: flex-start;

            .message-text {
              background: white;
              color: #333;
              border-radius: 12px 12px 12px 4px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
            }
          }

          &.user {
            align-self: flex-end;

            .message-text {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 12px 12px 4px 12px;
            }
          }
        }
      }
    }

    .dialog-footer {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;

      .input-box {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
          border-color: #667eea;
        }

        &::placeholder {
          color: #9ca3af;
        }
      }

      .send-btn {
        padding: 10px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition:
          opacity 0.2s,
          box-shadow 0.2s,
          transform 0.1s;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

        &:hover {
          opacity: 0.9;
          box-shadow:
            0 4px 12px rgba(102, 126, 234, 0.4),
            0 0 20px rgba(118, 75, 162, 0.3);
          transform: translateY(-1px);
        }

        &:active {
          opacity: 0.8;
          transform: translateY(0);
        }
      }
    }
  }

  .dialog-fade-enter-active,
  .dialog-fade-leave-active {
    transition: all 0.3s ease;
  }

  .dialog-fade-enter-from,
  .dialog-fade-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}
</style>
