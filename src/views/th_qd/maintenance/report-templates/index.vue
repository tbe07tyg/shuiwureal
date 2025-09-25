<template>
  <div class="rtpl-page app-container">
    <div class="hd">
      <div class="title">提报模板</div>
      <div class="ops">
        <a-button type="primary" @click="addTpl" :loading="loading">新增模板</a-button>
        <a-button @click="refreshTemplates" :loading="loading">
          <ReloadOutlined />
          刷新
        </a-button>
      </div>
    </div>
    
    <a-spin :spinning="loading">
      <a-table 
        :dataSource="templates" 
        :columns="cols" 
        rowKey="id" 
        :pagination="false"
        :scroll="{ x: 800 }"
      >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key==='name'">
            <a-input 
              v-model:value="record.templateName" 
              @blur="updateTemplate(record)"
              @press-enter="updateTemplate(record)"
            />
        </template>
        <template v-else-if="column.key==='requireAttachment'">
            <a-switch 
              v-model:checked="record.requireAttachment" 
              @change="updateTemplate(record)"
            />
        </template>
        <template v-else-if="column.key==='sections'">
          <div>
              <a-tag 
                v-for="(s,i) in record.templateConfig?.sections || []" 
                :key="i" 
                color="#2b4db8" 
                closable 
                @close.prevent="delSection(record,i)" 
                style="margin-bottom:4px"
              >
                {{ s.title }}<template v-if="s.required">（必填）</template>
              </a-tag>
            <div style="margin-top:6px">
                <a-input 
                  v-model:value="sec.title" 
                  placeholder="分段标题" 
                  style="width:220px" 
                />
              <a-checkbox v-model:checked="sec.required" style="margin:0 8px">必填</a-checkbox>
              <a-button size="small" @click="addSection(record)">添加</a-button>
            </div>
          </div>
        </template>
          <template v-else-if="column.key==='status'">
            <a-tag :color="record.templateStatus === 1 ? 'green' : 'red'">
              {{ record.templateStatusText || (record.templateStatus === 1 ? '启用' : '禁用') }}
            </a-tag>
        </template>
        <template v-else-if="column.key==='default'">
            <a-radio 
              :checked="record.isSystemDefault" 
              @click="setDefault(record.id)"
              :loading="defaultLoading === record.id"
            >
              默认
            </a-radio>
        </template>
        <template v-else-if="column.key==='actions'">
          <a-space>
              <a-button 
                size="small" 
                :type="record.templateStatus === 1 ? 'default' : 'primary'"
                @click="toggleStatus(record)"
                :loading="statusLoading === record.id"
              >
                {{ record.templateStatus === 1 ? '禁用' : '启用' }}
              </a-button>
              <a-button 
                size="small" 
                danger 
                @click="remove(record.id)"
                :loading="deleteLoading === record.id"
              >
                删除
              </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    </a-spin>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import {
  getReportTemplateList,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  setDefaultReportTemplate,
  enableReportTemplate,
  disableReportTemplate,
  convertToFrontendConfig,
  TemplateStatus,
  TemplateType
} from '@/api/th_qd/maintenance/report-template'


// 响应式数据
const templates = ref([])
const loading = ref(false)
// 移除本地同步逻辑
const defaultLoading = ref(null)
const statusLoading = ref(null)
const deleteLoading = ref(null)

// 表格列配置
const cols = [
  { title: '模板ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '模板编码', dataIndex: 'templateCode', key: 'templateCode', width: 120 },
  { title: '名称', dataIndex: 'templateName', key: 'name', width: 150 },
  { title: '需附件', key: 'requireAttachment', width: 80 },
  { title: '分段', key: 'sections', width: 420 },
  { title: '状态', key: 'status', width: 80 },
  { title: '默认', key: 'default', width: 80 },
  { title: '操作', key: 'actions', width: 120, fixed: 'right' }
]

// 分段编辑
const sec = reactive({ title: '', required: false })

// ========== 数据加载 ==========

/**
 * 加载模板列表
 */
const loadTemplates = async () => {
  try {
    loading.value = true
    const response = await getReportTemplateList()
    
    if (response.code === 0 && response.data) {
      // 兼容：后端 templateConfig 为字符串，前端渲染需要对象
      const list = (response.data || []).map((t) => {
        let cfg = t.templateConfig
        if (typeof cfg === 'string') {
          try { cfg = JSON.parse(cfg) } catch { cfg = { sections: [], requireAttachment: !!t.requireAttachment } }
        }
        return { ...t, templateConfig: cfg }
      })
      templates.value = list.sort((a, b) => (a.templateOrder || 0) - (b.templateOrder || 0))
      message.success(`加载成功，共 ${templates.value.length} 个模板`)
    } else {
      message.error(`加载失败：${response.msg}`)
      templates.value = []
    }
  } catch (error) {
    console.error('加载模板列表失败:', error)
    message.error('加载模板列表失败')
    templates.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 刷新模板列表
 */
const refreshTemplates = async () => {
  await loadTemplates()
}

// ========== 模板操作 ==========

/**
 * 新增模板
 */
const addTpl = async () => {
  try {
    loading.value = true
    const templateCode = `TPL_${Date.now()}`
    const templateName = `新模板-${templateCode.slice(-4)}`
    
    const createData = {
      templateCode,
      templateName,
      // 后端期望字符串
      templateConfig: JSON.stringify({
        title: templateName,
        sections: [],
        requireAttachment: false
      }),
      requireAttachment: false,
      templateType: 'task', // 与后端一致
      templateStatus: 1,
      isSystemDefault: false,
      templateOrder: templates.value.length
    }
    
    const response = await createReportTemplate(createData)
    // 兼容多种返回包装
    const ok = (
      response === true ||
      typeof response === 'number' ||
      response?.code === 0 ||
      response?.data === true ||
      typeof response?.data === 'number'
    )
    if (ok) {
      message.success('模板创建成功')
      await loadTemplates() // 重新加载列表
    } else {
      message.error(`创建失败：${response.msg}`)
    }
  } catch (error) {
    console.error('创建模板失败:', error)
    message.error('创建模板失败')
  } finally {
    loading.value = false
  }
}

/**
 * 更新模板
 */
const updateTemplate = async (record) => {
  try {
    // 统一：更新时将 templateConfig 转为字符串
    const cfgStr = typeof record.templateConfig === 'string'
      ? record.templateConfig
      : JSON.stringify(record.templateConfig || { sections: [], requireAttachment: !!record.requireAttachment })
    const updateData = {
      id: record.id,
      templateName: record.templateName,
      templateConfig: cfgStr,
      requireAttachment: record.requireAttachment,
      templateType: record.templateType || 'task'
    }
    
    const response = await updateReportTemplate(updateData)
    const ok = (
      response === true ||
      response?.code === 0 ||
      response?.data === true
    )
    if (ok) {
      message.success('模板更新成功')
    } else {
      message.error(`更新失败：${response.msg}`)
      await loadTemplates() // 重新加载以恢复数据
    }
  } catch (error) {
    console.error('更新模板失败:', error)
    message.error('更新模板失败')
    await loadTemplates()
  }
}

/**
 * 删除模板
 */
const remove = async (id) => {
  try {
    deleteLoading.value = id
    const response = await deleteReportTemplate(id)
    
    if (response.code === 0) {
      message.success('模板删除成功')
      await loadTemplates()
    } else {
      message.error(`删除失败：${response.msg}`)
    }
  } catch (error) {
    console.error('删除模板失败:', error)
    message.error('删除模板失败')
  } finally {
    deleteLoading.value = null
  }
}

/**
 * 设置默认模板
 */
const setDefault = async (id) => {
  try {
    defaultLoading.value = id
    const response = await setDefaultReportTemplate(id)
    const ok = (
      response === true ||
      response?.code === 0 ||
      response?.data === true
    )
    if (ok) {
      message.success('默认模板设置成功')
      // 本地就地更新，避免二次拉取
      templates.value = (templates.value || []).map(t => ({
        ...t,
        isSystemDefault: t.id === id
      }))
    } else {
      message.error(`设置失败：${response?.msg}`)
    }
  } catch (error) {
    console.error('设置默认模板失败:', error)
    message.error('设置默认模板失败')
  } finally {
    defaultLoading.value = null
  }
}

/**
 * 切换模板状态
 */
const toggleStatus = async (record) => {
  try {
    statusLoading.value = record.id
    const isEnabled = record.templateStatus === TemplateStatus.ENABLED
    
    const response = isEnabled 
      ? await disableReportTemplate(record.id)
      : await enableReportTemplate(record.id)
    const ok = (
      response === true ||
      response?.code === 0 ||
      response?.data === true
    )
    if (ok) {
      message.success(`模板${isEnabled ? '禁用' : '启用'}成功`)
      // 就地更新状态
      record.templateStatus = isEnabled ? TemplateStatus.DISABLED : TemplateStatus.ENABLED
    } else {
      message.error(`操作失败：${response?.msg}`)
    }
  } catch (error) {
    console.error('切换模板状态失败:', error)
    message.error('操作失败')
  } finally {
    statusLoading.value = null
  }
}

// ========== 分段操作 ==========

/**
 * 添加分段
 */
const addSection = async (record) => {
  if (!sec.title) {
    return message.warning('请输入分段标题')
  }
  
  // 确保 templateConfig 存在
  if (!record.templateConfig) {
    record.templateConfig = { sections: [] }
  }
  if (!record.templateConfig.sections) {
    record.templateConfig.sections = []
  }
  
  // 添加新分段
  record.templateConfig.sections.push({ 
    title: sec.title, 
    required: sec.required 
  })
  
  // 清空输入
  sec.title = ''
  sec.required = false
  
  // 更新到后端
  await updateTemplate(record)
}

/**
 * 删除分段
 */
const delSection = async (record, idx) => {
  if (record.templateConfig && record.templateConfig.sections) {
    record.templateConfig.sections.splice(idx, 1)
    await updateTemplate(record)
  }
}

// （已移除）

// ========== 生命周期 ==========

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.rtpl-page{background:#fff;border:1px solid #e6eaf2;border-radius:12px;padding:16px}
.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.title{font-weight:700;color:#234fa2}
</style>


