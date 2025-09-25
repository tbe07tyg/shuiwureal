<!--
 * @file 会议结论管理页面 - 管理角色
 * @description 管理角色组织验收会议和录入验收结论
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
        <p class="page-description">查看和管理验收会议的结论信息</p>
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
              <div class="stat-label">已完成验收</div>
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
        <!-- <a-form-item label="会议状态">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="pending_schedule">待安排</a-select-option>
            <a-select-option value="scheduled">已安排</a-select-option>
            <a-select-option value="in_progress">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
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
                  <a-tag color="orange" size="large">待安排会议</a-tag>
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
                      {{ item.projectBudget }}万元
                    </a-descriptions-item>
                  </a-descriptions>
                </div>

                <div class="material-summary">
                  <div class="summary-title">材料审核情况</div>
                  <div class="summary-content">
                    <span class="summary-item">
                      必需材料：{{ item.requiredMaterials }}/{{ item.totalRequired }} 已通过
                    </span>
                    <span class="summary-item">
                      可选材料：{{ item.optionalMaterials }} 已提交
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
          </div>
          
          <!-- 分页组件 -->
          <div class="pagination-container" v-if="projectPager.total > 0">
            <a-pagination
              v-model:current="projectPager.pageNo"
              v-model:pageSize="projectPager.pageSize"
              :total="projectPager.total"
              :show-size-changer="true"
              :show-total="total => `共 ${total} 条记录`"
              @change="handleProjectPageChange"
              @showSizeChange="handleProjectPageSizeChange"
            />
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
                    <span class="meeting-time">会议时间：{{ formatDisplayTime(item.meetingTime) }}</span>
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
                        <a-tag 
                          v-for="(material, index) in item.meetingMaterials" 
                          :key="index"
                          color="orange"
                          style="margin: 2px 4px 2px 0; cursor: pointer;"
                          @click="downloadMaterial(material)"
                        >
                          <FileOutlined style="margin-right: 4px;" />
                          {{ material.name }}
                        </a-tag>
                      </div>
                    </a-descriptions-item>
                    <a-descriptions-item label="会议说明" :span="2">
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
          </div>
          
          <!-- 分页组件 -->
          <div class="pagination-container" v-if="meetingPager.total > 0">
            <a-pagination
              v-model:current="meetingPager.pageNo"
              v-model:pageSize="meetingPager.pageSize"
              :total="meetingPager.total"
              :show-size-changer="true"
              :show-total="total => `共 ${total} 条记录`"
              @change="handleMeetingPageChange"
              @showSizeChange="handleMeetingPageSizeChange"
            />
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
                          {{ file.name }}
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
          <div class="pagination-container" v-if="conclusionPager.total > 0">
            <a-pagination
              v-model:current="conclusionPager.pageNo"
              v-model:pageSize="conclusionPager.pageSize"
              :total="conclusionPager.total"
              :show-size-changer="true"
              :show-total="total => `共 ${total} 条记录`"
              @change="handleConclusionPageChange"
              @showSizeChange="handleConclusionPageSizeChange"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>




          



    <!-- 会议安排弹窗 -->
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
                :file-list="scheduleForm.materials"
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
              <div v-if="scheduleForm.materials && scheduleForm.materials.length > 0" class="materials-list">
                <div
                  v-for="(file, index) in scheduleForm.materials"
                  :key="index"
                  class="material-item"
                >
                  <FileOutlined class="file-icon" />
                  <span class="file-name">{{ file.fileName }}</span>
                  <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
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
                :file-list="editForm.materials"
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
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file. size) }}</span>    
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
              {{ formatDisplayTime(selectedMeeting.meetingTime) }}
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
                v-model:file-list="conclusionForm.conclusionFiles"
                :custom-request="customUploadConclusionFile"
                :on-remove="removeConclusionFile"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
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
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.fileSize || file.size) }}</span>
                    <a-button
                      type="link"
                      danger
                    size="small"
                    @click="removeConclusionFileByIndex(index)"
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
              {{ selectedProject.projectBudget }}万元
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
            <a-descriptions-item label="会议时间">{{ formatDisplayTime(selectedMeetingForNotify.meetingTime) }}</a-descriptions-item>
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

    <!-- 会议详情弹窗 -->
    <a-modal
      v-model:open="meetingDetailVisible"
      title="会议详情"
      width="800px"
      :footer="null"
      @cancel="handleMeetingDetailCancel"
    >
      <div v-if="selectedMeeting" class="detail-modal">
        <div class="detail-section">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedMeeting.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="会议时间">
              {{ formatDisplayTime(selectedMeeting.meetingTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedMeeting.meetingLocation || selectedMeeting.meetingPlace }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式">
              {{ getMeetingTypeText(selectedMeeting.meetingType) }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2">
              {{ selectedMeeting.meetingDescription }}
            </a-descriptions-item>
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
          <div v-if="selectedMeeting.meetingMaterials && selectedMeeting.meetingMaterials.length" class="material-list">
            <div v-for="m in selectedMeeting.meetingMaterials" :key="m.id || m._id || m.name" class="material-item-detail">
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ m.name || m.materialName }}
                </div>
                <div class="material-meta">
                  <!-- <span class="material-type">会议资料</span> -->
                  <a-tag color="orange" size="small">会议资料</a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMeetingMaterial(m)">预览</a-button>
                <a-button type="link" size="small" @click="downloadMaterial(m)">下载</a-button>
              </div>
            </div>
          </div>
          <div v-else class="text-muted" style="padding: 8px 0;">暂无资料</div>
        </div>
      </div>






      
    </a-modal>

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
            <a-descriptions-item label="会议时间">{{ selectedConclusion.meetingTimeFormatted || formatDisplayTime(selectedConclusion.meetingTime) }}</a-descriptions-item>
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
            <!-- <a-descriptions-item v-if="selectedConclusion.requirements" label="整改要求" :span="2">{{ selectedConclusion.requirements }}</a-descriptions-item> -->
          </a-descriptions>
        </div>

        <div class="detail-section">
          <h4>结论相关文件</h4>
          <div v-if="selectedConclusion.conclusionFiles && selectedConclusion.conclusionFiles.length" class="file-list">
            <div v-for="f in selectedConclusion.conclusionFiles" :key="f.id || f._id || f.name" class="file-item-detail">
              <div class="file-info">
                <div class="file-name">
                  <FileOutlined />
                  {{ f.name || f.fileName }}
                </div>
                <div class="file-meta">
                  <a-tag color="purple" size="small">结论文件</a-tag>
                </div>
              </div>
              <div class="file-actions">
                <a-button type="link" size="small" @click="previewConclusionFile(f)">预览</a-button>
                <a-button type="link" size="small" @click="downloadConclusionFile(f)">下载</a-button>
              </div>
            </div>
          </div>
          <div v-else class="text-muted" style="padding: 8px 0;">暂无文件</div>
        </div>
      </div>

      
    </a-modal>

    <!-- 文件预览弹窗 -->
    <FilePreview
      v-model:visible="filePreviewVisible"
      :file-info="previewFileInfo"
      :file-list="previewFileList"
      :current-file-index="previewCurrentIndex"
      @file-change="(idx) => { previewCurrentIndex = idx; previewFileInfo = previewFileList[idx] }"
      @download="handleFileDownload"
    />
  </div>
</template>

<script setup>
/**
 * 会议结论管理页面 - 管理角色
 * 功能：会议安排、结论录入、流程管理、状态跟踪
 */
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
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
  ReloadOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
// 导入PageContainer组件
import { ContentWrap } from '@/components/ContentWrap'
// 文件预览组件
import FilePreview from '@/components/th_qd/FilePreview.vue'
// 接口：th_qd/approval
import {
  getTechnologicalProjectPage,
  getTechnologicalProject,
  getTechnologicalMeetingPage,
  getTechnologicalMeeting,
  createTechnologicalMeeting,
  updateTechnologicalMeeting,
  deleteTechnologicalMeeting,
  getTechnologicalAcceptanceConclusionPage,
  createTechnologicalAcceptanceConclusion,
  updateTechnologicalAcceptanceConclusion,
  createTechnologicalConclusionFile,
  getTechnologicalConclusionFilePage,
  updateTechnologicalProject,
  approveProject,
  rejectProject,
  getTechnologicalMeetingParticipantPage,
  createTechnologicalMeetingParticipant,
  deleteTechnologicalMeetingParticipant,
  getTechnologicalMeetingMaterialPage,
  createTechnologicalMeetingMaterial,
  deleteTechnologicalMeetingMaterial,
  getTechnologicalProjectMaterialPage,
  getTechnologicalProjectStats,
  deleteTechnologicalConclusionFile
} from '@/api/th_qd/approval'
// 上传工具
import { uploadTechnologicalFile } from '@/api/upload'
import { getUserPage, getSimpleUserList } from '@/api/system/user'
import { useMeetingScheduler } from '@/composables/th_qd/useMeetingScheduler'

// 统计数据
const stats = ref({
  pendingSchedule: computed(() => projectPager.value.total),
  scheduled: computed(() => meetingPager.value.total),
  completed: 0,
  pendingConclusion: computed(() => conclusionPager.value.total)
})








// 获取项目统计数据
const fetchProjectStats = async () => {
  try {
    const response = await getTechnologicalProjectStats()
    if (response && Array.isArray(response)) {
      // 查找 projectApprovedType 为 8 的项目（立项通过的项目数量）
      const approvedProject = response.find(item => item.projectApprovedType === 8)
      if (approvedProject && approvedProject.projectApprovedQuantity !== undefined) {
        stats.value.completed = approvedProject.projectApprovedQuantity
      }
    }
  } catch (error) {
    console.error('获取项目统计数据失败:', error)
  }
}














// 筛选条件
const filters = ref({
  status: undefined,
  meetingDateRange: undefined,
  keyword: ''
})

// 活动标签页
const activeTab = ref('schedule')

// 待安排会议列表（后端）
const pendingScheduleList = ref([])

// 已安排会议列表（后端）
const scheduledMeetingList = ref([])

// 结论列表（后端）
const conclusionList = ref([])

// 加载与分页/状态
const loading = ref(false)
const projectPager = ref({ pageNo: 1, pageSize: 5, total: 0 })
const meetingPager = ref({ pageNo: 1, pageSize: 5, total: 0 })
const conclusionPager = ref({ pageNo: 1, pageSize: 5, total: 0 })

// 主持人列表
const hostList = ref([
  { id: 1, name: '李主任', title: '技术主任' },
  { id: 2, name: '王经理', title: '项目经理' },
  { id: 3, name: '张总监', title: '技术总监' }
])

// 专家列表
const expertList = ref([
  { id: 1, name: '张教授', title: '高级工程师' },
  { id: 2, name: '李博士', title: '技术专家' },
  { id: 3, name: '王专家', title: '项目管理专家' },
  { id: 4, name: '赵顾问', title: '行业顾问' }
])

// 弹窗状态

const editModalVisible = ref(false)
const conclusionModalVisible = ref(false)
const detailModalVisible = ref(false)
const notifyModalVisible = ref(false)
const selectedProject = ref(null)
const selectedMeeting = ref(null)
const selectedEditMeeting = ref(null)
const selectedMeetingForNotify = ref(null)
const sendingNotification = ref(false)
const meetingDetailVisible = ref(false)
const conclusionDetailVisible = ref(false)
const selectedConclusion = ref(null)

// 表单数据

const scheduleModalVisible = ref(false)
const scheduleForm = ref({
  datetime: '',
  location: '',
  type: 'offline',
  hosts: [],
  experts: [],
  materials: [],
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

// 文件预览状态
const filePreviewVisible = ref(false)
const previewFileInfo = ref({})
const previewFileList = ref([])
const previewCurrentIndex = ref(0)

// 复用 center.vue 的会议安排与上传逻辑
const { uploadMeetingFile, arrangeMeeting } = useMeetingScheduler()

// 显示用时间格式化（兼容毫秒时间戳与字符串）
const formatDisplayTime = (v) => {
  if (!v) return ''
  const d = typeof v === 'number' ? dayjs(v) : dayjs(v)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(v)
}

// 主持人/专家选项（后端加载，变量名保持一致）
const hostOptions = ref([])
const expertOptions = ref([])

const loadUserOptions = async () => {
  try {
    const simpleList = await getSimpleUserList()
    const users = Array.isArray(simpleList) ? simpleList : []
    const toOption = (u) => ({ value: String(u.nickname || u.username || u.id), label: String(u.nickname || u.username || u.id) })
    const opts = users.map(toOption)
    hostOptions.value = opts
    expertOptions.value = opts
  } catch (e) {
    try {
      const pageRes = await getUserPage({ pageNo: 1, pageSize: 100 })
      const list = (pageRes && pageRes.list) || []
      const opts = list.map((u) => ({ value: String(u.nickname || u.username || u.id), label: String(u.nickname || u.username || u.id) }))
      hostOptions.value = opts
      expertOptions.value = opts
    } catch (err) {
      console.warn('用户选项加载失败:', err)
    }
  }
}

// 过滤方法
const filterHostOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

const filterExpertOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
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
    const uploaded = await uploadMeetingFile(file)
    scheduleForm.value.materials.push(uploaded)
    message.success(`文件 ${file.name} 上传成功`)
  } catch (e) {
    message.error('文件上传失败')
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
    const uploaded = await uploadMeetingFile(file)
    editForm.value.materials.push(uploaded)
    message.success(`文件 ${file.name} 上传成功`)
  } catch (e) {
    message.error('文件上传失败')
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
    // 上传文件
    const uploaded = await uploadTechnologicalFile(file)
    const fileUrl = uploaded?.data?.fileUrl || uploaded?.fileUrl
    
    if (!fileUrl) {
      throw new Error('上传成功但未获取到文件URL')
    }
    
    // 检查文件是否已存在（通过文件名或URL）
    const isFileExists = conclusionForm.value.conclusionFiles.some(
      existingFile => existingFile.name === file.name || existingFile.url === fileUrl
    );

    if (!isFileExists) {
      // 只有文件不存在时才添加到表单文件列表
      conclusionForm.value.conclusionFiles.push({
        uid: file.uid || Date.now() + Math.random(),
        name: file.name,
        status: 'done',
        url: fileUrl,
        size: file.size,
        originFileObj: file,
        // 保存原始文件信息，确保后续处理能获取到
        _raw: file
      });
      console.log('文件上传成功:', file.name, 'URL:', fileUrl)
      message.success(`文件 ${file.name} 添加成功`)
    } else {
      console.log('文件已存在，跳过添加:', file.name)
      message.info(`文件 ${file.name} 已存在`)
    }
    
  } catch (error) {
    console.error('文件上传失败:', error)
    message.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
  }
  
  return false
}

// 自定义文件上传方法
const customUploadConclusionFile = async ({ file, onSuccess, onError, onProgress }) => {
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isLt20M) {
    message.error('文件大小不能超过20MB!')
    onError(new Error('文件大小不能超过20MB'))
    return
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
    onError(new Error('只支持PDF、Word、Excel格式'))
    return
  }

  try {
    // 上传文件
    const uploaded = await uploadTechnologicalFile(file)
    const fileUrl = uploaded?.data?.fileUrl || uploaded?.fileUrl

    if (!fileUrl) {
      throw new Error('上传成功但未获取到文件URL')
    }

    // 检查文件是否已存在（通过文件名或URL）
    const isFileExists = conclusionForm.value.conclusionFiles.some(
      existingFile => existingFile.name === file.name || existingFile.url === fileUrl
    );

    if (!isFileExists) {
      // 只有文件不存在时才添加到表单文件列表
      const newFile = {
        uid: file.uid || Date.now() + Math.random(),
        name: file.name,
        status: 'done',
        url: fileUrl,
        size: file.size,
        originFileObj: file,
        // 保存原始文件信息，确保后续处理能获取到
        _raw: file
      };

      // 使用onSuccess回调，让组件自动处理文件添加
      onSuccess(newFile, file);
      console.log('文件上传成功:', file.name, 'URL:', fileUrl)
      message.success(`文件 ${file.name} 添加成功`)
    } else {
      console.log('文件已存在，跳过添加:', file.name)
      message.info(`文件 ${file.name} 已存在`)
      // 调用onSuccess但不添加新文件，防止组件显示错误状态
      onSuccess({}, file);
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    message.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
    onError(error)
  }
}

const removeConclusionFile = async (file) => {
  // 获取文件的真实ID，可能需要从不同的属性中获取
  let fileId = file.id;

  // 如果直接id属性不存在，尝试从其他属性获取
  if (!fileId && file.response && file.response.id) {
    fileId = file.response.id;
  }

  // 如果仍然没有获取到ID，尝试从文件列表中查找匹配的文件
  if (!fileId) {
    const fileInList = conclusionForm.value.conclusionFiles.find(item => 
      item.uid === file.uid || item.name === file.name || item.url === file.url
    );
    if (fileInList) {
      fileId = fileInList.id;
    }
  }

  console.log('尝试删除文件，文件对象:', file, '获取到的文件ID:', fileId);

  // 如果文件有id，说明是已存在的文件，需要调用后端API删除
  if (fileId) {
    try {
      await deleteTechnologicalConclusionFile(fileId)
      console.log('后端文件记录删除成功，文件ID:', fileId)
    } catch (error) {
      console.error('删除后端文件记录失败:', error)
      message.error('删除文件失败，请重试')
      return false // 阻止前端删除
    }
  } else {
    console.warn('无法获取文件ID，跳过后端删除操作')
  }

  // 从前端列表中移除文件
  const index = conclusionForm.value.conclusionFiles.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    conclusionForm.value.conclusionFiles.splice(index, 1)
    message.success('文件删除成功')
  }

  return false // 阻止默认删除行为，因为我们已经手动处理了
}

const removeConclusionFileByIndex = async (index) => {
  const file = conclusionForm.value.conclusionFiles[index]

  // 如果文件有id，说明是已存在的文件，需要调用后端API删除
  if (file && file.id) {
    try {
      await deleteTechnologicalConclusionFile(file.id)
      console.log('后端文件记录删除成功，文件ID:', file.id)
    } catch (error) {
      console.error('删除后端文件记录失败:', error)
      message.error('删除文件失败，请重试')
      return // 阻止前端删除
    }
  }

  // 从前端列表中移除文件
  conclusionForm.value.conclusionFiles.splice(index, 1)
  message.success('文件删除成功')
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
    approved: '已通过',
    rejected: '已驳回',
    pending: '待审核'
  }
  return textMap[status] || '未知'
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
  const textMap = {
    scheduled: '已安排',
    in_progress: '进行中',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

// 后端会议状态与前端文案的简单映射（若后端返回数字可在此转换）
const normalizeMeetingStatus = (rawStatus) => {
  if (typeof rawStatus === 'string') return rawStatus
  // 同时兼容两套约定：1/2/3 或 4/5/6
  if (rawStatus === 1 || rawStatus === 4) return 'scheduled'
  if (rawStatus === 2 || rawStatus === 5) return 'in_progress'
  if (rawStatus === 3 || rawStatus === 6) return 'completed'
  return 'scheduled'
}

const getMeetingTypeText = (type) => {
  // 兼容 number 与 string
  if (type === 0 || type === 'offline') return '现场会议'
  if (type === 1 || type === 'online') return '线上会议'
  if (type === 2 || type === 'hybrid') return '混合会议'
  if (rawStatus === 4) return 'scheduled'
  return '未知'
}

const getMeetingTypeColor = (type) => {
  if (type === 0 || type === 'offline') return 'blue'
  if (type === 1 || type === 'online') return 'green'
  if (type === 2 || type === 'hybrid') return 'orange'
  return 'default'
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

// 事件处理方法
const scheduleMeeting = (record) => {
  selectedProject.value = record
  scheduleForm.value = {
    datetime: '',
    location: '',
    type: 'offline',
    hosts: [],
    experts: [],
    materials: [],
    description: ''
  }
  scheduleModalVisible.value = true
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
  // 根据当前活动的标签页调用相应的加载函数
  if (activeTab.value === 'schedule') {
    await loadPendingProjects()
  } else if (activeTab.value === 'scheduled') {
    await loadScheduledMeetings()
  } else if (activeTab.value === 'conclusion') {
    await loadConclusions()
  }
}

const resetFilters = () => {
  filters.value = {
    status: undefined,
    meetingDateRange: undefined,
    keyword: ''
  }
}

const handleTabChange = async (key) => {
  activeTab.value = key
  await refreshData()
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
    const materialsPage = await getTechnologicalProjectMaterialPage({ pageNo: 1, pageSize: 100, projectId: item.id })
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
      fileSuffix: m.fileSuffix,
      uploader: m.uploader,
      uploadTime: m.uploadTime
    }))
  } catch (e) {
    selectedProject.value.materials = []
  } finally {
    selectedProject.value.materialsLoading = false
  }
}


















































const startMeeting = async (item) => {
  try {
    await updateTechnologicalMeeting({ id: item.id, meetingStatus: 3 })
    //更新项目状态为录入结论
    await updateTechnologicalProject({ id: item.projectId, status: 4 })
    // 更新项目状态为录入结论
    item.meetingStatus = 'in_progress'
    message.success(`开始会议：${item.projectName}`)
    // 可选：刷新列表，确保与后端一致
    await loadScheduledMeetings()
  } catch (e) {
    message.error('开始会议失败')
  }
}

const editMeeting = (item) => {
  console.log('编辑会议，原始数据:', item)

  // 确保会议ID存在
  if (!item.id) {
    console.error('会议ID不存在，无法编辑会议')
    message.error('会议ID不存在，无法编辑会议')
    return
  }

  // 深拷贝会议数据，避免直接修改原始数据
  selectedEditMeeting.value = JSON.parse(JSON.stringify(item))
  editForm.value = {
    datetime: item.meetingTime ? dayjs(item.meetingTime) : undefined,
    location: item.meetingLocation || '',
    type: item.meetingType === 0 ? 'offline' : item.meetingType === 1 ? 'online' : item.meetingType === 2 ? 'hybrid' : 'offline',
    hosts: item.meetingHosts || (item.meetingHost ? [item.meetingHost] : []),
    experts: item.experts || [],
    materials: item.meetingMaterials || [],
    description: item.meetingDescription || ''
  }

  console.log('编辑会议，设置selectedEditMeeting:', selectedEditMeeting.value)
  console.log('编辑会议，设置editForm:', editForm.value)

  editModalVisible.value = true
}

const deleteMeeting = (item) => {
  // 显示确认删除对话框
  const modal = Modal.confirm({
    title: '确认删除',
    content: `确定要删除项目"${item.projectName}"的会议安排吗？`,
    okText: '确定',
    cancelText: '取消',
    async onOk() {
      try {
        //更新项目状态为组织会议
        await updateTechnologicalProject({ id: item.projectId, status: 3 })
        await deleteTechnologicalMeeting(item.id)
        message.success('会议删除成功')
        await loadScheduledMeetings()
        await loadPendingProjects()
      } catch (e) {
        message.error('会议删除失败')
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

const viewMeetingDetail = (item) => {
  // 加载会议详情：会议信息、参会人员、会议资料
  selectedMeeting.value = { ...item }
  ;(async () => {
    try {
      const [participantsRes, materialsRes] = await Promise.all([
        getTechnologicalMeetingParticipantPage({ pageNo: 1, pageSize: 100, meetingId: item.id }),
        getTechnologicalMeetingMaterialPage({ pageNo: 1, pageSize: 100, meetingId: item.id })
      ])
      const participants = (participantsRes && (participantsRes.list || participantsRes.data?.list)) || []
      const hosts = participants
        .filter((p) => p.participantRole === 0 || (typeof p.participantRole === 'string' && String(p.participantRole).toUpperCase().includes('HOST')))
        .map((p) => p.participantName)
      const experts = participants
        .filter((p) => p.participantRole === 1 || (typeof p.participantRole === 'string' && String(p.participantRole).toUpperCase().includes('EXPERT')))
        .map((p) => p.participantName)
      selectedMeeting.value.meetingHosts = hosts
      selectedMeeting.value.experts = experts

      const materials = (materialsRes && (materialsRes.list || materialsRes.data?.list)) || []
      console.log('会议资料原始数据:', materialsRes)
      console.log('处理后的会议资料数组:', materials)
      console.log('第一个会议资料对象:', materials[0])
      selectedMeeting.value.meetingMaterials = materials.map((mm) => {
        console.log('处理单个会议资料对象:', mm)
        // 确保正确获取文件URL
        const fileUrl = mm.fileUrl || mm.materialPath || mm.url
        console.log('获取到的文件URL:', fileUrl)
        return { 
          name: mm.materialName, 
          url: fileUrl,
          // 保留原始数据以便调试
          _debug: {
            fileUrl: mm.fileUrl,
            materialPath: mm.materialPath,
            url: mm.url
          }
        }
      })
    } catch (e) {
      // 忽略单次加载失败，仍然展示已有信息
    } finally {
      meetingDetailVisible.value = true
    }
  })()
}

const editConclusion = async (item) => {
  // 编辑已录入的结论
  selectedMeeting.value = item

  // 设置结论ID，用于识别编辑模式
  selectedMeeting.value.conclusionId = item.id

  console.log('编辑结论，设置conclusionId:', item.id)

  // 获取会议信息，包括会议地点
  if (item.meetingId) {
    try {
      const meeting = await getTechnologicalMeeting(item.meetingId)
      const meetingData = (meeting && (meeting.data || meeting)) || {}
      selectedMeeting.value.meetingLocation = meetingData.meetingPlace || meetingData.meetingLocation || ''
    } catch (error) {
      // console.error('获取会议信息失败:', error)
    }
  }

  // 获取已上传的结论文件
  try {
    console.log('正在获取结论文件，结论ID:', item.id)
    const filesPage = await getTechnologicalConclusionFilePage({ 
      pageNo: 1, 
      pageSize: 100, 
      conclusionId:  item.id // 使用projectId作为conclusionId
    })
    console.log('获取到的文件页面数据:', filesPage)

    const files = (filesPage && (filesPage.list || filesPage.data?.list)) || []
    console.log('处理后的文件列表:', files)

    // 转换文件格式为a-upload组件需要的格式
    const formattedFiles = files.map((file, index) => ({
      uid: file.id || `file-${index}`,
      name: file.fileName || file.name,
      status: 'done',
      url: file.filePath || file.fileUrl || file.url,
      size: file.fileSize,
      type: file.fileSuffix ? `.${file.fileSuffix}` : '',
      id: file.id
    }))

    console.log('格式化后的文件列表:', formattedFiles)

    conclusionForm.value = {
      conclusion: item.conclusion || 'passed',
      score: item.score || 85,
      description: item.conclusionDescription || '',
      requirements: item.requirements || '',
      conclusionFiles: formattedFiles
    }
  } catch (error) {
    console.error('获取结论文件失败:', error)
    // 即使获取文件失败，也要显示弹窗
    conclusionForm.value = {
      conclusion: item.conclusion || 'passed',
      score: item.score || 85,
      description: item.conclusionDescription || '',
      requirements: item.requirements || '',
      conclusionFiles: item.conclusionFiles || []
    }
  }

  conclusionModalVisible.value = true
}

const exportConclusion = (item) => {
  // 导出验收结论文档
  message.success(`正在导出验收结论：${item.projectName}`)
  
  // 实际项目中这里应该调用导出接口
  // exportAPI.exportConclusion(item.id)
}

const viewConclusionDetail = (item) => {
  console.log('viewConclusionDetail被调用，参数item:', item)
  // 基于结论分页数据填充详情，并补充文件
  selectedConclusion.value = { ...item }
  console.log('selectedConclusion.value:', selectedConclusion.value)
  ;(async () => {
    try {
      // // 结论文件分页（按项目ID加载）
      // console.log('正在加载结论文件，item对象:', item)
      // console.log('item.id:', item.id)
      // console.log('item.projectId:', item.projectId)
      // 使用item.projectId作为项目ID，因为API需要的是projectId而不是conclusionId
      const id =  item.id
      const projectId = item.projectId
      console.log('使用的结论ID:', id)
      try {
        const filesPage = await getTechnologicalConclusionFilePage({ pageNo: 1, pageSize: 100, conclusionId: item.id})
        console.log('获取到的文件页面数据:', filesPage)
        const files = (filesPage && (filesPage.list || filesPage.data?.list)) || []
        console.log('处理后的文件列表:', files)
        selectedConclusion.value.conclusionFiles = files.map((x) => ({ 
          id: x.id,
          name: x.fileName || x.name, 
          url: x.filePath || x.fileUrl || x.url,
          size: x.fileSize
        }))
      } catch (error) {
        console.error('获取结论文件失败:', error)
        // 确保即使获取失败，也有一个空数组
        selectedConclusion.value.conclusionFiles = []
      }
      
      // 获取会议时间信息
      console.log('结论详情原始数据:', item)
      console.log('会议ID:', item.meetingId)
      
      if (item.meetingId) {
        try {
          console.log('正在获取会议信息，ID:', item.meetingId)
          const meeting = await getTechnologicalMeeting(item.meetingId)
          console.log('获取到的会议信息:', meeting)
          const m = (meeting && (meeting.data || meeting)) || {}
          console.log('处理后的会议对象:', m)
          
          selectedConclusion.value.meetingTime = m.meetingTime || m.startTime
          selectedConclusion.value.meetingTimeFormatted = formatDisplayTime(m.meetingTime || m.startTime)
          console.log('设置后的会议时间:', selectedConclusion.value.meetingTime)
          console.log('格式化后的会议时间:', selectedConclusion.value.meetingTimeFormatted)
        } catch (e) {
          console.error('获取会议时间失败:', e)
        }
      } else {
        console.log('没有会议ID，无法获取会议时间')
      }
      
      // 拉取项目详情以补齐项目信息
      if (item.projectId) {
        try {
          const proj = await getTechnologicalProject(item.projectId)
          const p = (proj && (proj.data || proj)) || {}
          selectedConclusion.value.projectName = p.projectName || selectedConclusion.value.projectName
          selectedConclusion.value.projectCode = p.projectNo || selectedConclusion.value.projectCode
          selectedConclusion.value.applicant = p.applicant
          selectedConclusion.value.applicantUnit = p.applicantUnit
          selectedConclusion.value.yearly = p.yearly
          selectedConclusion.value.projectCycle = p.projectCycle
          selectedConclusion.value.budget = p.budget
        } catch (e) {}
      }
    } catch (e) {
      // 忽略加载失败，保留已有
    } finally {
      conclusionDetailVisible.value = true
    }
  })()
}

// 会议资料下载方法
const downloadMaterial = (material) => {
  // 实际项目中这里应该调用下载接口
  message.success(`下载会议资料：${material.name}`)
  
  // 检查文件URL是否存在
  if (!material.url) {
    message.warning('无法下载，文件地址不存在')
    return
  }
  
  console.log('下载会议资料:', material)
  
  // 使用文件URL进行下载
  const link = document.createElement('a')
  link.href = material.url
  link.download = material.name || material.materialName || '会议资料'
  link.target = '_blank'  // 在新标签页中打开，避免当前页面被替换
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
  console.log(m)
  previewFileList.value = (selectedProject.value?.materials || []).map((x) => ({
    id: x.id,
    name: `${x.materialName}${x.fileSuffix ? '.' + x.fileSuffix : ''}`,
    type: x.fileSuffix,
    size: x.fileSize,
    url: x.fileUrl
  }))
  const foundIdx = previewFileList.value.findIndex((x) => x.url === m.fileUrl)
  previewCurrentIndex.value = foundIdx >= 0 ? foundIdx : 0
  if (previewCurrentIndex.value < 0) previewCurrentIndex.value = 0
  previewFileInfo.value = previewFileList.value[previewCurrentIndex.value]
  filePreviewVisible.value = true
}
// 会议资料预览方法
const previewMeetingMaterial = (m) => {
  if (!m.url) {
    message.warning('暂无文件可预览')
    return
  }
  console.log('会议资料对象:', m)
  
  // 获取文件扩展名作为类型
  const fileName = m.name || m.materialName || ''
  const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
  
  // 尝试获取文件大小，如果不存在则使用默认值
  let fileSize = m.size || m.fileSize
  if (fileSize === undefined || fileSize === null) {
    // 如果无法获取文件大小，设置一个默认值
    fileSize = 1024  // 1KB作为默认值
    console.warn(`无法获取文件 ${fileName} 的大小，使用默认值`)
  }
  
  console.log(`文件 ${fileName} 大小:`, fileSize)
  
  previewFileList.value = (selectedMeeting.value?.meetingMaterials || []).map((x) => {
    const xName = x.name || x.materialName || ''
    const xExt = xName.split('.').pop()?.toLowerCase() || ''
    
    // 处理每个文件的大小
    let xSize = x.size || x.fileSize
    if (xSize === undefined || xSize === null) {
      xSize = 1024  // 1KB作为默认值
    }
    
    return {
      id: x.id || x._id,
      name: xName,
      type: xExt,
      size: xSize,
      url: x.url
    }
  })
  
  console.log('处理后的文件列表:', previewFileList.value)
  
  const foundIdx = previewFileList.value.findIndex((x) => x.url === m.url)
  previewCurrentIndex.value = foundIdx >= 0 ? foundIdx : 0
  if (previewCurrentIndex.value < 0) previewCurrentIndex.value = 0
  previewFileInfo.value = previewFileList.value[previewCurrentIndex.value]
  console.log('当前预览文件信息:', previewFileInfo.value)
  filePreviewVisible.value = true
}

// 统一的文件下载处理方法
const handleFileDownload = (file) => {
  // 判断是项目材料还是会议资料
  if (file.materialName) {
    // 项目材料
    downloadProjectMaterial(file)
  } else {
    // 会议资料
    downloadMaterial(file)
  }
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























// 结论文件下载方法
const downloadConclusionFile = (file) => {
  message.success(`下载结论文件：${file.name}`)
    // 检查文件URL是否存在
  if (!file.url) {
    message.warning('无法下载，文件地址不存在')
    return
  }
  
  console.log('下载会议资料:', file)
  
  // 使用文件URL进行下载
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name || file.fileName || '结论文件'
  link.target = '_blank'  // 在新标签页中打开，避免当前页面被替换
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // 实际项目中这里应该调用下载接口
  // downloadAPI.downloadConclusionFile(file.id)
}

// 结论文件预览方法
const previewConclusionFile = (file) => {
  // console.log('结论文件对象:', file)
  if (!file.url) {
    message.warning('暂无文件可预览')
    return
  }
  console.log('结论文件对象:', file)

  // 获取文件扩展名作为类型
  const fileName = file.name || file.fileName || ''
  const fileExt = fileName.split('.').pop()?.toLowerCase() || ''

  // 尝试获取文件大小，如果不存在则使用默认值
  let fileSize = file.size || file.fileSize
  if (fileSize === undefined || fileSize === null) {
    // 如果无法获取文件大小，设置一个默认值
    fileSize = 1024  // 1KB作为默认值
    console.warn(`无法获取文件 ${fileName} 的大小，使用默认值`)
  }

  console.log(`文件 ${fileName} 大小:`, fileSize)

  previewFileList.value = (selectedConclusion.value?.conclusionFiles || []).map((x) => {
    const xName = x.name || x.fileName || ''
    const xExt = xName.split('.').pop()?.toLowerCase() || ''

    // 处理每个文件的大小
    let xSize = x.size || x.fileSize
    if (xSize === undefined || xSize === null) {
      xSize = 1024  // 1KB作为默认值
    }

    // 确保URL存在，如果不存在则尝试其他可能的字段
    let fileUrl = x.url || x.filePath || x.fileUrl
    if (!fileUrl) {
      console.warn(`文件 ${xName} 没有有效的URL`) 
    }

    return {
      id: x.id || x._id,
      name: xName,
      type: xExt,
      size: xSize,
      url: fileUrl
    }
  })

  console.log('处理后的文件列表:', previewFileList.value)

  const foundIdx = previewFileList.value.findIndex((x) => x.url === file.url)
  previewCurrentIndex.value = foundIdx >= 0 ? foundIdx : 0
  if (previewCurrentIndex.value < 0) previewCurrentIndex.value = 0
  previewFileInfo.value = previewFileList.value[previewCurrentIndex.value]
  console.log('当前预览文件信息:', previewFileInfo.value)
  filePreviewVisible.value = true
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
  // 表单验证
  if (!scheduleForm.value.datetime) {
    message.error('请选择会议时间')
    return
  }
  if (!scheduleForm.value.location) {
    message.error('请输入会议地点')
    return
  }
  if (!scheduleForm.value.hosts || scheduleForm.value.hosts.length === 0) {
    message.error('请选择或输入会议主持人')
    return
  }
  if (!scheduleForm.value.experts || scheduleForm.value.experts.length === 0) {
    message.error('请选择或输入参会专家')
    return
  }
  if (!selectedProject.value) return

  try {
    // 在安排会议前，先获取完整的项目信息，确保不会清空原有字段
    let projectInfo = { ...selectedProject.value }
    
    // 如果关键字段为空，从后端重新获取项目详情
    if (!projectInfo.applicant || !projectInfo.applicantUnit || !projectInfo.budget) {
      try {
        const projectDetail = await getTechnologicalProject(selectedProject.value.id)
        const p = projectDetail?.data || projectDetail || {}
        projectInfo = {
          ...projectInfo,
          applicant: p.applicant || '',
          applicantUnit: p.applicantUnit || '',
          budget: p.budget || 0
        }
      } catch (error) {
        console.error('获取项目详情失败:', error)
      }
    }
    
    await arrangeMeeting(
      {
        id: projectInfo.id,
        projectName: projectInfo.projectName,
        projectNo: projectInfo.projectCode || projectInfo.projectNo,
        yearly: projectInfo.yearly,
        applicant: projectInfo.applicant,
        applicantUnit: projectInfo.applicantUnit,
        projectCycle: projectInfo.projectCycle,
        budget: projectInfo.budget
      },
      scheduleForm.value
    )
    message.success('会议安排完成')
    scheduleModalVisible.value = false
    await Promise.all([loadScheduledMeetings(), loadPendingProjects()])
  } catch (e) {
    let err = '会议安排失败'
    if (e && typeof e === 'object' && e.message) {
      err = e.message
    } else if (typeof e === 'string' && e) {
      err = e
    }
    message.error(err)
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
  if (!selectedMeeting.value) return

  try {
    // 结果映射：passed=0, conditional_passed=1, failed=2
    const resultMap = { passed: 0, conditional_passed: 1, failed: 2 }
    // 支持编辑时无会议上下文的场景
    const payload = {
      projectId: selectedMeeting.value.projectId || selectedMeeting.value.id || 0,
      meetingId: selectedMeeting.value.meetingId || selectedMeeting.value.id,
      conclusionType: 1,
      conclusionResult: resultMap[conclusionForm.value.conclusion],
      conclusionScore: conclusionForm.value.score,
      conclusionDescription: conclusionForm.value.description
    }

    // 处理结论文件（区分已存在的文件和新上传的文件）
    const existingFiles = [] // 已存在的文件（有id的）
    const newFilesToUpload = [] // 需要上传的新文件
    const uploadedFilePaths = []
    for (let i = 0; i < (conclusionForm.value.conclusionFiles || []).length; i++) {
      const file = conclusionForm.value.conclusionFiles[i]
      // 若已存在 url，视为已上传的文件，直接复用
      if (file && file.url && typeof file.url === 'string') {
        uploadedFilePaths.push({ 
          name: file.name || file.fileName, 
          path: file.url,
          size: file.fileSize || file.size,
          id: file.id
        })
        continue
      }
      // 取原始文件对象（Ant Upload 可能提供 originFileObj）
      const raw = (file && file.originFileObj) ? file.originFileObj : file
      try {
        const uploadRes = await uploadTechnologicalFile(raw)
        const filePath = uploadRes?.data?.fileUrl || uploadRes?.fileUrl
        if (filePath) {
          uploadedFilePaths.push({ 
            name: file.name, 
            path: filePath,
            size: file.size || raw.size
          })
        }
      } catch (uploadError) {
        console.error('文件上传失败:', uploadError)
        message.error(`文件 ${file.name} 上传失败，请重试`)
      }
    }

    // 过滤已存在的文件，只保留真正需要上传到数据库的新文件
    const newFilesOnly = uploadedFilePaths.filter(file => !file.id);
    console.log('过滤后的新文件列表:', newFilesOnly);

    // 更新uploadedFilePaths，只包含新文件
    uploadedFilePaths.splice(0, uploadedFilePaths.length, ...newFilesOnly);

    // 新增或编辑验收结论（编辑：优先使用结论ID；新增：返回新ID）
    let conclusionId = null
    
    // 检查是否是编辑模式
    if (selectedMeeting.value.conclusionId) {
      // 编辑模式，使用现有的conclusionId
      conclusionId = selectedMeeting.value.conclusionId
      console.log('编辑模式，使用现有conclusionId:', conclusionId)
      await updateTechnologicalAcceptanceConclusion({ ...payload, id: conclusionId })
    } else {
      // 新增模式，创建新结论并获取返回的ID
      console.log('新增模式，创建新结论')
      const res = await createTechnologicalAcceptanceConclusion(payload)
      console.log('创建结论返回结果:', res)
      
      // 处理返回结果，确保获取正确的ID
      if (res && res.id) {
        conclusionId = res.id
      } else if (typeof res === 'number' || (typeof res === 'string' && !isNaN(res))) {
        conclusionId = Number(res)
      } else {
        console.error('无法从创建结果中获取conclusionId:', res)
        throw new Error('无法获取新创建的结论ID')
      }
      
      console.log('获取到新conclusionId:', conclusionId)
    }

    // 绑定结论文件（只处理新上传的文件，已存在的文件保持不变）
    if (uploadedFilePaths.length > 0) {
      message.info(`正在关联 ${uploadedFilePaths.length} 个结论文件...`)
      try {
        // 确保conclusionId是正确的
        if (!conclusionId || isNaN(conclusionId)) {
          console.error('无效的conclusionId:', conclusionId)
          throw new Error('无效的结论ID')
        }
        
        const filePromises = uploadedFilePaths.map((f, index) => {
          console.log(`正在关联文件 ${index + 1}/${uploadedFilePaths.length}:`, f)
          console.log(`使用conclusionId:`, conclusionId)
          
          // 确保文件路径不为空
          if (!f.path) {
            console.error(`文件 ${f.name} 的路径为空`)
            throw new Error(`文件 ${f.name} 的路径为空`)
          }
          
          return createTechnologicalConclusionFile({
            conclusionId: Number(conclusionId), // 确保是数字类型
            fileName: f.name,
            filePath: f.path, // 使用path作为fileUrl
            fileUrl: f.path, // 明确设置fileUrl字段
            fileSize: f.size,
            fileSuffix: f.name.split('.').pop(), // 添加文件后缀
            sort: index + 1
          })
        })
        await Promise.all(filePromises)
        message.success(`成功关联 ${uploadedFilePaths.length} 个结论文件`)
      } catch (fileError) {
        console.error('关联结论文件失败:', fileError)
        message.error(`关联结论文件失败: ${fileError.message || '未知错误'}`)
      }
    }

    // 按 center.vue 的流程，同步更新项目状态：
    if (conclusionForm.value.conclusion === 'passed') {
      await approveProject(
        Number(selectedMeeting.value.projectId || selectedMeeting.value.id),
        conclusionForm.value.description,
        String(selectedMeeting.value.projectCode || selectedMeeting.value.projectNo || ''),
        String(selectedMeeting.value.projectName || ''),
        String(selectedMeeting.value.applicant || ''),
        String(selectedMeeting.value.applicantUnit || ''),
        Number(selectedMeeting.value.projectCycle || 12),
        Number(selectedMeeting.value.budget || 0)
      )
      message.success('立项通过，结论录入完成')
    } else if (conclusionForm.value.conclusion === 'conditional_passed') {
      await updateTechnologicalProject({
        id: Number(selectedMeeting.value.projectId || selectedMeeting.value.id),
        status: 6,
        reviewComments: conclusionForm.value.description,
        failedReason: conclusionForm.value.requirements || conclusionForm.value.description,
        projectNo: String(selectedMeeting.value.projectCode || selectedMeeting.value.projectNo || ''),
        projectName: String(selectedMeeting.value.projectName || ''),
        yearly: Number(selectedMeeting.value.yearly || new Date().getFullYear()),
        applicant: String(selectedMeeting.value.applicant || ''),
        applicantUnit: String(selectedMeeting.value.applicantUnit || ''),
        projectCycle: Number(selectedMeeting.value.projectCycle || 12),
        budget: Number(selectedMeeting.value.budget || 0)
      })
      message.success('有条件通过，已设置整改要求')
    } else {
      const failedReason = conclusionForm.value.description
      await rejectProject(
        Number(selectedMeeting.value.projectId || selectedMeeting.value.id),
        conclusionForm.value.description,
        failedReason,
        String(selectedMeeting.value.projectCode || selectedMeeting.value.projectNo || ''),
        String(selectedMeeting.value.projectName || ''),
        String(selectedMeeting.value.applicant || ''),
        String(selectedMeeting.value.applicantUnit || ''),
        Number(selectedMeeting.value.projectCycle || 12),
        Number(selectedMeeting.value.budget || 0)
      )
      message.warning('立项未通过，结论已录入')
    }

    // 更新会议状态为 3（已完成）
    try {
      await updateTechnologicalMeeting({ id: selectedMeeting.value.id, meetingStatus: 3 })
    } catch {}

    conclusionModalVisible.value = false
    await Promise.all([loadScheduledMeetings(), loadConclusions()])
  } catch (e) {
    message.error('提交失败，请稍后重试')
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

  if (!selectedEditMeeting.value) return

  try {
    // 准备更新会议的数据
    // 确保会议类型是数字格式（与API期望一致）
    let meetingType = editForm.value.type
    // 如果是字符串类型，转换为数字类型
    if (meetingType === 'offline') meetingType = 0
    else if (meetingType === 'online') meetingType = 1
    else if (meetingType === 'hybrid') meetingType = 2
    
    // 获取项目ID，如果不存在则使用0
    const projectId = selectedEditMeeting.value.projectId || 0
    
    const meetingData = {
      id: selectedEditMeeting.value.id,
      projectId: projectId,
      meetingNo: selectedEditMeeting.value.projectCode || '会议编号',
      meetingName: selectedEditMeeting.value.projectName || '会议名称',
      meetingTime: editForm.value.datetime ? dayjs(editForm.value.datetime).valueOf() : '',
      meetingPlace: editForm.value.location,
      meetingType: meetingType,
      meetingDescription: editForm.value.description,
      meetingInstructions: editForm.value.description
    }
    
    // 准备会议参与人数据
    const meetingParticipants = []
    // 添加主持人
    if (editForm.value.hosts && editForm.value.hosts.length > 0) {
      editForm.value.hosts.forEach(host => {
        meetingParticipants.push({
          meetingId: selectedEditMeeting.value.id,
          participantName: host,
          participantRole: '0' // 主持人角色
        })
      })
    }
    // 添加专家
    if (editForm.value.experts && editForm.value.experts.length > 0) {
      editForm.value.experts.forEach(expert => {
        meetingParticipants.push({
          meetingId: selectedEditMeeting.value.id,
          participantName: expert,
          participantRole: '1' // 专家角色
        })
      })
    }

    // 调用API更新会议信息
    console.log('正在更新会议信息，会议ID:', meetingData.id)
    console.log('会议数据:', meetingData)

    // 验证会议ID是否存在
    if (!meetingData.id) {
      // console.error('会议ID不存在，无法更新会议')
      // throw new Error('会议ID不存在，无法更新会议')
    }

    await updateTechnologicalMeeting(meetingData)
    
    // 更新会议参与人信息
    try {
      // 先删除原有参与人
      const participantsPage = await getTechnologicalMeetingParticipantPage({ pageNo: 1, pageSize: 100, meetingId: selectedEditMeeting.value.id })
      const participants = participantsPage?.list || []
      // 使用Promise.all并行删除参与人
      await Promise.all(participants.map(participant => 
        deleteTechnologicalMeetingParticipant(participant.id)
      ))
      
      // 使用Promise.all并行添加新的参与人
      await Promise.all(meetingParticipants.map(participant => 
        createTechnologicalMeetingParticipant(participant)
      ))
    } catch (error) {
      console.error('更新会议参与人失败:', error)
      // 不阻止主流程，只记录错误
    }
    
    // 更新会议资料信息
    try {
      // 先删除原有资料
      const materialsPage = await getTechnologicalMeetingMaterialPage({ pageNo: 1, pageSize: 100, meetingId: selectedEditMeeting.value.id })
      const materials = materialsPage?.list || []
      // 使用Promise.all并行删除资料
      await Promise.all(materials.map(material => 
        deleteTechnologicalMeetingMaterial(material.id)
      ))
      
      // 使用Promise.all并行添加新的资料
      await Promise.all((editForm.value.materials || []).map((material, i) => 
        createTechnologicalMeetingMaterial({
          meetingId: selectedEditMeeting.value.id,
          materialName: material.fileName || material.name,
          fileUrl: material.url,
          fileSize: material.fileSize || material.size,
          fileSuffix: material.name ? material.name.split('.').pop() : null,
          sort: i + 1
        })
      ))
    } catch (error) {
      console.error('更新会议资料失败:', error)
      // 不阻止主流程，只记录错误
    }
    
    // 更新本地数据
    selectedEditMeeting.value.meetingTime = meetingData.meetingTime
    selectedEditMeeting.value.meetingLocation = meetingData.meetingPlace
    selectedEditMeeting.value.meetingType = meetingData.meetingType
    selectedEditMeeting.value.meetingHosts = editForm.value.hosts
    selectedEditMeeting.value.meetingHost = editForm.value.hosts.join('、')
    selectedEditMeeting.value.experts = editForm.value.experts
    selectedEditMeeting.value.meetingMaterials = editForm.value.materials
    selectedEditMeeting.value.meetingDescription = editForm.value.description

    message.success('会议信息更新成功')
    editModalVisible.value = false
    // 刷新会议列表
    await loadScheduledMeetings()
  } catch (error) {
    console.error('更新会议失败:', error)
    message.error('更新会议信息失败，请稍后重试')
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

const handleMeetingDetailCancel = () => {
  meetingDetailVisible.value = false
}

const handleConclusionDetailCancel = () => {
  conclusionDetailVisible.value = false
}

// 生命周期
onMounted(() => {
  // 初始化数据
  refreshData()
  // 加载主持人/专家选项
  loadUserOptions()
   // 获取项目统计数据
  fetchProjectStats()
})

// 刷新当前标签数据
const refreshData = async () => {
  try {
    loading.value = true
    if (activeTab.value === 'schedule') {
      await loadPendingProjects()
    } else if (activeTab.value === 'scheduled') {
      await loadScheduledMeetings()
    } else if (activeTab.value === 'conclusion') {
      await loadConclusions()
    } else {
      await Promise.all([loadPendingProjects(), loadScheduledMeetings(), loadConclusions()])
    }
  } finally {
    loading.value = false
  }
}

// 已安排会议分页处理函数
const handleMeetingPageChange = (page, pageSize) => {
  meetingPager.value.pageNo = page
  meetingPager.value.pageSize = pageSize
  loadScheduledMeetings()
}

const handleMeetingPageSizeChange = (current, size) => {
  meetingPager.value.pageNo = current
  meetingPager.value.pageSize = size
  loadScheduledMeetings()
}

// 结论管理分页处理函数
const handleConclusionPageChange = (page, pageSize) => {
  conclusionPager.value.pageNo = page
  conclusionPager.value.pageSize = pageSize
  loadConclusions()
}

const handleConclusionPageSizeChange = (current, size) => {
  conclusionPager.value.pageNo = current
  conclusionPager.value.pageSize = size
  loadConclusions()
}

// 会议安排分页处理函数
const handleProjectPageChange = (page, pageSize) => {
  projectPager.value.pageNo = page
  projectPager.value.pageSize = pageSize
  loadPendingProjects()
}

const handleProjectPageSizeChange = (current, size) => {
  projectPager.value.pageNo = current
  projectPager.value.pageSize = size
  loadPendingProjects()
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 加载：待安排项目（会议待组织）
const loadPendingProjects = async () => {
  try {
    const page = await getTechnologicalProjectPage({
      pageNo: projectPager.value.pageNo,
      pageSize: projectPager.value.pageSize,
      status: 3,
      projectName: filters.value.keyword || undefined
    })
    projectPager.value.total = page?.total || 0
    pendingScheduleList.value = (page?.list || []).map((p) => ({
      id: p.id,
      projectName: p.projectName,
      projectCode: p.projectNo,
      projectLeader: p.applicant,
      projectDuration: `${p.projectCycle}个月`,
      projectBudget: p.budget,
      materialStatus: 'pending',
      submitTime: formatTimestamp(p.createTime),
      requiredMaterials: 0,
      totalRequired: 0,
      optionalMaterials: 0
    }))
    // 加载每个项目的材料审核统计
    await Promise.all(
      pendingScheduleList.value.map(async (proj) => {
        try {
          const materialsPage = await getTechnologicalProjectMaterialPage({ pageNo: 1, pageSize: 100, projectId: proj.id })
          const materials = materialsPage?.list || []
          const requiredList = materials.filter((m) => Number(m.isRequired) === 1)
          const optionalList = materials.filter((m) => Number(m.isRequired) === 0)
          const requiredPassed = requiredList.filter((m) => Number(m.reviewStatus) === 1)
          const requiredRejected = requiredList.filter((m) => Number(m.reviewStatus) === 2)

          proj.totalRequired = requiredList.length
          proj.requiredMaterials = requiredPassed.length
          proj.optionalMaterials = optionalList.length

          if (requiredRejected.length > 0) {
            proj.materialStatus = 'rejected'
          } else if (requiredPassed.length === requiredList.length && requiredList.length > 0) {
            proj.materialStatus = 'approved'
          } else {
            proj.materialStatus = 'pending'
          }
        } catch (e) {
          // 忽略单个项目材料统计失败
        }
      })
    )
  } catch (e) {
    message.error('加载待安排项目失败')
  }
}

// 加载：已安排/进行中会议
const loadScheduledMeetings = async () => {
  try {
    // 获取所有数据（分批获取）
    let allList = []
    let currentPage = 1
    let totalPages = 1
    
    do {
      const pageData = await getTechnologicalMeetingPage({
        meetingStatus: 1,
        pageNo: currentPage,
        pageSize: 100 // 使用最大允许的每页条数
      })
      
      allList = [...allList, ...(pageData?.list || [])]
      totalPages = Math.ceil((pageData?.total || 0) / 100)
      currentPage++
    } while (currentPage <= totalPages)
    
    // 前端筛选
    let filteredList = allList || []
    if (filters.value.keyword) {
      filteredList = filteredList.filter(item => 
        (item.projectName && item.projectName.includes(filters.value.keyword)) ||
        (item.meetingName && item.meetingName.includes(filters.value.keyword))
      )
    }
    
    // 前端分页
    meetingPager.value.total = filteredList.length
    const startIndex = (meetingPager.value.pageNo - 1) * meetingPager.value.pageSize
    const endIndex = startIndex + meetingPager.value.pageSize
    const pageList = filteredList.slice(startIndex, endIndex)
    
    const baseList = pageList.map((m) => ({
      id: m.id,
      projectId: m.projectId,
      // 尝试从项目详情补齐项目信息
      projectName: m.projectName || m.meetingName || '立项会议',
      projectCode: m.meetingNo || '',
      meetingTime: m.meetingTime || m.startTime,
      meetingLocation: m.meetingPlace,
      meetingType: m.meetingType, 
      meetingHost: '',
      meetingHosts: [],
      meetingStatus: normalizeMeetingStatus(m.status || m.meetingStatus || 1),
      experts: m.experts || [],
      meetingMaterials: m.meetingMaterials || [],
      meetingDescription: m.meetingDescription || m.meetingInstructions,
      notifyLoading: false,
      lastNotifyTime: null
    }))
    // 并行加载参与人与资料
    await Promise.all(
      baseList.map(async (item) => {
        console.log(item)
        try {
          const [participantsRes, materialsRes] = await Promise.all([
            getTechnologicalMeetingParticipantPage({ pageNo: 1, pageSize: 100, meetingId: item.id }),
            getTechnologicalMeetingMaterialPage({ pageNo: 1, pageSize: 100, meetingId: item.id })
          ])
          const participants = participantsRes?.list || []
          console.log(participants)
          const hosts = participants
            .filter((p) => p.participantRole === 0 || (typeof p.participantRole === 'string' && p.participantRole.toUpperCase().includes('HOST')))
            .map((p) => p.participantName)
          const experts = participants
            .filter((p) => p.participantRole === 1 || (typeof p.participantRole === 'string' && p.participantRole.toUpperCase().includes('EXPERT')))
            .map((p) => p.participantName)
          item.meetingHosts = hosts
          item.meetingHost = hosts.join('、')
          item.experts = experts

          const materials = materialsRes?.list || []
          item.meetingMaterials = materials.map((mm) => ({ name: mm.materialName, url: mm.fileUrl ,size:mm.fileSize}))
          // 如果后端会议信息未包含项目名，尝试从项目详情补齐
          if (!item.projectName && item.projectId) {
            try {
              const proj = await getTechnologicalProject(item.projectId)
              const p = proj?.data || proj
              if (p) {
                item.projectName = p.projectName
                item.projectCode = p.projectNo
                console.log(item)
              }
            } catch {}
          }
        } catch (e) {
          // 忽略单条加载失败
        }
      })
    )
    // 显示已安排和进行中的会议（meetingStatus 正常化为 'scheduled' 对应后端 1/4，'in_progress' 对应后端 2/5）
    scheduledMeetingList.value = baseList.filter((m) => m.meetingStatus === 'scheduled' || m.meetingStatus === 'in_progress')
    console.log(scheduledMeetingList.value)
  } catch (e) {
    message.error('加载会议列表失败')
  }
}

// 加载：结论列表
const loadConclusions = async () => {
  console.log('开始加载结论列表')
  try {
    // 获取所有数据（分批获取）
    let allList = []
    let currentPage = 1
    let totalPages = 1
    let hasMoreData = true
    
    while (hasMoreData) {
      try {
        const pageData = await getTechnologicalAcceptanceConclusionPage({
          pageNo: currentPage,
          pageSize: 100, // 使用最大允许的每页条数
          projectName: filters.value.keyword || undefined // 传递项目名称筛选条件
        })
        
        if (pageData && pageData.list && pageData.list.length > 0) {
          allList = [...allList, ...pageData.list]
          totalPages = Math.ceil((pageData.total || 0) / 100)
          currentPage++
          
          // 如果当前页超过了总页数，停止获取
          if (currentPage > totalPages) {
            hasMoreData = false
          }
        } else {
          // 没有数据了，停止获取
          hasMoreData = false
        }
      } catch (error) {
        console.error("获取结论数据失败:", error)
        hasMoreData = false
      }
    }
    
    // 前端筛选
    let filteredList = allList || []
    if (filters.value.keyword) {
      filteredList = filteredList.filter(item => 
        (item.projectName && item.projectName.includes(filters.value.keyword))
      )
    }
    
    // 前端分页
    conclusionPager.value.total = filteredList.length
    const startIndex = (conclusionPager.value.pageNo - 1) * conclusionPager.value.pageSize
    const endIndex = startIndex + conclusionPager.value.pageSize
    const pageList = filteredList.slice(startIndex, endIndex)
    
    // 创建结论列表对象，但不立即处理会议时间
    // console.log('处理结论列表数据，原始数据:', pageList)
    const tempConclusionList = pageList.map((c) => {
      // console.log(`处理结论 ${c.id}，原始文件数据:`, c.conclusionFiles)
      return {
        id: c.id,
        projectId: c.projectId,
        meetingId: c.meetingId, // 保存会议ID
        projectName: c.projectName || '',
        projectCode: c.projectNo || '',
        meetingTime: c.meetingTime, // 保留原始值，在显示时再格式化
        meetingTimeFormatted: formatDisplayTime(c.meetingTime), // 添加格式化后的字段
        conclusionTime: formatDisplayTime(c.createTime),
        conclusion: c.conclusionResult === 0 ? 'passed' : c.conclusionResult === 1 ? 'conditional_passed' : 'failed',
        score: c.conclusionScore || 0,
        conclusionDescription: c.conclusionDescription,
        requirements: c.requirements || '',
        conclusionFiles: (c.conclusionFiles || []).map((f) => ({ name: f.fileName || f.name, url: f.filePath || f.url }))
      }
    })
    console.log('处理后的结论列表数据:', tempConclusionList)
    
    // 为每个结论获取会议时间信息
    // console.log('开始处理结论列表的会议时间，共', tempConclusionList.length, '条记录')
    conclusionList.value = await Promise.all(
      tempConclusionList.map(async (item) => {
        // console.log(`处理结论 ${item.id}, 会议ID: ${item.meetingId}, 原始会议时间: ${item.meetingTime}`)
        
        // 如果有会议ID且会议时间为空，尝试从会议表中获取
        if (item.meetingId && !item.meetingTime) {
          try {
            // console.log(`正在为结论 ${item.id} 获取会议信息，会议ID: ${item.meetingId}`)
            const meeting = await getTechnologicalMeeting(item.meetingId)
            // console.log(`结论 ${item.id} 获取到的会议信息:`, meeting)
            const m = (meeting && (meeting.data || meeting)) || {}
            item.meetingTime = m.meetingTime || m.startTime
            item.meetingTimeFormatted = formatDisplayTime(m.meetingTime || m.startTime)
            // console.log(`结论 ${item.id} 设置后的会议时间:`, item.meetingTime)
            // console.log(`结论 ${item.id} 格式化后的会议时间:`, item.meetingTimeFormatted)
          } catch (e) {
            console.error(`获取结论 ${item.id} 的会议时间失败:`, e)
          }
        } else if (!item.meetingId) {
          console.log(`结论 ${item.id} 没有关联的会议ID`)
        } else {
          console.log(`结论 ${item.id} 已有会议时间，无需获取`)
        }
        return item
      })
    )
    console.log('结论列表处理完成')

    // 按需补齐项目名称与编号等（当列表缺失时）
    const needSupplement = conclusionList.value.filter((x) => !x.projectName || !x.projectCode)
    if (needSupplement.length > 0) {
      await Promise.all(
        needSupplement.map(async (x) => {
          if (!x.projectId) return
          try {
            const proj = await getTechnologicalProject(x.projectId)
            const p = (proj && (proj.data || proj)) || {}
            x.projectName = p.projectName || x.projectName
            x.projectCode = p.projectNo || x.projectCode
            // 额外补齐在详情中会用到的字段
            x.yearly = p.yearly
            x.applicant = p.applicant
            x.applicantUnit = p.applicantUnit
            x.projectCycle = p.projectCycle
            x.budget = p.budget
          } catch {}
        })
      )
    }
  } catch (e) {
    message.error('加载结论列表失败')
  }
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

/* 文件列表样式 */
.file-list {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.file-item-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.file-item-detail:hover {
  background-color: #fafafa;
}

.file-item-detail:last-child {
  border-bottom: none;
}

.file-info {
  flex: 1;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 8px;
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