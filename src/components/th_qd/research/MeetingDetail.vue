<template>
  <div class="meeting-detail">
    <!-- 会议基本信息 -->
    <div class="meeting-info">
      <div class="meeting-header">
        <h2 class="meeting-title">{{ meeting.title }}</h2>
        <div class="meeting-meta">
          <a-tag :color="getStatusColor(meeting.status)">{{ meeting.status }}</a-tag>
          <a-tag>{{ meeting.type }}</a-tag>
        </div>
      </div>
      
      <div class="meeting-basic-info">
        <div class="info-item">
          <CalendarOutlined />
          <span>时间：{{ meeting.scheduledDate }} {{ meeting.scheduledTime }}</span>
        </div>
        <div class="info-item">
          <EnvironmentOutlined />
          <span>地点：{{ meeting.location }}</span>
        </div>
        <div class="info-item">
          <UserOutlined />
          <span>组织者：{{ meeting.organizer }}</span>
        </div>
      </div>
      
      <div class="meeting-description">
        <h3>会议说明</h3>
        <p>{{ meeting.description }}</p>
      </div>
    </div>

    <!-- 参与者列表 -->
    <div class="meeting-participants">
      <div class="section-header">
        <h3>参与者 ({{ meeting.participants.length }}人)</h3>
        <a-button type="link" @click="showAddParticipant = true">
          <PlusOutlined />
          添加参与者
        </a-button>
      </div>
      
      <a-table
        :columns="participantColumns"
        :data-source="meeting.participants"
        :pagination="false"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-avatar>{{ record.name.charAt(0) }}</a-avatar>
            <span class="participant-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="editParticipant(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" danger @click="removeParticipant(record)">
                移除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 会议议程 -->
    <div class="meeting-agenda">
      <div class="section-header">
        <h3>会议议程 ({{ meeting.agenda.length }}项)</h3>
        <a-button type="link" @click="showAddAgenda = true">
          <PlusOutlined />
          添加议题
        </a-button>
      </div>
      
      <a-timeline>
        <a-timeline-item v-for="item in meeting.agenda" :key="item.id">
          <div class="agenda-item">
            <div class="agenda-info">
              <h4>{{ item.title }}</h4>
              <div class="agenda-meta">
                <span class="duration">{{ item.duration }}分钟</span>
                <span class="speaker">主讲人：{{ item.speaker }}</span>
              </div>
            </div>
            <div class="agenda-actions">
              <a-button type="link" size="small" @click="editAgendaItem(item)">
                编辑
              </a-button>
              <a-button type="link" size="small" danger @click="removeAgendaItem(item)">
                删除
              </a-button>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>

    <!-- 会议材料 -->
    <div class="meeting-materials">
      <div class="section-header">
        <h3>会议材料</h3>
        <a-upload
          v-model:file-list="fileList"
          :before-upload="beforeUpload"
          multiple
        >
          <a-button type="link">
            <UploadOutlined />
            上传材料
          </a-button>
        </a-upload>
      </div>
      
      <div class="materials-list">
        <a-empty v-if="!meeting.materials.length" description="暂无会议材料" />
        <div v-else class="materials-grid">
          <div v-for="material in meeting.materials" :key="material" class="material-item">
            <FileOutlined />
            <span class="material-name">{{ material }}</span>
            <a-button type="link" size="small">
              <DownloadOutlined />
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 会议记录 -->
    <div class="meeting-notes">
      <div class="section-header">
        <h3>会议记录</h3>
        <a-button type="link" @click="saveNotes">
          <SaveOutlined />
          保存记录
        </a-button>
      </div>
      
      <a-textarea
        v-model:value="meeting.notes"
        :rows="6"
        placeholder="请输入会议记录..."
      />
    </div>

    <!-- 会议成果 -->
    <div class="meeting-outcomes">
      <div class="section-header">
        <h3>会议成果</h3>
        <a-button type="link" @click="showAddOutcome = true">
          <PlusOutlined />
          添加成果
        </a-button>
      </div>
      
      <div class="outcomes-list">
        <a-empty v-if="!meeting.outcomes.length" description="暂无会议成果" />
        <div v-else class="outcomes-grid">
          <div v-for="(outcome, index) in meeting.outcomes" :key="index" class="outcome-item">
            <CheckCircleOutlined />
            <span class="outcome-text">{{ outcome }}</span>
            <a-button type="link" size="small" danger @click="removeOutcome(index)">
              删除
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="meeting-actions">
      <a-space>
        <a-button @click="$emit('edit', meeting)">
          <EditOutlined />
          编辑会议
        </a-button>
        <a-button 
          type="primary" 
          @click="$emit('start', meeting)"
          v-if="meeting.status === '筹备中'"
        >
          <PlayCircleOutlined />
          开始会议
        </a-button>
        <a-button 
          type="primary" 
          @click="$emit('end', meeting)"
          v-if="meeting.status === '进行中'"
        >
          <StopOutlined />
          结束会议
        </a-button>
      </a-space>
    </div>

    <!-- 添加参与者弹窗 -->
    <a-modal
      v-model:open="showAddParticipant"
      title="添加参与者"
      @ok="handleAddParticipant"
    >
      <a-form :model="newParticipant" layout="vertical">
        <a-form-item label="姓名" required>
          <a-input v-model:value="newParticipant.name" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-input v-model:value="newParticipant.role" />
        </a-form-item>
        <a-form-item label="单位">
          <a-input v-model:value="newParticipant.organization" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加议题弹窗 -->
    <a-modal
      v-model:open="showAddAgenda"
      title="添加议题"
      @ok="handleAddAgenda"
    >
      <a-form :model="newAgendaItem" layout="vertical">
        <a-form-item label="议题标题" required>
          <a-input v-model:value="newAgendaItem.title" />
        </a-form-item>
        <a-form-item label="时长(分钟)" required>
          <a-input-number v-model:value="newAgendaItem.duration" :min="1" />
        </a-form-item>
        <a-form-item label="主讲人" required>
          <a-input v-model:value="newAgendaItem.speaker" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加成果弹窗 -->
    <a-modal
      v-model:open="showAddOutcome"
      title="添加成果"
      @ok="handleAddOutcome"
    >
      <a-form :model="newOutcome" layout="vertical">
        <a-form-item label="成果内容" required>
          <a-textarea v-model:value="newOutcome.content" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileOutlined,
  SaveOutlined,
  EditOutlined,
  PlayCircleOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  meeting: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'start', 'end'])

/**
 * 参与者表格列定义
 */
const participantColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: '30%'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: '25%'
  },
  {
    title: '单位',
    dataIndex: 'organization',
    key: 'organization',
    width: '35%'
  },
  {
    title: '操作',
    key: 'actions',
    width: '10%'
  }
]

/**
 * 文件上传相关
 */
const fileList = ref([])

function beforeUpload(file) {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

/**
 * 参与者管理
 */
const showAddParticipant = ref(false)
const newParticipant = ref({
  name: '',
  role: '',
  organization: ''
})

function handleAddParticipant() {
  if (!newParticipant.value.name || !newParticipant.value.role) {
    message.error('请填写必填项')
    return
  }
  
  props.meeting.participants.push({
    id: `P${String(props.meeting.participants.length + 1).padStart(3, '0')}`,
    ...newParticipant.value
  })
  
  showAddParticipant.value = false
  newParticipant.value = {
    name: '',
    role: '',
    organization: ''
  }
  message.success('参与者添加成功')
}

function editParticipant(participant) {
  // 编辑参与者信息
  message.info('编辑参与者功能开发中...')
}

function removeParticipant(participant) {
  const index = props.meeting.participants.findIndex(p => p.id === participant.id)
  props.meeting.participants.splice(index, 1)
  message.success('参与者已移除')
}

/**
 * 议程管理
 */
const showAddAgenda = ref(false)
const newAgendaItem = ref({
  title: '',
  duration: 30,
  speaker: ''
})

function handleAddAgenda() {
  if (!newAgendaItem.value.title || !newAgendaItem.value.speaker) {
    message.error('请填写必填项')
    return
  }
  
  props.meeting.agenda.push({
    id: `A${String(props.meeting.agenda.length + 1).padStart(3, '0')}`,
    ...newAgendaItem.value
  })
  
  showAddAgenda.value = false
  newAgendaItem.value = {
    title: '',
    duration: 30,
    speaker: ''
  }
  message.success('议题添加成功')
}

function editAgendaItem(item) {
  // 编辑议题信息
  message.info('编辑议题功能开发中...')
}

function removeAgendaItem(item) {
  const index = props.meeting.agenda.findIndex(a => a.id === item.id)
  props.meeting.agenda.splice(index, 1)
  message.success('议题已删除')
}

/**
 * 会议记录
 */
function saveNotes() {
  message.success('会议记录已保存')
}

/**
 * 会议成果
 */
const showAddOutcome = ref(false)
const newOutcome = ref({
  content: ''
})

function handleAddOutcome() {
  if (!newOutcome.value.content) {
    message.error('请输入成果内容')
    return
  }
  
  props.meeting.outcomes.push(newOutcome.value.content)
  
  showAddOutcome.value = false
  newOutcome.value.content = ''
  message.success('成果添加成功')
}

function removeOutcome(index) {
  props.meeting.outcomes.splice(index, 1)
  message.success('成果已删除')
}

/**
 * 获取状态颜色
 */
function getStatusColor(status) {
  const colors = {
    '筹备中': 'orange',
    '进行中': 'blue', 
    '已结束': 'green',
    '已取消': 'red'
  }
  return colors[status] || 'default'
}
</script>

<style scoped>
.meeting-detail {
  padding: 24px;
}

.meeting-info {
  margin-bottom: 32px;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.meeting-title {
  font-size: 24px;
  color: #234fa2;
  margin: 0;
}

.meeting-basic-info {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.meeting-description {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
}

.meeting-description h3 {
  font-size: 16px;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.meeting-description p {
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  color: #234fa2;
  margin: 0;
}

.meeting-participants,
.meeting-agenda,
.meeting-materials,
.meeting-notes,
.meeting-outcomes {
  margin-bottom: 32px;
}

.participant-name {
  margin-left: 8px;
}

.agenda-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.agenda-info h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
}

.agenda-meta {
  display: flex;
  gap: 16px;
  color: #64748b;
  font-size: 14px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
}

.material-name {
  flex: 1;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.outcomes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.outcome-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 4px;
}

.outcome-text {
  flex: 1;
  color: #64748b;
}

.meeting-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {
  .meeting-detail {
    padding: 16px;
  }
  
  .meeting-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .meeting-basic-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .materials-grid,
  .outcomes-grid {
    grid-template-columns: 1fr;
  }
}
</style> 