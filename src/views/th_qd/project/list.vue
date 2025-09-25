<template>
  <PageContainer title="项目列表" description="查看和管理所有项目，支持筛选、排序和批量操作">
    <!-- 操作按钮区域 -->
    <template #actions>
      <a-button type="primary" @click="onCreate">新建项目</a-button>
      <a-button :disabled="!selectedRowKeys.length" @click="onBatchArchive">批量归档</a-button>
      <a-button @click="onExport">导出Excel</a-button>
    </template>
    
      <!-- 筛选区 -->
      <a-card class="filter-card">
        <a-form layout="inline" class="project-list-filter" @submit.prevent="onSearch">
          <a-form-item label="项目名称">
            <a-input v-model="query.name" placeholder="输入项目名称" allow-clear />
          </a-form-item>
          <a-form-item label="负责人">
            <a-select v-model="query.leader" :options="leaderOptions" allow-clear show-search style="width: 140px" />
          </a-form-item>
          <a-form-item label="部门">
            <a-select v-model="query.dept" :options="deptOptions" allow-clear style="width: 140px" />
          </a-form-item>
          <a-form-item label="类型">
            <a-select v-model="query.type" :options="typeOptions" allow-clear style="width: 120px" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model="query.status" :options="statusOptions" allow-clear style="width: 120px" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">查询</a-button>
            <a-button @click="onReset" style="margin-left:8px;">重置</a-button>
          </a-form-item>
        </a-form>
      </a-card>
      
      <!-- 表格区 -->
      <a-card class="table-card">
        <a-table
          rowKey="id"
          :columns="columns"
          :dataSource="data"
          :rowSelection="{ selectedRowKeys, onChange: onSelectChange }"
          :pagination="pagination"
          bordered
          size="middle"
        >
          <template #progress="{ record }">
            <a-progress :percent="record.progress" size="small" />
          </template>
          <template #status="{ record }">
            <a-tag :color="statusColorMap[record.status]">{{ statusLabelMap[record.status] }}</a-tag>
          </template>
          <template #action="{ record }">
            <a-button type="link" @click="onDetail(record)">详情</a-button>
            <a-button type="link" @click="onEdit(record)" v-if="record.status==='在研'">编辑</a-button>
            <a-button type="link" @click="onArchive(record)" v-if="record.status==='结题'">归档</a-button>
          </template>
        </a-table>
      </a-card>
  </PageContainer>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components/th_qd/PageContainer.vue'

/**
 * @description 项目列表页逻辑与数据
 */
const query = ref({ name: '', leader: '', dept: '', type: '', status: '' })
const leaderOptions = [ { label: '张三', value: '张三' }, { label: '李四', value: '李四' } ]
const deptOptions = [ { label: '技术部', value: '技术部' }, { label: '管理部', value: '管理部' } ]
const typeOptions = [ { label: '纵向', value: '纵向' }, { label: '横向', value: '横向' }, { label: '自筹', value: '自筹' } ]
const statusOptions = [ { label: '立项', value: '立项' }, { label: '在研', value: '在研' }, { label: '结题', value: '结题' }, { label: '归档', value: '归档' } ]
const statusColorMap = { '立项': 'blue', '在研': 'processing', '结题': 'orange', '归档': 'default' }
const statusLabelMap = { '立项': '立项', '在研': '在研', '结题': '结题', '归档': '归档' }
const selectedRowKeys = ref([])
const data = ref([
  { id: 1, code: 'XM2024001', name: '智慧水务平台', leader: '张三', dept: '技术部', type: '纵向', status: '立项', progress: 10, start: '2024-06-01' },
  { id: 2, code: 'XM2024002', name: '水质监测系统', leader: '李四', dept: '管理部', type: '横向', status: '在研', progress: 60, start: '2024-01-01' },
  { id: 3, code: 'XM2024003', name: '智能调度平台', leader: '王五', dept: '技术部', type: '自筹', status: '结题', progress: 100, start: '2023-03-15' },
  { id: 4, code: 'XM2024004', name: '设备运维系统', leader: '赵六', dept: '管理部', type: '纵向', status: '归档', progress: 100, start: '2022-11-20' }
])
const columns = [
  { title: '项目编号', dataIndex: 'code', key: 'code', width: 120 },
  { title: '项目名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '负责人', dataIndex: 'leader', key: 'leader', width: 100 },
  { title: '部门', dataIndex: 'dept', key: 'dept', width: 100 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90, slots: { customRender: 'status' } },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 120, slots: { customRender: 'progress' } },
  { title: '立项时间', dataIndex: 'start', key: 'start', width: 120 },
  { title: '操作', key: 'action', width: 180, slots: { customRender: 'action' } }
]
const pagination = ref({ current: 1, pageSize: 10, total: 2 })
const router = useRouter()
function onCreate() { 
  // 跳转到项目创建页面
  router.push('/project/create')
}
function onBatchArchive() { /* 批量归档逻辑 */ }
function onExport() { /* 导出Excel逻辑 */ }
function onSearch() { /* 查询逻辑 */ }
function onReset() { query.value = { name: '', leader: '', dept: '', type: '', status: '' } }
function onSelectChange(keys) { selectedRowKeys.value = keys }
function onDetail(record) { 
  // 跳转到详情页，带上项目id
  router.push(`/project/detail/${record.id}`)
}
function onEdit(record) { /* 编辑逻辑 */ }
function onArchive(record) { /* 归档逻辑 */ }
</script>
<style scoped>
/**
 * 所有页面默认样式已由PageContainer提供
 */
.filter-card {
  margin-bottom: 16px;
}

.project-list-filter {
  margin-bottom: 0;
}
</style> 