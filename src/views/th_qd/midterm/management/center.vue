<!--
 * @file 中期管理中心页面 - 管理角色
 * @description 管理角色的中期管理中心，专注于材料审核与中期会议管理决策
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="acceptance-management-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <AppstoreOutlined />
          </span>
          中期管理中心
        </h1>
        <p class="page-description"> 审核中期材料，组织中期会议，管理中期流程 </p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleBatchReview">
          <AuditOutlined />
          批量审核
        </a-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <!-- 使用Flexbox布局替代Ant Design的栅格系统 -->
      <div class="stats-flex-container">
        <div class="stat-card pending" @click="handleStatCardClick('material_reviewing')">
          <div class="stat-icon">
            <FileTextOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.materialReviewing }}</div>
            <div class="stat-label">材料审核中</div>
          </div>
        </div>
        <div class="stat-card material-rejected" @click="handleStatCardClick('material_rejected')">
          <div class="stat-icon">
            <ExclamationCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.materialRejected }}</div>
            <div class="stat-label">材料审核未通过</div>
          </div>
        </div>
        <div class="stat-card reviewing" @click="handleStatCardClick('meeting_preparing')">
          <div class="stat-icon">
            <CalendarOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.meetingPreparing }}</div>
            <div class="stat-label">会议待组织</div>
          </div>
        </div>
        <div class="stat-card scheduled" @click="handleStatCardClick('meeting_scheduled')">
          <div class="stat-icon">
            <ClockCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.meetingScheduled }}</div>
            <div class="stat-label">会议已安排</div>
          </div>
        </div>
        <div class="stat-card completed" @click="handleStatCardClick('midterm_passed')">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.midtermPassed }}</div>
            <div class="stat-label">中期通过</div>
          </div>
        </div>
        <div class="stat-card conditional" @click="handleStatCardClick('midterm_conditional')">
          <div class="stat-icon">
            <BulbOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.midtermConditional }}</div>
            <div class="stat-label">有条件通过</div>
          </div>
        </div>
        <div class="stat-card rejected" @click="handleStatCardClick('midterm_failed')">
          <div class="stat-icon">
            <CloseCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.midtermFailed }}</div>
            <div class="stat-label">中期未通过</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 验收流程说明 -->
    <div class="content-card flow-description">
      <div class="card-header">
        <h3>
          <BulbOutlined />
          验收流程说明
        </h3>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </div>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="申请提交" description="申报单位提交验收申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                审核中期材料，决定通过或驳回
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                  <a-tag color="red" size="small">材料审核未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                安排验收会议并组织专家评审
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="结论录入" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果录入最终中期结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">验收通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">验收未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </div>

    <!-- 项目审核管理区域 - 全宽对齐统计区域 -->
    <div class="content-card">
      <div class="card-header">
        <h3>
          <UnorderedListOutlined />
          项目审核管理
        </h3>
        <div class="header-filters">
          <a-select
            v-model:value="filters.status"
            placeholder="筛选状态"
            style="width: 150px"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="material_reviewing">材料审核中</a-select-option>
            <a-select-option value="material_rejected">材料审核未通过</a-select-option>
            <a-select-option value="improvement_reviewing">整改审核中</a-select-option>
            <a-select-option value="meeting_preparing">会议待组织</a-select-option>
            <a-select-option value="meeting_scheduled">会议已安排</a-select-option>
            <a-select-option value="midterm_passed">中期通过</a-select-option>
            <a-select-option value="midterm_conditional">有条件通过</a-select-option>
            <a-select-option value="midterm_failed">中期未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </div>
      <div class="project-review-list">
        <a-table
          :columns="reviewColumns"
          :data-source="filteredProjects"
          :pagination="pagination"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'projectName'">
              <div class="project-info">
                <div class="project-name">项目名称：{{ record.name }}</div>
                <div class="project-code">项目编号：{{ record.code }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'materialStatus'">
              <a-tag :color="getMaterialStatusColor(record.materialStatus)">
                {{ getMaterialStatusText(record.materialStatus) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'meetingStatus'">
              <a-tag :color="getMeetingStatusColor(record.meetingStatus)">
                {{ getMeetingStatusText(record.meetingStatus) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'finalResult'">
              <a-tag v-if="record.finalResult" :color="getResultColor(record.finalResult)">
                {{ getResultText(record.finalResult) }}
              </a-tag>
              <span v-else class="text-muted">待定</span>
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <!-- 材料审核中 - 可以审核材料 -->
                <a-button
                  v-if="record.currentStatus === 'material_reviewing' && record.materialStatus !== 'rejected'"
                  type="primary"
                  size="small"
                  @click="handleReviewMaterial(record)"
                >
                  审核材料
                </a-button>

                <!-- 会议待组织 - 可以组织会议 -->
                <a-button
                  v-if="record.currentStatus === 'meeting_preparing'"
                  type="primary"
                  size="small"
                  @click="handleScheduleMeeting(record)"
                >
                  组织会议
                </a-button>

                <!-- 设置报告会时间 - 材料审核通过后可设置 -->
                <!-- <a-button
                  v-if="record.currentStatus === 'meeting_preparing' && !record.meetingScheduled"
                  type="default"
                  size="small"
                  @click="handleSetMeetingTime(record)"
                >
                  <CalendarOutlined /> 设置时间
                </a-button> -->

                <!-- 会议待召开 - 可以录入结论 -->
                <a-button
                  v-if="record.currentStatus === 'meeting_scheduled'"
                  type="primary"
                  size="small"
                  @click="handleInputResult(record)"
                >
                  录入结论
                </a-button>

                <!-- 有条件通过 - 可以审核整改材料 -->
                <a-button
                  v-if="record.currentStatus === 'acceptance_conditional'"
                  type="primary"
                  size="small"
                  @click="handleReviewImprovement(record)"
                >
                  审核整改材料
                </a-button>

                <!-- 整改审核中 - 可以审核整改材料 -->
                <a-button
                  v-if="record.currentStatus === 'improvement_reviewing'"
                  type="primary"
                  size="small"
                  @click="handleReviewImprovement(record)"
                >
                  审核整改材料
                </a-button>

                <!-- 验收未通过 - 可以重新审核 -->
                <a-button
                  v-if="record.currentStatus === 'acceptance_failed'"
                  type="default"
                  size="small"
                  @click="handleReReview(record)"
                >
                  重新审核
                </a-button>

                <!-- 通用操作 - 查看详情 -->
                <a-button type="link" size="small" @click="handleViewDetail(record)">
                  查看详情
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 材料审核弹窗 -->
    <a-modal
      v-model:open="reviewModalVisible"
      title="材料审核"
      width="800px"
      :closable="false"
      :footer="null"
    >
      <div v-if="selectedProject" class="review-modal">
        <div class="project-basic-info">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name}}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="material-review-section">
          <div class="section-header">
            <h4>材料审核</h4>
            <div class="batch-actions">
              <a-space>
                <a-button
                  type="primary"
                  size="small"
                  @click="approveAllMaterials"
                  :disabled="!selectedProject.materials?.length"
                >
                  🚀 一键通过全部
                </a-button>
                <a-button
                  danger
                  size="small"
                  @click="rejectAllMaterials"
                  :disabled="!selectedProject.materials?.length"
                >
                  🚫 一键驳回全部
                </a-button>
              </a-space>
            </div>
          </div>

          <div class="material-list">
            <div
              v-for="material in selectedProject.materials"
              :key="material.id"
              class="material-item"
            >
              <div class="material-info">

                <div class="material-name">{{ material.materialName || '未命名文件' }}{{ material.fileSuffix ? '.' + material.fileSuffix : '' }}</div>
                <!-- <div class="material-type">{{ material.materialType }}</div> -->
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(material)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(material)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
              <div class="material-review-controls">
                <!-- 审核状态显示 -->
                <div class="review-status-display">
                  <div
                    class="status-option"
                    :class="{
                      'status-active': material.reviewStatus === 'approved',
                      'status-approved': material.reviewStatus === 'approved'
                    }"
                    @click="approveMaterial(material)"
                  >
                    <div class="status-icon">
                      {{ material.reviewStatus === 'approved' ? '✅' : '⚪' }}
                    </div>
                    <div class="status-text">通过</div>
                  </div>

                  <div
                    class="status-option"
                    :class="{
                      'status-active': material.reviewStatus === 'rejected',
                      'status-rejected': material.reviewStatus === 'rejected'
                    }"
                    @click="rejectMaterial(material)"
                  >
                    <div class="status-icon">
                      {{ material.reviewStatus === 'rejected' ? '❌' : '⚪' }}
                    </div>
                    <div class="status-text">驳回</div>
                  </div>

                  <div
                    class="status-option"
                    :class="{
                      'status-active':
                        !material.reviewStatus || material.reviewStatus === 'pending',
                      'status-pending':
                        !material.reviewStatus || material.reviewStatus === 'pending'
                    }"
                  >
                    <div class="status-icon">
                      {{
                        !material.reviewStatus || material.reviewStatus === 'pending' ? '⏳' : '⚪'
                      }}
                    </div>
                    <div class="status-text">待审</div>
                  </div>
                </div>

                <!-- 编辑意见按钮 -->
                <div v-if="material.rejectionReason" class="edit-opinion-btn">
                  <a-button size="small" type="dashed" @click="editRejectionReason(material)">
                    📝 编辑意见
                  </a-button>
                </div>
              </div>
              <!-- 驳回意见显示 -->
              <div v-if="material.rejectionReason" class="rejection-reason">
                <div class="reason-label">驳回意见：</div>
                <div class="reason-content">
                  <div class="reason-text" :class="{ 'reason-expanded': material.showFullReason }">
                    {{ material.rejectionReason }}
                  </div>
                  <a-button
                    v-if="material.rejectionReason.length > 50"
                    type="link"
                    size="small"
                    @click="toggleReasonDisplay(material)"
                    class="toggle-reason-btn"
                  >
                    {{ material.showFullReason ? '收起' : '展开' }}
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="review-comments-section">
          <div class="section-header">
            <h4>审核意见</h4>
            <a-button
              size="small"
              type="link"
              @click="regenerateComments"
              :disabled="!hasReviewedMaterials"
            >
              🔄 重新生成
            </a-button>
          </div>
          <a-textarea
            v-model:value="reviewForm.comments"
            placeholder="审核意见将根据材料审核结果自动生成，您也可以手动编辑补充..."
            :rows="8"
            show-count
            :maxlength="1000"
            class="review-comments-textarea"
          />
          <div class="comments-tip">
            <a-alert
              message="提示"
              description="审核意见会自动根据各材料的审核结果生成，您可以在此基础上补充整体意见。"
              type="info"
              show-icon
              :closable="false"
            />
          </div>
        </div>

        <div class="review-result-section">
          <h4>审核结果</h4>
          <div class="auto-result-display">
            <a-tag :color="autoReviewResult === 'approved' ? 'green' : 'red'" size="large">
              {{ autoReviewResult === 'approved' ? '材料审核通过' : '材料审核不通过' }}
            </a-tag>
            <span class="result-tip"> （根据材料审核状态自动确定） </span>
          </div>
        </div>

        <!-- 审核不通过时的详细说明
        <div v-if="reviewForm.result === 'rejected'" class="rejection-details">
          <a-form-item label="不通过原因" required>
            <a-textarea
              v-model:value="reviewForm.rejectionReason"
              placeholder="请详细说明材料不通过的具体原因，指出需要补充或修改的内容..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>
        </div> -->

        <!-- 自定义底部按钮 -->
        <div class="modal-footer">
          <a-space>
            <a-button @click="handleReviewCancel"> 取消 </a-button>
            <a-button type="primary" @click="handleReviewSubmit"> 提交审核 </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 驳回意见填写弹窗 -->
    <a-modal
      v-model:open="rejectionModalVisible"
      title="填写驳回意见"
      width="500px"
      @ok="confirmRejection"
      @cancel="cancelRejection"
    >
      <div v-if="currentMaterial" class="rejection-form">
        <div class="material-info">
          <h4>{{ currentMaterial.name }}</h4>
          <p class="material-type">{{ currentMaterial.type }}</p>
        </div>
        <a-form layout="vertical">
          <a-form-item label="驳回原因" required>
            <a-textarea
              v-model:value="rejectionForm.reason"
              placeholder="请详细说明该材料的问题和改进要求..."
              :rows="4"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 会议组织弹窗 -->
    <a-modal
      v-model:open="meetingModalVisible"
      title="安排验收会议"
      width="700px"
      @ok="handleMeetingSubmit"
      @cancel="handleMeetingCancel"
    >
      <div v-if="selectedProject" class="meeting-modal">
        <a-form :model="meetingForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="会议时间" required>
                <a-date-picker
                  v-model:value="meetingForm.datetime"
                  show-time
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="会议地点" required>
                <a-input v-model:value="meetingForm.location" placeholder="请输入会议地点" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="会议形式" required>
            <a-radio-group v-model:value="meetingForm.type">
              <a-radio value="offline">现场会议</a-radio>
              <a-radio value="online">线上会议</a-radio>
              <a-radio value="hybrid">混合会议</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="会议主持人" required>
            <a-select
              v-model:value="meetingForm.hosts"
              mode="tags"
              placeholder="选择或输入主持人（可选择多个或手动输入）"
              style="width: 100%"
              :options="hostOptions"
              :filter-option="filterHostOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag
                  color="blue"
                  closable
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
            <div class="form-tip">可从下拉列表选择或直接输入姓名，支持多个主持人</div>
          </a-form-item>

          <a-form-item label="参会专家" required>
            <a-select
              v-model:value="meetingForm.experts"
              mode="tags"
              placeholder="选择或输入参会专家（可选择多个或手动输入）"
              style="width: 100%"
              :options="expertOptions"
              :filter-option="filterExpertOption"
            >
              <template #tagRender="{ label, onClose }">
                <a-tag
                  color="green"
                  closable
                  @close="onClose"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
            <div class="form-tip">可从下拉列表选择或直接输入专家姓名，支持多个专家</div>
          </a-form-item>

          <a-form-item label="中期申请材料">
            <div class="midterm-materials">
              <div class="section-description">
                以下为项目提交的中期申请材料，仅供会议参考，不可编辑
              </div>

              <!-- 中期材料列表展示 -->
              <div
                v-if="selectedProject.materials && selectedProject.materials.length > 0"
                class="materials-list"
              >
                <div
                  v-for="(material, index) in selectedProject.materials"
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ material.materialName }}{{ material.fileSuffix ? '.' + material.fileSuffix : '' }}</span>
                  <span class="file-size">{{ formatFileSize(material.fileSize) }}</span>
                  <a-tag :color="material.reviewStatus === 'approved' ? 'green' : material.reviewStatus === 'rejected' ? 'red' : 'orange'">
                    {{ material.reviewStatus === 'approved' ? '已通过' : material.reviewStatus === 'rejected' ? '已驳回' : '待审核' }}
                  </a-tag>
                  <a-button type="link" size="small" @click="previewMaterial(material)">
                    预览
                  </a-button>
                  <a-button type="link" size="small" @click="downloadMaterial(material)">
                    下载
                  </a-button>
                </div>
              </div>
              <div v-else class="empty-materials">
                暂无中期申请材料
              </div>
            </div>
          </a-form-item>

          <a-form-item label="会议资料">
            <div class="meeting-materials">
              <div class="section-description">
                请上传会议相关资料，如会议议程、专家评审表等
              </div>
              <a-upload
                :file-list="meetingForm.meetingMaterials"
                :before-upload="beforeUploadMaterial"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              >
                <a-button>
                  <UploadOutlined />
                  上传会议资料
                </a-button>
              </a-upload>
              <div class="upload-tip">
                支持上传PDF、Word、PPT、Excel、压缩包等格式，单个文件不超过50MB
              </div>

              <!-- 资料列表展示 -->
              <div
                v-if="meetingForm.meetingMaterials && meetingForm.meetingMaterials.length > 0"
                class="materials-list"
              >
                <div
                  v-for="(file, index) in meetingForm.meetingMaterials"
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.fileName }}</span>
                  <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                  <a-button type="link" danger size="small" @click="removeMaterialByIndex(index)">
                    删除
                  </a-button>
                </div>
              </div>
            </div>
          </a-form-item>
          <a-form-item label="会议说明">
            <a-textarea
              v-model:value="meetingForm.description"
              placeholder="请填写会议说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 结论录入弹窗 -->
    <a-modal
      v-model:open="resultModalVisible"
      title="录入中期结论"
      width="800px"
      @ok="handleResultSubmit"
      @cancel="handleResultCancel"
    >
      <div v-if="selectedProject" class="result-modal">
        <div class="project-meeting-info">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="会议时间">
              {{ selectedProject.meetingInfo && selectedProject.meetingInfo.time ? selectedProject.meetingInfo.time : '会议时间待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedProject.meetingInfo && selectedProject.meetingInfo.location ? selectedProject.meetingInfo.location : '会议地点待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" v-if="selectedProject.meetingInfo?.type">
              {{
                selectedProject.meetingInfo.type === 'offline'
                  ? '现场会议'
                  : selectedProject.meetingInfo.type === 'online'
                    ? '线上会议'
                    : '混合会议'
              }}
            </a-descriptions-item>
            <a-descriptions-item
              label="会议说明"
              :span="2"
              v-if="selectedProject.meetingInfo?.description"
            >
              {{ selectedProject.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="resultForm" layout="vertical">
          <a-form-item label="中期结论" required>
            <a-radio-group v-model:value="resultForm.conclusion">
              <a-radio value="passed">中期通过</a-radio>
              <a-radio value="conditional_passed">有条件通过</a-radio>
              <a-radio value="failed">中期不通过</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="中期评分">
            <a-input-number
              v-model:value="resultForm.score"
              :min="0"
              :max="100"
              placeholder="请输入评分"
              style="width: 200px"
            />
            <span style="margin-left: 8px">分</span>
          </a-form-item>

          <a-form-item label="结论说明" required>
            <a-textarea
              v-model:value="resultForm.description"
              placeholder="请详细说明中期结论..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>

          <!-- <a-form-item label="整改要求" v-if="resultForm.conclusion !== 'passed'">
            <a-textarea
              v-model:value="resultForm.requirements"
              placeholder="请填写整改要求..."
              :rows="3"
              show-count
              :maxlength="300"
            />
          </a-form-item> -->

          <a-form-item label="结论相关文件">
            <div class="conclusion-files">
              <a-upload
                v-model:file-list="resultForm.conclusionFiles"
                :before-upload="beforeUploadResultFile"
                :on-remove="removeResultFile"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              >
                <a-button>
                  <UploadOutlined />
                  上传结论文件
                </a-button>
              </a-upload>

              <!-- 文件列表展示 -->
              <div v-if="resultForm.conclusionFiles.length > 0" class="files-list">
                <div
                  v-for="(file, index) in resultForm.conclusionFiles"
                  :key="index"
                  class="file-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <a-button type="link" danger size="small" @click="removeResultFileByIndex(index)">
                    删除
                  </a-button>
                </div>
              </div>
              <div class="upload-tip">
                <small style="color: #999">
                  支持上传 PDF、Word、Excel 文件，单个文件大小不超过 20MB
                </small>
              </div>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 整改材料审核弹窗 -->
    <a-modal
      v-model:open="improvementReviewModalVisible"
      title="审核整改材料"
      width="900px"
      @ok="handleImprovementReviewSubmit"
      @cancel="handleImprovementReviewCancel"
    >
      <div v-if="selectedProject" class="improvement-review-modal">
        <!-- 项目基本信息 -->
        <div class="project-basic-info">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 原始整改要求 -->
        <div
          v-if="selectedProject.conclusion && selectedProject.conclusion.requirements"
          class="original-requirements"
        >
          <h4>原始整改要求</h4>
          <div class="requirements-content">
            <a-alert type="warning" show-icon :message="selectedProject.conclusion.requirements" />
          </div>
        </div>

        <!-- 申请人提交的整改材料 -->
        <div class="improvement-materials">
          <h4>申请人提交的整改材料</h4>
          <div class="improvement-materials-list">
            <div v-if="improvementMaterials.length > 0">
              <div 
                v-for="material in improvementMaterials" 
                :key="material.id" 
                class="material-item improvement-material"
              >
                <div class="material-info">
                  <div class="material-name">
                    <FileOutlined />
                    {{ material.materialName }}
                  </div>
                  <div class="material-meta">
                    <span class="material-type">整改材料</span>
                    <span class="material-size">{{ formatFileSize(material.fileSize) }}</span>
                    <span class="material-time">{{ dayjs(material.createTime).format('YYYY-MM-DD HH:mm') }}</span>
                  </div>
                </div>
                <div class="material-actions">
                  <a-button
                    type="link"
                    size="small"
                    @click="previewMaterial(material)"
                  >
                    <EyeOutlined />
                    预览
                  </a-button>
                  <a-button
                    type="link"
                    size="small"
                    @click="downloadMaterial(material)"
                  >
                    <DownloadOutlined />
                    下载
                  </a-button>
                </div>
              </div>
            </div>
            <a-empty v-else description="暂无整改材料" />
          </div>
        </div>

        <!-- 申请人整改说明 -->
        <div class="improvement-description">
          <h4>申请人整改说明</h4>
          <div class="description-content">
            <a-card size="small" class="improvement-description-card">
              <div class="improvement-content">
                <p><strong>整改完成情况：</strong></p>
                <div class="improvement-details">
                  <p>{{
                    selectedProject.applicationDescription || '暂无整改说明'}}</p>
                  <!-- <p>{{ '2. 优化了系统界面布局，提升用户交互体验；' }}</p>
                  <p>{{ '3. 编写了详细的操作说明文档，便于用户使用。' }}</p> -->
                </div>
                <div class="improvement-submit-info">
                  <ClockCircleOutlined />
                  <span
                    >提交时间：{{
                      selectedProject.createTime ? dayjs(selectedProject.createTime).format('YYYY-MM-DD HH:mm') : '未知' }}</span
                  >
                </div>
              </div>
            </a-card>
          </div>
        </div>

        <!-- 审核结果 -->
        <div class="review-result-section">
          <h4>审核结果</h4>
          <a-form layout="vertical">
            <a-form-item label="审核结论" required>
              <a-radio-group
                v-model:value="improvementReviewForm.result"
                class="review-result-group"
              >
                <a-radio value="approved" class="review-option">
                  <CheckCircleOutlined style="color: #52c41a; margin-right: 8px" />
                  整改完成，验收通过
                </a-radio>
                <a-radio value="rejected" class="review-option">
                  <ExclamationCircleOutlined style="color: #faad14; margin-right: 8px" />
                  整改不满足要求，需要继续整改
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="审核意见" required>
              <a-textarea
                v-model:value="improvementReviewForm.comments"
                placeholder="请填写详细的审核意见..."
                :rows="4"
                show-count
                :maxlength="500"
              />
            </a-form-item>

            <a-form-item
              v-if="improvementReviewForm.result === 'rejected'"
              label="新的整改要求"
              required
            >
              <a-textarea
                v-model:value="improvementReviewForm.requirements"
                placeholder="请明确指出需要继续整改的具体内容和要求..."
                :rows="3"
                show-count
                :maxlength="300"
              />
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- 设置报告会时间弹窗 -->
    <a-modal
      v-model:open="setTimeModalVisible"
      title="设置中期检查报告会时间"
      @ok="handleSetTimeSubmit"
      @cancel="handleSetTimeCancel"
    >
      <div v-if="selectedProject" class="set-time-modal">
        <div class="project-basic-info">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="申请人">
              {{ selectedProject.applicant }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <a-form :model="setTimeForm" layout="vertical">
          <a-form-item label="报告会时间" required>
            <a-date-picker
              v-model:value="setTimeForm.datetime"
              show-time
              placeholder="选择报告会时间"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
          </a-form-item>
          <a-form-item label="时间说明">
            <a-textarea
              v-model:value="setTimeForm.remark"
              placeholder="可选择添加时间设置说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="项目详情"
      width="1000px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedProject" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4><FileSearchOutlined /> 项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getStatusColor(selectedProject.currentStatus)">
                {{ getStatusText(selectedProject.currentStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="材料状态">
              <a-tag
                :color="
                  selectedProject.materialStatus === 'approved'
                    ? 'green'
                    : selectedProject.materialStatus === 'rejected'
                      ? 'red'
                      : 'orange'
                "
              >
                {{
                  selectedProject.materialStatus === 'approved'
                    ? '已通过'
                    : selectedProject.materialStatus === 'rejected'
                      ? '已驳回'
                      : '审核中'
                }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="会议状态" v-if="selectedProject.meetingScheduled">
              <a-tag color="blue">
                {{
                  selectedProject.meetingStatus === 'completed'
                    ? '已完成'
                    : selectedProject.meetingStatus === 'scheduled'
                      ? '已安排'
                      : '准备中'
                }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="最终结果" v-if="selectedProject.finalResult">
              <a-tag
                :color="
                  selectedProject.finalResult === 'passed'
                    ? 'green'
                    : selectedProject.finalResult === 'failed'
                      ? 'red'
                      : 'orange'
                "
              >
                {{
                  selectedProject.finalResult === 'passed'
                    ? '验收通过'
                    : selectedProject.finalResult === 'failed'
                      ? '验收不通过'
                      : '有条件通过'
                }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 验收材料 -->
        <div class="detail-section" v-if="selectedProject.materials && selectedProject.materials.length > 0">
          <h4><FileOutlined /> 验收材料</h4>
          <div class="material-list">
            <div
              v-for="material in selectedProject.materials"
              :key="material.id"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ material.materialName || '未命名文件' }}{{ material.fileSuffix ? '.' + material.fileSuffix : '' }}
                </div>
                <div class="material-meta">
                  <span class="material-type">{{ material.type }}</span>
                  <a-tag
                    :color="
                      material.reviewStatus === 'approved'
                        ? 'green'
                        : material.reviewStatus === 'rejected'
                          ? 'red'
                          : 'orange'
                    "
                    size="small"
                  >
                    {{
                      material.reviewStatus === 'approved'
                        ? '已通过'
                        : material.reviewStatus === 'rejected'
                          ? '已驳回'
                          : '待审核'
                    }}
                  </a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(material)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(material)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 会议信息 -->
        <div class="detail-section" v-if="selectedProject.meetingInfo">
          <h4><CalendarOutlined /> 会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="会议时间">
              {{ selectedProject.meetingInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedProject.meetingInfo.location }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" :span="2">
              {{
                selectedProject.meetingInfo.type === 'offline'
                  ? '现场会议'
                  : selectedProject.meetingInfo.type === 'online'
                    ? '线上会议'
                    : '混合会议'
              }}
            </a-descriptions-item>
            <a-descriptions-item
              label="会议说明"
              :span="2"
              v-if="selectedProject.meetingInfo.description"
            >
              {{ selectedProject.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 会议上传文件 -->
        <div class="detail-section" v-if="selectedProject.meetingMaterials && selectedProject.meetingMaterials.length > 0">
          <h4><FolderOpenOutlined /> 会议上传文件</h4>
          <div class="material-list">
            <div
              v-for="(file, index) in selectedProject.meetingMaterials"
              :key="file.id || index"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ file.fileName || '未命名文件' }}
                </div>
                <div class="material-meta">
                  <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                  <a-tag v-if="file.materialSource === 1" color="blue" size="small">上传文件</a-tag>
                  <a-tag v-else-if="file.materialSource === 2" color="green" size="small">链接文件</a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(file)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(file)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 中期结论 -->
        <div class="detail-section" v-if="selectedProject.conclusion">
          <h4><AuditOutlined /> 中期结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="验收结果">
              <a-tag
                :color="
                  selectedProject.conclusion.result === 'passed'
                    ? 'green'
                    : selectedProject.conclusion.result === 'failed'
                      ? 'red'
                      : 'orange'
                "
              >
                {{
                  selectedProject.conclusion.result === 'passed'
                    ? '验收通过'
                    : selectedProject.conclusion.result === 'failed'
                      ? '验收不通过'
                      : '有条件通过'
                }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="验收时间">
              {{ selectedProject.conclusion.time }}
            </a-descriptions-item>
            <a-descriptions-item label="验收评分" v-if="selectedProject.conclusion.score">
              <span
                :style="{
                  color:
                    selectedProject.conclusion.score >= 90
                      ? '#52c41a'
                      : selectedProject.conclusion.score >= 80
                        ? '#fa8c16'
                        : '#ff4d4f'
                }"
              >
                {{ selectedProject.conclusion.score }}分
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="验收说明" :span="2">
              {{ selectedProject.conclusion.description }}
            </a-descriptions-item>
            <a-descriptions-item
              label="整改要求"
              :span="2"
              v-if="selectedProject.conclusion.requirements"
            >
              <div class="requirements-text">
                {{ selectedProject.conclusion.requirements }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 结论文件 -->
        <div class="detail-section" v-if="selectedProject.conclusionFiles && selectedProject.conclusionFiles.length > 0">
          <h4><FileTextOutlined /> 结论文件</h4>
          <div class="material-list">
            <div
              v-for="(file, index) in selectedProject.conclusionFiles"
              :key="file.id || index"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ file.fileName || '未命名文件' }}
                </div>
                <div class="material-meta">
                  <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(file)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(file)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 整改情况 -->
        <div class="detail-section" v-if="selectedProject.improvementSubmitted">
          <h4><CheckCircleOutlined /> 整改情况</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="提交状态">
              <a-tag color="blue">已提交整改材料</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedProject.improvementSubmitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="整改说明" :span="2">
              <div class="improvement-text">
                {{ selectedProject.improvementDescription }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 审核历史 -->
        <div class="detail-section">
          <h4><ClockCircleOutlined /> 审核历史</h4>
          <a-timeline>
            <a-timeline-item color="blue">
              <template #dot>
                <FileOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">项目验收申请提交</div>
                <div class="timeline-time">{{ selectedProject.submitTime }}</div>
              </div>
            </a-timeline-item>

            <a-timeline-item v-if="selectedProject.materialStatus === 'approved'" color="green">
              <template #dot>
                <CheckCircleOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">材料审核通过</div>
                <div class="timeline-time">{{
                  selectedProject.createTime || ''
                }}</div>
              </div>
            </a-timeline-item>

            <a-timeline-item v-if="selectedProject.meetingScheduled" color="blue">
              <template #dot>
                <CalendarOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">验收会议安排</div>
                <div class="timeline-time">{{ selectedProject.meetingInfo?.time }}</div>
              </div>
            </a-timeline-item>

            <a-timeline-item
              v-if="selectedProject.conclusion"
              :color="
                selectedProject.conclusion.result === 'passed'
                  ? 'green'
                  : selectedProject.conclusion.result === 'failed'
                    ? 'red'
                    : 'orange'
              "
            >
              <template #dot>
                <AuditOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">
                  {{
                    selectedProject.conclusion.result === 'passed'
                      ? '验收通过'
                      : selectedProject.conclusion.result === 'failed'
                        ? '验收不通过'
                        : '有条件通过'
                  }}
                </div>
                <div class="timeline-time">{{ selectedProject.conclusion.time }}</div>
              </div>
            </a-timeline-item>

            <a-timeline-item v-if="selectedProject.improvementSubmitted" color="blue">
              <template #dot>
                <FileOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">整改材料提交</div>
                <div class="timeline-time">{{ selectedProject.improvementSubmitTime }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>

    <!-- 文件预览弹窗 -->
    <FilePreview
      v-model:visible="previewVisible"
      :file-info="currentPreviewFile"
      :file-list="fileList"
      :current-file-index="currentFileIndex"
      :title="getFilePreviewTitle(currentPreviewFile)"
      @file-change="handleFileChange"
      @download="handleDownloadFile"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 验收管理中心页面 - 管理角色
 * 功能：材料审核、会议组织、结论录入、流程管理
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  AppstoreOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileSearchOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  BulbOutlined,
  FileOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FolderOpenOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import FilePreview from '@/components/th_qd/FilePreview.vue'
import dayjs from 'dayjs'
import {uploadTechnologicalFile} from '@/api/upload'
import {
  thQdMidPage,
  thQdMidDetail,
  thQdMidUpdate,
  getTechnologicalProject,
  thQdMidMaterialPage,
  thQdMidMaterialDetail,
  thQdMidMaterialUpdate,
  thQdMidMaterialReviewUpdate,
  thQdMidMaterialReviewCreate
} from '@/api/th_qd/mid/add'

import{
  createMidtermMeeting,
  updateMidtermMeeting,
  getMidtermMeetingPage,
  createMidtermConclusion,
  createMidtermConclusionFile,
  getMidtermMeetingMaterialPage,
  getMidtermConclusionPage,
  updateMidtermConclusion,
  getMidtermConclusionFilePage
} from '@/api/th_qd/mid/meet'

import {
  thQdMidRectificationCreate,
  thQdMidRectificationUpdate,
  thQdMidRectificationDelete,
  thQdMidRectificationPage,
  thQdMidRectificationDetail
} from '@/api/th_qd/mid/rechek'


import { getUserPage, getSimpleUserList } from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'
const router = useRouter()
const userStore = useUserStore()
// 项目列表数据
const projects = ref([]) // 初始化为空数组

// 统计数据 - 基于项目列表动态计算
const stats = computed(() => {
  const materialReviewing = projects.value.filter(
    (p) => p.currentStatus === 'material_reviewing'
  ).length
  const materialRejected = projects.value.filter(
    (p) => p.currentStatus === 'material_rejected'
  ).length
  const meetingPreparing = projects.value.filter(
    (p) => p.currentStatus === 'meeting_preparing'
  ).length
  const meetingScheduled = projects.value.filter(
    (p) => p.currentStatus === 'meeting_scheduled'
  ).length
  const midtermPassed = projects.value.filter((p) => p.currentStatus === 'midterm_passed').length
  const midtermConditional = projects.value.filter(
    (p) => p.currentStatus === 'midterm_conditional'
  ).length
  const midtermFailed = projects.value.filter((p) => p.currentStatus === 'midterm_failed').length

  return {
    materialReviewing,
    materialRejected,
    meetingPreparing,
    meetingScheduled,
    midtermPassed,
    midtermConditional,
    midtermFailed
  }
})

// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 流程说明显示状态
const showFlowDescription = ref(false)

// 整改材料列表
const improvementMaterials = ref([])































// 专家列表
const expertList = ref([])






// 主持人/专家选项（从后端用户列表加载）
const hostOptions = ref<{ value: string; label: string }[]>([])
const expertOptions = ref<{ value: string; label: string }[]>([])

const loadUserOptions = async () => {
  try {
    // 优先调精简列表，兜底分页
    const simpleList = await getSimpleUserList()
    const users: any[] = Array.isArray(simpleList) ? simpleList : []
    const toOption = (u: any) => ({ value: String(u.nickname || u.username || u.id), label: String(u.nickname || u.username || u.id) })
    const opts = users.map(toOption)
    hostOptions.value = opts
    expertOptions.value = opts
  } catch (e) {
    try {
      const pageRes = await getUserPage({ pageNo: 1, pageSize: 100 })
      const list = pageRes?.list || []
      const opts = list.map((u: any) => ({ value: String(u.nickname || u.username || u.id), label: String(u.nickname || u.username || u.id) }))
      hostOptions.value = opts
      expertOptions.value = opts
    } catch (err) {
      console.warn('用户选项加载失败:', err)
    }
  }
}

























// 表格列配置
const reviewColumns = [
  {
    title: '项目信息',
    key: 'projectName',
    width: 300
  },
  {
    title: '材料状态',
    key: 'materialStatus',
    width: 120
  },
  {
    title: '会议状态',
    key: 'meetingStatus',
    width: 120
  },
  {
    title: '中期结论',
    key: 'finalResult',
    width: 120
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`,
  onChange: (page, pageSize) => {
    pagination.value.current = page
    pagination.value.pageSize = pageSize
    fetchProjects()
  }
})

// 弹窗状态
const reviewModalVisible = ref(false)
const meetingModalVisible = ref(false)
const resultModalVisible = ref(false)
const improvementReviewModalVisible = ref(false)
const detailModalVisible = ref(false)
const setTimeModalVisible = ref(false)
const selectedProject = ref(null)

// 表单数据
const reviewForm = ref({
  comments: '',
  result: 'approved',
  rejectionReason: ''
})

// 审核状态备份，用于取消时恢复
const materialStatusBackup = ref(new Map())
const hasAnyChanges = ref(false)

// 驳回意见弹窗状态
const rejectionModalVisible = ref(false)
const currentMaterial = ref(null)
const rejectionForm = ref({
  reason: ''
})

const meetingForm = ref({
  datetime: undefined,
  location: '',
  type: 'offline',
  hosts: [],
  experts: [],
  meetingMaterials: [], // 明确表示这是会议材料，不是中期材料
  description: ''
})

const resultForm = ref({
  conclusion: 'passed',
  score: 85,
  description: '',
  requirements: '',
  conclusionFiles: [], // 结论相关文件
  conclusionFiles1: [] // 条件通过相关文件
})

const improvementReviewForm = ref({
  result: 'approved',
  comments: '',
  requirements: ''
})

// 设置时间表单数据
const setTimeForm = ref({
  datetime: undefined,
  remark: ''
})

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})
const fileList = ref([])
const currentFileIndex = ref(0)

// 材料审核历史
const materialReviewHistory = ref([])

// 计算属性
const filteredProjects = computed(() => {
  let result = projects.value

  if (filters.value.status) {
    result = result.filter((project) => project.currentStatus === filters.value.status)
  }

  if (filters.value.keyword) {
      result = result.filter(project => 
      project.name.includes(filters.value.keyword) ||
      project.code.includes(filters.value.keyword)
    )
  }
  return result
})

// 检查是否有已审核的材料
const hasReviewedMaterials = computed(() => {
  if (!selectedProject.value?.materials) return false
  return selectedProject.value.materials.some((m) => m.reviewStatus && m.reviewStatus !== 'pending')
})

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 状态映射对象
const ProjectStatusMap = {
  'material_reviewing': 1,
  'meeting_preparing': 2,
  'meeting_scheduled': 3,
  'midterm_passed': 4,
  'midterm_conditional': 5,
  'midterm_failed': 6,
  'material_rejected': 7
}

// 状态码到状态字符串的映射函数
const getProjectStatusByCode = (statusCode) => {
  switch (statusCode) {
    case 1: return 'material_reviewing'
    case 2: return 'meeting_preparing'
    case 3: return 'meeting_scheduled'
    case 4: return 'midterm_passed'
    case 5: return 'midterm_conditional'
    case 6: return 'midterm_failed'
    case 7: return 'material_rejected'
    default: return 'material_reviewing'
  }
}



const getTechnologicalProjectPage1 = async () => {
  const res = await thQdMidPage({
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize
  })

  const list = res.list || []
  const total = res.total ?? 0

list.forEach((item) => {
      item.createTime = formatTimestamp(item.createTime)
      item.currentStatus = getProjectStatusByCode(item.applicationStatus)
    })

    projects.value = list

  }
  



// 自动计算审核结果
const autoReviewResult = computed(() => {
  if (!selectedProject.value?.materials?.length) return 'approved'

  // 检查是否有被驳回的材料
  const hasRejectedMaterials = selectedProject.value.materials.some(
    (m) => m.reviewStatus === 'rejected'
  )

  return hasRejectedMaterials ? 'rejected' : 'approved'
})

// 状态相关方法
const getMaterialStatusColor = (status) => {
  const colorMap = {
    reviewing: 'orange',
    approved: 'green',
    rejected: 'red',
    improvement_reviewing: 'purple'
  }
  return colorMap[status] || 'default'
}

const getMaterialStatusText = (status) => {
  const textMap = {
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    improvement_reviewing: '整改审核中'
  }
  return textMap[status] || '未知'
}

const getMeetingStatusColor = (status) => {
  const colorMap = {
    pending: 'default',
    preparing: 'blue',
    scheduled: 'purple',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getMeetingStatusText = (status) => {
  const textMap = {
    pending: '待安排',
    preparing: '待组织',
    scheduled: '已安排',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

const getResultColor = (result) => {
  const colorMap = {
    passed: 'green',
    conditional_passed: 'orange',
    failed: 'red'
  }
  return colorMap[result] || 'default'
}

const getResultText = (result) => {
  const textMap = {
    passed: '验收通过',
    conditional_passed: '有条件通过',
    failed: '验收未通过'
  }
  return textMap[result] || '待定'
}

const getStatusColor = (status) => {
  const colorMap = {
    material_reviewing: 'orange',
    meeting_preparing: 'blue',
    meeting_scheduled: 'cyan',
    midterm_passed: 'green',
    midterm_conditional: 'orange',
    midterm_failed: 'red',
    material_rejected: 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    material_reviewing: '材料审核中',
    meeting_preparing: '会议待组织',
    meeting_scheduled: '会议已安排',
    midterm_passed: '中期通过',
    midterm_conditional: '有条件通过',
    midterm_failed: '中期未通过',
    material_rejected: '材料审核未通过'
  }
  return textMap[status] || '未知状态'
}

// 事件处理方法
const handleBatchReview = () => {
  message.info('批量审核功能')
}

const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

// 项目操作方法
const handleReviewMaterial = async (record) => {
  selectedProject.value = record
  // const res = await getTechnologicalProjectMaterial(1)
  
  const res = await thQdMidMaterialPage({pageNo:1,pageSize:10,midtermApplicationId:record.id})
  console.log(res)
  // 备份当前材料状态
  materialStatusBackup.value.clear()
  hasAnyChanges.value = false
  record.materials = (res.list || []).map((m) => ({
    ...m,
    reviewStatus: (m.reviewStatus === 1 ? 'approved' : m.reviewStatus === 2 ? 'rejected' : 'pending'),
    rejectionReason: m.reviewComments || ''
  }))

  // 备份当前材料状态
  materialStatusBackup.value.clear()
  hasAnyChanges.value = false

  // 初始化材料审核状态并备份
  if (record.materials) {
    record.materials.forEach((material) => {
      // 备份原始状态
      materialStatusBackup.value.set(material.id, {
        reviewStatus: material.reviewStatus || 'pending',
        rejectionReason: material.rejectionReason || '',
        showFullReason: material.showFullReason || false
      })
      if (!material.reviewStatus) {
        material.reviewStatus = 'pending'
      }
      if (!material.rejectionReason) {
        material.rejectionReason = ''
      }
    })
  }

  reviewForm.value = {
    comments: '',
    result: autoReviewResult.value, // 使用自动计算的结果
    rejectionReason: ''
  }

  // 如果已有审核记录，自动生成审核意见
  generateOverallComments()

  reviewModalVisible.value = true
}

const handleScheduleMeeting = async (record) => {
  selectedProject.value = record

  // 加载材料数据
  try {
    const res = await thQdMidMaterialPage({ pageNo: 1, pageSize: 100, midtermApplicationId: record.id })
    const list = res?.list || []

    // 将材料列表保存到selectedProject中，用于显示中期申请材料
    selectedProject.value.materials = list.map((m) => ({
      ...m,
      reviewStatus: (m.reviewStatus === 1 ? 'approved' : m.reviewStatus === 2 ? 'rejected' : 'pending'),
      rejectionReason: m.reviewComments || ''
    }))

    // 初始化会议表单，会议资料单独管理，不与中期申请材料混合
    meetingForm.value = {
      datetime: undefined,
      location: '',
      type: 'offline',
      hosts: [],
      experts: [],
      meetingMaterials: [], // 会议资料初始化为空数组，用户单独上传
      description: ''
    }
  } catch (error) {
    console.error('加载材料数据失败:', error)
    // 如果加载失败，使用空数组
    meetingForm.value = {
      datetime: undefined,
      location: '',
      type: 'offline',
      hosts: [],
      experts: [],
      materials: [], // 确保初始化 materials 数组
      description: ''
    }
  }

  meetingModalVisible.value = true
}

const handleInputResult = (record) => {
  selectedProject.value = record
  resultForm.value = {
    conclusion: 'passed',
    score: 85,
    description: '',
    requirements: '',
    conclusionFiles: [], // 结论相关文件
    conclusionFiles1: [] // 条件通过相关文件
  }
  resultModalVisible.value = true
}

const handleViewDetail = (record) => {
  selectedProject.value = record
  ;(async () => {
    try {
      // 加载中期申请材料
      const res = await thQdMidMaterialPage({ pageNo: 1, pageSize: 100, midtermApplicationId: record.id })
      const list = res?.list || []
      console.log(list)

      // 将材料列表赋值给selectedProject，确保详情弹窗中能显示材料
      selectedProject.value.materials = list.map((m) => ({
        ...m,
        reviewStatus: (m.reviewStatus === 1 ? 'approved' : m.reviewStatus === 2 ? 'rejected' : 'pending'),
        rejectionReason: m.reviewComments || ''
      }))

      // 同时保存材料审核历史
      materialReviewHistory.value = list.map((r) => ({
        materialName: r.materialName || `材料#${r.materialId}`,
        reviewResult: r.reviewResult,
        reviewComments: r.reviewComments,
        reviewTime: r.reviewTime,
        createTime: r.createTime,
        reviewOpinion:r.reviewOpinion
      }))
      console.log(materialReviewHistory.value)

      // 加载会议信息
      try {
        const meetingRes = await getMidtermMeetingPage({ midtermApplicationId: record.id })
        const meetingList = meetingRes?.list || []
        console.log('会议数据:', meetingList)

        if (meetingList.length > 0) {
          const meeting = meetingList[0]
          // 保存会议信息
          selectedProject.value.meetingInfo = {
            time: meeting.meetingTime ? dayjs(meeting.meetingTime).format('YYYY-MM-DD HH:mm') : '',
            location: meeting.meetingPlace,
            type: meeting.meetingType === 0 ? 'offline' : meeting.meetingType === 1 ? 'online' : 'hybrid',
            description: meeting.meetingInstructions,
            id: meeting.id // 保存会议ID，用于获取会议上传文件
          }

          // 使用会议ID加载会议上传文件
          try {
            // 初始化会议上传文件数组
            selectedProject.value.meetingMaterials = []

            const meetingMaterialRes = await getMidtermMeetingMaterialPage({ meetingId: meeting.id })
            const meetingMaterialList = meetingMaterialRes?.list || []
            console.log('会议上传文件数据:', meetingMaterialList)

            if (meetingMaterialList.length > 0) {
              selectedProject.value.meetingMaterials = meetingMaterialList.map(item => ({
                id: item.id,
                fileName: item.materialName,
                fileUrl: item.fileUrl,
                fileSize: item.fileSize,
                fileSuffix: item.fileSuffix,
                materialSource: item.materialSource,
                sort: item.sort
              }))
              console.log('会议上传文件:', selectedProject.value.meetingMaterials)
            }
          } catch (meetingMaterialError) {
            console.error('加载会议上传文件失败:', meetingMaterialError)
            selectedProject.value.meetingMaterials = []
          }
        }
      } catch (meetingError) {
        console.error('加载会议信息失败:', meetingError)
        selectedProject.value.meetingMaterials = []
      }

      // 加载结论信息
      try {
        // 首先获取结论基本信息
        const conclusionRes = await getMidtermConclusionPage({ midtermApplicationId: record.id })
        const conclusionList = conclusionRes?.list || []
        console.log('结论数据:', conclusionList)

        if (conclusionList.length > 0) {
          const conclusion = conclusionList[0]
          // 保存结论信息
          selectedProject.value.conclusion = {
            result: conclusion.conclusionResult === 0 ? 'passed' : conclusion.conclusionResult === 1 ? 'conditional_passed' : 'failed',
            time: conclusion.createTime ? dayjs(conclusion.createTime).format('YYYY-MM-DD HH:mm') : '',
            score: conclusion.conclusionScore,
            description: conclusion.conclusionDescription,
            id: conclusion.id // 保存结论ID，用于获取结论文件
          }

          // 使用结论ID加载结论文件
          try {
            // 初始化结论文件数组
            selectedProject.value.conclusionFiles = []

            console.log('使用conclusionId获取结论文件:', conclusion.id)
            // 使用getMidtermConclusionFilePage函数获取结论文件
            const conclusionFileRes = await getMidtermConclusionFilePage({ conclusionId: conclusion.id })
            const conclusionFileList = conclusionFileRes?.list || []
            console.log('结论文件数据:', conclusionFileList)

            // 处理结论文件列表
            if (conclusionFileList.length > 0) {
              // 直接使用返回的文件列表，因为getMidtermConclusionFilePage应该直接返回文件列表
              selectedProject.value.conclusionFiles = conclusionFileList.map(item => ({
                id: item.id,
                fileName: item.fileName || '未命名文件',
                fileUrl: item.fileUrl || '',
                fileSize: item.fileSize || 0,
                fileSuffix: item.fileSuffix,
                sort: item.sort || 0
              }))
              console.log('从getMidtermConclusionFilePage获取结论文件:', selectedProject.value.conclusionFiles)
            } else {
              console.log('未找到结论文件')
              selectedProject.value.conclusionFiles = []
            }
          } catch (conclusionFileError) {
            console.error('使用conclusionId加载结论文件失败:', conclusionFileError)
            selectedProject.value.conclusionFiles = []
          }
        }
      } catch (conclusionError) {
        console.error('加载结论信息失败:', conclusionError)
        selectedProject.value.conclusionFiles = []
      }
    } catch (e) {
      materialReviewHistory.value = []
      // 如果加载失败，至少确保materials属性存在
      if (!selectedProject.value.materials) {
        selectedProject.value.materials = []
      }
      // 确保其他资料属性也存在
      selectedProject.value.meetingMaterials = []
      selectedProject.value.conclusionFiles = []
    }
  })()
  detailModalVisible.value = true
}

const handleDetailCancel = () => {
  detailModalVisible.value = false
}

// 处理审核弹窗取消
const handleReviewCancel = () => {
  // 检测是否有变化
  const hasChanges = checkForChanges()
  if (hasChanges) {
    // 有变化，弹出确认对话框
    Modal.confirm({
      title: '确认放弃审核？',
      content: '您已对材料进行了审核操作，是否确定放弃本次审核并恢复到审核前状态？',
      okText: '确定放弃',
      cancelText: '继续审核',
      okType: 'danger',
      onOk() {
        // 恢复到备份状态
        restoreToBackup()
        // 关闭弹窗
        reviewModalVisible.value = false
        message.info('已恢复到审核前状态')
      },
      onCancel() {
        // 继续审核，什么都不做
      }
    })
  } else {
    // 没有变化，直接关闭
    reviewModalVisible.value = false
  }
}

// 弹窗处理方法
const handleReviewSubmit = async () => {
  try {
    // 表单验证
    if (!reviewForm.value.comments.trim()) {
      message.error('请填写审核意见')
      return
    }

    // 检查是否有材料被驳回但审核意见不包含驳回原因
    const rejectedMaterials =
      selectedProject.value?.materials?.filter((m) => m.reviewStatus === 'rejected') || []
    if (rejectedMaterials.length > 0) {
      const hasRejectionReasons = rejectedMaterials.every((m) => m.rejectionReason?.trim())
      if (!hasRejectionReasons) {
        message.error('存在被驳回的材料但未填写驳回原因，请完善后提交')
        return
      }
    }

    // 使用自动计算的审核结果
    reviewForm.value.result = autoReviewResult.value


    // 1) 先落库每份材料的审核结果
    if (selectedProject.value?.materials?.length) {
      console.log(selectedProject.value.materials)
      await Promise.all(
        selectedProject.value.materials.map(async (m) => {
          // 更新材料当前状态
          await thQdMidMaterialUpdate({
            id: m.id,
            //projectId: m.projectId,
            materialType: m.materialType,
            materialName: m.materialName,
            fileUrl: m.fileUrl,
            fileSize: m.fileSize,
            fileSuffix: m.fileSuffix,
            isRequired: m.isRequired,
            reviewStatus: m.reviewStatus === 'approved' ? 1 : m.reviewStatus === 'rejected' ? 2 : 0,
            sort:m.sort,
            reviewComments: m.rejectionReason || m.reviewComments || ''
          })
          // 新增材料审核记录
          console.log('资料审核记录')
          console.log(m)

await thQdMidMaterialReviewCreate({
            midtermApplicationId: selectedProject.value.id,
            //projectId: m.projectId,
            materialId: m.id,
            reviewResult: m.reviewStatus === 'approved' ? 1 : m.reviewStatus === 'rejected' ? 2 : 0,
            // reviewComments: m.rejectionReason || m.reviewComments || '材料状态更新',
            reviewOpinion:m.rejectionReason || m.reviewComments || '材料状态更新',
            reviewTime:m.createTime,
            reviewer: (useUserStore().getUser.nickname || '系统')
          })
        })
      )
    }


    // 更新数据
    const midtermMaterialDOList = selectedProject.value.materials.map(material => ({
      id: material.id,
      reviewStatus: material.reviewStatus === 'approved' ? 1 : 2
    }))

    const updateProjectStatus = {
      id: selectedProject.value.id,
      applicationStatus: reviewForm.value.result === 'approved' ? 2 : 1,
      midtermMaterialDOList
    }

    // 更新项目状态
    if (selectedProject.value) {
      const projectIndex = projects.value.findIndex((p) => p.id === selectedProject.value.id)
      if (projectIndex !== -1) {
        const currentTime = new Date().toISOString().split('T')[0]


          if (reviewForm.value.result === 'approved') {
            await thQdMidUpdate(updateProjectStatus)
          } else {
            // 审核驳回 - 调用审核驳回API
            const failedReason = rejectedMaterials.map(m => 
              `${m.materialName || m.name}: ${m.rejectionReason}`
            ).join('; ') || reviewForm.value.comments

        //驳回条件
            const rejectionConditions = {
              id: selectedProject.value.id,
              applicationStatus: 7,
              midtermMaterialDOList
            }


        const reviewdata = {
            midtermApplicationId: selectedProject.value.id,
            materialId: selectedProject.value.materials[0]?.id, // 或根据实际需求获取正确的materialId
            reviewResult: selectedProject.value.materials[0]?.reviewStatus === 'approved' ? 1 : 
            selectedProject.value.materials[0]?.reviewStatus === 'rejected' ? 2 : 0,
            reviewOpinion: failedReason,
            reviewer: (useUserStore().getUser.nickname || '系统'),
            reviewTime: currentTime,
            isFinalReview: true
          }


          console.log('正在创建材料审核记录')
        console.log('审核数据:', reviewdata)

            await thQdMidMaterialReviewCreate(reviewdata)
            await thQdMidUpdate(rejectionConditions)
            await thQdMidPage()
            message.warning('材料审核不通过，已通知申请人根据意见重新提交材料')
          }

          // 关闭弹窗
          reviewModalVisible.value = false

          // 更新本地项目状态
          if (reviewForm.value.result === 'approved') {
            // 材料审核通过 → 会议待组织
            projects.value[projectIndex].currentStatus = 'meeting_preparing'
            projects.value[projectIndex].materialStatus = 'approved'
            projects.value[projectIndex].meetingStatus = 'preparing'

            // 保存审核记录
            projects.value[projectIndex].reviewHistory =
              projects.value[projectIndex].reviewHistory || []
            projects.value[projectIndex].reviewHistory.push({
              type: 'material_review',
              result: 'approved',
              comments: reviewForm.value.comments,
              time: currentTime,
            })

            message.success('材料审核通过，项目进入会议组织阶段')
          } else {
            // 材料审核不通过 → 保持材料审核中状态，等待重新提交
            projects.value[projectIndex].currentStatus = 'material_reviewing'
            projects.value[projectIndex].materialStatus = 'rejected'

            // 设置驳回信息，确保申请者能看到详细的驳回原因
            projects.value[projectIndex].materialRejected = true
            projects.value[projectIndex].rejectionInfo = {
              time: currentTime,
              reviewer: (useUserStore().getUser.nickname || '系统'),
              comments: reviewForm.value.comments,
              rejectionReason: reviewForm.value.comments // 使用完整的审核意见作为驳回原因
            }

            // 保存审核记录
            projects.value[projectIndex].reviewHistory =
              projects.value[projectIndex].reviewHistory || []
            projects.value[projectIndex].reviewHistory.push({
              type: 'material_review',
              result: 'rejected',
              comments: reviewForm.value.comments,
              rejectionReason: reviewForm.value.comments,
              time: currentTime,
              reviewer: (useUserStore().getUser.nickname || '系统')
            })

            // message.warning('材料审核不通过，已通知申请人根据意见重新提交材料')
          }





          // 保存材料级别的审核结果
          if (projects.value[projectIndex].materials) {
            projects.value[projectIndex].materials.forEach((material) => {
              if (material.reviewStatus && material.reviewStatus !== 'pending') {
                material.reviewTime = currentTime
                material.reviewer = (useUserStore().getUser.nickname || '系统')
              }
            })
          }
        } 
    }
  } catch (error) {
    console.error('提交审核失败:', error)
    message.error('提交审核失败，请重试')
  }
}




























//会议操作

const handleMeetingSubmit = async () => {

// 表单验证
  if (!meetingForm.value.datetime) {
    message.error('请选择会议时间')
    return
  }
  if (!meetingForm.value.location) {
    message.error('请输入会议地点')
    return
  }
  if (!meetingForm.value.hosts || meetingForm.value.hosts.length === 0) {
    message.error('请选择会议主持人')
    return
  }
  if (!meetingForm.value.experts || meetingForm.value.experts.length === 0) {
    message.error('请选择参会专家')
    return
  }
  //会议说明
  if (!meetingForm.value.description || meetingForm.value.description.trim() === '') {
    message.error('请填写会议说明')
    return
  }
  try {
    console.log('🏢 开始创建会议记录...', {
      projectId: selectedProject.value.code,
      projectName: selectedProject.value.name,
      meetingForm: meetingForm.value,
      meetingType: meetingForm.value.type 
    })


    // 准备会议参与者数据
    const midtermMeetingParticipantDOList = []
    
    // 添加主持人
    if (meetingForm.value.hosts && meetingForm.value.hosts.length > 0) {
      midtermMeetingParticipantDOList.push(...meetingForm.value.hosts.map(item => ({
        participantName: item,
        participantRole: 0
      })))
    }


    
    // 添加专家
    if (meetingForm.value.experts && meetingForm.value.experts.length > 0) {
      midtermMeetingParticipantDOList.push(...meetingForm.value.experts.map(item => ({
        participantName: item,
        participantRole: 1
      })))
    }
    
    // 准备会议材料数据
    const midtermMeetingMaterialDOList = []
    if (meetingForm.value.meetingMaterials && meetingForm.value.meetingMaterials.length > 0) {
      midtermMeetingMaterialDOList.push(...meetingForm.value.meetingMaterials.map((item, index) => ({
        materialSource: 1, // 会议材料来源：1-上传，2-链接
        materialName: item.fileName || item.uploadResponse?.fileName || item.name || '未命名文件',
        fileUrl: item.url || item.fileUrl || item.uploadResponse?.fileUrl || item.uploadResponse?.url || '',
        fileSize: item.fileSize || item.uploadResponse?.fileSize || item.size || 0,
        fileSuffix: item.fileSuffix || (item.name ? item.name.split('.').pop() : null) || null,
        sort: index + 1 // 按上传顺序排序，确保多文件时sort值递增
      })))
    }


    
























    // 🎯 第一步：创建会议记录
    const meetingData = {

      midtermApplicationId: selectedProject.value.id,
      meetingNo: selectedProject.value.code,
      meetingName: selectedProject.value.name,
      meetingTime: dayjs(meetingForm.value.datetime).valueOf(),
      meetingPlace: meetingForm.value.location || '未指定地点',
      meetingType: meetingForm.value.type === 'offline' ? 0 : 
                  meetingForm.value.type === 'online' ? 1 : 2,
      meetingStatus: 1,
      meetingMinutes: '',
      meetingInstructions: meetingForm.value.description || '',
      midtermMeetingParticipantDOList: midtermMeetingParticipantDOList,
      midtermMeetingMaterialDOList: midtermMeetingMaterialDOList
    }
    
    console.log('会议数据准备完成:', meetingData)
console.log('准备创建新会议')
    const meetingResponse = await createMidtermMeeting(meetingData)
    console.log(meetingResponse)
    if (meetingResponse) {
      console.log('✅ 会议创建成功')
    } else {
      throw new Error('会议创建失败')
    }

if (selectedProject.value) {
          selectedProject.value.meetingInfo = {
            title: meetingData.meetingName,
            type: meetingData.meetingType,
            time: meetingData.meetingTime,
            place: meetingData.meetingPlace,
            hosts: meetingForm.value.hosts,
            experts: meetingForm.value.experts,
            description: meetingData.meetingDescription
          }
        }


            const meetingStatus = {
              id: selectedProject.value.id,
              applicationStatus: 3,
              midtermMaterialDOList: selectedProject.value.materials.map(material => ({
                id: material.id,
                projectId: material.projectId,
                midtermApplicationId: material.midtermApplicationId,
                materialType: material.materialType,
                materialName: material.materialName,
                fileUrl: material.fileUrl,
                fileSize: material.fileSize,
                fileSuffix: material.fileSuffix,
                isRequired: material.isRequired,
                reviewStatus: material.reviewStatus === 'approved' ? 1 : (material.reviewStatus === 'rejected' ? 2 : 0), // 保持原有审核状态
                sort: material.sort
              }))
            }

         //第二步：更新项目状态为"会议已安排"
      await thQdMidUpdate(meetingStatus)

      console.log('✅ 项目状态更新完成')
      
      message.success('会议安排完成，会议记录已创建')
      meetingModalVisible.value = false
     // 🔄 刷新项目列表以获取最新状态
    await fetchProjects()

    
  } catch (error) {
    console.error('❌ 会议安排失败:', error)
    message.error(`会议安排失败: ${error.message || '请重试'}`)
  }
}

const handleMeetingCancel = () => {
  meetingModalVisible.value = false
}








// 会议弹窗专用方法
const filterHostOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const filterExpertOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const beforeUploadMaterial = async (file) => {
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ].includes(file.type)
  if (!isValidType) {
    message.error('请上传PDF、Word、PPT、Excel或压缩包格式的文件！')
    return false
  }
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB！')
    return false
  }
    try {
    console.log('=== 开始上传会议材料 ===')
    console.log('文件名:', file.name)
    console.log('文件大小:', file.size)
    
    // 实际上传文件到服务器
    const uploadResponse = await uploadTechnologicalFile(file)
    console.log('文件上传响应:', uploadResponse)
    
    if (uploadResponse && uploadResponse.fileUrl) {
      // 上传成功，添加文件信息到列表
      const fileWithUrl = {
        ...file,
        url: uploadResponse.fileUrl || '',           // uploadTechnologicalFile 返回的 URL
        fileUrl: uploadResponse.fileUrl || '',       // 添加 fileUrl 属性，与 url 保持一致
        uploaded: true,
        uploadTime: new Date().toISOString(),
        fileName: uploadResponse.fileName || file.name,
        fileSize: uploadResponse.fileSize || file.size,
        fileType: uploadResponse.fileType || file.type,
        fileMd5: uploadResponse.fileMd5,
        uploader: uploadResponse.uploader,
        description: uploadResponse.description,
        fileSuffix: uploadResponse.fileSuffix || (file.name ? file.name.split('.').pop() : null) || null,
        sort: meetingForm.value.meetingMaterials.length + 1, // 按添加顺序排序
        uploadResponse // 保存完整的上传响应数据以备后用
      }

      meetingForm.value.meetingMaterials.push(fileWithUrl)
      message.success(`文件 ${file.name} 上传成功`)
      console.log('文件已添加到列表:', fileWithUrl)
    } else {
      message.error(`文件 ${file.name} 上传失败`)
      console.error('上传响应异常:', uploadResponse)
    }
  } catch (uploadError) {
    console.error('文件上传失败:', uploadError)
    message.error(`文件上传失败: ${uploadError.message || '未知错误'}`)
  }
  
  return false // 阻止自动上传
}





const removeMaterial = (file) => {
  const index = meetingForm.value.meetingMaterials.findIndex((item) => item.uid === file.uid)
  if (index > -1) {
    meetingForm.value.meetingMaterials.splice(index, 1)
  }
}

const removeMaterialByIndex = (index) => {
  meetingForm.value.meetingMaterials.splice(index, 1)
}

const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return Math.round(size / 1024) + ' KB'
  } else {
    return Math.round(size / (1024 * 1024)) + ' MB'
  }
}




// 结论文件上传方法
const beforeUploadResultFile = async (file) => {
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isLt20M) {
    message.error('文件大小不能超过20MB!')
    return false
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
    message.error('只支持PDF、Word、Excel格式!')
    return false
  }



const response = await uploadTechnologicalFile(file)
// 触发上传进度
  console.log(response)

  if (response) {
    // 触发完成进度

    // ✅ 构建包含完整上传信息的文件对象
    const fileWithUrl = {
      ...file,
      url: response.fileUrl,         
      uploaded: true,
      uploadTime: new Date().toISOString(),
      
      // ✅ 保存完整的上传响应数据
      uploadResponse: response,        
      fileName: response.fileName,
      fileSize: response.fileSize || file.size,
      fileType: response.fileType || file.type,
      fileMd5: response.fileMd5,
      uploader: response.uploader,
      description: response.description
    }
  resultForm.value.conclusionFiles1.push(fileWithUrl)
  resultForm.value.conclusionFiles.push(fileWithUrl)
  message.success(`文件 ${file.name} 添加成功`)
  } else {
    console.log(Error(response.msg || '上传失败'))
  }

  return false
}











const removeResultFile = async (file) => {
  const index = resultForm.value.conclusionFiles.findIndex((item) => item.uid === file.uid)
  if (index > -1) {
    resultForm.value.conclusionFiles.splice(index, 1)
    resultForm.value.conclusionFiles1.splice(index, 1)
  }
}

const removeResultFileByIndex = (index) => {
  resultForm.value.conclusionFiles.splice(index, 1)
  resultForm.value.conclusionFiles1.splice(index, 1)
  message.success('文件删除成功')
}

const handleResultSubmit = async() => {
  // 表单验证
  if (!resultForm.value.conclusion) {
    message.error('请选择中期结论')
    return
  }
  if (!resultForm.value.description) {
    message.error('请填写结论说明')
    return
  }
  // if (resultForm.value.conclusion !== 'passed' && !resultForm.value.requirements) {
  //   message.error('请填写整改要求')
  //   return
  // }



try {
    // 🔥 调用后端API进行结论录入和状态更新
    if (resultForm.value.conclusion === 'passed') {
      // 先创建结论记录，获取结论ID
      // 先获取meetingId
      console.log('正在获取meetingId，参数:', { midtermApplicationId: Number(selectedProject.value?.id) })
      const meetingRes = await getMidtermMeetingPage({
        midtermApplicationId: Number(selectedProject.value?.id)
      })
      console.log('获取到的meeting响应:', meetingRes)
      
      // 尝试多种方式获取meetingId
      let meetingId = null
      if (meetingRes && meetingRes.list && meetingRes.list.length > 0) {
        meetingId = meetingRes.list[0].id
      } else if (meetingRes && meetingRes.data && meetingRes.data.length > 0) {
        meetingId = meetingRes.data[0].id
      } else if (meetingRes && meetingRes.id) {
        meetingId = meetingRes.id
      }
      
      console.log('提取的meetingId:', meetingId)
      
      const conclusion = await createMidtermConclusion({
        midtermApplicationId: Number(selectedProject.value?.id),
        meetingId: meetingId,
        conclusionType: 1,
        //结论结果（0-通过, 1-有条件通过, 2-驳回）
        conclusionResult: resultForm.value.conclusion === 'passed' ? 0 : (resultForm.value.conclusion === 'conditional_passed' ? 1 : 2),
        conclusionScore: resultForm.value.score,
        conclusionDescription: resultForm.value.description
      })
      console.log('结论ID', conclusion)

      if(!conclusion){
        message.error('结论录入失败')
        return
      }

      // 创建结论文件
      // 使用索引作为sort值，确保多个文件时sort值递增
      for(const [index, file] of resultForm.value.conclusionFiles1.entries()){
        console.log({
          conclusionId: conclusion,
          fileName: file.fileName,
          fileUrl: file.url,
          fileSize: file.fileSize,
          sort: index
        })
        const conclusionFile = await createMidtermConclusionFile({
          conclusionId: conclusion,
          fileName: file.fileName,
          fileUrl: file.url,
          fileSize: file.fileSize,
          fileSuffix: file.fileSuffix,
          sort: index
        })
        if(conclusionFile){
          message.success('结论文件上传成功')
        }else{
          message.error('结论文件上传失败')
          return
        }
      }
      //   midtermApplicationId: Number(selectedProject.value?.id),
      //   meetingId: selectedProject.value?.meetingId ? Number(selectedProject.value.meetingId) : null,
      //   conclusionType: 1,
      //   //结论结果（0-通过, 1-有条件通过, 2-驳回）
      //   conclusionResult: resultForm.value.conclusion === 'passed' ? 0 : (resultForm.value.conclusion === 'conditional_passed' ? 1 : 2),
      //   conclusionScore: resultForm.value.score,
      //   conclusionDescription: resultForm.value.description
      // })
console.log('结论ID', conclusion)


      if(conclusion){
        // 打印整个conclusion对象以查看其结构
        console.log('创建的结论对象:', conclusion);
        message.success('结论录入成功')
      }else{
        message.error('结论录入失败')
        return
      }


      await thQdMidUpdate({
        id: selectedProject.value.id,
        applicationStatus: 4
      })
//刷新列表
// await getTechnologicalProjectPage1()
        message.success('中期结论录入完成')
    }
      else if (resultForm.value.conclusion === 'conditional_passed') {
        // 先获取meetingId
        console.log('正在获取meetingId，参数:', { midtermApplicationId: Number(selectedProject.value?.id) })
        const meetingRes = await getMidtermMeetingPage({
          midtermApplicationId: Number(selectedProject.value?.id)
        })
        console.log('获取到的meeting响应:', meetingRes)
        
        // 尝试多种方式获取meetingId
        let meetingId = null
        if (meetingRes && meetingRes.list && meetingRes.list.length > 0) {
          meetingId = meetingRes.list[0].id
        } else if (meetingRes && meetingRes.data && meetingRes.data.length > 0) {
          meetingId = meetingRes.data[0].id
        } else if (meetingRes && meetingRes.id) {
          meetingId = meetingRes.id
        }
        
        console.log('提取的meetingId:', meetingId)
        
        // 创建结论记录，获取结论ID
        const conclusion = await createMidtermConclusion({
          midtermApplicationId: Number(selectedProject.value?.id),
          meetingId: meetingId,
          conclusionType: 1,
          //结论结果（0-通过, 1-有条件通过, 2-驳回）
          conclusionResult: 1, // 有条件通过
          conclusionScore: resultForm.value.score,
          conclusionDescription: resultForm.value.description
        })
        console.log('结论ID', conclusion)

        if(!conclusion){
          message.error('结论录入失败')
          return
        }

        // 创建结论文件
        // 使用索引作为sort值，确保多个文件时sort值递增
        for(const [index, file] of resultForm.value.conclusionFiles1.entries()){
              console.log({
                conclusionId: conclusion,
                fileName: file.fileName,
                fileUrl: file.url,
                sort: index
              })
        const conclusionFile = await createMidtermConclusionFile({
          conclusionId: conclusion,
          fileName: file.fileName,
          fileUrl: file.url,
          fileSize: file.fileSize,
          sort: index
        })
        if(conclusionFile){
          message.success('结论文件上传成功')
        }else{
          message.error('结论文件上传失败')
          return
        }
      }
      





      // 有条件通过 → 状态 6，并写入整改要求
      await thQdMidUpdate({
        id: selectedProject.value.id,
        applicationStatus: 5
      
      })
      message.success('有条件通过，已设置整改要求')
    } else {

      
      // 未通过情况 - 先获取meetingId
      console.log('正在获取meetingId，参数:', { midtermApplicationId: Number(selectedProject.value?.id) })
      const meetingRes = await getMidtermMeetingPage({
        midtermApplicationId: Number(selectedProject.value?.id)
      })
      console.log('获取到的meeting响应:', meetingRes)
      
      // 尝试多种方式获取meetingId
      let meetingId = null
      if (meetingRes && meetingRes.list && meetingRes.list.length > 0) {
        meetingId = meetingRes.list[0].id
      } else if (meetingRes && meetingRes.data && meetingRes.data.length > 0) {
        meetingId = meetingRes.data[0].id
      } else if (meetingRes && meetingRes.id) {
        meetingId = meetingRes.id
      }
      
      console.log('提取的meetingId:', meetingId)
      
      // 创建结论记录
      const conclusion = await createMidtermConclusion({
        midtermApplicationId: Number(selectedProject.value?.id),
        meetingId: meetingId,
        conclusionType: 1,
        //结论结果（0-通过, 1-有条件通过, 2-驳回）
        conclusionResult: 2, // 未通过
        conclusionScore: resultForm.value.score,
        conclusionDescription: resultForm.value.description
      })
      console.log('结论ID', conclusion)

      if(!conclusion){
        message.error('结论录入失败')
        return
      }

      // 立项未通过
      const failedReason = resultForm.value.description
      
      // 创建结论文件
      // 使用索引作为sort值，确保多个文件时sort值递增
      for(const [index, file] of resultForm.value.conclusionFiles1.entries()){
        console.log({
          conclusionId: conclusion,
          fileName: file.fileName,
          fileUrl: file.url,
          sort: index
        })
        const conclusionFile = await createMidtermConclusionFile({
          conclusionId: conclusion,
          fileName: file.fileName,
          fileUrl: file.url,
          fileSize: file.fileSize,
          sort: index
        })
        if(conclusionFile){
          message.success('结论文件上传成功')
        }else{
          message.error('结论文件上传失败')
          return
        }
      }
      
      await thQdMidUpdate({
        id: selectedProject.value.id,
        applicationStatus: 6
      
      })
      message.warning('未通过，结论已录入')
    }
    
    resultModalVisible.value = false
    
    // 🔄 刷新项目列表以获取最新状态
    await fetchProjects()
    
  } catch (error) {
    console.error('结论录入失败:', error)
    message.error('结论录入失败，请重试')
  }
}

const handleResultCancel = () => {
  resultModalVisible.value = false
}
      







// 整改材料审核弹窗处理方法
const handleImprovementReviewSubmit = async() => {
  const result = improvementReviewForm.value.result
  const comments = improvementReviewForm.value.comments.trim()
  const requirements = improvementReviewForm.value.requirements.trim()
  // 表单验证
  if (!comments) {
    message.error('请填写审核意见')
    return
  }
  if (result === 'rejected' && !requirements) {
    message.error('审核不通过时，请填写新的整改要求')
    return
  }

  try {
    if (result === 'approved') {
      // 整改材料审核通过 → 中期通过
      await thQdMidUpdate({
        id: selectedProject.value?.id,
        applicationStatus: 4,
      })
      message.success('整改材料审核通过，项目中期通过！')
    } else {
      // 整改材料审核不通过 → 创建整改记录
      await thQdMidUpdate({
        id: selectedProject.value?.id,
        applicationStatus: 5,  // 整改审核中
      })
      


  // id: 0, // 新记录ID为0
  //           projectId: Number(selectedProject.value?.id) || 0,
  //           meetingConclusionId: 0, // 会议结论ID，暂时设为0
  //           rectificationNo: `RECT-${Date.now()}`, // 生成唯一整改编号
  //           rectificationRequirements: requirements,
  //           rectificationDeadline: deadlineDate.toISOString().split('T')[0], // 格式化为YYYY-MM-DD
  //           applicantResponse: selectedProject.value.applicationDescription, // 申请人响应，初始为空
  //           reviewResult: false, // 审核结果，不通过为false
  //           reviewOpinion: comments,
  //           reviewer: userStore.user.nickname || '', // 从用户store获取审核人姓名
  //           reviewTime: new Date().getTime() // 格式化为时间戳






 // 获取当前日期，并设置整改截止时间为30天后
        const currentDate = new Date()
        const deadlineDate = new Date(currentDate)
        deadlineDate.setDate(currentDate.getDate() + 30)

    const midtermConclusion = await getMidtermConclusionPage({
        pageNo: 1,
        pageSize: 10,
        midtermApplicationId: Number(selectedProject.value?.id)
      })
      await updateMidtermConclusion({
        id: midtermConclusion.list[0].id,
        conclusionDescription: requirements
      })



      // 创建整改记录
      await thQdMidRectificationCreate({
        midtermApplicationId: Number(selectedProject.value?.id),
        rectificationNo: `RECT-${Date.now()}`, // 生成唯一整改编号,
        applicantResponse: selectedProject.value.applicationDescription, // 申请人响应，初始为空
        rectificationRequirements: requirements,
        rectificationDeadline: deadlineDate.toISOString().split('T')[0], // 格式化为YYYY-MM-DD,
        reviewResult: result === 'approved' ? 1 : 2, // 审核结果，不通过为false
        reviewOpinion: comments,
        reviewer: userStore.user.nickname,
        reviewTime: new Date().getTime() // 格式化为时间戳
      })
      
      message.warning('整改材料审核不通过，已创建新的整改记录')
    }

    improvementReviewModalVisible.value = false

    // 🔄 刷新项目列表以获取最新状态
    await fetchProjects()

  } catch (error) {
    console.error('整改材料审核失败:', error)
    message.error('整改材料审核失败，请重试')
    return
  }


}

































  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex((p) => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      const currentTime = new Date().toISOString().split('T')[0]

      if (result === 'approved') {
        // 整改材料审核通过 → 验收通过
        projects.value[projectIndex].currentStatus = 'acceptance_passed'
        projects.value[projectIndex].finalResult = 'passed'
        projects.value[projectIndex].conclusion = {
          ...projects.value[projectIndex].conclusion,
          result: 'passed',
          rectificationConfirmed: true,
          rectificationTime: currentTime,
          rectificationComments: comments,
          rectificationRejected: false
        }

        // 记录整改材料提交信息
        projects.value[projectIndex].improvementSubmitted = true

        message.success('整改材料审核通过，项目验收完成！')
      } else {
        // 整改材料审核不通过 → 保持有条件通过，记录新的整改要求
        projects.value[projectIndex].conclusion = {
          ...projects.value[projectIndex].conclusion,
          rectificationRejected: true,
          rectificationRejectTime: currentTime,
          rectificationRejectComments: comments,
          newRequirements: requirements,
          // 保持有条件通过状态，等待申请人再次提交整改材料
          result: 'conditional_passed'
        }

        message.warning('整改材料审核不通过，已记录新的整改要求，申请人需要重新提交整改材料')
      }

      // 这里应该调用API同步状态到申请人端
      // await syncImprovementReviewResult(selectedProject.value.id, {
      //   result: result,
      //   comments: comments,
      //   requirements: requirements,
      //   currentStatus: projects.value[projectIndex].currentStatus
      // })
    }
  }


  // improvementReviewModalVisible.value = false









const handleImprovementReviewCancel = () => {
  improvementReviewModalVisible.value = false
}





// 材料审核相关方法
const approveMaterial = (material) => {
  material.reviewStatus = 'approved'
  material.rejectionReason = ''

  // 检测变化
  checkForChanges()

  generateOverallComments()
  message.success(`材料 "${material.materialName}" 审核通过`)
}

const rejectMaterial = (material) => {
  currentMaterial.value = material
  rejectionForm.value.reason = material.rejectionReason || ''
  rejectionModalVisible.value = true
}

const editRejectionReason = (material) => {
  currentMaterial.value = material
  rejectionForm.value.reason = material.rejectionReason || ''
  rejectionModalVisible.value = true
}

// 切换驳回意见显示
const toggleReasonDisplay = (material) => {
  material.showFullReason = !material.showFullReason
}

// 检测是否有变化
const checkForChanges = () => {
  if (!selectedProject.value?.materials) {
    hasAnyChanges.value = false
    return false
  }

  for (const material of selectedProject.value.materials) {
    const backup = materialStatusBackup.value.get(material.id)
    if (!backup) continue

    if (
      material.reviewStatus !== backup.reviewStatus ||
      material.rejectionReason !== backup.rejectionReason
    ) {
      hasAnyChanges.value = true
      return true
    }
  }
  hasAnyChanges.value = false
  return false
}

// 恢复到备份状态
const restoreToBackup = () => {
  if (!selectedProject.value?.materials) return

  selectedProject.value.materials.forEach((material) => {
    const backup = materialStatusBackup.value.get(material.id)
    if (backup) {
      material.reviewStatus = backup.reviewStatus
      material.rejectionReason = backup.rejectionReason
      material.showFullReason = backup.showFullReason
    }
  })
  hasAnyChanges.value = false
}

const confirmRejection = () => {
  if (!rejectionForm.value.reason.trim()) {
    message.error('请填写驳回原因')
    return
  }

  if (currentMaterial.value) {
    currentMaterial.value.reviewStatus = 'rejected'
    currentMaterial.value.rejectionReason = rejectionForm.value.reason

    // 检测变化
    checkForChanges()

    generateOverallComments()
    message.success(`材料 "${currentMaterial.value.materialName}" 已驳回`)
  }

  rejectionModalVisible.value = false
  currentMaterial.value = null
  rejectionForm.value.reason = ''
}

const cancelRejection = () => {
  rejectionModalVisible.value = false
  currentMaterial.value = null
  rejectionForm.value.reason = ''
}

const approveAllMaterials = () => {
  if (!selectedProject.value?.materials?.length) return

  selectedProject.value.materials.forEach((material) => {
    material.reviewStatus = 'approved'
    material.rejectionReason = ''
  })

  // 检测变化
  checkForChanges()

  generateOverallComments()
  message.success('已将所有材料设为通过')
}

const rejectAllMaterials = () => {
  if (!selectedProject.value?.materials?.length) return

  // 为所有材料设置默认驳回原因
  selectedProject.value.materials.forEach((material) => {
    material.reviewStatus = 'rejected'
    if (!material.rejectionReason) {
      material.rejectionReason = '请参考整体审核意见进行修改'
    }
  })

  // 检测变化
  checkForChanges()

  // 立即生成审核意见
  generateOverallComments()

  message.warning('已将所有材料设为驳回，请在审核意见中补充详细的驳回原因')
}

const regenerateComments = () => {
  generateOverallComments()
  message.success('审核意见已重新生成')
}

const generateOverallComments = () => {
  if (!selectedProject.value?.materials?.length) return

  const comments = []
  selectedProject.value.materials.forEach((material) => {
    if (material.reviewStatus === 'approved') {
      comments.push(`${material.materialName} - 审核通过`)
    } else if (material.reviewStatus === 'rejected' && material.rejectionReason) {
      comments.push(`${material.materialName} - 驳回原因：${material.rejectionReason}`)
    }
  })

  if (comments.length > 0) {
    const existingComments = reviewForm.value.comments
    const generatedComments = comments.join('\n')

    // 如果现有意见中不包含生成的内容，则更新
    if (!existingComments.includes(generatedComments)) {
      // 保留用户手动添加的其他内容
      const userComments = existingComments
        .split('\n')
        .filter((line) => !line.includes(' - 审核通过') && !line.includes(' - 驳回原因：'))
        .join('\n')
        .trim()

      reviewForm.value.comments = generatedComments + (userComments ? '\n\n' + userComments : '')
    }
  }
}

// 审核整改材料操作
const handleReviewImprovement = async (project) => {
  selectedProject.value = project

  // 加载项目详细信息，包括整改说明和提交时间
  try {
    const detailRes = await thQdMidDetail(project.id)
    if (detailRes) {
      // 更新选中项目的详细信息
      selectedProject.value = {
        ...selectedProject.value,
        // 确保有applicationDescription字段
        applicationDescription: detailRes.applicationDescription || selectedProject.value.applicationDescription,
        // 确保有createTime字段
        createTime: detailRes.createTime || selectedProject.value.createTime
      }
      console.log('更新后的项目详情:', selectedProject.value)
    }
  } catch (error) {
    console.error('加载项目详情失败:', error)
  }
  
  // 加载整改材料数据
  try {
    const res = await thQdMidMaterialPage({ pageNo: 1, pageSize: 100, midtermApplicationId: project.id })
    improvementMaterials.value = res?.list || []
  } catch (error) {
    console.error('加载整改材料失败:', error)
    improvementMaterials.value = []
    message.error('加载整改材料失败')
  }
  
  // 准备整改审核表单数据
  improvementReviewForm.value = {
    result: 'approved',
    comments: '',
    requirements: ''
  }
  // 显示整改材料审核弹窗
  improvementReviewModalVisible.value = true
}

// 重新审核操作
const handleReReview = (project) => {
  selectedProject.value = project
  Modal.confirm({
    title: '重新审核',
    content: `确认对项目"${project.name}"进行重新审核？这将重置项目状态到材料审核阶段。`,
    okText: '确认重审',
    cancelText: '取消',
    onOk() {
      // 重置项目状态到材料审核阶段
      const projectIndex = projects.value.findIndex((p) => p.id === project.id)
      if (projectIndex !== -1) {
        projects.value[projectIndex].currentStatus = 'material_reviewing'
        projects.value[projectIndex].materialStatus = 'reviewing'
        projects.value[projectIndex].meetingStatus = 'pending'
        projects.value[projectIndex].finalResult = null
        // 清除之前的结论
        delete projects.value[projectIndex].conclusion
        message.success('项目已重置为材料审核阶段，可重新开始审核流程')
      }
    }
  })
}

// 设置报告会时间处理方法
const handleSetMeetingTime = (record) => {
  selectedProject.value = record
  setTimeForm.value = {
    datetime: undefined,
    remark: ''
  }
  setTimeModalVisible.value = true
}

const handleSetTimeSubmit = () => {
  if (!setTimeForm.value.datetime) {
    message.error('请选择报告会时间')
    return
  }

  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex((p) => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      // 更新项目的报告会时间信息
      projects.value[projectIndex].meetingInfo = projects.value[projectIndex].meetingInfo || {}
      projects.value[projectIndex].meetingInfo.scheduledTime =
        setTimeForm.value.datetime.format('YYYY-MM-DD HH:mm')
      projects.value[projectIndex].meetingInfo.timeRemark = setTimeForm.value.remark
      projects.value[projectIndex].meetingScheduled = true

      message.success('中期检查报告会时间设置成功')
    }
  }

  setTimeModalVisible.value = false
}

const handleSetTimeCancel = () => {
  setTimeModalVisible.value = false
}

const disabledDate = (current) => {
  return current && current < dayjs().startOf('day')
}

// 切换流程说明显示状态
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

// 处理统计卡片点击筛选
const handleStatCardClick = (filterType) => {
  // 清除关键词筛选
  filters.value.keyword = ''
  // 直接设置状态筛选
  filters.value.status = filterType
}

// 获取中期申请列表数据（分页），数据来自 thQdMidPage
const fetchProjects = async () => {
  const params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize
  }
  try {
    const res = await thQdMidPage(params)

    // 兼容多种返回结构
    let list = []
    let total = 0
    if (Array.isArray(res?.list)) {
      list = res.list
      total = res.total || 0
    } else if (res?.data && Array.isArray(res.data.list)) {
      list = res.data.list
      total = res.data.total || 0
    } else {
      console.error('无法解析中期申请列表:', res)
      message.error('获取中期申请列表失败：无法解析数据')
      return
    }

    // 映射后端字段到前端展示模型
    const mapCurrentStatus = (status) => {
      switch (status) {
        case 1:
          return 'material_reviewing'
        case 2:
          return 'meeting_preparing'
        case 3:
          return 'meeting_scheduled'
        case 4:
          return 'midterm_passed'
        case 5:
          return 'midterm_conditional'
        case 6:
          return 'midterm_failed'
        case 7:
          return 'material_rejected'
        case 8:
          return 'improvement_reviewing'
        default:
          return 'material_reviewing'
      }
    }
    const mapMaterialStatus = (status) => {
      if (status === 1) return 'reviewing'
      if (status === 7) return 'rejected' // 材料驳回状态
      if (status === 8) return 'improvement_reviewing' // 整改审核中状态
      if (status >= 2 && status <= 6) return 'approved'
      return 'reviewing'
    }
    const mapMeetingStatus = (status) => {
      if (status === 2) return 'preparing'
      if (status === 3) return 'scheduled'
      if (status >= 4 && status <= 6) return 'completed'
      if (status === 8) return 'completed' // 整改审核中状态时，会议状态为已完成
      return 'pending'
    }
    const mapFinalResult = (status) => {
      if (status === 4) return 'passed'
      if (status === 5) return 'conditional_passed'
      if (status === 6) return 'failed'
      return null
    }

    projects.value = list.map((item) => ({
      id: item.id,
      projectId: item.projectId,
      name: item.projectName || 'NULL',
      code: item.applicationNo || '—',
      submitTime: item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD') : '',
      currentStatus: mapCurrentStatus(item.applicationStatus),
      materialStatus: mapMaterialStatus(item.applicationStatus),
      meetingStatus: mapMeetingStatus(item.applicationStatus),
      meetingScheduled: [3, 4, 5, 6].includes(item.applicationStatus),
      finalResult: mapFinalResult(item.applicationStatus),
      materials: []
    }))

    // 并行补充项目名称：根据 getTechnologicalProject(projectId) 获取真实名称
    const detailPromises = projects.value
      .filter((p) => p.projectId)
      .map(async (p) => {
        try {
          const detail = await getTechnologicalProject(p.projectId)
          const projectName = detail?.data?.projectName || detail?.projectName
          if (projectName) p.name = projectName
        } catch (e) {
          // 忽略单条失败，避免整体中断
        }
      })
    await Promise.allSettled(detailPromises)
    pagination.value.total = total
  } catch (e) {
    message.error('获取中期申请列表失败')
  }
}

// 文件预览方法
const previewMaterial = (material) => {
  console.log('预览文件:', material)

  // 判断文件类型，确定使用哪个文件列表
  let sourceFiles = []
  let fileTypeName = ''

  // 检查是否是整改材料
  if (improvementMaterials.value &&
      improvementMaterials.value.some(item => item.id === material.id)) {
    sourceFiles = improvementMaterials.value
    fileTypeName = '整改材料'
  }
  // 检查是否是会议上传文件
  else if (selectedProject.value.meetingMaterials && 
      selectedProject.value.meetingMaterials.some(item => item.id === material.id)) {
    sourceFiles = selectedProject.value.meetingMaterials
    fileTypeName = '会议上传文件'
  } 
  // 检查是否是结论文件
  else if (selectedProject.value.conclusionFiles && 
           selectedProject.value.conclusionFiles.some(item => item.id === material.id)) {
    sourceFiles = selectedProject.value.conclusionFiles
    fileTypeName = '结论文件'
  }
  // 默认使用中期申请材料
  else if (selectedProject.value.materials) {
    sourceFiles = selectedProject.value.materials
    fileTypeName = '中期申请材料'
  }

  console.log(`使用${fileTypeName}列表进行预览:`, sourceFiles)

  // 构建文件预览列表
  fileList.value = sourceFiles.map(item => {
    // 处理文件名，确保不为null
    const materialName = item.materialName || item.fileName || '未命名文件'
    const fileSuffix = item.fileSuffix ? '.' + item.fileSuffix : 
                      (materialName && materialName.includes('.') ? '' : 
                       (item.name && item.name.includes('.') ? '' : '.pdf'))

    // 确定文件URL
    let fileUrl = item.fileUrl || item.url || ''

    return {
      id: item.id,
      name: materialName + fileSuffix,
      type: item.fileSuffix || (item.name ? item.name.split('.').pop() : ''),
      size: item.fileSize || 0,
      url: fileUrl,
      uploadTime: item.createTime || item.uploadTime || '2024-01-15 10:30',
      sourceType: fileTypeName // 添加文件来源类型标识
    }
  })

  console.log('构建的文件预览列表:', fileList.value)

  // 查找当前预览文件在列表中的索引
  const index = fileList.value.findIndex(f => f.id === material.id)
  currentFileIndex.value = index >= 0 ? index : 0
  console.log('当前文件索引:', currentFileIndex.value)

  // 设置当前预览文件
  currentPreviewFile.value = fileList.value[currentFileIndex.value]
  previewVisible.value = true
}

// 处理文件切换
const handleFileChange = (newIndex) => {
  currentFileIndex.value = newIndex
  currentPreviewFile.value = fileList.value[newIndex]
}

const downloadMaterial = (material) => {
  // 尝试多种可能的文件URL属性
  let url = material.fileUrl || material.filePath || material.url || material.path

  // 处理文件名，确保不为null
  const materialName = material.materialName || material.name || '未命名文件'
  const fileSuffix = material.fileSuffix ? '.' + material.fileSuffix : ''
  const name = materialName + fileSuffix

  // 如果仍然没有URL，尝试根据ID构造下载链接
  if (!url && material.id) {
    // 假设有一个通用的文件下载API，可以根据文件ID下载
    url = `/api/file/download?id=${material.id}`
  }

  if (!url) {
    message.error('文件地址不存在，无法下载')
    return
  }

  try {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success(`正在下载：${name}`)
  } catch (e) {
    // 兜底方案
    window.open(url, '_blank')
  }
}

// 处理文件下载事件
const handleDownloadFile = (fileInfo) => {
  downloadMaterial(fileInfo)
}

// 获取文件预览标题
const getFilePreviewTitle = (fileInfo) => {
  if (!fileInfo) return '文件预览'

  // 根据文件来源类型返回不同的标题
  switch (fileInfo.sourceType) {
    case '会议上传文件':
      return '会议上传文件预览'
    case '结论文件':
      return '结论文件预览'
    case '中期申请材料':
      return '中期申请材料预览'
    default:
      return '文件预览'
  }
}

// 生命周期
onMounted(() => {
  fetchProjects()
  // 加载主持人/专家选项
  loadUserOptions()
})
</script>

<style scoped>
.acceptance-management-center {
  padding: 24px;
  background: #ffffff;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 12px;
  color: #fff;
  font-size: 18px;
}

.page-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 统计概览 */
.stats-overview {
  margin: 0 16px 24px 16px;
}

/* Flex容器样式 - 让所有卡片在一排显示 */
.stats-flex-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.stats-flex-container .stat-card {
  flex: 1;
  min-width: 140px;
  max-width: 200px;
}

/* 统计卡片样式 - 优化布局和视觉效果 */
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid #f0f0f0;
  user-select: none;
  position: relative;
  overflow: hidden;
  min-height: 80px;
}

/* 添加渐变装饰条 */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--accent-color);
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stat-card:hover .stat-number {
  color: var(--accent-color);
}

.stat-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.pending:hover {
  background: linear-gradient(135deg, #fff7e6 0%, #fff2e6 100%);
}

.stat-card.reviewing:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.stat-card.scheduled:hover {
  background: linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%);
}

.stat-card.completed:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #efffef 100%);
}

.stat-card.conditional:hover {
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
}

.stat-card.rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%);
}

/* 统计图标样式 */
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  margin-right: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 图标背景渐变样式 */
.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #faad14, #ffa940);
  color: #fff;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.15);
}

.stat-card.material-rejected .stat-icon {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.15);
}

.stat-card.reviewing .stat-icon {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.stat-card.scheduled .stat-icon {
  background: linear-gradient(135deg, #13c2c2, #36cfc9);
  color: #fff;
  box-shadow: 0 4px 12px rgba(19, 194, 194, 0.15);
}

.stat-card.completed .stat-icon {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: #fff;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
}

.stat-card.conditional .stat-icon {
  background: linear-gradient(135deg, #fa8c16, #ffa940);
  color: #fff;
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.15);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.15);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

/* 项目审核管理区域样式 */
.project-review-list {
  padding: 0 24px 24px 24px;
}

/* 内容卡片样式 */
.content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-filters {
  display: flex;
  gap: 12px;
}

/* 流程说明样式 */
.flow-description {
  margin-bottom: 24px;
}

.flow-content {
  padding: 24px;
}

.status-legend {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.status-legend h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: #f0f9ff;
  border-color: #91d5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.legend-item span {
  font-size: 13px;
  color: #595959;
}

/* 项目信息样式 */
.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #262626;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
}

.text-muted {
  color: #8c8c8c;
}

/* 弹窗样式 */
.review-modal,
.meeting-modal,
.result-modal,
.improvement-review-modal {
  padding: 16px 0;
}

.project-basic-info,
.material-review-section,
.review-comments-section,
.review-result-section,
.project-meeting-info,
.original-requirements,
.improvement-materials,
.improvement-description {
  margin-bottom: 24px;
}

.project-basic-info h4,
.material-review-section h4,
.review-comments-section h4,
.review-result-section h4,
.project-meeting-info h4,
.original-requirements h4,
.improvement-materials h4,
.improvement-description h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  gap: 16px;
}

.material-info {
  flex: 1;
}

.material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.material-type {
  font-size: 12px;
  color: #8c8c8c;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.material-review {
  width: 120px;
}

/* 材料审核区域优化样式 */
.material-review-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.material-review-section .section-header h4 {
  margin: 0;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.material-review-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rejection-reason {
  margin-top: 8px;
  padding: 8px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  font-size: 12px;
}

.reason-label {
  font-weight: 500;
  color: #ff4d4f;
  margin-bottom: 4px;
}

.reason-content {
  color: #262626;
  line-height: 1.4;
}

/* 驳回意见弹窗样式 */
.rejection-form .material-info h4 {
  margin: 0 0 4px 0;
  color: #262626;
  font-size: 16px;
}

.rejection-form .material-type {
  margin: 0 0 16px 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 审核意见区域优化样式 */
.review-comments-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-comments-section .section-header h4 {
  margin: 0;
}

.comments-tip {
  margin-top: 12px;
}

/* 自动审核结果样式 */
.auto-result-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-tip {
  color: #8c8c8c;
  font-size: 12px;
}

/* 材料审核状态显示样式 */
.review-status-display {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.status-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-width: 60px;
}

.status-option:hover {
  border-color: #4096ff;
  box-shadow: 0 1px 4px rgba(64, 150, 255, 0.15);
  transform: translateY(-1px);
  background: #f8f9fa;
}

.status-icon {
  font-size: 18px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.status-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* 选中状态样式 - 专业严肃风格 */
.status-active {
  transform: scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-approved.status-active {
  border-color: #1c7430;
  background: #f0f9f0;
  box-shadow: 0 2px 6px rgba(28, 116, 48, 0.15);
}

.status-approved.status-active .status-text {
  color: #1c7430;
  font-weight: 600;
}

.status-approved.status-active .status-icon {
  font-size: 18px;
  color: #1c7430;
}

.status-rejected.status-active {
  border-color: #a61e1e;
  background: #fef0f0;
  box-shadow: 0 2px 6px rgba(166, 30, 30, 0.15);
}

.status-rejected.status-active .status-text {
  color: #a61e1e;
  font-weight: 600;
}

.status-rejected.status-active .status-icon {
  font-size: 18px;
  color: #a61e1e;
}

.status-pending.status-active {
  border-color: #b7860a;
  background: #fefbf0;
  box-shadow: 0 2px 6px rgba(183, 134, 10, 0.15);
}

.status-pending.status-active .status-text {
  color: #b7860a;
  font-weight: 600;
}

.status-pending.status-active .status-icon {
  font-size: 18px;
  color: #b7860a;
}

.edit-opinion-btn {
  margin-top: 8px;
}

/* 驳回意见显示优化 */
.rejection-reason {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #d9d9d9;
}

.reason-label {
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  font-size: 12px;
}

.reason-content {
  position: relative;
}

.reason-text {
  color: #333;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
  /* 默认显示省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reason-text.reason-expanded {
  /* 展开时显示全部 */
  display: block;
  -webkit-line-clamp: none;
}

.toggle-reason-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0 4px;
  height: 20px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.9);
}

/* 审核意见文本框优化 */
.review-comments-textarea {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

.review-comments-textarea .ant-input {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 整改材料审核弹窗特定样式 */
.improvement-review-modal .project-basic-info h4,
.improvement-review-modal .original-requirements h4,
.improvement-review-modal .improvement-materials h4,
.improvement-review-modal .improvement-description h4,
.improvement-review-modal .review-result-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.original-requirements .requirements-content {
  margin-bottom: 16px;
}

.improvement-materials-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.improvement-material {
  border: 1px solid #e8f4f8;
  background: #f8fdff;
  position: relative;
}

.improvement-material::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #1890ff;
  border-radius: 2px 0 0 2px;
}

.improvement-material .material-info {
  flex: 1;
}

.improvement-material .material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.improvement-material .material-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.improvement-material .material-type {
  background: #1890ff;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.improvement-material .material-size {
  font-size: 12px;
  color: #8c8c8c;
}

.improvement-material .material-time {
  font-size: 12px;
  color: #8c8c8c;
}

.improvement-description-card {
  border: 1px solid #f0f0f0;
  background: #fafafa;
}

.improvement-content {
  line-height: 1.6;
}

.improvement-details {
  margin: 12px 0;
  padding-left: 16px;
}

.improvement-details p {
  margin: 8px 0;
  color: #595959;
}

.improvement-submit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #8c8c8c;
}

.review-result-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.review-option:hover {
  border-color: #1890ff;
  background: #f6ffed;
}

.review-option.ant-radio-wrapper-checked {
  border-color: #1890ff;
  background: #e6f7ff;
}

.required {
  color: #ff4d4f;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .acceptance-management-center {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-filters {
    flex-direction: column;
  }

  .stats-overview .ant-col {
    margin-bottom: 16px;
  }

  .material-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .legend-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .legend-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .legend-item {
    padding: 8px 12px;
  }
}

/* 详情弹窗样式 */
.detail-modal {
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px 0;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-section .material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section .material-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  gap: 16px;
  transition: all 0.3s ease;
}

.detail-section .material-item:hover {
  background: #f0f9ff;
  border-color: #91d5ff;
}

.detail-section .material-info {
  flex: 1;
}

.detail-section .material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section .material-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.detail-section .material-type {
  font-size: 12px;
  color: #8c8c8c;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.detail-section .material-actions {
  display: flex;
  gap: 8px;
}

.requirements-text {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  padding: 12px;
  color: #d46b08;
  line-height: 1.6;
}

.improvement-text {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 12px;
  color: #389e0d;
  line-height: 1.6;
  white-space: pre-line;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

/* 详情弹窗响应式设计 */
@media (max-width: 768px) {
  .detail-modal {
    max-height: 60vh;
  }
}

/* 会议弹窗表单提示样式 */
.form-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.4;
}

/* 会议资料上传样式 */
.meeting-materials {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 8px;
}

/* 中期申请材料样式 */
.midterm-materials {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-description {
  font-size: 13px;
  color: #8c8c8c;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.empty-materials {
  padding: 16px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border-radius: 4px;
  border: 1px dashed #d9d9d9;
}

.materials-list {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.materials-list .material-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.materials-list .material-item:last-child {
  border-bottom: none;
}

.materials-list .file-icon {
  color: #1890ff;
  font-size: 16px;
}

.materials-list .file-name {
  flex: 1;
  font-weight: 500;
  color: #262626;
}

.materials-list .file-size {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式设计继续 */
@media (max-width: 768px) {
  .detail-section .material-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .detail-section .material-actions {
    justify-content: flex-start;
  }
}

/* 新增步骤描述样式 */
.step-description {
  text-align: center;
}

.step-status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
  justify-content: center;
}

.step-status-tags .ant-tag {
  margin: 0;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 审核不通过详细说明样式 */
.rejection-details {
  margin-top: 16px;
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
}

.rejection-details .ant-form-item {
  margin-bottom: 0;
}

/* 自定义弹窗底部样式 */
.modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

/* 结论文件上传样式 */
.conclusion-files {
  margin-top: 16px;
}

.conclusion-files .files-list {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.conclusion-files .file-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.conclusion-files .file-item:last-child {
  border-bottom: none;
}

.conclusion-files .file-icon {
  color: #1890ff;
  font-size: 16px;
}

.conclusion-files .file-name {
  flex: 1;
  font-weight: 500;
  color: #262626;
}

.conclusion-files .file-size {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 8px;
}
</style>
