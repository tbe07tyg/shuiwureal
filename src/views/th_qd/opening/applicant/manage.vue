<!--
 * @file 开题申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的开题申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化，复制验收模块完整功能
-->
<template>
  <div class="applicant-manage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">开题申请管理</h1>
        <p class="page-description">查看和管理您提交的项目开题申请</p>
      </div>
      <div class="header-actions">
        <a-button @click="refreshData" :loading="loading">
          <ReloadOutlined />
          刷新数据
        </a-button>
        <a-button type="primary" @click="goToSubmit">
          <PlusOutlined />
          提交新申请
        </a-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
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
        <div class="stat-card completed" @click="handleStatCardClick('opening_passed')">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.openingPassed }}</div>
            <div class="stat-label">开题通过</div>
          </div>
        </div>
        <div class="stat-card conditional" @click="handleStatCardClick('opening_conditional')">
          <div class="stat-icon">
            <BulbOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.openingConditional }}</div>
            <div class="stat-label">有条件通过</div>
          </div>
        </div>
        <div class="stat-card rejected" @click="handleStatCardClick('opening_failed')">
          <div class="stat-icon">
            <CloseCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.openingFailed }}</div>
            <div class="stat-label">开题未通过</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 开题流程说明 -->
    <a-card class="flow-description" title="开题流程说明" :bordered="false">
      <template #extra>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </template>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="提交申请" description="准备材料并提交开题申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员审核开题材料
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
                等待管理员组织开题答辩会议
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="开题结论" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果获得最终结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">开题通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">开题未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </a-card>

    <!-- 申请列表 -->
    <a-card :bordered="false">
      <template #title>
        <div class="card-title-with-total">
          <span>我的开题申请</span>
          <a-badge :count="stats.total" :number-style="{ backgroundColor: '#1890ff' }" />
        </div>
      </template>
      <template #extra>
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
            <a-select-option value="opening_passed">开题通过</a-select-option>
            <a-select-option value="opening_conditional">有条件通过</a-select-option>
            <a-select-option value="opening_failed">开题未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="filteredApplications"
        :pagination="{
          ...pagination,
          onChange: handlePaginationChange,
          onShowSizeChange: handlePaginationChange
        }"
        :loading="loading"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'projectInfo'">
            <div class="project-info">
              <div class="project-name">{{ record.projectName }}</div>
              <div class="project-code">{{ record.projectCode }}</div>
                <div class="project-meta" v-if="record.applicant || record.applicantUnit">
                  <span v-if="record.applicant" class="applicant">申请人: {{ record.applicant }}</span>
                  <span v-if="record.applicantUnit" class="applicant-unit">{{ record.applicantUnit }}</span>
                </div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'progress'">
            <div class="progress-info">
              <a-progress 
                :percent="getProgressPercent(record.status)" 
                size="small"
                :status="getProgressStatus(record.status)"
              />
              <div class="progress-text">{{ getProgressText(record.status, record) }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <!-- 只有材料审核未通过状态才显示重新提交材料按钮 -->
              <a-button 
                v-if="record.status === 'material_rejected'" 
                type="primary" 
                size="small" 
                @click="handleResubmitMaterial(record)"
              >
                重新提交材料
              </a-button>
              <a-button 
                v-if="record.status === 'opening_conditional'" 
                type="primary" 
                size="small" 
                @click="handleSubmitImprovement(record)"
              >
                提交整改材料
              </a-button>
              <a-button 
                v-if="record.status === 'opening_failed'" 
                type="primary" 
                size="small" 
                @click="handleResubmit(record)"
              >
                重新提交申请
              </a-button>

              <!-- 为开题未通过和有条件通过状态添加结论说明按钮 -->
              <a-button
                v-if="record.status === 'opening_failed' || record.status === 'opening_conditional'"
                size="small"
                @click="handleViewConclusionDetails(record)"
              >
                查看结论
              </a-button>

              <!-- 只有材料审核未通过状态才显示查看驳回原因按钮 -->
              <a-button 
                v-if="record.status === 'material_rejected'" 
                size="small" 
                @click="handleViewRejectionDetails(record)"
              >
                查看驳回原因
              </a-button>
              
              <!-- 为材料审核中状态添加取消申请按钮 -->
              <a-button
                v-if="record.status === 'material_reviewing'"
                type="danger"
                size="small"
                class="cancel-application-btn"
                @click="handleCancelApplication(record)"
              >
                取消申请
              </a-button>
              <a-button 
                size="small" 
                @click="handleViewDetails(record)"
              >
                查看详情
              </a-button>
              <a-dropdown v-if="getMoreActions(record).length > 0">
                <!-- <a-button type="link" size="small">
                  更多 <DownOutlined />
                </a-button> -->
                <template #overlay>
                  <a-menu @click="handleMoreAction($event, record)">
                    <a-menu-item 
                      v-for="action in getMoreActions(record)" 
                      :key="action.key"
                    >
                      {{ action.label }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

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
              {{ selectedProject.name || selectedProject.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.code || selectedProject.projectCode }}
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
              <a-tag :color="getStatusColor(selectedProject.status || selectedProject.currentStatus)">
                {{ getStatusText(selectedProject.status || selectedProject.currentStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="材料状态" v-if="selectedProject.materialStatus">
              <a-tag :color="selectedProject.materialStatus === 'approved' ? 'green' : selectedProject.materialStatus === 'rejected' ? 'red' : 'orange'">
                {{ selectedProject.materialStatus === 'approved' ? '已通过' : selectedProject.materialStatus === 'rejected' ? '已驳回' : '审核中' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="材料审核时间" v-if="selectedProject.materialReviewTime">
              {{ selectedProject.materialReviewTime }}
            </a-descriptions-item>
          </a-descriptions>
  </div>

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
          <h4><FileOutlined /> 开题申请材料</h4>
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
                <div class="material-meta">
                  <!-- <span class="material-type">{{ material.materialType || material.type || '申请材料' }}</span> -->
                  <span class="file-size" v-if="material.fileSize">{{ formatFileSize(material.fileSize) }}</span>
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
                <div class="material-rejection" v-if="material.reviewStatus === 'rejected' && material.rejectionReason">
                  <a-alert type="error" :message="`驳回原因：${material.rejectionReason}`" show-icon />
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

        <!-- 申请说明 -->
        <!-- <div class="detail-section" v-if="selectedProject.description || selectedProject.applicationDescription">
          <h4><BulbOutlined /> 申请说明</h4>
          <div class="detail-text">
            {{ selectedProject.description || selectedProject.applicationDescription }}
          </div>
        </div> -->

        <!-- 会议信息 -->
        <!-- <div class="detail-section" v-if="selectedProject.meetingInfo || selectedProject.meetingScheduled">
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
        </div> -->

        <!-- 会议材料 -->
        <!-- <div class="detail-section" v-if="selectedProject.meetingMaterials && selectedProject.meetingMaterials.length > 0">
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
                  {{ material.fileName || material.name || '未命名文件' }}{{ material.fileSuffix ? '.' + material.fileSuffix : '' }}
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
        </div> -->

        <!-- 开题结论 -->
        <!-- <div class="detail-section" v-if="selectedProject.conclusion || selectedProject.finalResult">
          <h4><AuditOutlined /> 开题结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="开题结果">
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
                    ? '开题通过'
                    : (selectedProject.conclusion?.result || selectedProject.finalResult) === 'failed'
                      ? '开题不通过'
                      : '有条件通过'
                }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="结论时间">
              {{ formatTimestamp(selectedProject.conclusion?.time || selectedProject.conclusionTime, '待确定') }}
            </a-descriptions-item>
            <a-descriptions-item label="开题评分" v-if="selectedProject.conclusion?.score || selectedProject.score">
              <span 
                :style="{ 
                  color: (selectedProject.conclusion?.score || selectedProject.score) >= 90 ? '#52c41a' : 
                        (selectedProject.conclusion?.score || selectedProject.score) >= 80 ? '#fa8c16' : '#ff4d4f' 
                }"
              >
                {{ selectedProject.conclusion?.score || selectedProject.score }}分
              </span>
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
        </div> -->

        <!-- 结论相关文件 -->
        <!-- <div class="detail-section" v-if="selectedProject.conclusionFiles && selectedProject.conclusionFiles.length > 0">
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
        </div> -->

        <!-- 整改情况 -->
        <!-- <div class="detail-section" v-if="selectedProject.improvementSubmitted">
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
        </div> -->

        <!-- 审核历史 -->
        <div class="detail-section">
          <h4><ClockCircleOutlined /> 审核历史</h4>
          <a-timeline>
            <a-timeline-item color="blue">
              <template #dot>
                <FileOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">开题申请提交</div>
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
                <div class="timeline-title">开题会议安排</div>
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
                      ? '开题通过'
                      : (selectedProject.conclusion?.result || selectedProject.finalResult) === 'failed'
                        ? '开题不通过'
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
  </div>
</template>

<script setup>
/**
 * 开题申请管理页面 - 申报单位角色
 * 
 * 本页面严格遵循《页面统一风格设计规范.md》中的规范要求：
 * 1. 使用PageContainer作为页面最外层容器
 * 2. 提供title和description作为PageContainer的属性
 * 3. 将主要操作按钮放在actions插槽中
 * 4. 内容区域使用统一的灰色背景
 * 5. 卡片内容区域置于灰色背景之上
 * 6. 统一使用Ant Design Vue组件和全局样式
 */
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { useUserStore } from '@/store/modules/user'

import {
  PlusOutlined,
  FolderOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FileSearchOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  AuditOutlined
} from '@ant-design/icons-vue'

// 导入API函数
import { 
  getProposalApplicationPage, 
  getProposalMaterialReviewPage, 
  getProposalMaterialPage,
  getProposalMeetingPage,
  getProposalMeeting,
  deleteProposalApplication
} from '@/api/th_qd/opening/management'
import { getTechnologicalProject } from '@/api/th_qd/opening/manage'
import {
  getConclusionFilePageForConclusion,
  getProposalAcceptanceConclusionRewritePage,
  getMeetingMaterialPageForConclusion,
  getMeetingParticipantPageForConclusion
} from '@/api/th_qd/opening/conclusion'
const router = useRouter()
const userStore = useUserStore()

// 统计数据 - 基于申请列表动态计算
const stats = computed(() => {
  const total = applications.value.length
  const materialReviewing = applications.value.filter(app => 
    app.status === 'material_reviewing'
  ).length
  const materialRejected = applications.value.filter(app => 
    app.status === 'material_rejected'
  ).length
  const meetingPreparing = applications.value.filter(app => 
    app.status === 'meeting_preparing'
  ).length
  const meetingScheduled = applications.value.filter(app => 
    app.status === 'meeting_scheduled'
  ).length
  const openingPassed = applications.value.filter(app => 
    app.status === 'opening_passed'
  ).length
  const openingConditional = applications.value.filter(app => 
    app.status === 'opening_conditional'
  ).length
  const openingFailed = applications.value.filter(app => 
    app.status === 'opening_failed'
  ).length
  
  return {
    total,
    materialReviewing,
    materialRejected,
    meetingPreparing,
    meetingScheduled,
    openingPassed,
    openingConditional,
    openingFailed
  }
})

// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 流程说明显示状态
const showFlowDescription = ref(false)

// 加载状态
const loading = ref(false)

// 申请列表数据
const applications = ref([])

// 详情弹窗相关
const detailModalVisible = ref(false)
const selectedProject = ref(null)

// 表格列配置
const columns = [
  {
    title: '项目信息',
    key: 'projectInfo',
    width: 300
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120
  },
  {
    title: '申请时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 120
  },
  {
    title: '预期时间',
    dataIndex: 'expectedTime',
    key: 'expectedTime',
    width: 120
  },
  {
    title: '进度',
    key: 'progress',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录`
})

// 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = applications.value
  
  if (filters.value.status) {
    result = result.filter(app => app.status === filters.value.status)
  }
  
  if (filters.value.keyword) {
    result = result.filter(app => 
      app.projectName.toLowerCase().includes(filters.value.keyword.toLowerCase()) ||
      app.projectCode.toLowerCase().includes(filters.value.keyword.toLowerCase())
    )
  }
  
  return result
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'material_reviewing': 'orange',
    'material_rejected': 'red',
    'meeting_preparing': 'blue',
    'meeting_scheduled': 'cyan',
    'opening_passed': 'green',
    'opening_conditional': 'orange',
    'opening_failed': 'red',
    'rectification': 'purple'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'material_reviewing': '材料审核中',
    'material_rejected': '材料审核未通过',
    'meeting_preparing': '会议待组织',
    'meeting_scheduled': '会议已安排',
    'opening_passed': '开题通过',
    'opening_conditional': '有条件通过',
    'opening_failed': '开题未通过',
    'rectification': '整改中'
  }
  return textMap[status] || '未知状态'
}

// 获取进度百分比
const getProgressPercent = (status) => {
  const percentMap = {
    'material_reviewing': 25,
    'material_rejected': 25,
    'meeting_preparing': 50,
    'meeting_scheduled': 75,
    'opening_passed': 100,
    'opening_conditional': 90,
    'opening_failed': 100,
    'rectification': 90
  }
  return percentMap[status] || 0
}

// 获取进度状态
const getProgressStatus = (status) => {
  if (['opening_passed'].includes(status)) return 'success'
  if (['opening_failed', 'material_rejected'].includes(status)) return 'exception'
  return 'active'
}

// 获取进度文本
const getProgressText = (status, record) => {
  const textMap = {
    'material_reviewing': '材料审核中',
    'material_rejected': '材料审核未通过，需重新提交',
    'meeting_preparing': '等待会议组织',
    'meeting_scheduled': '会议已安排',
    'opening_passed': '开题通过',
    'opening_conditional': '有条件通过',
    'opening_failed': '开题未通过'
  }
  return textMap[status] || '进行中'
}

// 获取更多操作
const getMoreActions = (record) => {
  const actions = []
  
  if (record.materials?.length > 0) {
    actions.push({ key: 'viewMaterials', label: '查看材料' })
  }
  
  if (['opening_passed', 'opening_conditional', 'opening_failed'].includes(record.status)) {
    actions.push({ key: 'downloadReport', label: '下载报告' })
  }
  
  return actions
}

// 事件处理函数
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

const handleStatCardClick = (status) => {
  filters.value.status = status
}

const handleFilterChange = () => {
  // 重置到第一页并重新加载数据
  pagination.value.current = 1
  loadApplications()
}

const handleSearch = () => {
  // 重置到第一页并重新加载数据  
  pagination.value.current = 1
  loadApplications()
}

const goToSubmit = () => {
  router.push('/th-qd-project/implementation/opening/opening/applicant/submit')
}

const handleResubmitMaterial = (record) => {
  // 传入 applicationId 与 projectId，projectId 用真实项目ID，applicationId 用申请ID
  router.push({
    path: '/th-qd-project/implementation/opening/opening/applicant/submit',
    query: {
      resubmit: 'true',
      applicationId: String(record.id),
      projectId: String(record.projectId || ''),
      // projectName: encodeURIComponent(record.projectName || ''),
      // projectCode: record.projectCode || '',
      expectedTime: record.expectedTime || '',
      description: encodeURIComponent(record.description || ''),
      notes: record.notes || '',
      // rejectionReason: encodeURIComponent(record || '')
    }
  })
}

const handleSubmitImprovement = (record) => {
  const improvementRequirements = record?.conclusion?.requirements || ''
  router.push({
    path: '/th-qd-project/implementation/opening/opening/applicant/submit',
    query: {
      improvement: 'true',
      applicationId: String(record.id),
      projectId: String(record.projectId || ''),
      // projectName: encodeURIComponent(record.projectName || ''),
      // projectCode: record.projectCode || '',
      expectedTime: record.expectedTime || '',
      description: encodeURIComponent(record.description || ''),
      notes: record.notes || '',
      improvementRequirements: encodeURIComponent(improvementRequirements)
      
    }
  })
}

const handleResubmit = (record) => {
  router.push({
    path: '/th-qd-project/implementation/opening/opening/applicant/submit',
    query: {
      resubmit: 'true',
      applicationId: String(record.id),
      projectId: String(record.projectId || '')
    }
  })
}

const handleViewDetails = async (record) => {
  try {
    console.log('=== 开始加载项目详情 ===')
    console.log('原始项目数据:', record)
    
    // 设置选中的项目
    selectedProject.value = { ...record }
    
    // 1. 获取项目立项申请详细信息
    if (record.projectId) {
      try {
        console.log('=== 获取项目立项申请详细信息 ===')
        console.log('项目ID:', record.projectId)
        
        const projectDetail = await getTechnologicalProject(record.projectId)
        console.log('项目详细信息:', projectDetail)
        
        if (projectDetail) {
          // 更新项目详细信息到selectedProject
          selectedProject.value = {
            ...selectedProject.value,
            // 基本信息
            name: projectDetail.projectName || record.projectName,
            code: projectDetail.projectNo || record.projectCode,
            applicant: projectDetail.applicant || record.applicant,
            applicantUnit: projectDetail.applicantUnit || record.applicantUnit,
            yearly: projectDetail.yearly || record.yearly,
            projectCycle: projectDetail.projectCycle || record.projectCycle,
            budget: projectDetail.budget || record.budget,
            technicalApproach: projectDetail.technicalApproach || record.technicalApproach,
            riskAnalysis: projectDetail.riskAnalysis || record.riskAnalysis,
            creator: projectDetail.creator,
            updater: projectDetail.updater,
            createTime: projectDetail.createTime,
            updateTime: projectDetail.updateTime,
            
            // 显示字段更新
            projectName: projectDetail.projectName || record.projectName,
            projectCode: projectDetail.projectNo || record.projectCode,
            originalProjectDetail: projectDetail
          }
        }
        
        console.log('=== 项目详情补充完成 ===')
        console.log('更新后的项目信息:', selectedProject.value)
      } catch (error) {
        console.error('获取项目详细信息失败:', error)
      }
    }
    
    // 2. 获取开题申请材料信息
    try {
      console.log('=== 获取开题申请材料信息 ===')
      const materialResp = await getProposalMaterialPage({
        pageNo: '1',
        pageSize: '100',
        proposalApplicationId: record.id.toString()
      })
      
      console.log('开题申请材料API响应:', materialResp)
      
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
      console.error('获取开题申请材料失败:', materialError)
      selectedProject.value.materials = []
    }
    
    // 3. 获取材料审核记录（获取真实的审核时间）
    if (record.materialStatus === 'approved' || record.materialStatus === 'rejected') {
      try {
        console.log('=== 获取材料审核记录 ===')
        const materialReviewResp = await getProposalMaterialReviewPage({
          pageNo: '1',
          pageSize: '10',
          proposalApplicationId: record.id.toString()
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
    
    // 4. 获取会议详细信息
    try {
      console.log('=== 获取会议详细信息 ===')
      
      // 通过proposalApplicationId查找对应的会议
      const meetingResp = await getProposalMeetingPage({
        pageNo: '1',
        pageSize: '10',
        proposalApplicationId: record.id.toString()
      })
      
      console.log('会议信息API响应:', meetingResp)
      
      if (meetingResp && (meetingResp.list || meetingResp.data?.list)) {
        const meetings = meetingResp.list || meetingResp.data?.list || []
        if (meetings.length > 0) {
          const meeting = meetings[0] // 取第一个会议
          console.log('获取到的会议信息:', meeting)
          
          // 获取会议的详细信息
          const meetingDetailResp = await getProposalMeeting(meeting.id)
          const meetingDetail = meetingDetailResp?.data || meetingDetailResp
          
          if (meetingDetail) {
            // 处理会议时间 - 如果meetingTime是0或无效值，使用其他字段或默认值
            let rawMeetingTime = meetingDetail.meetingTime || meetingDetail.meetingDateTime
            if (!rawMeetingTime || rawMeetingTime === 0) {
              rawMeetingTime = meetingDetail.createTime
            }
            
            // 使用时间戳处理函数格式化时间
            const meetingTime = formatTimestamp(rawMeetingTime, '会议时间待确定')
            
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
            console.log('原始会议时间:', rawMeetingTime)
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
              selectedProject.value.meetingMaterials = []
            }
          }
          
          // 会议状态相关字段
          selectedProject.value.meetingScheduled = true
        }
      }
    } catch (meetingError) {
      console.error('获取会议信息失败:', meetingError)
    }
    
    // 5. 获取结论详细信息
    if (record.status === 'opening_passed' || record.status === 'opening_conditional' || record.status === 'opening_failed') {
      try {
        console.log('=== 获取结论详细信息 ===')
        
        // 通过proposalApplicationId查找对应的结论记录
        const conclusionResp = await getProposalAcceptanceConclusionRewritePage({
          pageNo: '1',
          pageSize: '10',
          proposalApplicationId: record.id.toString()
        })
        
        console.log('结论信息API响应:', conclusionResp)
        
        if (conclusionResp && (conclusionResp.list || conclusionResp.data?.list)) {
          const conclusions = conclusionResp.list || conclusionResp.data?.list || []
          if (conclusions.length > 0) {
            const conclusion = conclusions[0] // 取第一个结论
            console.log('获取到的结论信息:', conclusion)
            
            // 将结论信息添加到selectedProject
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
              
              console.log('结论文件API响应:', conclusionFilesResp)
              
              if (conclusionFilesResp && (conclusionFilesResp.list || conclusionFilesResp.data?.list)) {
                const files = conclusionFilesResp.list || conclusionFilesResp.data?.list || []
                console.log('获取到的结论文件:', files)
                
                // 将结论文件添加到selectedProject
                selectedProject.value.conclusionFiles = files.map(file => ({
                  ...file,
                  name: file.fileName || `文件#${file.id}`,
                  type: '结论文件'
                }))
                
                console.log('=== 结论文件获取完成 ===')
                console.log('结论文件列表:', selectedProject.value.conclusionFiles)
              }
            } catch (conclusionFileError) {
              console.error('获取结论文件失败:', conclusionFileError)
              selectedProject.value.conclusionFiles = []
            }
          }
        }
      } catch (conclusionError) {
        console.error('获取结论信息失败:', conclusionError)
      }
    }
    
    // 显示详情弹窗
    detailModalVisible.value = true
    
  } catch (error) {
    console.error('加载项目详情失败:', error)
    message.error('加载项目详情失败')
  }
}

const handleViewRejectionDetails = async (record) => {
  try {
    console.log('=== 开始获取驳回详情 ===')
    console.log('申请记录:', record)
    
    // 调用API获取材料审核记录
    const reviewResponse = await getProposalMaterialReviewPage({
      pageNo: '1',
      pageSize: '100',
      proposalApplicationId: record.id.toString(),
      reviewResult: '2' // 2-驳回
    })
    
    console.log('审核记录API响应:', reviewResponse)
    
    const reviewRecords = reviewResponse?.data?.list || reviewResponse?.list || []
    console.log('审核记录列表:', reviewRecords)
    
    if (reviewRecords.length === 0) {
      message.warning('暂无驳回详情信息')
      return
    }
    
    // 获取最新的驳回记录
    const latestRejection = reviewRecords[0]
    console.log('最新驳回记录:', latestRejection)
    
    // 构建驳回详情内容
    const rejectionDetails = []
    
    // 基本信息
    const rejectionTime = latestRejection.reviewTime && latestRejection.reviewTime > 0 
      ? new Date(latestRejection.reviewTime).toLocaleString()
      : latestRejection.createTime 
        ? new Date(latestRejection.createTime).toLocaleString()
        : '未知'
    
    rejectionDetails.push(h('div', { style: 'margin-bottom: 16px;' }, [
      h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, `驳回时间: ${rejectionTime}`),
      h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, `审核人员: ${latestRejection.reviewer || '未知'}`)
    ]))
    
    // 审核意见
    rejectionDetails.push(h('div', { style: 'margin-bottom: 16px;' }, [
      h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, '审核意见:'),
      h('div', { 
        style: 'background: #f5f5f5; padding: 12px; border-radius: 4px; border-left: 4px solid #ff4d4f;' 
      }, latestRejection.reviewOpinion || '无详细说明')
    ]))
    
    // 如果有多个驳回记录，显示所有记录
    // if (reviewRecords.length > 1) {
    //   rejectionDetails.push(h('div', { style: 'margin-top: 16px;' }, [
    //     h('p', { style: 'margin: 0 0 8px 0; font-weight: 500; color: #ff4d4f;' }, `共 ${reviewRecords.length} 条驳回记录:`),
    //     h('div', { style: 'max-height: 200px; overflow-y: auto;' }, 
    //       reviewRecords.map((rejection, index) => {
    //         const recordTime = rejection.reviewTime && rejection.reviewTime > 0 
    //           ? new Date(rejection.reviewTime).toLocaleString()
    //           : rejection.createTime 
    //             ? new Date(rejection.createTime).toLocaleString()
    //             : '未知时间'
            
    //         return h('div', { 
    //           key: index,
    //           style: 'padding: 8px; margin-bottom: 8px; background: #fff2f0; border-radius: 4px; border: 1px solid #ffccc7;' 
    //         }, [
    //           h('p', { style: 'margin: 0 0 4px 0; font-size: 12px; color: #666;' }, 
    //             `${recordTime} - ${rejection.reviewer || '未知审核人'}`),
    //           h('p', { style: 'margin: 0; font-size: 13px;' }, rejection.reviewOpinion || '无详细说明')
    //         ])
    //       })
    //     )
    //   ]))
    // }
    
  Modal.info({
    title: '材料驳回详情',
      width: 700,
      content: h('div', rejectionDetails)
    })
    
  } catch (error) {
    console.error('获取驳回详情失败:', error)
    message.error('获取驳回详情失败，请稍后重试')
  }
}

const handleViewConclusionDetails = async (record) => {
  try {
    console.log('=== 开始获取结论详情 ===')
    console.log('申请记录:', record)

    // 调用API获取结论信息
    const conclusionResp = await getProposalAcceptanceConclusionRewritePage({
      pageNo: '1',
      pageSize: '10',
      proposalApplicationId: record.id.toString()
    })

    console.log('结论信息API响应:', conclusionResp)

    const conclusions = conclusionResp?.data?.list || conclusionResp?.list || []
    console.log('结论列表:', conclusions)

    if (conclusions.length === 0) {
      message.warning('暂无结论详情信息')
      return
    }

    // 获取最新的结论记录
    const latestConclusion = conclusions[0]
    console.log('最新结论记录:', latestConclusion)

    // 构建结论详情内容
    const conclusionDetails = []

    // 结论基本信息
    const conclusionTime = latestConclusion.conclusionTime && latestConclusion.conclusionTime > 0
      ? new Date(latestConclusion.conclusionTime).toLocaleString()
      : latestConclusion.createTime
        ? new Date(latestConclusion.createTime).toLocaleString()
        : '未知'

    const conclusionResult = latestConclusion.conclusionResult === 0 ? '开题通过' : 
                          latestConclusion.conclusionResult === 1 ? '有条件通过' : '开题未通过'

    conclusionDetails.push(h('div', { style: 'margin-bottom: 16px;' }, [
      h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, `结论时间: ${conclusionTime}`),
      h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, `结论结果: ${conclusionResult}`),
      latestConclusion.score && h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, `开题评分: ${latestConclusion.score}分`)
    ]))

    // 结论说明
    if (latestConclusion.conclusionDescription) {
      conclusionDetails.push(h('div', { style: 'margin-bottom: 16px;' }, [
        h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, '结论说明:'),
        h('div', {
          style: 'background: #f5f5f5; padding: 12px; border-radius: 4px; border-left: 4px solid #1890ff;'
        }, latestConclusion.conclusionDescription)
      ]))
    }

    // 整改要求（仅对有条件通过状态）
    if (latestConclusion.conclusionResult === 1 && latestConclusion.requirements) {
      conclusionDetails.push(h('div', { style: 'margin-bottom: 16px;' }, [
        h('p', { style: 'margin: 0 0 8px 0; font-weight: 500;' }, '整改要求:'),
        h('div', {
          style: 'background: #fff7e6; padding: 12px; border-radius: 4px; border-left: 4px solid #fa8c16;'
        }, latestConclusion.requirements)
      ]))
    }

    Modal.info({
      title: '开题结论详情',
      width: 700,
      content: h('div', conclusionDetails)
    })

  } catch (error) {
    console.error('获取结论详情失败:', error)
    message.error('获取结论详情失败，请稍后重试')
  }
}

const handleMoreAction = ({ key }, record) => {
  switch (key) {
    case 'viewMaterials':
      // 查看材料逻辑
      message.info('查看材料功能')
      break
    case 'downloadReport':
      // 下载报告逻辑
      message.info('下载报告功能')
      break
  }
}

// 时间格式化函数
const formatTimestamp = (timestamp, defaultText = '待确定') => {
  if (!timestamp || timestamp === 0) {
    return defaultText
  }
  
  // 处理数组格式 [year, month, day]
  if (Array.isArray(timestamp) && timestamp.length >= 3) {
    const [year, month, day] = timestamp
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  
  // 处理字符串格式
  if (typeof timestamp === 'string') {
    // 如果是 YYYY-MM-DD 格式，直接返回
    if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
      return timestamp
    }
    // 如果是 YYYY-MM-DD HH:mm:ss 格式，只返回日期部分
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      return timestamp.split(' ')[0]
    }
    // 尝试解析其他格式
    const date = new Date(timestamp)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  
  // 处理数字时间戳
  if (typeof timestamp === 'number') {
    const date = new Date(timestamp)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  
  return defaultText
}

// 文件大小格式化函数
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 预览材料
const previewMaterial = (material) => {
  const fileUrl = material.fileUrl || material.filePath || material.url || material.path
  const fileName = material.materialName || material.name || material.fileName || '未命名文件'
  
  if (!fileUrl) {
    message.warning('文件链接不存在')
    return
  }
  
  // 直接在新窗口打开文件进行预览
  window.open(fileUrl, '_blank')
}

// 下载材料
const downloadMaterial = (material) => {
  const fileUrl = material.fileUrl || material.filePath || material.url || material.path
  const fileName = material.materialName || material.name || material.fileName || '未命名文件'
  
  if (!fileUrl) {
    message.warning('文件链接不存在')
    return
  }
  
  // 创建下载链接
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 详情弹窗取消处理
const handleDetailCancel = () => {
  detailModalVisible.value = false
  selectedProject.value = null
}

// 状态映射函数 - 将后端状态转换为前端状态
const mapApplicationStatus = (backendStatus) => {
  // 根据API文档，applicationStatus字段：
  // 1:材料审核中, 2:会议待组织, 3:会议已安排, 4:开题通过, 5:有条件通过, 6:开题未通过, 7:材料审核未通过, 8:整改中
  const statusMap = {
    1: 'material_reviewing',
    2: 'meeting_preparing', 
    3: 'meeting_scheduled',
    4: 'opening_passed',
    5: 'opening_conditional',
    6: 'opening_failed',
    7: 'material_rejected',  // 材料审核未通过
    8: 'rectification'       // 整改中
  }
  return statusMap[backendStatus] || 'material_reviewing'
}

// 根据applicationStatus获取材料状态
const getMaterialStatusFromApplicationStatus = (applicationStatus) => {
  if (applicationStatus === 1) return 'reviewing'      // 材料审核中
  if (applicationStatus === 2) return 'approved'      // 会议待组织
  if (applicationStatus === 7) return 'rejected'      // 材料审核未通过
  return 'approved'
}

// 加载申请列表数据
const loadApplications = async () => {
  try {
    loading.value = true
    // console.log('=== 开始加载开题申请列表数据 ===')
    
    // 获取当前登录者的信息
    // 尝试从多个地方获取当前登录者的昵称
    let currentUserNikename = useUserStore().getUser.nickname
    

    
    // 如果仍然没有获取到昵称，使用默认值
    if (!currentUserNikename) {
      currentUserNikename = useUserStore().getUser.nickname // 使用示例数据中的申请人作为默认值
    }
    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize
    }
    
    // 添加状态过滤（如果有选择的话）
    if (filters.value.status) {
      // 将前端状态转换回后端状态码
      const backendStatusMap = {
        'material_reviewing': 1,
        'material_rejected': 7,  // 新增：材料审核未通过
        'meeting_preparing': 2,
        'meeting_scheduled': 3, 
        'opening_passed': 4,
        'opening_conditional': 5,
        'opening_failed': 6
      }
      params.applicationStatus = backendStatusMap[filters.value.status]
    }
    
    // 添加关键词搜索（通过项目名称搜索）
    if (filters.value.keyword) {
      // 这里可能需要根据API实际支持的搜索字段调整
      params.projectName = filters.value.keyword
    }
    
    // console.log('请求参数:', params)
    const response = await getProposalApplicationPage(params)
    // console.log('API响应:', response)
    
    // 处理响应数据
    const responseData = response?.data || response
    const list = responseData?.list || []
    const total = responseData?.total || 0
    
    // console.log('解析数据:', { list, total, listLength: list.length })
    
    // 转换数据格式并获取项目详细信息
    const mappedApplications = await Promise.all(list.map(async (item) => {
      // 处理预期开题时间的格式转换
      let expectedTime = ''
      if (item.expectedProposalTime) {
        if (Array.isArray(item.expectedProposalTime)) {
          // [2025, 8, 28] 格式，注意月份需要减1
          const [year, month, day] = item.expectedProposalTime
          expectedTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        } else {
          expectedTime = item.expectedProposalTime
        }
      }
      
      // 获取项目详细信息
      let projectDetails = null
      try {
        if (item.projectId) {
          // console.log(`正在获取项目 ${item.projectId} 的详细信息...`)
          const projectResponse = await getTechnologicalProject(item.projectId)
          projectDetails = projectResponse?.data || projectResponse
          // console.log(`项目 ${item.projectId} 详细信息:`, projectDetails)
        }
      } catch (error) {
        console.warn(`获取项目 ${item.projectId} 详细信息失败:`, error)
      }
      
      return {
        id: item.id,
        projectId: item.projectId,
        // 优先使用项目详细信息中的项目名称，其次使用申请中的项目名称
        projectName: projectDetails?.projectName || item.projectName || `项目${item.id}`,
        // 优先使用项目详细信息中的项目编号
        projectCode: projectDetails?.projectNo || item.applicationNo || `PROJ-${item.id}`,
        status: mapApplicationStatus(item.applicationStatus),
        materialStatus: getMaterialStatusFromApplicationStatus(item.applicationStatus),
        submitTime: formatTimestamp(item.createTime),
        expectedTime: expectedTime,
        description: item.applicationDescription || '',
        notes: item.notes || '',
        materials: [], // 材料信息需要单独加载
        // 从项目详细信息中获取额外字段
        applicant: projectDetails?.applicant || '',
        applicantUnit: projectDetails?.applicantUnit || '',
        yearly: projectDetails?.yearly || '',
        projectCycle: projectDetails?.projectCycle || '',
        budget: projectDetails?.budget || '',
        technicalApproach: projectDetails?.technicalApproach || '',
        riskAnalysis: projectDetails?.riskAnalysis || '',
        // 可以根据需要添加其他字段的映射
      }
    }))
    
    // 客户端过滤：只保留申请人(applicant)为当前登录者昵称(nikename)的项目数据
    const filteredApplications = mappedApplications.filter(app => {
      // 只检查申请人(applicant)字段是否等于当前登录者昵称
      return app.applicant === useUserStore().getUser.nickname
    })
    
    applications.value = filteredApplications
    pagination.value.total = filteredApplications.length
    
    // console.log('转换后的数据:', applications.value)
    // console.log(`成功加载 ${mappedApplications.length} 条申请记录`)
    
  } catch (error) {
    // console.error('加载申请列表失败:', error)
    // message.error('加载申请列表失败，请稍后重试')
    applications.value = []
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await loadApplications()
}

// 取消申请处理
const handleCancelApplication = (record) => {
  Modal.confirm({
    title: '确认取消申请',
    content: `确定要取消${record.projectName}的开题申请吗？取消后将无法恢复。`,
    okText: '确认取消',
    okType: 'danger',
    cancelText: '再想想',
    onOk: async () => {
      try {
        await deleteProposalApplication(record.id)
        message.success('申请已成功取消')
        // 刷新列表
        loadApplications()
      } catch (error) {
        console.error('取消申请失败:', error)
        message.error('取消申请失败，请稍后重试')
      }
    }
  })
}

// 分页变化处理
const handlePaginationChange = (page, pageSize) => {
  pagination.value.current = page
  pagination.value.pageSize = pageSize
  loadApplications()
}

onMounted(() => {
  // 页面初始化时加载数据
  loadApplications()
})
</script>

<style scoped>
/* 页面容器样式 */
.applicant-manage-container {
  padding: 0;
  background: #ffffff;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
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

/* 页面主要内容区域 */
.applicant-manage-container :deep(.ant-card) {
  margin: 0 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
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
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: rgba(35, 79, 162, 0.1);
}

.stat-card:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

/* 各状态卡片的主题色定义和悬停效果 */
.stat-card.pending {
  --accent-color: #1890ff;
}

.stat-card.pending:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #d6f0ff 100%);
  border-color: rgba(24, 144, 255, 0.2);
}

.stat-card.material-rejected {
  --accent-color: #ff4d4f;
}

.stat-card.material-rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%);
  border-color: rgba(255, 77, 79, 0.2);
}

.stat-card.reviewing {
  --accent-color: #faad14;
}

.stat-card.reviewing:hover {
  background: linear-gradient(135deg, #fffbe6 0%, #fff7dc 100%);
  border-color: rgba(250, 173, 20, 0.2);
}

.stat-card.scheduled {
  --accent-color: #13c2c2;
}

.stat-card.scheduled:hover {
  background: linear-gradient(135deg, #e6fffb 0%, #d1f9f6 100%);
  border-color: rgba(19, 194, 194, 0.2);
}

.stat-card.completed {
  --accent-color: #52c41a;
}

.stat-card.completed:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #edf9e3 100%);
  border-color: rgba(82, 196, 26, 0.2);
}

.stat-card.conditional {
  --accent-color: #fa8c16;
}

.stat-card.conditional:hover {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1dc 100%);
  border-color: rgba(250, 140, 22, 0.2);
}

.stat-card.rejected {
  --accent-color: #ff4d4f;
}

.stat-card.rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%);
  border-color: rgba(255, 77, 79, 0.2);
}

/* 图标样式优化 */
.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  margin-right: 16px;
  font-size: 22px;
  transition: all 0.3s ease;
  position: relative;
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #e6f7ff, #91d5ff);
  color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.stat-card.material-rejected .stat-icon {
  background: linear-gradient(135deg, #fff2f0, #ffb3b3);
  color: #ff4d4f;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.15);
}

.stat-card.reviewing .stat-icon {
  background: linear-gradient(135deg, #fffbe6, #ffe58f);
  color: #faad14;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.15);
}

.stat-card.scheduled .stat-icon {
  background: linear-gradient(135deg, #e6fffb, #87e8de);
  color: #13c2c2;
  box-shadow: 0 4px 12px rgba(19, 194, 194, 0.15);
}

.stat-card.completed .stat-icon {
  background: linear-gradient(135deg, #f6ffed, #b7eb8f);
  color: #52c41a;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
}

.stat-card.conditional .stat-icon {
  background: linear-gradient(135deg, #fff7e6, #ffec99);
  color: #fa8c16;
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.15);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #fff2f0, #ffb3b3);
  color: #ff4d4f;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.15);
}

/* 内容区域样式优化 */
.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #262626;
  line-height: 1;
  margin-bottom: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.stat-label {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  line-height: 1.2;
}

/* 卡片标题样式 */
.card-title-with-total {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title-with-total span {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

/* 流程说明样式 */
.flow-description {
  margin-bottom: 16px;
}

.flow-content {
  padding: 8px 0;
}

/* 筛选区域样式 */
.header-filters {
  display: flex;
  gap: 12px;
}

/* 步骤描述样式 */
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

/* 项目信息样式 */
.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #262626;
  line-height: 1.4;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.project-meta .applicant,
.project-meta .applicant-unit {
  font-size: 11px;
  color: #595959;
  line-height: 1.2;
}

.project-meta .applicant {
  font-weight: 500;
}

.project-meta .applicant-unit {
  color: #8c8c8c;
}

/* 进度信息样式 */
.progress-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .stat-card {
    padding: 18px 14px;
    min-height: 75px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
    margin-right: 14px;
  }
  
  .stat-number {
    font-size: 28px;
  }
}

@media (max-width: 992px) {
  .stats-overview {
    margin: 0 12px 20px 12px;
  }
  
  .stat-card {
    padding: 16px 12px;
    min-height: 70px;
  }
  
  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 18px;
    margin-right: 12px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .header-filters {
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-overview {
    margin: 0 8px 16px 8px;
  }
  
  /* 在平板尺寸调整flex容器 */
  .stats-flex-container {
    gap: 8px;
  }
  
  .stats-flex-container .stat-card {
    min-width: 120px;
    max-width: none;
  }
  
  .stat-card {
    padding: 16px;
    min-height: auto;
    flex-direction: row;
    justify-content: flex-start;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .stat-number {
    font-size: 22px;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    line-height: 1.3;
  }
}

@media (max-width: 576px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .stats-overview {
    margin: 0 8px 12px 8px;
  }
  
  /* 在手机上让卡片换行显示，每行2-3个 */
  .stats-flex-container {
    gap: 6px;
    justify-content: space-between;
  }
  
  .stats-flex-container .stat-card {
    flex: 1 1 calc(50% - 3px);
    min-width: calc(50% - 3px);
    max-width: calc(50% - 3px);
  }
  
  .stat-card {
    padding: 14px 12px;
    border-radius: 10px;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
    margin-right: 10px;
    border-radius: 10px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 11px;
  }
  
  /* 在小屏幕上减少卡片的悬停效果 */
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
  
  .stat-card:hover .stat-icon {
    transform: scale(1.02);
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
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.detail-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: #595959;
}

/* 材料列表样式 */
.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.material-item:hover {
  border-color: #d9d9d9;
  background: #f5f5f5;
}

.material-info {
  flex: 1;
  min-width: 0;
}

.material-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.material-type {
  font-size: 12px;
  color: #8c8c8c;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.file-size {
  font-size: 12px;
  color: #8c8c8c;
}

.material-rejection {
  margin-top: 8px;
}

.material-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 参与者显示样式 */
.participants-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 整改要求文本样式 */
.requirements-text {
  background: #fff7e6;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ffd591;
  color: #d46b08;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

/* 整改情况文本样式 */
.improvement-text {
  background: #f6ffed;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #b7eb8f;
  color: #389e0d;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

/* 时间线样式 */
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
  
  .material-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .material-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 取消申请按钮样式 */
.cancel-application-btn {
  background-color: #fff2f0;
  border-color: #ffccc7;
  color: #ff4d4f;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-application-btn:hover {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2);
}
</style>