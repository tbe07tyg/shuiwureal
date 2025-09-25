<!--
 * @file 第一步：团队配置步骤组件
 * @description 项目团队成员管理和配置
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="team-configuration-step">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>第一步：团队配置 - v3智能版本</h3>
      <p>管理全局团队成员池，配置角色分工和专业技能。通过项目筛选可查看不同项目的参与成员，高亮边框表示当前项目的活跃参与者。</p>
      <a-alert
        message="跨项目共享说明"
        description="团队成员为真正的跨项目共享配置，所有项目都显示完整的成员池。绿色高亮边框表示当前选中项目的活跃参与成员，所有成员都可在任务分配环节中选择。"
        type="success"
        show-icon
        style="margin-top: 12px;"
      />
    </div>

    <!-- 项目概览 -->
  <a-card class="overview-card" :bordered="false">
      <template #title>
        <div class="card-title-container">
          <div class="title-left">
            <TeamOutlined class="title-icon" />
            <span class="title-text">团队配置</span>
          </div>
          <div class="title-right">
            <div class="project-selector-container">
              <span  style="color: red; font-size: 18px;font-weight: bold;" class="project-selector-label">选择项目 </span>
              <a-select
                v-model:value="manualProjectId"
                show-search
                :filter-option="false"
                :options="projectSelect.options"
                :loading="projectSelect.loading"
                placeholder="请选择项目"
                style="width: 200px; margin-left: 8px"
                @search="onSearchProject"
                @popup-scroll="onProjectScroll"
                @dropdown-visible-change="(open)=>{ if(open && projectSelect.options.length<=1) loadProjects(true) }"
              />
            </div>
            <div class="manager-info-inline" v-if="teamData.projectManager">
              <a-avatar :src="teamData.projectManager?.avatar" size="small">
                {{ teamData.projectManager?.name?.charAt(0) }}
              </a-avatar>
              <span class="manager-name">{{ teamData.projectManager?.name }}</span>
            </div>
          </div>
        </div>
      </template>


      <!-- 团队统计信息 -->
      <a-row :gutter="20">
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.totalMembers }}</div>
            <div class="stat-label">团队总人数</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.totalCurrentTasks }}</div>
            <div class="stat-label">总进行任务</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.totalCompletedTasks }}</div>
            <div class="stat-label">总完成任务</div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.idleMembers }}</div>
            <div class="stat-label">空闲成员</div>
          </div>
        </a-col>
      </a-row>
      
      <a-row :gutter="20" style="margin-top: 16px;">
        <a-col :span="12">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats?.averageCurrentTasks?.toFixed(1) || '0.0' }}</div>
            <div class="stat-label">人均当前任务</div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats?.taskAssignmentRate?.toFixed(1) || '0.0' }}%</div>
            <div class="stat-label">任务分配率</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 团队成员配置 -->
    <a-card title="团队成员配置" class="members-card" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAddMember">
            <PlusOutlined />
            添加成员
          </a-button>
          <!-- <a-button @click="handleBatchImport">
            <ImportOutlined />
            批量导入
          </a-button> -->
        </a-space>
      </template>

      <div class="members-grid">
        <div 
          v-for="member in displayedMembers" 
          :key="member.id"
          class="member-card"
          :class="{ 'active-member': isActiveMember(member.id), 'project-manager': member.isProjectManager }"
        >
          <div class="member-header">
            <a-avatar :src="member.avatar">
              {{ member.name?.charAt(0) }}
            </a-avatar>
            <div class="member-basic">
              <h4>{{ member.name }}</h4>
              <p class="role">{{ member.role }}</p>
              <div class="project-status">
                <a-tag v-if="isActiveMember(member.id)" color="success" size="small">
                  已参与项目：{{ getProjectDisplayNameSync(member.projectId) }}
                </a-tag>
                <a-tag v-else color="default" size="small">
                  未参与项目：{{ getProjectDisplayNameSync(member.projectId) }}
                </a-tag>
              </div>
            </div>
            <a-dropdown>
              <a-button 
                type="text" 
                size="small"
                :disabled="!hasSelectedProject"
                @click="!hasSelectedProject && showProjectSelectWarning()"
              >
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleEditMember(member)" :disabled="!hasSelectedProject">
                    <EditOutlined />
                    编辑
                  </a-menu-item>
                  <a-menu-item 
                    v-if="!isActiveMember(member.id)"
                    @click="handleAddToProject(member.id)"
                    :disabled="!hasSelectedProject"
                  >
                    <UserAddOutlined />
                    加入当前项目
                  </a-menu-item>
                  <a-menu-item 
                    v-if="isActiveMember(member.id)"
                    @click="handleRemoveFromProject(member.id)"
                    :disabled="!hasSelectedProject"
                  >
                    <UserDeleteOutlined />
                    退出当前项目
                  </a-menu-item>
                  <a-divider style="margin: 4px 0;" />
                  <a-menu-item
                  @click="handleRemoveMember(member.id)" 
                  :disabled="!hasSelectedProject"
                  class="danger-item">
                    <DeleteOutlined />
                    删除成员
                  </a-menu-item>
                  

                  <a-menu-item  
                    v-if="!hasSelectedProject"
                  disabled>
                    <span style="color: red; font-size: 16px;">
                      提示：请先选择项目后再进行操作
                    </span>
                  </a-menu-item>



                </a-menu>
              </template>
            </a-dropdown>
          </div>

          <div class="member-details">
            <!-- 专长技能（始终显示） -->
            <div class="detail-item">
              <span class="label">专长：</span>
              <div class="skills">
                <template v-if="member.skills && member.skills.length > 0">
                  <a-tag v-for="skill in member.skills" :key="skill" size="small">
                    {{ skill }}
                  </a-tag>
                </template>
                <a-tag v-else size="small" color="default">
                  无
                </a-tag>
              </div>
            </div>
            
                        <!-- 项目任务情况 -->
            <div class="task-stats">
              <div class="project-section">
                <div class="section-title">
                  <span class="title-text">项目任务情况</span>
                  <a-tag size="small" :color="getProjectTagColor()">{{ getProjectDisplayNameSync(member.projectId) }}</a-tag>
                </div>
                <div class="stat-row">
                  <div class="stat-item current-project">
                    <div class="stat-number">{{ member.taskStats?.currentTasks || 0 }}</div>
                    <div class="stat-label">进行中</div>
                  </div>
                  <div class="stat-item completed-project">
                    <div class="stat-number">{{ member.taskStats?.completedTasks || 0 }}</div>
                    <div class="stat-label">已完成</div>
                  </div>
                  <div class="stat-item pending-project">
                    <div class="stat-number">{{ member.taskStats?.pendingTasks || 0 }}</div>
                    <div class="stat-label">待开始</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="teamMembers.length > 0">
        <a-pagination
          v-model:current="pagination.current"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :showSizeChanger="pagination.showSizeChanger"
          :showQuickJumper="pagination.showQuickJumper"
          :showTotal="pagination.showTotal"
          :show-less-items="true"
          @change="handlePageChange"
    
        />
      </div>

      <!-- 空状态 -->
      <div v-if="!teamMembers || teamMembers.length === 0" class="empty-members">
        <a-empty description="暂无团队成员">
          <a-button type="primary" @click="handleAddMember">
            添加第一个成员
          </a-button>
        </a-empty>
      </div>
    </a-card>



    <!-- 操作按钮 -->
    <div class="step-actions">
      <a-space>
        <!-- <a-button size="large" @click="handleSaveConfig">
          <SaveOutlined />
          保存配置
        </a-button> -->
        <a-button type="primary" size="large" @click="handleNextStep">
          下一步：申报书解析
          <ArrowRightOutlined />
        </a-button>
      </a-space>
    </div>

    <!-- 添加/编辑成员弹窗 -->
    <a-modal
      v-model:open="memberModalVisible"
      :title="editingMember ? '编辑成员' : '添加成员'"
      width="600px"
      @ok="handleMemberModalOk"
      @cancel="handleMemberModalCancel"
    >
      <a-form
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberFormRules"
        layout="vertical"
      >
        <a-form-item label="姓名" name="name">
          <a-select
            v-model:value="memberForm.name"
            placeholder="请选择成员"
            :options="userSelect.options"
            :loading="userSelect.loading"
            show-search
            :filter-option="filterUserOption"
            :disabled="!!editingMember"
          >
            <template #option="{ label, avatar }">
              <div style="display: flex; align-items: center">
                <a-avatar :src="avatar" style="margin-right: 8px">
                  {{ label?.charAt(0) }}
                </a-avatar>
                {{ label }}
              </div>
            </template>
          </a-select>
        </a-form-item>
        
                <a-form-item label="角色" name="role">
          <a-select v-model:value="memberForm.role" placeholder="请选择角色">
              <a-select-option value="项目负责人">项目负责人</a-select-option>
              <a-select-option value="团队成员">团队成员</a-select-option>
              <a-select-option value="研究员">研究员</a-select-option>
              <a-select-option value="助理研究员">助理研究员</a-select-option>
              <a-select-option value="博士研究生">博士研究生</a-select-option>
              <a-select-option value="硕士研究生">硕士研究生</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="专长技能（可选）" name="skills">
          <a-select
            v-model:value="memberForm.skills"
            mode="tags"
            placeholder="请输入或选择技能标签（可选）"
            :options="skillOptions"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  ImportOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowRightOutlined,
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store/modules/user'//获取登录用户信息
import { getTechnologicalProjectPage } from '@/api/th_qd/approval'
import App from '@/App.vue'
import { getUserPage } from '@/api/system/user'
import {
      thQdProjectTeamMemberUpdate,
      thQdProjectTeamMemberCreate,
      thQdProjectTeamMemberDelete,
      thQdProjectTeamMemberPage,
      thQdProjectTeamMemberList
} from '@/api/th_qd/v3/team'

import { 
  thQdProjectTaskAssignmentPage
} from '@/api/th_qd/myTask/assignment'
import { getTechnologicalProject } from '@/api/th_qd/approval'

const userStore = useUserStore()
const router = useRouter()



// Props
const props = defineProps({
  teamData: {
    type: Object,
    default: () => ({
      projectManager: null,
      members: []
    })
  },
  selectedProject: {
    type: Object,
    default: () => null
  },
  activeMemberIds: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'save-config',
  'add-member',
  'edit-member',
  'remove-member',
  'add-to-project',
  'remove-from-project',
  'update-members'
])

// 响应式数据
const memberModalVisible = ref(false)
const editingMember = ref(null)
const memberFormRef = ref()
const manualProjectId = ref('ALL_PROJECTS')

// 本地团队成员列表
const teamMembers = ref([])

// 分页相关变量
const pagination = reactive({
  current: 1,
  pageSize: 8,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条数据`
})

// 当前页显示的团队成员
const displayedMembers = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return teamMembers.value.slice(start, end)
})

// 项目名称缓存
const projectNamesCache = reactive({})

// 获取项目显示名称的同步版本，用于模板
const getProjectDisplayNameSync = (projectId) => {
  // 如果没有传入projectId，使用当前选中的项目ID
  const targetProjectId = projectId || manualProjectId.value

  if (targetProjectId === 'ALL_PROJECTS') {
    return '全部项目'
  }

  // 从项目选项中查找对应的项目名称
  const project = projectSelect.options.find(option => option.value === String(targetProjectId))
  if (project?.label) {
    return project.label
  }
  
  // 从缓存中查找
  if (projectNamesCache[targetProjectId]) {
    return projectNamesCache[targetProjectId]
  }
  
  // 异步获取项目名称
  getProjectDisplayName(targetProjectId).then(name => {
    projectNamesCache[targetProjectId] = name
  })
  
  // 返回默认值，等待异步加载
  return props.selectedProject?.name || `项目${targetProjectId}`
}

// 项目下拉（分页搜索）
const projectSelect = reactive({
  options: [{ label: '全部项目', value: 'ALL_PROJECTS' }],
  loading: false,
  pageNo: 1,
  pageSize: 100,
  total: 0,
  keyword: ''
})

// 用户下拉列表
const userSelect = reactive({
  options: [],
  loading: false
})

// 用户搜索过滤函数
const filterUserOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 加载用户数据
const loadUsers = async () => {
  userSelect.loading = true
  try {
    const res = await getUserPage({ pageNo: 1, pageSize: 100 })
    const list = res?.data?.list || res?.data?.records || res?.list || []
    userSelect.options = list.map(user => ({
      label: user.nickname || user.username || `用户${user.id}`,
      value: String(user.id),
      avatar: user.avatar
    }))
    console.log('用户列表加载完成：', userSelect.options)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    message.error('获取用户列表失败')
  } finally {
    userSelect.loading = false
  }
}

// 加载团队成员数据
const loadTeamMembers = async () => {
  try {
    const params = {
      pageNo: 1,
      pageSize: 100
    }
    
    // 如果选择了特定项目，则添加项目ID过滤条件
    if (manualProjectId.value && manualProjectId.value !== 'ALL_PROJECTS') {
      params.projectId = manualProjectId.value
    }
    
    console.log('正在请求团队成员数据，参数：', params)
    const res = await thQdProjectTeamMemberPage(params)
    console.log('获取团队成员数据响应：', res)
    
    // 根据实际响应结构处理数据
    const list = res?.list || res?.data?.list || res?.data?.records || res?.data?.items || []
    
    // 将获取到的成员数据转换为组件需要的格式
    let members = []
    try {
      if (Array.isArray(list) && list.length > 0) {
        members = list.map(member => ({
          id: member.id || member.memberId || `M${Date.now()}`,
          name: member.memberName || member.name || '未命名成员',
          role: member.memberRole || member.role || '团队成员',
          skills: member.memberSkills || member.skills || [],
          avatar: member.avatarUrl || member.avatar || '',
          isActiveMember: member.isActiveMember || false,
          isProjectManager: member.isProjectManager || false,
          projectId: member.projectId || member.memberProjectId || props.selectedProject?.id || 'ALL_PROJECTS',
        }))
        console.log('转换后的成员数据：', members)
      } else {
        console.log('API返回的成员列表为空或不是数组')
      }
    } catch (error) {
      console.error('转换成员数据时出错：', error)
    }
    
    // 为每个成员加载任务统计信息
    const membersWithStats = await Promise.all(members.map(async (member) => {
      try {
        // 调用任务统计API
        const taskStats = await getMemberTaskStats(member)
        return {
          ...member,
          taskStats
        }
      } catch (error) {
        console.error(`获取成员 ${member.name} 的任务统计失败:`, error)
        return {
          ...member,
          taskStats: { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
        }
      }
    }))
    
    // 直接更新团队成员列表，不使用复杂的响应式操作
    teamMembers.value = Array.isArray(membersWithStats) ? membersWithStats : []
    // 更新分页信息
    pagination.total = teamMembers.value.length
    // 重置到第一页
    pagination.current = 1
    console.log('团队成员列表已更新，当前成员数量：', teamMembers.value.length)
    // 同时也通过emit将成员数据传递给父组件
    emit('update-members', membersWithStats)
  } catch (error) {
    console.error('获取团队成员列表失败:', error)
    message.error('获取团队成员列表失败')
  }
}

// 初始化函数
const init = () => {
  // 初始加载项目数据
  loadProjects(true)
  // 加载用户数据
  loadUsers()
  // 加载团队成员数据
  loadTeamMembers()
}

// 组件挂载后调用初始化函数
onMounted(() => {
  init()
})

// 监听项目选择变化，重新加载团队成员列表
watch(manualProjectId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('项目选择变化，重新加载团队成员列表：', newVal)
    loadTeamMembers()
  }
})

// 成员表单数据
const memberForm = reactive({
  name: '',
  role: '',
  skills: []
})

// 表单验证规则
const memberFormRules = {
  name: [
    { required: true, message: '请输入成员姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择成员角色', trigger: 'change' }
  ]
  // skills 改为非必填，移除验证规则
}

// 技能选项
const skillOptions = ref([
  { label: '理论研究', value: '理论研究' },
  { label: '实验设计', value: '实验设计' },
  { label: '数据分析', value: '数据分析' },
  { label: '算法设计', value: '算法设计' },
  { label: '系统开发', value: '系统开发' },
  { label: '文献调研', value: '文献调研' },
  { label: '报告撰写', value: '报告撰写' },
  { label: '项目管理', value: '项目管理' },
  { label: '技术验证', value: '技术验证' },
  { label: '成果转化', value: '成果转化' },
  { label: '学术交流', value: '学术交流' },
  { label: '专利申请', value: '专利申请' }
])

// 计算属性：判断是否已选择项目
const hasSelectedProject = computed(() => {
  return manualProjectId.value && manualProjectId.value !== 'ALL_PROJECTS'
})

// 显示项目选择提示
const showProjectSelectWarning = () => {
  message.warning('请选择项目')
}

// 计算属性
const teamStats = computed(() => {
  const members = teamMembers.value || []
  const totalMembers = members.length
  
  if (totalMembers === 0) {
    return {
      totalMembers: 0,
      totalCurrentTasks: 0,
      totalCompletedTasks: 0,
      idleMembers: 0,
      averageCurrentTasks: 0,
      taskAssignmentRate: 0,
      taskBalance: 100,
      efficiencyIndex: 0
    }
  }

  // 计算任务统计
  let totalCurrentTasks = 0
  let totalCompletedTasks = 0
  let busyMembers = 0
  const currentTaskCounts = []

  // 遍历成员，计算任务统计
  if (Array.isArray(members)) {
    members.forEach(member => {
      try {
        const taskStats = member.taskStats || { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
        totalCurrentTasks += taskStats.currentTasks || 0
        totalCompletedTasks += taskStats.completedTasks || 0
        currentTaskCounts.push(taskStats.currentTasks || 0)
        if (member.isActiveMember) busyMembers++
      } catch (error) {
        console.error('计算成员任务统计时出错：', error, member)
      }
    })
  }

  const idleMembers = totalMembers - busyMembers

  // 计算有任务的成员数
  let membersWithTasks = 0
  if (Array.isArray(members)) {
    members.forEach(member => {
      const taskStats = member.taskStats || { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
      const totalMemberTasks = (taskStats.currentTasks || 0) + (taskStats.completedTasks || 0) + (taskStats.pendingTasks || 0)
      // console.log(`成员 ${member.name} 任务统计:`, taskStats, '总任务数:', totalMemberTasks)
      if (totalMemberTasks > 0) membersWithTasks++
    })
  }

  // 计算总待开始任务数
  let totalPendingTasks = 0
  if (Array.isArray(members)) {
    members.forEach(member => {
      const taskStats = member.taskStats || { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
      totalPendingTasks += taskStats.pendingTasks || 0
    })
  }
  
  // 人均任务数 = (总进行任务数 + 总完成任务数 + 总待开始任务数) / 总成员数
  const averageCurrentTasks = totalMembers > 0 ? (totalCurrentTasks + totalCompletedTasks + totalPendingTasks) / totalMembers : 0
  
  
  // 任务分配率 = 有任务的成员数 / 总成员数
  const taskAssignmentRate = totalMembers > 0 ? (membersWithTasks / totalMembers) * 100 : 0

  // 计算任务负荷均衡度（基于当前任务数的标准差）
  const avgCurrentTasks = currentTaskCounts.length > 0 
    ? currentTaskCounts.reduce((sum, count) => sum + count, 0) / currentTaskCounts.length 
    : 0
  const variance = currentTaskCounts.length > 0 
    ? currentTaskCounts.reduce((sum, count) => sum + Math.pow(count - avgCurrentTasks, 2), 0) / currentTaskCounts.length 
    : 0
  const standardDeviation = Math.sqrt(variance)
  const taskBalance = avgCurrentTasks > 0 ? Math.max(0, Math.round(100 - (standardDeviation / avgCurrentTasks) * 100)) : 100

  // 计算技能覆盖度
  const allSkills = new Set()
  try {
    if (Array.isArray(members)) {
      members.forEach(member => {
        if (member && Array.isArray(member.skills)) {
          member.skills.forEach(skill => {
            if (skill && typeof skill === 'string') {
              allSkills.add(skill)
            }
          })
        }
      })
    }
  } catch (error) {
    console.error('计算技能覆盖度时出错：', error)
  }
  const skillCoverage = Math.min(100, Math.round(allSkills.size * 8.33)) // 假设12个技能为100%

  // 计算团队效率指数（综合多个因素）
  const efficiencyIndex = (
    (taskAssignmentRate * 0.3) + 
    (taskBalance * 0.3) + 
    (skillCoverage * 0.2) + 
    ((totalCompletedTasks / Math.max(1, totalCurrentTasks + totalCompletedTasks)) * 100 * 0.2)
  ) / 10

  return {
    totalMembers,
    totalCurrentTasks,
    totalCompletedTasks,
    idleMembers,
    averageCurrentTasks,
    taskAssignmentRate,
    taskBalance: isNaN(taskBalance) ? 100 : taskBalance,
    efficiencyIndex: isNaN(efficiencyIndex) ? 0 : efficiencyIndex
  }
})



// 获取项目显示名称
const getProjectDisplayName = async (projectId) => {
  // 如果没有传入projectId，使用当前选中的项目ID
  const targetProjectId = projectId || manualProjectId.value
  
  if (targetProjectId === 'ALL_PROJECTS') {
    return '全部项目'
  }
  
  // 从项目选项中查找对应的项目名称
  const project = projectSelect.options.find(option => option.value === String(targetProjectId))
  if (project?.label) {
    return project.label
  }
  
  // 如果在项目选项中找不到，尝试通过API获取项目信息
  try {
    const projectData = await getTechnologicalProject(targetProjectId)
    return projectData?.projectName || projectData?.name || `项目${targetProjectId}`
  } catch (error) {
    console.error(`获取项目ID ${targetProjectId} 的信息失败:`, error)
    return props.selectedProject?.name || `项目${targetProjectId}`
  }
}

// 获取项目标签颜色
const getProjectTagColor = () => {
  if (props.selectedProject?.id === 'ALL_PROJECTS') {
    return 'purple'
  }
  return 'blue'
}

// 分页变化处理
const handlePageChange = (page, pageSize) => {
  pagination.current = page
  pagination.pageSize = pageSize
}

// 每页条数变化处理
const handleSizeChange = (current, size) => {
  pagination.current = current
  pagination.pageSize = size
}

// 判断成员是否为当前项目的活跃参与者
const isActiveMember = (memberId) => {
  // 查找成员对象
  const member = teamMembers.value.find(m => m.id === memberId)
  // 直接检查成员的isActiveMember属性
  return member?.isActiveMember || false
}

// 获取成员任务统计（通过API调用获取真实数据）
const getMemberTaskStats = async (member) => {
  // 默认值
  let currentTasks = 0
  let completedTasks = 0
  let pendingTasks = 0
    // 调用API获取任务分配数据
    // const response = await thQdProjectTaskAssignmentPage(params)
    
    // // 处理响应数据
    // const taskList = response?.list || response?.data?.list || response?.data?.records || []
  try {
  
    // 准备请求参数
    const params = {
      pageNo: 1,
      pageSize: 100, // 获取足够多的数据
      assigneeName: member.name, // 使用成员名称作为查询条件
    }
    // console.log('获取成员任务统计参数:', params)
    
    // 如果选择了特定项目，则添加项目ID过滤条件
    if (manualProjectId.value && manualProjectId.value !== 'ALL_PROJECTS') {
      params.projectId = manualProjectId.value
    }
  
    // 调用API获取任务分配数据
    const response = await thQdProjectTaskAssignmentPage(params)
    
    // 处理响应数据
    const taskList = response?.list || response?.data?.list || response?.data?.records || []
  
    // 统计不同状态的任务数量
    if (Array.isArray(taskList) && taskList.length > 0) {
      taskList.forEach(task => {
        const taskStatus = task.projectTaskDO?.taskStatus || task.taskStatus || 1
        
        // 根据任务状态统计
        if (taskStatus === 1) { // 待开始
          pendingTasks++
        } else if (taskStatus === 2 || taskStatus === 3) { // 进行中
          currentTasks++
        } else if (taskStatus === 4) { // 已完成
          completedTasks++
        }
      })
    }
  } catch (error) {
    console.error(`获取成员 ${member.name} 的任务统计数据失败:`, error)
    // 如果API调用失败，返回默认值
  }
  // 直接返回统计结果，不使用随机生成的数据

  return { currentTasks, completedTasks, pendingTasks }
}



const getBalanceColor = (balance) => {
  if (balance >= 80) return '#52c41a'  // 绿色 - 很好
  if (balance >= 60) return '#faad14'  // 橙色 - 一般
  if (balance >= 40) return '#ff7875'  // 浅红色 - 较差
  return '#ff4d4f'  // 红色 - 很差
}

const handleAddMember = () => {
  // 检查是否选择了项目
  if (!manualProjectId.value || manualProjectId.value === 'ALL_PROJECTS') {
    message.warning('请先选择项目，再添加成员')
    return
  }
  
  editingMember.value = null
  resetMemberForm()
  memberModalVisible.value = true
}

const handleEditMember = (member) => {
  editingMember.value = member
  memberForm.name = member.name
  memberForm.role = member.role
  memberForm.skills = [...(member.skills || [])]
  memberModalVisible.value = true
}

const handleRemoveMember = (id) => {
  const member = teamMembers.value.find(m => m.id === id)
  if (!member) return
  Modal.confirm({
    title: '确认删除成员',
    content: `确定要删除成员 ${member.name} 吗？此操作不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 调用API删除成员
        const response = await thQdProjectTeamMemberDelete(member.id)
        console.log('删除成员响应:',member.id)
        if (response.code === 0) {
          message.success(`已成功删除成员 ${member.name}`)
          // 刷新团队成员列表
          loadTeamMembers()
          // 触发事件
          emit('remove-member', id)
        } else {
          message.success(`已成功删除成员 ${member.name}`)
            // 刷新团队成员列表
          loadTeamMembers()
        }
      } catch (error) {
        console.error('删除成员失败:', error)
        message.error('删除成员失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 添加成员到当前项目
const handleAddToProject = async (memberId) => {
  const member = teamMembers.value.find(m => m.id === memberId)
  if (!member) return
  
  try {
    // 调用API更新成员的isActiveMember状态为true
    const requestData = {
      id: memberId,
      isActiveMember: true,
      isProjectManager: member.role === '项目负责人'
    }
    console.log('更新成员活跃状态请求:', requestData)
    const response = await thQdProjectTeamMemberUpdate(requestData)
    console.log('更新成员活跃状态响应:', response)
    
    if (response.code === 0) {
      message.success(`已将 ${member.name} 添加到当前项目`)
      // 刷新团队成员列表
      loadTeamMembers()
      // 触发事件
      emit('add-to-project', { memberId, memberName: member.name })
    } else {
      message.success(`已将 ${member.name} 添加到当前项目`)
      // 刷新团队成员列表
      loadTeamMembers()
    }
  } catch (error) {
    console.error('添加成员到项目失败:', error)
    message.error('添加成员到项目失败: ' + (error.message || '未知错误'))
  }
}

// 从当前项目移除成员
const handleRemoveFromProject = (memberId) => {
  const member = teamMembers.value.find(m => m.id === memberId)
  if (!member) return
  
  Modal.confirm({
    title: '确认退出项目',
    content: `确定要将 ${member.name} 从当前项目中移除吗？`,
    okText: '确认移除',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        // 调用API更新成员的isActiveMember状态为false
        const requestData = {
          id: memberId,
          isActiveMember: false,
          isProjectManager: member.role === '项目负责人'
        }
        console.log('更新成员活跃状态请求:', requestData)
        const response = await thQdProjectTeamMemberUpdate(requestData)
        console.log('更新成员活跃状态响应:', response)
        
        if (response.code === 0) {
          message.success(`已将 ${member.name} 从当前项目中移除`)
          // 刷新团队成员列表
          loadTeamMembers()
          // 触发事件
          emit('remove-from-project', { memberId, memberName: member.name })
        } else {
          message.success(`已将 ${member.name} 从当前项目中移除`)
          // 刷新团队成员列表
          loadTeamMembers()
        }
      } catch (error) {
        console.error('从项目移除成员失败:', error)
        message.error('从项目移除成员失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

const handleBatchImport = () => {
  message.info('批量导入功能开发中')
}

const handleSaveConfig = () => {
  // 创建包含当前团队成员数据的配置对象
  const config = {
    ...props.teamData,
    members: teamMembers.value
  }
  emit('save-config', config)
}

const handleNextStep = async () => {
  // try {
  //   // 先保存配置，然后跳转到下一步
  //   const config = {
  //     ...props.teamData,
  //     members: teamMembers.value
  //   }
  //   emit('save-config', config)
  //   message.success('团队配置已保存，进入下一步')
    
    // 跳转到下一步
    router.push('/th-qd-implementation-v3/proposal-analysis')
}
//   } catch (error) {
//     console.error('跳转失败:', error)
//     message.error('跳转失败: ' + (error.message || '未知错误'))
//   }
//   // // 这里可以触发父组件切换到下一步
//   // message.success('团队配置已保存，进入下一步')
// }

const resetMemberForm = () => {
  memberForm.name = ''
  memberForm.role = ''
  memberForm.skills = []
}

const handleMemberModalOk = async () => {
  try {
    await memberFormRef.value.validate()
    
    const memberData = {
      id: editingMember.value?.id || `M${Date.now()}`,
      name: memberForm.name,
      role: memberForm.role,
      skills: JSON.stringify(memberForm.skills || []),
    }

    if (editingMember.value) {
      // 调用API更新团队成员
      try {
        // 构造请求数据
        const requestData = {
          id: editingMember.value.id,
          memberRole: memberForm.role,
          memberSkills: JSON.stringify(memberForm.skills || []),
          
        }
        console.log('更新成员请求:', requestData)
        // 调用API更新团队成员
        const response = await thQdProjectTeamMemberUpdate(requestData)
        console.log('更新成员响应:', response)
        if (response.code === 0) {
          message.success('成员更新成功')
          // 刷新团队成员列表
          loadTeamMembers()
        } else {
          message.success('成员更新成功')
          loadTeamMembers()
        }
      } catch (error) {
        console.error('更新成员失败:', error)
        message.error('更新成员失败')
      }
    } else {
      // 调用API创建团队成员
      try {
        // 获取用户ID和名称
        const memberId = memberForm.name
        const memberName = userSelect.options.find(user => user.value === memberId)?.label || ''
        
        // 构造请求数据
        const requestData = {
          projectId: manualProjectId.value,
          memberId: memberId,
          memberName: memberName,
          memberRole: memberForm.role,
          memberSkills: JSON.stringify(memberForm.skills || []),
          isProjectManager: 0,
          isActiveMember: 0,
          avatarUrl: userSelect.options.find(user => user.value === memberId)?.avatar || '', 
        }
        console.log('添加成员响应:', requestData)
        // 调用API创建团队成员
        const response = await thQdProjectTeamMemberCreate(requestData)
        console.log('添加成员响应:', response)
        if (response.code === 0) {
          message.success('成员添加成功')
          // 刷新团队成员列表
          loadTeamMembers()
        } else {
          // message.error(response.msg || '添加成员失败')
          message.success('成员添加成功')
          // 刷新团队成员列表
          loadTeamMembers()
        }
      } catch (error) {
        console.error('添加成员失败:', error)
        // message.error('添加成员失败: ' + (error.message || '未知错误'))
      }
    }

    memberModalVisible.value = false
    resetMemberForm()
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const handleMemberModalCancel = () => {
  memberModalVisible.value = false
  resetMemberForm()
}

// 项目搜索相关函数
const loadProjects = async (reset = false) => {
  if (reset) {
    projectSelect.pageNo = 1
    projectSelect.options = [{ label: '全部项目', value: 'ALL_PROJECTS' }]
  }
  projectSelect.loading = true
  const params = {
    pageNo: projectSelect.pageNo,
    pageSize: projectSelect.pageSize,
    applicant:useUserStore().getUser.nickname,
    status: 8 // 只获取立项通过的项目 (PROJECT_APPROVED = 8)
  }
  try {
    console.log('正在请求项目数据，参数：', params)
    const res = await getTechnologicalProjectPage(params)
    console.log('获取项目数据响应：', res)
    // 根据实际响应结构处理数据
    const list = res?.list || res?.data?.list || res?.data?.records || res?.data?.items || []
    projectSelect.total = res?.total || res?.data?.total || res?.data?.count || 0
    const newOptions = list.map((p) => ({ label: p.projectName || p.name || `项目${p.id}`, value: String(p.id) }))
    
    if (reset) {
      // 重置时，保留"全部项目"选项，然后添加新选项
      projectSelect.options = [{ label: '全部项目', value: 'ALL_PROJECTS' }, ...newOptions]
    } else {
      // 非重置时，追加新选项
      projectSelect.options = [...projectSelect.options, ...newOptions]
    }
    
    console.log('更新后的选项：', projectSelect.options)
  } catch (error) {
    console.error('获取项目列表失败:', error)
  } finally {
    projectSelect.loading = false
  }
}

const onSearchProject = (q) => {
  projectSelect.keyword = q
  loadProjects(true)
}

const onProjectScroll = (e) => {
  const target = e?.target
  if (!target) return
  if (target.scrollTop + target.offsetHeight + 10 >= target.scrollHeight) {
    if (projectSelect.options.length < projectSelect.total && !projectSelect.loading) {
      projectSelect.pageNo += 1
      loadProjects(false)
    }
  }
}
</script>

<style scoped>
.team-configuration-step {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-description {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  border: 1px solid #d6e4ff;
}

.step-description h3 {
  color: #234fa2;
  font-size: 20px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.step-description p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.manager-card,
.members-card,
.stats-card,
.overview-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

/* 项目概览区域样式 */
.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  color: #234fa2;
}

.card-title > span {
  margin-left: 8px;
}

.card-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.title-left {
  display: flex;
  align-items: center;
}

.title-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  color: #234fa2;
  font-size: 20px;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  color: #234fa2;
}

.project-selector-container {
  display: flex;
  align-items: center;
}

.project-selector-label {
  font-size: 14px;
  color: #64748b;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}

.project-selector-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.manager-info-inline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manager-name {
  font-size: 16px;
  font-weight: 600;
  color: #234fa2;
}

/* 统计卡片样式 - 适合中年用户 */
.stat-card {
  background: #fafbfc;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  border-color: #234fa2;
  box-shadow: 0 4px 12px rgba(35,79,162,0.15);
  transform: translateY(-2px);
}



.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #234fa2;
  margin-bottom: 8px;
  line-height: 1.2;
}

.stat-label {
  font-size: 15px;
  color: #64748b;
  font-weight: 600;
  line-height: 1.4;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.member-card {
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  padding: 16px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.member-card:hover {
  border-color: #234fa2;
  box-shadow: 0 2px 8px rgba(35,79,162,0.1);
}

/* 活跃成员高亮样式 */
.member-card.active-member {
  border: 2px solid #52c41a;
  background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
  position: relative;
}

.member-card.active-member::before {
  content: '参与中';
  position: absolute;
  top: -1px;
  right: -1px;
  background: #52c41a;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 0 6px 0 8px;
  font-weight: 600;
  z-index: 1;
}

.member-card.active-member:hover {
  border-color: #389e0d;
  box-shadow: 0 6px 16px rgba(82, 196, 26, 0.25);
}

/* 项目负责人高亮样式已移除 */



.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.member-basic {
  flex: 1;
}

.member-basic h4 {
  margin: 0 0 4px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.member-basic .role {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.member-basic .project-status {
  margin-top: 6px;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-item .label {
  color: #64748b;
  min-width: 60px;
  font-weight: 600;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.task-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 项目区域样式 */
.project-section {
  padding: 12px;
  border-radius: 8px;
  background: #fafbfc;
  border: 1px solid #e6eaf2;
  border-left: 4px solid #1890ff;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #234fa2;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 10px 6px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

/* 当前项目任务样式 */
.stat-item.current-project {
  background: #fff7e6;
  border-color: #ffd591;
}

.stat-item.completed-project {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.stat-item.pending-project {
  background: #f0f7ff;
  border-color: #91d5ff;
}



.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #234fa2;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
  line-height: 1;
}

.work-status {
  padding: 8px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e6eaf2;
}

.status-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.capacity-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-label {
  font-size: 11px;
  color: #8c8c8c;
  font-weight: 500;
}

.capacity-text {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  padding: 2px 6px;
  background: #e6f4ff;
  border-radius: 3px;
}

.empty-members {
  text-align: center;
  padding: 40px;
}

.step-actions {
  display: flex;
  justify-content: center;
  padding: 24px;
  border-top: 1px solid #e6eaf2;
  background: #fafbfc;
  border-radius: 0 0 12px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
  
  .member-header {
    flex-wrap: wrap;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .stat-row {
    flex-direction: column;
    gap: 6px;
  }
  
  .stat-item {
    padding: 6px 4px;
  }
  
  .stat-number {
    font-size: 14px;
  }
  
  .work-status {
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
  }

  .step-actions {
    padding: 16px;
  }

  .step-actions :deep(.ant-space) {
    width: 100%;
    justify-content: center;
  }

  .step-actions :deep(.ant-btn) {
    flex: 1;
  }
}

/* 菜单项样式 */
:deep(.danger-item) {
  color: #ff4d4f;
}

:deep(.danger-item:hover) {
  background-color: #fff2f0;
}
</style>
