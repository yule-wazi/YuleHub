<template>
  <div class="audioConfigDialog">
    <el-dialog
      v-model="dialogVisible"
      title="Audio Token"
      width="90vw"
      style="max-width: 700px"
      center
      @closed="handleClose"
    >
      <div class="voice-lab-container">
        <el-tabs v-model="activeTab" class="voice-tabs">
          <!-- Settings Tab -->
          <el-tab-pane name="settings">
            <template #label>
              <span class="tab-label">
                <el-icon><Setting /></el-icon>
                基础设置
              </span>
            </template>

            <div class="settings-content">
              <!-- API Key Section -->
              <div class="config-section">
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><Key /></el-icon>
                    <div>
                      <h3>API 密钥</h3>
                      <p class="section-desc">配置你的 API 密钥以连接语音合成服务</p>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>API Key</label>
                  <el-input
                    v-model="formData.apiKey"
                    type="password"
                    show-password
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p class="hint-text">
                    你的 API 密钥仅存储在本地，不会发送到我们的服务器
                    <a
                      class="link-text"
                      href="https://cloud.siliconflow.cn/account/ak"
                      target="_blank"
                    >
                      获取 API Key
                    </a>
                  </p>
                </div>
              </div>

              <!-- Model Selection Section -->
              <div class="config-section">
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><Cpu /></el-icon>
                    <div>
                      <h3>模型选择</h3>
                      <p class="section-desc">选择用于语音生成的 TTS 模型</p>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>TTS 模型</label>
                  <el-select v-model="formData.model" placeholder="选择模型" style="width: 100%">
                    <el-option
                      v-for="model in siliconFlowTTSModels"
                      :key="model.value"
                      :label="model.label"
                      :value="model.value"
                    >
                      <div class="model-option">
                        <span class="model-name">{{ model.label }}</span>
                        <span class="model-desc">{{ model.description }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- Voice Clone Tab -->
          <el-tab-pane name="clone">
            <template #label>
              <span class="tab-label">
                <el-icon><Microphone /></el-icon>
                语音克隆
              </span>
            </template>

            <div class="clone-content">
              <!-- Voice Identity Section -->
              <div class="config-section">
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><User /></el-icon>
                    <div>
                      <h3>音色身份</h3>
                      <p class="section-desc">为你的克隆音色命名</p>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>音色名称 <span class="required">*</span></label>
                  <el-input v-model="cloneData.name" placeholder="仅允许字母、数字、_ 和 -" />
                </div>
              </div>
              <!-- Reference Audio Section -->
              <div class="config-section">
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><Headset /></el-icon>
                    <div>
                      <h3>参考音频</h3>
                      <p class="section-desc">上传用于语音克隆的参考音频文件</p>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <el-upload
                    class="audio-upload"
                    drag
                    :auto-upload="false"
                    :limit="1"
                    accept="audio/*"
                    :on-change="handleAudioUpload"
                    :file-list="audioFileList"
                  >
                    <el-icon class="upload-icon"><Upload /></el-icon>
                    <div class="upload-text">点击上传或拖拽文件到此处</div>
                    <div class="upload-hint">支持 WAV、MP3、FLAC、OGG 格式</div>
                  </el-upload>
                </div>
              </div>

              <!-- Clone Model Section -->
              <div class="config-section">
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><Cpu /></el-icon>
                    <div>
                      <h3>克隆模型 <span class="required">*</span></h3>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <el-select
                    v-model="cloneData.model"
                    placeholder="选择克隆模型"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="model in siliconFlowTTSModels"
                      :key="model.value"
                      :label="model.label"
                      :value="model.value"
                    />
                  </el-select>
                </div>
              </div>

              <!-- Audio Text Content Section -->
              <div class="config-section">
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><Document /></el-icon>
                    <div>
                      <h3>音频文本内容 <span class="required">*</span></h3>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <el-input
                    v-model="cloneData.text"
                    type="textarea"
                    :rows="4"
                    placeholder="输入与上传音频对应的文本内容"
                    maxlength="500"
                    show-word-limit
                  />
                  <p class="hint-text">文本内容应尽可能与音频匹配</p>
                </div>
              </div>

              <!-- Cloned Voice ID Display -->
              <div v-if="formData.cloneVoiceId" class="config-section">
                <div class="form-group">
                  <label>已克隆音色 ID</label>
                  <el-input v-model="formData.cloneVoiceId" readonly>
                    <template #append>
                      <el-button @click="handleDeleteClonedVoice" type="danger">删除</el-button>
                    </template>
                  </el-input>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-if="activeTab === 'settings'"
            type="primary"
            size="large"
            class="save-btn"
            @click="handleSaveSettings"
          >
            <el-icon><DocumentCopy /></el-icon>
            保存配置
          </el-button>
          <el-button
            v-else
            type="primary"
            size="large"
            class="save-btn"
            @click="handleGenerateClone"
            :disabled="!cloneData.name || !audioFileList.length || !cloneData.text"
          >
            <el-icon><MagicStick /></el-icon>
            生成克隆音色
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import {
  Setting,
  Key,
  Cpu,
  Microphone,
  User,
  Headset,
  Document,
  DocumentCopy,
  MagicStick,
  Upload,
} from '@element-plus/icons-vue'
import { ElLoading, ElMessage } from 'element-plus'
import {
  siliconFlowTTSModels,
  defaultSiliconFlowConfig,
} from '@/view/chat/config/siliconFlowTTSConfig'
import myCache from '@/utils/cacheStorage'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const dialogVisible = ref(props.modelValue)
const activeTab = ref('settings')
const audioFileList = ref([])

// 表单数据
const formData = reactive(myCache.get('audioData') ?? { ...defaultSiliconFlowConfig })

// 克隆数据
const cloneData = reactive({
  name: '',
  model: 'FunAudioLLM/CosyVoice2-0.5B',
  text: '',
})

// 监听 props 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
  },
)

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 处理音频文件上传
const handleAudioUpload = (file) => {
  audioFileList.value = [file]
}

// 保存设置
const handleSaveSettings = () => {
  if (!formData.apiKey) {
    ElMessage.error('请输入 API Key')
    return
  }

  myCache.set('audioData', {
    apiKey: formData.apiKey,
    model: formData.model,
    voice: formData.voice,
    cloneVoiceId: formData.cloneVoiceId,
  })

  ElMessage.success('配置已保存')
  emit('save', formData)
  dialogVisible.value = false
}

// 生成克隆音色
const handleGenerateClone = async () => {
  if (!audioFileList.value.length) {
    ElMessage.error('请先选择音频文件')
    return
  }
  if (!formData.apiKey) {
    ElMessage.error('请先输入 API Key')
    return
  }
  if (!cloneData.name || !cloneData.text) {
    ElMessage.error('请填写完整信息')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: '正在上传音频...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const file = audioFileList.value[0].raw
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    const response = await fetch('https://api.siliconflow.cn/v1/audio/voices', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${formData.apiKey}`,
      },
      body: formDataUpload,
    })

    if (!response.ok) {
      throw new Error('上传失败')
    }

    const result = await response.json()
    formData.cloneVoiceId = result.uri

    myCache.set('audioData', {
      apiKey: formData.apiKey,
      model: formData.model,
      voice: formData.voice,
      cloneVoiceId: formData.cloneVoiceId,
    })

    ElMessage.success('音色克隆成功！')
    emit('save', formData)
  } catch (error) {
    ElMessage.error('音色克隆失败: ' + error.message)
  } finally {
    loading.close()
  }
}

// 删除克隆音色
const handleDeleteClonedVoice = async () => {
  if (!formData.cloneVoiceId) return

  try {
    const response = await fetch(
      `https://api.siliconflow.cn/v1/audio/voices/${formData.cloneVoiceId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${formData.apiKey}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error('删除失败')
    }

    formData.cloneVoiceId = ''
    audioFileList.value = []
    cloneData.name = ''
    cloneData.text = ''

    myCache.set('audioData', {
      apiKey: formData.apiKey,
      model: formData.model,
      voice: formData.voice,
      cloneVoiceId: '',
    })

    ElMessage.success('克隆音色已删除')
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message)
  }
}

// 关闭
const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="less">
.audioConfigDialog {
  :deep(.el-dialog) {
    overflow: hidden;
    background-color: var(--chat-card-inputBg-color);
  }
  :deep(.el-overlay-dialog) {
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
.voice-lab-container {
  background-color: var(--chat-card-bg-colo);
  border-radius: 8px;
  padding: 0;
  .tab-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .settings-content,
  .clone-content {
    padding: 24px;
    max-height: 500px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none !important;
    }
  }
}
.dialog-footer {
  display: flex;
  justify-content: center;
  .save-btn {
    width: 100%;
    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
    border: none;
    padding: 12px 32px;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: linear-gradient(135deg, #be185d 0%, #9d174d 100%);
    }

    &:disabled {
      background: #334155;
      color: #64748b;
    }
  }
}
.config-section {
  background-color: var(--chat-card-inputBg-color);
  border: 1px solid var(--comics-headerIcon-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  .section-header {
    margin-bottom: 16px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--comics-cardText-color);
      margin: 0 0 4px 0;
    }
    .header-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      .section-icon {
        font-size: 24px;
        margin-top: 2px;
        flex-shrink: 0;
      }
      .section-desc {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
      }
    }
  }
  .form-group {
    margin-top: 16px;
    .required {
      color: #ec4899;
      margin-left: 4px;
    }
    .hint-text {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
      line-height: 1.5;
      .link-text {
        color: #ec4899;
        text-decoration: none;
        margin-left: 8px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
    .model-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .model-name {
        font-size: 14px;
        color: #fff;
      }
      .model-desc {
        font-size: 12px;
        color: #94a3b8;
      }
    }
    .upload-icon {
      font-size: 48px;
      color: #ec4899;
      margin-bottom: 12px;
    }

    .upload-text {
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 4px;
    }

    .upload-hint {
      font-size: 12px;
      color: #64748b;
    }
  }
}

// Element Plus 深度样式
:deep(.voice-tabs) {
  background: transparent;

  .el-tabs__header {
    border-radius: 5px;
    background-color: var(--chat-card-inputBg-color);
    border-bottom: 2px solid var(--comics-headerIcon-color);
    margin: 0;
    .el-tabs__nav-wrap {
      display: flex;
      justify-content: space-around;
    }
  }

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__item {
    color: #94a3b8;
    font-size: 15px;
    padding: 0 30px;
    height: 50px;
    line-height: 50px;

    &.is-active {
      color: #ec4899;
      font-weight: 600;
    }
  }

  .el-tabs__active-bar {
    background-color: #ec4899;
    height: 3px;
  }
}

:deep(.audio-upload) {
  width: 100%;
  .el-upload {
    width: 100%;
  }
  .el-upload-dragger {
    background: var(--comics-cardBg-color) !important;
    border: 2px dashed var(--comics-headerIcon-color) !important;
    border-radius: 8px;
    padding: 40px 20px;
    transition: all 0.3s;

    &:hover {
      border-color: #ec4899 !important;
      background-color: var(--chat-card-inputBg-color);
    }
  }
  .el-upload-list__item {
    &:hover {
      background-color: var(--comics-headerIcon-color);
    }
  }
}

:deep(.el-input__wrapper) {
  background: #1e293b;
  border: 1px solid var(--comics-headerIcon-color);
  box-shadow: none;

  &:hover {
    border-color: var(--comics-headerIcon-color);
  }

  &.is-focus {
    border-color: #ec4899;
    box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.2);
  }
}

:deep(.el-input__inner) {
  color: #fff;
}

:deep(.el-textarea__inner) {
  background: #1e293b;
  border: 1px solid var(--comics-headerIcon-color);
  color: #fff;

  &:hover {
    border-color: var(--comics-headerIcon-color);
  }

  &:focus {
    border-color: #ec4899;
    box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.2);
  }
}

:deep(.el-select .el-input__wrapper) {
  background: #1e293b;
  border: 1px solid var(--comics-headerIcon-color);
}

:deep(.el-dialog) {
  background-color: var(--chat-card-inputBg-color);
  border: 1px solid var(--comics-headerIcon-color);
}

:deep(.el-dialog__header) {
  background-color: var(--chat-card-inputBg-color);
  border-bottom: 1px solid var(--comics-headerIcon-color);
}

:deep(.el-dialog__title) {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 0;
  background-color: var(--chat-card-inputBg-color);
}

:deep(.el-dialog__footer) {
  background-color: var(--chat-card-inputBg-color);
  border-top: 1px solid var(--comics-headerIcon-color);
  padding: 16px 20px;
}
</style>
