<!--
 * @file 提交立项标签页组件
 * @description 适配嵌入到标签页中的提交立项功能
-->
<template>
  <div class="tab-submit-container">
    <!-- 表单内容 -->
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
      @finish="handleSubmit"
    >
      <!-- 申请信息 -->
      <div class="form-section">
        <div class="section-header">
          <h3>
            <FileTextOutlined />
            申请信息
          </h3>
          <p>填写立项申请的基本信息</p>
        </div>
        <div class="section-content">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item
                label="立项名称"
                name="projectName"
                :rules="[{ required: true, message: '请输入立项名称' }]"
              >
                <a-input 
                  v-model:value="formData.projectName" 
                  placeholder="请输入项目名称"
                  show-count
                  :maxlength="100"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="申请单位"
                name="department"
                :rules="[{ required: true, message: '请选择申请单位' }]"
              >
                <a-select v-model:value="formData.department" placeholder="请选择申请单位">
                  <a-select-option value="技术部">技术部</a-select-option>
                  <a-select-option value="工程部">工程部</a-select-option>
                  <a-select-option value="研发部">研发部</a-select-option>
                  <a-select-option value="设计部">设计部</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                label="项目周期(月)"
                name="duration"
                :rules="[{ required: true, message: '请输入项目周期' }]"
              >
                <a-input-number
                  v-model:value="formData.duration"
                  placeholder="请输入周期"
                  :min="1"
                  :max="60"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="预算金额(万元)"
                name="budget"
                :rules="[{ required: true, message: '请输入预算金额' }]"
              >
                <a-input-number
                  v-model:value="formData.budget"
                  placeholder="请输入预算"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="预计开始时间"
                name="startDate"
                :rules="[{ required: true, message: '请选择开始时间' }]"
              >
                <a-date-picker
                  v-model:value="formData.startDate"
                  placeholder="选择开始时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item
            label="项目描述"
            name="description"
            :rules="[{ required: true, message: '请输入项目描述' }]"
          >
            <a-textarea
              v-model:value="formData.description"
              placeholder="请详细描述项目的目标、内容和预期成果"
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>
        </div>
      </div>

      <!-- 材料上传 -->
      <div class="form-section">
        <div class="section-header">
          <h3>
            <CloudUploadOutlined />
            申请材料
          </h3>
          <p>上传项目立项申请相关材料</p>
        </div>
        <div class="section-content">
          <MaterialTemplateSync
            ref="materialTemplateSyncRef"
            business-type="apply"
            :key="`material-sync-${Date.now()}`"
            @files-change="handleFilesChange"
            @validation-change="handleValidationChange"
            @config-update="handleConfigUpdate"
          />
        </div>
      </div>

      <!-- 表单操作 -->
      <div class="form-actions">
        <a-space>
          <a-button @click="handleSaveDraft">
            <SaveOutlined />
            保存草稿
          </a-button>
          <a-button type="primary" html-type="submit">
            <SendOutlined />
            提交申请
          </a-button>
        </a-space>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  CloudUploadOutlined,
  SaveOutlined,
  SendOutlined
} from '@ant-design/icons-vue'
import MaterialTemplateSync from '@/components/th_qd/MaterialTemplateSync.vue'

const formRef = ref()
const materialTemplateSyncRef = ref()

// 表单数据
const formData = ref({
  projectName: '',
  department: '',
  duration: null,
  budget: null,
  startDate: null,
  description: ''
})

// 材料模板同步相关状态
const materialValidation = ref({
  allRequiredUploaded: false,
  uploadedCount: 0,
  totalCount: 0
})

// 表单验证规则
const rules = {
  projectName: [
    { required: true, message: '请输入立项名称', trigger: 'blur' },
    { min: 5, max: 100, message: '立项名称长度应在5-100个字符之间', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择申请单位', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入项目周期', trigger: 'blur' },
    { type: 'number', min: 1, max: 60, message: '项目周期应在1-60个月之间', trigger: 'blur' }
  ],
  budget: [
    { required: true, message: '请输入预算金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '预算金额不能为负数', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择预计开始时间', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 20, max: 500, message: '项目描述应在20-500个字符之间', trigger: 'blur' }
  ]
}

// 处理材料变化
const handleFilesChange = (files) => {
  console.log('材料文件变化:', files)
}

// 处理验证状态变化
const handleValidationChange = (validation) => {
  materialValidation.value = validation
}

// 处理配置更新
const handleConfigUpdate = () => {
  console.log('材料配置已更新')
}

// 保存草稿
const handleSaveDraft = async () => {
  try {
    // 这里可以调用API保存草稿
    message.success('草稿保存成功')
  } catch (error) {
    message.error('保存草稿失败：' + error.message)
  }
}

// 提交申请
const handleSubmit = async () => {
  try {
    // 验证基本表单
    await formRef.value.validate()
    
    // 验证材料上传
    if (!materialValidation.value.allRequiredUploaded) {
      message.warning('请确保所有必需材料都已上传')
      return
    }

    // 这里可以调用API提交申请
    message.success('申请提交成功，请等待审核')
    
    // 重置表单
    formRef.value.resetFields()
    
  } catch (error) {
    if (error.errorFields) {
      message.error('请完善表单信息')
    } else {
      message.error('提交失败：' + error.message)
    }
  }
}
</script>

<style scoped>
.tab-submit-container {
  padding: 24px;
  background: #f5f5f5;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 200px);
}

/* 表单分组样式 */
.form-section {
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.section-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.section-content {
  padding: 24px;
  width: 100%;
}

/* 表单操作区域 */
.form-actions {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-submit-container {
    padding: 16px;
  }
  
  .section-header {
    padding: 16px;
  }
  
  .section-content {
    padding: 16px;
  }
}

/* 确保表单占满宽度 */
.tab-submit-container :deep(.ant-form) {
  width: 100%;
}

.tab-submit-container :deep(.ant-form-item) {
  width: 100%;
}

.tab-submit-container :deep(.ant-input),
.tab-submit-container :deep(.ant-select),
.tab-submit-container :deep(.ant-input-number),
.tab-submit-container :deep(.ant-picker) {
  width: 100%;
}
</style>