<template>
  <div class="apply-step">
    <!-- 步骤说明 -->
    <a-alert
      :message="isNewProject ? '新建项目申报' : '立项申报'"
      :description="isNewProject ? '请填写项目基本信息并上传相关申报材料，完成后提交审核。' : '项目基本信息已确定，请上传申报材料并提交审核。'"
      type="info"
      show-icon
      style="margin-bottom: 24px;"
    />

    <!-- 已有项目：显示只读的项目信息 -->
    <div v-if="!isNewProject" class="project-info-readonly">
      <h4 class="section-title">项目基本信息</h4>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="项目名称">{{ project.name }}</a-descriptions-item>
        <a-descriptions-item label="项目类型">{{ project.type }}</a-descriptions-item>
        <a-descriptions-item label="项目负责人">{{ project.leader }}</a-descriptions-item>
        <a-descriptions-item label="所属部门">{{ project.dept }}</a-descriptions-item>
        <a-descriptions-item label="计划开始时间">{{ project.start }}</a-descriptions-item>
        <a-descriptions-item label="计划结束时间">{{ project.end }}</a-descriptions-item>
        <a-descriptions-item label="申请预算">{{ project.fund?.total || '-' }}万元</a-descriptions-item>
        <a-descriptions-item label="项目状态">{{ project.status }}</a-descriptions-item>
        <a-descriptions-item label="项目简介" :span="2">{{ project.desc }}</a-descriptions-item>
      </a-descriptions>
      
      <div style="text-align: right; margin-top: 12px;">
        <a-button type="link" @click="toggleEditMode" v-if="canEdit">
          编辑项目信息
        </a-button>
      </div>
    </div>

    <!-- 新建项目或编辑模式：显示表单 -->
    <a-form 
      v-if="isNewProject || editMode"
      :model="form" 
      :rules="rules" 
      @finish="handleSubmit"
      ref="formRef"
      layout="horizontal"
    >
      <!-- 项目基本信息 -->
      <div class="form-section">
        <h4 class="section-title">项目基本信息</h4>
        
        <div class="form-row">
          <a-form-item label="项目名称" name="name" class="form-item-full">
            <a-input v-model:value="form.name" placeholder="请输入项目名称" />
          </a-form-item>
        </div>
        
        <div class="form-row">
          <a-form-item label="项目类型" name="type" class="form-item-half">
            <a-select v-model:value="form.type" :options="typeOptions" placeholder="请选择项目类型" />
          </a-form-item>
          
          <a-form-item label="项目负责人" name="leader" class="form-item-half">
            <a-input v-model:value="form.leader" placeholder="请输入负责人姓名" />
          </a-form-item>
        </div>
        
        <div class="form-row">
          <a-form-item label="所属部门" name="dept" class="form-item-half">
            <a-input v-model:value="form.dept" placeholder="请输入所属部门" />
          </a-form-item>
          
          <a-form-item label="申请预算" name="budget" class="form-item-half">
            <a-input-number 
              v-model:value="form.budget" 
              :min="0" 
              :precision="2"
              style="width: 100%;" 
              placeholder="请输入申请预算（万元）"
              addon-after="万元"
            />
          </a-form-item>
        </div>
        
        <div class="form-row">
          <a-form-item label="计划开始时间" name="startDate" class="form-item-half">
            <a-date-picker 
              v-model:value="form.startDate" 
              placeholder="请选择开始时间" 
              style="width: 100%;" 
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          
          <a-form-item label="计划结束时间" name="endDate" class="form-item-half">
            <a-date-picker 
              v-model:value="form.endDate" 
              placeholder="请选择结束时间" 
              style="width: 100%;"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
        </div>
        
        <div class="form-row">
          <a-form-item label="项目简介" name="description" class="form-item-full">
            <a-textarea 
              v-model:value="form.description" 
              placeholder="请简要描述项目内容、目标、预期成果等"
              :rows="4" 
              :maxlength="500"
              show-count
            />
          </a-form-item>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions" v-if="editMode">
        <a-space>
          <a-button @click="cancelEdit">取消</a-button>
          <a-button type="primary" @click="saveBasicInfo" :loading="saveLoading">
            保存项目信息
          </a-button>
        </a-space>
      </div>
    </a-form>

    <!-- 材料上传区（所有场景都显示） -->
    <div class="form-section">
      <h4 class="section-title">申报材料上传</h4>
      
      <!-- 模板下载 -->
      <div class="template-download">
        <a-space>
          <span>模板下载：</span>
          <a @click="downloadTemplate('申报书')">项目申报书模板.docx</a>
          <a @click="downloadTemplate('预算')">预算表模板.xlsx</a>
          <a @click="downloadTemplate('PPT')">汇报PPT模板.pptx</a>
        </a-space>
      </div>
      
      <a-form-item label="申报材料" name="files" class="upload-form-item">
        <a-upload
          :file-list="fileList"
          :before-upload="beforeUpload"
          @change="handleUploadChange"
          @remove="handleRemove"
          multiple
          list-type="text"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        >
          <a-button type="primary" ghost>
            <UploadOutlined />
            上传文件
          </a-button>
        </a-upload>
        <div class="upload-tips">
          <p>• 支持格式：PDF、Word、Excel、PPT</p>
          <p>• 单个文件大小不超过10MB</p>
          <p>• 必须包含：项目申报书、预算表</p>
        </div>
      </a-form-item>
    </div>

    <!-- 提交操作 -->
    <div class="form-actions">
      <a-space>
        <a-button @click="handleSaveDraft" :loading="draftLoading">
          保存草稿
        </a-button>
        <a-button type="primary" @click="handleMaterialSubmit" :loading="submitLoading">
          提交审核
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({ 
  project: Object 
})

const emit = defineEmits(['submit'])

const formRef = ref()
const submitLoading = ref(false)
const draftLoading = ref(false)
const saveLoading = ref(false)
const editMode = ref(false)

/**
 * 判断是否为新建项目
 * 如果项目有完整的基本信息，则认为是已有项目
 */
const isNewProject = computed(() => {
  return !props.project?.name || !props.project?.leader || !props.project?.dept
})

/**
 * 是否可以编辑项目信息
 */
const canEdit = computed(() => {
  // 只有在立项阶段的前几个步骤才允许编辑基本信息
  return true // 这里可以根据项目状态和权限来控制
})

/**
 * 表单数据
 */
const form = ref({
  name: props.project?.name || '',
  type: props.project?.type || '',
  leader: props.project?.leader || '',
  dept: props.project?.dept || '',
  startDate: props.project?.start ? dayjs(props.project.start) : null,
  endDate: props.project?.end ? dayjs(props.project.end) : null,
  budget: props.project?.fund?.total || null,
  description: props.project?.desc || ''
})

/**
 * 项目类型选项
 */
const typeOptions = [
  { label: '纵向课题', value: '纵向' },
  { label: '横向课题', value: '横向' },
  { label: '自筹项目', value: '自筹' }
]

/**
 * 文件列表
 */
const fileList = ref([])

/**
 * 表单验证规则
 */
const rules = {
  name: [{ required: true, message: '请输入项目名称' }],
  type: [{ required: true, message: '请选择项目类型' }],
  leader: [{ required: true, message: '请输入项目负责人' }],
  dept: [{ required: true, message: '请输入所属部门' }],
  startDate: [{ required: true, message: '请选择计划开始时间' }],
  endDate: [{ required: true, message: '请选择计划结束时间' }],
  budget: [{ required: true, message: '请输入申请预算' }],
  description: [{ required: true, message: '请输入项目简介' }]
}

/**
 * 切换编辑模式
 */
function toggleEditMode() {
  editMode.value = true
  // 确保表单数据已正确设置
  form.value = {
    name: props.project?.name || '',
    type: props.project?.type || '',
    leader: props.project?.leader || '',
    dept: props.project?.dept || '',
    startDate: props.project?.start ? dayjs(props.project.start) : null,
    endDate: props.project?.end ? dayjs(props.project.end) : null,
    budget: props.project?.fund?.total || null,
    description: props.project?.desc || ''
  }
}

/**
 * 取消编辑
 */
function cancelEdit() {
  editMode.value = false
  // 重置表单数据
  form.value = {
    name: props.project?.name || '',
    type: props.project?.type || '',
    leader: props.project?.leader || '',
    dept: props.project?.dept || '',
    startDate: props.project?.start ? dayjs(props.project.start) : null,
    endDate: props.project?.end ? dayjs(props.project.end) : null,
    budget: props.project?.fund?.total || null,
    description: props.project?.desc || ''
  }
}

/**
 * 保存项目基本信息
 */
function saveBasicInfo() {
  formRef.value?.validateFields().then(() => {
    saveLoading.value = true
    
    setTimeout(() => {
      saveLoading.value = false
      editMode.value = false
      message.success('项目信息已更新')
    }, 1000)
  })
}

/**
 * 上传前验证
 */
function beforeUpload(file) {
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ].includes(file.type)
  
  if (!isValidType) {
    message.error('只支持上传 PDF、Word、Excel、PPT 格式的文件!')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB!')
    return false
  }
  
  return false // 阻止自动上传
}

/**
 * 文件上传变化处理
 */
function handleUploadChange({ file, fileList: fl }) {
  fileList.value = fl
}

/**
 * 文件删除处理
 */
function handleRemove(file) {
  fileList.value = fileList.value.filter(f => f.uid !== file.uid)
}

/**
 * 模板下载
 */
function downloadTemplate(type) {
  message.info(`正在下载${type}模板...`)
  // 这里实现模板下载逻辑
}

/**
 * 保存草稿
 */
function handleSaveDraft() {
  draftLoading.value = true
  
  setTimeout(() => {
    draftLoading.value = false
    message.success('草稿已保存')
  }, 1000)
}

/**
 * 提交申报材料（核心操作）
 */
function handleMaterialSubmit() {
  // 验证是否上传了必要文件
  if (fileList.value.length === 0) {
    message.error('请至少上传一个申报文件')
    return
  }
  
  submitLoading.value = true
  
  setTimeout(() => {
    submitLoading.value = false
    message.success('申报材料提交成功，已转入审核流程')
    
    // 通知父组件提交完成
    emit('submit', {
      formData: form.value,
      files: fileList.value,
      action: 'submit_materials'
    })
  }, 1500)
}

/**
 * 新建项目提交（包含基本信息+材料）
 */
function handleSubmit() {
  if (isNewProject.value) {
    handleMaterialSubmit()
  }
}

/**
 * 监听项目数据变化，同步表单
 */
watch(() => props.project, (val) => {
  if (val) {
    form.value = {
      name: val.name || '',
      type: val.type || '',
      leader: val.leader || '',
      dept: val.dept || '',
      startDate: val.start ? dayjs(val.start) : null,
      endDate: val.end ? dayjs(val.end) : null,
      budget: val.fund?.total || null,
      description: val.desc || ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
.apply-step {
  width: 100%;
  max-width: none;
}

.project-info-readonly {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.form-item-full {
  flex: 1;
}

.form-item-half {
  flex: 1;
  min-width: 0;
}

.form-item-full :deep(.ant-form-item-label),
.form-item-half :deep(.ant-form-item-label) {
  width: 110px !important;
  min-width: 110px;
  text-align: right;
  padding-right: 8px;
  white-space: nowrap;
}

.form-item-full :deep(.ant-form-item-control),
.form-item-half :deep(.ant-form-item-control) {
  flex: 1;
  max-width: none;
  margin-left: 0;
}

.form-item-full :deep(.ant-form-item),
.form-item-half :deep(.ant-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
}

.form-item-full :deep(.ant-form-item-control-input),
.form-item-half :deep(.ant-form-item-control-input) {
  min-height: auto;
}

.section-title {
  margin: 0 0 16px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #234fa2;
  padding-bottom: 8px;
}

.template-download {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f8ff;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.template-download a {
  color: #1890ff;
  margin-right: 16px;
}

.template-download a:hover {
  text-decoration: underline;
}

.upload-tips {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.upload-tips p {
  margin: 2px 0;
}

.form-actions {
  text-align: center;
  padding: 24px 0;
  border-top: 1px solid #f0f0f0;
}

.upload-form-item :deep(.ant-form-item-label) {
  width: 110px !important;
  min-width: 110px;
  text-align: right;
  padding-right: 8px;
  white-space: nowrap;
}

.upload-form-item :deep(.ant-form-item-control) {
  flex: 1;
  max-width: none;
  margin-left: 0;
}

.upload-form-item :deep(.ant-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
}
</style> 