<!--
 * @file 业务标签页内容组件
 * @description 展示特定业务环节的资料类目列表和相关操作
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-22
-->
<template>
  <div class="business-tab-content">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <a-button type="primary" @click="handleAdd">
          <PlusOutlined />
          添加新类目
        </a-button>
        <a-button @click="handleResetDefault">
          <ReloadOutlined />
          重置默认
        </a-button>
      </div>
      <div class="toolbar-right">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索类目名称"
          style="width: 200px"
          @search="handleSearch"
        />
      </div>
    </div>

    <!-- 类目列表表格 -->
    <div class="categories-table">
      <a-table
        :columns="columns"
        :data-source="filteredCategories"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'sortOrder'">
            <span class="sort-number">{{ record.sortOrder }}</span>
          </template>
          
          <template v-if="column.key === 'categoryName'">
            <div class="category-info">
              <div class="category-name">{{ record.categoryName }}</div>
            </div>
          </template>

          <template v-if="column.key === 'isRequired'">
            <a-tag :color="record.isRequired ? 'red' : 'default'" size="small">
              {{ record.isRequired ? '必填' : '选填' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'templateFile'">
            <div v-if="record.templateFileName" class="file-info">
              <span class="file-icon">
                <component :is="getFileIcon(record.templateFileName)" />
              </span>
              <span class="file-name">{{ record.templateFileName }}</span>
              <a-button 
                type="link" 
                size="small"
                @click="handlePreviewTemplate(record)"
              >
                预览
              </a-button>
              <a-button 
                type="link" 
                size="small"
                @click="handleDownloadTemplate(record)"
              >
                下载
              </a-button>
            </div>
            <span v-else class="no-template">无模板</span>
          </template>

          <template v-if="column.key === 'description'">
            <a-tooltip :title="record.description" placement="topLeft">
              <span class="description-text">
                {{ record.description || '-' }}
              </span>
            </a-tooltip>
          </template>

          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <a-button 
                type="primary" 
                size="small" 
                @click="handleEdit(record)"
              >
                编辑
              </a-button>
              <a-button 
                type="default" 
                size="small" 
                @click="handlePreview(record)"
              >
                预览
              </a-button>
              <a-button 
                type="primary" 
                danger
                size="small" 
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 拖拽排序提示 -->
    <div class="sort-hint">
      <InfoCircleOutlined />
      提示：可通过编辑类目修改显示顺序，或使用拖拽调整排序
    </div>

    <!-- 效果预览面板 -->
    <div class="preview-panel">
      <div class="preview-header">
        <h4>
          <EyeOutlined />
          效果预览：{{ getBusinessTypeName(businessType) }}页面资料提交区域
        </h4>
        <a-button type="link" size="small" @click="togglePreview">
          {{ showPreview ? '收起' : '展开' }}
        </a-button>
      </div>
      <div v-show="showPreview" class="preview-content">
        <div class="material-list">
          <div 
            v-for="item in sortedCategories" 
            :key="item.id"
            class="material-item"
          >
            <span class="material-label">
              <span v-if="item.isRequired" class="required-mark">*</span>
              {{ item.categoryName }}
            </span>
            <div class="material-actions">
              <a-button size="small" type="default">上传</a-button>
              <a-button 
                v-if="item.templateFileName" 
                size="small" 
                type="primary"
              >
                模板
              </a-button>
              <span v-else class="no-template-hint">无模板</span>
            </div>
          </div>
        </div>
        <div v-if="!categories.length" class="empty-preview">
          <a-empty 
            :image="require('@/assets/empty.svg')" 
            description="暂无配置类目，请先添加资料类目"
          />
        </div>
        <div v-else class="preview-note">
          <span class="required-mark">*</span> 为必填项 | 
          共 {{ categories.length }} 个类目，其中 {{ requiredCount }} 个必填项
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="bottom-actions">
      <div class="status-info">
        <span>当前配置：{{ getBusinessTypeName(businessType) }}</span>
        <span>| 共 {{ categories.length }} 个类目</span>
        <span>| 其中 {{ requiredCount }} 个必填项</span>
        <span>| 最后更新：{{ lastUpdateTime }}</span>
      </div>
      <div class="save-actions">
        <a-button @click="handlePreviewAll">
          <EyeOutlined />
          预览全部
        </a-button>
        <a-button type="primary" @click="handleSaveConfig">
          <SaveOutlined />
          保存配置
        </a-button>
        <a-button type="primary" @click="handleSyncApply">
          <SyncOutlined />
          同步应用
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { 
  PlusOutlined, ReloadOutlined, InfoCircleOutlined, EyeOutlined,
  SaveOutlined, SyncOutlined, FileTextOutlined, FileExcelOutlined,
  FilePdfOutlined, FileOutlined
} from '@ant-design/icons-vue'

export default {
  name: 'BusinessTabContent',
  components: {
    PlusOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    EyeOutlined,
    SaveOutlined,
    SyncOutlined,
    FileTextOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileOutlined
  },
  props: {
    businessType: {
      type: String,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['add', 'edit', 'delete', 'preview'],
  setup(props, { emit }) {
    // 响应式数据
    const searchKeyword = ref('')
    const showPreview = ref(true)
    const lastUpdateTime = ref(new Date().toLocaleString('zh-CN'))

    // 表格列配置
    const columns = [
      {
        title: '序号',
        dataIndex: 'sortOrder',
        key: 'sortOrder',
        width: 80,
        align: 'center'
      },
      {
        title: '类目名称',
        dataIndex: 'categoryName',
        key: 'categoryName',
        width: 200
      },
      {
        title: '必填项',
        dataIndex: 'isRequired',
        key: 'isRequired',
        width: 100,
        align: 'center'
      },
      {
        title: '模板文件',
        dataIndex: 'templateFile',
        key: 'templateFile',
        width: 250
      },
      {
        title: '描述说明',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        align: 'center'
      }
    ]

    // 计算属性
    const filteredCategories = computed(() => {
      if (!searchKeyword.value) {
        return props.categories
      }
      return props.categories.filter(item => 
        item.categoryName.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    })

    const sortedCategories = computed(() => {
      return [...props.categories].sort((a, b) => a.sortOrder - b.sortOrder)
    })

    const requiredCount = computed(() => {
      return props.categories.filter(item => item.isRequired).length
    })

    // 方法定义
    const getBusinessTypeName = (type) => {
      const typeMap = {
        apply: '立项申请',
        opening: '项目开题',
        midterm: '项目中期',
        acceptance: '项目验收'
      }
      return typeMap[type] || '未知'
    }

    const getFileIcon = (filename) => {
      if (!filename) return FileOutlined
      const ext = filename.split('.').pop().toLowerCase()
      const iconMap = {
        doc: FileTextOutlined,
        docx: FileTextOutlined,
        xls: FileExcelOutlined,
        xlsx: FileExcelOutlined,
        pdf: FilePdfOutlined,
        txt: FileTextOutlined
      }
      return iconMap[ext] || FileOutlined
    }

    const handleAdd = () => {
      emit('add')
    }

    const handleEdit = (record) => {
      emit('edit', record)
    }

    const handleDelete = (record) => {
      emit('delete', record)
    }

    const handlePreview = (record) => {
      emit('preview', record)
    }

    const handleSearch = () => {
      // 搜索逻辑已在计算属性中处理
    }

    const handleResetDefault = () => {
      Modal.confirm({
        title: '确认重置',
        content: '确定要重置为默认配置吗？当前配置将被清空！',
        okText: '确定',
        cancelText: '取消',
        okType: 'danger',
        onOk() {
          message.success('重置成功')
          updateLastModifyTime()
        }
      })
    }

    const handlePreviewTemplate = (record) => {
      message.info(`预览模板：${record.templateFileName}`)
    }

    const handleDownloadTemplate = (record) => {
      message.info(`下载模板：${record.templateFileName}`)
    }

    const togglePreview = () => {
      showPreview.value = !showPreview.value
    }

    const handlePreviewAll = () => {
      message.info(`预览${getBusinessTypeName(props.businessType)}页面整体效果`)
    }

    const handleSaveConfig = () => {
      message.success('配置保存成功')
      updateLastModifyTime()
    }

    const handleSyncApply = () => {
      message.loading('正在同步配置到业务页面...', 1)
      setTimeout(() => {
        message.success('配置同步成功')
        updateLastModifyTime()
      }, 1000)
    }

    const updateLastModifyTime = () => {
      lastUpdateTime.value = new Date().toLocaleString('zh-CN')
    }

    // 监听数据变化
    watch(() => props.categories, () => {
      updateLastModifyTime()
    }, { deep: true })

    return {
      // 响应式数据
      searchKeyword,
      showPreview,
      lastUpdateTime,
      columns,
      
      // 计算属性
      filteredCategories,
      sortedCategories,
      requiredCount,
      
      // 方法
      getBusinessTypeName,
      getFileIcon,
      handleAdd,
      handleEdit,
      handleDelete,
      handlePreview,
      handleSearch,
      handleResetDefault,
      handlePreviewTemplate,
      handleDownloadTemplate,
      togglePreview,
      handlePreviewAll,
      handleSaveConfig,
      handleSyncApply
    }
  }
}
</script>

<style scoped>
.business-tab-content {
  padding: 16px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.categories-table {
  margin-bottom: 16px;
}

.sort-number {
  font-weight: 500;
  color: #1890ff;
}

.category-info {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-weight: 500;
  color: #262626;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #1890ff;
  font-size: 16px;
}

.file-name {
  color: #333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-template {
  color: #999;
  font-style: italic;
}

.description-text {
  display: block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.sort-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0f9ff;
  border: 1px solid #d4edda;
  border-radius: 4px;
  color: #666;
  font-size: 12px;
  margin-bottom: 16px;
}

.preview-panel {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  margin-bottom: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.preview-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
}

.preview-content {
  padding: 16px;
  background: #fff;
  border-radius: 0 0 6px 6px;
}

.material-list {
  margin-bottom: 12px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.material-item:last-child {
  border-bottom: none;
}

.material-label {
  font-size: 14px;
  color: #333;
}

.required-mark {
  color: #ff4d4f;
  margin-right: 4px;
  font-weight: bold;
}

.material-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-template-hint {
  font-size: 12px;
  color: #999;
}

.empty-preview {
  text-align: center;
  padding: 40px 0;
}

.preview-note {
  font-size: 12px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.status-info {
  color: #666;
  font-size: 14px;
}

.save-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }

  .bottom-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .save-actions {
    justify-content: center;
  }
}
</style> 