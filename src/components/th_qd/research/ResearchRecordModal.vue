<template>
  <a-modal
    :open="visible"
    :title="record ? '编辑调研记录' : '添加调研记录'"
    width="600px"
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
        <a-col :span="12">
          <a-form-item label="调研日期" name="date">
            <a-date-picker 
              v-model:value="formData.date" 
              style="width: 100%"
              placeholder="选择调研日期"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="调研地点" name="location">
            <a-input 
              v-model:value="formData.location" 
              placeholder="请输入调研地点"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="记录人" name="recorder">
            <a-input 
              v-model:value="formData.recorder" 
              placeholder="请输入记录人姓名"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="调研内容" name="content">
            <a-textarea 
              v-model:value="formData.content" 
              placeholder="请详细描述调研过程和内容"
              :rows="4"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="主要发现" name="findings">
            <a-select
              v-model:value="formData.findings"
              mode="tags"
              placeholder="请输入主要发现，按回车添加"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="调研照片">
            <a-upload
              v-model:file-list="formData.photos"
              :before-upload="beforeUpload"
              list-type="picture-card"
              :multiple="true"
            >
              <div>
                <PlusOutlined />
                <div style="margin-top: 8px">上传照片</div>
              </div>
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    default: null
  },
  record: {
    type: Object,
    default: null
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
  date: null,
  location: '',
  recorder: '',
  content: '',
  findings: [],
  photos: []
})

/**
 * 表单验证规则
 */
const formRules = {
  date: [
    { required: true, message: '请选择调研日期', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入调研地点', trigger: 'blur' }
  ],
  recorder: [
    { required: true, message: '请输入记录人', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入调研内容', trigger: 'blur' }
  ]
}

/**
 * 监听记录数据变化，填充表单
 */
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(formData, {
      ...newRecord,
      date: newRecord.date ? new Date(newRecord.date) : null
    })
  } else {
    resetForm()
  }
}, { immediate: true })

/**
 * 重置表单
 */
function resetForm() {
  Object.assign(formData, {
    date: new Date(),
    location: '',
    recorder: '当前用户',
    content: '',
    findings: [],
    photos: []
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
      date: formData.date ? formData.date.toISOString().split('T')[0] : null
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

/**
 * 文件上传前处理
 */
function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片格式的文件!')
    return false
  }
  
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过5MB!')
    return false
  }
  
  return false // 阻止自动上传
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

:deep(.ant-upload-select-picture-card) {
  width: 104px;
  height: 104px;
}
</style> 