<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '编辑座谈会' : '新建座谈会'"
    @ok="handleOk"
    @cancel="handleCancel"
    width="700"
    :destroyOnClose="true"
    :maskClosable="false"
  >
    <a-form :model="form" :rules="rules" ref="formRef" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="绑定需求" name="requirementId" :rules="[{ required: true, message: '请选择要绑定的需求', trigger: 'change' }]">
            <a-select v-model:value="form.requirementId" placeholder="请选择要绑定的需求">
              <a-select-option v-for="req in requirements" :key="req.id" :value="req.id">{{ req.title || req.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="会议主题" name="title" required>
            <a-input v-model:value="form.title" placeholder="请输入会议主题" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="会议类型" name="type" required>
            <a-select v-model:value="form.type" placeholder="请选择会议类型">
              <a-select-option value="专家咨询">专家咨询</a-select-option>
              <a-select-option value="用户访谈">用户访谈</a-select-option>
              <a-select-option value="技术交流">技术交流</a-select-option>
              <a-select-option value="需求讨论">需求讨论</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="会议时间" name="scheduledDate" required>
            <a-date-picker v-model:value="form.scheduledDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="会议时段" name="scheduledTime" required>
            <a-input v-model:value="form.scheduledTime" placeholder="如 14:00-16:00" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="会议地点" name="location" required>
            <a-input v-model:value="form.location" placeholder="请输入会议地点" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="组织者" name="organizer" required>
            <a-input v-model:value="form.organizer" placeholder="请输入组织者姓名" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="会议说明" name="description">
        <a-textarea v-model:value="form.description" :rows="2" placeholder="请输入会议说明" />
      </a-form-item>

      <!-- 参与者管理 -->
      <div class="section-block">
        <div class="section-header">
          <span>参与者</span>
          <a-button type="link" @click="addParticipant">
            <PlusOutlined /> 添加
          </a-button>
        </div>
        <a-table
          :columns="participantColumns"
          :data-source="form.participants"
          :pagination="false"
          size="small"
          rowKey="id"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'name'">
              <a-input v-model:value="record.name" placeholder="姓名" />
            </template>
            <template v-else-if="column.key === 'role'">
              <a-input v-model:value="record.role" placeholder="角色" />
            </template>
            <template v-else-if="column.key === 'organization'">
              <a-input v-model:value="record.organization" placeholder="单位" />
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-button type="link" danger size="small" @click="removeParticipant(index)">移除</a-button>
            </template>
          </template>
        </a-table>
      </div>

      <!-- 议程管理 -->
      <div class="section-block">
        <div class="section-header">
          <span>会议议程</span>
          <a-button type="link" @click="addAgenda">
            <PlusOutlined /> 添加
          </a-button>
        </div>
        <a-table
          :columns="agendaColumns"
          :data-source="form.agenda"
          :pagination="false"
          size="small"
          rowKey="id"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'title'">
              <a-input v-model:value="record.title" placeholder="议题标题" />
            </template>
            <template v-else-if="column.key === 'duration'">
              <a-input-number v-model:value="record.duration" :min="1" style="width: 80px" />
            </template>
            <template v-else-if="column.key === 'speaker'">
              <a-input v-model:value="record.speaker" placeholder="主讲人" />
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-button type="link" danger size="small" @click="removeAgenda(index)">移除</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined } from '@ant-design/icons-vue'

/**
 * @typedef {Object} Participant
 * @property {string} id 参与者ID
 * @property {string} name 姓名
 * @property {string} role 角色
 * @property {string} organization 单位
 */

/**
 * @typedef {Object} AgendaItem
 * @property {string} id 议题ID
 * @property {string} title 议题标题
 * @property {number} duration 时长(分钟)
 * @property {string} speaker 主讲人
 */

/**
 * @typedef {Object} MeetingForm
 * @property {string} title 会议主题
 * @property {string} type 会议类型
 * @property {string|object} scheduledDate 会议日期
 * @property {string} scheduledTime 会议时段
 * @property {string} location 会议地点
 * @property {string} organizer 组织者
 * @property {string} description 会议说明
 * @property {Participant[]} participants 参与者列表
 * @property {AgendaItem[]} agenda 议程列表
 */

const props = defineProps({
  visible: Boolean,
  meeting: Object,
  requirements: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:visible', 'save'])

const isEdit = computed(() => !!props.meeting)
const formRef = ref()

/**
 * 表单数据
 * @type {import('vue').Ref<MeetingForm>}
 */
const form = ref({
  title: '',
  type: '',
  scheduledDate: '',
  scheduledTime: '',
  location: '',
  organizer: '',
  description: '',
  participants: [],
  agenda: [],
  requirementId: ''
})

/**
 * 表单校验规则
 */
const rules = {
  title: [{ required: true, message: '请输入会议主题' }],
  type: [{ required: true, message: '请选择会议类型' }],
  scheduledDate: [{ required: true, message: '请选择会议日期' }],
  scheduledTime: [{ required: true, message: '请输入会议时段' }],
  location: [{ required: true, message: '请输入会议地点' }],
  organizer: [{ required: true, message: '请输入组织者' }]
}

/**
 * 参与者表格列
 */
const participantColumns = [
  { title: '姓名', key: 'name', width: '30%' },
  { title: '角色', key: 'role', width: '25%' },
  { title: '单位', key: 'organization', width: '35%' },
  { title: '操作', key: 'actions', width: '10%' }
]

/**
 * 议程表格列
 */
const agendaColumns = [
  { title: '议题标题', key: 'title', width: '40%' },
  { title: '时长(分钟)', key: 'duration', width: '20%' },
  { title: '主讲人', key: 'speaker', width: '30%' },
  { title: '操作', key: 'actions', width: '10%' }
]

/**
 * 监听弹窗打开，初始化表单
 */
watch(() => props.visible, (val) => {
  if (val) {
    if (props.meeting) {
      // 编辑模式
      form.value = {
        ...props.meeting,
        scheduledDate: props.meeting.scheduledDate ? dayjs(props.meeting.scheduledDate) : '',
        participants: props.meeting.participants ? props.meeting.participants.map(p => ({ ...p })) : [],
        agenda: props.meeting.agenda ? props.meeting.agenda.map(a => ({ ...a })) : [],
        requirementId: props.meeting.requirementId || ''
      }
    } else {
      // 新建模式
      form.value = {
        title: '',
        type: '',
        scheduledDate: '',
        scheduledTime: '',
        location: '',
        organizer: '',
        description: '',
        participants: [],
        agenda: [],
        requirementId: ''
      }
    }
  }
})

/**
 * 添加参与者
 */
function addParticipant() {
  form.value.participants.push({
    id: `P${String(form.value.participants.length + 1).padStart(3, '0')}`,
    name: '',
    role: '',
    organization: ''
  })
}

/**
 * 移除参与者
 */
function removeParticipant(index) {
  form.value.participants.splice(index, 1)
}

/**
 * 添加议程
 */
function addAgenda() {
  form.value.agenda.push({
    id: `A${String(form.value.agenda.length + 1).padStart(3, '0')}`,
    title: '',
    duration: 30,
    speaker: ''
  })
}

/**
 * 移除议程
 */
function removeAgenda(index) {
  form.value.agenda.splice(index, 1)
}

/**
 * 确认保存
 */
function handleOk() {
  formRef.value.validate().then(() => {
    // 日期格式化
    const data = {
      ...form.value,
      scheduledDate: form.value.scheduledDate ? form.value.scheduledDate.format('YYYY-MM-DD') : ''
    }
    emit('save', data)
  }).catch(() => {
    message.error('请完善表单信息')
  })
}

/**
 * 关闭弹窗
 */
function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped>
.section-block {
  margin-bottom: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  color: #234fa2;
}
</style> 