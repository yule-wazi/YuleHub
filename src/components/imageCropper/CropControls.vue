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
      <el-button class="reset-btn" :icon="RefreshLeft" @click="handleReset">
        <span class="text">重置</span>
      </el-button>
      <el-button class="getRatio-btn" :icon="Aim" @click="handleGetDeviceResolution">
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
import { Aim, Download, RefreshLeft } from '@element-plus/icons-vue'
import useCropStore from '@/sotre/module/crop'
import { storeToRefs } from 'pinia'
import useVip from '@/sotre/module/vip'

const cropStore = useCropStore()
const { imageSize, maintainRatio: storeMaintainRatio } = storeToRefs(cropStore)

const downloading = ref(false)
const maintainRatio = computed({
  get: () => storeMaintainRatio.value,
  set: (val) => cropStore.setMaintainRatio(val),
})
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
const vipStore = useVip()

// 下载图片
const handleDownload = async () => {
  try {
    downloading.value = true
    const imgTitle = vipStore.detailDataAll.imgDetail.title ?? ''
    await cropStore.downloadCroppedImage(`YuleHub_${imgTitle}.png`)
  } catch (error) {
  } finally {
    downloading.value = false
  }
}

// 重置裁剪框
const handleReset = () => {
  const { width, height } = imageSize.value
  cropStore.updateCropData({
    x: 0,
    y: 0,
    width: width,
    height: height,
  })
  selectedRatio.value = ''
  cropStore.setMaintainRatio(false)
}

// 获取设备分辨率
const handleGetDeviceResolution = () => {
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  // 应用设备分辨率比例
  applyRatio(screenWidth, screenHeight)
  selectedRatio.value = `${screenWidth}:${screenHeight}`
  // 同时填充到自定义输入框
  customWidth.value = screenWidth.toString()
  customHeight.value = screenHeight.toString()
}
// 应用宽高比
const applyRatio = (ratioWidth, ratioHeight) => {
  const { width: imgWidth, height: imgHeight } = imageSize.value
  const targetRatio = ratioWidth / ratioHeight
  const imageRatio = imgWidth / imgHeight

  let newWidth, newHeight, newX, newY

  // 根据图片尺寸计算最大可能的裁剪尺寸（撑满宽或高）
  if (imageRatio > targetRatio) {
    // 图片更宽，以高度撑满
    newHeight = imgHeight
    newWidth = newHeight * targetRatio
    newX = (imgWidth - newWidth) / 2 // 水平居中
    newY = 0
  } else {
    // 图片更高或相等，以宽度撑满
    newWidth = imgWidth
    newHeight = newWidth / targetRatio
    newX = 0
    newY = (imgHeight - newHeight) / 2 // 垂直居中
  }

  cropStore.updateCropData({
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  })

  // 自动开启等比缩放并设置比例
  cropStore.setMaintainRatio(true, targetRatio)
  selectedRatio.value = `${ratioWidth}:${ratioHeight}`
}

// 应用自定义比例
const applyCustomRatio = () => {
  const w = parseInt(customWidth.value)
  const h = parseInt(customHeight.value)
  if (!w || !h || w <= 0 || h <= 0) {
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
  box-sizing: border-box;
  overflow: hidden;
  @media (max-width: 1000px) {
    overflow-y: auto;
  }
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
