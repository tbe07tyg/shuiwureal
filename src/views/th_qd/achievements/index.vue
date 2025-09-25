<!--
/**
 * @fileoverview 成果管理页面
 * @description 管理项目产出的各类成果，支持分类展示和导出
 * @author AI助手
 * @version 2.0
 * @since 2025-01-17
 */
-->
<template>
  <div class="achievements-management">
    <!-- 页面头部区域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">🏆 成果管理</h1>
        <p class="page-desc">项目研发成果集中管理，支持分类展示和批量导出</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="showAddDialog">
          <PlusOutlined />
          新增成果
        </a-button>
        <a-dropdown>
          <!-- <template #overlay>
            <a-menu @click="handleExport">
              <a-menu-item key="all">
                <DownloadOutlined />
                导出全部成果
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="paper">导出论文成果</a-menu-item>
              <a-menu-item key="ip">导出知识产权成果</a-menu-item>
              <a-menu-item key="application">导出应用成果</a-menu-item>
              <a-menu-item key="platform">导出平台建设成果</a-menu-item>
              <a-menu-item key="other">导出其他成果</a-menu-item>
            </a-menu>
          </template> -->
          <a-button>
            <DownloadOutlined />
            批量导出
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- 统计概览区域 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="4">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">总成果数</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card paper">
            <div class="stat-icon">📄</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.paper }}</div>
              <div class="stat-label">论文</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card ip">
            <div class="stat-icon">🔒</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.ip }}</div>
              <div class="stat-label">知识产权</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card application">
            <div class="stat-icon">🚀</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.application }}</div>
              <div class="stat-label">应用</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card platform">
            <div class="stat-icon">🏗️</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.platform }}</div>
              <div class="stat-label">平台建设</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card other">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.other }}</div>
              <div class="stat-label">其他</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="18">
          <a-space size="middle">
            <a-select 
              v-model:value="filters.type" 
              placeholder="全部类型" 
              style="width: 120px"
              @change="handleFilterChange"
            >
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="paper">论文</a-select-option>
              <a-select-option value="ip">知识产权</a-select-option>
              <a-select-option value="application">应用</a-select-option>
              <a-select-option value="platform">平台建设</a-select-option>
              <a-select-option value="other">其他</a-select-option>
            </a-select>

            <a-select 
              v-model:value="filters.project" 
              placeholder="全部项目" 
              style="width: 180px"
              @change="handleFilterChange"
              :loading="projectsLoading"
              show-search
              :filter-option="false"
              @search="handleProjectSearch"
              :options="[
                { value: '', label: '全部项目' },
                ...availableProjects.map(project => ({
                  value: project.id.toString(),
                  label: project.projectName
                }))
              ]"
            />

            <a-input-search
              v-model:value="filters.keyword"
              placeholder="搜索成果名称或关键词"
              style="width: 250px"
              @search="handleFilterChange"
              @change="handleFilterChange"
            />
          </a-space>
        </a-col>
        <a-col :span="6">
          <div class="total-count">
            <span>成果总数</span>
            <span class="count-number">{{ filteredAchievements.length }}</span>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 成果表格 -->
    <div class="table-section">
      <a-table
        :columns="columns"
        :data-source="filteredAchievements"
        :pagination="paginationConfig"
        :scroll="{ x: 1400 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeIcon(record.type) }} {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'title'">
            <div class="title-cell">
              <div class="title-text">{{ record.title }}</div>
              <div class="description-text">{{ record.description }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'details'">
            <div class="details-cell">
              <div v-if="record.type === 'paper'">
                <div><strong>期刊:</strong> {{ record.details.journal }}</div>
                <div><strong>年份:</strong> {{ record.details.year }} | <strong>IF:</strong> {{ record.details.impactFactor }}</div>
              </div>
              <div v-else-if="record.type === 'ip'">
                <div><strong>类型:</strong> {{ record.details.ipType }}</div>
                <div><strong>申请号:</strong> {{ record.details.applicationNumber }}</div>
                <div><strong>状态:</strong> <a-tag size="small" :color="record.details.status === '已授权' ? 'green' : 'orange'">{{ record.details.status }}</a-tag></div>
              </div>
              <div v-else-if="record.type === 'application'">
                <div><strong>领域:</strong> {{ record.details.field }}</div>
                <div><strong>规模:</strong> {{ record.details.scale }}</div>
                <div><strong>效益:</strong> {{ record.details.economicBenefit }}</div>
              </div>
              <div v-else-if="record.type === 'platform'">
                <div><strong>类型:</strong> {{ record.details.platformType }}</div>
                <div><strong>服务:</strong> {{ record.details.serviceTarget }}</div>
                <div><strong>用户:</strong> {{ record.details.userScale }}</div>
              </div>
              <div v-else>
                <div><strong>类别:</strong> {{ record.details.category }}</div>
                <div><strong>价值:</strong> {{ record.details.value }}</div>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'attachments'">
            <div v-if="record.attachments && record.attachments.length > 0" class="attachments-cell">
              <a-space>
              <a-tooltip :title="`共${record.attachments.length}个附件`">
                <a-button type="link" size="small" @click="showAttachments(record)">
                  📎 {{ record.attachments.length }}个附件
                </a-button>
              </a-tooltip>
                <a-button type="link" size="small" @click="previewAttachments(record)">
                  <EyeOutlined />
                  预览
                </a-button>
              </a-space>
            </div>
            <span v-else class="no-attachments">无附件</span>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <div class="action-buttons">
              <a-button type="link" size="small" @click="viewDetail(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="editAchievement(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="deleteAchievement(record)" class="delete-btn">
                <DeleteOutlined />
                删除
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑成果弹窗 -->
    <a-modal
      v-model:open="addDialogVisible"
      :title="editingAchievement ? '编辑成果' : '新增成果'"
      width="800px"
      :maskClosable="false"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="成果名称" name="title">
              <a-input v-model:value="formData.title" placeholder="请输入成果名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="成果类型" name="type">
              <a-select v-model:value="formData.type" placeholder="请选择成果类型" @change="handleTypeChange">
                <a-select-option value="paper">📄 论文</a-select-option>
                <a-select-option value="ip">🔒 知识产权</a-select-option>
                <a-select-option value="application">🚀 应用</a-select-option>
                <a-select-option value="platform">🏗️ 平台建设</a-select-option>
                <a-select-option value="other">📦 其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属项目" name="projectId">
              <a-select 
                v-model:value="formData.projectId" 
                placeholder="请选择项目"
                :loading="projectsLoading"
                show-search
                :filter-option="false"
                @search="handleProjectSearch"
                :options="availableProjects.map(project => ({
                  value: project.id.toString(),
                  label: project.projectName
                }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="完成时间" name="completionDate">
              <a-date-picker v-model:value="formData.completionDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="成果描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="请详细描述成果内容和价值"
            :rows="3"
          />
        </a-form-item>

        <!-- 动态详情字段 -->
        <div v-if="formData.type === 'paper'">
          <a-divider>论文详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="期刊名称">
                <a-input v-model:value="formData.details.journal" placeholder="发表期刊" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="发表年份">
                <a-input-number v-model:value="formData.details.year" :min="1900" :max="2030" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="影响因子">
                <a-input-number v-model:value="formData.details.impactFactor" :precision="2" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'ip'">
          <a-divider>知识产权详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="知识产权类型">
                <a-select v-model:value="formData.details.ipType" placeholder="请选择类型">
                  <a-select-option value="发明专利">发明专利</a-select-option>
                  <a-select-option value="实用新型">实用新型</a-select-option>
                  <a-select-option value="外观设计">外观设计</a-select-option>
                  <a-select-option value="软件著作权">软件著作权</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="申请号">
                <a-input v-model:value="formData.details.applicationNumber" placeholder="专利申请号" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="授权状态">
                <a-select v-model:value="formData.details.status" placeholder="请选择状态">
                  <a-select-option value="已授权">已授权</a-select-option>
                  <a-select-option value="审查中">审查中</a-select-option>
                  <a-select-option value="已申请">已申请</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'application'">
          <a-divider>应用详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="应用领域">
                <a-input v-model:value="formData.details.field" placeholder="应用的具体领域" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="应用规模">
                <a-input v-model:value="formData.details.scale" placeholder="应用的规模范围" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="经济效益">
                <a-input v-model:value="formData.details.economicBenefit" placeholder="带来的经济价值" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'platform'">
          <a-divider>平台建设详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="平台类型">
                <a-input v-model:value="formData.details.platformType" placeholder="平台的分类" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="服务对象">
                <a-input v-model:value="formData.details.serviceTarget" placeholder="服务的目标群体" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="用户规模">
                <a-input v-model:value="formData.details.userScale" placeholder="平台用户数量" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div v-else-if="formData.type === 'other'">
          <a-divider>其他成果详情</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="成果类别">
                <a-input v-model:value="formData.details.category" placeholder="具体分类" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="应用价值">
                <a-input v-model:value="formData.details.value" placeholder="实际应用价值" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <a-form-item label="相关附件">
          <a-upload
            :file-list="formData.attachments"
            :before-upload="beforeUpload"
            :on-remove="handleRemoveFile"
            :on-preview="handleFilePreview"
            :on-download="handleFileDownload"
            :show-upload-list="{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: true
            }"
            multiple
          >
            <a-button>
              <UploadOutlined />
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 附件查看弹窗 -->
    <a-modal
      v-model:open="attachmentsModalVisible"
      title="附件列表"
      width="600px"
      :footer="null"
    >
      <div v-if="selectedAchievement && selectedAchievement.attachments" class="attachments-list">
        <div 
          v-for="attachment in selectedAchievement.attachments" 
          :key="attachment.id"
          class="attachment-item"
        >
          <FileOutlined />
          <span class="attachment-name" @click="previewSingleFile(attachment)" style="cursor: pointer; color: #1890ff;">
            {{ attachment.name }}
          </span>
          <span class="attachment-size">({{ attachment.size }})</span>
          <a-space>
            <a-button type="link" size="small" @click="previewSingleFile(attachment)">
              <EyeOutlined />
              预览
            </a-button>
          <a-button type="link" size="small" @click="downloadAttachment(attachment)">
              <DownloadOutlined />
            下载
          </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 文件预览组件 -->
    <FilePreview
      :visible="previewVisible"
      :file-info="currentPreviewFile"
      :file-list="previewFileList"
      :current-file-index="currentFileIndex"
      @update:visible="previewVisible = $event"
      @download="downloadFile"
    />

    <!-- 成果详情查看弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="成果详情"
      width="800px"
      :footer="null"
      class="achievement-detail-modal"
    >
      <div v-if="selectedAchievement" class="achievement-detail-container">
        <!-- 加载动画 -->
        <div class="detail-loading" v-if="!selectedAchievement.achievementName">
          <div class="detail-loading-wrap">
            <div class="detail-loading-title">
              <img src="/logo.png" class="detail-loading-logo" alt="Logo" />
              <div class="detail-loading-text">正在加载成果详情...</div>
            </div>
            <div class="detail-loading-item">
              <div class="detail-loading-outter"></div>
              <div class="detail-loading-inner"></div>
            </div>
          </div>
        </div>
        
        <!-- 成果详情内容 -->
        <div v-else class="achievement-detail-content">
          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-header">
              <h3>
                <FileOutlined />
                基本信息
              </h3>
            </div>
            <div class="section-content">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="detail-item">
                    <label>成果名称：</label>
                    <span>{{ selectedAchievement.achievementName || selectedAchievement.title }}</span>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="detail-item">
                    <label>成果类型：</label>
                    <a-tag :color="getTypeColor(selectedAchievement.achievementType)">
                      {{ getTypeText(selectedAchievement.achievementType) }}
                    </a-tag>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="detail-item">
                    <label>所属项目：</label>
                    <span>{{ selectedAchievement.projectName || '未知项目' }}</span>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="detail-item">
                    <label>完成时间：</label>
                    <span>{{ selectedAchievement.completionTime ? dayjs(Number(selectedAchievement.completionTime)).format('YYYY-MM-DD') : '未设置' }}</span>
                  </div>
                </a-col>
                <a-col :span="24">
                  <div class="detail-item">
                    <label>成果描述：</label>
                    <div class="detail-description">{{ selectedAchievement.achievementDescription || selectedAchievement.description || '暂无描述' }}</div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="detail-section" v-if="hasDetailInfo(selectedAchievement)">
            <div class="section-header">
              <h3>
                <SettingOutlined />
                详细信息
              </h3>
            </div>
            <div class="section-content">
              <a-row :gutter="16">
                <!-- 论文类型 -->
                <template v-if="selectedAchievement.achievementType === 0">
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>期刊名称：</label>
                      <span>{{ selectedAchievement.journalName || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>发表年份：</label>
                      <span>{{ selectedAchievement.yearPublication || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>影响因子：</label>
                      <span>{{ selectedAchievement.impactFactor || '未填写' }}</span>
                    </div>
                  </a-col>
                </template>
                
                <!-- 知识产权类型 -->
                <template v-if="selectedAchievement.achievementType === 1">
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>知识产权类型：</label>
                      <span>{{ getIpTypeText(selectedAchievement.intellectualPropertyType) }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>申请号：</label>
                      <span>{{ selectedAchievement.applicationNumber || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>授权状态：</label>
                      <a-tag :color="getStatusColor(selectedAchievement.authorizationStatus)">
                        {{ getStatusText(selectedAchievement.authorizationStatus) }}
                      </a-tag>
                    </div>
                  </a-col>
                </template>
                
                <!-- 应用类型 -->
                <template v-if="selectedAchievement.achievementType === 2">
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>应用领域：</label>
                      <span>{{ selectedAchievement.applicationField || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>应用规模：</label>
                      <span>{{ selectedAchievement.applicationScale || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>经济效益：</label>
                      <span>{{ selectedAchievement.economicBenefits || '未填写' }}</span>
                    </div>
                  </a-col>
                </template>
                
                <!-- 平台建设类型 -->
                <template v-if="selectedAchievement.achievementType === 3">
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>平台类型：</label>
                      <span>{{ selectedAchievement.platformType || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>服务对象：</label>
                      <span>{{ selectedAchievement.serviceTarget || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="detail-item">
                      <label>用户规模：</label>
                      <span>{{ selectedAchievement.userScale || '未填写' }}</span>
                    </div>
                  </a-col>
                </template>
                
                <!-- 其他类型 -->
                <template v-if="selectedAchievement.achievementType === 4">
                  <a-col :span="12">
                    <div class="detail-item">
                      <label>成果类别：</label>
                      <span>{{ selectedAchievement.categoryAchievements || '未填写' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="12">
                    <div class="detail-item">
                      <label>应用价值：</label>
                      <span>{{ selectedAchievement.appliedValue || '未填写' }}</span>
                    </div>
                  </a-col>
                </template>
              </a-row>
            </div>
          </div>

          <!-- 附件信息 -->
          <div class="detail-section" v-if="selectedAchievement.projectAchievementFileDO && selectedAchievement.projectAchievementFileDO.length > 0">
            <div class="section-header">
              <h3>
                <PaperClipOutlined />
                相关附件
              </h3>
            </div>
            <div class="section-content">
              <div class="attachments-grid">
                <div 
                  v-for="attachment in selectedAchievement.projectAchievementFileDO" 
                  :key="attachment.id"
                  class="attachment-card"
                >
                  <div class="attachment-icon">
                    <FileOutlined />
                  </div>
                  <div class="attachment-info">
                    <div class="attachment-name">{{ attachment.fileName }}</div>
                    <div class="attachment-size">{{ formatFileSize(attachment.fileSize) }}</div>
                  </div>
                  <div class="attachment-actions">
                    <a-button type="link" size="small" @click="previewAttachment(attachment)">
                      <EyeOutlined />
                    </a-button>
                    <a-button type="link" size="small" @click="downloadAttachment(attachment)">
                      <DownloadOutlined />
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  DownloadOutlined,
  DownOutlined,
  SearchOutlined,
  FileOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  PaperClipOutlined
} from '@ant-design/icons-vue'
import {
  getProjectAchievementPage,
  getProjectAchievement,
  createProjectAchievement,
  updateProjectAchievement,
  deleteProjectAchievement,
  exportProjectAchievementExcel,
  getAvailableProjectsForAchievements,
  getTechnologicalProject,
  createProjectAchievementFile,
  updateProjectAchievementFile,
  deleteProjectAchievementFile,
  getProjectAchievementFilePage
} from '@/api/th_qd/achievements'
import { uploadTechnologicalFile } from '@/api/upload'
import FilePreview from '@/components/th_qd/FilePreview.vue'

/**
 * 响应式数据
 */
// 筛选条件
const filters = reactive({
  type: '',
  project: '',
  keyword: ''
})

// 可选项目列表
const availableProjects = ref([])
const projectsLoading = ref(false)

// 弹窗状态
const addDialogVisible = ref(false)
const attachmentsModalVisible = ref(false)
const detailModalVisible = ref(false)
const editingAchievement = ref(null)
const selectedAchievement = ref(null)

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})
const previewFileList = ref([])
const currentFileIndex = ref(0)

// 表单数据
const formData = reactive({
  title: '',
  type: '',
  projectId: '',
  completionDate: null,
  description: '',
  details: {},
  attachments: []
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入成果名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择成果类型', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  completionDate: [{ required: true, message: '请选择完成时间', trigger: 'change' }],
  description: [{ required: true, message: '请输入成果描述', trigger: 'blur' }]
}

// 表格列配置
const columns = [
  {
    title: '成果类型',
    dataIndex: 'type',
    key: 'type',
    width: 90,
    fixed: 'left'
  },
  {
    title: '成果名称',
    dataIndex: 'title',
    key: 'title',
    width: 150,
    ellipsis: true
  },
  {
    title: '所属项目',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 150,
    ellipsis: true
  },
  {
    title: '负责人',
    dataIndex: 'responsible',
    key: 'responsible',
    width: 100
  },
  {
    title: '完成时间',
    dataIndex: 'completionDate',
    key: 'completionDate',
    width: 120
  },
  {
    title: '成果详情',
    key: 'details',
    width: 150
  },
  {
    title: '附件',
    key: 'attachments',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 分页配置
const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
})

// 成果数据（改为由后端分页返回）
const achievements = ref([])

// 统计数据
const statistics = computed(() => {
  const stats = {
    total: achievements.value.length,
    paper: 0,
    ip: 0,
    application: 0,
    platform: 0,
    other: 0
  }
  
  achievements.value.forEach(achievement => {
    stats[achievement.type]++
  })
  
  return stats
})

// 筛选后的成果列表
const filteredAchievements = computed(() => {
  let result = achievements.value
  
  if (filters.type) {
    result = result.filter(item => item.type === filters.type)
  }
  
  if (filters.project) {
    result = result.filter(item => item.projectId === filters.project)
  }
  
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 后端分页：总数在拉取接口时设置

/**
 * 工具函数
 */
const getTypeIcon = (type) => {
  const icons = {
    paper: '📄',
    ip: '🔒',
    application: '🚀',
    platform: '🏗️',
    other: '📦'
  }
  return icons[type] || '📦'
}


/**
 * 事件处理函数
 */
const handleFilterChange = () => {
  // 筛选变化时重置分页
  paginationConfig.current = 1
  fetchPage()
}

const handleTableChange = (pagination) => {
  paginationConfig.current = pagination.current
  paginationConfig.pageSize = pagination.pageSize
  fetchPage()
}

const handleExport = async ({ key }) => {
  const typeNames = {
    all: '全部',
    paper: '论文',
    ip: '知识产权',
    application: '应用',
    platform: '平台建设',
    other: '其他'
  }
  const params = { pageNo: 1, pageSize: 100 }
  if (key !== 'all') {
    const typeToCode = { paper: 0, ip: 1, application: 2, platform: 3, other: 4 }
    // @ts-ignore
    params.achievementType = String(typeToCode[key])
  }
  await exportProjectAchievementExcel(params)
  message.success(`正在导出${typeNames[key]}成果...`)
}

const showAddDialog = () => {
  editingAchievement.value = null
  resetFormData()
  addDialogVisible.value = true
}

const viewDetail = async (achievement) => {
  try {
    console.log('=== 开始查看成果详情 ===')
    console.log('原始成果数据:', achievement)
    console.log('成果ID:', achievement.id)
    
    if (!achievement.id) {
      message.error('成果ID不存在，无法查看详情')
      return
    }
    
    // 先显示弹窗和加载状态
    selectedAchievement.value = { ...achievement, achievementName: null } // 清空名称触发加载状态
    detailModalVisible.value = true
    
    // 1. 调用 getProjectAchievement 获取完整的成果详情数据
    console.log('=== 调用 getProjectAchievement API ===')
    const achievementResp = await getProjectAchievement(achievement.id)
    console.log('成果详情API响应:', achievementResp)
    
    const fullAchievement = achievementResp?.data || achievementResp
    if (!fullAchievement || !fullAchievement.id) {
      message.error('获取成果详情失败')
      return
    }
    
    console.log('完整成果数据:', fullAchievement)
    
    // 2. 调用 getProjectAchievementFilePage 获取附件列表
    console.log('=== 调用 getProjectAchievementFilePage API ===')
    const fileResp = await getProjectAchievementFilePage({
      pageNo: '1',
      pageSize: '100',
      achievementId: achievement.id.toString()
    })
    console.log('附件列表API响应:', fileResp)
    
    const fileList = fileResp?.list || fileResp?.data?.list || []
    console.log('附件列表:', fileList)
    
    // 合并成果数据和附件数据
    const achievementWithFiles = {
      ...fullAchievement,
      projectAchievementFileDO: fileList
    }
    
    // 更新选中的成果数据
    selectedAchievement.value = achievementWithFiles
    
    console.log('成果详情加载完成:', achievementWithFiles)
  } catch (error) {
    console.error('获取成果详情失败:', error)
    message.error('获取成果详情失败，请重试')
  }
}

const editAchievement = async (achievement) => {
  try {
    console.log('=== 开始编辑成果 ===')
    console.log('原始成果数据:', achievement)
    console.log('成果ID:', achievement.id)
    
    if (!achievement.id) {
      message.error('成果ID不存在，无法编辑')
      return
    }
    
    // 1. 调用 getProjectAchievement 获取完整的成果详情数据
    console.log('=== 调用 getProjectAchievement API ===')
    const achievementResp = await getProjectAchievement(achievement.id)
    console.log('成果详情API响应:', achievementResp)
    
    const fullAchievement = achievementResp?.data || achievementResp
    if (!fullAchievement || !fullAchievement.id) {
      message.error('获取成果详情失败')
      return
    }
    
    console.log('完整成果数据:', fullAchievement)
    
    // 2. 调用 getProjectAchievementFilePage 获取附件列表
    console.log('=== 调用 getProjectAchievementFilePage API ===')
    const fileResp = await getProjectAchievementFilePage({
      pageNo: '1',
      pageSize: '100',
      achievementId: achievement.id.toString()
    })
    console.log('附件列表API响应:', fileResp)
    
    const fileList = fileResp?.list || fileResp?.data?.list || []
    console.log('附件列表:', fileList)
    
    // 合并成果数据和附件数据
    const achievementWithFiles = {
      ...fullAchievement,
      projectAchievementFileDO: fileList
    }
    
    editingAchievement.value = achievementWithFiles
    
    // 字段映射：后端字段 -> 前端字段
    const codeToType = { 0: 'paper', 1: 'ip', 2: 'application', 3: 'platform', 4: 'other' }
    const codeToStatus = { 0: '已授权', 1: '审查中', 2: '已申请' }
    const codeToIpType = { 0: '发明专利', 1: '实用新型', 2: '外观设计', 3: '软件著作权' }
    
  // 填充表单数据
  Object.assign(formData, {
      id: fullAchievement.id,
      title: fullAchievement.achievementName,
      type: codeToType[fullAchievement.achievementType],
      projectId: fullAchievement.projectId,
      description: fullAchievement.achievementDescription,
      completionDate: fullAchievement.completionTime ? dayjs(Number(fullAchievement.completionTime)) : null,
      // 处理详情数据
      details: {
        journal: fullAchievement.journalName,
        year: fullAchievement.yearPublication ? Number(fullAchievement.yearPublication) : undefined,
        impactFactor: fullAchievement.impactFactor ? Number(fullAchievement.impactFactor) : undefined,
        ipType: codeToIpType[fullAchievement.intellectualPropertyType],
        applicationNumber: fullAchievement.applicationNumber,
        status: codeToStatus[fullAchievement.authorizationStatus],
        field: fullAchievement.applicationField,
        scale: fullAchievement.applicationScale,
        economicBenefit: fullAchievement.economicBenefits,
        platformType: fullAchievement.platformType,
        serviceTarget: fullAchievement.serviceTarget,
        userScale: fullAchievement.userScale,
        category: fullAchievement.categoryAchievements,
        value: fullAchievement.appliedValue
      },
      // 处理附件数据
      attachments: fileList.map(file => ({
        id: file.id,
        name: file.fileName,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        url: file.fileUrl,
        fileSize: file.fileSize,
        size: file.fileSize,
        type: file.fileSuffix ? `application/${file.fileSuffix}` : 'application/octet-stream'
      }))
    })
    
    console.log('填充后的表单数据:', formData)
  addDialogVisible.value = true
  } catch (error) {
    console.error('获取成果详情失败:', error)
    message.error('获取成果详情失败，请重试')
  }
}

const deleteAchievement = async (achievement) => {
  try {
    // 弹出确认框
    await new Promise((resolve, reject) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除成果"${achievement.title}"吗？此操作不可恢复。`,
        okText: '确认删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          resolve()
        },
        onCancel() {
          reject(new Error('用户取消删除'))
        }
      })
    })
    
    // 用户确认后执行删除
    await deleteProjectAchievement(achievement.id)
    message.success(`删除成果: ${achievement.title}`)
    fetchPage()
  } catch (error) {
    if (error.message !== '用户取消删除') {
      console.error('删除成果失败:', error)
      message.error('删除成果失败，请重试')
    }
  }
}

const exportSingle = (achievement) => {
  message.success(`导出成果: ${achievement.title}`)
}

const showAttachments = (achievement) => {
  selectedAchievement.value = achievement
  attachmentsModalVisible.value = true
}

const downloadAttachment = (attachment) => {
  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.name
  link.click()
  message.success(`正在下载：${attachment.name}`)
}

// 预览单个文件
const previewSingleFile = (attachment) => {
  currentPreviewFile.value = {
    id: attachment.id,
    name: attachment.name,
    type: attachment.name.split('.').pop() || 'unknown',
    size: attachment.size,
    url: attachment.url
  }
  previewFileList.value = [currentPreviewFile.value]
  currentFileIndex.value = 0
  previewVisible.value = true
}

// 预览所有附件
const previewAttachments = (achievement) => {
  if (!achievement.attachments || achievement.attachments.length === 0) {
    message.warning('没有可预览的附件')
    return
  }
  
  previewFileList.value = achievement.attachments.map(attachment => ({
    id: attachment.id,
    name: attachment.name,
    type: attachment.name.split('.').pop() || 'unknown',
    size: attachment.size,
    url: attachment.url
  }))
  
  currentPreviewFile.value = previewFileList.value[0]
  currentFileIndex.value = 0
  previewVisible.value = true
}

// 下载文件（从预览组件调用）
const downloadFile = (fileInfo) => {
  const link = document.createElement('a')
  link.href = fileInfo.url
  link.download = fileInfo.name
  link.click()
  message.success(`正在下载：${fileInfo.name}`)
}

const handleTypeChange = () => {
  // 切换类型时重置详情数据
  formData.details = {}
}

const typeToCode = { paper: 0, ip: 1, application: 2, platform: 3, other: 4 }
const statusToCode = { '已授权': 0, '审查中': 1, '已申请': 2 }
const ipTypeToCode = { '发明专利': 0, '实用新型': 1, '外观设计': 2, '软件著作权': 3 }

const mapFormToSaveVO = (f) => {
  const saveVO = {
    id: f.id,
    projectId: f.projectId ? Number(f.projectId) : undefined,
    achievementName: f.title,
    achievementType: typeToCode[f.type],
    completionTime: f.completionDate ? dayjs(f.completionDate).valueOf() : undefined,
    achievementDescription: f.description
  }
  if (f.type === 'paper') {
    Object.assign(saveVO, {
      journalName: f.details?.journal,
      yearPublication: f.details?.year ? String(f.details?.year) : undefined,
      impactFactor: f.details?.impactFactor != null ? String(f.details?.impactFactor) : undefined
    })
  } else if (f.type === 'ip') {
    Object.assign(saveVO, {
      intellectualPropertyType: ipTypeToCode[f.details?.ipType],
      applicationNumber: f.details?.applicationNumber,
      authorizationStatus: statusToCode[f.details?.status]
    })
  } else if (f.type === 'application') {
    Object.assign(saveVO, {
      applicationField: f.details?.field,
      applicationScale: f.details?.scale,
      economicBenefits: f.details?.economicBenefit
    })
  } else if (f.type === 'platform') {
    Object.assign(saveVO, {
      platformType: f.details?.platformType,
      serviceTarget: f.details?.serviceTarget,
      userScale: f.details?.userScale
    })
  } else if (f.type === 'other') {
    Object.assign(saveVO, {
      categoryAchievements: f.details?.category,
      appliedValue: f.details?.value
    })
  }

  // 处理附件数据
  if (Array.isArray(f.attachments) && f.attachments.length > 0) {
    const files = f.attachments
      .map((it) => {
        const fileName = it.fileName || it.name
        const fileUrl = it.fileUrl || it.url
        const fileSize = it.fileSize || it.size
        const fileSuffix = it.fileSuffix || (fileName?.includes('.') ? fileName.split('.').pop() : '')
        if (!fileUrl) return null
        return { 
          fileName, 
          fileUrl, 
          fileSize, 
        }
      })
      .filter(Boolean)
    if (files.length) {
      saveVO.projectAchievementFileDO = files
    }
  }
  
  return saveVO
}

const codeToType = ['paper', 'ip', 'application', 'platform', 'other']
const codeToStatus = { 0: '已授权', 1: '审查中', 2: '已申请' }
const codeToIpType = { 0: '发明专利', 1: '实用新型', 2: '外观设计', 3: '软件著作权' }

const mapApiToPageItem = (row) => {
  const type = codeToType[row.achievementType] ?? 'other'
  const details = {}
  if (type === 'paper') {
    Object.assign(details, {
      journal: row.journalName,
      year: row.yearPublication ? Number(row.yearPublication) : undefined,
      impactFactor: row.impactFactor
    })
  } else if (type === 'ip') {
    Object.assign(details, {
      ipType: codeToIpType[row.intellectualPropertyType],
      applicationNumber: row.applicationNumber,
      status: codeToStatus[row.authorizationStatus]
    })
  } else if (type === 'application') {
    Object.assign(details, {
      field: row.applicationField,
      scale: row.applicationScale,
      economicBenefit: row.economicBenefits
    })
  } else if (type === 'platform') {
    Object.assign(details, {
      platformType: row.platformType,
      serviceTarget: row.serviceTarget,
      userScale: row.userScale
    })
  } else if (type === 'other') {
    Object.assign(details, {
      category: row.categoryAchievements,
      value: row.appliedValue
    })
  }

  const attachments = Array.isArray(row.projectAchievementFileDO)
    ? row.projectAchievementFileDO.map((f) => ({
        id: f.id,
        name: f.fileName,
        size: f.fileSize ? `${(f.fileSize / 1024 / 1024).toFixed(1)}MB` : '',
        url: f.fileUrl
      }))
    : []

  // 查找项目名称
  const project = availableProjects.value.find(p => p.id === row.projectId)
  const projectName = project ? project.projectName : ''

  return {
    id: row.id,
    title: row.achievementName,
    type,
    projectId: row.projectId?.toString(),
    projectName,
    responsible: '',
    completionDate: row.completionTime ? dayjs(row.completionTime).format('YYYY-MM-DD') : '',
    description: row.achievementDescription || '',
    details,
    attachments
  }
}

const fetchPage = async () => {
  try {
    const params = {
      pageNo: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      achievementName: filters.keyword || undefined,
      projectId: filters.project || undefined,
      achievementType: filters.type ? String(typeToCode[filters.type]) : undefined
    }
    console.log('成果分页查询参数:', params)
    const response = await getProjectAchievementPage(params)
    console.log('成果API响应:', response)
    
    // 检查不同的响应结构
    let achievementList = null
    if (response.data && response.data.list) {
      achievementList = response.data.list
      console.log('使用 response.data.list')
    } else if (response.list) {
      achievementList = response.list
      console.log('使用 response.list')
    }
    
    if (achievementList) {
      achievements.value = achievementList.map(mapApiToPageItem)
      paginationConfig.total = response.data?.total || response.total || 0
      
      // 获取项目详情来补全项目名称和负责人信息
      await enrichProjectInfo()
      console.log('成果数据映射完成，数量:', achievements.value.length)
    } else {
      achievements.value = []
      paginationConfig.total = 0
      console.log('没有找到成果数据')
    }
  } catch (error) {
    console.error('获取成果列表失败:', error)
    message.error('获取成果列表失败')
  }
}

// 补全项目信息（项目名称和负责人）
const enrichProjectInfo = async () => {
  try {
    // 获取所有唯一的projectId
    const uniqueProjectIds = [...new Set(achievements.value.map(item => item.projectId).filter(Boolean))]
    
    if (uniqueProjectIds.length === 0) return
    
    console.log('需要补全的项目ID:', uniqueProjectIds)
    
    // 批量获取项目详情
    const projectDetails = await Promise.all(
      uniqueProjectIds.map(async (projectId) => {
        try {
          // 先从已加载的项目列表中查找
          let project = availableProjects.value.find(p => p.id === Number(projectId))
          
          // 如果没找到，调用API获取项目详情
          if (!project) {
            console.log(`从API获取项目${projectId}详情`)
            const projectResponse = await getTechnologicalProject(Number(projectId))
            if (projectResponse) {
              project = {
                id: projectResponse.id,
                projectName: projectResponse.projectName,
                applicant: projectResponse.applicant,
                applicantUnit: projectResponse.applicantUnit
              }
            }
          }
          
          if (project) {
            return { 
              projectId, 
              projectName: project.projectName || '', 
              applicant: project.applicant || '' 
            }
          }
          return { projectId, projectName: '', applicant: '' }
        } catch (error) {
          console.error(`获取项目${projectId}详情失败:`, error)
          return { projectId, projectName: '', applicant: '' }
        }
      })
    )
    
    // 创建项目信息映射
    const projectMap = new Map()
    projectDetails.forEach(detail => {
      projectMap.set(detail.projectId, detail)
    })
    
    // 更新成果数据
    achievements.value = achievements.value.map(item => {
      const projectInfo = projectMap.get(item.projectId)
      if (projectInfo) {
        return {
          ...item,
          projectName: projectInfo.projectName,
          responsible: projectInfo.applicant
        }
      }
      return item
    })
    
    console.log('项目信息补全完成')
  } catch (error) {
    console.error('补全项目信息失败:', error)
  }
}

const handleSave = async () => {
  try {
    const payload = mapFormToSaveVO(formData)
    let achievementId
    
    if (editingAchievement.value?.id) {
      // 编辑模式
      payload.id = editingAchievement.value.id
      await updateProjectAchievement(payload)
      achievementId = editingAchievement.value.id
      message.success('更新成功!')
    } else {
      // 新增模式
      const result = await createProjectAchievement(payload)
      achievementId = result.data
      message.success('创建成功!')
    }
    
    // 注意：附件数据已经通过 mapFormToSaveVO 函数处理并包含在 payload.projectAchievementFileDO 中
    // 不需要单独调用 handleAttachmentsEdit 或 handleAttachmentsUpload，避免重复上传
    
  addDialogVisible.value = false
  resetFormData()
    fetchPage()
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败，请重试')
  }
}

// 处理附件上传 - 调用 createProjectAchievementFile API
const handleAttachmentsUpload = async (achievementId) => {
  try {
    const uploadPromises = formData.attachments.map(async (attachment, index) => {
      if (attachment.fileUrl) {
        const fileData = {
          achievementId: achievementId,
          fileName: attachment.fileName || attachment.name,
          fileUrl: attachment.fileUrl,
          fileSize: attachment.fileSize,
        }
        return await createProjectAchievementFile(fileData)
      }
    })
    
    await Promise.all(uploadPromises)
    console.log('附件文件记录创建完成')
  } catch (error) {
    console.error('创建附件文件记录失败:', error)
    message.error('创建附件文件记录失败')
  }
}

// 处理附件编辑 - 调用 updateProjectAchievementFile 和 deleteProjectAchievementFile API
const handleAttachmentsEdit = async (achievementId) => {
  try {
    console.log('=== 开始处理附件编辑 ===')
    console.log('成果ID:', achievementId)
    console.log('编辑中的成果:', editingAchievement.value)
    
    const originalAttachments = editingAchievement.value?.projectAchievementFileDO || []
    const currentAttachments = formData.attachments || []
    
    console.log('原始附件列表:', originalAttachments)
    console.log('当前附件列表:', currentAttachments)
    
    // 找出需要删除的附件（原有关件不在当前列表中）
    const toDelete = originalAttachments.filter(original => 
      !currentAttachments.some(current => {
        const currentUrl = current.fileUrl || current.url
        const originalUrl = original.fileUrl || original.url
        return currentUrl === originalUrl
      })
    )
    
    // 找出需要新增的附件（当前列表中的新附件）
    const toCreate = currentAttachments.filter(current => {
      const currentUrl = current.fileUrl || current.url
      return !originalAttachments.some(original => {
        const originalUrl = original.fileUrl || original.url
        return currentUrl === originalUrl
      })
    })
    
    // 找出需要更新的附件（文件名或大小有变化）
    const toUpdate = currentAttachments.filter(current => {
      const currentUrl = current.fileUrl || current.url
      const original = originalAttachments.find(orig => {
        const originalUrl = orig.fileUrl || orig.url
        return currentUrl === originalUrl
      })
      return original && (
        original.fileName !== (current.fileName || current.name) ||
        original.fileSize !== (current.fileSize || current.size)
      )
    })
    
    console.log('需要删除的附件:', toDelete)
    console.log('需要新增的附件:', toCreate)
    console.log('需要更新的附件:', toUpdate)
    
    // 执行删除操作
    for (const attachment of toDelete) {
      try {
        console.log('删除附件:', attachment)
        const deleteResult = await deleteProjectAchievementFile(attachment.id)
        console.log('删除结果:', deleteResult)
      } catch (error) {
        console.error('删除附件失败:', attachment, error)
        message.error(`删除附件 ${attachment.fileName} 失败`)
      }
    }
    
    // 执行新增操作
    for (const attachment of toCreate) {
      try {
        const fileUrl = attachment.fileUrl || attachment.url
        const fileName = attachment.fileName || attachment.name
        const fileSize = attachment.fileSize || attachment.size
        
        if (fileUrl) {
          const fileData = {
            achievementId: achievementId,
            fileName: fileName,
            fileUrl: fileUrl,
            fileSize: fileSize,
            sort: 0
          }
          console.log('创建附件:', fileData)
          const createResult = await createProjectAchievementFile(fileData)
          console.log('创建结果:', createResult)
        }
      } catch (error) {
        console.error('创建附件失败:', attachment, error)
        message.error(`创建附件 ${attachment.fileName || attachment.name} 失败`)
      }
    }
    
    // 执行更新操作
    for (const attachment of toUpdate) {
      try {
        const currentUrl = attachment.fileUrl || attachment.url
        const original = originalAttachments.find(orig => {
          const originalUrl = orig.fileUrl || orig.url
          return currentUrl === originalUrl
        })
        
        if (original) {
          const fileData = {
            id: original.id,
            achievementId: achievementId,
            fileName: attachment.fileName || attachment.name,
            fileUrl: attachment.fileUrl || attachment.url,
            fileSize: attachment.fileSize || attachment.size,
            sort: 0
          }
          console.log('更新附件:', fileData)
          const updateResult = await updateProjectAchievementFile(fileData)
          console.log('更新结果:', updateResult)
        }
      } catch (error) {
        console.error('更新附件失败:', attachment, error)
        message.error(`更新附件 ${attachment.fileName || attachment.name} 失败`)
      }
    }
    
    console.log(`附件编辑完成: 删除${toDelete.length}个, 新增${toCreate.length}个, 更新${toUpdate.length}个`)
    message.success('附件编辑完成')
  } catch (error) {
    console.error('编辑附件文件记录失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    message.error(`编辑附件文件记录失败: ${error.message}`)
  }
}

const handleCancel = () => {
  addDialogVisible.value = false
  resetFormData()
}

const resetFormData = () => {
  editingAchievement.value = null
  Object.assign(formData, {
    title: '',
    type: '',
    projectId: '',
    completionDate: null,
    description: '',
    details: {},
    attachments: []
  })
}

const beforeUpload = async (file) => {
  try {
    // 显示上传进度
    const loadingMessage = message.loading('文件上传中...', 0)
    
    // 调用上传API（参考@opening/模块的实现）
    const response = await uploadTechnologicalFile(file)
    
    if (response) {
      // 添加到附件列表（参考@opening/模块的数据结构）
      const newAttachment = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: response.fileUrl,
        fileUrl: response.fileUrl,
        fileName: response.fileName || file.name,
        fileSize: response.fileSize || file.size,
        uploadResponse: response
      }
      
      formData.attachments.push(newAttachment)
      loadingMessage()
      message.success('文件上传成功')
    } else {
      loadingMessage()
      message.error('文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    message.error('文件上传失败')
  }
  
  return false // 阻止自动上传
}

// 移除文件
const handleRemoveFile = (file) => {
  const index = formData.attachments.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    formData.attachments.splice(index, 1)
  }
}

// 预览文件（在编辑表单中）
const handleFilePreview = (file) => {
  currentPreviewFile.value = {
    id: file.id,
    name: file.name || file.fileName,
    type: (file.name || file.fileName)?.split('.').pop() || 'unknown',
    size: file.size || file.fileSize,
    url: file.url || file.fileUrl
  }
  previewFileList.value = [currentPreviewFile.value]
  currentFileIndex.value = 0
  previewVisible.value = true
}

// 下载文件（在编辑表单中）
const handleFileDownload = (file) => {
  const link = document.createElement('a')
  link.href = file.url || file.fileUrl
  link.download = file.name || file.fileName
  link.click()
  message.success(`正在下载：${file.name || file.fileName}`)
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return '未知大小'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + 'GB'
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    0: 'blue',    // 论文
    1: 'green',   // 知识产权
    2: 'orange',  // 应用
    3: 'purple',  // 平台建设
    4: 'default'  // 其他
  }
  return colorMap[type] || 'default'
}

// 获取类型文本
const getTypeText = (type) => {
  // 数字类型映射（用于从后端获取的数据）
  const numTextMap = {
    0: '论文',
    1: '知识产权',
    2: '应用',
    3: '平台建设',
    4: '其他'
  }
  
  // 字符串类型映射（用于前端展示的数据）
  const strTextMap = {
    'paper': '论文',
    'ip': '知识产权',
    'application': '应用',
    'platform': '平台建设',
    'other': '其他'
  }
  
  // 先尝试数字类型映射，再尝试字符串类型映射
  return numTextMap[type] || strTextMap[type] || '未知'
}

// 获取知识产权类型文本
const getIpTypeText = (type) => {
  const textMap = {
    0: '发明专利',
    1: '实用新型',
    2: '外观设计',
    3: '软件著作权'
  }
  return textMap[type] || '未知'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    0: 'green',   // 已授权
    1: 'orange',  // 审查中
    2: 'blue'     // 已申请
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    0: '已授权',
    1: '审查中',
    2: '已申请'
  }
  return textMap[status] || '未知'
}

// 检查是否有详细信息
const hasDetailInfo = (achievement) => {
  if (!achievement) return false
  
  const type = achievement.achievementType
  if (type === 0) { // 论文
    return achievement.journalName || achievement.yearPublication || achievement.impactFactor
  } else if (type === 1) { // 知识产权
    return achievement.intellectualPropertyType !== undefined || achievement.applicationNumber || achievement.authorizationStatus !== undefined
  } else if (type === 2) { // 应用
    return achievement.applicationField || achievement.applicationScale || achievement.economicBenefits
  } else if (type === 3) { // 平台建设
    return achievement.platformType || achievement.serviceTarget || achievement.userScale
  } else if (type === 4) { // 其他
    return achievement.categoryAchievements || achievement.appliedValue
  }
  
  return false
}

// 预览附件
const previewAttachment = (attachment) => {
  currentPreviewFile.value = {
    id: attachment.id,
    name: attachment.fileName,
    type: attachment.fileName?.split('.').pop() || 'unknown',
    size: attachment.fileSize,
    url: attachment.fileUrl
  }
  previewFileList.value = [currentPreviewFile.value]
  currentFileIndex.value = 0
  previewVisible.value = true
}

// 项目搜索
const handleProjectSearch = (value) => {
  loadAvailableProjects(value)
}

// 获取可选项目列表
const loadAvailableProjects = async (keyword = '') => {
  try {
    projectsLoading.value = true
    const projects = await getAvailableProjectsForAchievements(keyword)
    availableProjects.value = projects
  } catch (error) {
    console.error('获取项目列表失败:', error)
    message.error('获取项目列表失败')
  } finally {
    projectsLoading.value = false
  }
}

onMounted(() => {
  fetchPage()
  loadAvailableProjects()
})
</script>

<style scoped>
.achievements-management {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.page-desc {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 28px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stat-card.total .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.paper .stat-icon { background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); }
.stat-card.ip .stat-icon { background: linear-gradient(135deg, #722ed1 0%, #531dab 100%); }
.stat-card.application .stat-icon { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); }
.stat-card.platform .stat-icon { background: linear-gradient(135deg, #fa8c16 0%, #d46b08 100%); }
.stat-card.other .stat-icon { background: linear-gradient(135deg, #8c8c8c 0%, #595959 100%); }

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.total-count {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.count-number {
  font-size: 18px;
  font-weight: bold;
  color: #234fa2;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.title-cell {
  max-width: 280px;
}

.title-text {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.description-text {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.details-cell {
  font-size: 12px;
  line-height: 1.5;
}

.details-cell > div {
  margin-bottom: 2px;
}

.attachments-cell {
  text-align: center;
}

.no-attachments {
  color: #ccc;
  font-size: 12px;
}

.attachments-list {
  max-height: 400px;
  overflow-y: auto;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 8px;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.attachment-size {
  font-size: 12px;
  color: #999;
}

/* 成果详情弹窗样式 - 基于 index.html 的加载动画 */
.achievement-detail-modal :deep(.ant-modal-body) {
  padding: 0;
  max-height: 80vh;
  overflow: hidden;
}

.achievement-detail-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.detail-loading {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #f0f2f5;
}

.detail-loading-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  -webkit-transform: translate3d(-50%, -50%, 0);
  transform: translate3d(-50%, -50%, 0);
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.detail-loading-title {
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.detail-loading-logo {
  width: 100px;
  margin: 0 auto 15px auto;
}

.detail-loading-text {
  font-size: 16px;
  color: #666;
}

.detail-loading-item {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 60px;
  vertical-align: middle;
  border-radius: 50%;
}

.detail-loading-outter {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid #2d8cf0;
  border-bottom: 0;
  border-left-color: transparent;
  border-radius: 50%;
  animation: loader-outter 1s cubic-bezier(0.42, 0.61, 0.58, 0.41) infinite;
}

.detail-loading-inner {
  position: absolute;
  top: calc(50% - 20px);
  left: calc(50% - 20px);
  width: 40px;
  height: 40px;
  border: 4px solid #87bdff;
  border-right: 0;
  border-top-color: transparent;
  border-radius: 50%;
  animation: loader-inner 1s cubic-bezier(0.42, 0.61, 0.58, 0.41) infinite;
}

@-webkit-keyframes loader-outter {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes loader-outter {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-webkit-keyframes loader-inner {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(-360deg);
    transform: rotate(-360deg);
  }
}

@keyframes loader-inner {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(-360deg);
    transform: rotate(-360deg);
  }
}

/* 成果详情内容样式 */
.achievement-detail-content {
  padding: 24px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  padding: 16px 0;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  min-width: 100px;
  font-weight: 500;
  color: #666;
  margin-right: 8px;
}

.detail-item span {
  flex: 1;
  color: #262626;
}

.detail-description {
  line-height: 1.6;
  color: #262626;
  white-space: pre-wrap;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.attachment-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.3s;
}

.attachment-card:hover {
  border-color: #1890ff;
  background: #f0f9ff;
}

.attachment-icon {
  margin-right: 12px;
  font-size: 24px;
  color: #1890ff;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  font-size: 12px;
  color: #999;
}

.attachment-actions {
  display: flex;
  gap: 4px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  white-space: nowrap;
}

.action-buttons .ant-btn-link {
  padding: 0 4px;
  height: auto;
  line-height: 1.2;
}

.delete-btn {
  color: #ff4d4f;
}
</style> 