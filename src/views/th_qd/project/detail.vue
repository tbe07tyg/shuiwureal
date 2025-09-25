<template>
  <div class="project-detail-page">
    <div class="project-detail-header">
      <a-button type="link" @click="goBack">返回</a-button>
      <span class="project-title">{{ project.name }}（{{ project.code }}）</span>
      <a-tag :color="statusColorMap[projectStatus]">{{ statusLabelMap[projectStatus] }}</a-tag>
      <a-progress :percent="projectProgress" status="active" style="width:200px;margin-left:32px;" />
    </div>
    <div class="project-detail-main">
      <div class="project-steps-container">
        <!-- 立项阶段 -->
        <div class="phase-section phase-立项">
          <div class="phase-header">立项阶段</div>
          <a-steps 
            direction="vertical" 
            :current="currentStep" 
            class="phase-steps"
          >
            <a-step 
              v-for="(step, idx) in steps.slice(0, 3)" 
              :key="step.key" 
              :title="step.title" 
              :status="getStepStatus(idx)"
              @click="handleStepClick(idx, step)"
              class="step-item"
            />
          </a-steps>
        </div>
        
        <!-- 在研阶段 -->
        <div class="phase-section phase-在研">
          <div class="phase-header">在研阶段</div>
          <a-steps 
            direction="vertical" 
            :current="currentStep - 3" 
            class="phase-steps"
          >
            <a-step 
              v-for="(step, idx) in steps.slice(3, 6)" 
              :key="step.key" 
              :title="step.title" 
              :status="getStepStatus(idx + 3)"
              @click="handleStepClick(idx + 3, step)"
              class="step-item"
            />
          </a-steps>
        </div>
        
        <!-- 结题阶段 -->
        <div class="phase-section phase-结题">
          <div class="phase-header">结题阶段</div>
          <a-steps 
            direction="vertical" 
            :current="currentStep - 6" 
            class="phase-steps"
          >
            <a-step 
              v-for="(step, idx) in steps.slice(6, 7)" 
              :key="step.key" 
              :title="step.title" 
              :status="getStepStatus(idx + 6)"
              @click="handleStepClick(idx + 6, step)"
              class="step-item"
            />
          </a-steps>
        </div>
        
        <!-- 归档阶段 -->
        <div class="phase-section phase-归档">
          <div class="phase-header">归档阶段</div>
          <a-steps 
            direction="vertical" 
            :current="currentStep - 7" 
            class="phase-steps"
          >
            <a-step 
              v-for="(step, idx) in steps.slice(7)" 
              :key="step.key" 
              :title="step.title" 
              :status="getStepStatus(idx + 7)"
              @click="handleStepClick(idx + 7, step)"
              class="step-item"
            />
      </a-steps>
        </div>
      </div>
      
      <div class="project-step-content">
        <div class="step-header">
          <h3>{{ currentStepInfo.title }}</h3>
          <a-tag :color="statusColorMap[projectStatus]">{{ statusLabelMap[projectStatus] }}</a-tag>
        </div>
        <div class="step-desc">
          <p>{{ currentStepInfo.desc }}</p>
        </div>
        
        <!-- 研究方向调研 -->
        <ResearchStep v-if="currentStepInfo.key === 'research'" :project="project" @submit="handleStepSubmit" />
        
        <!-- 提交申请 -->
        <ApplyStep v-else-if="currentStepInfo.key === 'apply'" :project="project" @submit="handleStepSubmit" />
        
        <!-- 项目立项 -->
        <ApprovalStep v-else-if="currentStepInfo.key === 'approval'" :project="project" @submit="handleStepSubmit" />
        
        <!-- 项目开题 -->
        <KickoffStep v-else-if="currentStepInfo.key === 'kickoff'" :project="project" @submit="handleStepSubmit" />
        
        <!-- 项目实施 -->
        <ImplementationStep v-else-if="currentStepInfo.key === 'implementation'" :project="project" @submit="handleStepSubmit" />
        
        <!-- 中期汇报 -->
        <MidtermStep v-else-if="currentStepInfo.key === 'midterm'" :project="project" @submit="handleStepSubmit" />
        
        <!-- 项目验收 -->
        <AcceptanceStep v-else-if="currentStepInfo.key === 'acceptance'" :project="project" @submit="handleStepSubmit" />
        
        <!-- 项目归档 -->
        <ArchiveStep v-else-if="currentStepInfo.key === 'archive'" :project="project" @submit="handleStepSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ApplyStep from './steps/ApplyStep.vue'
import ReviewStep from './steps/ReviewStep.vue'

const router = useRouter()
const route = useRoute()
const currentStep = ref(0) // 设置为第0步（立项申报），查看立项阶段背景色

/**
 * 科研项目管理流程步骤定义（根据实际工作流程重新设计）
 * 状态映射：立项(0-2) -> 在研(3-5) -> 结题(6) -> 归档(7)
 */
const steps = [
  // 立项阶段 (0-2)
  { key: 'research', title: '研究方向调研', status: 'wait', phase: '立项', desc: '水厂实地调研、交流座谈、组建项目组、集体讨论' },
  { key: 'apply', title: '提交申请', status: 'wait', phase: '立项', desc: '结合本单位下年度计划上报科研管理部门' },
  { key: 'approval', title: '项目立项', status: 'wait', phase: '立项', desc: '承担单位技术创新部审批立项' },
  
  // 在研阶段 (3-5)
  { key: 'kickoff', title: '项目开题', status: 'wait', phase: '在研', desc: '纳入承担单位下年度计划、技术创新部专家团队' },
  { key: 'implementation', title: '项目实施', status: 'wait', phase: '在研', desc: '技术创新部监管管理、承担单位推进实施' },
  { key: 'midterm', title: '中期汇报', status: 'wait', phase: '在研', desc: '技术创新部专家团队、配合单位现场开展' },
  
  // 结题阶段 (6)
  { key: 'acceptance', title: '项目验收', status: 'wait', phase: '结题', desc: '技术创新部专家团队相关职能部门' },
  
  // 归档阶段 (7)
  { key: 'archive', title: '项目归档', status: 'wait', phase: '归档', desc: '承担单位技术创新部归档管理' }
]

const currentStepInfo = computed(() => steps[currentStep.value])

/**
 * 根据当前步骤计算项目状态
 */
const projectStatus = computed(() => {
  if (currentStep.value <= 2) return '立项'      // 步骤 0-2
  if (currentStep.value <= 5) return '在研'      // 步骤 3-5  
  if (currentStep.value === 6) return '结题'     // 步骤 6
  return '归档'                                   // 步骤 7
})

/**
 * 计算项目进度百分比
 */
const projectProgress = computed(() => {
  return Math.round((currentStep.value / (steps.length - 1)) * 100)
})

const statusColorMap = { '立项': 'blue', '在研': 'processing', '结题': 'orange', '归档': 'default' }
const statusLabelMap = { '立项': '立项', '在研': '在研', '结题': '结题', '归档': '归档' }

/**
 * 获取步骤状态
 */
function getStepStatus(index) {
  if (index < currentStep.value) return 'finish'
  if (index === currentStep.value) return 'process'
  return 'wait'
}

/**
 * 获取步骤标签颜色
 */
function getStepTagColor(index) {
  const status = getStepStatus(index)
  switch (status) {
    case 'finish': return 'success'
    case 'process': return 'processing'
    default: return 'default'
  }
}

/**
 * 获取步骤状态文本
 */
function getStepStatusText(index) {
  const status = getStepStatus(index)
  switch (status) {
    case 'finish': return '已完成'
    case 'process': return '进行中'
    default: return '待处理'
  }
}

/**
 * 步骤点击处理
 */
function handleStepClick(index, step) {
  // 只允许点击当前步骤和已完成的步骤
  if (index <= currentStep.value) {
    currentStep.value = index
  }
}

/**
 * 步骤提交处理
 */
function handleStepSubmit(data) {
  console.log('步骤提交:', currentStepInfo.value.title, data)
  // 这里处理步骤提交逻辑，可能需要调用API
  // 提交成功后推进到下一步
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function goBack() { 
  router.back() 
}

// 根据路由参数初始化项目数据
function initProjectData() {
  const projectId = route.params.id
  
  // 如果是新项目编号格式（XM开头），创建新项目数据
  if (projectId && projectId.startsWith('XM')) {
    return {
      code: projectId,
      name: '', // 新项目名称从创建页面传来
      type: '',
      leader: '',
      dept: '',
      start: '',
      end: '',
      status: '立项',
      desc: '',
      progress: 0,
      stages: [],
      members: [],
      fund: { total: 0, used: 0, left: 0 },
      docs: [],
      logs: [
        { time: new Date().toISOString().split('T')[0], content: '项目创建' }
      ]
    }
  } else {
    // 现有项目数据（mock）
    return {
  code: 'XM2024002',
  name: '水质监测系统',
  type: '横向',
  leader: '李四',
  dept: '管理部',
  start: '2024-01-01',
  end: '2024-12-31',
  status: '在研',
  desc: '本项目旨在提升水质监测自动化水平。',
  progress: 60,
  stages: ['需求分析', '系统设计', '开发测试', '部署验收'],
  members: [
    { name: '李四', role: '负责人', phone: '13800000001' },
    { name: '王五', role: '成员', phone: '13800000002' }
  ],
  fund: { total: 100, used: 60, left: 40 },
  docs: [
    { name: '项目立项书.pdf' },
    { name: '需求文档.docx' }
  ],
  logs: [
    { time: '2024-01-01', content: '项目立项' },
    { time: '2024-03-01', content: '需求分析完成' },
    { time: '2024-05-01', content: '系统设计完成' }
  ]
    }
  }
}

// 初始化项目数据
const project = ref(initProjectData())

// Mock组件 - 后续需要创建实际组件文件
const ResearchStep = { template: '<div>研究方向调研（待开发）</div>' }
const ApprovalStep = { template: '<div>项目立项（待开发）</div>' }
const KickoffStep = { template: '<div>项目开题（待开发）</div>' }
const ImplementationStep = { template: '<div>项目实施（待开发）</div>' }
const MidtermStep = { template: '<div>中期汇报（待开发）</div>' }
const AcceptanceStep = { template: '<div>项目验收（待开发）</div>' }
const ArchiveStep = { template: '<div>项目归档（待开发）</div>' }
</script>

<style scoped>
.project-detail-page {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(35,79,162,0.08);
  padding: 32px;
  margin: 0 auto;
  max-width: 1400px;
}

.project-detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.project-title {
  font-size: 20px;
  font-weight: bold;
  color: #234fa2;
}

.project-detail-main {
  display: flex;
  gap: 32px;
}

.project-steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
  max-width: 300px;
}

.phase-section {
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  transition: all 0.3s ease;
}

/* 抽屉式阶段背景色 */
.phase-立项 {
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f8ff 100%);
  border-left: 6px solid #1890ff;
}

.phase-在研 {
  background: linear-gradient(135deg, #e6fffb 0%, #f0fffc 100%);
  border-left: 6px solid #13c2c2;
}

.phase-结题 {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border-left: 6px solid #fa8c16;
}

.phase-归档 {
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  border-left: 6px solid #d9d9d9;
}

.phase-header {
  font-size: 14px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(35, 79, 162, 0.1);
  text-align: center;
}

.phase-steps {
  background: transparent !important;
}

/* 修复连接线对齐 - 确保连接线垂直居中通过序号 */
.phase-steps :deep(.ant-steps-item-tail) {
  left: 15px !important; /* 调整为步骤图标的中心位置 */
  top: 40px;
  height: calc(100% - 40px);
}

.phase-steps :deep(.ant-steps-item-tail::after) {
  width: 2px;
  background: rgba(35, 79, 162, 0.2);
  left: 50%;
  transform: translateX(-50%);
}

/* 步骤图标样式 */
.phase-steps :deep(.ant-steps-item-icon) {
  width: 32px;
  height: 32px;
  margin-left: 0;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phase-steps :deep(.ant-steps-item-content) {
  min-height: 48px;
  margin-left: 48px;
  display: flex;
  align-items: center;
}

.phase-steps :deep(.ant-steps-item-title) {
  line-height: 32px;
  font-size: 14px;
  margin: 0;
}

/* 步骤悬停效果 */
.phase-steps :deep(.ant-steps-item) {
  cursor: pointer;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.phase-steps :deep(.ant-steps-item:hover) {
  background: rgba(255, 255, 255, 0.8) !important;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(35, 79, 162, 0.15);
}

/* 步骤状态样式 */
.phase-steps :deep(.ant-steps-item-process .ant-steps-item-icon) {
  background: #234fa2;
  border-color: #234fa2;
  box-shadow: 0 0 0 4px rgba(35, 79, 162, 0.1);
}

.phase-steps :deep(.ant-steps-item-finish .ant-steps-item-icon) {
  background: #52c41a;
  border-color: #52c41a;
}

.phase-steps :deep(.ant-steps-item-wait .ant-steps-item-icon) {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.project-step-content {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  padding: 24px;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.step-header h3 {
  margin: 0;
  color: #234fa2;
  font-size: 18px;
}

.step-desc {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #234fa2;
}

.step-desc p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}
</style> 