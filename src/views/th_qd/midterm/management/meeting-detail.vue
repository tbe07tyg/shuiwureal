<!--
 * @file 会议详情弹窗组件
 * @description 显示会议的详细信息，包括会议基本信息、参会人员、会议材料等
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <a-modal
    :open="visible"
    title="会议详情"
    :width="800"
    :footer="null"
    :mask-closable="true"
    @cancel="handleCancel"
  >
    <div class="meeting-detail-container" v-loading="loading">
      <!-- 会议基本信息 -->
      <div class="detail-section">
        <div class="section-title">
          <FileTextOutlined />
          会议基本信息
        </div>
        <div class="section-content">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="会议名称">{{ meetingDetailData.meetingName }}</a-descriptions-item>
            <a-descriptions-item label="会议编号">{{ meetingDetailData.meetingNo }}</a-descriptions-item>
            <a-descriptions-item label="会议时间">{{ meetingDetailData.meetingTimeFormatted }}</a-descriptions-item>
            <a-descriptions-item label="会议地点">{{ meetingDetailData.meetingPlace }}</a-descriptions-item>
            <a-descriptions-item label="会议形式">
              <a-tag :color="getMeetingTypeColor(meetingDetailData.meetingType)">
                {{ meetingDetailData.meetingTypeText }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="会议状态">
              <a-tag :color="meetingDetailData.meetingStatusColor">
                {{ meetingDetailData.meetingStatusText }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2">
              {{ meetingDetailData.meetingInstructions || '无' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>

      <!-- 参会人员 -->
      <div class="detail-section">
        <div class="section-title">
          <TeamOutlined />
          参会人员
        </div>
        <div class="section-content">
          <a-tabs v-model:activeKey="activeParticipantTab">
            <a-tab-pane key="hosts" tab="主持人">
              <div class="participant-list">
                <div
                  v-for="host in hosts"
                  :key="host.participantName"
                  class="participant-item"
                >
                  <a-avatar style="background-color: #1890ff">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <div class="participant-info">
                    <div class="participant-name">{{ host.participantName }}</div>
                    <div class="participant-role">主持人</div>
                  </div>
                </div>
                <div v-if="hosts.length === 0" class="empty-participants">
                  暂无主持人信息
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="experts" tab="参会专家">
              <div class="participant-list">
                <div
                  v-for="expert in experts"
                  :key="expert.participantName"
                  class="participant-item"
                >
                  <a-avatar style="background-color: #52c41a">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <div class="participant-info">
                    <div class="participant-name">{{ expert.participantName }}</div>
                    <div class="participant-role">专家</div>
                  </div>
                </div>
                <div v-if="experts.length === 0" class="empty-participants">
                  暂无专家信息
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <!-- 会议材料 -->
      <div class="detail-section">
        <div class="section-title">
          <FileOutlined />
          会议材料
        </div>
        <div class="section-content">
          <div v-if="meetingMaterials && meetingMaterials.length > 0" class="material-list">
            <div
              v-for="(material, index) in meetingMaterials"
              :key="index"
              class="material-item"
            >
              <div class="material-icon">
                <FileOutlined />
              </div>
              <div class="material-info">
                <div class="material-name">{{ material.materialName }}</div>
                <div class="material-meta">
                  <span class="material-size">{{ formatFileSize(material.fileSize) }}</span>
                  <span class="material-type">{{ material.fileSuffix ? material.fileSuffix.toUpperCase() : '未知' }}</span>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(material)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(material)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
          <div v-else class="empty-materials">
            暂无会议材料
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  TeamOutlined,
  FileOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'

// Props 定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  meetingDetailData: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits 定义
const emit = defineEmits(['update:visible', 'cancel', 'preview'])

// 参会人员标签页
const activeParticipantTab = ref('hosts')

// 计算属性：主持人列表
const hosts = computed(() => {
  return props.meetingDetailData.participants?.filter(p => p.participantRole === 0) || []
})

// 计算属性：专家列表
const experts = computed(() => {
  return props.meetingDetailData.participants?.filter(p => p.participantRole === 1) || []
})

// 计算属性：会议材料列表
const meetingMaterials = computed(() => {
  return props.meetingDetailData.midtermMeetingMaterialDOList || []
})

// 获取会议类型颜色
const getMeetingTypeColor = (type) => {
  if (type === 0 || type === 'offline') return 'blue'
  if (type === 1 || type === 'online') return 'green'
  if (type === 2 || type === 'hybrid') return 'orange'
  return 'default'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 预览材料
const previewMaterial = (material) => {
  if (!material.fileUrl) {
    message.warning('暂无文件可预览')
    return
  }
  // 触发预览事件，由父组件处理
  emit('preview', material)
}

// 下载材料
const downloadMaterial = (material) => {
  if (!material.fileUrl) {
    message.warning('暂无文件可下载')
    return
  }

  const link = document.createElement('a')
  link.href = material.fileUrl
  link.download = material.materialName || 'file'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success(`正在下载：${material.materialName}`)
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.meeting-detail-container {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
}

.section-content {
  background-color: #fafafa;
  border-radius: 6px;
  padding: 16px;
}

.participant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: calc(50% - 8px);
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.participant-role {
  font-size: 12px;
  color: #8c8c8c;
}

.empty-participants {
  text-align: center;
  padding: 24px;
  color: #8c8c8c;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.material-icon {
  font-size: 20px;
  color: #1890ff;
}

.material-info {
  flex: 1;
}

.material-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.material-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.empty-materials {
  text-align: center;
  padding: 24px;
  color: #8c8c8c;
}
</style>
