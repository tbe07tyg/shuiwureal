<!--
/**
 * @fileoverview 调研记录页面
 * @description 展示调研过程和结果，支持快速添加调研事项
 * @author AI助手
 * @version 2.0
 * @since 2025-01-17
 */
-->
<template>
  <PageContainer title="📊 调研记录" description="项目调研全过程记录，追踪进度查看结果">
    <!-- 操作按钮区域 -->
    <template #actions>
      <a-button type="primary" @click="showAddRecordDialog">
        <PlusOutlined />
        新建调研记录
      </a-button>
      <!-- <a-button type="primary" ghost @click="exportRecords">
        <DownloadOutlined />
        📊 导出记录
      </a-button> -->
    </template>

    <!-- 筛选统计区域 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="filter-row">
          <span class="filter-label">状态:</span>
          <a-select 
            v-model:value="filters.status" 
            placeholder="全部状态" 
            allow-clear 
            style="width: 120px;"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="active">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="paused">已暂停</a-select-option>
            <a-select-option value="terminated">已终止</a-select-option>
          </a-select>

          <span class="filter-label">来源:</span>
          <a-select 
            v-model:value="filters.source" 
            placeholder="全部来源" 
            allow-clear 
            style="width: 120px;"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="requirement">需求池</a-select-option>
            <a-select-option value="external">外部委托</a-select-option>
            <a-select-option value="internal">内部发起</a-select-option>
          </a-select>

          <span class="filter-label">搜索:</span>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称或关键词"
            style="width: 300px;"
            allow-clear
            @search="handleFilterChange"
            @change="handleFilterChange"
          >
            <template #suffix>
              <SearchOutlined />
            </template>
          </a-input-search>
        </div>
      </div>

      <div class="stats-overview">
        📊 统计概览: 总计{{ statistics.total }}个 | 进行中{{ statistics.active }}个 | 已完成{{ statistics.completed }}个 | 暂停{{ statistics.paused }}个 | 已终止{{ statistics.terminated }}个
      </div>
    </div>

    <!-- 调研记录列表区域 -->
    <div class="records-list">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-card"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="card-title">
            <span class="record-icon">🔍</span>
            <span class="record-name">{{ record.title }}</span>
            <a-tag
              :color="getStatusTagColor(record.status)"
              class="status-tag"
            >
              {{ getStatusIcon(record.status) }} {{ getStatusText(record.status) }}
            </a-tag>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card-info">
          <span class="info-item">
            📅 {{ record.startDate }} → {{ record.status === 'completed' ? record.endDate : `预计${record.expectedEndDate}` }}
          </span>
          <span class="info-item">
            👤 {{ record.responsible }}({{ record.department }})
          </span>
        </div>

        <!-- 调研目的标签区域 -->
        <div class="content-section">
          <div class="section-title">🎯 调研目的:</div>
          <div class="section-content">
            <div class="purpose-tags">
              <a-tag v-for="purpose in record.stages" :key="purpose" color="blue" style="margin-right: 8px; margin-bottom: 4px;">
                {{ getPurposeText(purpose) }}
              </a-tag>
            </div>
          </div>
        </div>

        <!-- 事项记录时间轴区域 -->
        <div class="content-section">
          <div class="section-title">📝 事项记录:</div>
          <div class="section-content">
            <a-timeline mode="left">
              <a-timeline-item v-for="item in getRecentItems(record)" :key="item.id" color="blue">
                <div class="item-content">
                  <div class="item-header">
                    <span class="item-time">{{ item.time }}</span>
                    <span class="item-user">{{ item.user }}</span>
                  </div>
                  <div class="item-desc">{{ item.content }}</div>
                  <!-- 附件支持 -->
                  <div v-if="item.attachments && item.attachments.length > 0" class="item-attachments">
                    <div class="attachment-label">📎 附件：</div>
                    <div class="attachment-list">
                      <a 
                        v-for="attachment in item.attachments" 
                        :key="attachment.id"
                        @click="downloadAttachment(attachment)"
                        class="attachment-link"
                      >
                        {{ attachment.name }}
                      </a>
                    </div>
                  </div>
                </div>
              </a-timeline-item>
              <a-timeline-item v-if="record.items && record.items.length > 3" color="gray">
                <a @click="showRecordDetail(record.id)">查看更多事项…</a>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions">
          <a-button size="small" type="primary" @click="showRecordDetail(record.id)">📋 查看详情</a-button>
          
          <!-- 所有状态都可以更新状态（除已终止） -->
          <a-button v-if="record.status !== 'terminated'" size="small" @click="showUpdateProgress(record.id)">📝 更新状态</a-button>
          <a-button size="small" danger type="link" @click="deleteResearch(record.id)">删除</a-button>
          
          <!-- 已完成状态专有操作 -->
          <!-- <a-button v-if="record.status === 'completed'" size="small" type="default">➡️ 转为立项</a-button> -->
          
          <!-- 除已终止外都可以添加事项 -->
          <a-button 
            v-if="record.status !== 'terminated'" 
            size="small" 
            type="link"
            @click="showAddItemDialog(record.id)"
            class="add-item-action"
          >
            ➕ 添加调研事项
          </a-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-size-options="['10', '20', '50']"
          show-size-changer
          show-quick-jumper
          :show-total="(total) => `共 ${total} 条`"
          @change="handleCurrentChange"
          @show-size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新建调研记录弹窗 -->
    <a-modal
      v-model:open="addRecordDialog.visible"
      title="➕ 新建调研记录"
      width="700px"
      @cancel="handleCloseAddRecordDialog"
      @ok="handleAddRecord"
    >
      <a-form :model="addRecordForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="调研标题" required>
          <a-input
            v-model:value="addRecordForm.title"
            placeholder="请输入调研项目标题，如：REQ001-智能水质监测系统调研"
            :maxlength="100"
            show-count
          />
        </a-form-item>

        <a-form-item label="需求来源">
          <a-radio-group v-model:value="addRecordForm.sourceType" @change="handleSourceTypeChange">
            <a-radio value="requirement">需求池</a-radio>
            <a-radio value="internal">内部发起</a-radio>
            <a-radio value="external">外部委托</a-radio>
          </a-radio-group>
          
          <div style="margin-top: 12px;">
            <!-- 需求池选择 -->
            <a-select
              v-if="addRecordForm.sourceType === 'requirement'"
              v-model:value="addRecordForm.sourceRequirement"
              placeholder="请选择需求池中的需求"
              style="width: 100%;"
              show-search
              :filter-option="false"
              @search="handleRequirementSearch"
            >
              <a-select-option 
                v-for="req in filteredRequirements" 
                :key="req.id" 
                :value="req.id"
              >
                <div class="requirement-option">
                  <span class="req-title">{{ req.title }}</span>
                  <span class="req-category">{{ req.category }}</span>
                </div>
              </a-select-option>
            </a-select>
            
            <!-- 手动填写来源 -->
            <a-input
              v-else
              v-model:value="addRecordForm.sourceDescription"
              :placeholder="addRecordForm.sourceType === 'internal' ? '请填写内部发起部门或人员' : '请填写外部委托单位或项目'"
              :maxlength="100"
              show-count
            />
          </div>
        </a-form-item>

      <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="负责人" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-select v-model:value="addRecordForm.responsible" show-search :filter-option="(i,o)=>o?.label?.toLowerCase().includes(i.toLowerCase())">
                <a-select-option v-for="u in users" :key="u.id" :value="u.id">{{ u.nickname }}</a-select-option>
              </a-select>
            </a-form-item>
        </a-col>
          <a-col :span="12">
            <a-form-item label="所属部门" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-select v-model:value="addRecordForm.department" show-search :filter-option="(i,o)=>o?.label?.toLowerCase().includes(i.toLowerCase())">
                <a-select-option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</a-select-option>
              </a-select>
            </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-date-picker
                v-model:value="addRecordForm.startDate"
                placeholder="选择开始时间"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="预计完成" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-date-picker
                v-model:value="addRecordForm.expectedEndDate"
                placeholder="选择预计完成时间"
                style="width: 100%;"
              />
            </a-form-item>
        </a-col>
      </a-row>

        <a-form-item label="调研阶段" required>
          <div class="stage-selection">
            <p class="stage-tip">💡 可自由组合选择调研阶段，支持单选或多选：</p>
            <a-checkbox-group v-model:value="addRecordForm.stages" class="stage-checkboxes">
              <a-row :gutter="[16, 16]">
                <a-col :span="8">
                  <a-checkbox value="analysis" class="stage-checkbox">
                    <span class="stage-icon">📋</span>
                    <span class="stage-text">需求分析</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="technical" class="stage-checkbox">
                    <span class="stage-icon">🔍</span>
                    <span class="stage-text">技术调研</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="design" class="stage-checkbox">
                    <span class="stage-icon">📐</span>
                    <span class="stage-text">方案设计</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="cost" class="stage-checkbox">
                    <span class="stage-icon">💰</span>
                    <span class="stage-text">成本评估</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="risk" class="stage-checkbox">
                    <span class="stage-icon">⚠️</span>
                    <span class="stage-text">风险分析</span>
                  </a-checkbox>
                </a-col>
                <a-col :span="8">
                  <a-checkbox value="market" class="stage-checkbox">
                    <span class="stage-icon">📈</span>
                    <span class="stage-text">市场调研</span>
                  </a-checkbox>
        </a-col>
      </a-row>
            </a-checkbox-group>
      </div>
        </a-form-item>

        <a-form-item label="优先级">
          <a-radio-group v-model:value="addRecordForm.priority">
            <a-radio value="high">🔴 高优先级</a-radio>
            <a-radio value="medium">🟡 中优先级</a-radio>
            <a-radio value="low">🟢 低优先级</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="调研描述">
          <a-textarea
            v-model:value="addRecordForm.description"
            placeholder="请简要描述调研目标、背景和预期成果..."
            :rows="3"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加调研事项弹窗 -->
    <a-modal
      v-model:open="addItemDialog.visible"
      title="➕ 添加调研事项"
      width="600px"
      @cancel="handleCloseAddDialog"
      @ok="handleAddItem"
    >
      <a-form :model="addItemForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="事项内容" required>
          <a-textarea
            v-model:value="addItemForm.content"
            :rows="3"
            placeholder="请简要描述调研事项内容..."
            :maxlength="200"
            show-count
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="日期" required>
              <a-date-picker 
                v-model:value="addItemForm.date" 
                placeholder="选择日期"
                style="width: 100%;"
                :disabled-date="disabledDate"
                format="YYYY-MM-DD"
              />
        </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="时刻">
              <a-time-picker 
                v-model:value="addItemForm.time" 
                placeholder="选择时刻(可选)"
                style="width: 100%;"
                format="HH:mm"
                :minute-step="15"
                allow-clear
              />
        </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="负责人">
              <a-select v-model:value="addItemForm.responsible" show-search :filter-option="(i,o)=>o?.label?.toLowerCase().includes(i.toLowerCase())">
                <a-select-option v-for="u in users" :key="u.id" :value="u.id">{{ u.nickname }}</a-select-option>
          </a-select>
        </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="事项类型">
          <a-radio-group v-model:value="addItemForm.type">
            <a-radio value="analysis">需求分析</a-radio>
            <a-radio value="technical">技术调研</a-radio>
            <a-radio value="design">方案设计</a-radio>
            <a-radio value="cost">成本评估</a-radio>
            <a-radio value="risk">风险分析</a-radio>
            <a-radio value="market">市场调研</a-radio>
            <a-radio value="other">其他</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="关联文档">
          <a-upload
            v-model:file-list="addItemForm.attachments"
            :multiple="true"
            :show-upload-list="true"
            :before-upload="beforeUpload"
          >
            <a-button>
              <UploadOutlined />
              📎 上传文件 (支持 PDF、Word、Excel、图片)
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 更新状态弹窗 -->
    <a-modal
      v-model:open="updateDialog.visible"
      title="📝 更新调研状态"
      width="500px"
      @cancel="handleCloseUpdateDialog"
      @ok="handleUpdateStatus"
    >
      <a-form :model="updateForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="调研状态" required>
          <a-radio-group v-model:value="updateForm.status">
            <a-radio value="active">进行中</a-radio>
            <a-radio value="completed">已完成</a-radio>
            <a-radio value="paused">已暂停</a-radio>
            <a-radio value="terminated">已终止</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model:value="updateForm.remark"
            :rows="3"
            placeholder="如有说明请填写..."
            :maxlength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="detailDialog.visible"
      title="📋 调研详情"
      width="700px"
      @cancel="detailDialog.visible = false"
      :footer="null"
    >
      <div v-if="detailDialog.record">
        <h3>{{ detailDialog.record.title }}</h3>
        <div class="purpose-tags" style="margin-bottom: 16px;">
          <a-tag v-for="purpose in detailDialog.record.stages" :key="purpose" color="blue" style="margin-right: 8px;">
            {{ getPurposeText(purpose) }}
          </a-tag>
        </div>
        <a-timeline mode="left">
          <a-timeline-item v-for="item in getAllItems(detailDialog.record)" :key="item.id">
            <div class="item-content">
              <span class="item-time">{{ item.time }}</span>
              <span class="item-user">{{ item.user }}</span>
              <span class="item-status">{{ getTaskTypeText(item.type) }}</span>
              <div class="item-desc">{{ item.content }}</div>
        </div>
          </a-timeline-item>
        </a-timeline>
        </div>
    </a-modal>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import PageContainer from '@/components/th_qd/PageContainer.vue'
import {
  DownloadOutlined,
  SearchOutlined,
  UploadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { apiGetResearchPage, apiGetResearchDetailPage, apiGetResearchDetail, apiExportResearch, apiCreateResearch, apiUpdateResearch, apiUpdateResearchStatus, apiCreateResearchTask, apiGetRequirementPoolPage, apiDeleteResearch, apiDeleteResearchTask, apiUpdateResearchTask, apiCreateResearchDocument, apiDeleteResearchDocument, apiListAllSimpleUsers, apiListAllSimpleDepts } from '@/api/th_qd/results/results'
import { uploadTechnologicalFiles } from '@/api/upload'

/**
 * 响应式数据
 */
// 筛选条件
const filters = reactive({
  status: '',
  source: '',
  keyword: ''
})

// 先定义数据，再定义计算属性

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 快速添加表单
const quickAddForm = reactive({
  content: '',
  planDate: 'today',
  duration: '1d'
})

// 新建调研记录弹窗
const addRecordDialog = reactive({
  visible: false
})

const addRecordForm = reactive({
  title: '',
  responsible: '',
  department: '',
  startDate: null,
  expectedEndDate: null,
  stages: ['analysis', 'technical'], // 默认选择需求分析和技术调研
  description: '',
  priority: 'medium',
  sourceType: 'requirement', // 默认选择需求池
  sourceRequirement: '', // 选择的需求ID
  sourceDescription: '' // 手动填写的来源描述
})

// 需求来源下拉选项（实时从接口加载）
const filteredRequirements = ref([])

// 加载需求来源选项
const loadRequirementOptions = async (keyword = '') => {
  try {
    const res = await apiGetRequirementPoolPage({ pageNo: '1', pageSize: '20', title: keyword || undefined })
    const page = res?.data ?? res
    const list = page?.list || []
    filteredRequirements.value = list.map((it) => ({ id: String(it.id || it.requirementCode || ''), title: it.title, category: it.categoryCode || '' }))
  } catch (e) {
    filteredRequirements.value = []
  }
}

// 添加事项弹窗
const addItemDialog = reactive({
  visible: false,
  recordId: null
})

const addItemForm = reactive({
  content: '',
  date: null,
  time: null,
  responsible: '',
  type: 'other',
  attachments: []
})

// 更新状态弹窗
const updateDialog = reactive({
  visible: false,
  recordId: null
})

const updateForm = reactive({
  status: 'active',
  remark: ''
})

// 前后端字段映射常量
const STATUS_FE_TO_BE = { active: 0, completed: 1, paused: 2, terminated: 3 }
const STATUS_BE_TO_FE = { 0: 'active', 1: 'completed', 2: 'paused', 3: 'terminated' }
const SOURCE_FE_TO_BE = { requirement: 0, internal: 1, external: 2 }
const STAGE_FE_TO_BE = { analysis: '0', technical: '1', design: '2', cost: '3', risk: '4', market: '5' }
const STAGE_BE_TO_FE = { '0': 'analysis', '1': 'technical', '2': 'design', '3': 'cost', '4': 'risk', '5': 'market' }
const PRIORITY_FE_TO_BE = { high: 0, medium: 1, low: 2 }
const TASK_TYPE_FE_TO_BE = { analysis: 0, technical: 1, design: 2, cost: 3, risk: 4, market: 5, other: 6 }
const TASK_TYPE_BE_TO_FE = { 0: 'analysis', 1: 'technical', 2: 'design', 3: 'cost', 4: 'risk', 5: 'market', 6: 'other' }

// 详情弹窗
const detailDialog = reactive({
  visible: false,
  record: null
})

// 调研记录数据（初始化为本地示例，后续将被接口数据覆盖）
const researchRecords = ref([
  // 新增测试数据，较新的创建时间
  {
    id: 'R2024004',
    title: 'REQ004-运营管理系统数字化改造调研',
    responsible: '赵六',
    department: '管理部',
    status: 'active',
    startDate: '2024-02-01',
    expectedEndDate: '2024-03-15',
    progress: 25,
    currentStage: '需求分析',
    latestUpdate: '需求梳理中，已完成业务流程调研',
    nextMilestone: '2024-02-10 完成需求分析',
    showQuickAdd: false,
    sourceType: 'internal',
    sourceDescription: '管理部内部提出的数字化改造需求',
    createTime: '2024-02-01T08:00:00.000Z',
    updateTime: '2024-02-03T14:30:00.000Z',
    stages: ['analysis', 'technical', 'design'],
    items: [
      {
        id: 'item1',
        content: '完成业务流程调研和需求梳理',
        user: '赵六',
        time: '2024-02-03T14:30:00.000Z',
        status: 'completed'
      },
      {
        id: 'item2',
        content: '启动数字化改造调研项目',
        user: '赵六',
        time: '2024-02-01T08:00:00.000Z',
        status: 'active'
      }
    ]
  },
  {
    id: 'R2024001',
    title: 'REQ001-智能水质监测系统调研',
    responsible: '张三',
    department: '技术部',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    expectedEndDate: '2024-02-15',
    progress: 100,
    showQuickAdd: false,
    sourceType: 'requirement',
    sourceId: 'REQ001',
    sourceTitle: '智能水质监测系统需求',
    sourceCategory: '技术改进',
    createTime: '2024-01-15T09:00:00.000Z',
    updateTime: '2024-02-15T18:00:00.000Z',
    stages: ['analysis', 'technical', 'design', 'cost', 'risk'],
    items: [
      {
        id: 'item5',
        content: '调研项目已完成，形成最终报告',
        user: '张三',
        time: '2024-02-15T18:00:00.000Z',
      attachments: [
          { id: 'att1', name: '智能水质监测系统调研报告.pdf', url: '/attachments/report1.pdf' },
          { id: 'att2', name: '市场分析数据.xlsx', url: '/attachments/data1.xlsx' }
        ]
      },
      {
        id: 'item4',
        content: '完成风险分析和可行性评估',
        user: '张三',
        time: '2024-02-13T16:30:00.000Z',
      attachments: [
          { id: 'att3', name: '风险评估报告.docx', url: '/attachments/risk1.docx' }
        ]
      },
      {
        id: 'item3',
        content: '完成成本评估和投资预算',
        user: '张三',
        time: '2024-02-10T14:20:00.000Z'
      },
      {
        id: 'item2',
        content: '完成技术方案设计',
        user: '张三',
        time: '2024-02-05T10:15:00.000Z'
      },
      {
        id: 'item1',
        content: '启动智能水质监测系统调研',
        user: '张三',
        time: '2024-02-15T09:00:00.000Z'
      }
    ],
    result: {
      conclusion: '技术可行，建议立项实施',
      investment: 150,
      duration: 8,
      roi: 3.2,
      successRate: 85
    }
  },
  {
    id: 'R2024002',
    title: 'REQ002-污水处理工艺优化调研',
    responsible: '李四',
    department: '工艺部',
    status: 'active',
    startDate: '2024-01-20',
    expectedEndDate: '2024-02-28',
    progress: 60,
    currentStage: '方案设计',
    latestUpdate: '初步技术方案已确定，开始详细设计',
    nextMilestone: '2024-02-05 完成方案设计',
    showQuickAdd: false,
    sourceType: 'requirement',
    sourceId: 'REQ002',
    sourceTitle: '污水处理工艺优化需求',
    sourceCategory: '工艺升级',
    createTime: '2024-01-20T10:30:00.000Z',
    updateTime: '2024-02-01T16:45:00.000Z',
    stages: ['analysis', 'technical', 'design'],
    items: [
      {
        id: 'item3',
        content: '初步技术方案已确定，开始详细设计',
        user: '李四',
        time: '2024-02-01T16:45:00.000Z'
      },
      {
        id: 'item2',
        content: '完成技术调研和市场分析',
        user: '李四',
        time: '2024-01-28T11:20:00.000Z'
      },
      {
        id: 'item1',
        content: '启动污水处理工艺优化调研',
        user: '李四',
        time: '2024-01-20T10:30:00.000Z'
      }
    ]
  },
  {
    id: 'R2024003',
    title: 'REQ003-管网漏损检测设备调研',
    responsible: '王五',
    department: '运维部',
    status: 'paused',
    startDate: '2024-01-10',
    expectedEndDate: '2024-02-20',
    expectedResumeDate: '2024-02-10',
    progress: 30,
    pauseReason: '等待预算确认，供应商报价延迟',
    pauseNote: '需等待财务部门预算批复',
    showQuickAdd: false,
    sourceType: 'external',
    sourceDescription: '华水集团总部委托调研项目',
    createTime: '2024-01-10T14:20:00.000Z',
    updateTime: '2024-01-25T11:15:00.000Z',
    stages: ['analysis', 'technical', 'design'],
    items: [
      {
        id: 'item3',
        content: '调研项目暂停，等待预算确认',
        user: '王五',
        time: '2024-01-25T11:15:00.000Z'
      },
      {
        id: 'item2',
        content: '完成技术调研和设备选型',
        user: '王五',
        time: '2024-01-18T15:30:00.000Z'
      },
      {
        id: 'item1',
        content: '启动管网漏损检测设备调研',
        user: '王五',
        time: '2024-01-10T14:20:00.000Z'
      }
    ]
  }
])

// 统计数据 - 使用计算属性动态计算
const statistics = computed(() => {
  const records = researchRecords.value
  return {
    total: records.length,
    active: records.filter(r => r.status === 'active').length,
    completed: records.filter(r => r.status === 'completed').length,
    paused: records.filter(r => r.status === 'paused').length,
    terminated: records.filter(r => r.status === 'terminated').length
  }
})

/**
 * 计算属性
 */
const filteredRecords = computed(() => {
  let filtered = researchRecords.value

  // 状态筛选
  if (filters.status) {
    filtered = filtered.filter(record => record.status === filters.status)
  }

  // 来源筛选
  if (filters.source) {
    filtered = filtered.filter(record => record.sourceType === filters.source)
  }

  // 关键词搜索
  if (filters.keyword) {
    filtered = filtered.filter(record => 
      record.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      record.responsible.includes(filters.keyword) ||
      (record.sourceTitle && record.sourceTitle.toLowerCase().includes(filters.keyword.toLowerCase())) ||
      (record.sourceDescription && record.sourceDescription.toLowerCase().includes(filters.keyword.toLowerCase()))
    )
  }

  // 排序逻辑：1. 按创建时间倒序 2. 按状态优先级排序
  filtered.sort((a, b) => {
    // 首先按创建时间排序（最新的在前面）
    const timeA = new Date(a.createTime || a.startDate || '2024-01-01').getTime()
    const timeB = new Date(b.createTime || b.startDate || '2024-01-01').getTime()
    
    if (timeA !== timeB) {
      return timeB - timeA // 倒序，最新的在前
    }
    
    // 如果创建时间相同，按状态优先级排序
    const statusPriority = {
      'active': 1,    // 进行中
      'paused': 2,    // 暂停中  
      'completed': 3, // 已完成
      'terminated': 4 // 已终止
    }
    
    const priorityA = statusPriority[a.status] || 5
    const priorityB = statusPriority[b.status] || 5
    
    return priorityA - priorityB
  })

  return filtered
})

// 服务端分页：筛选变化时拉取
watch([() => filters.status, () => filters.source, () => filters.keyword], () => {
  pagination.page = 1
  fetchRecords()
})

/**
 * 工具方法
 */
const getStatusTagColor = (status) => {
  const colors = {
    active: 'processing',
    completed: 'success',
    paused: 'warning',
    terminated: 'error'
  }
  return colors[status] || 'default'
}

const getStatusIcon = (status) => {
  const icons = {
    active: '🔄',
    completed: '🟢',
    paused: '⏸️',
    terminated: '❌'
  }
  return icons[status] || '❓'
}

const getStatusText = (status) => {
  const texts = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    terminated: '已终止'
  }
  return texts[status] || '未知'
}

const getTaskTypeText = (type) => {
  const texts = {
    analysis: '需求分析',
    technical: '技术调研',
    design: '方案设计',
    cost: '成本分析',
    risk: '风险评估',
    market: '市场调研',
    other: '其他'
  }
  return texts[type] || '未知'
}

const getPurposeText = (purpose) => {
  const texts = {
    analysis: '需求分析',
    technical: '技术调研',
    design: '方案设计',
    cost: '成本评估',
    risk: '风险分析',
    market: '市场调研'
  }
  return texts[purpose] || purpose
}

/**
 * 事件处理方法
 */
const showQuickAddForm = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.showQuickAdd = true
    quickAddForm.content = ''
    quickAddForm.planDate = 'today'
    quickAddForm.duration = '1d'
  }
}

const cancelQuickAdd = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.showQuickAdd = false
  }
}

const saveQuickItem = (recordId) => {
  if (!quickAddForm.content.trim()) {
    message.warning('请填写事项内容')
    return
  }
  ;(async () => {
    const today = dayjs()
    const taskDateTime = today.hour(0).minute(0).second(0).millisecond(0)
    const payload = {
      researchId: Number(recordId),
      taskContent: quickAddForm.content,
      taskDate: taskDateTime.format('YYYY-MM-DD'),
      taskTime: taskDateTime.format('HH:mm:ss'),
      ownerId: String(users.value[0]?.id || ''),
      ownerName: researchRecords.value.find(r => r.id === recordId)?.responsible || users.value[0]?.nickname || '',
      taskType: Number(TASK_TYPE_FE_TO_BE['other'])
    }
    const taskRes = await apiCreateResearchTask(payload)
    console.log('调研事项创建成功，ID:', taskRes?.id || taskRes?.data?.id)
    
    // 更新调研记录中的 researchTasks 数组
    try {
      const currentRecord = researchRecords.value.find(r => r.id === recordId)
      if (currentRecord) {
        const newTask = {
          id: taskRes?.id || taskRes?.data?.id,
          researchId: Number(recordId),
          taskContent: quickAddForm.content,
          taskDate: taskDateTime.format('YYYY-MM-DD'),
           taskTime: taskDateTime.format('HH:mm:ss'),
          ownerId: String(users.value[0]?.id || ''),
          ownerName: researchRecords.value.find(r => r.id === recordId)?.responsible || users.value[0]?.nickname || '',
          taskType: Number(TASK_TYPE_FE_TO_BE['other'])
        }
        
        await apiUpdateResearch({
          id: Number(recordId),
          researchTasks: [...(currentRecord.researchTasks || []), newTask]
        })
      }
    } catch (error) {
      console.warn('更新调研记录失败:', error)
    }
    
  message.success('调研事项添加成功')
  cancelQuickAdd(recordId)
    fetchRecords()
  })()
}

const showAddItemDialog = (recordId) => {
  addItemDialog.recordId = recordId
  addItemDialog.visible = true
  
  // 重置表单
  Object.assign(addItemForm, {
    content: '',
    date: null,
    time: null,
    responsible: '',
    type: 'other',
    attachments: []
  })
}

const handleCloseAddDialog = () => {
  addItemDialog.visible = false
  addItemDialog.recordId = null
}

const handleAddItem = () => {
  if (!addItemForm.content.trim()) {
    message.warning('请填写事项内容')
    return
  }
  
  if (!addItemForm.date) {
    message.warning('请选择日期')
    return
  }

  ;(async () => {
    let uploadedDocs = []
    if (addItemForm.attachments && addItemForm.attachments.length > 0) {
      const rawFiles = addItemForm.attachments.map((f) => f.originFileObj || f)
      const resArr = await uploadTechnologicalFiles(rawFiles, 'research/documents')
      uploadedDocs = (resArr || []).filter((r) => r?.code === 0).map((r) => ({
        fileName: r.data?.fileName,
        fileUrl: r.data?.fileUrl,
        fileSize: r.data?.fileSize,
        fileType: r.data?.fileType,
        fileExtension: r.data?.fileExtension
      }))
    }

    const ownerObj = users.value.find(u => u.id === addItemForm.responsible)
    // 组合日期和时间生成精确到分钟的时间戳
        const taskDateTime = addItemForm.time
          ? addItemForm.date.hour(addItemForm.time.hour()).minute(addItemForm.time.minute()).second(0).millisecond(0)
          : addItemForm.date.hour(0).minute(0).second(0).millisecond(0)

        const payload = {
          researchId: Number(addItemDialog.recordId),
          taskContent: addItemForm.content,
          taskDate: taskDateTime.format('YYYY-MM-DD'),
           taskTime: taskDateTime.format('HH:mm:ss'),
          ownerId: ownerObj ? String(ownerObj.id) : String(users.value[0]?.id || ''),
          ownerName: ownerObj?.nickname || users.value[0]?.nickname || '',
          taskType: Number(TASK_TYPE_FE_TO_BE[addItemForm.type] ?? 6)
        }

    const taskRes = await apiCreateResearchTask(payload)
    console.log('调研事项创建成功，ID:', taskRes?.id || taskRes?.data?.id)
    
    // 单独上传文档
    if (uploadedDocs && uploadedDocs.length > 0) {
      for (const doc of uploadedDocs) {
        await apiCreateResearchDocument({
          researchId: addItemDialog.recordId,
          taskId: taskRes?.id || taskRes?.data?.id,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          fileType: doc.fileType,
          fileExtension: doc.fileExtension,
          uploadTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
      }
    }
    
    // 更新调研记录中的 researchTasks 数组
    try {
      const currentRecord = researchRecords.value.find(r => r.id === addItemDialog.recordId)
      if (currentRecord) {
        const newTask = {
          id: taskRes?.id || taskRes?.data?.id,
          researchId: Number(addItemDialog.recordId),
          taskContent: addItemForm.content,
          taskDate: taskDateTime.format('YYYY-MM-DD'),
           taskTime: taskDateTime.format('HH:mm:ss'),
          ownerId: ownerObj ? String(ownerObj.id) : String(users.value[0]?.id || ''),
          ownerName: ownerObj?.nickname || users.value[0]?.nickname || '',
          taskType: Number(TASK_TYPE_FE_TO_BE[addItemForm.type] ?? 6)
        }
        
        await apiUpdateResearch({
          id: Number(addItemDialog.recordId),
          researchTasks: [...(currentRecord.researchTasks || []), newTask]
        })
      }
    } catch (error) {
      console.warn('更新调研记录失败:', error)
    }
    
    message.success('调研事项添加成功')
    handleCloseAddDialog()
    fetchRecords()
  })()
}

// 附件下载功能
const downloadAttachment = (attachment) => {
  // 实际项目中这里应该调用下载API
  message.info(`正在下载附件: ${attachment.name}`)
  // 模拟下载
  const link = document.createElement('a')
  link.href = attachment.url || '#'
  link.download = attachment.name
  link.click()
}

// 日期选择器限制 - 不能选择过去的日期
const disabledDate = (current) => {
  // 禁用今天之前的日期
  return current && current.isBefore(new Date(), 'day')
}

// 文件上传前处理
const beforeUpload = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    message.error('文件格式不支持，请上传PDF、Word、Excel或图片文件！')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过10MB！')
    return false
  }
  
  return false // 阻止自动上传，由表单统一处理
}

// 显示新建调研记录弹窗
const showAddRecordDialog = () => {
  addRecordDialog.visible = true
  // 重置表单
  Object.assign(addRecordForm, {
    title: '',
    responsible: '',
    department: '技术部',
    startDate: null,
    expectedEndDate: null,
    stages: ['analysis', 'technical'], // 默认选择需求分析和技术调研
    description: '',
    priority: 'medium',
    sourceType: 'requirement',
    sourceRequirement: '',
    sourceDescription: ''
  })
  // 初次打开时加载需求来源选项 & 部门
  if (addRecordForm.sourceType === 'requirement') {
    loadRequirementOptions()
  }
  if (departments.value.length === 0) {
    loadDepartments()
  }
}

// 关闭新建调研记录弹窗
const handleCloseAddRecordDialog = () => {
  addRecordDialog.visible = false
}

// 需求来源类型变更处理
const handleSourceTypeChange = () => {
  // 切换来源类型时清空相关字段
  addRecordForm.sourceRequirement = ''
  addRecordForm.sourceDescription = ''
  
  // 如果切换到需求池，重置筛选列表
  if (addRecordForm.sourceType === 'requirement') {
    loadRequirementOptions()
  } else {
    filteredRequirements.value = []
  }
}

// 需求搜索处理
const handleRequirementSearch = async (value) => {
  if (!value) {
    await loadRequirementOptions()
    return
  }
  try {
    await loadRequirementOptions(value)
  } catch (e) {
    filteredRequirements.value = []
  }
}

// 确认新建调研记录
const handleAddRecord = () => {
  if (!addRecordForm.title.trim()) {
    message.error('请输入调研标题')
    return
  }
  if (addRecordForm.stages.length === 0) {
    message.error('请至少选择一个调研阶段')
    return
  }
  if (!addRecordForm.startDate) {
    message.error('请选择开始时间')
    return
  }
  if (!addRecordForm.responsible) {
    message.error('请选择负责人')
    return
  }
  if (!addRecordForm.department) {
    message.error('请选择所属部门')
    return
  }

  ;(async () => {
    const deptObj = departments.value.find(d => d.id === addRecordForm.department)
    const ownerObj = users.value.find(u => u.id === addRecordForm.responsible)
    const payload = {
      researchTitle: addRecordForm.title,
      sourceType: SOURCE_FE_TO_BE[addRecordForm.sourceType] ?? 1,
      sourceName: addRecordForm.sourceType !== 'requirement' ? addRecordForm.sourceDescription : undefined,
      requirementPoolId: addRecordForm.sourceType === 'requirement' ? Number(addRecordForm.sourceRequirement) : undefined,
      ownerId: ownerObj ? String(ownerObj.id) : undefined,
      ownerName: ownerObj?.nickname,
      departmentId: deptObj?.id ? String(deptObj.id) : undefined,
      departmentName: deptObj?.name ? String(deptObj.name) : undefined,
      startTime: addRecordForm.startDate ? addRecordForm.startDate.startOf('day').valueOf() : undefined,
      expectedEndTime: addRecordForm.expectedEndDate ? addRecordForm.expectedEndDate.startOf('day').valueOf() : undefined,
      researchStages: addRecordForm.stages.map(s => STAGE_FE_TO_BE[s]).filter(Boolean).join(','),
      priority: PRIORITY_FE_TO_BE[addRecordForm.priority] ?? 1,
    description: addRecordForm.description,
      status: STATUS_FE_TO_BE['active'],
      researchTasks: []
    }

    await apiCreateResearch(payload)
  message.success('调研记录创建成功！')
  addRecordDialog.visible = false
    fetchRecords()
  })()
}

// 暂停调研
const pauseResearch = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.status = 'paused'
    record.updateTime = new Date().toISOString()
    message.success('调研已暂停')
  }
}

// 恢复调研
const resumeResearch = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.status = 'active'
    record.updateTime = new Date().toISOString()
    message.success('调研已恢复')
  }
}

// 终止调研
const terminateResearch = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    record.status = 'terminated'
    record.updateTime = new Date().toISOString()
    message.warning('调研已终止')
  }
}

const showUpdateProgress = (recordId) => {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    updateDialog.recordId = recordId
    updateDialog.visible = true
    updateForm.status = record.status
    updateForm.remark = ''
  }
}

const handleUpdateStatus = () => {
  const record = researchRecords.value.find(r => r.id === updateDialog.recordId)
  if (!record) return

  ;(async () => {
    const payload = {
      id: updateDialog.recordId,
      status: STATUS_FE_TO_BE[updateForm.status] ?? 0,
      remark: updateForm.remark
    }
    await apiUpdateResearchStatus(payload)
  message.success('调研状态已更新')
  handleCloseUpdateDialog()
    fetchRecords()
  })()
}

const handleSizeChange = (current, size) => {
  pagination.size = size
  pagination.page = 1
  fetchRecords()
}

const handleCurrentChange = (page, size) => {
  pagination.page = page
  pagination.size = size
  fetchRecords()
}

// 筛选处理函数
const handleFilterChange = () => {
  // 筛选变化时，重置分页到第一页并拉取
  pagination.page = 1
  fetchRecords()
}

// 查看调研记录详情
const showRecordDetail = async (recordId) => {
  try {
    const res = await apiGetResearchDetail(recordId)
    const it = res || {}
    const stages = typeof it.researchStages === 'string' && it.researchStages
      ? it.researchStages.split(',').map((s) => STAGE_BE_TO_FE[s] || 'analysis')
      : []
    const items = (it.researchTasks || []).map((t) => ({
      id: t.id,
      content: t.taskContent,
      user: t.ownerName,
      time: t.taskTime ? `${t.taskDate || ''} ${t.taskTime}` : (t.taskDate || ''),
      type: TASK_TYPE_BE_TO_FE[t.taskType] || 'other',
      attachments: (t.researchDocuments || []).map((d) => ({ id: d.id, name: d.fileName, url: d.fileUrl }))
    }))
    detailDialog.record = {
      id: it.id,
      title: it.researchTitle,
      stages,
      items
    }
    detailDialog.visible = true
  } catch (e) {
  const record = researchRecords.value.find(r => r.id === recordId)
  if (record) {
    detailDialog.record = record
    detailDialog.visible = true
    }
  }
}

// 关闭更新状态弹窗
const handleCloseUpdateDialog = () => {
  updateDialog.visible = false
  updateDialog.recordId = null
  
  // 重置表单
  Object.assign(updateForm, {
    status: 'active',
    remark: ''
  })
}

// 获取事项记录最近3条，按时间倒序
const getRecentItems = (record) => {
  if (!record.items || record.items.length === 0) return []
  // 按时间倒序，格式化时间显示
  return [...record.items]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3)
    .map(item => ({
      ...item,
      time: formatTime(item.time)
    }))
}

// 格式化时间显示
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取所有事项，按时间倒序
const getAllItems = (record) => {
  if (!record.items || record.items.length === 0) return []
  return [...record.items]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .map(item => ({
      ...item,
      time: formatTime(item.time)
    }))
}

/**
 * 生命周期
 */

// 安全处理后端日期字段为 YYYY-MM-DD（兼容 LocalDate/LocalDateTime/时间戳/字符串）
const toDateStr = (val) => {
  if (!val) return ''
  if (typeof val === 'string') return val.slice(0, 10)
  if (typeof val === 'number') return dayjs(val).format('YYYY-MM-DD')
  if (typeof val === 'object') {
    // LocalDate: { year, monthValue, dayOfMonth }
    // LocalDateTime: { year, monthValue, dayOfMonth, hour, minute, second }
    const y = val.year || val.y
    const m = val.monthValue ?? val.month
    const d = val.dayOfMonth ?? val.day
    if (y && m && d) {
      return dayjs(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`).format('YYYY-MM-DD')
    }
  }
  return ''
}

const fetchRecords = async () => {
  const params = {
    pageNo: String(pagination.page),
    pageSize: String(pagination.size),
    researchTitle: filters.keyword || undefined,
    status: filters.status ? String(STATUS_FE_TO_BE[filters.status]) : undefined,
    sourceType: filters.source ? String(SOURCE_FE_TO_BE[filters.source]) : undefined
  }
  const res = await apiGetResearchDetailPage(params)
  const list = res?.list || []
  pagination.total = res?.total || 0
  researchRecords.value = list.map((it) => {
    const stages = typeof it.researchStages === 'string' && it.researchStages
      ? it.researchStages.split(',').map((s) => STAGE_BE_TO_FE[s] || 'analysis')
      : []
    const items = (it.researchTasks || []).map((t) => ({
      id: t.id,
      content: t.taskContent,
      user: t.ownerName,
      time: t.taskTime ? `${t.taskDate || ''} ${t.taskTime}` : (t.taskDate || ''),
      type: TASK_TYPE_BE_TO_FE[t.taskType] || 'other',
      attachments: (t.researchDocuments || []).map((d) => ({ id: d.id, name: d.fileName, url: d.fileUrl }))
    }))
    return {
      id: it.id,
      title: it.researchTitle,
      responsible: it.ownerName,
      department: it.departmentName,
      status: STATUS_BE_TO_FE[it.status] || 'active',
      startDate: toDateStr(it.startTime),
      expectedEndDate: toDateStr(it.expectedEndTime),
      endDate: toDateStr(it.endTime || it.actualEndTime),
      progress: 0,
      currentStage: '',
      showQuickAdd: false,
      sourceType: it.sourceType === 0 ? 'requirement' : it.sourceType === 1 ? 'internal' : 'external',
      sourceId: it.requirementPoolId,
      sourceTitle: it.sourceName,
      createTime: it.createTime,
      updateTime: it.updateTime,
      stages,
      items,
      researchTasks: it.researchTasks || [] // 保存原始的 researchTasks 数据
    }
  })
}

const exportRecords = async () => {
  const params = {
    pageNo: String(pagination.page),
    pageSize: String(pagination.size),
    researchTitle: filters.keyword || undefined,
    status: filters.status ? String(STATUS_FE_TO_BE[filters.status]) : undefined,
    sourceType: filters.source ? String(SOURCE_FE_TO_BE[filters.source]) : undefined
  }
  const blob = await apiExportResearch(params)
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.download = '调研记录.xlsx'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const deleteResearch = (id) => {
  ;(async () => {
    await apiDeleteResearch(id)
    message.success('已删除调研记录')
    fetchRecords()
  })()
}

const editItem = (recordId, item) => {
  ;(async () => {
    const ownerObj = users.value.find(u => u.id === item.user || u.nickname === item.user)
    // 从现有时间字符串解析并生成时间戳
    const existingTime = item.time ? dayjs(item.time) : dayjs()
    const taskDateTime = existingTime.hour(0).minute(0).second(0).millisecond(0)

    const payload = {
      id: item.id,
      researchId: Number(recordId),
      taskContent: item.content,
      taskDate: taskDateTime.format('YYYY-MM-DD'),
           taskTime: taskDateTime.format('HH:mm:ss'),
      ownerId: ownerObj ? String(ownerObj.id) : String(users.value[0]?.id || ''),
      ownerName: ownerObj?.nickname || item.user || users.value[0]?.nickname || '',
      taskType: Number(TASK_TYPE_FE_TO_BE[item.type || 'other'] ?? 6)
    }
    await apiUpdateResearchTask(payload)
    
    // 更新调研记录中的 researchTasks 数组
    try {
      const currentRecord = researchRecords.value.find(r => r.id === recordId)
      if (currentRecord) {
        const updatedTasks = [...(currentRecord.researchTasks || [])]
        const taskIndex = updatedTasks.findIndex(t => t.id === item.id)
        if (taskIndex >= 0) {
          updatedTasks[taskIndex] = {
            id: item.id,
            researchId: Number(recordId),
            taskContent: item.content,
            taskDate: taskDateTime.format('YYYY-MM-DD'),
            taskTime: taskDateTime.format('HH:mm:ss'),
            ownerId: ownerObj ? String(ownerObj.id) : String(users.value[0]?.id || ''),
            ownerName: ownerObj?.nickname || item.user || users.value[0]?.nickname || '',
            taskType: Number(TASK_TYPE_FE_TO_BE[item.type || 'other'] ?? 6)
          }
        }
        
        await apiUpdateResearch({
          id: Number(recordId),
          researchTasks: updatedTasks
        })
      }
    } catch (error) {
      console.warn('更新调研记录失败:', error)
    }
    
    message.success('事项已更新')
    fetchRecords()
  })()
}

const deleteItem = (id) => {
  ;(async () => {
    // 先找到要删除的事项所属的调研记录
    const recordWithTask = researchRecords.value.find(record => 
      record.researchTasks && record.researchTasks.some(task => task.id === id)
    )
    
    await apiDeleteResearchTask(id)
    
    // 更新调研记录中的 researchTasks 数组
    if (recordWithTask) {
      try {
        const updatedTasks = (recordWithTask.researchTasks || []).filter(task => task.id !== id)
        
        await apiUpdateResearch({
          id: Number(recordWithTask.id),
          researchTasks: updatedTasks
        })
      } catch (error) {
        console.warn('更新调研记录失败:', error)
      }
    }
    
    message.success('事项已删除')
    fetchRecords()
  })()
}

const addDocument = async (recordId, itemId, files) => {
  try {
    const resArr = await uploadTechnologicalFiles(files.map(f => f.originFileObj || f), 'research/documents')
    const docs = (resArr || []).filter(r => r?.code === 0)
    for (const r of docs) {
      await apiCreateResearchDocument({
        researchId: recordId,
        taskId: itemId,
        fileName: r.data?.fileName,
        fileUrl: r.data?.fileUrl,
        fileSize: r.data?.fileSize,
        fileType: r.data?.fileType,
        fileExtension: r.data?.fileExtension,
        uploadTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })
    }
    message.success('附件已上传')
    fetchRecords()
  } catch (error) {
    console.error('上传附件失败:', error)
    message.error('上传附件失败')
  }
}

const deleteDocument = async (docId) => {
  await apiDeleteResearchDocument(docId)
  message.success('附件已删除')
  fetchRecords()
}

// 负责人选项
const users = ref([])
const departments = ref([])
const fetchUsers = async () => {
  try {
    const res = await apiListAllSimpleUsers()
    users.value = res || []
    if (!addRecordForm.responsible && users.value.length > 0) {
      addRecordForm.responsible = users.value[0].nickname || ''
    }
    if (!addItemForm.responsible && users.value.length > 0) {
      addItemForm.responsible = users.value[0].nickname || ''
    }
  } catch (e) {
    // ignore
  }
}

const loadDepartments = async () => {
  try {
    const res = await apiListAllSimpleDepts()
    departments.value = res || []
    if (!addRecordForm.department && departments.value.length > 0) {
      addRecordForm.department = departments.value[0].id
    }
  } catch (e) {
    departments.value = []
  }
}

onMounted(() => {
  fetchUsers()
  loadDepartments()
  fetchRecords()
})
</script>

<style scoped>
/** 
 * 所有页面默认样式已由PageContainer提供
 */

/**
 * 筛选统计区域样式
 */
.filter-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-controls {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 500;
  color: #333;
  min-width: 40px;
}

.stats-overview {
  font-size: 14px;
  color: #234fa2;
  font-weight: 500;
  padding: 12px 16px;
  background: #f0f5ff;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

/**
 * 调研记录卡片样式
 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.record-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/**
 * 更新状态弹窗样式
 */
.progress-input-container {
  width: 100%;
}

.progress-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-tip {
  font-size: 12px;
  color: #999;
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-icon {
  font-size: 18px;
}

.record-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.status-tag {
  font-weight: 500;
}

.card-info {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/**
 * 通用内容区域样式 - 标题左对齐，内容缩进
 */
.content-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: left; /* 标题左对齐 */
  font-size: 13px;
}

.section-content {
  margin-left: 20px; /* 内容缩进20px */
  text-align: left;
}

.purpose-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.purpose-tags .ant-tag {
  margin-right: 8px;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.item-time {
  font-size: 12px;
  color: #999;
}

.item-user {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.item-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-top: 2px;
}

/* 附件样式 */
.item-attachments {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.attachment-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-link {
  font-size: 13px;
  color: #1890ff;
  cursor: pointer;
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
  display: inline-block;
  max-width: fit-content;
}

.attachment-link:hover {
  background: #e6f7ff;
  color: #0050b3;
  text-decoration: underline;
}

/**
 * 操作按钮样式
 */
.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.add-item-action {
  color: #234fa2;
  padding: 0 8px;
}

.add-item-action:hover {
  color: #1c3d82;
  background: #f0f5ff;
}

/**
 * 分页样式
 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/**
 * 弹窗表单样式
 */
.progress-slider {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.progress-value {
  font-weight: 500;
  color: #234fa2;
  min-width: 40px;
}

.current-stage {
  font-weight: 500;
  color: #234fa2;
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {

  .filter-row {
    justify-content: center;
  }

  .timeline-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-stage {
    width: 100%;
  }

  .result-row,
  .progress-row,
  .pause-row {
    flex-direction: column;
    gap: 8px;
  }

  .card-actions {
    justify-content: center;
  }

  .quick-add-form {
    flex-direction: column;
    align-items: stretch;
  }
}

/**
 * 新建调研记录弹窗样式
 */
.stage-selection {
  margin-top: 8px;
}

.stage-tip {
  font-size: 12px;
  color: #666;
    margin-bottom: 12px;
  font-style: italic;
}

.stage-checkboxes {
  width: 100%;
}

.stage-checkbox {
  display: flex !important;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: #fafafa;
  width: 100%;
  margin: 0 !important;
}

.stage-checkbox:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.stage-checkbox.ant-checkbox-wrapper-checked {
  border-color: #1890ff;
  background: #e6f7ff;
}

.stage-icon {
  font-size: 16px;
  margin-right: 6px;
}

.stage-text {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

/**
 * 需求选择选项样式
 */
.requirement-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.req-title {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.req-category {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}
</style> 