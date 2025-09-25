<template>
  <a-modal
    :open="visible"
    :title="plan ? '编辑调研计划' : '制定调研计划'"
    width="700px"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :confirm-loading="loading"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="绑定需求" name="requirementId" :rules="[{ required: true, message: '请选择要绑定的需求', trigger: 'change' }]">
            <a-select v-model:value="formData.requirementId" placeholder="请选择要绑定的需求">
              <a-select-option v-for="req in requirements" :key="req.id" :value="req.id">{{ req.title || req.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="计划标题" name="title">
            <a-input 
              v-model:value="formData.title" 
              placeholder="请输入调研计划标题"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="计划描述" name="description">
            <a-textarea 
              v-model:value="formData.description" 
              placeholder="请描述调研计划的目标和内容"
              :rows="3"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="计划日期" name="planDate">
            <a-date-picker 
              v-model:value="formData.planDate" 
              style="width: 100%"
              placeholder="选择计划开始日期"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="预期工期（天）" name="expectedDuration">
            <a-input-number 
              v-model:value="formData.expectedDuration"
              :min="1"
              :max="90"
              style="width: 100%"
              placeholder="请输入预期工期"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="负责人" name="leader">
            <a-input 
              v-model:value="formData.leader" 
              placeholder="请输入负责人姓名"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="参与人员" name="participants">
            <a-select
              v-model:value="formData.participants"
              mode="tags"
              placeholder="请输入参与人员，按回车添加"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="调研地点" name="locations">
            <a-select
              v-model:value="formData.locations"
              mode="tags"
              placeholder="请输入调研地点，按回车添加"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="调研目标" name="objectives">
            <a-select
              v-model:value="formData.objectives"
              mode="tags"
              placeholder="请输入调研目标，按回车添加"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  requirement: {
    type: Object,
    default: null
  },
  plan: {
    type: Object,
    default: null
  },
  requirements: {
    type: Array,
    default: () => []
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['update:visible', 'save'])

/**
 * 响应式数据
 */
const formRef = ref()
const loading = ref(false)

/**
 * 表单数据
 */
const formData = reactive({
  title: '',
  description: '',
  planDate: null,
  expectedDuration: 3,
  leader: '',
  participants: [],
  locations: [],
  objectives: [],
  requirementId: ''
})

/**
 * 表单验证规则
 */
const formRules = {
  title: [
    { required: true, message: '请输入计划标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入计划描述', trigger: 'blur' }
  ],
  planDate: [
    { required: true, message: '请选择计划日期', trigger: 'change' }
  ],
  expectedDuration: [
    { required: true, message: '请输入预期工期', trigger: 'blur' }
  ],
  leader: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
  ]
}

/**
 * 监听计划数据变化，填充表单
 */
watch(() => props.plan, (newPlan) => {
  if (newPlan) {
    Object.assign(formData, {
      ...newPlan,
      planDate: newPlan.planDate ? new Date(newPlan.planDate) : null
    })
  } else {
    resetForm()
  }
}, { immediate: true })

/**
 * 监听需求数据变化
 */
watch(() => props.requirement, (newRequirement) => {
  if (newRequirement && !props.plan) {
    formData.requirementId = newRequirement.id
    // 如果有关联需求，可以自动填充一些信息
    if (!formData.title) {
      formData.title = `${newRequirement.title} - 调研计划`
    }
  }
}, { immediate: true })

/**
 * 重置表单
 */
function resetForm() {
  Object.assign(formData, {
    title: '',
    description: '',
    planDate: null,
    expectedDuration: 3,
    leader: '',
    participants: [],
    locations: [],
    objectives: [],
    requirementId: props.requirement?.id || ''
  })
  formRef.value?.resetFields()
}

/**
 * 处理提交
 */
async function handleSubmit() {
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 准备提交数据
    const submitData = {
      ...formData,
      planDate: formData.planDate ? formData.planDate.toISOString().split('T')[0] : null
    }
    
    // 模拟异步提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('save', submitData)
    emit('update:visible', false)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理取消
 */
function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #234fa2;
}
</style> 