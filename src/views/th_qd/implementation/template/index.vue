<template>
  <div class="template-center-page">
    <div class="page-header">
      <h1 class="page-title">节点模板库</h1>
      <a-button type="primary" @click="openEdit()">新建模板</a-button>
    </div>
    <a-card>
      <a-table :columns="columns" :data-source="templateList" rowKey="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-button type="link" @click="applyTemplate(record)">应用到项目</a-button>
              <a-button type="link" danger @click="deleteTemplate(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    <template v-if="showEdit">
      <a-modal v-model:open="showEdit" :title="editId ? '编辑模板' : '新建模板'" @ok="saveTemplate">
        <a-form :model="form" layout="vertical">
          <a-form-item label="模板名称" required>
            <a-input v-model:value="form.name" />
          </a-form-item>
          <a-form-item label="节点配置">
            <div v-for="(node, index) in form.nodes" :key="node.id" class="template-node-item">
              <a-input v-model:value="node.name" placeholder="节点名称" style="width: 120px; margin-right:8px;" />
              <a-input-number v-model:value="node.percent" :min="0" :max="100" style="width: 80px; margin-right:8px;" />
              <a-input v-model:value="node.condition" placeholder="条件说明" style="width: 180px; margin-right:8px;" />
              <a-date-picker 
                v-model:value="node.deadline" 
                placeholder="截止日期" 
                style="width: 140px; margin-right:8px;"
                :disabledDate="current => current && current < dayjs().startOf('day')"
              />
              <a-upload
                v-model:file-list="node.attachments"
                :before-upload="() => false"
                :max-count="3"
                style="width: 120px; margin-right:8px;"
              >
                <a-button type="link" size="small">
                  {{ node.attachments?.length ? `已上传${node.attachments.length}个文件` : '上传附件' }}
                </a-button>
              </a-upload>
              <a-button type="link" danger size="small" @click="removeNode(index)">移除</a-button>
            </div>
            <a-button type="dashed" @click="addNode" style="margin-top:12px;">添加节点</a-button>
          </a-form-item>
        </a-form>
      </a-modal>
    </template>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useNodeTemplateStore } from '@/store/nodeTemplate'

const nodeTemplateStore = useNodeTemplateStore()
const templateList = nodeTemplateStore.templateList

const columns = [
  { title: '模板名称', dataIndex: 'name', key: 'name' },
  { title: '节点数', key: 'count', customRender: ({ record }) => record.nodes.length },
  { title: '操作', key: 'actions' }
]
const showEdit = ref(false)
const editId = ref(null)
const form = ref({ name: '', nodes: [] })
function openEdit(record) {
  if (record) {
    editId.value = record.id
    form.value = { name: record.name, nodes: record.nodes.map(n => ({ ...n })) }
  } else {
    editId.value = null
    form.value = { name: '', nodes: [] }
  }
  showEdit.value = true
}
function saveTemplate() {
  if (!form.value.name) {
    message.error('请输入模板名称')
    return
  }
  if (!form.value.nodes.length) {
    message.error('请添加至少一个节点')
    return
  }
  if (editId.value) {
    nodeTemplateStore.updateTemplate(editId.value, { name: form.value.name, nodes: form.value.nodes.map(n => ({ ...n })) })
  } else {
    nodeTemplateStore.addTemplate({ name: form.value.name, nodes: form.value.nodes.map(n => ({ ...n })) })
  }
  showEdit.value = false
}
function deleteTemplate(record) {
  nodeTemplateStore.deleteTemplate(record.id)
}
function addNode() {
  form.value.nodes.push({ 
    id: Math.random().toString(36).slice(2, 10), 
    name: '', 
    percent: 0, 
    condition: '',
    deadline: null,
    attachments: []
  })
}
function removeNode(index) {
  form.value.nodes.splice(index, 1)
}
function applyTemplate(record) {
  message.success(`模板"${record.name}"已应用到项目（示例）`)
}
</script>
<style scoped>
.template-center-page { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 22px; color: #234fa2; }
.node-item { display: flex; align-items: center; margin-bottom: 8px; background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 8px 12px; box-shadow: 0 1px 4px #234fa208; }
.drag-handle { cursor: move; margin-right: 8px; color: #aaa; }
.template-node-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 8px;
}
</style> 