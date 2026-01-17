<template>
  <div class="animeResourcesSettings">
    <el-dialog
      v-model="dialogVisible"
      title="配置数据源"
      width="600px"
      align-center
      :close-on-click-modal="true"
      @close="handleClose"
    >
      <template #header>
        <div class="dialog-header">
          <el-icon :size="28">
            <DataBoard />
          </el-icon>
          <span class="dialog-title">配置数据源</span>
        </div>
      </template>
      <div class="dialog-content">
        <p class="description">请输入番剧资源站的网址，用于获取动漫数据</p>
        <el-form :model="form" label-position="top">
          <el-form-item label="网站地址">
            <el-input
              v-model="form.baseUrl"
              placeholder="例如: https://example.com"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon>
                  <Link />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>

        <el-alert type="info" :closable="false" class="tips-alert">
          <template #title>
            <div class="tips-title">提示</div>
          </template>
          <ul class="tips-list">
            <li>请确保输入的网址可以正常访问</li>
            <li>支持 HTTP 和 HTTPS 协议</li>
            <li>配置将保存在本地，下次访问无需重新输入</li>
          </ul>
        </el-alert>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" @click="handleLater">稍后设置</el-button>
          <el-button type="primary" size="large" @click="handleSave">保存配置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { DataBoard, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useVideo from '@/sotre/module/video'
import myLocalCache from '@/utils/cacheStorage'

const dialogVisible = defineModel({ type: Boolean, default: false })

const emit = defineEmits(['save'])

const videoStore = useVideo()
const form = reactive({
  baseUrl: myLocalCache.get('animeBaseUrl') ?? '',
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleLater = () => {
  dialogVisible.value = false
}

const handleSave = () => {
  if (!form.baseUrl.trim()) {
    ElMessage.warning('请输入网站地址')
    return
  }

  try {
    let inputUrl = form.baseUrl.trim()
    // 如果用户没有输入协议，自动添加 https://
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = 'https://' + inputUrl
    }

    // 使用 URL 对象解析
    const urlObj = new URL(inputUrl)

    // 获取 hostname + pathname（去除 /api 及之后的部分）
    let baseUrl = urlObj.hostname
    let pathname = urlObj.pathname

    // 如果路径中包含 /api，只保留 /api 之前的部分
    if (pathname.includes('/api')) {
      pathname = pathname.substring(0, pathname.indexOf('/api'))
    } else {
      // 如果没有 /api，移除末尾的斜杠和文件名
      pathname = pathname.replace(/\/[^\/]*\.(php|html|htm|asp|aspx|jsp).*$/i, '')
      pathname = pathname.replace(/\/$/, '')
    }

    // 组合 hostname 和处理后的 pathname
    baseUrl = pathname ? `${baseUrl}${pathname}` : baseUrl

    form.baseUrl = baseUrl
    // 保存到 store 和 localStorage
    videoStore.baseUrl = baseUrl
    myLocalCache.set('animeBaseUrl', baseUrl)

    ElMessage.success('配置保存成功')
    emit('save', baseUrl)
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('请输入有效的网站地址')
    console.error('URL 解析错误:', error)
  }
}
</script>

<style lang="less" scoped>
.animeResourcesSettings {
  .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dialog-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--comics-cardTitle-color);
  }

  .dialog-content {
    padding: 8px 0;
  }

  .description {
    color: var(--comics-cardSubTitle-color);
    font-size: 14px;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .tips-alert {
    margin-top: 20px;
  }

  .tips-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--comics-cardTitle-color);
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: 14px;
      line-height: 1.8;
      padding-left: 16px;
      position: relative;
      color: var(--comics-cardSubTitle-color);

      &::before {
        content: '•';
        position: absolute;
        left: 0;
        font-weight: bold;
        color: var(--primary-pink-color);
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  // Element Plus 组件样式覆盖
  :deep(.el-dialog) {
    background: var(--comics-cardBg-color) !important;
    border-radius: 12px;
    border: 1px solid var(--comics-border-color);
  }

  :deep(.el-dialog__header) {
    padding: 24px 24px 16px;
    margin: 0;
    border-bottom: 1px solid var(--comics-border-color);
    background: transparent !important;
  }

  :deep(.el-dialog__headerbtn) {
    .el-dialog__close {
      color: var(--comics-headerIcon-color);
      font-size: 20px;

      &:hover {
        color: var(--primary-pink-color);
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0 24px 24px;
    color: var(--comics-cardText-color);
    background: transparent !important;
  }

  :deep(.el-dialog__footer) {
    padding: 0 24px 24px;
    border-top: 1px solid var(--comics-border-color);
    margin-top: 16px;
    padding-top: 16px;
    background: transparent !important;
  }

  // 表单样式
  :deep(.el-form-item__label) {
    color: var(--comics-cardTitle-color);
    font-size: 14px;
    font-weight: 500;
  }

  // 输入框样式
  :deep(.el-input) {
    .el-input__wrapper {
      background: var(--comics-cardBg-color);
      box-shadow: 0 0 0 1px var(--comics-border-color) inset;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 0 0 1px var(--primary-pink-color) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--primary-pink-color) inset !important;
        background: var(--comics-cardBg-color);
      }
    }

    .el-input__inner {
      color: var(--comics-cardText-color);

      &::placeholder {
        color: var(--comics-cardSubTitle-color);
      }
    }

    .el-input__prefix,
    .el-input__suffix {
      color: var(--comics-headerIcon-color);

      .el-icon {
        color: var(--comics-headerIcon-color);
      }
    }

    .el-input__suffix-inner {
      .el-icon {
        &:hover {
          color: var(--primary-pink-color);
        }
      }
    }
  }

  // 提示框样式
  :deep(.el-alert) {
    background: var(--comics-tagBg-color);
    border: 1px solid var(--comics-border-color);

    .el-alert__content {
      color: var(--comics-cardSubTitle-color);
    }

    .el-alert__title {
      color: var(--comics-cardTitle-color);
    }
  }

  // 按钮样式
  :deep(.el-button) {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s;

    &.el-button {
      background: var(--comics-tagBg-color);
      border: none;
      color: var(--comics-menuText-color);

      &:hover {
        background: var(--primary-pink-color);
        color: var(--comics-cardTitle-color);
      }

      &:active {
        background: var(--comics-tagBg-color);
      }
    }

    &.el-button--primary {
      background: var(--primary-pink-color);
      border-color: var(--primary-pink-color);
      color: #ffffff;

      &:hover {
        background: #ff1a8a;
        border-color: #ff1a8a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 0, 122, 0.3);
      }

      &:active {
        background: #e6006d;
        border-color: #e6006d;
        transform: translateY(0);
      }
    }
  }

  // 图标颜色
  :deep(.el-icon) {
    color: var(--primary-pink-color);
  }
}
</style>
