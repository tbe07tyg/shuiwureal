<!--
 * @file 申报书解析步骤组件 - 简化版
 * @description 基础版本的申报书解析功能，确保系统正常运行
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-29
-->
<template>
  <div class="proposal-analysis-step-simple">
    <!-- 步骤说明 -->
    <div class="step-description">
      <h3>第二步：申报书内容解析 - 基础版本</h3>
      <p>解析申报书内容，提取关键信息，支持豆包AI智能解析。</p>
      
      <!-- 项目选择器（当没有传入selectedProject且没有路由项目ID时显示） -->
      <div v-if="!props.selectedProject && !route.query.projectId" class="project-selector" style="margin-top: 16px;">
        <a-card size="small" title="项目选择">
          <a-select
            v-model:value="currentProjectId"
            placeholder="请选择立项项目，选择后将自动加载申报书文档"
            show-search
            :filter-option="false"
            :loading="projectsLoading"
            @search="handleProjectSearch"
            @change="handleProjectSelect"
            style="width: 100%;"
          >
            <!-- 调试信息 -->
            <template v-if="availableProjects.length === 0 && !projectsLoading">
              <a-select-option disabled value="">
                暂无可选项目（共{{ availableProjects.length }}个）
              </a-select-option>
            </template>
            <a-select-option 
              v-for="project in availableProjects" 
              :key="project.id" 
              :value="project.id"
            >
              <div class="project-option">
                <div class="project-name">{{ project.projectName }}</div>
                <div class="project-info">
                  <span class="project-id">ID: {{ project.id }}</span>
                  <span class="project-status">{{ project.projectStatus }}</span>
                </div>
              </div>
            </a-select-option>
          </a-select>
          <p style="margin-top: 8px; color: #666; font-size: 12px;">
            💡 提示：选择立项项目后，系统将自动获取该项目的申报书文档并开始解析
          </p>
        </a-card>
      </div>
      
      <!-- 当前项目信息显示（从团队配置跳转过来时显示） -->
      <div v-if="fromTeamConfig && currentProjectId" class="current-project-info" style="margin-top: 16px;">
        <a-card size="small">
          <template #title>
            <span style="color: #1890ff;">
              <FileTextOutlined style="margin-right: 8px;" />
              当前项目
            </span>
          </template>
          <template #extra>
            <a-button size="small" @click="changeProject">
              <ReloadOutlined />
              切换项目
            </a-button>
          </template>
          <div class="project-info-content">
            <p><strong>项目ID:</strong> {{ currentProjectId }}</p>
            <p v-if="currentProjectInfo.projectName"><strong>项目名称:</strong> {{ currentProjectInfo.projectName }}</p>
            <p v-if="currentProjectInfo.projectStatus"><strong>项目状态:</strong> {{ currentProjectInfo.projectStatus }}</p>
            <p style="color: #52c41a; margin-bottom: 0;">
              <CheckOutlined style="margin-right: 4px;" />
              已从团队配置自动选择此项目
            </p>
          </div>
        </a-card>
      </div>
      
      <a-alert
        message="功能说明"
        type="info"
        show-icon
        style="margin-top: 12px;"
      >
        <template #description>
          <p>本页面展示申报书解析的核心功能，包括PDF预览、内容解析和任务提取。</p>
        </template>
      </a-alert>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 文档操作区 -->
      <a-card title="📄 申报书文档" class="document-card" style="margin-bottom: 16px;">
        <div class="document-actions">
          <a-space size="large">
            <!-- 文档信息 -->
            <div class="document-info-section">
              <div class="document-source">
                <a-descriptions :column="2" size="small">
                  <a-descriptions-item label="文档来源">
                    项目立项时上传
                  </a-descriptions-item>
                  <a-descriptions-item label="文档名称">
                    {{ currentFileName || DEFAULT_DOCX_NAME }}
                  </a-descriptions-item>
                  <a-descriptions-item label="项目名称">
                    {{ selectedProject?.name || '智能水务管理系统研发项目' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="状态">
                    <a-tag v-if="documentLoaded" color="green">已加载</a-tag>
                    <a-tag v-else color="orange">待加载</a-tag>
                  </a-descriptions-item>
                </a-descriptions>

                <!-- 文件列表展示 -->
                <div v-if="availableDocuments.length > 0" class="document-list" style="margin-top: 12px;">
                  <h4 style="margin-bottom: 8px; font-size: 14px;">项目文档列表 ({{ availableDocuments.length }}个)</h4>
                  <a-list size="small" :data-source="availableDocuments" style="max-height: 200px; overflow-y: auto;">
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-list-item-meta>
                          <template #title>
                            <span :style="{ fontWeight: item.id === selectedDocumentId ? 'bold' : 'normal', color: item.id === selectedDocumentId ? '#1890ff' : 'inherit' }">
                              {{ item.materialName || item.fileName || '未命名文档' }}
                            </span>
                          </template>
                          <template #description>
                            <span style="font-size: 12px;">
                              {{ item.fileType || '未知类型' }} · {{ formatFileSize(item.fileSize) }}
                            </span>
                          </template>
                        </a-list-item-meta>
                        <template #extra>
                          <a-tag v-if="item.id === selectedDocumentId" color="green">当前使用</a-tag>
                          <a-button v-else size="small" @click="switchDocument(item)">切换</a-button>
                        </template>
                      </a-list-item>
                    </template>
                  </a-list>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="action-buttons">
              <a-space>
                <a-button @click="showPreviewModal">
                  <EyeOutlined />
                  {{ pdfUrl ? 'PDF预览' : '文档预览' }}
                </a-button>
                <a-button @click="showDoubaoGuide">
                  <BulbOutlined />
                  豆包解析指南
                </a-button>
                <a-button @click="showImageLibrary" :disabled="!documentLoaded">
                  <FileImageOutlined />
                  提取并查看图片 ({{ documentImages.length }})
                </a-button>
              </a-space>
            </div>
          </a-space>
        </div>
      </a-card>
      
      <!-- 豆包智能解析区 -->
      <a-card title="🤖 豆包智能解析" class="doubao-analysis-card" style="margin-bottom: 16px;">
        <a-alert
          message="智能解析说明"
          type="info"
          show-icon
          style="margin-bottom: 16px;"
        >
          <template #description>
            <div>
              <p>🎯 <strong>三步完成智能解析：</strong></p>
              <ol style="margin: 8px 0 0 20px; padding: 0;">
                <li>点击"复制到豆包"按钮，自动复制专业提示词</li>
                <li>在豆包AI中粘贴并获取JSON格式分析结果</li>
                <li>点击"粘贴结果"按钮，将结果导入系统</li>
              </ol>
              <p style="margin-top: 8px; color: #666;">💡 建议按顺序完成三个模块，获得完整的项目分析</p>
            </div>
          </template>
        </a-alert>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="analysis-option-card" hoverable>
              <div class="analysis-option">
                <div class="option-header">
                  <div class="option-icon">ℹ️</div>
                  <h4>项目基本信息提取</h4>
                </div>
                <p>提取项目的核心信息，如名称、单位、负责人、预算等，快速生成结构化数据。</p>
                <a-button
                  block
                  type="primary"
                  @click="prepareTextForDoubao('basicInfo')"
                  :disabled="!documentLoaded"
                >
                  复制纯文本到豆包
                </a-button>
                <a-button
                  block
                  style="margin-top: 8px;"
                  @click="showPasteModal('basicInfo')"
                >
                  粘贴结果
                </a-button>
              </div>
            </a-card>
          </a-col>
          
          <a-col :span="8">
            <a-card class="analysis-option-card" hoverable>
              <div class="analysis-option">
                <div class="option-header">
                  <div class="option-icon">📋</div>
                  <h4>实施方案分析</h4>
                </div>
                <p>分析项目的实施方案、计划进度和预期成果，评估项目的可行性和风险。</p>
                <a-button
                  block
                  type="primary"
                  @click="prepareTextForDoubao('implementation')"
                  :disabled="!documentLoaded"
                >
                  复制纯文本到豆包
                </a-button>
                <a-button
                  block
                  style="margin-top: 8px;"
                  @click="showPasteModal('implementation')"
                >
                  粘贴结果
                </a-button>
              </div>
            </a-card>
          </a-col>
          
          <a-col :span="8">
            <a-card class="analysis-option-card" hoverable>
              <div class="analysis-option">
                <div class="option-header">
                  <div class="option-icon">🛤️</div>
                  <h4>技术路线梳理</h4>
                </div>
                <p>梳理项目的技术路线、关键技术和技术架构，形成清晰的技术方案脉络。</p>
                <a-button
                  block
                  type="primary"
                  @click="prepareTextForDoubao('technicalRoute')"
                  :disabled="!documentLoaded"
                >
                  复制纯文本到豆包
                </a-button>
                <a-button
                  block
                  style="margin-top: 8px;"
                  @click="showPasteModal('technicalRoute')"
                >
                  粘贴结果
                </a-button>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
      
      <!-- 解析结果区 -->
      <div class="analysis-section">
        <a-card title="📊 解析结果汇总" class="analysis-card">
          <template #extra>
            <a-space>
              <a-button v-if="!isEditing" @click="enterEdit" :disabled="!hasAnyResult">编辑</a-button>
              <a-button @click="showDoubaoGuide">
                <BulbOutlined />
                豆包解析指南
              </a-button>
            </a-space>
          </template>
          
          <!-- 编辑工具条（CSS粘性） -->
          <div v-if="isEditing" class="edit-toolbar edit-toolbar--sticky">
            <a-space>
              <a-button type="primary" @click="saveEdit">保存</a-button>
              <a-button @click="cancelEdit">取消</a-button>
              <a-tooltip title="将本区块恢复为最近一次粘贴的AI解析结果，不影响AI原结果，可再次编辑。">
                <a-button @click="restoreCurrentBlock">还原为解析结果（撤销手工修改）</a-button>
              </a-tooltip>
            </a-space>
          </div>

          <!-- 解析结果展示：任意模块完成即展示 -->
          <div v-if="hasAnyResult" class="analysis-results">
            <a-alert
              :message="`已完成 ${completedCount}/3 个模块，您可继续粘贴剩余模块的结果。全部完成后可进入下一步。`"
              type="info"
              show-icon
              style="margin-bottom: 12px;"
            />
            <a-tabs v-model:activeKey="activeTabKey">
              <a-tab-pane key="overview" tab="项目概况">
                <div class="result-section" v-if="hasBasicInfo && !isEditing">
                  <h4>基本信息</h4>
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="项目名称">
                      {{ analysisData.projectName }}
                      <a-tooltip v-if="basicInfoOrigin.projectName" :title="originTitle(basicInfoOrigin.projectName)">
                        <a-tag size="small" :color="originColor(basicInfoOrigin.projectName.type)" style="margin-left:6px;">{{ originLabel(basicInfoOrigin.projectName.type) }}</a-tag>
                      </a-tooltip>
                    </a-descriptions-item>
                    <a-descriptions-item label="申请单位">
                      {{ analysisData.applicantUnit }}
                      <a-tooltip v-if="basicInfoOrigin.applicantUnit" :title="originTitle(basicInfoOrigin.applicantUnit)">
                        <a-tag size="small" :color="originColor(basicInfoOrigin.applicantUnit.type)" style="margin-left:6px;">{{ originLabel(basicInfoOrigin.applicantUnit.type) }}</a-tag>
                      </a-tooltip>
                    </a-descriptions-item>
                    <a-descriptions-item label="项目负责人">
                      {{ analysisData.leader }}
                      <a-tooltip v-if="basicInfoOrigin.leader" :title="originTitle(basicInfoOrigin.leader)">
                        <a-tag size="small" :color="originColor(basicInfoOrigin.leader.type)" style="margin-left:6px;">{{ originLabel(basicInfoOrigin.leader.type) }}</a-tag>
                      </a-tooltip>
                    </a-descriptions-item>
                    <a-descriptions-item label="申报时间">
                      {{ analysisData.applicationDate }}
                      <a-tooltip v-if="basicInfoOrigin.applicationDate" :title="originTitle(basicInfoOrigin.applicationDate)">
                        <a-tag size="small" :color="originColor(basicInfoOrigin.applicationDate.type)" style="margin-left:6px;">{{ originLabel(basicInfoOrigin.applicationDate.type) }}</a-tag>
                      </a-tooltip>
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
                <div class="result-section" v-else-if="isEditing">
                  <h4>基本信息（编辑）</h4>
                  <a-form layout="vertical">
                    <a-row :gutter="12">
                      <a-col :span="12">
                        <a-form-item label="项目名称"><a-input v-model:value="draftBasicInfo.projectName" /></a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="申请单位"><a-input v-model:value="draftBasicInfo.applicantUnit" /></a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="项目负责人"><a-input v-model:value="draftBasicInfo.leader" /></a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="申报时间"><a-input v-model:value="draftBasicInfo.applicationDate" placeholder="例如：2025-03-01" /></a-form-item>
                      </a-col>
                    </a-row>
                  </a-form>
                </div>
                <div class="content-display" v-else>
                  暂未解析
                </div>

                <a-divider />
                <div class="revision-panel">
                  <h4>✏️ 修改意见（项目概况）</h4>
                  <a-textarea
                    v-model:value="revisionNotes.basicInfo"
                    :rows="4"
                    placeholder="在此输入对已生成‘项目概况’的修改意见，例如：负责人改为李教授，申报时间改为2025-03-01"
                  />
                  <a-space style="margin-top: 8px;">
                    <a-button type="primary" @click="reviseAndCopyToDoubao('basicInfo')" :disabled="!doubaoAnalysisResults.basicInfo">
                      一键再次粘贴给豆包
                    </a-button>
                    <a-button @click="clearRevisionNotes('basicInfo')" type="dashed">清空修改意见</a-button>
                  </a-space>
                  <p class="revision-hint">说明：会基于当前JSON结果与您的修改意见，自动生成新的提示词并复制到剪贴板。</p>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="implementation" tab="实施方案">
                <div class="result-section" v-if="!isEditing">
                  <h4>实施方案内容</h4>
                  <div class="content-display">
                    <template v-if="implementationPlanObj">
                      <div v-if="implementationPlanObj.totalDuration" class="kv" style="margin-bottom:8px;">
                        <span class="k">总周期</span>
                        <span>
                          {{ implementationPlanObj.totalDuration }}
                          <a-tooltip v-if="implementationPlanObj.origin && implementationPlanObj.origin.totalDuration" :title="originTitle(implementationPlanObj.origin.totalDuration)">
                            <a-tag size="small" :color="originColor(implementationPlanObj.origin.totalDuration.type)" style="margin-left:6px;">{{ originLabel(implementationPlanObj.origin.totalDuration.type) }}</a-tag>
                          </a-tooltip>
                        </span>
                      </div>
                      <div v-if="implementationPhases && implementationPhases.length">
                        <div class="phase" v-for="(ph, idx) in implementationPhases" :key="idx">
                          <h5 style="margin:0 0 6px 0;">{{ ph.phaseName || ('阶段' + (idx+1)) }}
                            <a-tooltip v-if="ph.origin && ph.origin.phaseName" :title="originTitle(ph.origin.phaseName)">
                              <a-tag size="small" :color="originColor(ph.origin.phaseName.type)" style="margin-left:6px;">{{ originLabel(ph.origin.phaseName.type) }}</a-tag>
                            </a-tooltip>
                          </h5>
                          <div class="kv"><span class="k">目标</span><span>{{ Array.isArray(ph.objectives) ? ph.objectives.join('、') : (ph.objectives || '-') }}
                            <a-tooltip v-if="ph.origin && ph.origin.objectives" :title="originTitle(ph.origin.objectives)">
                              <a-tag size="small" :color="originColor(ph.origin.objectives.type)" style="margin-left:6px;">{{ originLabel(ph.origin.objectives.type) }}</a-tag>
                            </a-tooltip>
                          </span></div>
                          <div class="kv"><span class="k">活动</span><span>{{ Array.isArray(ph.activities) ? ph.activities.join('、') : (ph.activities || '-') }}
                            <a-tooltip v-if="ph.origin && ph.origin.activities" :title="originTitle(ph.origin.activities)">
                              <a-tag size="small" :color="originColor(ph.origin.activities.type)" style="margin-left:6px;">{{ originLabel(ph.origin.activities.type) }}</a-tag>
                            </a-tooltip>
                          </span></div>
                          <div class="kv"><span class="k">里程碑</span><span>{{ Array.isArray(ph.milestones) ? ph.milestones.join('、') : (ph.milestones || '-') }}
                            <a-tooltip v-if="ph.origin && ph.origin.milestones" :title="originTitle(ph.origin.milestones)">
                              <a-tag size="small" :color="originColor(ph.origin.milestones.type)" style="margin-left:6px;">{{ originLabel(ph.origin.milestones.type) }}</a-tag>
                            </a-tooltip>
                          </span></div>
                          <div class="kv"><span class="k">预算</span><span>{{ ph.budget || '-' }}
                            <a-tooltip v-if="ph.origin && ph.origin.budget" :title="originTitle(ph.origin.budget)">
                              <a-tag size="small" :color="originColor(ph.origin.budget.type)" style="margin-left:6px;">{{ originLabel(ph.origin.budget.type) }}</a-tag>
                            </a-tooltip>
                          </span></div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <pre class="code-block">{{ analysisData.implementationPlan }}</pre>
                    </template>
                  </div>
                  
                  <h4 v-if="hasImplementation && extractedTasks.implementation.length > 0">提取的任务 ({{ extractedTasks.implementation.length }}个)</h4>
                  <div v-if="hasImplementation && extractedTasks.implementation.length > 0" class="task-list">
                    <div v-for="task in extractedTasks.implementation" :key="task.id" class="task-item">
                      <div class="task-header">
                        <span class="task-name">{{ task.name }}</span>
                        <span class="task-priority">
                          <span class="priority-title">优先级：</span>
                        <a-tag :color="getTaskPriorityColor(task.priority)">
                            {{ getPriorityText(task.priority) }}
                        </a-tag>
                        </span>
                      </div>
                      <p class="task-description">{{ task.description }}</p>
                      <div class="task-meta">
                        <span>工期：{{ task.duration }}天</span>
                        <span>交付物：{{ task.deliverables.join('、') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="result-section" v-else>
                  <h4>实施方案（编辑）</h4>
                  <a-form layout="vertical">
                    <a-form-item label="总周期"><a-input v-model:value="editImplDuration" placeholder="例如：16个月" /></a-form-item>
                    <a-divider />
                    <a-space style="margin-bottom: 12px;">
                      <a-button type="primary" @click="addImplementationPhase">新增阶段</a-button>
                      <a-button danger @click="clearImplementationPhases" :disabled="editImplPhases.length===0">清空阶段</a-button>
                      <a-button @click="resetImplementationPhases" :disabled="editImplPhases.length===0">重置为原始数据</a-button>
                    </a-space>
                    <draggable 
                      v-model="editImplPhases" 
                      item-key="id"
                      handle=".drag-handle"
                      @change="onImplementationPhasesChange"
                      class="draggable-container"
                    >
                      <template #item="{ element: p, index: idx }">
                        <div class="phase draggable-phase">
                          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px;">
                            <div style="display:flex; align-items:center;">
                              <span class="drag-handle" style="cursor: move; margin-right: 8px; color: #8c8c8c;">
                                <HolderOutlined />
                              </span>
                              <h5 style="margin:0;">阶段 {{ idx + 1 }}</h5>
                            </div>
                            <a-button size="small" danger @click="removeImplementationPhase(idx)">删除阶段</a-button>
                          </div>
                          <a-row :gutter="12">
                            <a-col :span="12"><a-form-item label="阶段名称"><a-input v-model:value="p.phaseName" /></a-form-item></a-col>
                            <a-col :span="12"><a-form-item label="预算"><a-input v-model:value="p.budget" /></a-form-item></a-col>
                            <a-col :span="24"><a-form-item label="目标（分号；分隔）"><a-textarea v-model:value="p.objectivesText" :rows="2" /></a-form-item></a-col>
                            <a-col :span="24"><a-form-item label="活动（分号；分隔）"><a-textarea v-model:value="p.activitiesText" :rows="2" /></a-form-item></a-col>
                            <a-col :span="24"><a-form-item label="里程碑（分号；分隔）"><a-textarea v-model:value="p.milestonesText" :rows="2" /></a-form-item></a-col>
                          </a-row>
                        </div>
                      </template>
                    </draggable>
                  </a-form>
                </div>

                <a-divider />
                <div class="revision-panel">
                  <h4>✏️ 修改意见（实施方案）</h4>
                  <a-textarea
                    v-model:value="revisionNotes.implementation"
                    :rows="4"
                    placeholder="在此输入对已生成‘实施方案’的修改意见，例如：阶段2的预算调整为100万；新增里程碑‘试点部署验收’在第16月。"
                  />
                  <a-space style="margin-top: 8px;">
                    <a-button type="primary" @click="reviseAndCopyToDoubao('implementation')" :disabled="!doubaoAnalysisResults.implementation">
                      一键再次粘贴给豆包
                    </a-button>
                    <a-button @click="clearRevisionNotes('implementation')" type="dashed">清空修改意见</a-button>
                  </a-space>
                  <p class="revision-hint">说明：会基于当前JSON结果与您的修改意见，自动生成新的提示词并复制到剪贴板。</p>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="technical" tab="技术路线">
                <div class="result-section" v-if="!isEditing">
                  <h4>技术路线内容</h4>
                  <div class="content-display">
                    <template v-if="hasTechnicalRoute">
                      <div v-if="technicalRoutePhases && technicalRoutePhases.length">
                        <div class="phase" v-for="(ph, idx) in technicalRoutePhases" :key="idx">
                          <h5 style="margin:0 0 6px 0;">{{ ph.phase || ('阶段' + (idx+1)) }}
                            <a-tooltip v-if="ph.origin && ph.origin.phase" :title="originTitle(ph.origin.phase)">
                              <a-tag size="small" :color="originColor(ph.origin.phase.type)" style="margin-left:6px;">{{ originLabel(ph.origin.phase.type) }}</a-tag>
                            </a-tooltip>
                          </h5>
                          <div class="kv"><span class="k">关键技术</span><span>{{ Array.isArray(ph.keyTechnologies) ? ph.keyTechnologies.join('、') : (ph.keyTechnologies || '-') }}</span></div>
                          <div class="kv" v-if="ph.origin && ph.origin.keyTechnologies"><span class="k"></span><span><a-tooltip :title="originTitle(ph.origin.keyTechnologies)"><a-tag :color="originColor(ph.origin.keyTechnologies.type)">{{ originLabel(ph.origin.keyTechnologies.type) }}</a-tag></a-tooltip></span></div>
                          <div class="kv"><span class="k">主要任务</span><span>{{ Array.isArray(ph.mainTasks) ? ph.mainTasks.join('、') : (ph.mainTasks || '-') }}</span></div>
                          <div class="kv" v-if="ph.origin && ph.origin.mainTasks"><span class="k"></span><span><a-tooltip :title="originTitle(ph.origin.mainTasks)"><a-tag :color="originColor(ph.origin.mainTasks.type)">{{ originLabel(ph.origin.mainTasks.type) }}</a-tag></a-tooltip></span></div>
                          <div class="kv"><span class="k">交付物</span><span>{{ Array.isArray(ph.deliverables) ? ph.deliverables.join('、') : (ph.deliverables || '-') }}</span></div>
                          <div class="kv" v-if="ph.origin && ph.origin.deliverables"><span class="k"></span><span><a-tooltip :title="originTitle(ph.origin.deliverables)"><a-tag :color="originColor(ph.origin.deliverables.type)">{{ originLabel(ph.origin.deliverables.type) }}</a-tag></a-tooltip></span></div>
                        </div>
                      </div>
                      <pre v-else class="code-block">{{ analysisData.technicalRoute }}</pre>
                    </template>
                    <p v-else>暂未解析</p>
                  </div>
                  
                  <h4 v-if="hasTechnicalRoute && extractedTasks.technical.length > 0">技术任务 ({{ extractedTasks.technical.length }}个)</h4>
                  <div v-if="hasTechnicalRoute && extractedTasks.technical.length > 0" class="task-list">
                    <div v-for="task in extractedTasks.technical" :key="task.id" class="task-item">
                      <div class="task-header">
                        <span class="task-name">{{ task.name }}</span>
                        <a-tag color="green">技术任务</a-tag>
                      </div>
                      <p class="task-description">{{ task.description }}</p>
                      <div class="task-meta">
                        <span>难度：{{ task.difficulty }}</span>
                        <span>关键技术：{{ task.keyTechnologies.join('、') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="result-section" v-else>
                  <h4>技术路线（编辑）</h4>
                  <a-space style="margin-bottom: 12px;">
                    <a-button type="primary" @click="addTechnicalPhase">新增阶段</a-button>
                    <a-button danger @click="clearTechnicalPhases" :disabled="editTechPhases.length===0">清空阶段</a-button>
                    <a-button @click="resetTechnicalPhases" :disabled="editTechPhases.length===0">重置为原始数据</a-button>
                  </a-space>
                  <draggable 
                    v-model="editTechPhases" 
                    item-key="id"
                    handle=".drag-handle"
                    @change="onTechnicalPhasesChange"
                    class="draggable-container"
                  >
                    <template #item="{ element: t, index: idx }">
                      <div class="phase draggable-phase">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px;">
                          <div style="display:flex; align-items:center;">
                            <span class="drag-handle" style="cursor: move; margin-right: 8px; color: #8c8c8c;">
                              <HolderOutlined />
                            </span>
                            <h5 style="margin:0;">阶段 {{ idx + 1 }}</h5>
                          </div>
                          <a-button size="small" danger @click="removeTechnicalPhase(idx)">删除阶段</a-button>
                        </div>
                        <a-form layout="vertical">
                          <a-row :gutter="12">
                            <a-col :span="12"><a-form-item label="阶段名称"><a-input v-model:value="t.phase" /></a-form-item></a-col>
                            <a-col :span="24"><a-form-item label="关键技术（分号；分隔）"><a-textarea v-model:value="t.keyTechnologiesText" :rows="2" /></a-form-item></a-col>
                            <a-col :span="24"><a-form-item label="主要任务（分号；分隔）"><a-textarea v-model:value="t.mainTasksText" :rows="2" /></a-form-item></a-col>
                            <a-col :span="24"><a-form-item label="交付物（分号；分隔）"><a-textarea v-model:value="t.deliverablesText" :rows="2" /></a-form-item></a-col>
                          </a-row>
                        </a-form>
                      </div>
                    </template>
                  </draggable>
                </div>

                <a-divider />
                <div class="revision-panel">
                  <h4>✏️ 修改意见（技术路线）</h4>
                  <a-textarea
                    v-model:value="revisionNotes.technicalRoute"
                    :rows="4"
                    placeholder="在此输入对已生成‘技术路线’的修改意见，例如：阶段A关键技术增加‘数字孪生’，阶段B风险等级调整为中。"
                  />
                  <a-space style="margin-top: 8px;">
                    <a-button type="primary" @click="reviseAndCopyToDoubao('technicalRoute')" :disabled="!doubaoAnalysisResults.technicalRoute">
                      一键再次粘贴给豆包
                    </a-button>
                    <a-button @click="clearRevisionNotes('technicalRoute')" type="dashed">清空修改意见</a-button>
                  </a-space>
                  <p class="revision-hint">说明：会基于当前JSON结果与您的修改意见，自动生成新的提示词并复制到剪贴板。</p>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="schedule" tab="进度计划">
                <div class="result-section" v-if="!isEditing">
                  <h4>
                    进度安排
                    <a-tooltip placement="right" :title="'数据来源：来自实施方案（implementationPlan.totalDuration 与 phases[].milestones；必要时结合 startMonth/endMonth 推算）'">
                      <InfoCircleOutlined style="margin-left: 6px; color: #8c8c8c;" />
                    </a-tooltip>
                  </h4>
                  <div class="content-display">
                    <template v-if="displayScheduleObj">
                      <p>{{ scheduleSummaryText }}</p>
                    </template>
                    <template v-else>
                      <p v-if="hasImplementation">{{ scheduleSummaryText }}</p>
                      <p v-else>暂未解析</p>
                    </template>
                  </div>
                  
                  <h4 v-if="hasImplementation && displayMilestones.length > 0">里程碑 ({{ displayMilestones.length }}个)</h4>
                  <div v-if="hasImplementation && displayMilestones.length > 0" class="milestone-list">
                    <a-timeline>
                      <a-timeline-item 
                        v-for="milestone in displayMilestones" 
                        :key="milestone.id"
                        :color="getMilestoneColor(milestone.status)"
                      >
                        <h5>{{ milestone.name }}</h5>
                        <p v-if="milestone.description">{{ milestone.description }}</p>
                        <div class="milestone-meta">
                          <span v-if="milestone.plannedDate">计划时间：{{ milestone.plannedDate }}</span>
                          <span v-if="milestone.criteria && milestone.criteria.length">验收标准：{{ milestone.criteria.join('、') }}</span>
                        </div>
                      </a-timeline-item>
                    </a-timeline>
                  </div>
                </div>
                <div class="result-section" v-else>
                  <h4>进度计划（编辑）</h4>
                  <a-form layout="vertical">
                    <a-form-item label="总周期"><a-input v-model:value="editImplDuration" placeholder="例如：16个月" /></a-form-item>
                    <a-divider />
                    <a-space style="margin-bottom: 12px;">
                      <a-button type="primary" @click="addScheduleMilestone">新增里程碑</a-button>
                      <a-button danger @click="clearScheduleMilestones" :disabled="editScheduleMilestones.length===0">清空里程碑</a-button>
                    </a-space>
                    <div v-for="(m, idx) in editScheduleMilestones" :key="idx" class="phase">
                      <div style="display:flex; align-items:center; justify-content:space-between;">
                        <h5 style="margin:0;">里程碑 {{ idx + 1 }}</h5>
                        <a-button size="small" danger @click="removeScheduleMilestone(idx)">删除</a-button>
                      </div>
                      <a-row :gutter="12">
                        <a-col :span="12"><a-form-item label="名称"><a-input v-model:value="m.name" /></a-form-item></a-col>
                        <a-col :span="12"><a-form-item label="计划时间"><a-input v-model:value="m.plannedDate" placeholder="例如：2025-06-30" /></a-form-item></a-col>
                        <a-col :span="24"><a-form-item label="验收标准（分号；分隔）"><a-textarea v-model:value="m.criteriaText" :rows="2" /></a-form-item></a-col>
                      </a-row>
                    </div>
                  </a-form>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
          
          <!-- 空状态：无任何结果时显示 -->
          <div v-if="!hasAnyResult" class="empty-state">
            <a-empty description="使用豆包智能解析提取申报书关键信息">
              <a-button type="primary" @click="showDoubaoGuide">
                查看解析指南
              </a-button>
            </a-empty>
          </div>
        </a-card>
      </div>
    </div>

    

    <!-- 操作区域：仅保留“下一步” -->
    <div class="operation-area" v-if="hasAnyResult">
      <a-card title="📋 操作选项">
        <a-space>
          <a-button @click="goToNextStep" type="primary">
            <ArrowRightOutlined />
            {{ analysisCompleted ? '下一步' : '下一步（可稍后补齐）' }}
          </a-button>
        </a-space>
      </a-card>
    </div>

    <!-- 文档预览模态框 -->
    <a-modal
      v-model:open="previewVisible"
      title="📄 申报书预览"
      width="80%"
      :footer="null"
      :style="{ top: '20px' }"
    >
      <div class="document-preview-modal">
        <div class="preview-header">
          <a-space>
            <span>{{ currentFileName }}</span>
            <a-tag color="blue">{{ formatFileSize(currentFileSize) }}</a-tag>
            <a-tag color="green">
              PDF预览
            </a-tag>
            <a-button size="small" @click="downloadDocument" :disabled="!documentContent">
              <DownloadOutlined />
              下载
            </a-button>
          </a-space>
        </div>
        
        <a-divider style="margin: 12px 0;" />
        
        <div class="preview-content">
          <!-- HTML内容预览 -->
          <div v-if="documentHtml" ref="previewContainer" class="word-content" v-html="documentHtml"></div>
          
          <!-- 加载失败状态 -->
          <div v-else class="empty-content">
            <a-empty description="文档预览加载失败">
              <template #image>
                <div style="font-size: 48px; color: #ff4d4f;">📄</div>
              </template>
              <p style="color: #666; margin-top: 16px;">
                无法加载文档预览，请检查文件格式或联系管理员
              </p>
              <a-button type="primary" @click="loadProjectDocument" :loading="documentLoading">
                重新加载
              </a-button>
            </a-empty>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 新增：图片备用库 弹窗 -->
    <a-modal
      v-model:open="imageLibraryVisible"
      title="🖼️ 图片备用库"
      width="90%"
      :footer="null"
    >
      <div class="image-library-modal">
        <a-alert
          message="操作指南"
          type="info"
          show-icon
          style="margin-bottom: 20px;"
        >
          <template #description>
            <p>这里是申报书中提取的所有图片。当您在豆包中看到 <code>[图片x]</code> 占位符时，请切换回此窗口，点击对应图片下方的“复制”按钮，然后切回豆包粘贴即可。</p>
          </template>
        </a-alert>

        <div v-if="documentImages.length > 0" class="image-grid">
          <a-card 
            v-for="(image, index) in documentImages" 
            :key="index" 
            class="image-card"
            hoverable
          >
            <template #cover>
              <div class="image-preview-container">
                <img :src="image.src" alt="文档图片" class="image-preview" />
              </div>
            </template>
            <a-card-meta>
              <template #title>
                <span class="image-title">图片 {{ index + 1 }}</span>
              </template>
              <template #description>
                <a-button 
                  type="primary" 
                  @click="copyImageToClipboard(image.blob, index + 1)"
                  block
                  class="copy-image-btn"
                >
                  <CopyOutlined /> 复制此图片
                </a-button>
              </template>
            </a-card-meta>
          </a-card>
        </div>
        <a-empty v-else description="文档中未发现任何图片" />
      </div>
    </a-modal>

    <!-- 豆包解析指南模态框 -->
    <a-modal
      v-model:open="guideVisible"
      title="🤖 豆包智能解析指南"
      width="800px"
      :footer="null"
    >
      <div class="guide-content">
        <a-alert
          message="使用说明"
          description="豆包智能解析分为三个独立模块，每个模块都有专门的提示词和结果处理。"
          type="info"
          show-icon
          style="margin-bottom: 16px;"
        />
        
        <a-steps direction="vertical" size="small">
          <a-step title="第一步：选择解析模块">
            <template #description>
              <p>在上方"豆包智能解析"区域选择要分析的模块：</p>
              <ul>
                <li><strong>项目基本信息提取</strong>：提取项目名称、负责人、预算等基础信息</li>
                <li><strong>技术路线梳理</strong>：分析技术实施路径和关键技术点</li>
                <li><strong>实施方案分析</strong>：解析项目实施计划和资源配置</li>
              </ul>
            </template>
          </a-step>
          
          <a-step title="第二步：复制提示词">
            <template #description>
              <p>点击对应模块的"复制到豆包"按钮，系统会自动复制专门的提示词和申报书内容到剪贴板。</p>
            </template>
          </a-step>
          
          <a-step title="第三步：豆包分析">
            <template #description>
              <p>打开豆包AI，粘贴提示词，等待豆包返回JSON格式的分析结果。</p>
            </template>
          </a-step>
          
          <a-step title="第四步：导入结果">
            <template #description>
              <p>点击对应模块的"粘贴结果"按钮，将豆包返回的JSON结果导入系统。</p>
            </template>
          </a-step>
        </a-steps>
        
        <a-divider />
        
        <div class="guide-tips">
          <h4>💡 使用提示：</h4>
          <ul>
            <li>建议按顺序完成三个模块的分析</li>
            <li>每个模块都有专门优化的提示词，分析结果更准确</li>
            <li>完成所有模块后，系统会自动汇总分析结果</li>
            <li>如果豆包返回格式有误，可以要求重新分析</li>
          </ul>
        </div>
      </div>
    </a-modal>

    <!-- 粘贴豆包结果弹窗 -->
    <a-modal
      v-model:open="pasteModalVisible"
      title="粘贴豆包解析结果"
      width="800px"
      :footer="null"
    >
      <div class="paste-result-modal">
        <a-alert
          message="操作说明"
          description="请将豆包返回的JSON格式解析结果完整粘贴到下方文本框中。"
          type="info"
          show-icon
          style="margin-bottom: 16px;"
        />
        
        <a-form layout="vertical">
          <a-form-item label="豆包解析结果（JSON格式）">
                <a-textarea
              v-model:value="pasteResultText"
                  placeholder="请粘贴豆包返回的JSON解析结果..."
              :rows="12"
              style="font-family: 'Courier New', monospace; font-size: 13px;"
                />
          </a-form-item>
          
          <a-form-item>
            <a-space>
                <a-button 
                  type="primary" 
                @click="processPasteResult"
                :disabled="!pasteResultText.trim()"
                >
                  <CheckOutlined />
                导入结果
                </a-button>
              <a-button @click="pasteModalVisible = false">
                取消
              </a-button>
              <a-button @click="pasteResultText = ''" type="dashed">
                清空
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
        
        <a-divider />
        
        <div class="paste-tips">
          <h4>💡 粘贴提示：</h4>
          <ul>
            <li>确保粘贴的是完整的JSON格式内容</li>
            <li>JSON内容应该包含豆包分析的所有字段</li>
            <li>如果格式错误，系统会提示具体的错误信息</li>
            <li>导入成功后，结果会自动填充到对应的分析模块</li>
              </ul>
        </div>
      </div>
    </a-modal>
    
    <!-- 文档选择弹窗 -->
    <a-modal
      v-model:open="documentSelectionVisible"
      title="选择申报书文档"
      width="800px"
      :confirmLoading="documentSelectionLoading"
      @ok="confirmDocumentSelection"
      @cancel="cancelDocumentSelection"
      :footer="availableDocuments.length > 0 ? undefined : null"
    >
      <div class="document-selection-modal">
        <a-alert
          message="智能文档选择"
          type="info"
          show-icon
          style="margin-bottom: 20px;"
        >
          <template #description>
            <p>系统已为您找到以下申报书文档，请选择要解析的文档。系统会优先推荐 docx 格式且包含"正式"关键词的文档。</p>
          </template>
        </a-alert>

        <!-- 有文档时显示文档列表 -->
        <div v-if="availableDocuments.length > 0">
          <a-radio-group v-model:value="selectedDocumentId" style="width: 100%;">
            <div class="document-list">
              <a-card 
                v-for="doc in availableDocuments" 
                :key="doc.id"
                class="document-card"
                :class="{ 'selected': selectedDocumentId === doc.id }"
                hoverable
                @click="selectedDocumentId = doc.id"
              >
                <div class="document-info">
                  <a-radio :value="doc.id" style="margin-right: 12px;" />
                  <div class="document-details">
                    <div class="document-name">
                      <FileTextOutlined style="margin-right: 8px; color: #1890ff;" />
                      <strong>{{ doc.materialName || doc.fileName || '未知文件' }}</strong>
                      <a-tag v-if="(doc.materialName || doc.fileName) && (doc.materialName || doc.fileName).includes('正式')" color="green" size="small" style="margin-left: 8px;">
                        推荐
                      </a-tag>
                    </div>
                    <div class="document-meta">
                      <span class="meta-item">
                        <strong>类型:</strong> {{ (doc.fileSuffix || doc.fileExtension || doc.fileType)?.toUpperCase() || 'Unknown' }}
                      </span>
                      <span class="meta-item">
                        <strong>大小:</strong> {{ formatFileSize(doc.fileSize) }}
                      </span>
                      <span class="meta-item">
                        <strong>上传时间:</strong> {{ formatDate(doc.uploadTime) }}
                      </span>
                    </div>
                  </div>
                </div>
              </a-card>
            </div>
          </a-radio-group>
        </div>

        <!-- 无文档时显示空状态 -->
        <div v-else class="empty-documents">
          <a-empty description="当前项目暂无申报书文档">
            <template #image>
              <div style="font-size: 64px; color: #faad14;">📄</div>
            </template>
            <template #description>
              <div style="color: #666; margin-bottom: 16px;">
                <p><strong>当前项目尚未上传申报书文档</strong></p>
                <p>请按以下步骤处理：</p>
              </div>
            </template>
            <a-space direction="vertical" size="middle" style="width: 100%;">
              <a-alert
                message="调试信息"
                type="info"
                show-icon
                style="text-align: left; margin-bottom: 12px;"
              >
                <template #description>
                  <div>
                    <p><strong>当前项目ID:</strong> {{ currentProjectId }}</p>
                    <p><strong>查询接口:</strong> /technologicalprojectmaterial/technological-project-material/page</p>
                    <p><strong>查询状态:</strong> 使用正确的立项材料接口查询</p>
                  </div>
                </template>
              </a-alert>
              
              <a-alert
                message="操作指引"
                type="warning"
                show-icon
                style="text-align: left; margin-bottom: 16px;"
              >
                <template #description>
                  <div>
                    <p>1. 请前往<strong>立项申请管理</strong>页面</p>
                    <p>2. 找到当前项目的立项申请记录</p>
                    <p>3. 检查并上传申报书文档</p>
                    <p>4. 上传完成后返回此页面重新选择项目</p>
                    <p style="color: #ff4d4f; margin-top: 8px;"><strong>注意:</strong> 如果已上传但仍显示无文档，可能是API接口参数不匹配，请联系技术人员检查。</p>
                  </div>
                </template>
              </a-alert>
              <a-button type="primary" size="large" @click="goToProjectManagement">
                <FileTextOutlined />
                前往立项申请管理
              </a-button>
              <a-button size="large" @click="cancelDocumentSelection">
                <CloseOutlined />
                稍后处理
              </a-button>
            </a-space>
          </a-empty>
        </div>
      </div>
    </a-modal>
    
    <!-- 悬浮回到顶部按钮 -->
    <a-tooltip title="回到顶部">
      <div 
        v-show="showBackToTop" 
        class="back-to-top back-to-top--circle" 
        :style="{ bottom: backToTopBottom + 'px', width: backToTopSize + 'px', height: backToTopSize + 'px', right: backToTopRight + 'px' }" 
        @click="scrollToTop" 
        @keydown.enter.prevent="scrollToTop"
        @keydown.space.prevent="scrollToTop"
        aria-label="回到顶部"
        role="button"
        tabindex="0"
      >
        <span class="icon"><UpOutlined /></span>
      </div>
    </a-tooltip>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  h,
  getCurrentInstance
} from 'vue';
import {
  message,
  Modal
} from 'ant-design-vue';
import mammoth from 'mammoth';
import {
  EyeOutlined,
  BulbOutlined,
  ArrowRightOutlined,
  CopyOutlined,
  CheckOutlined,
  DownloadOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CloseOutlined,
  HolderOutlined
} from '@ant-design/icons-vue';
import { UpOutlined } from '@ant-design/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { listProjectMaterials, pickBestProposalMaterial } from '@/api/th_qd/implementation-v3/project-materials';
import { saveAnalysisModuleToBackend, loadAnalysisFromBackend } from '@/api/th_qd/implementation-v3/proposal-analysis-backend';
import { apiLog } from '@/utils/apiLogger';
import draggable from 'vuedraggable';

// 浏览器环境下的 Buffer polyfill
if (typeof window !== 'undefined' && !window.Buffer) {
  // 使用 vite 的 buffer polyfill
  import('buffer').then(({ Buffer }) => {
    window.Buffer = Buffer;
  }).catch(() => {
    // 如果导入失败，使用简单的 polyfill
    window.Buffer = {
      from: (data) => new Uint8Array(data),
      isBuffer: (obj) => obj instanceof Uint8Array
    };
  });
}


// =============================
//      Component Definition
// =============================
// Props
const props = defineProps({
  selectedProject: {
    type: Object,
    required: false,
    default: () => null
  }
})

// Centralized document path and name
const DEFAULT_DOCX_PATH = `${import.meta?.env?.BASE_URL || '/'}附件二：研发项目申请书.docx`
const DEFAULT_DOCX_NAME = '附件二：研发项目申请书.docx'

// Emits
const emit = defineEmits(['save', 'next'])

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const documentLoading = ref(false)
const documentLoaded = ref(false)
const analysisCompleted = ref(false)
const guideVisible = ref(false)

// 文档选择相关
const documentSelectionVisible = ref(false)
const availableDocuments = ref([])
const selectedDocumentId = ref(null)
const documentSelectionLoading = ref(false)
const currentProjectId = ref(null)

// 项目选择相关
const availableProjects = ref([])
const projectsLoading = ref(false)
const currentProjectInfo = ref({})
const showProjectSelector = ref(false)
const fromTeamConfig = ref(false) // 标记是否从团队配置跳转过来

// 新增：图片备用库相关
const imageLibraryVisible = ref(false)
const documentImages = ref([]) // { src: string, blob: Blob }

// 释放所有已创建的图片URL，防止内存泄漏
const revokeAllImageUrls = () => {
  try {
    if (documentImages.value && documentImages.value.length) {
      documentImages.value.forEach(img => {
        if (img && img.src) {
          try { URL.revokeObjectURL(img.src) } catch (e) { /* ignore */ }
        }
      })
    }
  } finally {
    documentImages.value = []
  }
}

// 解析数据
const analysisData = ref({
  projectName: '',
  applicantUnit: '',
  leader: '',
  applicationDate: '',
  implementationPlan: '',
  technicalRoute: '',
  schedule: ''
})

// 申报书原始内容
const documentContent = ref('')

// 豆包相关数据
const pasteResultText = ref('')

// 文档预览相关数据
const currentFileName = ref('')
const currentFileSize = ref(0)
const currentDocumentUrl = ref('') // 当前文档URL
const documentHtml = ref('')
const previewVisible = ref(false)
const pdfUrl = ref('') // 保留以避免模板报错，但不再使用
const previewContainer = ref(null)
const activeTabKey = ref('overview')

// 计算属性：获取当前项目ID（B为主，A兜底）
const projectId = computed(() => {
  // B为主：使用父组件传递的selectedProject
  if (props.selectedProject?.id) {
    return props.selectedProject.id
  }
  // A兜底：使用路由参数
  if (route.query.projectId) {
    return route.query.projectId
  }
  // 最后使用内部状态（C允许切换）
  return currentProjectId.value
})
const isEditing = ref(false)
const showBackToTop = ref(false)
const backToTopBottom = ref(140)
const backToTopSize = ref(56)
const backToTopRight = ref(24)
const scrollContainer = ref(null)

// 轻量手工覆盖层
const manualOverrides = ref({
  basicInfo: {},
  implementation: '',
  technicalRoute: '',
  schedule: ''
})

// 编辑草稿
const draftBasicInfo = reactive({ projectName: '', applicantUnit: '', leader: '', applicationDate: '' })

// 可视化编辑：实施方案与技术路线的临时编辑结构
const editImplDuration = ref('')
const editImplPhases = ref([]) // { phaseName, objectivesText, activitiesText, milestonesText, budget }
const editTechPhases = ref([]) // { phase, keyTechnologiesText, mainTasksText, deliverablesText }
// 进度计划可视化编辑：里程碑列表
const editScheduleMilestones = ref([]) // { name, plannedDate, criteriaText }

// 展示用：手工覆盖优先
const displayBasicInfo = computed(() => ({
  projectName: manualOverrides.value.basicInfo.projectName ?? analysisData.value.projectName,
  applicantUnit: manualOverrides.value.basicInfo.applicantUnit ?? analysisData.value.applicantUnit,
  leader: manualOverrides.value.basicInfo.leader ?? analysisData.value.leader,
  applicationDate: manualOverrides.value.basicInfo.applicationDate ?? analysisData.value.applicationDate
}))
const displaySchedule = computed(() => manualOverrides.value.schedule || analysisData.value.schedule)
// 展示用里程碑：优先取进度计划覆盖，其次取从实施方案提取
const displayScheduleObj = computed(() => {
  try {
    if (manualOverrides.value.schedule && manualOverrides.value.schedule.trim().startsWith('{')) {
      return JSON.parse(manualOverrides.value.schedule)
    }
  } catch (e) { /* ignore */ }
  return null
})
// 将进度对象转为友好文本
const scheduleSummaryText = computed(() => {
  try {
    const obj = displayScheduleObj.value
    if (obj) {
      const total = obj.totalDuration || analysisData.value.schedule || ''
      const names = Array.isArray(obj.milestones) ? obj.milestones.map(m => m.name).filter(Boolean) : []
      if (names.length) return `${total}；里程碑：${names.join('、')}`
      return total || '暂未解析'
    }
  } catch (e) { /* ignore */ }
  // 无显式对象时，从实施方案推导
  const impl = implementationPlanObj.value
  if (impl) {
    const total = impl.totalDuration || analysisData.value.schedule || ''
    const mile = Array.isArray(impl.phases) ? impl.phases.flatMap(p => Array.isArray(p.milestones) ? p.milestones : []).filter(Boolean) : []
    if (mile.length) return `${total}；里程碑：${mile.join('、')}`
    return total || '暂未解析'
  }
  return '暂未解析'
})
const displayMilestones = computed(() => {
  if (displayScheduleObj.value && Array.isArray(displayScheduleObj.value.milestones)) {
    return displayScheduleObj.value.milestones.map(m => ({
      id: m.id || m.name,
      name: m.name || '',
      description: '',
      plannedDate: m.plannedDate || '',
      status: 'pending',
      criteria: Array.isArray(m.criteria) ? m.criteria : (m.criteria ? [m.criteria] : [])
    }))
  }
  return extractedTasks.value.milestones
})

// 修订交互：按模块记录用户修改意见
const revisionNotes = ref({
  basicInfo: '',
  technicalRoute: '',
  implementation: ''
})

// 提取的任务（动态基于解析结果生成；无数据时为空并隐藏展示区）
const extractedTasks = ref({ implementation: [], technical: [], milestones: [] })

// 豆包解析相关数据
const doubaoAnalysisResults = ref({
  basicInfo: null,
  technicalRoute: null,
  implementation: null
})

// 解析技术路线的阶段数据（优先使用原始JSON）
const technicalRoutePhases = computed(() => {
  try {
    // 手工覆盖优先
    if (manualOverrides.value.technicalRoute) {
      const tr = JSON.parse(manualOverrides.value.technicalRoute)
      if (tr && Array.isArray(tr.technicalRoute)) return tr.technicalRoute
    }
    const obj = doubaoAnalysisResults.value.technicalRoute
    if (obj && obj.technicalRoute && Array.isArray(obj.technicalRoute)) return obj.technicalRoute
    // 回退：尝试从字符串中反序列化
    if (analysisData.value.technicalRoute) {
      const parsed = JSON.parse(analysisData.value.technicalRoute)
      return Array.isArray(parsed) ? parsed : null
    }
  } catch (e) {
    return null
  }
  return null
})

// 解析实施方案对象与阶段（优先使用原始JSON对象）
const implementationPlanObj = computed(() => {
  try {
    if (manualOverrides.value.implementation) {
      const parsed = JSON.parse(manualOverrides.value.implementation)
      return parsed && parsed.implementationPlan ? parsed.implementationPlan : null
    }
  } catch (e) {
    // ignore
  }
  const impl = doubaoAnalysisResults.value.implementation
  if (impl && impl.implementationPlan) return impl.implementationPlan
  try {
    if (analysisData.value.implementationPlan) {
      const parsed = JSON.parse(analysisData.value.implementationPlan)
      return parsed && parsed.implementationPlan ? parsed.implementationPlan : null
    }
  } catch (e) {
    return null
  }
  return null
})

const implementationPhases = computed(() => {
  const obj = implementationPlanObj.value
  if (obj && Array.isArray(obj.phases)) return obj.phases
  return null
})

// 基本信息来源（如果返回含有origin）
const basicInfoOrigin = computed(() => {
  const b = doubaoAnalysisResults.value.basicInfo
  return b && b.origin ? b.origin : {}
})

// 来源类型对应颜色
const originColor = (type) => {
  const map = { verbatim: 'green', inferred: 'orange', generated: 'red' }
  return map[type] || 'blue'
}

// 悬浮提示内容
const originTitle = (o) => {
  if (!o) return ''
  const label = originLabel(o.type)
  const conf = typeof o.confidence === 'number' ? `置信度：${(o.confidence * 100).toFixed(0)}%` : ''
  const ev = o.evidence ? `\n依据：${o.evidence}` : ''
  return `${label}${conf ? '｜' + conf : ''}${ev}`
}

// 标签友好文案
const originLabel = (type) => {
  const map = { verbatim: '原文', inferred: '推理', generated: '生成' }
  return map[type] || type
}

// 任意模块完成即展示解析结果
const hasAnyResult = computed(() => !!(doubaoAnalysisResults.value.basicInfo || doubaoAnalysisResults.value.technicalRoute || doubaoAnalysisResults.value.implementation))
const completedCount = computed(() => ['basicInfo','technicalRoute','implementation'].reduce((acc, k) => acc + (doubaoAnalysisResults.value[k] ? 1 : 0), 0))
const hasBasicInfo = computed(() => !!doubaoAnalysisResults.value.basicInfo)
const hasTechnicalRoute = computed(() => !!doubaoAnalysisResults.value.technicalRoute)
const hasImplementation = computed(() => !!doubaoAnalysisResults.value.implementation)

// 方法定义

// =============================
//      文档选择相关方法
// =============================

/**
 * 获取项目申报文档列表
 */
const fetchProjectDocuments = async (forceProjectId = null) => {
  try {
    const targetProjectId = forceProjectId || projectId.value
    if (!targetProjectId) {
      message.warning('未指定项目ID，无法获取申报文档')
      return []
    }

    documentSelectionLoading.value = true
    console.log('🔍 [fetchProjectDocuments] 开始获取项目材料，项目ID:', targetProjectId)
    
    // 使用正确的立项项目材料接口
    let response = await listProjectMaterials({
      pageNo: 1,
      pageSize: 50,
      projectId: targetProjectId // 使用正确的projectId参数
    })
    
    console.log('🔍 [fetchProjectDocuments] 立项材料查询结果:', response)
    
    apiLog({ action: '获取立项项目材料', api: 'listProjectMaterials', method: 'GET', params: { projectId: targetProjectId } }, response)
    
    console.log('🔍 [fetchProjectDocuments] 最终响应结构检查:', response)
    console.log('🔍 [fetchProjectDocuments] response.data:', response?.data)
    console.log('🔍 [fetchProjectDocuments] response.list:', response?.list)
    
    // 兼容不同的响应结构
    let documentList = null
    if (response?.data?.list) {
      documentList = response.data.list
      console.log('✅ [fetchProjectDocuments] 使用 response.data.list 结构')
    } else if (response?.list) {
      documentList = response.list
      console.log('✅ [fetchProjectDocuments] 使用 response.list 结构')
    }
    
    if (documentList && Array.isArray(documentList)) {
      console.log('✅ [fetchProjectDocuments] 返回文档列表:', documentList.length, '个文档')
      return documentList
    }
    
    console.log('⚠️ [fetchProjectDocuments] 未找到有效的文档列表')
    return []
  } catch (error) {
    console.error('获取项目文档失败:', error)
    apiLog({ action: '获取立项项目材料', api: 'listProjectMaterials', method: 'GET', error: error.message })
    message.error('获取项目文档失败: ' + (error.message || '未知错误'))
    return []
  } finally {
    documentSelectionLoading.value = false
  }
}

/**
 * 显示文档选择弹窗
 */
const showDocumentSelection = async () => {
  try {
    const documents = await fetchProjectDocuments()
    console.log('📋 [showDocumentSelection] 获取到的文档列表:', documents.length, '个文档')
    console.log('📋 [showDocumentSelection] 文档详情:', documents)
    
    if (documents.length === 0) {
      console.log('⚠️ [showDocumentSelection] 项目无申报文档，显示空文档弹窗')
      // 显示空文档状态的弹窗
      availableDocuments.value = []
      selectedDocumentId.value = null
      documentSelectionVisible.value = true
      return
    }

    availableDocuments.value = documents
    console.log('📋 [showDocumentSelection] 设置文档列表:', documents)
    console.log('📋 [showDocumentSelection] 第一个文档结构:', documents[0])
    
    // 使用智能选择算法推荐最佳文档
    const recommended = pickBestProposalMaterial(documents)
    if (recommended) {
      selectedDocumentId.value = recommended.id
    }
    
    documentSelectionVisible.value = true
  } catch (error) {
    console.error('显示文档选择失败:', error)
    message.error('显示文档选择失败，将使用默认文档')
    await loadProjectDocument() // 回退到默认文档
  }
}

/**
 * 确认选择文档
 */
const confirmDocumentSelection = async () => {
  if (!selectedDocumentId.value) {
    message.warning('请选择一个申报文档')
    return
  }

  const selectedDoc = availableDocuments.value.find(doc => doc.id === selectedDocumentId.value)
  if (!selectedDoc) {
    message.error('选择的文档不存在')
    return
  }

  documentSelectionVisible.value = false
  
  try {
    // 使用选中文档的下载地址加载文档
    const fileUrl = selectedDoc.fileUrl || selectedDoc.downloadUrl
    const fileName = selectedDoc.materialName || selectedDoc.fileName
    
    console.log('🔍 [confirmDocumentSelection] 选中文档信息:', {
      id: selectedDoc.id,
      fileName: fileName,
      fileUrl: fileUrl,
      selectedDoc: selectedDoc
    })
    
    if (!fileUrl) {
      throw new Error('文档URL为空，无法加载文档')
    }
    
    await loadAndPreviewWord(fileUrl)
    currentFileName.value = fileName || '申报文档'
    currentDocumentUrl.value = fileUrl || ''
    message.success(`已加载申报文档: ${fileName || '申报文档'}`)
  } catch (error) {
    console.error('加载选中文档失败:', error)
    message.error('加载选中文档失败，将使用默认文档')
    await loadProjectDocument() // 回退到默认文档
  }
}

/**
 * 跳转到立项申请管理页面
 */
const goToProjectManagement = () => {
  documentSelectionVisible.value = false
  console.log('🔗 [goToProjectManagement] 用户选择前往立项申请管理')
  
  // 跳转到立项申请管理页面
  const projectManagementRoute = '/th-qd/opening/applicant/submit'
  
  // 如果有当前项目ID，可以作为参数传递
  const targetRoute = {
    path: projectManagementRoute,
    query: currentProjectId.value ? { projectId: currentProjectId.value } : {}
  }
  
  router.push(targetRoute)
    .then(() => {
      message.success('已跳转到立项申请管理页面，请上传申报书文档')
    })
    .catch((error) => {
      console.error('跳转失败:', error)
      message.error('页面跳转失败，请手动前往立项申请管理页面')
    })
}

/**
 * 取消文档选择，关闭弹窗
 */
const cancelDocumentSelection = () => {
  documentSelectionVisible.value = false
  console.log('❌ [cancelDocumentSelection] 用户取消文档选择')
  message.info('已取消文档选择，您可以稍后重新选择项目')
}

/**
 * 获取立项项目列表
 */
const fetchProjects = async (searchKeyword = '') => {
  try {
    projectsLoading.value = true
    
    // 导入项目接口
    const { fetchProjectPage } = await import('@/api/th_qd/implementation-v3')
    
    const response = await fetchProjectPage({
      pageNo: 1,
      pageSize: 50,
      projectName: searchKeyword,
      status: 8 // 只获取立项通过的项目 (PROJECT_APPROVED = 8)
    })
    
    console.log('🔍 [fetchProjects] API响应结构:', response)
    console.log('🔍 [fetchProjects] response.data:', response?.data)
    console.log('🔍 [fetchProjects] response.list:', response?.list)
    
    // 兼容不同的响应结构：优先尝试 response.data.list，然后尝试 response.list
    let projectList = null
    if (response?.data?.list) {
      projectList = response.data.list
      console.log('✅ [fetchProjects] 使用 response.data.list 结构')
    } else if (response?.list) {
      projectList = response.list
      console.log('✅ [fetchProjects] 使用 response.list 结构')
    }
    
    if (projectList && Array.isArray(projectList)) {
      availableProjects.value = projectList
      console.log('✅ [fetchProjects] 设置项目列表:', availableProjects.value.length, '个项目')
      console.log('🔍 [fetchProjects] 第一个项目示例:', availableProjects.value[0])
    } else {
      availableProjects.value = []
      console.warn('⚠️ [fetchProjects] 未找到项目列表数据')
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
    message.error('获取项目列表失败')
    availableProjects.value = []
  } finally {
    projectsLoading.value = false
  }
}

/**
 * 处理项目搜索
 */
const handleProjectSearch = (searchValue) => {
  if (searchValue) {
    fetchProjects(searchValue)
  } else {
    fetchProjects()
  }
}

/**
 * 处理项目选择
 */
const handleProjectSelect = async (projectId) => {
  console.log('🎯 选择项目:', projectId)
  
  // 🆕 申报书解析页面不支持ALL_PROJECTS，必须选择具体项目
  if (projectId === 'ALL_PROJECTS') {
    message.warning('申报书解析需要选择具体的项目，不支持"全部项目"选项')
    currentProjectId.value = null
    return
  }
  
  currentProjectId.value = projectId
  
  // 🆕 保存项目ID到本地存储
  if (projectId) {
    // 严格后端模式：不再持久化项目ID到本地
    console.log('💡 严格后端模式：跳过本地持久化项目ID')
  }
  
  // 🆕 清空当前解析结果，准备加载新项目的数据
  doubaoAnalysisResults.value = {
    basicInfo: null,
    technicalRoute: null,
    implementation: null
  }

  // 🆕 清空上一个项目的文档预览内容
  documentLoaded.value = false
  documentContent.value = ''
  documentHtml.value = ''
  currentFileName.value = ''
  currentDocumentUrl.value = ''
  selectedDocumentId.value = null
  console.log('🔄 已清空上一个项目的文档预览内容')
  
  // 自动加载项目文档和解析结果
  if (projectId) {
    console.log('🔄 自动加载项目文档:', projectId)
    try {
      // 加载文档列表（但不显示弹窗）
      const documents = await fetchProjectDocuments(projectId)
      console.log('📋 获取到的文档列表:', documents.length, '个文档')

      // 🆕 无论是否有文档，都更新文件列表
      availableDocuments.value = documents

      // 🆕 自动设置选中的文档ID为第一个文档
      if (documents.length > 0) {
        // 默认选择第一个文档
        selectedDocumentId.value = documents[0].id
        console.log('📋 已设置默认选中文档ID为第一个文档:', documents[0].id)
      }

      // 🆕 直接加载最佳文档，不显示选择弹窗
      if (documents.length > 0 && !documentLoaded.value) {
        console.log('📋 发现可用文档，尝试自动加载最佳文档')
        const bestDoc = pickBestProposalMaterial(documents)
        if (bestDoc) {
          try {
            const fileUrl = bestDoc.fileUrl || bestDoc.downloadUrl
            const fileName = bestDoc.materialName || bestDoc.fileName
            console.log('🔍 自动加载最佳文档:', fileName)
            await loadAndPreviewWord(fileUrl)
            currentFileName.value = fileName || '申报文档'
            currentDocumentUrl.value = fileUrl || ''
            console.log('✅ 申报书文档自动加载成功 - documentLoaded:', documentLoaded.value)

            // 设置选中的文档ID
            selectedDocumentId.value = bestDoc.id
            message.success(`已加载项目 ${projectId} 的最佳文档: ${fileName || '申报文档'}`)
          } catch (error) {
            console.warn('⚠️ 自动加载申报书文档失败:', error)
            message.error(`加载项目文档失败: ${error.message}`)
          }
        } else {
          console.log('⚠️ 未找到最佳文档，尝试加载默认申报书')
          try {
            await loadProjectDocument()
            console.log('✅ 默认申报书文档加载成功 - documentLoaded:', documentLoaded.value)
          } catch (error) {
            console.warn('⚠️ 默认申报书文档加载失败:', error)
          }
        }
      } else if (documents.length === 0 && !documentLoaded.value) {
        console.log('⚠️ 无可用文档，尝试加载默认申报书')
        try {
          await loadProjectDocument()
          console.log('✅ 默认申报书文档加载成功 - documentLoaded:', documentLoaded.value)
        } catch (error) {
          console.warn('⚠️ 默认申报书文档加载失败:', error)
        }
      } else if (documentLoaded.value) {
        console.log('✅ 文档已加载，documentLoaded:', documentLoaded.value)
      }
      
      // 🆕 重新加载解析结果
      console.log('🔄 重新加载项目解析结果...')
      const hasBackendData = await loadAnalysisFromBackendData()
      
      // 如果后端无数据，则尝试恢复本地存储的解析结果
      // 严格后端模式：不再从本地恢复
      if (!hasBackendData) {
        console.log('💡 严格后端模式：后端无数据，不做本地恢复')
      }
      

      
      message.success(`已切换到项目：${projectId}`)
    } catch (error) {
      console.error('自动加载项目失败:', error)
      message.error('加载项目失败，请检查项目是否正确')
    }
  }
}

/**
 * 切换文档
 */
const switchDocument = async (document) => {
  try {
    console.log('🔄 切换文档:', document)

    // 使用选中文档的下载地址加载文档
    const fileUrl = document.fileUrl || document.downloadUrl
    const fileName = document.materialName || document.fileName

    if (!fileUrl) {
      throw new Error('文档URL为空，无法加载文档')
    }

    await loadAndPreviewWord(fileUrl)
    currentFileName.value = fileName || '申报文档'
    currentDocumentUrl.value = fileUrl || ''
    selectedDocumentId.value = document.id

    message.success(`已切换到文档: ${fileName || '申报文档'}`)
  } catch (error) {
    console.error('切换文档失败:', error)
    message.error('切换文档失败，请重试')
  }
}

/**
 * 获取项目详细信息
 */
const fetchProjectInfo = async (projectId) => {
  try {
    const { fetchProjectPage } = await import('@/api/th_qd/implementation-v3')
    
    const response = await fetchProjectPage({
      pageNo: 1,
      pageSize: 1,
      projectId: projectId
    })
    
    if (response?.data?.list && response.data.list.length > 0) {
      currentProjectInfo.value = response.data.list[0]
      console.log('📋 获取项目信息成功:', currentProjectInfo.value)
    }
  } catch (error) {
    console.error('获取项目信息失败:', error)
  }
}

/**
 * 切换项目（显示项目选择器）
 */
const changeProject = async () => {
  // 清除从团队配置跳转的状态
  fromTeamConfig.value = false
  currentProjectId.value = null
  currentProjectInfo.value = {}
  
  showProjectSelector.value = true
  // 清除路由参数中的项目ID
  await router.replace({ 
    path: route.path, 
    query: { ...route.query, projectId: undefined } 
  })
  // 初始化项目列表
  await fetchProjects()
}


/**
 * 格式化日期
 */
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// =============================
//      文档加载相关方法
// =============================

/**
 * 加载项目申报书文档
 */
const loadProjectDocument = async () => {
  documentLoading.value = true
  try {
    console.log('📄 开始加载项目申报书文档...')
    await loadAndPreviewWord(DEFAULT_DOCX_PATH)
    console.log('✅ Word文档加载及预览准备成功')
  } catch (error) {
    console.error('❌ 项目申报书加载失败:', error)
    message.error('申报书加载失败：' + error.message)
    documentLoaded.value = false
    documentContent.value = ''
    documentHtml.value = ''
  } finally {
    documentLoading.value = false
  }
}

/**
 * 将.docx文件转换为HTML，并提取图片
 */
const loadAndPreviewWord = async (docxPath) => {
  console.log('📄 开始处理 .docx 文件:', docxPath);

  try {
    // 重载前先释放旧图片URL
    revokeAllImageUrls()

    // 检查是否为空或undefined
    if (!docxPath) {
      throw new Error('文档路径为空，无法加载文档');
    }

    console.log('🔍 [loadAndPreviewWord] 文档路径类型:', typeof docxPath);
    console.log('🔍 [loadAndPreviewWord] 文档路径内容:', docxPath);

    const response = await fetch(docxPath);
    if (!response.ok) {
      const status = response.status
      const hint = status === 404 
        ? `文档不存在或路径错误: ${docxPath}` 
        : `请确认文件已放置于 public 目录下，并通过路径 ${docxPath} 访问（开发环境会将 public 作为静态根目录）。`
      throw new Error(`文档获取失败: ${status}。${hint}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    const tempImages = [];

    const options = {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read().then(function(imageBuffer) {
          const imageIndex = tempImages.length; // 使用0-based索引

          // 为图片库和后续的DOM操作生成Blob和URL
          const imageBlob = new Blob([imageBuffer], { type: image.contentType });
          const imageUrl = URL.createObjectURL(imageBlob);
          
          tempImages.push({
            src: imageUrl,
            blob: imageBlob,
          });

          // 在HTML中返回完整的img标签属性，包含占位符
          return {
            'data-image-index': imageIndex.toString(),
            alt: `图片${imageIndex + 1}`,
            src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD48L3N2Zz4=',
            style: 'max-width: 100%; height: auto; border: 1px dashed #ccc; background: #f9f9f9;'
          };
        }).catch(function(error) {
          console.error("处理单张图片时出错:", error);
          return { alt: ' [图片加载失败] ' };
        });
      })
    };

    console.log('🔄 使用 mammoth.js 转换为 HTML 并提取图片...');
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer }, options);
    documentHtml.value = htmlResult.value;
    
    documentImages.value = tempImages;
    console.log(`🖼️ 成功提取 ${documentImages.value.length} 张图片`);

    // 🆕 文档加载时不立即填充图片，等待预览弹窗打开时再填充
    console.log('📋 文档加载完成，图片将在预览弹窗打开时填充')


    console.log('🔄 使用 mammoth.js 提取纯文本...');
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    documentContent.value = textResult.value;
    console.log('✅ 纯文本提取成功，内容长度:', documentContent.value.length);

    // 更新文档信息
    currentFileName.value = docxPath.split('/').pop();
    currentFileSize.value = arrayBuffer.byteLength;
    documentLoaded.value = true;
    
    console.log('✅ .docx 文件处理完成。');

  } catch (error) {
    console.error('❌ 在 loadAndPreviewWord 中发生严重错误:', error);
    
    // 检查是否是ZIP格式错误（通常表示文件是老版本.doc格式）
    if (error.message && error.message.includes('zip file')) {
      console.warn('⚠️ 检测到可能是老版本.doc文件，尝试使用备用处理方案...');
      
      try {
        // 尝试使用备用方案：加载手动整理的内容
        await loadManualProposalContent();
        return; // 如果成功，直接返回
      } catch (fallbackError) {
        console.error('❌ 备用方案也失败了:', fallbackError);
      }
      
      // 显示详细的转换指引
      Modal.info({
        title: '文档格式不兼容',
        width: 600,
        content: h('div', [
          h('p', { style: 'margin-bottom: 16px; color: #fa8c16;' }, '🔍 检测到老版本Word文档(.doc格式)'),
          h('p', { style: 'margin-bottom: 12px;' }, '当前系统仅支持新版本的.docx格式文档。请按以下步骤处理：'),
          h('ol', { style: 'margin: 16px 0; padding-left: 20px;' }, [
            h('li', { style: 'margin-bottom: 8px;' }, '使用Microsoft Word打开原始.doc文件'),
            h('li', { style: 'margin-bottom: 8px;' }, '点击"文件" → "另存为"'),
            h('li', { style: 'margin-bottom: 8px;' }, '在格式下拉框中选择"Word文档(*.docx)"'),
            h('li', { style: 'margin-bottom: 8px;' }, '保存后重新上传.docx格式的文件'),
            h('li', { style: 'margin-bottom: 8px;' }, '返回此页面重新选择项目')
          ]),
          h('div', { style: 'background: #f6ffed; border: 1px solid #b7eb8f; padding: 12px; border-radius: 6px; margin-top: 16px;' }, [
            h('p', { style: 'margin: 0; color: #52c41a;' }, '💡 提示：.docx格式支持更好的文档解析和图片提取功能')
          ])
        ]),
        onOk() {
          console.log('用户确认了文档格式转换指引')
        }
      });
    } else {
      message.error('处理文档失败：' + (error && error.message ? error.message : '未知错误') + '（请检查 public 路径与文件格式）');
    }
    
    documentLoaded.value = false;
  }
}

/**
 * 加载手动整理的申报书内容（备用方案）
 */
const loadManualProposalContent = async () => {
  console.log('📄 [loadManualProposalContent] 尝试加载手动整理的申报书内容')
  
  try {
    // 尝试加载手动整理的文本内容
    const response = await fetch('/proposal-content-manual.txt')
    if (!response.ok) {
      throw new Error(`无法加载手动内容文件: ${response.status}`)
    }
    
    const textContent = await response.text()
    if (textContent && textContent.trim()) {
      // 将文本内容转换为简单的HTML格式
      const htmlContent = textContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('\n')
      
      documentHtml.value = htmlContent
      documentLoaded.value = true
      currentFileName.value = '申报书内容（手动整理版）'
      currentFileSize.value = textContent.length
      
      console.log('✅ [loadManualProposalContent] 手动内容加载成功')
      message.success('已加载申报书内容（手动整理版）')
      return
    }
  } catch (error) {
    console.error('❌ [loadManualProposalContent] 加载手动内容失败:', error)
    throw error
  }
  
  // 如果手动内容也没有，使用模拟数据
  console.log('📄 [loadManualProposalContent] 使用模拟申报书数据')
  const mockContent = `
    <h2>智能水务管理系统研发项目申报书</h2>
    <h3>一、项目基本信息</h3>
    <p><strong>项目名称：</strong>智能水务管理系统研发项目</p>
    <p><strong>申请单位：</strong>华北水利水电大学</p>
    <p><strong>项目负责人：</strong>DrYang</p>
    <p><strong>申请日期：</strong>2024年12月</p>
    
    <h3>二、项目实施方案</h3>
    <p>本项目旨在开发一套智能化的水务管理系统，通过物联网、大数据和人工智能技术，实现水资源的智能监测、分析和管理。</p>
    
    <h3>三、技术路线</h3>
    <p>采用微服务架构，结合云计算平台，构建可扩展的智能水务管理系统。</p>
    
    <h3>四、进度安排</h3>
    <p>项目计划分为三个阶段：需求分析与设计（3个月）、系统开发与测试（6个月）、部署与验收（3个月）。</p>
  `
  
  documentHtml.value = mockContent
  documentLoaded.value = true
  currentFileName.value = '申报书内容（模拟数据）'
  currentFileSize.value = mockContent.length
  
  console.log('✅ [loadManualProposalContent] 模拟数据加载成功')
  message.info('已加载申报书模拟数据，建议上传正确格式的申报书文档')
}

/**
 * 在预览弹窗中填充图片
 */
const fillImagesInPreview = () => {
  const container = previewContainer.value;
  console.log('🔍 [图片填充] previewContainer.value:', container);
  console.log('🔍 [图片填充] documentImages.value:', documentImages.value);
  
  if (!container || !documentImages.value.length) {
    console.log('❌ [图片填充] 容器为空或无图片数据');
    return;
  }

  console.log('🖼️ 开始在预览弹窗中填充图片...');
  const imagesToUpdate = container.querySelectorAll('img[data-image-index]');
  console.log('🔍 [图片填充] 找到的图片元素数量:', imagesToUpdate.length);
  
  const usedIndices = new Set()
  imagesToUpdate.forEach((imgElement, idx) => {
    const index = parseInt(imgElement.getAttribute('data-image-index'), 10);
    console.log(`🔍 [图片填充] 图片${idx}: data-image-index=${index}, 可用图片=${documentImages.value[index] ? '是' : '否'}`);
    
    if (!isNaN(index) && documentImages.value[index]) {
      imgElement.src = documentImages.value[index].src;
      console.log(`✅ 已为占位符 [图片${index + 1}] 设置SRC: ${documentImages.value[index].src.substring(0, 50)}...`);
      imgElement.removeAttribute('data-image-index');
      usedIndices.add(index)
    }
  });

  // 兜底：为仍缺少 src 的图片按顺序回填
  const fallbackImgs = container.querySelectorAll('img:not([src]), img[src=""], img[src*="data:image/svg"]');
  if (fallbackImgs && fallbackImgs.length) {
    console.log(`🛟 发现 ${fallbackImgs.length} 个缺少src的图片，占位回填中...`)
    let pointer = 0
    fallbackImgs.forEach(imgEl => {
      while (pointer < documentImages.value.length && usedIndices.has(pointer)) {
        pointer++
      }
      if (pointer < documentImages.value.length) {
        imgEl.src = documentImages.value[pointer].src
        console.log(`🔄 兜底填充图片: ${documentImages.value[pointer].src.substring(0, 50)}...`)
        usedIndices.add(pointer)
        pointer++
      }
    })
  }
  
  // 最终检查：确保所有图片都有正确的src
  const allImages = container.querySelectorAll('img');
  console.log(`🔍 [最终检查] 文档中总共有 ${allImages.length} 个图片元素`);
  allImages.forEach((img, idx) => {
    const src = img.src;
    const isPlaceholder = src.includes('data:image/svg');
    console.log(`🔍 图片${idx + 1}: ${isPlaceholder ? '占位符' : '真实图片'} - ${src.substring(0, 50)}...`);
  });
  
  console.log('✅ 预览弹窗图片填充完成');
}

/**
 * 显示预览弹窗
 */
const showPreviewModal = async () => {
  try {
    // 如果文档未加载，先自动加载
    if (!documentLoaded.value) {
      message.info('正在加载申报书文档...')
      await loadProjectDocument()
    }
    
    // 检查是否加载成功
    if (!documentLoaded.value) {
      message.error('申报书文档加载失败，无法预览')
      return
    }
    
    previewVisible.value = true
    
    // 🆕 弹窗打开后，等待DOM渲染完成，然后填充图片
    await nextTick()
    setTimeout(() => {
      fillImagesInPreview()
    }, 100)
  } catch (error) {
    console.error('❌ 预览失败:', error)
    message.error('文档预览失败')
  }
}

/**
 * 下载文档
 */
const downloadDocument = () => {
  if (!documentContent.value) {
    message.warning('没有可下载的文档内容')
    return
  }
  
  // 创建文本文件下载
  const blob = new Blob([documentContent.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = currentFileName.value || '申报书内容.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  message.success('文档内容下载成功')
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 豆包解析相关数据
const pasteModalVisible = ref(false)
const currentAnalysisType = ref('')

/**
 * 生成分析提示词并复制到剪贴板
 */
const copyAnalysisPrompt = async (analysisType) => {
  try {
    // 确保有真实的源文件内容
    let sourceContent = documentContent.value
    
    // 如果当前没有内容，尝试重新加载文档
    if (!sourceContent) {
      message.info('内容尚未加载，正在加载申报书源文件...')
      await loadProjectDocument()
      sourceContent = documentContent.value
    }
    
    // 最终检查
    if (!sourceContent || sourceContent.trim().length < 50) {
      message.error('无法获取申报书源文件内容，请检查文件是否存在或内容是否有效')
    return
  }
  
    const prompt = generateAnalysisPrompt(analysisType, sourceContent)
    await navigator.clipboard.writeText(prompt)
    
    const typeNames = {
      basicInfo: '项目基本信息提取',
      technicalRoute: '技术路线梳理',
      implementation: '实施方案分析'
    }
    
    message.success(`${typeNames[analysisType]}提示词已复制到剪贴板！`)
    console.log(`📋 ${typeNames[analysisType]}提示词已复制`)
    console.log(`📄 使用源文件内容长度: ${sourceContent.length} 字符`)
    
    // 显示操作指南
    showAnalysisGuide(analysisType)
    
  } catch (error) {
    console.error('❌ 复制失败:', error)
    message.error('复制失败：' + error.message)
  }
}

/**
 * 生成分析提示词
 */
const generateAnalysisPrompt = (analysisType, sourceContent = null) => {
  // 使用传入的源内容，或者当前文档内容
  const content = sourceContent || documentContent.value
  
  if (!content || content.trim().length === 0) {
    throw new Error('无法获取申报书内容，无法生成分析提示词')
  }
  
  const prompts = {
    basicInfo: `请从以下项目申报书以及相关图片中提取基本信息，返回JSON格式：

【分析要求】
请仔细阅读申报书内容，提取以下基本信息：
- 项目名称
- 申请单位
- 项目负责人
- 协作单位
- 申报时间
- 项目总预算
- 项目周期
- 研究领域

【返回格式】
请严格按照以下JSON格式返回，并补充“origin”来源信息用于每个字段（type: verbatim/ inferred/ generated；confidence: 0~1；evidence: 最关键的原文片段，尽量简短）：
{
    "projectName": "项目名称",
    "applicantUnit": "申请单位", 
    "leader": "项目负责人",
  "cooperativeUnit": "协作单位",
    "applicationDate": "申报时间",
  "totalBudget": "项目总预算",
  "projectPeriod": "项目周期",
  "researchField": "研究领域",
  "origin": {
    "projectName": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
    "applicantUnit": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
    "leader": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
    "cooperativeUnit": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
    "applicationDate": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
    "totalBudget": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
    "projectPeriod": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
    "researchField": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"}
  }
}

【申报书内容】
${content}`,

    technicalRoute: `请从以下项目申报书以及相关图片中梳理技术路线，返回JSON格式：

【分析要求】
请分析申报书中的技术实施方案，提取按阶段的技术路线信息：
- 技术实施阶段划分（阶段名称）
- 每个阶段的关键技术
- 主要任务
- 交付物

【返回格式】
请严格按照以下JSON格式返回（仅包含这四类字段），并为每个字段补充“origin”来源信息（type: verbatim/ inferred/ generated；confidence: 0~1；evidence: 关键原文片段）：
{
  "technicalRoute": [
    {
      "phase": "阶段名称",
      "keyTechnologies": ["关键技术1", "关键技术2"],
      "mainTasks": ["主要任务1", "主要任务2"],
        "deliverables": ["交付物1", "交付物2"],
      "origin": {
        "phase": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
        "keyTechnologies": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
        "mainTasks": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
        "deliverables": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"}
      }
    }
  ]
}

【申报书内容】
${content}`,

    implementation: `请从以下项目申报书中以及相关图片中分析实施方案，返回JSON格式：

【分析要求】
请分析项目的实施计划、时间安排和资源配置：
- 项目总体实施计划
- 阶段划分和时间安排
- 团队结构和人员配置
- 资源需求和预算分配

【返回格式】
请严格按照以下JSON格式返回，并为每个关键字段补充“origin”来源信息（type: verbatim/ inferred/ generated；confidence: 0~1；evidence: 关键原文片段）：
{
  "implementationPlan": {
    "totalDuration": "项目总周期",
    "phases": [
      {
        "phaseName": "阶段名称",
        "startMonth": 1,
        "endMonth": 6,
        "objectives": ["目标1", "目标2"],
        "activities": ["活动1", "活动2"],
        "milestones": ["里程碑1", "里程碑2"],
        "budget": "阶段预算",
        "origin": {
          "phaseName": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
          "objectives": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
          "activities": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
          "milestones": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"},
          "budget": {"type": "verbatim|inferred|generated", "confidence": 0.0, "evidence": "…"}
        }
      }
    ],
    "teamStructure": {
      "projectManager": "项目负责人",
      "technicalLeader": "技术负责人",
      "teamMembers": ["成员1", "成员2"]
    },
    "resources": {
      "personnel": "人员配置",
      "equipment": "设备需求",
      "facilities": "场地要求"
    }
  }
}

【申报书内容】
${content}`
  }
  
  return prompts[analysisType]
}

/**
 * 显示分析操作指南
 */
const showAnalysisGuide = (analysisType) => {
  // 统一使用页面内的指南弹窗，避免与额外信息框冲突
  guideVisible.value = true
}

/**
 * 显示粘贴结果弹窗
 */
const showPasteModal = (analysisType) => {
  currentAnalysisType.value = analysisType
  pasteModalVisible.value = true
}

/**
 * 处理粘贴的豆包结果
 */
const handlePasteResult = async (resultText) => {
  try {
    // 清理输入文本
    let cleanText = resultText.trim()
    
    // 移除可能的markdown代码块标记
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // 尝试解析JSON
    const result = JSON.parse(cleanText)
    
    // 验证JSON结构
    const validationResult = validateAnalysisResult(currentAnalysisType.value, result)
    if (!validationResult.isValid) {
      message.warning(`JSON结构验证警告: ${validationResult.message}`)
      console.warn('🔍 JSON结构验证警告:', validationResult.message)
    }
    
    // 保存解析结果到内存
    doubaoAnalysisResults.value[currentAnalysisType.value] = result
    
    // 根据类型更新相应的数据
    updateAnalysisData(currentAnalysisType.value, result)
    
    const typeNames = {
      basicInfo: '项目基本信息',
      technicalRoute: '技术路线',
      implementation: '实施方案'
    }
    
    // 保存到本地存储作为备份
    // 严格后端模式：不再写入本地存储
    
    // 🆕 保存到后端数据库
    await saveAnalysisToBackend(currentAnalysisType.value, result)
    
    message.success(`${typeNames[currentAnalysisType.value]}解析结果导入成功！`)
    pasteModalVisible.value = false
    
    console.log(`🤖 ${typeNames[currentAnalysisType.value]}解析结果已导入:`, result)
    
  } catch (error) {
    console.error('❌ JSON解析失败:', error)
    
    // 提供更详细的错误信息
    let errorMessage = 'JSON格式错误，请检查豆包返回的结果格式'
    if (error.message.includes('Unexpected token')) {
      errorMessage = 'JSON语法错误，请确保豆包返回的是有效的JSON格式'
    } else if (error.message.includes('Unexpected end')) {
      errorMessage = 'JSON不完整，请确保复制了完整的豆包返回结果'
    }
    
    message.error(errorMessage)
  }
}

/**
 * 验证解析结果的JSON结构
 */
const validateAnalysisResult = (analysisType, result) => {
  if (!result || typeof result !== 'object') {
    return { isValid: false, message: '结果不是有效的对象' }
  }
  
  switch (analysisType) {
    case 'basicInfo':
      const basicFields = ['projectName', 'applicantUnit', 'leader', 'applicationDate']
      const missingBasic = basicFields.filter(field => !result[field])
      if (missingBasic.length > 0) {
        return { isValid: false, message: `缺少字段: ${missingBasic.join(', ')}` }
      }
      break
      
    case 'technicalRoute':
      if (!result.technicalRoute || !Array.isArray(result.technicalRoute)) {
        return { isValid: false, message: 'technicalRoute字段应为数组格式' }
      }
      break
      
    case 'implementation':
      if (!result.implementationPlan) {
        return { isValid: false, message: '缺少implementationPlan字段' }
      }
      break
  }
  
  return { isValid: true, message: '验证通过' }
}

/**
 * 保存解析结果到本地存储
 */
// 严格后端模式：移除本地存储相关实现
const saveAnalysisResultToLocal = () => {}

/**
 * 从本地存储加载解析结果
 */
const loadAnalysisResultFromLocal = (analysisType) => {
  try {
    const storageKey = `doubao_analysis_${projectId.value}_${analysisType}`
    const storageData = localStorage.getItem(storageKey)
    if (storageData) {
      const parsed = JSON.parse(storageData)
      if (parsed.result && parsed.projectId === projectId.value) {
        return parsed.result
      }
    }
  } catch (error) {
    console.warn('⚠️ 从本地存储加载失败:', error)
  }
  return null
}

/**
 * 恢复所有本地存储的解析结果
 */
const restoreAnalysisResultsFromLocal = () => {}

/**
 * 🆕 保存解析结果到后端数据库
 */
const saveAnalysisToBackend = async (analysisType, result) => {
  try {
    if (!projectId.value) {
      console.warn('⚠️ 项目ID为空，跳过后端保存')
      return
    }
    
    // 获取文档信息
    const documentInfo = {
      name: currentFileName.value,
      url: currentDocumentUrl.value,
      size: currentFileSize.value
    }
    
    console.log(`🌐 开始保存${analysisType}解析结果到后端...`)
    
    const analysisId = await saveAnalysisModuleToBackend(
      projectId.value,
      analysisType,
      result,
      documentInfo
    )
    
    if (analysisId) {
      console.log(`✅ ${analysisType}解析结果已成功保存到后端，记录ID: ${analysisId}`)
      
      // 可选：保存解析记录ID到本地，用于后续更新操作
      const storageKey = `analysis_record_${projectId.value}_${analysisType}`
      localStorage.setItem(storageKey, String(analysisId))
    } else {
      console.warn(`⚠️ ${analysisType}解析结果后端保存失败，但本地存储已保留`)
    }
  } catch (error) {
    console.error(`❌ ${analysisType}解析结果后端保存异常:`, error)
    // 不阻断用户操作，后端保存失败时仍可继续使用本地数据
  }
}

/**
 * 🆕 保存编辑结果到后端数据库
 */
const saveEditResultsToBackend = async (implObj, techObj, scheduleObj) => {
  try {
    if (!projectId.value) {
      console.warn('⚠️ 项目ID为空，跳过后端保存')
      message.warning('项目ID为空，无法保存到后端')
      return
    }

    console.log('🌐 开始保存编辑结果到后端数据库...')
    let savedCount = 0
    const errors = []

    // 保存基本信息（如果有修改）
    if (draftBasicInfo.projectName || draftBasicInfo.applicantUnit || draftBasicInfo.leader || draftBasicInfo.applicationDate) {
      try {
        console.log('💾 保存基本信息编辑结果...')
        const basicInfoData = {
          projectName: draftBasicInfo.projectName || undefined,
          applicantUnit: draftBasicInfo.applicantUnit || undefined,
          leader: draftBasicInfo.leader || undefined,
          applicationDate: draftBasicInfo.applicationDate || undefined
        }
        
        await saveAnalysisModuleToBackend(projectId.value, 'basicInfo', basicInfoData)
        savedCount++
        console.log('✅ 基本信息编辑结果已保存到后端')
      } catch (error) {
        console.error('❌ 基本信息保存失败:', error)
        errors.push('基本信息')
      }
    }

    // 保存实施方案（如果有修改）
    if (implObj && implObj.implementationPlan) {
      try {
        console.log('💾 保存实施方案编辑结果...')
        // 将进度计划合并到实施方案中
        if (scheduleObj && scheduleObj.milestones && scheduleObj.milestones.length > 0) {
          implObj.implementationPlan.scheduleMilestones = scheduleObj.milestones
          implObj.implementationPlan.totalDuration = scheduleObj.totalDuration || implObj.implementationPlan.totalDuration
        }
        
        await saveAnalysisModuleToBackend(projectId.value, 'implementation', implObj)
        savedCount++
        console.log('✅ 实施方案编辑结果已保存到后端')
      } catch (error) {
        console.error('❌ 实施方案保存失败:', error)
        errors.push('实施方案')
      }
    }

    // 保存技术路线（如果有修改）
    if (techObj && techObj.technicalRoute && techObj.technicalRoute.length > 0) {
      try {
        console.log('💾 保存技术路线编辑结果...')
        await saveAnalysisModuleToBackend(projectId.value, 'technicalRoute', techObj)
        savedCount++
        console.log('✅ 技术路线编辑结果已保存到后端')
      } catch (error) {
        console.error('❌ 技术路线保存失败:', error)
        errors.push('技术路线')
      }
    }

    // 结果反馈
    if (errors.length === 0) {
      console.log(`🎉 所有编辑结果已成功保存到后端（${savedCount}个模块）`)
    } else {
      console.warn(`⚠️ 部分模块保存失败: ${errors.join('、')}，已保存${savedCount}个模块`)
      message.warning(`部分模块保存失败: ${errors.join('、')}，但本地修改已保留`)
    }
  } catch (error) {
    console.error('❌ 编辑结果后端保存异常:', error)
    message.warning('后端保存失败，但本地修改已保留')
  }
}

/**
 * 🆕 从后端加载解析结果
 */
const loadAnalysisFromBackendData = async () => {
  try {
    if (!projectId.value) {
      console.warn('⚠️ 项目ID为空，跳过后端数据加载')
      return false
    }
    
    console.log('🌐 开始从后端加载解析结果...')
    
    const backendData = await loadAnalysisFromBackend(projectId.value)
    
    console.log('🔍 [调试] loadAnalysisFromBackend返回数据:', backendData)
    
    if (backendData.hasData) {
      let loadedCount = 0
      
      // 加载基本信息
      if (backendData.basicInfo) {
        doubaoAnalysisResults.value.basicInfo = backendData.basicInfo
        updateAnalysisData('basicInfo', backendData.basicInfo)
        loadedCount++
        console.log('🌐 已加载基本信息解析结果')
      }
      
      // 加载技术路线
      if (backendData.technicalRoute) {
        doubaoAnalysisResults.value.technicalRoute = backendData.technicalRoute
        updateAnalysisData('technicalRoute', backendData.technicalRoute)
        loadedCount++
        console.log('🌐 已加载技术路线解析结果')
      }
      
      // 加载实施方案
      if (backendData.implementation) {
        doubaoAnalysisResults.value.implementation = backendData.implementation
        updateAnalysisData('implementation', backendData.implementation)
        loadedCount++
        console.log('🌐 已加载实施方案解析结果')
      }
      
      if (loadedCount > 0) {
        message.success(`已从后端恢复 ${loadedCount} 个模块的解析结果`)
        console.log(`🌐 总共从后端加载了 ${loadedCount} 个解析结果`)
        
        // 检查解析完成状态
        checkAnalysisCompletion()
        
        return true
      } else {
        console.log('🌐 后端有解析记录但无具体解析数据')
        return false
      }
    } else {
      console.log('🌐 后端暂无解析数据，将使用本地存储数据')
      return false
    }
  } catch (error) {
    console.error('❌ 从后端加载解析结果失败:', error)
    return false
  }
}

/**
 * 处理粘贴结果（从弹窗调用）
 */
const processPasteResult = () => {
  handlePasteResult(pasteResultText.value)
  pasteResultText.value = '' // 清空输入框
}

/**
 * 生成修订版提示词
 */
const generateRevisionPrompt = (analysisType) => {
  const base = doubaoAnalysisResults.value[analysisType]
  const notes = revisionNotes.value[analysisType]
  if (!base) throw new Error('当前模块暂无原始JSON结果，无法生成修订提示词')

  const typeNames = {
    basicInfo: '项目基本信息提取',
    technicalRoute: '技术路线梳理',
    implementation: '实施方案分析'
  }

  const templateHeader = `你是科研项目文本结构化助手。请在“严格保留字段与结构不变”的前提下，基于用户提供的“修订意见”，对下述JSON进行必要修改并返回完整JSON。禁止返回除JSON之外的任何文本。\n\n【修订原则】\n- 仅在意见涉及的字段作出变更；\n- 严格保持既有字段名、层级与数组结构；\n- 日期、金额等字段保持原有格式；\n- 若意见不明确则维持原值。\n\n【当前模块】${typeNames[analysisType]}\n\n【修订意见】\n${notes || '（无，仅校正格式或小幅润色）'}\n\n【原始JSON】`;

  return `${templateHeader}\n${JSON.stringify(base, null, 2)}`
}

/**
 * 一键复制修订提示词到剪贴板
 */
const reviseAndCopyToDoubao = async (analysisType) => {
  try {
    const prompt = generateRevisionPrompt(analysisType)
    await navigator.clipboard.writeText(prompt)
    message.success('修订版提示词已复制到剪贴板！请粘贴到豆包进行重新生成。')
  } catch (e) {
    console.error('修订提示词复制失败：', e)
    message.error('生成或复制失败：' + (e.message || '未知错误'))
  }
}

/** 清空修订意见 */
const clearRevisionNotes = (analysisType) => {
  if (revisionNotes.value[analysisType] !== undefined) {
    revisionNotes.value[analysisType] = ''
  }
}

/**
 * 更新分析数据
 */
const updateAnalysisData = (analysisType, result) => {
  switch (analysisType) {
    case 'basicInfo':
      if (result.projectName) analysisData.value.projectName = result.projectName
      if (result.applicantUnit) analysisData.value.applicantUnit = result.applicantUnit
      if (result.leader) analysisData.value.leader = result.leader
      if (result.applicationDate) analysisData.value.applicationDate = result.applicationDate
      break
      
    case 'technicalRoute':
      if (result.technicalRoute) {
        analysisData.value.technicalRoute = JSON.stringify(result.technicalRoute, null, 2)
      }
      break
      
    case 'implementation':
      if (result.implementationPlan) {
        analysisData.value.implementationPlan = JSON.stringify(result.implementationPlan, null, 2)
        analysisData.value.schedule = result.implementationPlan.totalDuration || ''
      }
      break
  }
  
  // 检查是否所有分析都完成
  checkAnalysisCompletion()
}

/**
 * 检查分析完成状态
 */
const checkAnalysisCompletion = () => {
  const hasBasicInfo = doubaoAnalysisResults.value.basicInfo !== null
  const hasTechnicalRoute = doubaoAnalysisResults.value.technicalRoute !== null
  const hasImplementation = doubaoAnalysisResults.value.implementation !== null
  
  if (hasBasicInfo && hasTechnicalRoute && hasImplementation) {
    analysisCompleted.value = true
    message.success('🎉 所有分析模块已完成！')
  }

  // 根据最新结果动态生成任务
  generateExtractedTasks()
}

/**
 * 显示豆包指南
 */
const showDoubaoGuide = () => {
  guideVisible.value = true
}

/**
 * 显示图片备用库
 */
const showImageLibrary = () => {
  if (documentImages.value.length === 0) {
    message.info('当前文档中没有发现可提取的图片。');
  }
  imageLibraryVisible.value = true;
}

/**
 * 复制单张图片到剪贴板
 */
const copyImageToClipboard = async (imageBlob, index) => {
  try {
    const clipboardItem = new ClipboardItem({ [imageBlob.type]: imageBlob });
    await navigator.clipboard.write([clipboardItem]);
    message.success(`图片 ${index} 已成功复制到剪贴板！`);
  } catch (error) {
    console.error(`❌ 复制图片 ${index} 失败:`, error);
    message.error(`复制图片 ${index} 失败，您的浏览器可能不支持或未授权。`);
  }
}

/**
 * 为豆包准备纯文本内容（图片替换为占位符）并复制
 */
const prepareTextForDoubao = async (analysisType) => {
  if (!documentLoaded.value) {
    message.error('请先等待申报书加载完成');
    return;
  }

  // 1. 【新逻辑】通过解析HTML来生成带占位符的纯文本
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = documentHtml.value;
  // 将每个图片标签替换为其alt文本（即 '[图片X]'）
  tempDiv.querySelectorAll('img').forEach(img => {
    const altText = img.getAttribute('alt');
    if (altText) {
      img.parentNode.replaceChild(document.createTextNode(altText), img);
    }
  });
  const textWithPlaceholders = tempDiv.textContent || tempDiv.innerText || '';

  // 2. 生成AI指令
  const prompt = generateAnalysisPrompt(analysisType, textWithPlaceholders);

  // 3. 复制到剪贴板
  try {
    await navigator.clipboard.writeText(prompt);
    message.success('纯文本提示词已复制到剪贴板！');

    // 4. 自动打开图片备用库
    showImageLibrary();

  } catch (err) {
    console.error('❌ 复制纯文本失败:', err);
    message.error('复制失败，请检查浏览器权限。');
  }
}

/**
 * 编辑结果
 */
const enterEdit = () => {
  // 初始化草稿
  draftBasicInfo.projectName = displayBasicInfo.value.projectName || ''
  draftBasicInfo.applicantUnit = displayBasicInfo.value.applicantUnit || ''
  draftBasicInfo.leader = displayBasicInfo.value.leader || ''
  draftBasicInfo.applicationDate = displayBasicInfo.value.applicationDate || ''
  // 生成可视化编辑草稿
  const impl = implementationPlanObj.value
  editImplDuration.value = (impl && impl.totalDuration) || ''
  editImplPhases.value = (impl && impl.phases ? impl.phases : []).map((p, idx) => ({
    id: `impl_phase_${idx}_${Date.now()}`,
    phaseName: p.phaseName || '',
    objectivesText: Array.isArray(p.objectives) ? p.objectives.join('；') : (p.objectives || ''),
    activitiesText: Array.isArray(p.activities) ? p.activities.join('；') : (p.activities || ''),
    milestonesText: Array.isArray(p.milestones) ? p.milestones.join('；') : (p.milestones || ''),
    budget: p.budget || ''
  }))
  const trs = technicalRoutePhases.value || []
  editTechPhases.value = trs.map((t, idx) => ({
    id: `tech_phase_${idx}_${Date.now()}`,
    phase: t.phase || '',
    keyTechnologiesText: Array.isArray(t.keyTechnologies) ? t.keyTechnologies.join('；') : (t.keyTechnologies || ''),
    mainTasksText: Array.isArray(t.mainTasks) ? t.mainTasks.join('；') : (t.mainTasks || ''),
    deliverablesText: Array.isArray(t.deliverables) ? t.deliverables.join('；') : (t.deliverables || '')
  }))
  // 初始化进度计划里程碑草稿
  if (displayScheduleObj.value && Array.isArray(displayScheduleObj.value.milestones)) {
    editScheduleMilestones.value = displayScheduleObj.value.milestones.map(m => ({
      name: m.name || '',
      plannedDate: m.plannedDate || '',
      criteriaText: Array.isArray(m.criteria) ? m.criteria.join('；') : (m.criteria || '')
    }))
  } else {
    editScheduleMilestones.value = (extractedTasks.value.milestones || []).map(m => ({
      name: m.name || '',
      plannedDate: m.plannedDate || '',
      criteriaText: Array.isArray(m.criteria) ? m.criteria.join('；') : ''
    }))
  }
  isEditing.value = true
}
const cancelEdit = () => { isEditing.value = false }
const saveEdit = async () => {
  // 写入覆盖层
  manualOverrides.value.basicInfo = { ...draftBasicInfo }
  
  // 构建各模块数据
  let implObj = null
  let techObj = null
  let scheduleObj = null
  
  // 将可视化编辑内容转回JSON覆盖
  try {
    implObj = {
      implementationPlan: {
        totalDuration: editImplDuration.value || undefined,
        phases: editImplPhases.value.map(p => ({
          phaseName: p.phaseName,
          objectives: p.objectivesText ? p.objectivesText.split('；').map(s => s.trim()).filter(Boolean) : [],
          activities: p.activitiesText ? p.activitiesText.split('；').map(s => s.trim()).filter(Boolean) : [],
          milestones: p.milestonesText ? p.milestonesText.split('；').map(s => s.trim()).filter(Boolean) : [],
          budget: p.budget
        }))
      }
    }
    manualOverrides.value.implementation = JSON.stringify(implObj)
  } catch (e) { 
    console.warn('⚠️ 实施方案数据构建失败:', e)
  }

  try {
    techObj = {
      technicalRoute: editTechPhases.value.map(t => ({
        phase: t.phase,
        keyTechnologies: t.keyTechnologiesText ? t.keyTechnologiesText.split('；').map(s => s.trim()).filter(Boolean) : [],
        mainTasks: t.mainTasksText ? t.mainTasksText.split('；').map(s => s.trim()).filter(Boolean) : [],
        deliverables: t.deliverablesText ? t.deliverablesText.split('；').map(s => s.trim()).filter(Boolean) : []
      }))
    }
    manualOverrides.value.technicalRoute = JSON.stringify(techObj)
  } catch (e) { 
    console.warn('⚠️ 技术路线数据构建失败:', e)
  }
  
  // 保存进度计划覆盖
  try {
    scheduleObj = {
      totalDuration: editImplDuration.value || displaySchedule.value || '',
      milestones: editScheduleMilestones.value.map(m => ({
        name: m.name,
        plannedDate: m.plannedDate,
        criteria: m.criteriaText ? m.criteriaText.split('；').map(s => s.trim()).filter(Boolean) : []
      }))
    }
    manualOverrides.value.schedule = JSON.stringify(scheduleObj)
  } catch (e) { 
    console.warn('⚠️ 进度计划数据构建失败:', e)
  }
  
  // 🆕 保存编辑结果到后端数据库
  await saveEditResultsToBackend(implObj, techObj, scheduleObj)
  
  isEditing.value = false
  message.success('手工修改已保存并同步到后端')
}

// 里程碑编辑操作
const addScheduleMilestone = () => {
  editScheduleMilestones.value.push({ name: '', plannedDate: '', criteriaText: '' })
}
const removeScheduleMilestone = (index) => {
  if (index >= 0 && index < editScheduleMilestones.value.length) {
    editScheduleMilestones.value.splice(index, 1)
  }
}
const clearScheduleMilestones = () => {
  editScheduleMilestones.value = []
}

// 🆕 实施方案编辑操作
const addImplementationPhase = () => {
  const newPhase = {
    id: `impl_phase_${Date.now()}`,
    phaseName: `新阶段${editImplPhases.value.length + 1}`,
    objectivesText: '',
    activitiesText: '',
    milestonesText: '',
    budget: ''
  }
  editImplPhases.value.push(newPhase)
  message.success('已新增实施阶段')
}

const removeImplementationPhase = (index) => {
  if (index >= 0 && index < editImplPhases.value.length) {
    const phaseName = editImplPhases.value[index].phaseName || `阶段${index + 1}`
    editImplPhases.value.splice(index, 1)
    message.success(`已删除${phaseName}`)
  }
}

const clearImplementationPhases = () => {
  Modal.confirm({
    title: '确认清空所有实施阶段？',
    content: '此操作将删除所有实施阶段，不可恢复。',
    onOk: () => {
      editImplPhases.value = []
      message.success('已清空所有实施阶段')
    }
  })
}

const resetImplementationPhases = () => {
  Modal.confirm({
    title: '确认重置为原始数据？',
    content: '此操作将恢复为AI解析的原始实施方案数据，当前修改将丢失。',
    onOk: () => {
      // 重新从原始数据初始化
      const impl = implementationPlanObj.value
      editImplPhases.value = (impl && impl.phases ? impl.phases : []).map((p, idx) => ({
        id: `impl_phase_${idx}_${Date.now()}`,
        phaseName: p.phaseName || '',
        objectivesText: Array.isArray(p.objectives) ? p.objectives.join('；') : (p.objectives || ''),
        activitiesText: Array.isArray(p.activities) ? p.activities.join('；') : (p.activities || ''),
        milestonesText: Array.isArray(p.milestones) ? p.milestones.join('；') : (p.milestones || ''),
        budget: p.budget || ''
      }))
      message.success('已重置为原始实施方案数据')
    }
  })
}

const onImplementationPhasesChange = (evt) => {
  console.log('🔄 实施方案阶段顺序已调整:', evt)
  message.success('实施阶段顺序已调整')
}

// 🆕 技术路线编辑操作
const addTechnicalPhase = () => {
  const newPhase = {
    id: `tech_phase_${Date.now()}`,
    phase: `新阶段${editTechPhases.value.length + 1}`,
    keyTechnologiesText: '',
    mainTasksText: '',
    deliverablesText: ''
  }
  editTechPhases.value.push(newPhase)
  message.success('已新增技术路线阶段')
}

const removeTechnicalPhase = (index) => {
  if (index >= 0 && index < editTechPhases.value.length) {
    const phaseName = editTechPhases.value[index].phase || `阶段${index + 1}`
    editTechPhases.value.splice(index, 1)
    message.success(`已删除${phaseName}`)
  }
}

const clearTechnicalPhases = () => {
  Modal.confirm({
    title: '确认清空所有技术路线阶段？',
    content: '此操作将删除所有技术路线阶段，不可恢复。',
    onOk: () => {
      editTechPhases.value = []
      message.success('已清空所有技术路线阶段')
    }
  })
}

const resetTechnicalPhases = () => {
  Modal.confirm({
    title: '确认重置为原始数据？',
    content: '此操作将恢复为AI解析的原始技术路线数据，当前修改将丢失。',
    onOk: () => {
      // 重新从原始数据初始化
      const trs = technicalRoutePhases.value || []
      editTechPhases.value = trs.map((t, idx) => ({
        id: `tech_phase_${idx}_${Date.now()}`,
        phase: t.phase || '',
        keyTechnologiesText: Array.isArray(t.keyTechnologies) ? t.keyTechnologies.join('；') : (t.keyTechnologies || ''),
        mainTasksText: Array.isArray(t.mainTasks) ? t.mainTasks.join('；') : (t.mainTasks || ''),
        deliverablesText: Array.isArray(t.deliverables) ? t.deliverables.join('；') : (t.deliverables || '')
      }))
      message.success('已重置为原始技术路线数据')
    }
  })
}

const onTechnicalPhasesChange = (evt) => {
  console.log('🔄 技术路线阶段顺序已调整:', evt)
  message.success('技术路线阶段顺序已调整')
}

const restoreCurrentBlock = () => {
  const key = activeTabKey.value
  Modal.confirm({
    title: '确认还原为解析结果？',
    content: '将本区块恢复为最近一次粘贴的AI解析结果，不影响AI原结果，可再次编辑。',
    onOk: () => {
      if (key === 'overview') manualOverrides.value.basicInfo = {}
      if (key === 'implementation') manualOverrides.value.implementation = ''
      if (key === 'technical') manualOverrides.value.technicalRoute = ''
      if (key === 'schedule') manualOverrides.value.schedule = ''
      message.success('已还原为解析结果')
    }
  })
}

// 废弃保留：如后续需要导出/保存可在此实现。当前仅保留“下一步”。

/**
 * 进入下一步 - 智能双模式兼容机制
 */
const goToNextStep = () => {
  // 确保生成最新的任务数据
  generateExtractedTasks()
  
  // 准备传递给父组件的状态信息和任务数据
  const payload = {
    analysisCompleted: analysisCompleted.value,
    hasAnyResult: hasAnyResult.value,
    completedCount: completedCount.value,
    totalCount: 3,
    // 传递生成的建议任务数据
    extractedTasks: extractedTasks.value,
    // 传递解析的完整数据用于后续处理
    analysisData: {
      basicInfo: doubaoAnalysisResults.value.basicInfo,
      technicalRoute: doubaoAnalysisResults.value.technicalRoute,
      implementation: doubaoAnalysisResults.value.implementation,
      implementationPhases: implementationPhases.value,
      technicalRoutePhases: technicalRoutePhases.value
    }
  }
  
  console.log('📋 传递给任务计划的数据:', payload)
  
  // 智能双模式兼容机制
  const handleNavigation = () => {
    // 检测是否有父组件监听（多步骤页面模式）
    const hasParentListener = getCurrentInstance()?.parent?.emit
    
    if (hasParentListener) {
      // 模式A：多步骤页面 - 触发父组件事件切换选项卡
      console.log('🔄 [申报书解析] 多步骤页面模式：触发父组件事件')
      emit('next', payload)
    } else {
      // 模式B：独立路由页面 - 直接路由跳转
      console.log('🔄 [申报书解析] 独立路由模式：跳转到任务计划与分配页面')
      const targetRoute = {
        path: '/th-qd-implementation-v3/task-planning',
        query: currentProjectId.value ? { projectId: currentProjectId.value } : {}
      }
      
      router.push(targetRoute)
        .then(() => {
          const taskCount = (payload.extractedTasks?.implementation?.length || 0) + 
                           (payload.extractedTasks?.technical?.length || 0)
          const taskInfo = taskCount > 0 ? `，已生成${taskCount}个建议任务` : ''
          const tip = payload.analysisCompleted ? '（三个模块均已完成）' : `（已完成 ${payload.completedCount}/${payload.totalCount} 模块）`
          
          message.success(`已进入：任务计划与分配 ${tip}${taskInfo}`)
        })
        .catch((error) => {
          console.error('❌ 跳转到任务计划与分配页面失败:', error)
          message.error('页面跳转失败，请手动前往任务计划与分配页面')
        })
    }
  }
  
  if (!analysisCompleted.value) {
    Modal.confirm({
      title: '确认进入下一步？',
      content: '当前仅完成部分模块，您仍可在下一步继续补齐。本操作不会丢失已填写内容。',
      onOk: handleNavigation
    })
  } else {
    handleNavigation()
  }
}

/**
 * 获取任务优先级颜色
 */
const getTaskPriorityColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colors[priority] || 'default'
}

// 优先级中文文案
const getPriorityText = (priority) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || priority
}

/**
 * 获取里程碑颜色
 */
const getMilestoneColor = (status) => {
  const colors = {
    completed: 'green',
    active: 'blue',
    pending: 'gray'
  }
  return colors[status] || 'gray'
}

// 🆕 记住最近一次项目选择（与团队配置页面共享）
const LAST_PROJECT_ID_KEY = 'implV3:lastProjectId'

/**
 * 组件挂载时自动加载申报书
 */
onMounted(async () => {
  console.log('🚀 申报书解析组件已挂载，开始自动获取申报书...')
  
  // 🆕 恢复上次选择的项目ID（仅在独立页面模式下）
  let needRestoreProjectId = null
  if (!props.selectedProject && !route.query.projectId) {
    const savedProjectId = localStorage.getItem(LAST_PROJECT_ID_KEY)
    if (savedProjectId && savedProjectId !== '' && savedProjectId !== 'ALL_PROJECTS') {
      console.log('🔄 准备恢复上次选择的项目ID:', savedProjectId)
      needRestoreProjectId = savedProjectId
      
      // 🆕 立即设置currentProjectId，确保projectId计算属性能正确返回值
      currentProjectId.value = savedProjectId
      console.log('✅ 已立即设置currentProjectId.value:', currentProjectId.value)
      
      // 🆕 获取项目名称信息，确保下拉选项显示正确
      try {
        await fetchProjectInfo(savedProjectId)
        console.log('✅ 已获取恢复项目的详细信息:', currentProjectInfo.value.projectName)
      } catch (error) {
        console.warn('⚠️ 获取恢复项目信息失败:', error)
      }
    } else if (savedProjectId === 'ALL_PROJECTS') {
      console.log('⚠️ 检测到ALL_PROJECTS，申报书解析页面不支持此选项，跳过恢复')
      // 清除无效的ALL_PROJECTS值
      localStorage.removeItem(LAST_PROJECT_ID_KEY)
    }
  }
  
  // 检查是否从团队配置跳转过来
  if (route.query.projectId && !props.selectedProject) {
    console.log('🔗 检测到从团队配置跳转，项目ID:', route.query.projectId)
    fromTeamConfig.value = true
    currentProjectId.value = route.query.projectId
    
    // 获取项目信息
    try {
      await fetchProjectInfo(route.query.projectId)
      console.log('✅ 已自动选择项目:', currentProjectInfo.value.projectName || route.query.projectId)
      message.success(`已自动选择项目：${currentProjectInfo.value.projectName || route.query.projectId}`)
    } catch (error) {
      console.error('❌ 获取项目信息失败:', error)
      message.warning('获取项目信息失败，但已选择项目ID')
    }
  }
  
  try {
    // 🆕 调试：检查projectId计算属性的值
    console.log('🔍 [调试] 当前projectId.value:', projectId.value)
    console.log('🔍 [调试] currentProjectId.value:', currentProjectId.value)
    console.log('🔍 [调试] props.selectedProject?.id:', props.selectedProject?.id)
    console.log('🔍 [调试] route.query.projectId:', route.query.projectId)
    
    // 优先尝试显示文档选择弹窗
    if (projectId.value) {
      console.log('📋 检测到项目ID，尝试获取项目申报文档列表...', projectId.value)
      // 获取文档列表但不显示弹窗
      const documents = await fetchProjectDocuments(projectId.value)
      console.log('📋 获取到的文档列表:', documents.length, '个文档')

      // 设置文档列表以在界面上显示
      availableDocuments.value = documents

      // 如果有文档，自动选择最佳文档
      if (documents.length > 0 && !documentLoaded.value) {
        console.log('📋 发现可用文档，尝试自动加载最佳文档')
        const bestDoc = pickBestProposalMaterial(documents)
        if (bestDoc) {
          try {
            const fileUrl = bestDoc.fileUrl || bestDoc.downloadUrl
            const fileName = bestDoc.materialName || bestDoc.fileName
            console.log('🔍 自动加载最佳文档:', fileName)
            await loadAndPreviewWord(fileUrl)
            currentFileName.value = fileName || '申报文档'
            currentDocumentUrl.value = fileUrl || ''
            selectedDocumentId.value = bestDoc.id
            console.log('✅ 申报书文档自动加载成功 - documentLoaded:', documentLoaded.value)
          } catch (error) {
            console.warn('⚠️ 自动加载申报书文档失败:', error)
          }
        }
      }
      
      // 🆕 优先从后端加载解析结果
      console.log('🔍 [调试] 开始调用loadAnalysisFromBackendData，projectId:', projectId.value)
      const hasBackendData = await loadAnalysisFromBackendData()
      console.log('🔍 [调试] loadAnalysisFromBackendData返回结果:', hasBackendData)
      
      // 如果后端无数据，则尝试恢复本地存储的解析结果
      if (!hasBackendData) {
        console.log('💾 后端无数据，尝试从本地存储恢复解析结果')
        restoreAnalysisResultsFromLocal()
      }
      
      // 🔍 调试：检查当前解析结果状态
      console.log('🔍 [调试] 当前doubaoAnalysisResults状态:', {
        basicInfo: !!doubaoAnalysisResults.value.basicInfo,
        technicalRoute: !!doubaoAnalysisResults.value.technicalRoute,
        implementation: !!doubaoAnalysisResults.value.implementation
      })
      console.log('🔍 [调试] hasAnyResult计算结果:', hasAnyResult.value)
      
      // 🆕 尝试自动加载申报书文档内容（如果文档选择弹窗中有推荐文档）
      if (availableDocuments.value.length > 0 && !documentLoaded.value) {
        console.log('📋 发现可用文档，尝试自动加载最佳文档')
        const bestDoc = pickBestProposalMaterial(availableDocuments.value)
        if (bestDoc) {
          try {
            const fileUrl = bestDoc.fileUrl || bestDoc.downloadUrl
            const fileName = bestDoc.materialName || bestDoc.fileName
            console.log('🔍 自动加载最佳文档:', fileName)
            await loadAndPreviewWord(fileUrl)
            currentFileName.value = fileName || '申报文档'
            currentDocumentUrl.value = fileUrl || ''
            console.log('✅ 申报书文档自动加载成功 - documentLoaded:', documentLoaded.value)
          } catch (error) {
            console.warn('⚠️ 自动加载申报书文档失败:', error)
          }
        } else {
          console.log('⚠️ 未找到最佳文档，尝试加载默认申报书')
          try {
            await loadProjectDocument()
            console.log('✅ 默认申报书文档加载成功 - documentLoaded:', documentLoaded.value)
          } catch (error) {
            console.warn('⚠️ 默认申报书文档加载失败:', error)
          }
        }
      } else if (availableDocuments.value.length === 0 && !documentLoaded.value) {
        console.log('⚠️ 无可用文档，尝试加载默认申报书')
        try {
          await loadProjectDocument()
          console.log('✅ 默认申报书文档加载成功 - documentLoaded:', documentLoaded.value)
        } catch (error) {
          console.warn('⚠️ 默认申报书文档加载失败:', error)
        }
      } else if (documentLoaded.value) {
        console.log('✅ 文档已加载，documentLoaded:', documentLoaded.value)
      }
    } else {
      console.log('⚠️ 未检测到项目ID')
      if (props.selectedProject) {
        console.log('⚠️ 在多步骤页面中但项目数据异常，使用默认申报书文档')
        await loadProjectDocument()
      } else {
        console.log('💡 在独立页面中，初始化项目列表')
        // 在独立页面中，初始化项目列表供用户选择
        await fetchProjects()
        console.log('🔍 [onMounted] fetchProjects完成后，availableProjects.value:', availableProjects.value.length)
      }
    }
    
    // 🆕 确保项目列表已加载（无论是否在独立页面模式）
    if ((!props.selectedProject && !route.query.projectId) || availableProjects.value.length === 0) {
      console.log('🔄 确保项目列表已加载...')
      await fetchProjects()
      console.log('✅ 项目列表加载完成，共', availableProjects.value.length, '个项目')
    }
    
    // 🆕 在项目列表加载完成后，再设置恢复的项目ID（确保下拉选项能正确显示项目名称）
    if (needRestoreProjectId) {
      console.log('🔄 项目列表已加载，现在设置恢复的项目ID:', needRestoreProjectId)
      console.log('🔍 [调试] availableProjects.value:', availableProjects.value)
      console.log('🔍 [调试] 第一个项目数据结构:', availableProjects.value[0])
      
      // 🆕 确保类型一致：将字符串ID转换为数字（如果项目数据中的id是数字）
      const projectIdNumber = Number(needRestoreProjectId)
      const projectIdString = String(needRestoreProjectId)
      
      // 检查项目列表中是否存在该项目
      const foundProject = availableProjects.value.find(p => 
        p.id === projectIdNumber || p.id === projectIdString || 
        String(p.id) === projectIdString || Number(p.id) === projectIdNumber
      )
      
      if (foundProject) {
        console.log('✅ 在项目列表中找到匹配项目:', foundProject)
        currentProjectId.value = foundProject.id  // 使用项目列表中的实际ID类型
        console.log('✅ 项目ID已恢复，类型:', typeof foundProject.id, '值:', foundProject.id)
      } else {
        console.warn('⚠️ 在项目列表中未找到匹配的项目，ID:', needRestoreProjectId)
        currentProjectId.value = projectIdNumber  // 尝试使用数字类型
      }
    }
    
    console.log('✅ 申报书自动加载完成')
  } catch (error) {
    console.warn('⚠️ 申报书自动加载失败，用户可手动触发加载:', error.message)
  }
  // 监听滚动用于显示回到顶部（同时监听窗口与最近的可滚动容器）
  await nextTick()
  const rootEl = document.querySelector('.proposal-analysis-step-simple')
  const container = findScrollableParent(rootEl)
  if (container) {
    scrollContainer.value = container
    container.addEventListener('scroll', handleScroll, { passive: true })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updatePlacement, { passive: true })
  // 初始放置与避让
  updateBackToTopVisibility()
  updatePlacement()
  // 轮询：处理助手气泡显示/隐藏或尺寸变化
  startPlacementPolling()
})

// 动态生成任务：从实施方案与技术路线映射
const generateExtractedTasks = () => {
  const implTasks = []
  const techTasks = []
  const mileItems = []

  // 实施方案：阶段 activities → implementation 任务；milestones → 里程碑
  const phases = implementationPhases.value || []
  phases.forEach((ph, pIdx) => {
    if (Array.isArray(ph.activities)) {
      ph.activities.forEach((act, aIdx) => {
        implTasks.push({
          id: `impl_${pIdx + 1}_${aIdx + 1}`,
          name: act,
          description: Array.isArray(ph.objectives) ? ph.objectives.join('、') : '',
          priority: 'medium',
          duration: undefined,
          deliverables: Array.isArray(ph.milestones) ? ph.milestones : []
        })
      })
    }
    if (Array.isArray(ph.milestones)) {
      ph.milestones.forEach((m, mIdx) => {
        mileItems.push({
          id: `mile_${pIdx + 1}_${mIdx + 1}`,
          name: m,
          description: '',
          plannedDate: undefined,
          status: 'pending',
          criteria: []
        })
      })
    }
  })

  // 技术路线：mainTasks → technical 任务
  const trs = technicalRoutePhases.value || []
  trs.forEach((ph, tIdx) => {
    const mainTasks = Array.isArray(ph.mainTasks) ? ph.mainTasks : []
    mainTasks.forEach((t, i) => {
      techTasks.push({
        id: `tech_${tIdx + 1}_${i + 1}`,
        name: t,
        description: '',
        difficulty: 'medium',
        keyTechnologies: Array.isArray(ph.keyTechnologies) ? ph.keyTechnologies : []
      })
    })
  })

  extractedTasks.value = {
    implementation: implTasks,
    technical: techTasks,
    milestones: mileItems
  }
}

onBeforeUnmount(() => {
  // 组件销毁时释放图片URL
  revokeAllImageUrls()
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updatePlacement)
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
  stopPlacementPolling()
})

// 回到顶部：滚动监听与动作
const handleScroll = () => {
  updateBackToTopVisibility()
}
const updateBackToTopVisibility = () => {
  const yWin = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  const yEl = scrollContainer.value ? (scrollContainer.value.scrollTop || 0) : 0
  showBackToTop.value = (yWin > 200) || (yEl > 200)
}
const scrollToTop = () => {
  const yEl = scrollContainer.value ? (scrollContainer.value.scrollTop || 0) : 0
  if (yEl > 0 && scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 工具：查找最近的可滚动祖先容器
const findScrollableParent = (el) => {
  let node = el ? el.parentElement : null
  while (node && node !== document.body) {
    try {
      const style = window.getComputedStyle(node)
      const overflowY = style.overflowY
      const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight
      if (canScroll) return node
    } catch (e) { /* ignore */ }
    node = node.parentElement
  }
  return null
}

// 动态避让：检测右下角固定气泡并调整 bottom
let placementTimer = null
const startPlacementPolling = () => {
  if (placementTimer) return
  placementTimer = setInterval(updatePlacement, 1500)
}
const stopPlacementPolling = () => {
  if (placementTimer) {
    clearInterval(placementTimer)
    placementTimer = null
  }
}
const updatePlacement = () => {
  try {
    const bubble = detectAssistantBubble()
    if (!bubble) {
      backToTopBottom.value = 140
      backToTopSize.value = 56
      backToTopRight.value = 24
      return
    }
    const vh = window.innerHeight || document.documentElement.clientHeight
    const vw = window.innerWidth || document.documentElement.clientWidth
    const rect = bubble.getBoundingClientRect()
    const bottomSpace = vh - rect.bottom
    const rightSpace = vw - rect.right
    // 仅当确实在右下角附近时才避让
    if (rightSpace <= 120 && bottomSpace <= 160) {
      // 与助手等宽高并贴在助手上方16px
      const size = Math.min(Math.max(rect.width, 44), 64)
      backToTopSize.value = size
      backToTopBottom.value = Math.max(24, bottomSpace + rect.height + 16)
      backToTopRight.value = Math.max(16, rightSpace)
    } else {
      backToTopBottom.value = 140
      backToTopSize.value = 56
      backToTopRight.value = 24
    }
  } catch (e) {
    backToTopBottom.value = 140
    backToTopSize.value = 56
    backToTopRight.value = 24
  }
}
const detectAssistantBubble = () => {
  // 策略：扫描所有 fixed 元素，选择右下角、尺寸40~200之间的候选，排除回到顶部本身
  const nodes = Array.from(document.querySelectorAll('*'))
  const vh = window.innerHeight || document.documentElement.clientHeight
  const vw = window.innerWidth || document.documentElement.clientWidth
  let best = null
  let bestScore = -Infinity
  nodes.forEach((n) => {
    if (!(n instanceof HTMLElement)) return
    if (n.classList && n.classList.contains('back-to-top')) return
    const style = window.getComputedStyle(n)
    if (style.position !== 'fixed') return
    const rect = n.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w < 36 || h < 36 || w > 240 || h > 240) return
    const rightSpace = vw - rect.right
    const bottomSpace = vh - rect.bottom
    if (rightSpace > 160 || bottomSpace > 200) return
    // 评分：越靠近右下角越高
    const score = -(rightSpace + bottomSpace)
    if (score > bestScore) { bestScore = score; best = n }
  })
  return best
}
</script>

<style scoped>
.proposal-analysis-step-simple {
  padding: 20px;
}

.step-description {
  margin-bottom: 24px;
}

.step-description h3 {
  color: #1890ff;
  margin-bottom: 8px;
}

.main-content {
  margin-bottom: 24px;
}

.preview-card,
.analysis-card {
  height: 100%;
}

.document-preview {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  color: #666;
}

.preview-placeholder h4 {
  margin: 16px 0 8px 0;
  color: #333;
}

.document-card {
  margin-bottom: 16px;
}

.document-actions {
  padding: 8px 0;
}

.document-info-section {
  flex: 1;
  min-width: 300px;
}

.document-source {
  padding: 8px 0;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.analysis-section {
  width: 100%;
}

/* 文档预览弹窗样式 */
.document-preview-modal {
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fff;
}

/* PDF预览样式 */
.pdf-content {
  width: 100%;
  height: 600px;
  border-radius: 6px;
  overflow: hidden;
}

/* Word HTML预览样式 */
.word-content {
  background: white;
  padding: 20px;
  border-radius: 6px;
  font-family: 'Microsoft YaHei', SimSun, serif;
  line-height: 1.6;
}

.word-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.word-content p {
  margin: 8px 0;
  text-align: justify;
}

.word-content h1, .word-content h2, .word-content h3 {
  color: #1890ff;
  margin: 16px 0 8px 0;
}

.word-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.word-content table td, .word-content table th {
  border: 1px solid #d9d9d9;
  padding: 8px;
  text-align: left;
}

/* 空内容样式 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

/* 申报书预览样式 */
.proposal-content {
  padding: 24px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  line-height: 1.8;
  color: #333;
  background: #fff;
}

.proposal-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.proposal-body {
  width: 100%;
}

.section {
  margin-bottom: 32px;
  padding: 16px 0;
}

.section h3 {
  color: #1890ff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6f4ff;
}

.section p {
  margin: 12px 0;
  text-indent: 2em;
  color: #555;
}

.section ul {
  margin: 12px 0;
  padding-left: 24px;
}

.section li {
  margin: 8px 0;
  color: #555;
}

.section li strong {
  color: #333;
}

.timeline {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
}

.timeline-item {
  margin: 12px 0;
  padding: 8px 0;
  color: #555;
}

.timeline-item strong {
  color: #1890ff;
  font-weight: 600;
}

/* 格式化内容样式 */
.formatted-content {
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  line-height: 1.8;
  color: #333;
}

.formatted-content .section-title {
  color: #1890ff;
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e6f4ff;
}

.formatted-content .subsection-title {
  color: #1890ff;
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  padding-left: 16px;
  border-left: 3px solid #1890ff;
}

.formatted-content .paragraph {
  margin: 12px 0;
  color: #555;
  text-indent: 2em;
}

.formatted-content .content-list {
  margin: 12px 0;
  padding-left: 24px;
}

.formatted-content .list-item {
  margin: 8px 0;
  color: #555;
  line-height: 1.6;
}

.real-content {
  width: 100%;
}

.empty-content {
  padding: 40px;
  text-align: center;
}

.pdf-content {
  width: 100%;
  height: 600px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.pdf-content iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.analysis-progress {
  margin-bottom: 24px;
  text-align: center;
}

.progress-text {
  margin-top: 8px;
  color: #666;
}

/* 豆包智能解析样式 */
.doubao-analysis-card {
  border: 1px solid #e6f4ff;
  background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
}

.analysis-option-card {
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.analysis-option-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.analysis-option {
  text-align: center;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.option-header {
  position: relative;
  margin-bottom: 12px;
}

.option-icon {
  font-size: 32px;
  display: block;
}

.analysis-option h4 {
  color: #1890ff;
  margin: 8px 0;
  font-weight: 600;
}

.analysis-option p {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 16px;
  flex: 1;
}

/* 粘贴结果弹窗样式 */
.paste-result-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.paste-tips {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.paste-tips h4 {
  color: #1890ff;
  margin-bottom: 8px;
}

.paste-tips ul {
  margin: 0;
  padding-left: 20px;
}

.paste-tips li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

.analysis-results {
  margin-top: 16px;
}

.edit-toolbar {
  background: #fff;
  padding: 8px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

/* 新增：编辑工具条 CSS 粘性样式 */
.edit-toolbar--sticky {
  position: sticky;
  position: -webkit-sticky; /* Safari 兼容 */
  top: 72px; /* 与固定头部错开，避免遮挡 */
  z-index: 100; /* 提高层级，避免被Tabs或卡片阴影覆盖 */
  margin-bottom: 12px;
}

/* 移除右下角悬浮操作条（改为粘性工具条） */

.result-section {
  margin-bottom: 24px;
}

.result-section h4 {
  color: #333;
  margin-bottom: 12px;
}

.content-display {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

/* 技术路线阶段展示的简易样式 */
.phase { border: 1px solid #f0f0f0; border-radius: 6px; padding: 10px; background:#fff; margin-bottom: 8px; }
.kv { display: grid; grid-template-columns: 90px 1fr; gap: 6px; font-size: 13px; }
.kv .k { color: #888; }
.code-block { background:#0b1020; color:#aee2ff; padding:10px; border-radius:6px; white-space:pre-wrap; word-break:break-all; }

/* 🆕 拖拽编辑样式 */
.draggable-container {
  min-height: 50px;
}

.draggable-phase {
  transition: all 0.3s ease;
  cursor: default;
}

.draggable-phase:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #f5f5f5;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.sortable-ghost {
  opacity: 0.5;
  background: #e6f7ff;
  border: 2px dashed #1890ff;
}

.sortable-chosen {
  transform: rotate(2deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-priority {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.priority-title {
  color: #999;
  font-size: 12px;
}

.task-name {
  font-weight: 600;
  color: #333;
}

.task-description {
  color: #666;
  margin: 8px 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.milestone-list {
  margin-top: 16px;
}

.milestone-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.operation-area {
  margin-top: 24px;
}

/* 修订交互样式 */
.revision-panel {
  background: #f8faff;
  border: 1px solid #e6f0ff;
  border-radius: 8px;
  padding: 12px;
}
.revision-panel h4 {
  margin: 0 0 8px 0;
  color: #1d39c4;
}
.revision-hint {
  color: #888;
  font-size: 12px;
  margin-top: 6px;
}

.guide-content h4 {
  color: #333;
  margin: 16px 0 8px 0;
}

.guide-content ol,
.guide-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.guide-content li {
  margin: 4px 0;
  line-height: 1.5;
}

/* 新增：图片备用库样式 */
.image-library-modal {
  max-height: 80vh;
  overflow-y: auto;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.image-preview-container {
  width: 100%;
  padding-top: 75%; /* 4:3 aspect ratio */
  position: relative;
  background-color: #f0f2f5;
}

.image-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 改为contain以显示完整图片 */
}

.image-title {
  font-weight: 600;
  color: #333;
}

.copy-image-btn {
  margin-top: 8px;
}

/* 悬浮回到顶部按钮 */
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 140px;
  z-index: 2000;
  user-select: none;
}

/* 胶囊样式与动效 */
/* 圆形按钮样式，与助手气泡统一 */
.back-to-top--circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #234fa2 0%, #4e7be6 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(35, 79, 162, 0.18);
  cursor: pointer;
  transform: translateZ(0);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.back-to-top--circle .icon { display: inline-flex; font-size: 18px; line-height: 1; }
.back-to-top--circle:hover { transform: scale(1.04); box-shadow: 0 10px 24px rgba(35, 79, 162, 0.24); }
.back-to-top--circle:focus { outline: none; box-shadow: 0 0 0 3px rgba(78,123,230,0.35), 0 8px 20px rgba(35, 79, 162, 0.18); }


/* 响应式设计 */
@media (max-width: 768px) {
  .proposal-analysis-step-simple {
    padding: 12px;
  }
  
  .main-content .ant-col {
    margin-bottom: 16px;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 4px;
  }
}

/* 文档选择弹窗样式 */
.document-selection-modal {
  .document-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .document-card {
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    }
    
    &.selected {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
      background-color: #f6ffed;
    }
  }
  
  .document-info {
    display: flex;
    align-items: flex-start;
    width: 100%;
  }
  
  .document-details {
    flex: 1;
  }
  
  .document-name {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .document-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    color: #666;
    font-size: 12px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
  }
}

/* 项目选择器样式 */
.project-selector {
  .project-option {
    .project-name {
      font-weight: 500;
      color: #262626;
      margin-bottom: 4px;
    }
    
    .project-info {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #8c8c8c;
      
      .project-id {
        color: #1890ff;
      }
      
      .project-status {
        color: #52c41a;
      }
    }
  }
}
</style>
