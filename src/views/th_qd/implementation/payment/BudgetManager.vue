<template>
  <div class="budget-manager-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <DashboardOutlined /> 经费执行进度 - 管理页面
        </h1>
        <div class="user-role">
          <a-tag color="red">
            <CrownOutlined /> 我的权限：管理员
          </a-tag>
        </div>
      </div>
      <div class="header-actions">
        <a-button 
          v-if="canSwitchToReporter" 
          type="default" 
          @click="switchToReporter"
          style="border-color: #52c41a; color: #52c41a; margin-right: 12px;"
        >
          <UserOutlined /> 切换到填报视图
        </a-button>
        <!-- <a-button type="primary" @click="exportReport">
          <DownloadOutlined /> 导出报表
        </a-button> -->
      </div>
    </div>

    <!-- 统计概览卡片组 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <FundOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(totalStats.totalBudget) }}</div>
                <div class="stat-label">总预算</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon executed">
                <DollarOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(totalStats.executedAmount) }}</div>
                <div class="stat-label">已执行</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon rate">
                <PieChartOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalStats.executionRate }}%</div>
                <div class="stat-label">执行率</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon warning">
                <AlertOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalStats.warningProjects }}</div>
                <div class="stat-label">预警项目</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <a-space>
          <a-select v-model:value="filters.project" placeholder="全部项目" style="width: 150px;" @change="handleFilterChange">
          <a-select-option value="">全部项目</a-select-option>
            <a-select-option v-for="project in projectsList" :key="project.id" :value="project.id">
            {{ project.name }}
          </a-select-option>
        </a-select>
        <a-select v-model:value="filters.year" placeholder="年份" style="width: 120px;" @change="handleFilterChange">
          <a-select-option value="">全部年份</a-select-option>
          <a-select-option value="2026">2026年</a-select-option>
          <a-select-option value="2025">2025年</a-select-option>
          <a-select-option value="2024">2024年</a-select-option>
          <a-select-option value="2023">2023年</a-select-option>
        </a-select>
        <a-select v-model:value="filters.status" placeholder="状态" style="width: 120px;" @change="handleFilterChange">
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="normal">正常</a-select-option>
          <a-select-option value="warning">预警</a-select-option>
          <a-select-option value="danger">超标</a-select-option>
        </a-select>
        <a-input-search 
          v-model:value="filters.keyword" 
          placeholder="搜索项目名称"
          style="width: 200px;"
          @search="handleSearch"
        />
        <a-button @click="resetFilters" style="margin-left: 8px;">
          <ReloadOutlined /> 重置
        </a-button>
      </a-space>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 项目列表 -->
        <a-tab-pane key="projects" tab="项目列表">
          <a-table 
            :columns="projectColumns" 
            :data-source="filteredProjects" 
            :pagination="{ pageSize: 10 }"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'totalBudget'">
                ¥{{ formatMoney(record.totalBudget) }}
              </template>
              <template v-else-if="column.key === 'executedAmount'">
                ¥{{ formatMoney(record.executedAmount) }}
              </template>
              <template v-else-if="column.key === 'executionRate'">
                <a-progress 
                  :percent="record.executionRate" 
                  size="small" 
                  :stroke-color="getProgressColor(record.executionRate)"
                />
              </template>
              <!-- <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template> -->
              <template v-else-if="column.key === 'actions'">
                <a-button type="link" size="small" @click="viewProjectDetail(record)">
                  详情
                </a-button>
                <!-- <a-button type="link" size="small" @click="viewProjectAnalysis(record)">
                  分析
                </a-button> -->
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 统计分析 -->
        <a-tab-pane key="analysis" tab="统计分析">
          <div class="analysis-content">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-card title="执行趋势图" size="small">
                  <div v-show="chartsLoading" class="chart-placeholder">数据加载中...</div>
                  <div v-show="!chartsLoading" class="chart-container" ref="trendChartRef"></div>
                </a-card>
              </a-col>
              <a-col :span="8">
                <a-card title="科目分布饼图" size="small">
                  <div v-show="chartsLoading" class="chart-placeholder">数据加载中...</div>
                  <div v-show="!chartsLoading" class="chart-container" ref="categoryPieChartRef"></div>
                </a-card>
              </a-col>
              <a-col :span="8">
                <a-card title="月度对比柱状图" size="small">
                  <div v-show="chartsLoading" class="chart-placeholder">数据加载中...</div>
                  <div v-show="!chartsLoading" class="chart-container" ref="monthlyBarChartRef"></div>
                </a-card>
              </a-col>
            </a-row>
            
            <a-card title="执行效率排行榜" style="margin-top: 16px;">
              <div class="ranking-list">
                <div v-for="(item, index) in executionRanking" :key="item.id" class="ranking-item">
                  <div class="rank-number" :class="getRankClass(index)">
                    {{ index + 1 }}
                  </div>
                  <div class="project-info">
                    <div class="project-name">{{ item.name }}</div>
                    <div class="project-rate">{{ item.executionRate }}% ({{ item.rateDesc }})</div>
                  </div>
                  <div class="progress-bar">
                    <a-progress 
                      :percent="item.executionRate" 
                      size="small" 
                      :stroke-color="getProgressColor(item.executionRate)"
                      :show-info="false"
                    />
                  </div>
                </div>
              </div>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 预警监控 -->
        <a-tab-pane key="warning" tab="预警监控">
          <a-alert 
            message="系统检测到以下项目存在预警情况" 
            type="warning" 
            show-icon 
            style="margin-bottom: 16px;"
          />
          <a-table 
            :columns="warningColumns" 
            :data-source="warningProjects" 
            :pagination="false"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'executionRate'">
                <a-progress 
                  :percent="record.executionRate" 
                  size="small" 
                  :stroke-color="getProgressColor(record.executionRate)"
                />
              </template>
              <template v-else-if="column.key === 'warningType'">
                <a-tag :color="getWarningColor(record.warningType)">
                  {{ record.warningType }}
                </a-tag>
              </template>
              <!-- <template v-else-if="column.key === 'actions'">
                <a-space>
                <a-button type="link" size="small" @click="handleWarning(record)">
                  处理
                </a-button>
                  <a-button type="link" size="small" @click="viewHandlingHistory(record)">
                    历史
                  </a-button>
                </a-space>
              </template> -->
            </template>
          </a-table>
        </a-tab-pane>


      </a-tabs>
    </div>

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="项目执行详情"
      width="1000px"
      :footer="null"
    >
      <div v-if="selectedProject">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="项目名称">{{ selectedProject.name }}</a-descriptions-item>
          <a-descriptions-item label="项目编号">{{ selectedProject.projectNo || '未设置' }}</a-descriptions-item>
          <a-descriptions-item label="项目负责人">{{ selectedProject.manager }}</a-descriptions-item>
          <a-descriptions-item label="项目年份">{{ selectedProject.yearly || '未设置' }}</a-descriptions-item>
          <a-descriptions-item label="预算总额">¥{{ formatMoney(selectedProject.totalBudget) }}</a-descriptions-item>
          <a-descriptions-item label="已执行金额">¥{{ formatMoney(selectedProject.executedAmount) }}</a-descriptions-item>
          <a-descriptions-item label="剩余预算">¥{{ formatMoney(selectedProject.totalBudget - selectedProject.executedAmount) }}</a-descriptions-item>
          <a-descriptions-item label="执行率">{{ selectedProject.executionRate }}%</a-descriptions-item>
          <a-descriptions-item label="项目状态" :span="2">
            <a-tag :color="getStatusColor(selectedProject.status)">
              {{ getStatusText(selectedProject.status) }}
            </a-tag>
            <a-progress 
              :percent="selectedProject.executionRate" 
              size="small" 
              :stroke-color="getProgressColor(selectedProject.executionRate)"
              style="margin-left: 16px; width: 200px;"
            />
          </a-descriptions-item>
        </a-descriptions>
        
        <h4 style="margin-top: 24px;">经费使用明细</h4>
        <a-table 
          :columns="detailColumns" 
          :data-source="selectedProject.details || []" 
          :pagination="false"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'budgetAmount'">
              ¥{{ formatMoney(record.budgetAmount) }}
            </template>
            <template v-else-if="column.key === 'usedAmount'">
              ¥{{ formatMoney(record.usedAmount) }}
            </template>
            <template v-else-if="column.key === 'executionRate'">
              <a-progress 
                :percent="record.executionRate" 
                size="small" 
                :stroke-color="getProgressColor(record.executionRate)"
              />
            </template>
            <template v-else-if="column.key === 'files'">
              <a-tag v-if="record.files && record.files.length > 0" color="blue">
                {{ record.files.length }} 个附件
              </a-tag>
              <span v-else style="color: #999;">无附件</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <!-- 项目分析弹窗 - 已隐藏 -->
    <!-- <a-modal
      v-model:open="analysisModalVisible"
      title="项目执行分析"
      width="900px"
      :footer="null"
    >
      <div v-if="projectAnalysis">
        <a-descriptions :column="2" bordered style="margin-bottom: 16px;">
          <a-descriptions-item label="项目名称">{{ projectAnalysis.projectName }}</a-descriptions-item>
          <a-descriptions-item label="分析时间">{{ new Date().toLocaleString('zh-CN') }}</a-descriptions-item>
          <a-descriptions-item label="总记录数">{{ projectAnalysis.totalRecords }} 条</a-descriptions-item>
          <a-descriptions-item label="总执行金额">¥{{ formatMoney(projectAnalysis.totalAmount) }}</a-descriptions-item>
          <a-descriptions-item label="预算总额">¥{{ formatMoney(projectAnalysis.progressData?.totalBudget || 0) }}</a-descriptions-item>
          <a-descriptions-item label="执行率">{{ projectAnalysis.progressData?.implementationRate || 0 }}%</a-descriptions-item>
          <a-descriptions-item label="带附件记录">{{ projectAnalysis.fileStats.recordsWithFiles }} 条</a-descriptions-item>
          <a-descriptions-item label="总附件数">{{ projectAnalysis.fileStats.totalFiles }} 个</a-descriptions-item>
        </a-descriptions>
        
        <h4>科目分布详情</h4>
        <a-table 
          :columns="analysisColumns" 
          :data-source="categoryStatsData" 
          :pagination="false"
          size="small"
          bordered
          style="margin-bottom: 16px;"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'amount'">
              ¥{{ formatMoney(record.amount) }}
            </template>
            <template v-else-if="column.key === 'percentage'">
              {{ record.percentage }}%
            </template>
          </template>
        </a-table>
        
        <div class="analysis-summary">
          <a-alert 
            :message="`分析总结：该项目共有 ${projectAnalysis.totalRecords} 条执行记录，涉及 ${Object.keys(projectAnalysis.categoryStats).length} 个预算科目，执行率为 ${projectAnalysis.progressData?.implementationRate || 0}%`"
            :type="projectAnalysis.progressData?.implementationRate >= 95 ? 'warning' : 'info'"
            show-icon
          />
        </div>
      </div>
    </a-modal> -->

    <!-- 预警处理历史弹窗 - 已隐藏 -->
    <!-- <a-modal
      v-model:open="historyModalVisible"
      title="预警处理历史"
      width="1000px"
      :footer="null"
    >
      <div>
        <a-table 
          :columns="historyColumns" 
          :data-source="handlingHistory" 
          :pagination="{ pageSize: 10 }"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'handlingNote'">
              <a-tooltip :title="record.处理说明">
                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ record.处理说明 }}
                </div>
              </a-tooltip>
            </template>
            <template v-else-if="column.key === 'warningType'">
              <a-tag :color="record.预警类型 === '超支预警' ? 'red' : 'orange'">
                {{ record.预警类型 }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { 
  DashboardOutlined, 
  CrownOutlined, 
  DownloadOutlined,
  FundOutlined,
  DollarOutlined,
  PieChartOutlined,
  AlertOutlined,
  UserOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import {
  getFundExecutionProgressPage,
  getFundExecutionProgressByProject,
  getFundExecutionDetailsByProgressId,
  getFundExecutionProgressDetails,
  updateFundExecutionProgress,
  BUDGET_SUBJECTS,
  BUDGET_SUBJECTS_TEXT,
  EXECUTION_STATUS_TEXT
} from '@/api/th_qd/implementation-v3/fund-execution'
import { fetchProjects } from '@/api/th_qd/implementation-v3/projects'
import { useUserStore } from '@/store/modules/user'

// 接收props
const props = defineProps({
  userPermissions: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['switch-role'])

// 用户store
const userStore = useUserStore()

// 计算是否可以切换到填报角色
const canSwitchToReporter = computed(() => {
  return props.userPermissions.roles && props.userPermissions.roles.includes('reporter')
})

// 切换到填报角色
const switchToReporter = () => {
  emit('switch-role', 'reporter')
}

// 数据状态
const activeTab = ref('projects')
const detailModalVisible = ref(false)
const analysisModalVisible = ref(false)
const historyModalVisible = ref(false)
const selectedProject = ref(null)
const projectAnalysis = ref(null)
const handlingHistory = ref([])
const loading = ref(false)

// 图表引用
const trendChartRef = ref(null)
const categoryPieChartRef = ref(null)
const monthlyBarChartRef = ref(null)
const chartsLoading = ref(true)

// 缓存图表实例，避免重复 init 导致监听堆叠与空白
let trendChartInstance = null
let categoryPieChartInstance = null
let monthlyBarChartInstance = null

// 图表数据（仅真实数据填充；初始为空）
const chartData = ref({
  trendData: { months: [], executionRates: [], budgetUsage: [] },
  categoryData: [],
  monthlyComparison: { months: [], currentYear: [], lastYear: [], budget: [] }
})

// 筛选条件
const filters = ref({
  project: '',
  year: '', // 默认不过滤年份，避免缩小结果集
  status: '',
  keyword: ''
})

// 统计数据
const totalStats = ref({
  totalBudget: 0,
  executedAmount: 0,
  executionRate: 0,
  warningProjects: 0
})

// 项目数据
const allProjects = ref([])
const projectsList = ref([]) // 存储项目基础信息

// 加载项目列表数据（与center页面相同的API）
const loadProjectsList = async () => {
  try {
    console.log('🔄 开始加载项目列表')
    
    const response = await fetchProjects({
      pageNo: 1,
      pageSize: 100,
      status: 8 // 8=立项通过
    })
    console.log('📊 项目列表API响应:', response)
    
    // 兼容两种响应格式：response.data.list 和 response.list
    const projectList = response.data?.list || response.list || []
    
    console.log('🔍 项目列表响应数据结构检查:', {
      hasData: !!response.data,
      hasList: !!response.data?.list,
      hasDirectList: !!response.list,
      listLength: projectList.length,
      firstItem: projectList[0]
    })
    
    if (projectList.length > 0) {
      projectsList.value = projectList.map(item => ({
        id: item.id,
        name: item.projectName || `项目-${item.id}`,
        projectNo: item.projectNo,
        manager: item.applicant || item.projectManager || '待分配'
      }))
      console.log('✅ 成功加载项目列表:', projectsList.value.length, '个项目')
      console.log('📋 项目列表详情:', projectsList.value)
    }
  } catch (error) {
    console.error('❌ 加载项目列表失败:', error)
  }
}

// 加载经费执行进度数据
const loadFundExecutionData = async () => {
  try {
    loading.value = true
    console.log('🔄 开始加载经费执行进度数据')
    
    // 构建API请求参数
    const apiParams = {
      pageNo: 1,
      pageSize: 100
    }
    
    // 添加筛选条件
    if (filters.value.project) {
      apiParams.projectId = filters.value.project
    }
    if (filters.value.year) {
      apiParams.yearly = parseInt(filters.value.year)
    }
    if (filters.value.status) {
      // 将状态映射为数字
      const statusMap = {
        'normal': 0,
        'warning': 1,
        'danger': 2
      }
      apiParams.status = statusMap[filters.value.status]
    }
    if (filters.value.keyword) {
      apiParams.projectName = filters.value.keyword
    }
    
    console.log('🔍 API请求参数:', apiParams)
    
    // 获取经费执行进度分页数据
  const response = await getFundExecutionProgressPage(apiParams)
  console.log('📊 经费执行进度API响应:', response)
  
  // 兼容不同分页结构：list / records / rows
  const responseData = response.data || response
  const projectList = responseData.list || responseData.records || responseData.rows || []
    
    console.log('🔍 响应数据结构检查:', {
      hasData: !!response.data,
    hasList: !!responseData.list,
    hasRecords: !!responseData.records,
    hasRows: !!responseData.rows,
    listLength: projectList.length,
      firstItem: projectList[0]
    })
    
    if (projectList.length > 0) {
      // 转换API数据为前端展示格式
      allProjects.value = projectList.map(item => {
        // 从项目列表中查找对应的项目信息
        const projectInfo = projectsList.value.find(p => p.id === item.projectId)
        
        return {
          ...item,
          id: item.id, // 记录ID
          projectId: item.projectId, // 项目ID（用于筛选）
          name: projectInfo?.name || `项目-${item.projectId}`,
          manager: projectInfo?.manager || '待分配',
          status: item.status === 0 ? 'normal' : 'warning',
          executedAmount: item.implementation || 0,
          executionRate: item.implementationRate || 0,
          totalBudget: item.totalBudget || 0,
          details: item.fundExecutionProgressDetailsList?.map(detail => ({
            category: BUDGET_SUBJECTS_TEXT[detail.budgetSubjects] || '未知科目',
            budgetAmount: 0, // 需要计算或从其他接口获取
            usedAmount: detail.amountUsed || 0,
            executionRate: 0, // 需要计算
            dateOfUse: detail.dateOfUse,
            purposeDescription: detail.purposeDescription
          })) || []
        }
      })
      
        // 计算统计数据
        await calculateTotalStats()
      console.log('✅ 成功加载经费执行进度数据:', allProjects.value.length, '个项目')
      console.log('📊 转换后的项目数据:', allProjects.value)
      console.log('📊 统计数据:', totalStats.value)
    } else {
      console.log('🔄 无经费执行进度数据，显示空列表')
      allProjects.value = []
      await calculateTotalStats()
    }
  } catch (error) {
    console.error('❌ 加载经费执行进度数据失败:', error)
    console.log('🔄 API调用失败，使用fallback模拟数据')
    message.warning('无法连接到服务器，使用模拟数据')
    
    // 使用fallback数据
    allProjects.value = []
    await calculateTotalStats()
  } finally {
    loading.value = false
  }
}

// 计算统计数据（纯前端，本地聚合，不再调用统计API）
const calculateTotalStats = async () => {
  const projects = allProjects.value || []
  // 可按年份过滤
  const yearFilter = filters.value.year ? parseInt(filters.value.year) : undefined
  const filtered = yearFilter
    ? projects.filter(p => !p.yearly || String(p.yearly) === String(yearFilter))
    : projects

  totalStats.value = {
    totalBudget: filtered.reduce((sum, p) => sum + (p.totalBudget || 0), 0),
    executedAmount: filtered.reduce((sum, p) => sum + (p.implementation || 0), 0),
    executionRate: filtered.length > 0
      ? Math.round(filtered.reduce((sum, p) => sum + (p.implementationRate || 0), 0) / filtered.length)
      : 0,
    warningProjects: filtered.filter(p => (p.implementationRate || 0) >= 85).length
  }
}



// 计算属性
const filteredProjects = computed(() => {
  let result = allProjects.value
  
  console.log('🔍 filteredProjects 计算:', {
    allProjectsLength: allProjects.value.length,
    firstItem: allProjects.value[0],
    filters: filters.value
  })
  
  if (filters.value.project) {
    // 关键修复：按 projectId 过滤，而不是按列表记录 id
    result = result.filter(p => String(p.projectId) === String(filters.value.project))
    console.log('🔍 按项目(projectId)筛选后:', result.length)
  }
  
  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
    console.log('🔍 按状态筛选后:', result.length)
  }
  
  if (filters.value.keyword) {
    result = result.filter(p => p.name.includes(filters.value.keyword))
    console.log('🔍 按关键词筛选后:', result.length)
  }
  
  console.log('🔍 最终筛选结果:', result.length, result)
  return result
})

const warningProjects = computed(() => {
  return allProjects.value.filter(p => p.executionRate >= 85).map(p => ({
    ...p,
    warningType: p.executionRate >= 95 ? '超支预警' : '接近预算'
  }))
})

const executionRanking = computed(() => {
  return [...allProjects.value]
    .sort((a, b) => b.executionRate - a.executionRate)
    .map(p => ({
      ...p,
      rateDesc: p.executionRate >= 95 ? '超预期' : p.executionRate >= 80 ? '良好' : '滞后'
    }))
})

const categoryStatsData = computed(() => {
  if (!projectAnalysis.value || !projectAnalysis.value.categoryStats) return []
  
  const totalAmount = projectAnalysis.value.totalAmount || 1 // 避免除零
  
  return Object.entries(projectAnalysis.value.categoryStats).map(([category, stats]) => ({
    category,
    count: stats.count,
    amount: stats.amount,
    percentage: Math.round((stats.amount / totalAmount) * 100)
    }))
})

// 表格列定义
const projectColumns = [
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '项目负责人', dataIndex: 'manager', key: 'manager' },
  { title: '预算总额', dataIndex: 'totalBudget', key: 'totalBudget' },
  { title: '已执行', dataIndex: 'executedAmount', key: 'executedAmount' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' },
  // { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'actions' }
]

const warningColumns = [
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' },
  { title: '预警类型', dataIndex: 'warningType', key: 'warningType' },
  { title: '项目负责人', dataIndex: 'manager', key: 'manager' }
  // { title: '操作', key: 'actions' }
]



const detailColumns = [
  { title: '科目', dataIndex: 'category', key: 'category' },
  { title: '预算金额', dataIndex: 'budgetAmount', key: 'budgetAmount' },
  { title: '已使用', dataIndex: 'usedAmount', key: 'usedAmount' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' },
  { title: '附件', dataIndex: 'files', key: 'files' },
  { title: '用途说明', dataIndex: 'purposeDescription', key: 'purposeDescription', ellipsis: true }
]

const analysisColumns = [
  { title: '预算科目', dataIndex: 'category', key: 'category' },
  { title: '记录数', dataIndex: 'count', key: 'count' },
  { title: '执行金额', dataIndex: 'amount', key: 'amount' },
  { title: '占比', dataIndex: 'percentage', key: 'percentage' }
]

const historyColumns = [
  { title: '序号', dataIndex: '序号', key: 'index', width: 80 },
  { title: '处理时间', dataIndex: '处理时间', key: 'handlingTime', width: 150 },
  { title: '处理人', dataIndex: '处理人', key: 'handler', width: 100 },
  { title: '预警类型', dataIndex: '预警类型', key: 'warningType', width: 120 },
  { title: '当时执行率', dataIndex: '当时执行率', key: 'executionRate', width: 120 },
  { title: '处理说明', dataIndex: '处理说明', key: 'handlingNote', ellipsis: true }
]

// 方法
const formatMoney = (amount) => {
  return amount.toLocaleString()
}

const getProgressColor = (rate) => {
  if (rate >= 95) return '#ff4d4f'
  if (rate >= 90) return '#fa8c16'
  if (rate >= 70) return '#52c41a'
  return '#1890ff'
}

const getStatusColor = (status) => {
  const colorMap = {
    'normal': 'green',
    'warning': 'orange',
    'danger': 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'normal': '正常',
    'warning': '预警',
    'danger': '超标'
  }
  return textMap[status] || '未知'
}

const getWarningColor = (type) => {
  return type === '超支预警' ? 'red' : 'orange'
}

const getRankClass = (index) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

const handleSearch = async () => {
  console.log('搜索:', filters.value.keyword)
  await handleFilterChange()
}

const handleFilterChange = async () => {
  console.log('筛选条件变化:', filters.value)
  // 确保项目列表已加载
  if (projectsList.value.length === 0) {
    await loadProjectsList()
  }
  // 重新加载数据
  await loadFundExecutionData()
  // 筛选条件变化时也重新计算统计数据
  await calculateTotalStats()
  // 统计图根据筛选联动
  await updateChartsFromRecords()
}

const resetFilters = async () => {
  console.log('重置筛选条件')
  filters.value = {
    project: '',
    year: '',
    status: '',
    keyword: ''
  }
  await loadFundExecutionData()
  await calculateTotalStats()
  message.success('筛选条件已重置')
}

const viewProjectDetail = async (project) => {
  console.log('🔄 查看项目详情:', project)
  selectedProject.value = project
  
  try {
    // 加载项目的详细经费执行数据
    const progressResponse = await getFundExecutionProgressByProject(project.id)
    console.log('📊 项目详情API响应:', progressResponse)
    
    const progressList = progressResponse.data?.list || progressResponse.list || []
    const progressData = progressList.length > 0 ? progressList[0] : null
    
    console.log('🔍 项目进度数据结构检查:', {
      hasData: !!progressResponse.data,
      hasList: !!progressResponse.data?.list,
      hasDirectList: !!progressResponse.list,
      listLength: progressList.length,
      progressData: progressData
    })
    
    if (progressData) {
      // 加载经费执行明细
      const detailsResponse = await getFundExecutionDetailsByProgressId(progressData.id)
      console.log('📊 项目明细API响应:', detailsResponse)
      
      const detailsList = detailsResponse.data?.list || detailsResponse.list || []
      console.log('🔍 明细数据结构检查:', {
        hasData: !!detailsResponse.data,
        hasList: !!detailsResponse.data?.list,
        hasDirectList: !!detailsResponse.list,
        listLength: detailsList.length
      })
      
      // 更新项目详情
      selectedProject.value = {
        ...project,
        totalBudget: progressData.totalBudget || 0,
        executedAmount: progressData.implementation || 0,
        executionRate: progressData.implementationRate || 0,
        details: detailsList.map(detail => ({
          category: BUDGET_SUBJECTS_TEXT[detail.budgetSubjects] || '未知科目',
          budgetAmount: 0, // 需要从预算配置中获取
          usedAmount: detail.amountUsed || 0,
          executionRate: 0, // 需要计算
          dateOfUse: detail.dateOfUse,
          purposeDescription: detail.purposeDescription,
          files: detail.fundExecutionProgressDetailsFilesDOList || []
        }))
      }
      
      console.log('✅ 项目详情已更新:', selectedProject.value)
    }
  } catch (error) {
    console.error('❌ 加载项目详情失败:', error)
    message.error('加载项目详情失败')
  }
  
  detailModalVisible.value = true
}

const viewProjectAnalysis = async (project) => {
  console.log('🔄 查看项目分析:', project)
  
  try {
    // 加载项目的详细分析数据
    const progressResponse = await getFundExecutionProgressByProject(project.id)
    const progressList = progressResponse.data?.list || progressResponse.list || []
    const progressData = progressList.length > 0 ? progressList[0] : null
    
    if (progressData) {
      // 加载经费执行明细
      const detailsResponse = await getFundExecutionDetailsByProgressId(progressData.id)
      const detailsList = detailsResponse.data?.list || detailsResponse.list || []
      
      console.log('🔍 分析数据结构检查:', {
        progressData: progressData,
        detailsList: detailsList
      })
      
      // 分析数据
      const analysis = {
        totalRecords: detailsList.length,
        totalAmount: detailsList.reduce((sum, detail) => sum + (detail.amountUsed || 0), 0),
        categoryStats: {},
        monthlyStats: {},
        fileStats: {
          totalFiles: 0,
          recordsWithFiles: 0
        }
      }
      
      // 统计科目分布
      detailsList.forEach(detail => {
        const category = BUDGET_SUBJECTS_TEXT[detail.budgetSubjects] || '未知科目'
        if (!analysis.categoryStats[category]) {
          analysis.categoryStats[category] = { count: 0, amount: 0 }
        }
        analysis.categoryStats[category].count++
        analysis.categoryStats[category].amount += detail.amountUsed || 0
        
        // 统计文件
        if (detail.fundExecutionProgressDetailsFilesDOList && detail.fundExecutionProgressDetailsFilesDOList.length > 0) {
          analysis.fileStats.totalFiles += detail.fundExecutionProgressDetailsFilesDOList.length
          analysis.fileStats.recordsWithFiles++
        }
      })
      
      console.log('📊 项目分析结果:', analysis)
      
      // 保存分析结果并显示弹窗
      projectAnalysis.value = {
        projectName: project.name,
        projectId: project.id,
        totalRecords: analysis.totalRecords,
        totalAmount: analysis.totalAmount,
        categoryStats: analysis.categoryStats,
        monthlyStats: analysis.monthlyStats,
        fileStats: analysis.fileStats,
        progressData: progressData
      }
      
      console.log('📊 项目分析结果:', projectAnalysis.value)
      
      // 显示分析弹窗
      analysisModalVisible.value = true
    } else {
      message.warning('该项目暂无经费执行数据')
    }
  } catch (error) {
    console.error('❌ 项目分析失败:', error)
    message.error('项目分析失败')
  }
}

const handleWarning = async (project) => {
  console.log('🔄 处理项目预警:', project)
  
  try {
    // 获取项目的详细执行数据
    const progressResponse = await getFundExecutionProgressByProject(project.id)
    const progressList = progressResponse.data?.list || progressResponse.list || []
    const progressData = progressList.length > 0 ? progressList[0] : null
    
    console.log('🔍 预警数据结构检查:', {
      progressData: progressData,
      implementation: progressData?.implementation,
      implementationRate: progressData?.implementationRate,
      totalBudget: progressData?.totalBudget
    })
    
    if (progressData) {
      // 获取项目的详细明细列表
      const detailsResponse = await getFundExecutionDetailsByProgressId(progressData.id)
      const detailsList = detailsResponse.data?.list || detailsResponse.list || []
      
      console.log('🔍 预警明细数据结构检查:', {
        detailsList: detailsList,
        detailsCount: detailsList.length
      })
      
      const warningType = progressData.implementationRate >= 95 ? '超支预警' : '接近预算'
      const remainingBudget = (progressData.totalBudget || 0) - (progressData.implementation || 0)
      
      // 构建详细的预警信息，包含明细列表
      let detailsInfo = ''
      if (detailsList.length > 0) {
        detailsInfo = '\n\n📋 最近经费使用明细：\n'
        detailsList.slice(0, 5).forEach((detail, index) => {
          const category = BUDGET_SUBJECTS_TEXT[detail.budgetSubjects] || '未知科目'
          const amount = detail.amountUsed || 0
          const date = detail.dateOfUse ? new Date(detail.dateOfUse).toLocaleDateString() : '未知日期'
          detailsInfo += `${index + 1}. ${category} - ¥${formatMoney(amount)} (${date})\n`
        })
        if (detailsList.length > 5) {
          detailsInfo += `... 还有 ${detailsList.length - 5} 条记录\n`
        }
      }
      
      const warningMessage = `
预警处理 - ${project.name}
• 预警类型：${warningType}
• 执行率：${progressData.implementationRate}%
• 预算总额：¥${formatMoney(progressData.totalBudget || 0)}
• 已执行金额：¥${formatMoney(progressData.implementation || 0)}
• 剩余预算：¥${formatMoney(remainingBudget)}
• 明细记录数：${detailsList.length} 条
${detailsInfo}
建议措施：${progressData.implementationRate >= 95 ? '严格控制支出，必要时申请预算调整' : '关注预算执行，合理规划剩余资金'}
      `
      
      Modal.confirm({
        title: '预警处理',
        content: warningMessage,
        width: 600,
        okText: '确认处理',
        cancelText: '查看详情',
        onOk() {
          processWarningHandling(project, progressData)
        },
        onCancel() {
          // 点击取消时显示详细的项目详情
          viewProjectDetail(project)
        }
      })
    }
  } catch (error) {
    console.error('❌ 处理预警失败:', error)
    message.error('处理预警失败')
  }
}

// 处理预警的实际处理逻辑
const processWarningHandling = async (project, progressData) => {
  try {
    console.log('🔄 开始处理预警:', project.name)
    
    // 创建处理记录
    const handlingRecord = {
      projectId: project.id,
      projectName: project.name,
      handlingTime: new Date().toISOString(),
      handlerName: userStore.getUser.nickname || userStore.getUser.id?.toString() || '当前用户',
      handlerId: userStore.getUser.id,
      warningType: progressData.implementationRate >= 95 ? '超支预警' : '接近预算',
      executionRate: progressData.implementationRate,
      totalBudget: progressData.totalBudget,
      executedAmount: progressData.implementation,
      handlingNote: `预警已确认处理。执行率: ${progressData.implementationRate}%，建议措施: ${progressData.implementationRate >= 95 ? '严格控制支出，必要时申请预算调整' : '关注预算执行，合理规划剩余资金'}`
    }
    
    console.log('📝 预警处理记录:', handlingRecord)
    
    // 调用API更新经费执行进度状态
    const updateData = {
      id: progressData.id,
      projectId: progressData.projectId,
      implementation: progressData.implementation,
      implementationRate: progressData.implementationRate,
      status: 0, // 将状态重置为正常（0=正常，1=预警），表示已处理
      remaining: progressData.remaining,
      totalBudget: progressData.totalBudget,
      // 可以添加处理备注字段，如果API支持的话
      handlingNote: handlingRecord.handlingNote,
      handlingTime: new Date().getTime(), // 处理时间戳
      handlerName: handlingRecord.handlerName
    }
    
    console.log('🚀 调用API更新处理状态:', updateData)
    
    // 调用更新API
    const updateResponse = await updateFundExecutionProgress(updateData)
    console.log('✅ 预警处理API响应:', updateResponse)
    
    // 同时保存到本地存储作为备份（可选）
    const existingRecords = JSON.parse(localStorage.getItem('warningHandlingRecords') || '[]')
    existingRecords.push(handlingRecord)
    localStorage.setItem('warningHandlingRecords', JSON.stringify(existingRecords))
    
    // 显示处理成功消息
    message.success(`✅ ${project.name} 的预警已确认处理并更新到后端`)
    
    // 记录处理日志
    console.log(`✅ 预警处理完成 - 项目: ${project.name}, 处理人: ${handlingRecord.handlerName}, 时间: ${handlingRecord.handlingTime}`)
    
    // 刷新数据以反映处理结果
    await loadFundExecutionData()
    
  } catch (error) {
    console.error('❌ 预警处理失败:', error)
    message.error('预警处理失败，请稍后重试')
  }
}

// 查看预警处理历史
const viewHandlingHistory = async (project) => {
  console.log('🔄 查看处理历史:', project.name)
  
  try {
    // TODO: 这里应该调用真实的API获取处理历史
    // const historyResponse = await getWarningHandlingHistory(project.id)
    
    // 暂时从本地存储获取处理记录（作为fallback）
    const allRecords = JSON.parse(localStorage.getItem('warningHandlingRecords') || '[]')
    const projectRecords = allRecords.filter(record => record.projectId === project.id)
    
    console.log('📋 项目处理历史:', projectRecords)
    
    if (projectRecords.length === 0) {
      message.info(`${project.name} 暂无预警处理历史`)
      return
    }
    
    // 转换为表格数据格式
    handlingHistory.value = projectRecords.reverse().map((record, index) => ({
      key: index,
      序号: index + 1,
      处理时间: new Date(record.handlingTime).toLocaleString('zh-CN'),
      处理人: record.handlerName,
      预警类型: record.warningType,
      当时执行率: `${record.executionRate}%`,
      处理说明: record.handlingNote
    }))
    
    // 显示历史记录弹窗
    historyModalVisible.value = true
    
  } catch (error) {
    console.error('❌ 获取处理历史失败:', error)
    message.error('获取处理历史失败')
  }
}

// 初始化图表
const initCharts = () => {
  console.log('🎯 开始初始化管理页面图表...')
  console.log('📊 图表容器引用:', {
    trendChartRef: trendChartRef.value,
    categoryPieChartRef: categoryPieChartRef.value,
    monthlyBarChartRef: monthlyBarChartRef.value
  })
  
  // 计算基准年份
  const baseYear = filters.value.year ? parseInt(filters.value.year) : new Date().getFullYear()
  
  // 执行趋势图（折线图）
  if (trendChartRef.value) {
    if (!chartData.value.trendData.months.length) return
    console.log('🎯 初始化执行趋势图...')
    const el = trendChartRef.value
    trendChartInstance = echarts.getInstanceByDom(el) || echarts.init(el, null, { renderer: 'canvas' })
    trendChartInstance.setOption({
      title: {
        text: '年度执行趋势',
        textStyle: { fontSize: 12, color: '#333' },
        left: 'center'
      },
      tooltip: { 
        trigger: 'axis',
        formatter: (params) => {
          let result = `${params[0].axisValue}<br/>`
          params.forEach(item => {
            if (item.seriesName === '执行率') {
              result += `${item.marker}${item.seriesName}: ${item.value}%<br/>`
            } else {
              result += `${item.marker}${item.seriesName}: ¥${item.value}万<br/>`
            }
          })
          return result
        }
      },
      legend: {
        data: ['执行率', '累计使用'],
        bottom: 5,
        textStyle: { fontSize: 10 }
      },
      grid: {
        left: '6%',
        right: '6%',
        bottom: '22%',
        top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.value.trendData.months,
        axisLabel: { fontSize: 10 }
      },
      yAxis: [
        {
          type: 'value',
          name: '执行率(%)',
          position: 'left',
          axisLabel: { 
            fontSize: 10,
            formatter: '{value}%'
          }
        },
        {
          type: 'value',
          name: '金额(万)',
          position: 'right',
          axisLabel: { 
            fontSize: 10,
            formatter: '{value}万'
          }
        }
      ],
      series: [
        {
          name: '执行率',
          type: 'line',
          yAxisIndex: 0,
          data: chartData.value.trendData.executionRates,
          lineStyle: { color: '#1890ff' },
          itemStyle: { color: '#1890ff' },
          smooth: true
        },
        {
          name: '累计使用',
          type: 'bar',
          yAxisIndex: 1,
          data: chartData.value.trendData.budgetUsage,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#52c41a' },
                { offset: 1, color: '#389e0d' }
              ]
            }
          }
        }
      ]
    }, true)
    trendChartInstance.resize()
    console.log('✅ 执行趋势图初始化完成')
  }

  // 科目分布饼图
  if (categoryPieChartRef.value) {
    if (!chartData.value.categoryData.length) return
    console.log('🎯 初始化科目分布饼图...')
    const el = categoryPieChartRef.value
    categoryPieChartInstance = echarts.getInstanceByDom(el) || echarts.init(el, null, { renderer: 'canvas' })
    categoryPieChartInstance.setOption({
      title: {
        text: '科目分布',
        textStyle: { fontSize: 12, color: '#333' },
        left: 'center'
      },
      tooltip: { 
        trigger: 'item',
        formatter: '{a} <br/>{b}: ¥{c}万 ({d}%)'
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 10 }
      },
      series: [{
        name: '使用金额',
        type: 'pie',
        radius: ['32%', '62%'],
        center: ['50%', '52%'],
        data: chartData.value.categoryData.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          fontSize: 10,
          formatter: '{b}\n{d}%'
        }
      }]
    }, true)
    categoryPieChartInstance.resize()
    console.log('✅ 科目分布饼图初始化完成')
  }

  // 月度对比柱状图
  if (monthlyBarChartRef.value) {
    if (!chartData.value.monthlyComparison.months.length) return
    console.log('🎯 初始化月度对比柱状图...')
    const el = monthlyBarChartRef.value
    monthlyBarChartInstance = echarts.getInstanceByDom(el) || echarts.init(el, null, { renderer: 'canvas' })
    monthlyBarChartInstance.setOption({
      title: {
        text: '月度对比',
        textStyle: { fontSize: 12, color: '#333' },
        left: 'center'
      },
      tooltip: { 
        trigger: 'axis',
        formatter: (params) => {
          let result = `${params[0].axisValue}<br/>`
          params.forEach(item => {
            result += `${item.marker}${item.seriesName}: ¥${item.value}万<br/>`
          })
          return result
        }
      },
      legend: {
        data: [`${baseYear}年`, `${baseYear - 1}年`, '预算'],
        bottom: 5,
        textStyle: { fontSize: 10 }
      },
      grid: {
        left: '8%',
        right: '8%',
        bottom: '25%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.value.monthlyComparison.months,
        axisLabel: { fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '金额(万)',
        axisLabel: { 
          fontSize: 10,
          formatter: '{value}万'
        }
      },
      series: [
        {
          name: `${baseYear}年`,
          type: 'bar',
          data: chartData.value.monthlyComparison.currentYear,
          itemStyle: { color: '#1890ff' }
        },
        {
          name: `${baseYear - 1}年`,
          type: 'bar',
          data: chartData.value.monthlyComparison.lastYear,
          itemStyle: { color: '#52c41a' }
        },
        {
          name: '预算',
          type: 'line',
          data: chartData.value.monthlyComparison.budget,
          lineStyle: { 
            color: '#fa8c16',
            type: 'dashed'
          },
          itemStyle: { color: '#fa8c16' }
        }
      ]
    }, true)
    monthlyBarChartInstance.resize()
    console.log('✅ 月度对比柱状图初始化完成')
  }
  
  console.log('🎯 管理页面图表初始化流程完成')
}

// 纯前端：基于分页接口与明细接口聚合生成真实图表
const updateChartsFromRecords = async () => {
  try {
    chartsLoading.value = true
    // 1) 拉取项目页数据（全部/筛选）
    const pageResp = await getFundExecutionProgressPage({
      pageNo: 1,
      pageSize: 100,
      projectId: filters.value.project || undefined,
      // 年度在前端按明细分组，不在分页层限制
      projectName: filters.value.keyword || undefined
    })
    const list = (pageResp.data?.list || pageResp.list || [])

    // 2) 遍历每个项目取其明细，做聚合
    const baseYear = filters.value.year ? parseInt(filters.value.year) : new Date().getFullYear()
    const monthAggCur = new Array(12).fill(0)
    const monthAggPrev = new Array(12).fill(0)
    const categoryAgg = {
      [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT]]: 0,
      [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS]]: 0,
      [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL]]: 0,
      [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER]]: 0
    }

    for (const item of list) {
      const progressId = item.id || item.progressId
      if (!progressId) continue
      const detailsResp = await getFundExecutionDetailsByProgressId(progressId)
      const details = detailsResp.data?.list || detailsResp.list || []
      details.forEach(d => {
        // 月度 + 年份分组（按年度筛选）
        const ts = d.dateOfUse
        const dt = ts ? new Date(ts) : null
        const y = dt ? dt.getFullYear() : undefined
        const m = dt ? dt.getMonth() : undefined
        if (y !== undefined && m !== undefined && m >= 0 && m < 12) {
          // 如果指定了年份筛选，只统计该年份的数据
          if (filters.value.year && y === baseYear) {
            monthAggCur[m] += (d.amountUsed || 0) / 10000
          } else if (!filters.value.year) {
            // 没有年份筛选时，统计当前年份和去年
            if (y === baseYear) monthAggCur[m] += (d.amountUsed || 0) / 10000
            else if (y === baseYear - 1) monthAggPrev[m] += (d.amountUsed || 0) / 10000
          }
        }
        // 科目（按年度筛选）
        if (!filters.value.year || y === baseYear) {
          const name = BUDGET_SUBJECTS_TEXT[d.budgetSubjects] || BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER]
          if (categoryAgg[name] === undefined) categoryAgg[name] = 0
          categoryAgg[name] += (d.amountUsed || 0) / 10000
        }
      })
    }

    // 3) 写入图表数据
    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
    const totalBudgetSum = list.reduce((sum, it) => {
      if (!it.totalBudget) return sum
      if (it.yearly && it.yearly !== baseYear) return sum
      return sum + it.totalBudget
    }, 0)
    const perMonthBudget = (totalBudgetSum / 12) / 10000

    chartData.value = {
      trendData: {
        months,
        executionRates: monthAggCur.map((_, idx, arr) => {
          const cum = arr.slice(0, idx + 1).reduce((a,b)=>a+b,0)
          const maxCum = arr.reduce((a,b)=>a+b,0) || 1
          return Math.round((cum / maxCum) * 100)
        }),
        budgetUsage: monthAggCur
      },
      categoryData: [
        { name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT], value: categoryAgg[BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT]] || 0, color: '#1890ff' },
        { name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS], value: categoryAgg[BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS]] || 0, color: '#52c41a' },
        { name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL], value: categoryAgg[BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL]] || 0, color: '#faad14' },
        { name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER], value: categoryAgg[BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER]] || 0, color: '#f5222d' }
      ],
      monthlyComparison: {
        months: months, // 显示12个月
        currentYear: monthAggCur,
        lastYear: monthAggPrev,
        budget: new Array(12).fill(perMonthBudget)
      }
    }

    // 先关闭加载态，确保 ref DOM 已渲染，再绘图
    chartsLoading.value = false
    nextTick(() => {
      setTimeout(() => initCharts(), 16)
    })
  } catch (e) {
    console.error('❌ 前端聚合图表失败:', e)
    chartsLoading.value = false
    nextTick(() => {
      setTimeout(() => initCharts(), 16)
    })
  }
}

const exportReport = async () => {
  console.log('🔄 导出报表')
  
  try {
    // 调用导出API
    const response = await getFundExecutionProgressPage({
      pageNo: 1,
      pageSize: 1000, // 导出所有数据
      ...filters.value
    })
    
    // 兼容两种响应格式
    const responseData = response.data || response
    const projectList = responseData.list || []
    
    console.log('🔍 导出数据结构检查:', {
      hasData: !!response.data,
      hasList: !!responseData.list,
      listLength: projectList.length
    })
    
    if (projectList.length > 0) {
      // 生成报表数据
      const reportData = projectList.map(item => {
        const projectInfo = projectsList.value.find(p => p.id === item.projectId)
        return {
          '项目名称': projectInfo?.name || `项目-${item.projectId}`,
          '项目负责人': projectInfo?.manager || '待分配',
          '预算总额': `¥${formatMoney(item.totalBudget || 0)}`,
          '已执行金额': `¥${formatMoney(item.implementation || 0)}`,
          '剩余预算': `¥${formatMoney((item.totalBudget || 0) - (item.implementation || 0))}`,
          '执行率': `${item.implementationRate || 0}%`,
          '状态': item.status === 0 ? '正常' : '预警'
        }
      })
      
      console.log('📊 报表数据:', reportData)
      
      // 模拟导出成功
      message.success(`报表导出成功！共导出 ${reportData.length} 个项目数据`)
      
      // 这里可以集成真实的导出功能，比如导出Excel
      // 例如：exportToExcel(reportData, '经费执行进度报表')
    } else {
      message.warning('暂无数据可导出')
    }
  } catch (error) {
    console.error('❌ 导出报表失败:', error)
    message.error('导出报表失败')
  }
}

onMounted(async () => {
  console.log('管理页面已加载')
  // 先加载项目列表，再加载经费数据
  await loadProjectsList()
  await loadFundExecutionData()
  await updateChartsFromRecords()
})

// 监听标签页切换
watch(activeTab, (newTab) => {
  console.log('📋 管理页面标签页切换到:', newTab)
  if (newTab === 'analysis') {
    console.log('🎯 切换到统计分析标签页，延迟初始化图表...')
    setTimeout(() => {
      nextTick(async () => {
        await updateChartsFromRecords()
      })
    }, 300) // 给标签页切换一点时间
  }
})
</script>

<style scoped>
.budget-manager-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #234fa2;
  margin: 0;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.executed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.rate {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #234fa2;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.filter-toolbar {
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  margin-bottom: 24px;
}

.main-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.analysis-content {
  padding: 16px;
}

.chart-container {
  height: 250px;
  width: 100%;
  border-radius: 8px;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
  background: #d9d9d9;
  margin-right: 16px;
}

.rank-number.rank-first {
  background: #ffd700;
}

.rank-number.rank-second {
  background: #c0c0c0;
}

.rank-number.rank-third {
  background: #cd7f32;
}

.project-info {
  flex: 1;
  margin-right: 16px;
}

.project-name {
  font-weight: 500;
  color: #234fa2;
}

.project-rate {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.progress-bar {
  width: 200px;
}
</style> 