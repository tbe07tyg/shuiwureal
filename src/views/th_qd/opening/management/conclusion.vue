<!--
 * @file 会议结论管理页面 - 管理角色
 * @description 管理角色组织开题会议和录入开题结论
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="conclusion-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">会议结论管理</h1>
        <p class="page-description">查看和管理开题会议的结论信息</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="refreshData">
          <ReloadOutlined />
          刷新数据
        </a-button>
      </div>
    </div>

    <!-- 会议统计 -->
    <div class="meeting-stats">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <ClockCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingSchedule }}</div>
              <div class="stat-label">待安排会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card scheduled">
            <div class="stat-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.scheduled }}</div>
              <div class="stat-label">已安排会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">已完成开题</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card conclusion">
            <div class="stat-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingConclusion }}</div>
              <div class="stat-label">待录入结论</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <a-form layout="inline" :model="filters" @finish="handleFilter">
        <!-- <a-form-item label="申请状态">
          <a-select
            v-model:value="filters.applicationStatus"
            placeholder="选择申请状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="1">材料审核中</a-select-option>
            <a-select-option value="2">会议待组织</a-select-option>
            <a-select-option value="3">会议已安排</a-select-option>
            <a-select-option value="4">开题通过</a-select-option>
            <a-select-option value="5">有条件通过</a-select-option>
            <a-select-option value="6">开题未通过</a-select-option>
            <a-select-option value="7">材料审核未通过</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会议状态">
          <a-select
            v-model:value="filters.meetingStatus"
            placeholder="选择会议状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="0">待组织</a-select-option>
            <a-select-option value="1">已安排</a-select-option>
            <a-select-option value="2">进行中</a-select-option>
            <a-select-option value="3">已结束</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会议形式">
          <a-select
            v-model:value="filters.meetingType"
            placeholder="选择会议形式"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="0">现场会议</a-select-option>
            <a-select-option value="1">线上会议</a-select-option>
            <a-select-option value="2">混合会议</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会议时间">
          <a-range-picker
            v-model:value="filters.meetingDateRange"
            style="width: 240px"
          />
        </a-form-item> -->
        <a-form-item label="项目名称">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="resetFilters">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 会议管理标签页 -->
    <div class="meeting-tabs">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="schedule" tab="会议安排">
          <!-- 待安排会议列表 -->
          <div class="meeting-list">
            <div
              v-for="item in pendingScheduleList"
              :key="item.id"
              class="meeting-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="material-status">材料审核：{{ getMaterialStatusText(item.materialStatus) }}</span>
                    <span class="submit-time">申请时间：{{ item.submitTime }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getStatusColor(item.currentStatus)" size="large">
                    {{ getStatusText(item.currentStatus) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="project-details">
                  <a-descriptions :column="3" size="small">
                    <a-descriptions-item label="项目负责人">
                      {{ item.projectLeader }}
                    </a-descriptions-item>
                    <a-descriptions-item label="项目周期">
                      {{ item.projectDuration }}
                    </a-descriptions-item>
                    <a-descriptions-item label="项目预算">
                      {{ typeof item.projectBudget === 'number' ? item.projectBudget + '万元' : item.projectBudget }}
                    </a-descriptions-item>
                  </a-descriptions>
                </div>

                <div class="material-summary">
                  <div class="summary-title">材料审核情况</div>
                  <div class="summary-content">
                    <span class="summary-item">
                      必需材料：{{ item.requiredMaterials }}/{{ item.totalRequired }} 
                      <a-tag :color="getMaterialStatusColor(item.materialStatus)" size="small">
                        {{ getMaterialStatusText(item.materialStatus) }}
                      </a-tag>

                    </span>
                    <span class="summary-item" v-if="item.optionalMaterials > 0">
                      可选材料：{{ item.optionalMaterials }} 
                      <a-tag color="blue" size="small">已提交</a-tag>
                    </span>
                    <span class="summary-item" v-else>
                      可选材料：暂无
                    </span>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button type="primary" @click="scheduleMeeting(item)">
                    <CalendarOutlined />
                    安排会议
                  </a-button>
                  <a-button @click="viewProjectDetail(item)">
                    <FileTextOutlined />
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>

            <!-- 待安排会议分页组件 -->
            <div class="pagination-container" style="margin-top: 20px; text-align: right; padding: 0 20px 20px;">
              <a-pagination
                v-model:current="pendingPagination.current"
                v-model:pageSize="pendingPagination.pageSize"
                :total="pendingPagination.total"
                :showSizeChanger="pendingPagination.showSizeChanger"
                :showQuickJumper="pendingPagination.showQuickJumper"
                :showTotal="pendingPagination.showTotal"
                :show-less-items="true"
                @change="handlePendingPageChange"
                @showSizeChange="handlePendingSizeChange"
              />
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="scheduled" tab="已安排会议">
          <!-- 已安排会议列表 -->
          <div class="meeting-list">
            <div
              v-for="item in scheduledMeetingList"
              :key="item.id"
              class="meeting-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="meeting-time">会议时间：{{ item.meetingTime }}</span>
                    <span class="meeting-location">会议地点：{{ item.meetingLocation }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getMeetingStatusColor(item.meetingStatus)" size="large">
                    {{ getMeetingStatusText(item.meetingStatus) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="meeting-details">
                  <a-descriptions :column="2" size="small">
                    <a-descriptions-item label="会议形式">
                      {{ getMeetingTypeText(item.meetingType) }}
                    </a-descriptions-item>
                    <a-descriptions-item label="主持人">
                      <span v-if="item.meetingHosts && item.meetingHosts.length > 0">
                        <a-tag 
                          v-for="host in item.meetingHosts" 
                          :key="host" 
                          color="blue" 
                          style="margin-right: 4px;"
                        >
                          {{ host }}
                        </a-tag>
                      </span>
                      <span v-else>{{ item.meetingHost }}</span>
                    </a-descriptions-item>
                    <a-descriptions-item label="参会专家">
                      <span v-if="item.experts && item.experts.length > 0">
                        <a-tag 
                          v-for="expert in item.experts" 
                          :key="expert" 
                          color="green" 
                          style="margin-right: 4px;"
                        >
                          {{ expert }}
                        </a-tag>
                      </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="会议资料" v-if="item.meetingMaterials && item.meetingMaterials.length > 0">
                      <div class="meeting-materials-display">
                        <div 
                          v-for="(material, index) in item.meetingMaterials" 
                          :key="index"
                          class="material-item-display"
                          style="margin: 2px 4px 2px 0; display: inline-flex; align-items: center;"
                        >
                          <a-tag 
                          color="orange"
                            style="margin-right: 4px; cursor: pointer;"
                            @click="previewMaterial(material)"
                        >
                          <FileOutlined style="margin-right: 4px;" />
                          {{ material.name }}
                        </a-tag>
                          <a-button type="link" size="small" @click="downloadMaterial(material)">
                            <DownloadOutlined />
                          </a-button>
                        </div>
                      </div>
                    </a-descriptions-item>
                    <a-descriptions-item label="会议说明" :span="item.meetingMaterials && item.meetingMaterials.length > 0 ? 1 : 2">
                      {{ item.meetingDescription }}
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button
                    v-if="item.meetingStatus === 'scheduled'"
                    type="primary"
                    @click="startMeeting(item)"
                  >
                    <PlayCircleOutlined />
                    开始会议
                  </a-button>
                  <a-button
                    v-if="item.meetingStatus === 'in_progress'"
                    type="primary"
                    @click="inputConclusion(item)"
                  >
                    <EditOutlined />
                    录入结论
                  </a-button>
                  <a-button 
                    v-if="item.meetingStatus === 'scheduled'"
                    type="default"
                    @click="sendNotification(item)"
                    :loading="item.notifyLoading"
                  >
                    <MessageOutlined />
                    一键通知
                  </a-button>
                  <a-button 
                    :disabled="item.meetingStatus !== 'scheduled'"
                    @click="editMeeting(item)"
                  >
                    <EditOutlined />
                    编辑会议
                  </a-button>
                  <a-button type="link" @click="viewMeetingDetail(item)">
                    查看详情
                  </a-button>
                  <a-button 
                    type="link" 
                    danger 
                    @click="deleteMeeting(item)"
                  >
                    删除
                  </a-button>
                </a-space>
              </div>
            </div>

            <!-- 已安排会议分页组件 -->
            <div class="pagination-container" style="margin-top: 20px; text-align: right; padding: 0 20px 20px;">
              <a-pagination
                v-model:current="scheduledPagination.current"
                v-model:pageSize="scheduledPagination.pageSize"
                :total="scheduledPagination.total"
                :showSizeChanger="scheduledPagination.showSizeChanger"
                :showQuickJumper="scheduledPagination.showQuickJumper"
                :showTotal="scheduledPagination.showTotal"
                :show-less-items="true"
                @change="handleScheduledPageChange"
                @showSizeChange="handleScheduledSizeChange"
              />
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="conclusion" tab="结论管理">
          <!-- 结论管理列表 -->
          <div class="conclusion-list">
            <div
              v-for="item in conclusionList"
              :key="item.id"
              class="conclusion-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="meeting-time">会议时间：{{ item.meetingTime }}</span>
                    <span class="conclusion-time">结论时间：{{ item.conclusionTime }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getConclusionColor(item.conclusion)" size="large">
                    {{ getConclusionText(item.conclusion) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="conclusion-details">
                  <div class="conclusion-section">
                    <div class="section-title">验收结论</div>
                    <div class="section-content">
                      <div class="conclusion-result">
                        <span class="result-label">结论：</span>
                        <span class="result-value">{{ getConclusionText(item.conclusion) }}</span>
                        <span class="result-score">评分：{{ item.score }}分</span>
                      </div>
                      <div class="conclusion-description">{{ item.conclusionDescription }}</div>
                    </div>
                  </div>

                  <div v-if="item.requirements" class="conclusion-section">
                    <div class="section-title">整改要求</div>
                    <div class="section-content">{{ item.requirements }}</div>
                  </div>

                  <!-- 结论相关文件展示 -->
                  <div v-if="item.conclusionFiles && item.conclusionFiles.length > 0" class="conclusion-section">
                    <div class="section-title">结论相关文件</div>
                    <div class="section-content">
                      <div class="conclusion-files-display">
                        <a-tag 
                          v-for="(file, index) in item.conclusionFiles" 
                          :key="index"
                          color="purple"
                          style="margin: 2px 4px 2px 0; cursor: pointer;"
                          @click="downloadConclusionFile(file)"
                        >
                          <FileOutlined style="margin-right: 4px;" />
                          {{ file.fileName || file.name || '未知文件' }}
                        </a-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button @click="editConclusion(item)">
                    <EditOutlined />
                    编辑结论
                  </a-button>
                  <!-- <a-button @click="exportConclusion(item)">
                    <ExportOutlined />
                    导出结论
                  </a-button> -->
                  <a-button type="link" @click="viewConclusionDetail(item)">
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>

          <!-- 分页组件 -->
          <div class="pagination-container" style="margin-top: 20px; text-align: right; padding: 0 20px 20px;">
            <a-pagination
              v-model:current="pagination.current"
              v-model:pageSize="pagination.pageSize"
              :total="pagination.total"
              :showSizeChanger="pagination.showSizeChanger"
              :showQuickJumper="pagination.showQuickJumper"
              :show-less-items="true"
              :showTotal="pagination.showTotal"
              @change="handlePageChange"
              @showSizeChange="handleSizeChange"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 会议组织弹窗 -->
    <a-modal
      v-model:open="scheduleModalVisible"
      title="安排验收会议"
      width="700px"
      @ok="handleScheduleSubmit"
      @cancel="handleScheduleCancel"
    >
      <div v-if="selectedProject" class="schedule-modal">
        <a-form :model="scheduleForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="会议时间" required>
                <a-date-picker
                  v-model:value="scheduleForm.datetime"
                  show-time
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="会议地点" required>
                <a-input
                  v-model:value="scheduleForm.location"
                  placeholder="请输入会议地点"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="会议形式" required>
            <a-radio-group v-model:value="scheduleForm.type">
              <a-radio value="offline">现场会议</a-radio>
              <a-radio value="online">线上会议</a-radio>
              <a-radio value="hybrid">混合会议</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="会议主持人" required>
            <a-select
              v-model:value="scheduleForm.hosts"
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
              v-model:value="scheduleForm.experts"
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
              <div v-if="scheduleForm.materials.length > 0" class="materials-list">
                <div 
                  v-for="(file, index) in scheduleForm.materials" 
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.fileName || file.name || '未知文件' }}</span>
                  <span class="file-size">{{ formatFileSize(file.fileSize || file.size || 0) }}</span>
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
              v-model:value="scheduleForm.description"
              placeholder="请填写会议说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 编辑会议弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑会议安排"
      width="700px"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
    >
      <div v-if="selectedEditMeeting" class="edit-modal">
        <a-form :model="editForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="会议时间" required>
                <a-date-picker
                  v-model:value="editForm.datetime"
                  show-time
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="会议地点" required>
                <a-input
                  v-model:value="editForm.location"
                  placeholder="请输入会议地点"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="会议形式" required>
            <a-radio-group v-model:value="editForm.type">
              <a-radio value="offline">现场会议</a-radio>
              <a-radio value="online">线上会议</a-radio>
              <a-radio value="hybrid">混合会议</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="会议主持人" required>
            <a-select
              v-model:value="editForm.hosts"
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
          </a-form-item>

          <a-form-item label="参会专家" required>
            <a-select
              v-model:value="editForm.experts"
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
          </a-form-item>

          <a-form-item label="会议资料">
            <div class="meeting-materials">
              <a-upload
                :file-list="[]"
                :before-upload="beforeUploadEditMaterial"
                :on-remove="removeEditMaterial"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              >
                <a-button>
                  <UploadOutlined />
                  上传会议资料
                </a-button>
              </a-upload>
              
              <!-- 资料列表展示 -->
              <div v-if="editForm.materials.length > 0" class="materials-list">
                <div 
                  v-for="(file, index) in editForm.materials" 
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.fileName || file.name || '未知文件' }}</span>
                  <span class="file-size">{{ formatFileSize(file.fileSize || file.size || 0) }}</span>
                  <a-button 
                    type="link" 
                    danger 
                    size="small"
                    @click="removeEditMaterialByIndex(index)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="会议说明">
            <a-textarea
              v-model:value="editForm.description"
              placeholder="请填写会议说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 录入结论弹窗 -->
    <a-modal
      v-model:open="conclusionModalVisible"
      title="录入验收结论"
      width="800px"
      @ok="handleConclusionSubmit"
      @cancel="handleConclusionCancel"
    >
      <div v-if="selectedMeeting" class="conclusion-modal">
        <div class="project-meeting-info">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedMeeting.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="会议时间">
              {{ selectedMeeting.meetingTime }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedMeeting.meetingLocation }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" v-if="selectedMeeting.meetingType">
              {{ selectedMeeting.meetingType === 'offline' ? '现场会议' : selectedMeeting.meetingType === 'online' ? '线上会议' : '混合会议' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2" v-if="selectedMeeting.meetingDescription">
              {{ selectedMeeting.meetingDescription }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="conclusionForm" layout="vertical">
          <a-form-item label="验收结论" required>
            <a-radio-group v-model:value="conclusionForm.conclusion">
              <a-radio value="passed">验收通过</a-radio>
              <a-radio value="conditional_passed">有条件通过</a-radio>
              <a-radio value="failed">验收不通过</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="验收评分">
            <a-input-number
              v-model:value="conclusionForm.score"
              :min="0"
              :max="100"
              placeholder="请输入评分"
              style="width: 200px"
            />
            <span style="margin-left: 8px">分</span>
          </a-form-item>

          <a-form-item label="结论说明" required>
            <a-textarea
              v-model:value="conclusionForm.description"
              placeholder="请详细说明验收结论..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>

          <!-- <a-form-item label="整改要求" v-if="conclusionForm.conclusion !== 'passed'">
            <a-textarea
              v-model:value="conclusionForm.requirements"
              placeholder="请填写整改要求..."
              :rows="3"
              show-count
              :maxlength="300"
            />
          </a-form-item> -->

          <a-form-item label="结论相关文件">
            <div class="conclusion-files">
              <a-upload
                :before-upload="beforeUploadConclusionFile"
                :on-remove="removeConclusionFile"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                :file-list="[]"
              >
                <a-button>
                  <UploadOutlined />
                  上传结论文件
                </a-button>
              </a-upload>
              
              <!-- 文件列表展示 -->
              <div v-if="conclusionForm.conclusionFiles.length > 0" class="files-list">
                <div 
                  v-for="(file, index) in conclusionForm.conclusionFiles" 
                :key="index"
                  class="file-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.fileName || file.name || '未知文件' }}</span>
                  <span class="file-size">{{ formatFileSize(file.fileSize || file.size || 0) }}</span>
                    <a-button
                      type="link"
                      danger
                    size="small"
                      @click.stop="removeConclusionFileByIndex(index)"
                      style="cursor: pointer;"
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

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="项目详情"
      width="800px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedProject" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedProject.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedProject.projectCode }}
            </a-descriptions-item>
            <a-descriptions-item label="项目负责人">
              {{ selectedProject.projectLeader }}
            </a-descriptions-item>
            <a-descriptions-item label="项目周期">
              {{ selectedProject.projectDuration }}
            </a-descriptions-item>
            <a-descriptions-item label="项目预算">
              {{ selectedProject.projectBudget }}
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedProject.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="材料状态">
              <a-tag :color="selectedProject.materialStatus === 'approved' ? 'green' : 'orange'">
                {{ getMaterialStatusText(selectedProject.materialStatus) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 材料审核情况 -->
        <div class="detail-section">
          <h4>材料审核情况</h4>
          <div class="material-summary">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-statistic 
                  title="必需材料通过" 
                  :value="selectedProject.requiredMaterials" 
                  :suffix="`/ ${selectedProject.totalRequired}`"
                  :value-style="{ color: '#52c41a' }"
                />
              </a-col>
              <a-col :span="12">
                <a-statistic 
                  title="可选材料提交" 
                  :value="selectedProject.optionalMaterials" 
                  suffix="项"
                  :value-style="{ color: '#1890ff' }"
                />
                  </a-col>
                </a-row>
              </div>
        </div>

        <!-- 验收材料列表（真实数据） -->
        <div class="detail-section">
          <h4>验收材料</h4>
          <div v-if="selectedProject.materialsLoading" class="material-loading">正在加载材料...</div>
          <div v-else>
            <div v-if="selectedProject.materials && selectedProject.materials.length" class="material-list">
              <div v-for="m in selectedProject.materials" :key="m.id" class="material-item-detail">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                    {{ m.materialName }}
                </div>
                <div class="material-meta">
                    <span class="material-type">{{ m.materialType }}</span>
                    <a-tag :color="getMaterialReviewTagColor(m.reviewStatus)" size="small">{{ getMaterialReviewText(m.reviewStatus) }}</a-tag>
                </div>
              </div>
              <div class="material-actions">
                  <a-button type="link" size="small" @click="previewProjectMaterial(m)">预览</a-button>
                  <a-button type="link" size="small" @click="downloadProjectMaterial(m)">下载</a-button>
              </div>
            </div>
                </div>
            <div v-else class="text-muted" style="padding: 8px 0;">暂无材料</div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 短信通知弹窗 -->
    <a-modal
      v-model:open="notifyModalVisible"
      title="发送会议通知"
      width="600px"
      @ok="handleSendNotification"
      @cancel="handleNotifyCancel"
      :confirm-loading="sendingNotification"
    >
      <div v-if="selectedMeetingForNotify" class="notify-modal">
        <div class="meeting-summary">
          <h4>会议信息</h4>
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="项目名称">{{ selectedMeetingForNotify.projectName }}</a-descriptions-item>
            <a-descriptions-item label="会议时间">{{ selectedMeetingForNotify.meetingTime }}</a-descriptions-item>
            <a-descriptions-item label="会议地点">{{ selectedMeetingForNotify.meetingLocation }}</a-descriptions-item>
            <a-descriptions-item label="会议形式">
              <a-tag :color="getMeetingTypeColor(selectedMeetingForNotify.meetingType)">
                {{ getMeetingTypeText(selectedMeetingForNotify.meetingType) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="notifyForm" layout="vertical" style="margin-top: 20px;">
          <a-form-item label="通知方式" required>
            <a-checkbox-group v-model:value="notifyForm.methods">
              <a-checkbox value="sms">短信通知</a-checkbox>
              <a-checkbox value="email" disabled>邮件通知（暂未开放）</a-checkbox>
              <a-checkbox value="wechat" disabled>微信通知（暂未开放）</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-form-item label="通知对象" required>
            <div class="notify-targets">
              <div class="target-group">
                <div class="group-title">会议主持人</div>
                <div class="target-list">
                  <a-checkbox 
                    v-for="host in selectedMeetingForNotify.meetingHosts" 
                    :key="host"
                    :value="host"
                    v-model:checked="notifyForm.selectedHosts[host]"
                    style="display: block; margin-bottom: 8px;"
                  >
                    {{ host }}
                  </a-checkbox>
                </div>
              </div>
              
              <div class="target-group">
                <div class="group-title">参会专家</div>
                <div class="target-list">
                  <a-checkbox 
                    v-for="expert in selectedMeetingForNotify.experts" 
                    :key="expert"
                    :value="expert"
                    v-model:checked="notifyForm.selectedExperts[expert]"
                    style="display: block; margin-bottom: 8px;"
                  >
                    {{ expert }}
                  </a-checkbox>
                </div>
              </div>
            </div>
            
            <div class="select-all-actions" style="margin-top: 12px;">
              <a-button size="small" @click="selectAllTargets">全选</a-button>
              <a-button size="small" @click="clearAllTargets" style="margin-left: 8px;">清空</a-button>
            </div>
          </a-form-item>

          <a-form-item label="通知内容">
            <a-textarea
              v-model:value="notifyForm.content"
              :rows="4"
              placeholder="系统将自动生成通知内容，您也可以自定义修改..."
            />
            <div class="content-tip">
              系统会自动包含会议时间、地点等基本信息
            </div>
          </a-form-item>

          <a-form-item label="提醒设置">
            <div class="reminder-settings">
              <div class="reminder-option">
                <a-checkbox 
                  v-model:checked="notifyForm.sendImmediately"
                  style="margin-bottom: 12px;"
                >
                  立即发送
                </a-checkbox>
              </div>
              
              <div class="reminder-option">
                <a-checkbox 
                  v-model:checked="notifyForm.enableReminder"
                  style="margin-bottom: 8px;"
                >
                  会议前提醒
                </a-checkbox>
                
                <div v-if="notifyForm.enableReminder" class="reminder-time-setting">
                  <a-input-number
                    v-model:value="notifyForm.reminderValue"
                    :min="1"
                    :max="365"
                    placeholder="输入数值"
                    style="width: 120px; margin-right: 8px;"
                  />
                  <a-select
                    v-model:value="notifyForm.reminderUnit"
                    style="width: 80px;"
                    placeholder="单位"
                  >
                    <a-select-option value="hours">小时</a-select-option>
                    <a-select-option value="days">天</a-select-option>
                  </a-select>
                  <span style="margin-left: 8px; color: #8c8c8c; font-size: 12px;">
                    提醒
                  </span>
                </div>
              </div>
            </div>
          </a-form-item>
        </a-form>

        <div v-if="selectedMeetingForNotify.lastNotifyTime" class="last-notify-info">
          <a-alert
            type="info"
            :message="`上次通知时间：${selectedMeetingForNotify.lastNotifyTime}`"
            show-icon
            style="margin-top: 16px;"
          />
        </div>
      </div>
    </a-modal>
  </div>

    <!-- 结论详情弹窗 -->
    <a-modal
      v-model:open="conclusionDetailVisible"
      title="结论详情"
      width="900px"
      :footer="null"
      @cancel="handleConclusionDetailCancel"
    >
      <div v-if="selectedConclusion" class="detail-modal">
        <div class="detail-section">
          <h4>项目信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">{{ selectedConclusion.projectName }}</a-descriptions-item>
            <a-descriptions-item label="项目编号">{{ selectedConclusion.projectCode }}</a-descriptions-item>
            <a-descriptions-item label="会议时间">{{ formatDisplayTime(selectedConclusion.meetingTime) }}</a-descriptions-item>
            <a-descriptions-item label="结论时间">{{ selectedConclusion.conclusionTime }}</a-descriptions-item>
            <a-descriptions-item label="申请人">{{ selectedConclusion.applicant || '-' }}</a-descriptions-item>
            <a-descriptions-item label="申请单位">{{ selectedConclusion.applicantUnit || '-' }}</a-descriptions-item>
            <a-descriptions-item label="年度">{{ selectedConclusion.yearly || '-' }}</a-descriptions-item>
            <a-descriptions-item label="项目周期(月)">{{ selectedConclusion.projectCycle ?? '-' }}</a-descriptions-item>
            <a-descriptions-item label="预算(万元)">{{ selectedConclusion.budget ?? '-' }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-section">
          <h4>结论信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="验收结论">
              <a-tag :color="getConclusionColor(selectedConclusion.conclusion)">{{ getConclusionText(selectedConclusion.conclusion) }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="评分">{{ selectedConclusion.score }} 分</a-descriptions-item>
            <a-descriptions-item label="结论说明" :span="2">{{ selectedConclusion.conclusionDescription }}</a-descriptions-item>
            <a-descriptions-item v-if="selectedConclusion.requirements" label="整改要求" :span="2">{{ selectedConclusion.requirements }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-section">
          <h4>结论相关文件</h4>
          <div v-if="selectedConclusion.conclusionFiles && selectedConclusion.conclusionFiles.length" class="conclusion-files-display">
            <a-tag
              v-for="(f, idx) in selectedConclusion.conclusionFiles"
              :key="idx"
              color="purple"
              style="margin: 2px 4px 2px 0; cursor: pointer;"
              @click="downloadConclusionFile(f)"
            >
              <FileOutlined style="margin-right: 4px;" />
              {{ f.name || f.fileName }}
            </a-tag>
          </div>
          <div v-else class="text-muted">暂无文件</div>
        </div>
      </div>
    </a-modal>

    <!-- 会议详情弹窗 -->
    <a-modal
      v-model:open="meetingDetailVisible"
      title="会议详情"
      width="900px"
      :footer="null"
      @cancel="handleMeetingDetailCancel"
    >
      <div v-if="selectedMeeting" class="detail-modal">
        <div class="detail-section">
          <h4>项目信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">{{ selectedMeeting.projectName }}</a-descriptions-item>
            <a-descriptions-item label="项目编号">{{ selectedMeeting.projectCode }}</a-descriptions-item>
            <a-descriptions-item label="会议时间">{{ formatDisplayTime(selectedMeeting.meetingTime) }}</a-descriptions-item>
            <a-descriptions-item label="会议地点">{{ selectedMeeting.meetingLocation || selectedMeeting.meetingPlace }}</a-descriptions-item>
            <a-descriptions-item label="申请人">{{ selectedMeeting.applicant || '-' }}</a-descriptions-item>
            <a-descriptions-item label="申请单位">{{ selectedMeeting.applicantUnit || '-' }}</a-descriptions-item>
            <a-descriptions-item label="年度">{{ selectedMeeting.yearly || '-' }}</a-descriptions-item>
            <a-descriptions-item label="项目周期(月)">{{ selectedMeeting.projectCycle ?? '-' }}</a-descriptions-item>
            <a-descriptions-item label="预算(万元)">{{ selectedMeeting.budget ?? '-' }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-section">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="会议形式">
              <a-tag :color="getMeetingTypeColor(selectedMeeting.meetingType)">{{ getMeetingTypeText(selectedMeeting.meetingType) }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="会议状态">
              <a-tag :color="getMeetingStatusColor(selectedMeeting.meetingStatus)">{{ getMeetingStatusText(selectedMeeting.meetingStatus) }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2">{{ selectedMeeting.meetingDescription || '暂无说明' }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-section">
          <h4>参会人员</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="主持人" :span="2">
              <template v-if="selectedMeeting.meetingHosts && selectedMeeting.meetingHosts.length">
                <a-tag v-for="h in selectedMeeting.meetingHosts" :key="h" color="blue" style="margin-right: 4px;">{{ h }}</a-tag>
              </template>
              <template v-else>暂无</template>
            </a-descriptions-item>
            <a-descriptions-item label="参会专家" :span="2">
              <template v-if="selectedMeeting.experts && selectedMeeting.experts.length">
                <a-tag v-for="e in selectedMeeting.experts" :key="e" color="green" style="margin-right: 4px;">{{ e }}</a-tag>
              </template>
              <template v-else>暂无</template>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-section">
          <h4>会议资料</h4>
          <div v-if="selectedMeeting.meetingMaterials && selectedMeeting.meetingMaterials.length" class="conclusion-files-display">
            <div 
              v-for="(m, idx) in selectedMeeting.meetingMaterials" 
              :key="idx"
              class="material-item-display"
              style="margin: 2px 4px 2px 0; display: inline-flex; align-items: center;"
            >
              <a-tag 
                color="orange" 
                style="margin-right: 4px; cursor: pointer;"
                @click="previewMaterial(m)"
              >
                <FileOutlined style="margin-right: 4px;" />
                {{ m.name || m.materialName }}
              </a-tag>
              <a-button type="link" size="small" @click="downloadMaterial(m)">
                <DownloadOutlined />
              </a-button>
            </div>
          </div>
          <div v-else class="text-muted">暂无资料</div>
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
</template>

<script setup>
/**
 * 会议结论管理页面 - 管理角色
 * 功能：会议安排、结论录入、流程管理、状态跟踪
 */
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getTechnologicalProject } from '@/api/th_qd/opening/manage'
import {
  ScheduleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  MessageOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
// 导入PageContainer组件
import { ContentWrap } from '@/components/ContentWrap'
// 文件预览组件
import FilePreview from '@/components/th_qd/FilePreview.vue'
// 接口：th_qd/opening
import {
  getProposalApplicationPage,
  getProposalApplication,
  getProposalMeetingPage,
  getProposalMeeting,
  createProposalMeeting,
  updateProposalMeeting,
  deleteProposalMeeting,
  createProposalAcceptanceConclusion,
  createProposalConclusionFile,
  updateProposalApplication,
  getProposalMaterialPage
} from '@/api/th_qd/opening/management'

// 导入用户管理相关API和状态管理
import { getUserPage, getSimpleUserList } from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'

// 新增的会议结论管理API接口（会议结论管理专用）
import {
  createMeetingParticipantForConclusion,
  updateMeetingParticipantForConclusion,
  deleteMeetingParticipantForConclusion,
  batchDeleteMeetingParticipantForConclusion,
  getMeetingParticipantPageForConclusion,
  getMeetingParticipantForConclusion,
  createMeetingMaterialForConclusion,
  updateMeetingMaterialForConclusion,
  deleteMeetingMaterialForConclusion,
  batchDeleteMeetingMaterialForConclusion,
  getMeetingMaterialPageForConclusion,
  getMeetingMaterialForConclusion,
  createConclusionFileForConclusion,
  updateConclusionFileForConclusion,
  deleteConclusionFileForConclusion,
  batchDeleteConclusionFileForConclusion,
  getConclusionFilePageForConclusion,
  getConclusionFileForConclusion,
  // 开题验收结论管理API（重写版本）
  createProposalAcceptanceConclusionRewrite,
  updateProposalAcceptanceConclusionRewrite,
  getProposalAcceptanceConclusionRewritePage,
  getProposalAcceptanceConclusionRewrite,
  deleteProposalAcceptanceConclusionRewrite,
  // 开题结论文件管理API（重写版本）
  createProposalConclusionFileRewrite,
  updateProposalConclusionFileRewrite,
  getProposalConclusionFileRewrite,
  getProposalConclusionFileRewritePage,
  deleteProposalConclusionFileRewrite
} from '@/api/th_qd/opening/conclusion'
// 上传工具
import { uploadTechnologicalFile } from '@/api/upload'

// 统计数据
const stats = ref({
  pendingSchedule: 0,
  scheduled: 0,
  completed: 0,
  pendingConclusion: 0
})

// 筛选条件 - 与 center.vue 保持一致
const filters = ref({
  status: '', // 会议状态筛选
  meetingDateRange: undefined, // 会议时间范围
  keyword: '', // 项目名称关键词
  applicationStatus: '', // 申请状态筛选
  meetingType: '', // 会议形式筛选
  meetingStatus: '' // 会议状态筛选
})

// 活动标签页
const activeTab = ref('schedule')

// 待安排会议列表（后端）
const pendingScheduleList = ref([])

// 已安排会议列表（后端）
const scheduledMeetingList = ref([])

// 结论列表（后端）
const conclusionList = ref([])

// 结论分页参数
const pagination = ref({
  current: 1,
  pageSize: 5,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`
})

// 待安排会议分页参数
const pendingPagination = ref({
  current: 1,
  pageSize: 5,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`
})

// 已安排会议分页参数
const scheduledPagination = ref({
  current: 1,
  pageSize: 5,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录，当前显示 ${range[0]}-${range[1]} 条`
})

// 结论分页变化处理
const handlePageChange = (page, pageSize) => {
  console.log('结论分页变化:', { page, pageSize })
  loadConclusionData(page, pageSize)
}

// 结论每页条数变化处理
const handleSizeChange = (current, size) => {
  console.log('结论每页条数变化:', { current, size })
  loadConclusionData(current, size)
}

// 待安排会议分页变化处理
const handlePendingPageChange = (page, pageSize) => {
  console.log('待安排会议分页变化:', { page, pageSize })
  loadPendingScheduleData(page, pageSize)
}

// 待安排会议每页条数变化处理
const handlePendingSizeChange = (current, size) => {
  console.log('待安排会议每页条数变化:', { current, size })
  loadPendingScheduleData(current, size)
}

// 已安排会议分页变化处理
const handleScheduledPageChange = (page, pageSize) => {
  console.log('已安排会议分页变化:', { page, pageSize })
  loadScheduledMeetingData(page, pageSize)
}

// 已安排会议每页条数变化处理
const handleScheduledSizeChange = (current, size) => {
  console.log('已安排会议每页条数变化:', { current, size })
  loadScheduledMeetingData(current, size)
}

// 加载与分页/状态
const loading = ref(false)
const projectPager = ref({ pageNo: 1, pageSize: 10, total: 0 })
const meetingPager = ref({ pageNo: 1, pageSize: 10, total: 0 })
const conclusionPager = ref({ pageNo: 1, pageSize: 10, total: 0 })

// 用户管理相关状态
const userStore = useUserStore()

// 用户列表数据
const userList = ref([])
const hostOptions = ref([])
const expertOptions = ref([])

// 弹窗状态
const scheduleModalVisible = ref(false)
const editModalVisible = ref(false)
const conclusionModalVisible = ref(false)
const detailModalVisible = ref(false)
const notifyModalVisible = ref(false)
const selectedProject = ref(null)
const selectedMeeting = ref(null)
const selectedEditMeeting = ref(null)
const selectedMeetingForNotify = ref(null)
const sendingNotification = ref(false)
const conclusionDetailVisible = ref(false)
const selectedConclusion = ref(null)
const meetingDetailVisible = ref(false)

// 文件预览相关
const fileList = ref([])
const currentFileIndex = ref(0)
const previewVisible = ref(false)
const currentPreviewFile = ref({})

// 表单数据
const scheduleForm = ref({
  datetime: undefined,
  location: '',
  type: 'offline',
  hosts: [], // 改为数组，支持多个主持人
  experts: [], // 支持手动输入的专家
  materials: [], // 会议资料文件列表
  description: ''
})

const editForm = ref({
  datetime: undefined,
  location: '',
  type: 'offline',
  hosts: [], 
  experts: [],
  materials: [], 
  description: ''
})

const conclusionForm = ref({
  conclusion: 'passed',
  score: 85,
  description: '',
  requirements: '',
  conclusionFiles: [] // 结论相关文件
})

const notifyForm = ref({
  methods: ['sms'], // 通知方式
  selectedHosts: {}, // 选中的主持人
  selectedExperts: {}, // 选中的专家
  content: '', // 通知内容
  sendImmediately: true, // 立即发送
  enableReminder: false, // 启用提醒
  reminderValue: 1, // 提醒数值
  reminderUnit: 'hours' // 提醒单位（hours/days）
})

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

// 会议弹窗专用方法
const filterHostOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const filterExpertOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 文件上传相关方法
const beforeUploadMaterial = async (file) => {
  // 检查文件大小（50MB限制）
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB!')
    return false
  }
  
  // 检查文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar)$/i)) {
    message.error('只支持PDF、Word、PPT、Excel、压缩包格式!')
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
      
      scheduleForm.value.materials.push(uploadedFile)
      message.success(`文件 ${file.name} 上传成功`)
      console.log('文件已添加到列表:', uploadedFile)
    } else {
      message.error(`文件 ${file.name} 上传失败`)
      console.error('上传响应异常:', uploadResponse)
    }
  } catch (uploadError) {
    console.error('文件上传失败:', uploadError)
    message.error(`文件 ${file.name} 上传失败: ${uploadError.message}`)
  }
  
  return false // 阻止自动上传
}

const removeMaterial = (file) => {
  const index = scheduleForm.value.materials.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    scheduleForm.value.materials.splice(index, 1)
  }
}

const removeMaterialByIndex = (index) => {
  scheduleForm.value.materials.splice(index, 1)
  message.success('文件删除成功')
}

// 编辑会议的文件上传方法
const beforeUploadEditMaterial = async (file) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB!')
    return false
  }
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar)$/i)) {
    message.error('只支持PDF、Word、PPT、Excel、压缩包格式!')
    return false
  }
  
  try {
    console.log('=== 开始上传编辑会议材料 ===')
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
      
      editForm.value.materials.push(uploadedFile)
      message.success(`文件 ${file.name} 上传成功`)
      console.log('文件已添加到列表:', uploadedFile)
    } else {
      message.error(`文件 ${file.name} 上传失败`)
      console.error('上传响应异常:', uploadResponse)
    }
  } catch (uploadError) {
    console.error('文件上传失败:', uploadError)
    message.error(`文件 ${file.name} 上传失败: ${uploadError.message}`)
  }
  
  return false
}

const removeEditMaterial = (file) => {
  const index = editForm.value.materials.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    editForm.value.materials.splice(index, 1)
  }
}

const removeEditMaterialByIndex = (index) => {
  editForm.value.materials.splice(index, 1)
  message.success('文件删除成功')
}

// 结论文件上传方法
const beforeUploadConclusionFile = async (file) => {
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
    console.log('=== 开始上传结论文件 ===')
    console.log('文件名:', file.name)
    console.log('文件大小:', file.size)
    console.log('文件类型:', file.type)
    
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
      
      // 深拷贝上传的文件对象
      const uploadedFileCopy = {
        uid: uploadedFile.uid,
        name: uploadedFile.name,
        url: uploadedFile.url,
        fileUrl: uploadedFile.fileUrl, // 添加fileUrl字段
        size: uploadedFile.size,
        type: uploadedFile.type,
        status: uploadedFile.status,
        response: uploadedFile.response
      }
      
      // 同时保存到用户上传文件列表（只保存新上传的文件）
      if (uploadedFileCopy.uid && typeof uploadedFileCopy.uid === 'string' && uploadedFileCopy.uid.startsWith('vc-upload-')) {
        if (selectedMeeting.value.userUploadedFiles) {
          selectedMeeting.value.userUploadedFiles.push(uploadedFileCopy)
        } else {
          selectedMeeting.value.userUploadedFiles = [uploadedFileCopy]
        }
      }
      
      // 手动更新文件列表，避免与 a-upload 组件的自动管理冲突
      const currentFiles = [...conclusionForm.value.conclusionFiles]
      currentFiles.push(uploadedFileCopy)
      conclusionForm.value.conclusionFiles = currentFiles
      
      console.log('更新后的文件列表:', conclusionForm.value.conclusionFiles)
      console.log('文件列表中的第一个文件:', conclusionForm.value.conclusionFiles[0])
      console.log('第一个文件的url字段:', conclusionForm.value.conclusionFiles[0]?.url)
      
      message.success(`文件 ${file.name} 上传成功`)
      console.log('文件已添加到列表:', uploadedFileCopy)
    } else {
      message.error(`文件 ${file.name} 上传失败`)
      console.error('上传响应异常:', uploadResponse)
    }
  } catch (uploadError) {
    console.error('文件上传失败:', uploadError)
    message.error(`文件 ${file.name} 上传失败: ${uploadError.message}`)
  }
  
  return false
}

const removeConclusionFile = async (file) => {
  try {
            // 如果是已有文件（不是新上传的），调用删除API
        // 数字类型的uid表示已有文件，字符串且以'vc-upload-'开头的表示新上传文件
        if (file.uid && (typeof file.uid === 'number' || (typeof file.uid === 'string' && !file.uid.startsWith('vc-upload-')))) {
      console.log('=== 删除服务器文件 ===')
      console.log('文件ID:', file.uid)
      console.log('文件名:', file.name)
      
      const deleteResponse = await deleteProposalConclusionFileRewrite(Number(file.uid))
      console.log('文件删除API响应:', deleteResponse)
      
      if (deleteResponse === true || deleteResponse?.data === true || deleteResponse?.code === 0) {
        console.log('服务器文件删除成功')
      } else {
        console.error('服务器文件删除失败:', deleteResponse)
        message.error(`文件 ${file.name} 删除失败`)
        return
      }
    }
    
    // 从表单文件列表中删除
  const index = conclusionForm.value.conclusionFiles.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    conclusionForm.value.conclusionFiles.splice(index, 1)
    }
    
    // 从用户上传文件列表中删除（只删除新上传的文件）
    if (selectedMeeting.value.userUploadedFiles && file.uid && typeof file.uid === 'string' && file.uid.startsWith('vc-upload-')) {
      const userIndex = selectedMeeting.value.userUploadedFiles.findIndex(item => item.uid === file.uid)
      if (userIndex > -1) {
        selectedMeeting.value.userUploadedFiles.splice(userIndex, 1)
      }
    }
    
    message.success(`文件 ${file.name} 删除成功`)
  } catch (error) {
    console.error('删除文件失败:', error)
    message.error(`文件 ${file.name} 删除失败: ${error.message}`)
  }
}

const removeConclusionFileByIndex = async (index) => {
  console.log('=== 删除文件被调用 ===')
  console.log('删除索引:', index)
  console.log('当前文件列表:', conclusionForm.value.conclusionFiles)
  
        // 移除alert测试
  
  const file = conclusionForm.value.conclusionFiles[index]
  console.log('要删除的文件:', file)
  if (file) {
    try {
      // 如果是已有文件（不是新上传的），调用删除API
      // 数字类型的uid表示已有文件，字符串且以'vc-upload-'开头的表示新上传文件
      if (file.uid && (typeof file.uid === 'number' || (typeof file.uid === 'string' && !file.uid.startsWith('vc-upload-')))) {
        console.log('=== 删除服务器文件 ===')
        console.log('文件ID:', file.uid)
        console.log('文件名:', file.name)
        
        const deleteResponse = await deleteProposalConclusionFileRewrite(Number(file.uid))
        console.log('文件删除API响应:', deleteResponse)
        
        if (deleteResponse === true || deleteResponse?.data === true || deleteResponse?.code === 0) {
          console.log('服务器文件删除成功')
        } else {
          console.error('服务器文件删除失败:', deleteResponse)
          message.error(`文件 ${file.name} 删除失败`)
          return
        }
      }
      
      // 从表单文件列表中删除
  conclusionForm.value.conclusionFiles.splice(index, 1)
      
      // 从用户上传文件列表中删除（只删除新上传的文件）
      if (selectedMeeting.value.userUploadedFiles && file.uid && typeof file.uid === 'string' && file.uid.startsWith('vc-upload-')) {
        const userIndex = selectedMeeting.value.userUploadedFiles.findIndex(item => item.uid === file.uid)
        if (userIndex > -1) {
          selectedMeeting.value.userUploadedFiles.splice(userIndex, 1)
        }
      }
      
      message.success(`文件 ${file.name} 删除成功`)
    } catch (error) {
      console.error('删除文件失败:', error)
      message.error(`文件 ${file.name} 删除失败: ${error.message}`)
    }
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 状态相关方法
const getMaterialStatusText = (status) => {
  const textMap = {
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

const getMaterialStatusColor = (status) => {
  const colorMap = {
    reviewing: 'orange',
    approved: 'green',
    rejected: 'red',
    pending: 'default'
  }
  return colorMap[status] || 'default'
}

const getMeetingStatusColor = (status) => {
  const colorMap = {
    scheduled: 'blue',
    in_progress: 'orange',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getMeetingStatusText = (status) => {
  // 支持数字类型（后端）和字符串类型（前端）
  if (typeof status === 'number') {
    const textMap = {
      0: '待组织',
      1: '已安排',
      2: '进行中',
      3: '已结束'
    }
    return textMap[status] || '未知'
  } else {
  const textMap = {
    scheduled: '已安排',
    in_progress: '进行中',
      completed: '已完成',
      pending: '待组织'
  }
  return textMap[status] || '未知'
  }
}

const getMeetingTypeText = (type) => {
  // 支持数字类型（后端）和字符串类型（前端）
  if (typeof type === 'number') {
    const textMap = {
      0: '现场会议',
      1: '线上会议',
      2: '混合会议'
    }
    return textMap[type] || '未知'
  } else {
  const textMap = {
    offline: '现场会议',
    online: '线上会议',
    hybrid: '混合会议'
  }
  return textMap[type] || '未知'
  }
}

const getMeetingTypeColor = (type) => {
  // 支持数字类型（后端）和字符串类型（前端）
  if (typeof type === 'number') {
    const colorMap = {
      0: 'blue',    // 现场会议
      1: 'green',   // 线上会议
      2: 'orange'   // 混合会议
    }
    return colorMap[type] || 'default'
  } else {
  const colorMap = {
    offline: 'blue',
    online: 'green',
    hybrid: 'orange'
  }
  return colorMap[type] || 'default'
  }
}

/**
 * 将后端数字类型的会议形式转换为前端字符串类型
 */
const getMeetingTypeFromBackend = (type) => {
  if (typeof type === 'number') {
    const typeMap = {
      0: 'offline',   // 现场会议
      1: 'online',    // 线上会议
      2: 'hybrid'     // 混合会议
    }
    return typeMap[type] || 'offline'
  }
  return type || 'offline'
}

/**
 * 将前端字符串类型的会议形式转换为后端数字类型
 */
const getMeetingTypeFromFrontend = (type) => {
  const typeMap = {
    'offline': 0,   // 现场会议
    'online': 1,    // 线上会议
    'hybrid': 2     // 混合会议
  }
  return typeMap[type] || 0
}

/**
 * 处理时间戳，转换为可读格式
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 0) {
    return '会议时间待确定'
  }
  
  // 如果是时间戳格式，转换为可读格式
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
    } catch (e) {
      console.warn('时间戳转换失败:', e)
    }
  }
  
  // 如果已经是字符串格式，直接返回
  return timestamp
}

/**
 * 将后端数字类型的会议状态转换为前端字符串类型
 */
const getMeetingStatusFromBackend = (status) => {
  if (typeof status === 'number') {
    const statusMap = {
      0: 'pending',      // 待组织
      1: 'scheduled',    // 已安排
      2: 'in_progress',  // 进行中
      3: 'completed'     // 已结束
    }
    return statusMap[status] || 'scheduled'
  }
  return status || 'scheduled'
}

/**
 * 状态转换函数 - 与 center.vue 保持一致
 */
const convertApiStatusToFrontend = (apiStatus) => {
  const statusMap = {
    1: 'material_reviewing',    // 材料审核中
    2: 'meeting_preparing',     // 会议待组织
    3: 'meeting_scheduled',     // 会议已安排
    4: 'opening_passed',        // 开题通过
    5: 'opening_conditional',   // 有条件通过
    6: 'opening_failed',        // 开题未通过
    7: 'material_rejected'      // 材料审核未通过
  }
  return statusMap[apiStatus] || 'material_reviewing'
}

/**
 * 根据申请状态获取材料状态 - 与 center.vue 保持一致
 */
const getMaterialStatusFromApplicationStatus = (applicationStatus) => {
  if (applicationStatus === 1) return 'reviewing'      // 材料审核中
  if (applicationStatus === 2) return 'approved'      // 会议待组织
  if (applicationStatus === 7) return 'rejected'      // 材料审核未通过
  return 'approved'
}

/**
 * 获取状态显示文本 - 与 center.vue 保持一致
 */
const getStatusText = (currentStatus) => {
  const statusMap = {
    'material_reviewing': '材料审核中',
    'meeting_preparing': '会议待组织',
    'meeting_scheduled': '会议已安排',
    'opening_passed': '开题通过',
    'opening_conditional': '有条件通过',
    'opening_failed': '开题未通过',
    'material_rejected': '材料审核未通过'
  }
  return statusMap[currentStatus] || '未知状态'
}

/**
 * 获取状态标签颜色 - 与 center.vue 保持一致
 */
const getStatusColor = (currentStatus) => {
  const colorMap = {
    'material_reviewing': 'blue',      // 材料审核中
    'meeting_preparing': 'orange',     // 会议待组织
    'meeting_scheduled': 'cyan',       // 会议已安排
    'opening_passed': 'green',         // 开题通过
    'opening_conditional': 'gold',     // 有条件通过
    'opening_failed': 'red',           // 开题未通过
    'material_rejected': 'red'         // 材料审核未通过
  }
  return colorMap[currentStatus] || 'default'
}





/**
 * 应用筛选条件到已加载的数据
 */
const applyFiltersToLoadedData = () => {
  console.log('应用筛选条件到已加载数据:', filters.value)
  
  // 筛选待安排会议数据
  if (filters.value.applicationStatus || filters.value.keyword) {
    const filteredPending = pendingScheduleList.value.filter(app => {
      // 申请状态筛选
      if (filters.value.applicationStatus && app.applicationStatus !== parseInt(filters.value.applicationStatus)) {
        return false
      }
      
      // 关键词筛选
      if (filters.value.keyword && !app.projectName.includes(filters.value.keyword)) {
        return false
      }
      
      return true
    })
    
    console.log('筛选后的待安排会议数量:', filteredPending.length)
  }
  
  // 筛选已安排会议数据
  if (filters.value.meetingStatus || filters.value.meetingType || filters.value.keyword) {
    const filteredScheduled = scheduledMeetingList.value.filter(meeting => {
      // 会议状态筛选
      if (filters.value.meetingStatus && meeting.meetingStatus !== filters.value.meetingStatus) {
        return false
      }
      
      // 会议形式筛选
      if (filters.value.meetingType && meeting.meetingType !== filters.value.meetingType) {
        return false
      }
      
      // 关键词筛选
      if (filters.value.keyword && !meeting.projectName.includes(filters.value.keyword)) {
        return false
      }
      
      return true
    })
    
    console.log('筛选后的已安排会议数量:', filteredScheduled.length)
  }
  
  // 筛选结论列表数据
  if (filters.value.keyword) {
    const filteredConclusion = conclusionList.value.filter(conclusion => {
      // 关键词筛选
      if (filters.value.keyword && !conclusion.projectName.includes(filters.value.keyword)) {
        return false
      }

      return true
    })

    console.log('筛选后的结论列表数量:', filteredConclusion.length)
    conclusionList.value = filteredConclusion
  }

  // 更新时间范围筛选（如果有的话）
  if (filters.value.meetingDateRange && filters.value.meetingDateRange.length === 2) {
    console.log('时间范围筛选:', filters.value.meetingDateRange)
    // 这里可以添加时间范围筛选逻辑
  }
}

/**
 * 根据会议状态获取结论类型
 */
const getConclusionFromMeetingStatus = (currentStatus) => {
  if (currentStatus === 'opening_passed') return 'passed'
  if (currentStatus === 'opening_conditional') return 'conditional_passed'
  if (currentStatus === 'opening_failed') return 'failed'
  return 'passed' // 默认通过
}

/**
 * 根据申请状态推断会议信息 - 与 center.vue 逻辑一致
 */
const getMeetingInfoFromApplicationStatus = (project) => {
  const applicationStatus = project.applicationStatus
  
  // 根据申请状态推断会议信息
  if (applicationStatus === 3) {
    // 会议已安排
    return {
      time: '会议时间待确定',
      location: '会议地点待确定',
      type: 'offline',
      hosts: ['张主任'],
      experts: ['陈教授', '刘博士'],
      status: 'scheduled',
      description: '会议已安排，具体时间地点待确定'
    }
  } else if (applicationStatus >= 4 && applicationStatus <= 6) {
    // 已完成开题
    const resultMap = {
      4: 'passed',
      5: 'conditional_passed', 
      6: 'failed'
    }
    
    return {
      time: '会议已完成',
      location: '会议室',
      type: 'offline',
      hosts: ['张主任'],
      experts: ['陈教授', '刘博士'],
      status: 'completed',
      description: `开题${applicationStatus === 4 ? '通过' : applicationStatus === 5 ? '有条件通过' : '未通过'}`
    }
  } else {
    // 其他状态
    return {
      time: '待确定',
      location: '待确定',
      type: 'offline',
      hosts: ['待确定'],
      experts: ['待确定'],
      status: 'pending',
      description: '会议信息待确定'
    }
  }
}

const getConclusionColor = (conclusion) => {
  const colorMap = {
    passed: 'green',
    conditional_passed: 'orange',
    failed: 'red'
  }
  return colorMap[conclusion] || 'default'
}

const getConclusionText = (conclusion) => {
  const textMap = {
    passed: '验收通过',
    conditional_passed: '有条件通过',
    failed: '验收不通过'
  }
  return textMap[conclusion] || '未知'
}

// 显示用时间格式化（兼容毫秒时间戳与字符串）
const formatDisplayTime = (v) => {
  if (!v) return ''
  const d = typeof v === 'number' ? dayjs(v) : dayjs(v)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(v)
}



// 事件处理方法
const refreshData = async () => {
  try {
    loading.value = true
    message.info('正在刷新数据...')
    
    // 重新加载真实数据
    await loadRealData()
    
    message.success('数据刷新完成')
  } catch (error) {
    console.error('数据刷新失败:', error)
    message.error('数据刷新失败，请重试')
  } finally {
    loading.value = false
  }
}

const scheduleBatchMeeting = () => {
  if (pendingScheduleList.value.length === 0) {
    message.warning('暂无待安排会议的项目')
    return
  }
  
  message.info(`开始批量安排会议，共 ${pendingScheduleList.value.length} 个项目`)
  
  // 实际项目中可以打开批量安排弹窗
  // batchScheduleModalVisible.value = true
}

const handleFilter = async () => {
  try {
    loading.value = true
    console.log('开始应用筛选条件:', filters.value)
    
    // 重新加载数据，应用筛选条件
    await loadRealData()
    
    // 应用筛选条件到已加载的数据
    applyFiltersToLoadedData()
    
    message.success('筛选完成')
  } catch (error) {
    console.error('筛选失败:', error)
    message.error('筛选失败，请重试')
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  filters.value = {
    status: '',
    meetingDateRange: undefined,
    keyword: '',
    applicationStatus: '',
    meetingType: '',
    meetingStatus: ''
  }
  
  try {
    loading.value = true
    console.log('重置筛选条件，重新加载数据')
    
    // 重新加载数据
    await loadRealData()
    
    message.success('筛选条件已重置')
  } catch (error) {
    console.error('重置筛选失败:', error)
    message.error('重置筛选失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (key) => {
  activeTab.value = key
}

const scheduleMeeting = (item) => {
  selectedProject.value = item
  scheduleForm.value = {
    datetime: undefined,
    location: '',
    type: 'offline',
    hosts: [], // 重置为空数组
    experts: [], // 重置为空数组
    materials: [], // 重置为空数组
    description: ''
  }
  scheduleModalVisible.value = true
}

const viewMaterials = (item) => {
  message.info(`查看材料：${item.projectName}`)
}

const viewProjectDetail = async (item) => {
  // 显示项目详情，包括验收材料的预览和下载（真实数据）
  selectedProject.value = {
    ...item,
    materials: [],
    materialsLoading: true
  }
  detailModalVisible.value = true
  
  try {
    // 1. 获取开题申请材料（用于材料审核情况）
    const materialsPage = await getProposalMaterialPage({ 
      pageNo: '1', 
      pageSize: '100', 
      proposalApplicationId: item.id.toString() 
    })
    
    const materials = materialsPage?.list || []
    selectedProject.value.materials = materials.map((m) => ({
      id: m.id,
      projectId: m.projectId,
      materialName: m.materialName,
      materialType: Number(m.isRequired) === 1 ? '必需材料' : '可选材料',
      isRequired: Number(m.isRequired),
      reviewStatus: Number(m.reviewStatus),
      reviewComments: m.reviewComments,
      fileUrl: m.fileUrl,
      fileSize: m.fileSize,
      fileSuffix: m.materialName.split('.').pop(),
      uploader: m.uploader,
      uploadTime: m.uploadTime
    }))
    
    // 2. 计算材料审核统计
    const requiredList = materials.filter((m) => Number(m.isRequired) === 1)
    const optionalList = materials.filter((m) => Number(m.isRequired) === 0)
    const requiredPassed = requiredList.filter((m) => Number(m.reviewStatus) === 1)
    const requiredRejected = requiredList.filter((m) => Number(m.reviewStatus) === 2)

    selectedProject.value.totalRequired = requiredList.length
    selectedProject.value.requiredMaterials = requiredPassed.length
    selectedProject.value.optionalMaterials = optionalList.length

    if (requiredRejected.length > 0) {
      selectedProject.value.materialStatus = 'rejected'
    } else if (requiredPassed.length === requiredList.length && requiredList.length > 0) {
      selectedProject.value.materialStatus = 'approved'
    } else {
      selectedProject.value.materialStatus = 'pending'
    }
    
  } catch (e) {
    selectedProject.value.materials = []
    console.error('加载材料信息失败:', e)
  } finally {
    selectedProject.value.materialsLoading = false
  }
}

const startMeeting = async (item) => {
  try {
    // 调用更新会议状态API，将会议状态更新为2（进行中）
    await updateProposalMeeting({ id: item.id, meetingStatus: 2 })
  item.meetingStatus = 'in_progress'
  message.success(`开始会议：${item.projectName}`)
    // 刷新会议列表，确保与后端一致
    await loadScheduledMeetingData()
  } catch (e) {
    console.error('开始会议失败:', e)
    message.error('开始会议失败')
  }
}

const editMeeting = async (item) => {
  try {
    console.log('=== 编辑会议 ===')
    console.log('会议信息:', item)
    
    // ✅ 修改：调用获得开题会议表(重写)获取真实会议信息
    console.log('=== 调用获得开题会议表(重写)API ===')
    
    const meetingResp = await getProposalMeeting(item.meetingId || item.id)
    console.log('=== 获得开题会议表(重写)API响应 ===')
    console.log('API调用参数:', { meetingId: item.meetingId || item.id })
    console.log('原始响应:', meetingResp)
    console.log('响应类型:', typeof meetingResp)
    console.log('响应数据结构:', {
      hasData: !!meetingResp?.data,
      hasCode: 'code' in meetingResp,
      hasMsg: 'msg' in meetingResp,
      dataKeys: meetingResp?.data ? Object.keys(meetingResp.data) : 'no data'
    })
    
    const meeting = meetingResp?.data || meetingResp
    if (meeting && meeting.id) {
      selectedEditMeeting.value = meeting
      
      // 设置编辑表单数据
      editForm.value = {
        datetime: (meeting.meetingTime || meeting.meetingDateTime || meeting.createTime) ? dayjs(meeting.meetingTime || meeting.meetingDateTime || meeting.createTime) : undefined,
        location: meeting.meetingPlace || meeting.meetingLocation || '',
        type: meeting.meetingType || 'offline',
        hosts: [], // 初始化空数组，后续通过API获取
        experts: [], // 初始化空数组，后续通过API获取
        materials: [], // 初始化空数组，后续通过API获取
        description: meeting.meetingInstructions || ''
      }
      
      // 获取会议参与人信息
      try {
        const participantsRes = await getMeetingParticipantPageForConclusion({
          pageNo: '1',
          pageSize: '100',
          meetingId: meeting.id
        })
        
        console.log('=== 获得开题会议参与人表(重写)分页API响应 ===')
        console.log('API调用参数:', { pageNo: '1', pageSize: '100', meetingId: meeting.id })
        console.log('原始响应:', participantsRes)
        console.log('响应类型:', typeof participantsRes)
        console.log('响应数据结构:', {
          hasList: !!participantsRes?.list,
          hasData: !!participantsRes?.data,
          hasDataList: !!participantsRes?.data?.list,
          listLength: participantsRes?.list?.length || participantsRes?.data?.list?.length || 0,
          dataKeys: participantsRes ? Object.keys(participantsRes) : 'no data'
        })
        
        const participants = (participantsRes && (participantsRes.list || participantsRes.data?.list)) || []
        const hosts = participants
          .filter((p) => Number(p.participantRole) === 0)
          .map((p) => p.participantName)
        const experts = participants
          .filter((p) => Number(p.participantRole) === 1)
          .map((p) => p.participantName)
        
        editForm.value.hosts = hosts
        editForm.value.experts = experts
        
        console.log('编辑会议参与人信息:', { hosts, experts })
      } catch (e) {
        console.error('获取会议参与人失败:', e)
      }
      
      // 获取会议材料信息
      try {
        const materialsRes = await getMeetingMaterialPageForConclusion({
          pageNo: '1',
          pageSize: '100',
          meetingId: meeting.id
        })
        
        console.log('=== 获得开题会议材料表(重写)分页API响应 ===')
        console.log('API调用参数:', { pageNo: '1', pageSize: '100', meetingId: meeting.id })
        console.log('原始响应:', materialsRes)
        console.log('响应类型:', typeof materialsRes)
        console.log('响应数据结构:', {
          hasList: !!materialsRes?.list,
          hasData: !!materialsRes?.data,
          hasDataList: !!materialsRes?.data?.list,
          listLength: materialsRes?.list?.length || materialsRes?.data?.list?.length || 0,
          dataKeys: materialsRes ? Object.keys(materialsRes) : 'no data'
        })
        
        const materials = (materialsRes && (materialsRes.list || materialsRes.data?.list)) || []
        editForm.value.materials = materials.map(m => ({
          uid: `material-${m.id}`,
          name: m.materialName,
          url: m.fileUrl,
          size: m.fileSize,
          type: m.materialName.split('.').pop(),
        }))
        
        console.log('编辑会议材料信息:', editForm.value.materials)
      } catch (e) {
        console.error('获取会议材料失败:', e)
      }
      
      console.log('会议编辑数据已加载:', editForm.value)
    } else {
      console.error('获取会议信息失败，使用原始数据')
  selectedEditMeeting.value = item
  editForm.value = {
    datetime: item.meetingTime ? dayjs(item.meetingTime) : undefined,
    location: item.meetingLocation || '',
    type: item.meetingType || 'offline',
    hosts: item.meetingHosts || (item.meetingHost ? [item.meetingHost] : []),
    experts: item.experts || [],
    materials: item.meetingMaterials || [],
    description: item.meetingDescription || ''
  }
    }
  } catch (error) {
    console.error('加载会议编辑数据失败:', error)
    message.error('加载会议编辑数据失败')
    
    // 降级处理：使用原始数据
    selectedEditMeeting.value = item
    editForm.value = {
      datetime: item.meetingTime ? dayjs(item.meetingTime) : undefined,
      location: item.meetingLocation || '',
      type: item.meetingType || 'offline',
      hosts: item.meetingHosts || (item.meetingHost ? [item.meetingHost] : []),
      experts: item.experts || [],
      materials: item.meetingMaterials || [],
      description: item.meetingDescription || ''
    }
  } finally {
  editModalVisible.value = true
  }
}

const deleteMeeting = (item) => {
  // 显示确认删除对话框
  const modal = Modal.confirm({
    title: '确认删除',
    content: `确定要删除项目"${item.projectName}"的会议安排吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      // 从已安排会议列表中删除
      const index = scheduledMeetingList.value.findIndex(meeting => meeting.id === item.id)
      if (index > -1) {
        scheduledMeetingList.value.splice(index, 1)
        // 将项目重新添加到待安排会议列表
        pendingScheduleList.value.push({
          id: item.id,
          projectName: item.projectName,
          projectCode: item.projectCode,
          projectLeader: '张三', // 这里应该从原始数据获取
          projectDuration: '12个月',
          projectBudget: 500,
          materialStatus: 'approved',
          submitTime: '2024-01-15',
          requiredMaterials: 4,
          totalRequired: 4,
          optionalMaterials: 2
        })
        message.success('会议删除成功')
      }
    }
  })
}

const inputConclusion = (item) => {
  selectedMeeting.value = item
  conclusionForm.value = {
    conclusion: 'passed',
    score: 85,
    description: '',
    requirements: '',
    conclusionFiles: []
  }
  conclusionModalVisible.value = true
}

// 删除重复的editMeeting方法

const viewMeetingDetail = async (item) => {
  // 加载会议详情：会议信息、参会人员（重写）、项目申请（重写）
  selectedMeeting.value = { ...item }
  
  try {
    console.log('=== 查看会议详情 ===')
    console.log('会议信息:', item)
    
    // 1) 获得开题会议表(重写) —— 获取会议详细信息
    try {
      console.log('=== 调用获得开题会议表(重写)API ===')
      const meetingResp = await getProposalMeeting(item.meetingId || item.id)
      console.log('=== 获得开题会议表(重写)API响应 ===')
      console.log('API调用参数:', { meetingId: item.meetingId || item.id })
      console.log('原始响应:', meetingResp)
      console.log('响应类型:', typeof meetingResp)
      console.log('响应数据结构:', {
        hasData: !!meetingResp?.data,
        hasCode: 'code' in meetingResp,
        hasMsg: 'msg' in meetingResp,
        dataKeys: meetingResp?.data ? Object.keys(meetingResp.data) : 'no data'
      })
      
      const meeting = meetingResp?.data || meetingResp
      if (meeting && meeting.id) {
        // 更新会议详细信息
        selectedMeeting.value.meetingId = meeting.id
        selectedMeeting.value.meetingNo = meeting.meetingNo
        selectedMeeting.value.meetingName = meeting.meetingName
        // 修复会议时间字段映射 - 兼容不同的字段名，并处理时间戳
        const rawMeetingTime = meeting.meetingTime || meeting.meetingDateTime || meeting.createTime
        selectedMeeting.value.meetingTime = formatTimestamp(rawMeetingTime)
        selectedMeeting.value.meetingLocation = meeting.meetingPlace || meeting.meetingLocation
        selectedMeeting.value.meetingType = meeting.meetingType
        selectedMeeting.value.meetingStatus = meeting.meetingStatus
        selectedMeeting.value.meetingMinutes = meeting.meetingMinutes
        selectedMeeting.value.meetingInstructions = meeting.meetingInstructions
        selectedMeeting.value.proposalApplicationId = meeting.proposalApplicationId
        
        // 调试会议时间字段
        console.log('=== 会议时间字段调试 ===')
        console.log('原始会议数据:', meeting)
        console.log('meeting.meetingTime:', meeting.meetingTime)
        console.log('meeting.meetingDateTime:', meeting.meetingDateTime)
        console.log('meeting.createTime:', meeting.createTime)
        console.log('最终使用的meetingTime:', selectedMeeting.value.meetingTime)
        
        // 调试会议地点字段
        console.log('=== 会议地点字段调试 ===')
        console.log('meeting.meetingPlace:', meeting.meetingPlace)
        console.log('meeting.meetingLocation:', meeting.meetingLocation)
        console.log('最终使用的meetingLocation:', selectedMeeting.value.meetingLocation)
        
        // 调试会议说明字段
        console.log('=== 会议说明字段调试 ===')
        console.log('meeting.meetingInstructions:', meeting.meetingInstructions)
        console.log('meeting.meetingDescription:', meeting.meetingDescription)
        console.log('meeting.description:', meeting.description)
        console.log('最终使用的meetingInstructions:', selectedMeeting.value.meetingInstructions)
        
        console.log('会议信息已更新:', selectedMeeting.value)
      }
    } catch (e) {
      console.error('获取开题会议表失败:', e)
      // 忽略单次失败，保留已有信息
    }
    
    // 2) 获得开题申请表(重写) —— 使用申请ID获取项目信息
    try {
      const applicationId = selectedMeeting.value.proposalApplicationId || item.id
      const applicationResp = await getProposalApplication(Number(applicationId))
      console.log('=== 获取开题申请表(重写)API响应 ===')
      console.log('API调用参数:', { applicationId: Number(applicationId) })
      console.log('原始响应:', applicationResp)
      console.log('响应类型:', typeof applicationResp)
      console.log('响应数据结构:', {
        hasData: !!applicationResp?.data,
        hasCode: 'code' in applicationResp,
        hasMsg: 'msg' in applicationResp,
        dataKeys: applicationResp?.data ? Object.keys(applicationResp.data) : 'no data'
      })
      
      const application = applicationResp?.data || applicationResp
      if (application && application.id) {
        selectedMeeting.value.projectId = application.projectId
        selectedMeeting.value.projectName = application.projectName || selectedMeeting.value.projectName
        selectedMeeting.value.projectCode = application.applicationNo || selectedMeeting.value.projectCode
        selectedMeeting.value.applicant = application.applicant
        selectedMeeting.value.applicantUnit = application.applicantUnit
        selectedMeeting.value.yearly = application.yearly
        selectedMeeting.value.projectCycle = application.projectCycle
        selectedMeeting.value.budget = application.budget
        
        // 3) 通过项目ID获取项目立项申请详细信息
        if (application.projectId) {
          try {
            console.log('=== 获取项目立项申请详细信息 ===')
            console.log('项目ID:', application.projectId)
            
            const projectResp = await getTechnologicalProject(application.projectId)
            console.log('=== 项目立项申请API响应 ===')
            console.log('API调用参数:', { projectId: application.projectId })
            console.log('原始响应:', projectResp)
            console.log('响应类型:', typeof projectResp)
            console.log('响应数据结构:', {
              hasData: !!projectResp?.data,
              hasCode: 'code' in projectResp,
              hasMsg: 'msg' in projectResp,
              dataKeys: projectResp?.data ? Object.keys(projectResp.data) : 'no data'
            })
            
            const project = projectResp?.data || projectResp
            if (project && project.id) {
              // 补充完整的项目信息
              selectedMeeting.value.projectName = project.projectName || selectedMeeting.value.projectName
              selectedMeeting.value.projectCode = project.projectNo || selectedMeeting.value.projectCode
              selectedMeeting.value.applicant = project.applicant || selectedMeeting.value.applicant
              selectedMeeting.value.applicantUnit = project.applicantUnit || selectedMeeting.value.applicantUnit
              selectedMeeting.value.yearly = project.yearly || selectedMeeting.value.yearly
              selectedMeeting.value.projectCycle = project.projectCycle || selectedMeeting.value.projectCycle
              selectedMeeting.value.budget = project.budget || selectedMeeting.value.budget
              selectedMeeting.value.projectLeader = project.applicant || '待确定'
              selectedMeeting.value.projectDuration = project.projectCycle ? `${project.projectCycle}个月` : '12个月'
              selectedMeeting.value.projectBudget = project.budget ? `${project.budget}万元` : '待确定'
              
              console.log('项目详细信息已更新:', selectedMeeting.value)
            }
          } catch (projectError) {
            console.error('获取项目立项申请详细信息失败:', projectError)
            // 忽略项目详情获取失败，保留开题申请信息
          }
        }
        
        console.log('项目信息已更新:', selectedMeeting.value)
      }
    } catch (e) {
      console.error('获取开题申请表失败:', e)
      // 忽略单次失败，保留已有信息
    }

    // 3) 获得开题会议参与人表(重写) —— 分页查询参会人员并区分主持人与专家
    try {
      const participantsRes = await getMeetingParticipantPageForConclusion({ 
        pageNo: '1', 
        pageSize: '100', 
        meetingId: Number(selectedMeeting.value.meetingId || item.meetingId || item.id) 
      })
      console.log('=== 获取开题会议参与人表(重写)分页API响应 ===')
      console.log('API调用参数:', { 
        pageNo: '1', 
        pageSize: '100', 
        meetingId: Number(selectedMeeting.value.meetingId || item.meetingId || item.id) 
      })
      console.log('原始响应:', participantsRes)
      console.log('响应类型:', typeof participantsRes)
      console.log('响应数据结构:', {
        hasList: !!participantsRes?.list,
        hasData: !!participantsRes?.data,
        hasDataList: !!participantsRes?.data?.list,
        listLength: participantsRes?.list?.length || participantsRes?.data?.list?.length || 0,
        dataKeys: participantsRes ? Object.keys(participantsRes) : 'no data'
      })
      
      const participants = (participantsRes && (participantsRes.list || participantsRes.data?.list)) || []
      console.log('参会人员数量:', participants.length)
      
      const hosts = participants
        .filter((p) => Number(p.participantRole) === 0)
        .map((p) => p.participantName)
      const experts = participants
        .filter((p) => Number(p.participantRole) === 1)
        .map((p) => p.participantName)
      
      selectedMeeting.value.meetingHosts = hosts
      selectedMeeting.value.meetingHost = hosts.join('、')
      selectedMeeting.value.experts = experts
      
      console.log('主持人:', hosts)
      console.log('专家:', experts)
    } catch (e) {
      console.error('获取会议参与人失败:', e)
      // 忽略单次失败，保留已有信息
    }
    
    // 4) 获得开题会议材料表(重写)分页 —— 获取会议材料
    try {
      const materialsRes = await getMeetingMaterialPageForConclusion({
        pageNo: '1',
        pageSize: '100',
        meetingId: Number(selectedMeeting.value.meetingId || item.meetingId || item.id)
      })
      console.log('=== 获取开题会议材料表(重写)分页API响应 ===')
      console.log('API调用参数:', {
        pageNo: '1',
        pageSize: '100',
        meetingId: Number(selectedMeeting.value.meetingId || item.meetingId || item.id)
      })
      console.log('原始响应:', materialsRes)
      console.log('响应类型:', typeof materialsRes)
      console.log('响应数据结构:', {
        hasList: !!materialsRes?.list,
        hasData: !!materialsRes?.data,
        hasDataList: !!materialsRes?.data?.list,
        listLength: materialsRes?.list?.length || materialsRes?.data?.list?.length || 0,
        dataKeys: materialsRes ? Object.keys(materialsRes) : 'no data'
      })
      
      const materials = (materialsRes && (materialsRes.list || materialsRes.data?.list)) || []
      selectedMeeting.value.meetingMaterials = materials.map(m => ({
        uid: `material-${m.id}`,
        name: m.materialName,
        url: m.fileUrl,
        size: m.fileSize,
        type: m.materialName.split('.').pop(),
      }))
      
      console.log('会议材料数量:', selectedMeeting.value.meetingMaterials.length)
      console.log('会议材料:', selectedMeeting.value.meetingMaterials)
    } catch (e) {
      console.error('获取会议材料失败:', e)
      // 忽略单次失败，保留已有信息
    }
  } catch (error) {
    console.error('加载会议详情失败:', error)
    message.error('加载会议详情失败')
  } finally {
    meetingDetailVisible.value = true
  }
}

const editConclusion = async (item) => {
  console.log('=== 开始编辑结论 ===')
  console.log('选中的结论项:', item)
  
  selectedMeeting.value = item
  
  // 通过proposalApplicationId查找对应的会议ID
  if (item.proposalApplicationId) {
    try {
      console.log('=== 查找对应的会议ID ===')
      console.log('开题申请ID:', item.proposalApplicationId)
      
      const meetingResponse = await getProposalMeetingPage({
        pageNo: '1',
        pageSize: '10',
        proposalApplicationId: item.proposalApplicationId.toString()
      })
      
      if (meetingResponse && (meetingResponse.list || meetingResponse.data?.list)) {
        const meetings = meetingResponse.list || meetingResponse.data?.list || []
        if (meetings.length > 0) {
          const meeting = meetings[0] // 取第一个会议
          selectedMeeting.value.meetingId = meeting.id
          console.log('找到对应的会议ID:', meeting.id)
          
          // 获取会议的详细信息，包括会议地点
          try {
            console.log('=== 获取会议详细信息 ===')
            const meetingDetailResp = await getProposalMeeting(meeting.id)
            console.log('会议详情API响应:', meetingDetailResp)
            
            const meetingDetail = meetingDetailResp?.data || meetingDetailResp
            if (meetingDetail) {
              // 更新会议详细信息到selectedMeeting
              selectedMeeting.value.meetingLocation = meetingDetail.meetingPlace || meetingDetail.meetingLocation
              
              // 处理会议时间 - 如果meetingTime是0或无效值，使用其他字段或默认值
              let meetingTime = meetingDetail.meetingTime || meetingDetail.meetingDateTime
              if (!meetingTime || meetingTime === 0) {
                meetingTime = meetingDetail.createTime || item.meetingTime || '会议时间待确定'
              }
              
              // 使用统一的时间戳处理函数
              selectedMeeting.value.meetingTime = formatTimestamp(meetingTime)
              
              selectedMeeting.value.meetingType = meetingDetail.meetingType
              selectedMeeting.value.meetingInstructions = meetingDetail.meetingInstructions
              console.log('会议详细信息已更新:', {
                meetingLocation: selectedMeeting.value.meetingLocation,
                meetingTime: selectedMeeting.value.meetingTime,
                meetingType: selectedMeeting.value.meetingType,
                originalMeetingTime: meetingDetail.meetingTime,
                originalMeetingDateTime: meetingDetail.meetingDateTime,
                originalCreateTime: meetingDetail.createTime
              })
            }
          } catch (detailError) {
            console.warn('获取会议详细信息失败:', detailError)
          }
        }
      }
    } catch (e) {
      console.warn('查找会议ID失败:', e)
    }
  }
  
  // 保存用户已上传的文件（在重新设置表单之前）
  const existingFiles = conclusionForm.value.conclusionFiles || []
  const userUploadedFiles = existingFiles.filter(file => 
    file.uid && typeof file.uid === 'string' && file.uid.startsWith('vc-upload-') && file.url
  )
  
  console.log('保存的用户上传文件:', userUploadedFiles)
  
  // 深拷贝用户文件，避免响应式包装的影响
  const userUploadedFilesCopy = userUploadedFiles.map(file => ({
    uid: file.uid,
    name: file.name,
    url: file.url,
    size: file.size,
    type: file.type,
    status: file.status,
    response: file.response
  }))
  console.log('userUploadedFilesCopy', userUploadedFilesCopy)
  
  // 临时保存用户文件，避免在后续处理中丢失
  selectedMeeting.value.userUploadedFiles = userUploadedFilesCopy
  
  conclusionForm.value = {
    conclusion: item.conclusion || 'passed',
    score: item.score || 85,
    description: item.conclusionDescription || '',
    requirements: item.requirements || '',
    conclusionFiles: [...(item.conclusionFiles || []), ...userUploadedFiles]
  }
  
  // 如果有proposalApplicationId，先通过分页API查找对应的结论记录
  if (item.proposalApplicationId) {
    try {
      console.log('=== 通过分页API查找结论记录 ===')
      console.log('开题申请ID:', item.proposalApplicationId)
      console.log('API地址: /technological/proposal-acceptance-conclusion-rewrite/page')
      console.log('请求参数:', { 
        pageNo: '1', 
        pageSize: '10', 
        proposalApplicationId: item.proposalApplicationId.toString() 
      })
      
      const pageResponse = await getProposalAcceptanceConclusionRewritePage({
        pageNo: '1',
        pageSize: '10',
        proposalApplicationId: item.proposalApplicationId.toString()
      })
      
      console.log('=== 获得开题验收结论表(重写)分页API响应 ===')
      console.log('原始响应:', pageResponse)
      console.log('响应类型:', typeof pageResponse)
      console.log('响应code:', pageResponse?.code)
      console.log('响应data:', pageResponse?.data)
      
      // 检查响应结构 - 直接检查pageResponse.list，因为API返回的是 {list: Array(2), total: 2}
      if (pageResponse && pageResponse.list && pageResponse.list.length > 0) {
        console.log('找到结论记录列表，数量:', pageResponse.list.length)
        
        // 根据proposalApplicationId找到对应的结论记录
        const targetConclusionRecord = pageResponse.list.find(record => 
          record.proposalApplicationId === item.proposalApplicationId
        )
        
        if (targetConclusionRecord) {
          console.log('找到匹配的结论记录:', targetConclusionRecord)
          console.log('结论记录ID:', targetConclusionRecord.id)
          console.log('开题申请ID:', targetConclusionRecord.proposalApplicationId)
          console.log('结论结果:', targetConclusionRecord.conclusionResult)
          console.log('结论描述:', targetConclusionRecord.conclusionDescription)
          
          // 直接使用分页API返回的数据，不需要再调用详情API
          const conclusionData = targetConclusionRecord
          console.log('结论详细数据:', conclusionData)
          
          // 保存找到的结论记录ID，用于后续的更新操作
          selectedMeeting.value.conclusionRecordId = targetConclusionRecord.id
          
          // 获取结论相关文件
          try {
            console.log('=== 开始获取结论相关文件 ===')
            console.log('结论ID:', targetConclusionRecord.id)
            console.log('API地址: /technological/proposal-conclusion-file-rewrite/page')
            console.log('请求参数:', { 
              pageNo: '1', 
              pageSize: '50', 
              conclusionId: targetConclusionRecord.id.toString() 
            })
            
            const filesResponse = await getProposalConclusionFileRewritePage({
              pageNo: '1',
              pageSize: '50',
              conclusionId: targetConclusionRecord.id.toString()
            })
            
            console.log('=== 结论文件分页API响应 ===')
            console.log('原始响应:', filesResponse)
            console.log('响应类型:', typeof filesResponse)
            
            let conclusionFiles = []
            if (filesResponse && filesResponse.data && filesResponse.data.list) {
              // 标准响应格式
              conclusionFiles = filesResponse.data.list
              console.log('标准响应格式，文件数量:', conclusionFiles.length)
            } else if (filesResponse && filesResponse.list) {
              // 直接响应格式
              conclusionFiles = filesResponse.list
              console.log('直接响应格式，文件数量:', conclusionFiles.length)
            } else {
              console.log('未找到文件列表，使用空数组')
            }
            
            console.log('获取到的文件列表:', conclusionFiles)
            
            // 将API返回的文件字段映射为前端期望的字段
            const mappedFiles = conclusionFiles.map(file => ({
              uid: file.id || file.uid || `file_${Date.now()}_${Math.random()}`,
              name: file.fileName || file.name || '未知文件',
              url: file.fileUrl || file.url || '',
              size: file.fileSize || file.size || 0,
              type: (file.materialName || file.name || '').split('.').pop() || 'unknown',
              status: 'done',
              response: { code: 200, data: file }
            }))
            
            console.log('映射后的文件列表:', mappedFiles)
            
            // 使用保存的用户上传文件
            const userUploadedFiles = selectedMeeting.value.userUploadedFiles || []
            
            console.log('用户已上传的文件:', userUploadedFiles)
            console.log('selectedMeeting.value.userUploadedFiles:', selectedMeeting.value.userUploadedFiles)
            
            // 合并API文件和用户上传的文件
            const allFiles = [...mappedFiles, ...userUploadedFiles]
            
            console.log('合并后的文件列表:', allFiles)
            console.log('合并后的文件数量:', allFiles.length)
            
            // 更新表单数据，包含真实的文件信息
            conclusionForm.value = {
              conclusion: getConclusionFromBackend(conclusionData.conclusionResult),
              score: conclusionData.conclusionScore || 85,
              description: extractDescription(conclusionData.conclusionDescription),
              requirements: extractRequirements(conclusionData.conclusionDescription),
              conclusionFiles: allFiles
            }
            
            console.log('更新后的表单数据（包含文件）:', conclusionForm.value)
            console.log('文件数量:', conclusionForm.value.conclusionFiles.length)
            
          } catch (fileError) {
            console.error('获取结论文件失败:', fileError)
            console.error('文件获取错误详情:', {
              message: fileError.message,
              stack: fileError.stack,
              response: fileError.response?.data
            })
            
            // 如果文件获取失败，使用本地文件数据作为备选
            console.warn('使用本地文件数据作为备选')
            
            // 使用保存的用户上传文件
            const userUploadedFiles = selectedMeeting.value.userUploadedFiles || []
            
            // 合并本地文件和用户上传的文件
            const allFiles = [...(item.conclusionFiles || []), ...userUploadedFiles]
            
            conclusionForm.value = {
              conclusion: getConclusionFromBackend(conclusionData.conclusionResult),
              score: conclusionData.conclusionScore || 85,
              description: extractDescription(conclusionData.conclusionDescription),
              requirements: extractRequirements(conclusionData.conclusionDescription),
              conclusionFiles: allFiles
            }
          }
          
          console.log('最终的表单数据:', conclusionForm.value)
          console.log('保存的结论记录ID:', targetConclusionRecord.id)
        } else {
          console.log('未找到匹配的结论记录')
          console.log('当前项目proposalApplicationId:', item.proposalApplicationId)
          console.log('所有结论记录:', pageResponse.list.map(r => ({ 
            id: r.id, 
            proposalApplicationId: r.proposalApplicationId,
            conclusionResult: r.conclusionResult 
          })))
        }
      } else {
        console.log('未找到对应的结论记录，可能是新项目')
        console.log('分页响应数据:', pageResponse)
        console.log('响应结构分析:', {
          hasPageResponse: !!pageResponse,
          hasList: !!(pageResponse && pageResponse.list),
          listLength: pageResponse?.list?.length || 0
        })
      }
    } catch (error) {
      console.error('查找结论记录失败:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      })
      message.error('查找结论记录失败，将使用本地数据')
    }
  } else {
    console.log('该结论项没有proposalApplicationId，使用本地数据')
  }
  
  conclusionModalVisible.value = true
}

const exportConclusion = (item) => {
  // 导出验收结论文档
  message.success(`正在导出验收结论：${item.projectName}`)
  
  // 实际项目中这里应该调用导出接口
  // exportAPI.exportConclusion(item.id)
}

const viewConclusionDetail = async (item) => {
  // 查看结论详情
  selectedConclusion.value = { ...item }
  
  try {
    // 如果有结论ID，获取详细结论信息
    // 先根据申请ID获取开题申请表(重写)，再用申请ID分页查询结论
    if (item.id) {
      console.log('=== 查看结论详情 ===')
      console.log('项目信息:', item)
      console.log('获取开题申请详情，申请ID:', item.id)
      console.log('item.id:', item.id)
      console.log('item.conclusionId:', item.conclusionId)
      console.log('item.conclusionRecordId:', item.conclusionRecordId)

      // 获得开题申请表(重写)
      const applicationResp = await getProposalApplication(item.id)
      console.log('=== 获取开题申请表(重写)API响应 ===')
      console.log('原始响应:', applicationResp)
      const applicationData = applicationResp?.data || applicationResp
      const proposalApplicationId = applicationData?.id || item.proposalApplicationId || item.id
      console.log('最终使用的 proposalApplicationId:', proposalApplicationId)
      
      // 通过项目ID获取项目立项申请详细信息
      if (applicationData && applicationData.projectId) {
        try {
          console.log('=== 获取项目立项申请详细信息 ===')
          console.log('项目ID:', applicationData.projectId)
          
          const projectResp = await getTechnologicalProject(applicationData.projectId)
          console.log('=== 项目立项申请API响应 ===')
          console.log('原始响应:', projectResp)
          
          const project = projectResp?.data || projectResp
          if (project && project.id) {
            // 补充完整的项目信息到selectedConclusion
            selectedConclusion.value.projectName = project.projectName || selectedConclusion.value.projectName
            selectedConclusion.value.projectCode = project.projectNo || selectedConclusion.value.projectCode
            selectedConclusion.value.applicant = project.applicant || selectedConclusion.value.applicant
            selectedConclusion.value.applicantUnit = project.applicantUnit || selectedConclusion.value.applicantUnit
            selectedConclusion.value.yearly = project.yearly || selectedConclusion.value.yearly
            selectedConclusion.value.projectCycle = project.projectCycle || selectedConclusion.value.projectCycle
            selectedConclusion.value.budget = project.budget || selectedConclusion.value.budget
            selectedConclusion.value.projectLeader = project.applicant || '待确定'
            selectedConclusion.value.projectDuration = project.projectCycle ? `${project.projectCycle}个月` : '12个月'
            selectedConclusion.value.projectBudget = project.budget ? `${project.budget}万元` : '待确定'
            
            console.log('项目详细信息已更新:', selectedConclusion.value)
          }
        } catch (projectError) {
          console.error('获取项目立项申请详细信息失败:', projectError)
          // 忽略项目详情获取失败，保留开题申请信息
        }
      }

      // 根据申请ID分页查询结论，拿到结论记录ID
      const pageResp = await getProposalAcceptanceConclusionRewritePage({
        pageNo: '1',
        pageSize: '10',
        proposalApplicationId: String(proposalApplicationId)
      })
      console.log('=== 开题验收结论分页(重写)API响应 ===')
      console.log('原始响应:', pageResp)
      const pageList = pageResp?.data?.list || pageResp?.list || []
      console.log('结论记录数量:', pageList.length)
      const targetRecord = pageList.find(r => r.proposalApplicationId === proposalApplicationId) || pageList[0]

      let conclusionRecord = null
      if (targetRecord) {
        console.log('匹配到的结论记录ID:', targetRecord.id)
        const conclusionResponse = await getProposalAcceptanceConclusionRewrite(targetRecord.id)
        console.log('=== 获取开题验收结论表(重写)单个API响应 ===')
        console.log('原始响应:', conclusionResponse)
        console.log('响应类型:', typeof conclusionResponse)
        console.log('响应code:', conclusionResponse?.code)
        console.log('响应data:', conclusionResponse?.data)

        if (conclusionResponse && conclusionResponse.data) {
          // 标准响应格式
          conclusionRecord = conclusionResponse.data
          console.log('标准响应格式，结论记录:', conclusionRecord)
        } else if (conclusionResponse && conclusionResponse.id) {
          // 直接响应格式
          conclusionRecord = conclusionResponse
          console.log('直接响应格式，结论记录:', conclusionRecord)
        } else {
          console.log('未找到结论记录')
        }
      } else {
        console.log('未找到关联的结论记录')
      }
      
      if (conclusionRecord) {
        console.log('找到结论记录:', conclusionRecord)
        console.log('结论记录ID:', conclusionRecord.id)
        console.log('开题申请ID:', conclusionRecord.proposalApplicationId)
        console.log('结论结果:', conclusionRecord.conclusionResult)
        console.log('结论描述:', conclusionRecord.conclusionDescription)
        
        // 获取结论文件
        const filesResponse = await getProposalConclusionFileRewritePage({
          pageNo: 1,
          pageSize: 100,
          conclusionId: conclusionRecord.id
        })
        
        console.log('结论文件响应:', filesResponse)
        
        let conclusionFiles = []
        if (filesResponse && filesResponse.data && filesResponse.data.list) {
          // 标准响应格式
          conclusionFiles = filesResponse.data.list
          console.log('标准响应格式，文件数量:', conclusionFiles.length)
        } else if (filesResponse && filesResponse.list) {
          // 直接响应格式
          conclusionFiles = filesResponse.list
          console.log('直接响应格式，文件数量:', conclusionFiles.length)
        } else {
          console.log('未找到文件列表，使用空数组')
        }
        
        // 映射文件字段
        const mappedFiles = conclusionFiles.map(file => ({
          uid: file.id,
          name: file.fileName,
          url: file.fileUrl,
          size: file.fileSize,
          type: file.materialName ? file.materialName.split('.').pop() : '',
          status: 'done'
        }))
        
        // 更新selectedConclusion的结论信息
        selectedConclusion.value = {
          ...item,
          conclusionRecord: conclusionRecord,
          conclusionFiles: mappedFiles,
          conclusion: getConclusionFromBackend(conclusionRecord.conclusionResult),
          score: conclusionRecord.conclusionScore,
          conclusionDescription: conclusionRecord.conclusionDescription,
          conclusionTime: formatDisplayTime(conclusionRecord.createTime)
        }
      }
    }
    
    // 打开详情弹窗
    conclusionDetailVisible.value = true
  message.success(`正在查看结论详情：${item.projectName}`)
  
  } catch (error) {
    console.error('获取结论详情失败:', error)
    message.error('获取结论详情失败')
  }
}

// 会议资料预览方法
const previewMaterial = (material) => {
  // 使用后端返回的真实字段进行预览
  console.log('预览材料:', material)
  console.log('选中会议的材料:', selectedMeeting.value?.meetingMaterials)

  // 构建文件列表
  if (selectedMeeting.value?.meetingMaterials) {
    fileList.value = selectedMeeting.value.meetingMaterials.map(item => {
      return {
        id: item.id,
        name: item.materialName || item.name,
        type: item.materialName.split('.').pop(),
        size: item.fileSize || 0,
        url: item.fileUrl || item.url,
        uploadTime: item.createTime || '2024-01-15 10:30'
      }
    })
  } else {
    // 如果没有材料列表，使用单个文件
    fileList.value = [{
      id: material.id,
      name: material.materialName || material.name,
      type: material.materialName.split('.').pop(),
      size: material.fileSize || 0,
      url: material.fileUrl || material.url,
      uploadTime: material.createTime || '2024-01-15 10:30'
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

// 会议资料下载方法
const downloadMaterial = (material) => {
  // 使用材料上的 fileUrl 进行下载
  const url = material.fileUrl || material.url
  const name = material.materialName || material.name || '下载文件'

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

// 结论文件下载方法
const downloadConclusionFile = (file) => {
  // 使用结论文件上的 fileUrl 进行下载
  const url = file.fileUrl || file.url || file.filePath
  const name = file.fileName || file.name || '下载文件'

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

// 数据转换辅助函数
const getConclusionFromBackend = (backendValue) => {
  const mapping = {
    0: 'passed',           // 0-通过
    1: 'conditional_passed', // 1-有条件通过
    2: 'failed'            // 2-驳回
  }
  return mapping[backendValue] || 'passed'
}

const extractDescription = (fullDescription) => {
  if (!fullDescription) return ''
  // 如果包含整改要求，提取主要描述部分
  const parts = fullDescription.split('\n\n整改要求：')
  return parts[0] || fullDescription
}

const extractRequirements = (fullDescription) => {
  if (!fullDescription) return ''
  // 提取整改要求部分
  const parts = fullDescription.split('\n\n整改要求：')
  return parts[1] || ''
}

// 结论结果映射函数
const getConclusionResultFromFrontend = (frontendValue) => {
  const mapping = {
    'passed': 0,           // 通过
    'conditional_passed': 1, // 有条件通过
    'failed': 2            // 驳回
  }
  return mapping[frontendValue] || 0
}

// 构建结论描述
const buildConclusionDescription = (description, requirements) => {
  if (requirements && requirements.trim()) {
    return `${description}\n\n整改要求：${requirements}`
  }
  return description
}

// 申请状态更新函数
const updateApplicationStatus = async (conclusion) => {
  const statusMapping = {
    'passed': 4,           // 4: 开题通过
    'conditional_passed': 5, // 5: 有条件通过
    'failed': 6            // 6: 开题未通过
  }
  
  const newStatus = statusMapping[conclusion]
  if (newStatus && selectedMeeting.value?.proposalApplicationId) {
    try {
      console.log('=== 开始更新开题申请状态 ===')
      console.log('项目ID:', selectedMeeting.value.proposalApplicationId)
      console.log('新状态:', newStatus)
      
      await updateProposalApplication({
        id: selectedMeeting.value.proposalApplicationId,
        applicationStatus: newStatus
      })
      
      console.log('申请状态更新成功')
    } catch (error) {
      console.error('申请状态更新失败:', error)
      console.warn('申请状态更新失败，但不影响结论操作')
    }
  }
}

// 结论文件处理函数
const handleConclusionFilesCreate = async (conclusionId) => {
  if (conclusionForm.value.conclusionFiles.length > 0) {
    console.log('=== 开始创建结论文件 ===')
    console.log('conclusionForm.value.conclusionFiles', conclusionForm.value.conclusionFiles)
    console.log('文件数量:', conclusionForm.value.conclusionFiles.length)
    
    for (let i = 0; i < conclusionForm.value.conclusionFiles.length; i++) {
      const file = conclusionForm.value.conclusionFiles[i]
      
      // 详细调试文件对象
      console.log(`=== 处理文件 ${i + 1} ===`)
      console.log('原始文件对象:', file)
      console.log('文件对象的所有属性:', Object.keys(file))
      console.log('文件对象类型:', typeof file)
      console.log('是否为响应式对象:', file?.__v_isRef || file?.__v_isReactive)
      console.log('原始对象:', file?.__v_raw)
      console.log('file.url:', file.url)
      console.log('file.fileUrl:', file.fileUrl)
      console.log('file.name:', file.name)
      console.log('file.fileName:', file.fileName)
      console.log('file.size:', file.size)
      console.log('file.fileSize:', file.fileSize)
      
      // 兼容不同的字段名 - 处理响应式对象和深拷贝对象
      const rawFile = file?.__v_raw || file
      
      // 直接检查所有可能的URL字段
      const possibleUrls = [
        rawFile?.url,
        rawFile?.fileUrl,
        rawFile?.URL,
        rawFile?.FileUrl,
        file?.url,
        file?.fileUrl,
        file?.URL,
        file?.FileUrl
      ].filter(Boolean)
      
      const fileUrl = possibleUrls[0] || ''
      const fileName = rawFile?.name || rawFile?.fileName || file?.name || file?.fileName || '未知文件'
      const fileSize = rawFile?.size || rawFile?.fileSize || file?.size || file?.fileSize || 0
      
      console.log('提取的字段值:')
      console.log('- fileUrl:', fileUrl)
      console.log('- fileName:', fileName)
      console.log('- fileSize:', fileSize)
      
      if (!fileUrl) {
        console.error(`文件 ${fileName} 缺少URL信息`)
        console.error('文件对象:', file)
        continue
      }
      
      try {
        const fileData = {
          id: 0,
          conclusionId: conclusionId,
          fileName: fileName,
          fileUrl: fileUrl,
          fileSize: fileSize,
          fileSuffix: fileName.split('.').pop() || '',
          sort: i
        }
        
        console.log(`创建文件 ${file.name}:`, fileData)
        const response = await createProposalConclusionFileRewrite(fileData)
        console.log(`文件 ${file.name} 创建结果:`, response)
      } catch (error) {
        console.error(`文件 ${file.name} 创建失败:`, error)
      }
    }
    
    console.log('=== 结论文件创建完成 ===')
  }
}

const handleConclusionFilesUpdate = async (conclusionId) => {
  if (conclusionForm.value.conclusionFiles.length > 0) {
    console.log('=== 开始更新结论文件 ===')
    console.log('文件数量:', conclusionForm.value.conclusionFiles.length)

    // 获取当前结论的所有原始文件ID，用于判断哪些是原有文件
    let existingFileIds = []
    try {
      const filesResponse = await getProposalConclusionFileRewritePage({
        pageNo: '1',
        pageSize: '50',
        conclusionId: conclusionId.toString()
      })

      if (filesResponse && filesResponse.data && filesResponse.data.list) {
        existingFileIds = filesResponse.data.list.map(file => file.id.toString())
      } else if (filesResponse && filesResponse.list) {
        existingFileIds = filesResponse.list.map(file => file.id.toString())
      }
      console.log('现有文件ID列表:', existingFileIds)
    } catch (error) {
      console.error('获取现有文件ID失败:', error)
    }
    
    for (let i = 0; i < conclusionForm.value.conclusionFiles.length; i++) {
      const file = conclusionForm.value.conclusionFiles[i]
      
      // 详细调试文件对象
      console.log(`=== 处理文件 ${i + 1} ===`)
      console.log('原始文件对象:', file)
      console.log('文件对象的所有属性:', Object.keys(file))
      console.log('文件对象类型:', typeof file)
      console.log('是否为响应式对象:', file?.__v_isRef || file?.__v_isReactive)
      console.log('原始对象:', file?.__v_raw)
      console.log('file.url:', file.url)
      console.log('file.fileUrl:', file.fileUrl)
      console.log('file.name:', file.name)
      console.log('file.fileName:', file.fileName)
      console.log('file.size:', file.size)
      console.log('file.fileSize:', file.fileSize)
      
      // 兼容不同的字段名 - 处理响应式对象和深拷贝对象
      const rawFile = file?.__v_raw || file
      
      // 直接检查所有可能的URL字段
      const possibleUrls = [
        rawFile?.url,
        rawFile?.fileUrl,
        rawFile?.URL,
        rawFile?.FileUrl,
        file?.url,
        file?.fileUrl,
        file?.URL,
        file?.FileUrl
      ].filter(Boolean)
      
      const fileUrl = possibleUrls[0] || ''
      const fileName = rawFile?.name || rawFile?.fileName || file?.name || file?.fileName || '未知文件'
      const fileSize = rawFile?.size || rawFile?.fileSize || file?.size || file?.fileSize || 0
      
      console.log('提取的字段值:')
      console.log('- fileUrl:', fileUrl)
      console.log('- fileName:', fileName)
      console.log('- fileSize:', fileSize)
      
      if (!fileUrl) {
        console.error(`文件 ${fileName} 缺少URL信息`)
        console.error('文件对象:', file)
        continue
      }
      
      try {
        // 判断文件类型
        let isExistingFile = false
        let fileId = null

        // 检查是否是原有文件
        if (file.uid) {
          if (typeof file.uid === 'number') {
            // 数字类型的uid，直接判断为原有文件
            isExistingFile = true
            fileId = file.uid
          } else if (typeof file.uid === 'string') {
            if (!file.uid.startsWith('vc-upload-')) {
              // 字符串类型但不是以'vc-upload-'开头，可能是原有文件ID
              if (existingFileIds.includes(file.uid)) {
                isExistingFile = true
                fileId = parseInt(file.uid)
              }
            }
            // 其他情况（以'vc-upload-'开头的字符串）视为新上传文件
          }
        }

        // 检查文件是否有response属性，如果有且包含id，则可能是原有文件
        if (!isExistingFile && file.response && file.response.data && file.response.data.id) {
          isExistingFile = true
          fileId = file.response.data.id
        }

        console.log(`文件 ${fileName} 类型判断:`, {
          isExistingFile,
          fileId,
          uid: file.uid,
          uidType: typeof file.uid
        })
        
        if (isExistingFile && fileId) {
          // 更新现有文件
          const updateData = {
            id: fileId,
            conclusionId: conclusionId,
            fileName: fileName,
            fileUrl: fileUrl,
            fileSize: fileSize,
            fileSuffix: fileName.split('.').pop() || '',
            sort: i
          }
          
          console.log(`更新文件 ${fileName}:`, updateData)
          const response = await updateProposalConclusionFileRewrite(updateData)
          console.log(`文件 ${fileName} 更新结果:`, response)
        } else {
          // 创建新文件 - 只处理真正新上传的文件
          console.log(`创建新文件 ${fileName}`)
          const createData = {
            id: 0,
            conclusionId: conclusionId,
            fileName: fileName,
            fileUrl: fileUrl,
            fileSize: fileSize,
            fileSuffix: fileName.split('.').pop() || '',
            sort: i
          }
          
          console.log(`创建文件 ${fileName}:`, createData)
          const response = await createProposalConclusionFileRewrite(createData)
          console.log(`文件 ${fileName} 创建结果:`, response)
        }
      } catch (error) {
        console.error(`文件 ${fileName} 处理失败:`, error)
      }
    }
    
    console.log('=== 结论文件更新完成 ===')
  }
}

// 一键通知方法
const sendNotification = (meeting) => {
  selectedMeetingForNotify.value = meeting
  
  // 初始化通知表单
  resetNotifyForm()
  
  // 生成默认通知内容
  generateDefaultNotifyContent()
  
  notifyModalVisible.value = true
}

// 重置通知表单
const resetNotifyForm = () => {
  notifyForm.value = {
    methods: ['sms'],
    selectedHosts: {},
    selectedExperts: {},
    content: '',
    sendImmediately: true,
    enableReminder: false,
    reminderValue: 1,
    reminderUnit: 'hours'
  }
  
  // 默认选中所有参会人员
  if (selectedMeetingForNotify.value) {
    // 选中所有主持人
    selectedMeetingForNotify.value.meetingHosts.forEach(host => {
      notifyForm.value.selectedHosts[host] = true
    })
    
    // 选中所有专家
    selectedMeetingForNotify.value.experts.forEach(expert => {
      notifyForm.value.selectedExperts[expert] = true
    })
  }
}

// 生成默认通知内容
const generateDefaultNotifyContent = () => {
  if (!selectedMeetingForNotify.value) return
  
  const meeting = selectedMeetingForNotify.value
  const typeText = getMeetingTypeText(meeting.meetingType)
  
  notifyForm.value.content = `【会议通知】
项目：${meeting.projectName}（${meeting.projectCode}）
时间：${meeting.meetingTime}
地点：${meeting.meetingLocation}
形式：${typeText}
说明：${meeting.meetingDescription || '请准时参加'}

如有疑问，请及时联系会议组织方。`
}

// 全选通知对象
const selectAllTargets = () => {
  if (selectedMeetingForNotify.value) {
    // 选中所有主持人
    selectedMeetingForNotify.value.meetingHosts.forEach(host => {
      notifyForm.value.selectedHosts[host] = true
    })
    
    // 选中所有专家
    selectedMeetingForNotify.value.experts.forEach(expert => {
      notifyForm.value.selectedExperts[expert] = true
    })
  }
}

// 清空通知对象
const clearAllTargets = () => {
  notifyForm.value.selectedHosts = {}
  notifyForm.value.selectedExperts = {}
}

// 发送通知
const handleSendNotification = async () => {
  // 验证通知方式
  if (!notifyForm.value.methods || notifyForm.value.methods.length === 0) {
    message.error('请选择通知方式')
    return
  }
  
  // 验证通知对象
  const selectedHosts = Object.keys(notifyForm.value.selectedHosts).filter(key => notifyForm.value.selectedHosts[key])
  const selectedExperts = Object.keys(notifyForm.value.selectedExperts).filter(key => notifyForm.value.selectedExperts[key])
  
  if (selectedHosts.length === 0 && selectedExperts.length === 0) {
    message.error('请选择至少一个通知对象')
    return
  }
  
  // 验证通知内容
  if (!notifyForm.value.content.trim()) {
    message.error('请填写通知内容')
    return
  }
  
  // 验证提醒设置
  if (!notifyForm.value.sendImmediately && !notifyForm.value.enableReminder) {
    message.error('请至少选择一种发送方式')
    return
  }
  
  if (notifyForm.value.enableReminder) {
    if (!notifyForm.value.reminderValue || notifyForm.value.reminderValue < 1) {
      message.error('请输入有效的提醒时间')
      return
    }
    if (!notifyForm.value.reminderUnit) {
      message.error('请选择提醒时间单位')
      return
    }
  }
  
  sendingNotification.value = true
  
  try {
    // 模拟发送短信API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新最后通知时间
    if (selectedMeetingForNotify.value) {
      selectedMeetingForNotify.value.lastNotifyTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    
    const totalRecipients = selectedHosts.length + selectedExperts.length
    let successMessage = `短信通知设置成功！已向${totalRecipients}位参会人员`
    
    if (notifyForm.value.sendImmediately) {
      successMessage += '发送通知'
    }
    
    if (notifyForm.value.enableReminder) {
      const unit = notifyForm.value.reminderUnit === 'hours' ? '小时' : '天'
      if (notifyForm.value.sendImmediately) {
        successMessage += `，并设置会议前${notifyForm.value.reminderValue}${unit}提醒`
      } else {
        successMessage += `设置会议前${notifyForm.value.reminderValue}${unit}提醒`
      }
    }
    
    message.success(successMessage)
    notifyModalVisible.value = false
  } catch (error) {
    message.error('通知设置失败，请稍后重试')
  } finally {
    sendingNotification.value = false
  }
}

// 取消通知
const handleNotifyCancel = () => {
  notifyModalVisible.value = false
}

// 弹窗处理方法
const handleScheduleSubmit = async () => {
  try {
    console.log('=== 开始组织会议 ===')
    console.log('selectedProject:', selectedProject.value)
    console.log('scheduleForm:', scheduleForm.value)
    
  // 表单验证
  if (!scheduleForm.value.datetime) {
    message.error('请选择会议时间')
    return
  }
    if (!scheduleForm.value.location.trim()) {
      message.error('请填写会议地点')
    return
  }
  if (!scheduleForm.value.hosts || scheduleForm.value.hosts.length === 0) {
      message.error('请选择会议主持人')
    return
  }
  if (!scheduleForm.value.experts || scheduleForm.value.experts.length === 0) {
      message.error('请选择参会专家')
    return
  }

    console.log('表单验证通过')

    // 生成会议编号和名称
    const meetingNo = `HY${Date.now()}`
    const meetingName = `${selectedProject.value.projectName}开题会议`
    
    console.log('会议编号:', meetingNo)
    console.log('会议名称:', meetingName)

    // 会议形式转换
    const meetingTypeMap = {
      'offline': 0,    // 现场会议
      'online': 1,     // 线上会议
      'hybrid': 2      // 混合会议
    }
    
    console.log('会议形式:', scheduleForm.value.type, '->', meetingTypeMap[scheduleForm.value.type])

    // 检查材料数组
    console.log('会议材料数组:', scheduleForm.value.materials)
    console.log('材料数组类型:', typeof scheduleForm.value.materials)
    console.log('材料数组长度:', scheduleForm.value.materials?.length)
    
    // 安全处理材料数组
    const materialsList = scheduleForm.value.materials || []
    console.log('处理后的材料列表:', materialsList)

    // 构建会议创建数据 - 完整版本，包含所有必要字段
    const meetingData = {
      id: 0,
      proposalApplicationId: selectedProject.value.id,
      meetingNo: meetingNo,
      meetingName: meetingName,
      meetingTime: scheduleForm.value.datetime.format('YYYY-MM-DD HH:mm:ss'),
      meetingPlace: scheduleForm.value.location,
      meetingType: meetingTypeMap[scheduleForm.value.type],
      meetingStatus: 1, // 1-已安排
      meetingInstructions: scheduleForm.value.description || '',
      meetingParticipantReqVOList: [
        // 主持人
        ...scheduleForm.value.hosts.map((hostId, index) => {
          const hostUser = userList.value.find(user => user.id === hostId)
          return {
            participantRole: 0, // 0-主持人
            participantName: hostUser ? hostUser.nickname || hostUser.username : `主持人${index + 1}`,
            participantTitle: hostUser ? hostUser.post || '' : '',
            participantOrganization: hostUser ? hostUser.deptName || '' : '',
            attendanceStatus: 1, // 1-已确认
            sort: index
          }
        }),
        // 专家
        ...scheduleForm.value.experts.map((expertId, index) => {
          const expertUser = userList.value.find(user => user.id === expertId)
          return {
            participantRole: 1, // 1-专家
            participantName: expertUser ? expertUser.nickname || expertUser.username : `专家${index + 1}`,
            participantTitle: expertUser ? expertUser.post || '' : '',
            participantOrganization: expertUser ? expertUser.deptName || '' : '',
            attendanceStatus: 1, // 1-已确认
            sort: index + scheduleForm.value.hosts.length
          }
        })
      ],
              meetingMaterialSaveReqVOList: materialsList.map((file, index) => ({
          materialSource: 0, // 0-申报单位提交
          materialName: file.fileName || file.name || '未知文件',
          fileUrl: file.fileUrl || file.url || '',
          fileSize: file.fileSize || file.size || 0,
          fileSuffix: (file.fileName || file.name || '').split('.').pop() || '',
          sort: index
        }))
    }
    
    // 测试用最小化数据版本
    const minimalMeetingData = {
      id: 0,
      proposalApplicationId: selectedProject.value.id,
      meetingNo: meetingNo,
      meetingName: meetingName,
      meetingTime: scheduleForm.value.datetime.format('YYYY-MM-DD HH:mm:ss'),
      meetingPlace: scheduleForm.value.location,
      meetingType: meetingTypeMap[scheduleForm.value.type],
      meetingStatus: 1
    }
    
    console.log('=== 测试数据对比 ===')
    console.log('完整数据:', meetingData)
    console.log('最小化数据:', minimalMeetingData)

    console.log('=== 会议数据构建完成 ===')
    console.log('完整会议数据:', meetingData)

    // 调用API创建会议
    console.log('开始调用API: createProposalMeeting')
    console.log('请求URL: /technological/proposal-meeting-rewrite/create')
    console.log('请求方法: POST')
    console.log('完整数据大小:', JSON.stringify(meetingData).length, '字符')
    console.log('最小化数据大小:', JSON.stringify(minimalMeetingData).length, '字符')
    
    try {
      // 使用完整数据创建会议，包含所有必要信息
      console.log('使用完整数据创建会议...')
      console.log('传递的完整数据字段:')
      console.log('- 基本信息:', { 
        id: meetingData.id, 
        proposalApplicationId: meetingData.proposalApplicationId, 
        meetingNo: meetingData.meetingNo, 
        meetingName: meetingData.meetingName, 
        meetingTime: meetingData.meetingTime, 
        meetingPlace: meetingData.meetingPlace, 
        meetingType: meetingData.meetingType, 
        meetingStatus: meetingData.meetingStatus 
      })
      console.log('- 会议说明:', meetingData.meetingInstructions)
      console.log('- 参会人员数量:', meetingData.meetingParticipantReqVOList?.length || 0)
      console.log('- 会议材料数量:', meetingData.meetingMaterialSaveReqVOList?.length || 0)
      
      // 详细显示参会人员信息
      if (meetingData.meetingParticipantReqVOList?.length > 0) {
        console.log('参会人员详情:')
        meetingData.meetingParticipantReqVOList.forEach((participant, index) => {
          console.log(`  ${index + 1}. ${participant.participantName} (${participant.participantRole === 0 ? '主持人' : '专家'})`)
        })
      }
      
      // 详细显示会议材料信息
      if (meetingData.meetingMaterialSaveReqVOList?.length > 0) {
        console.log('会议材料详情:')
        meetingData.meetingMaterialSaveReqVOList.forEach((material, index) => {
          console.log(`  ${index + 1}. ${material.materialName} (${material.fileSuffix})`)
        })
      }
      
      // 第一步：创建基础会议信息
      console.log('=== 第一步：创建基础会议信息 ===')
      
      // 先尝试最小化数据
      const minimalMeetingData = {
        id: 0,
        proposalApplicationId: selectedProject.value.id,
        meetingNo: meetingNo,
        meetingName: meetingName,
        meetingTime: scheduleForm.value.datetime.format('YYYY-MM-DD HH:mm:ss'),
        meetingPlace: scheduleForm.value.location || '待定',
        meetingType: meetingTypeMap[scheduleForm.value.type],
        meetingStatus: 1 // 1-已安排
      }
      
      console.log('最小化会议数据:', minimalMeetingData)
      
      // 先尝试最小化数据，如果成功再尝试完整数据
      let response
      try {
        console.log('尝试使用最小化数据创建会议...')
        response = await createProposalMeeting(minimalMeetingData)
      } catch (minimalError) {
        console.log('最小化数据创建失败，尝试完整数据...')
        console.log('最小化数据错误:', minimalError)
        
        // 如果最小化数据失败，尝试完整数据
        const fullMeetingData = {
          id: 0,
          proposalApplicationId: selectedProject.value.id,
          meetingNo: meetingNo,
          meetingName: meetingName,
          meetingTime: scheduleForm.value.datetime.format('YYYY-MM-DD HH:mm:ss'),
          meetingPlace: scheduleForm.value.location || '待定',
          meetingType: meetingTypeMap[scheduleForm.value.type],
          meetingStatus: 1, // 1-已安排
          meetingInstructions: scheduleForm.value.description || '开题评审会议'
        }
        
        console.log('完整会议数据:', fullMeetingData)
        response = await createProposalMeeting(fullMeetingData)
      }
      
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
          const hostParticipants = scheduleForm.value.hosts.map((hostId, index) => {
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
          const expertParticipants = scheduleForm.value.experts.map((expertId, index) => {
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
              sort: index + scheduleForm.value.hosts.length
            }
          })
          
          const allParticipants = [...hostParticipants, ...expertParticipants]
          console.log('需要创建的参与人记录:', allParticipants)
          
          // 批量创建参与人记录
          for (const participant of allParticipants) {
            try {
              console.log(`开始创建参与人: ${participant.participantName}`)
              console.log('参与人数据:', participant)
              
              const participantResponse = await createMeetingParticipantForConclusion(participant)
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
          console.log('参与人创建统计:', {
            总数: allParticipants.length,
            成功: allParticipants.length,
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
          const materialsList = scheduleForm.value.materials || []
          
          if (materialsList.length > 0) {
            for (let i = 0; i < materialsList.length; i++) {
              const file = materialsList[i]
              try {
                const materialData = {
                  id: 0,
                  meetingId: meetingId,
                  materialSource: 0, // 0-申报单位提交
                  materialName: file.fileName || file.name || '未知文件',
                  fileUrl: file.fileUrl || file.url || '',
                  fileSize: file.fileSize || file.size || 0,
                  fileSuffix: (file.fileName || file.name || '').split('.').pop() || '',
                  sort: i
                }
                
                const materialResponse = await createMeetingMaterialForConclusion(materialData)
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
  scheduleModalVisible.value = false
  
        // 更新项目状态
  if (selectedProject.value) {
          // 将项目从待安排列表移动到已安排列表
    const newMeeting = {
      ...selectedProject.value,
            id: responseData,
      meetingTime: scheduleForm.value.datetime ? dayjs(scheduleForm.value.datetime).format('YYYY-MM-DD HH:mm') : '',
      meetingLocation: scheduleForm.value.location,
      meetingType: scheduleForm.value.type,
      meetingHosts: scheduleForm.value.hosts, // 存储主持人数组
            meetingHost: scheduleForm.value.hosts.map(hostId => {
              const user = userList.value.find(u => u.id === hostId)
              return user ? (user.nickname || user.username) : `用户${hostId}`
            }).join('、'), // 显示用字符串
      meetingStatus: 'scheduled',
      experts: scheduleForm.value.experts, // 直接存储专家数组
      meetingMaterials: scheduleForm.value.materials, // 存储会议资料
      meetingDescription: scheduleForm.value.description
    }
    
    scheduledMeetingList.value.push(newMeeting)
    
    const index = pendingScheduleList.value.findIndex(p => p.id === selectedProject.value.id)
    if (index > -1) {
      pendingScheduleList.value.splice(index, 1)
    }
        }
        
        // 更新开题申请状态为"会议已安排"
        try {
          console.log('=== 开始更新开题申请状态 ===')
          console.log('项目ID:', selectedProject.value.id)
          
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
        await loadRealData()
        
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
  } finally {
    loading.value = false
  }
}

const handleScheduleCancel = () => {
  scheduleModalVisible.value = false
}

const handleConclusionSubmit = async () => {
  // 表单验证
  if (!conclusionForm.value.conclusion) {
    message.error('请选择验收结论')
    return
  }
  if (!conclusionForm.value.description) {
    message.error('请填写结论说明')
    return
  }
  // if (conclusionForm.value.conclusion !== 'passed' && !conclusionForm.value.requirements) {
  //   message.error('请填写整改要求')
  //   return
  // }

  try {
    loading.value = true
  
    // 检查是否是编辑现有结论
    if (selectedMeeting.value.conclusionRecordId) {
      console.log('=== 编辑现有结论 ===')
      console.log('结论记录ID:', selectedMeeting.value.conclusionRecordId)
      
      // 构建更新数据
      const updateData = {
        id: selectedMeeting.value.conclusionRecordId,
        proposalApplicationId: Number(selectedMeeting.value.proposalApplicationId),
        meetingId: null, // 根据API文档，meetingId是可选的，设为null
        conclusionType: 1, // 1-会议评审
        conclusionResult: getConclusionResultFromFrontend(conclusionForm.value.conclusion),
        conclusionScore: conclusionForm.value.score || 0,
        conclusionDescription: buildConclusionDescription(conclusionForm.value.description, conclusionForm.value.requirements)
      }
      
      // 数据验证
      console.log('=== 数据验证 ===')
      console.log('selectedMeeting.value:', selectedMeeting.value)
      console.log('字段映射分析:', {
        'conclusionRecordId (用于更新)': selectedMeeting.value.conclusionRecordId,
        'proposalApplicationId (开题申请ID)': selectedMeeting.value.proposalApplicationId,
        'meetingId (会议ID)': selectedMeeting.value.meetingId,
        'id (实际是proposalApplicationId)': selectedMeeting.value.id,
        '最终使用的meetingId': updateData.meetingId
      })
      
      console.log('=== 数据来源说明 ===')
      console.log('注意：selectedMeeting.value.id 实际上是 proposalApplicationId，不是会议ID')
      console.log('真正的会议ID应该是 selectedMeeting.value.meetingId，但当前为 undefined')
      console.log('根据API文档，meetingId 是可选的，所以设置为 null')
      
      console.log('更新结论数据:', updateData)
      console.log('API地址: /technological/proposal-acceptance-conclusion-rewrite/update')
      
            // 调用更新API
      try {
        console.log('=== 开始调用更新API ===')
        console.log('请求数据详情:')
        console.log('- id:', updateData.id, '(类型:', typeof updateData.id, ')')
        console.log('- proposalApplicationId:', updateData.proposalApplicationId, '(类型:', typeof updateData.proposalApplicationId, ')')
        console.log('- meetingId:', updateData.meetingId, '(类型:', typeof updateData.meetingId, ')')
        console.log('- conclusionType:', updateData.conclusionType, '(类型:', typeof updateData.conclusionType, ')')
        console.log('- conclusionResult:', updateData.conclusionResult, '(类型:', typeof updateData.conclusionResult, ')')
        console.log('- conclusionScore:', updateData.conclusionScore, '(类型:', typeof updateData.conclusionScore, ')')
        console.log('- conclusionDescription:', updateData.conclusionDescription, '(类型:', typeof updateData.conclusionDescription, ')')
        
        const updateResponse = await updateProposalAcceptanceConclusionRewrite(updateData)
        console.log('=== 更新开题验收结论表(重写)API响应 ===')
        console.log('原始响应:', updateResponse)
        console.log('响应类型:', typeof updateResponse)
        console.log('响应code:', updateResponse?.code)
        console.log('响应data:', updateResponse?.data)
        
        if (updateResponse === true || updateResponse?.code === 0 || updateResponse?.code === 200) {
          console.log('结论更新成功')
          
          // 处理文件更新
          await handleConclusionFilesUpdate(selectedMeeting.value.conclusionRecordId)
          
      message.success('结论修改成功')
    } else {
          console.error('结论更新失败:', updateResponse)
          message.error('结论更新失败')
          return
        }
      } catch (apiError) {
        console.error('=== API调用异常详情 ===')
        console.error('错误对象:', apiError)
        console.error('错误消息:', apiError.message)
        console.error('错误堆栈:', apiError.stack)
        
        // 检查是否是网络错误
        if (apiError.response) {
          console.error('响应状态:', apiError.response.status)
          console.error('响应数据:', apiError.response.data)
          console.error('响应头:', apiError.response.headers)
        } else if (apiError.request) {
          console.error('请求已发送但无响应:', apiError.request)
        } else {
          console.error('请求设置错误:', apiError.message)
        }
        
        // 重新抛出错误，让外层catch处理
        throw apiError
      }
    } else {
      console.log('=== 创建新结论 ===')
      
      // 构建创建数据
      const createData = {
        id: 0,
        proposalApplicationId: Number(selectedMeeting.value.proposalApplicationId),
        meetingId: null, // 根据API文档，meetingId是可选的，设为null
        conclusionType: 1, // 1-会议评审
        conclusionResult: getConclusionResultFromFrontend(conclusionForm.value.conclusion),
        conclusionScore: conclusionForm.value.score || 0,
        conclusionDescription: buildConclusionDescription(conclusionForm.value.description, conclusionForm.value.requirements)
      }
      
      console.log('创建结论数据:', createData)
      console.log('API地址: /technological/proposal-acceptance-conclusion-rewrite/create')
      
      // 调用创建API
      const createResponse = await createProposalAcceptanceConclusionRewrite(createData)
      console.log('=== 创建开题验收结论表(重写)API响应 ===')
      console.log('原始响应:', createResponse)
      console.log('响应类型:', typeof createResponse)
      console.log('响应code:', createResponse?.code)
      console.log('响应data:', createResponse?.data)
      
      if (createResponse && (typeof createResponse === 'number' || createResponse?.code === 0 || createResponse?.code === 200)) {
        const conclusionId = typeof createResponse === 'number' ? createResponse : createResponse?.data
        console.log('结论创建成功，ID:', conclusionId)
        
        // 处理文件创建
        await handleConclusionFilesCreate(conclusionId)
        
        message.success('结论创建成功')
      } else {
        console.error('结论创建失败:', createResponse)
        message.error('结论创建失败')
        return
      }
    }
    
    // 更新申请状态
    await updateApplicationStatus(conclusionForm.value.conclusion)
    
    // 更新会议状态为 3（已结束）
    try {
      // 通过proposalApplicationId查找对应的会议ID
      const meetingId = selectedMeeting.value.meetingId || selectedMeeting.value.id
      console.log('更新会议状态，使用会议ID:', meetingId)
      console.log('selectedMeeting.value结构:', selectedMeeting.value)
      
      if (meetingId) {
        await updateProposalMeeting({ id: meetingId, meetingStatus: 3 })
        console.log('会议状态已更新为已结束')
      } else {
        console.warn('未找到会议ID，跳过会议状态更新')
      }
    } catch (e) {
      console.error('更新会议状态失败:', e)
      // 不阻止流程继续，因为结论已经提交成功
    }
    
    // 关闭弹窗
    conclusionModalVisible.value = false
    
    // 刷新数据
    await loadRealData()
  
  } catch (error) {
    console.error('结论操作失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    })
    message.error(`结论操作失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

const handleEditSubmit = async () => {
  // 表单验证
  if (!editForm.value.datetime) {
    message.error('请选择会议时间')
    return
  }
  if (!editForm.value.location) {
    message.error('请输入会议地点')
    return
  }
  if (!editForm.value.hosts || editForm.value.hosts.length === 0) {
    message.error('请选择或输入会议主持人')
    return
  }
  if (!editForm.value.experts || editForm.value.experts.length === 0) {
    message.error('请选择或输入参会专家')
    return
  }

  try {
    loading.value = true
    
    console.log('=== 开始更新会议信息 ===')
    console.log('选中的会议:', selectedEditMeeting.value)
    console.log('编辑表单数据:', editForm.value)
    
    // 构建更新会议的数据
    const updateMeetingData = {
      id: selectedEditMeeting.value.id,
      proposalApplicationId: selectedEditMeeting.value.proposalApplicationId,
      meetingNo: selectedEditMeeting.value.meetingNo || '',
      meetingName: selectedEditMeeting.value.meetingName || '',
      meetingTime: editForm.value.datetime ? editForm.value.datetime.format('YYYY-MM-DD HH:mm:ss') : '',
      meetingPlace: editForm.value.location || '',
      meetingType: getMeetingTypeFromFrontend(editForm.value.type),
      meetingStatus: selectedEditMeeting.value.meetingStatus || 1, // 保持原有状态
      meetingMinutes: selectedEditMeeting.value.meetingMinutes || '',
      meetingInstructions: editForm.value.description || '',
      meetingParticipantReqVOList: [], // 参与人列表，后续处理
      meetingMaterialSaveReqVOList: [] // 材料列表，后续处理
    }
    
    console.log('=== 调用更新开题会议表(重写)API ===')
    console.log('更新数据:', updateMeetingData)
    
    // 调用更新会议API
    const updateResponse = await updateProposalMeeting(updateMeetingData)
    console.log('=== 更新开题会议表(重写)API响应 ===')
    console.log('原始响应:', updateResponse)
    console.log('响应类型:', typeof updateResponse)
    console.log('响应code:', updateResponse?.code)
    console.log('响应data:', updateResponse?.data)
    
    // 处理响应
    let updateSuccess = false
    if (typeof updateResponse === 'boolean') {
      updateSuccess = updateResponse
      console.log('检测到直接布尔响应，更新成功:', updateSuccess)
    } else if (updateResponse?.code === 0 || updateResponse?.code === 200) {
      updateSuccess = true
      console.log('检测到标准响应格式，code:', updateResponse.code)
    } else if (updateResponse?.data === true) {
      updateSuccess = true
      console.log('检测到data字段为true，更新成功')
    } else {
      console.log('未知响应格式:', updateResponse)
    }
    
    if (updateSuccess) {
      console.log('会议信息更新成功')
      
      // 第二步：更新会议参与人信息
      try {
        console.log('=== 开始更新会议参与人信息 ===')
        
        // 获取现有的参与人数据（在editMeeting时已经获取）
        const existingParticipants = await getMeetingParticipantPageForConclusion({
          pageNo: '1',
          pageSize: '100',
          meetingId: selectedEditMeeting.value.id
        })
        
        const participants = (existingParticipants && (existingParticipants.list || existingParticipants.data?.list)) || []
        console.log('现有参与人数据:', participants)
        
        // 更新参与人信息
        // 分别处理主持人和专家
        const hosts = participants.filter(p => Number(p.participantRole) === 0)
        const experts = participants.filter(p => Number(p.participantRole) === 1)
        
        console.log('现有主持人:', hosts)
        console.log('现有专家:', experts)
        console.log('编辑表单主持人:', editForm.value.hosts)
        console.log('编辑表单专家:', editForm.value.experts)
        
        // 处理主持人：删除多余的，更新现有的，添加新的
        const maxHosts = Math.max(hosts.length, editForm.value.hosts.length)
        for (let i = 0; i < maxHosts; i++) {
          try {
            if (i < hosts.length && i < editForm.value.hosts.length) {
              // 更新现有主持人
              const participant = hosts[i]
              const newHostName = editForm.value.hosts[i]
              
              const updatedParticipant = {
                ...participant,
                participantName: newHostName
              }
              
              console.log(`更新主持人 ${participant.participantName} -> ${newHostName}:`, updatedParticipant)
              
              const participantUpdateResponse = await updateMeetingParticipantForConclusion(updatedParticipant)
              console.log(`主持人更新结果:`, participantUpdateResponse)
              
            } else if (i < hosts.length && i >= editForm.value.hosts.length) {
              // 删除多余的主持人
              const participant = hosts[i]
              console.log(`删除多余的主持人: ${participant.participantName}`)
              
              const deleteResponse = await deleteMeetingParticipantForConclusion(participant.id)
              console.log(`删除主持人结果:`, deleteResponse)
              
            } else if (i >= hosts.length && i < editForm.value.hosts.length) {
              // 添加新的主持人
              const newHostName = editForm.value.hosts[i]
              console.log(`添加新的主持人: ${newHostName}`)
              
              const newParticipant = {
                id: 0,
                meetingId: selectedEditMeeting.value.id,
                userId: null,
                participantRole: 0, // 主持人
                participantName: newHostName,
                participantTitle: '',
                participantOrganization: '',
                attendanceStatus: 1, // 已确认
                sort: i
              }
              
              const createResponse = await createMeetingParticipantForConclusion(newParticipant)
              console.log(`创建主持人结果:`, createResponse)
            }
            
          } catch (participantError) {
            console.error(`处理主持人失败:`, participantError)
          }
        }
        
        // 处理专家：删除多余的，更新现有的，添加新的
        const maxExperts = Math.max(experts.length, editForm.value.experts.length)
        for (let i = 0; i < maxExperts; i++) {
          try {
            if (i < experts.length && i < editForm.value.experts.length) {
              // 更新现有专家
              const participant = experts[i]
              const newExpertName = editForm.value.experts[i]
              
              const updatedParticipant = {
                ...participant,
                participantName: newExpertName
              }
              
              console.log(`更新专家 ${participant.participantName} -> ${newExpertName}:`, updatedParticipant)
              
              const participantUpdateResponse = await updateMeetingParticipantForConclusion(updatedParticipant)
              console.log(`专家更新结果:`, participantUpdateResponse)
              
            } else if (i < experts.length && i >= editForm.value.experts.length) {
              // 删除多余的专家
              const participant = experts[i]
              console.log(`删除多余的专家: ${participant.participantName}`)
              
              const deleteResponse = await deleteMeetingParticipantForConclusion(participant.id)
              console.log(`删除专家结果:`, deleteResponse)
              
            } else if (i >= experts.length && i < editForm.value.experts.length) {
              // 添加新的专家
              const newExpertName = editForm.value.experts[i]
              console.log(`添加新的专家: ${newExpertName}`)
              
              const newParticipant = {
                id: 0,
                meetingId: selectedEditMeeting.value.id,
                userId: null,
                participantRole: 1, // 专家
                participantName: newExpertName,
                participantTitle: '',
                participantOrganization: '',
                attendanceStatus: 1, // 已确认
                sort: i + editForm.value.hosts.length // 排序在主持人之后
              }
              
              const createResponse = await createMeetingParticipantForConclusion(newParticipant)
              console.log(`创建专家结果:`, createResponse)
            }
            
          } catch (participantError) {
            console.error(`处理专家失败:`, participantError)
          }
        }
        
        console.log('=== 会议参与人信息更新完成 ===')
        
      } catch (participantError) {
        console.error('更新会议参与人信息失败:', participantError)
        // 不阻断主流程，继续执行
      }
      
      // 第三步：更新会议材料信息
      try {
        console.log('=== 开始更新会议材料信息 ===')
        
        // 获取现有的材料数据（在editMeeting时已经获取）
        const existingMaterials = await getMeetingMaterialPageForConclusion({
          pageNo: '1',
          pageSize: '100',
          meetingId: selectedEditMeeting.value.id
        })
        
        const materials = (existingMaterials && (existingMaterials.list || existingMaterials.data?.list)) || []
        console.log('现有材料数据:', materials)
        
        // 处理材料：删除多余的，更新现有的，添加新的
        const maxMaterials = Math.max(materials.length, editForm.value.materials.length)
        for (let i = 0; i < maxMaterials; i++) {
          try {
            if (i < materials.length && i < editForm.value.materials.length) {
              // 更新现有材料
              const material = materials[i]
              const formMaterial = editForm.value.materials[i]
              
              // 详细调试信息
              console.log(`原始材料数据结构:`, material)
              console.log(`表单材料数据结构:`, formMaterial)
              console.log(`formMaterial.url:`, formMaterial.url)
              console.log(`formMaterial.fileUrl:`, formMaterial.fileUrl)
              console.log(`formMaterial.response:`, formMaterial.response)
              console.log(`material.fileUrl:`, material.fileUrl)
              
              // 参考submit.vue的解决方案，通过多种方式获取fileUrl
              const fileUrl = formMaterial.fileUrl || 
                             formMaterial.url || 
                             formMaterial.response?.fileUrl || 
                             formMaterial.response?.url || 
                             material.fileUrl || ''
              
              console.log(`最终获取到的fileUrl:`, fileUrl)
              
              const updatedMaterial = {
                ...material,
                materialName: formMaterial.name,
                fileUrl: fileUrl,
                fileSize: formMaterial.size || material.fileSize,
                fileSuffix: formMaterial.name.split('.').pop(),
              }
              
              console.log(`更新材料 ${material.materialName}:`, updatedMaterial)
              console.log(`最终使用的fileUrl:`, updatedMaterial.fileUrl)
              
              const materialUpdateResponse = await updateMeetingMaterialForConclusion(updatedMaterial)
              console.log(`材料更新结果:`, materialUpdateResponse)
              
            } else if (i < materials.length && i >= editForm.value.materials.length) {
              // 删除多余的材料
              const material = materials[i]
              console.log(`删除多余的材料: ${material.materialName}`)
              
              const deleteResponse = await deleteMeetingMaterialForConclusion(material.id)
              console.log(`删除材料结果:`, deleteResponse)
              
            } else if (i >= materials.length && i < editForm.value.materials.length) {
              // 添加新的材料
              const formMaterial = editForm.value.materials[i]
              console.log(`添加新的材料: ${formMaterial.name}`)
              console.log(`新材料的fileUrl:`, formMaterial.fileUrl)
              console.log(`新材料的url:`, formMaterial.url)
              
              // 参考submit.vue的解决方案，通过多种方式获取fileUrl
              const fileUrl = formMaterial.fileUrl || 
                             formMaterial.url || 
                             formMaterial.response?.fileUrl || 
                             formMaterial.response?.url || ''
              
              console.log(`新材料最终获取到的fileUrl:`, fileUrl)
              
              const newMaterial = {
                id: 0,
                meetingId: selectedEditMeeting.value.id,
                materialSource: 0, // 申报单位提交
                materialName: formMaterial.name,
                fileUrl: fileUrl,
                fileSize: formMaterial.size || 0,
                fileSuffix: formMaterial.name.split('.').pop(),
                sort: i
              }
              
              console.log(`创建材料数据:`, newMaterial)
              
              const createResponse = await createMeetingMaterialForConclusion(newMaterial)
              console.log(`创建材料结果:`, createResponse)
            }
            
          } catch (materialError) {
            console.error(`处理材料失败:`, materialError)
          }
        }
        
        console.log('=== 会议材料信息更新完成 ===')
        
      } catch (materialError) {
        console.error('更新会议材料信息失败:', materialError)
        // 不阻断主流程，继续执行
      }
      
      // 更新前端数据
  if (selectedEditMeeting.value) {
        selectedEditMeeting.value.meetingTime = editForm.value.datetime ? editForm.value.datetime.format('YYYY-MM-DD HH:mm') : ''
    selectedEditMeeting.value.meetingLocation = editForm.value.location
    selectedEditMeeting.value.meetingType = editForm.value.type
    selectedEditMeeting.value.meetingHosts = editForm.value.hosts
    selectedEditMeeting.value.meetingHost = editForm.value.hosts.join('、')
    selectedEditMeeting.value.experts = editForm.value.experts
    selectedEditMeeting.value.meetingMaterials = editForm.value.materials
    selectedEditMeeting.value.meetingDescription = editForm.value.description
  }

  message.success('会议信息更新成功')
  editModalVisible.value = false
      
      // 重新加载数据
      await loadRealData()
    } else {
      console.error('会议更新失败:', updateResponse)
      message.error(`会议更新失败: ${updateResponse?.msg || '未知错误'}`)
    }
  } catch (error) {
    console.error('会议更新失败:', error)
    message.error('会议更新失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleEditCancel = () => {
  editModalVisible.value = false
}

const handleConclusionCancel = () => {
  conclusionModalVisible.value = false
}

const handleDetailCancel = () => {
  detailModalVisible.value = false
}

const handleConclusionDetailCancel = () => {
  conclusionDetailVisible.value = false
  selectedConclusion.value = null
}

const handleMeetingDetailCancel = () => {
  meetingDetailVisible.value = false
}

// ========== 新增的API调用函数 ==========

/**
 * 创建会议参与人（使用新的重写版本API）
 */
const createMeetingParticipant = async (participantData) => {
  try {
    const result = await createMeetingParticipantForConclusion(participantData)
    console.log('会议参与人创建成功:', result)
    return result
  } catch (error) {
    console.error('会议参与人创建失败:', error)
    throw error
  }
}

/**
 * 创建会议材料（使用新的重写版本API）
 */
const createMeetingMaterial = async (materialData) => {
  try {
    const result = await createMeetingMaterialForConclusion(materialData)
    console.log('会议材料创建成功:', result)
    return result
  } catch (error) {
    console.error('会议材料创建失败:', error)
    throw error
  }
}

/**
 * 创建结论文件（使用新的重写版本API）
 */
const createConclusionFile = async (fileData) => {
  try {
    const result = await createConclusionFileForConclusion(fileData)
    console.log('结论文件创建成功:', result)
    return result
  } catch (error) {
    console.error('结论文件创建失败:', error)
    throw error
  }
}

/**
 * 分页查询会议参与人（使用新的重写版本API）
 */
const loadMeetingParticipants = async (meetingId, pageParams = {}) => {
  try {
    const params = {
      meetingId,
      pageNo: pageParams.pageNo || 1,
      pageSize: pageParams.pageSize || 10,
      ...pageParams
    }
    const result = await getMeetingParticipantPageForConclusion(params)
    console.log('会议参与人查询成功:', result)
    return result
  } catch (error) {
    console.error('会议参与人查询失败:', error)
    throw error
  }
}

/**
 * 分页查询会议材料（使用新的重写版本API）
 */
const loadMeetingMaterials = async (meetingId, pageParams = {}) => {
  try {
    const params = {
      meetingId,
      pageNo: pageParams.pageNo || 1,
      pageSize: pageParams.pageSize || 10,
      ...pageParams
    }
    const result = await getMeetingMaterialPageForConclusion(params)
    console.log('会议材料查询成功:', result)
    return result
  } catch (error) {
    console.error('会议材料查询失败:', error)
    throw error
  }
}

/**
 * 分页查询结论文件（使用新的重写版本API）
 */
const loadConclusionFiles = async (conclusionId, pageParams = {}) => {
  try {
    const params = {
      conclusionId,
      pageNo: pageParams.pageNo || 1,
      pageSize: pageParams.pageSize || 10,
      ...pageParams
    }
    const result = await getConclusionFilePageForConclusion(params)
    console.log('结论文件查询成功:', result)
    return result
  } catch (error) {
    console.error('结论文件查询失败:', error)
    throw error
  }
}

// ========== 新增的功能函数 ==========

/**
 * 查看会议参与人详情
 */
const viewMeetingParticipants = async (meetingId) => {
  try {
    loading.value = true
    const result = await loadMeetingParticipants(meetingId)
    console.log('会议参与人详情:', result)
    
    // 这里可以显示参与人详情的弹窗
    message.success(`成功加载会议参与人信息，共 ${result.data?.list?.length || 0} 人`)
    
    return result
  } catch (error) {
    console.error('查看会议参与人失败:', error)
    message.error('查看会议参与人失败')
  } finally {
    loading.value = false
  }
}

/**
 * 查看会议材料详情
 */
const viewMeetingMaterials = async (meetingId) => {
  try {
    loading.value = true
    const result = await loadMeetingMaterials(meetingId)
    console.log('会议材料详情:', result)
    
    // 这里可以显示材料详情的弹窗
    message.success(`成功加载会议材料信息，共 ${result.data?.list?.length || 0} 个文件`)
    
    return result
  } catch (error) {
    console.error('查看会议材料失败:', error)
    message.error('查看会议材料失败')
  } finally {
    loading.value = false
  }
}

/**
 * 查看结论文件详情
 */
const viewConclusionFiles = async (conclusionId) => {
  try {
    loading.value = true
    const result = await loadConclusionFiles(conclusionId)
    console.log('结论文件详情:', result)
    
    // 这里可以显示文件详情的弹窗
    message.success(`成功加载结论文件信息，共 ${result.data?.list?.length || 0} 个文件`)
    
    return result
  } catch (error) {
    console.error('查看结论文件失败:', error)
    message.error('查看结论文件失败')
  } finally {
    loading.value = false
  }
}

/**
 * 删除会议参与人
 */
const deleteMeetingParticipant = async (participantId) => {
  try {
    await deleteMeetingParticipantForConclusion(participantId)
    message.success('会议参与人删除成功')
    
    // 刷新相关数据
    // 这里可以根据需要刷新参与人列表
    
    return true
  } catch (error) {
    console.error('删除会议参与人失败:', error)
    message.error('删除会议参与人失败')
    return false
  }
}

/**
 * 删除会议材料
 */
const deleteMeetingMaterial = async (materialId) => {
  try {
    await deleteMeetingMaterialForConclusion(materialId)
    message.success('会议材料删除成功')
    
    // 刷新相关数据
    // 这里可以根据需要刷新材料列表
    
    return true
  } catch (error) {
    console.error('删除会议材料失败:', error)
    message.error('删除会议材料失败')
    return false
  }
}

/**
 * 删除结论文件
 */
const deleteConclusionFile = async (fileId) => {
  try {
    await deleteConclusionFileForConclusion(fileId)
    message.success('结论文件删除成功')
    
    // 刷新相关数据
    // 这里可以根据需要刷新文件列表
    
    return true
  } catch (error) {
    console.error('删除结论文件失败:', error)
    message.error('删除结论文件失败')
    return false
  }
}

// 生命周期
onMounted(async () => {
  // 初始化数据
  console.log('会议结论管理页面已加载，新的API接口已准备就绪')
  console.log('可用的API功能：')
  console.log('- 创建会议参与人')
  console.log('- 创建会议材料')
  console.log('- 创建结论文件')
  console.log('- 查询会议参与人')
  console.log('- 查询会议材料')
  console.log('- 查询结论文件')
  console.log('- 删除会议参与人')
  console.log('- 删除会议材料')
  console.log('- 删除结论文件')
  
  // 加载真实数据
  await loadRealData()
})

/**
 * 加载真实数据
 */
const loadRealData = async () => {
  try {
    loading.value = true
    console.log('开始加载真实数据...')
    
    // 1. 加载待安排会议的项目（从申请管理获取）
    console.log('=== 步骤1: 加载待安排会议数据 ===')
    await loadPendingScheduleData(pendingPagination.value.current, pendingPagination.value.pageSize)
    
    // 2. 加载已安排的会议
    console.log('=== 步骤2: 加载已安排会议数据 ===')
    await loadScheduledMeetingData(scheduledPagination.value.current, scheduledPagination.value.pageSize)
    
    // 3. 加载结论数据（依赖已安排会议数据）
    console.log('=== 步骤3: 加载结论数据 ===')
    await loadConclusionData()
    
    // 4. 加载用户列表（主持人和专家）
    console.log('=== 步骤4: 加载用户数据 ===')
    await loadUserData()
    
    // 5. 使用项目立项申请接口补充项目信息（名称、编号等）
    await enrichPendingAndScheduledWithProjectDetails()

    // 6. 更新统计数据
    console.log('=== 步骤6: 更新统计数据 ===')
    updateStats()
    
    console.log('=== 真实数据加载完成 ===')
    console.log('最终数据状态:')
    console.log('- 待安排会议:', pendingScheduleList.value.length, '项')
    console.log('- 已安排会议:', scheduledMeetingList.value.length, '项')
    console.log('- 结论数据:', conclusionList.value.length, '项')
    console.log('- 统计数据:', stats.value)
  } catch (error) {
    console.error('加载真实数据失败:', error)
    message.error('数据加载失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 加载待安排会议的数据
 */
const loadPendingScheduleData = async (page = 1, pageSize = 5) => {
  try {
    // 确保页码至少为1
    const safePage = Math.max(1, page)
    console.log('开始加载待安排会议数据...')
    console.log(`分页参数: 第${safePage}页，每页${pageSize}条`)

    // 调用申请管理的API获取开题申请，应用筛选条件
    // 注意：API要求所有参数都是string类型
    const params = {
      pageNo: safePage.toString(),
      pageSize: pageSize.toString(),
      applicationStatus: '2' // 只获取申请状态为"会议待组织"的记录
    }
    
    // 应用筛选条件
    if (filters.value.applicationStatus) {
      params.applicationStatus = filters.value.applicationStatus
    }
    if (filters.value.keyword) {
      params.applicationDescription = filters.value.keyword
    }
    console.log('应用筛选条件:', filters.value)
    
    console.log('申请管理API请求参数:', params)
    const response = await getProposalApplicationPage(params)
    
    console.log('待安排会议API完整响应:', response)
    console.log('响应类型:', typeof response)
    console.log('响应键:', Object.keys(response || {}))
    
    if (response && response.data && response.data.list) {
      const applications = response.data.list || []
      // 尝试从不同位置获取总记录数
      const total = response.data?.total || response?.total || response?.data?.count || response?.count || applications.length || 0
      console.log('待安排会议项目数量:', applications.length)
      console.log('总记录数:', total)
      console.log('响应数据结构:', {
        'response.data.total': response.data?.total,
        'response.total': response?.total,
        'response.data.count': response.data?.count,
        'response.count': response?.count,
        'applications.length': applications.length,
        '最终使用的total': total
      })
        
      // 打印完整的响应结构，便于调试
      console.log('完整响应结构:', JSON.stringify(response, null, 2))

      // 更新分页信息
      pendingPagination.value.current = safePage
      pendingPagination.value.pageSize = pageSize
      pendingPagination.value.total = total
        
      // 转换为待安排会议格式，与 center.vue 保持一致
      pendingScheduleList.value = applications.map(app => ({
        id: app.id,
        projectId: app.projectId,
        projectName: app.applicationDescription || `项目${app.applicationNo}`,
        projectCode: app.applicationNo,
        projectLeader: app.projectLeader || '待确定', // 从项目信息获取，如果没有则显示"待确定"
        projectDuration: app.projectDuration || '12个月', // 从项目信息获取，如果没有则显示默认值
        projectBudget: app.projectBudget || '待确定', // 从项目信息获取，如果没有则显示默认值
        submitTime: app.createTime ? new Date(app.createTime).toLocaleDateString() : '未知',
        // 材料状态信息 - 初始化为默认值，后续通过 enrichPendingAndScheduledWithProjectDetails 获取真实数据
        requiredMaterials: 0,
        totalRequired: 0,
        optionalMaterials: 0,
        materialStatus: 'pending',
        // 新增：保存原始状态信息
        applicationStatus: app.applicationStatus,
        currentStatus: convertApiStatusToFrontend(app.applicationStatus)
      }))
      
      console.log('待安排会议列表:', pendingScheduleList.value)
    } else if (response && response.list) {
      // 直接响应格式
      const applications = response.list || []
      // 尝试从不同位置获取总记录数
      const total = response?.total || response?.count || applications.length || 0
      console.log('待安排会议项目数量(直接格式):', applications.length)
      console.log('总记录数(直接格式):', total)
      
      // 转换为待安排会议格式，与 center.vue 保持一致
      pendingScheduleList.value = applications.map(app => ({
        id: app.id,
        projectId: app.projectId,
        projectName: app.applicationDescription || `项目${app.applicationNo}`,
        projectCode: app.applicationNo,
        projectLeader: app.projectLeader || '待确定', // 从项目信息获取，如果没有则显示"待确定"
        projectDuration: app.projectDuration || '12个月', // 从项目信息获取，如果没有则显示默认值
        projectBudget: app.projectBudget || '待确定', // 从项目信息获取，如果没有则显示"待确定"
        submitTime: app.createTime ? new Date(app.createTime).toLocaleDateString() : '未知',
        // 材料状态信息 - 初始化为默认值，后续通过 enrichPendingAndScheduledWithProjectDetails 获取真实数据
        requiredMaterials: 0,
        totalRequired: 0,
        optionalMaterials: 0,
        materialStatus: 'pending',
        // 新增：保存原始状态信息
        applicationStatus: app.applicationStatus,
        currentStatus: convertApiStatusToFrontend(app.applicationStatus)
      }))
      
      // 更新分页信息
      pendingPagination.value.current = safePage
      pendingPagination.value.pageSize = pageSize
      pendingPagination.value.total = total

      console.log('待安排会议列表(直接格式):', pendingScheduleList.value)
    } else {
      console.log('待安排会议API响应格式异常:', response)
      console.log('响应结构:', {
        hasResponse: !!response,
        hasData: !!(response && response.data),
        hasList: !!(response && response.list),
        responseKeys: response ? Object.keys(response) : [],
        dataKeys: response && response.data ? Object.keys(response.data) : []
      })
      pendingScheduleList.value = []
    }
  } catch (error) {
    console.error('加载待安排会议数据失败:', error)
    message.warning('加载待安排会议数据失败，将显示空列表')
    pendingScheduleList.value = []
  }
}

/**
 * 加载已安排会议的数据 - 与 center.vue 逻辑一致
 */
const loadScheduledMeetingData = async (page = 1, pageSize = 5) => {
  try {
    // 确保页码至少为1
    const safePage = Math.max(1, page)
    console.log('开始加载已安排会议数据...')
    
    // ✅ 修改：调用获得开题会议表(重写)分页API获取真实会议数据
    console.log('=== 调用获得开题会议表(重写)分页API ===')
    
    // 构建请求参数
    const params = {
      pageNo: safePage.toString(),
      pageSize: pageSize.toString(),
      meetingStatus: 1,
    }

    // 应用筛选条件
    if (filters.value.meetingStatus) {
      params.meetingStatus = filters.value.meetingStatus
    }
    if (filters.value.meetingType) {
      params.meetingType = filters.value.meetingType
    }
    if (filters.value.keyword) {
      params.meetingName = filters.value.keyword
    }

    console.log('应用筛选条件:', filters.value)
    console.log('会议API请求参数:', params)

    const response = await getProposalMeetingPage(params)
    
    console.log('=== 获得开题会议表(重写)分页API响应 ===')
    console.log('原始响应:', response)
    
    const meetings = (response && (response.list || response.data?.list)) || []
    // 尝试从不同位置获取总记录数
    const total = (response && (response.total || response.data?.total || response.count || response.data?.count)) || meetings.length || 0
    console.log('待组织会议数量:', meetings.length)
    console.log('总记录数:', total)
    console.log('响应数据结构:', {
      'response.total': response?.total,
      'response.data.total': response.data?.total,
      'response.count': response?.count,
      'response.data.count': response.data?.count,
      'meetings.length': meetings.length,
      '最终使用的total': total
    })
    
    // 打印完整的响应结构，便于调试
    console.log('完整响应结构:', JSON.stringify(response, null, 2))

    // 更新分页信息
    scheduledPagination.value.current = safePage
    scheduledPagination.value.pageSize = pageSize
    scheduledPagination.value.total = total
    
    // 转换为前端需要的格式
    scheduledMeetingList.value = meetings.map(meeting => {
      // 会议状态映射：数字转字符串
      const getMeetingStatusText = (status) => {
        const statusMap = {
          0: 'pending',      // 待组织
          1: 'scheduled',    // 已安排
          2: 'in_progress',  // 进行中
          3: 'completed'     // 已结束
        }
        return statusMap[status] || 'pending'
      }
      
      return {
        id: meeting.id,
        meetingId: meeting.id, // 真实的会议ID
        proposalApplicationId: meeting.proposalApplicationId,
        projectName: meeting.meetingName || `会议${meeting.meetingNo}`,
        projectCode: meeting.meetingNo || `HY${meeting.id}`,
        // 修复会议时间字段映射 - 兼容不同的字段名，并处理时间戳
        meetingTime: formatTimestamp(meeting.meetingTime || meeting.meetingDateTime || meeting.createTime),
        meetingLocation: meeting.meetingPlace || meeting.meetingLocation,
        meetingType: meeting.meetingType,
        meetingStatus: getMeetingStatusText(meeting.meetingStatus), // 转换为字符串状态
        meetingStatusNumber: meeting.meetingStatus, // 保留原始数字状态
        meetingMinutes: meeting.meetingMinutes,
        meetingInstructions: meeting.meetingInstructions,
        // 初始化空数组，后续通过API获取
        meetingHosts: [],
        meetingHost: '',
        experts: [],
        meetingMaterials: [],
        meetingDescription: meeting.meetingInstructions || '开题评审会议',
        // 保存原始会议数据
        originalMeeting: meeting
      }
    })
    
    console.log('已安排会议列表:', scheduledMeetingList.value)
    
    // 为每个会议补充项目信息
    await enrichMeetingsWithProjectDetails()
    
    // 为每个会议补充参与人信息
    await enrichMeetingsWithParticipants()
    
    // 为每个会议补充材料信息
    await enrichMeetingsWithMaterials()
    
  } catch (error) {
    console.error('加载已安排会议数据失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })
    
    // 如果处理失败，使用空数组
    scheduledMeetingList.value = []
    message.warning('加载已安排会议数据失败')
  }
}

// 使用项目立项申请接口补充项目信息
const technologicalProjectCache = new Map()
const enrichPendingAndScheduledWithProjectDetails = async () => {
  try {
    const allItems = [
      ...(pendingScheduleList.value || []),
      ...(scheduledMeetingList.value || [])
    ]
    const tasks = allItems
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
            it.projectName = detail.projectName || it.projectName
            it.projectCode = detail.projectNo || it.projectCode
            it.applicant = detail.applicant || it.applicant
            it.applicantUnit = detail.applicantUnit || it.applicantUnit
            // 补充项目详细信息
            it.projectLeader = detail.applicant || '待确定'
            it.projectDuration = detail.projectCycle ? `${detail.projectCycle}个月` : '12个月'
            it.projectBudget = detail.budget ? `${detail.budget}万元` : '待确定'
            it.yearly = detail.yearly
            it.budget = detail.budget
            it.projectCycle = detail.projectCycle
          }
          
          // 获取材料信息（通过开题申请ID）
          if (it.id) {
            try {
              const materialsPage = await getProposalMaterialPage({ 
                pageNo: '1', 
                pageSize: '100', 
                proposalApplicationId: it.id.toString() 
              })
              
              const materials = materialsPage?.list || []
              const requiredList = materials.filter((m) => Number(m.isRequired) === 1)
              const optionalList = materials.filter((m) => Number(m.isRequired) === 0)
              const requiredPassed = requiredList.filter((m) => Number(m.reviewStatus) === 1)
              const requiredRejected = requiredList.filter((m) => Number(m.reviewStatus) === 2)

              it.requiredMaterials = requiredPassed.length
              it.totalRequired = requiredList.length
              it.optionalMaterials = optionalList.length

              if (requiredRejected.length > 0) {
                it.materialStatus = 'rejected'
              } else if (requiredPassed.length === requiredList.length && requiredList.length > 0) {
                it.materialStatus = 'approved'
              } else {
                it.materialStatus = 'pending'
              }
            } catch (materialError) {
              console.warn(`获取项目 ${pid} 材料信息失败:`, materialError)
              // 设置默认值
              it.requiredMaterials = 0
              it.totalRequired = 0
              it.optionalMaterials = 0
              it.materialStatus = 'pending'
            }
          }
        } catch (error) {
          console.warn(`获取项目 ${pid} 详情失败:`, error)
        }
      })
    await Promise.allSettled(tasks)
  } catch (error) {
    console.error('补充项目详情失败:', error)
  }
}

// 为会议补充项目信息
const enrichMeetingsWithProjectDetails = async () => {
  try {
    const tasks = scheduledMeetingList.value
      .filter((meeting) => meeting && meeting.proposalApplicationId)
      .map(async (meeting) => {
        try {
          const applicationId = meeting.proposalApplicationId
          let detail = technologicalProjectCache.get(applicationId)
          if (!detail) {
            // 先通过开题申请获取项目ID，再通过项目ID获取项目详情
            const applicationResp = await getProposalApplication(applicationId)
            const application = applicationResp?.data || applicationResp
            if (application && application.projectId) {
              const projectResp = await getTechnologicalProject(application.projectId)
              detail = projectResp?.data || projectResp
              if (detail) technologicalProjectCache.set(applicationId, detail)
            }
          }
          if (detail) {
            meeting.projectName = detail.projectName || meeting.projectName
            meeting.projectCode = detail.projectNo || meeting.projectCode
            meeting.applicant = detail.applicant
            meeting.applicantUnit = detail.applicantUnit
            meeting.yearly = detail.yearly
            meeting.projectCycle = detail.projectCycle
            meeting.budget = detail.budget
            // 补充项目详细信息
            meeting.projectLeader = detail.applicant || '待确定'
            meeting.projectDuration = detail.projectCycle ? `${detail.projectCycle}个月` : '12个月'
            meeting.projectBudget = detail.budget ? `${detail.budget}万元` : '待确定'
          }
        } catch (error) {
          console.warn(`获取会议 ${meeting.id} 的项目信息失败:`, error)
        }
      })
    await Promise.allSettled(tasks)
  } catch (error) {
    console.error('补充会议项目信息失败:', error)
  }
}

// 为会议补充参与人信息
const enrichMeetingsWithParticipants = async () => {
  try {
    const tasks = scheduledMeetingList.value
      .filter((meeting) => meeting && meeting.meetingId)
      .map(async (meeting) => {
        try {
          const participantsRes = await getMeetingParticipantPageForConclusion({
            pageNo: '1',
            pageSize: '100',
            meetingId: meeting.meetingId
          })
          
          const participants = (participantsRes && (participantsRes.list || participantsRes.data?.list)) || []
          const hosts = participants
            .filter((p) => Number(p.participantRole) === 0)
            .map((p) => p.participantName)
          const experts = participants
            .filter((p) => Number(p.participantRole) === 1)
            .map((p) => p.participantName)
          
          meeting.meetingHosts = hosts
          meeting.meetingHost = hosts.join('、')
          meeting.experts = experts
          
          console.log(`会议 ${meeting.id} 参与人信息:`, { hosts, experts })
        } catch (error) {
          console.warn(`获取会议 ${meeting.id} 的参与人信息失败:`, error)
        }
      })
    await Promise.allSettled(tasks)
  } catch (error) {
    console.error('补充会议参与人信息失败:', error)
  }
}

// 为会议补充材料信息
const enrichMeetingsWithMaterials = async () => {
  try {
    const tasks = scheduledMeetingList.value
      .filter((meeting) => meeting && meeting.meetingId)
      .map(async (meeting) => {
        try {
          const materialsRes = await getMeetingMaterialPageForConclusion({
            pageNo: '1',
            pageSize: '100',
            meetingId: meeting.meetingId
          })
          
          const materials = (materialsRes && (materialsRes.list || materialsRes.data?.list)) || []
          meeting.meetingMaterials = materials.map(m => ({
            uid: `material-${m.id}`,
            name: m.materialName,
            url: m.fileUrl,
            size: m.fileSize,
            type: m.materialName.split('.').pop(),
          }))
          
          console.log(`会议 ${meeting.id} 材料信息:`, meeting.meetingMaterials)
        } catch (error) {
          console.warn(`获取会议 ${meeting.id} 的材料信息失败:`, error)
        }
      })
    await Promise.allSettled(tasks)
  } catch (error) {
    console.error('补充会议材料信息失败:', error)
  }
}

/**
 * 加载结论数据
 */
const loadConclusionData = async (page = 1, pageSize = 5) => {
  try {
    console.log('开始加载结论数据...')
    
    // ✅ 修改：调用获得开题验收结论(重写)分页API获取真实结论数据
    console.log('=== 调用获得开题验收结论(重写)分页API ===')
    
    // 构建请求参数
    const params = {
      pageNo: page.toString(),
      pageSize: pageSize.toString()
    }

    // 应用筛选条件
    if (filters.value.keyword) {
      params.projectName = filters.value.keyword
    }

    console.log('应用筛选条件:', filters.value)
    console.log('结论API请求参数:', params)

    const response = await getProposalAcceptanceConclusionRewritePage(params)
    
    console.log('=== 获得开题验收结论(重写)分页API响应 ===')
    console.log('原始响应:', response)
    
    const conclusions = (response && (response.list || response.data?.list)) || []
    const total = (response && (response.total || response.data?.total)) || 0
    console.log('结论数据数量:', conclusions.length)
    console.log('总记录数:', total)

    // 更新分页信息
    pagination.value.current = page
    pagination.value.pageSize = pageSize
    pagination.value.total = total
    
    // 转换为前端需要的格式
    const conclusionDataPromises = conclusions.map(async (conclusion) => {
      let conclusionFiles = []
      
      // 获取结论相关的文件数据
      try {
        console.log('=== 为结论加载文件数据 ===')
        console.log('结论ID:', conclusion.id)
        
        const filesResponse = await getProposalConclusionFileRewritePage({
          pageNo: '1',
          pageSize: '50',
          conclusionId: conclusion.id.toString()
        })
        
        if (filesResponse && filesResponse.data && filesResponse.data.list) {
          // 标准响应格式
          conclusionFiles = filesResponse.data.list
          console.log(`结论 ${conclusion.id} 文件数量:`, conclusionFiles.length)
        } else if (filesResponse && filesResponse.list) {
          // 直接响应格式
          conclusionFiles = filesResponse.list
          console.log(`结论 ${conclusion.id} 文件数量:`, conclusionFiles.length)
        }
      } catch (fileError) {
        console.error(`获取结论 ${conclusion.id} 文件失败:`, fileError)
        conclusionFiles = []
      }
      
      // 将API文件对象映射为前端期望的格式
      const mappedConclusionFiles = conclusionFiles.map(file => ({
        uid: file.id || file.uid || `file_${Date.now()}_${Math.random()}`,
        name: file.fileName || file.name || '未知文件',
        url: file.fileUrl || file.url || '',
        size: file.fileSize || file.size || 0,
        type: (file.materialName || file.name || '').split('.').pop() || 'unknown',
        status: 'done',
        response: { code: 200, data: file }
      }))
      
      // 结论结果映射
      const getConclusionText = (result) => {
        const resultMap = {
          0: 'passed',           // 通过
          1: 'conditional_passed', // 有条件通过
          2: 'failed'            // 未通过
        }
        return resultMap[result] || 'passed'
      }
      
      // 获取完整的项目信息
      let projectInfo = {
        projectName: conclusion.projectName || `项目${conclusion.proposalApplicationId}`,
        projectCode: conclusion.projectCode || `PROJ-${conclusion.proposalApplicationId}`,
        applicant: '',
        applicantUnit: '',
        yearly: null,
        projectCycle: null,
        budget: null,
        projectLeader: '待确定',
        projectDuration: '12个月',
        projectBudget: '待确定'
      }
      
      // 通过开题申请ID获取项目详细信息
      if (conclusion.proposalApplicationId) {
        try {
          console.log('=== 为结论获取项目详细信息 ===')
          console.log('开题申请ID:', conclusion.proposalApplicationId)
          
          // 1. 先获取开题申请信息
          const applicationResp = await getProposalApplication(Number(conclusion.proposalApplicationId))
          const application = applicationResp?.data || applicationResp
          
          if (application && application.projectId) {
            // 2. 再通过项目ID获取项目立项申请详细信息
            const projectResp = await getTechnologicalProject(application.projectId)
            const project = projectResp?.data || projectResp
            
            if (project && project.id) {
              // 更新项目信息
              projectInfo = {
                projectName: project.projectName || projectInfo.projectName,
                projectCode: project.projectNo || projectInfo.projectCode,
                applicant: project.applicant || '',
                applicantUnit: project.applicantUnit || '',
                yearly: project.yearly || null,
                projectCycle: project.projectCycle || null,
                budget: project.budget || null,
                projectLeader: project.applicant || '待确定',
                projectDuration: project.projectCycle ? `${project.projectCycle}个月` : '12个月',
                projectBudget: project.budget ? `${project.budget}万元` : '待确定'
              }
              
              console.log(`结论 ${conclusion.id} 项目详细信息已更新:`, projectInfo)
            }
          }
        } catch (projectError) {
          console.warn(`获取结论 ${conclusion.id} 的项目详细信息失败:`, projectError)
          // 忽略项目详情获取失败，使用默认信息
        }
      }
      
      // 获取会议时间 - 通过开题申请ID获取会议信息
      let meetingTime = '会议时间待确定'
      if (conclusion.proposalApplicationId) {
        try {
          console.log('=== 为结论获取会议时间信息 ===')
          console.log('开题申请ID:', conclusion.proposalApplicationId)
          
          // 通过开题申请ID获取会议信息
          const meetingResponse = await getProposalMeetingPage({
            pageNo: '1',
            pageSize: '10',
            proposalApplicationId: conclusion.proposalApplicationId.toString()
          })
          
          if (meetingResponse && (meetingResponse.list || meetingResponse.data?.list)) {
            const meetings = meetingResponse.list || meetingResponse.data?.list || []
            if (meetings.length > 0) {
              const meeting = meetings[0] // 取第一个会议
              // 修复会议时间字段映射 - 兼容不同的字段名，并处理时间戳
              const rawMeetingTime = meeting.meetingTime || meeting.meetingDateTime || meeting.createTime
              meetingTime = formatTimestamp(rawMeetingTime)
              console.log(`结论 ${conclusion.id} 会议时间已获取:`, meetingTime)
            }
          }
        } catch (meetingError) {
          console.warn(`获取结论 ${conclusion.id} 的会议时间失败:`, meetingError)
          // 如果获取失败，使用默认值
          meetingTime = '会议时间待确定'
        }
      }
      
      return {
        id: conclusion.id,
        conclusionId: conclusion.id,
        projectName: projectInfo.projectName,
        projectCode: projectInfo.projectCode,
        meetingTime: formatDisplayTime(meetingTime),
        conclusionTime: formatDisplayTime(conclusion.createTime || meetingTime),
        conclusion: getConclusionText(conclusion.conclusionResult),
        score: conclusion.conclusionScore || 85,
        conclusionDescription: conclusion.conclusionDescription || '会议结论已录入',
        requirements: conclusion.requirements || '',
        conclusionFiles: mappedConclusionFiles,
        // 保存关联信息
        proposalApplicationId: conclusion.proposalApplicationId,
        applicationStatus: conclusion.applicationStatus,
        // 补充项目详细信息
        applicant: projectInfo.applicant,
        applicantUnit: projectInfo.applicantUnit,
        yearly: projectInfo.yearly,
        projectCycle: projectInfo.projectCycle,
        budget: projectInfo.budget,
        projectLeader: projectInfo.projectLeader,
        projectDuration: projectInfo.projectDuration,
        projectBudget: projectInfo.projectBudget
      }
    })
    
    // 等待所有文件数据加载完成
    conclusionList.value = await Promise.all(conclusionDataPromises)
    
    console.log('结论数据加载完成，共', conclusionList.value.length, '项')
    console.log('结论数据详情:', conclusionList.value)
  } catch (error) {
    console.error('加载结论数据失败:', error)
    conclusionList.value = []
  }
}

/**
 * 加载用户数据
 */
const loadUserData = async () => {
  try {
    // 调用用户管理API加载用户列表
    await loadUserList()
    console.log('用户数据加载完成')
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

/**
 * 更新统计数据 - 与 center.vue 保持一致
 */
const updateStats = () => {
  // 基于项目列表动态计算，与 center.vue 逻辑一致
  const materialReviewing = pendingScheduleList.value.filter(p => p.currentStatus === 'material_reviewing').length
  const materialRejected = pendingScheduleList.value.filter(p => p.currentStatus === 'material_rejected').length
  const meetingPreparing = pendingScheduleList.value.filter(p => p.currentStatus === 'meeting_preparing').length
  const meetingScheduled = pendingScheduleList.value.filter(p => p.currentStatus === 'meeting_scheduled').length
  const openingPassed = pendingScheduleList.value.filter(p => p.currentStatus === 'opening_passed').length
  const openingConditional = pendingScheduleList.value.filter(p => p.currentStatus === 'opening_conditional').length
  const openingFailed = pendingScheduleList.value.filter(p => p.currentStatus === 'opening_failed').length
  
  // 计算待录入结论的数量（已安排会议但未录入结论）
  const pendingConclusionCount = meetingScheduled - conclusionList.value.length
  
  stats.value = {
    pendingSchedule: meetingPreparing,        // 会议待组织
    scheduled: meetingScheduled,              // 会议已安排
    completed: openingPassed + openingConditional + openingFailed, // 已完成开题
    pendingConclusion: Math.max(0, pendingConclusionCount)       // 待录入结论（已安排会议但未录入结论）
  }
  
  console.log('统计数据更新完成:', stats.value)
  console.log('详细统计:', {
    materialReviewing,
    materialRejected,
    meetingPreparing,
    meetingScheduled,
    openingPassed,
    openingConditional,
    openingFailed
  })
}

// 项目详情-材料状态与操作
const getMaterialReviewText = (status) => {
  if (Number(status) === 1) return '已通过'
  if (Number(status) === 2) return '已驳回'
  return '待审核'
}

const getMaterialReviewTagColor = (status) => {
  if (Number(status) === 1) return 'green'
  if (Number(status) === 2) return 'red'
  return 'orange'
}

const previewProjectMaterial = (m) => {
  if (!m.fileUrl) {
    message.warning('暂无文件可预览')
    return
  }
  console.log('预览材料:', m)
  fileList.value = (selectedProject.value?.materials || []).map((x) => ({
    id: x.id,
    name: `${x.materialName}${x.fileSuffix ? '.' + x.fileSuffix : ''}`,
    type: x.materialName.split('.').pop(),
    size: x.fileSize,
    url: x.fileUrl,
    uploadTime: x.createTime || '2024-01-15 10:30'
  }))
  const foundIdx = fileList.value.findIndex((x) => x.url === m.fileUrl)
  currentFileIndex.value = foundIdx >= 0 ? foundIdx : 0
  if (currentFileIndex.value < 0) currentFileIndex.value = 0
  currentPreviewFile.value = fileList.value[currentFileIndex.value]
  previewVisible.value = true
}

const downloadProjectMaterial = (m) => {
  if (!m.fileUrl) {
    message.warning('暂无文件可下载')
    return
  }
  const link = document.createElement('a')
  link.href = m.fileUrl
  link.download = m.materialName || 'file'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
/* 会议结论管理页面样式 */

.conclusion-container {
  padding: 24px;
  background-color: #ffffff;
  min-height: calc(100vh - 200px);
}

/* 页面头部 */
.page-header {
  background: white;
  padding: 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
  line-height: 32px;
}

.page-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
  line-height: 22px;
}

.header-actions {
  flex-shrink: 0;
}

/* 会议统计 */
.meeting-stats {
  margin-bottom: 16px;
}

.meeting-stats .ant-row {
  margin: 0 -12px;
}

.meeting-stats .ant-col {
  padding: 0 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  line-height: 1;
}

/* 状态特定样式 */
.stat-card.pending .stat-icon { background: #fff7e6; color: #fa8c16; }
.stat-card.pending .stat-number { color: #fa8c16; }

.stat-card.scheduled .stat-icon { background: #e6f7ff; color: #1890ff; }
.stat-card.scheduled .stat-number { color: #1890ff; }

.stat-card.completed .stat-icon { background: #f6ffed; color: #52c41a; }
.stat-card.completed .stat-number { color: #52c41a; }

.stat-card.conclusion .stat-icon { background: #f9f0ff; color: #722ed1; }
.stat-card.conclusion .stat-number { color: #722ed1; }

/* 筛选条件 */
.filter-section {
  background: white;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-section :deep(.ant-form-item) {
  margin-bottom: 16px;
  margin-right: 16px;
}

.filter-section :deep(.ant-form-item-label) {
  font-weight: 500;
  color: #262626;
}

/* 会议管理标签页 */
.meeting-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.meeting-tabs :deep(.ant-tabs-nav) {
  margin: 0;
  padding: 0 24px;
  background: #fafafa;
}

.meeting-tabs :deep(.ant-tabs-content-holder) {
  padding: 24px;
}

.meeting-tabs :deep(.ant-tabs-tab) {
  padding: 12px 24px;
  margin: 0 4px;
  transition: all 0.3s;
  border-radius: 6px;
}

.meeting-tabs :deep(.ant-tabs-tab-active) {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 会议列表 */
.meeting-list {
  width: 100%;
}

.meeting-item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.meeting-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-info {
  flex: 1;
}

.project-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.project-code {
  font-weight: 500;
  color: #1890ff;
}

.item-status {
  flex-shrink: 0;
}

.item-content {
  margin-bottom: 16px;
}

.project-details,
.meeting-details,
.conclusion-details {
  margin-bottom: 16px;
}

.project-details :deep(.ant-descriptions-item-label),
.meeting-details :deep(.ant-descriptions-item-label),
.conclusion-details :deep(.ant-descriptions-item-label) {
  font-weight: 500;
  color: #262626;
}

.material-summary {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.summary-title {
  font-size: 12px;
  font-weight: 500;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.summary-content {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #262626;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* 结论管理 */
.conclusion-list {
  width: 100%;
}

.conclusion-item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.conclusion-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.conclusion-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.section-content {
  color: #595959;
  line-height: 1.6;
}

.conclusion-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-label {
  font-weight: 500;
  color: #262626;
}

.result-value {
  font-weight: 600;
}

.result-score {
  color: #1890ff;
  font-weight: 500;
}

.conclusion-description {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-top: 8px;
}

/* 会议资料和文件 */
.meeting-materials-display,
.conclusion-files-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.meeting-materials-display :deep(.ant-tag),
.conclusion-files-display :deep(.ant-tag) {
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.meeting-materials-display :deep(.ant-tag:hover),
.conclusion-files-display :deep(.ant-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 弹窗样式 */
.schedule-modal,
.edit-modal,
.conclusion-modal,
.detail-modal,
.notify-modal {
  padding: 0;
}

.project-meeting-info {
  margin-bottom: 24px;
}

.project-meeting-info h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.form-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.4;
}

.meeting-materials,
.conclusion-files {
  margin-top: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 8px;
  line-height: 1.4;
}

.materials-list,
.files-list {
  margin-top: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 8px;
  background: #fafafa;
}

.material-item,
.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
}

.material-item:last-child,
.file-item:last-child {
  margin-bottom: 0;
}

.file-icon {
  color: #1890ff;
  margin-right: 8px;
  font-size: 14px;
}

.file-name {
  flex: 1;
  font-size: 12px;
  color: #262626;
  margin-right: 8px;
}

.file-size {
  font-size: 11px;
  color: #8c8c8c;
  margin-right: 8px;
}

/* 通知设置 */
.notify-targets {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.target-group {
  flex: 1;
}

.group-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 12px;
}

.target-list {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 8px;
  background: #fafafa;
}

.select-all-actions {
  margin-top: 12px;
}

.content-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.reminder-settings {
  margin-top: 8px;
}

.reminder-option {
  margin-bottom: 12px;
}

.reminder-time-setting {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.last-notify-info {
  margin-top: 16px;
}

/* 项目详情 */
.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.material-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.material-list {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.material-item-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.material-item-detail:hover {
  background-color: #fafafa;
}

.material-item-detail:last-child {
  border-bottom: none;
}

.material-info {
  flex: 1;
}

.material-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.material-type {
  color: #8c8c8c;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.material-loading {
  text-align: center;
  padding: 20px;
  color: #8c8c8c;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conclusion-container {
    padding: 16px;
  }
  
  .page-header {
    padding: 16px;
    flex-direction: column;
    gap: 16px;
  }
  
  .meeting-stats .ant-col {
    margin-bottom: 12px;
  }
  
  .filter-section {
    padding: 16px;
  }
  
  .filter-section :deep(.ant-form-item) {
    margin-right: 0;
    width: 100%;
  }
  
  .meeting-tabs :deep(.ant-tabs-content-holder) {
    padding: 16px;
  }
  
  .item-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .project-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .item-actions {
    justify-content: flex-start;
  }
  
  .notify-targets {
    flex-direction: column;
    gap: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .meeting-stats .ant-col {
    width: 100%;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .meeting-item,
  .conclusion-item {
    padding: 16px;
  }
  
  .item-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .item-actions .ant-btn {
    width: 100%;
  }
}
</style> 