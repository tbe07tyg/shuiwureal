<!--
 * @file 会议管理标签页组件
 * @description 适配嵌入到标签页中的会议管理功能
-->
<template>
  <div class="tab-meeting-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">
        <h3>立项会议管理</h3>
        <a-badge :count="meetings.length" :number-style="{ backgroundColor: '#52c41a' }">
          <CalendarOutlined style="color: #1890ff;" />
        </a-badge>
      </div>
      <div class="toolbar-actions">
        <a-space>
          <a-select
            v-model:value="selectedStatus"
            placeholder="全部状态"
            style="width: 150px"
            @change="handleStatusFilter"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="planning">会议筹备</a-select-option>
            <a-select-option value="scheduled">已安排</a-select-option>
            <a-select-option value="ongoing">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleCreateMeeting">
            <PlusOutlined />
            安排会议
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 会议列表 -->
    <div class="meeting-list">
      <a-row :gutter="[16, 16]">
        <a-col 
          v-for="meeting in filteredMeetings" 
          :key="meeting.id"
          :xs="24" :sm="12" :lg="8" :xl="6"
        >
          <a-card class="meeting-card" :class="getMeetingCardClass(meeting.status)">
            <template #extra>
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleMeetingAction(key, meeting)">
                    <a-menu-item key="edit" v-if="meeting.status === 'planning'">
                      编辑会议
                    </a-menu-item>
                    <a-menu-item key="start" v-if="meeting.status === 'scheduled'">
                      开始会议
                    </a-menu-item>
                    <a-menu-item key="finish" v-if="meeting.status === 'ongoing'">
                      结束会议
                    </a-menu-item>
                    <a-menu-item key="cancel" v-if="['planning', 'scheduled'].includes(meeting.status)">
                      取消会议
                    </a-menu-item>
                    <a-menu-item key="reschedule" v-if="meeting.status === 'cancelled'">
                      重新安排
                    </a-menu-item>
                    <a-menu-item key="summary" v-if="meeting.status === 'completed'">
                      查看纪要
                    </a-menu-item>
                  </a-menu>
                </template>
                <MoreOutlined style="cursor: pointer;" />
              </a-dropdown>
            </template>

            <div class="meeting-header">
              <h4 class="meeting-title">{{ meeting.title }}</h4>
              <a-tag :color="getStatusColor(meeting.status)" size="small">
                {{ getStatusText(meeting.status) }}
              </a-tag>
            </div>

            <div class="meeting-info">
              <div class="info-item">
                <ClockCircleOutlined />
                <span>{{ meeting.date }} {{ meeting.time }}</span>
              </div>
              <div class="info-item">
                <EnvironmentOutlined />
                <span>{{ meeting.location }}</span>
              </div>
              <div class="info-item">
                <TeamOutlined />
                <span>{{ meeting.participants }}人参与</span>
              </div>
            </div>

            <div class="meeting-projects">
              <h5>讨论项目 ({{ meeting.projects.length }})</h5>
              <div class="project-list">
                <a-tag 
                  v-for="project in meeting.projects.slice(0, 2)" 
                  :key="project.id"
                  size="small"
                  color="blue"
                >
                  {{ project.name }}
                </a-tag>
                <a-tag v-if="meeting.projects.length > 2" size="small" color="default">
                  +{{ meeting.projects.length - 2 }}
                </a-tag>
              </div>
            </div>

            <div class="meeting-actions">
              <a-button 
                v-if="meeting.status === 'scheduled'" 
                type="primary" 
                size="small" 
                @click="handleJoinMeeting(meeting)"
                block
              >
                <VideoCameraOutlined />
                加入会议
              </a-button>
              <a-button 
                v-else-if="meeting.status === 'completed'" 
                type="default" 
                size="small" 
                @click="handleViewSummary(meeting)"
                block
              >
                <FileTextOutlined />
                查看纪要
              </a-button>
              <a-button 
                v-else-if="meeting.status === 'planning'" 
                type="dashed" 
                size="small" 
                @click="handleEditMeeting(meeting)"
                block
              >
                <EditOutlined />
                继续编辑
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 创建/编辑会议模态框 -->
    <a-modal
      v-model:open="meetingModalVisible"
      :title="editingMeeting ? '编辑会议' : '安排新会议'"
      @ok="handleMeetingSubmit"
      @cancel="handleMeetingCancel"
      :ok-button-props="{ loading: meetingLoading }"
      width="600px"
    >
      <a-form
        ref="meetingFormRef"
        :model="meetingForm"
        layout="vertical"
      >
        <a-form-item 
          label="会议标题" 
          name="title" 
          :rules="[{ required: true, message: '请输入会议标题' }]"
        >
          <a-input 
            v-model:value="meetingForm.title" 
            placeholder="请输入会议标题"
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item 
              label="会议日期" 
              name="date" 
              :rules="[{ required: true, message: '请选择会议日期' }]"
            >
              <a-date-picker 
                v-model:value="meetingForm.date" 
                style="width: 100%"
                placeholder="选择日期"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item 
              label="会议时间" 
              name="time" 
              :rules="[{ required: true, message: '请选择会议时间' }]"
            >
              <a-time-picker 
                v-model:value="meetingForm.time" 
                style="width: 100%"
                format="HH:mm"
                placeholder="选择时间"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item 
          label="会议地点" 
          name="location" 
          :rules="[{ required: true, message: '请输入会议地点' }]"
        >
          <a-input 
            v-model:value="meetingForm.location" 
            placeholder="请输入会议地点"
          />
        </a-form-item>

        <a-form-item 
          label="讨论项目" 
          name="projects" 
          :rules="[{ required: true, message: '请选择讨论项目' }]"
        >
          <a-select
            v-model:value="meetingForm.projects"
            mode="multiple"
            placeholder="选择要讨论的项目"
            style="width: 100%"
          >
            <a-select-option 
              v-for="project in availableProjects" 
              :key="project.id" 
              :value="project.id"
            >
              {{ project.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="会议描述" name="description">
          <a-textarea
            v-model:value="meetingForm.description"
            placeholder="请输入会议描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  CalendarOutlined,
  PlusOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  EditOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const selectedStatus = ref('')
const meetingModalVisible = ref(false)
const meetingLoading = ref(false)
const editingMeeting = ref(null)
const meetingFormRef = ref()

const meetingForm = ref({
  title: '',
  date: null,
  time: null,
  location: '',
  projects: [],
  description: ''
})

// 会议数据
const meetings = ref([
  {
    id: 1,
    title: '2024年第1期立项评审会',
    date: '2024-01-25',
    time: '14:00',
    location: '会议室A',
    participants: 12,
    status: 'scheduled',
    projects: [
      { id: 1, name: '智慧城市大数据平台' },
      { id: 2, name: '区块链金融平台' }
    ]
  },
  {
    id: 2,
    title: '技术类项目专项评审',
    date: '2024-01-28',
    time: '09:30',
    location: '会议室B',
    participants: 8,
    status: 'planning',
    projects: [
      { id: 3, name: '物联网监测系统' }
    ]
  },
  {
    id: 3,
    title: '重点项目立项会议',
    date: '2024-01-20',
    time: '15:00',
    location: '大会议室',
    participants: 15,
    status: 'completed',
    projects: [
      { id: 4, name: '电子商务数据分析' },
      { id: 5, name: '在线教育平台' }
    ]
  }
])

// 可选项目数据
const availableProjects = ref([
  { id: 1, name: '智慧城市大数据平台建设项目' },
  { id: 2, name: '区块链供应链金融平台' },
  { id: 3, name: '物联网环境监测系统' },
  { id: 4, name: '电子商务数据分析系统' },
  { id: 5, name: '在线教育管理平台' },
  { id: 6, name: '移动办公应用系统' }
])

// 过滤后的会议数据
const filteredMeetings = computed(() => {
  if (!selectedStatus.value) {
    return meetings.value
  }
  return meetings.value.filter(meeting => meeting.status === selectedStatus.value)
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    planning: 'default',
    scheduled: 'processing',
    ongoing: 'warning',
    completed: 'success',
    cancelled: 'error'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    planning: '筹备中',
    scheduled: '已安排',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知状态'
}

const getMeetingCardClass = (status) => {
  return `meeting-card-${status}`
}

// 事件处理
const handleStatusFilter = () => {
  // 过滤已通过计算属性实现
}

const handleCreateMeeting = () => {
  editingMeeting.value = null
  meetingForm.value = {
    title: '',
    date: null,
    time: null,
    location: '',
    projects: [],
    description: ''
  }
  meetingModalVisible.value = true
}

const handleEditMeeting = (meeting) => {
  editingMeeting.value = meeting
  meetingForm.value = {
    title: meeting.title,
    date: meeting.date,
    time: meeting.time,
    location: meeting.location,
    projects: meeting.projects.map(p => p.id),
    description: meeting.description || ''
  }
  meetingModalVisible.value = true
}

const handleMeetingSubmit = async () => {
  try {
    await meetingFormRef.value.validate()
    meetingLoading.value = true
    
    // 这里调用保存会议API
    setTimeout(() => {
      message.success(editingMeeting.value ? '会议更新成功' : '会议创建成功')
      meetingModalVisible.value = false
      meetingLoading.value = false
    }, 1000)
    
  } catch (error) {
    message.error('请完善会议信息')
  }
}

const handleMeetingCancel = () => {
  meetingModalVisible.value = false
}

const handleMeetingAction = (action, meeting) => {
  switch (action) {
    case 'edit':
      handleEditMeeting(meeting)
      break
    case 'start':
      meeting.status = 'ongoing'
      message.success('会议已开始')
      break
    case 'finish':
      meeting.status = 'completed'
      message.success('会议已结束')
      break
    case 'cancel':
      meeting.status = 'cancelled'
      message.warning('会议已取消')
      break
    case 'reschedule':
      handleEditMeeting(meeting)
      break
    case 'summary':
      handleViewSummary(meeting)
      break
  }
}

const handleJoinMeeting = (meeting) => {
  message.info('正在加入会议...')
}

const handleViewSummary = (meeting) => {
  message.info('查看会议纪要')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.tab-meeting-container {
  padding: 24px;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 200px);
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

/* 会议列表样式 */
.meeting-list {
  width: 100%;
}

.meeting-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.meeting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.meeting-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  flex: 1;
  line-height: 1.4;
}

.meeting-info {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.meeting-projects {
  margin-top: 12px;
}

.meeting-projects h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.project-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 会议状态样式 */
.meeting-card.planning {
  border-left: 4px solid #1890ff;
}

.meeting-card.scheduled {
  border-left: 4px solid #52c41a;
}

.meeting-card.ongoing {
  border-left: 4px solid #fa8c16;
}

.meeting-card.completed {
  border-left: 4px solid #13c2c2;
}

.meeting-card.cancelled {
  border-left: 4px solid #ff4d4f;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-meeting-container {
    padding: 16px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .toolbar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .meeting-card {
    margin-bottom: 16px;
  }
}

/* 确保卡片占满宽度 */
.meeting-list :deep(.ant-card) {
  width: 100%;
  height: 100%;
}

.meeting-list :deep(.ant-row) {
  width: 100%;
}

.meeting-list :deep(.ant-col) {
  width: 100%;
}
</style>