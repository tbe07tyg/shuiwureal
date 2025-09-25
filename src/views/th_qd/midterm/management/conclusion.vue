  <!--
  * @file 会议结论管理页面 - 管理角色
  * @description 管理角色组织中期会议和录入中期结论
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
          <p class="page-description">查看和管理中期会议的结论信息</p>
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
                <div class="stat-label">已完成中期</div>
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
                      <span v-if="item.totalRequired > 0" class="summary-item">
                        <!-- 必需材料：{{ item.requiredMaterials }}/{{ item.totalRequired }} 已通过 -->
                        必需材料：{{ item.totalRequired }} 个已提交
                      </span>
                      <span v-if="item.optionalMaterials > 0" class="summary-item">
                        可选材料：{{ item.optionalMaterials }} 个已提交
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
            <div class="pagination-container" v-if="projectPager && projectPager.total > 0">
              <a-pagination
                v-model:current="projectPager.pageNo"
                v-model:pageSize="projectPager.pageSize"
                :total="projectPager.total"
                :show-size-changer="true"
                :show-total="total => `共 ${total} 条`"
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
                      <span class="meeting-time">会议时间：{{ dayjs(item.meetingTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
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
                      <a-descriptions-item label="会议说明" :span="item.meetingMaterials && item.meetingMaterials.length > 0 ? 2 : 1">
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
                    <a-button type="link" @click="showMeetingDetail(item)">
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
            <div class="pagination-container" v-if="meetingPager && meetingPager.total > 0">
              <a-pagination
                v-model:current="meetingPager.pageNo"
                v-model:pageSize="meetingPager.pageSize"
                :total="meetingPager.total"
                :show-size-changer="true"
                :show-total="total => `共 ${total} 条`"
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
                      <span class="meeting-time">会议时间：{{ item.meetingTime || '未设置' }}</span>
                      <span class="meeting-location">会议地点：{{ item.meetingPlace || '未设置' }}</span>
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
                      <div class="section-title">验收结论如下</div>
                      <div class="section-content">
                        <div class="conclusion-result">
                          <span class="result-label">验收状态：</span>
                          <span class="result-value">{{ getConclusionText(item.conclusion) }}</span>
                        </div>
                        <div class="conclusion-result">
                          <span class="result-label">评分：</span>
                          <span class="result-value">{{ item.score }}</span>
                        </div>
                        <span class="result-label">结论：</span>
                        <div class="conclusion-description">{{ item.conclusionDescription }}</div>
                      </div>
                    </div>

                    <!-- <div v-if="item.requirements" class="conclusion-section">
                      <div class="section-title">整改要求</div>
                      <div class="section-content">{{ item.requirements }}</div>
                    </div> -->

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
                    <!-- <a-button @click="exportConclusionReport(item)">
                      <ExportOutlined />
                      导出结论
                    </a-button> -->
                    <a-button type="link" @click="showConclusionDetail(item)">
                      查看详情
                    </a-button>
                    <a-button
                      type="link"
                      danger
                      @click="deleteConclusion(item)"
                    >
                      删除
                    </a-button>
                  </a-space>
                </div>
              </div>
            </div>
            
            <!-- 分页组件 -->
            <div class="pagination-container" v-if="conclusionPager && conclusionPager.total > 0">
              <a-pagination
                v-model:current="conclusionPager.pageNo"
                v-model:pageSize="conclusionPager.pageSize"
                :total="conclusionPager.total"
                :show-size-changer="true"
                :show-total="total => `共 ${total} 条`"
                @change="handleConclusionPageChange"
                @showSizeChange="handleConclusionPageSizeChange"
              />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 安排会议弹窗 -->
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
                <div v-if="scheduleForm.materials.length > 0" class="materials-list">
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
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
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
                {{ dayjs(selectedMeeting.meetingTime).format('YYYY-MM-DD HH:mm:ss') }}
              </a-descriptions-item>
              <a-descriptions-item label="会议地点">
                {{ selectedMeeting.meetingPlace }}
              </a-descriptions-item>
              <a-descriptions-item label="会议形式" v-if="selectedMeeting.meetingType">
                {{ selectedMeeting.meetingType === 'offline' ? '现场会议' : selectedMeeting.meetingType === 'online' ? '线上会议' : '混合会议' }}
              </a-descriptions-item>
              <a-descriptions-item label="会议说明" :span="selectedMeeting.meetingType ? 1 : 2" v-if="selectedMeeting.meetingDescription">
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
                  :before-upload="beforeUploadConclusionFile"
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
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
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

      <!-- 模拟验收材料列表 -->
          <div class="detail-section">
            <h4><FileOutlined /> 验收材料</h4>
            <div class="material-list">
              <div
                v-for="material in selectedProject.materials"
                :key="material.id"
                class="material-item-detail"
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
                  <a-button type="link" size="small" @click="previewProjectMaterial(material)">
                    <EyeOutlined />
                    预览
                  </a-button>
                  <a-button type="link" size="small" @click="downloadProjectMaterial(material)">
                    <DownloadOutlined />
                    下载
                  </a-button>
                </div>
              </div>
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
              <a-descriptions-item label="会议时间">{{ dayjs(selectedMeetingForNotify.meetingTime).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
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

      <!-- 文件预览弹窗 -->
      <FilePreview
        v-model:visible="filePreviewVisible"
        :file-info="previewFileInfo"
        :file-list="previewFileList"
        :current-file-index="previewCurrentIndex"
        @file-change="handleFileChange"
        @download="handleDownloadFile"
      />
      
      <!-- 会议详情弹窗 -->
      <MeetingDetail
        v-model:visible="meetingDetailModalVisible"
        :meeting-detail-data="meetingDetailData"
        :loading="loading"
        @cancel="handleMeetingDetailCancel"
        @preview="previewMeetingMaterial"
      />

      <!-- 结论详情弹窗 -->
      <a-modal
        v-model:open="conclusionDetailModalVisible"
        title="结论详情"
        width="800px"
        :footer="null"
        @cancel="handleConclusionDetailCancel"
      >
        <div v-if="conclusionDetailData" class="conclusion-detail-container">
          <a-spin :spinning="loadingConclusionDetail">
            <!-- 项目基本信息 -->
            <div class="detail-section">
              <h3 class="section-title">项目基本信息</h3>
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="项目名称">{{ conclusionDetailData.projectName || '未设置' }}</a-descriptions-item>
                <a-descriptions-item label="项目编号">{{ conclusionDetailData.projectCode || '未设置' }}</a-descriptions-item>
                <a-descriptions-item label="项目负责人">{{ conclusionDetailData.projectInfo?.projectLeader || '未设置' }}</a-descriptions-item>
                <a-descriptions-item label="项目周期">{{ conclusionDetailData.projectInfo?.projectCycle || '未设置' }}个月</a-descriptions-item>
                <a-descriptions-item label="项目预算">{{ conclusionDetailData.projectInfo?.budget || '未设置' }}万元</a-descriptions-item>
                <a-descriptions-item label="申请时间">{{ formatTimestamp(conclusionDetailData.applicationInfo?.createTime) }}</a-descriptions-item>
              </a-descriptions>
            </div>

            <!-- 会议信息 -->
            <div class="detail-section" v-if="conclusionDetailData.meetingId">
              <h3 class="section-title">会议信息</h3>
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="会议时间">{{ conclusionDetailData.meetingTime || '未设置' }}</a-descriptions-item>
                <a-descriptions-item label="会议地点">{{ conclusionDetailData.meetingPlace || '未设置' }}</a-descriptions-item>
                <a-descriptions-item label="会议形式">{{ getMeetingTypeText(conclusionDetailData.meetingInfo?.meetingType) }}</a-descriptions-item>
                <!-- <a-descriptions-item label="会议状态">{{ getMeetingStatusText(conclusionDetailData.meetingInfo?.meetingStatus) || '已完成' }}</a-descriptions-item> -->
                <a-descriptions-item label="会议状态"> 已完成</a-descriptions-item>
                <a-descriptions-item label="主持人" :span="2">
                  <span v-if="conclusionDetailData.meetingInfo?.hosts && conclusionDetailData.meetingInfo.hosts.length > 0">
                    <a-tag
                      v-for="host in conclusionDetailData.meetingInfo.hosts"
                      :key="host"
                      color="blue"
                      style="margin-right: 4px;"
                    >
                      {{ host }}
                    </a-tag>
                  </span>
                  <span v-else>未设置</span>
                </a-descriptions-item>
                <a-descriptions-item label="参会专家" :span="2">
                  <span v-if="conclusionDetailData.meetingInfo?.experts && conclusionDetailData.meetingInfo.experts.length > 0">
                    <a-tag
                      v-for="expert in conclusionDetailData.meetingInfo.experts"
                      :key="expert"
                      color="green"
                      style="margin-right: 4px;"
                    >
                      {{ expert }}
                    </a-tag>
                  </span>
                  <span v-else>未设置</span>
                </a-descriptions-item>
                <a-descriptions-item label="会议说明" :span="2">{{ conclusionDetailData.meetingInfo?.meetingInstructions || '无' }}</a-descriptions-item>
              </a-descriptions>
            </div>

            <!-- 结论信息 -->
            <div class="detail-section">
              <h3 class="section-title">结论信息</h3>
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="结论时间">{{ conclusionDetailData.conclusionTime || '未设置' }}</a-descriptions-item>
                <a-descriptions-item label="验收结果">
                  <a-tag :color="getConclusionColor(conclusionDetailData.conclusion)">
                    {{ getConclusionText(conclusionDetailData.conclusion) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="评分">{{ conclusionDetailData.score || '未评分' }}</a-descriptions-item>
                <a-descriptions-item label="结论描述">{{ conclusionDetailData.conclusionDescription || '无' }}</a-descriptions-item>
              </a-descriptions>

              <!-- 结论相关文件 -->
              <div class="detail-section">
                <h4><FileTextOutlined /> 结论相关文件</h4>
                <div v-if="conclusionDetailData.conclusionFiles && conclusionDetailData.conclusionFiles.length > 0" class="material-list">
                  <div
                    v-for="(file, index) in conclusionDetailData.conclusionFiles"
                    :key="file.id || index"
                    class="material-item"
                  >
                    <div class="material-info">
                      <div class="material-name">
                        <FileOutlined />
                        {{ file.fileName || file.name || '未命名文件' }}
                      </div>
                      <div class="material-meta">
                        <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                      </div>
                    </div>
                    <div class="material-actions">
                      <a-button type="link" size="small" @click="previewConclusionFile(file)">
                        <EyeOutlined />
                        预览
                      </a-button>
                      <a-button type="link" size="small" @click="downloadConclusionFile(file)">
                        <DownloadOutlined />
                        下载
                      </a-button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-files">
                  <a-empty description="暂无结论相关文件" />
                </div>
              </div>
            </div>
          </a-spin>
        </div>
      </a-modal>
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
    ReloadOutlined,
    EyeOutlined,
    DownloadOutlined
  } from '@ant-design/icons-vue'
  import { message, Modal } from 'ant-design-vue'
  // 导入PageContainer组件
  import { ContentWrap } from '@/components/ContentWrap'
  import FilePreview from '@/components/th_qd/FilePreview.vue'
  import MeetingDetail from './meeting-detail.vue'
  import { uploadTechnologicalFile } from '@/api/upload'



  import {
    thQdMidPage,
    thQdMidDetail,
    thQdMidUpdate,
    getTechnologicalProject,
    thQdMidMaterialPage,
    thQdMidMaterialDetail,
    thQdMidMaterialUpdate,
    thQdMidMaterialReviewUpdate,
    thQdMidMaterialReviewCreate,
    thQdMidStatistics
  } from '@/api/th_qd/mid/add'

  import{
    createMidtermMeeting,
    updateMidtermMeeting,
    deleteMidtermMeeting,
    // getMidtermRectificationPage,
    getMidtermMeetingDetail,
    getMidtermMeetingPage,
    getMidtermMeetingParticipantPage,
    getMidtermMeetingMaterialPage,
    createMidtermConclusion,
    getMidtermConclusionPage,
    getMidtermConclusion,
    deleteMidtermConclusion,
    updateMidtermConclusion,
    createMidtermConclusionFile,
    getMidtermConclusionFilePage,
    deleteMidtermConclusionFile,
    updateMidtermConclusionFile
  } from '@/api/th_qd/mid/meet'

  import { getUserPage, getSimpleUserList } from '@/api/system/user'

  // 从结论描述中提取评分
  const extractScoreFromDescription = (description) => {
    if (!description) return null
    
    // 尝试匹配"评分：xxx"的格式
    const scoreMatch = description.match(/评分[：:](\d+)/)
    if (scoreMatch) {
      return scoreMatch[1]
    }
    
    // 尝试匹配"xxx分"的格式
    const scoreMatch2 = description.match(/(\d+)分/)
    if (scoreMatch2) {
      return scoreMatch2[1]
    }
    
    // 尝试匹配纯数字
    const scoreMatch3 = description.match(/\b(\d+)\b/)
    if (scoreMatch3) {
      return scoreMatch3[1]
    }
    
    return null
  }

  // 统计数据
  const stats = ref({
    pendingSchedule: 5,
    scheduled: 8,
    completed: 12,
    pendingConclusion: 3
  })

  // 筛选条件
  const filters = ref({
    status: undefined,
    meetingDateRange: undefined,
    keyword: ''
  })

  // 活动标签页
  const activeTab = ref('schedule')


  // 待安排会议列表
  const pendingScheduleList = ref([
  ])

  // 已安排会议列表
  const scheduledMeetingList = ref([])

  // 结论列表
  const conclusionList = ref([])


  // 加载与分页/状态
  const loading = ref(false)
  const projectPager = ref({ pageNo: 1, pageSize: 5, total: 0 })
  const meetingPager = ref({ pageNo: 1, pageSize: 5, total: 0 })
  const conclusionPager = ref({ pageNo: 1, pageSize: 5, total: 0 })




  // 用户列表
  const userList = ref([])

  // 会议详情数据
  const meetingDetailData = ref({})

  // 会议详情弹窗可见性
  const meetingDetailModalVisible = ref(false)

  // 结论详情数据
  const conclusionDetailData = ref({})

  // 结论详情弹窗可见性
  const conclusionDetailModalVisible = ref(false)

  // 选中的结论
  const selectedConclusion = ref({})

  // 结论详情加载状态
  const loadingConclusionDetail = ref(false)

  // 获取用户列表
  const getUserList = async () => {
    try {
      const res = await getSimpleUserList()
      userList.value = res || []
    } catch (error) {
      console.error('获取用户列表失败', error)
      message.error('获取用户列表失败')
    }
  }

  // 主持人列表 - 从用户列表中筛选
  const hostList = computed(() => {
    return userList.value.map(user => ({
      id: user.id,
      name: user.nickname || user.username,
      title: '主持人'
    }))
  })

  // 专家列表 - 从用户列表中筛选
  const expertList = computed(() => {
    return userList.value.map(user => ({
      id: user.id,
      name: user.nickname || user.username,
      title: '专家'
    }))
  })

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

  // 文件预览相关
  const previewVisible = ref(false)
  const currentPreviewFile = ref({})
  const fileList = ref([])
  const currentFileIndex = ref(0)

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




  // 计算属性 - 转换为选项格式
  const hostOptions = computed(() => {
    return hostList.value.map(host => ({
      label: `${host.name} - ${host.title}`,
      value: `${host.name} - ${host.title}`
    }))
  })

  const expertOptions = computed(() => {
    return expertList.value.map(expert => ({
      label: `${expert.name} - ${expert.title}`,
      value: `${expert.name} - ${expert.title}`
    }))
  })

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
          sort:  scheduleForm.value.materials.length + 1, // 按添加顺序排序
          uploadResponse // 保存完整的上传响应数据以备后用
        }

        scheduleForm.value.materials.push(fileWithUrl)
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







  //   try {
  //     // 上传文件并获取URL
  //     const res = await uploadTechnologicalFile(file)
      
  //     if (res && res.fileUrl) {
  //       // 构建包含完整上传信息的文件对象
  //       const fileWithUrl = {
  //         ...file,
  //         url: res.fileUrl,
  //         fileUrl: res.fileUrl, // 确保fileUrl字段被正确设置
  //         uploaded: true,
  //         uploadTime: new Date().toISOString(),
  //         fileName: res.fileName || file.name,
  //         fileSize: res.fileSize || file.size,
  //         fileType: res.fileType || file.type,
  //         fileSuffix: file.name.split('.').pop(),
  //         materialName: file.name,
  //         materialSource: 1
  //       }
        
  //       // 将处理后的文件添加到材料列表
  //       scheduleForm.value.materials.push(fileWithUrl)
  //       message.success(`文件 ${file.name} 上传成功`)
  //     } else {
  //       message.error('文件上传失败，请重试')
  //     }
  //   } catch (error) {
  //     console.error('文件上传错误:', error)
  //     message.error('文件上传失败，请重试')
  //   }
    
  //   return false // 阻止自动上传
  // }

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
      // 实际上传文件到服务器
      const uploadResponse = await uploadTechnologicalFile(file)
      
      if (uploadResponse && uploadResponse.fileUrl) {
        // 上传成功，添加文件信息到列表，确保包含 fileUrl 字段
        const fileWithUrl = {
          ...file,
          url: uploadResponse.fileUrl || '',
          fileUrl: uploadResponse.fileUrl || '', // 确保 fileUrl 字段被设置
          name: uploadResponse.fileName || file.name, // 确保设置 name 属性用于显示
          size: uploadResponse.fileSize || file.size, // 确保设置 size 属性用于显示
          fileName: uploadResponse.fileName || file.name,
          fileSize: uploadResponse.fileSize || file.size,
          fileSuffix: uploadResponse.fileSuffix || (file.name ? file.name.split('.').pop() : null) || null
        }
        
        editForm.value.materials.push(fileWithUrl)
        message.success(`文件 ${file.name} 上传成功`)
      } else {
        message.error(`文件 ${file.name} 上传失败`)
      }
    } catch (uploadError) {
      console.error('文件上传失败:', uploadError)
      message.error(`文件上传失败: ${uploadError.message || '未知错误'}`)
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
      // 实际上传文件
      console.log('开始上传文件:', file)
      // 确保传递的是原始的 File 对象
      const originalFile = file.raw || file
      const uploadRes = await uploadTechnologicalFile(originalFile)
      console.log('文件上传响应:', uploadRes)
      const fileUrl = uploadRes?.fileUrl || uploadRes?.data?.fileUrl
      console.log('提取的文件URL:', fileUrl)
      
      if (fileUrl) {
        // 构建包含完整上传信息的文件对象
        const fileWithInfo = {
          uid: file.uid, // 保留原始UID用于删除操作
          name: file.name,
          size: file.size,
          type: file.name.split('.').pop()?.toLowerCase() || '',
          url: fileUrl,
          status: 'done', // 标记为已上传
          response: uploadRes,
          raw: file // 保留原始的 File 对象
        }
        
        // 添加到表单文件列表
        conclusionForm.value.conclusionFiles.push(fileWithInfo)
        message.success(`文件 ${file.name} 上传成功`)
        return false // 阻止默认上传行为
      } else {
        message.error('文件上传失败，请重试')
        return false
      }
    } catch (error) {
      console.error('文件上传错误:', error)
      message.error('文件上传失败，请重试')
      return false
    }
    message.success(`文件 ${file.name} 添加成功`)
    
    return false
  }

  const removeConclusionFile = async (file) => {
    // 如果文件有ID，说明是已存在的文件，需要从后端删除
    if (file.id) {
      try {
        await deleteMidtermConclusionFile(file.id)
        console.log('已从后端删除文件:', file.id)
      } catch (error) {
        console.error('删除后端文件失败:', error)
        message.error('删除文件失败，请重试')
        return
      }
    }
    
    // 从前端列表中移除文件
    const index = conclusionForm.value.conclusionFiles.findIndex(item => item.uid === file.uid)
    if (index > -1) {
      conclusionForm.value.conclusionFiles.splice(index, 1)
      message.success('文件删除成功')
    }
  }

  const removeConclusionFileByIndex = async (index) => {
    const file = conclusionForm.value.conclusionFiles[index]
    
    // 如果文件有ID，说明是已存在的文件，需要从后端删除
    if (file && file.id) {
      try {
        await deleteMidtermConclusionFile(file.id)
        console.log('已从后端删除文件:', file.id)
      } catch (error) {
        console.error('删除后端文件失败:', error)
        message.error('删除文件失败，请重试')
        return
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

  // const getMeetingTypeText = (type) => {
  //   const textMap = {
  //     offline: '现场会议',
  //     online: '线上会议',
  //     hybrid: '混合会议'
  //   }
  //   return textMap[type] || '未知'
  // }

  // const getMeetingTypeColor = (type) => {
  //   const colorMap = {
  //     offline: 'blue',
  //     online: 'green',
  //     hybrid: 'orange'
  //   }
  //   return colorMap[type] || 'default'
  // }

  // const getConclusionColor = (conclusion) => {
  //   const colorMap = {
  //     passed: 'green',
  //     conditional_passed: 'orange',
  //     failed: 'red'
  //   }
  //   return colorMap[conclusion] || 'default'
  // }

  // const getConclusionText = (conclusion) => {
  //   const textMap = {
  //     passed: '验收通过',
  //     conditional_passed: '有条件通过',
  //     failed: '验收不通过'
  //   }
  //   return textMap[conclusion] || '未知'
  // }


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
  const scheduleBatchMeeting = () => {
    if (pendingScheduleList.value.length === 0) {
      message.warning('暂无待安排会议的项目')
      return
    }
    
    message.info(`开始批量安排会议，共 ${pendingScheduleList.value.length} 个项目`)
    
    // 实际项目中可以打开批量安排弹窗
    // batchScheduleModalVisible.value = true
  }

















  const handleFilter = () => {
    // 获取搜索关键词
    const keyword = filters.value.keyword.trim().toLowerCase()
    
    // 如果关键词为空，则显示所有数据
    if (!keyword) {
      // 重新加载数据以显示完整列表
      refreshData()
      return
    }
    
    // 根据当前活动的标签页对已有数据进行筛选
    if (activeTab.value === 'schedule') {
      // 对待安排项目列表进行筛选
      const filteredProjects = pendingScheduleList.value.filter(project => 
        project.projectName && project.projectName.toLowerCase().includes(keyword)
      )
      pendingScheduleList.value = filteredProjects
    } else if (activeTab.value === 'scheduled') {
      // 对已安排会议列表进行筛选
      const filteredMeetings = scheduledMeetingList.value.filter(meeting => 
        meeting.projectName && meeting.projectName.toLowerCase().includes(keyword)
      )
      scheduledMeetingList.value = filteredMeetings
    } else if (activeTab.value === 'conclusion') {
      // 对结论列表进行筛选
      const filteredConclusions = conclusionList.value.filter(conclusion => 
        conclusion.projectName && conclusion.projectName.toLowerCase().includes(keyword)
      )
      conclusionList.value = filteredConclusions
    }
  }

  const resetFilters = () => {
    filters.value = {
      status: undefined,
      meetingDateRange: undefined,
      keyword: ''
    }
    // 重置后重新加载数据以显示完整列表
    refreshData()
  }

  const handleTabChange = async(key) => {
    activeTab.value = key
    await refreshData()
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

  const viewProjectDetail = async(item) => {
    // 显示项目详情，包括验收材料的预览和下载
    // 显示项目详情，包括验收材料的预览和下载（真实数据）
    selectedProject.value = {
      ...item,
      materials: [],
      materialsLoading: true
      }
    detailModalVisible.value = true

    try {
      const materialsPage = await thQdMidMaterialPage({ pageNo: 1, pageSize: 100, midtermApplicationId: item.id })
      const materials = materialsPage?.list || []
      selectedProject.value.materials = materials.map((m) => ({
        id: m.id,
        midtermApplicationId: m.midtermApplicationId,
        materialName: m.materialName,
        type: Number(m.materialCategory) === 1 ? '中期报告' : Number(m.materialCategory) === 2 ? '技术方案' : Number(m.materialCategory) === 3 ? '实施计划' : '调研报告',
        isRequired: Number(m.isRequired),
        reviewStatus: m.reviewStatus === 1 ? 'approved' : m.reviewStatus === 2 ? 'rejected' : 'pending',
        fileUrl: m.fileUrl,
        fileSize: m.fileSize,
        fileSuffix: m.fileSuffix
      }))
    } catch (e) {
      selectedProject.value.materials = []
    } finally {
      selectedProject.value.materialsLoading = false
    }
  }





  const startMeeting = async(item) => {
    try {
      //会议状态（0-待组织, 1-已安排, 2-进行中, 3-已结束）,示例值(1)
      await updateMidtermMeeting({ id: item.id, meetingStatus: 2 })
      item.meetingStatus = 'in_progress'
      //刷新
      await loadScheduledMeetings()
      message.success(`开始会议：${item.projectName}`)
    } catch (e) {
      message.error('开始会议失败')
    }
  }

  const editMeeting = async (item) => {
    selectedEditMeeting.value = item
    // 将数字类型的会议形式转换为字符串类型
    let meetingType = 'offline'
    if (item.meetingType === 0 || item.meetingType === 'offline') meetingType = 'offline'
    else if (item.meetingType === 1 || item.meetingType === 'online') meetingType = 'online'
    else if (item.meetingType === 2 || item.meetingType === 'hybrid') meetingType = 'hybrid'
    
    // 初始化表单数据
    editForm.value = {
      datetime: item.meetingTime ? dayjs(item.meetingTime) : undefined,
      location: item.meetingLocation || item.meetingPlace || '',
      type: meetingType,
      hosts: item.meetingHosts || (item.meetingHost ? [item.meetingHost] : []),
      experts: item.experts || [],
      materials: [], // 先初始化为空数组，后面会通过API获取
      description: item.meetingDescription || ''
    }

    // 调用 getMidtermMeetingMaterialPage 方法获取材料列表
    try {
      const materialsResponse = await getMidtermMeetingMaterialPage({
        meetingId: item.id,
        pageNo: 1,
        pageSize: 100
      })
      
      console.log('获取会议材料API返回值:', materialsResponse)
      
      // 处理材料数据并添加到表单中
      if (materialsResponse && materialsResponse.list) {
        editForm.value.materials = materialsResponse.list.map(material => ({
          name: material.materialName || material.name || '未命名文件',
          size: material.fileSize || material.size || 0,
          fileUrl: material.fileUrl || material.url || material.filePath || '',
          type: material.fileSuffix || material.type || ''
        }))
      }
    } catch (error) {
      console.error('获取会议材料失败:', error)
      // 如果API调用失败，使用原有数据
      editForm.value.materials = (item.meetingMaterials || []).map(material => ({
        ...material,
        fileUrl: material.fileUrl || material.url || '' // 确保 fileUrl 字段存在
      }))
    }
    editModalVisible.value = true
  }

  const passMeeting = async(item) => {
    try {
      //会议状态（0-待组织, 1-已安排, 2-进行中, 3-已结束）,示例值(1)
      await updateMidtermMeeting({ id: item.id })
      item.meetingStatus = 'finished'
      message.success(`编辑会议成功：${item.projectName}`)
      // 刷新会议列表
      await loadScheduledMeetings()
    } catch (e) {
      message.error('编辑失败')
    }
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
          // 第二步：获取会议详情，拿到midtermApplicationId
          const meetingDetail = await getMidtermMeetingDetail(item.id)
          
          // 第三步：更新项目状态为"待安排"（applicationStatus: 2）
          await thQdMidUpdate({
            id: meetingDetail.midtermApplicationId,
            applicationStatus: 2
              })
          // 第一步：删除会议
          await deleteMidtermMeeting(item.id)
        

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
    // 显示会议详情，包括会议信息、参会人员、会议资料等
    selectedMeeting.value = item
    
    // 这里应该打开会议详情弹窗
    message.success(`正在查看会议详情：${item.projectName}`)
    
    // 实际项目中可以这样实现：
    // meetingDetailModalVisible.value = true
  }

  const editConclusion = async (item) => {
    // 编辑已录入的结论
    selectedMeeting.value = item
    
    // 获取结论文件信息
    let conclusionFiles = []
    try {
      // 使用 getMidtermConclusionFilePage API 获取结论文件
      const filesResponse = await getMidtermConclusionFilePage({
        pageNo: 1,
        pageSize: 100, // 获取足够多的文件
        conclusionId: item.id
      })

      conclusionFiles = filesResponse?.list || []
      console.log('通过API获取到的结论文件:', conclusionFiles)

      // 确保文件数据格式正确
      conclusionFiles = conclusionFiles.map(file => {
        // 处理文件名，确保包含正确的扩展名
        let fileName = file.fileName || file.name || '未命名文件'
        let fileSuffix = file.fileSuffix || file.type
        
        // 尝试从文件URL中提取文件名和扩展名
        const fileUrl = file.filePath || file.fileUrl || file.url
        if (fileUrl && !fileName.includes('.')) {
          try {
            const urlParts = fileUrl.split('/')
            const urlFileName = urlParts[urlParts.length - 1]
            if (urlFileName && urlFileName.includes('.')) {
              fileName = urlFileName
              // 从URL文件名中提取扩展名
              const ext = fileName.split('.').pop()?.toLowerCase()
              if (ext && ext !== fileName) {
                fileSuffix = ext
              }
            }
          } catch (e) {
            console.error('从URL提取文件名失败:', e)
          }
        }
        
        // 如果文件名没有扩展名，但有文件类型，则添加扩展名
        if (fileSuffix && !fileName.endsWith(`.${fileSuffix}`)) {
          fileName = `${fileName}.${fileSuffix}`
        }
        
        // 确保文件类型不为空
        if (!fileSuffix && fileName.includes('.')) {
          fileSuffix = fileName.split('.').pop()?.toLowerCase()
        }
        
        return {
          id: file.id,
          name: fileName, // 使用name属性而不是fileName
          url: fileUrl,   // 使用url属性而不是fileUrl
          size: file.fileSize || file.size || 0, // 使用size属性而不是fileSize
          type: fileSuffix // 使用type属性而不是fileSuffix
        }
      })

      console.log('处理后的文件数据:', conclusionFiles)
    } catch (e) {
      console.error('获取结论文件失败:', e)
      // 如果API调用失败，使用item中的文件数据
      conclusionFiles = item.conclusionFiles || []
    }
    
    conclusionForm.value = {
      conclusion: item.conclusion || 'passed',
      score: item.score || 85,
      description: item.conclusionDescription || '',
      requirements: item.requirements || '',
      conclusionFiles: conclusionFiles
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
    // 查看结论详情
    selectedMeeting.value = item
    message.success(`正在查看结论详情：${item.projectName}`)
    
    // 实际项目中可以打开详情弹窗
    // conclusionDetailModalVisible.value = true
  }

  const deleteConclusion = (item) => {
    // 显示确认删除对话框
    const modal = Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${item.projectName}"的验收结论吗？`,
      okText: '确定',
      cancelText: '取消',
      async onOk() {
        try {
          // 第一步：获取结论详情，拿到midtermApplicationId
          const conclusionDetail = await getMidtermConclusion(item.id)
          console.log('获取结论详情API返回值:', conclusionDetail)
          
          // 第二步：更新项目状态为"会议已安排"（applicationStatus: 3）
          await thQdMidUpdate({
            id: conclusionDetail.midtermApplicationId,
            applicationStatus: 3
          })
          
          // 第三步：删除结论
          await deleteMidtermConclusion(item.id)
          
          message.success('结论删除成功')
          await loadConclusions()
        } catch (e) {
          console.error('删除结论失败:', e)
          message.error('结论删除失败')
        }
      }
    })
  }

  // 新的结论详情查看函数实现
  const showConclusionDetail = async (item) => {
    // 查看结论详情
    selectedConclusion.value = item
    loadingConclusionDetail.value = true
    
    try {
      // 获取完整的结论详情
      const conclusionDetail = await getMidtermConclusion(item.id)
      console.log('获取结论详情API返回值:', conclusionDetail)
      
      // 获取项目信息
      let projectInfo = {}
      if (item.projectId) {
        try {
          const projectDetail = await getTechnologicalProject(item.projectId)
          projectInfo = projectDetail?.data || projectDetail || {}
        } catch (e) {
          console.error('获取项目信息失败:', e)
        }
      }
      
      // 获取会议信息
      let meetingInfo = {}
      if (item.meetingId) {
        try {
          const meetingDetail = await getMidtermMeetingDetail(item.meetingId)
          meetingInfo = meetingDetail?.data || meetingDetail || {}
          
          // 获取会议参与人信息
          if (meetingInfo.id) {
            try {
              const participantsRes = await getMidtermMeetingParticipantPage({
                pageNo: 1,
                pageSize: 100,
                meetingId: meetingInfo.id
              })
              
              const participants = participantsRes?.list || []
              const hosts = participants
                .filter(p => p.participantRole === 0)
                .map(p => p.participantName)
              const experts = participants
                .filter(p => p.participantRole === 1)
                .map(p => p.participantName)
                
              meetingInfo.hosts = hosts
              meetingInfo.experts = experts
            } catch (e) {
              console.error('获取会议参与人失败:', e)
            }
          }
        } catch (e) {
          console.error('获取会议信息失败:', e)
        }
      }
      
      // 获取中期申请信息
      let applicationInfo = {}
      if (item.midtermApplicationId) {
        try {
          const applicationDetail = await thQdMidDetail(item.midtermApplicationId)
          applicationInfo = applicationDetail?.data || applicationDetail || {}
        } catch (e) {
          console.error('获取中期申请信息失败:', e)
        }
      }

      // 获取结论文件信息
      let conclusionFiles = []
      try {
        // 使用 getMidtermConclusionFilePage API 获取结论文件
        const filesResponse = await getMidtermConclusionFilePage({
          pageNo: 1,
          pageSize: 100, // 获取足够多的文件
          conclusionId: conclusionDetail.id || item.id
        })
        
        conclusionFiles = filesResponse?.list || []
        console.log('通过API获取到的结论文件:', conclusionFiles)
        
        // 确保文件数据格式正确
        conclusionFiles = conclusionFiles.map(file => ({
          id: file.id,
          fileName: file.fileName || file.name || '未命名文件',
          fileUrl: file.fileUrl || file.url || file.filePath || '',
          fileSize: file.fileSize || file.size || 0,
          fileSuffix: file.fileSuffix || file.type || ''
        }))
        
        console.log('处理后的文件数据:', conclusionFiles)
      } catch (e) {
        console.error('获取结论文件失败:', e)
        
        // 如果API调用失败，尝试从结论详情中获取文件数据
        try {
          conclusionFiles = conclusionDetail.conclusionFiles || conclusionDetail.files || []
          console.log('从结论详情中获取到的文件:', conclusionFiles)
          
          // 确保文件数据格式正确
          conclusionFiles = conclusionFiles.map(file => ({
            id: file.id,
            fileName: file.fileName || file.name || '未命名文件',
            fileUrl: file.fileUrl || file.url || file.filePath || '',
            fileSize: file.fileSize || file.size || 0,
            fileSuffix: file.fileSuffix || file.type || ''
          }))
        } catch (fallbackError) {
          console.error('从结论详情获取文件也失败:', fallbackError)
        }
      }
      
      // 组装完整的详情数据
      conclusionDetailData.value = {
        ...item,
        ...conclusionDetail,
        projectInfo,
        meetingInfo,
        applicationInfo,
        // 使用获取到的文件数据
        conclusionFiles: conclusionFiles
      }
      
      conclusionDetailModalVisible.value = true
    } catch (e) {
      console.error('获取结论详情失败:', e)
      message.error('获取结论详情失败')
    } finally {
      loadingConclusionDetail.value = false
    }
  }

  // 处理结论详情弹窗关闭
  const handleConclusionDetailCancel = () => {
    conclusionDetailModalVisible.value = false
    conclusionDetailData.value = {}
  }

  // 预览结论文件
  const previewConclusionFile = (file) => {
    // 处理不同格式的文件信息
    const fileUrl = file.filePath || file.fileUrl || file.url
    const fileName = file.fileName || file.name || '未命名文件'
    const fileSuffix = file.fileSuffix || file.type
    const fileSize = file.fileSize || file.size || 0

    if (!fileUrl) {
      message.warning('暂无文件可预览')
      return
    }
    
    // 设置预览文件信息
    // 设置预览文件列表
    previewFileList.value = (conclusionDetailData.value.conclusionFiles || []).map((x) => {
      // 处理文件名，确保包含正确的扩展名
      let fileName = x.fileName || x.name || '未命名文件'
      let fileSuffix = x.fileSuffix || x.type
      
      // 尝试从文件URL中提取文件名和扩展名
      const fileUrl = x.filePath || x.fileUrl || x.url
      if (fileUrl && !fileName.includes('.')) {
        try {
          const urlParts = fileUrl.split('/')
          const urlFileName = urlParts[urlParts.length - 1]
          if (urlFileName && urlFileName.includes('.')) {
            fileName = urlFileName
            // 从URL文件名中提取扩展名
            const ext = fileName.split('.').pop()?.toLowerCase()
            if (ext && ext !== fileName) {
              fileSuffix = ext
            }
          }
        } catch (e) {
          console.error('从URL提取文件名失败:', e)
        }
      }
      
      // 如果文件名没有扩展名，但有文件类型，则添加扩展名
      if (fileSuffix && !fileName.endsWith(`.${fileSuffix}`)) {
        fileName = `${fileName}.${fileSuffix}`
      }
      
      // 确保文件类型不为空
      if (!fileSuffix && fileName.includes('.')) {
        fileSuffix = fileName.split('.').pop()?.toLowerCase()
      }
      
      console.log('处理后的文件信息:', {
        id: x.id,
        name: fileName,
        type: fileSuffix,
        size: x.fileSize || x.size || 0,
        url: fileUrl
      })
      
      return {
        id: x.id,
        name: fileName,
        type: fileSuffix,
        size: x.fileSize || x.size || 0,
        url: fileUrl
      }
    })
    
    // 找到当前文件在列表中的索引
    const foundIdx = previewFileList.value.findIndex((x) => 
      x.url === fileUrl || (x.id && x.id === file.id)
    )
    previewCurrentIndex.value = foundIdx >= 0 ? foundIdx : 0
    
    // 设置当前预览文件信息
    // 确保文件名包含正确的扩展名
    let finalFileName = fileName
    if (fileSuffix && !finalFileName.endsWith(`.${fileSuffix}`)) {
      finalFileName = `${finalFileName}.${fileSuffix}`
    }
    
    previewFileInfo.value = previewFileList.value[previewCurrentIndex.value] || {
      name: finalFileName,
      url: fileUrl,
      type: fileSuffix,
      size: fileSize
    }
    
    // 显示文件预览弹窗
    filePreviewVisible.value = true
  }

  // 新的导出结论函数实现
  const exportConclusionReport = async (item) => {
    try {
      // 显示加载提示
      const loadingMessage = message.loading(`正在导出验收结论：${item.projectName}`, 0)
      
      // 动态导入docx库
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
      
      // 获取完整的结论详情
      const conclusionDetail = await getMidtermConclusion(item.id)
      
      // 获取项目信息
      let projectInfo = {}
      if (item.projectId) {
        try {
          const projectDetail = await getTechnologicalProject(item.projectId)
          projectInfo = projectDetail?.data || projectDetail || {}
        } catch (e) {
          console.error('获取项目信息失败:', e)
        }
      }
      
      // 获取会议信息
      let meetingInfo = {}
      if (item.meetingId) {
        try {
          const meetingDetail = await getMidtermMeetingDetail(item.meetingId)
          meetingInfo = meetingDetail?.data || meetingDetail || {}
          
          // 获取会议参与人信息
          if (meetingInfo.id) {
            try {
              const participantsRes = await getMidtermMeetingParticipantPage({
                pageNo: 1,
                pageSize: 100,
                meetingId: meetingInfo.id
              })
              
              const participants = participantsRes?.list || []
              const hosts = participants
                .filter(p => p.participantRole === 0)
                .map(p => p.participantName)
              const experts = participants
                .filter(p => p.participantRole === 1)
                .map(p => p.participantName)
                
              meetingInfo.hosts = hosts
              meetingInfo.experts = experts
            } catch (e) {
              console.error('获取会议参与人失败:', e)
            }
          }
        } catch (e) {
          console.error('获取会议信息失败:', e)
        }
      }
      
      // 组装导出数据
      const exportData = {
        projectName: item.projectName || '未命名项目',
        projectCode: item.projectCode || '',
        projectLeader: projectInfo.projectLeader || '',
        projectCycle: projectInfo.projectCycle || '',
        projectBudget: projectInfo.budget || '',
        meetingTime: item.meetingTime || '',
        meetingPlace: item.meetingPlace || '',
        meetingType: meetingInfo.meetingType !== undefined ? getMeetingTypeText(meetingInfo.meetingType) : '',
        meetingStatus: meetingInfo.meetingStatus !== undefined ? getMeetingStatusText(meetingInfo.meetingStatus) || '已完成' : '已完成',
        meetingHosts: meetingInfo.hosts ? meetingInfo.hosts.join('、') : '',
        meetingExperts: meetingInfo.experts ? meetingInfo.experts.join('、') : '',
        meetingInstructions: meetingInfo.meetingInstructions || '',
        conclusionTime: item.conclusionTime || '',
        conclusionResult: item.conclusion !== undefined ? getConclusionText(item.conclusion) : '',
        conclusionScore: item.score || item.conclusionScore || conclusionDetail?.data?.score || conclusionDetail?.score || conclusionDetail?.data?.conclusionScore || conclusionDetail?.conclusionScore || extractScoreFromDescription(item.conclusionDescription) || extractScoreFromDescription(conclusionDetail?.data?.conclusionDescription) || extractScoreFromDescription(conclusionDetail?.conclusionDescription) || '未评分',
        conclusionDescription: item.conclusionDescription || ''
      }
      
      // 创建Word文档
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // 标题
            new Paragraph({
              text: '项目验收结论报告',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            
            // 项目基本信息标题
            new Paragraph({
              text: '项目基本信息',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            
            // 项目基本信息内容
            new Paragraph({
              children: [
                new TextRun({ text: '项目名称：', bold: true }),
                new TextRun(exportData.projectName)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '项目编号：', bold: true }),
                new TextRun(exportData.projectCode)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '项目负责人：', bold: true }),
                new TextRun(exportData.projectLeader)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '项目周期：', bold: true }),
                new TextRun(`${exportData.projectCycle}个月`)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '项目预算：', bold: true }),
                new TextRun(`${exportData.projectBudget}万元`)
              ],
              spacing: { after: 300 }
            }),
            
            // 会议信息标题
            new Paragraph({
              text: '会议信息',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            
            // 会议信息内容
            new Paragraph({
              children: [
                new TextRun({ text: '会议时间：', bold: true }),
                new TextRun(exportData.meetingTime)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '会议地点：', bold: true }),
                new TextRun(exportData.meetingPlace)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '会议形式：', bold: true }),
                new TextRun(exportData.meetingType)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '会议状态：', bold: true }),
                new TextRun('已完成')
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '主持人：', bold: true }),
                new TextRun(exportData.meetingHosts)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '参会专家：', bold: true }),
                new TextRun(exportData.meetingExperts)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '会议说明：', bold: true }),
                new TextRun(exportData.meetingInstructions)
              ],
              spacing: { after: 300 }
            }),
            
            // 结论信息标题
            new Paragraph({
              text: '结论信息',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            
            // 结论信息内容
            new Paragraph({
              children: [
                new TextRun({ text: '结论时间：', bold: true }),
                new TextRun(exportData.conclusionTime)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '验收结果：', bold: true }),
                new TextRun(exportData.conclusionResult)
              ],
              spacing: { after: 100 }
            }),
            // new Paragraph({
            //   children: [
            //     new TextRun({ text: '评分：', bold: true }),
            //     new TextRun(exportData.conclusionScore)
            //   ],
            //   spacing: { after: 100 }
            // }),
            new Paragraph({
              children: [
                new TextRun({ text: '结论描述：', bold: true }),
                new TextRun(exportData.conclusionDescription)
              ],
              spacing: { after: 100 }
            })
          ]
        }]
      })
      
      // 生成Word文档
      const blob = await Packer.toBlob(doc)
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${item.projectName || '项目'}_验收结论_${dayjs().format('YYYY-MM-DD')}.docx`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理资源
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
      // 关闭加载提示
      loadingMessage()
      message.success(`验收结论导出成功：${item.projectName}`)
    } catch (error) {
      console.error('导出结论失败:', error)
      message.error('导出结论失败，请稍后重试')
    }
  }

  // 材料下载方法
  const downloadMaterial = (material) => {
    if (!material.fileUrl) {
      message.warning('暂无文件可下载')
      return
    }
    
    const link = document.createElement('a')
    link.href = material.fileUrl
    link.download = material.materialName || material.name || 'file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success(`正在下载：${material.materialName || material.name}`)
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
  const downloadProjectMaterial = (m) => {
    // 处理不同格式的文件信息
    const fileUrl = m.fileUrl || m.url
    const fileName = m.materialName || m.name || '未命名文件'
    const fileSuffix = m.fileSuffix || m.type

    if (!fileUrl) {
      message.warning('暂无文件可下载')
      return
    }

    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `${fileName}${fileSuffix ? '.' + fileSuffix : ''}`
    link.target = '_blank'

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success(`开始下载: ${fileName}`)
  }






























  // 结论文件下载方法
  const downloadConclusionFile = (file) => {

    const fileUrl = file.fileUrl || file.url
    const fileName = file.materialName || file.name || '未命名文件'
    const fileSuffix = file.fileSuffix || file.type

    if (!fileUrl) {
      message.warning('暂无文件可下载')
      return
    }

    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `${fileName}${fileSuffix ? '.' + fileSuffix : ''}`
    link.target = '_blank'

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success(`开始下载: ${fileName}`)

    
    // 实际项目中这里应该调用下载接口
    // downloadAPI.downloadConclusionFile(file.id)
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
      message.error('请选择会议主持人')
      return
    }
    if (!scheduleForm.value.experts || scheduleForm.value.experts.length === 0) {
      message.error('请选择参会专家')
      return
    }
    //会议说明
    if (!scheduleForm.value.description || scheduleForm.value.description.trim() === '') {
      message.error('请填写会议说明')
      return
    }
    
    try {
      console.log('🏢 开始创建会议记录...', {
        projectId: selectedProject.value.projectCode,
        projectName: selectedProject.value.projectName,
        scheduleForm: scheduleForm.value,
        meetingType: scheduleForm.value.type
      })

      // 准备会议参与者数据
      const midtermMeetingParticipantDOList = []

      // 添加主持人
      if (scheduleForm.value.hosts && scheduleForm.value.hosts.length > 0) {
        midtermMeetingParticipantDOList.push(...scheduleForm.value.hosts.map(item => ({
          participantName: item,
          participantRole: 0
        })))
      }

      // 添加专家
      if (scheduleForm.value.experts && scheduleForm.value.experts.length > 0) {
        midtermMeetingParticipantDOList.push(...scheduleForm.value.experts.map(item => ({
          participantName: item,
          participantRole: 1
        })))
      }

      // 准备会议材料数据
      const midtermMeetingMaterialDOList = []
      if (scheduleForm.value.materials && scheduleForm.value.materials.length > 0) {
        midtermMeetingMaterialDOList.push(...scheduleForm.value.materials.map((item, index) => ({
          materialSource: 1, // 会议材料来源：1-上传，2-链接
          materialName: item.fileName || item.uploadResponse?.fileName || item.name || '未命名文件',
          fileUrl: item.url || item.fileUrl || item.uploadResponse?.fileUrl || item.uploadResponse?.url || '',
          fileSize: item.fileSize || item.uploadResponse?.fileSize || item.size || 0,
          fileSuffix: item.fileSuffix || (item.name ? item.name.split('.').pop() : null) || null,
          sort: index + 1 // 按上传顺序排序，确保多文件时sort值递增
        })))
      }

      // 🎯 第一步：创建会议记录
      // 确保meetingTime是一个有效的时间戳
      const meetingTimeTimestamp = scheduleForm.value.datetime 
        ? dayjs(scheduleForm.value.datetime).valueOf() 
        : dayjs().valueOf()
      
      const meetingData = {
        midtermApplicationId: selectedProject.value.id,
        meetingNo: `${selectedProject.value.projectCode || selectedProject.value.projectNo || 'MEET'}-${dayjs().format('YYYYMMDDHHmm')}`,
        meetingName: `${selectedProject.value.projectName}`,
        meetingTime: dayjs(scheduleForm.value.datetime).valueOf(), // 确保meetingTime是时间戳类型,
        meetingPlace: scheduleForm.value.location || '未指定地点',
        meetingType: scheduleForm.value.type === 'offline' ? 0 :
                    scheduleForm.value.type === 'online' ? 1 : 2,
        meetingStatus: 1,
        meetingMinutes: '',
        meetingInstructions: scheduleForm.value.description || '',
        midtermMeetingParticipantDOList: midtermMeetingParticipantDOList,
        midtermMeetingMaterialDOList: midtermMeetingMaterialDOList
      }
      

      console.log('会议数据准备完成:', meetingData)
      console.log('准备创建新会议')
      const meetingResponse = await createMidtermMeeting(meetingData)
      console.log('创建会议API返回值:', meetingResponse)
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
          hosts: scheduleForm.value.hosts,
          experts: scheduleForm.value.experts,
          description: meetingData.meetingInstructions
        }
      }

      const meetingStatus = {
                id: selectedProject.value.id,
                applicationStatus: 3,
                midtermMaterialDOList: (selectedProject.value.materials || []).map(material => ({
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
      scheduleModalVisible.value = false
      // 🔄 刷新项目列表以获取最新状态
      await Promise.all([loadScheduledMeetings(), loadPendingProjects()])

    } catch (error) {
      console.error('❌ 会议安排失败:', error)
      message.error(`会议安排失败: ${error.message || '请重试'}`)
    }
  }


















  //   message.success('会议安排完成')
  //   scheduleModalVisible.value = false
    
  //   // 将项目从待安排列表移动到已安排列表
  //   if (selectedProject.value) {
  //     const newMeeting = {
  //       ...selectedProject.value,
  //       meetingTime: scheduleForm.value.datetime ? dayjs(scheduleForm.value.datetime).format('YYYY-MM-DD HH:mm') : '',
  //       meetingLocation: scheduleForm.value.location,
  //       meetingType: scheduleForm.value.type,
  //       meetingHosts: scheduleForm.value.hosts, // 存储主持人数组
  //       meetingHost: scheduleForm.value.hosts.join('、'), // 显示用字符串
  //       meetingStatus: 'scheduled',
  //       experts: scheduleForm.value.experts, // 直接存储专家数组
  //       meetingMaterials: scheduleForm.value.materials, // 存储会议资料
  //       meetingDescription: scheduleForm.value.description
  //     }
      
  //     scheduledMeetingList.value.push(newMeeting)
      
  //     const index = pendingScheduleList.value.findIndex(p => p.id === selectedProject.value.id)
  //     if (index > -1) {
  //       pendingScheduleList.value.splice(index, 1)
  //     }
  //   }
  // }

  const handleScheduleCancel = () => {
    scheduleModalVisible.value = false
  }

  // 会议材料上传方法
  /* const beforeUploadMaterial = async (file) => { // 注释掉重复声明的函数
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
    
    console.log('file', file)
    // 直接调用 uploadTechnologicalFile API
    const res = await uploadTechnologicalFile(file)
    // 触发上传进度
    console.log('完整响应数据:', res)
    console.log('fileUrl 值:', res?.data?.fileUrl || res?.fileUrl)

    if (res) {
      // 触发完成进度

      // 构建包含完整上传信息的文件对象
      const fileWithUrl = {
        ...file,
        url: res.fileUrl || '',           // uploadTechnologicalFile 返回的 URL
        fileUrl: res.fileUrl || '',       // 添加 fileUrl 属性，与 url 保持一致
        uploaded: true,
        uploadTime: new Date().toISOString(),
        fileName: res.fileName || file.name,
        fileSize: res.fileSize || file.size,
        fileType: res.fileType || file.type,
        fileMd5: res.fileMd5,
        uploader: res.uploader,
        description: res.description
      }
      console.log('上传成功后的文件对象:', fileWithUrl)
      scheduleForm.value.materials.push(fileWithUrl)
      message.success(`文件 "${file.name}" 上传成功`)
    } else {
      console.log(Error(response.msg || '上传失败'))
    }
    return false // 阻止自动上传
  } */

  /* const removeMaterial = (file) => {
    const index = scheduleForm.value.materials.findIndex((item) => item.uid === file.uid)
    if (index > -1) {
      scheduleForm.value.materials.splice(index, 1)
    }
  }

  const removeMaterialByIndex = (index) => {
    scheduleForm.value.materials.splice(index, 1)
  }

  const formatFileSize = (size) => {
    if (size < 1024) {
      return size + ' B'
    } else if (size < 1024 * 1024) {
      return Math.round(size / 1024) + ' KB'
    } else {
      return Math.round(size / (1024 * 1024)) + ' MB'
    }
  } */

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
        midtermApplicationId: selectedMeeting.value.midtermApplicationId || selectedMeeting.value.projectId || selectedMeeting.value.id || 0,
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
        // 确保传递的是File对象
        if (!(raw instanceof File)) {
          console.error('无效的文件对象:', raw)
          message.error(`文件 ${file.name} 格式不正确，请重新选择`)
          continue
        }
        try {
          const uploadRes = await uploadTechnologicalFile(raw)
          console.log('文件上传响应:', uploadRes)
          // 处理不同的响应格式，确保获取到fileUrl
          let filePath = null
          let fileSize = null
          
          // 尝试多种方式获取fileUrl
          if (uploadRes?.data?.fileUrl) {
            filePath = uploadRes.data.fileUrl
          } else if (uploadRes?.fileUrl) {
            filePath = uploadRes.fileUrl
          } else if (uploadRes?.data?.url) {
            filePath = uploadRes.data.url
          } else if (uploadRes?.url) {
            filePath = uploadRes.url
          }
          
          // 尝试多种方式获取fileSize
          if (uploadRes?.data?.fileSize) {
            fileSize = uploadRes.data.fileSize
          } else if (uploadRes?.fileSize) {
            fileSize = uploadRes.fileSize
          }
          
          if (filePath) {
            uploadedFilePaths.push({ 
              name: file.name, 
              path: filePath,
              size: fileSize || file.size || raw.size
            })
          } else {
            console.error('无法获取文件上传路径:', uploadRes)
            message.error(`文件 ${file.name} 上传成功但无法获取文件路径`)
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

      // 新增或编辑
      if (selectedMeeting.value && selectedMeeting.value.conclusionId) {
        // 编辑现有结论
        payload.id = selectedMeeting.value.conclusionId
        await updateMidtermConclusion(payload)
        
        // 处理文件上传
        // 获取原始文件ID列表
        const originalFileIds = (selectedMeeting.value.conclusionFiles || [])
          .filter(file => file.id)
          .map(file => file.id)
        
        // 获取当前表单中的文件ID列表
        const currentFileIds = (conclusionForm.value.conclusionFiles || [])
          .filter(file => file.id)
          .map(file => file.id)
        
        // 找出需要删除的文件（在原始列表中但不在当前列表中的文件）
        const filesToDelete = originalFileIds.filter(id => !currentFileIds.includes(id))
        
        // 删除不再需要的文件
        for (const fileId of filesToDelete) {
          console.log('删除文件:', fileId)
          await deleteMidtermConclusionFile(fileId)
        }
        
        // 上传新文件
        for (let i = 0; i < (conclusionForm.value.conclusionFiles || []).length; i++) {
          const file = conclusionForm.value.conclusionFiles[i]
          // 如果是已经存在的文件（有ID），则更新文件信息
          if (file.id) {
            console.log('文件已存在，跳过上传:', file.id)
            continue
          } else if (file.url && file.status === 'done') {
            // 文件已经上传过，有URL，直接创建文件记录
            console.log('文件已上传，创建记录:', file.name)
            await createMidtermConclusionFile({
              conclusionId: selectedMeeting.value.conclusionId,
              fileName: file.name,
              filePath: file.url,
              sort: i + 1
            })
            continue
          }
          
          console.log('准备上传文件:', file)
          // 确保传递的是File对象
          const rawFile = (file && file.originFileObj) ? file.originFileObj : file
          if (!(rawFile instanceof File)) {
            console.error('无效的文件对象:', rawFile)
            message.error(`文件 ${file.name} 格式不正确，请重新选择`)
            continue
          }
          const uploadRes = await uploadTechnologicalFile(rawFile)
          console.log('文件上传结果:', uploadRes)
          // 处理不同的响应格式，确保获取到fileUrl和fileSize
          let filePath = null
          let fileSize = null
          
          // 尝试多种方式获取fileUrl
          if (uploadRes?.data?.fileUrl) {
            filePath = uploadRes.data.fileUrl
          } else if (uploadRes?.fileUrl) {
            filePath = uploadRes.fileUrl
          } else if (uploadRes?.data?.url) {
            filePath = uploadRes.data.url
          } else if (uploadRes?.url) {
            filePath = uploadRes.url
          }
          
          // 尝试多种方式获取fileSize
          if (uploadRes?.data?.fileSize) {
            fileSize = uploadRes.data.fileSize
          } else if (uploadRes?.fileSize) {
            fileSize = uploadRes.fileSize
          }
          
          if (!filePath) {
            console.error('无法获取文件上传路径:', uploadRes)
            message.error(`文件 ${file.name} 上传成功但无法获取文件路径`)
            continue
          }
          
          await createMidtermConclusionFile({
            conclusionId: selectedMeeting.value.conclusionId,
            fileName: file.name,
            filePath: filePath,
            fileUrl: filePath, // 明确设置fileUrl字段
            fileSize: fileSize || file.size || rawFile.size,
            fileSuffix: file.name.split('.').pop(), // 添加文件后缀
            sort: i + 1
          })
        }
      } else {
        // 创建新结论
        const res = await createMidtermConclusion(payload)
        console.log('创建结论API返回值:', res)
        // 期望后端返回新建ID
        const newConclusionId = res?.data ?? res?.result ?? res?.id
        
        // 处理文件上传和创建
        for (let i = 0; i < (conclusionForm.value.conclusionFiles || []).length; i++) {
          const file = conclusionForm.value.conclusionFiles[i]
          console.log('处理文件:', file)
          
          if (file.url && file.status === 'done') {
            // 文件已经上传过，有URL，直接创建文件记录
            console.log('文件已上传，创建记录:', file.name)
            await createTechnologicalConclusionFile({
              conclusionId: newConclusionId,
              fileName: file.name,
              filePath: file.url,
              sort: i + 1
            })
          } else {
            // 上传新文件
            console.log('上传新文件:', file.name)
            // 确保传递的是原始的 File 对象
            const originalFile = (file && file.originFileObj) ? file.originFileObj : (file.raw || file)
            if (!(originalFile instanceof File)) {
              console.error('无效的文件对象:', originalFile)
              message.error(`文件 ${file.name} 格式不正确，请重新选择`)
              continue
            }
            const uploadRes = await uploadTechnologicalFile(originalFile)
            console.log('文件上传结果:', uploadRes)
            // 处理不同的响应格式，确保获取到fileUrl和fileSize
            let filePath = null
            let fileSize = null
            
            // 尝试多种方式获取fileUrl
            if (uploadRes?.data?.fileUrl) {
              filePath = uploadRes.data.fileUrl
            } else if (uploadRes?.fileUrl) {
              filePath = uploadRes.fileUrl
            } else if (uploadRes?.data?.url) {
              filePath = uploadRes.data.url
            } else if (uploadRes?.url) {
              filePath = uploadRes.url
            }
            
            // 尝试多种方式获取fileSize
            if (uploadRes?.data?.fileSize) {
              fileSize = uploadRes.data.fileSize
            } else if (uploadRes?.fileSize) {
              fileSize = uploadRes.fileSize
            }
            
            if (!filePath) {
              console.error('无法获取文件上传路径:', uploadRes)
              message.error(`文件 ${file.name} 上传成功但无法获取文件路径`)
              continue
            }
            
            await createTechnologicalConclusionFile({
              conclusionId: newConclusionId,
              fileName: file.name,
              filePath: filePath,
              fileUrl: filePath, // 明确设置fileUrl字段
              fileSize: fileSize || file.size || originalFile.size,
              fileSuffix: file.name.split('.').pop(), // 添加文件后缀
              sort: i + 1
            })
          }
        }
        
        // 更新会议状态
        await updateMidtermMeeting({ id: selectedMeeting.value.id, meetingStatus: 3 })
      }

      // 根据结论结果更新项目状态
      try {
        // 获取项目ID
        const projectId = selectedMeeting.value.midtermApplicationId || selectedMeeting.value.projectId || selectedMeeting.value.id
        
        // 根据结论结果设置不同的状态
        let status = 4 // 默认为通过
        if (conclusionForm.value.conclusion === 'passed') {
          status = 4 // 通过
        } else if (conclusionForm.value.conclusion === 'conditional_passed') {
          status = 5 // 有条件通过
        } else if (conclusionForm.value.conclusion === 'failed') {
          status = 6 // 不通过
        }
        
        // 更新项目状态
        await thQdMidUpdate({
          id: projectId,
          applicationStatus: status,
        })
        
        console.log(`已更新项目状态为: ${status}`)
      } catch (error) {
        console.error('更新项目状态失败:', error)
        // 不阻止流程，只记录错误
      }

      message.success('验收结论录入完成')
      conclusionModalVisible.value = false
      await Promise.all([loadScheduledMeetings(), loadConclusions()])
    } catch (e) {
      console.error('提交结论失败:', e)
      message.error('提交失败，请稍后重试')
    }
  }

































  //   message.success('验收结论录入完成')
  //   conclusionModalVisible.value = false
    
  //   // 处理结论录入或编辑
  //   if (selectedMeeting.value) {
  //     // 检查是否是编辑现有结论
  //     const existingConclusionIndex = conclusionList.value.findIndex(c => c.id === selectedMeeting.value.id)
      
  //     const conclusionData = {
  //       ...selectedMeeting.value,
  //       conclusionTime: existingConclusionIndex > -1 ? selectedMeeting.value.conclusionTime : dayjs().format('YYYY-MM-DD HH:mm:ss'),
  //       conclusion: conclusionForm.value.conclusion,
  //       score: conclusionForm.value.score,
  //       conclusionDescription: conclusionForm.value.description,
  //       requirements: conclusionForm.value.requirements,
  //       conclusionFiles: conclusionForm.value.conclusionFiles
  //     }
      
  //     if (existingConclusionIndex > -1) {
  //       // 编辑现有结论
  //       conclusionList.value[existingConclusionIndex] = conclusionData
  //       message.success('结论修改成功')
  //     } else {
  //       // 新增结论
  //       conclusionList.value.push(conclusionData)
      
  //     // 更新会议状态
  //     selectedMeeting.value.meetingStatus = 'completed'
        
  //       // 从已安排会议列表中移除该会议
  //       const meetingIndex = scheduledMeetingList.value.findIndex(m => m.id === selectedMeeting.value.id)
  //       if (meetingIndex > -1) {
  //         scheduledMeetingList.value.splice(meetingIndex, 1)
  //       }
  //     }
  //   }
  // }

























  const handleEditCancel = () => {
    editModalVisible.value = false
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
      message.error('请选择会议主持人')
      return
    }
    if (!editForm.value.experts || editForm.value.experts.length === 0) {
      message.error('请选择参会专家')
      return
    }
    
    try {
      console.log('🏢 开始更新会议记录...', {
        meetingId: selectedEditMeeting.value.id,
        editForm: editForm.value,
        meetingType: editForm.value.type
      })

      // 准备会议参与者数据
      const midtermMeetingParticipantDOList = []

      // 添加主持人
      if (editForm.value.hosts && editForm.value.hosts.length > 0) {
        midtermMeetingParticipantDOList.push(...editForm.value.hosts.map(item => ({
          participantName: item,
          participantRole: 0
        })))
      }

      // 添加专家
      if (editForm.value.experts && editForm.value.experts.length > 0) {
        midtermMeetingParticipantDOList.push(...editForm.value.experts.map(item => ({
          participantName: item,
          participantRole: 1
        })))
      }

      // 准备会议材料数据
      const midtermMeetingMaterialDOList = []
      if (editForm.value.materials && editForm.value.materials.length > 0) {
        midtermMeetingMaterialDOList.push(...editForm.value.materials.map((item, index) => ({
          materialSource: 1, // 会议材料来源：1-上传，2-链接
          materialName: item.fileName || item.uploadResponse?.fileName || item.name || '未命名文件',
          fileUrl: item.url || item.fileUrl || item.uploadResponse?.fileUrl || item.uploadResponse?.url || '',
          fileSize: item.fileSize || item.uploadResponse?.fileSize || item.size || 0,
          fileSuffix: item.fileSuffix || (item.name ? item.name.split('.').pop() : null) || null,
          sort: index + 1 // 按上传顺序排序，确保多文件时sort值递增
        })))
      }

      // 🎯 第一步：更新会议记录
      const meetingData = {
        id: selectedEditMeeting.value.id,
        meetingNo: `${selectedEditMeeting.value.projectCode} `,
        meetingName: `${selectedEditMeeting.value.projectName}`,
        meetingTime: dayjs(editForm.value.datetime).valueOf(), // 改为时间戳格式
        meetingPlace: editForm.value.location || '未指定地点', // 使用location字段
        meetingLocation: editForm.value.location || '未指定地点', // 添加meetingLocation字段
        meetingType: editForm.value.type === 'offline' ? 0 :
                    editForm.value.type === 'online' ? 1 : 2,
        meetingStatus: 1,
        meetingMinutes: '',
        meetingInstructions: editForm.value.description || '',
        midtermMeetingParticipantDOList: midtermMeetingParticipantDOList,
        midtermMeetingMaterialDOList: midtermMeetingMaterialDOList
      }

      console.log('会议数据准备完成:', meetingData)
      console.log('准备更新会议')
      const meetingResponse = await updateMidtermMeeting(meetingData)
      console.log('更新会议API返回值:', meetingResponse)
      if (meetingResponse) {
        console.log('✅ 会议更新成功')
      } else {
        throw new Error('会议更新失败')
      }

      // 更新本地会议信息
      if (selectedEditMeeting.value) {
        selectedEditMeeting.value.meetingInfo = {
          title: meetingData.meetingName,
          type: meetingData.meetingType,
          time: meetingData.meetingTime,
          place: meetingData.meetingPlace,
          hosts: editForm.value.hosts,
          experts: editForm.value.experts,
          description: meetingData.meetingDescription
        }
        
        // 更新会议基本信息
        selectedEditMeeting.value.meetingTime = meetingData.meetingTime
        selectedEditMeeting.value.meetingLocation = meetingData.meetingPlace
        selectedEditMeeting.value.meetingType = meetingData.meetingType
        selectedEditMeeting.value.meetingHosts = editForm.value.hosts
        selectedEditMeeting.value.experts = editForm.value.experts
        selectedEditMeeting.value.meetingMaterials = editForm.value.materials
        selectedEditMeeting.value.meetingDescription = meetingData.meetingDescription
      }

      console.log('✅ 会议信息更新完成')

      message.success('会议信息更新完成')
      editModalVisible.value = false
      // 🔄 刷新会议列表以获取最新状态
      await loadScheduledMeetings()

    } catch (error) {
      console.error('❌ 会议更新失败:', error)
      message.error(`会议更新失败: ${error.message || '请重试'}`)
    }
  }

  const handleConclusionCancel = () => {
    conclusionModalVisible.value = false
  }

  const handleDetailCancel = () => {
    detailModalVisible.value = false
  }

  // 文件预览方法
  const previewMaterial = (material) => {
    if (!material.fileUrl) {
      message.warning('暂无文件可预览')
      return
    }
    console.log(material)
    previewFileList.value = (selectedProject.value?.materials || []).map((x) => ({
      id: x.id,
      name: `${x.materialName}${x.fileSuffix ? '.' + x.fileSuffix : ''}`,
      type: x.fileSuffix,
      size: x.fileSize,
      url: x.fileUrl
    }))
    const foundIdx = previewFileList.value.findIndex((x) => x.url === material.fileUrl)
    previewCurrentIndex.value = foundIdx >= 0 ? foundIdx : 0
    if (previewCurrentIndex.value < 0) previewCurrentIndex.value = 0
    previewFileInfo.value = previewFileList.value[previewCurrentIndex.value]
    filePreviewVisible.value = true
  }

  // 处理文件切换
  const handleFileChange = (newIndex) => {
    previewCurrentIndex.value = newIndex
    previewFileInfo.value = previewFileList.value[newIndex]
  }

  // 处理文件下载事件
  const handleDownloadFile = (fileInfo) => {
    downloadProjectMaterial(fileInfo)
  }

  // 生命周期
  onMounted(() => {
    // 初始化数据
      // 初始化数据
    refreshData()
    // 获取用户列表
    getUserList()
  })






  // 项目分页处理函数
  const handleProjectPageChange = (page, pageSize) => {
    projectPager.value.pageNo = page
    loadPendingProjects()
  }

  const handleProjectPageSizeChange = (current, size) => {
    projectPager.value.pageNo = 1
    projectPager.value.pageSize = size
    loadPendingProjects()
  }

  // 会议分页处理函数
  const handleMeetingPageChange = (page, pageSize) => {
    meetingPager.value.pageNo = page
    loadScheduledMeetings()
  }

  const handleMeetingPageSizeChange = (current, size) => {
    meetingPager.value.pageNo = 1
    meetingPager.value.pageSize = size
    loadScheduledMeetings()
  }

  // 结论分页处理函数
  const handleConclusionPageChange = (page, pageSize) => {
    conclusionPager.value.pageNo = page
    loadConclusions()
  }

  const handleConclusionPageSizeChange = (current, size) => {
    conclusionPager.value.pageNo = 1
    conclusionPager.value.pageSize = size
    loadConclusions()
  }

  // 刷新当前标签数据
  const getStatisticsData = async () => {
    try {
      const res = await thQdMidStatistics()
      console.log('获取到的统计数据:', res)
      
      if (res && Array.isArray(res) && res.length > 0) {
        // 查找各个类型的统计数据
        const materialReviewing = res.find(item => item.materialReviewingType === 1)
        const materialRejected = res.find(item => item.materialRejectedType === 2)
        const meetingPending = res.find(item => item.meetingPendingType === 3)
        const meetingArranged = res.find(item => item.meetingArrangedType === 4)
        
        // 只更新未在其他函数中设置的统计数据
        if (!stats.value.pendingSchedule) {
          stats.value.pendingSchedule = materialReviewing ? materialReviewing.materialReviewingQuantity || 0 : 0
        }
        if (!stats.value.scheduled) {
          stats.value.scheduled = materialRejected ? materialRejected.materialRejectedQuantity || 0 : 0
        }
        if (!stats.value.completed) {
          stats.value.completed = meetingArranged ? meetingArranged.meetingArrangedQuantity || 0 : 0
        }
        if (!stats.value.pendingConclusion) {
          stats.value.pendingConclusion = meetingPending ? meetingPending.meetingPendingQuantity || 0 : 0
        }
        
        console.log('更新后的统计数据:', stats.value)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const refreshData = async () => {
    try {
      loading.value = true
      // 获取统计数据
      await getStatisticsData()
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
      const page = await thQdMidPage({
        pageNo: projectPager.value.pageNo,
        pageSize: projectPager.value.pageSize,
        applicationStatus: 2
      })
      console.log('获取待安排项目API返回值:', page)
      projectPager.value.total = page?.total || 0
      stats.value.pendingSchedule = projectPager.value.total
      pendingScheduleList.value = (page?.list || []).map((p) => ({
        id: p.id,
        projectId: p.projectId,
        projectName: p.projectName,
        projectCode: p.projectNo,
        projectLeader: p.applicant,
        projectDuration: `${p.projectCycle}个月`,
        projectBudget: p.budget,
        materialStatus: 'approved',
        submitTime: formatTimestamp(p.createTime),
        requiredMaterials: 0,
        totalRequired: 0,
        optionalMaterials: 0
      }))
      
      // 通过 projectId 调用 getTechnologicalProject 获取项目详细信息
      await Promise.all(
        pendingScheduleList.value.map(async (proj) => {
          if (proj.projectId) {
            try {
              const projectDetail = await getTechnologicalProject(proj.projectId)
              const p = projectDetail?.data || projectDetail
              if (p) {
                // 更新项目信息
                proj.projectName = p.projectName || proj.projectName
                proj.projectCode = p.projectNo || proj.projectCode
                proj.projectLeader = p.applicant || proj.projectLeader
                proj.projectDuration = `${p.projectCycle}个月` || proj.projectDuration
                proj.projectBudget = p.budget || proj.projectBudget
              }
            } catch (e) {
              console.error(`获取项目 ${proj.projectId} 详情失败:`, e)
            }
          }
        })
      )
      console.log(pendingScheduleList.value)
      // 加载每个项目的材料审核统计
      await Promise.all(
        pendingScheduleList.value.map(async (proj) => {
          try {
            const materialsPage = await thQdMidMaterialPage({ pageNo: 1, pageSize: 100, midtermApplicationId: proj.id })
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
              // proj.materialStatus = 'pending'
              proj.materialStatus = 'approved'
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
      const page = await getMidtermMeetingPage({
        pageNo: meetingPager.value.pageNo,
        pageSize: meetingPager.value.pageSize,
        meetingStatus:1
      })
      console.log('获取已安排会议API返回值:', page)
      meetingPager.value.total = page?.total || 0
      stats.value.scheduled = meetingPager.value.total
      const baseList = (page?.list || []).map((m) => ({
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
        meetingDescription: m.meetingInstructions,
        notifyLoading: false,
        lastNotifyTime: null
      }))
      // 并行加载参与人与资料
      await Promise.all(
        baseList.map(async (item) => {
          console.log(item)
          try {
            // 获取参与人信息
            const participantsRes = await getMidtermMeetingParticipantPage({ 
              pageNo: 1, 
              pageSize: 100, 
              meetingId: item.id 
            })
            
            // 根据participantRole区分主持人和专家
            // 0: 主持人, 1: 专家
            const participants = participantsRes?.list || []
            const hosts = participants
              .filter(p => p.participantRole === 0)
              .map(p => p.participantName)
            const experts = participants
              .filter(p => p.participantRole === 1)
              .map(p => p.participantName)
            item.meetingHosts = hosts
            item.meetingHost = hosts.join('、')
            item.experts = experts

            // 获取会议材料
            try {
              const materialsRes = await getMidtermMeetingMaterialPage({
                meetingId: item.id,
                pageNo: 1,
                pageSize: 100
              })
              const materials = materialsRes?.list || []
              item.meetingMaterials = materials.map((mm) => ({ 
                name: mm.materialName || mm.name || '未命名文件',
                url: mm.materialPath || mm.fileUrl || mm.url || '',
                id: mm.id
              }))
            } catch (e) {
              console.error(`获取会议 ${item.id} 的材料失败:`, e)
              item.meetingMaterials = []
            }
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
      scheduledMeetingList.value = baseList
      console.log(scheduledMeetingList.value)
    } catch (e) {
      message.error('加载会议列表失败')
    }
  }









  // 加载：结论列表
  const loadConclusions = async () => {
    try {
      const page = await getMidtermConclusionPage({
        pageNo: conclusionPager.value.pageNo,
        pageSize: conclusionPager.value.pageSize
        // applicationStatus:4
      })
      console.log('获取结论列表API返回值:', page)
      conclusionPager.value.total = page?.total || 0
      stats.value.pendingConclusion = conclusionPager.value.total
      conclusionList.value = (page?.list || []).map((c) => ({
        id: c.id,
        projectId: c.projectId,
        projectName: '',
        projectCode: '',
        meetingTime: '',
        meetingPlace: '',
        conclusionTime: c.conclusionTime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        conclusion: c.conclusionResult === 0 ? 'passed' : c.conclusionResult === 1 ? 'conditional_passed' : 'failed',
        score: c.conclusionScore || 0,
        conclusionDescription: c.conclusionDescription,
        requirements: c.requirements || '',
        conclusionFiles: c.conclusionFiles || [],
        meetingId: c.meetingId,
        conclusionId: c.id,
        midtermApplicationId: c.midtermApplicationId
      }))
      
      // 并行加载项目信息和会议信息
      await Promise.all(
        conclusionList.value.map(async (item) => {
          try {
            // 获取项目信息
            try {
              let projectId = item.projectId;
              
              // 如果没有projectId但有midtermApplicationId，先获取中期申请详情
              if (!projectId && item.midtermApplicationId) {
                const midtermDetail = await thQdMidDetail(item.midtermApplicationId);
                const m = midtermDetail?.data || midtermDetail;
                if (m && m.projectId) {
                  projectId = m.projectId;
                  // 保存projectId以备后续使用
                  item.projectId = projectId;
                }
              }
              
              // 如果有projectId，获取项目详情
              if (projectId) {
                const projectDetail = await getTechnologicalProject(projectId)
                const p = projectDetail?.data || projectDetail
                if (p) {
                  item.projectName = p.projectName || '未命名项目'
                  item.projectCode = p.projectNo || ''
                }
              }
            } catch (e) {
              console.error(`获取结论 ${item.id} 的项目信息失败:`, e)
            }
            
            // 获取会议信息
            if (item.meetingId) {
              const meetingDetail = await getMidtermMeetingDetail(item.meetingId)
              const m = meetingDetail?.data || meetingDetail
              if (m) {
                // 确保会议时间格式正确，如果是时间戳则转换为格式化字符串
                if (m.meetingTime) {
                  // 如果是时间戳数字，转换为日期对象
                  const meetingDate = typeof m.meetingTime === 'number' 
                    ? new Date(m.meetingTime) 
                    : new Date(m.meetingTime)
                  
                  // 检查日期是否有效
                  if (!isNaN(meetingDate.getTime())) {
                    item.meetingTime = dayjs(meetingDate).format('YYYY-MM-DD HH:mm:ss')
                  } else {
                    item.meetingTime = ''
                  }
                } else {
                  item.meetingTime = ''
                }
                
                item.meetingPlace = m.meetingPlace || ''
              }
            }
          } catch (e) {
            console.error(`获取结论 ${item.id} 的会议信息失败:`, e)
          }
        })
      )
    } catch (e) {
      message.error('加载结论列表失败')
    }
  }































  // viewMeetingDetail函数将在原始位置修改

  // 新的会议详情查看函数
  const showMeetingDetail = async (item) => {
    try {
      // 设置加载状态
      loading.value = true
      
      // 显示会议详情，包括会议信息、参会人员、会议资料等
      selectedMeeting.value = item
      
      // 获取会议详细信息
      const meetingDetail = await getMidtermMeetingDetail(item.id)
      console.log('获取会议详情API返回值:', meetingDetail)
      
      // 获取会议参与者
      const participants = await getMidtermMeetingParticipantPage({ meetingId: item.id, pageNo: 1, pageSize: 100 })
      console.log('获取会议参与者API返回值:', participants)
      
      // 获取会议材料
      const materials = await getMidtermMeetingMaterialPage({ meetingId: item.id, pageNo: 1, pageSize: 100 })
      console.log('获取会议材料API返回值:', materials)
      
      // 处理会议详情数据
      meetingDetailData.value = {
        ...meetingDetail,
        participants: participants?.list || [],
        midtermMeetingMaterialDOList: materials?.list || [],
        meetingTimeFormatted: meetingDetail.meetingTime ? dayjs(meetingDetail.meetingTime).format('YYYY-MM-DD HH:mm:ss') : '',
        meetingTypeText: getMeetingTypeText(meetingDetail.meetingType),
        meetingStatusText: getMeetingStatusText(normalizeMeetingStatus(meetingDetail.meetingStatus)),
        meetingStatusColor: getMeetingStatusColor(normalizeMeetingStatus(meetingDetail.meetingStatus))
      }
      
      console.log('处理后的会议详情数据:', meetingDetailData.value)
      
      // 打开会议详情弹窗
      meetingDetailModalVisible.value = true
    } catch (error) {
      console.error('获取会议详情失败:', error)
      message.error('获取会议详情失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  // 处理会议详情弹窗取消
  const handleMeetingDetailCancel = () => {
    meetingDetailModalVisible.value = false
  }

  // 预览会议材料
  const previewMeetingMaterial = (material) => {
    if (!material.fileUrl) {
      message.warning('暂无文件可预览')
      return
    }
    
    // 创建预览文件列表
    previewFileList.value = meetingDetailData.value.midtermMeetingMaterialDOList?.map((x) => ({
      id: x.id,
      name: `${x.materialName}${x.fileSuffix ? '.' + x.fileSuffix : ''}`,
      type: x.fileSuffix,
      size: x.fileSize,
      url: x.fileUrl
    })) || []
    
    // 找到当前文件的索引
    const foundIdx = previewFileList.value.findIndex((x) => x.url === material.fileUrl)
    previewCurrentIndex.value = foundIdx >= 0 ? foundIdx : 0
    if (previewCurrentIndex.value < 0) previewCurrentIndex.value = 0
    
    // 设置当前预览文件
    previewFileInfo.value = previewFileList.value[previewCurrentIndex.value]
    filePreviewVisible.value = true
  }

  </script>

  <style scoped>
  /* 会议结论管理页面样式 */

  /* 分页容器样式 */
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding: 0 8px;
  }

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