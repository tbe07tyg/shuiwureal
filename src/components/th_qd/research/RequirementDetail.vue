<template>
  <div class="requirement-detail">
    <!-- 基本信息 -->
    <div class="detail-section">
      <h3 class="section-title">
        <FileTextOutlined />
        基本信息
      </h3>
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item label="需求标题" :span="2">
          {{ requirement.title }}
        </a-descriptions-item>
        <a-descriptions-item label="需求分类">
          <a-tag>{{ requirement.category }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="优先级">
          <a-tag :color="getPriorityColor(requirement.priority)">
            {{ requirement.priority }}优先级
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="当前状态">
          <a-tag :color="getStatusColor(requirement.status)">
            {{ requirement.status }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="提出人">
          {{ requirement.proposer }}
        </a-descriptions-item>
        <a-descriptions-item label="提出部门">
          {{ requirement.proposerDept }}
        </a-descriptions-item>
        <a-descriptions-item label="提出时间" :span="2">
          {{ requirement.createdAt }}
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- 需求描述 -->
    <div class="detail-section">
      <h3 class="section-title">
        <EditOutlined />
        需求描述
      </h3>
      <div class="description-content">
        {{ requirement.description }}
      </div>
    </div>

    <!-- 预期达到效果 -->
    <div class="detail-section" v-if="requirement.expectedEffect">
      <h3 class="section-title">
        <BulbOutlined />
        预期达到效果
      </h3>
      <div class="expected-effect">
        {{ requirement.expectedEffect }}
      </div>
    </div>

    <!-- 相关附件 -->
    <div class="detail-section">
      <h3 class="section-title">
        <PaperClipOutlined />
        相关附件
      </h3>

      <div v-if="!attachments || !attachments.length" class="empty-attachments">
        暂无附件
      </div>
      <div v-else class="attachments-list">
        <div 
          v-for="(file, index) in attachments" 
          :key="index"
          class="attachment-item"
        >
          <FileOutlined />
          <span class="file-name">{{ file.name || file.fileName }}</span>
          <a-button type="link" size="small" @click="previewFileHandler(file)">预览</a-button>
          <a-button type="link" size="small" @click="downloadFile(file)">下载</a-button>
        </div>
      </div>
    </div>

    <!-- 操作历史 -->
    <div class="detail-section" v-if="requirement.comments && requirement.comments.length">
      <h3 class="section-title">
        <HistoryOutlined />
        操作历史
      </h3>
      <a-timeline>
        <a-timeline-item 
          v-for="(comment, index) in requirement.comments" 
          :key="index"
          :color="getTimelineColor(comment.type)"
        >
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-user">{{ comment.user }}</span>
              <span class="timeline-time">{{ comment.time }}</span>
            </div>
            <div class="timeline-action">{{ comment.action }}</div>
            <div class="timeline-comment" v-if="comment.comment">
              {{ comment.comment }}
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>

    <!-- 操作按钮 -->
    <div class="detail-actions">
      <a-space>
        <a-button type="primary" @click="$emit('edit', requirement)">
          <EditOutlined />
          编辑需求
        </a-button>
        <a-button type="primary" ghost @click="$emit('start-research', requirement)">
          <SearchOutlined />
          开始调研
        </a-button>
        <a-button @click="handleExport">
          <DownloadOutlined />
          导出详情
        </a-button>
      </a-space>
    </div>
    
    <!-- 文件预览组件 -->
    <FilePreview 
      v-model:visible="previewVisible" 
      :file-info="previewFile" 
      @close="closePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  EditOutlined,
  BulbOutlined,
  PaperClipOutlined,
  HistoryOutlined,
  FileOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { getTechnologicalRequirementPoolAttachmentPage } from '@/api/th_qd/requirement'
import { ref, watch, onMounted } from 'vue'
import FilePreview from '@/components/th_qd/FilePreview.vue'//文件预览
/**
 * 组件属性定义
 */
const props = defineProps({
  requirement: {
    type: Object,
    required: true
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['edit', 'start-research'])

/**
 * 附件列表
 */
const attachments = ref([])

/**
 * 文件预览相关状态
 */
const previewVisible = ref(false)
const previewFile = ref(null)



/**
 * 获取附件列表
 */
async function fetchAttachments() {
  try {
    if (!props.requirement || !props.requirement.id) return
    
    // 获取附件列表
    const res = await getTechnologicalRequirementPoolAttachmentPage({
      requirementId: props.requirement.id
    })
    // 处理API响应
    
    // 检查res对象的结构并获取附件列表
    
    // 情况1: res直接包含list
    if (res.list && Array.isArray(res.list)) {
      // 使用 res.list
      attachments.value = res.list
    }
    // 情况2: res直接包含records
    else if (res.records && Array.isArray(res.records)) {
      // 使用 res.records
      attachments.value = res.records
    }
    // 情况3: res直接是数组
    else if (Array.isArray(res)) {
      // 使用 res作为数组
      attachments.value = res
    }
    // 情况4: res.data存在
    else if (res.data) {
      // 检查res.data的结构
      
      // 情况4.1: res.data.list存在
      if (res.data.list && Array.isArray(res.data.list)) {
        // 使用 res.data.list
        attachments.value = res.data.list
      }
      // 情况4.2: res.data.records存在
      else if (res.data.records && Array.isArray(res.data.records)) {
        // 使用 res.data.records
        attachments.value = res.data.records
      }
      // 情况4.3: res.data是数组
      else if (Array.isArray(res.data)) {
        // 使用 res.data作为数组
        attachments.value = res.data
      }
      // 情况4.4: 没有找到有效数据
      else {
        // res.data中没有找到有效数据，使用空数组
        attachments.value = []
      }
    }
    // 情况5: 没有找到有效数据
    else {
      // res中没有找到有效数据，使用空数组
      attachments.value = []
    }
    
    // 附件列表获取完成
  } catch (error) {
    console.error('获取附件列表失败:', error)
  }
}

/**
 * 获取优先级颜色
 */
function getPriorityColor(priority) {
  const colors = { '高': 'red', '中': 'orange', '低': 'blue' }
  return colors[priority] || 'default'
}

/**
 * 获取状态颜色
 */
function getStatusColor(status) {
  const colors = {
    '待分析': 'default',
    '进行中': 'processing',
    '已完成': 'success',
    '已暂停': 'warning'
  }
  return colors[status] || 'default'
}



/**
 * 下载文件
 */
function downloadFile(file) {
  // 创建一个隐藏的a标签来实现下载
  const link = document.createElement('a')
  link.href = file.url || file.fileUrl
  link.download = file.name || file.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 预览文件
 */
function previewFileHandler(file) {
  // 确保文件对象包含所有必要信息
  const fileData = {
    name: file.name || file.fileName,
    url: file.url || file.fileUrl,
    type: file.type || file.fileType,
    size: file.size || file.fileSize
  }
  console.log('预览文件:', fileData)
  previewFile.value = fileData
  previewVisible.value = true
}

/**
 * 关闭预览
 */
function closePreview() {
  previewVisible.value = false
  previewFile.value = null
}

/**
 * 监听需求变化，获取附件列表
 */
watch(() => props.requirement, (newVal) => {
  if (newVal) {
    fetchAttachments()
  }
}, { immediate: true, deep: true })



/**
 * 组件挂载时获取附件列表
 */
onMounted(() => {
  fetchAttachments()
})

/**
 * 获取时间线颜色
 */
function getTimelineColor(type) {
  const colors = {
    'create': 'blue',
    'edit': 'orange', 
    'status': 'green',
    'comment': 'gray'
  }
  return colors[type] || 'blue'
}

/**
 * 导出需求详情
 */
function handleExport() {
  message.success('需求详情导出功能开发中...')
}
</script>

<style scoped>
.requirement-detail {
  padding: 0;
}

.detail-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #234fa2;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.description-content {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #234fa2;
  line-height: 1.6;
  color: #64748b;
}

.expected-effect {
  background: #e6f4ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
  line-height: 1.6;
  color: #0c4a6e;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.file-name {
  flex: 1;
  color: #234fa2;
  font-size: 14px;
}

.empty-attachments {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
  background-color: #fafafa;
  border-radius: 4px;
}

.timeline-content {
  margin-bottom: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.timeline-user {
  font-weight: 500;
  color: #234fa2;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

.timeline-action {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.timeline-comment {
  font-size: 12px;
  color: #8c8c8c;
  background: #f8fafc;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #e2e8f0;
}

.detail-actions {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
  text-align: center;
}

.budget-text {
  color: #52c41a;
  font-weight: 500;
}

.no-data {
  color: #8c8c8c;
  font-style: italic;
}

/**
 * 描述列表样式优化
 */
:deep(.ant-descriptions-item-label) {
  background: #f8fafc;
  color: #234fa2;
  font-weight: 500;
}

:deep(.ant-descriptions-item-content) {
  background: #fff;
}

/**
 * 时间线样式优化
 */
:deep(.ant-timeline-item-content) {
  margin-left: 24px;
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {

  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .attachment-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style> 