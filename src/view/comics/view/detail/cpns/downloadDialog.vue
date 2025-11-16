<template>
  <div class="downloadDialog">
    <el-dialog v-model="showDialog" :show-close="false" align-center width="70vw">
      <template #header="{ close }">
        <div class="header">
          <el-button color="#ff007a" @click="close" circle>
            <el-icon :size="45"><CircleCloseFilled /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="content">
        <div class="canvas">
          <div class="cropper">
            <ImageCropper
              :image-url="switchImgResolutionUrl(vipStore.currentDetailShowImg, 'origin')"
            />
          </div>
          <div class="preview">
            <CropPreview
              :image-url="switchImgResolutionUrl(vipStore.currentDetailShowImg, 'origin')"
            />
          </div>
        </div>
        <div class="edit">
          <CropControls />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import useVip from '@/sotre/module/vip'
import { switchImgResolutionUrl } from '@/utils/ProxyUrl'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import ImageCropper from '@/components/imageCropper/ImageCropper.vue'
import CropPreview from '@/components/imageCropper/CropPreview.vue'
import CropControls from '@/components/imageCropper/CropControls.vue'

const showDialog = defineModel()
const vipStore = useVip()
</script>

<style lang="less" scoped>
.downloadDialog {
  :deep(.el-dialog) {
    background-color: var(--comics-bg-color);
    position: relative;
    @media (max-width: 1000px) {
      width: 100vw;
      padding: 0;
      overflow: hidden;
    }
    .el-dialog__header {
      position: absolute;
      left: 0;
      right: 0;
      .el-button {
        position: absolute;
        top: -25px;
        right: -10px;
        @media (max-width: 1000px) {
          top: 10px;
          right: 10px;
          z-index: 9;
        }
      }
    }
  }
  .header {
    display: flex;
    flex-direction: row;
    justify-content: end;
    gap: 16px;
    .el-icon {
      color: var(--comics-tagBg-color);
    }
  }
  .content {
    display: grid;
    gap: 24px;
    justify-content: space-between;
    width: 100%;
    height: 80vh;
    grid-template-columns: 1fr;
    @media (min-width: 1000px) {
      grid-template-columns: minmax(0, 1fr) 350px;
    }
    @media (max-width: 1000px) {
      gap: 10px;
      height: 100vh;
    }
    .canvas {
      width: 100%;
      height: 100%;
      display: flex;
      min-height: 0;
      flex-direction: column;
      justify-content: space-between;
      @media (max-width: 1000px) {
        height: 70vh;
      }
      .cropper,
      .preview {
        height: 48%;
        width: 100%;
        border-radius: 12px;
        border: 2px solid var(--comics-border-color);
        background-color: var(--comics-cardBg-color);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        @media (max-width: 1000px) {
          height: 50%;
        }
      }
      .cropper {
        border: none;
      }
      .preview {
        overflow: hidden;
      }
    }
    .edit {
      height: 100%;
      border-radius: 12px;
      border: 2px solid var(--comics-border-color);
      background-color: var(--comics-cardBg-color);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
  }
}
</style>
