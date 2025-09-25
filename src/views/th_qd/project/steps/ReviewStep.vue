<template>
  <div class="review-step">
    <!-- 步骤说明 -->
    <a-alert
      message="立项审核"
      description="请审核项目申报材料，填写审核意见并做出审核决定。"
      type="info"
      show-icon
      style="margin-bottom: 24px;"
    />

    <div class="review-content">
      <!-- 项目基本信息预览 -->
      <div class="info-section">
        <h4 class="section-title">项目基本信息</h4>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="项目名称">{{ project.name }}</a-descriptions-item>
          <a-descriptions-item label="项目类型">{{ project.type }}</a-descriptions-item>
          <a-descriptions-item label="项目负责人">{{ project.leader }}</a-descriptions-item>
          <a-descriptions-item label="所属部门">{{ project.dept }}</a-descriptions-item>
          <a-descriptions-item label="计划开始时间">{{ project.start }}</a-descriptions-item>
          <a-descriptions-item label="计划结束时间">{{ project.end }}</a-descriptions-item>
          <a-descriptions-item label="申请预算" :span="2">{{ project.fund?.total }}万元</a-descriptions-item>
          <a-descriptions-item label="项目简介" :span="2">{{ project.desc }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 申报材料预览 -->
      <div class="materials-section">
        <h4 class="section-title">申报材料</h4>
        <a-list :data-source="project.docs" item-layout="horizontal">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <a @click="previewFile(item)">{{ item.name }}</a>
                </template>
                <template #description>
                  上传时间：2024-01-15 10:30
                </template>
              </a-list-item-meta>
              <template #actions>
                <a @click="downloadFile(item)">下载</a>
                <a @click="previewFile(item)">预览</a>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- 审核表单 -->
      <div class="review-form-section">
        <h4 class="section-title">审核意见</h4>
        <a-form 
          :model="reviewForm" 
          :rules="rules" 
          @finish="handleSubmit"
          ref="formRef"
          layout="horizontal"
        >
          <a-form-item label="审核结果" name="result">
            <a-radio-group v-model:value="reviewForm.result">
              <a-radio value="approved">通过</a-radio>
              <a-radio value="rejected">驳回</a-radio>
              <a-radio value="revision">需要修改</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <a-form-item label="审核意见" name="opinion">
            <a-textarea 
              v-model:value="reviewForm.opinion" 
              placeholder="请填写具体的审核意见..."
              :rows="4" 
              :maxlength="500"
              show-count
            />
          </a-form-item>
          
          <a-form-item 
            label="修改建议" 
            name="suggestions"
            v-if="reviewForm.result === 'revision' || reviewForm.result === 'rejected'"
          >
            <a-textarea 
              v-model:value="reviewForm.suggestions" 
              placeholder="请提出具体的修改建议..."
              :rows="3" 
              :maxlength="300"
              show-count
            />
          </a-form-item>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <a-space>
              <a-button @click="handleSaveDraft" :loading="draftLoading">
                保存草稿
              </a-button>
              <a-button type="primary" html-type="submit" :loading="submitLoading">
                提交审核结果
              </a-button>
            </a-space>
          </div>
        </a-form>
      </div>

      <!-- 审核历史 -->
      <div class="history-section">
        <h4 class="section-title">审核历史</h4>
        <a-timeline>
          <a-timeline-item 
            v-for="(record, index) in reviewHistory" 
            :key="index"
            :color="getTimelineColor(record.result)"
          >
            <template #dot>
              <CheckCircleOutlined v-if="record.result === 'approved'" style="color: #52c41a;" />
              <CloseCircleOutlined v-else-if="record.result === 'rejected'" style="color: #ff4d4f;" />
              <ExclamationCircleOutlined v-else style="color: #faad14;" />
            </template>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="reviewer">{{ record.reviewer }}</span>
                <span class="time">{{ record.time }}</span>
                <a-tag :color="getResultColor(record.result)">{{ getResultText(record.result) }}</a-tag>
              </div>
              <div class="timeline-opinion">{{ record.opinion }}</div>
              <div v-if="record.suggestions" class="timeline-suggestions">
                修改建议：{{ record.suggestions }}
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps({ 
  project: Object 
})

const emit = defineEmits(['submit'])

const formRef = ref()
const submitLoading = ref(false)
const draftLoading = ref(false)

/**
 * 审核表单数据
 */
const reviewForm = ref({
  result: '',
  opinion: '',
  suggestions: ''
})

/**
 * 表单验证规则
 */
const rules = {
  result: [{ required: true, message: '请选择审核结果' }],
  opinion: [{ required: true, message: '请填写审核意见' }],
  suggestions: [
    { 
      required: true, 
      message: '请提出修改建议',
      trigger: 'blur',
      validator: (rule, value) => {
        if ((reviewForm.value.result === 'revision' || reviewForm.value.result === 'rejected') && !value) {
          return Promise.reject('请提出修改建议')
        }
        return Promise.resolve()
      }
    }
  ]
}

/**
 * 审核历史记录（Mock数据）
 */
const reviewHistory = ref([
  {
    reviewer: '张三',
    time: '2024-01-10 14:30',
    result: 'revision',
    opinion: '项目方案总体可行，但预算部分需要进一步细化。',
    suggestions: '请补充详细的预算明细表，并说明各项费用的测算依据。'
  }
])

/**
 * 获取时间轴颜色
 */
function getTimelineColor(result) {
  switch (result) {
    case 'approved': return 'green'
    case 'rejected': return 'red'
    case 'revision': return 'orange'
    default: return 'blue'
  }
}

/**
 * 获取结果标签颜色
 */
function getResultColor(result) {
  switch (result) {
    case 'approved': return 'success'
    case 'rejected': return 'error'
    case 'revision': return 'warning'
    default: return 'default'
  }
}

/**
 * 获取结果文本
 */
function getResultText(result) {
  switch (result) {
    case 'approved': return '通过'
    case 'rejected': return '驳回'
    case 'revision': return '需要修改'
    default: return '未知'
  }
}

/**
 * 文件预览
 */
function previewFile(file) {
  message.info(`正在预览文件：${file.name}`)
  // 这里实现文件预览逻辑
}

/**
 * 文件下载
 */
function downloadFile(file) {
  message.info(`正在下载文件：${file.name}`)
  // 这里实现文件下载逻辑
}

/**
 * 保存草稿
 */
function handleSaveDraft() {
  draftLoading.value = true
  
  setTimeout(() => {
    draftLoading.value = false
    message.success('审核意见草稿已保存')
  }, 1000)
}

/**
 * 提交审核结果
 */
function handleSubmit() {
  submitLoading.value = true
  
  setTimeout(() => {
    submitLoading.value = false
    const resultText = getResultText(reviewForm.value.result)
    message.success(`审核结果已提交：${resultText}`)
    
    // 通知父组件提交完成
    emit('submit', {
      reviewData: reviewForm.value
    })
  }, 1500)
}
</script>

<style scoped>
.review-step {
  width: 100%;
  max-width: none;
}

.review-content > div {
  margin-bottom: 32px;
}

.info-section,
.materials-section,
.review-form-section,
.history-section {
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.section-title {
  margin: 0 0 16px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #234fa2;
  padding-bottom: 8px;
}

.form-actions {
  text-align: center;
  padding: 24px 0;
  border-top: 1px solid #f0f0f0;
}

.timeline-content {
  background: #fff;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.reviewer {
  font-weight: 600;
  color: #234fa2;
}

.time {
  color: #999;
  font-size: 12px;
}

.timeline-opinion {
  color: #333;
  margin-bottom: 4px;
}

.timeline-suggestions {
  color: #666;
  font-size: 12px;
  font-style: italic;
}

:deep(.ant-form-item-label) {
  width: 110px !important;
  min-width: 110px;
  text-align: right;
  padding-right: 8px;
  white-space: nowrap;
}

:deep(.ant-form-item-control) {
  flex: 1;
  max-width: none;
  margin-left: 0;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
}

:deep(.ant-form-item-control-input) {
  min-height: auto;
}
</style> 