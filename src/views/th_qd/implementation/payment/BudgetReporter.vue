<template>
  <div class="budget-reporter-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <DollarOutlined /> 经费执行进度 - 填报页面
        </h1>
        <div class="user-role">
          <a-tag color="blue">
            <UserOutlined /> 我的权限：填报员
          </a-tag>
        </div>
      </div>
      <div class="header-actions">
        <span style="color: crimson; font-weight: 800;">请选择项目</span>
        <a-select 
          v-model:value="selectedProject" 
          placeholder="选择项目" 
          style="width: 280px; margin-right: 12px;"
          @change="handleProjectChange"
        >
          <a-select-option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </a-select-option>
        </a-select>
        <a-button 
          v-if="canSwitchToManager" 
          type="default" 
          @click="switchToManager"
          style="border-color: #fa8c16; color: #fa8c16;"
        >
          <CrownOutlined /> 切换到管理视图
        </a-button>
      </div>
    </div>

    <!-- 项目信息卡片 -->
    <a-card v-if="currentProject" class="project-info-card">
      <div class="project-info">
        <div class="info-item">
          <span class="label">项目名称：</span>
          <a-select 
            v-model:value="selectedProject" 
            style="width: 200px;"
            @change="handleProjectChange"
            placeholder="选择项目"
          >
            <a-select-option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="info-item">
          <span class="label">预算总额：</span>
          <span class="value budget-amount">¥{{ formatMoney(currentProject.totalBudget) }}</span>
        </div>
        <div class="info-item">
          <span class="label">已使用：</span>
          <span class="value used-amount">¥{{ formatMoney(currentProject.usedAmount) }} ({{ executionRate }}%)</span>
        </div>
        <div class="info-item">
          <span class="label">剩余：</span>
          <span class="value remaining-amount">¥{{ formatMoney(currentProject.remainingAmount) }} ({{ 100 - executionRate }}%)</span>
        </div>
      </div>
      <div class="progress-section">
        <a-progress 
          :percent="executionRate" 
          :stroke-color="progressColor"
          :stroke-width="8"
          style="margin-top: 16px;"
        />
      </div>
    </a-card>

    <!-- 主要内容区域 -->
    <div v-if="currentProject" class="main-content">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 预算明细 -->
        <a-tab-pane key="budget" tab="预算明细">
          <a-table 
            :columns="budgetColumns" 
            :data-source="budgetDetails" 
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
              <template v-else-if="column.key === 'budgetAmount'">
                ¥{{ formatMoney(record.budgetAmount) }}
              </template>
              <template v-else-if="column.key === 'usedAmount'">
                ¥{{ formatMoney(record.usedAmount) }}
              </template>
              <template v-else-if="column.key === 'remainingAmount'">
                ¥{{ formatMoney(record.remainingAmount) }}
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 经费填报 -->
        <a-tab-pane key="report" tab="经费填报">
          <div class="report-section">
            <div style="margin-bottom: 16px;">
              <a-space>
                <a-button type="primary" @click="showAddModal">
                  <PlusOutlined /> 手动填报
                </a-button>
                <a-button type="default" @click="showSmartModal" style="border-color: #52c41a; color: #52c41a;">
                  <ScanOutlined /> 智能凭证填报
                </a-button>
              </a-space>
            </div>
            
            <a-table 
              :columns="reportColumns" 
              :data-source="reportRecords" 
              :pagination="{ pageSize: 10 }"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'description'">
                  <div>
                    {{ record.description }}
                    <a-tag v-if="record.isSmartFilled" color="green" size="small" style="margin-left: 8px;">
                      <ScanOutlined /> 智能填报
                    </a-tag>
                  </div>
                </template>
                <template v-else-if="column.key === 'amount'">
                  ¥{{ formatMoney(record.amount) }}
                </template>
                <template v-else-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ record.status }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-button 
                    type="link" 
                    size="small" 
                    @click="editRecord(record)"
                  >
                    编辑
                  </a-button>
                  <a-button 
                    type="link" 
                    size="small" 
                    danger 
                    @click="deleteRecord(record)"
                  >
                    删除
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 使用记录 -->
        <a-tab-pane key="records" tab="使用记录">
          <a-table 
            :columns="recordColumns" 
            :data-source="allRecords" 
            :pagination="{ pageSize: 15 }"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'amount'">
                ¥{{ formatMoney(record.amount) }}
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-button 
                  type="link" 
                  size="small" 
                  @click="editRecord(record)"
                >
                  编辑
                </a-button>
                <a-button 
                  type="link" 
                  size="small" 
                  danger 
                  @click="deleteRecord(record)"
                >
                  删除
                </a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 执行分析 -->
        <a-tab-pane key="analysis" tab="执行分析">
          <div class="analysis-section">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="月度使用趋势" size="small">
                  <div v-if="chartsLoading" class="chart-placeholder">数据加载中...</div>
                  <div v-else class="chart-container" ref="monthlyTrendChartRef"></div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="科目分布" size="small">
                  <div v-if="chartsLoading" class="chart-placeholder">数据加载中...</div>
                  <div v-else class="chart-container" ref="categoryChartRef"></div>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 智能凭证填报弹窗 -->
    <a-modal
      v-model:open="smartModalVisible"
      title="智能凭证填报"
      width="700px"
      :footer="null"
      @cancel="handleSmartCancel"
    >
      <div class="smart-upload-container">
        <!-- 步骤指示器 -->
        <a-steps :current="smartStep" style="margin-bottom: 24px;">
          <a-step title="上传凭证" />
          <a-step title="智能识别" />
          <a-step title="确认信息" />
        </a-steps>

        <!-- 步骤1：上传凭证 -->
        <div v-if="smartStep === 0" class="upload-step">
          <a-alert 
            message="凭证要求" 
            type="info" 
            show-icon 
            style="margin-bottom: 16px;"
          >
            <template #description>
              <div class="voucher-requirements">
                <p><strong>请确保凭证图片包含以下信息：</strong></p>
                <ul>
                  <li>📅 <strong>消费日期</strong>：明确的交易时间</li>
                  <li>💰 <strong>消费金额</strong>：清晰的数字金额</li>
                  <li>🏪 <strong>商家信息</strong>：商户名称或经营范围</li>
                  <li>📝 <strong>消费项目</strong>：具体的商品或服务名称</li>
                  <li>🧾 <strong>发票类型</strong>：增值税发票、收据等</li>
                </ul>
                <p class="tip">💡 <em>支持发票、收据、购物小票等各类消费凭证</em></p>
              </div>
            </template>
          </a-alert>

          <a-upload-dragger
            v-model:file-list="smartFileList"
            :before-upload="beforeSmartUpload"
            accept="image/*"
            :max-count="1"
            @change="handleSmartUploadChange"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽凭证图片到此区域上传</p>
            <p class="ant-upload-hint">
              支持 JPG、PNG、JPEG 格式，文件大小不超过 10MB
            </p>
          </a-upload-dragger>

          <div style="margin-top: 16px; text-align: right;">
            <a-button 
              type="primary" 
              @click="startRecognition" 
              :disabled="smartFileList.length === 0"
              :loading="recognizing"
            >
              <ScanOutlined /> 开始识别
            </a-button>
          </div>
        </div>

        <!-- 步骤2：智能识别 -->
        <div v-if="smartStep === 1" class="recognition-step">
          <div class="recognition-content">
            <a-spin :spinning="recognizing" tip="正在智能识别凭证信息...">
              <div class="preview-container">
                <div class="image-preview">
                  <img v-if="previewImage" :src="previewImage" alt="凭证预览" />
                </div>
                <div class="recognition-progress">
                  <a-progress 
                    :percent="recognitionProgress" 
                    :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }"
                  />
                  <p class="progress-text">{{ recognitionText }}</p>
                </div>
              </div>
            </a-spin>
          </div>
        </div>

        <!-- 步骤3：确认信息 -->
        <div v-if="smartStep === 2" class="confirm-step">
          <a-alert 
            message="请仔细核对识别结果" 
            type="warning" 
            show-icon 
            style="margin-bottom: 16px;"
            description="系统已自动识别凭证信息，请核对准确性并进行必要的修正。"
          />

          <a-row :gutter="16">
            <a-col :span="10">
              <div class="image-preview-small">
                <img v-if="previewImage" :src="previewImage" alt="凭证预览" />
              </div>
            </a-col>
            <a-col :span="14">
              <a-form :model="recognizedData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="识别状态">
                  <a-tag :color="recognitionResult.success ? 'green' : 'red'">
                    {{ recognitionResult.success ? '识别成功' : '识别失败' }}
                  </a-tag>
                  <span v-if="recognitionResult.confidence" style="margin-left: 8px;">
                    置信度: {{ recognitionResult.confidence }}%
                  </span>
                </a-form-item>
                
                <a-form-item label="消费日期" required>
                  <a-date-picker 
                    v-model:value="recognizedData.date" 
                    style="width: 100%;" 
                    :status="recognizedData.date ? '' : 'warning'"
                  />
                  <div v-if="!recognizedData.date" class="field-warning">
                    ⚠️ 未能识别到日期，请手动选择
                  </div>
                </a-form-item>

                <a-form-item label="预算科目" required>
                  <a-select 
                    v-model:value="recognizedData.categoryId" 
                    placeholder="请选择或确认科目"
                    :status="recognizedData.categoryId ? '' : 'warning'"
                  >
                    <a-select-option v-for="category in budgetCategories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </a-select-option>
                  </a-select>
                  <div v-if="recognizedData.suggestedCategory" class="ai-suggestion">
                    💡 AI建议: {{ recognizedData.suggestedCategory }}
                  </div>
                </a-form-item>

                <a-form-item label="消费金额" required>
                  <a-input-number 
                    v-model:value="recognizedData.amount" 
                    :min="0" 
                    :precision="2"
                    style="width: 100%;"
                    placeholder="请确认金额"
                    :status="recognizedData.amount ? '' : 'warning'"
                  />
                  <div v-if="!recognizedData.amount" class="field-warning">
                    ⚠️ 未能识别到金额，请手动输入
                  </div>
                </a-form-item>

                <a-form-item label="用途说明" required>
                  <a-textarea 
                    v-model:value="recognizedData.description" 
                    :rows="3"
                    placeholder="请确认或补充用途说明"
                    :status="recognizedData.description ? '' : 'warning'"
                  />
                  <div v-if="recognizedData.merchantInfo" class="ai-info">
                    🏪 识别商家: {{ recognizedData.merchantInfo }}
                  </div>
                </a-form-item>
              </a-form>
            </a-col>
          </a-row>

          <div style="margin-top: 24px; text-align: right;">
            <a-space>
              <a-button @click="resetSmart">重新上传</a-button>
              <a-button type="primary" @click="confirmSmartData" :disabled="!isSmartDataValid">
                确认提交
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 添加/编辑经费记录弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingRecord ? '编辑经费使用记录' : '手动填报经费记录'"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="使用日期" required>
          <a-date-picker v-model:value="formData.date" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="预算科目" required>
          <a-select v-model:value="formData.categoryId" placeholder="请选择科目">
            <a-select-option v-for="category in budgetCategories" :key="category.id" :value="category.id">
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="使用金额" required>
          <a-input-number 
            v-model:value="formData.amount" 
            :min="0" 
            :precision="2"
            style="width: 100%;"
            placeholder="请输入金额"
          />
        </a-form-item>
        <a-form-item label="用途说明" required>
          <a-textarea 
            v-model:value="formData.description" 
            :rows="3"
            placeholder="请详细说明经费使用用途"
          />
        </a-form-item>
        <a-form-item label="发票附件">
          <a-upload
            v-model:file-list="formData.fileList"
            :before-upload="beforeUpload"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <a-button>
              <UploadOutlined /> 选择文件
            </a-button>
          </a-upload>
          <div style="margin-top: 8px; color: #666; font-size: 12px;">
            支持格式：PDF、JPG、PNG，文件大小不超过5MB
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { 
  DollarOutlined, 
  UserOutlined, 
  PlusOutlined, 
  UploadOutlined,
  CrownOutlined,
  ScanOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import {
  getFundExecutionProgressByProject,
  getFundExecutionDetailsByProgressId,
  getFundExecutionProgressDetailsPage,
  createFundExecutionProgress,
  createFundExecutionProgressDetails,
  updateFundExecutionProgressDetails,
  deleteFundExecutionProgressDetails,
  createFundExecutionProgressDetailsFiles,
  getFundExecutionProgressStatisticalQuery,
  BUDGET_SUBJECTS,
  BUDGET_SUBJECTS_TEXT,
  formatDateForAPI,
  formatDateForDisplay,
  formatDateTimeForAPI
} from '@/api/th_qd/implementation-v3/fund-execution'
import { fetchProjects, fetchProjectInfo } from '@/api/th_qd/implementation-v3/projects'
import { useUserStore } from '@/store/modules/user'
import { uploadTechnologicalFile } from '@/api/upload'

// 用户信息
const userStore = useUserStore()

// 接收props
const props = defineProps({
  userPermissions: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['switch-role'])

// 计算是否可以切换到管理角色
const canSwitchToManager = computed(() => {
  return props.userPermissions.roles && props.userPermissions.roles.includes('manager')
})

// 切换到管理角色
const switchToManager = () => {
  emit('switch-role', 'manager')
}

// 智能填报数据验证
const isSmartDataValid = computed(() => {
  return recognizedData.value.date && 
         recognizedData.value.categoryId && 
         recognizedData.value.amount && 
         recognizedData.value.description
})

// 数据状态
const activeTab = ref('budget')
const selectedProject = ref('')
const modalVisible = ref(false)
const smartModalVisible = ref(false)
const editingRecord = ref(null)
const smartStep = ref(0)
const smartFileList = ref([])
const recognizing = ref(false)

// 图表引用
const monthlyTrendChartRef = ref(null)
const categoryChartRef = ref(null)
const chartsLoading = ref(true)

// 智能填报相关状态（已在上面定义）
const recognitionProgress = ref(0)
const recognitionText = ref('')
const previewImage = ref('')
const recognizedData = ref({
  date: null,
  categoryId: '',
  amount: null,
  description: '',
  suggestedCategory: '',
  merchantInfo: ''
})
const recognitionResult = ref({
  success: false,
  confidence: 0
})

// 项目数据
const projects = ref([])
const loading = ref(false)

// 图表数据（仅真实数据填充；初始为空）
const monthlyUsageData = ref({ months: [], usage: [], budgets: [] })
const categoryDistributionData = ref([])

// 加载项目列表数据（使用与center页面相同的API）
const loadProjectData = async () => {
  try {
    loading.value = true
    console.log('🔄 开始加载项目列表数据')
    
    // 使用与implementation-v3中心页面相同的项目API
    const response = await fetchProjects({
      pageNo: 1,
      pageSize: 100,
      status: 8 // 8=立项通过
    })
    console.log('📊 项目列表API响应:', response)
    console.log('🔍 响应数据结构检查:', {
      hasData: !!response.data,
      hasList: !!response.data?.list,
      hasDirectList: !!response.list,
      listLength: response.data?.list?.length || response.list?.length || 0,
      firstItem: response.data?.list?.[0] || response.list?.[0]
    })
    
    const projectList = response.data?.list || response.list
    if (projectList && projectList.length > 0) {
      // 转换API数据为前端展示格式
      projects.value = projectList.map(item => {
        console.log('🔄 处理项目数据:', item)
        return {
          id: item.id,
          name: item.projectName || item.project || `项目-${item.id}`,
          projectNo: item.projectNo,
          totalBudget: 0, // 预算数据需要从经费执行进度获取
          usedAmount: 0,
          remainingAmount: 0
        }
      })
      
      // 设置默认选中第一个项目
      if (projects.value.length > 0) {
        selectedProject.value = projects.value[0].id
        console.log('✅ 设置默认选中项目:', selectedProject.value, projects.value[0].name)
        console.log('✅ 项目列表长度:', projects.value.length)
        console.log('✅ 所有项目名称:', projects.value.map(p => p.name))
        
        // 加载选中项目的经费执行进度数据
        await loadProjectBudgetData(projects.value[0].id)
      }
    } else {
      console.log('🔄 项目列表为空，显示空状态')
      projects.value = []
    }
  } catch (error) {
    console.error('❌ 加载项目数据失败:', error)
    console.error('❌ 错误详情:', error.message, error.stack)
    console.log('🔄 API调用失败，显示空状态')
    projects.value = []
    message.error('无法加载项目数据，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const currentProject = computed(() => {
  return projects.value.find(p => p.id === selectedProject.value)
})

const executionRate = computed(() => {
  if (!currentProject.value) return 0
  // 优先使用API返回的执行率，如果没有则计算
  if (currentProject.value.executionRate !== undefined) {
    return Math.round(currentProject.value.executionRate)
  }
  // 如果totalBudget为0，返回0避免NaN
  if (!currentProject.value.totalBudget) return 0
  return Math.round((currentProject.value.usedAmount / currentProject.value.totalBudget) * 100)
})

const progressColor = computed(() => {
  const rate = executionRate.value
  if (rate >= 95) return '#ff4d4f'
  if (rate >= 90) return '#fa8c16'
  if (rate >= 70) return '#52c41a'
  return '#1890ff'
})

// 预算科目数据 - 从API常量获取
const budgetCategories = ref([
  { id: 'equipment', name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT] },
  { id: 'material', name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS] },
  { id: 'personnel', name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL] },
  { id: 'other', name: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER] }
])

// 预算明细数据 - 从API加载
const budgetDetails = ref([])

// 加载预算明细数据
const loadBudgetDetails = async () => {
  try {
    if (!currentProject.value) {
      console.log('⚠️ 当前项目为空，无法加载预算明细')
      return
    }
    
    console.log('🔄 开始加载预算明细数据，项目ID:', currentProject.value.id)
    
    // 首先获取项目的经费执行进度ID
    const progressResponse = await getFundExecutionProgressByProject(currentProject.value.id)
    console.log('📊 项目经费执行进度响应:', progressResponse)
    
    // 这个API返回分页数据，取第一个
    const progressList = progressResponse.data?.list || progressResponse.list || []
    const progressData = progressList.length > 0 ? progressList[0] : null
    if (!progressData || !progressData.id) {
      console.log('⚠️ 项目无经费执行进度数据，创建默认结构')
      // 显示默认的科目结构，但数据为0
      budgetDetails.value = [
        { id: 'default-1', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 },
        { id: 'default-2', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 },
        { id: 'default-3', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 },
        { id: 'default-4', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 }
      ]
      return
    }
    
    // 调用经费执行进度明细API
    const response = await getFundExecutionDetailsByProgressId(progressData.id)
    console.log('📊 预算明细API响应:', response)
    
    const detailsList = response.data?.list || response.list || []
  if (detailsList.length > 0) {
      // 前端聚合：按科目汇总使用金额，生成更贴近"预算明细"的表格
      const categoryTotals = new Map()
      detailsList.forEach(item => {
        const key = item.budgetSubjects
        const used = item.amountUsed || 0
        categoryTotals.set(key, (categoryTotals.get(key) || 0) + used)
      })

      const totalBudget = currentProject.value?.totalBudget || 0
      const aggregated = Array.from(categoryTotals.entries()).map(([key, used]) => {
        const categoryName = BUDGET_SUBJECTS_TEXT[key] || '未知科目'
        const execRate = totalBudget > 0 ? Math.round((used / totalBudget) * 100) : 0
        return {
          id: String(key),
          category: categoryName,
          budgetAmount: 0, // 若后端未下发各科目预算，则先显示0
          usedAmount: used,
          remainingAmount: 0,
          executionRate: execRate
        }
      })

      // 保持表格稳定：按科目名称排序
      aggregated.sort((a, b) => a.category.localeCompare(b.category))
      budgetDetails.value = aggregated
      console.log('✅ 成功加载预算明细(聚合后):', budgetDetails.value.length, '科目')
    } else {
      // 如果没有明细数据，显示默认的科目结构
      console.log('🔄 无明细数据，显示默认科目结构')
      budgetDetails.value = [
        { 
          id: 'default-1', 
          category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT], 
          budgetAmount: 0, 
          usedAmount: 0, 
          remainingAmount: 0, 
          executionRate: 0 
        },
        { 
          id: 'default-2', 
          category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS], 
          budgetAmount: 0, 
          usedAmount: 0, 
          remainingAmount: 0, 
          executionRate: 0 
        },
        { 
          id: 'default-3', 
          category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL], 
          budgetAmount: 0, 
          usedAmount: 0, 
          remainingAmount: 0, 
          executionRate: 0 
        },
        { 
          id: 'default-4', 
          category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER], 
          budgetAmount: 0, 
          usedAmount: 0, 
          remainingAmount: 0, 
          executionRate: 0 
        }
      ]
    }
  } catch (error) {
    console.error('❌ 加载预算明细失败:', error)
    // 使用默认结构作为fallback
    budgetDetails.value = [
      { id: 'error-1', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 },
      { id: 'error-2', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 },
      { id: 'error-3', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 },
      { id: 'error-4', category: BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER], budgetAmount: 0, usedAmount: 0, remainingAmount: 0, executionRate: 0 }
    ]
  }
}

// 填报记录数据 - 从API加载
const reportRecords = ref([])

// 所有记录数据 - 从API加载
const allRecords = ref([])

// 加载项目预算数据（更新项目信息卡片）
const loadProjectBudgetData = async (projectId) => {
  try {
    console.log('🔄 开始加载项目预算数据，项目ID:', projectId)
    
    // 调用经费执行进度API获取项目的预算执行情况
    const response = await getFundExecutionProgressByProject(projectId)
    console.log('📊 项目预算API响应:', response)
    
    // 这个API返回的是分页数据，需要从list中取第一个
    const budgetList = response.data?.list || response.list || []
    const budgetData = budgetList.length > 0 ? budgetList[0] : null
    console.log('🔍 预算数据详情:', budgetData)
    console.log('🔍 预算数据所有字段:', Object.keys(budgetData || {}))
    
    if (budgetData && typeof budgetData === 'object') {
      // 更新当前项目的预算信息
      const projectIndex = projects.value.findIndex(p => p.id === projectId)
      if (projectIndex > -1) {
        // 检查所有可能的字段名称
        const totalBudget = budgetData.totalBudget || budgetData.budget || budgetData.total || 0
        const usedAmount = budgetData.implementation || budgetData.used || budgetData.executed || 0
        const remainingAmount = budgetData.remaining || budgetData.rest || (totalBudget - usedAmount) || 0
        const executionRate = budgetData.implementationRate || budgetData.rate || budgetData.percentage || 0
        
        projects.value[projectIndex] = {
          ...projects.value[projectIndex],
          totalBudget: totalBudget,
          usedAmount: usedAmount,
          remainingAmount: remainingAmount,
          executionRate: executionRate
        }
        console.log('✅ 项目预算数据已更新:', projects.value[projectIndex])
        console.log('✅ 字段映射结果:', {
          原始totalBudget: budgetData.totalBudget,
          原始implementation: budgetData.implementation,
          原始remaining: budgetData.remaining,
          原始implementationRate: budgetData.implementationRate,
          映射后totalBudget: totalBudget,
          映射后usedAmount: usedAmount,
          映射后remainingAmount: remainingAmount,
          映射后executionRate: executionRate
        })
      }
    }
  } catch (error) {
    console.error('❌ 加载项目预算数据失败:', error)
  }
}

// 上传记录相关文件
const uploadRecordFiles = async (detailsId, fileList) => {
  try {
    console.log('🔄 开始上传文件，明细ID:', detailsId, '文件数量:', fileList.length)
    
    const uploadedFiles = []
    
    for (const file of fileList) {
      // 使用通用上传模块上传文件
      const uploadResponse = await uploadTechnologicalFile(file.originFileObj || file, 'fund-execution')
      console.log('📤 文件上传响应:', uploadResponse)
      
      // 收集上传后的文件信息
      const fileData = {
        detailsId: detailsId,
        fileName: uploadResponse.data.fileName || file.name,
        fileUrl: uploadResponse.data.fileUrl,
        fileSize: uploadResponse.data.fileSize || file.size,
        uploadTime: formatDateTimeForAPI(new Date())
      }
      
      // 调用API保存文件记录
      const fileRecord = await createFundExecutionProgressDetailsFiles(fileData)
      uploadedFiles.push(fileRecord)
      
      console.log('✅ 文件上传并保存成功:', file.name)
    }
    
    message.success(`成功上传 ${fileList.length} 个文件`)
    return uploadedFiles
  } catch (error) {
    console.error('❌ 文件上传失败:', error)
    message.error('文件上传失败，请稍后重试')
    throw error
  }
}

// 加载使用记录数据
const loadUsageRecords = async () => {
  try {
    if (!currentProject.value) {
      console.log('⚠️ 当前项目为空，无法加载使用记录')
      return
    }
    
    console.log('🔄 开始加载使用记录数据，项目ID:', currentProject.value.id)
    
    // 首先获取项目的经费执行进度ID
    const progressResponse = await getFundExecutionProgressByProject(currentProject.value.id)
    
    // 这个API返回分页数据，取第一个
    const progressList = progressResponse.data?.list || progressResponse.list || []
    const progressData = progressList.length > 0 ? progressList[0] : null
    
    if (!progressData || !progressData.id) {
      console.log('⚠️ 项目无经费执行进度数据，无法加载使用记录')
      allRecords.value = []
      reportRecords.value = []
      return
    }
    
    // 调用经费执行进度明细分页API
    const response = await getFundExecutionProgressDetailsPage({
      pageNo: 1,
      pageSize: 100,
      executionProgressId: progressData.id
    })
    console.log('📊 使用记录API响应:', response)
    
    const recordsList = response.data?.list || response.list || []
    if (recordsList.length > 0) {
      // 转换API数据为前端展示格式
      allRecords.value = recordsList.map(item => {
        console.log('📄 记录详情:', item)
        console.log('📁 记录中的文件列表:', item.fundExecutionProgressDetailsFilesDOList)
        return {
          id: item.id,
          date: formatDateForDisplay(item.dateOfUse),
          category: BUDGET_SUBJECTS_TEXT[item.budgetSubjects] || '未知科目',
          amount: item.amountUsed || 0,
          description: item.purposeDescription || '',
          status: item.status || '待审核', // 使用API返回的状态，默认为待审核
          submitter: item.fillSubmitName || item.creator || '未知',
          files: item.fundExecutionProgressDetailsFilesDOList || [] // 添加文件列表
        }
      })
      
      // 填报记录显示所有记录（暂时不过滤用户）
      reportRecords.value = [...allRecords.value]
      console.log('✅ 填报记录数据:', reportRecords.value)
      
      console.log('✅ 成功加载使用记录:', allRecords.value.length, '条')
      
      // 前端统计：基于明细生成图表数据（无需依赖统计API）
      // 1) 月度使用聚合
      chartsLoading.value = true
      const monthToAmount = new Array(12).fill(0)
      allRecords.value.forEach(r => {
        if (!r.date) return
        const m = new Date(r.date).getMonth()
        if (m >= 0 && m < 12) monthToAmount[m] += (r.amount || 0) / 10000
      })
      const avgBudget = (currentProject.value?.totalBudget || 0) / 12 / 10000
      monthlyUsageData.value = {
        months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
        usage: monthToAmount,
        budgets: new Array(12).fill(avgBudget)
      }

      // 2) 科目分布聚合
      const categoryMap = new Map()
      allRecords.value.forEach(r => {
        const key = r.category || '未知科目'
        categoryMap.set(key, (categoryMap.get(key) || 0) + (r.amount || 0) / 10000)
      })
      const colorMap = {
        [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT]]: '#1890ff',
        [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS]]: '#52c41a',
        [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL]]: '#faad14',
        [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER]]: '#f5222d'
      }
      // 确保四大科目都展示（即便为0，也出现在图例中）
      const ordered = [
        BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT],
        BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS],
        BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL],
        BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER]
      ]
      categoryDistributionData.value = ordered.map(name => ({
        name,
        value: categoryMap.get(name) || 0,
        color: colorMap[name] || '#722ed1'
      }))

      // 3) 渲染图表
      setTimeout(() => nextTick(() => { chartsLoading.value = false; initCharts() }), 50)
    } else {
      console.log('🔄 无使用记录，显示空列表')
      allRecords.value = []
      reportRecords.value = []
      chartsLoading.value = false
    }
  } catch (error) {
    console.error('❌ 加载使用记录失败:', error)
    allRecords.value = []
    reportRecords.value = []
  }
}

// 表单数据
const formData = ref({
  date: null,
  categoryId: '',
  amount: null,
  description: '',
  fileList: []
})

// 表格列定义
const budgetColumns = [
  { title: '预算科目', dataIndex: 'category', key: 'category' },
  { title: '预算金额', dataIndex: 'budgetAmount', key: 'budgetAmount' },
  { title: '已使用', dataIndex: 'usedAmount', key: 'usedAmount' },
  { title: '剩余', dataIndex: 'remainingAmount', key: 'remainingAmount' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' }
]

const reportColumns = [
  { title: '使用日期', dataIndex: 'date', key: 'date' },
  { title: '科目', dataIndex: 'category', key: 'category' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '用途说明', dataIndex: 'description', key: 'description' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'actions' }
]

const recordColumns = [
  { title: '使用日期', dataIndex: 'date', key: 'date' },
  { title: '科目', dataIndex: 'category', key: 'category' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '用途说明', dataIndex: 'description', key: 'description' },
  { title: '填报人', dataIndex: 'submitter', key: 'submitter' },
  { title: '附件数量', key: 'fileCount', customRender: ({ record }) => record.files?.length || 0 },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'actions' }
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
    '待审核': 'orange',
    '已审核': 'green',
    '已驳回': 'red'
  }
  return colorMap[status] || 'default'
}

const handleProjectChange = async (projectId) => {
  console.log('选择项目:', projectId)
  // 项目切换时重新加载所有相关数据
  await loadProjectBudgetData(projectId)
  loadBudgetDetails()
  loadUsageRecords()
}

const showAddModal = () => {
  editingRecord.value = null
  formData.value = {
    date: null,
    categoryId: '',
    amount: null,
    description: '',
    fileList: []
  }
  modalVisible.value = true
}

const editRecord = async (record) => {
  editingRecord.value = record
  console.log('📝 编辑记录:', record)
  console.log('📁 记录中的文件列表:', record.files)
  
  // 将原有文件转换为上传组件需要的格式
  const existingFiles = record.files?.map(file => ({
    uid: `existing-${file.fileName}`,
    name: file.fileName,
    status: 'done',
    url: file.fileUrl,
    size: file.fileSize,
    response: {
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileSize: file.fileSize
    }
  })) || []
  
  formData.value = {
    date: dayjs(record.date), // record.date已经是YYYY-MM-DD格式
    categoryId: budgetCategories.value.find(c => c.name === record.category)?.id || '',
    amount: record.amount,
    description: record.description,
    fileList: existingFiles
  }
  
  console.log('📁 转换后的文件列表:', existingFiles)
  modalVisible.value = true
}

const deleteRecord = async (record) => {
  // 添加确认对话框
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除这条记录吗？\n金额：¥${record.amount}\n用途：${record.description}`,
    okText: '确认删除',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        console.log('🔄 开始删除记录，ID:', record.id)
        
        // 调用删除API
        await deleteFundExecutionProgressDetails(record.id)
        
        // 删除成功后重新加载数据
        await loadProjectBudgetData(currentProject.value.id)
        loadBudgetDetails()
        loadUsageRecords()
        
    message.success('删除成功')
        console.log('✅ 记录删除成功')
      } catch (error) {
        console.error('❌ 删除记录失败:', error)
        message.error('删除失败，请稍后重试')
  }
    }
  })
}

const handleSubmit = async () => {
  if (!formData.value.date || !formData.value.categoryId || !formData.value.amount || !formData.value.description) {
    message.error('请填写完整信息')
    return
  }

  try {
    const categoryMap = {
      'equipment': BUDGET_SUBJECTS.EQUIPMENT,
      'material': BUDGET_SUBJECTS.MATERIALS,
      'personnel': BUDGET_SUBJECTS.PERSONNEL,
      'other': BUDGET_SUBJECTS.OTHER
    }
    
    // 获取或创建当前项目的执行进度ID
    let progressData = null
    
    try {
      // 先尝试获取现有的执行进度记录
      const progressResponse = await getFundExecutionProgressByProject(currentProject.value.id)
      const progressList = progressResponse.data?.list || progressResponse.list || []
      progressData = progressList.length > 0 ? progressList[0] : null
      console.log('🔍 提交时的执行进度数据:', progressData)
    } catch (error) {
      console.log('⚠️ 获取执行进度失败，可能项目还没有执行进度记录:', error)
    }
    
    // 如果没有执行进度记录，则创建一个新的
    if (!progressData || !progressData.id) {
      console.log('🔄 项目无执行进度记录，开始创建新的执行进度记录')
      
      try {
        // 尝试从项目详情API获取预算信息
        let projectTotalBudget = currentProject.value.totalBudget || 0
        
        if (projectTotalBudget === 0) {
          try {
            console.log('🔄 尝试从项目详情获取预算信息')
            const projectDetailResponse = await fetchProjectInfo(currentProject.value.id)
            const projectDetail = projectDetailResponse.data || projectDetailResponse
            projectTotalBudget = projectDetail.totalBudget || projectDetail.budget || 0
            console.log('💰 从项目详情获取到预算:', projectTotalBudget)
          } catch (detailError) {
            console.log('⚠️ 无法获取项目详情预算信息，使用默认值:', detailError)
            // 如果无法获取项目预算，使用一个合理的默认值或0
            projectTotalBudget = 0
          }
        }
        
        const newProgressData = {
          projectId: currentProject.value.id,
          implementation: 0, // 初始已执行金额为0
          implementationRate: 0, // 初始执行率为0
          status: 0, // 0=正常
          remaining: projectTotalBudget, // 初始剩余预算等于总预算
          totalBudget: projectTotalBudget // 总预算
        }
        
        console.log('🚀 创建执行进度记录，数据:', newProgressData)
        const createProgressResponse = await createFundExecutionProgress(newProgressData)
        console.log('✅ 执行进度记录创建成功:', createProgressResponse)
        
        // 重新获取创建的执行进度记录
        const refreshResponse = await getFundExecutionProgressByProject(currentProject.value.id)
        const refreshList = refreshResponse.data?.list || refreshResponse.list || []
        progressData = refreshList.length > 0 ? refreshList[0] : null
        
        if (!progressData || !progressData.id) {
          message.error('创建项目执行进度记录失败，请稍后重试')
          return
        }
        
        console.log('✅ 成功创建并获取执行进度记录:', progressData)
      } catch (createError) {
        console.error('❌ 创建执行进度记录失败:', createError)
        message.error('创建项目执行进度记录失败，请联系管理员')
        return
      }
    }
    
    // 处理文件上传并收集文件信息
    let uploadedFilesList = []
    if (formData.value.fileList && formData.value.fileList.length > 0) {
      console.log('🔄 开始处理文件上传，文件数量:', formData.value.fileList.length)
      
      for (const file of formData.value.fileList) {
        try {
          // 检查是否是已存在的文件（编辑模式）
          if (file.status === 'done' && file.response) {
            // 这是已存在的文件，直接使用原有信息
            console.log('📁 使用已存在的文件:', file.name)
            uploadedFilesList.push({
              fileName: file.response.fileName || file.name,
              fileUrl: file.response.fileUrl,
              fileSize: file.response.fileSize || file.size,
              uploadTime: formatDateTimeForAPI(new Date()) // 更新为当前时间
            })
          } else if (file.originFileObj) {
            // 这是新上传的文件
            console.log('📤 上传新文件:', file.name)
            const uploadResponse = await uploadTechnologicalFile(file.originFileObj, 'fund-execution')
            console.log('📤 文件上传响应:', uploadResponse)
            console.log('🔍 上传响应结构:', {
              hasData: !!uploadResponse.data,
              directFields: Object.keys(uploadResponse),
              fileName: uploadResponse.fileName || uploadResponse.data?.fileName,
              fileUrl: uploadResponse.fileUrl || uploadResponse.data?.fileUrl
            })
            
            // 收集上传后的文件信息到数组（兼容两种响应格式）
            const responseData = uploadResponse.data || uploadResponse
            
            if (!responseData.fileUrl) {
              throw new Error('上传响应中缺少fileUrl字段')
            }
            
            uploadedFilesList.push({
              fileName: responseData.fileName || file.name,
              fileUrl: responseData.fileUrl,
              fileSize: responseData.fileSize || file.size,
              uploadTime: formatDateTimeForAPI(new Date())
            })
            
            console.log('📋 新文件信息已添加到列表:', uploadedFilesList[uploadedFilesList.length - 1])
          }
          
          console.log('✅ 文件处理成功:', file.name)
        } catch (uploadError) {
          console.error('❌ 文件处理失败:', file.name, uploadError)
          message.error(`文件处理失败: ${file.name}`)
          throw uploadError
        }
      }
    }

    const apiData = {
      executionProgressId: progressData.id, // 使用真实的执行进度ID
      dateOfUse: formatDateForAPI(formData.value.date.toDate()), // 时间戳格式
      budgetSubjects: categoryMap[formData.value.categoryId],
      amountUsed: formData.value.amount,
      purposeDescription: formData.value.description,
      fillSubmitName: userStore.getUser.nickname || userStore.getUser.id?.toString() || '当前用户', // 填报人员
      fundExecutionProgressDetailsFilesDOList: uploadedFilesList // 上传的文件列表
    }
    
    console.log('📝 提交数据:', apiData)
    console.log('📁 文件列表字段名:', 'fundExecutionProgressDetailsFilesDOList')
    console.log('📁 上传的文件数量:', uploadedFilesList.length)
    console.log('📁 文件列表详情:', JSON.stringify(uploadedFilesList, null, 2))
    console.log('👤 当前用户信息:', {
      nickname: userStore.getUser.nickname,
      id: userStore.getUser.id,
      fillSubmitName: apiData.fillSubmitName
    })

    let recordId
    if (editingRecord.value) {
      // 更新记录
      const updateResponse = await updateFundExecutionProgressDetails({ ...apiData, id: editingRecord.value.id })
      recordId = editingRecord.value.id
    message.success('修改成功')
  } else {
      // 创建新记录
      console.log('🚀 调用创建API，数据:', JSON.stringify(apiData, null, 2))
      const createResponse = await createFundExecutionProgressDetails(apiData)
      console.log('📝 创建记录API响应:', createResponse)
      recordId = createResponse.data?.id || createResponse.id
      console.log('🆔 新创建的记录ID:', recordId)
      
      // 验证创建后的记录是否包含文件信息
      if (recordId) {
        try {
          const verifyResponse = await getFundExecutionProgressDetails(recordId)
          console.log('🔍 验证创建的记录:', verifyResponse)
          console.log('🔍 记录中的文件列表:', verifyResponse.data?.fundExecutionProgressDetailsFilesDOList || verifyResponse.fundExecutionProgressDetailsFilesDOList)
        } catch (verifyError) {
          console.error('❌ 验证记录失败:', verifyError)
        }
      }
      
    message.success('提交成功，等待审核')
    }
    
    // 文件已在上面处理并包含在apiData中
    
    // 重新加载数据
    await loadProjectBudgetData(currentProject.value.id)
    loadBudgetDetails()
    loadUsageRecords()
    
    // 清空表单
    formData.value = {
      date: null,
      categoryId: '',
      amount: null,
      description: '',
      fileList: []
    }
    
  } catch (error) {
    console.error('提交失败:', error)
    message.error('提交失败，请稍后重试')
    return
  }
  
  modalVisible.value = false
}

const handleCancel = () => {
  modalVisible.value = false
}

const beforeUpload = (file) => {
  const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  if (!isValidType) {
    message.error('只能上传PDF、JPG、PNG格式的文件')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('文件大小不能超过5MB')
    return false
  }
  
  console.log('📁 文件验证通过:', file.name, file.type, file.size)
  return false // 阻止自动上传，我们在提交时手动处理
}

// 智能填报相关方法
const showSmartModal = () => {
  smartModalVisible.value = true
  smartStep.value = 0
  resetSmartData()
}

const handleSmartCancel = () => {
  smartModalVisible.value = false
  resetSmartData()
}

const resetSmartData = () => {
  smartStep.value = 0
  smartFileList.value = []
  recognizing.value = false
  recognitionProgress.value = 0
  recognitionText.value = ''
  previewImage.value = ''
  recognizedData.value = {
    date: null,
    categoryId: '',
    amount: null,
    description: '',
    suggestedCategory: '',
    merchantInfo: ''
  }
  recognitionResult.value = {
    success: false,
    confidence: 0
  }
}

const beforeSmartUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片格式的文件')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('图片大小不能超过10MB')
    return false
  }
  return false
}

const handleSmartUploadChange = (info) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    // 生成预览图片
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(info.file.originFileObj || info.file)
  }
}

const startRecognition = async () => {
  if (smartFileList.value.length === 0) {
    message.error('请先上传凭证图片')
    return
  }

  recognizing.value = true
  smartStep.value = 1
  recognitionProgress.value = 0
  
  // 模拟识别过程
  const steps = [
    { progress: 20, text: '正在预处理图片...' },
    { progress: 40, text: '正在识别文字信息...' },
    { progress: 60, text: '正在提取关键数据...' },
    { progress: 80, text: '正在智能分析内容...' },
    { progress: 100, text: '识别完成！' }
  ]

  for (let step of steps) {
    await new Promise(resolve => setTimeout(resolve, 800))
    recognitionProgress.value = step.progress
    recognitionText.value = step.text
  }

  // 模拟识别结果
  await simulateRecognition()
  
  recognizing.value = false
  smartStep.value = 2
}

const simulateRecognition = async () => {
  // 模拟AI识别结果
  const mockResults = [
    // {
    //   success: true,
    //   confidence: 92,
    //   date: dayjs('2024-01-15'),
    //   amount: 2500.00,
    //   description: '购买实验设备 - 数字万用表',
    //   suggestedCategory: '设备费',
    //   categoryId: 'equipment',
    //   merchantInfo: '北京科技器材有限公司'
    // },
    // {
    //   success: true,
    //   confidence: 88,
    //   date: dayjs('2024-01-12'),
    //   amount: 850.00,
    //   description: '采购实验材料 - 化学试剂',
    //   suggestedCategory: '材料费',
    //   categoryId: 'material',
    //   merchantInfo: '上海化工材料商城'
    // },
    // {
    //   success: true,
    //   confidence: 95,
    //   date: dayjs('2024-01-10'),
    //   amount: 1200.00,
    //   description: '研究人员交通费报销',
    //   suggestedCategory: '其他费用',
    //   categoryId: 'other',
    //   merchantInfo: '滴滴出行'
    // }
  ]

  // 随机选择一个结果
  const result = mockResults[Math.floor(Math.random() * mockResults.length)]
  
  recognitionResult.value = {
    success: result.success,
    confidence: result.confidence
  }
  
  recognizedData.value = {
    date: result.date,
    categoryId: result.categoryId,
    amount: result.amount,
    description: result.description,
    suggestedCategory: result.suggestedCategory,
    merchantInfo: result.merchantInfo
  }

  message.success(`识别成功！置信度: ${result.confidence}%`)
}

const resetSmart = () => {
  resetSmartData()
  smartModalVisible.value = true
}

const confirmSmartData = () => {
  if (!isSmartDataValid.value) {
    message.error('请完善必填信息')
    return
  }

  const categoryName = budgetCategories.value.find(c => c.id === recognizedData.value.categoryId)?.name || ''
  
  const newRecord = {
    id: Date.now(),
    date: recognizedData.value.date.format('YYYY-MM-DD'),
    category: categoryName,
    amount: recognizedData.value.amount,
    description: recognizedData.value.description,
    status: '待审核',
    submitter: '张三',
    isSmartFilled: true // 标记为智能填报
  }
  
  reportRecords.value.unshift(newRecord)
  smartModalVisible.value = false
  message.success('智能填报成功！记录已提交审核')
  
  // 重置数据
  resetSmartData()
}

// 初始化图表
const initCharts = () => {
  console.log('🎯 开始初始化图表...')
  console.log('📊 图表容器引用:', {
    monthlyTrendChartRef: monthlyTrendChartRef.value,
    categoryChartRef: categoryChartRef.value
  })
  console.log('📊 图表数据:', {
    monthlyUsageData: monthlyUsageData.value,
    categoryDistributionData: categoryDistributionData.value
  })
  
  // 月度使用趋势图
  if (monthlyTrendChartRef.value) {
    if (!monthlyUsageData.value.months.length) return
    console.log('🎯 初始化月度趋势图...')
    console.log('📊 图表容器尺寸:', {
      width: monthlyTrendChartRef.value.offsetWidth,
      height: monthlyTrendChartRef.value.offsetHeight,
      clientWidth: monthlyTrendChartRef.value.clientWidth,
      clientHeight: monthlyTrendChartRef.value.clientHeight
    })
    
    const monthlyChart = echarts.init(monthlyTrendChartRef.value)
    monthlyChart.setOption({
      title: {
        text: '月度经费使用趋势',
        textStyle: { fontSize: 14, color: '#333' },
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
        data: ['实际使用', '预算额度'],
        bottom: 10
      },
      grid: {
        left: '6%',
        right: '6%',
        bottom: '20%',
        top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: monthlyUsageData.value.months,
        axisLine: { lineStyle: { color: '#ddd' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        name: '金额(万元)',
        nameTextStyle: { color: '#666' },
        axisLine: { lineStyle: { color: '#ddd' } },
        axisLabel: { 
          color: '#666',
          formatter: '{value}万'
        },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series: [
        {
          name: '实际使用',
          type: 'bar',
          data: monthlyUsageData.value.usage,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#40a9ff' },
                { offset: 1, color: '#1890ff' }
              ]
            }
          },
          emphasis: {
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#69c0ff' },
                  { offset: 1, color: '#40a9ff' }
                ]
              }
            }
          }
        },
        {
          name: '预算额度',
          type: 'line',
          data: monthlyUsageData.value.budgets,
          lineStyle: { 
            color: '#52c41a',
            width: 2,
            type: 'dashed'
          },
          itemStyle: { color: '#52c41a' },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    })
    
    console.log('✅ 月度趋势图初始化完成')
  } else {
    console.log('❌ 月度趋势图容器未找到')
  }

  // 科目分布饼图
  if (categoryChartRef.value) {
    if (!categoryDistributionData.value.length) return
    console.log('🎯 初始化科目分布图...')
    const categoryChart = echarts.init(categoryChartRef.value)
    categoryChart.setOption({
      title: {
        text: '预算科目使用分布',
        textStyle: { fontSize: 14, color: '#333' },
        left: 'center'
      },
      tooltip: { 
        trigger: 'item',
        formatter: '{a} <br/>{b}: ¥{c}万 ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        data: categoryDistributionData.value.map(item => item.name)
      },
      series: [{
        name: '使用金额',
        type: 'pie',
        radius: ['36%', '68%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        data: categoryDistributionData.value.map(item => ({
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
          formatter: '{b}\n¥{c}万\n({d}%)',
          fontSize: 12
        }
      }]
    })
    
    console.log('✅ 科目分布图初始化完成')
  } else {
    console.log('❌ 科目分布图容器未找到')
  }
  
  console.log('🎯 图表初始化流程完成')
}

// 加载统计数据并更新图表
const loadStatisticsData = async () => {
  try {
    if (!currentProject.value) {
      console.log('⚠️ 当前项目为空，无法加载统计数据')
      return
    }
    
    console.log('🔄 开始加载统计数据，项目ID:', currentProject.value.id)
    
    // 调用统计查询API
    const response = await getFundExecutionProgressStatisticalQuery({
      projectId: currentProject.value.id,
      yearly: new Date().getFullYear() // 查询当前年份的数据
    })
    
    console.log('📊 统计数据API响应:', response)
    
    const statisticsData = response.data || response
    
    if (statisticsData && statisticsData.length > 0) {
      const projectStats = statisticsData[0] // 取第一个项目的统计数据
      console.log('📈 项目统计数据:', projectStats)
      
      // 更新月度使用数据
      const monthlyData = new Array(12).fill(0)
      const monthlyBudgets = new Array(12).fill(0)
      
      if (projectStats.monthlyStats) {
        Object.entries(projectStats.monthlyStats).forEach(([key, stats]) => {
          const monthIndex = parseInt(stats.month) - 1 // 月份从1开始，数组从0开始
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex] = (stats.executedAmount || 0) / 10000 // 转换为万元
            // 预算额度可以根据总预算平均分配或从其他接口获取
            monthlyBudgets[monthIndex] = (projectStats.totalBudget || 0) / 12 / 10000
          }
        })
      }
      
      monthlyUsageData.value = {
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        usage: monthlyData,
        budgets: monthlyBudgets
      }
      
      // 更新科目分布数据
      const categoryData = []
      if (projectStats.categoryStats) {
        Object.entries(projectStats.categoryStats).forEach(([categoryKey, stats]) => {
          const categoryName = BUDGET_SUBJECTS_TEXT[categoryKey] || categoryKey
          const colors = {
            [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.EQUIPMENT]]: '#1890ff',
            [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.MATERIALS]]: '#52c41a', 
            [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.PERSONNEL]]: '#faad14',
            [BUDGET_SUBJECTS_TEXT[BUDGET_SUBJECTS.OTHER]]: '#f5222d'
          }
          
          categoryData.push({
            name: categoryName,
            value: (stats.executedAmount || 0) / 10000, // 转换为万元
            color: colors[categoryName] || '#722ed1'
          })
        })
      }
      
      categoryDistributionData.value = categoryData
      
      console.log('✅ 统计数据更新完成')
      console.log('📊 月度数据:', monthlyUsageData.value)
      console.log('📊 科目数据:', categoryDistributionData.value)
      
      // 重新初始化图表
      setTimeout(() => {
        nextTick(() => {
          initCharts()
        })
      }, 100)
    } else {
      console.log('⚠️ 无统计数据，使用默认数据')
      // 使用默认的模拟数据
      setTimeout(() => {
        nextTick(() => {
          initCharts()
        })
      }, 100)
    }
  } catch (error) {
    console.error('❌ 加载统计数据失败:', error)
    // 使用默认的模拟数据
    setTimeout(() => {
      nextTick(() => {
        initCharts()
      })
    }, 100)
  }
}

onMounted(async () => {
  // 先加载项目数据，再设置默认选中项目
  await loadProjectData()
  // 加载所有相关数据
  loadBudgetDetails()
  loadUsageRecords()
  
  // 加载统计数据并初始化图表
  await loadStatisticsData()
})

// 监听标签页切换
watch(activeTab, (newTab) => {
  console.log('📋 标签页切换到:', newTab)
  if (newTab === 'analysis') {
    console.log('🎯 切换到执行分析标签页，延迟初始化图表...')
    setTimeout(() => {
      nextTick(() => {
        initCharts()
      })
    }, 300) // 给标签页切换一点时间
  }
})
</script>

<style scoped>
.budget-reporter-page {
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

.project-info-card {
  margin-bottom: 24px;
}

.project-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.value {
  font-weight: 600;
}

.budget-amount {
  color: #1890ff;
  font-size: 18px;
}

.used-amount {
  color: #52c41a;
}

.remaining-amount {
  color: #fa8c16;
}

.main-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.report-section {
  padding: 16px;
}

.analysis-section {
  padding: 16px;
}

.chart-container {
  height: 300px;
  width: 100%;
  border-radius: 8px;
}

.switch-role-btn {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 智能填报样式 */
.smart-upload-container {
  .voucher-requirements {
    ul {
      margin: 8px 0;
      padding-left: 20px;
      
      li {
        margin: 6px 0;
        line-height: 1.6;
      }
    }
    
    .tip {
      margin-top: 12px;
      font-style: italic;
      color: #666;
    }
  }
  
  .preview-container {
    text-align: center;
    padding: 20px;
    
    .image-preview {
      margin-bottom: 20px;
      
      img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .recognition-progress {
      .progress-text {
        margin-top: 8px;
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .image-preview-small {
    img {
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .field-warning {
    color: #faad14;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .ai-suggestion {
    color: #52c41a;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .ai-info {
    color: #1890ff;
    font-size: 12px;
    margin-top: 4px;
  }
}
</style> 