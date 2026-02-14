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
                  <el-select
                    v-model="formData.model"
                    placeholder="选择模型"
                    style="width: 100%"
                    popper-class="select-dropdown"
                  >
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

              <!-- Voice Selection Section -->
              <div class="config-section">
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><Headset /></el-icon>
                    <div>
                      <h3>音色选择</h3>
                      <p class="section-desc">选择当前角色的默认音色</p>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <el-scrollbar style="height: 140px">
                    <div class="voice-selection-grid">
                      <!-- 预设音色 -->
                      <div
                        v-for="(voice, index) in audioList"
                        :key="'preset-' + index"
                        class="voice-card"
                        :class="{
                          active: formData.voice === voice.voiceId && !isClonedVoiceSelected,
                        }"
                      >
                        <audio
                          :ref="
                            (el) => {
                              if (el) audioRefs[index] = el
                            }
                          "
                          :src="voice.voiceSrc"
                        ></audio>
                        <div class="voice-name">{{ voice.name }}</div>
                        <div class="voice-actions">
                          <el-button
                            type="primary"
                            size="small"
                            plain
                            @click.stop="selectVoice(voice.voiceId, false)"
                          >
                            选择
                          </el-button>
                          <el-button
                            size="small"
                            @click.stop="playVoicePreview(index, false)"
                            plain
                          >
                            <el-icon><VideoPlay /></el-icon>
                          </el-button>
                        </div>
                      </div>
                      <!-- 克隆音色 -->
                      <div
                        v-for="(voice, index) in formData.clonedVoices"
                        :key="'cloned-' + index"
                        class="voice-card"
                        :class="{
                          active: formData.voice === voice.reference_id && isClonedVoiceSelected,
                        }"
                      >
                        <audio
                          :ref="
                            (el) => {
                              if (el) clonedAudioRefs[index] = el
                            }
                          "
                          :src="voice.voiceSrc"
                        ></audio>
                        <div class="voice-name">{{ voice.customName }}</div>
                        <div class="voice-badge">克隆</div>
                        <div class="voice-actions">
                          <el-button
                            type="primary"
                            size="small"
                            @click.stop="selectVoice(voice.reference_id, true)"
                          >
                            选择
                          </el-button>
                          <el-button size="small" @click.stop="playVoicePreview(index, true)" plain>
                            <el-icon><VideoPlay /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </el-scrollbar>
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
                    popper-class="select-dropdown"
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
                  <div style="display: flex; gap: 8px; margin-bottom: 8px">
                    <el-button
                      class="btn-pink-gradient"
                      size="small"
                      @click="handleAutoTranscribe"
                      :disabled="!audioFileList.length || isTranscribing"
                      :loading="isTranscribing"
                    >
                      <el-icon><MagicStick /></el-icon>
                      {{ isTranscribing ? '转换中...' : '自动识别文本' }}
                    </el-button>
                  </div>
                  <el-input
                    v-model="cloneData.text"
                    type="textarea"
                    :rows="4"
                    placeholder="输入与上传音频对应的文本内容，或点击上方按钮自动识别"
                    maxlength="500"
                    show-word-limit
                  />
                  <p class="hint-text">文本内容应尽可能与音频匹配，可使用自动识别功能</p>
                </div>
              </div>

              <!-- Cloned Voices List -->
              <div
                v-if="formData.clonedVoices && formData.clonedVoices.length > 0"
                class="config-section"
              >
                <div class="section-header">
                  <div class="header-content">
                    <el-icon class="section-icon" color="#ec4899"><Collection /></el-icon>
                    <div>
                      <h3>已克隆音色列表</h3>
                      <p class="section-desc">管理你的克隆音色</p>
                    </div>
                  </div>
                </div>
                <div class="cloned-voices-list">
                  <div
                    v-for="(voice, index) in formData.clonedVoices"
                    :key="voice.reference_id"
                    class="voice-item"
                  >
                    <div class="voice-info">
                      <div class="voice-name">{{ voice.customName }}</div>
                      <div class="voice-meta">
                        <span class="voice-id">ID: {{ voice.reference_id }}</span>
                        <span class="voice-model">{{ voice.model.split('/')[1] }}</span>
                      </div>
                    </div>
                    <el-button
                      @click="handleDeleteClonedVoice(index)"
                      type="danger"
                      size="small"
                      :icon="Delete"
                    >
                      删除
                    </el-button>
                  </div>
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
import { ref, reactive, watch, onMounted } from 'vue'
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
  Delete,
  Collection,
  VideoPlay,
} from '@element-plus/icons-vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import {
  siliconFlowTTSModels,
  defaultSiliconFlowConfig,
} from '@/view/chat/config/siliconFlowTTSConfig'
import { audioList } from '@/sotre/agentAudioConfig'
import useAgent from '@/sotre/module/agent'
import myCache from '@/utils/cacheStorage'
import { voiceClone, audioTranscription } from '@/service/module/agents'
import indexedDBStorage from '@/utils/indexedDBStorage'

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
const isTranscribing = ref(false) // 转换状态
const isClonedVoiceSelected = ref(false) // 是否选择了克隆音色

// 音频 refs
const audioRefs = ref({})
const clonedAudioRefs = ref({})

// 表单数据
const formData = reactive(
  myCache.get('audioData') ?? {
    ...defaultSiliconFlowConfig,
    clonedVoices: [], // 存储多个克隆音色的数组
  },
)

// 克隆数据
const cloneData = reactive({
  name: '',
  model: 'FunAudioLLM/CosyVoice2-0.5B',
  text: '',
})

// 初始化当前角色的音色
const initCurrentVoice = () => {
  const agentStore = useAgent()
  const currentUser = agentStore.users.find((user) => user.userName === agentStore.currentUser)

  if (currentUser && currentUser.voiceId) {
    // 设置当前音色
    formData.voice = currentUser.voiceId

    // 检查是否是克隆音色
    const isCloned = formData.clonedVoices?.some((v) => v.reference_id === currentUser.voiceId)
    isClonedVoiceSelected.value = isCloned
  }
}

// 监听 props 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    // 对话框打开时，初始化当前角色的音色
    if (val) {
      initCurrentVoice()
    }
  },
)

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 处理音频文件上传
const handleAudioUpload = (file) => {
  audioFileList.value = [file]
  // 清空之前的文本
  cloneData.text = ''
}

// 自动转换音频为文本
const handleAutoTranscribe = async () => {
  if (!audioFileList.value.length) {
    ElMessage.error('请先上传音频文件')
    return
  }
  if (!formData.apiKey) {
    ElMessage.error('请先输入 API Key')
    return
  }

  isTranscribing.value = true
  const loading = ElLoading.service({
    lock: true,
    text: '正在识别音频内容...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const file = audioFileList.value[0].raw
    const formDataUpload = new FormData()
    formDataUpload.append('model', 'FunAudioLLM/SenseVoiceSmall')
    formDataUpload.append('file', file)

    const response = await audioTranscription(formDataUpload, formData.apiKey)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`转换失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('STT 结果:', result)

    if (result.text) {
      cloneData.text = result.text
      ElMessage.success('音频内容识别成功！')
    } else {
      throw new Error('未能识别到文本内容')
    }
  } catch (error) {
    ElMessage.error('音频识别失败: ' + (error.message || '未知错误'))
    console.error('STT error:', error)
  } finally {
    isTranscribing.value = false
    loading.close()
  }
}

// 保存设置
const handleSaveSettings = () => {
  if (!formData.apiKey) {
    ElMessage.error('请输入 API Key')
    return
  }

  // 保存到 localStorage
  myCache.set('audioData', {
    apiKey: formData.apiKey,
    model: formData.model,
    voice: formData.voice,
    clonedVoices: formData.clonedVoices,
  })

  // 更新 Pinia store 中当前角色的 voiceId
  const agentStore = useAgent()
  const currentUser = agentStore.users.find((user) => user.userName === agentStore.currentUser)
  if (currentUser && formData.voice) {
    currentUser.voiceId = formData.voice
    ElMessage.success('配置已保存，当前角色音色已更新')
  } else {
    ElMessage.success('配置已保存')
  }

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
    formDataUpload.append('model', cloneData.model)
    formDataUpload.append('customName', cloneData.name)
    formDataUpload.append('text', cloneData.text)
    formDataUpload.append('file', file)

    const response = await voiceClone(formDataUpload, formData.apiKey)
    console.log('response', response)

    // 从返回的 data.uri 中提取 reference_id
    const result = response.data
    const uri = result.uri // 格式: "speech:123:d411j31sssvc7385ptkg:yguyuztvapowmxtwvnax"

    // 解析 uri 获取 reference_id (最后一部分)
    const reference_id = uri.split(':').pop()

    // 将音频文件转换为 Blob
    const audioBlob = new Blob([file], { type: file.type })

    // 创建克隆音色对象
    const clonedVoice = {
      customName: cloneData.name,
      reference_id: reference_id,
      model: cloneData.model,
      text: cloneData.text,
      uri: uri,
      audioBlob: audioBlob, // 保存 Blob 到 IndexedDB
      createdAt: new Date().toISOString(),
    }

    // 保存到 IndexedDB
    try {
      await indexedDBStorage.saveClonedVoice(clonedVoice)
      console.log('✅ 克隆音色已保存到 IndexedDB')
    } catch (error) {
      console.error('❌ 保存克隆音色到 IndexedDB 失败:', error)
    }

    // 添加到克隆音色数组（localStorage 只存储元数据，不存储 Blob）
    if (!formData.clonedVoices) {
      formData.clonedVoices = []
    }

    // 创建不含 Blob 的轻量版本用于 localStorage
    const clonedVoiceMetadata = {
      customName: cloneData.name,
      reference_id: reference_id,
      model: cloneData.model,
      text: cloneData.text,
      uri: uri,
      createdAt: new Date().toISOString(),
    }
    formData.clonedVoices.push(clonedVoiceMetadata)

    myCache.set('audioData', {
      apiKey: formData.apiKey,
      model: formData.model,
      voice: formData.voice,
      clonedVoices: formData.clonedVoices,
    })

    // 清空表单
    cloneData.name = ''
    cloneData.text = ''
    audioFileList.value = []

    ElMessage.success(`音色 "${clonedVoice.customName}" 克隆成功！`)
    emit('save', formData)
  } catch (error) {
    ElMessage.error('音色克隆失败: ' + (error.message || '未知错误'))
    console.error('Voice clone error:', error)
  } finally {
    loading.close()
  }
}

// 删除克隆音色
const handleDeleteClonedVoice = async (index) => {
  const voice = formData.clonedVoices[index]

  ElMessageBox.confirm(`确定要删除音色 "${voice.customName}" 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 从 IndexedDB 删除
      try {
        await indexedDBStorage.deleteClonedVoice(voice.reference_id)
        console.log('✅ 已从 IndexedDB 删除克隆音色')
      } catch (error) {
        console.error('❌ 从 IndexedDB 删除失败:', error)
      }

      // 从数组中删除
      formData.clonedVoices.splice(index, 1)

      myCache.set('audioData', {
        apiKey: formData.apiKey,
        model: formData.model,
        voice: formData.voice,
        clonedVoices: formData.clonedVoices,
      })

      ElMessage.success('克隆音色已删除')
    })
    .catch(() => {
      // 取消删除
    })
}

// 关闭
const handleClose = () => {
  emit('update:modelValue', false)
}

// 选择音色
const selectVoice = (voiceId, isCloned) => {
  formData.voice = voiceId
  isClonedVoiceSelected.value = isCloned
}

// 播放音色预览
const playVoicePreview = (index, isCloned = false) => {
  try {
    const refs = isCloned ? clonedAudioRefs.value : audioRefs.value
    const audio = refs[index]
    if (audio) {
      audio.play().catch((error) => {
        console.error('播放失败:', error)
        ElMessage.error('播放失败，请重试')
      })
    } else {
      console.error('未找到音频元素:', index, isCloned)
    }
  } catch (error) {
    console.error('播放错误:', error)
  }
}

// 加载克隆音色的音频
onMounted(async () => {
  // 初始化当前角色的音色
  initCurrentVoice()

  if (formData.clonedVoices && formData.clonedVoices.length > 0) {
    for (let i = 0; i < formData.clonedVoices.length; i++) {
      const voice = formData.clonedVoices[i]
      try {
        const clonedVoice = await indexedDBStorage.getClonedVoice(voice.reference_id)
        if (clonedVoice && clonedVoice.audioBlob) {
          voice.voiceSrc = URL.createObjectURL(clonedVoice.audioBlob)
        }
      } catch (error) {
        console.error('加载克隆音色失败:', error)
      }
    }
  }
})
</script>

<style scoped lang="less">
.audioConfigDialog {
  :deep(.el-dialog) {
    overflow: hidden;
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
}
.config-section {
  background-color: var(--comics-cardBg-color);
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
    .model-select {
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

.cloned-voices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .voice-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: var(--chat-card-bg-color);
    border: 1px solid var(--comics-headerIcon-color);
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      border-color: #ec4899;
      background-color: var(--comics-cardBg-color);
    }
  }

  .voice-info {
    flex: 1;
    .voice-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--comics-cardSubTitle-color);
      margin-bottom: 8px;
    }

    .voice-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #94a3b8;

      .voice-id {
        font-family: monospace;
      }

      .voice-model {
        color: #ec4899;
      }
    }
  }
}

// Element Plus 深度样式
:deep(.voice-tabs) {
  background: transparent;

  .el-tabs__header {
    border-radius: 5px;
    background-color: var(--comics-cardBg-color);
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
}

// 音色选择网格
.voice-selection-grid {
  display: flex;
  gap: 12px;
  padding: 10px 0;
}

.voice-card {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  padding: 5px;
  background: var(--comics-cardBg-color);
  border: 2px solid var(--comics-headerSearchBg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--comics-headerIcon-color);
  }

  &.active {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(190, 24, 93, 0.2) 100%);
    border-color: #ec4899;
  }

  .voice-name {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 20px;
    font-weight: 700;
    color: var(--comics-cardText-color);
  }

  .voice-badge {
    position: absolute;
    line-height: 32px;
    top: 10px;
    right: 10px;
    padding: 2px 8px;
    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
    color: #fff;
    font-size: 12px;
    border-radius: 4px;
    font-weight: 600;
  }

  .voice-actions {
    position: absolute;
    bottom: 10px;
    left: 10px;
    display: flex;
    gap: 6px;
  }
}
</style>
