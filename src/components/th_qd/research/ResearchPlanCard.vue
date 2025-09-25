<template>
  <div class="research-plan-card">
    <div class="card-header">
      <div class="card-title">{{ plan.title }}</div>
      <a-tag :color="getStatusColor(plan.status)">{{ plan.status }}</a-tag>
    </div>
    
    <div class="card-content">
      <p class="card-desc">{{ plan.description }}</p>
      
      <div class="requirement-brief" v-if="requirement">
        <LinkOutlined />
        <span class="requirement-title">{{ requirement.title || requirement.name }}</span>
        <a-tag :color="getPriorityColor(requirement.priority)">
          {{ requirement.priority ? requirement.priority + '优先级' : '' }}
        </a-tag>
        <span v-if="requirement.proposer" class="proposer">提出人：{{ requirement.proposer }}</span>
      </div>
      
      <div class="plan-info">
        <div class="info-row">
          <CalendarOutlined />
          <span>计划日期：{{ plan.planDate }}</span>
        </div>
        <div class="info-row">
          <ClockCircleOutlined />
          <span>预期工期：{{ plan.expectedDuration }}天</span>
        </div>
        <div class="info-row">
          <UserOutlined />
          <span>负责人：{{ plan.leader }}</span>
        </div>
        <div class="info-row">
          <TeamOutlined />
          <span>参与人员：{{ plan.participants?.join(', ') }}</span>
        </div>
      </div>
      
      <div class="locations" v-if="plan.locations && plan.locations.length">
        <div class="locations-label">调研地点：</div>
        <div class="location-tags">
          <a-tag v-for="location in plan.locations" :key="location" size="small">
            {{ location }}
          </a-tag>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="record-count">
        <FileTextOutlined />
        <span>{{ plan.records?.length || 0 }}条记录</span>
      </div>
      
      <a-dropdown>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="$emit('view-records', plan)">
              <EyeOutlined /> 查看记录
            </a-menu-item>
            <a-menu-item @click="$emit('add-record', plan)" v-if="plan.status === '进行中'">
              <PlusOutlined /> 添加记录
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="$emit('edit', plan)">
              <EditOutlined /> 编辑计划
            </a-menu-item>
            <a-menu-item @click="$emit('start', plan)" v-if="plan.status === '计划中'">
              <PlayCircleOutlined /> 开始调研
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="$emit('delete', plan)" style="color: #ff4d4f">
              <DeleteOutlined /> 删除计划
            </a-menu-item>
          </a-menu>
        </template>
        <a-button type="primary" size="small">
          操作 <DownOutlined />
        </a-button>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  LinkOutlined
} from '@ant-design/icons-vue'
import { computed } from 'vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  requirements: {
    type: Array,
    default: () => []
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits([
  'edit',
  'delete',
  'start',
  'view-records',
  'add-record'
])

const requirement = computed(() => props.requirements.find(r => r.id === props.plan.requirementId))

/**
 * 获取状态颜色
 */
function getStatusColor(status) {
  const colors = {
    '计划中': 'blue',
    '进行中': 'processing',
    '已完成': 'success',
    '已暂停': 'warning'
  }
  return colors[status] || 'default'
}

function getPriorityColor(priority) {
  const colors = { '高': 'red', '中': 'orange', '低': 'blue' }
  return colors[priority] || 'default'
}
</script>

<style scoped>
.research-plan-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.research-plan-card:hover {
  border-color: #234fa2;
  box-shadow: 0 4px 20px rgba(35,79,162,0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #234fa2;
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
}

.card-content {
  margin-bottom: 16px;
}

.card-desc {
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
  font-size: 14px;
}

.plan-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
}

.locations {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.locations-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.location-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.record-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {
  .research-plan-card {
    padding: 16px;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .info-row {
    font-size: 12px;
  }
}
</style> 