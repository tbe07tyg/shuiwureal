<template>
  <div class="project-create-page">
    <div class="page-header">
      <a-button type="link" @click="goBack">返回</a-button>
      <h1 class="page-title">新建项目</h1>
    </div>

    <div class="create-content">
      <!-- 创建步骤提示 -->
      <a-alert
        message="项目创建流程"
        description="请完整填写项目基本信息，创建成功后将自动进入立项申报流程。"
        type="info"
        show-icon
        style="margin-bottom: 32px;"
      />

      <a-form 
        :model="form" 
        :rules="rules" 
        @finish="handleSubmit"
        ref="formRef"
        layout="horizontal"
        :label-col="{span:4}"
        :wrapper-col="{span:16}"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">项目基本信息</h3>
          
          <a-form-item label="项目名称" name="name">
            <a-input 
              v-model:value="form.name" 
              placeholder="请输入项目名称"
              :maxlength="100"
              show-count
            />
          </a-form-item>
          
          <a-form-item label="项目类型" name="type">
            <a-select v-model:value="form.type" :options="typeOptions" placeholder="请选择项目类型" />
          </a-form-item>
          
          <a-form-item label="项目负责人" name="leader">
            <a-select 
              v-model:value="form.leader" 
              :options="leaderOptions" 
              placeholder="请选择项目负责人"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
          
          <a-form-item label="所属部门" name="dept">
            <a-select v-model:value="form.dept" :options="deptOptions" placeholder="请选择所属部门" />
          </a-form-item>
          
          <a-form-item label="计划开始时间" name="startDate">
            <a-date-picker 
              v-model:value="form.startDate" 
              placeholder="请选择开始时间" 
              style="width: 100%;" 
              :disabled-date="disabledStartDate"
            />
          </a-form-item>
          
          <a-form-item label="计划结束时间" name="endDate">
            <a-date-picker 
              v-model:value="form.endDate" 
              placeholder="请选择结束时间" 
              style="width: 100%;"
              :disabled-date="disabledEndDate"
            />
          </a-form-item>
          
          <a-form-item label="项目简介" name="description">
            <a-textarea 
              v-model:value="form.description" 
              placeholder="请简要描述项目背景、目标、主要内容和预期成果等"
              :rows="5" 
              :maxlength="1000"
              show-count
            />
          </a-form-item>
        </div>

        <!-- 预算信息 -->
        <div class="form-section">
          <h3 class="section-title">预算信息</h3>
          
          <a-form-item label="申请预算" name="budget">
            <a-input-number 
              v-model:value="form.budget" 
              :min="0" 
              :max="999999"
              :precision="2"
              style="width: 300px;" 
              placeholder="请输入申请预算"
              addon-after="万元"
            />
            <div class="form-tip">请根据项目实际需要填写预算金额</div>
          </a-form-item>
          
          <a-form-item label="资金来源" name="fundSource">
            <a-select v-model:value="form.fundSource" :options="fundSourceOptions" placeholder="请选择资金来源" />
          </a-form-item>
          
          <a-form-item label="预算说明" name="budgetDesc">
            <a-textarea 
              v-model:value="form.budgetDesc" 
              placeholder="请简要说明预算构成和用途（可选）"
              :rows="3" 
              :maxlength="500"
              show-count
            />
          </a-form-item>
        </div>

        <!-- 团队信息 -->
        <div class="form-section">
          <h3 class="section-title">团队信息</h3>
          
          <a-form-item label="团队成员" name="members">
            <div class="members-list">
              <div v-for="(member, index) in form.members" :key="index" class="member-item">
                <a-select 
                  v-model:value="member.name" 
                  :options="memberOptions" 
                  placeholder="选择成员"
                  style="width: 200px;"
                  show-search
                  :filter-option="filterOption"
                />
                <a-select 
                  v-model:value="member.role" 
                  :options="roleOptions" 
                  placeholder="选择角色"
                  style="width: 120px; margin-left: 12px;"
                />
                <a-input 
                  v-model:value="member.phone" 
                  placeholder="联系电话"
                  style="width: 150px; margin-left: 12px;"
                />
                <a-button 
                  type="text" 
                  danger 
                  @click="removeMember(index)"
                  :disabled="form.members.length <= 1"
                  style="margin-left: 12px;"
                >
                  删除
                </a-button>
              </div>
              <a-button type="dashed" @click="addMember" style="width: 100%; margin-top: 12px;">
                + 添加团队成员
              </a-button>
            </div>
          </a-form-item>
        </div>

        <!-- 申请材料 -->
        <div class="form-section">
          <h3 class="section-title">申请材料</h3>
          
          <!-- 使用材料模板同步组件 -->
          <MaterialTemplateSync
            ref="materialTemplateSyncRef"
            business-type="apply"
            @files-change="handleFilesChange"
            @validation-change="handleValidationChange"
            @config-update="handleConfigUpdate"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <a-space size="large">
            <a-button @click="handleSaveDraft" :loading="draftLoading">
              保存草稿
            </a-button>
            <a-button type="primary" html-type="submit" :loading="submitLoading">
              创建项目
            </a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import MaterialTemplateSync from '@/components/th_qd/MaterialTemplateSync.vue'

const router = useRouter()
const formRef = ref()
const submitLoading = ref(false)
const draftLoading = ref(false)
const materialTemplateSyncRef = ref()

// 材料模板同步相关状态
const materialValidation = ref({
  allRequiredUploaded: false,
  uploadedCount: 0,
  totalCount: 0
})
const uploadedMaterials = ref([])

/**
 * 表单数据
 */
const form = ref({
  name: '',
  type: '',
  leader: '',
  dept: '',
  startDate: null,
  endDate: null,
  description: '',
  budget: null,
  fundSource: '',
  budgetDesc: '',
  members: [
    { name: '', role: '负责人', phone: '' }
  ]
})

/**
 * 项目类型选项
 */
const typeOptions = [
  { label: '纵向课题', value: '纵向' },
  { label: '横向课题', value: '横向' },
  { label: '自筹项目', value: '自筹' },
  { label: '合作项目', value: '合作' }
]

/**
 * 负责人选项（模拟数据）
 */
const leaderOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '钱七', value: '钱七' }
]

/**
 * 部门选项
 */
const deptOptions = [
  { label: '研发部', value: '研发部' },
  { label: '技术部', value: '技术部' },
  { label: '管理部', value: '管理部' },
  { label: '市场部', value: '市场部' },
  { label: '运营部', value: '运营部' }
]

/**
 * 资金来源选项
 */
const fundSourceOptions = [
  { label: '国家自然科学基金', value: '国家自然科学基金' },
  { label: '省部级科研项目', value: '省部级科研项目' },
  { label: '企业委托', value: '企业委托' },
  { label: '自有资金', value: '自有资金' },
  { label: '其他', value: '其他' }
]

/**
 * 团队成员选项
 */
const memberOptions = computed(() => leaderOptions)

/**
 * 角色选项
 */
const roleOptions = [
  { label: '负责人', value: '负责人' },
  { label: '主要成员', value: '主要成员' },
  { label: '参与成员', value: '参与成员' },
  { label: '顾问', value: '顾问' }
]

/**
 * 表单验证规则
 */
const rules = {
  name: [
    { required: true, message: '请输入项目名称' },
    { min: 5, max: 100, message: '项目名称长度在5-100个字符' }
  ],
  type: [{ required: true, message: '请选择项目类型' }],
  leader: [{ required: true, message: '请选择项目负责人' }],
  dept: [{ required: true, message: '请选择所属部门' }],
  startDate: [{ required: true, message: '请选择计划开始时间' }],
  endDate: [{ required: true, message: '请选择计划结束时间' }],
  description: [
    { required: true, message: '请输入项目简介' },
    { min: 20, max: 1000, message: '项目简介长度在20-1000个字符' }
  ],
  budget: [{ required: true, message: '请输入申请预算' }],
  fundSource: [{ required: true, message: '请选择资金来源' }]
}

/**
 * 禁用开始日期
 */
function disabledStartDate(current) {
  return current && current < dayjs().subtract(1, 'day')
}

/**
 * 禁用结束日期
 */
function disabledEndDate(current) {
  if (!form.value.startDate) return current && current < dayjs()
  return current && current <= form.value.startDate
}

/**
 * 过滤选项
 */
function filterOption(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

/**
 * 添加团队成员
 */
function addMember() {
  form.value.members.push({ name: '', role: '参与成员', phone: '' })
}

/**
 * 删除团队成员
 */
function removeMember(index) {
  if (form.value.members.length > 1) {
    form.value.members.splice(index, 1)
  }
}

/**
 * 保存草稿
 */
function handleSaveDraft() {
  draftLoading.value = true
  
  setTimeout(() => {
    draftLoading.value = false
    message.success('项目草稿已保存')
  }, 1000)
}

// 材料模板同步组件事件处理
function handleFilesChange(event) {
  const { configId, file, action } = event
  
  if (action === 'add') {
    uploadedMaterials.value.push({ configId, file })
  } else if (action === 'remove') {
    const index = uploadedMaterials.value.findIndex(item => item.configId === configId)
    if (index > -1) {
      uploadedMaterials.value.splice(index, 1)
    }
  }
}

function handleValidationChange(validation) {
  materialValidation.value = validation
}

function handleConfigUpdate(configs) {
  console.log('立项申请材料配置已更新:', configs)
}

/**
 * 提交表单
 */
function handleSubmit() {
  // 验证团队成员
  const validMembers = form.value.members.filter(m => m.name && m.role)
  if (validMembers.length === 0) {
    message.error('请至少添加一个团队成员')
    return
  }

  // 验证必传材料是否已上传
  if (!materialValidation.value.allRequiredUploaded) {
    const validation = materialTemplateSyncRef.value?.validateRequiredFiles()
    if (validation && !validation.valid) {
      message.error(`请上传以下必传材料：${validation.missingFiles.join('、')}`)
      return
    }
  }

  submitLoading.value = true
  
  // 获取所有上传的文件
  const allUploadedFiles = materialTemplateSyncRef.value?.getAllUploadedFiles() || []
  
  setTimeout(() => {
    submitLoading.value = false
    
    // 生成项目编号
    const projectCode = `XM${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    
    // 构建提交数据（包含材料信息）
    const submitData = {
      ...form.value,
      projectCode,
      materials: allUploadedFiles.map(item => ({
        configId: item.configId,
        categoryName: item.config.categoryName,
        fileName: item.file.name,
        fileSize: item.file.size,
        isRequired: item.config.isRequired
      }))
    }
    
    console.log('Project submit data:', submitData)
    
    message.success(`项目创建成功！项目编号：${projectCode}`)
    
    // 跳转到项目详情页（立项申报步骤）
    router.push(`/project/detail/${projectCode}`)
  }, 2000)
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.project-create-page {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(35,79,162,0.08);
  padding: 32px;
  margin: 0 auto;
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #234fa2;
}

.create-content {
  max-width: 800px;
}

.form-section {
  margin-bottom: 40px;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  border-left: 4px solid #234fa2;
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #234fa2;
}

.form-tip {
  margin-top: 4px;
  color: #999;
  font-size: 12px;
}

.members-list {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background: #fff;
}

.member-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.member-item:last-child {
  margin-bottom: 0;
}

.form-actions {
  text-align: center;
  padding: 32px 0;
  border-top: 1px solid #f0f0f0;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

:deep(.ant-alert) {
  border-left: 4px solid #1890ff;
}
</style> 