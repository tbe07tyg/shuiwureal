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
              <span class="project-selector-label">选择项目</span>
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
            <div class="stat-number">{{ teamStats.averageCurrentTasks.toFixed(1) }}</div>
            <div class="stat-label">人均当前任务</div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="stat-card">
            <div class="stat-number">{{ teamStats.taskAssignmentRate.toFixed(1) }}%</div>
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
          <a-button @click="handleBatchImport">
            <ImportOutlined />
            批量导入
          </a-button>
          <a-button @click="refreshAllCache" title="刷新任务统计数据">
            <ReloadOutlined />
            刷新数据
          </a-button>
        </a-space>
      </template>

      <div class="members-grid">
        <div 
          v-for="member in renderMembers" 
          :key="member.id"
          class="member-card"
          :class="{ 'active-member': isActiveMember(member.id) }"
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
                  参与当前项目
                </a-tag>
                <a-tag v-else color="default" size="small">
                  未参与当前项目
                </a-tag>
              </div>
            </div>
            <a-dropdown>
              <a-button type="text" size="small">
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleEditMember(member)">
                    <EditOutlined />
                    编辑
                  </a-menu-item>
                  <a-menu-item 
                    v-if="!isActiveMember(member.id)"
                    @click="handleAddToProject(member.id)"
                  >
                    <UserAddOutlined />
                    加入当前项目
                  </a-menu-item>
                  <a-menu-item 
                    v-if="isActiveMember(member.id)"
                    @click="handleRemoveFromProject(member.id)"
                  >
                    <UserDeleteOutlined />
                    退出当前项目
                  </a-menu-item>
                  <a-divider style="margin: 4px 0;" />
                  <a-menu-item @click="handleRemoveMember(member.id)" class="danger-item">
                    <DeleteOutlined />
                    删除成员
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
                  <a-tag size="small" :color="getProjectTagColor()">{{ getProjectDisplayName() }}</a-tag>
                </div>
                <div class="stat-row">
                  <div class="stat-item current-project">
                    <div class="stat-number">{{ getMemberTaskStatsSync(member).currentTasks }}</div>
                    <div class="stat-label">进行中</div>
                  </div>
                  <div class="stat-item completed-project">
                    <div class="stat-number">{{ getMemberTaskStatsSync(member).completedTasks }}</div>
                    <div class="stat-label">已完成</div>
                  </div>
                  <div class="stat-item pending-project">
                    <div class="stat-number">{{ getMemberTaskStatsSync(member).pendingTasks }}</div>
                    <div class="stat-label">待开始</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!renderMembers || renderMembers.length === 0" class="empty-members">
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
        <a-form-item label="成员" name="userId">
          <!-- 编辑模式：只显示成员信息，不允许更换 -->
          <div v-if="editingMember" class="member-info-display">
            <a-avatar :src="editingMember.avatar" size="small">
              {{ editingMember.name?.charAt(0) }}
            </a-avatar>
            <span class="member-name">{{ editingMember.name }}</span>
            <a-tag color="blue" size="small">不可更换</a-tag>
          </div>
          <!-- 添加模式：允许选择用户 -->
          <a-select
            v-else
            v-model:value="memberForm.userId"
            show-search
            :filter-option="false"
            :options="userSelect.options"
            :loading="userSelect.loading"
            placeholder="请输入关键词搜索系统用户"
            @search="onSearchUser"
            @change="onUserChange"
            @popup-scroll="onUserScroll"
            style="width: 100%"
          />
        </a-form-item>
        
                 <a-form-item label="角色" name="role">
           <a-select v-model:value="memberForm.role" placeholder="请选择角色">
             <a-select-option value="任务负责人">任务负责人</a-select-option>
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
import { ref, computed, reactive, watch, onMounted, nextTick, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  ImportOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

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
const emit = defineEmits({
  'add-member': (memberData) => true,
  'edit-member': (memberData) => true,
  'remove-member': (memberId) => true,
  'add-to-project': (data) => true,
  'remove-from-project': (data) => true,
  'next-step': (stepNumber) => typeof stepNumber === 'number',
  'nextStep': (stepNumber) => typeof stepNumber === 'number'
})

// 响应式数据
const memberModalVisible = ref(false)
const editingMember = ref(null)
const memberFormRef = ref()
const manualProjectId = ref('')
const route = useRoute()
const router = useRouter()
const currentProjectId = computed(() => {
  const idFromManual = manualProjectId.value || null
  const qp = route && route.query ? route.query : {}
  const pp = route && route.params ? route.params : {}
  const idFromRoute = (qp.projectId) ?? (pp.projectId) ?? (pp.id) ?? null
  const idFromProp = props.selectedProject && props.selectedProject.id != null ? props.selectedProject.id : null
  const candidate = idFromManual != null && idFromManual !== '' ? idFromManual : (idFromRoute != null && idFromRoute !== '' ? idFromRoute : idFromProp)
  const n = candidate !== null && candidate !== undefined && candidate !== '' ? Number(candidate) : NaN
  const result = Number.isFinite(n) ? n : null
  
  console.log('🆔 [项目ID计算]', {
    idFromManual,
    idFromRoute,
    idFromProp: props.selectedProject?.id,
    candidate,
    result,
    selectedProject: props.selectedProject
  })
  
  return result
})

// 记住最近一次项目选择
const LAST_PROJECT_ID_KEY = 'implV3:lastProjectId'
// 记住已退出的成员（按项目分组）
const REMOVED_MEMBERS_KEY = 'implV3:removedMembers'
onMounted(async () => {
  const saved = localStorage.getItem(LAST_PROJECT_ID_KEY)
  if (saved && saved !== '') {
    manualProjectId.value = saved
  }
  
  // 默认加载一次列表，确保下拉能展示名称（考虑包含"全部项目"占位项）
  if (projectSelect.options.length <= 1) {
    loadProjects(true)
  }
  
  // 始终加载全局成员池用于完整列表展示
  await loadGlobalMembers()
  
  // 若已有项目ID，先加载项目成员用于高亮
  if (currentProjectId.value) {
    await membersStore.loadMembers(String(currentProjectId.value))
    // 并拉取活跃成员ID
    await loadActiveMembers(String(currentProjectId.value))
  }
  
  // 确保成员数据加载完成后再初始化统计（这样能获取到真实数据）
  console.log('🚀 开始初始化团队统计数据...')
  await refreshTeamStats()
  
  // 启动定时刷新
  startAutoRefresh()
})

// 组件卸载时清理定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopAutoRefresh()
})

watch(manualProjectId, (val) => {
  if (val !== undefined && val !== null && String(val) !== '') {
    localStorage.setItem(LAST_PROJECT_ID_KEY, String(val))
    
    // 项目切换时清理任务统计缓存
    memberTaskStatsCache.clear()
    memberTaskStatsReactive.value.clear()
    loadingMemberIds.clear()
    isPreloading = false
    
    // 选择"全部项目"时显示全局成员池（不加载项目成员）
    if (String(val) === 'ALL_PROJECTS') {
      loadGlobalMembers()
      // 全部项目：不高亮
      localActiveMemberIds.value = []
      locallyRemovedMemberIds.value = []
      refreshTeamStats()
    } else {
      // 项目切换时加载成员用于高亮
      membersStore.loadMembers(String(val))
      loadActiveMembers(String(val))
      locallyRemovedMemberIds.value = []
      refreshTeamStats()
    }
    
    // 延迟预加载任务统计（避免与其他请求冲突）
    nextTick(() => {
      setTimeout(() => {
        preloadMemberTaskStats()
      }, 500)
    })
  } else {
    // 清空选择时回到全局成员池
    loadGlobalMembers()
    locallyRemovedMemberIds.value = []
    refreshTeamStats()
  }
})

// 成员表单数据
const memberForm = reactive({
  userId: '',
  name: '',
  role: '',
  skills: []
})

// 表单验证规则
const memberFormRules = computed(() => {
  const rules = {
    role: [
      { required: true, message: '请选择成员角色', trigger: 'change' }
    ]
    // skills 改为非必填，移除验证规则
  }
  
  // 只在添加模式下验证userId
  if (!editingMember.value) {
    rules.userId = [
      { required: true, message: '请选择系统用户', trigger: 'change' }
    ]
  }
  
  return rules
})
// ===== 系统用户选择（分页搜索） =====
import { getUserPage } from '@/api/system/user'
import { apiLog } from '@/utils/apiLogger'
import { addMemberToProject, listProjectMembers, removeMemberFromProject, createTeamMember, updateTeamMember, listAllTeamMembers, listActiveMembersByProject, deleteTeamMember, fetchTeamMemberStatistics, fetchMemberTasks, calculateMemberTaskStats } from '@/api/th_qd/implementation-v3'
import { fetchProjectPage } from '@/api/th_qd/implementation-v3'
import { useTeamMembersStore } from '@/stores/teamMembers'

const userSelect = reactive({
  options: [],
  loading: false,
  pageNo: 1,
  pageSize: 20,
  total: 0,
  keyword: ''
})
// 注意：AntD 的 a-select 只有在受控 open 时才会显示下拉；这里不使用受控模式，避免意外关闭导致无法展开

const userCache = reactive(new Map())

// 项目下拉（分页搜索）
const projectSelect = reactive({
  options: [{ label: '全部项目', value: 'ALL_PROJECTS' }],
  loading: false,
  pageNo: 1,
  pageSize: 20,
  total: 0,
  keyword: ''
})

const extractUserList = (res) => {
  // 兼容不同 PageResult 结构
  const data = res?.data || res
  return data?.list || data?.records || data?.items || []
}

const extractTotal = (res) => {
  const data = res?.data || res
  return data?.total ?? data?.count ?? 0
}

const loadUsers = async (reset = false) => {
  if (reset) {
    userSelect.pageNo = 1
    userSelect.options = []
  }
  userSelect.loading = true
  const params = { pageNo: userSelect.pageNo, pageSize: userSelect.pageSize, keyword: userSelect.keyword }
  apiLog({ action: '添加成员-搜索用户', api: 'getUserPage', method: 'GET', url: '/system/user/page', params })
  const res = await getUserPage(params)
  const list = extractUserList(res)
  userSelect.total = extractTotal(res)
  const newOptions = list.map((u) => {
    const id = u.id ?? u.userId
    const name = u.nickname || u.username || u.realName || u.name || ''
    userCache.set(String(id), u)
    return { label: name, value: String(id) }
  })
  userSelect.options = reset ? newOptions : userSelect.options.concat(newOptions)
  userSelect.loading = false
}

const onSearchUser = (q) => {
  userSelect.keyword = q
  loadUsers(true)
}

const onUserScroll = (e) => {
  const target = e?.target
  if (!target) return
  if (target.scrollTop + target.offsetHeight + 10 >= target.scrollHeight) {
    if (userSelect.options.length < userSelect.total && !userSelect.loading) {
      userSelect.pageNo += 1
      loadUsers(false)
    }
  }
}

const extractProjectList = (res) => {
  const data = res?.data || res
  return data?.list || data?.records || data?.items || []
}

const loadProjects = async (reset = false) => {
  if (reset) {
    projectSelect.pageNo = 1
    projectSelect.options = [{ label: '全部项目', value: 'ALL_PROJECTS' }]
  }
  projectSelect.loading = true
  const params = { 
    pageNo: projectSelect.pageNo, 
    pageSize: projectSelect.pageSize, 
    projectName: projectSelect.keyword,
    status: 8 // 只获取立项通过的项目 (PROJECT_APPROVED = 8)
  }
  apiLog({ action: '项目下拉-搜索', api: 'fetchProjectPage', method: 'GET', url: '/technologicalproject/technological-project/page', params })
  const res = await fetchProjectPage(params)
  const list = extractProjectList(res)
  projectSelect.total = extractTotal(res)
  const newOptions = list.map((p) => ({ label: p.projectName || p.name || `项目${p.id}`, value: String(p.id) }))
  projectSelect.options = reset ? projectSelect.options.concat(newOptions) : projectSelect.options.concat(newOptions)
  projectSelect.loading = false
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

// 当选择了用户ID时，自动回填 name 以兼容原有数据结构
watch(() => memberForm.userId, (val) => {
  const u = userCache.get(String(val))
  memberForm.name = u ? (u.nickname || u.username || u.realName || u.name || '') : ''
})

const onUserChange = (value, option) => {
  if (option && option.label) {
    memberForm.name = option.label
  } else {
    const u = userCache.get(String(value))
    memberForm.name = u ? (u.nickname || u.username || u.realName || u.name || '') : ''
  }
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

// 计算属性
const teamStats = computed(() => {
  return statsState.value
})

// 统计数据状态
const statsState = ref({
  totalMembers: 0,
  totalCurrentTasks: 0,
  totalCompletedTasks: 0,
  idleMembers: 0,
  averageCurrentTasks: 0,
  taskAssignmentRate: 0,
  taskBalance: 100,
  efficiencyIndex: 0
})

const refreshTeamStats = async () => {
  try {
    if (!currentProjectId.value || String(currentProjectId.value) === 'ALL_PROJECTS') {
      // 全部项目：计算全局统计数据
      const members = localMembers.value.length > 0 ? localMembers.value : membersStore.members
      const totalMembers = (members || []).length
      
      console.log('🔄 计算全部项目统计数据...', { totalMembers })
      
      // 计算全局任务统计
      let totalCurrentTasks = 0
      let totalCompletedTasks = 0
      let activeMemberCount = 0
      let hasValidCache = false
      
      // 遍历所有成员，累计任务统计（优先使用缓存，缓存为空时直接调用API）
      if (members && members.length > 0) {
        const statsPromises = members.map(async (member) => {
          const memberId = member.id || member.memberId
          if (!memberId) return { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
          
          try {
            // 优先从缓存获取
            const cacheKey = `${memberId}_ALL`
            const cachedData = getCacheWithValidation(cacheKey)
            
            if (cachedData) {
              hasValidCache = true
              return cachedData
            } else {
              // 缓存为空时，直接调用API获取数据（初始化时必须获取真实数据）
              console.log(`📊 缓存为空，直接获取成员${memberId}的任务统计`)
              const freshData = await getMemberTaskStats(member)
              return freshData || { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
            }
          } catch (error) {
            console.warn(`获取成员${memberId}任务统计失败:`, error)
            return { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
          }
        })
        
        const allStats = await Promise.all(statsPromises)
        
        allStats.forEach(stats => {
          totalCurrentTasks += stats.currentTasks || 0
          totalCompletedTasks += stats.completedTasks || 0
          
          // 如果成员有任务，认为是活跃成员
          if ((stats.currentTasks || 0) + (stats.completedTasks || 0) + (stats.pendingTasks || 0) > 0) {
            activeMemberCount++
          }
        })
      }
      
      const idleMembers = Math.max(0, totalMembers - activeMemberCount)
      const taskAssignmentRate = totalMembers > 0 ? (activeMemberCount / totalMembers) * 100 : 0
      const avgCurrentTasksPerMember = totalMembers > 0 ? totalCurrentTasks / totalMembers : 0
      
      statsState.value = {
        totalMembers,
        totalCurrentTasks,
        totalCompletedTasks,
        idleMembers,
        averageCurrentTasks: avgCurrentTasksPerMember,
        taskAssignmentRate,
        taskBalance: Math.round(taskAssignmentRate),
        efficiencyIndex: avgCurrentTasksPerMember
      }
      
      console.log('✅ 全部项目统计数据计算完成:', statsState.value, { hasValidCache })
      
      // 如果没有有效缓存，说明是初始化，延迟重新计算统计（等待预加载完成）
      if (!hasValidCache) {
        setTimeout(() => {
          refreshTeamStatsFromCache()
        }, 3000) // 增加到3秒，确保API调用完成
      }
      
      return
    }
    
    const res = await fetchTeamMemberStatistics(String(currentProjectId.value))
    const data = res?.data ?? res
    const stat = data?.data ?? data
    
    const newStats = {
      ...statsState.value,
      totalMembers: Number(stat?.totalMemberCount ?? 0),
      totalCurrentTasks: Number(stat?.totalCurrentTasks ?? 0),
      totalCompletedTasks: Number(stat?.totalCompletedTasks ?? 0),
      idleMembers: Number(stat?.idleMemberCount ?? 0),
      // 新增字段：利用接口提供的额外数据
      taskAssignmentRate: Number(stat?.taskAssignmentRate ?? 0),
      averageCurrentTasks: Number(stat?.avgCurrentTasksPerMember ?? 0),
      // 保持现有计算逻辑作为备用
      taskBalance: stat?.totalMemberCount > 0 ? 
        Math.round((stat?.activeMemberCount / stat?.totalMemberCount) * 100) : 100,
      efficiencyIndex: stat?.avgCurrentTasksPerMember ?? 0
    }
    
    statsState.value = newStats
    
  } catch (e) {
    console.error('❌ [团队统计] 获取统计数据失败:', e)
    // 静默回退：保留现状
  }
}

// 从缓存重新计算统计数据（用于全部项目模式）
const refreshTeamStatsFromCache = async () => {
  if (currentProjectId.value && String(currentProjectId.value) !== 'ALL_PROJECTS') {
    return // 只在全部项目模式下使用
  }
  
  console.log('🔄 从缓存重新计算全部项目统计...')
  
  const members = localMembers.value.length > 0 ? localMembers.value : membersStore.members
  if (!members || members.length === 0) return
  
  let totalCurrentTasks = 0
  let totalCompletedTasks = 0
  let activeMemberCount = 0
  
  members.forEach(member => {
    const memberId = member.id || member.memberId
    if (memberId) {
      const cacheKey = `${memberId}_ALL`
      const cachedData = getCacheWithValidation(cacheKey)
      
      if (cachedData) {
        totalCurrentTasks += cachedData.currentTasks || 0
        totalCompletedTasks += cachedData.completedTasks || 0
        
        if ((cachedData.currentTasks || 0) + (cachedData.completedTasks || 0) + (cachedData.pendingTasks || 0) > 0) {
          activeMemberCount++
        }
      }
    }
  })
  
  const totalMembers = members.length
  const idleMembers = Math.max(0, totalMembers - activeMemberCount)
  const taskAssignmentRate = totalMembers > 0 ? (activeMemberCount / totalMembers) * 100 : 0
  const avgCurrentTasksPerMember = totalMembers > 0 ? totalCurrentTasks / totalMembers : 0
  
  // 只有当有实际数据时才更新
  if (totalCurrentTasks > 0 || totalCompletedTasks > 0) {
    statsState.value = {
      totalMembers,
      totalCurrentTasks,
      totalCompletedTasks,
      idleMembers,
      averageCurrentTasks: avgCurrentTasksPerMember,
      taskAssignmentRate,
      taskBalance: Math.round(taskAssignmentRate),
      efficiencyIndex: avgCurrentTasksPerMember
    }
    
    console.log('✅ 从缓存更新统计数据:', statsState.value)
  }
}

// 成员池渲染：使用全局成员池（由上层传入/本地维护乐观更新），项目成员用于高亮
const membersStore = useTeamMembersStore()
const localMembers = ref([])
watch(
  () => props.teamData?.members,
  (val) => {
    localMembers.value = Array.isArray(val) ? [...val] : []
    // 成员数据更新后预加载任务统计
    if (val && Array.isArray(val) && val.length > 0) {
      nextTick(() => {
        preloadMemberTaskStats()
      })
    }
  },
  { immediate: true, deep: true }
)
const renderMembers = computed(() => {
  if (localMembers.value && localMembers.value.length > 0) return localMembers.value
  return membersStore.members || []
})

// 加载全局成员池（分页首页）
const loadGlobalMembers = async () => {
  try {
    const res = await listAllTeamMembers({ pageNo: 1, pageSize: 20 })
    const data = res?.data ?? res
    const list = data?.list || data?.records || data?.items || []
    localMembers.value = list.map((m) => ({
      id: String(m.id ?? m.memberId ?? m.userId ?? ''),
      name: m.name ?? m.memberName ?? m.nickname ?? m.username ?? '',
      role: m.role ?? m.memberRole ?? '',
      skills: (m.memberSkills || m.skills || '')
        ? String(m.memberSkills || m.skills).split(',').map((s) => s.trim()).filter(Boolean)
        : []
    }))
    apiLog({ action: '加载全局成员池分页', api: 'listAllTeamMembers', method: 'GET', url: '/technological/team-member/page', params: { pageNo: 1, pageSize: 20 } }, { size: localMembers.value.length })
  } catch (e) {
    apiLog({ action: '加载全局成员池分页失败', api: 'listAllTeamMembers', method: 'GET', url: '/technological/team-member/page', params: { pageNo: 1, pageSize: 20 } }, e)
  }
}



// 获取项目显示名称
const getProjectDisplayName = () => {
  if (props.selectedProject?.id === 'ALL_PROJECTS') {
    return '全部项目'
  }
  return props.selectedProject?.name || '当前项目'
}

// 获取项目标签颜色
const getProjectTagColor = () => {
  if (props.selectedProject?.id === 'ALL_PROJECTS') {
    return 'purple'
  }
  return 'blue'
}

// 判断成员是否为当前项目的活跃参与者（仅以接口返回为准 + 本地去除集）
const localActiveMemberIds = ref([])
const locallyRemovedMemberIds = ref([])
const activeMemberIdSet = computed(() => {
  const merged = (localActiveMemberIds.value || []).map((id) => String(id))
  const removed = new Set((locallyRemovedMemberIds.value || []).map((id) => String(id)))
  return new Set(merged.filter((id) => !removed.has(String(id))))
})
const isActiveMember = (memberId) => activeMemberIdSet.value.has(String(memberId))

// 获取持久化的已退出成员
const getPersistedRemovedMembers = (projectId) => {
  try {
    const stored = localStorage.getItem(REMOVED_MEMBERS_KEY)
    const removedData = stored ? JSON.parse(stored) : {}
    return removedData[String(projectId)] || []
  } catch (e) {
    return []
  }
}

// 保存已退出成员到localStorage
const persistRemovedMember = (projectId, memberId) => {
  try {
    const stored = localStorage.getItem(REMOVED_MEMBERS_KEY)
    const removedData = stored ? JSON.parse(stored) : {}
    const projectKey = String(projectId)
    if (!removedData[projectKey]) {
      removedData[projectKey] = []
    }
    const memberIdStr = String(memberId)
    if (!removedData[projectKey].includes(memberIdStr)) {
      removedData[projectKey].push(memberIdStr)
    }
    localStorage.setItem(REMOVED_MEMBERS_KEY, JSON.stringify(removedData))
    console.log('💾 [持久化] 保存已退出成员:', { projectId, memberId, removedData })
  } catch (e) {
    console.error('❌ [持久化] 保存已退出成员失败:', e)
  }
}

// 从已退出列表中移除成员（重新加入时调用）
const removeFromPersistedRemovedMembers = (projectId, memberId) => {
  try {
    const stored = localStorage.getItem(REMOVED_MEMBERS_KEY)
    const removedData = stored ? JSON.parse(stored) : {}
    const projectKey = String(projectId)
    if (removedData[projectKey]) {
      const memberIdStr = String(memberId)
      removedData[projectKey] = removedData[projectKey].filter(id => id !== memberIdStr)
      if (removedData[projectKey].length === 0) {
        delete removedData[projectKey]
      }
      localStorage.setItem(REMOVED_MEMBERS_KEY, JSON.stringify(removedData))
      console.log('🔄 [持久化] 从已退出列表移除成员:', { projectId, memberId, removedData })
    }
  } catch (e) {
    console.error('❌ [持久化] 移除已退出成员失败:', e)
  }
}

// 拉取活跃成员ID（仅用于高亮）
const loadActiveMembers = async (projectId) => {
  try {
    const res = await listActiveMembersByProject(projectId)
    const data = res?.data ?? res
    const list = data?.list || data?.records || data?.items || data || []
    const ids = Array.isArray(list)
      ? list.map((x) => String(x.id ?? x.memberId ?? x.userId ?? x))
      : []
    
    // 排除持久化的已退出成员
    const persistedRemovedIds = getPersistedRemovedMembers(projectId)
    const filteredIds = ids.filter(id => !persistedRemovedIds.includes(String(id)))
    
    // 检查数据一致性：如果后端认为某个成员是活跃的，但被本地标记为已退出，则清理本地数据
    const inconsistentIds = ids.filter(id => persistedRemovedIds.includes(String(id)))
    if (inconsistentIds.length > 0) {
      console.warn('⚠️ [数据一致性] 发现不一致的成员ID，自动清理本地退出记录:', inconsistentIds)
      // 清理不一致的数据
      inconsistentIds.forEach(id => {
        removeFromPersistedRemovedMembers(projectId, id)
      })
      // 重新获取清理后的已退出列表
      const cleanedRemovedIds = getPersistedRemovedMembers(projectId)
      const cleanedFilteredIds = ids.filter(id => !cleanedRemovedIds.includes(String(id)))
      localActiveMemberIds.value = cleanedFilteredIds
    } else {
      localActiveMemberIds.value = filteredIds
    }
    
    apiLog({ action: '获取活跃成员ID', api: 'listActiveMembersByProject', method: 'GET', url: '/technological/team-member/list-active-by-project', params: { projectId } }, { size: filteredIds.length })
  } catch (e) {
    apiLog({ action: '获取活跃成员ID失败', api: 'listActiveMembersByProject', method: 'GET', url: '/technological/team-member/list-active-by-project', params: { projectId } }, e)
  }
}

// 智能缓存配置
const CACHE_CONFIG = {
  TTL: 2 * 60 * 1000,           // 缓存有效期：2分钟
  FORCE_REFRESH: 5 * 60 * 1000, // 强制刷新：5分钟
  MAX_ENTRIES: 100              // 最大缓存数
}

// 成员任务统计缓存（带时间戳）
const memberTaskStatsCache = reactive(new Map())

// 缓存工具函数
const setCacheWithTimestamp = (key, data) => {
  const now = Date.now()
  memberTaskStatsCache.set(key, {
    data,
    timestamp: now,
    lastAccess: now
  })
  cleanExpiredCache()
}

const getCacheWithValidation = (key) => {
  const item = memberTaskStatsCache.get(key)
  if (!item) return null
  
  const now = Date.now()
  item.lastAccess = now
  
  // 检查缓存是否过期
  if (now - item.timestamp > CACHE_CONFIG.TTL) {
    memberTaskStatsCache.delete(key)
    console.log(`🗑️ 缓存过期，删除: ${key}`)
    return null
  }
  
  return item.data
}

const cleanExpiredCache = () => {
  const now = Date.now()
  let cleanedCount = 0
  
  for (const [key, item] of memberTaskStatsCache.entries()) {
    if (now - item.timestamp > CACHE_CONFIG.TTL) {
      memberTaskStatsCache.delete(key)
      cleanedCount++
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 清理过期缓存: ${cleanedCount} 项`)
  }
  
  // 限制缓存大小
  if (memberTaskStatsCache.size > CACHE_CONFIG.MAX_ENTRIES) {
    const entries = Array.from(memberTaskStatsCache.entries())
    const toDelete = entries
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
      .slice(0, memberTaskStatsCache.size - CACHE_CONFIG.MAX_ENTRIES)
    
    toDelete.forEach(([key]) => memberTaskStatsCache.delete(key))
    console.log(`📦 缓存容量控制，删除 ${toDelete.length} 项最久未访问的缓存`)
  }
}

// 获取成员任务统计（真实接口调用）
const getMemberTaskStats = async (member) => {
  const memberId = member.id || member.memberId
  if (!memberId) {
    return { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
  }
  
  // 生成缓存key
  const isAllProjects = String(currentProjectId.value) === 'ALL_PROJECTS'
  const cacheKey = `${memberId}_${isAllProjects ? 'ALL' : currentProjectId.value}`
  
  // 检查智能缓存
  const cachedData = getCacheWithValidation(cacheKey)
  if (cachedData) {
    console.log(`📋 使用缓存数据: ${cacheKey}`)
    return cachedData
  }
  
  try {
    // 调用真实接口获取任务列表
    const projectIdForFilter = isAllProjects ? undefined : currentProjectId.value
    const res = await fetchMemberTasks(memberId, projectIdForFilter)
    
    // 解析任务数据
    const tasks = res?.data?.list || res?.data || []
    const stats = calculateMemberTaskStats(tasks)
    
    // 使用智能缓存存储结果
    setCacheWithTimestamp(cacheKey, stats)
    memberTaskStatsReactive.value.set(cacheKey, stats)
    
    console.log(`💾 缓存任务统计: ${cacheKey}`, stats)
    
    return stats
  } catch (error) {
    console.error(`❌ 获取成员${memberId}任务统计失败:`, error)
    
    // 失败时返回默认值（不缓存失败结果）
    const defaultStats = { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
    return defaultStats
  }
}

// 响应式的成员任务统计存储
const memberTaskStatsReactive = ref(new Map())

// 正在加载的成员ID集合（防止重复请求）
const loadingMemberIds = new Set()

// 同步版本的获取函数（用于模板中）
const getMemberTaskStatsSync = (member) => {
  const memberId = member.id || member.memberId
  if (!memberId) {
    return { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
  }
  
  const isAllProjects = String(currentProjectId.value) === 'ALL_PROJECTS'
  const cacheKey = `${memberId}_${isAllProjects ? 'ALL' : currentProjectId.value}`
  
  // 优先从响应式缓存获取
  if (memberTaskStatsReactive.value.has(cacheKey)) {
    return memberTaskStatsReactive.value.get(cacheKey)
  }
  
  // 从智能缓存获取
  const cachedData = getCacheWithValidation(cacheKey)
  if (cachedData) {
    // 同步到响应式缓存
    memberTaskStatsReactive.value.set(cacheKey, cachedData)
    return cachedData
  }
  
  // 返回默认值（不触发异步加载，避免重复请求）
  return { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
}

// 预加载标志，防止重复预加载
let isPreloading = false

// 定时刷新机制
let refreshTimer = null

// 启动定时刷新
const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  refreshTimer = setInterval(() => {
    console.log('🔄 定时刷新任务统计缓存...')
    // 清理过期缓存
    cleanExpiredCache()
    
    // 如果有成员数据，预加载最新统计
    if (renderMembers.value && renderMembers.value.length > 0) {
      preloadMemberTaskStats()
    }
  }, CACHE_CONFIG.FORCE_REFRESH)
}

// 停止定时刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 手动刷新所有缓存
const refreshAllCache = async () => {
  console.log('🔄 手动刷新所有缓存...')
  
  // 清空所有缓存
  memberTaskStatsCache.clear()
  memberTaskStatsReactive.value.clear()
  loadingMemberIds.clear()
  
  // 重新预加载
  await preloadMemberTaskStats()
  
  message.success('缓存已刷新')
}

// 刷新团队配置数据（供父组件调用）
const refreshTeamConfigData = async () => {
  console.log('🔄 刷新团队配置数据...')
  
  try {
    // 1. 刷新全局成员池
    await loadGlobalMembers()
    
    // 2. 如果有选中项目，刷新项目相关数据
    if (currentProjectId.value && String(currentProjectId.value) !== 'ALL_PROJECTS') {
      // 刷新项目成员
      await membersStore.loadMembers(String(currentProjectId.value))
      // 刷新活跃成员
      await loadActiveMembers(String(currentProjectId.value))
    }
    
    // 3. 刷新统计数据
    await refreshTeamStats()
    
    // 4. 清理并重新加载任务统计缓存
    memberTaskStatsCache.clear()
    memberTaskStatsReactive.value.clear()
    loadingMemberIds.clear()
    await preloadMemberTaskStats()
    
    console.log('✅ 团队配置数据刷新完成')
    return true
  } catch (error) {
    console.error('❌ 刷新团队配置数据失败:', error)
    return false
  }
}

// 暴露刷新方法给父组件
defineExpose({
  refreshTeamConfigData,
  refreshAllCache
})

// 预加载所有成员的任务统计
const preloadMemberTaskStats = async () => {
  if (isPreloading) {
    console.log('⏸️ 预加载已在进行中，跳过重复调用')
    return
  }
  
  const members = localMembers.value.length > 0 ? localMembers.value : membersStore.members
  if (!members || members.length === 0) return
  
  isPreloading = true
  console.log('🔄 开始预加载成员任务统计...', { memberCount: members.length })
  
  try {
    // 过滤出需要加载的成员（避免重复请求）
    const isAllProjects = String(currentProjectId.value) === 'ALL_PROJECTS'
    const membersToLoad = members.filter(member => {
      const memberId = member.id || member.memberId
      if (!memberId) return false
      
      const cacheKey = `${memberId}_${isAllProjects ? 'ALL' : currentProjectId.value}`
      return !getCacheWithValidation(cacheKey) && !loadingMemberIds.has(cacheKey)
    })
    
    if (membersToLoad.length === 0) {
      console.log('✅ 所有成员任务统计已缓存，无需重新加载')
      return
    }
    
    console.log(`🔄 需要加载 ${membersToLoad.length} 个成员的任务统计`)
    
    // 标记正在加载的成员
    membersToLoad.forEach(member => {
      const memberId = member.id || member.memberId
      const cacheKey = `${memberId}_${isAllProjects ? 'ALL' : currentProjectId.value}`
      loadingMemberIds.add(cacheKey)
    })
    
    // 并发加载所有需要的成员任务统计
    const loadPromises = membersToLoad.map(member => 
      getMemberTaskStats(member).finally(() => {
        const memberId = member.id || member.memberId
        const cacheKey = `${memberId}_${isAllProjects ? 'ALL' : currentProjectId.value}`
        loadingMemberIds.delete(cacheKey)
      })
    )
    
    await Promise.allSettled(loadPromises)
    console.log('✅ 成员任务统计预加载完成')
  } catch (error) {
    console.error('❌ 预加载成员任务统计失败:', error)
  } finally {
    isPreloading = false
  }
}



const getBalanceColor = (balance) => {
  if (balance >= 80) return '#52c41a'  // 绿色 - 很好
  if (balance >= 60) return '#faad14'  // 橙色 - 一般
  if (balance >= 40) return '#ff7875'  // 浅红色 - 较差
  return '#ff4d4f'  // 红色 - 很差
}

const handleAddMember = () => {
  editingMember.value = null
  resetMemberForm()
  memberModalVisible.value = true
  // 打开弹窗时，自动加载第一页系统用户
  userSelect.keyword = ''
  loadUsers(true)
}

const handleEditMember = (member) => {
  console.log('🔧 [编辑成员] 开始编辑成员:', member)
  editingMember.value = member
  
  // 编辑模式下，保持原有的userId和name，只允许修改role和skills
  memberForm.userId = member.userId || member.id || ''
  memberForm.name = member.name || '未知成员'
  memberForm.role = member.role || ''
  memberForm.skills = [...(member.skills || [])]
  
  memberModalVisible.value = true
  
  // 编辑模式下不需要加载用户列表
  console.log('📝 [编辑成员] 编辑模式 - 成员信息:', {
    name: memberForm.name,
    role: memberForm.role,
    skills: memberForm.skills
  })
}

const handleRemoveMember = (memberId) => {
  const idStr = String(memberId)
  const member =
    (localMembers.value || []).find(m => String(m.id) === idStr) ||
    (membersStore.members || []).find(m => String(m.id) === idStr) ||
    (props.teamData.members || []).find(m => String(m.id) === idStr)
  
  if (!member) {
    message.error('未找到该成员信息')
    return
  }
  
  // 检查成员是否正在参加当前项目
  const isActiveInCurrentProject = isActiveMember(memberId)
  
  let title = '删除成员'
  let content = `确定要从成员池中删除 ${member.name} 吗？此操作将影响其在所有项目中的可见性。`
  
  if (isActiveInCurrentProject) {
    title = '删除正在执行任务的成员'
    content = `${member.name} 目前正在参加当前项目并可能正在执行任务。删除后，该成员的所有相关数据也会被删除，且会从当前项目中移除。确定要删除吗？`
  }
  
  Modal.confirm({
    title,
    content,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 如果成员正在参加当前项目，先从项目中移除
        if (isActiveInCurrentProject && currentProjectId.value) {
          console.log('🔄 [删除成员] 成员正在参加项目，先从项目中移除')
          await removeMemberFromProject({ 
            projectId: currentProjectId.value, 
            memberId: memberId 
          })
          // 持久化保存已退出成员
          persistRemovedMember(currentProjectId.value, memberId)
        }
        
        // 然后从成员池中删除
        console.log('🗑️ [删除成员] 从成员池中删除成员')
        await deleteTeamMember(memberId)
        
        message.success(`已删除成员 ${member.name}`)
        
        // 本地移除
        const idx = localMembers.value.findIndex(m => String(m.id) === String(memberId))
        if (idx >= 0) localMembers.value.splice(idx, 1)
        
        // 从活跃成员列表中移除
        localActiveMemberIds.value = (localActiveMemberIds.value || []).filter((id) => String(id) !== String(memberId))
        
        // 刷新相关数据
        if (isActiveInCurrentProject) {
          await membersStore.refresh()
          await loadActiveMembers(String(currentProjectId.value))
          refreshTeamStats()
        }
        
        emit('remove-member', memberId)
        
      } catch (e) {
        console.error('❌ [删除成员] 删除失败:', e)
        message.error('删除失败，请稍后重试')
      }
    }
  })
}

// 添加成员到当前项目（真实调用）
const handleAddToProject = async (memberId) => {
  const idStr = String(memberId)
  const member =
    (localMembers.value || []).find(m => String(m.id) === idStr) ||
    (membersStore.members || []).find(m => String(m.id) === idStr) ||
    (props.teamData.members || []).find(m => String(m.id) === idStr)
  if (!member) return
  if (!currentProjectId.value) {
    message.error('请先选择项目：项目ID不能为空')
    return
  }
  const payload = {
    projectId: currentProjectId.value,
    userId: member.userId || member.id,
    memberName: member.name,
    role: member.role || '团队成员',
    skills: Array.isArray(member.skills) ? member.skills : (member.skills ? String(member.skills).split(',').map(s=>s.trim()).filter(Boolean) : [])
  }
  try {
    await addMemberToProject(payload)
    message.success(`已将 ${member.name} 添加到当前项目`)
    
    // 从持久化的已退出列表中移除（如果存在）
    removeFromPersistedRemovedMembers(currentProjectId.value, memberId)
    
    // 刷新项目成员与活跃集合
    await membersStore.refresh()
    await loadActiveMembers(String(currentProjectId.value))
    // 本地立即高亮（乐观更新）
    localActiveMemberIds.value = Array.from(new Set([...(localActiveMemberIds.value || []), String(memberId)]))
    // 如之前被标记为本地移除，撤销该标记
    locallyRemovedMemberIds.value = (locallyRemovedMemberIds.value || []).filter((id) => String(id) !== String(memberId))
    emit('add-to-project', { memberId, memberName: member.name })
  } catch (e) {
    message.error('添加失败，请稍后重试')
  }
}

// 从当前项目移除成员（真实调用，跨数据源查找）
const handleRemoveFromProject = (memberId) => {
  const idStr = String(memberId)
  const member =
    (localMembers.value || []).find(m => String(m.id) === idStr) ||
    (membersStore.members || []).find(m => String(m.id) === idStr) ||
    (props.teamData.members || []).find(m => String(m.id) === idStr)
  if (!member) return
  
  Modal.confirm({
    title: '确认退出项目',
    content: `确定要将 ${member.name} 从当前项目中移除吗？`,
    okText: '确认移除',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      // 调用后端：从项目移除成员
      if (!currentProjectId.value) {
        message.error('请先选择项目：项目ID不能为空')
        return
      }
      const payload = { projectId: currentProjectId.value, memberId: memberId }
      removeMemberFromProject(payload)
        .then((res) => {
          message.success(`已将 ${member.name} 从当前项目中移除`)
          
          // 持久化保存已退出成员
          persistRemovedMember(currentProjectId.value, memberId)
          
          // 本地立即去除高亮（乐观更新）
          localActiveMemberIds.value = (localActiveMemberIds.value || []).filter((id) => String(id) !== String(memberId))
          // 标记为本地移除，避免父层 activeMemberIds 短时未同步导致再次高亮
          if (!locallyRemovedMemberIds.value.includes(String(memberId))) {
            locallyRemovedMemberIds.value.push(String(memberId))
          }
          
          // 刷新项目成员与活跃集合
          membersStore.refresh().finally(() => {
            // 以接口结果为准刷新活跃列表（会自动排除已退出成员）
            loadActiveMembers(String(currentProjectId.value))
          })
          
          // 通知父层同步去除
          emit('remove-from-project', memberId)
        })
        .catch(() => {
          message.error('移除失败，请稍后重试')
        })
    }
  })
}

const handleBatchImport = () => {
  message.info('批量导入功能开发中')
}

const handleNextStep = () => {
  // 由于所有操作都是实时保存的，直接进入下一步
  console.log('🚀 [团队配置] 点击下一步按钮，切换到申报书解析')
  
  // 检查当前是否在多步骤页面中（有父组件监听事件）
  const hasParentListener = getCurrentInstance()?.parent?.emit
  
  if (hasParentListener) {
    console.log('🚀 [团队配置] 检测到父组件，触发步骤切换事件')
    try {
      // 在多步骤页面中，触发父组件切换步骤
      emit('next-step', 2)
      emit('nextStep', 2)
      console.log('🚀 [团队配置] 事件触发完成')
    } catch (error) {
      console.error('🚀 [团队配置] 事件触发失败:', error)
    }
  } else {
    console.log('🚀 [团队配置] 未检测到父组件，使用路由跳转')
    // 在独立路由页面中，直接跳转到申报书解析页面，并传递当前项目ID
    const targetRoute = {
      path: '/th-qd-implementation-v3/proposal-analysis',
      query: {}
    }
    
    // 传递当前项目ID
    if (currentProjectId.value && String(currentProjectId.value) !== 'ALL_PROJECTS') {
      targetRoute.query.projectId = String(currentProjectId.value)
      console.log('🚀 [团队配置] 传递项目ID:', currentProjectId.value)
    }
    
    router.push(targetRoute)
      .then(() => {
        console.log('🚀 [团队配置] 路由跳转成功')
      })
      .catch((error) => {
        console.error('🚀 [团队配置] 路由跳转失败:', error)
      })
  }
  
  message.success('进入下一步：申报书解析')
}

const resetMemberForm = () => {
  memberForm.userId = ''
  memberForm.name = ''
  memberForm.role = ''
  memberForm.skills = []
}

const handleMemberModalOk = async () => {
  try {
    await memberFormRef.value.validate()
    
    const memberData = {
      id: editingMember.value?.id || `M${Date.now()}`,
      userId: memberForm.userId,
      name: memberForm.name,
      role: memberForm.role,
      skills: memberForm.skills
    }

    if (editingMember.value) {
      // 编辑模式：只更新角色和技能，不更新用户信息
      const updatePayload = {
        id: editingMember.value.id,
        memberId: editingMember.value.userId || editingMember.value.id, // 传递正确的memberId
        memberName: editingMember.value.name, // 保持原有姓名不变
        memberRole: memberForm.role,
        memberSkills: memberForm.skills,
        projectId: currentProjectId.value && String(currentProjectId.value) !== 'ALL_PROJECTS' ? currentProjectId.value : undefined,
        isProjectManager: memberForm.role === '项目负责人' || memberForm.role === '任务负责人'
      }
      
      console.log('📝 [编辑成员] 更新成员信息:', updatePayload)
      await updateTeamMember(updatePayload)
      message.success(`成员 ${editingMember.value.name} 的角色和技能已更新`)
      
      // 更新本地数据（只更新角色和技能）
      const memberIndex = localMembers.value.findIndex(m => String(m.id) === String(editingMember.value.id))
      if (memberIndex >= 0) {
        localMembers.value[memberIndex] = {
          ...localMembers.value[memberIndex],
          // 保持原有的userId和name不变
          role: memberForm.role,
          skills: memberForm.skills
        }
      }
      
      // 刷新全局成员池以同步最新数据
      loadGlobalMembers()
      
    } else {
      // 重复校验
      if (membersStore.hasMember(String(memberForm.userId))) {
        message.warning('该成员已在当前项目，无需重复添加')
        return
      }
      // 创建成员到“成员池”（不绑定项目）
      const payload = { userId: Number(memberForm.userId), memberName: memberForm.name, memberRole: memberForm.role, memberSkills: memberForm.skills }
      if (!payload.memberName || String(payload.memberName).trim() === '') {
        message.error('请选择系统用户：成员姓名不能为空')
        return
      }
      try {
        const res = await createTeamMember(payload)
        // 乐观更新：将新成员加入本地成员池显示
        localMembers.value.push({ id: memberData.id, userId: memberData.userId, name: memberData.name, role: memberData.role, skills: memberData.skills })
        emit('add-member', memberData)
        message.success('已添加到成员池，可在卡片菜单选择“加入当前项目”')
      } catch (e) {
        // 接口异常时生成本地添加（灰度），并提示
        // 失败信息在封装内已有日志，这里不重复打印
        message.warning('后端接口暂不可用，已本地添加（灰度）')
        emit('add-member', memberData)
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

.manager-info-inline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-label {
  color: #234fa2;
  font-weight: 600;
  margin-right: 6px;
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

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

/* 编辑成员弹窗中的成员信息显示样式 */
.member-info-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.member-info-display .member-name {
  font-weight: 500;
  color: #262626;
  flex: 1;
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

/* 标题容器样式 */
.card-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.title-icon {
  color: #1890ff;
  font-size: 16px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.title-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.project-selector-container {
  display: flex;
  align-items: center;
}

.project-selector-label {
  font-size: 14px;
  color: #595959;
  font-weight: 500;
  white-space: nowrap;
}

.manager-info-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f0f2f5;
  border-radius: 6px;
}

.manager-name {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
}

/* 菜单项样式 */
:deep(.danger-item) {
  color: #ff4d4f;
}

:deep(.danger-item:hover) {
  background-color: #fff2f0;
}
</style>
