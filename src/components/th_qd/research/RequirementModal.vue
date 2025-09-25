<template>
  <a-modal
    :open="visible"
    :title="requirement ? '编辑需求' : '新增需求'"
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
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
    >
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="需求标题" name="title" required>
            <a-input 
              v-model:value="formData.title" 
              placeholder="请输入需求标题"
              :max-length="100"
              show-count
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="需求分类" name="category" required>
            <a-select v-model:value="formData.category" placeholder="请选择分类">
              <a-select-option value="技术创新">技术创新</a-select-option>
              <a-select-option value="工艺改进">工艺改进</a-select-option>
              <a-select-option value="设备更新">设备更新</a-select-option>
              <a-select-option value="质量提升">质量提升</a-select-option>
              <a-select-option value="成本控制">成本控制</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <a-col :span="8">
          <a-form-item label="优先级" name="priority" required>
            <a-select v-model:value="formData.priority" placeholder="请选择优先级">
              <a-select-option value="高">高优先级</a-select-option>
              <a-select-option value="中">中优先级</a-select-option>
              <a-select-option value="低">低优先级</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <a-col :span="8">
          <a-form-item label="提出部门" name="proposerDept" required>
            <a-select v-model:value="formData.proposerDept" placeholder="请选择部门">
              <a-select-option value="技术部">技术部</a-select-option>
              <a-select-option value="工艺部">工艺部</a-select-option>
              <a-select-option value="运维部">运维部</a-select-option>
              <a-select-option value="质量部">质量部</a-select-option>
              <a-select-option value="财务部">财务部</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="需求描述" name="description" required>
            <a-textarea 
              v-model:value="formData.description" 
              placeholder="请详细描述需求内容、背景和预期目标"
              :rows="4"
              :max-length="500"
              show-count
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="预期达到效果" name="expectedEffect">
            <a-textarea 
              v-model:value="formData.expectedEffect" 
              placeholder="请描述预期达到的效果和收益"
              :rows="3"
              :max-length="300"
              show-count
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <!-- 附件上传区域 -->
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="相关附件">
            <a-upload
              :file-list="fileList"
              :before-upload="beforeUpload"
              :remove="handleRemove"
              multiple
              :customRequest="customRequest"
              :showUploadList="{ showPreviewIcon: true, showRemoveIcon: true }"
              list-type="text"
              @change="handleUploadChange"
            >
              <a-button>
                <UploadOutlined />
                选择文件
              </a-button>
              <span style="margin-left: 8px; color: #999; font-size: 12px;">
                支持PDF、Word、Excel、图片格式，单文件最大10MB
              </span>
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'

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
  category: '',
  priority: '',
  proposer: '当前用户', // 从用户信息获取
  proposerDept: '',
  expectedEffect: '',
  attachments: []
})

// 计算属性，确保文件列表正确传递给a-upload组件
const fileList = computed(() => {
  return formData.attachments || []
})

/**
 * 表单验证规则
 */
const formRules = {
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在5-100个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入需求描述', trigger: 'blur' },
    { min: 20, max: 500, message: '描述长度在20-500个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择需求分类', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  proposerDept: [
    { required: true, message: '请选择提出部门', trigger: 'change' }
  ]
}

/**
 * 监听需求数据变化，填充表单
 */
watch(() => props.requirement, (newRequirement) => {
  if (newRequirement) {
    console.log('监听到需求变化，新需求数据:', newRequirement)
    console.log('新需求的附件数据:', newRequirement.attachments)
    
    Object.assign(formData, {
      title: newRequirement.title || '',
      description: newRequirement.description || '',
      category: newRequirement.category || '',
      priority: newRequirement.priority || '',
      proposer: newRequirement.proposer || '当前用户',
      proposerDept: newRequirement.proposerDept || '',
      expectedEffect: newRequirement.expectedEffect || newRequirement.businessValue || '',
      attachments: newRequirement.attachments || []
    })
    
    // 强制更新fileList
    console.log('更新后的formData.attachments:', formData.attachments)
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

/**
 * 重置表单
 */
function resetForm() {
  Object.assign(formData, {
    title: '',
    description: '',
    category: '',
    priority: '',
    proposer: '当前用户',
    proposerDept: '',
    expectedEffect: '',
    attachments: []
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
      ...formData
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
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ].includes(file.type)
  
  if (!isValidType) {
    message.error('只能上传PDF、Word、Excel、图片格式的文件!')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过10MB!')
    return false
  }
  
  return false // 阻止自动上传
}

/**
 * 自定义上传请求处理函数
 */
function customRequest(options) {
  // 对于已上传的文件(status为done)，不需要执行任何操作
  const { file, onSuccess } = options
  if (file.status === 'done') {
    onSuccess()
  }
}

/**
 * 处理文件上传变化
 */
function handleUploadChange({ fileList }) {
  // 当文件列表变化时，更新formData.attachments
  formData.attachments = fileList
}

/**
 * 移除文件
 */
function handleRemove(file) {
  // 直接修改formData.attachments而不是计算属性fileList
  const index = formData.attachments.indexOf(file)
  if (index !== -1) {
    const newFileList = [...formData.attachments]
    newFileList.splice(index, 1)
    formData.attachments = newFileList
  }
}
</script>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}

:deep(.ant-select-selector) {
  border-radius: 6px;
}

:deep(.ant-input) {
  border-radius: 6px;
}

:deep(.ant-input-number) {
  border-radius: 6px;
}

:deep(.ant-upload-list-item) {
  border-radius: 6px;
}

/**
 * 表单样式优化
 */
:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #234fa2;
}

/**
 * 必填字段标识样式
 */
:deep(.ant-form-item-required .ant-form-item-label > label::before) {
  content: '*';
  display: inline-block;
  margin-right: 4px;
  color: #ff4d4f;
  font-size: 14px;
  font-family: SimSun, sans-serif;
  line-height: 1;
}

:deep(.ant-form-item-explain-error) {
  font-size: 12px;
}

/**
 * 上传组件样式
 */
:deep(.ant-upload) {
  width: 100%;
}

:deep(.ant-upload-btn) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 