<template>
  <PageContainer
    title="需求池管理"
    description="项目调研的起点，收集和管理各类研发需求">
    
    <!-- 页面操作区 -->
    <template #actions>
        <a-button type="primary" @click="showAddModal = true">
          <PlusOutlined />
          新增需求
        </a-button>
        <!-- <a-button @click="exportRequirements">
          <DownloadOutlined />
          导出需求
        </a-button> -->
    </template>

    <!-- 筛选和统计区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="18">
          <a-space size="middle">
            <a-select 
              v-model:value="filterStatus" 
              placeholder="需求状态" 
              style="width: 120px"
              @change="handleFilter"
            >
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="待分析">待分析</a-select-option>
              <a-select-option value="进行中">进行中</a-select-option>
              <a-select-option value="已完成">已完成</a-select-option>
              <a-select-option value="已暂停">已暂停</a-select-option>
            </a-select>
            
            <a-select 
              v-model:value="filterPriority" 
              placeholder="优先级" 
              style="width: 100px"
              @change="handleFilter"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="高">高</a-select-option>
              <a-select-option value="中">中</a-select-option>
              <a-select-option value="低">低</a-select-option>
            </a-select>
            
            <a-select 
              v-model:value="filterCategory" 
              placeholder="需求分类" 
              style="width: 120px"
              @change="handleFilter"
            >
              <a-select-option value="">全部分类</a-select-option>
              <a-select-option value="技术创新">技术创新</a-select-option>
              <a-select-option value="工艺改进">工艺改进</a-select-option>
              <a-select-option value="设备更新">设备更新</a-select-option>
              <a-select-option value="质量提升">质量提升</a-select-option>
              <a-select-option value="成本控制">成本控制</a-select-option>
            </a-select>
            
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索需求标题或描述"
              style="width: 250px"
              @search="handleFilter"
            />
          </a-space>
        </a-col>
        <a-col :span="6">
          <div class="total-count-row">
            <span>需求总数</span>
            <span class="count-num">{{ requirements.length }}</span>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 需求状态看板 -->
    <div class="status-board">
      <div v-if="visibleStatusOptions.length > 0" class="card-list">
        <div class="status-columns-container">
          <div 
            v-for="status in visibleStatusOptions" 
            :key="status.value" 
            class="status-column-wrapper"
          >
            <div class="status-column" :class="`status-${status.color}`">
              <div class="status-header">
                <h3>{{ status.label }}</h3>
                <a-badge :count="getStatusCount(status.value)" :number-style="{ backgroundColor: status.color }" />
              </div>
              <div class="requirement-cards">
                <RequirementCard
                  v-for="requirement in getRequirementsByStatus(status.value)"
                  :key="requirement.id"
                  :requirement="requirement"
                  @edit="editRequirement"
                  @delete="deleteRequirement"
                  @status-change="updateRequirementStatus"
                  @priority-change="updateRequirementPriority"
                  @view="viewRequirement"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 当没有筛选结果时显示空状态 -->
      <div v-else class="empty-state">
        <a-empty 
          description="没有找到符合条件的需求"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <a-button type="primary" @click="clearFilters">清除筛选条件</a-button>
        </a-empty>
      </div>
    </div>

    <!-- 需求详情表格（可切换视图） -->
    <div class="table-section" v-show="viewMode === 'table'">
      <a-table
        :columns="tableColumns"
        :data-source="filteredRequirements"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1200 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ record.priority }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'category'">
            <a-tag>{{ record.category }}</a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="editRequirement(record)">
                编辑
              </a-button>
              <!-- <a-button type="link" size="small" @click="startResearch(record)">
                开始调研
              </a-button> -->
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="viewRequirement(record)">查看详情</a-menu-item>
                    <a-menu-item @click="duplicateRequirement(record)">复制需求</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="deleteRequirement(record)" style="color: #ff4d4f">
                      删除需求
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  更多 <DownOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </PageContainer>

    <!-- 新增/编辑需求弹窗 -->
    <RequirementModal
      v-model:visible="showAddModal"
      :requirement="currentRequirement"
      @save="saveRequirement"
    />

    <!-- 需求详情抽屉 -->
    <a-drawer
      v-model:open="showDetailDrawer"
      title="需求详情"
      width="600"
      placement="right"
    >
      <RequirementDetail
        v-if="selectedRequirement"
        :requirement="selectedRequirement"
        @edit="editRequirement"
        @start-research="startResearch"
      />
    </a-drawer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message, Empty } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  FileTextOutlined,
  PlusOutlined,
  DownloadOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import RequirementCard from '@/components/th_qd/research/RequirementCard.vue'
import RequirementModal from '@/components/th_qd/research/RequirementModal.vue'
import RequirementDetail from '@/components/th_qd/research/RequirementDetail.vue'
import PageContainer from '@/components/th_qd/PageContainer.vue'
import { useUserStore } from '@/store/modules/user'//获取登录
import { uploadTechnologicalFile } from '@/api/upload'//上传文件
import FilePreview from '@/components/th_qd/FilePreview.vue'//文件预览
import { 
  createTechnologicalRequirementPoolAttachment,//创建需求池管理相关附件
  updateTechnologicalRequirementPoolAttachment,//更新需求池管理相关附件
  deleteTechnologicalRequirementPoolAttachment,//删除需求池管理相关附件
  getTechnologicalRequirementPoolAttachmentPage,//查询需求池管理相关附件列表
  getTechnologicalRequirementPoolAttachmentInfo,//查询需求池管理相关附件信息
  exportTechnologicalRequirementPoolAttachmentExcel,//导出需求池管理相关附件列表

  createTechnologicalRequirementPool,//创建需求池管理
  updateTechnologicalRequirementPool,//更新需求池管理
  deleteTechnologicalRequirementPool,//删除需求池管理
  getTechnologicalRequirementPoolPage,//查询需求池管理列表
  getTechnologicalRequirementPoolInfo,//查询需求池管理信息
  getTechnologicalRequirementPoolAttachmentList,//查询需求池管理列表
  exportTechnologicalRequirementPoolExcel,//导出需求池管理列表
} from '@/api/th_qd/requirement'

const router = useRouter()

/**
 * 响应式数据定义
 */
const requirements = ref([])
const filteredRequirements = ref([])
const showAddModal = ref(false)
const showDetailDrawer = ref(false)
const currentRequirement = ref(null)
const selectedRequirement = ref(null)
const viewMode = ref('board') // 'board' | 'table'

/**
 * 筛选条件
 */
const filterStatus = ref('')
const filterPriority = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

/**
 * 需求状态选项
 */
const statusOptions = [
  { value: '待分析', label: '待分析', color: '#d9d9d9' },
  { value: '进行中', label: '进行中', color: '#1890ff' },
  { value: '已完成', label: '已完成', color: '#52c41a' },
  { value: '已暂停', label: '已暂停', color: '#faad14' }
]

/**
 * 计算有内容的状态选项（用于看板显示）
 */
const visibleStatusOptions = computed(() => {
  return statusOptions.filter(status => {
    const count = getRequirementsByStatus(status.value).length
    return count > 0
  })
})

/**
 * 表格列定义
 */
const tableColumns = [
  { 
    title: '需求标题', 
    dataIndex: 'title', 
    key: 'title',
    width: 200,
    ellipsis: true
  },
  { 
    title: '需求分类', 
    dataIndex: 'category', 
    key: 'category',
    width: 120
  },
  { 
    title: '优先级', 
    dataIndex: 'priority', 
    key: 'priority',
    width: 80
  },
  { 
    title: '状态', 
    dataIndex: 'status', 
    key: 'status',
    width: 100
  },
  { 
    title: '提出人', 
    dataIndex: 'proposer', 
    key: 'proposer',
    width: 100
  },
  { 
    title: '提出部门', 
    dataIndex: 'proposerDept', 
    key: 'proposerDept',
    width: 100
  },
  { 
    title: '提出时间', 
    dataIndex: 'createdAt', 
    key: 'createdAt',
    width: 120
  },
  { 
    title: '操作', 
    key: 'actions',
    width: 180,
    fixed: 'right'
  }
]

/**
 * 初始化数据
 */
function initData() {
  requirements.value = []

 


  
  filteredRequirements.value = [...requirements.value]
}

/**
 * 根据状态获取需求数量（基于筛选后的数据）
 */
function getStatusCount(status) {
  return filteredRequirements.value.filter(req => req.status === status).length
}

/**
 * 根据状态获取需求列表
 */
function getRequirementsByStatus(status) {
  return filteredRequirements.value.filter(req => req.status === status)
}

/**
 * 获取优先级颜色
 */
function getPriorityColor(priority) {
  const colors = { '高': 'red', '中': 'orange', '低': 'blue' }
  return colors[priority] || 'default'
}

/**
 * 获取状态颜色
 */
function getStatusColor(status) {
  const colors = {
    '待分析': 'default',
    '进行中': 'processing', 
    '已完成': 'success',
    '已暂停': 'warning'
  }
  return colors[status] || 'default'
}

/**
 * 筛选处理
 */
function handleFilter() {
  let filtered = [...requirements.value]
  
  if (filterStatus.value) {
    filtered = filtered.filter(req => req.status === filterStatus.value)
  }
  
  if (filterPriority.value) {
    filtered = filtered.filter(req => req.priority === filterPriority.value)
  }
  
  if (filterCategory.value) {
    filtered = filtered.filter(req => req.category === filterCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(req => 
      req.title.toLowerCase().includes(keyword) ||
      req.description.toLowerCase().includes(keyword)
    )
  }
  
  filteredRequirements.value = filtered
}

/**
 * 保存需求
 */
async function saveRequirement(requirementData) {
  try {
    if (currentRequirement.value) {
      // 编辑现有需求
      // 准备附件数据
      const requirementAttachments = []
      if (requirementData.attachments && requirementData.attachments.length > 0) {
        for (const file of requirementData.attachments) {
          if (file.originFileObj) {
            // 上传新文件
            console.log('开始上传文件:', file.name)
            const uploadResponse = await uploadTechnologicalFile(file.originFileObj, 'requirement')
            console.log('文件上传响应完整对象:', JSON.stringify(uploadResponse))

            // 根据实际响应格式获取URL
            let fileUrl = ''
            if (uploadResponse?.fileUrl) {
              fileUrl = uploadResponse.fileUrl
            } else if (uploadResponse?.data?.url) {
              fileUrl = uploadResponse.data.url
            } else if (uploadResponse?.data?.path) {
              fileUrl = uploadResponse.data.path
            } else if (uploadResponse?.url) {
              fileUrl = uploadResponse.url
            } else if (typeof uploadResponse === 'string') {
              fileUrl = uploadResponse
            }

            console.log('最终获取的文件URL:', fileUrl)

            // 准备附件数据
            const attachmentData = {
              requirementCode: currentRequirement.value.requirementCode, // 需求编码
              fileName: file.name,
              fileUrl: fileUrl,
              fileSize: file.size,
              fileType: file.name.split('.').pop(),//文件后缀名
              uploadTime: Date.now() // 使用时间戳格式
            }
            
            // 如果fileUrl为空，尝试构建一个默认URL
            if (!fileUrl) {
              console.warn('文件URL为空，尝试使用文件名构建默认URL')
              attachmentData.fileUrl = `/files/requirement/${Date.now()}_${file.name}`
            }
            requirementAttachments.push(attachmentData)
          } else if (file.fileUrl) {
            // 保留已有附件
            requirementAttachments.push(file)
          }
        }
      }
      
      // 准备更新数据
      const updateData = {
        id: currentRequirement.value.id,
        title: requirementData.title,
        categoryCode: requirementData.category,
        priority: requirementData.priority === '高' ? 0 : requirementData.priority === '中' ? 1 : 2, // 优先级(0:高,1:中,2:低)
        proposeDepartment: requirementData.proposerDept,
        description: requirementData.description,
        expectedResult: requirementData.expectedEffect,
        creatorName: requirementData.proposer,
        requirementAttachments: requirementAttachments
      }
      
      // 调用API更新需求
      await updateTechnologicalRequirementPool(updateData)
      
      // 调用getTechnologicalRequirementPoolPage获取最新数据
      console.log('正在获取最新需求池数据...')
      const pageResponse = await getTechnologicalRequirementPoolPage({
        pageNum: 1,
        pageSize: 10
      })
      console.log('获取的需求池数据:', pageResponse)

      // 更新页面数据
      if (pageResponse && pageResponse.list) {
        // 转换数据格式，将数字状态转换为字符串状态
        requirements.value = pageResponse.list.map(item => {
          // 状态映射：0-待分析，1-进行中，2-已完成，3-已暂停
          const statusMap = {
            0: '待分析',
            1: '进行中',
            2: '已完成',
            3: '已暂停'
          }
          
          // 优先级映射：0-高，1-中，2-低
          const priorityMap = {
            0: '高',
            1: '中',
            2: '低'
          }
          
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.categoryCode,
            priority: priorityMap[item.priority] || '中',
            status: statusMap[item.status] || '待分析',
            proposer: item.creatorName,
            proposerDept: item.proposeDepartment,
            createdAt: new Date(item.createTime).toISOString().split('T')[0],
            expectedEffect: item.expectedResult,
            attachments: item.requirementAttachments || []
          }
        })
        filteredRequirements.value = [...requirements.value]
        console.log('页面数据已更新，共', requirements.value.length, '条记录')
      } else {
        console.warn('获取需求池数据格式异常')
      }
      
      message.success('需求更新成功')
  } else {
    // 准备附件数据
    const requirementAttachments = []
    if (requirementData.attachments && requirementData.attachments.length > 0) {
      for (const file of requirementData.attachments) {
        if (file.originFileObj) {
          // 上传文件
          console.log('开始上传文件:', file.name)
          const uploadResponse = await uploadTechnologicalFile(file.originFileObj, 'requirement')
          console.log('文件上传响应完整对象:', JSON.stringify(uploadResponse))

          // 根据实际响应格式获取URL
          let fileUrl = ''
          if (uploadResponse?.fileUrl) {
            // 直接从响应对象中获取fileUrl
            fileUrl = uploadResponse.fileUrl
          } else if (uploadResponse?.data?.url) {
            fileUrl = uploadResponse.data.url
          } else if (uploadResponse?.data?.path) {
            fileUrl = uploadResponse.data.path
          } else if (uploadResponse?.url) {
            fileUrl = uploadResponse.url
          } else if (typeof uploadResponse === 'string') {
            fileUrl = uploadResponse
          }

          console.log('最终获取的文件URL:', fileUrl)

          // 准备附件数据
          const attachmentData = {
            fileName: file.name,
            fileUrl: fileUrl,
            fileSize: file.size,
            fileType: file.name.split('.').pop(),//文件后缀名
            uploadTime: Date.now() // 使用时间戳格式
          }
          console.log('附件数据准备完成:', attachmentData)

          // 如果fileUrl为空，尝试构建一个默认URL
          if (!fileUrl) {
            console.warn('文件URL为空，尝试使用文件名构建默认URL')
            // 这里可以根据实际情况构建URL，例如使用文件名和当前时间戳
            attachmentData.fileUrl = `/files/requirement/${Date.now()}_${file.name}`
            console.log('构建的默认URL:', attachmentData.fileUrl)
          }
          requirementAttachments.push(attachmentData)
        }
      }
    }

    // 准备创建需求的数据
    const requirementPoolData = {
      requirementCode: `REQ${String(requirements.value.length + 1).padStart(3, '0')}`,
      title: requirementData.title,
      categoryCode: requirementData.category,
      priority: requirementData.priority === '高' ? 0 : requirementData.priority === '中' ? 1 : 2,// 优先级(0:高,1:中,2:低)
      proposeDepartment: requirementData.proposerDept,
      description: requirementData.description,
      expectedResult: requirementData.expectedEffect,
      status: 0, // 需求状态(0:待分析,1:进行中,2:已完成,3:已暂停)
      creatorName: (useUserStore().getUser.nickname || '系统'),
      createTime: new Date().toISOString().split('T')[0],
      requirementAttachments: requirementAttachments // 直接将上传的文件列表放到这里
    }

    console.log('准备创建需求池，数据:', requirementPoolData)

    // 调用API创建需求池
    const response = await createTechnologicalRequirementPool(requirementPoolData)
    console.log('需求池创建响应:', response)

    // 调用getTechnologicalRequirementPoolPage获取最新数据
    console.log('正在获取最新需求池数据...')
    const pageResponse = await getTechnologicalRequirementPoolPage({
      pageNum: 1,
      pageSize: 10
    })
    console.log('获取的需求池数据:', pageResponse)

    // 更新页面数据
    if (pageResponse && pageResponse.list) {
      // 转换数据格式，将数字状态转换为字符串状态
      requirements.value = pageResponse.list.map(item => {
        // 状态映射：0-待分析，1-进行中，2-已完成，3-已暂停
        const statusMap = {
          0: '待分析',
          1: '进行中',
          2: '已完成',
          3: '已暂停'
        }
        
        // 优先级映射：0-高，1-中，2-低
        const priorityMap = {
          0: '高',
          1: '中',
          2: '低'
        }
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.categoryCode,
          priority: priorityMap[item.priority] || '中',
          status: statusMap[item.status] || '待分析',
          proposer: item.creatorName,
          proposerDept: item.proposeDepartment,
          createdAt: new Date(item.createTime).toISOString().split('T')[0],
          expectedEffect: item.expectedResult,
          attachments: item.requirementAttachments || []
        }
      })
      filteredRequirements.value = [...requirements.value]
      console.log('页面数据已更新，共', requirements.value.length, '条记录')
    } else {
      console.warn('获取需求池数据格式异常')
    }
    message.success('需求添加成功')
  }
  
  handleFilter()
  showAddModal.value = false
  currentRequirement.value = null
  } catch (error) {
    console.error('保存需求失败:', error)
    message.error('保存需求失败，请重试')
  }
}

/**
 * 编辑需求
 */
async function editRequirement(requirement) {
  try {
    console.log('编辑需求，需求数据:', requirement)
    
    // 复制需求基本信息
    currentRequirement.value = { ...requirement }
    
    // 获取附件列表
    console.log('正在获取附件列表，需求ID:', requirement.id)
    const attachmentResponse = await getTechnologicalRequirementPoolAttachmentPage({
      requirementId: requirement.id
    })
    
    console.log('获取到的附件响应:', attachmentResponse)
    
    // 处理附件数据
    if (attachmentResponse && attachmentResponse.list && attachmentResponse.list.length > 0) {
      console.log('处理附件数据，共', attachmentResponse.list.length, '个附件')
      
      // 转换为a-upload组件所需的格式
      currentRequirement.value.attachments = attachmentResponse.list.map(attachment => {
        console.log('处理附件:', attachment)
        
        return {
          uid: attachment.id || `file-${Date.now()}-${Math.random()}`, // 使用附件ID作为uid，如果没有则生成一个
          name: attachment.fileName || '未知文件',
          status: 'done', // 标记为已上传状态
          url: attachment.fileUrl || '',
          size: attachment.fileSize || 0,
          type: attachment.fileType || '',
          // 保留原始数据
          id: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileSize: attachment.fileSize,
          fileType: attachment.fileType,
          uploadTime: attachment.uploadTime
        }
      })
      
      console.log('转换后的附件数据:', currentRequirement.value.attachments)
    } else {
      console.log('未找到附件数据')
      currentRequirement.value.attachments = []
    }
    
    // 显示编辑模态框，同时关闭详情抽屉
    console.log('显示编辑模态框，关闭详情抽屉')
    showAddModal.value = true
    showDetailDrawer.value = false
  } catch (error) {
    console.error('获取需求附件失败:', error)
    message.error('获取需求附件失败')
    // 即使获取附件失败，也显示编辑模态框，同时关闭详情抽屉
    currentRequirement.value = { ...requirement }
    currentRequirement.value.attachments = []
    showAddModal.value = true
    showDetailDrawer.value = false
  }
}

/**
 * 删除需求
 */
async function deleteRequirement(requirement) {
  try {
    // 调用API删除需求
    await deleteTechnologicalRequirementPool({ id: requirement.id })
    
    // 从前端列表中删除需求
    const index = requirements.value.findIndex(req => req.id === requirement.id)
    requirements.value.splice(index, 1)
    handleFilter()
    message.success('需求删除成功')
  } catch (error) {
    console.error('删除需求失败:', error)
    message.error('删除需求失败，请重试')
  }
}

/**
 * 查看需求详情
 */
function viewRequirement(requirement) {
  selectedRequirement.value = requirement
  showDetailDrawer.value = true
}

/**
 * 复制需求
 */
function duplicateRequirement(requirement) {
  const duplicated = {
    ...requirement,
    id: `REQ${String(requirements.value.length + 1).padStart(3, '0')}`,
    title: `${requirement.title} (副本)`,
    status: '待分析',
    createdAt: new Date().toISOString().split('T')[0]
  }
  requirements.value.unshift(duplicated)
  handleFilter()
  message.success('需求复制成功')
}

/**
 * 更新需求状态
 */
async function updateRequirementStatus(requirementId, newStatus) {
  const requirement = requirements.value.find(req => req.id === requirementId)
  if (requirement) {
    try {
      // 状态映射：'待分析'->0, '进行中'->1, '已完成'->2, '已暂停'->3
      const statusMap = {
        '待分析': 0,
        '进行中': 1,
        '已完成': 2,
        '已暂停': 3
      }
      
      // 准备更新数据
      const updateData = {
        id: requirementId,
        status: statusMap[newStatus]
      }
      
      // 调用API更新需求状态
      await updateTechnologicalRequirementPool(updateData)
      
      // 更新本地数据
      requirement.status = newStatus
      handleFilter()
      message.success(`需求状态已更新为：${newStatus}`)
    } catch (error) {
      console.error('更新需求状态失败:', error)
      message.error('更新需求状态失败')
    }
  }
}

/**
 * 更新需求优先级
 */
async function updateRequirementPriority(requirementId, newPriority) {
  const requirement = requirements.value.find(req => req.id === requirementId)
  if (requirement) {
    try {
      // 优先级映射：'高'->0, '中'->1, '低'->2
      const priorityMap = {
        '高': 0,
        '中': 1,
        '低': 2
      }
      
      // 准备更新数据
      const updateData = {
        id: requirementId,
        priority: priorityMap[newPriority]
      }
      
      // 调用API更新需求优先级
      await updateTechnologicalRequirementPool(updateData)
      
      // 更新本地数据
      requirement.priority = newPriority
      handleFilter()
      message.success(`需求优先级已更新为：${newPriority}`)
    } catch (error) {
      console.error('更新需求优先级失败:', error)
      message.error('更新需求优先级失败')
    }
  }
}

/**
 * 开始评估
 */
function startResearch(requirement) {
  // v2.0版本：直接进行内部评估，不再跳转到实地调研页面
  updateRequirementStatus(requirement.id, '进行中')
  message.success('已开始内部评估，请完善评估信息')
}

/**
 * 导出需求
 */
function exportRequirements() {
  // 这里实现导出功能
  message.success('需求导出功能开发中...')
}

/**
 * 清除所有筛选条件
 */
function clearFilters() {
  filterStatus.value = ''
  filterPriority.value = ''
  filterCategory.value = ''
  searchKeyword.value = ''
  handleFilter()
}

/**
 * 通过 thQdMidPage 获取列表数据，然后使用 projectId 作为 id 调用 getTechnologicalProject 来获取 applicant 值
 */
async function getApplicantFromProject() {
  try {
    // 调用 thQdMidPage 获取列表数据
    const midPageData = await thQdMidPage({
      pageNo: 1,
      pageSize: 10
    })
    
    if (midPageData && midPageData.list && midPageData.list.length > 0) {
      // 获取第一个项目的 projectId
      const projectId = midPageData.list[0].projectId
      
      if (projectId) {
        // 使用 projectId 作为 id 调用 getTechnologicalProject
        const projectData = await getTechnologicalProject(projectId)
        
        if (projectData && projectData.applicant) {
          // 将获取到的 applicant 值设置为 useUserStore().getUser.nickname
          useUserStore().getUser.nickname = projectData.applicant
          console.log('已更新申请人姓名为:', projectData.applicant)
          return projectData.applicant
        }
      }
    }
    
    return useUserStore().getUser.nickname || '系统'
  } catch (error) {
    console.error('获取项目申请人失败:', error)
    return useUserStore().getUser.nickname || '系统'
  }
}

/**
 * 生命周期钩子
 */
onMounted(async () => {
  console.log('组件挂载，正在获取需求池数据...')
  try {
    const pageResponse = await getTechnologicalRequirementPoolPage({
      pageNum: 1,
      pageSize: 10
    })
    console.log('获取的需求池数据:', pageResponse)

    // 更新页面数据
    if (pageResponse && pageResponse.list) {
      // 转换数据格式，将数字状态转换为字符串状态
      requirements.value = pageResponse.list.map(item => {
        // 状态映射：0-待分析，1-进行中，2-已完成，3-已暂停
        const statusMap = {
          0: '待分析',
          1: '进行中',
          2: '已完成',
          3: '已暂停'
        }
        
        // 优先级映射：0-高，1-中，2-低
        const priorityMap = {
          0: '高',
          1: '中',
          2: '低'
        }
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.categoryCode,
          priority: priorityMap[item.priority] || '中',
          status: statusMap[item.status] || '待分析',
          proposer: item.creatorName,
          proposerDept: item.proposeDepartment,
          createdAt: new Date(item.createTime).toISOString().split('T')[0],
          expectedEffect: item.expectedResult,
          attachments: item.requirementAttachments || []
        }
      })
      
      filteredRequirements.value = [...requirements.value]
      console.log('页面数据已更新，共', requirements.value.length, '条记录')
      console.log('转换后的第一条数据:', requirements.value[0])
    } else {
      console.error('获取需求池数据格式异常')
      message.error('获取需求池数据格式异常')
    }
  } catch (error) {
    console.error('获取需求池数据失败:', error)
    message.error('获取需求池数据失败')
  }
})
</script>

<style scoped>
.requirements-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.page-desc {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  margin-bottom: 24px;
}

.status-stats {
  text-align: right;
}

.status-board {
  margin-bottom: 24px;
}

.status-columns-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.status-column-wrapper {
  flex: 1;
  min-width: 280px;
  max-width: 320px;
}

.status-column {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  min-height: 400px;
  border-top: 4px solid #d9d9d9;
  transition: all 0.3s ease;
  width: 100%;
}

.status-column.status-#d9d9d9 {
  border-top-color: #d9d9d9;
}

.status-column.status-#1890ff {
  border-top-color: #1890ff;
}

.status-column.status-#52c41a {
  border-top-color: #52c41a;
}

.status-column.status-#faad14 {
  border-top-color: #faad14;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.status-header h3 {
  margin: 0;
  color: #234fa2;
  font-size: 16px;
}

.requirement-cards {
  padding: 16px;
  max-height: 350px;
  overflow-y: auto;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  padding: 24px;
}

.empty-state {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  padding: 60px 24px;
  text-align: center;
}

/**
 * 响应式设计
 */
@media (max-width: 1200px) {
  .status-columns-container {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .status-column-wrapper {
    min-width: 250px;
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .requirements-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    align-self: stretch;
  }
  
  .status-columns-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-column-wrapper {
    min-width: 100%;
    max-width: 100%;
  }
  
  .status-column {
    min-height: 300px;
  }
  
  /* 小屏幕状态列布局：最多2列 */
  .status-board .ant-row .ant-col {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
  
  /* 如果只有1个状态，占满整行 */
  .status-board .ant-row .ant-col:only-child {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  overflow-x: hidden;
}
.total-count-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
}
.total-count-row .count-num {
  color: #234fa2;
  margin-left: 4px;
  font-weight: bold;
  margin-right: 0;
}
</style> 