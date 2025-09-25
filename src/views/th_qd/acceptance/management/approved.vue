<template>
  <PageContainer title="已立项的项目" description="展示所有已通过立项审批的项目，支持过会结果导入智能解析">
    <!-- 已立项项目清单表格 -->
    <a-card class="list-section">
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span>已立项项目清单</span>
          <a-input
            v-model:value="searchText"
            placeholder="搜索项目名称/申请人/申请单位"
            allow-clear
            style="width: 260px; margin-left: 16px;"
          />
        </div>
      </template>
      <a-table :columns="columns" :data-source="filteredList" rowKey="id" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-button type="link" @click="() => handleImport(record)">导入过会资料并智能解析</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </PageContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AuditOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useApprovalStore } from '@/store/approval'
import { ContentWrap } from '@/components/ContentWrap'

const approvalStore = useApprovalStore()

// 只展示已通过的项目
const passedList = computed(() => approvalStore.approvalList.filter(item => item.status === '通过'))

const searchText = ref('')
const filteredList = computed(() => {
  if (!searchText.value) return passedList.value
  const text = searchText.value.trim().toLowerCase()
  return passedList.value.filter(item =>
    (item.title && item.title.toLowerCase().includes(text)) ||
    (item.applicant && item.applicant.toLowerCase().includes(text)) ||
    (item.department && item.department.toLowerCase().includes(text))
  )
})

const columns = [
  { title: '年度', dataIndex: 'year', key: 'year' },
  { title: '立项名称', dataIndex: 'title', key: 'title' },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
  { title: '申请单位', dataIndex: 'department', key: 'department' },
  { title: '项目周期(月)', dataIndex: 'duration', key: 'duration' },
  { title: '预算(万元)', dataIndex: 'budget', key: 'budget' },
  { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime' },
  { title: '操作', key: 'actions' }
]

function handleImport(record) {
  message.info('导入国会资料并智能解析功能开发中...')
}
</script>

<style scoped>
/**
 * 所有页面默认样式已由PageContainer提供
 */
.list-section {
  margin-top: 24px;
}
</style> 