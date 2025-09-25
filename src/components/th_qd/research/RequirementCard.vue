<template>
  <div class="requirement-card" @click="$emit('view', requirement)">
    <div class="card-header">
      <div class="card-title">{{ requirement.title }}</div>
      <a-dropdown trigger="click" @click.stop>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="$emit('edit', requirement)">
              <EditOutlined /> 编辑
            </a-menu-item>
            <a-menu-item @click="$emit('start-research', requirement)">
              <SearchOutlined /> 开始调研
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="$emit('delete', requirement)" style="color: #ff4d4f">
              <DeleteOutlined /> 删除
            </a-menu-item>
          </a-menu>
        </template>
        <a-button type="text" size="small" @click.stop>
          <MoreOutlined />
        </a-button>
      </a-dropdown>
    </div>
    
    <div class="card-content">
      <p class="card-desc">{{ requirement.description }}</p>
      
      <div class="card-meta">
        <a-tag :color="getPriorityColor(requirement.priority)" size="small">
          {{ requirement.priority }}优先级
        </a-tag>
        <a-tag size="small">{{ requirement.category }}</a-tag>
      </div>
      
      <div class="card-info">
        <div class="info-item">
          <UserOutlined />
          <span>{{ requirement.proposer }}</span>
        </div>
        <div class="info-item">
          <CalendarOutlined />
          <span>{{ requirement.createdAt }}</span>
        </div>
      </div>
      
      <div class="card-effect" v-if="requirement.expectedEffect">
        <div class="effect-title">
          <BulbOutlined />
          <span>预期效果：</span>
        </div>
        <div class="effect-content">
          {{ requirement.expectedEffect }}
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="footer-main">
        <div class="status-actions">
          <a-select 
            :value="requirement.status" 
            size="small" 
            style="width: 100px"
            @change="handleStatusChange"
            @click.stop
          >
            <a-select-option value="待分析">待分析</a-select-option>
            <a-select-option value="进行中">进行中</a-select-option>
            <a-select-option value="已完成">已完成</a-select-option>
            <a-select-option value="已暂停">已暂停</a-select-option>
          </a-select>
          
          <a-select 
            :value="requirement.priority" 
            size="small" 
            style="width: 80px"
            @change="handlePriorityChange"
            @click.stop
          >
            <a-select-option value="高">高</a-select-option>
            <a-select-option value="中">中</a-select-option>
            <a-select-option value="低">低</a-select-option>
          </a-select>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  BulbOutlined
} from '@ant-design/icons-vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  requirement: {
    type: Object,
    required: true
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits([
  'edit',
  'delete', 
  'view',
  'start-research',
  'status-change',
  'priority-change'
])

/**
 * 获取优先级颜色
 */
function getPriorityColor(priority) {
  const colors = { '高': 'red', '中': 'orange', '低': 'blue' }
  return colors[priority] || 'default'
}

/**
 * 处理状态变更
 */
function handleStatusChange(newStatus) {
  emit('status-change', props.requirement.id, newStatus)
}

/**
 * 处理优先级变更
 */
function handlePriorityChange(newPriority) {
  emit('priority-change', props.requirement.id, newPriority)
}
</script>

<style scoped>
.requirement-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 4px rgba(35,79,162,0.04);
}

.requirement-card:hover {
  border-color: #234fa2;
  box-shadow: 0 4px 12px rgba(35,79,162,0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #234fa2;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.card-content {
  margin-bottom: 12px;
}

.card-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.card-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.card-effect {
  margin-bottom: 8px;
}

.effect-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1890ff;
  font-weight: 600;
  margin-bottom: 4px;
}

.effect-content {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  padding-left: 20px;
  text-align: justify;
}

.card-footer {
  display: block;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 12px;
}
.footer-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status-actions {
  display: flex;
  gap: 8px;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 0;
  width: 100%;
}
.tag-item {
  margin-bottom: 2px;
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {
  .requirement-card {
    padding: 12px;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .status-actions {
    justify-content: space-between;
  }
}
</style> 