<!--
 * @file 项目立项在线填报页面（新版）- 表单语义优先
 * @description 支持图片上传/粘贴/拖拽、字体样式控制、打印友好的在线填报页面
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-22
-->
<template>
  <div class="online-form-container">
    <!-- 页面头部 -->
    <div class="page-header no-print">
      <div class="header-content">
        <h1 class="page-title">研发项目申请书（在线填报）</h1>
        <p class="page-description">表单语义优先，支持图片与样式控制</p>
      </div>
      <div class="header-actions">
        <a-button @click="handleSave" type="primary">
          <SaveOutlined />
          保存
        </a-button>
        <a-button @click="handleUpdate" type="primary" style="margin-left: 8px;">
          <EditOutlined />
          更新
        </a-button>
        <a-button @click="handlePrint">
          <PrinterOutlined />
          打印
        </a-button>
        <a-button @click="goBack">
          <ArrowLeftOutlined />
          返回
        </a-button>
      </div>
    </div>

    <!-- 顶部工具栏移除：采用就近悬浮工具条 -->

    <!-- 图片就近浮动工具条 -->
    <div
      v-if="imageToolbar.visible"
      class="image-toolbar no-print"
      :style="imageToolbar.style"
    >
      <a-space size="small">
        <a-button size="small" @click="alignSelectedImage('left')">左</a-button>
        <a-button size="small" @click="alignSelectedImage('center')">居中</a-button>
        <a-button size="small" @click="alignSelectedImage('right')">右</a-button>
        <a-divider type="vertical" />
        <a-button size="small" @click="setSelectedImageWidth(30)">30%</a-button>
        <a-button size="small" @click="setSelectedImageWidth(50)">50%</a-button>
        <a-button size="small" @click="setSelectedImageWidth(100)">100%</a-button>
        <a-divider type="vertical" />
        <a-button size="small" danger @click="removeSelectedImage">删除</a-button>
        <a-button size="small" @click="closeImageToolbar">关闭</a-button>
      </a-space>
    </div>

    <!-- 文本就近浮动工具条（字号/加粗/斜体/下划线） -->
    <div
      v-if="textToolbar.visible"
      class="image-toolbar no-print"
      :style="textToolbar.style"
    >
      <a-space size="small">
        <a-select v-model:value="currentFontSize" style="width: 110px" size="small" @change="applyFontSize">
          <a-select-option :value="12">小四号 (12pt)</a-select-option>
          <a-select-option :value="14">四号 (14pt)</a-select-option>
          <a-select-option :value="16">小三号 (16pt)</a-select-option>
          <a-select-option :value="18">三号 (18pt)</a-select-option>
        </a-select>
        <!-- 快速编排：中文编号 / 数字编号 / 小黑点 -->
        <a-button size="small" @click="applyQuickList('cn')">一、</a-button>
        <a-button size="small" @click="applyQuickList('num')">1）</a-button>
        <a-button size="small" @click="applyQuickList('dot')">•</a-button>
        <a-button size="small" @click="toggleBold">B</a-button>
        <a-button size="small" @click="toggleItalic">I</a-button>
        <a-button size="small" class="underline-btn" @click="toggleUnderline">U</a-button>
        <a-button size="small" @click="closeTextToolbar">关闭</a-button>
      </a-space>
    </div>

    <!-- 在线表单内容区域 -->
    <div
      class="form-content-wrapper"
      @drop="handleDrop"
      @dragover.prevent
    >
      <!-- 表单标题 -->
      <div class="form-title-section">
        <h2 class="form-main-title">郑州水务集团</h2>
        <h2 class="form-main-title">研发项目申请书</h2>
      </div>
      <!-- 填报说明 -->
      <div class="form-section">
        <h3 class="section-title">填报说明</h3>
        <div class="note-block">
          <p>1、根据集团规定，申报科技项目须填报《郑州水务集团有限公司研发项目申请书》。</p>
          <p>2、《项目申请书》经单位负责人签署意见并盖章后提交。</p>
          <p>3、《项目申请书》的内容必须真实，所附材料齐全，要求项目概况、开发目标明确，内容重点突出、技术路线清晰，主要技术经济指标应科学、合理，阶段目标和年度进度计划明确，经费预算合理。</p>
          <p>4、《项目申请书》中未列但需说明的内容可加附页，相关技术文献、证明文件等材料应作为附件一同上报，规格统一使用A4纸，打印文字采用4号宋体字。</p>
        </div>
      </div>

      <!-- 项目概况/单位概况（源模板结构） -->
      <div class="form-section">
        <table class="info-table" border="1" cellspacing="0" style="table-layout: fixed; width: 100%;">
          <colgroup>
            <col style="width: 10%;" />
            <col style="width: 15%;" />
            <col style="width: 75%;" />
          </colgroup>
          <tr>
            <td class="vertical-cell" rowspan="3">项目概况</td>
            <td class="label-cell">项目名称</td>
            <td class="value-cell">
              <input type="text" v-model="formData.projectName" class="input-field" placeholder="请输入项目名称" />
            </td>
          </tr>
          <tr>
            <td class="label-cell">预期主要<br/>成果形式</td>
            <td class="value-cell">
              <div class="result-types">
                <a-checkbox-group
                  v-model:value="formData.resultTypes"
                  :options="resultTypeOptions"
                />
                <div v-if="formData.resultTypes?.includes('其他')" style="margin-top: 8px;">
                  <input
                    type="text"
                    v-model="formData.resultOther"
                    class="input-field"
                    placeholder="请填写其他成果形式"
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="label-cell">经费合计（万元）</td>
            <td class="value-cell">
              <input type="number" v-model="formData.budget" class="input-field" placeholder="请输入经费合计（万元）" />
            </td>
          </tr>
          <tr>
            <td class="vertical-cell" rowspan="2">单位概况</td>
            <td class="label-cell">单位名称</td>
            <td class="value-cell">
              <input type="text" v-model="formData.department" class="input-field" placeholder="请输入单位名称" />
            </td>
          </tr>
          <tr>
            <td class="label-cell">项目负责人 / 电话</td>
            <td class="value-cell">
              <div class="two-cols">
                <input type="text" v-model="formData.projectLeader" class="input-field" placeholder="负责人" />
                <input type="text" v-model="formData.phone" class="input-field" placeholder="电话" />
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- 示例区域2：项目主要研究、开发内容（可插入图片） -->
      <div class="form-section">
        <h3 class="section-title">项目主要研究、开发内容（不超过100个汉字）</h3>
        <div
          class="rich-textarea"
          ref="researchContentRef"
          contenteditable="true"
          @input="updateResearchContent"
          @paste="(e) => { handlePaste(e); e.stopPropagation(); }"
          @focus="onEditorFocus('research', $event)"
          @keydown="onEditorKeyDown($event)"
          data-placeholder="请输入项目主要研究、开发内容，支持粘贴图片..."
        ></div>
      </div>

      <!-- 新增大填写区域：申请项目的依据和意义（可插入图片） -->
      <div class="form-section">
        <h3 class="section-title">申请项目的依据和意义</h3>
        <div
          class="rich-textarea"
          ref="basisContentRef"
          contenteditable="true"
          @input="updateBasisContent"
          @paste="(e) => { handlePaste(e); e.stopPropagation(); }"
          @focus="onEditorFocus('basis', $event)"
          @keydown="onEditorKeyDown($event)"
          data-placeholder="请输入申请项目的依据和意义，支持粘贴图片..."
        ></div>
      </div>

      <!-- 新增大填写区域：项目研究开发内容及目标（实施方案、技术关键、技术路线和技术经济指标等） -->
      <div class="form-section">
        <h3 class="section-title">项目研究开发内容及目标（实施方案、技术关键、技术路线和技术经济指标等）</h3>
        <div
          class="rich-textarea"
          ref="devGoalContentRef"
          contenteditable="true"
          @input="updateDevGoalContent"
          @paste="(e) => { handlePaste(e); e.stopPropagation(); }"
          @focus="onEditorFocus('devGoal', $event)"
          @keydown="onEditorKeyDown($event)"
          data-placeholder="请按结构填写，支持粘贴图片..."
        ></div>
      </div>

      <!-- 追加：项目研究开发内容及目标（第二块） -->
      <div class="form-section">
        <h3 class="section-title">实施本项目已具备的条件（说明已具备的试验手段、技术力量、管理水平、前期科研基础、中试后接产单位及专利获得等情况）</h3>
        <div
          class="rich-textarea"
          ref="devGoal2ContentRef"
          contenteditable="true"
          @input="updateDevGoal2Content"
          @paste="(e) => { handlePaste(e); e.stopPropagation(); }"
          @focus="onEditorFocus('devGoal2', $event)"
          @keydown="onEditorKeyDown($event)"
          data-placeholder="请继续填写项目研究开发内容及目标，支持粘贴图片..."
        ></div>
      </div>

      <!-- 追加：项目实施的经济、社会和环境预期效益 -->
      <div class="form-section">
        <h3 class="section-title">项目实施的经济、社会和环境预期效益</h3>
        <div
          class="rich-textarea"
          ref="benefitsContentRef"
          contenteditable="true"
          @input="updateBenefitsContent"
          @paste="(e) => { handlePaste(e); e.stopPropagation(); }"
          @focus="onEditorFocus('benefits', $event)"
          @keydown="onEditorKeyDown($event)"
          data-placeholder="请阐述预期的经济效益、社会效益与环境效益，支持粘贴图片..."
        ></div>
      </div>

      <!-- 追加：项目实施的计划进度 -->
      <div class="form-section">
        <h3 class="section-title">项目实施的计划进度</h3>
        <div
          class="rich-textarea"
          ref="planContentRef"
          contenteditable="true"
          @input="updatePlanContent"
          @paste="(e) => { handlePaste(e); e.stopPropagation(); }"
          @focus="onEditorFocus('plan', $event)"
          @keydown="onEditorKeyDown($event)"
          data-placeholder="请填写项目实施计划、里程碑与时间安排，支持粘贴图片..."
        ></div>
      </div>

      <!-- 追加：项目经费总预算（表格） -->
      <div class="form-section">
        <h3 class="section-title">项目经费总预算</h3>
        <table class="info-table budget-table" border="1" cellspacing="0" style="table-layout: fixed; width: 100%;">
          <colgroup>
            <col style="width: 40%;" />
            <col style="width: 20%;" />
            <col style="width: 20%;" />
            <col style="width: 20%;" />
          </colgroup>
          <tr>
            <td class="label-cell">研发经费项目</td>
            <td class="label-cell">预算金额（万元）</td>
            <td class="label-cell">占研发经费总预算比例（%）</td>
            <td class="label-cell">简要说明</td>
          </tr>
          <tr v-for="(row, idx) in budgetTable" :key="idx">
            <td class="value-cell">{{ idx + 1 }}、{{ budgetItemNames[idx] }}</td>
            <td class="value-cell">
              <input type="number" class="input-field" v-model="row.amount" placeholder="0" />
            </td>
            <td class="value-cell">
              <input type="number" class="input-field" v-model="row.ratio" placeholder="0" />
            </td>
            <td class="value-cell">
              <div
                class="cell-multiline"
                contenteditable="true"
                :data-index="idx"
                @input="onBudgetRemarkInput($event, idx)"
                @keydown="onEditorKeyDown($event)"
              ></div>
            </td>
          </tr>
          <tr>
            <td class="label-cell">研发经费总预算</td>
            <td class="value-cell">
              <input type="number" class="input-field" :value="budgetTotalAmount" readonly />
            </td>
            <td class="value-cell">
              <input type="number" class="input-field" :value="budgetTotalRatio" readonly />
            </td>
            <td class="value-cell"></td>
          </tr>
        </table>
      </div>

      <!-- 申报单位意见（无标题，放在末尾） -->
      <div class="section">
        <div class="org-opinion-box">
          <div class="org-opinion-title">申报单位意见：</div>
          <div
            class="rich-textarea org-opinion-editor"
            ref="orgOpinionRef"
            contenteditable="true"
            @focus="currentFocusedEditor = 'orgOpinion' as any"
            @keydown="onEditorKeyDown($event)"
          ></div>
          <div class="org-opinion-footer">
            <div class="footer-row">
              <div class="leader">单位负责人：</div>
              <div class="seal">（签章）</div>
            </div>
            <div class="date-row">
              <span class="date-item">年</span>
              <span class="date-item">月</span>
              <span class="date-item">日</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { SaveOutlined, EditOutlined, PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'

import { 
  thQdResearchProjectProposalsCreate,
  thQdResearchProjectProposalsUpdate,
  thQdResearchProjectProposalsDetail,
  thQdResearchProjectProposalsPage,
  thQdResearchProjectProposalsDelete,
  thQdBudgetTotalPage,
  thQdBudgetTotalDetail,
  thQdBudgetTotalUpdate,
} from '@/api/th_qd/approvalSubmit/form'
import { 
  createTechnologicalProject, 
  updateTechnologicalProject,
  createTechnologicalProjectMaterial 
} from '@/api/th_qd/approval'
const router = useRouter()
const route = useRoute()

// 项目ID
const projectId = ref<number | null>(null)

// 研发项目申请书ID
const proposalId = ref<number | null>(null)

// 表单数据
interface FormData {
  projectName: string
  department: string
  projectLeader: string
  phone: string
  applicationDate: Dayjs | null
  projectType: string
  budget: number | null
  researchContent: string
  resultTypes: string[]
  resultOther?: string
  basisContent: string
  devGoalContent: string
  devGoal2Content: string
  benefitsContent: string
  planContent: string
}

const formData = reactive<FormData>({
  projectName: '',
  department: '',
  projectLeader: '',
  phone: '',
  applicationDate: null,
  projectType: '',
  budget: null,
  researchContent: '',
  resultTypes: [],
  resultOther: '',
  basisContent: ''
  ,devGoalContent: ''
  ,devGoal2Content: ''
  ,benefitsContent: ''
  ,planContent: ''
})

// 富文本编辑器引用
const researchContentRef = ref<HTMLDivElement | null>(null)
const basisContentRef = ref<HTMLDivElement | null>(null)
const devGoalContentRef = ref<HTMLDivElement | null>(null)
const devGoal2ContentRef = ref<HTMLDivElement | null>(null)
const benefitsContentRef = ref<HTMLDivElement | null>(null)
const planContentRef = ref<HTMLDivElement | null>(null)
const orgOpinionRef = ref<HTMLDivElement | null>(null)

// 字体大小
const currentFontSize = ref(14)

// 成果形式多选项
const resultTypeOptions = [
  { label: '1、论文论著', value: '论文论著' },
  { label: '2、研究报告', value: '研究报告' },
  { label: '3、新设备', value: '新设备' },
  { label: '4、新材料', value: '新材料' },
  { label: '5、新工艺或方法', value: '新工艺或方法' },
  { label: '6、软件', value: '软件' },
  { label: '7、其他', value: '其他' }
]

// 默认内容：项目研究开发内容及目标的结构提示
const devGoalDefaultHtml = '一、实施方案<br/>二、技术关键<br/>三、技术路线<br/>四、预期成果'

// 返回列表
const goBack = () => {
  router.push('/th-qd-project/approval/approval/applicant/manage')
}

// 保存表单
const handleSave = async () => {
  try {
    // 更新所有富文本内容
    if (researchContentRef.value) {
      formData.researchContent = researchContentRef.value.innerHTML
    }
    if (basisContentRef.value) {
      formData.basisContent = basisContentRef.value.innerHTML
    }
    if (devGoalContentRef.value) {
      formData.devGoalContent = devGoalContentRef.value.innerHTML
    }
    if (devGoal2ContentRef.value) {
      formData.devGoal2Content = devGoal2ContentRef.value.innerHTML
    }
    if (benefitsContentRef.value) {
      formData.benefitsContent = benefitsContentRef.value.innerHTML
    }
    if (planContentRef.value) {
      formData.planContent = planContentRef.value.innerHTML
    }
    
    // 准备提交的数据，确保与ResearchProjectProposalsSaveReqVO接口匹配
    const submitData = {
      projectId: projectId.value || '',
      projectName: formData.projectName || '',
      organizationName: formData.department || '',
      projectLeader: formData.projectLeader || '',
      contactPhone: formData.phone || '',
      totalBudget: formData.budget || 0,
      // 处理预期成果格式
      expectedOutcomeFormat: formData.resultTypes?.includes('其他') 
        ? 7 
        : formData.resultTypes?.length > 0 
          ? ['论文论著', '研究报告', '新设备', '新材料', '新工艺或方法', '软件'].indexOf(formData.resultTypes[0]) + 1
          : 1,
      // 富文本内容
      mainResearchDevelopmentContent: researchContentRef.value?.innerHTML || '',
      projectBasisAndSignificance: basisContentRef.value?.innerHTML || '',
      existingConditions: devGoal2ContentRef.value?.innerHTML || '',
      projectResearch: devGoalContentRef.value?.innerHTML || '',
      expectedBenefits: benefitsContentRef.value?.innerHTML || '',
      projectSchedule: planContentRef.value?.innerHTML || '',
      organizationOpinion: orgOpinionRef.value?.innerHTML || '',
      // 状态：0-草稿, 1-提交
      status: false, // 布尔值，false表示草稿
      // 研发经费预算表
      researchDocuments: budgetTable.map((row, idx) => ({
        projectId: projectId.value || '',
        budgetItem: budgetItemNames[idx],
        budgetAmount: row.amount || 0,
        totalBudgetPercentage: row.ratio || 0,
        itemDescription: row.remark || ''
      }))
    }
    
    // 准备TechnologicalProject数据
    const projectData = {
      projectName: formData.projectName || '',
      projectNo: route.query.projectNo || `PROJ_${Date.now()}`,
      yearly: new Date().getFullYear(),
      applicant: formData.projectLeader || '',
      applicantUnit: formData.department || '',
      projectCycle: '',
      budget: parseFloat(formData.budget?.toString() || '0'),
      expectedProjectTime: '',
      applicationDescription: researchContentRef.value?.innerHTML || '',
      remark: '',
      status: 0, // 材料审核中
    }

    // 调用API创建项目
    console.log('创建项目数据:', projectData)
    const projectRes = await createTechnologicalProject(projectData)
    console.log('创建项目返回结果:', projectRes)

    // 设置项目ID
    if (projectRes) {
      projectId.value = projectRes
      submitData.projectId = projectRes
      
      // 保存提案数据
      console.log('提交数据:', submitData)
      const res = await thQdResearchProjectProposalsCreate(submitData)
      console.log('API返回结果:', res)
    
      // 尝试多种可能的成功码
      if (res.code === 0 || res.code === 200 || res.success === true) {
        message.success('保存成功')
        // 弹出保存成功提示
        setTimeout(() => {
          Modal.info({
            title: '提示',
            content: '数据已成功保存！',
            okText: '确定',
          });
        }, 500);
        // 可以在这里添加跳转逻辑，例如返回列表页
        router.push('/th-qd-project/approval/approval/applicant/manage')
      } else {
        // message.error(res.message || res.msg || '保存失败')
      }
    } else {
      // message.error('创建项目失败')
    }
  } catch (error) {
    // console.error('保存失败:', error)
    // message.error('保存失败，请稍后重试')
  }
}

// 更新表单
const handleUpdate = async () => {
  try {
    // 更新所有富文本内容
    if (researchContentRef.value) {
      formData.researchContent = researchContentRef.value.innerHTML
    }
    if (basisContentRef.value) {
      formData.basisContent = basisContentRef.value.innerHTML
    }
    if (devGoalContentRef.value) {
      formData.devGoalContent = devGoalContentRef.value.innerHTML
    }
    if (devGoal2ContentRef.value) {
      formData.devGoal2Content = devGoal2ContentRef.value.innerHTML
    }
    if (benefitsContentRef.value) {
      formData.benefitsContent = benefitsContentRef.value.innerHTML
    }
    if (planContentRef.value) {
      formData.planContent = planContentRef.value.innerHTML
    }
    
    // 准备提交的数据，确保与ResearchProjectProposalsSaveReqVO接口匹配
    const submitData = {
      id: proposalId.value, // 添加研发项目申请书ID
      projectId: projectId.value || '', // 使用从路由参数获取的projectId
      projectName: formData.projectName || '',
      organizationName: formData.department || '',
      projectLeader: formData.projectLeader || '',
      contactPhone: formData.phone || '',
      totalBudget: formData.budget || 0,
      // 处理预期成果格式
      expectedOutcomeFormat: formData.resultTypes?.includes('其他') 
        ? 7 
        : formData.resultTypes?.length > 0 
          ? ['论文论著', '研究报告', '新设备', '新材料', '新工艺或方法', '软件'].indexOf(formData.resultTypes[0]) + 1
          : 1,
      // 富文本内容
      mainResearchDevelopmentContent: researchContentRef.value?.innerHTML || '',
      projectBasisAndSignificance: basisContentRef.value?.innerHTML || '',
      existingConditions: devGoal2ContentRef.value?.innerHTML || '',
      projectResearch: devGoalContentRef.value?.innerHTML || '',
      expectedBenefits: benefitsContentRef.value?.innerHTML || '',
      projectSchedule: planContentRef.value?.innerHTML || '',
      organizationOpinion: orgOpinionRef.value?.innerHTML || '',

      status: false, 
      // 研发经费预算表
      researchDocuments: budgetTable.map((row, idx) => ({
        budgetItem: budgetItemNames[idx],
        budgetAmount: row.amount || 0,
        totalBudgetPercentage: row.ratio || 0,
        itemDescription: row.remark || ''
      }))
    }
    
    console.log('更新数据:', submitData)
    
    // 调用API更新项目
    const res = await thQdResearchProjectProposalsUpdate(submitData)
    console.log('API返回结果:', res)
    
    // 尝试多种可能的成功码
    if (res === true || res.code === 0 || res.code === 200 || res.success === true) {
      // 更新预算数据
      try {
        console.log('开始更新预算数据...')
        
        // 遍历 researchDocuments 数组中的每个预算项
        for (const budgetItem of submitData.researchDocuments) {
          // 查找对应的预算项索引
          const itemIndex = budgetItemNames.findIndex(name => name === budgetItem.budgetItem)
          
          if (itemIndex !== -1 && budgetItemIds.value[itemIndex] > 0) {
            // 准备更新数据
            const budgetUpdateData = {
              id: budgetItemIds.value[itemIndex],
              projectId: projectId.value,
              budgetItem: budgetItem.budgetItem,
              budgetAmount: budgetItem.budgetAmount,
              totalBudgetPercentage: budgetItem.totalBudgetPercentage,
              itemDescription: budgetItem.itemDescription,
              sort: itemIndex + 1 // 添加排序参数，从1开始
            }
            
            console.log(`更新预算项: ${budgetItem.budgetItem}`, budgetUpdateData)
            
            // 调用API更新预算项
            const budgetRes = await thQdBudgetTotalUpdate(budgetUpdateData)
            console.log(`预算项 ${budgetItem.budgetItem} 更新结果:`, budgetRes)
            
            // 检查预算项更新是否成功
            if (!(budgetRes === true || budgetRes.code === 0 || budgetRes.code === 200 || budgetRes.success === true)) {
              console.warn(`预算项 ${budgetItem.budgetItem} 更新可能失败:`, budgetRes)
            }
          } else {
            console.log(`预算项 ${budgetItem.budgetItem} 没有ID或未找到索引，跳过更新`)
          }
        }
        
        message.success('更新成功')
        // 弹出更新成功提示
        setTimeout(() => {
          Modal.info({
            title: '提示',
            content: '数据已成功更新！',
            okText: '确定',
          });
        }, 500);
      } catch (budgetError) {
        console.error('更新预算数据失败:', budgetError)
        message.error('项目信息已更新，但预算数据更新失败')
      }
      // 可以在这里添加跳转逻辑，例如返回列表页
      // router.push('/th_qd/approval/applicant/list')
    } else {
      console.error('更新失败，返回数据:', res)
      message.error(res.message || res.msg || '更新失败')
    }
  } catch (error) {
    console.error('更新失败:', error)
    message.error('更新失败，请稍后重试')
  }
}

// 打印表单
const handlePrint = () => {
  window.print()
}

// —— 保存并恢复选区，确保点击下拉后仍能设置字号
let savedSelection: Range | null = null
const restoreSavedSelection = () => {
  const selection = window.getSelection()
  if (savedSelection && selection) {
    selection.removeAllRanges()
    selection.addRange(savedSelection)
  }
}
document.addEventListener('selectionchange', () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  const container = range.commonAncestorContainer
  const el = (container.nodeType === 1 ? container : (container as any).parentElement) as HTMLElement
  if (el && el.closest('.rich-textarea')) {
    savedSelection = range.cloneRange()
  }
})

// 应用字体大小
const applyFontSize = () => {
  // 恢复选区
  restoreSavedSelection()
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0).cloneRange()
  if (range.collapsed) return

  const span = document.createElement('span')
  span.style.fontSize = `${currentFontSize.value}pt`
  try {
    range.surroundContents(span)
    // 选区重置到新 span 的内容，便于继续操作
    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    sel.removeAllRanges()
    sel.addRange(newRange)
    savedSelection = newRange.cloneRange()
  } catch (e) {
    // 跨多节点选区的回退方案
    document.execCommand('fontSize', false, '7')
    const fontElements = document.querySelectorAll('font[size="7"]')
    fontElements.forEach((el) => {
      const s = document.createElement('span')
      s.style.fontSize = `${currentFontSize.value}pt`
      s.innerHTML = el.innerHTML
      el.parentNode?.replaceChild(s, el)
    })
    restoreSavedSelection()
  }
}

// 切换加粗
const toggleBold = () => {
  restoreSavedSelection()
  document.execCommand('bold', false)
  restoreSavedSelection()
}

// 切换斜体
const toggleItalic = () => {
  restoreSavedSelection()
  document.execCommand('italic', false)
  restoreSavedSelection()
}

// 切换下划线
const toggleUnderline = () => {
  restoreSavedSelection()
  document.execCommand('underline', false)
  restoreSavedSelection()
}

// 更新研究内容
const updateResearchContent = () => {
  if (researchContentRef.value) {
    formData.researchContent = researchContentRef.value.innerHTML
  }
}

// 更新依据和意义内容
const updateBasisContent = () => {
  if (basisContentRef.value) {
    formData.basisContent = basisContentRef.value.innerHTML
  }
}

// 更新“项目研究开发内容及目标”
const updateDevGoalContent = () => {
  if (devGoalContentRef.value) {
    formData.devGoalContent = devGoalContentRef.value.innerHTML
  }
}

// 追加三个区域的同步
const updateDevGoal2Content = () => {
  if (devGoal2ContentRef.value) {
    formData.devGoal2Content = devGoal2ContentRef.value.innerHTML
  }
}

// ========== 研发经费预算表 数据 ==========
const budgetItemNames = [
  '人员人工费用',
  '直接投入费用',
  '折旧费与长期待摊费用',
  '无形资产摊销费用',
  '设计费',
  '装备调试费与试验费用',
  '委托外部研究开发费用',
  '其他费用（包括论文、知识产权申请费、科技成果评估费等）'
]

interface BudgetRow { amount: number | null; ratio: number | null; remark: string; id?: number }
const budgetTable = reactive<BudgetRow[]>(budgetItemNames.map(() => ({ amount: null, ratio: null, remark: '' })))
// 存储预算项ID的数组
const budgetItemIds = ref<number[]>(budgetItemNames.map(() => 0))
const budgetTotalAmount = computed(() => budgetTable.reduce((sum, r) => sum + (Number(r.amount) || 0), 0))
const budgetTotalRatio = computed(() => budgetTable.reduce((sum, r) => sum + (Number(r.ratio) || 0), 0))

const updateBenefitsContent = () => {
  if (benefitsContentRef.value) {
    formData.benefitsContent = benefitsContentRef.value.innerHTML
  }
}

const updatePlanContent = () => {
  if (planContentRef.value) {
    formData.planContent = planContentRef.value.innerHTML
  }
}

// 处理图片上传（保留，但不在UI中使用）
const handleImageUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const imgSrc = e.target?.result as string
    insertImageToEditor(imgSrc)
  }
  reader.readAsDataURL(file)
  return false
}

// 记录当前获得焦点的编辑器，便于图片粘贴时正确插入
type EditorKey = 'research' | 'basis' | 'devGoal' | 'devGoal2' | 'benefits' | 'plan' | 'orgOpinion'
let currentFocusedEditor: EditorKey | null = null
const onEditorFocus = (key: EditorKey, e?: FocusEvent) => {
  currentFocusedEditor = key
  const target = e?.target as HTMLDivElement | null
  if (target && target.classList.contains('rich-textarea')) {
    // 若为空，则插入零宽占位符，避免 selectionchange 不触发
    const empty = (target.innerText || '').trim() === '' && target.innerHTML.trim() === ''
    if (empty) {
      target.innerHTML = '\u200B'
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(target)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
      // 立即显示文本浮窗
      showTextToolbar(target)
      savedSelection = range.cloneRange()
    } else {
      showTextToolbar(target)
    }
  }
}

// 处理粘贴事件（支持图片粘贴）
const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const imgSrc = event.target?.result as string
          insertImageToEditor(imgSrc)
        }
        reader.readAsDataURL(file)
      }
    }
  }
}

// 处理富文本区域粘贴（由各编辑区直接调用 handlePaste，此函数不再需要）

// 处理拖拽图片
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.indexOf('image') !== -1) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imgSrc = event.target?.result as string
        insertImageToEditor(imgSrc)
      }
      reader.readAsDataURL(file)
    }
  }
}

// 选区就近获取目标编辑器
const getActiveEditor = (): HTMLDivElement | null => {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0)
    let node: Node | null = range.commonAncestorContainer
    const el = (node && (node.nodeType === 1 ? (node as Element) : (node as any)?.parentElement)) as Element | null
    const nearest = el?.closest?.('.rich-textarea') as HTMLDivElement | null
    if (nearest) return nearest
  }
  const active = document.activeElement as HTMLElement | null
  if (active && active.classList.contains('rich-textarea')) return active as HTMLDivElement
  if (currentFocusedEditor === 'basis') return basisContentRef.value
  if (currentFocusedEditor === 'devGoal') return devGoalContentRef.value
  if (currentFocusedEditor === 'devGoal2') return devGoal2ContentRef.value
  if (currentFocusedEditor === 'benefits') return benefitsContentRef.value
  if (currentFocusedEditor === 'plan') return planContentRef.value
  // 末尾：申报单位意见
  if ((window.getSelection()?.anchorNode as Node | null)) {
    const el = (window.getSelection()?.anchorNode as any)?.parentElement as HTMLElement | null
    const nearest = el?.closest?.('.org-opinion-editor') as HTMLDivElement | null
    if (nearest) return nearest
  }
  return researchContentRef.value
}

// 插入图片到编辑器
const insertImageToEditor = (src: string) => {
  const target = getActiveEditor()
  if (!target) return

  const img = document.createElement('img')
  img.src = src
  img.style.maxWidth = '100%'
  img.style.height = 'auto'
  img.style.cursor = 'pointer'
  img.style.display = 'block'
  img.className = 'editable-image'

  // 点击图片：只选中并打开就近工具条；双击再进入宽度输入
  img.onclick = () => {
    selectImage(img)
  }
  img.ondblclick = () => {
    promptImageWidth(img)
  }

  // 获取当前光标位置或追加到末尾
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0 && target.contains(selection.anchorNode)) {
    const range = selection.getRangeAt(0)
    // 规范化：先在当前光标处插入一个占位文本节点，再把图片替换进去
    const placeholder = document.createTextNode('\u200B') // 零宽空格，避免段落被撕裂
    range.insertNode(placeholder)
    // 将占位节点旁边换行等合并，避免黑块（部分浏览器把块级元素插入到inline上下文会渲染异常）
    placeholder.parentNode?.insertBefore(img, placeholder.nextSibling)
    placeholder.remove()
    // 折叠到图片之后
    const after = document.createRange()
    after.setStartAfter(img)
    after.collapse(true)
    selection.removeAllRanges()
    selection.addRange(after)
  } else {
    target.appendChild(img)
  }

  // 同步内容到表单，避免看得见但未保存
  if (target === researchContentRef.value) updateResearchContent()
  else if (target === basisContentRef.value) updateBasisContent()
  else if (target === devGoalContentRef.value) updateDevGoalContent()

  message.success('图片插入成功')
}

// 兼容旧接口：移除未使用的函数，避免警告（逻辑已由工具条替代）

// 保留图片居中函数（供外部可能的调用）
const centerSelectedImage = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  let node = range.startContainer as Node
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode as Node
  const img = (node as HTMLElement).closest?.('img') as HTMLImageElement | null
  if (!img) return
  img.style.float = 'none'
  img.style.display = 'block'
  img.style.margin = '10px auto'
}

// ========== 图片就近工具条逻辑 ==========
const selectedImage = ref<HTMLImageElement | null>(null)
const imageToolbar = reactive({ visible: false, style: { top: '0px', left: '0px' } })

const selectImage = (img: HTMLImageElement) => {
  selectedImage.value = img
  positionImageToolbar(img)
  imageToolbar.visible = true
}

const positionImageToolbar = (img: HTMLImageElement) => {
  const rect = img.getBoundingClientRect()
  const top = rect.top + window.scrollY - 40 // 工具条高度约32
  const left = rect.left + window.scrollX + Math.max(0, rect.width / 2 - 120)
  imageToolbar.style = { top: `${top}px`, left: `${left}px`, position: 'absolute' } as any
}

const alignSelectedImage = (mode: 'left' | 'center' | 'right') => {
  if (!selectedImage.value) return
  const img = selectedImage.value
  // 使用块级 + margin 对齐，避免 float 导致元素看似“跑出编辑框”
  img.style.float = 'none'
  img.style.display = 'block'
  if (mode === 'left') {
    img.style.margin = '0 auto 10px 0'   // 左对齐
  } else if (mode === 'right') {
    img.style.margin = '0 0 10px auto'   // 右对齐
  } else {
    img.style.margin = '10px auto'       // 居中
  }
}

const setSelectedImageWidth = (percent: number) => {
  if (!selectedImage.value) return
  const img = selectedImage.value
  img.style.width = `${percent}%`
  img.style.maxWidth = `${percent}%`
}

const removeSelectedImage = () => {
  if (!selectedImage.value) return
  selectedImage.value.remove()
  closeImageToolbar()
}

const closeImageToolbar = () => {
  imageToolbar.visible = false
  selectedImage.value = null
}

const promptImageWidth = (img: HTMLImageElement) => {
  const currentWidth = parseInt(img.style.width || '100')
  const width = prompt('请输入图片宽度百分比（10-100）:', currentWidth.toString())
  if (width) {
    const widthNum = parseInt(width)
    if (widthNum >= 10 && widthNum <= 100) {
      img.style.width = `${widthNum}%`
      img.style.maxWidth = `${widthNum}%`
    }
  }
}

// ========== 文本工具条逻辑 ==========
const textToolbar = reactive({ visible: false, style: { top: '0px', left: '0px' } })
let textToolbarTimer: number | null = null

const showTextToolbar = (targetEl: HTMLElement) => {
  if (textToolbarTimer) window.clearTimeout(textToolbarTimer)
  const rect = targetEl.getBoundingClientRect()
  textToolbar.style = { top: `${rect.top + window.scrollY - 40}px`, left: `${rect.left + window.scrollX}px`, position: 'absolute' } as any
  textToolbar.visible = true
  // 自动隐藏（避免长时间悬浮）
  textToolbarTimer = window.setTimeout(() => (textToolbar.visible = false), 4000)
}

const closeTextToolbar = () => {
  textToolbar.visible = false
  if (textToolbarTimer) {
    window.clearTimeout(textToolbarTimer)
    textToolbarTimer = null
  }
}

// 监控选区变化，展示文本工具条
document.addEventListener('selectionchange', () => {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) return
  const range = sel.getRangeAt(0)
  const container = range.commonAncestorContainer
  const element = (container.nodeType === 1 ? container : (container as any).parentElement) as HTMLElement
  // 仅当选区在我们的编辑区域里时才显示
  if (element && element.closest('.rich-textarea')) {
    showTextToolbar(element.closest('.rich-textarea') as HTMLElement)
  }
})

// 快速编排：中文编号 / 数字编号 / 小黑点
const applyQuickList = (type: 'cn' | 'num' | 'dot') => {
  restoreSavedSelection()
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)

  // 克隆选区内容
  const frag = range.cloneContents()
  const container = document.createElement('div')
  container.appendChild(frag)
  const temp = document.createElement('div')
  temp.innerHTML = container.innerHTML

  const lines: string[] = []
  if (temp.childNodes.length === 0) {
    lines.push('&nbsp;')
  } else {
    temp.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'DIV') {
        const t = (node as HTMLElement).innerHTML.trim()
        lines.push(t || '&nbsp;')
      } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'BR') {
        // 忽略独立 BR
      } else {
        const el = node as HTMLElement
        const t = el.outerHTML || (el.textContent || '').trim()
        lines.push(t || '&nbsp;')
      }
    })
  }

  const toCn = (i: number) => {
    const map = '一二三四五六七八九十'
    if (i < map.length) return map[i]
    // 超过十的简单处理：十一起
    return `十${map[(i + 1) % 10 || 9]}`
  }

  const prefixed = lines.map((line, idx) => {
    let prefix = ''
    if (type === 'cn') prefix = `${toCn(idx)}、`
    else if (type === 'num') prefix = `${idx + 1}）`
    else prefix = '• '
    return `${prefix}${line}`
  })

  const newHtml = prefixed.join('<br>')
  document.execCommand('insertHTML', false, newHtml)

  // 选区移动到末尾并保存
  const after = document.createRange()
  if (range.endContainer.nodeType === Node.ELEMENT_NODE) {
    after.selectNodeContents(range.endContainer as HTMLElement)
    after.collapse(false)
  }
  sel.removeAllRanges()
  sel.addRange(after)
  savedSelection = after.cloneRange()
}

// 表格“简要说明”单元格多行编辑同步
const onBudgetRemarkInput = (e: Event, idx: number) => {
  const el = e.target as HTMLDivElement
  budgetTable[idx].remark = el.innerHTML
}

// 在编辑区内监听 Enter，实现自动续号
const onEditorKeyDown = (e: KeyboardEvent) => {
  // 预算表内：不启用自动续号，仅插入软换行
  const inBudget = (e.target as HTMLElement)?.closest?.('.budget-table')
  if (inBudget) {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '<br>\u200B')
    }
    return
  }

  // Tab 缩进/反缩进（仅编辑区内）
  if (e.key === 'Tab') {
    const active = getActiveEditor()
    if (!active) return
    e.preventDefault()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const caretRange = sel.getRangeAt(0)
    if (e.shiftKey) {
      // 反缩进：如果光标前一个字符是 EM 空格(U+2003)，删除一个
      if (caretRange.endContainer.nodeType === Node.TEXT_NODE && caretRange.endOffset > 0) {
        const text = caretRange.endContainer as Text
        const prevCh = text.data.charCodeAt(caretRange.endOffset - 1)
        if (prevCh === 0x2003) {
          text.deleteData(caretRange.endOffset - 1, 1)
          const rng = document.createRange()
          rng.setStart(text, caretRange.endOffset - 1)
          rng.collapse(true)
          sel.removeAllRanges(); sel.addRange(rng); savedSelection = rng.cloneRange()
        }
      }
      return
    }
    // 正向缩进：插入一个 EM 空格
    document.execCommand('insertHTML', false, '\u2003')
    const rng = document.createRange()
    const anchor = sel.anchorNode as Node
    const offset = (sel.anchorOffset || 0)
    rng.setStart(anchor, offset)
    rng.collapse(true)
    sel.removeAllRanges(); sel.addRange(rng); savedSelection = rng.cloneRange()
    return
  }

  if (e.key !== 'Enter') return
  const active = getActiveEditor()
  if (!active) return
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return

  // 更稳健地获得“光标所在行”的文本：向前遍历节点直到碰到最近的 <br> 或根
  const caretRange = sel.getRangeAt(0)
  const getPrevNode = (root: Node, node: Node | null): Node | null => {
    if (!node || node === root) return null
    if ((node as any).previousSibling) {
      let n = (node as any).previousSibling as Node
      while ((n as any).lastChild) n = (n as any).lastChild as Node
      return n
    }
    return node.parentNode
  }
  let node: Node | null = caretRange.endContainer
  let offset = caretRange.endOffset
  let collected = ''
  // 如果在文本节点中，先收集该节点前半部分
  if (node.nodeType === Node.TEXT_NODE) {
    collected = (node as Text).data.substring(0, offset)
  }
  // 向前遍历直到遇到 <br> 或到达根
  while ((node = getPrevNode(active, node))) {
    if ((node as HTMLElement).nodeName === 'BR') break
    if (node.nodeType === Node.TEXT_NODE) {
      collected = (node as Text).data + collected
    }
  }
  const lastLine = collected.replace(/^[\u200B\s]+/, '').replace(/[\r\n]/g, '')

  // 优先从本行第一个节点读取我们插入的前缀 span（更准确）
  const findLineStart = (): Node | null => {
    // 找到最近的 <br> 之后的下一个节点作为行首
    let n: Node | null = caretRange.endContainer
    // 回退到行首<br>或根
    let p = caretRange.endContainer
    while (p && p !== active && (p as any).previousSibling === null) p = p.parentNode as Node
    // 向前找第一个 <br>
    let walker: Node | null = caretRange.endContainer
    while (walker && walker !== active) {
      if ((walker as any).previousSibling) {
        walker = (walker as any).previousSibling
        // 到达上一节点的最末尾
        while ((walker as any).lastChild) walker = (walker as any).lastChild
        if ((walker as HTMLElement).nodeName === 'BR') {
          // 行首为 br 的下一个兄弟
          return (walker as any).nextSibling as Node
        }
      } else {
        walker = walker.parentNode
      }
    }
    // 没有 <br>，行首即容器第一个子节点
    return active.firstChild
  }
  let nextPrefix = ''
  const lineStart = findLineStart()
  if (lineStart && (lineStart as HTMLElement).nodeType === Node.ELEMENT_NODE && (lineStart as HTMLElement).classList?.contains('auto-li-prefix')) {
    const span = lineStart as HTMLElement
    const type = span.dataset.type || 'cn'
    const n = Number(span.dataset.n || '1')
    const numToCn = (n: number): string => {
      const arr = '零一二三四五六七八九'
      if (n <= 10) return ['零','一','二','三','四','五','六','七','八','九','十'][n]
      if (n < 20) return '十' + arr[n - 10]
      const tens = Math.floor(n / 10)
      const ones = n % 10
      return arr[tens] + '十' + (ones ? arr[ones] : '')
    }
    if (type === 'cn') nextPrefix = `${numToCn(n)}、`
    else if (type === 'num') nextPrefix = `${n}）`
    else nextPrefix = '• '
  } else {
    // 文本识别回退

  // 识别前缀：允许前导零宽字符
  // 更稳健：匹配中文数字（含 十、二十 一至九十九）
  const cnMatch = lastLine.match(/^[\u200B]*((?:[一二三四五六七八九]?十[一二三四五六七八九]?|十[一二三四五六七八九]?|[一二三四五六七八九]))、/)
  const numMatch = lastLine.match(/^[\u200B]*(\d+)）/)
  const dotMatch = lastLine.match(/^[\u200B]*•\s/)
  if (!cnMatch && !numMatch && !dotMatch) return
  e.preventDefault()

  if (cnMatch) {
    const cur = cnMatch[1]
    const cnToNum = (s: string): number => {
      const digit = (ch: string) => '零一二三四五六七八九'.indexOf(ch)
      if (s === '十') return 10
      if (s.length === 1) return digit(s)
      if (s.startsWith('十')) return 10 + digit(s[1] || '零')
      if (s.endsWith('十')) return digit(s[0]) * 10
      // 形如 二十三
      if (s.includes('十')) return digit(s[0]) * 10 + digit(s[2] || '零')
      return 1
    }
    const numToCn = (n: number): string => {
      const arr = '零一二三四五六七八九'
      if (n <= 10) return ['零','一','二','三','四','五','六','七','八','九','十'][n]
      if (n < 20) return '十' + arr[n - 10]
      const tens = Math.floor(n / 10)
      const ones = n % 10
      return arr[tens] + '十' + (ones ? arr[ones] : '')
    }
    const curNum = cnToNum(cur)
    const next = numToCn(curNum + 1)
    nextPrefix = `${next}、`
  } else if (numMatch) {
    const cur = parseInt(numMatch[1])
    nextPrefix = `${cur + 1}）`
  } else if (dotMatch) {
    nextPrefix = '• '
  }

  // 插入换行与前缀，带一个临时标记，便于精确把光标放到新行前缀后
  document.execCommand('insertHTML', false, `<br><span id="__caret_marker"></span>${nextPrefix}\u200B`)
  const marker = active.querySelector('#__caret_marker') as HTMLElement | null
  if (marker) {
    const selAfter = window.getSelection()
    const rngAfter = document.createRange()
    const afterNode = marker.nextSibling as (Text | Node | null)
    if (afterNode && afterNode.nodeType === Node.TEXT_NODE) {
      const txt = (afterNode as Text).textContent || ''
      rngAfter.setStart(afterNode, txt.length)
    } else {
      rngAfter.setStartAfter(marker)
    }
    rngAfter.collapse(true)
    selAfter?.removeAllRanges()
    selAfter?.addRange(rngAfter)
    savedSelection = rngAfter.cloneRange()
    marker.remove()
  }
  }
}

onMounted(async () => {
  console.log('新版在线填报页面已加载')
  
  // 获取路由参数中的projectId
  console.log('当前路由参数:', route.query)
  const projectIdParam = route.query.projectId
  console.log('获取到的projectId:', projectIdParam)
  
  if (projectIdParam) {
    projectId.value = Number(projectIdParam)
    console.log('转换后的projectId:', projectId.value)
    
    try {
      // 调用thQdResearchProjectProposalsPage方法获取项目详情
      console.log('开始调用API获取项目详情...')
      const projectParams = {
        pageNo: 1,
        pageSize: 10,
        projectId: projectId.value
      }
      const projectRes = await thQdResearchProjectProposalsPage(projectParams)
      console.log('项目详情API返回:', projectRes)
      
      if (projectRes && projectRes.list && projectRes.list.length > 0) {
        const projectData = projectRes.list[0] // 从列表中取第一条数据
        
        // 设置提案ID
        proposalId.value = projectData.id
        
        // 填充表单数据
        console.log('开始填充表单数据...')
        formData.projectName = projectData.projectName || ''
        formData.department = projectData.organizationName || projectData.department || ''
        formData.projectLeader = projectData.projectLeader || ''
        formData.phone = projectData.contactPhone || projectData.phone || ''
        formData.budget = projectData.totalBudget || projectData.budget || null
        
        console.log('表单数据填充完成:', formData)
        
        // 填充富文本内容
        if (researchContentRef.value) {
          researchContentRef.value.innerHTML = projectData.mainResearchDevelopmentContent || 
                                            projectData.researchContent || ''
        }
        if (basisContentRef.value) {
          basisContentRef.value.innerHTML = projectData.projectBasisAndSignificance || 
                                         projectData.basisContent || ''
        }
        if (devGoalContentRef.value) {
          devGoalContentRef.value.innerHTML = projectData.projectResearch || projectData.devGoalContent || ''
        }
        if (benefitsContentRef.value) {
          benefitsContentRef.value.innerHTML = projectData.expectedBenefits || 
                                            projectData.benefitsContent || ''
        }
        if (planContentRef.value) {
          planContentRef.value.innerHTML = projectData.projectSchedule || 
                                        projectData.planContent || ''
        }
        if (orgOpinionRef.value) {
          orgOpinionRef.value.innerHTML = projectData.organizationOpinion || ''
        }
        if (devGoal2ContentRef.value) {
          devGoal2ContentRef.value.innerHTML = projectData.existingConditions || ''
        }
        
        // 处理预期成果格式
        if (projectData.expectedOutcomeFormat) {
          const outcomeFormat = Number(projectData.expectedOutcomeFormat)
          if (outcomeFormat >= 1 && outcomeFormat <= 6) {
            formData.resultTypes = [resultTypeOptions[outcomeFormat - 1].value]
          } else if (outcomeFormat === 7) {
            formData.resultTypes = ['其他']
          }
        }
      }
      
      // 调用thQdBudgetTotalPage方法获取预算详情
      console.log('开始调用API获取预算详情...')
      const budgetParams = {
        pageNo: 1,
        pageSize: 100, // 设置较大的值，确保获取所有预算项
        projectId: projectId.value
      }
      const budgetRes = await thQdBudgetTotalPage(budgetParams)
      console.log('预算详情API返回:', budgetRes)
      
      if (budgetRes && budgetRes.list && budgetRes.list.length > 0) {
        // 填充预算表格数据
        console.log('开始填充预算表格数据...')
        budgetRes.list.forEach((item) => {
          // 根据预算项名称找到对应的索引
          const itemIndex = budgetItemNames.findIndex(name => name === item.budgetItem)
          if (itemIndex !== -1 && itemIndex < budgetTable.length) {
            budgetTable[itemIndex].amount = item.budgetAmount || null
            budgetTable[itemIndex].ratio = item.totalBudgetPercentage || null
            budgetTable[itemIndex].remark = item.itemDescription || ''
            // 保存预算项ID
            budgetTable[itemIndex].id = item.id
            budgetItemIds.value[itemIndex] = item.id
            
            // 更新表格单元格中的内容
            setTimeout(() => {
              const cells = document.querySelectorAll('.budget-table tr')
              if (cells[itemIndex + 1]) { // +1 因为第一行是表头
                const remarkCell = cells[itemIndex + 1].querySelector('.cell-multiline')
                if (remarkCell) {
                  remarkCell.innerHTML = item.itemDescription || ''
                }
              }
            }, 100) // 延迟执行以确保DOM已渲染
          }
        })
      }
      
      message.success('数据加载成功')
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败，请稍后重试')
    }
  } else {
    console.log('未找到projectId参数')
  }
  
  // 初始化“项目研究开发内容及目标”的默认提示结构
  if (devGoalContentRef.value && !devGoalContentRef.value.innerHTML) {
    devGoalContentRef.value.innerHTML = devGoalDefaultHtml
    formData.devGoalContent = devGoalDefaultHtml
  }
})
</script>

<style scoped lang="scss">
.online-form-container {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 20px;
}

/* 全页统一字体为宋体（SimSun） */
.online-form-container,
.online-form-container * {
  font-family: '宋体', 'SimSun', 'Songti SC', 'Noto Serif CJK SC', serif !important;
}

// ========== 页面头部 ==========
.page-header {
  background: white;
  padding: 24px 32px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .header-content {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #234fa2;
      margin: 0 0 8px 0;
    }

    .page-description {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// ========== 工具栏 ==========
.toolbar {
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

// ========== 表单内容区域 ==========
.form-content-wrapper {
  background: white;
  padding: 40px 60px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 800px;
}

// ========== 表单标题 ==========
.form-title-section {
  text-align: center;
  margin-bottom: 40px;

  .form-main-title {
    font-size: 24px;
    font-weight: bold;
    color: #234fa2;
    margin: 8px 0;
  }
}

// ========== 表单区域 ==========
.form-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 16px;
    font-family: '宋体', 'SimSun', serif !important;
    font-weight: bold;
    color: #333;
    margin-bottom: 16px;
    padding-left: 12px;
    border-left: 4px solid #234fa2;
  }
}

/* 填报说明块 */
.note-block {
  color: #333;
  font-size: 14px;
  line-height: 1.8;
  text-align: left;
}
.note-block p {
  margin: 0 0 8px 0;
}

// ========== 表格样式 ==========
.info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #d9d9d9;

  td {
    padding: 12px 16px;
    border: 1px solid #d9d9d9;
    line-height: 1.6;
  }

  .label-cell {
    background: #fafafa;
    font-weight: 600;
    color: #333;
    text-align: center;
  }

  .value-cell {
    background: white;
    color: #333;

    .input-field {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      padding: 4px 8px;

      &:focus {
        background: #f0f7ff;
      }
    }
  }
}

/* 预算表：多行单元格样式，随内容自动增高 */
.budget-table .cell-multiline {
  min-height: 36px;
  padding: 6px 8px;
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 竖排单元格（项目概况/单位概况） */
.vertical-cell {
  writing-mode: vertical-rl;
  text-orientation: upright;
  text-align: center;
  vertical-align: middle;
  background: #fafafa;
  font-weight: 600;
}

.two-cols {
  display: flex;
  gap: 12px;
}

.result-types {
  white-space: normal;
}
.result-types :deep(.ant-checkbox-wrapper) {
  margin-right: 16px;
  margin-bottom: 8px;
}

/* 申报单位意见 */
.org-opinion-box {
  border: 1px solid #666;
  background: #fff;
  padding: 16px 20px;
  min-height: 240px;
}
.org-opinion-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.org-opinion-editor {
  min-height: 140px;
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.org-opinion-footer {
  margin-top: 16px;
  color: #333;
  font-weight: 500;
  line-height: 28px;
}
.org-opinion-footer .footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 96px 0;
}
.org-opinion-footer .date-row {
  display: flex;
  justify-content: flex-end;
  gap: 72px;
  padding: 8px 96px 4px;
  letter-spacing: 0.2em;
}
.org-opinion-footer .seal { margin-right: 8px; }
.org-opinion-footer .leader { margin-left: 8px; }

// ========== 富文本编辑区域 ==========
.rich-textarea {
  min-height: 200px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
  font-family: '宋体', 'SimSun', serif !important;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  outline: none;
  transition: all 0.3s;
/* 文本工具条下划线按钮视觉增强 */
.underline-btn {
  text-decoration: underline;
  font-weight: 600;
}

  &:focus {
    border-color: #234fa2;
    background: white;
    box-shadow: 0 0 8px rgba(35, 79, 162, 0.2);
  }

  &[data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: #999;
    font-style: italic;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.3s;

    &:hover {
      border-color: #234fa2;
    }
  }
}

// （已移除使用提示样式）

// ========== 打印样式 ==========
@media print {
  .no-print {
    display: none !important;
  }

  .online-form-container {
    background: white;
    padding: 0;
  }

  .form-content-wrapper {
    box-shadow: none;
    padding: 20px;
  }

  .info-table {
    page-break-inside: avoid;
  }

  .form-section {
    page-break-inside: avoid;
  }
}

/* 图片就近工具条 */
.image-toolbar {
  position: absolute;
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 4px 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
</style>

