<!--
 * @file 团队成员工作台v2页面
 * @description 简化的待办事项列表，支持格式化提报和审查意见查看
 * @author 科研管理系统
 * @version 6.0.0
 * @date 2025-01-29
-->
<template>
  <div class="team-workbench-v2">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>团队成员工作台 v2.0</h2>
      <p>我的待办事项管理，支持格式化提报和进度更新</p>
    </div>

    <!-- 待办事项列表 -->
    <a-card title="我的待办事项" :bordered="false" class="todo-card">
      <!-- 筛选器 -->
      <div class="todo-filters">
        <a-space>
          <a-segmented
            v-model:value="sourceMode"
            :options="[
              // { label: '示例数据', value: 'demo' },
              // { label: '任务策划(v3)', value: 'planning' }
            ]"
          />
          <!-- <a-select v-if="sourceMode==='planning'" v-model:value="currentMember" style="width: 160px" placeholder="选择成员(可选)">
            <a-select-option :value="''">全部成员</a-select-option>
            <a-select-option v-for="m in planningMembers" :key="m" :value="m">{{ memberNameMap[m] || m }}</a-select-option>
          </a-select> -->
          <a-select v-model:value="statusFilter" style="width: 120px">
            <a-select-option value="all">全部状态</a-select-option>
            <a-select-option value="pending">待办</a-select-option>
            <a-select-option value="in_progress">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="revision_required">需要重新提报</a-select-option>
          </a-select>
          <a-input-search 
            v-model:value="searchKeyword" 
            placeholder="搜索任务"
            style="width: 200px"
          />
        </a-space>
      </div>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-actions" style="margin-bottom: 16px;">
        <a-alert 
          :message="`已选择 ${selectedRowKeys.length} 个任务`" 
          type="info" 
          show-icon 
          style="margin-bottom: 8px;"
        />
        <a-space>
          <a-button size="small" @click="batchUpdateStatus('in_progress')">批量标记为进行中</a-button>
          <a-button size="small" @click="batchUpdateStatus('completed')">批量标记为已完成</a-button>
          <a-button size="small" @click="clearSelection">取消选择</a-button>
        </a-space>
      </div>

      <!-- 待办事项表格 -->
      <a-table 
        :dataSource="filteredTodos" 
        :columns="columns"
        rowKey="id"
        :pagination="paginationConfig"
        @change="handleTableChange"
        size="middle"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      >
        <!-- 自定义单元格渲染 -->
        <template #bodyCell="{ column, record }">
          <!-- 任务标题 -->
          <template v-if="column.key === 'title'">
            <div class="task-title-cell">
              <h4>{{ record?.title || '未知任务' }}</h4>
              <p class="task-description">{{ record?.description || '' }}</p>
              
              <!-- 文件列表 -->
              <div v-if="record?.taskFiles && record.taskFiles.length > 0" class="task-files">
                <div class="files-title">
                  <FileOutlined />
                  附件文件 ({{ record.taskFiles.length }})
                </div>
                <div class="files-list">
                  <div v-for="file in record.taskFiles" :key="file.id" class="file-item">
                    <a-tag color="blue" class="file-tag">
                      <a :href="file.fileUrl" target="_blank" class="file-link">
                        {{ file.fileName }}
                      </a>
                    </a-tag>
                    <div class="material-actions">
                      <span class="file-size">{{ (file.fileSize / 1024).toFixed(2) }} KB</span>
                      <a-button type="link" size="small" @click="previewFile(file)">
                        <EyeOutlined />
                        预览
                      </a-button>
                      <a-button type="link" size="small" @click="downloadFile(file)">
                        <DownloadOutlined />
                        下载
                      </a-button>
                    </div>
                  </div>
                </div>
                
              </div>
              
              <div class="task-meta">
                <a-space size="small">
                  <span class="meta-item">
                    <CalendarOutlined />
                    截止：{{ record?.deadline || '未设置' }}
                  </span>
                  <span class="meta-item" :style="{ color: getRemainingTimeColor(record?.deadline) }">
                    <ClockCircleOutlined />
                    预计：{{ getRemainingTime(record?.deadline) }}
                  </span>
                </a-space>
              </div>
            </div>
          </template>

          <!-- 状态 -->
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record?.status || 'pending')">
              {{ getStatusText(record?.status || 'pending') }}
            </a-tag>
          </template>

          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button 
                size="small" 
                type="primary" 
                @click="handleSubmitReport(record)"
                :disabled="record?.status === 'completed' || record?.status === 'in_progress'"
              >
                {{ record?.status === 'revision_required' ? '重新提报' : '提报' }}
              </a-button>
              <!-- <a-button 
                size="small" 
                @click="handleUpdateProgress(record)"
                :disabled="record?.status === 'completed'"
              >
                更新进度
              </a-button> -->
              <a-button 
                size="small" 
                @click="handleViewHistory(record)"
                v-if="record?.status === 'revision_required' || record?.status === 'completed'"
              >
                查看审核结果
              </a-button>
              <a-button
                size="small"
                @click="handleViewHistory(record)"
                v-if="record?.hasReviewHistory && record?.status !== 'revision_required'"
              >
                历史审查意见
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 格式化提报弹窗（支持模板驱动 in planning 模式） -->
    <a-modal
      v-model:open="reportModalVisible"
      title="任务提报"
      width="800px"
      :footer="null"
    >
      <div v-if="currentTodo" class="report-form">
        <!-- 任务信息 -->
        <div class="task-info-section">
          <a-alert
            :message="`正在提报：${currentTodo.title}`"
            type="info"
            show-icon
            style="margin-bottom: 20px"
          />
          <a-alert
            v-if="activeReportTemplate"
            :message="`模板：${activeReportTemplate.title || activeReportTemplate.name || '未命名模板'}`"
            type="success"
            show-icon
            style="margin-bottom: 12px"
          />
        </div>

        <!-- 模板驱动的格式化提报表单（planning 模式） -->
        <a-form v-if="activeReportTemplate" layout="vertical">
          <!-- 调试信息：显示sections数量 -->
          <div v-if="reportForm.sections && reportForm.sections.length > 0" style="margin-bottom: 16px; color: #666;">
            共 {{ reportForm.sections.length }} 个表单项
          </div>
          
          <!-- 表单项渲染 -->
          <template v-if="reportForm.sections && reportForm.sections.length > 0">
            <a-form-item
              v-for="(sec, idx) in reportForm.sections"
              :key="idx"
              :label="sec.title"
              :required="sec.required"
            >
              <a-textarea
                v-model:value="sec.value"
                :rows="3"
                show-count
                :maxlength="500"
                :placeholder="`请填写：${sec.title}`"
              />
            </a-form-item>
          </template>
          
          <!-- 没有表单项时的提示 -->
          <div v-else style="text-align: center; padding: 20px; color: #999;">
            暂无表单项
          </div>

          <a-form-item label="📎 附件上传" :required="!!reportForm.requireAttachment">
            <a-upload
              v-model:file-list="reportForm.attachments"
              :before-upload="() => false"
              multiple
            >
              <a-button>
                <UploadOutlined />
                选择文件
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form>

        <!-- 旧版样例表单（demo 模式回退） -->
        <a-form v-else layout="vertical">
          <a-form-item label="🔍 发现结论" required>
            <a-textarea v-model:value="reportForm.findings" placeholder="请描述本阶段的主要发现和结论..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="📝 详细描述" required>
            <a-textarea v-model:value="reportForm.details" placeholder="请详细描述工作内容、实施过程、技术方案等..." :rows="4" show-count :maxlength="500" />
          </a-form-item>
          <a-form-item label="🔗 发现来源" required>
            <a-textarea v-model:value="reportForm.sources" placeholder="请说明发现的来源、依据、参考资料等..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="📋 下一步计划" required>
            <a-textarea v-model:value="reportForm.nextSteps" placeholder="请描述下一阶段的工作计划和时间安排..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="⚠️ 遇到的困难">
            <a-textarea v-model:value="reportForm.difficulties" placeholder="请描述遇到的问题、困难和需要的支持..." :rows="3" show-count :maxlength="300" />
          </a-form-item>
          <a-form-item label="📎 附件上传">
            <a-upload v-model:file-list="reportForm.attachments" :before-upload="() => false" multiple>
              <a-button>
                <UploadOutlined />
                选择文件
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form>

        <!-- 操作按钮 -->
        <div class="report-actions">
          <a-space>
            <a-button 
              type="primary" 
              @click="handleSubmitReportForm"
              :disabled="!isReportFormValid"
            >
              <CheckOutlined />
              提交提报
            </a-button>
            <a-button @click="reportModalVisible = false">
              取消
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 进度更新弹窗 -->
    <a-modal
      v-model:open="progressModalVisible"
      title="更新进度"
      width="500px"
      :footer="null"
    >
      <div v-if="currentTodo" class="progress-form">
        <a-form layout="vertical">
          <a-form-item label="任务进度">
            <a-slider
              v-model:value="progressForm.progress"
              :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
              :tooltip-formatter="(value) => `${value}%`"
            />
          </a-form-item>

          <a-form-item label="状态更新">
            <a-select v-model:value="progressForm.status" style="width: 100%">
              <a-select-option value="pending">待办</a-select-option>
              <a-select-option value="in_progress">进行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="进度说明">
            <a-textarea
              v-model:value="progressForm.notes"
              placeholder="请简要说明进度变更的原因..."
              :rows="3"
            />
          </a-form-item>
        </a-form>

        <div class="progress-actions">
          <a-space>
            <a-button type="primary" @click="handleUpdateProgressForm">
              <CheckOutlined />
              更新进度
            </a-button>
            <a-button @click="progressModalVisible = false">
              取消
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 历史审查意见弹窗（增强版：显示对应提交内容） -->
    <a-modal
      v-model:open="historyModalVisible"
      title="历史审查意见与提交记录"
      width="900px"
      :footer="null"
    >
      <div v-if="currentTodo" class="history-content">
        <div class="history-timeline">
          <div 
            v-for="(review, index) in enhancedReviewHistory" 
            :key="review.id"
            class="timeline-item"
          >
            <!-- 提交版本信息 -->
            <div class="submission-version">
              <div class="version-header">
                <div class="version-info">
                  <a-tag color="blue">📝 {{ review.submissionVersion }}</a-tag>
                  <span class="submission-time">{{ review.submissionTime }}</span>
                  <span class="version-note">{{ review.versionNote }}</span>
                </div>
                <a-button 
                  type="link" 
                  size="small"
                  @click="toggleSubmissionContent(index)"
                >
                  {{ review.showSubmissionContent ? '收起内容' : '查看提交内容' }}
                </a-button>
              </div>
              
              <!-- 可折叠的提交内容 -->
              <div v-if="review.showSubmissionContent" class="submission-content">
                <div class="content-section">
                  <h6>🔍 主要内容：</h6>
                  <p class="content-text">{{ review.submissionContent?.summary || '数据库设计优化方案v2.0，包含表结构设计、索引策略、性能优化建议等内容。' }}</p>
                </div>
                
                <div v-if="review.submissionContent?.keyPoints" class="content-section">
                  <h6>✨ 关键要点：</h6>
                  <ul class="key-points-list">
                    <li v-for="point in review.submissionContent.keyPoints" :key="point">{{ point }}</li>
                  </ul>
                </div>
                
                <div v-if="review.submissionContent?.attachments" class="content-section">
                  <h6>📎 提交附件：</h6>
                  <div class="attachment-tags">
                    <a-tag v-for="file in review.submissionContent.attachments" :key="file" color="geekblue">{{ file }}</a-tag>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 审查意见 -->
            <div class="review-section">
              <div class="review-header">
                <div class="reviewer-info">
                  <a-avatar size="small">{{ review.reviewer.charAt(0) }}</a-avatar>
                  <div class="reviewer-details">
                    <span class="reviewer-name">{{ review.reviewer }}</span>
                    <span class="review-time">{{ review.reviewTime }}</span>
                  </div>
                </div>
                <a-tag :color="review.action === 'approve' ? 'green' : 'orange'">
                  {{ review.action === 'approve' ? '✅ 通过' : '❌ 要求修改' }}
                </a-tag>
              </div>
              
              <div class="review-content">
                <div class="review-opinion">
                  <strong>审查意见：</strong>
                  <p>{{ review.opinion }}</p>
                </div>
                <div v-if="review.suggestions" class="review-suggestions">
                  <strong>{{ review.action === 'approve' ? '改进建议：' : '修改建议：' }}</strong>
                  <p>{{ review.suggestions }}</p>
                </div>
              </div>
            </div>
            
            <!-- 连接线（除最后一个） -->
            <div v-if="index < enhancedReviewHistory.length - 1" class="timeline-connector"></div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 文件预览组件 -->
    <FilePreview
      v-model:visible="filePreviewVisible"
      :file-info="currentPreviewFile"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { message } from 'ant-design-vue'
import { usePlanningStore } from '@/store/planning'
import { useTeamMembersStore } from '@/stores/teamMembers'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  UploadOutlined,
  FieldTimeOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import FilePreview from '@/components/th_qd/FilePreview.vue'
import { useUserStore } from '@/store/modules/user'
import { 
  thQdProjectTaskAssignmentPage,
  thQdProjectTaskAssignmentUpdateStatus,
  thQdProjectTaskAssignmentGet
} from '@/api/th_qd/myTask/assignment'
import { uploadTechnologicalFile } from '@/api/upload/index';
import { 
  thQdProjectTaskSubmissionCreate,
  thQdProjectTaskSubmissionGetPage
} from '@/api/th_qd/myTask/submission'


// 响应式数据
const statusFilter = ref('all')
const searchKeyword = ref('')
const sourceMode = ref('demo') // demo | planning
const reportModalVisible = ref(false)
const progressModalVisible = ref(false)
const historyModalVisible = ref(false)
const currentTodo = ref(null)
// 文件预览相关状态
const filePreviewVisible = ref(false)
const currentPreviewFile = ref(null)
// 当前任务对应的“活动提报模板”（planning 模式从 store 获取），用于驱动弹窗表单
const activeReportTemplate = ref(null)
const userStore = useUserStore()
// 表单数据
// 统一的提报表单数据结构：
// planning 模式：{ sections:[{title,required,value}], requireAttachment:boolean, attachments:UploadFile[] }
// demo 模式回退：保留旧字段
const reportForm = ref({ sections: [], requireAttachment: false, attachments: [], findings: '', details: '', sources: '', nextSteps: '', difficulties: '' })

const progressForm = ref({
  progress: 0,
  status: 'pending',
  notes: ''
})

// 待办事项数据
const todos = ref([])
const loading = ref(false)

// 分页相关数据
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['5', '10', '20', '50']
})

// 分页配置
const paginationConfig = computed(() => ({
  current: pagination.value.current,
  pageSize: pagination.value.pageSize,
  total: pagination.value.total,
  showSizeChanger: pagination.value.showSizeChanger,
  showQuickJumper: pagination.value.showQuickJumper,
  showTotal: pagination.value.showTotal,
  pageSizeOptions: pagination.value.pageSizeOptions
}))

// 获取任务文件列表
const fetchTaskFiles = async (taskId, taskIndex) => {
  try {
    if (!taskId) return;
    
    // 调用API获取任务详情，包含文件列表
    const res = await thQdProjectTaskAssignmentGet(taskId);
    console.log(`获取任务 ${taskId} 文件列表:`, res);

    // 处理不同的响应结构
    let files = [];
    
    if (res && res.taskFilesDOList && Array.isArray(res.taskFilesDOList)) {
      // 标准响应结构
      files = res.taskFilesDOList;
    } else if (res && res.data && res.data.taskFilesDOList && Array.isArray(res.data.taskFilesDOList)) {
      // 嵌套在data中的响应结构
      files = res.data.taskFilesDOList;
    } else if (res && res.data && Array.isArray(res.data)) {
      // 直接返回数组的情况
      files = res.data;
    } else if (Array.isArray(res)) {
      // 直接就是数组的情况
      files = res;
    }
    
    // 如果有文件数据，更新到任务对象中
    if (files.length > 0) {
      if (todos.value[taskIndex]) {
        todos.value[taskIndex].taskFiles = files.map(file => ({
          id: file.id,
          fileName: file.fileName || file.name || '未命名文件',
          fileUrl: file.fileUrl || file.url || '',
          fileSize: file.fileSize || 0,
          fileSuffix: file.fileSuffix || file.type || ''
        }));
        // console.log(`任务 ${taskId} 文件列表更新成功:`, todos.value[taskIndex].taskFiles);
      }
    } else {
      // console.log(`任务 ${taskId} 没有文件数据`);
    }
  } catch (error) {
    console.error(`获取任务 ${taskId} 文件列表失败:`, error);
  }
};

// 获取待办事项数据
const fetchTodos = async (pageNum = 1, pageSize = 10) => {
  try {
    loading.value = true
    // 为了获取准确的总条数，第一次请求时获取所有数据
    const res = await thQdProjectTaskAssignmentPage({
      pageNum: 1,
      pageSize: 100, // 设置一个足够大的值以获取所有数据
      assigneeName: useUserStore().getUser.nickname
    })
    // console.log('API返回数据:', res)
    
    // 处理不同的数据结构
    let taskList = []
    if (res && res.data) {
      if (res.data.records) {
        // 标准分页结构
        taskList = res.data.records
      } else if (res.data.list) {
        // 另一种常见的分页结构
        taskList = res.data.list
      } else if (Array.isArray(res.data)) {
        // 直接返回数组
        taskList = res.data
      }
    } else if (res && res.list) {
      // 直接在res下的list
      taskList = res.list
    } else if (Array.isArray(res)) {
      // 直接返回数组
      taskList = res
    }
    
    // 转换数据格式
    if (taskList.length > 0) {
      todos.value = taskList.map(item => {
        // 从projectTaskDO对象中获取任务信息
        const taskInfo = item.projectTaskDO || {};
        
        // 处理状态映射：1待办 2进行中 3需要重新提报 4已完成
        let status = 'pending';
        let progressValue = 0; // 默认进度为0
        
        if (taskInfo.taskStatus === 1) {
          status = 'pending';
          progressValue = 0; // 待办状态进度为0%
        } else if (taskInfo.taskStatus === 2) {
          status = 'in_progress';
          progressValue = 33; // 进行中状态进度为33%
        } else if (taskInfo.taskStatus === 3) {
          status = 'revision_required';
          progressValue = 66; // 需要重新提报状态进度为66%
        } else if (taskInfo.taskStatus === 4) {
          status = 'completed';
          progressValue = 100; // 已完成状态进度为100%
        }
        
        // 处理日期格式：将数组转换为字符串 (如 [2025, 9, 18] -> "2025-09-18")
        let deadline = '';
        if (taskInfo.plannedEndDate && Array.isArray(taskInfo.plannedEndDate) && taskInfo.plannedEndDate.length === 3) {
          const [year, month, day] = taskInfo.plannedEndDate;
          deadline = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
        
        return {
          id: item.id || taskInfo.id || '',
          title: taskInfo.taskTitle || '未命名任务',
          description: taskInfo.taskDescription || '',
          status: status,
          deadline: deadline,
          estimatedHours: taskInfo.estimatedHours || 0,
          progress: progressValue,
          hasReviewHistory: false,
          // 设置projectId，从item或taskInfo中获取
          projectId: item.projectId || taskInfo.projectId || '',
          // 设置taskId，用于获取文件列表
          taskId: taskInfo.id || '',
          // 初始化文件列表为空数组
          taskFiles: [],
          // 保留原始数据，以备后用
          rawData: item
        };
      })
    } else {
      // 如果没有数据，设置为空数组
      todos.value = []
    }

    // 更新分页信息 - 优先使用实际数据列表的长度作为总条数
    if (res && res.list && Array.isArray(res.list)) {
      // 如果API返回了list数组，使用其长度作为总条数
      pagination.value.total = res.list.length
    } else if (res && res.data && res.data.list && Array.isArray(res.data.list)) {
      // 如果API返回了data.list数组，使用其长度作为总条数
      pagination.value.total = res.data.list.length
    } else if (res && res.data && res.data.records && Array.isArray(res.data.records)) {
      // 如果API返回了data.records数组，使用其长度作为总条数
      pagination.value.total = res.data.records.length
    } else {
      // 其他情况，使用taskList的长度作为总条数
      pagination.value.total = taskList.length
    }

    // 根据当前页码和每页条数对数据进行分页
    const startIndex = (pageNum - 1) * pageSize
    const endIndex = startIndex + pageSize
    todos.value = todos.value.slice(startIndex, endIndex)
    
    // 为每个任务获取文件列表
    todos.value.forEach((todo, index) => {
      if (todo.taskId) {
        fetchTaskFiles(todo.taskId, index);
      }
    });
    } catch (error) {
    console.error('获取待办事项数据失败:', error)
    message.error('获取待办事项数据失败')
  } finally {
    loading.value = false
  }

}
// 读取任务策划(v3)的分配，映射为当前页的只读任务视图
const planning = usePlanningStore()
const membersStore = useTeamMembersStore()
const currentUserName = '张三(演示账号)'
const currentMember = ref('')

// 批量操作相关
const selectedRowKeys = ref([])
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}
const clearSelection = () => {
  selectedRowKeys.value = []
}
const batchUpdateStatus = (newStatus) => {
  if (sourceMode.value === 'demo') {
    // demo模式：直接更新本地数据
    selectedRowKeys.value.forEach(id => {
      const todo = todos.value.find(t => t.id === id)
      if (todo) {
        todo.status = newStatus
        if (newStatus === 'completed') todo.progress = 100
      }
    })
    message.success(`已批量更新 ${selectedRowKeys.value.length} 个任务状态`)
  } else {
    // planning模式：这里可以扩展为调用store方法或API
    message.info('planning模式下的批量操作功能待实现')
  }
  clearSelection()
}
// 成员显示名映射（id -> 姓名）
const memberNameMap = computed(() => {
  const map = {}
  ;(membersStore.activeMembers || []).forEach(m => { map[m.id] = m.name })
  return map
})
// 下拉成员列表使用分配中的成员ID去重，展示姓名
const planningMembers = computed(() => {
  const set = new Set()
  ;(planning.assignments || []).forEach(a => {
    if (a.memberId) set.add(a.memberId)
    else if (a.memberName) set.add(a.memberName)
  })
  return Array.from(set)
})
const planningTodos = computed(() => {
  try {
    const assigned = planning.assignments || []
    const visibleTaskIds = new Set(
      assigned
        .filter(a => {
          if (!currentMember.value) return true
          return a.memberName === currentMember.value || a.memberId === currentMember.value
        })
        .map(a => a.taskId)
    )
    return (planning.tasks || [])
      .filter(t => visibleTaskIds.has(t.id))
      .map(t => ({
        id: t.id,
        title: t.name,
        description: t.description || '',
        status: 'in_progress',
        deadline: t.dueDate || t.endDate || '',
        estimatedHours: t.estimate || 0,
        progress: 0,
        hasReviewHistory: false
      }))
  } catch (e) { return [] }
})

// 增强版审查历史数据（包含对应的提交内容）
const mockEnhancedReviewHistory = ref([
  {
    id: 'R001',
    // 审查信息
    reviewer: '项目负责人',
    reviewTime: '2025-08-21 14:30',
    action: 'reject',
    opinion: '数据库设计方案需要进一步完善，缺少关键的性能优化考虑。',
    suggestions: '1. 补充索引设计方案；2. 增加分区策略；3. 考虑读写分离架构。',
    // 对应的提交版本信息
    submissionVersion: 'v2.0',
    submissionTime: '2025-08-21 10:00',
    versionNote: '根据初次反馈修改的版本',
    showSubmissionContent: false,
    submissionContent: {
      summary: '数据库设计优化方案v2.0，完善了表结构设计，增加了基础索引策略，但性能优化部分仍需完善。',
      keyPoints: [
        '重新设计了用户表和订单表的关系',
        '添加了常用查询的复合索引',
        '优化了部分查询语句的执行计划',
        '初步考虑了分表策略'
      ],
      attachments: ['数据库设计文档v2.0.docx', 'ER图v2.png', '基础索引策略.xlsx']
    }
  },
  {
    id: 'R002',
    // 审查信息
    reviewer: '技术专家',
    reviewTime: '2025-08-20 16:45',
    action: 'approve',
    opinion: '初步设计方案合理，技术路线清晰。',
    suggestions: '建议在下一阶段加强性能测试验证。',
    // 对应的提交版本信息
    submissionVersion: 'v1.0',
    submissionTime: '2025-08-20 14:00',
    versionNote: '初始版本提交',
    showSubmissionContent: false,
    submissionContent: {
      summary: '数据库设计初版方案，包含基础的表结构设计和简单的数据关系建模。',
      keyPoints: [
        '完成了核心业务表的结构设计',
        '建立了基本的外键关系',
        '设计了用户权限相关的表结构',
        '提供了初步的数据字典'
      ],
      attachments: ['数据库设计文档v1.0.docx', 'ER图初版.png']
    }
  }
])

// 增强版历史记录计算属性
const enhancedReviewHistory = computed(() => {
  return mockEnhancedReviewHistory.value.map(review => ({
    ...review,
    showSubmissionContent: review.showSubmissionContent || false
  }))
})

// 表格列定义
const columns = [
  {
    title: '任务信息',
    key: 'title',
    width: '40%'
  },
  {
    title: '状态',
    key: 'status',
    width: '15%'
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: '15%',
    customRender: ({ text, record }) => {
      // 确保进度值存在，如果不存在则设为0
      const progressValue = Number(text) || 0;
      
      // 直接渲染简单的进度条
      return h('div', { style: { width: '100%', padding: '5px 0' } }, [
        h('div', { style: { 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          position: 'relative'
        } }, [
          h('div', { style: { 
            width: `${progressValue}%`, 
            height: '100%', 
            backgroundColor: (() => {
              // 根据状态设置不同的颜色
              if (record.status === 'pending') return '#fa8c16'; // 橙色 - 待办
              if (record.status === 'in_progress') return '#1890ff'; // 蓝色 - 进行中
              if (record.status === 'revision_required') return '#f5222d'; // 红色 - 需要重新提报
              if (record.status === 'completed') return '#52c41a'; // 绿色 - 已完成
              return progressValue === 0 ? '#d9d9d9' : '#1890ff'; // 默认颜色
            })(),
            borderRadius: '4px',
            transition: 'width 0.3s',
            minWidth: '2px' // 确保即使进度为0也显示一条细线
          } }),
          h('span', { style: { 
            position: 'absolute', 
            right: '5px', 
            top: '-20px', 
            fontSize: '12px'
          } }, `${progressValue}%`)
        ]),
        // 添加状态文本显示
        h('div', { style: {
          textAlign: 'center',
          fontSize: '12px',
          color: (() => {
            // 根据状态设置文本颜色
            if (record.status === 'pending') return '#fa8c16'; // 橙色 - 待办
            if (record.status === 'in_progress') return '#1890ff'; // 蓝色 - 进行中
            if (record.status === 'revision_required') return '#f5222d'; // 红色 - 需要重新提报
            if (record.status === 'completed') return '#52c41a'; // 绿色 - 已完成
            return '#1890ff'; // 默认颜色
          })(),
          marginTop: '4px'
        } }, (() => {
          // 根据状态返回对应的文本
          if (record.status === 'pending') return '待办';
          if (record.status === 'in_progress') return '进行中';
          if (record.status === 'revision_required') return '重新提报';
          if (record.status === 'completed') return '已完成';
          return '';
        })())
      ]);
    }
  },
  {
    title: '操作',
    key: 'action',
    width: '30%'
  }
]

// 计算属性
const filteredTodos = computed(() => {
  const base = sourceMode.value === 'planning' ? planningTodos.value : todos.value
  let filtered = base
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(todo => todo.status === statusFilter.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(todo => 
      todo.title.toLowerCase().includes(keyword) ||
      todo.description.toLowerCase().includes(keyword)
    )
  }
  
  return filtered
})

onMounted(() => {
  // 获取待办事项数据
  fetchTodos()
  
  // 仅当内存中无数据时再从本地恢复，避免覆盖刚刚在实施v3界面做的分配但尚未保存的内存状态
  try {
    const hasMemory = (planning.tasks && planning.tasks.length > 0) || (planning.assignments && planning.assignments.length > 0)
    if (!hasMemory) {
      planning.loadFromLocal && planning.loadFromLocal()
    }
  } catch {}
  
  // 添加定时检查，每30秒检查一次是否有新的任务分配（仅在planning模式下）
  const syncInterval = setInterval(() => {
    if (sourceMode.value === 'planning') {
      // 静默检查本地存储是否有更新
      const currentCount = planning.assignments?.length || 0
      const lastKnownCount = parseInt(localStorage.getItem('tw2-last-assignment-count') || '0')
      if (currentCount !== lastKnownCount) {
        console.log(`🔄 检测到任务分配变化: ${lastKnownCount} → ${currentCount}`)
        localStorage.setItem('tw2-last-assignment-count', currentCount.toString())
        // 可选：显示提示
        if (currentCount > lastKnownCount) {
          message.info('检测到新的任务分配')
        }
      }
    }
  }, 30000)
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(syncInterval)
  })
})

const isReportFormValid = computed(() => {
  // 调试信息：输出当前表单状态
  console.log('表单验证检查中...', {
    sourceMode: sourceMode.value,
    hasTemplate: !!activeReportTemplate.value,
    sections: reportForm.value.sections,
    requireAttachment: reportForm.value.requireAttachment,
    attachments: reportForm.value.attachments
  })
  
  // 如果有活动模板，则使用planning模式的验证逻辑，无论sourceMode是什么
  if (activeReportTemplate.value) {
    const sections = Array.isArray(reportForm.value.sections) ? reportForm.value.sections : []
    console.log('检查sections:', sections)
    
    // 检查所有必填分段是否已填写
    let hasMissingRequiredSection = false
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i]
      if (!s) continue
      
      console.log(`检查section ${i}:`, s)
      
      if (s.required) {
        const value = String(s.value || '').trim()
        console.log(`必填项 "${s.title}" 的值: "${value}"`, value ? '已填写' : '未填写')
        
        if (!value) {
          hasMissingRequiredSection = true
          console.log(`发现未填写的必填项: ${s.title}`)
          break
        }
      }
    }
    
    // 如果有必填项未填写，表单无效
    if (hasMissingRequiredSection) {
      console.log('表单验证失败：存在未填写的必填项')
      return false
    }
    
    // 检查是否需要附件
    const needAttach = !!reportForm.value.requireAttachment
    console.log('是否需要附件:', needAttach)
    
    if (needAttach) {
      const files = Array.isArray(reportForm.value.attachments) ? reportForm.value.attachments : []
      console.log('已上传附件数量:', files.length)
      
      if (files.length === 0) {
        console.log('表单验证失败：需要附件但未上传')
        return false // 需要附件但未上传
      }
    }
    
    // 所有必填项已填写，附件要求已满足，表单有效
    console.log('表单验证成功：所有必填项已填写，附件要求已满足')
    return true
  }
  
  // demo 模式回退：校验旧字段
  const rf = reportForm.value || {}
  const f1 = String(rf.findings || '').trim()
  const f2 = String(rf.details || '').trim()
  const f3 = String(rf.sources || '').trim()
  const f4 = String(rf.nextSteps || '').trim()
  
  const demoFormValid = !!(f1 && f2 && f3 && f4)
  console.log('Demo模式表单验证结果:', demoFormValid)
  
  return demoFormValid
})

// 方法定义
// 处理表格分页变化
const handleTableChange = (pag) => {
  // 更新分页信息
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize

  // 重新获取数据
  fetchTodos(pag.current, pag.pageSize)
}

const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'orange',
    'in_progress': 'blue',
    'completed': 'green',
    'revision_required': 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待办',
    'in_progress': '进行中',
    'completed': '已完成',
    'revision_required': '需要重新提报'
  }
  return textMap[status] || status
}

// 计算任务剩余时间
const getRemainingTime = (deadline) => {
  if (!deadline) return '未设置截止时间'
  
  const now = new Date()
  const endDate = new Date(deadline)
  
  // 如果截止时间无效，返回提示
  if (isNaN(endDate.getTime())) return '截止时间格式错误'
  
  // 计算时间差（毫秒）
  const diff = endDate.getTime() - now.getTime()
  
  // 如果已过期
  if (diff < 0) {
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60))
    return `已逾期${hours}小时`
  }
  
  // 计算剩余小时、分钟
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 根据剩余时间获取颜色
const getRemainingTimeColor = (deadline) => {
  if (!deadline) return '#8c8c8c' // 灰色
  
  const now = new Date()
  const endDate = new Date(deadline)
  
  // 如果截止时间无效，返回灰色
  if (isNaN(endDate.getTime())) return '#8c8c8c'
  
  // 计算时间差（毫秒）
  const diff = endDate.getTime() - now.getTime()
  
  // 如果已过期，返回红色
  if (diff < 0) return '#f5222d'
  
  // 计算剩余小时数
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  // 如果剩余时间不足24小时，返回橙色
  if (hours < 24) return '#fa8c16'
  
  // 如果剩余时间不足72小时，返回黄色
  if (hours < 72) return '#fadb14'
  
  // 默认返回绿色
  return '#52c41a'
}

const handleSubmitReport = (todo) => {
  currentTodo.value = todo
  
  // 尝试从原始数据中获取templateConfig
  const rawData = todo.rawData || {}
  const taskInfo = rawData.projectTaskDO || {}
  const templateConfigStr = taskInfo.templateConfig
  
  let tpl = null
  
  // 如果有templateConfig，则解析它
  if (templateConfigStr) {
    try {
      const templateConfig = JSON.parse(templateConfigStr)
      tpl = {
        title: templateConfig.title || '未命名模板',
        sections: templateConfig.sections || [],
        requireAttachment: templateConfig.requireAttachment || false,
        templateId: templateConfig.templateId
      }
      
      // 打印调试信息
      console.log('解析到的templateConfig:', templateConfig)
      console.log('转换后的模板对象:', tpl)
    } catch (e) {
      console.error('解析templateConfig失败:', e)
    }
  }
  
  // 如果没有从templateConfig获取到模板，则根据模式尝试从其他地方获取
  if (!tpl) {
    if (sourceMode.value === 'planning') {
      try {
        tpl = (planning.getActiveReportTemplate && planning.getActiveReportTemplateByTaskId)
          ? planning.getActiveReportTemplateByTaskId(todo.id)
          : (planning.getActiveReportTemplate ? planning.getActiveReportTemplate({ id: todo.id }) : null)
      } catch (e) {
        console.error('从store获取模板失败:', e)
      }
    }
  }
  
  activeReportTemplate.value = tpl || null
  
  if (tpl) {
    // 确保sections数组正确创建
    const sections = Array.isArray(tpl.sections) 
      ? tpl.sections.map(s => ({ 
          title: s.title || '未命名分段', 
          required: !!s.required, 
          value: '' 
        })) 
      : []
    
    // 更新表单数据
    reportForm.value = { 
      sections, 
      requireAttachment: !!tpl.requireAttachment, 
      attachments: [] 
    }
    
    // 打印调试信息
    console.log('最终模板信息:', tpl)
    console.log('最终表单sections:', sections)
  } else {
    // 无模板时回到旧结构
    activeReportTemplate.value = null
    reportForm.value = { sections: [], requireAttachment: false, attachments: [], findings: '', details: '', sources: '', nextSteps: '', difficulties: '' }
    console.log('未找到模板，使用默认表单')
  }
  
  reportModalVisible.value = true
}

const handleUpdateProgress = (todo) => {
  currentTodo.value = todo
  progressForm.value = {
    progress: todo.progress,
    status: todo.status,
    notes: ''
  }
  progressModalVisible.value = true
}

const handleViewHistory = async (todo) => {
  currentTodo.value = todo
  
  try {
    // 使用分配记录的ID作为taskId的值来获取历史审查意见
    const res = await thQdProjectTaskSubmissionGetPage({
      taskId: todo.id, // 使用分配记录的ID
      pageNum: 1,
      pageSize: 100
    })
    
    console.log('获取历史审查意见结果:', res)
    
    // 处理返回的数据
    if (res && res.list) {
      // 转换数据格式并更新到mockEnhancedReviewHistory
      const historyList = res.list || []
      
      if (historyList.length > 0) {
        mockEnhancedReviewHistory.value = historyList.map(item => {
          // 解析submissionContent中的sections数据
          let submissionContent = {}
          try {
            const contentData = JSON.parse(item.submissionContent || '{}')
            submissionContent = {
              summary: contentData.sections ? contentData.sections.map(s => `${s.title}: ${s.value}`).join('; ') : '',
              keyPoints: contentData.sections ? contentData.sections.filter(s => s.value).map(s => s.value) : [],
              sections: contentData.sections || []
            }
          } catch (e) {
            console.error('解析submissionContent失败:', e)
            submissionContent = {
              summary: item.submissionTitle || '',
              keyPoints: [],
              sections: []
            }
          }
          
          // 处理附件数据
          const attachments = item.taskFileDO ? item.taskFileDO.map(file => file.systemFileDO.fileName) : []
          
          // 根据实际API返回结构进行数据转换
          return {
            id: item.id || `R${Date.now()}`,
            reviewer: item.reviewerName || '系统',
            reviewTime: item.reviewTime ? new Date(item.reviewTime).toLocaleString() : new Date().toLocaleString(),
            action: item.reviewStatus === 2 ? 'approve' : 'reject', // reviewStatus: 2通过，1要求修改
            opinion: item.reviewComment || '',
            suggestions: Array.isArray(item.reviewRequirements) ? item.reviewRequirements.join('; ') : '',
            submissionVersion: `v${item.submissionVersion || 1}.0`,
            submissionTime: item.createTime ? new Date(item.createTime).toLocaleString() : new Date().toLocaleString(),
            versionNote: item.submissionTitle || '提交版本',
            showSubmissionContent: false,
            submissionContent: {
              ...submissionContent,
              attachments: attachments
            }
          }
        })
      } else {
        // 如果没有历史记录，显示空状态
        mockEnhancedReviewHistory.value = []
        message.info('暂无历史审查意见')
      }
    } else {
      // API调用失败，使用默认数据
      console.error('获取历史审查意见失败:', res)
      message.error('获取历史审查意见失败')
    }
  } catch (error) {
    console.error('获取历史审查意见出错:', error)
    message.error('获取历史审查意见出错: ' + (error.message || '未知错误'))
  }
  
  // 重置所有展开状态
  mockEnhancedReviewHistory.value.forEach(review => {
    review.showSubmissionContent = false
  })
  
  historyModalVisible.value = true
}

// 切换提交内容的显示状态
const toggleSubmissionContent = (index) => {
  mockEnhancedReviewHistory.value[index].showSubmissionContent = 
    !mockEnhancedReviewHistory.value[index].showSubmissionContent
}

const handleSubmitReportForm = async () => {
  // planning 模式校验：必填分段+附件要求
  if (sourceMode.value === 'planning' && activeReportTemplate.value) {
    const missing = (reportForm.value.sections || []).find(s => s.required && !String(s.value || '').trim())
    if (missing) return message.error(`请完善必填分段：${missing.title}`)
    if (reportForm.value.requireAttachment && (!Array.isArray(reportForm.value.attachments) || reportForm.value.attachments.length === 0)) {
      return message.error('该模板要求上传至少一个附件')
    }
  }

  try {
    // 处理附件上传
    let attachmentIds = []
    console.log('=== 开始处理附件上传 ===')
    console.log('reportForm.value完整对象:', reportForm.value)
    console.log('检查附件:', reportForm.value.attachments)
    console.log('附件类型:', typeof reportForm.value.attachments)
    console.log('附件是否为数组:', Array.isArray(reportForm.value.attachments))
    
    // 检查reportForm.value是否存在以及attachments属性
    if (!reportForm.value) {
      console.error('reportForm.value为空')
    } else if (!reportForm.value.attachments) {
      console.error('reportForm.value.attachments为空')
    } else if (!Array.isArray(reportForm.value.attachments)) {
      console.error('reportForm.value.attachments不是数组')
    } else if (reportForm.value.attachments.length === 0) {
      console.warn('reportForm.value.attachments为空数组')
    }
    
    if (reportForm.value.attachments && reportForm.value.attachments.length > 0) {
      console.log(`开始处理 ${reportForm.value.attachments.length} 个附件`)
      for (let i = 0; i < reportForm.value.attachments.length; i++) {
        const file = reportForm.value.attachments[i]
        console.log(`处理第 ${i+1} 个附件:`, file.name, file)
        
        if (file.originFileObj) {
          console.log(`文件 ${file.name} 有originFileObj，准备上传`)
          // 直接传递File对象和目录参数
          const uploadRes = await uploadTechnologicalFile(file.originFileObj, 'task/submission')
          console.log('文件上传结果:', JSON.stringify(uploadRes))
          
          // 检查上传响应的不同可能结构
          let fileId = null
          let fileUrlId = null // 从fileUrl中提取的ID
          
          // 1. 优先使用明确的ID字段
          if (uploadRes && uploadRes.data) {
            fileId = uploadRes.data
            console.log(`从uploadRes.data获取文件ID: ${fileId}`)
          } else if (uploadRes && uploadRes.fileId) {
            fileId = uploadRes.fileId
            console.log(`从uploadRes.fileId获取文件ID: ${fileId}`)
          } else if (uploadRes && uploadRes.id) {
            fileId = uploadRes.id
            console.log(`从uploadRes.id获取文件ID: ${fileId}`)
          }
          
          // 2. 总是尝试从fileUrl中提取ID，作为备用
          if (uploadRes && uploadRes.fileUrl) {
            // 从fileUrl中提取ID，例如: https://.../file/29/get/...
            const match = uploadRes.fileUrl.match(/\/file\/(\d+)\/get\//)
            if (match && match[1]) {
              fileUrlId = match[1]
              console.log(`从fileUrl提取文件ID: ${fileUrlId}`)
              
              // 如果没有找到明确的ID，使用从fileUrl提取的ID
              if (!fileId) {
                fileId = fileUrlId
                console.log(`使用从fileUrl提取的文件ID: ${fileId}`)
              }
            }
          }
          
          if (fileId) {
            // 保存文件ID
            attachmentIds.push(fileId)
            console.log(`已将文件ID ${fileId} 添加到attachmentIds，当前attachmentIds:`, attachmentIds)
            
            // 保存文件信息，用于后续构建taskFileDO
            // 确保使用当前文件的信息，而不是其他文件的信息
            const fileInfo = {
              fileName: file.name || uploadRes.fileName,
              fileSize: file.size || uploadRes.fileSize,
              fileType: file.name?.split('.').pop()  || uploadRes.fileName?.split('.').pop() || '',
              fileUrl: uploadRes.fileUrl,
              filePath: uploadRes.filePath || uploadRes.fileUrl
            }
            
            // 使用Vue.set或直接赋值确保响应式更新
            file.fileInfo = fileInfo
            console.log(`已为文件 ${file.name} 设置fileInfo:`, JSON.stringify(file.fileInfo))
            
            // 同时保存响应，以备后用
            file.response = uploadRes
            console.log(`已为文件 ${file.name} 设置response:`, JSON.stringify({
              fileName: uploadRes.fileName,
              fileUrl: uploadRes.fileUrl,
              fileId: fileId
            }))
          } else {
            console.error(`文件 ${file.name} 上传成功但无法获取有效ID，上传响应:`, JSON.stringify(uploadRes))
          }
        }
      }
    }
    
    console.log('=== 文件处理完成，attachmentIds最终状态 ===')
    console.log('attachmentIds内容:', attachmentIds)
    console.log('attachmentIds长度:', attachmentIds.length)
    
    // 检查每个附件是否有fileInfo
    if (reportForm.value.attachments && reportForm.value.attachments.length > 0) {
      console.log('=== 检查每个附件的fileInfo ===')
      reportForm.value.attachments.forEach((file, index) => {
        console.log(`附件${index + 1}的fileInfo:`, file.fileInfo)
        console.log(`附件${index + 1}的response:`, file.response)
      })
    }

// TaskSubmissionCreateReqVO {
//   taskId: number;
//   projectId: number;
//   templateId: number;
//   submissionTitle: string;
//   submissionContent: string;//提交内容JSON,示例值({"workContent":"完成需求分析","completionStatus":"100%"})
//   submissionType: number;
//   attachmentCount: number;
//   submitterName: string;
//   submissionNotes?: string;
//   taskFileDO:[{
//     systemFileDO:{
//       fileName: string;
//       fileSize: number;
//       fileType: string;
//       fileUrl: string;
//       filePath: string;
//     };
//   }]
// }



    // 构建提交参数
    console.log('currentTodo.value:', currentTodo.value)
    console.log('currentTodo.value.projectId:', currentTodo.value.projectId)
    
    const submitData = {
      taskId: currentTodo.value.id,
      projectId: currentTodo.value.projectId || '', // 确保projectId不是undefined
      templateId: activeReportTemplate.value?.templateId || null,
      submissionTitle:  currentTodo.value.title || '未命名提报',
      submissionContent: JSON.stringify({
        sections: reportForm.value.sections || [],
      }),
      submissionType: 1, // 1: 普通提报
      attachmentCount: attachmentIds.length,
      submitterName: useUserStore().getUser.nickname || '未知用户',
      taskFileDO: attachmentIds.map(id => {
        console.log(`=== 为文件ID ${id} 查找对应的文件对象 ===`)
        console.log(`当前attachments数组:`, reportForm.value.attachments)
        
        // 从attachments数组中查找对应的文件
        let file = null
        
        // 尝试多种匹配方式
        // 1. 通过uid匹配
        file = reportForm.value.attachments.find(att => att.uid === id)
        if (file) {
          console.log(`通过uid ${id} 找到文件:`, file.name)
        }
        
        // 2. 通过fileId匹配
        if (!file) {
          file = reportForm.value.attachments.find(att => att.fileId === id)
          if (file) {
            console.log(`通过fileId ${id} 找到文件:`, file.name)
          }
        }
        
        // 3. 通过response.data匹配
        if (!file) {
          file = reportForm.value.attachments.find(att => att.response && att.response.data === id)
          if (file) {
            console.log(`通过response.data ${id} 找到文件:`, file.name)
          }
        }
        
        // 4. 通过response中的fileUrl提取的ID匹配
        if (!file) {
          console.log(`尝试通过response.fileUrl提取的ID匹配 ${id}`)
          file = reportForm.value.attachments.find(att => {
            if (att.response && att.response.fileUrl) {
              const match = att.response.fileUrl.match(/\/file\/(\d+)\/get\//)
              const fileUrlId = match && match[1]
              console.log(`附件 ${att.name} 的fileUrl提取ID: ${fileUrlId}`)
              return fileUrlId === id
            }
            return false
          })
          if (file) {
            console.log(`通过response.fileUrl提取的ID ${id} 找到文件:`, file.name)
          }
        }
        
  
        
        if (!file) {
          console.error(`未找到ID为 ${id} 的文件，已尝试所有匹配方式`)
          console.log(`当前所有附件的详细信息:`, JSON.stringify(reportForm.value.attachments))
          return null
        }
        
        // 获取文件信息
        let fileInfo = null
        
        // 1. 优先使用fileInfo中的信息（上传后保存的信息）
        if (file.fileInfo) {
          fileInfo = file.fileInfo
        }
        // 2. 其次使用response中的信息（上传结果）
        else if (file.response) {
          fileInfo = {
            fileName: file.response.fileName || file.name,
            fileSize: file.response.fileSize || file.size,
            fileType: file.response.fileName?.split('.')?.pop() || file.type,
            fileUrl: file.response.fileUrl,
            filePath: file.response.filePath || file.response.fileUrl
          }
        }
        // 3. 最后使用基本信息
        else {
          fileInfo = {
            fileName: file.name || '未知文件',
            fileSize: file.size || 0,
            fileType: file.type || file.name?.split('.')?.pop() || 'unknown',
            fileUrl: file.url || '',
            filePath: file.filePath || ''
          }
        }
        
        // 构建systemFileDO对象
        const systemFileDO = {
          fileName: String(fileInfo.fileName || ''),
          fileSize: Number(fileInfo.fileSize || 0),
          fileType: String(fileInfo.fileType || ''),
          fileUrl: String(fileInfo.fileUrl || ''),
          filePath: String(fileInfo.filePath || '')
        }
        
        console.log(`为文件ID ${id} 构建的systemFileDO:`, systemFileDO)
        
        // 返回包含systemFileDO的对象
        return {
          systemFileDO: systemFileDO
        }
      }).filter(item => item !== null) // 过滤掉null值
    }
console.log('准备提交的提报数据：', submitData)
    // 调用提报API
    const res = await thQdProjectTaskSubmissionCreate(submitData)
    
    // 尝试从rawData中获取projectTaskDO
    let taskId = null;
    if (currentTodo.value && currentTodo.value.rawData && currentTodo.value.rawData.projectTaskDO) {
      console.log('从rawData中找到projectTaskDO:', currentTodo.value.rawData.projectTaskDO);
      taskId = currentTodo.value.rawData.projectTaskDO.id;
    } else if (currentTodo.value && currentTodo.value.taskId) {
      taskId = currentTodo.value.taskId;
    } else if (currentTodo.value && currentTodo.value.projectTaskDO && currentTodo.value.projectTaskDO.id) {
      taskId = currentTodo.value.projectTaskDO.id;
    } else if (currentTodo.value && currentTodo.value.id) {
      taskId = currentTodo.value.id;
    }
    
    console.log('最终使用的任务ID:', taskId);
    
    console.log('最终使用的任务ID:', taskId);
    
    // 只有在ID有效时才更新任务状态
    if (taskId) {
      await thQdProjectTaskAssignmentUpdateStatus({
        id: taskId,
        taskStatus: 2
      });
    } else {
      console.error('无法更新任务状态：未找到有效的任务ID', currentTodo.value);
    }
    if (res && res.code === 200) {
      message.success('提报提交成功，等待审查')
      reportModalVisible.value = false
      // 提报成功后刷新待办列表
      fetchTodos()
    } else {
      message.success('提报提交成功，等待审查')
      reportModalVisible.value = false
       // 提报成功后刷新待办列表
      fetchTodos()
    }
  } catch (error) {
    console.error('提报提交出错：', error)
    message.error('提报提交失败：' + (error.message || '未知错误'))
  }
}

const handleUpdateProgressForm = () => {
  const progressData = {
    todoId: currentTodo.value.id,
    ...progressForm.value,
    updateTime: new Date().toLocaleString()
  }
  
  // 更新本地数据
  const todo = todos.value.find(t => t.id === currentTodo.value.id)
  if (todo) {
    todo.progress = progressForm.value.progress
    todo.status = progressForm.value.status
  }
  
  console.log('更新进度数据：', progressData)
  message.success('进度更新成功')
  progressModalVisible.value = false
}

// 文件预览功能
const previewFile = (file) => {
  console.log('预览文件:', file)

  // 确保文件对象存在
  if (!file) {
    message.error('文件对象不存在')
    return
  }

  // 获取文件URL，尝试多种可能的属性名
  const fileUrl = file.fileUrl || file.url
  if (!fileUrl) {
    console.error('文件URL缺失:', file)
    message.error('文件信息不完整，无法预览')
    return
  }

  // 获取文件扩展名，尝试多种可能的属性名
  const fileExtension = file.fileSuffix || file.fileType || file.fileName?.split('.').pop()?.toLowerCase()
  console.log('文件扩展名:', fileExtension)

  // 获取文件大小，尝试多种可能的属性名
  const fileSize = file.fileSize || file.size || 0

  // 设置当前预览的文件，确保包含所有必要信息
  currentPreviewFile.value = {
    id: file.id,
    fileName: file.fileName || file.name || '未命名文件',
    fileUrl: fileUrl,
    fileSize: fileSize,
    fileType: fileExtension,
    fileSuffix: fileExtension,
    // 添加可能需要的其他属性
    name: file.fileName || file.name || '未命名文件',
    url: fileUrl,
    size: fileSize,
    type: fileExtension
  }

  console.log('设置预览文件:', currentPreviewFile.value)

  // 显示文件预览弹窗
  filePreviewVisible.value = true
}

// 文件下载功能
const downloadFile = (file) => {
  console.log('下载文件:', file)

  // 确保文件对象存在
  if (!file) {
    message.error('文件对象不存在')
    return
  }

  // 获取文件URL，尝试多种可能的属性名
  const fileUrl = file.fileUrl || file.url
  if (!fileUrl) {
    console.error('文件URL缺失:', file)
    message.error('文件信息不完整，无法下载')
    return
  }

  // 获取文件名，尝试多种可能的属性名
  const fileName = file.fileName || file.name || '未命名文件'

  try {
    // 创建隐藏的a标签进行下载
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'

    // 添加到文档中
    document.body.appendChild(link)

    // 触发点击
    link.click()

    // 移除元素
    document.body.removeChild(link)

    console.log('文件下载成功:', fileName)
    message.success(`正在下载文件: ${fileName}`)
  } catch (error) {
    console.error('文件下载失败:', error)
    message.error('文件下载失败，请重试')
  }
}
</script>

<style scoped>
.team-workbench-v2 {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  border: 1px solid #d6e4ff;
}

.page-header h2 {
  color: #234fa2;
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.page-header p {
  color: #64748b;
  margin: 0;
  font-size: 16px;
}

.todo-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,79,162,0.06);
}

.todo-filters {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6eaf2;
}

.task-title-cell h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.task-description {
  margin: 0 0 8px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.task-meta {
  margin: 0;
}

.meta-item {
  color: #8c8c8c;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 文件列表样式 */
.task-files {
  margin: 8px 0;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.files-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1890ff;
  font-size: 12px;
  margin-bottom: 6px;
  font-weight: 500;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.file-item:last-child {
  border-bottom: none;
}

.file-tag {
  margin: 0;
}

.file-link {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-link:hover {
  color: #fff;
  text-decoration: none;
}

/* 弹窗样式 */
.report-form,
.progress-form {
  max-height: 70vh;
  overflow-y: auto;
}

.task-info-section {
  margin-bottom: 20px;
}

.report-actions,
.progress-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e6eaf2;
  display: flex;
  justify-content: center;
}

/* 增强版历史审查意见样式 */
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.timeline-item {
  position: relative;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.timeline-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

/* 提交版本区域 */
.submission-version {
  background: #f0f5ff;
  border-bottom: 1px solid #d6e4ff;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submission-time {
  font-size: 12px;
  color: #8c8c8c;
}

.version-note {
  font-size: 12px;
  color: #1890ff;
  font-style: italic;
}

.submission-content {
  padding: 16px;
  background: white;
  border-top: 1px solid #e6f7ff;
}

.content-section {
  margin-bottom: 16px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h6 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #234fa2;
}

.content-text {
  margin: 0;
  color: #595959;
  line-height: 1.6;
  font-size: 13px;
}

.key-points-list {
  margin: 0;
  padding-left: 16px;
  color: #595959;
  font-size: 13px;
}

.key-points-list li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.attachment-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 审查意见区域 */
.review-section {
  padding: 16px;
  background: white;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reviewer-name {
  font-weight: 600;
  color: #234fa2;
  font-size: 14px;
}

.review-time {
  color: #8c8c8c;
  font-size: 12px;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-opinion,
.review-suggestions {
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #234fa2;
}

.review-opinion strong,
.review-suggestions strong {
  color: #234fa2;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.review-opinion p,
.review-suggestions p {
  margin: 0;
  color: #333;
  font-size: 13px;
  line-height: 1.6;
}

/* 时间线连接器 */
.timeline-connector {
  height: 16px;
  width: 2px;
  background: linear-gradient(to bottom, #d9d9d9, transparent);
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-workbench-v2 {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .todo-filters {
    flex-direction: column;
    gap: 12px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>