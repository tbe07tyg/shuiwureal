<template>
  <div class="th-qd-scope">
    <PageContainer
      title="我的工作台"
      description="项目概览、待办事项及任务日历">
    
    <!-- 顶部统计卡片 -->
    <div class="stat-cards-container">
      <div class="stat-card" v-for="card in statCards" :key="card.key" :style="{background: card.bg}">
        <div class="stat-content">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-title">{{ card.title }}</div>
          <div class="stat-subtitle">{{ card.subtitle }}</div>
        </div>
        <div class="stat-icon">
          <component :is="card.icon" :style="{fontSize: '32px', color: card.color}" />
        </div>
      </div>
    </div>

  <a-card class="notifications-card" title="系统通知">
          <div class="notifications-list">
            <div
              v-for="notification in notifications" 
              :key="notification.id" 
                class="notification-item"
                @click="viewNotificationDetail(notification)">
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-desc" v-if="notification.content">{{ notification.content }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
              <a-tag v-if="notification.unread" color="red">重要</a-tag>
            </div>
          </div>
        </a-card>



    <!-- 今日重要提醒横幅 -->
    <div v-if="todayReminders.length > 0" class="reminder-banner">
      <div class="banner-icon">
        <BellOutlined />
      </div>
      <div class="banner-content">
        <span class="banner-title">今日重要提醒：</span>
        <div class="reminder-items">
          <a-tag 
            v-for="reminder in todayReminders" 
            :key="reminder.id" 
            :color="reminder.level"
            class="reminder-tag"
            @click="handleReminderClick(reminder)"
          >
            {{ reminder.text }}
          </a-tag>
        </div>
      </div>
      <a-button type="link" @click="viewAllReminders">查看全部</a-button>
    </div>

    <!-- 主内容区域 -->
    <div class="dashboard-main">
      <!-- 左侧区域 -->
      <div class="dashboard-left">
        <!-- 待办事项 -->
        <a-card class="todo-card" title="待办事项">
          <template #extra>
            <a-button type="link" @click="router.push('/implementation/center')">查看全部</a-button>
          </template>
          <div class="todo-filter">
            <a-radio-group v-model:value="todoFilter" @change="handleTodoFilter">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="urgent">紧急</a-radio-button>
              <a-radio-button value="today">今日</a-radio-button>
            </a-radio-group>
          </div>
          
          <div class="todo-list">
            <div v-if="filteredTodoList.length === 0" class="empty-todo">
              <CheckCircleOutlined />
              <span>暂无待办事项</span>
            </div>
            <div 
              v-for="item in filteredTodoList" 
              :key="item.id" 
              :class="['todo-item', item.priority]"
              @click="handleTodoClick(item)"
            >
              <div class="todo-left">
                <a-badge :status="getTodoBadgeStatus(item)" />
                <div class="todo-info">
                  <div class="todo-title">{{ item.title }}</div>
                  <div class="todo-meta">
                    <span class="todo-project">{{ item.projectName }}</span>
                    <span class="todo-time">{{ item.deadline }}</span>
                    <a-tag v-if="item.type" size="small" :color="getTypeColor(item.type)">
                      {{ getTypeText(item.type) }}
                    </a-tag>
                  </div>
                </div>
              </div>
              <div class="todo-actions">
                <a-button type="link" size="small" @click.stop="handleQuickAction(item)">
                  {{ getActionText(item.type) }}
                </a-button>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 项目进度监控 -->
        <a-card class="progress-card" title="项目任务进度监控">
          <div class="progress-list">
            <div v-for="project in progressProjects" :key="project.id" class="progress-item">
              <div class="project-header">
                <div class="project-name">{{ project.name }}</div>
                <a-tag :color="getProgressColor(project.status)">{{ project.statusText }}</a-tag>
              </div>
              <div class="progress-bar">
                <a-progress 
                  :percent="project.progress" 
                  :status="project.progress < 100 ? 'active' : 'success'"
                  :strokeColor="getProgressStrokeColor(project.progress)"
                />
              </div>
              <div class="project-meta">
                <span>负责人：{{ project.leader }}</span>
                <span>截止：{{ project.deadline }}</span>
              </div>
              <div class="project-tasks">
                <div class="task-summary" @click="toggleTaskList(project.id)">
                  <span>任务：{{ project.completedTasks }}/{{ project.totalTasks }}</span>
                  <span class="toggle-icon">{{ project.showTasks ? '▲' : '▼' }}</span>
                </div>
                <div v-show="project.showTasks" class="task-list">
                  <!-- 调试信息：任务数组长度 {{ project.tasks ? project.tasks.length : 0 }} -->
                  <div v-if="project.tasks && project.tasks.length > 0">
                    <div v-for="task in project.tasks" :key="task.id" class="task-item">
                      <div class="task-name">{{ task.name }}</div>
                      <a-tag :color="getTaskStatusColor(task.status)">{{ getTaskStatusText(task.status) }}</a-tag>
                    </div>
                  </div>
                  <div v-else class="no-tasks">
                    暂无任务数据
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 右侧区域 -->
      <div class="dashboard-right">
        <!-- 会议日历 -->
        <a-card class="calendar-card" title="会议安排">
          <template #extra>
            <!-- <a-button type="link" @click="router.push('/implementation/center')">会议管理</a-button> -->
          </template>
          <div class="calendar-container">
            <a-calendar 
              v-model:value="selectedDate" 
              :fullscreen="false"
              @select="onDateSelect"
            >
              <template #dateCellRender="{ current }">
                <div class="calendar-cell">
                  <div
v-for="event in getEventsForDate(current)" :key="event.id" 
                       :class="['event-dot', event.type]"
                       :title="event.title">
                  </div>
                </div>
              </template>
            </a-calendar>
          </div>
          
          <!-- 选中日期的事件列表 -->
          <div v-if="selectedDateEvents.length > 0" class="selected-date-events">
            <h4>{{ selectedDate.format('YYYY年MM月DD日') }} 的安排</h4>
            <div v-for="event in selectedDateEvents" :key="event.id" class="event-item">
              <div class="event-time">{{ event.time }}</div>
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-desc">{{ event.description }}</div>
              </div>
              <!-- <a-button type="link" size="small" @click="viewEventDetail(event)">详情</a-button> -->
            </div>
          </div>
        </a-card>

        <!-- 快速操作面板 -->
        <a-card class="quick-actions-card" title="快速操作">
          <div class="quick-actions-grid">
            <div
v-for="action in quickActions" :key="action.key" 
                 class="quick-action-item" 
                 @click="handleQuickActionClick(action)">
              <div class="action-icon">
                <component :is="action.icon" />
              </div>
              <div class="action-text">{{ action.text }}</div>
            </div>
          </div>
        </a-card>

        <!-- 系统通知 -->
        <!-- <a-card class="notifications-card" title="系统通知">
          <div class="notifications-list">
            <div
              v-for="notification in notifications" 
              :key="notification.id" 
                class="notification-item"
                @click="viewNotificationDetail(notification)">
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-desc" v-if="notification.content">{{ notification.content }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
              <a-tag v-if="notification.unread" color="red">重要</a-tag>
            </div>
          </div>
        </a-card> -->



      </div>
    </div>
    </PageContainer>
    
    <!-- 通知详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="通知详情"
      :footer="null"
      width="600px"
      @cancel="detailModalVisible = false">
      <div class="notice-detail">
        <div class="notice-detail-header">
          <h3>{{ detailForm.title }}</h3>
          <div class="notice-detail-meta">
            <span>发布时间: {{ formatTime(detailForm.createTime) }}</span>
            <a-tag v-if="detailForm.status === 1" color="red">重要</a-tag>
          </div>
        </div>
        <div class="notice-detail-content">
          <div class="content-text">{{ detailForm.content }}</div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { 
  BellOutlined, 
  CheckCircleOutlined,
  ProjectOutlined,
  CarryOutOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components/th_qd/PageContainer.vue'
import { 
  getTechnologicalProjectPage,
  getTechnologicalMeetingPage,
  getTechnologicalProject
} from '@/api/th_qd/approval'
import { 
  thQdProjectTaskAssignmentPage,
} from '@/api/th_qd/myTask/assignment'
import { useUserStore } from '@/store/modules/user'

import { 
  thQdNoticePage,
  thQdNoticeGet,
  thQdNoticeUpdate,
} from '@/api/th_qd/notice' 

const router = useRouter()
const userStore = useUserStore()
// 通过项目ID获取项目名称
const getProjectNameById = async (projectId) => {
  try {
    const res = await getTechnologicalProject(projectId)
    // console.log(`项目${projectId}的API响应:`, res)
    // 检查响应是否包含projectName字段
    if (res && res.projectName) {
      console.log(`成功获取项目${projectId}的名称:`, res.projectName)
      return res.projectName
    }
    // 如果没有直接找到projectName，检查data.projectName
    if (res && res.data && res.data.projectName) {
      // console.log(`成功获取项目${projectId}的名称:`, res.data.projectName)
      return res.data.projectName
    }
    // console.log(`项目${projectId}没有返回有效的名称，使用默认格式`)
    return `项目${projectId}`
  } catch (error) {
    // console.error(`获取项目${projectId}名称失败:`, error)
    return `项目${projectId}`
  }
}

// 项目名称缓存
const projectNamesCache = ref(new Map())

// 预加载项目名称
const preloadProjectNames = async (projectIds) => {
  // console.log('开始预加载项目名称，项目IDs:', Array.from(projectIds))
  for (const projectId of projectIds) {
    if (!projectNamesCache.value.has(projectId)) {
      try {
        // console.log(`正在获取项目${projectId}的名称...`)
        const projectName = await getProjectNameById(projectId)
        // console.log(`成功获取项目${projectId}的名称:`, projectName)
        projectNamesCache.value.set(projectId, projectName)
      } catch (error) {
        // console.error(`获取项目${projectId}名称失败:`, error)
        projectNamesCache.value.set(projectId, `项目${projectId}`)
      }
    }
  }
  // console.log('项目名称预加载完成，缓存内容:', projectNamesCache.value)
}

// 获取项目名称
const getProjectName = async (projectId) => {
  // 检查缓存中是否已有项目名称
  let name = projectNamesCache.value.get(projectId)
  
  // 如果缓存中没有，则立即调用API获取
  if (!name) {
    // console.log(`项目${projectId}名称未缓存，正在获取...`)
    try {
      name = await getProjectNameById(projectId)
      projectNamesCache.value.set(projectId, name)
      // console.log(`成功获取并缓存项目${projectId}的名称:`, name)
    } catch (error) {
      // console.error(`获取项目${projectId}名称失败:`, error)
      name = `项目${projectId}`
    }
  } else {
    // console.log(`从缓存中获取项目${projectId}的名称:`, name)
  }
  
  return name
}

// 统计卡片数据
const statCards = ref([
  {
    key: 'total',
    title: '项目总数',
    value: 128,
    subtitle: '本月新增 8 个',
    color: '#1890ff',
    bg: 'linear-gradient(135deg, #e6f4ff 0%, #f0f9ff 100%)',
    icon: ProjectOutlined
  },
  {
    key: 'pending',
    title: '待办事项',
    value: 23,
    subtitle: '今日需处理 12 项',
    color: '#faad14',
    bg: 'linear-gradient(135deg, #fff7e6 0%, #fffdf6 100%)',
    icon: CarryOutOutlined
  },
  {
    key: 'urgent',
    title: '紧急任务',
    value: 0,
    subtitle: '逾期任务 2 项',
    color: '#ff4d4f',
    bg: 'linear-gradient(135deg, #fff1f0 0%, #fff5f5 100%)',
    icon: ExclamationCircleOutlined
  },
  {
    key: 'meetings',
    title: '本周会议',
    value: 8,
    subtitle: '今日 2 场会议',
    color: '#52c41a',
    bg: 'linear-gradient(135deg, #f6ffed 0%, #f9ffef 100%)',
    icon: CalendarOutlined
  }
])

// 今日提醒数据
const todayReminders = ref([])

// 待办事项数据
const todoFilter = ref('all')
const todoList = ref([])

// 项目进度数据
const progressProjects = ref([])
const projects = ref([])

// 日历相关
const selectedDate = ref(dayjs())
const calendarEvents = ref([])

// 快速操作
const quickActions = ref([
  // { key: 'new_meeting', text: '安排会议', icon: CalendarOutlined },
  // { key: 'review_materials', text: '审核材料', icon: FileTextOutlined },
  { key: 'manage_projects', text: '项目管理', icon: ProjectOutlined },
  { key: 'team_management', text: '团队管理', icon: TeamOutlined },
  // { key: 'system_settings', text: '系统设置', icon: SettingOutlined },
  // { key: 'search', text: '全局搜索', icon: SearchOutlined }
])

// 系统通知
const notifications = ref([])

// 通知详情弹窗相关
const detailModalVisible = ref(false)
const detailForm = ref({
  id: '',
  title: '',
  content: '',
  type: '',
  status: 0,
  createTime: ''
})

// 获取通知列表
const fetchNotifications = async () => {
  try {
    const res = await thQdNoticePage({
      pageSize: 10,
      pageNo: 1
    })
    
    if (res && res.list) {
      // 处理通知数据
      notifications.value = res.list.map(item => ({
        id: item.id,
        title: item.title || '无标题通知',
        content: item.content || '',
        time: formatTime(item.createTime),
        unread: item.status === 1, // status=0表示普通公告，status=1表示重要公告
        noticeType: item.noticeType
      }))
      // console.log('已加载通知列表:', notifications.value)
    } else if (res && res.code === 0 && res.data) {
      // 处理包装在data中的情况
      notifications.value = res.data.list.map(item => ({
        id: item.id,
        title: item.title || '无标题通知',
        content: item.content || '',
        time: formatTime(item.createTime),
        unread: item.status === 1,
        noticeType: item.noticeType
      }))
      // console.log('已加载通知列表(data):', notifications.value)
    } else {
      // console.error('通知API响应无效:', res)
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    message.error('获取通知列表失败')
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '未知时间'
  
  const now = new Date()
  let date
  
  // 处理不同格式的时间
  if (typeof time === 'number' && time > 1000000000000) {
    // 毫秒级时间戳
    date = new Date(time)
  } else if (typeof time === 'string' && !isNaN(time)) {
    // 数字字符串
    const numValue = parseInt(time)
    date = numValue > 1000000000000 ? new Date(numValue) : new Date(time)
  } else if (Array.isArray(time) && time.length >= 3) {
    // 数组格式 [年, 月, 日]
    date = new Date(time[0], time[1] - 1, time[2])
  } else {
    // 其他格式
    date = new Date(time)
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '未知时间'
  }
  
  // 计算时间差
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  // 根据时间差返回不同的格式
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  // 超过一周显示具体日期
  return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`
}

// 标记通知为已读
const markNotificationAsRead = async (id) => {
  try {
    // 先获取通知详情
    const notice = await thQdNoticeGet(id)
    
    if (notice) {
      // 更新通知状态为已读
      const res = await thQdNoticeUpdate({
        id,
        status: 0 // 将重要公告(状态1)修改为普通公告(状态0)
      })
      
      if (res && res.code === 0) {
        // 更新本地通知状态
        const notification = notifications.value.find(item => item.id === id)
        if (notification) {
          notification.unread = false
          message.success('已标记为已读')
        }
      } else {
        message.error('标记已读失败')
      }
    } else {
      message.error('获取通知详情失败')
    }
  } catch (error) {
    console.error('标记通知已读失败:', error)
    message.error('标记已读失败')
  }
}

// 查看通知详情
const viewNotificationDetail = async (notification) => {
  // 如果通知未读，先标记为已读
  if (notification.unread) {
    // 取消自动标记已读
  }
  
  try {
    const res = await thQdNoticeGet(notification.id)
    console.log('获取通知详情响应:', res)
    if (res) {
      // 显示通知详情弹窗
      detailModalVisible.value = true
      const noticeData = res.data || res
      detailForm.value = {
        id: noticeData.id,
        title: noticeData.title,
        content: noticeData.content,
        type: noticeData.type,
        status: noticeData.status,
        createTime: noticeData.createTime
      }
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    message.error('获取通知详情失败')
  }
}

// 计算属性
const filteredTodoList = computed(() => {
  let filtered = todoList.value
  if (todoFilter.value === 'urgent') {
    filtered = filtered.filter(item => item.priority === 'urgent')
  } else if (todoFilter.value === 'today') {
    filtered = filtered.filter(item => item.deadline.includes('今日'))
  }
  // 确保只显示状态为2(待修改)、6(待整改)、9(未通过)的项目
  filtered = filtered.filter(item => {
    return item.status === 2 || item.status === 6 || item.status === 9
  })
  return filtered
})

const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return []
  const dateStr = selectedDate.value.format('YYYY-MM-DD')
  return calendarEvents.value.filter(event => event.date === dateStr)
})

// 方法
const handleReminderClick = (reminder) => {
  switch (reminder.type) {
    case 'meeting':
      router.push('/th-qd-project/approval/approval/management/conclusion')
      break
    case 'conclusion':
      router.push('/th-qd-project/approval/approval/management/manage')
      break
    case 'payment':
      router.push('/implementation/payment')
      break
    case 'review':
      router.push('/th-qd-project/approval/approval/management/manage')
      break
  }
}

const viewAllReminders = () => {
  router.push('/implementation/center')
}

const handleTodoFilter = () => {
  // 过滤逻辑已通过computed实现
}

const handleTodoClick = (item) => {
  switch (item.type) {
    case 'meeting':
      router.push('/th-qd-project/approval/approval/applicant/manage')
      break
    case 'conclusion':
      router.push('/th-qd-project/approval/approval/applicant/submit')
      break
    case 'review':
      router.push('/th-qd-project/approval/approval/applicant/manage')
      break
    case 'payment':
      router.push('/implementation/payment')
      break
    case 'submit':
      router.push('/th-qd-project/approval/approval/applicant/manage')
      break
  }
}

const handleQuickAction = (item) => {
  handleTodoClick(item)
}

const getTodoBadgeStatus = (item) => {
  if (item.status === 'overdue') return 'error'
  if (item.priority === 'urgent') return 'warning'
  return 'processing'
}

const getTypeColor = (type) => {
  const colors = {
    meeting: 'blue',
    conclusion: 'purple',
    review: 'green',
    payment: 'orange',
    submit: 'cyan'
  }
  return colors[type] || 'default'
}

const getTypeText = (type) => {
  const texts = {
    meeting: '会议',
    conclusion: '未通过',
    review: '整改',
    payment: '付款',
    submit: '提交'
  }
  return texts[type] || ''
}

const getActionText = (type) => {
  const actions = {
    meeting: '安排',
    conclusion: '重新申请',
    review: '提交整改',
    payment: '处理',
    submit: '修改材料'
  }
  return actions[type] || '处理'
}

const getProgressColor = (status) => {
  const colors = {
    in_progress: 'blue',
    near_completion: 'orange',
    completed: 'green',
    delayed: 'red'
  }
  return colors[status] || 'default'
}

const getProgressStrokeColor = (progress) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 50) return '#1890ff'
  if (progress >= 30) return '#faad14'
  return '#ff4d4f'
}

// 获取任务状态文本
const getTaskStatusText = (status) => {
  const statusMap = {
    1: '未开始',
    2: '进行中',
    3: '接近完成',
    4: '已完成'
  }
  return statusMap[status] || '未知状态'
}

// 获取任务状态颜色
const getTaskStatusColor = (status) => {
  const colorMap = {
    1: 'default',
    2: 'processing',
    3: 'warning',
    4: 'success'
  }
  return colorMap[status] || 'default'
}

// 切换任务列表的显示状态
const toggleTaskList = (projectId) => {
  const project = progressProjects.value.find(p => p.id === projectId)
  if (project) {
    project.showTasks = !project.showTasks
    // console.log(`切换项目${projectId}的任务列表显示状态:`, project.showTasks)
    // console.log(`项目${projectId}的任务数据:`, project.tasks)
  } else {
    // console.log(`未找到项目${projectId}`)
  }
}

const getEventsForDate = (date) => {
  const dateStr = date.format('YYYY-MM-DD')
  return calendarEvents.value.filter(event => event.date === dateStr)
}

const onDateSelect = (date) => {
  selectedDate.value = date
}

const viewEventDetail = (event) => {
  switch (event.type) {
    case 'meeting':
      router.push('/opening/management/conclusion')
      break
    case 'review':
      router.push('/opening/management/center')
      break
    case 'payment':
      router.push('/implementation/payment')
      break
  }
}

const handleQuickActionClick = (action) => {
  switch (action.key) {
    case 'new_meeting':
      router.push('/th-qd-project/approval/approval/applicant/manage')
      break
    case 'review_materials':
      router.push('/th-qd-project/approval/approval/applicant/manage')
      break
    case 'manage_projects':
      router.push('/th-qd-project/approval/approval/applicant/manage')
      break
    case 'team_management':
      router.push('/th-qd-implementation-v3/team')
      break
    case 'system_settings':
      router.push('/settings')
      break
    case 'search':
      message.info('全局搜索功能开发中')
      break
  }
}

onMounted(async () => {
  // console.log('onMounted钩子开始执行')
  // 页面加载时的初始化逻辑
  
  // 加载通知列表
  await fetchNotifications()
  try {
    // 获取所有状态为1、3、4、5的项目并添加到待办事项列表
    const projectRes = await getTechnologicalProjectPage({ 
      pageSize: 100, 
      pageNo: 1 ,
      applicant: useUserStore().getUser.nickname // 使用用户名过滤
    })
    if (projectRes && projectRes.list) {
      // 清空现有的待办事项列表
      todoList.value = []
      
      // 状态为2、6、9的项目
      const targetStatuses = [2, 6, 9]
      
      projectRes.list.forEach(project => {
        if (project.status !== undefined && targetStatuses.includes(project.status)) {
          // 获取项目名称，尝试多个可能的字段名
          const projectName = project.projectName || project.name || project.title || project.subject || '未命名项目'
          
          // 根据项目状态确定待办事项类型
          let todoType = 'review'
          let todoTitle = `${projectName}待审核`
          let todoDeadline = '待定'
          let todoPriority = 'normal'
          
          // 根据状态设置不同的类型和标题
          if (project.status === 2) {
            todoType = 'submit'
            todoTitle = `${projectName}提交`
            todoPriority = 'normal'
          } else if (project.status === 6) {
            todoType = 'review'
            todoTitle = `${projectName}待整改`
            todoPriority = 'urgent'
          } else if (project.status === 9) {
            todoType = 'conclusion'
            todoTitle = `${projectName}未通过`
            todoPriority = 'urgent'
          }
          
          // 设置截止时间
          if (project.expectedProjectTime && Array.isArray(project.expectedProjectTime) && project.expectedProjectTime.length >= 3) {
            const [year, month, day] = project.expectedProjectTime
            const projectDate = new Date(year, month - 1, day) // 月份需要减1，因为JS中月份从0开始
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            // 计算日期差
            const diffTime = projectDate - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            // 格式化日期为YYYY年MM月DD日
            todoDeadline = `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`
            
            // 添加相对时间描述
            if (diffDays === 0) {
              todoDeadline += ' (今日)'
            } else if (diffDays === 1) {
              todoDeadline += ' (明日)'
            } else if (diffDays > 0 && diffDays <= 7) {
              todoDeadline += ` (${diffDays}日后)`
            } else if (diffDays < 0) {
              todoDeadline += ` (已逾期${Math.abs(diffDays)}天)`
            }
            
            // console.log(`项目${project.id}预期时间:`, todoDeadline)
          }
          
          // 添加到待办事项列表
          todoList.value.push({
            id: project.id,
            title: todoTitle,
            projectName: projectName, // 使用上面获取的项目名称
            deadline: todoDeadline,
            priority: todoPriority,
            type: todoType,
            status: project.status
          })
        }
      })
      
      // console.log('已加载待办事项列表:', todoList.value)
    }
    // console.log('开始调用getTechnologicalProjectPage API')
    // 获取项目总数统计
    const res = await getTechnologicalProjectPage({ 
      pageSize: 100, 
      pageNo: 1 ,
      applicant: useUserStore().getUser.nickname // 使用用户名过滤
    })
    
    // console.log('开始调用thQdProjectTaskAssignmentPage API')
    // 获取紧急任务统计
    const taskRes = await thQdProjectTaskAssignmentPage({ 
      pageSize: 100, 
      pageNo: 1 ,
      assigneeName: useUserStore().getUser.nickname // 使用用户名过滤
    })
    // console.log('API响应数据:', res)

    // 检查响应是否有效 - API直接返回{list, total}结构
    if (res && res.list && res.total !== undefined) {
      // console.log('API响应有效，直接使用total属性')
      
      // 更新项目总数卡片
      const totalProjectCard = statCards.value.find(card => card.key === 'total')
      if (totalProjectCard) {
        // 使用API返回的total属性作为项目总数
        const totalCount = res.total || 0
        // console.log('使用total属性:', totalCount)
        
        // 更新卡片值
        totalProjectCard.value = totalCount
        // console.log('更新后的项目总数:', totalCount)
      }
      
      // 统计本月新增项目数量
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      let monthlyNewCount = 0
      
      res.list.forEach(project => {
        if (project.createTime) {
          const createDate = new Date(project.createTime)
          if (createDate.getMonth() === currentMonth && createDate.getFullYear() === currentYear) {
            monthlyNewCount++
          }
        }
      })
      
      // console.log('本月新增项目数量:', monthlyNewCount)
      
      // 更新项目总数卡片的副标题
      if (totalProjectCard) {
        totalProjectCard.subtitle = `本月新增 ${monthlyNewCount} 个`
        // console.log('更新后的项目总数卡片副标题:', totalProjectCard.subtitle)
      }
      
      // 统计待办事项数量（status为1、2、3、4、5的项目）
      let pendingCount = 0
      const pendingStatuses = [2,6,9]
      
      res.list.forEach(project => {
        if (project.status !== undefined && pendingStatuses.includes(project.status)) {
          pendingCount++
        }
      })
      
      // console.log('待办事项数量:', pendingCount)
      
      // 统计今日需处理项目数量
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      let todayPendingCount = 0
      
      res.list.forEach(project => {
        if (project.status !== undefined && pendingStatuses.includes(project.status)) {
          // 使用createTime字段判断是否为今日创建的项目
          if (project.createTime) {
            // 处理时间戳格式（毫秒级）
            let createTime
            if (typeof project.createTime === 'number') {
              createTime = new Date(project.createTime)
            } else {
              createTime = new Date(project.createTime)
            }
            
            if (createTime >= today && createTime < tomorrow) {
              todayPendingCount++
            }
          }
        }
      })
      
      // console.log('今日需处理项目数量:', todayPendingCount)
      
      // 更新待办事项卡片
      const pendingCard = statCards.value.find(card => card.key === 'pending')
      if (pendingCard) {
        pendingCard.value = pendingCount
        pendingCard.subtitle = `今日需处理 ${todayPendingCount} 项`
        // console.log('更新后的待办事项数量:', pendingCount)
        // console.log('更新后的待办事项副标题:', pendingCard.subtitle)
      }
      
    } else if (res && res.code === 0 && res.data) {
      // 处理包装在data中的情况
      console.log('API响应data:', res.data)
      
      // 更新项目总数卡片
      const totalProjectCard = statCards.value.find(card => card.key === 'total')
      if (totalProjectCard) {
        // 使用API返回的total属性作为项目总数
        const totalCount = res.data.total || 0
        // console.log('使用data.total属性:', totalCount)
        
        // 更新卡片值
        totalProjectCard.value = totalCount
        // console.log('更新后的项目总数:', totalCount)
      }
      
      // 统计本月新增项目数量
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      let monthlyNewCount = 0
      
      res.data.list.forEach(project => {
        if (project.createTime) {
          const createDate = new Date(project.createTime)
          if (createDate.getMonth() === currentMonth && createDate.getFullYear() === currentYear) {
            monthlyNewCount++
          }
        }
      })
      
      // console.log('本月新增项目数量:', monthlyNewCount)
      
      // 更新项目总数卡片的副标题
      if (totalProjectCard) {
        totalProjectCard.subtitle = `本月新增 ${monthlyNewCount} 个`
        // console.log('更新后的项目总数卡片副标题:', totalProjectCard.subtitle)
      }
      
      // 统计待办事项数量（status为1、2、3、4、5的项目）
      let pendingCount = 0
      const pendingStatuses = [2,6,9]
      
      res.list.forEach(project => {
        if (project.status !== undefined && pendingStatuses.includes(project.status)) {
          pendingCount++
        }
      })
      
      console.log('待办事项数量:', pendingCount)
      
      // 统计今日需处理项目数量
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      let todayPendingCount = 0
      
      res.list.forEach(project => {
        if (project.status !== undefined && pendingStatuses.includes(project.status)) {
          // 使用createTime字段判断是否为今日创建的项目
          if (project.createTime) {
            // 处理时间戳格式（毫秒级）
            let createTime
            if (typeof project.createTime === 'number') {
              createTime = new Date(project.createTime)
            } else {
              createTime = new Date(project.createTime)
            }
            
            if (createTime >= today && createTime < tomorrow) {
              todayPendingCount++
            }
          }
        }
      })
      
      // console.log('今日需处理项目数量:', todayPendingCount)
      
      // 更新待办事项卡片
      const pendingCard = statCards.value.find(card => card.key === 'pending')
      if (pendingCard) {
        pendingCard.value = pendingCount
        pendingCard.subtitle = `今日需处理 ${todayPendingCount} 项`
        // console.log('更新后的待办事项数量:', pendingCount)
        // console.log('更新后的待办事项副标题:', pendingCard.subtitle)
      }
    } else {
      // console.error('API响应无效:', res)
    }
  } catch (error) {
    // console.error('获取项目总数失败:', error)
    message.error('获取项目总数统计失败')
  }
  
  // 处理紧急任务统计
  try {
    // console.log('开始调用thQdProjectTaskAssignmentPage API')
    // 获取紧急任务统计
    const taskRes = await thQdProjectTaskAssignmentPage({ 
      pageSize: 100, 
      pageNo: 1 ,
      assigneeName: useUserStore().getUser.nickname // 使用用户名过滤
    })
    // console.log('任务API响应数据:', taskRes)
    
    // 收集所有项目ID并预加载项目名称
    if (taskRes && taskRes.list) {
      // console.log('开始收集项目ID...')
      const projectIds = new Set()
      for (const task of taskRes.list) {
        if (task.projectTaskDO && task.projectTaskDO.projectId) {
          projectIds.add(task.projectTaskDO.projectId)
          // console.log(`添加项目ID: ${task.projectTaskDO.projectId}`)
        }
      }
      // console.log(`收集到的项目ID列表:`, Array.from(projectIds))
      // console.log('开始预加载项目名称...')
      await preloadProjectNames(projectIds)
      // console.log('项目名称预加载完成')
    } else {
      // console.log('没有有效的任务数据，跳过项目名称预加载')
    }
    
    // 检查响应是否有效 - API直接返回{list, total}结构
    if (taskRes && taskRes.list && taskRes.total !== undefined) {
      // console.log('任务API响应有效，直接使用total属性')
      
      // 更新紧急任务卡片
      const urgentTaskCard = statCards.value.find(card => card.key === 'urgent')
      if (urgentTaskCard) {
        // 使用API返回的total属性作为任务总数
        const totalCount = taskRes.total || 0
        // console.log('使用任务total属性:', totalCount)
        
        // 统计紧急任务数量（优先级为"高"的任务）
        let urgentCount = 0
        
        // 统计逾期任务数量
        const today = new Date()
        let overdueCount = 0
        
        taskRes.list.forEach(task => {
          // 检查任务优先级
          if (task.projectTaskDO && task.projectTaskDO.priority === '高') {
            urgentCount++
          }
          
          // 检查是否逾期（任务状态不为4时才计入逾期统计）
          if (task.projectTaskDO && task.projectTaskDO.plannedEndDate && task.projectTaskDO.taskStatus !== 4) {
            const endDate = new Date(task.projectTaskDO.plannedEndDate)
            if (endDate < today) {
              overdueCount++
            }
          }
        })
        
        // console.log('逾期任务数量:', overdueCount)
        
        // 更新卡片值、标题和副标题
        urgentTaskCard.value = urgentCount
        urgentTaskCard.title = `紧急任务`
        urgentTaskCard.subtitle = `逾期任务 ${overdueCount} 项`
        // console.log('更新后的紧急任务数量:', urgentCount)
        // console.log('更新后的紧急任务标题:', urgentTaskCard.title)
        // console.log('更新后的紧急任务副标题:', urgentTaskCard.subtitle)
      }
      
      // 将任务数据用于项目进度监控展示
      // console.log('开始处理项目进度监控数据')
      const projectProgressData = []
      
      taskRes.list.forEach(task => {
        // 处理所有任务，但根据不同状态计算进度
        if (!task.projectTaskDO) {
          return
        }
        if (task.projectTaskDO && task.projectTaskDO.projectId) {
          // 查找是否已有该项目的数据
          let projectData = projectProgressData.find(p => p.id === task.projectTaskDO.projectId)
          
          if (!projectData) {
            // 如果没有，创建新的项目数据
            projectData = {
              id: task.projectTaskDO.projectId,
              name: projectNamesCache.value.get(task.projectTaskDO.projectId) || `项目${task.projectTaskDO.projectId}`,
              leader: task.assigneeName || task.projectTaskDO.projectLeader || '未指定',
              tasks: [],
              totalTasks: 0,
              completedTasks: 0
            }
            projectProgressData.push(projectData)
          }

          // 添加任务到项目
          const taskData = {
            id: task.projectTaskDO.id,
            name: task.projectTaskDO.taskTitle || `任务${task.projectTaskDO.id}`,
            status: task.projectTaskDO.taskStatus || 1,
            progress: task.projectTaskDO.completionRate || 0,
            plannedEndDate: task.projectTaskDO.plannedEndDate,
            assigneeName: task.assigneeName || '未指定'
          }
          // console.log(`添加任务到项目${task.projectTaskDO.projectId}:`, taskData)
          projectData.tasks.push(taskData)
          
          // 更新任务总数
          projectData.totalTasks++
          
          // 根据不同任务状态计算进度
          // taskStatus: 1-未开始, 2-进行中, 3-接近完成, 4-已完成
          const taskStatus = task.projectTaskDO.taskStatus || 1
          
          // 根据状态计算进度权重
          let progressWeight = 0
          switch (taskStatus) {
            case 1: // 未开始
              progressWeight = 0
              break
            case 2: // 进行中
              progressWeight = 0.5
              break
            case 3: // 接近完成
              progressWeight = 0.8
              break
            case 4: // 已完成
              progressWeight = 1
              break
            default:
              progressWeight = 0
          }
          
          // 累加进度权重
          projectData.progressWeight = (projectData.progressWeight || 0) + progressWeight
          
          // 统计已完成任务数（状态为4表示已完成）
          if (taskStatus === 4) {
            projectData.completedTasks++
          }
          
 
        }
      })
      
      // 计算项目进度
      projectProgressData.forEach(project => {
        if (project.totalTasks > 0) {
          // 使用进度权重计算项目总进度
          const totalProgressWeight = project.progressWeight || 0
          project.progress = Math.round((totalProgressWeight / project.totalTasks) * 100)
        } else {
          project.progress = 0
        }
        
        // 格式化截止日期
        if (project.tasks.length > 0) {
          // 找到最近的截止日期
          const deadlines = project.tasks
            .filter(task => task.plannedEndDate)
            .map(task => {
              // 处理plannedEndDate数组格式
              if (Array.isArray(task.plannedEndDate) && task.plannedEndDate.length >= 3) {
                return new Date(task.plannedEndDate[0], task.plannedEndDate[1] - 1, task.plannedEndDate[2])
              }
              return new Date(task.plannedEndDate)
            })
            .sort((a, b) => a - b)
          
          if (deadlines.length > 0) {
            const deadline = deadlines[0]
            project.deadline = `${deadline.getFullYear()}年${(deadline.getMonth() + 1).toString().padStart(2, '0')}月${deadline.getDate().toString().padStart(2, '0')}日`
          }
        }
      })
      
      // 更新项目进度数据
      projects.value = projectProgressData
      
      // 更新项目进度监控数据
      progressProjects.value = projectProgressData.map(project => {
        // 根据进度确定状态
        let status, statusText
        if (project.progress >= 100) {
          status = 'completed'
          statusText = '已完成'
        } else if (project.progress >= 80) {
          status = 'near_completion'
          statusText = '接近完成'
        } else if (project.progress > 0) {
          status = 'in_progress'
          statusText = '进行中'
        } else {
          status = 'not_started'
          statusText = '未开始'
        }
        
        return {
          id: project.id,
          name: project.name,
          progress: project.progress,
          status: status,
          statusText: statusText,
          leader: project.leader,
          deadline: project.deadline || '未设置',
          tasks: project.tasks || [],
          totalTasks: project.totalTasks || 0,
          completedTasks: project.completedTasks || 0,
          showTasks: false
        }
      })
      
      // console.log('项目进度监控数据已更新:', projectProgressData)
      // console.log('项目进度卡片数据已更新:', progressProjects.value)
      
      // 检查任务数据
      progressProjects.value.forEach(project => {
        // console.log(`项目${project.id}的任务数据:`, project.tasks)
        // console.log(`项目${project.id}的任务总数:`, project.totalTasks)
        // console.log(`项目${project.id}的已完成任务数:`, project.completedTasks)
      })
    } else if (taskRes && taskRes.code === 0 && taskRes.data) {
      // 处理包装在data中的情况
      // console.log('任务API响应data:', taskRes.data)
      
      // 更新紧急任务卡片
      const urgentTaskCard = statCards.value.find(card => card.key === 'urgent')
      if (urgentTaskCard) {
        // 使用API返回的total属性作为紧急任务总数
        const urgentCount = taskRes.data.total || 0
        // console.log('使用任务data.total属性:', urgentCount)
        
        // 统计逾期任务数量
        const today = new Date()
        let overdueCount = 0
        
        taskRes.data.list.forEach(task => {
          if (task.deadline) {
            const deadline = new Date(task.deadline)
            if (deadline < today) {
              overdueCount++
            }
          }
        })
        
        // console.log('逾期任务数量:', overdueCount)
        
        // 更新卡片值、标题和副标题
        urgentTaskCard.value = urgentCount
        urgentTaskCard.title = `紧急任务`
        urgentTaskCard.subtitle = `逾期任务 ${overdueCount} 项`
        // console.log('更新后的紧急任务数量:', urgentCount)
        // console.log('更新后的紧急任务标题:', urgentTaskCard.title)
        // console.log('更新后的紧急任务副标题:', urgentTaskCard.subtitle)
      }
      
      // 将任务数据用于项目进度监控展示
      // console.log('开始处理项目进度监控数据')
      const projectProgressData = []
      
      taskRes.data.list.forEach(task => {
        // 处理所有任务，但根据不同状态计算进度
        if (!task.projectTaskDO) {
          return
        }
        if (task.projectTaskDO && task.projectTaskDO.projectId) {
          // 查找是否已有该项目的数据
          let projectData = projectProgressData.find(p => p.id === task.projectTaskDO.projectId)
          
          if (!projectData) {
            // 如果没有，创建新的项目数据
            projectData = {
              id: task.projectTaskDO.projectId,
              name: projectNamesCache.value.get(task.projectTaskDO.projectId) || `项目${task.projectTaskDO.projectId}`,
              leader: task.assigneeName || task.projectTaskDO.projectLeader || '未指定',
              taskTitle: task.projectTaskDO.taskTitle || `任务${task.projectTaskDO.id}`, // 添加任务标题
              tasks: [],
              totalTasks: 0,
              completedTasks: 0
            }
            projectProgressData.push(projectData)
          }
          
          // 添加任务到项目
          projectData.tasks.push({
            id: task.projectTaskDO.id,
            name: task.projectTaskDO.taskTitle || `任务${task.projectTaskDO.id}`, // 任务名称使用任务标题
            status: task.projectTaskDO.taskStatus || 0,
            progress: task.projectTaskDO.progress || 0,
            plannedEndDate: task.projectTaskDO.plannedEndDate
          })
          
          // 更新任务总数
          projectData.totalTasks++
          
          // 根据不同任务状态计算进度
          // taskStatus: 1-未开始, 2-进行中, 3-接近完成, 4-已完成
          const taskStatus = task.projectTaskDO.taskStatus || 1
          
          // 根据状态计算进度权重
          let progressWeight = 0
          switch (taskStatus) {
            case 1: // 未开始
              progressWeight = 0
              break
            case 2: // 进行中
              progressWeight = 0.5
              break
            case 3: // 接近完成
              progressWeight = 0.8
              break
            case 4: // 已完成
              progressWeight = 1
              break
            default:
              progressWeight = 0
          }
          
          // 累加进度权重
          projectData.progressWeight = (projectData.progressWeight || 0) + progressWeight
          
          // 统计已完成任务数（状态为4表示已完成）
          if (taskStatus === 4) {
            projectData.completedTasks++
          }
          
        }
      })
      
      // 计算项目进度
      projectProgressData.forEach(project => {
        if (project.totalTasks > 0) {
          // 使用进度权重计算项目总进度
          const totalProgressWeight = project.progressWeight || 0
          project.progress = Math.round((totalProgressWeight / project.totalTasks) * 100)
        } else {
          project.progress = 0
        }
        
        // 格式化截止日期
        if (project.tasks.length > 0) {
          // 找到最近的截止日期
          const deadlines = project.tasks
            .filter(task => task.plannedEndDate)
            .map(task => new Date(task.plannedEndDate))
            .sort((a, b) => a - b)
          
          if (deadlines.length > 0) {
            const deadline = deadlines[0]
            project.deadline = `${deadline.getFullYear()}年${(deadline.getMonth() + 1).toString().padStart(2, '0')}月${deadline.getDate().toString().padStart(2, '0')}日`
          }
        }
      })
      
      // 更新项目进度数据
      projects.value = projectProgressData
      
      // 更新项目进度监控数据
      progressProjects.value = projectProgressData.map(project => {
        // 根据进度确定状态
        let status, statusText
        if (project.progress >= 100) {
          status = 'completed'
          statusText = '已完成'
        } else if (project.progress >= 80) {
          status = 'near_completion'
          statusText = '接近完成'
        } else if (project.progress > 0) {
          status = 'in_progress'
          statusText = '进行中'
        } else {
          status = 'not_started'
          statusText = '未开始'
        }
        
        return {
          id: project.id,
          name: project.name,
          progress: project.progress,
          status: status,
          statusText: statusText,
          leader: project.leader,
          deadline: project.deadline || '未设置',
          tasks: project.tasks || [],
          totalTasks: project.totalTasks || 0,
          completedTasks: project.completedTasks || 0,
          showTasks: false
        }
      })
      
      // console.log('项目进度监控数据已更新:', projectProgressData)
      // console.log('项目进度卡片数据已更新:', progressProjects.value)
    } else {
      // console.error('任务API响应无效:', taskRes)
    }
  } catch (error) {
    // console.error('获取紧急任务失败:', error)
    message.error('获取紧急任务统计失败')
  }
  
  // 处理本周会议统计
  try {
    // console.log('开始调用getTechnologicalMeetingPage API')
    // 获取本周会议统计
    const meetingRes = await getTechnologicalMeetingPage({ pageSize: 100, pageNo: 1 })
    // console.log('会议API响应数据:', meetingRes)
    
    // 检查响应是否有效 - API直接返回{list, total}结构
    if (meetingRes && meetingRes.list && meetingRes.total !== undefined) {
      // console.log('会议API响应有效，直接使用total属性')

      // 更新本周会议卡片的统计信息
      const meetingCard = statCards.value.find(card => card.key === 'meetings')
      if (meetingCard) {
        // 统计本周会议数量
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // 设置为本周第一天（周日）
        startOfWeek.setHours(0, 0, 0, 0)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // 设置为本周最后一天（周六）
        endOfWeek.setHours(23, 59, 59, 999)
        
        let weekMeetingCount = 0
        let todayMeetingCount = 0
        
        meetingRes.list.forEach(meeting => {
          if (meeting.meetingTime) {
            // 处理时间戳格式（毫秒级）
            let meetingTime
            if (typeof meeting.meetingTime === 'number' && meeting.meetingTime > 1000000000000) {
              // 如果是毫秒级时间戳
              meetingTime = new Date(meeting.meetingTime)
            } else if (typeof meeting.meetingTime === 'string' && !isNaN(meeting.meetingTime)) {
              // 如果是数字字符串，尝试转换为时间戳
              const numValue = parseInt(meeting.meetingTime)
              if (numValue > 1000000000000) {
                meetingTime = new Date(numValue)
              } else {
                meetingTime = new Date(meeting.meetingTime)
              }
            } else {
              // 其他格式，直接尝试创建日期对象
              meetingTime = new Date(meeting.meetingTime)
            }
            
            // 统计本周会议
            if (meetingTime >= startOfWeek && meetingTime <= endOfWeek) {
              weekMeetingCount++
            }
            
            // 统计今日会议
            const todayStart = new Date(today)
            todayStart.setHours(0, 0, 0, 0)
            
            const todayEnd = new Date(today)
            todayEnd.setHours(23, 59, 59, 999)
            
            if (meetingTime >= todayStart && meetingTime <= todayEnd) {
              todayMeetingCount++
            }
          }
        })
        
        // console.log('本周会议数量:', weekMeetingCount)
        // console.log('今日会议数量:', todayMeetingCount)
        
        // 更新卡片值和副标题
        const meetingIndex = statCards.value.findIndex(card => card.key === 'meetings')
        if (meetingIndex !== -1) {
          statCards.value[meetingIndex].value = weekMeetingCount
          statCards.value[meetingIndex].subtitle = `今日 ${todayMeetingCount} 场会议`
        }
        // console.log('更新后的本周会议数量:', weekMeetingCount)
        // console.log('更新后的本周会议副标题:', meetingCard.subtitle)
      }
      
      // 将会议数据添加到日历事件
      meetingRes.list.forEach(meeting => {
        // 只处理状态为1的会议
        if (meeting.meetingStatus === 1 && meeting.meetingTime) {
          try {
            // 处理时间戳格式（毫秒级）
            let meetingTime
            if (typeof meeting.meetingTime === 'number' && meeting.meetingTime > 1000000000000) {
              // 如果是毫秒级时间戳
              meetingTime = new Date(meeting.meetingTime)
            } else if (typeof meeting.meetingTime === 'string' && !isNaN(meeting.meetingTime)) {
              // 如果是数字字符串，尝试转换为时间戳
              const numValue = parseInt(meeting.meetingTime)
              if (numValue > 1000000000000) {
                meetingTime = new Date(numValue)
              } else {
                meetingTime = new Date(meeting.meetingTime)
              }
            } else {
              // 其他格式，直接尝试创建日期对象
              meetingTime = new Date(meeting.meetingTime)
            }
            
            // 检查日期是否有效
            if (isNaN(meetingTime.getTime())) {
              console.error(`会议时间无效:`, meeting.meetingTime)
              return
            }
            
            // 使用dayjs格式化日期，确保格式一致
            const dateStr = dayjs(meetingTime).format('YYYY-MM-DD')
            const timeStr = dayjs(meetingTime).format('HH:mm')
            
            // 获取会议名称和描述，根据实际数据格式调整
            const meetingTitle = meeting.meetingName || meeting.meetingNo || meeting.title || meeting.subject || meeting.name || meeting.meeting_title || `会议${meeting.id}`
            const meetingDesc = meeting.meetingInstructions || meeting.meetingMinutes || meeting.meetingContent || meeting.description || meeting.content || meeting.meeting_desc || meeting.remark || '会议详情'
            
            // console.log(`会议${meeting.id}标题:`, meetingTitle)
            // console.log(`会议${meeting.id}日期:`, dateStr)
            // console.log(`会议${meeting.id}时间:`, timeStr)
            
            // 添加到日历事件
            calendarEvents.value.push({
              id: meeting.id,
              date: dateStr,
              time: timeStr,
              title: meetingTitle,
              description: meetingDesc,

              type: 'meeting'
            })
            
            // console.log(`会议${meeting.id}已添加到日历事件`)
          } catch (error) {
            console.error(`处理会议${meeting.id}时出错:`, error)
          }
        }
      })
      
      // console.log('已加载会议事件:', calendarEvents.value)
      // console.log('日历事件总数:', calendarEvents.value.length)
      
      // 强制更新日历
      const tempDate = selectedDate.value
      selectedDate.value = null
      setTimeout(() => {
        selectedDate.value = tempDate
        // console.log('已强制更新日历，当前选中日期:', selectedDate.value.format('YYYY-MM-DD'))
      }, 100)
    } else if (meetingRes && meetingRes.code === 0 && meetingRes.data) {
      // 处理包装在data中的情况
      // console.log('会议API响应data:', meetingRes.data)

      // 更新本周会议卡片
      const meetingCard = statCards.value.find(card => card.key === 'meetings')
      if (meetingCard) {
        // 统计本周会议数量
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // 设置为本周第一天（周日）
        startOfWeek.setHours(0, 0, 0, 0)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // 设置为本周最后一天（周六）
        endOfWeek.setHours(23, 59, 59, 999)
        
        let weekMeetingCount = 0
        let todayMeetingCount = 0
        
        meetingRes.data.list.forEach(meeting => {
          if (meeting.meetingTime) {
            // 处理时间戳格式（毫秒级）
            let meetingTime
            if (typeof meeting.meetingTime === 'number' && meeting.meetingTime > 1000000000000) {
              // 如果是毫秒级时间戳
              meetingTime = new Date(meeting.meetingTime)
            } else if (typeof meeting.meetingTime === 'string' && !isNaN(meeting.meetingTime)) {
              // 如果是数字字符串，尝试转换为时间戳
              const numValue = parseInt(meeting.meetingTime)
              if (numValue > 1000000000000) {
                meetingTime = new Date(numValue)
              } else {
                meetingTime = new Date(meeting.meetingTime)
              }
            } else {
              // 其他格式，直接尝试创建日期对象
              meetingTime = new Date(meeting.meetingTime)
            }
            
            // 统计本周会议
            if (meetingTime >= startOfWeek && meetingTime <= endOfWeek) {
              weekMeetingCount++
            }
            
            // 统计今日会议
            const todayStart = new Date(today)
            todayStart.setHours(0, 0, 0, 0)
            
            const todayEnd = new Date(today)
            todayEnd.setHours(23, 59, 59, 999)
            
            if (meetingTime >= todayStart && meetingTime <= todayEnd) {
              todayMeetingCount++
            }
          }
        })
        
        // console.log('本周会议数量:', weekMeetingCount)
        // console.log('今日会议数量:', todayMeetingCount)
        
        // 更新卡片值和副标题
        const meetingIndex = statCards.value.findIndex(card => card.key === 'meetings')
        if (meetingIndex !== -1) {
          statCards.value[meetingIndex].value = weekMeetingCount
          statCards.value[meetingIndex].subtitle = `今日 ${todayMeetingCount} 场会议`
        }
        // console.log('更新后的本周会议数量:', weekMeetingCount)
        // console.log('更新后的本周会议副标题:', meetingCard.subtitle)
      }
      
      // 将会议数据添加到日历事件
      meetingRes.data.list.forEach(meeting => {
        // 只处理状态为1的会议
        if (meeting.meetingStatus === 1 && meeting.meetingTime) {
          try {
            // 处理时间戳格式（毫秒级）
            let meetingTime
            if (typeof meeting.meetingTime === 'number' && meeting.meetingTime > 1000000000000) {
              // 如果是毫秒级时间戳
              meetingTime = new Date(meeting.meetingTime)
            } else if (typeof meeting.meetingTime === 'string' && !isNaN(meeting.meetingTime)) {
              // 如果是数字字符串，尝试转换为时间戳
              const numValue = parseInt(meeting.meetingTime)
              if (numValue > 1000000000000) {
                meetingTime = new Date(numValue)
              } else {
                meetingTime = new Date(meeting.meetingTime)
              }
            } else {
              // 其他格式，直接尝试创建日期对象
              meetingTime = new Date(meeting.meetingTime)
            }
            
            // 检查日期是否有效
            if (isNaN(meetingTime.getTime())) {
              console.error(`会议时间无效:`, meeting.meetingTime)
              return
            }
            
            // 使用dayjs格式化日期，确保格式一致
            const dateStr = dayjs(meetingTime).format('YYYY-MM-DD')
            const timeStr = dayjs(meetingTime).format('HH:mm')
            
            // 获取会议名称和描述，根据实际数据格式调整
            const meetingTitle = meeting.meetingName || meeting.meetingNo || meeting.title || meeting.subject || meeting.name || meeting.meeting_title || `会议${meeting.id}`
            const meetingDesc = meeting.meetingInstructions || meeting.meetingMinutes || meeting.meetingContent || meeting.description || meeting.content || meeting.meeting_desc || meeting.remark || '会议详情'
            
            // console.log(`会议${meeting.id}标题:`, meetingTitle)
            // console.log(`会议${meeting.id}日期:`, dateStr)
            // console.log(`会议${meeting.id}时间:`, timeStr)
            
            // 添加到日历事件
            calendarEvents.value.push({
              id: meeting.id,
              date: dateStr,
              time: timeStr,
              title: meetingTitle,
              description: meetingDesc,
              type: 'meeting'
            })
            
            // console.log(`会议${meeting.id}已添加到日历事件`)
          } catch (error) {
            console.error(`处理会议${meeting.id}时出错:`, error)
          }
        }
      })
      
      // console.log('已加载会议事件:', calendarEvents.value)
      // console.log('日历事件总数:', calendarEvents.value.length)
      
      // 强制更新日历
      const tempDate = selectedDate.value
      selectedDate.value = null
      setTimeout(() => {
        selectedDate.value = tempDate
        // console.log('已强制更新日历，当前选中日期:', selectedDate.value.format('YYYY-MM-DD'))
      }, 100)
    } else {
      // console.error('会议API响应无效:', meetingRes)
    }
  } catch (error) {
    console.error('获取会议数据失败:', error)
    message.error('获取会议统计失败')
  }
})
</script>

<style scoped>
/* 统计卡片样式 */
.stat-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 14px;
  color: #8c8c8c;
}

.stat-icon {
  flex-shrink: 0;
  margin-left: 16px;
}

/* 提醒横幅样式 */
.reminder-banner {
  background: linear-gradient(135deg, #fff7e6 0%, #fffdf6 100%);
  border: 1px solid #ffd591;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: gentle-glow 2s ease-in-out infinite alternate;
}

@keyframes gentle-glow {
  0% { box-shadow: 0 0 5px rgba(255, 173, 20, 0.2); }
  100% { box-shadow: 0 0 15px rgba(255, 173, 20, 0.4); }
}

.banner-icon {
  color: #faad14;
  font-size: 20px;
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-weight: 600;
  color: #d48806;
  margin-right: 12px;
}

.reminder-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.reminder-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.reminder-tag:hover {
  transform: scale(1.05);
}

/* 主内容区域 */
.dashboard-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}

.dashboard-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 待办事项样式 */
.todo-filter {
  margin-bottom: 16px;
}

.todo-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-todo {
  text-align: center;
  padding: 40px 0;
  color: #8c8c8c;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-todo .anticon {
  font-size: 32px;
  color: #d9d9d9;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.todo-item:hover {
  background-color: #fafafa;
  margin: 0 -12px;
  padding: 12px;
  border-radius: 4px;
}

.todo-item.urgent .todo-title {
  color: #ff4d4f;
  font-weight: 600;
}

.todo-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.todo-info {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.todo-project {
  color: #1890ff;
}

.todo-time {
  color: #faad14;
}

/* 项目进度样式 */
.progress-list {
  max-height: 300px;
  overflow-y: auto;
}

.progress-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.progress-item:last-child {
  border-bottom: none;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-name {
  font-weight: 500;
  color: #262626;
}

.progress-bar {
  margin-bottom: 8px;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8c8c8c;
}

.project-tasks {
  margin-top: 12px;
  border-top: 1px dashed #f0f0f0;
  padding-top: 8px;
}

.task-summary {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.task-summary:hover {
  background-color: #f5f5f5;
}

.toggle-icon {
  font-size: 10px;
  margin-left: 8px;
  transition: transform 0.2s;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #e6f7ff;
  transition: all 0.2s;
}

.task-item:hover {
  background: #f0f9ff;
  transform: translateX(2px);
}

.task-name {
  font-size: 12px;
  color: #262626;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  font-weight: 500;
}

.no-tasks {
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
  padding: 8px 0;
  font-style: italic;
}

/* 日历样式 */
.calendar-container {
  margin-bottom: 16px;
}

:deep(.ant-picker-calendar-full .ant-picker-panel) {
  background: transparent;
}

:deep(.ant-picker-calendar-mini .ant-picker-content) {
  height: 256px;
}

.calendar-cell {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 2px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 0 1px;
}

.event-dot.meeting {
  background-color: #1890ff;
}

.event-dot.review {
  background-color: #52c41a;
}

.event-dot.payment {
  background-color: #faad14;
}

.selected-date-events {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.selected-date-events h4 {
  margin-bottom: 12px;
  color: #262626;
  font-size: 14px;
  font-weight: 600;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
  width: 50px;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
}

.event-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.event-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 快速操作样式 */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-item:hover {
  background: #e6f7ff;
  color: #1890ff;
  transform: translateY(-1px);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-text {
  font-size: 12px;
  text-align: center;
}

/* 通知样式 */
.notifications-list {
  max-height: 200px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 12px;
  color: #595959;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
  
  .stat-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-cards-container {
    grid-template-columns: 1fr;
  }
  
  .reminder-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .reminder-items {
    margin-top: 0;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 通知详情弹窗样式 */
.notice-detail {
  padding: 8px 0;
}

.notice-detail-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.notice-detail-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #262626;
}

.notice-detail-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
}

.notice-detail-content {
  line-height: 1.8;
}

.content-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: #262626;
  font-size: 14px;
}
</style> 