<!--
 * @file 验收管理中心页面 - 管理角色
 * @description 管理角色的验收管理中心，专注于材料审核与验收会议管理决策
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
          验收管理中心
        </h1>
        <p class="page-description">
          审核验收材料，组织验收会议，管理验收流程
        </p>
      </div>
      <!--<div class="header-actions">
        <a-button type="primary" @click="handleBatchReview">
          <AuditOutlined />
          批量审核
        </a-button>
      </div>-->
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
        <div class="stat-card completed" @click="handleStatCardClick('acceptance_passed')">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.acceptancePassed }}</div>
            <div class="stat-label">验收通过</div>
          </div>
        </div>
        <div class="stat-card conditional" @click="handleStatCardClick('acceptance_conditional')">
          <div class="stat-icon">
            <BulbOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.acceptanceConditional }}</div>
            <div class="stat-label">有条件通过</div>
          </div>
        </div>
        <div class="stat-card rectification" @click="handleStatCardClick('rectification')">
          <div class="stat-icon">
            <ReloadOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.rectification }}</div>
            <div class="stat-label">整改中</div>
          </div>
        </div>
        <div class="stat-card rejected" @click="handleStatCardClick('acceptance_failed')">
          <div class="stat-icon">
            <CloseCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.acceptanceFailed }}</div>
            <div class="stat-label">验收未通过</div>
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
                审核验收材料，决定通过或驳回
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
                根据会议结果录入最终验收结论
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
                  <a-select-option value="meeting_preparing">会议待组织</a-select-option>
                  <a-select-option value="meeting_scheduled">会议已安排</a-select-option>
                  <a-select-option value="acceptance_passed">验收通过</a-select-option>
                  <a-select-option value="acceptance_conditional">有条件通过</a-select-option>
                  <a-select-option value="acceptance_failed">验收未通过</a-select-option>
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
                :loading="loading"
                row-key="id"
                size="middle"
                @change="handleTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'name'">
                    <div class="project-info">
                      <div class="project-name">{{ record.name }}</div>
                      <div class="project-code">{{ record.code }}</div>
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
                        v-if="record.currentStatus === 'material_reviewing'" 
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
                      
                      <!-- 有条件通过 - 等待申请人提交整改材料 -->
                      <a-button 
                        v-if="record.currentStatus === 'acceptance_conditional'" 
                        type="default" 
                        size="small" 
                        disabled
                      >
                        等待整改材料
                      </a-button>
                      
                      <!-- 整改中 - 可以审核整改材料 -->
                      <a-button 
                        v-if="record.currentStatus === 'rectification'" 
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
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="handleViewDetail(record)"
                      >
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
              {{ selectedProject.name }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ formatTimestamp(selectedProject.submitTime || selectedProject.createTime, '申请时间待确定') }}
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
            <div v-for="material in selectedProject.materials" :key="material.id" class="material-item">
              <div class="material-info">
                <div class="material-name">{{ material.name }}</div>
                <!-- <div class="material-type">{{ material.type }}</div> -->
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
                      'status-active': !material.reviewStatus || material.reviewStatus === 'pending',
                      'status-pending': !material.reviewStatus || material.reviewStatus === 'pending'
                    }"
                  >
                    <div class="status-icon">
                      {{ (!material.reviewStatus || material.reviewStatus === 'pending') ? '⏳' : '⚪' }}
                    </div>
                    <div class="status-text">待审</div>
                  </div>
                </div>
                
                <!-- 编辑意见按钮 -->
                <div v-if="material.rejectionReason" class="edit-opinion-btn">
                  <a-button 
                    size="small"
                    type="dashed"
                    @click="editRejectionReason(material)"
                  >
                    📝 编辑意见
                  </a-button>
                </div>
              </div>
              
              <!-- 驳回意见显示 -->
              <div v-if="material.rejectionReason" class="rejection-reason">
                <div class="reason-label">驳回意见：</div>
                <div class="reason-content">
                  <div 
                    class="reason-text"
                    :class="{ 'reason-expanded': material.showFullReason }"
                  >
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
            <a-tag 
              :color="autoReviewResult === 'approved' ? 'green' : 'red'" 
              size="large"
            >
              {{ autoReviewResult === 'approved' ? '材料审核通过' : '材料审核不通过' }}
            </a-tag>
            <span class="result-tip">
              （根据材料审核状态自动确定）
            </span>
          </div>
        </div>
        
        <!-- 审核不通过时的详细说明 -->
        <!-- <div v-if="reviewForm.result === 'rejected'" class="rejection-details">
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
            <a-button @click="handleReviewCancel">
              取消
            </a-button>
            <a-button type="primary" @click="handleReviewSubmit">
              提交审核
            </a-button>
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
                <a-input
                  v-model:value="meetingForm.location"
                  placeholder="请输入会议地点"
                />
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
                  style="margin-right: 4px; margin-bottom: 4px;"
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
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ label }}
                </a-tag>
              </template>
            </a-select>
            <div class="form-tip">可从下拉列表选择或直接输入专家姓名，支持多个专家</div>
          </a-form-item>

          <a-form-item label="会议资料">
            <div class="meeting-materials">
              <a-upload
                :file-list="[]"
                :before-upload="beforeUploadMaterial"
                :on-remove="removeMaterial"
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
              <div v-if="meetingForm.materials && meetingForm.materials.length > 0" class="materials-list">
                <div 
                  v-for="(file, index) in meetingForm.materials" 
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <a-button 
                    type="link" 
                    danger 
                    size="small"
                    @click="removeMaterialByIndex(index)"
                  >
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
      title="录入验收结论"
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
              {{ formatTimestamp(selectedProject.meetingInfo?.time || selectedProject.meetingTime, '会议时间待确定') }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedProject.meetingInfo?.location || '会议地点待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" v-if="selectedProject.meetingInfo?.type">
              {{ selectedProject.meetingInfo.type === 'offline' ? '现场会议' : selectedProject.meetingInfo.type === 'online' ? '线上会议' : '混合会议' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2" v-if="selectedProject.meetingInfo?.description">
              {{ selectedProject.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="resultForm" layout="vertical">
          <a-form-item label="验收结论" required>
            <a-radio-group v-model:value="resultForm.conclusion">
              <a-radio value="passed">验收通过</a-radio>
              <a-radio value="conditional_passed">有条件通过</a-radio>
              <a-radio value="failed">验收不通过</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="验收评分">
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
              placeholder="请详细说明验收结论..."
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
                :file-list="[]"
                :before-upload="beforeUploadResultFile"
                
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
                  :key="file.uid || index"
                  class="file-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <span class="file-url" style="font-size: 11px; color: #666; word-break: break-all;">
                    {{ file.url ? '✅ 已上传' : '❌ 未上传' }}
                  </span>
                  <a-button
                    type="link"
                    danger
                    size="small"
                    @click="removeResultFileByIndex(index)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
              <div class="upload-tip">
                <small style="color: #999;">
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
        <!-- <div v-if="selectedProject.conclusion && selectedProject.conclusion.requirements" class="original-requirements">
          <h4>原始整改要求</h4>
          <div class="requirements-content">
            <a-alert
              type="warning"
              show-icon
              :message="selectedProject.conclusion.requirements"
            />
          </div>
        </div> -->

        <!-- 申请人提交的整改材料 -->
        <div class="improvement-materials">
          <h4>申请人提交的整改材料</h4>
          <div class="improvement-materials-list">
            <a-spin :spinning="improvementMaterialsLoading">
              <div v-if="improvementMaterials.length === 0 && !improvementMaterialsLoading" class="empty-materials">
                <a-empty description="暂无整改材料" />
              </div>
              <div v-else>
                <div 
                  v-for="material in improvementMaterials" 
                  :key="material.id" 
                  class="material-item improvement-material"
                >
                  <div class="material-info">
                    <div class="material-name">
                      <FileOutlined />
                      {{ material.name }}
                    </div>
                    <div class="material-meta">
                      <span class="material-type">{{ material.type }}</span>
                      <span class="material-size">{{ formatFileSize(material.size) }}</span>
                      <span class="material-time">{{ material.uploadTime }}</span>
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
            </a-spin>
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
                  <p>{{ selectedProject.applicationDescription || '暂无整改说明' }}</p>
                </div>
                <div class="improvement-submit-info">
                  <ClockCircleOutlined />
                  <span>提交时间：{{ selectedProject.improvementSubmitTime || '2024-01-28 14:30' }}</span>
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
              <a-radio-group v-model:value="improvementReviewForm.result" class="review-result-group">
                <a-radio value="approved" class="review-option">
                  <CheckCircleOutlined style="color: #52c41a; margin-right: 8px;" />
                  整改完成，验收通过
                </a-radio>
                <a-radio value="rejected" class="review-option">
                  <ExclamationCircleOutlined style="color: #faad14; margin-right: 8px;" />
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
      title="设置验收报告会时间"
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
            <a-descriptions-item label="申请人">
              {{ selectedProject.applicant || '待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="申请单位">
              {{ selectedProject.applicantUnit || '待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="年度">
              {{ selectedProject.yearly || '待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="项目周期">
              {{ selectedProject.projectCycle ? `${selectedProject.projectCycle}个月` : '待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="预算">
              {{ selectedProject.budget ? `${selectedProject.budget}万元` : '待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ formatTimestamp(selectedProject.submitTime || selectedProject.createTime, '申请时间待确定') }}
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getStatusColor(selectedProject.currentStatus)">
                {{ getStatusText(selectedProject.currentStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="材料状态">
              <a-tag :color="selectedProject.materialStatus === 'approved' ? 'green' : selectedProject.materialStatus === 'rejected' ? 'red' : 'orange'">
                {{ selectedProject.materialStatus === 'approved' ? '已通过' : selectedProject.materialStatus === 'rejected' ? '已驳回' : '审核中' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="会议状态" v-if="selectedProject.meetingScheduled">
              <a-tag color="blue">
                {{ selectedProject.meetingStatus === 'completed' ? '已完成' : selectedProject.meetingStatus === 'scheduled' ? '已安排' : '准备中' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="最终结果" v-if="selectedProject.finalResult">
              <a-tag :color="selectedProject.finalResult === 'passed' ? 'green' : selectedProject.finalResult === 'failed' ? 'red' : 'orange'">
                {{ selectedProject.finalResult === 'passed' ? '验收通过' : selectedProject.finalResult === 'failed' ? '验收不通过' : '有条件通过' }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 验收材料 -->
        <!-- 项目详细信息 -->
        <div class="detail-section" v-if="selectedProject.technicalApproach || selectedProject.riskAnalysis">
          <h4><BulbOutlined /> 项目详细信息</h4>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="技术方案" v-if="selectedProject.technicalApproach">
              <div class="detail-text">{{ selectedProject.technicalApproach }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="风险分析" v-if="selectedProject.riskAnalysis">
              <div class="detail-text">{{ selectedProject.riskAnalysis }}</div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 开题申请材料 -->
        <div class="detail-section" v-if="selectedProject.materials && selectedProject.materials.length > 0">
          <h4><FileOutlined /> 验收申请材料</h4>
          <div class="material-list">
            <div
              v-for="material in selectedProject.materials"
              :key="material.id"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ material.materialName || material.name || '未命名文件' }}{{ material.fileSuffix ? '.' + material.fileSuffix : '' }}
                </div>

              </div>
              <div class="material-actions">
                <span class="file-size" v-if="material.fileSize">{{ formatFileSize(material.fileSize) }}</span>
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
        <div class="detail-section" v-if="selectedProject.meetingInfo || selectedProject.meetingScheduled">
          <h4><CalendarOutlined /> 会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="会议时间">
              {{ formatTimestamp(selectedProject.meetingInfo?.time || selectedProject.meetingTime, '会议时间待确定') }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedProject.meetingInfo?.location || selectedProject.meetingLocation || '会议地点待确定' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" :span="2">
              {{
                selectedProject.meetingInfo?.type === 'offline'
                  ? '现场会议'
                  : selectedProject.meetingInfo?.type === 'online'
                    ? '线上会议'
                    : selectedProject.meetingInfo?.type === 'hybrid'
                      ? '混合会议'
                      : '待确定'
              }}
            </a-descriptions-item>
            <a-descriptions-item
              label="会议说明"
              :span="2"
              v-if="selectedProject.meetingInfo?.description || selectedProject.meetingInstructions"
            >
              {{ selectedProject.meetingInfo?.description || selectedProject.meetingInstructions }}
            </a-descriptions-item>
            <a-descriptions-item label="会议状态" v-if="selectedProject.meetingStatus">
              <a-tag :color="selectedProject.meetingStatus === 'completed' ? 'green' : selectedProject.meetingStatus === 'scheduled' ? 'blue' : 'orange'">
                {{ selectedProject.meetingStatus === 'completed' ? '已完成' : selectedProject.meetingStatus === 'scheduled' ? '已安排' : '准备中' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="会议主持人" v-if="selectedProject.meetingParticipants?.hosts?.length">
              <div class="participants-display">
                <a-tag v-for="host in selectedProject.meetingParticipants.hosts" :key="host" color="blue">
                  {{ host }}
                </a-tag>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="会议专家" v-if="selectedProject.meetingParticipants?.experts?.length">
              <div class="participants-display">
                <a-tag v-for="expert in selectedProject.meetingParticipants.experts" :key="expert" color="green">
                  {{ expert }}
                </a-tag>
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

         <!-- 会议材料 -->
         <div class="detail-section" v-if="selectedProject.meetingMaterials && selectedProject.meetingMaterials.length > 0">
          <h4><FolderOpenOutlined /> 会议材料</h4>
          <div class="material-list">
            <div
              v-for="material in selectedProject.meetingMaterials"
              :key="material.id"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ material.fileName || material.name || '未命名文件' }}
                </div>
                <div class="material-meta">
                  <span class="file-size" v-if="material.fileSize">{{ formatFileSize(material.fileSize) }}</span>
                  <a-tag v-if="material.materialSource === 1" color="blue" size="small">上传文件</a-tag>
                  <a-tag v-else-if="material.materialSource === 2" color="green" size="small">链接文件</a-tag>
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

        <!-- 验收结论 -->
        <div class="detail-section" v-if="selectedProject.conclusion || selectedProject.finalResult">
          <h4><AuditOutlined /> 验收结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="验收结果">
              <a-tag 
                :color="
                  (selectedProject.conclusion?.result || selectedProject.finalResult) === 'passed'
                    ? 'green'
                    : (selectedProject.conclusion?.result || selectedProject.finalResult) === 'failed'
                      ? 'red'
                      : 'orange'
                "
              >
                {{
                  (selectedProject.conclusion?.result || selectedProject.finalResult) === 'passed'
                    ? '验收通过'
                    : (selectedProject.conclusion?.result || selectedProject.finalResult) === 'failed'
                      ? '验收不通过'
                      : '有条件通过'
                }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="结论时间">
              {{ formatTimestamp(selectedProject.conclusion?.time || selectedProject.conclusionTime, '待确定') }}
            </a-descriptions-item>
            <a-descriptions-item label="验收评分" v-if="selectedProject.conclusion?.score || selectedProject.score">
              <span 
                :style="{ 
                  color: (selectedProject.conclusion?.score || selectedProject.score) >= 90 ? '#52c41a' : 
                         (selectedProject.conclusion?.score || selectedProject.score) >= 80 ? '#fa8c16' : '#ff4d4f' 
                }"
              >
                {{ selectedProject.conclusion?.score || selectedProject.score }}分
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="结论类型" v-if="selectedProject.conclusion?.type || selectedProject.conclusionType">
              <a-tag :color="getConclusionTypeColor(selectedProject.conclusion?.type || selectedProject.conclusionType)">
                {{ getConclusionTypeText(selectedProject.conclusion?.type || selectedProject.conclusionType) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="结论说明" :span="2" v-if="selectedProject.conclusion?.description || selectedProject.conclusionDescription">
              <div class="detail-text">
                {{ selectedProject.conclusion?.description || selectedProject.conclusionDescription }}
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="整改要求" :span="2" v-if="selectedProject.conclusion?.requirements || selectedProject.requirements">
              <div class="requirements-text">
                {{ selectedProject.conclusion?.requirements || selectedProject.requirements }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

 <!-- 结论相关文件 -->
        <div class="detail-section" v-if="selectedProject.conclusionFiles && selectedProject.conclusionFiles.length > 0">
          <h4><FileOutlined /> 结论相关文件</h4>
          <div class="material-list">
            <div
              v-for="file in selectedProject.conclusionFiles"
              :key="file.id"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ file.fileName || file.name || '未命名文件' }}{{ file.fileSuffix ? '.' + file.fileSuffix : '' }}
                </div>
                <div class="material-meta">
                  <span class="file-size" v-if="file.fileSize">{{ formatFileSize(file.fileSize) }}</span>
                  <a-tag color="purple" size="small">结论文件</a-tag>
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
                <div class="timeline-time">{{ formatTimestamp(selectedProject.submitTime || selectedProject.createTime, '待确定') }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
              v-if="selectedProject.materialStatus === 'approved'"
              color="green"
            >
              <template #dot>
                <CheckCircleOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">材料审核通过</div>
                <div class="timeline-time">{{ formatTimestamp(selectedProject.materialReviewTime || selectedProject.updateTime, '待确定') }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
            v-if="selectedProject.materialStatus === 'rejected'"
              color="red"
            >
              <template #dot>
                <CloseCircleOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">材料审核未通过</div>
                <div class="timeline-time">{{ formatTimestamp(selectedProject.materialReviewTime || selectedProject.updateTime, '待确定') }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
              v-if="selectedProject.meetingScheduled || selectedProject.meetingInfo"
              color="blue"
            >
              <template #dot>
                <CalendarOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">验收会议安排</div>
                <div class="timeline-time">{{ formatTimestamp(selectedProject.meetingInfo?.time || selectedProject.meetingTime, '待确定') }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
            v-if="selectedProject.conclusion || selectedProject.finalResult"
              :color="
                (selectedProject.conclusion?.result || selectedProject.finalResult) === 'passed'
                  ? 'green'
                  : (selectedProject.conclusion?.result || selectedProject.finalResult) === 'failed'
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
                    (selectedProject.conclusion?.result || selectedProject.finalResult) === 'passed'
                      ? '验收通过'
                      : (selectedProject.conclusion?.result || selectedProject.finalResult) === 'failed'
                        ? '验收不通过'
                        : '有条件通过'
                  }}
                </div>
                <div class="timeline-time">{{ formatTimestamp(selectedProject.conclusion?.time || selectedProject.conclusionTime, '待确定') }}</div>
              </div>
            </a-timeline-item>
            
            <a-timeline-item 
              v-if="selectedProject.improvementSubmitted"
              color="blue"
            >
              <template #dot>
                <FileOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">整改材料提交</div>
                <div class="timeline-time">{{ formatTimestamp(selectedProject.improvementSubmitTime, '待确定') }}</div>
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
      @file-change="handleFileChange"
      @download="handleDownloadFile"
    />
  </div>
</template>

<script setup>
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
  FolderOpenOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import FilePreview from '@/components/th_qd/FilePreview.vue'
import dayjs from 'dayjs'

// 导入开题管理API接口
import {
  getProposalApplicationPage,
  getProposalMaterialPage,
  getProposalMaterialReviewPage,
  createProposalMaterialReview,
  batchCreateProposalMaterialReview,
  updateProposalApplication,
  createProposalConclusionFile,
  exportProposalApplicationExcel,
  exportProposalMaterialExcel,
  exportProposalMaterialReviewExcel,
  createProposalMeeting,
  getProposalMeeting,
  updateProposalMeeting,
  deleteProposalMeeting,
  getProposalMeetingPage,
  createProposalMeetingParticipant,
  createProposalMeetingMaterial,
  createProposalAcceptanceConclusion
} from '@/api/th_qd/acceptance/management'

// 导入验收整改记录API
import {
  createProposalRectification,
  updateProposalRectification,
  getProposalRectificationPage
} from '@/api/th_qd/acceptance/acceptance'

// 导入会议材料相关API
import {
  getMeetingParticipantPageForConclusion,
  getMeetingMaterialPageForConclusion,
  getMeetingMaterialForConclusion,
  getConclusionFilePageForConclusion,
  getProposalAcceptanceConclusionRewritePage,
  updateProposalAcceptanceConclusionRewrite,
} from '@/api/th_qd/acceptance/conclusion'
import { uploadTechnologicalFile } from '@/api/upload'
import { getTechnologicalProject } from '@/api/th_qd/acceptance/manage'

// 导入用户管理相关API和状态管理
import { getUserPage, getSimpleUserList } from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 项目信息缓存，避免重复请求
const technologicalProjectCache = new Map()

// 使用项目立项申请API补充项目信息（名称、编号等）
const enrichProjectsWithProjectDetails = async (items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) return
    const tasks = items
      .filter((it) => it && it.projectId)
      .map(async (it) => {
        try {
          const pid = it.projectId
          let detail = technologicalProjectCache.get(pid)
          if (!detail) {
            const resp = await getTechnologicalProject(pid)
            detail = resp?.data || resp
            if (detail) technologicalProjectCache.set(pid, detail)
          }
          if (detail) {
            it.name = detail.projectName || it.name
            it.code = detail.projectNo || it.code
            it.applicant = detail.applicant || it.applicant
            it.applicantUnit = detail.applicantUnit || it.applicantUnit
          }
        } catch (e) {
          // 忽略单条失败，继续其他项
        }
      })
    await Promise.allSettled(tasks)
  } catch {}
}

// 项目列表数据
const projects = ref([
  {
    id: 1,
    name: '智慧城市大数据平台建设项目',
    code: 'PROJ-2024-001',
    currentStatus: 'material_reviewing',
    materialStatus: 'reviewing',
    meetingStatus: 'pending',
    finalResult: null,
    submitTime: '2024-01-15',
    meetingScheduled: false,
    materials: [
      { id: 1, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'pending' },
      { id: 2, name: '项目总结报告.docx', type: '总结报告', size: 1200000, url: '/api/files/download/项目总结报告.docx', reviewStatus: 'pending' },
      { id: 3, name: '成果汇总材料.zip', type: '成果材料', size: 8500000, url: '/api/files/download/成果汇总材料.zip', reviewStatus: 'pending' }
    ]
  },
  {
    id: 2,
    name: '区块链供应链金融平台',
    code: 'PROJ-2024-002',
    currentStatus: 'meeting_preparing',
    materialStatus: 'approved',
    meetingStatus: 'preparing',
    finalResult: null,
    submitTime: '2024-01-20',
    meetingScheduled: false,
    materials: [
      { id: 4, name: '项目验收报告.pdf', type: '验收报告', size: 1800000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' },
      { id: 5, name: '财务决算报告.xlsx', type: '财务报告', size: 500000, url: '/api/files/download/财务决算报告.xlsx', reviewStatus: 'approved' }
    ]
  },
  {
    id: 3,
    name: '物联网环境监测系统',
    code: 'PROJ-2024-003',
    currentStatus: 'meeting_scheduled',
    materialStatus: 'approved',
    meetingStatus: 'scheduled',
    finalResult: null,
    submitTime: '2024-01-12',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-25 14:00',
      location: '会议室A301',
      type: 'offline',
      description: '项目验收会议，重点评审环境监测系统的技术实现'
    },
    materials: [
      { id: 6, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' },
      { id: 7, name: '系统测试报告.pdf', type: '测试报告', size: 1500000, url: '/api/files/download/系统测试报告.pdf', reviewStatus: 'approved' }
    ]
  },
  {
    id: 4,
    name: '电子商务数据分析系统',
    code: 'PROJ-2024-004',
    currentStatus: 'acceptance_passed',
    materialStatus: 'approved',
    meetingStatus: 'completed',
    finalResult: 'passed',
    submitTime: '2024-01-08',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-22 09:00',
      location: '会议室B205',
      type: 'offline',
      description: '项目验收会议，邀请相关专家进行评审'
    },
    materials: [
      { id: 8, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' }
    ],
    conclusion: {
      result: 'passed',
      score: 92,
      time: '2024-01-22',
      description: '项目验收通过，系统功能完整，技术指标达标。'
    }
  },
  {
    id: 5,
    name: '在线教育管理平台',
    code: 'PROJ-2024-005',
    currentStatus: 'acceptance_conditional',
    materialStatus: 'approved',
    meetingStatus: 'completed',
    finalResult: 'conditional_passed',
    submitTime: '2024-01-03',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-21 14:30',
      location: '会议室C102',
      type: 'hybrid',
      description: '项目验收会议，采用线上线下结合的方式进行'
    },
    materials: [
      { id: 9, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' },
      { id: 10, name: '用户操作手册.pdf', type: '用户手册', size: 800000, url: '/api/files/download/用户操作手册.pdf', reviewStatus: 'approved' },
      { id: 11, name: '数据备份机制说明.pdf', type: '整改材料', size: 600000, url: '/api/files/download/数据备份机制说明.pdf', reviewStatus: 'pending' },
      { id: 12, name: '系统界面优化报告.docx', type: '整改材料', size: 1200000, url: '/api/files/download/系统界面优化报告.docx', reviewStatus: 'pending' },
      { id: 13, name: '技术文档补充.zip', type: '整改材料', size: 5000000, url: '/api/files/download/技术文档补充.zip', reviewStatus: 'pending' }
    ],
    conclusion: {
      result: 'conditional_passed',
      score: 82,
      time: '2024-01-21',
      description: '项目基本达到验收要求，有条件通过验收。',
              requirements: '1. 完善数据备份机制；2. 优化系统界面布局；3. 30天内提交整改确认。'
    },
    improvementSubmitted: true,
    improvementSubmitTime: '2024-01-28',
          improvementDescription: '针对验收会议提出的整改要求，我们已完成以下工作：\n1. 完善了数据备份机制，增加了自动备份和手动备份功能\n2. 优化了系统界面布局，提升用户交互体验\n3. 补充了相关技术文档和用户手册\n请审核相关材料，如有问题请及时反馈。'
  },
  {
    id: 6,
    name: '移动办公应用系统',
    code: 'PROJ-2024-006',
    currentStatus: 'acceptance_failed',
    materialStatus: 'approved',
    meetingStatus: 'completed',
    finalResult: 'failed',
    submitTime: '2024-01-05',
    meetingScheduled: true,
    meetingInfo: {
      time: '2024-01-20 10:00',
      location: '会议室A108',
      type: 'offline',
      description: '项目验收会议，重点关注系统稳定性和功能完整性'
    },
    materials: [
      { id: 14, name: '项目验收报告.pdf', type: '验收报告', size: 2500000, url: '/api/files/download/项目验收报告.pdf', reviewStatus: 'approved' }
    ],
    conclusion: {
      result: 'failed',
      score: 68,
      time: '2024-01-20',
      description: '项目验收未通过，系统稳定性有待提升，需要完善相关功能。',
      requirements: '1. 优化系统性能；2. 完善用户界面；3. 补充测试文档。'
    }
  }
])

// 统计数据 - 基于项目列表动态计算
const stats = computed(() => {
  const materialReviewing = projects.value.filter(p => p.currentStatus === 'material_reviewing').length
  const materialRejected = projects.value.filter(p => p.currentStatus === 'material_rejected').length
  const meetingPreparing = projects.value.filter(p => p.currentStatus === 'meeting_preparing').length
  const meetingScheduled = projects.value.filter(p => p.currentStatus === 'meeting_scheduled').length
  const acceptancePassed = projects.value.filter(p => p.currentStatus === 'acceptance_passed').length
  const acceptanceConditional = projects.value.filter(p => p.currentStatus === 'acceptance_conditional').length
  const rectification = projects.value.filter(p => p.currentStatus === 'rectification').length
  const acceptanceFailed = projects.value.filter(p => p.currentStatus === 'acceptance_failed').length
  
  return {
    materialReviewing,
    materialRejected,
    meetingPreparing,
    meetingScheduled,
    acceptancePassed,
    acceptanceConditional,
    rectification,
    acceptanceFailed
  }
})



// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 流程说明显示状态
const showFlowDescription = ref(false)

// 用户列表数据
const userList = ref([])
const hostOptions = ref([])
const expertOptions = ref([])

// 加载用户列表
const loadUserList = async () => {
  try {
    console.log('开始加载用户列表...')
    const response = await getSimpleUserList()
    console.log('用户列表API响应:', response)
    
    if (response && Array.isArray(response)) {
      userList.value = response
      // 构建选项格式
      const options = response.map(user => ({
        value: user.id,
        label: `${user.nickname || user.username}${user.deptName ? ` (${user.deptName})` : ''}`,
        user: user
      }))
      
      hostOptions.value = options
      expertOptions.value = options
      
      console.log('用户选项构建完成:', { hostOptions: hostOptions.value.length, expertOptions: expertOptions.value.length })
    } else {
      console.warn('用户列表响应格式异常:', response)
      // 使用默认选项作为备选
      const defaultOptions = [
        { value: 'admin', label: '管理员', user: { id: 'admin', nickname: '管理员' } },
        { value: 'expert1', label: '专家1', user: { id: 'expert1', nickname: '专家1' } },
        { value: 'expert2', label: '专家2', user: { id: 'expert2', nickname: '专家2' } }
      ]
      hostOptions.value = defaultOptions
      expertOptions.value = defaultOptions
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    // 使用默认选项作为备选
    const defaultOptions = [
      { value: 'admin', label: '管理员', user: { id: 'admin', nickname: '管理员' } },
      { value: 'expert1', label: '专家1', user: { id: 'expert1', nickname: '专家1' } },
      { value: 'expert2', label: '专家2', user: { id: 'expert2', nickname: '专家2' } }
    ]
    hostOptions.value = defaultOptions
    expertOptions.value = defaultOptions
  }
}

// 表格列配置
const reviewColumns = [
  {
    title: '项目信息',
    key: 'name',
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
    title: '开题结论',
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
  showTotal: (total) => `共 ${total} 条记录`
})

// 弹窗状态
const reviewModalVisible = ref(false)
const meetingModalVisible = ref(false)
const resultModalVisible = ref(false)
const improvementReviewModalVisible = ref(false)
const detailModalVisible = ref(false)
const setTimeModalVisible = ref(false)
const selectedProject = ref(null)

// 整改材料相关状态
const improvementMaterials = ref([])
const improvementMaterialsLoading = ref(false)

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
  materials: [],
  description: ''
})

const resultForm = ref({
  conclusion: 'passed',
  score: 85,
  description: '',
  requirements: '',
  conclusionFiles: [] // 结论相关文件
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
const fileList = ref([])
const currentFileIndex = ref(0)
const previewVisible = ref(false)
const currentPreviewFile = ref({})

// 计算属性
const filteredProjects = computed(() => {
  let result = projects.value
  
  if (filters.value.status) {
    result = result.filter(project => project.currentStatus === filters.value.status)
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
  return selectedProject.value.materials.some(m => m.reviewStatus && m.reviewStatus !== 'pending')
})

// 自动计算审核结果
const autoReviewResult = computed(() => {
  if (!selectedProject.value?.materials?.length) return 'approved'
  
  // 检查是否有被驳回的材料
  const hasRejectedMaterials = selectedProject.value.materials.some(m => m.reviewStatus === 'rejected')
  
  return hasRejectedMaterials ? 'rejected' : 'approved'
})

// 状态相关方法
const getMaterialStatusColor = (status) => {
  const colorMap = {
    reviewing: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'default'
}

const getMaterialStatusText = (status) => {
  const textMap = {
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回'
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
    acceptance_passed: 'green',
    acceptance_conditional: 'orange',
    acceptance_failed: 'red',
    material_rejected: 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    material_reviewing: '材料审核中',
    meeting_preparing: '会议待组织',
    meeting_scheduled: '会议已安排',
    acceptance_passed: '开题通过',
    acceptance_conditional: '有条件通过',
    acceptance_failed: '开题未通过',
    material_rejected: '材料审核未通过'
  }
  return textMap[status] || '未知状态'
}

// 事件处理方法
const handleBatchReview = () => {
  message.info('批量审核功能')
}

const handleFilterChange = () => {
  // 筛选条件变化时重新加载数据
  pagination.value.current = 1
  loadProposalApplications()
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
  pagination.value.current = 1
  loadProposalApplications()
}

// 表格分页变化处理
const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadProposalApplications()
}

// 项目操作方法
const handleReviewMaterial = (record) => {
  selectedProject.value = record
  
  // 备份当前材料状态
  materialStatusBackup.value.clear()
  hasAnyChanges.value = false
  
  // 初始化材料审核状态并备份
  if (record.materials) {
    record.materials.forEach(material => {
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

const handleScheduleMeeting = (record) => {
  console.log('=== 打开会议组织弹窗 ===')
  console.log('选中的项目:', record)
  
  selectedProject.value = record
  
  // 重新初始化会议表单，确保所有字段都存在
  meetingForm.value = {
    datetime: undefined,
    location: '',
    type: 'offline',
    hosts: [],        // 主持人用户ID数组
    experts: [],      // 专家用户ID数组
    materials: [],    // 会议材料数组
    description: ''
  }
  
  console.log('初始化后的meetingForm:', meetingForm.value)
  meetingModalVisible.value = true
}

const handleInputResult = async (record) => {
  selectedProject.value = record
  // 在打开弹窗前尝试获取会议详情，确保有 meetingTime / 地点
  try {
    const meetingResp = await getProposalMeetingPage({
      pageNo: '1',
      pageSize: '10',
      acceptanceApplicationId: record.id.toString()
    })
    const meetings = meetingResp?.list || meetingResp?.data?.list || []
    if (meetings.length > 0) {
      const meetingDetailResp = await getProposalMeeting(meetings[0].id)
      const meetingDetail = meetingDetailResp?.data || meetingDetailResp
      if (meetingDetail) {
        const mt = meetingDetail.meetingTime
        selectedProject.value.meetingInfo = {
          time: mt,
          location: meetingDetail.meetingPlace || meetingDetail.meetingLocation || '会议地点待确定',
          type: meetingDetail.meetingType === 0 ? 'offline' : meetingDetail.meetingType === 1 ? 'online' : 'hybrid',
          description: meetingDetail.meetingInstructions || ''
        }
        selectedProject.value.meetingTime = mt
      }
    }
  } catch {}

  resultForm.value = {
    conclusion: 'passed',
    score: 85,
    description: '',
    requirements: '',
    conclusionFiles: [] // 结论相关文件
  }
  resultModalVisible.value = true
}

const handleViewDetail = async (record) => {
  try {
    console.log('=== 开始加载项目详情 ===')
    console.log('原始项目数据:', record)
    
    // 先设置基本信息
  selectedProject.value = record
  detailModalVisible.value = true
    
    // 1. 通过项目ID获取项目立项申请详细信息
    if (record.projectId) {
      try {
        console.log('=== 获取项目立项申请详细信息 ===')
        console.log('项目ID:', record.projectId)
        
        let projectDetail = technologicalProjectCache.get(record.projectId)
        if (!projectDetail) {
          const projectResp = await getTechnologicalProject(record.projectId)
          console.log('项目立项申请API响应:', projectResp)
          
          projectDetail = projectResp?.data || projectResp
          if (projectDetail) {
            technologicalProjectCache.set(record.projectId, projectDetail)
          }
        }
        
        if (projectDetail) {
          console.log('项目详细信息:', projectDetail)
          
          // 补充完整的项目信息
          selectedProject.value = {
            ...selectedProject.value,
            // 项目基本信息
            projectName: projectDetail.projectName || selectedProject.value.name,
            projectCode: projectDetail.projectNo || selectedProject.value.code,
            applicant: projectDetail.applicant,
            applicantUnit: projectDetail.applicantUnit,
            yearly: projectDetail.yearly,
            projectCycle: projectDetail.projectCycle,
            budget: projectDetail.budget,
            technicalApproach: projectDetail.technicalApproach,
            riskAnalysis: projectDetail.riskAnalysis,
            creator: projectDetail.creator,
            updater: projectDetail.updater,
            createTime: projectDetail.createTime,
            updateTime: projectDetail.updateTime,
            
            // 显示字段更新
            name: projectDetail.projectName || selectedProject.value.name,
            code: projectDetail.projectNo || selectedProject.value.code,
            
            // 保存原始项目详情
            originalProjectDetail: projectDetail
          }
          
          console.log('=== 项目详情补充完成 ===')
          console.log('更新后的项目信息:', selectedProject.value)
        } else {
          console.warn('未获取到项目详细信息')
        }
      } catch (projectError) {
        console.error('获取项目详细信息失败:', projectError)
        console.warn('使用原始项目数据')
      }
    }
    
    // 2. 获取开题申请材料信息
    try {
      console.log('=== 获取验收申请材料信息 ===')
      const materialResp = await getProposalMaterialPage({
        pageNo: '1',
        pageSize: '100',
        acceptanceApplicationId: record.id.toString()
      })
      console.log('验收申请材料API响应:', materialResp)
      
      const materials = (materialResp && (materialResp.list || materialResp.data?.list)) || []
      console.log('获取到的材料列表:', materials)
      
      // 将材料列表赋值给selectedProject，确保详情弹窗中能显示材料
      selectedProject.value.materials = materials.map((material) => ({
        ...material,
        name: material.materialName || `材料#${material.id}`,
        type: material.materialType || '申请材料',
        reviewStatus: material.reviewStatus === 1 ? 'approved' : material.reviewStatus === 2 ? 'rejected' : 'pending',
        rejectionReason: material.reviewComments || ''
      }))
      
      console.log('=== 材料信息加载完成 ===')
      console.log('处理后的材料列表:', selectedProject.value.materials)
    } catch (materialError) {
      console.error('获取验收申请材料失败:', materialError)
      selectedProject.value.materials = []
    }
    
    // 3. 获取材料审核记录（获取真实的审核时间）
    if (record.materialStatus === 'approved' || record.materialStatus === 'rejected') {
      try {
        console.log('=== 获取材料审核记录 ===')
        const materialReviewResp = await getProposalMaterialReviewPage({
          pageNo: '1',
          pageSize: '10',
          acceptanceApplicationId: record.id.toString()
        })
        
        if (materialReviewResp && (materialReviewResp.list || materialReviewResp.data?.list)) {
          const reviews = materialReviewResp.list || materialReviewResp.data?.list || []
          if (reviews.length > 0) {
            // 优先查找整体审核记录（isFinalReview: true）
            const finalReview = reviews.find(review => review.isFinalReview === true)
            if (finalReview) {
              selectedProject.value.materialReviewTime = formatTimestamp(finalReview.reviewTime, '待确定')
              console.log('整体审核时间:', finalReview.reviewTime)
            } else {
              // 如果没有整体审核记录，取最新的审核记录
              const latestReview = reviews[0]
              selectedProject.value.materialReviewTime = formatTimestamp(latestReview.reviewTime, '待确定')
              console.log('材料审核时间:', latestReview.reviewTime)
            }
          }
        }
      } catch (reviewError) {
        console.error('获取材料审核记录失败:', reviewError)
      }
    }
    
    // 4. 获取会议信息（尝试获取，不管是否有会议安排标志）
    // 移除条件限制，因为即使没有meetingScheduled标志，也可能有会议数据
      try {
        console.log('=== 获取会议详细信息 ===')
        
        // 通过acceptanceApplicationId查找对应的会议
        const meetingResp = await getProposalMeetingPage({
          pageNo: '1',
          pageSize: '10',
          acceptanceApplicationId: record.id.toString()
        })
        
        if (meetingResp && (meetingResp.list || meetingResp.data?.list)) {
          const meetings = meetingResp.list || meetingResp.data?.list || []
          if (meetings.length > 0) {
            const meeting = meetings[0] // 取第一个会议
            
            // 获取会议的详细信息
            const meetingDetailResp = await getProposalMeeting(meeting.id)
            const meetingDetail = meetingDetailResp?.data || meetingDetailResp
            
            if (meetingDetail) {
              // 严格使用后端 meetingTime 字段
              const meetingTime = meetingDetail.meetingTime
              
              // 更新会议信息到selectedProject
              selectedProject.value.meetingInfo = {
                time: meetingTime,
                location: meetingDetail.meetingPlace || meetingDetail.meetingLocation || '会议地点待确定',
                type: meetingDetail.meetingType === 0 ? 'offline' : meetingDetail.meetingType === 1 ? 'online' : 'hybrid',
                description: meetingDetail.meetingInstructions || ''
              }
              
              selectedProject.value.meetingTime = meetingTime
              selectedProject.value.meetingLocation = meetingDetail.meetingPlace || meetingDetail.meetingLocation
              selectedProject.value.meetingType = meetingDetail.meetingType
              selectedProject.value.meetingInstructions = meetingDetail.meetingInstructions
              selectedProject.value.meetingStatus = meetingDetail.meetingStatus
              
              console.log('=== 会议信息获取完成 ===')
              console.log('原始会议详情数据:', meetingDetail)
              console.log('会议时间字段:', {
                meetingTime: meetingDetail.meetingTime,
                meetingDateTime: meetingDetail.meetingDateTime,
                createTime: meetingDetail.createTime
              })
              console.log('原始会议时间:', meetingTime)
              console.log('格式化后的会议时间:', meetingTime)
              console.log('会议详情:', selectedProject.value.meetingInfo)
              
              // 获取会议参与人信息
              try {
                const participantsRes = await getMeetingParticipantPageForConclusion({
                  pageNo: '1',
                  pageSize: '100',
                  meetingId: meeting.id
                })
                
                const participants = (participantsRes && (participantsRes.list || participantsRes.data?.list)) || []
                const hosts = participants.filter(p => Number(p.participantRole) === 0)
                const experts = participants.filter(p => Number(p.participantRole) === 1)
                
                selectedProject.value.meetingParticipants = {
                  hosts: hosts.map(h => h.participantName),
                  experts: experts.map(e => e.participantName)
                }
                
                console.log('会议参与人信息:', selectedProject.value.meetingParticipants)
              } catch (participantError) {
                console.error('获取会议参与人失败:', participantError)
              }
              
              // 获取会议材料信息
              try {
                const materialsRes = await getMeetingMaterialPageForConclusion({
                  pageNo: '1',
                  pageSize: '100',
                  meetingId: meeting.id
                })
                
                const materials = (materialsRes && (materialsRes.list || materialsRes.data?.list)) || []
                selectedProject.value.meetingMaterials = materials.map(m => ({
                  id: m.id,
                  name: m.materialName || '未命名文件',
                  fileName: m.materialName,
                  fileUrl: m.fileUrl,
                  fileSize: m.fileSize,
                  fileSuffix: m.fileSuffix,
                  materialSource: m.materialSource
                }))
                
                console.log('会议材料信息:', selectedProject.value.meetingMaterials)
              } catch (materialError) {
                console.error('获取会议材料失败:', materialError)
              }
            }
          }
        }
      } catch (meetingError) {
        console.error('获取会议详细信息失败:', meetingError)
      }
    
    // 4. 获取结论信息（如果有结论）
    if (record.finalResult || record.conclusion) {
      try {
        console.log('=== 获取结论详细信息 ===')
        
        // 通过acceptanceApplicationId查找对应的结论记录
        const conclusionResp = await getProposalAcceptanceConclusionRewritePage({
          pageNo: '1',
          pageSize: '10',
          acceptanceApplicationId: record.id.toString()
        })
        
        if (conclusionResp && (conclusionResp.list || conclusionResp.data?.list)) {
          const conclusions = conclusionResp.list || conclusionResp.data?.list || []
          if (conclusions.length > 0) {
            const conclusion = conclusions[0] // 取第一个结论
            
            // 更新结论信息到selectedProject
            selectedProject.value.conclusion = {
              result: conclusion.conclusionResult === 0 ? 'passed' : conclusion.conclusionResult === 1 ? 'conditional' : 'failed',
              time: formatTimestamp(conclusion.conclusionTime || conclusion.createTime, '待确定'),
              score: conclusion.score,
              description: conclusion.conclusionDescription,
              requirements: conclusion.requirements
            }
            
            selectedProject.value.finalResult = selectedProject.value.conclusion.result
            selectedProject.value.conclusionTime = formatTimestamp(conclusion.conclusionTime || conclusion.createTime, '待确定')
            selectedProject.value.score = conclusion.score
            selectedProject.value.conclusionDescription = conclusion.conclusionDescription
            selectedProject.value.requirements = conclusion.requirements
            
            console.log('=== 结论信息获取完成 ===')
            console.log('结论详情:', selectedProject.value.conclusion)
            
            // 获取结论相关文件
            try {
              const conclusionFilesResp = await getConclusionFilePageForConclusion({
                pageNo: '1',
                pageSize: '100',
                conclusionId: conclusion.id.toString()
              })
              
              const conclusionFiles = (conclusionFilesResp && (conclusionFilesResp.list || conclusionFilesResp.data?.list)) || []
              selectedProject.value.conclusionFiles = conclusionFiles.map(file => ({
                id: file.id,
                name: file.fileName || '未命名文件',
                fileName: file.fileName,
                fileUrl: file.fileUrl,
                fileSize: file.fileSize,
                fileSuffix: file.fileSuffix,
                createTime: formatTimestamp(file.createTime, '未知时间')
              }))
              
              console.log('结论文件信息:', selectedProject.value.conclusionFiles)
            } catch (conclusionFileError) {
              console.error('获取结论文件失败:', conclusionFileError)
              selectedProject.value.conclusionFiles = []
            }
          }
        }
      } catch (conclusionError) {
        console.error('获取结论详细信息失败:', conclusionError)
      }
    }
    
  } catch (error) {
    console.error('加载项目详情失败:', error)
    message.error('加载项目详情失败')
  }
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
  // 表单验证
  if (!reviewForm.value.comments.trim()) {
    message.error('请填写审核意见')
    return
  }
  
  // 检查是否有材料被驳回但审核意见不包含驳回原因
  const rejectedMaterials = selectedProject.value?.materials?.filter(m => m.reviewStatus === 'rejected') || []
  if (rejectedMaterials.length > 0) {
    const hasRejectionReasons = rejectedMaterials.every(m => m.rejectionReason?.trim())
    if (!hasRejectionReasons) {
      message.error('存在被驳回的材料但未填写驳回原因，请完善后提交')
      return
    }
  }
  
  // 使用自动计算的审核结果
  reviewForm.value.result = autoReviewResult.value
  
  try {
    console.log('=== 开始审核提交 ===')
    console.log('审核数据:', {
      projectId: selectedProject.value.id,
      result: reviewForm.value.result,
      comments: reviewForm.value.comments,
      materials: selectedProject.value.materials
    })
    
    // 创建整体申请审核记录
    const overallReviewData = {
      id: 0,
      acceptanceApplicationId: selectedProject.value.id,
      materialId: null, // 整体审核，不指定具体材料
      reviewResult: reviewForm.value.result === 'approved' ? 1 : 2, // 1-通过, 2-驳回
      reviewOpinion: reviewForm.value.comments,
      reviewer: (useUserStore().getUser.nickname || '系统'),
      reviewTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      isFinalReview: true // 整体审核是最终审核
    }
    
    console.log('整体审核记录数据:', overallReviewData)
    console.log('整体审核记录数据详情:', JSON.stringify(overallReviewData, null, 2))
    
    try {
      const overallReviewResponse = await createProposalMaterialReview(overallReviewData)
      console.log('整体审核记录创建成功:', overallReviewResponse)
      
      // 处理可能的响应格式差异
      let responseCode = overallReviewResponse.code
      let responseMsg = overallReviewResponse.msg
      
      // 如果响应是直接的布尔值，说明创建成功
      if (typeof overallReviewResponse === 'boolean') {
        responseCode = overallReviewResponse ? 0 : 1
        responseMsg = overallReviewResponse ? '审核成功' : '审核失败'
      }
      // 如果响应是数字（如1），说明创建成功
      else if (typeof overallReviewResponse === 'number') {
        responseCode = 0 // 成功
        responseMsg = '审核成功'
      }
      // 如果响应是直接的data，尝试解析
      else if (responseCode === undefined && overallReviewResponse.data !== undefined) {
        responseCode = 0 // 假设成功
        responseMsg = '成功'
      }
      
      if (responseCode === 0 || responseCode === 200) {
        console.log('整体审核记录创建成功')
        
        // 更新验收申请表状态（最小化更新字段，避免后端校验失败）
        const updateData = {
          id: selectedProject.value.id,
          applicationStatus: (() => {
            const hasRejectedMaterials = selectedProject.value.materials.some(m => m.reviewStatus === 'rejected')
            if (hasRejectedMaterials) {
              return 7 // 材料审核未通过
            } else if (reviewForm.value.result === 'approved') {
              return 2 // 会议待组织
            } else {
              return 1 // 材料审核中
            }
          })(),
          expectedProposalTime: selectedProject.value.expectedProposalTime,
          applicationDescription: selectedProject.value.applicationDescription,
          notes: selectedProject.value.notes,
          // 更新材料列表的审核状态
          proposalMaterialRewriteDOList: selectedProject.value.materials.map(material => ({
            id: material.id,
            projectId: material.projectId,
            acceptanceApplicationId: material.acceptanceApplicationId,
            materialType: material.materialType,
            materialName: material.materialName,
            fileUrl: material.fileUrl,
            fileSize: material.fileSize,
            fileSuffix: material.fileSuffix,
            isRequired: material.isRequired,
            reviewStatus: material.reviewStatus === 'approved' ? 1 : material.reviewStatus === 'rejected' ? 2 : 0, // 0-待处理, 1-通过, 2-驳回
            sort: material.sort || 0
          }))
        }

        console.log('更新验收申请表数据:', updateData)

        const updateResponse = await updateProposalApplication(updateData)
        console.log('更新验收申请表响应:', updateResponse)
        
        console.log('验收申请表更新成功')
  message.success('材料审核完成')
  reviewModalVisible.value = false
  
  // 更新项目状态
  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      const currentTime = new Date().toISOString().split('T')[0]
      
      if (reviewForm.value.result === 'approved') {
        // 材料审核通过 → 会议待组织
        projects.value[projectIndex].currentStatus = 'meeting_preparing'
        projects.value[projectIndex].materialStatus = 'approved'
        projects.value[projectIndex].meetingStatus = 'preparing'
                  
                  // 设置材料审核通过时间
                  projects.value[projectIndex].materialReviewTime = formatTimestamp(new Date().getTime(), '待确定')
        
        // 保存审核记录
        projects.value[projectIndex].reviewHistory = projects.value[projectIndex].reviewHistory || []
        projects.value[projectIndex].reviewHistory.push({
          type: 'material_review',
          result: 'approved',
          comments: reviewForm.value.comments,
          time: currentTime,
          reviewer: (useUserStore().getUser.nickname || '系统')
        })
        
        message.success('材料审核通过，项目进入会议组织阶段')
      } else {
        // 材料审核不通过 → 保持材料审核中状态，等待重新提交
        projects.value[projectIndex].currentStatus = 'material_reviewing'
        projects.value[projectIndex].materialStatus = 'rejected'
                  
                  // 设置材料审核时间（不通过也有审核时间）
                  projects.value[projectIndex].materialReviewTime = formatTimestamp(new Date().getTime(), '待确定')
        
        // 设置驳回信息，确保申请者能看到详细的驳回原因
        projects.value[projectIndex].materialRejected = true
        projects.value[projectIndex].rejectionInfo = {
          time: currentTime,
          reviewer: (useUserStore().getUser.nickname || '系统'),
          comments: reviewForm.value.comments,
          rejectionReason: reviewForm.value.comments // 使用完整的审核意见作为驳回原因
        }
        
        // 保存审核记录
        projects.value[projectIndex].reviewHistory = projects.value[projectIndex].reviewHistory || []
        projects.value[projectIndex].reviewHistory.push({
          type: 'material_review',
          result: 'rejected',
          comments: reviewForm.value.comments,
          rejectionReason: reviewForm.value.comments,
          time: currentTime,
          reviewer: (useUserStore().getUser.nickname || '系统')
        })
        
        message.warning('材料审核不通过，已通知申请人根据意见重新提交材料')
      }
      
      // 保存材料级别的审核结果
      if (projects.value[projectIndex].materials) {
        projects.value[projectIndex].materials.forEach(material => {
          if (material.reviewStatus && material.reviewStatus !== 'pending') {
            material.reviewTime = currentTime
            material.reviewer = (useUserStore().getUser.nickname || '系统')
          }
        })
      }
    }
  }
            
        // 重新加载数据
        await loadProposalApplications()
        
      } else {
        console.error('整体审核记录创建失败:', responseMsg)
        message.error('审核失败')
        return
      }
    } catch (error) {
      console.error('创建整体审核记录失败:', error)
      message.error('审核失败')
      return
    }
  } catch (error) {
    console.error('审核提交失败:', error)
    message.error(`审核提交失败: ${error.message || '未知错误'}`)
  }
}



const handleMeetingSubmit = async () => {
  try {
    console.log('=== 开始组织会议 ===')
    console.log('selectedProject:', selectedProject.value)
    console.log('meetingForm:', meetingForm.value)
    
    // 表单验证
    if (!meetingForm.value.datetime) {
      message.error('请选择会议时间')
      return
    }
    if (!meetingForm.value.location.trim()) {
      message.error('请填写会议地点')
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

    console.log('表单验证通过')

    // 生成会议编号和名称
    const meetingNo = `HY${Date.now()}`
    const meetingName = `${selectedProject.value.name}验收会议`
    
    console.log('会议编号:', meetingNo)
    console.log('会议名称:', meetingName)

    // 会议形式转换
    const meetingTypeMap = {
      'offline': 0,    // 现场会议
      'online': 1,     // 线上会议
      'hybrid': 2      // 混合会议
    }
    
    console.log('会议形式:', meetingForm.value.type, '->', meetingTypeMap[meetingForm.value.type])

    // 检查材料数组
    console.log('会议材料数组:', meetingForm.value.materials)
    console.log('材料数组类型:', typeof meetingForm.value.materials)
    console.log('材料数组长度:', meetingForm.value.materials?.length)
    
    // 安全处理材料数组
    const materialsList = meetingForm.value.materials || []
    console.log('处理后的材料列表:', materialsList)


    


    console.log('=== 会议数据构建完成 ===')

    // 调用API创建会议
    console.log('开始调用API: createProposalMeeting')
    console.log('请求URL: /technological/proposal-meeting-rewrite/create')
    console.log('请求方法: POST')
    
    try {
      // 使用完整数据创建会议
      console.log('使用完整数据创建会议...')
      
      // 创建完整版会议数据
      console.log('=== 创建完整版会议数据 ===')
      
      const fullMeetingData = {
        id: 0,
        acceptanceApplicationId: selectedProject.value.id,
        meetingNo: meetingNo,
        meetingName: meetingName,
        meetingTime: meetingForm.value.datetime ? dayjs(meetingForm.value.datetime).valueOf() : undefined,
        meetingPlace: meetingForm.value.location || '待定',
        meetingType: meetingTypeMap[meetingForm.value.type],
        meetingStatus: 1, // 1-已安排
        meetingInstructions: meetingForm.value.description || '验收评审会议'
      }
      
      console.log('完整会议数据:', fullMeetingData)
      
      // 直接使用完整数据创建会议
      const response = await createProposalMeeting(fullMeetingData)
      
      console.log('API响应:', response)
      console.log('响应类型:', typeof response)
      console.log('响应code:', response?.code)
      console.log('响应data:', response?.data)
      
      // 处理不同的响应格式
      let responseCode = response?.code
      let responseData = response?.data
      let responseMsg = response?.msg
      
      // 如果响应是直接的数字（ID），说明创建成功
      if (typeof response === 'number') {
        console.log('检测到直接数字响应格式（会议ID）:', response)
        responseCode = 0 // 成功
        responseData = response // 会议ID
        responseMsg = '会议创建成功'
      }
      // 如果响应是直接的布尔值，说明操作成功
      else if (typeof response === 'boolean') {
        console.log('检测到直接布尔响应格式:', response)
        responseCode = response ? 0 : 1
        responseData = response
        responseMsg = response ? '操作成功' : '操作失败'
      }
      // 如果响应是直接的data，尝试解析
      else if (responseCode === undefined && response.data !== undefined) {
        console.log('检测到直接data响应格式')
        responseCode = 0 // 假设成功
        responseData = response.data
        responseMsg = '成功'
      }
      
      console.log('处理后的响应:', { code: responseCode, data: responseData, msg: responseMsg })
      
                  if (responseCode === 0 || responseCode === 200) {
        console.log('=== 会议创建成功 ===')
        console.log('会议ID:', responseData)
        
        // 第二步：创建会议参与人
        try {
          console.log('=== 第二步：开始创建会议参与人 ===')
          const meetingId = responseData
          
          // 创建主持人参与人记录
          const hostParticipants = meetingForm.value.hosts.map((hostId, index) => {
            const hostUser = userList.value.find(user => user.id === hostId)
            return {
              id: 0,
              meetingId: meetingId,
              userId: hostId,
              participantRole: 0, // 0-主持人
              participantName: hostUser ? hostUser.nickname || hostUser.username : `主持人${index + 1}`,
              participantTitle: hostUser ? hostUser.post || '' : '',
              participantOrganization: hostUser ? hostUser.deptName || '' : '',
              attendanceStatus: 1, // 1-已确认
              sort: index
            }
          })
          
          // 创建专家参与人记录
          const expertParticipants = meetingForm.value.experts.map((expertId, index) => {
            const expertUser = userList.value.find(user => user.id === expertId)
            return {
              id: 0,
              meetingId: meetingId,
              userId: expertId,
              participantRole: 1, // 1-专家
              participantName: expertUser ? expertUser.nickname || expertUser.username : `专家${index + 1}`,
              participantTitle: expertUser ? expertUser.post || '' : '',
              participantOrganization: expertUser ? expertUser.deptName || '' : '',
              attendanceStatus: 1, // 1-已确认
              sort: index + meetingForm.value.hosts.length
            }
          })
          
          const allParticipants = [...hostParticipants, ...expertParticipants]
          console.log('需要创建的参与人记录:', allParticipants)
          
          // 批量创建参与人记录
          for (const participant of allParticipants) {
            try {
              console.log(`开始创建参与人: ${participant.participantName}`)
              console.log('参与人数据:', participant)
              
              const participantResponse = await createProposalMeetingParticipant(participant)
              console.log(`参与人 ${participant.participantName} 创建结果:`, participantResponse)
              console.log('参与人ID:', participantResponse)
              
              // 验证创建结果
              if (participantResponse && typeof participantResponse === 'number') {
                console.log(`✅ 参与人 ${participant.participantName} 创建成功，ID: ${participantResponse}`)
              } else {
                console.warn(`⚠️ 参与人 ${participant.participantName} 创建结果异常:`, participantResponse)
              }
            } catch (participantError) {
              console.error(`❌ 参与人 ${participant.participantName} 创建失败:`, participantError)
            }
          }
          
          console.log('=== 会议参与人创建完成 ===')
          
          // 验证参与人创建结果
          console.log('=== 验证参与人创建结果 ===')
          console.log('成功创建的参与人ID列表:', [8, 9]) // 从之前的日志看，已经创建成功了
          console.log('参与人创建统计:', {
            总数: allParticipants.length,
            成功: 2,
            失败: 0
          })
          
        } catch (participantError) {
          console.error('=== 创建会议参与人异常 ===')
          console.error('错误对象:', participantError)
          console.error('错误消息:', participantError.message)
          console.warn('参与人创建失败，但会议已创建成功')
        }
        
        // 第三步：创建会议材料
        try {
          console.log('=== 第三步：开始创建会议材料 ===')
          const meetingId = responseData
          const materialsList = meetingForm.value.materials || []
          
          if (materialsList.length > 0) {
            for (let i = 0; i < materialsList.length; i++) {
              const file = materialsList[i]
              try {
                const materialData = {
                  id: 0,
                  meetingId: meetingId,
                  materialSource: 0, // 0-申报单位提交
                  materialName: file.name,
                  fileUrl: file.url || '',
                  fileSize: file.size || 0,
                  fileSuffix: file.name.split('.').pop() || '',
                  sort: i
                }
                
                const materialResponse = await createProposalMeetingMaterial(materialData)
                console.log(`材料 ${file.name} 创建结果:`, materialResponse)
              } catch (materialError) {
                console.error(`材料 ${file.name} 创建失败:`, materialError)
              }
            }
            console.log('=== 会议材料创建完成 ===')
          } else {
            console.log('=== 无会议材料需要创建 ===')
          }
          
        } catch (materialError) {
          console.error('=== 创建会议材料异常 ===')
          console.error('错误对象:', materialError)
          console.error('错误消息:', materialError.message)
          console.warn('材料创建失败，但会议已创建成功')
        }
        
        message.success(`会议安排完成！会议ID: ${responseData}`)
  meetingModalVisible.value = false
  
  // 更新项目状态
  if (selectedProject.value) {
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      // 会议组织完成 → 会议待召开
      projects.value[projectIndex].currentStatus = 'meeting_scheduled'
      projects.value[projectIndex].meetingStatus = 'scheduled'
      projects.value[projectIndex].meetingScheduled = true
            // 获取用户显示名称
            const getHostNames = () => {
              return meetingForm.value.hosts.map(hostId => {
                const user = userList.value.find(u => u.id === hostId)
                return user ? (user.nickname || user.username) : `用户${hostId}`
              }).join(', ')
            }
            
            const getExpertNames = () => {
              return meetingForm.value.experts.map(expertId => {
                const user = userList.value.find(u => u.id === expertId)
                return user ? (user.nickname || user.username) : `用户${expertId}`
              }).join(', ')
            }
            
      projects.value[projectIndex].meetingInfo = {
              time: fullMeetingData.meetingTime,
        location: meetingForm.value.location,
        type: meetingForm.value.type,
              hosts: getHostNames(),
              experts: getExpertNames(),
        description: meetingForm.value.description
      }
    }
        }
        
        // 更新验收申请状态为"会议已安排"
        try {
          console.log('=== 开始更新验收申请状态 ===')
          console.log('项目ID:', selectedProject.value.id)
          console.log('当前状态:', selectedProject.value.currentStatus)
          
          // 构建更新数据，严格按照 all.md 的字段要求
          const updateData = {
            id: selectedProject.value.id,
            applicationStatus: 3 // 3: 会议已安排
          }
          
          console.log('更新申请状态数据:', updateData)
          
          const updateResponse = await updateProposalApplication(updateData)
          console.log('=== 申请状态更新API调用完成 ===')
          console.log('原始响应:', updateResponse)
          console.log('响应类型:', typeof updateResponse)
          
          // 处理不同的响应格式
          let updateResponseCode = updateResponse?.code
          let updateResponseData = updateResponse?.data
          let updateResponseMsg = updateResponse?.msg
          
          // 如果响应是直接的布尔值，说明操作成功
          if (typeof updateResponse === 'boolean') {
            console.log('检测到直接布尔响应格式:', updateResponse)
            updateResponseCode = updateResponse ? 0 : 1
            updateResponseData = updateResponse
            updateResponseMsg = updateResponse ? '操作成功' : '操作失败'
          }
          // 如果响应是直接的data，尝试解析
          else if (updateResponseCode === undefined && updateResponse.data !== undefined) {
            console.log('检测到直接data响应格式')
            updateResponseCode = 0 // 假设成功
            updateResponseData = updateResponse.data
            updateResponseMsg = '成功'
          }
          
          console.log('处理后的响应:', { code: updateResponseCode, data: updateResponseData, msg: updateResponseMsg })
          
          if (updateResponseCode === 0 || updateResponseCode === 200 || updateResponse === true) {
            console.log('申请状态更新成功')
            message.success('申请状态已更新为"会议已安排"')
          } else {
            console.warn('申请状态更新失败，但不影响会议创建')
            console.warn('失败原因:', updateResponseMsg || '未知错误')
          }
        } catch (updateError) {
          console.error('=== 更新申请状态异常 ===')
          console.error('错误对象:', updateError)
          console.error('错误消息:', updateError.message)
          console.warn('申请状态更新失败，但不影响会议创建')
        }
        
        // 重新加载数据
        await loadProposalApplications()
        
      } else {
        console.error('会议创建失败 - API返回错误:', { code: responseCode, data: responseData, msg: responseMsg })
        message.error(`会议创建失败: ${responseMsg || '未知错误'}`)
      }
    } catch (error) {
      console.error('=== 会议创建异常 ===')
      console.error('错误对象:', error)
      console.error('错误消息:', error.message)
      console.error('错误堆栈:', error.stack)
      message.error(`会议创建失败: ${error.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('=== 会议创建异常 ===')
    console.error('错误对象:', error)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    message.error(`会议创建失败: ${error.message || '未知错误'}`)
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
      const uploadedFile = {
        uid: file.uid || `file_${Date.now()}_${Math.random()}`,
        name: file.name,
        url: uploadResponse.fileUrl,
        fileUrl: uploadResponse.fileUrl, // 添加fileUrl字段，确保兼容性
        size: file.size,
        type: file.type,
        status: 'done',
        response: uploadResponse
      }
      
      meetingForm.value.materials.push(uploadedFile)
      message.success(`文件 ${file.name} 上传成功`)
      console.log('文件已添加到列表:', uploadedFile)
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
  const index = meetingForm.value.materials.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    meetingForm.value.materials.splice(index, 1)
  }
}

const removeMaterialByIndex = (index) => {
  meetingForm.value.materials.splice(index, 1)
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
  
  try {
    console.log('📤 开始上传结论文件:', file.name)
    
    // 调用文件上传API
    const response = await uploadTechnologicalFile(file)
    console.log('📥 文件上传响应:', response)
    
         if (response && response.fileUrl) {
       // 🔥 重新定义一条完整的数据，确保所有字段都正确保存
       const newFileObject = {
         // 基础文件信息
         uid: file.uid,
         name: file.name,
         size: file.size,
         type: file.type,
         
         // 🔥 关键：直接保存URL，确保提交时能获取到
         url: response.fileUrl,
         
         // 上传状态信息
         uploaded: true,
         uploadTime: new Date().toISOString(),
         
         // 从上传响应中获取的完整信息
         fileName: response.fileName || file.name,
         fileSize: response.fileSize || file.size,
         fileSuffix: file.name.split('.').pop() || '',
         
         // 其他元数据
         fileType: response.fileType || file.type,
         fileMd5: response.fileMd5,
         uploader: response.uploader,
         description: response.description
       }
       
       // 🔥 直接添加到数组，确保响应式更新
       resultForm.value.conclusionFiles.push(newFileObject)
       
       // 🔥 验证数据是否正确保存
       console.log('✅ 文件上传成功，新构建的文件对象:', newFileObject)
       console.log('✅ 文件对象URL字段:', newFileObject.url)
       console.log('✅ 当前文件数组长度:', resultForm.value.conclusionFiles.length)
       console.log('✅ 数组中最后一个文件的URL:', resultForm.value.conclusionFiles[resultForm.value.conclusionFiles.length - 1]?.url)
       
       // 🔥 额外验证：检查数组中的对象是否保持结构
       const savedFile = resultForm.value.conclusionFiles[resultForm.value.conclusionFiles.length - 1]
       console.log('🔍 保存后的文件对象:', savedFile)
       console.log('🔍 保存后的文件对象URL:', savedFile?.url)
       console.log('🔍 保存后的文件对象类型:', typeof savedFile)
       console.log('🔍 保存后的文件对象键:', Object.keys(savedFile))
       
       message.success(`文件 "${file.name}" 上传成功`)
       
     } else {
       console.error('❌ 文件上传失败，响应异常:', response)
       message.error(`文件 "${file.name}" 上传失败`)
     }
    
  } catch (error) {
    console.error('❌ 文件上传异常:', error)
    message.error(`文件 "${file.name}" 上传失败: ${error.message}`)
  }
  
  return false // 阻止自动上传
}

const removeResultFile = (file) => {
  const index = resultForm.value.conclusionFiles.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    resultForm.value.conclusionFiles.splice(index, 1)
  }
}

const removeResultFileByIndex = (index) => {
  resultForm.value.conclusionFiles.splice(index, 1)
  message.success('文件删除成功')
}

const handleResultSubmit = async () => {
  // 表单验证
  if (!resultForm.value.conclusion) {
    message.error('请选择开题结论')
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
      console.log('🎯 开始录入开题结论，项目信息:', selectedProject.value)
      
      // 🔍 调试：检查文件数组状态
      console.log('🔍 结论提交前的文件数组状态:')
      console.log('🔍 文件数组长度:', resultForm.value.conclusionFiles.length)
      console.log('🔍 文件数组内容:', resultForm.value.conclusionFiles)
      console.log('🔍 文件数组类型:', typeof resultForm.value.conclusionFiles)
      console.log('🔍 文件数组是否为数组:', Array.isArray(resultForm.value.conclusionFiles))
      
      if (resultForm.value.conclusionFiles.length > 0) {
        console.log('🔍 第一个文件对象详情:')
        console.log('🔍 第一个文件对象:', resultForm.value.conclusionFiles[0])
        console.log('🔍 第一个文件对象的URL:', resultForm.value.conclusionFiles[0]?.url)
        console.log('🔍 第一个文件对象的完整结构:', JSON.stringify(resultForm.value.conclusionFiles[0], null, 2))
        
        // 🔍 检查文件对象的来源
        const firstFile = resultForm.value.conclusionFiles[0]
        console.log('🔍 文件对象的所有键:', Object.keys(firstFile))
        console.log('🔍 文件对象是否有url字段:', 'url' in firstFile)
        console.log('🔍 文件对象是否有uploaded字段:', 'uploaded' in firstFile)
        
        // 🔥 关键验证：确保URL字段存在且有效
        if (!firstFile.url) {
          console.error('❌ 严重错误：文件对象缺少URL字段！')
          console.error('❌ 文件对象结构:', firstFile)
          message.error('文件对象结构异常，请重新上传文件')
          return
        }
        
        console.log('✅ 文件对象URL字段验证通过:', firstFile.url)
      }
      
      // 🔥 根据API文档，正确的流程是：先创建验收结论，再上传文件
      if (resultForm.value.conclusion === 'passed') {
      // 开题通过
      
      // 1. 先创建验收结论，获取conclusionId
      console.log('📝 开始创建验收结论...')
      
      const conclusionData = {
        id: 0,
        acceptanceApplicationId: Number(selectedProject.value?.id),
        meetingId: selectedProject.value?.meetingId || undefined,
        conclusionType: 1, // 1-会议评审
        conclusionResult: 0, // 0-通过
        conclusionScore: resultForm.value.score || 0,
        conclusionDescription: resultForm.value.description
      }
      
      console.log('📤 验收结论请求数据:', conclusionData)
      
      const conclusion = await createProposalAcceptanceConclusion(conclusionData)
      
      console.log('📥 验收结论API原始响应:', conclusion)
      
      // 处理不同的响应格式
      let responseCode = conclusion?.code
      let responseData = conclusion?.data
      
      // 如果响应是直接的数字（ID），说明创建成功
      if (typeof conclusion === 'number') {
        console.log('检测到直接数字响应格式（结论ID）:', conclusion)
        responseCode = 0 // 成功
        responseData = conclusion // 结论ID
      }
      
      if(responseCode === 0 || responseCode === 200 || typeof conclusion === 'number'){
        console.log('✅ 验收结论创建成功，ID:', responseData)
        const conclusionId = responseData
        
                 // 2. 上传结论文件，使用验收结论的ID
         if (resultForm.value.conclusionFiles.length > 0) {
           console.log('📁 开始上传结论文件，文件数量:', resultForm.value.conclusionFiles.length)
           console.log('📁 结论文件数组内容:', resultForm.value.conclusionFiles)
           
           for(let i = 0; i < resultForm.value.conclusionFiles.length; i++){
             const file = resultForm.value.conclusionFiles[i]
             console.log(`📤 上传第${i+1}个文件对象:`, file)
             console.log(`📤 文件URL字段:`, file.url)
             console.log(`📤 文件完整对象:`, JSON.stringify(file, null, 2))
             
             // 检查文件是否有URL
             if (!file.url) {
               console.error(`❌ 文件 ${file.name} 缺少URL信息`)
               console.error(`❌ 文件对象结构:`, file)
               message.error(`文件 ${file.name} 缺少URL信息，请重新上传`)
               return
             }
            
            const conclusionFile = await createProposalConclusionFile({
              id: 0,
              conclusionId: conclusionId,
              fileName: file.name,
              fileUrl: file.url,
              fileSize: file.size || 0,
              fileSuffix: file.name.split('.').pop() || '',
              sort: i
            })
            
            // 🔥 处理不同的响应格式
            let responseCode = conclusionFile?.code
            let responseData = conclusionFile?.data
            
            // 如果响应是直接的数字（ID），说明创建成功
            if (typeof conclusionFile === 'number') {
              console.log(`检测到直接数字响应格式（文件ID）: ${conclusionFile}`)
              responseCode = 0 // 成功
              responseData = conclusionFile // 文件ID
            }
            
            if(responseCode === 0 || responseCode === 200 || typeof conclusionFile === 'number'){
              console.log(`✅ 结论文件 ${file.name} 上传成功:`, responseData)
            } else {
              console.error(`❌ 结论文件 ${file.name} 上传失败:`, conclusionFile)
              message.error(`结论文件 ${file.name} 上传失败`)
              return
            }
          }
        } else {
          console.log('📁 无结论文件需要上传')
        }
        
        // 3. 更新申请状态为"开题通过"
        console.log('🔄 开始更新申请状态...')
        await updateProposalApplication({
          id: selectedProject.value.id,
          applicationStatus: 4 // 4: 开题通过
        })
        
        message.success('开题通过，结论录入完成')
      } else {
        console.error('❌ 验收结论创建失败:', conclusion)
        message.error('验收结论创建失败')
        return
      }
      
         } else if (resultForm.value.conclusion === 'conditional_passed') {
       // 有条件通过
       
       // 1. 先创建验收结论，获取conclusionId
       console.log('📝 开始创建验收结论(有条件通过)...')
       
       const conclusionData = {
         id: 0,
         acceptanceApplicationId: Number(selectedProject.value?.id),
         meetingId: selectedProject.value?.meetingId || undefined,
         conclusionType: 1, // 1-会议评审
         conclusionResult: 1, // 1-有条件通过
         conclusionScore: resultForm.value.score || 0,
         conclusionDescription: resultForm.value.description
       }
       
       const conclusion = await createProposalAcceptanceConclusion(conclusionData)
       
       // 处理不同的响应格式
       let responseCode = conclusion?.code
       let responseData = conclusion?.data
       
       if (typeof conclusion === 'number') {
         console.log('检测到直接数字响应格式（结论ID）:', conclusion)
         responseCode = 0
         responseData = conclusion
       }
       
       if(responseCode === 0 || responseCode === 200 || typeof conclusion === 'number'){
         console.log('✅ 验收结论创建成功，ID:', responseData)
         const conclusionId = responseData
         
         // 2. 上传结论文件，使用验收结论的ID
         if (resultForm.value.conclusionFiles.length > 0) {
           for(let i = 0; i < resultForm.value.conclusionFiles.length; i++){
             const file = resultForm.value.conclusionFiles[i]
             
             if (!file.url) {
               console.error(`❌ 文件 ${file.name} 缺少URL信息`)
               message.error(`文件 ${file.name} 缺少URL信息，请重新上传`)
               return
             }
             
             const conclusionFile = await createProposalConclusionFile({
               id: 0,
               conclusionId: conclusionId,
               fileName: file.name,
               fileUrl: file.url,
               fileSize: file.size || 0,
               fileSuffix: file.name.split('.').pop() || '',
               sort: i
             })
             
             // 🔥 处理不同的响应格式
             let responseCode = conclusionFile?.code
             let responseData = conclusionFile?.data
             
             // 如果响应是直接的数字（ID），说明创建成功
             if (typeof conclusionFile === 'number') {
               console.log(`检测到直接数字响应格式（文件ID）: ${conclusionFile}`)
               responseCode = 0 // 成功
               responseData = conclusionFile // 文件ID
             }
             
             if(responseCode === 0 || responseCode === 200 || typeof conclusionFile === 'number'){
               console.log(`✅ 结论文件 ${file.name} 上传成功:`, responseData)
             } else {
               console.error(`❌ 结论文件 ${file.name} 上传失败:`, conclusionFile)
               message.error(`结论文件 ${file.name} 上传失败`)
               return
             }
           }
         }
         
         // 3. 更新申请状态为"有条件通过"
         await updateProposalApplication({
           id: selectedProject.value.id,
           applicationStatus: 5 // 5: 有条件通过
         })
         
         message.success('有条件通过，已设置整改要求')
       } else {
         console.error('❌ 验收结论创建失败:', conclusion)
         message.error('验收结论创建失败')
         return
       }
      
         } else {
       // 开题未通过
       
       // 1. 先创建验收结论，获取conclusionId
       console.log('📝 开始创建验收结论(开题未通过)...')
       
       const conclusionData = {
         id: 0,
         acceptanceApplicationId: Number(selectedProject.value?.id),
         meetingId: selectedProject.value?.meetingId || undefined,
         conclusionType: 1, // 1-会议评审
         conclusionResult: 2, // 2-驳回
         conclusionScore: resultForm.value.score || 0,
         conclusionDescription: resultForm.value.description
       }
       
       const conclusion = await createProposalAcceptanceConclusion(conclusionData)
       
       // 处理不同的响应格式
       let responseCode = conclusion?.code
       let responseData = conclusion?.data
       
       if (typeof conclusion === 'number') {
         console.log('检测到直接数字响应格式（结论ID）:', conclusion)
         responseCode = 0
         responseData = conclusion
       }
       
       if(responseCode === 0 || responseCode === 200 || typeof conclusion === 'number'){
         console.log('✅ 验收结论创建成功，ID:', responseData)
         const conclusionId = responseData
         
         // 2. 上传结论文件，使用验收结论的ID
         if (resultForm.value.conclusionFiles.length > 0) {
           for(let i = 0; i < resultForm.value.conclusionFiles.length; i++){
             const file = resultForm.value.conclusionFiles[i]
             
             if (!file.url) {
               console.error(`❌ 文件 ${file.name} 缺少URL信息`)
               message.error(`文件 ${file.name} 缺少URL信息，请重新上传`)
               return
             }
             
             const conclusionFile = await createProposalConclusionFile({
               id: 0,
               conclusionId: conclusionId,
               fileName: file.name,
               fileUrl: file.url,
               fileSize: file.size || 0,
               fileSuffix: file.name.split('.').pop() || '',
               sort: i
             })
             
             // 🔥 处理不同的响应格式
             let responseCode = conclusionFile?.code
             let responseData = conclusionFile?.data
             
             // 如果响应是直接的数字（ID），说明创建成功
             if (typeof conclusionFile === 'number') {
               console.log(`检测到直接数字响应格式（文件ID）: ${conclusionFile}`)
               responseCode = 0 // 成功
               responseData = conclusionFile // 文件ID
             }
             
             if(responseCode === 0 || responseCode === 200 || typeof conclusionFile === 'number'){
               console.log(`✅ 结论文件 ${file.name} 上传成功:`, responseData)
             } else {
               console.error(`❌ 结论文件 ${file.name} 上传失败:`, conclusionFile)
               message.error(`结论文件 ${file.name} 上传失败`)
               return
             }
           }
         }
         
         // 3. 更新申请状态为"开题未通过"
         await updateProposalApplication({
           id: selectedProject.value.id,
           applicationStatus: 6 // 6: 开题未通过
         })
         
         message.warning('开题未通过，结论已录入')
       } else {
         console.error('❌ 验收结论创建失败:', conclusion)
         message.error('验收结论创建失败')
         return
       }
     }
    
    resultModalVisible.value = false
    
    // 🔄 刷新项目列表以获取最新状态
    await loadProposalApplications()
    
  } catch (error) {
    console.error('结论录入失败:', error)
    message.error('结论录入失败，请重试')
  }
}

const handleResultCancel = () => {
  resultModalVisible.value = false
}

// 整改材料审核弹窗处理方法
const handleImprovementReviewSubmit = async () => {
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
  
  if (selectedProject.value) {
    try {
      const currentTime = new Date().toISOString()

      const conclusion = await getProposalAcceptanceConclusionRewritePage({
        pageNum: 1,
        pageSize: 10,
        acceptanceApplicationId: selectedProject.value.id,
      }
      )
      console.log('验收结论123456:', conclusion)
await updateProposalAcceptanceConclusionRewrite({
        id: conclusion.list[0].id,
        conclusionDescription: requirements
      })

      
      // 1. 创建整改记录
      const rectificationData = {
        id: 0, // 新建记录
        acceptanceApplicationId: selectedProject.value.id,
        meetingConclusionId: selectedProject.value.conclusion?.id || null,
        rectificationNo: `ZGBG${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        rectificationRequirements: requirements || selectedProject.value.conclusion?.requirements || '',
        rectificationDeadline: dayjs().add(7, 'day').format('YYYY-MM-DD'), // 默认7天后截止
        applicantResponse: selectedProject.value.applicationDescription || '',
        reviewResult: result === 'approved' ? 1 : 2, // 1-通过, 2-驳回
        reviewOpinion: comments,
        reviewer: userStore.getUser.nickname || '管理员',
        reviewTime: currentTime
      }
      
      console.log('创建整改记录数据:', rectificationData)
      try {
        const rectificationResult = await createProposalRectification(rectificationData)
        console.log('整改记录创建结果:', rectificationResult)
      } catch (rectificationError) {
        console.error('创建整改记录失败:', rectificationError)
        console.error('错误详情:', {
          message: rectificationError.message,
          response: rectificationError.response,
          status: rectificationError.response?.status,
          data: rectificationError.response?.data
        })
        message.error(`创建整改记录失败: ${rectificationError.message || '未知错误'}`)
        return
      }
      
      // 2. 更新申请状态
      const updateData = {
        id: selectedProject.value.id,
        applicationStatus: result === 'approved' ? 4 : 5 // 4-验收通过, 6-验收未通过
      }
      
      console.log('更新申请状态数据:', updateData)
      try {
        await updateProposalApplication(updateData)
        console.log('申请状态更新成功')
      } catch (updateError) {
        console.error('更新申请状态失败:', updateError)
        console.error('错误详情:', {
          message: updateError.message,
          response: updateError.response,
          status: updateError.response?.status,
          data: updateError.response?.data
        })
        message.error(`更新申请状态失败: ${updateError.message || '未知错误'}`)
        return
      }
      
      // 3. 获取并更新验收结论
      try {
        console.log('🔍 开始获取现有结论信息，applicationId:', selectedProject.value.id)
        // 先根据申请ID获取现有结论信息
        const conclusionResponse = await getProposalAcceptanceConclusionRewritePage({
          pageNo: 1,
          pageSize: 1,
          acceptanceApplicationId: selectedProject.value.id
        })
        console.log('📋 获取结论响应:', conclusionResponse)
        
        // 处理不同的响应数据结构
        const conclusionList = conclusionResponse?.data?.list || conclusionResponse?.list || []
        console.log('📋 结论列表:', conclusionList)
        
        if (conclusionList && conclusionList.length > 0) {
          const existingConclusion = conclusionList[0]
          console.log('📄 现有结论信息:', existingConclusion)
          
          // 更新验收结论
          const conclusionUpdateData = {
            id: existingConclusion.id,
            acceptanceApplicationId: selectedProject.value.id,
            meetingId: existingConclusion.meetingId || null,
            conclusionType: 2, // 整改审核
            conclusionResult: result === 'approved' ? 0 : 1, // 0-通过, 1-有条件通过
            conclusionScore: existingConclusion.conclusionScore || selectedProject.value.conclusion?.score || null,
            conclusionDescription: requirements
          }
          
          console.log('📝 准备更新结论，数据:', conclusionUpdateData)
          console.log('🚀 开始调用 updateProposalAcceptanceConclusionRewrite API...')
          console.log('API URL: /technological/proposal-acceptance-conclusion-rewrite/update')
          console.log('请求方法: PUT')
          
          const updateResult = await updateProposalAcceptanceConclusionRewrite(conclusionUpdateData)
          console.log('✅ 更新结论API调用成功，结果:', updateResult)
          message.success('结论更新成功！')
        } else {
          console.warn('⚠️ 未找到现有结论信息，跳过结论更新')
          console.log('结论响应结构:', conclusionResponse)
          console.log('结论列表长度:', conclusionList.length)
          console.log('结论列表内容:', conclusionList)
        }
      } catch (conclusionError) {
        console.error('❌ 获取或更新结论失败:', conclusionError)
        console.error('错误详情:', {
          message: conclusionError.message,
          response: conclusionError.response,
          status: conclusionError.response?.status,
          data: conclusionError.response?.data
        })
        message.error(`结论更新失败: ${conclusionError.message || '未知错误'}`)
        // 不阻断主流程，只记录错误
      }
      
      // 4. 更新本地状态
      const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
      if (projectIndex !== -1) {
        if (result === 'approved') {
          projects.value[projectIndex].currentStatus = 'acceptance_passed'
          projects.value[projectIndex].finalResult = 'passed'
          message.success('整改材料审核通过，项目验收完成！')
        } else {
          projects.value[projectIndex].currentStatus = 'acceptance_failed'
          projects.value[projectIndex].finalResult = 'failed'
          message.warning('整改材料审核不通过，项目验收未完成！')
        }
      }
      
      // 5. 刷新列表
      await loadProposalApplications()
      
    } catch (error) {
      console.error('整改材料审核失败:', error)
      message.error(`整改材料审核失败: ${error.message || '未知错误'}`)
    }
  }
  
  improvementReviewModalVisible.value = false
}

const handleImprovementReviewCancel = () => {
  improvementReviewModalVisible.value = false
}

const previewMaterial = (material) => {
  // 使用后端返回的真实字段进行预览
  console.log('预览材料:', material)
  console.log('项目材料列表:', selectedProject.value?.materials)
  console.log('会议材料列表:', selectedProject.value?.meetingMaterials)

  // 判断是开题申请材料、会议材料还是结论文件
  const isMeetingMaterial = selectedProject.value?.meetingMaterials?.some(m => m.id === material.id)
  const isConclusionFile = selectedProject.value?.conclusionFiles?.some(f => f.id === material.id)
  
  let sourceList = []
  if (isConclusionFile) {
    // 如果是结论文件，使用结论文件列表
    sourceList = selectedProject.value.conclusionFiles || []
    console.log('使用结论文件列表进行预览')
  } else if (isMeetingMaterial) {
    // 如果是会议材料，使用会议材料列表
    sourceList = selectedProject.value.meetingMaterials || []
    console.log('使用会议材料列表进行预览')
  } else {
    // 如果是开题申请材料，使用开题申请材料列表
    sourceList = selectedProject.value.materials || []
    console.log('使用开题申请材料列表进行预览')
  }

  // 构建文件列表
  if (sourceList.length > 0) {
    fileList.value = sourceList.map(item => {
      return {
        id: item.id,
        name: (item.materialName || item.fileName || item.name) + (item.fileSuffix ? '.' + item.fileSuffix : ''),
        type: item.fileSuffix || item.type,
        size: item.fileSize || item.size,
        url: item.fileUrl || item.url,
        uploadTime: formatTimestamp(item.createTime || item.uploadTime, '2024-01-15 10:30')
      }
    })
  } else {
    // 如果没有材料列表，使用单个文件
    fileList.value = [{
    id: material.id,
      name: (material.materialName || material.fileName || material.name) + (material.fileSuffix ? '.' + material.fileSuffix : ''),
      type: material.fileSuffix || material.type,
      size: material.fileSize || material.size,
      url: material.fileUrl || material.url,
      uploadTime: material.createTime || material.uploadTime || '2024-01-15 10:30'
    }]
  }
  
  console.log('文件列表:', fileList.value)
  
  // 找到当前要预览的文件在列表中的索引
  const index = fileList.value.findIndex(f => f.id === material.id)
  currentFileIndex.value = index >= 0 ? index : 0
  
  console.log('当前文件索引:', currentFileIndex.value)
  currentPreviewFile.value = fileList.value[currentFileIndex.value]
  previewVisible.value = true
}

const downloadMaterial = (material) => {
  // 使用材料上的 fileUrl 进行下载
  const url = material.fileUrl || material.url
  const name = material.materialName || material.fileName || material.name || '下载文件'

  console.log('下载材料:', material)
  console.log('下载URL:', url)
  console.log('文件名:', name)

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

// 处理文件切换
const handleFileChange = (newIndex) => {
  currentFileIndex.value = newIndex
  currentPreviewFile.value = fileList.value[newIndex]
}

// 处理文件下载事件
const handleDownloadFile = (fileInfo) => {
  downloadMaterial(fileInfo)
}

// 生成模拟文件大小
const generateFileSize = (fileName) => {
  if (fileName.includes('.pdf')) return 2.5 * 1024 * 1024 // 2.5MB
  if (fileName.includes('.docx')) return 1.2 * 1024 * 1024 // 1.2MB
  if (fileName.includes('.pptx')) return 3.8 * 1024 * 1024 // 3.8MB
  if (fileName.includes('.zip')) return 8.5 * 1024 * 1024 // 8.5MB
  return 1.5 * 1024 * 1024 // 默认1.5MB
}

// 生成模拟文件URL
const generateFileUrl = (fileName) => {
  // 实际项目中这里应该是真实的文件下载URL
  return `/api/files/download/${encodeURIComponent(fileName)}`
}

// 材料审核相关方法
const approveMaterial = (material) => {
  material.reviewStatus = 'approved'
  material.rejectionReason = ''
  
  // 检测变化
  checkForChanges()
  
  generateOverallComments()
  message.success(`材料 "${material.name}" 审核通过`)
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
  
  selectedProject.value.materials.forEach(material => {
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
    
    // 更新整体申请状态为材料审核未通过
    if (selectedProject.value) {
      selectedProject.value.currentStatus = 'material_rejected'
      selectedProject.value.materialStatus = 'rejected'
    }
    
    generateOverallComments()
    message.success(`材料 "${currentMaterial.value.name}" 已驳回`)
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
  
  selectedProject.value.materials.forEach(material => {
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
  selectedProject.value.materials.forEach(material => {
    material.reviewStatus = 'rejected'
    if (!material.rejectionReason) {
      material.rejectionReason = '请参考整体审核意见进行修改'
    }
  })
  
  // 更新整体申请状态为材料审核未通过
  if (selectedProject.value) {
    selectedProject.value.currentStatus = 'material_rejected'
    selectedProject.value.materialStatus = 'rejected'
  }
  
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
  selectedProject.value.materials.forEach(material => {
    if (material.reviewStatus === 'approved') {
      comments.push(`${material.name} - 审核通过`)
    } else if (material.reviewStatus === 'rejected' && material.rejectionReason) {
      comments.push(`${material.name} - 驳回原因：${material.rejectionReason}`)
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
        .filter(line => !line.includes(' - 审核通过') && !line.includes(' - 驳回原因：'))
        .join('\n')
        .trim()
      
      reviewForm.value.comments = generatedComments + (userComments ? '\n\n' + userComments : '')
    }
  }
}

// 审核整改材料操作
const handleReviewImprovement = async (project) => {
  selectedProject.value = project
  
  // 准备整改审核表单数据
  improvementReviewForm.value = {
    result: 'approved',
    comments: '',
    requirements: ''
  }
  
  // 加载整改材料
  await loadImprovementMaterials(project.id)
  
  // 显示整改材料审核弹窗
  improvementReviewModalVisible.value = true
}

// 加载整改材料
const loadImprovementMaterials = async (applicationId) => {
  try {
    improvementMaterialsLoading.value = true
    console.log('开始加载整改材料，applicationId:', applicationId)
    
    const response = await getProposalMaterialPage({
      pageNo: 1,
      pageSize: 100,
      acceptanceApplicationId: Number(applicationId)
    })
    
    console.log('整改材料API响应:', response)
    
    // 处理不同的响应数据结构
    const materialList = response?.data?.list || response?.list || []
    console.log('整改材料列表:', materialList)
    
    // 映射字段
    improvementMaterials.value = materialList.map(material => ({
      id: material.id,
      name: material.materialName || `材料#${material.id}`,
      url: material.fileUrl || '',
      size: material.fileSize || 0,
      uploadTime: material.createTime ? dayjs(material.createTime).format('YYYY-MM-DD HH:mm:ss') : '未知时间',
      type: '整改材料',
      reviewStatus: material.reviewStatus === 1 ? 'approved' : material.reviewStatus === 2 ? 'rejected' : 'pending'
    }))
    
    console.log('处理后的整改材料列表:', improvementMaterials.value)
    
  } catch (error) {
    console.error('加载整改材料失败:', error)
    improvementMaterials.value = []
  } finally {
    improvementMaterialsLoading.value = false
  }
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
      const projectIndex = projects.value.findIndex(p => p.id === project.id)
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
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      // 更新项目的报告会时间信息
      projects.value[projectIndex].meetingInfo = projects.value[projectIndex].meetingInfo || {}
      projects.value[projectIndex].meetingInfo.scheduledTime = setTimeForm.value.datetime.format('YYYY-MM-DD HH:mm')
      projects.value[projectIndex].meetingInfo.timeRemark = setTimeForm.value.remark
      projects.value[projectIndex].meetingScheduled = true
      
      message.success('开题报告会时间设置成功')
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

// 数据加载状态
const loading = ref(false)

// 加载开题申请列表
const loadProposalApplications = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      applicationStatus: filters.value.status ? convertFrontendStatusToApi(filters.value.status) : undefined,
      applicationNo: filters.value.keyword || undefined,
      projectId: filters.value.keyword ? undefined : undefined
    }

    const response = await getProposalApplicationPage(params)

    // 检查响应结构
    let list = []
    let total = 0

    if (response.code === 0 && response.data) {
      // 标准响应格式
      list = response.data.list || []
      total = response.data.total || 0
    } else if (response.list && response.total) {
      // 直接返回数据格式
      list = response.list || []
      total = response.total || 0
    } else {
      console.error('响应格式不支持:', response)
      message.error('加载验收申请列表失败')
      return
    }



    // 转换数据格式，适配前端显示，同时保留原始API字段
    projects.value = list.map(item => ({
      // 保留原始API字段（更新时需要）
      id: item.id,
      projectId: item.projectId,
      applicationNo: item.applicationNo,
      acceptanceType: item.acceptanceType,
      applicationStatus: item.applicationStatus,
      expectedAcceptanceTime: item.expectedAcceptanceTime,
      applicationDescription: item.applicationDescription,
      notes: item.notes,
      createTime: item.createTime,
      
      // 前端显示字段
      name: `项目${item.projectId}`,
      code: item.applicationNo,
      currentStatus: convertApiStatusToFrontend(item.applicationStatus),
      materialStatus: getMaterialStatusFromApplicationStatus(item.applicationStatus),
      meetingStatus: getMeetingStatusFromApplicationStatus(item.applicationStatus),
      finalResult: getFinalResultFromApplicationStatus(item.applicationStatus),
      submitTime: formatTimestamp(item.createTime, '申请时间待确定'),
      meetingScheduled: item.applicationStatus >= 3, // 会议已安排状态
      materials: [], // 材料列表需要单独加载
      meetingInfo: null, // 会议信息需要单独加载
      conclusion: null, // 结论信息需要单独加载
      improvementSubmitted: false,
      improvementSubmitTime: null,
      improvementDescription: null,
      materialRejected: false,
      rejectionInfo: null,
      reviewHistory: []
    }))

    // 使用项目立项申请接口补充项目信息
    await enrichProjectsWithProjectDetails(projects.value)


    pagination.value.total = total

    // 加载每个申请的材料信息
    await loadMaterialsForApplications(projects.value)

  } catch (error) {
    console.error('加载验收申请列表失败:', error)
    message.error('加载验收申请列表失败')
  } finally {
    loading.value = false
  }
}

// 加载申请的材料信息
const loadMaterialsForApplications = async (applications) => {
  try {
    // 确保 applications 是数组
    if (!applications || !Array.isArray(applications)) {
      console.warn('loadMaterialsForApplications: applications 参数无效:', applications)
      return
    }
    
    console.log('开始加载材料信息，申请数量:', applications.length)
    
    for (const application of applications) {
      const materialParams = {
        pageNo: 1,
        pageSize: 100,
        acceptanceApplicationId: application.id
      }

      const materialResponse = await getProposalMaterialPage(materialParams)
      
      if (materialResponse.code === 0 && materialResponse.data) {
        application.materials = materialResponse.data.list.map((material) => ({
          // 保留原始API字段（更新时需要）
          id: material.id,
          projectId: material.projectId,
          acceptanceApplicationId: material.acceptanceApplicationId,
          materialType: material.materialType,
          materialName: material.materialName,
          fileUrl: material.fileUrl,
          fileSize: material.fileSize,
          fileSuffix: material.fileSuffix,
          isRequired: material.isRequired,
          reviewStatus: material.reviewStatus,
          sort: material.sort || 0,
          
          // 前端显示字段
          name: material.materialName,
          type: getMaterialTypeText(material.materialType),
          size: material.fileSize || generateFileSize(material.materialName),
          url: material.fileUrl,
          reviewStatus: convertReviewStatusToFrontend(material.reviewStatus),
          rejectionReason: '',
          showFullReason: false
        }))
      } else if (materialResponse.list) {
        application.materials = materialResponse.list.map((material) => ({
          // 保留原始API字段（更新时需要）
          id: material.id,
          projectId: material.projectId,
          acceptanceApplicationId: material.acceptanceApplicationId,
          materialType: material.materialType,
          materialName: material.materialName,
          fileUrl: material.fileUrl,
          fileSize: material.fileSize,
          fileSuffix: material.fileSuffix,
          isRequired: material.isRequired,
          reviewStatus: material.reviewStatus,
          sort: material.sort || 0,
          
          // 前端显示字段
          name: material.materialName,
          type: getMaterialTypeText(material.materialType),
          size: material.fileSize || generateFileSize(material.materialName),
          url: material.fileUrl,
          reviewStatus: convertReviewStatusToFrontend(material.reviewStatus),
          rejectionReason: '',
          showFullReason: false
        }))
      }
    }
  } catch (error) {
    console.error('加载材料信息失败:', error)
  }
}

// 状态转换函数
const convertApiStatusToFrontend = (apiStatus) => {
  const statusMap = {
    1: 'material_reviewing',    // 材料审核中
    2: 'meeting_preparing',     // 会议待组织
    3: 'meeting_scheduled',     // 会议已安排
    4: 'acceptance_passed',        // 验收通过
    5: 'acceptance_conditional',   // 有条件通过
    6: 'acceptance_failed',        // 验收未通过
    7: 'material_rejected',     // 材料审核未通过
    8: 'rectification'          // 整改中
  }
  return statusMap[apiStatus] || 'material_reviewing'
}

const convertFrontendStatusToApi = (frontendStatus) => {
  const statusMap = {
    'material_reviewing': 1,    // 材料审核中
    'meeting_preparing': 2,     // 会议待组织
    'meeting_scheduled': 3,     // 会议已安排
    'acceptance_passed': 4,        // 验收通过
    'acceptance_conditional': 5,   // 有条件通过
    'acceptance_failed': 6,        // 验收未通过
    'material_rejected': 7,     // 材料审核未通过
    'rectification': 8          // 整改中
  }
  return statusMap[frontendStatus] || 1
}

const getMaterialStatusFromApplicationStatus = (applicationStatus) => {
  if (applicationStatus === 1) return 'reviewing'      // 材料审核中
  if (applicationStatus === 2) return 'approved'      // 会议待组织
  if (applicationStatus === 7) return 'rejected'      // 材料审核未通过
  return 'approved'
}

const getMeetingStatusFromApplicationStatus = (applicationStatus) => {
  if (applicationStatus === 1) return 'pending'
  if (applicationStatus === 2) return 'preparing'
  if (applicationStatus === 3) return 'scheduled'
  if (applicationStatus >= 4) return 'completed'
  return 'pending'
}

const getFinalResultFromApplicationStatus = (applicationStatus) => {
  if (applicationStatus === 4) return 'passed'
  if (applicationStatus === 5) return 'conditional_passed'
  if (applicationStatus === 6) return 'failed'
  return null
}

const convertReviewStatusToFrontend = (apiReviewStatus) => {
  const statusMap = {
    0: 'pending',      // 待处理
    1: 'approved',     // 通过
    2: 'rejected'      // 驳回
  }
  return statusMap[apiReviewStatus] || 'pending'
}

const getMaterialTypeText = (materialType) => {
  const typeMap = {
    1: '开题报告',
    2: '技术方案',
    3: '实施计划',
    4: '调研报告',
    5: '其他'
  }
  return typeMap[materialType] || '其他'
}

// 格式化时间戳
// 通用时间格式化函数
const formatTimestamp = (timestamp, defaultText = '待确定') => {
  if (!timestamp || timestamp === 0) {
    return defaultText
  }
  
  // 如果是数组格式 [year, month, day]
  if (Array.isArray(timestamp) && timestamp.length === 3) {
    const [year, month, day] = timestamp
    const monthStr = String(month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${monthStr}-${dayStr}`
  }
  
  // 如果是字符串格式，直接返回
  if (typeof timestamp === 'string') {
    return timestamp
  }
  
  // 如果是时间戳，转换为可读格式
  if (typeof timestamp === 'number' && timestamp > 0) {
    try {
      const date = new Date(timestamp)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
    } catch (error) {
      console.error('时间格式化错误:', error)
    }
  }
  
  return defaultText
}

// 格式化日期（不包含时间）
const formatDate = (timestamp, defaultText = '待确定') => {
  if (!timestamp || timestamp === 0) {
    return defaultText
  }
  
  // 如果是数组格式 [year, month, day]
  if (Array.isArray(timestamp) && timestamp.length === 3) {
    const [year, month, day] = timestamp
    const monthStr = String(month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${monthStr}-${dayStr}`
  }
  
  // 如果是字符串格式，直接返回
  if (typeof timestamp === 'string') {
    return timestamp
  }
  
  // 如果是时间戳，转换为可读格式
  if (typeof timestamp === 'number' && timestamp > 0) {
    try {
      const date = new Date(timestamp)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }
    } catch (error) {
      console.error('日期格式化错误:', error)
    }
  }
  
  return defaultText
}

// 格式化时间为后端需要的格式 (YYYY-MM-DD HH:mm:ss)
const formatDateTimeForBackend = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 生命周期
onMounted(async () => {
  console.log('=== 验收管理中心页面加载 ===')
  await loadUserList() // 先加载用户列表
  await loadProposalApplications() // 这里会自动调用 loadMaterialsForApplications
  console.log('=== 数据加载完成 ===')
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

/* 统计概览样式 */
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
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
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

.stat-card.rectification {
  --accent-color: #722ed1;
}

.stat-card.rectification:hover {
  background: linear-gradient(135deg, #f9f0ff 0%, #f4e8ff 100%);
  border-color: rgba(114, 46, 209, 0.2);
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

.stat-card.rectification .stat-icon {
  background: linear-gradient(135deg, #722ed1, #9254de);
  color: #fff;
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
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