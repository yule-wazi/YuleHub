<template>
  <div class="crop-controls">
    <el-button
      color="#ff007a"
      class="download-btn"
      @click="handleDownload"
      :loading="downloading"
      :icon="Download"
    >
      下载
    </el-button>
    <div class="section">
      <div class="section-title">操控面板</div>
      <el-button class="reset-btn" @click="handleReset" :icon="RefreshLeft">
        <span class="text">重置</span>
      </el-button>
      <el-button class="getRatio-btn" :icon="Aim">
        <span class="text">获取设备分辨率</span>
      </el-button>
      <div class="switch-item">
        <span>等比缩放</span>
        <el-switch
          v-model="maintainRatio"
          size="large"
          style="--el-switch-on-color: #ff007a; --el-switch-off-color: var(--comics-tagBg-color)"
        />
      </div>
    </div>
    <div class="section">
      <div class="section-title">快捷选择</div>
      <p class="section-subtitle">桌面 / 平板</p>
      <div class="ratio-grid">
        <button
          v-for="ratio in desktopRatios"
          :key="ratio.label"
          :class="['ratio-btn', { active: selectedRatio === ratio.label }]"
          @click="applyRatio(ratio.width, ratio.height)"
        >
          {{ ratio.label }}
        </button>
      </div>
      <p class="section-subtitle">手机 / 头像</p>
      <div class="ratio-grid">
        <button
          v-for="ratio in mobileRatios"
          :key="ratio.label"
          :class="['ratio-btn', { active: selectedRatio === ratio.label }]"
          @click="applyRatio(ratio.width, ratio.height)"
        >
          {{ ratio.label }}
        </button>
      </div>
    </div>
    <div class="section">
      <div class="section-title">自定义比率</div>
      <div class="custom-ratio">
        <el-input v-model="customWidth" placeholder="W" type="number" />
        <span class="separator">:</span>
        <el-input v-model="customHeight" placeholder="H" type="number" />
        <el-button color="#ff007a" @click="applyCustomRatio">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Aim, Download, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import useCropStore from '@/sotre/module/crop'
import { storeToRefs } from 'pinia'

const cropStore = useCropStore()
const { cropData, imageSize } = storeToRefs(cropStore)

const downloading = ref(false)
const maintainRatio = ref(false)
const originalQuality = ref(true)
const selectedRatio = ref('')
const customWidth = ref('')
const customHeight = ref('')

// 桌面端宽高比
const desktopRatios = [
  { label: '3:2', width: 3, height: 2 },
  { label: '4:3', width: 4, height: 3 },
  { label: '5:4', width: 5, height: 4 },
  { label: '7:3', width: 7, height: 3 },
  { label: '7:5', width: 7, height: 5 },
  { label: '8:5', width: 8, height: 5 },
  { label: '16:9', width: 16, height: 9 },
]

// 移动端宽高比
const mobileRatios = [
  { label: '1:1', width: 1, height: 1 },
  { label: '1:2', width: 1, height: 2 },
  { label: '3:4', width: 3, height: 4 },
  { label: '3:7', width: 3, height: 7 },
  { label: '5:8', width: 5, height: 8 },
  { label: '9:16', width: 9, height: 16 },
  { label: '8:19', width: 8, height: 19 },
]

// 下载图片
const handleDownload = async () => {
  try {
    downloading.value = true
    await cropStore.downloadCroppedImage('cropped-image.png')
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

// 重置裁剪框
const handleReset = () => {
  const { width, height } = imageSize.value
  cropStore.updateCropData({
    x: width * 0.25,
    y: height * 0.25,
    width: width * 0.5,
    height: height * 0.5,
  })
  selectedRatio.value = ''
  ElMessage.success('已重置')
}

// 旋转（暂未实现旋转功能）
const handleRotate = () => {
  ElMessage.info('旋转功能开发中')
}

// 应用宽高比
const applyRatio = (ratioWidth, ratioHeight) => {
  const { width: imgWidth, height: imgHeight } = imageSize.value
  const targetRatio = ratioWidth / ratioHeight

  let newWidth, newHeight

  // 根据图片尺寸计算最大可能的裁剪尺寸
  if (imgWidth / imgHeight > targetRatio) {
    // 图片更宽，以高度为准
    newHeight = imgHeight * 0.8
    newWidth = newHeight * targetRatio
  } else {
    // 图片更高，以宽度为准
    newWidth = imgWidth * 0.8
    newHeight = newWidth / targetRatio
  }

  // 居中裁剪框
  const newX = (imgWidth - newWidth) / 2
  const newY = (imgHeight - newHeight) / 2

  cropStore.updateCropData({
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  })

  selectedRatio.value = `${ratioWidth}:${ratioHeight}`
}

// 应用自定义比例
const applyCustomRatio = () => {
  const w = parseInt(customWidth.value)
  const h = parseInt(customHeight.value)

  if (!w || !h || w <= 0 || h <= 0) {
    ElMessage.warning('请输入有效的宽高比')
    return
  }

  applyRatio(w, h)
  selectedRatio.value = `${w}:${h}`
}
</script>

<style lang="less" scoped>
.crop-controls {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  .download-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
  .section {
    display: flex;
    flex-direction: column;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--comics-cardText-color);
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 6px 0;
      color: var(--comics-cardText-color);
    }
    .section-subtitle {
      font-size: 14px;
      margin: 12px 0 8px 0;
      color: var(--comics-cardSubTitle-color);
    }
    .reset-btn,
    .getRatio-btn {
      width: 100%;
      height: 44px;
      margin-bottom: 8px;
      justify-content: flex-start;
      font-size: 16px;
      font-weight: 600;
      margin-left: 0;
      transition: 0.2s;
      background-color: transparent;
      color: var(--comics-cardText-color);
      border: 2px var(--comics-border-color) solid;
      &:hover {
        background-color: var(--primary-pink-color);
        color: #edeef5;
      }
      .text {
        margin-left: 8px;
      }
    }
    .switch-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      border: 2px var(--comics-border-color) solid;
      margin-bottom: 8px;
      span {
        font-size: 16px;
      }
    }
  }
  .ratio-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 8px;
    .ratio-btn {
      height: 40px;
      border: 2px solid var(--comics-border-color);
      background: var(--comics-cardBg-color);
      color: var(--comics-cardText-color);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      &:hover {
        border-color: var(--primary-pink-color);
        color: var(--primary-pink-color);
      }
      &.active {
        background-color: var(--primary-pink-color);
        border-color: var(--primary-pink-color);
        color: #fff;
      }
    }
  }
  .custom-ratio {
    display: flex;
    align-items: center;
    gap: 8px;
    .el-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        background-color: var(--comics-cardBg-color);
        border-color: var(--comics-border-color);
        &.is-focus {
          box-shadow: 0 0 0 1px var(--primary-pink-color);
        }
        .el-input__inner {
          color: var(--comics-cardText-color);
        }
      }
    }
    .separator {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-secondary);
    }
    .el-button {
      flex-shrink: 0;
    }
  }
}
</style>
