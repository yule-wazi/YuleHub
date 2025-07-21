<template>
  <div class="dialog">
    <el-dialog
      v-model="centerDialogVisible"
      title="添加角色卡"
      width="90vw"
      style="max-width: 700px"
      center
    >
      <el-form ref="ruleFormRef" :model="roleForm">
        <el-form-item prop="description">
          <span>角色卡介绍</span>
          <el-input
            v-model="roleForm.description"
            style="width: 100%"
            :autosize="{ minRows: 4, maxRows: 8 }"
            type="textarea"
            placeholder="请输入角色介绍"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addRoleCardConfirm"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  centerDialogVisible: { type: Boolean, default: false },
  inputList: { type: Array, default: [] },
})


const roleForm = reactive({
  userName: '',
  image: '',
  description: '',
  firstMessage: '',
})
</script>

<style scoped></style>
