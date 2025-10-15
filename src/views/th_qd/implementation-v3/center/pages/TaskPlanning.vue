<template>
  <div class="task-planning-page">
    <!-- 项目选择区 -->
    <div class="project-selector-section">
      <a-card :bordered="false" class="selector-card">
        <div class="selector-content">
          <div class="project-select">
            <label>当前项目：</label>
            <a-select 
              v-model:value="currentProjectId" 
              placeholder="请选择项目"
              style="width: 400px"
              :loading="projectsLoading"
              show-search
              :filter-option="false"
              @search="handleProjectSearch"
              @change="handleProjectSelect"
              @dropdown-visible-change="onProjectDropdownChange"
            >
              <a-select-option 
                v-for="project in availableProjects" 
                :key="project.id" 
                :value="project.id"
              >
                <div class="project-option">
                  <span class="project-name">{{ project.projectName }}</span>
                  <!-- <span class="project-id">ID: {{ project.id }}</span> -->
                </div>
              </a-select-option>
            </a-select>
          </div>
          
          <div v-if="selectedProject" class="project-info">
            <!-- <span class="project-id">项目ID: {{ selectedProject.id }}</span> -->
            <span class="project-leader">负责人: {{ displayProjectLeader }}</span>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 统计概览 -->
    <div class="overview-section">
      <div class="stats-cards">
        <div class="stat-card"><div class="stat-label">总任务数</div><div class="stat-value">{{ totalTasks }}</div></div>
        <div class="stat-card"><div class="stat-label">未分配</div><div class="stat-value" :style="{color: unassignedCount>0 ? '#d4380d' : '#52c41a'}">{{ unassignedCount }}</div></div>
        <div class="stat-card"><div class="stat-label">已分配</div><div class="stat-value">{{ assignedCount }}</div></div>
        <div class="stat-card"><div class="stat-label">未计划时间</div><div class="stat-value" :style="{color: unsetTimeCount>0 ? '#fa8c16' : '#52c41a'}">{{ unsetTimeCount }}</div></div>
        <div class="stat-card"><div class="stat-label">已设置时间</div><div class="stat-value" :style="{color: setTimeCount>0 ? '#52c41a' : '#8c8c8c'}">{{ setTimeCount }}</div></div>
        <div class="stat-card"><div class="stat-label">未设置里程碑</div><div class="stat-value" :style="{color: unsetMilestoneCount>0 ? '#fa541f' : '#52c41a'}">{{ unsetMilestoneCount }}</div></div>
        <div class="stat-card"><div class="stat-label">已设置里程碑</div><div class="stat-value" :style="{color: setMilestoneCount>0 ? '#722ed1' : '#8c8c8c'}">{{ setMilestoneCount }}</div></div>
      </div>
    </div>

    <!-- 顶部空态说明：仅在非加载、任务为空且未读取解析时显示 -->
    <a-alert
      v-if="showEmptyBanner && !isLoadingTasks && !isFetchingAnalysis"
      type="info"
      show-icon
      style="margin: 12px"
      message="当前项目暂无任务。可从后端解析结果导入（仅新增），或手动新建任务。"
    />

    <div class="main">
      <div class="col left">
        <div class="hd">
          <div class="h">任务面板</div>
          <div class="toolbar">
            <a-select
              v-model:value="activeFilter"
              style="width: 160px"
              :options="[
                { label: '全部', value: 'all' },
                { label: '未分配', value: 'unassigned' },
                { label: '已分配', value: 'assigned' },
                { label: '未计划时间', value: 'no_time' },
                { label: '已设置时间', value: 'has_time' },
                { label: '未设置里程碑', value: 'no_milestone' },
                { label: '已设置里程碑', value: 'has_milestone' }
              ]"
            />
            <a-input-search v-model:value="taskKeywordRaw" allow-clear placeholder="搜索任务" style="width:280px" />
            <a-button type="dashed" @click="openAddTask">新增任务</a-button>
            <!-- 从后端解析结果读取（仅追加） -->
            <a-tooltip placement="top" title="只追加新任务，不覆盖或删除现有任务">
              <a-button @click="importFromBackendAnalysis">从后端解析结果读取（仅追加）</a-button>
            </a-tooltip>
            <a-button @click="openMilestoneMgr">里程碑管理</a-button>

          </div>
        </div>
        <!-- 扁平化任务列表 -->
        <div class="flat-task-list">
          <a-empty v-if="filteredTasks.length === 0" description="当前项目暂无任务" />
          <div v-else class="task-items">
            <div 
              v-for="task in paginatedTasks" 
              :key="task.id" 
              class="task-item" 
              :class="{ 'task-item--assigned': !!assigneeName(task.id) }"
              :data-task-id="task.id" 
              draggable="true" 
              @dragstart="onDragStart(task)" 
              @dragend="onDragEnd"
            >
              <div class="task-content">
                <div class="task-header">
                  <div class="task-name">
                    {{ task.name }}
                    <a-tag v-if="task.isNew" color="green" size="small">新增</a-tag>
                    <a-tag v-if="assigneeName(task.id)" color="blue" size="small">已分配</a-tag>
                    <a-tag v-if="isTaskWithoutMilestone(task)" color="orange" size="small">未设置里程碑</a-tag>
                    <template v-if="getMilestoneDisplayEnhanced(task)">
                      <a-tag 
                        v-for="milestone in getMilestoneDisplayEnhanced(task)" 
                        :key="milestone.id" 
                        :color="'purple'" 
                        size="small"
                      >
                        {{ milestone.name }}
                        
                        <span v-if="milestone.date" class="milestone-date">({{ milestone.date }})</span>
                        <!-- <span v-if="milestone.isPrimary" class="milestone-primary-tag">主</span> -->
                      </a-tag>
                    </template>
                  </div>
                  <div class="task-actions">
                    <a-button size="small" type="link" :draggable="false" @mousedown.stop @click.stop="pickAssignee(task)">分配</a-button>
                    <a-button size="small" type="link" :draggable="false" @mousedown.stop @click.stop="openEdit(task)">设置</a-button>
                    <a-button size="small" type="link" danger :draggable="false" @mousedown.stop @click.stop="confirmDelete(task)">删除</a-button>
                    <a-tooltip title="取消分配">
                      <a-button size="small" type="link" danger :draggable="false" @mousedown.stop @click.stop="unassignTask(task.id)">取消</a-button>
                    </a-tooltip>
                  </div>
                </div>
                <div class="task-meta">
                  <span class="task-priority" v-if="task.priority">
                    优先级：{{ task.priority }}
                  </span>
                  
                  <!-- 时间信息显示区域 -->
                  <div class="task-times" v-if="getTaskTimeDisplay(task).length > 0">
                    <span 
                      v-for="(timeItem, index) in getTaskTimeDisplay(task)" 
                      :key="index"
                      class="task-time" 
                      :class="{ 
                        overdue: timeItem.isOverdue,
                        'time-range': timeItem.type === 'range',
                        'time-start': timeItem.type === 'start',
                        'time-end': timeItem.type === 'end',
                        'time-due': timeItem.type === 'due'
                      }"
                    >
                      {{ timeItem.text }}
                    </span>
                  </div>
                  
                  <!-- 里程碑信息显示
                  <div class="task-milestones" v-if="getMilestoneDisplayEnhanced(task)">
                    <div v-for="milestone in getMilestoneDisplayEnhanced(task)" :key="milestone.id" class="task-milestone-item">
                      <span class="milestone-indicator">🎯</span>
                      <span class="milestone-name">{{ milestone.name }}</span>
                      <span v-if="milestone.date" class="milestone-date">({{ milestone.date }})</span>
                      <span v-if="milestone.isPrimary" class="milestone-primary-tag">主</span>
                    </div>
                  </div> -->
                  
                  <span class="task-assignee" :class="assigneeName(task.id) ? 'assigned' : 'unassigned'">
                    {{ assigneeName(task.id) ? ('负责人：' + assigneeName(task.id)) : '未分配' }}
                  </span>
                  <span class="task-origin" v-if="task.origin">
                    来源：{{ originText(task.origin) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 分页组件 -->
            <div class="task-pagination" v-if="filteredTasks.length > 0">
              <a-pagination
                :current="taskPagination.current"
                :pageSize="taskPagination.pageSize"
                :total="taskPagination.total"
                :pageSizeOptions="['10', '20', '50', '100']"
                show-size-changer
                show-quick-jumper
                @change="handleTaskPageChange"
                @show-size-change="handleTaskSizeChange"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="col right">
        <div class="hd">
          <div class="h">人员面板</div>
          <div class="search"><a-input v-model:value="memberKeyword" placeholder="搜索成员/角色" style="width:180px" /></div>
        </div>
        <div class="list">
          <a-empty v-if="filteredMembers.length===0" description="暂无成员" />
          <div
            v-for="m in filteredMembers"
            :key="m.id"
            class="member"
            @dragover.prevent
            @dragenter.prevent="enterDrop(m.id)"
            @dragleave.prevent="leaveDrop(m.id)"
            @drop.prevent="onDropToMember(m.id)"
            :class="{ 'member--highlight': dropHighlight === m.id }"
          >
            <div class="row">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="avatar">{{ m.name?.[0] || '?' }}</span>
                <b>{{ m.name }}</b>
                <span class="pill" style="margin-left:6px">{{ m.role }}</span>
              </div>
              <div class="cap">{{ memberLoadText(m.id) }}</div>
            </div>
            <!-- 任务列表（可折叠） -->
            <div v-if="getAssignedCount(m.id) > 0" class="tasks-panel">
              <a-button size="small" type="link" @click.stop="toggleMemberExpand(m.id)">
                {{ isMemberExpanded(m.id) ? '收起任务' : '展开任务' }}（{{ getAssignedCount(m.id) }}）
              </a-button>
              <div v-show="isMemberExpanded(m.id)" class="tasks-list">
                <div 
                  v-for="a in memberTasks(m.id)" 
                  :key="a.taskId"
                  class="task-chip"
                >
                  <span class="task-name">{{ getTaskNameById(a.taskId) }}</span>
                  <a-button size="small" type="link" danger @click.stop="cancelMemberAssignment(m.id, a.taskId)">取消</a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

          <div class="footer">
        <div class="btns">
          <a-button type="primary" @click="goToNextStep">下一步</a-button>
        </div>
      </div>

    <a-modal v-model:open="assigneePickerVisible" title="选择负责人" :footer="null" width="520px">
      <a-input v-model:value="pickerKeyword" placeholder="搜索成员" style="margin-bottom:8px" />
      <a-list :data-source="pickerMembers">
        <template #renderItem="{ item }">
          <a-list-item style="cursor: pointer" @click="onPick(item)">
            <a-list-item-meta :title="item.name" :description="item.role" />
          </a-list-item>
        </template>
      </a-list>
    </a-modal>

    <!-- 变更提案弹窗：导入解析结果后展示差异并让用户确认 -->
    <a-modal
      v-model:open="proposal.visible"
      :title="proposal.autoMode ? `检测到 ${proposal.diff.additions.length} 条解析任务` : '变更提案（安全合并）'"
      :confirm-loading="proposal.loading"
      @ok="applyProposal"
      @cancel="closeProposal"
      width="760px"
    >
      <a-alert
        type="info" show-icon style="margin-bottom:12px"
        message="说明"
      >
        <template #description>
          <div>
            默认仅新增，不覆盖您已编辑的字段，不会归档或删除。
          </div>
        </template>
      </a-alert>
      <div class="proposal-summary" style="position: sticky; top: 0; z-index: 1; background: #fff; padding-bottom: 8px;">
        <div class="stat"><b>新增</b> {{ proposal.diff.additions.length }}</div>
        <div class="stat" v-if="proposal.diff.updates.length>0"><b>更新</b> {{ proposal.diff.updates.length }}</div>
        <div class="stat" v-if="proposal.diff.removals.length>0"><b>消失</b> {{ proposal.diff.removals.length }}</div>
      </div>
      <div class="proposal-options" v-if="!proposal.autoMode">
        <a-checkbox v-model:checked="proposal.options.applyAdditions">应用新增</a-checkbox>
      </div>
      <div class="proposal-body" style="max-height:60vh; overflow:auto;">
      <a-tabs style="margin-top:8px">
        <a-tab-pane :key="'add'" :tab="`新增(${proposal.diff.additions.length})`">
          <a-list :data-source="pagedAdditions" :locale="{emptyText: '无新增'}">
             <template #renderItem="{ item }">
               <a-list-item>
                 <a-list-item-meta :title="item.name" :description="item.phaseId ? '阶段：'+item.phaseId : ''" />
               </a-list-item>
             </template>
           </a-list>
          <div style="display:flex; justify-content:flex-end; margin-top:8px;">
            <a-pagination
              v-model:current="proposal.page"
              v-model:pageSize="proposal.pageSize"
              :total="proposal.diff.additions.length"
              :pageSizeOptions="[10,20,50]"
              show-size-changer
            />
          </div>
        </a-tab-pane>
        <a-tab-pane :key="'upd'" :tab="`更新(${proposal.diff.updates.length})`">
          <a-list :data-source="proposal.diff.updates.slice(0,8)" :locale="{emptyText: '无更新'}">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.after?.name || item.before?.name" :description="item.after?.phaseId || item.before?.phaseId" />
              </a-list-item>
            </template>
          </a-list>
          <div v-if="proposal.diff.updates.length>8" class="more-hint">仅 展示前 8 条</div>
        </a-tab-pane>
        <a-tab-pane :key="'del'" :tab="`消失(${proposal.diff.removals.length})`">
          <a-list :data-source="proposal.diff.removals.slice(0,8)" :locale="{emptyText: '无消失'}">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.name" :description="item.phaseId" />
              </a-list-item>
            </template>
          </a-list>
          <div v-if="proposal.diff.removals.length>8" class="more-hint">仅展示前 8 条</div>
        </a-tab-pane>
      </a-tabs>
      </div>
       <template #footer>
         <a-button @click="closeProposal">取消</a-button>
         <a-button type="primary" :loading="proposal.loading" @click="onClickPrimary">
           {{ proposal.autoMode ? `一键落库（${proposal.diff.additions.length}）` : `应用新增（${proposal.options.applyAdditions ? proposal.diff.additions.length : 0}）` }}
         </a-button>
       </template>
     </a-modal>
  </div>
  <!-- 编辑抽屉（放在根模板同级，避免嵌套模态冲突） -->
  <a-modal v-model:open="edit.visible" :title="edit.target ? '编辑任务' : '新增任务'" width="820px">
    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :span="14">
          <a-form-item label="任务名称">
            <a-input v-model:value="edit.form.name" placeholder="请输入任务名称" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="优先级">
            <a-select
              v-model:value="edit.form.priority"
              placeholder="选择优先级"
              style="width:100%"
            >
              <a-select-option value="高">高</a-select-option>
              <a-select-option value="中">中</a-select-option>
              <a-select-option value="低">低</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="任务详情">
        <div class="rte-toolbar">
          <a-space size="small">
            <a-button size="small" @click="rteCmd('bold')">加粗</a-button>
            <a-button size="small" @click="rteCmd('italic')">斜体</a-button>
            <a-button size="small" @click="rteCmd('underline')">下划线</a-button>
            <a-button size="small" @click="rteCmd('insertUnorderedList')">• 列表</a-button>
            <a-button size="small" @click="rteCmd('insertOrderedList')">1. 列表</a-button>
            <a-button size="small" @click="rteClear">清除格式</a-button>
          </a-space>
        </div>
        <div ref="rteRef" class="rte-editor" contenteditable="true" :placeholder="'请输入任务详情，支持基本富文本样式'" @input="syncRte" ></div>
      </a-form-item>
      <a-form-item label="已设置里程碑">
        <!-- 主里程碑设置 -->
        <!-- <div style="margin-bottom: 12px;">
          <div style="margin-bottom: 6px; font-size: 14px;">设置主里程碑</div>
          <a-select 
            ref="msSelectRef" 
            v-model:value="edit.form.primaryMilestoneId" 
            allow-clear 
            placeholder="请选择主里程碑"
            style="width: 100%"
          >
            <a-select-option v-for="ms in planning.milestones" :key="ms.id" :value="ms.id">
              {{ ms.name }}
              <span v-if="ms.plannedDate" style="color: #8c8c8c; margin-left: 8px;">({{ ms.plannedDate }})</span>
            </a-select-option>
          </a-select>
        </div> -->
        
        <!-- 关联里程碑展示 -->
        <div v-if="edit.target && getMilestoneDisplayEnhanced(edit.target)" style="margin-bottom: 12px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background-color: #f9f9f9; border-radius: 4px;">
            <div 
              v-for="milestone in getMilestoneDisplayEnhanced(edit.target)" 
              :key="milestone.id" 
              style="display: flex; align-items: center; background: white; border: 1px solid #d9d9d9; border-radius: 4px; padding: 4px 8px;"
            >
              <a-tag style="color: blueviolet;">{{ milestone.name }}</a-tag>
              <a-tag v-if="milestone.date" size="small" color="blue" style="margin-left: 6px;">{{ milestone.date }}</a-tag>
              <!-- <a-tag v-if="milestone.isPrimary" size="small" color="purple" style="margin-left: 6px;">主</a-tag> -->
              <a-button 
                type="link" 
                size="small" 
                danger 
                style="margin-left: 6px; padding: 0 4px;" 
                @click.stop="confirmRemoveMs(milestone.id)"
              >
                删除
              </a-button>
            </div>
          </div>
        </div>
        
        <!-- 无关联里程碑提示 -->
        <div v-if="edit.target && !getMilestoneDisplayEnhanced(edit.target)" style="padding: 8px; color: #8c8c8c; text-align: center; background-color: #f9f9f9; border-radius: 4px;">
          暂无关联里程碑
        </div>
        

        <!-- <div v-if="edit.target && getMilestoneDisplayEnhanced(edit.target)" style="margin-bottom: 12px;">
          <div style="margin-bottom: 6px; font-weight: 500;">关联里程碑</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <a-tag 
              v-for="milestone in getMilestoneDisplayEnhanced(edit.target)" 
              :key="milestone.id" 
              :color="milestone.isPrimary ? '#722ed1' : '#2f54eb'"
            >
              {{ milestone.name }}
              <span v-if="milestone.date" style="margin-left: 4px;">({{ milestone.date }})</span>
              <span v-if="milestone.isPrimary" style="margin-left: 4px; font-weight: bold;">[主]</span>
            </a-tag>
          </div>
        </div> -->
        
        <!-- 新增里程碑 -->
        <div class="form-hint" style="color:#8c8c8c;font-size:12px;margin-top:6px">点击"新增"即可添加。</div>
        <div style="margin-top:6px">
          <a-input-group compact>
            <a-input v-model:value="newMs.name" placeholder="新里程碑名称" style="width: 60%" />
            <a-date-picker v-model:value="newMs.date" value-format="YYYY-MM-DD" placeholder="计划时间" style="width: 30%" />
            <a-button type="dashed" style="width:10%" @click="createMs">新增</a-button>
          </a-input-group>
        </div>
      </a-form-item>
      
      <a-form-item label="任务附件">
        <a-upload
          :before-upload="beforeAttachUpload"
          :on-remove="onAttachRemove"
          :file-list="edit.attachFiles"
          :multiple="true"
          list-type="text"
        >
          <a-button type="dashed">选择文件</a-button>
        </a-upload>
        <!-- <div class="form-hint" style="color:#8c8c8c;margin-top:6px">不自动上传，保存后保存在本地草稿（名称、大小、预览URL）。</div> -->
      </a-form-item>
      <a-form-item label="起止时间">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <a-date-picker v-model:value="edit.form.startDate" value-format="YYYY-MM-DD" placeholder="开始日期" />
          <span>→</span>
          <a-date-picker v-model:value="edit.form.endDate" value-format="YYYY-MM-DD" placeholder="结束日期" />
          <!-- <a-date-picker v-model:value="edit.form.dueDate" value-format="YYYY-MM-DD" placeholder="或 截止日期" /> -->
        </div>
      </a-form-item>
      <!-- <a-form-item label="优先级">
        <a-select v-model:value="edit.form.priority" allow-clear>
          <a-select-option value="高">高</a-select-option>
          <a-select-option value="中">中</a-select-option>
          <a-select-option value="低">低</a-select-option>
        </a-select>
      </a-form-item> -->
      <a-collapse style="margin-top:4px">
        <a-collapse-panel key="rtpl" header="提报模板设置">
          <a-form-item label="快速选择模板">
            <a-select v-model:value="edit.reportTemplateId" style="width:100%" placeholder="选择模板（默认自动带出）" @change="onPickTpl">
              <a-select-option v-for="tpl in planning.listReportTemplates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</a-select-option>
            </a-select>
            <div class="form-hint" style="color:#8c8c8c;margin-top:6px">默认模板：{{ planning.getDefaultReportTemplate()?.name || '未设置' }}</div>
          </a-form-item>
          <div style="margin-bottom:8px">
            <a-button type="link" @click="goReportTemplateMaintenance">去日常维护 - 提报模板</a-button>
            <a-button type="link" @click="openTplMgr">管理模板（本地）</a-button>
          </div>
          <a-form-item label="模板标题">
            <a-input v-model:value="edit.reportTemplate.title" placeholder="例如：阶段汇报模板" />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="edit.reportTemplate.requireAttachment">提交时必须上传附件</a-checkbox>
          </a-form-item>
          <div style="margin-bottom:6px;font-weight:600">模板分段（标题/是否必填）</div>
          <a-list :data-source="edit.reportTemplate.sections" :locale="{emptyText:'暂无分段'}">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <div style="display:flex;gap:8px;width:100%">
                  <a-input v-model:value="item.title" placeholder="分段标题（如：工作内容、问题与建议）" />
                  <a-checkbox v-model:checked="item.required">必填</a-checkbox>
                  <a-button danger @click="removeTplSection(index)" size="small">删除</a-button>
                </div>
              </a-list-item>
            </template>
          </a-list>
          <a-button type="dashed" size="small" @click="addTplSection">新增分段</a-button>
          <div class="form-hint" style="color:#8c8c8c;margin-top:6px">被分配人将在工作台看到此模板，并按分段填写。</div>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
    <template #footer>
      <a-button @click="edit.visible=false">取消</a-button>
      <a-button type="primary" @click="saveEdit">保存</a-button>
    </template>
  </a-modal>

  <!-- 里程碑管理（界面骨架） -->
  <a-modal v-model:open="msMgr.visible" title="里程碑管理" width="720px">
    <div class="ms-row">
      <!-- <div class="ms-quick">
        <a-input v-model:value="msMgr.newName" placeholder="新里程碑名称" style="width:200px" />
        <a-date-picker v-model:value="msMgr.newDate" value-format="YYYY-MM-DD" placeholder="计划日期" style="width:140px" />
        <a-button type="primary" @click="msQuickAdd">新建</a-button>
      </div> -->
      <a-input-search v-model:value="msMgr.keyword" allow-clear placeholder="搜索里程碑（名称/日期）" style="width:260px" />
    </div>
    <a-table :data-source="msTableData" :columns="msColumns" :loading="msMgr.loading" :pagination="false" row-key="id" size="small">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span style="font-weight:600;">{{ record.name }}</span>
        </template>
        <template v-else-if="column.key === 'date'">
          <a-tag v-if="record.date">{{ record.date }}</a-tag>
          <a-tag v-else>无</a-tag>
        </template>
        <template v-else-if="column.key === 'taskCount'">
          <span>{{ record.taskCount }}</span>
        </template>
        <template v-else-if="column.key === 'taskNames'">
          <span>{{ record.taskNames || '无' }}</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-button size="small" type="link" @click="msEdit(record)">编辑</a-button>
          <a-button size="small" type="link" danger @click="msRemove(record)">删除</a-button>
        </template>
      </template>
    </a-table>
    <template #footer>
      <a-button @click="msMgr.visible=false">关闭</a-button>
    </template>
  </a-modal>

  <!-- 里程碑编辑弹窗 -->
  <a-modal
    v-model:open="msEditModal.visible"
    title="编辑里程碑"
    :confirm-loading="false"
    @ok="confirmMsEdit"
    @cancel="() => msEditModal.visible = false"
  >
    <a-form layout="vertical">
      <a-form-item label="里程碑名称" required>
        <a-input v-model:value="msEditModal.name" placeholder="请输入里程碑名称" />
      </a-form-item>
      <a-form-item label="计划日期">
        <a-date-picker 
          v-model:value="msEditModal.date" 
          value-format="YYYY-MM-DD" 
          placeholder="选择计划日期"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 模板管理（纯前端） -->
  <a-modal v-model:open="tplMgr.visible" title="提报模板管理（本地）" width="720px">
    <div style="margin-bottom:10px">
      <a-button type="dashed" @click="addNewTpl">新增模板</a-button>
    </div>
    <a-list :data-source="planning.listReportTemplates" :locale="{emptyText:'暂无模板'}">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :title="item.name" :description="item.id" />
          <template #actions>
            <a-button size="small" type="link" @click="setAsDefault(item.id)" :disabled="planning.defaultReportTemplateId===item.id">设为默认</a-button>
            <a-button size="small" type="link" @click="editTpl(item)">编辑</a-button>
            <a-button size="small" type="link" danger @click="removeTpl(item.id)">删除</a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>
    <template #footer>
      <a-button @click="tplMgr.visible=false">关闭</a-button>
    </template>
  </a-modal>


</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlanningStore } from '@/store/planning'
import { useTeamMembersStore } from '@/stores/teamMembers'
import { useUserStoreWithOut } from '@/store/modules/user'
import { fetchProjects, fetchProjectInfo } from '@/api/th_qd/implementation-v3/projects'
import { loadAnalysisFromBackend } from '@/api/th_qd/implementation-v3/proposal-analysis-backend'
import { 
  createTask, 
  updateTask, 
  getTaskPage, 
  getTask, 
  deleteTask,
  unassign,
  transformTaskToBackend,
  transformTaskFromBackend
} from '@/api/th_qd/implementation-v3/task-management'
import {
  createReportTemplate,
  updateReportTemplate
} from '@/api/th_qd/maintenance/report-template'
import {
  getReportTemplateList,
  convertToFrontendConfig,
  TemplateStatus as RTplStatus
} from '@/api/th_qd/maintenance/report-template'
import { 
  createTaskAssignment, 
  batchAssignTasks, 
  sendAssignmentNotification,
  transformAssignmentToBackend,
  getTaskAssignmentsByTask,
  deleteTaskAssignment,
  updateTaskAssignment
} from '@/api/th_qd/implementation-v3/task-assignment'
import { 
  getTaskStatistics, 
  getProjectProgress,
  getMilestonePage,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  transformMilestoneToBackend,
  transformMilestoneFromBackend,
  getMemberTaskStatistics
} from '@/api/th_qd/implementation-v3/task-statistics'
import { apiLog } from '@/utils/apiLogger'
import { useUserStore } from '@/store/modules/user'//获取登录用户信息
import { uploadTechnologicalFile } from '@/api/upload/index';
const userInfo = useUserStore()

// 定义属性
const props = defineProps({
  extractedTasks: {
    type: Object,
    default: () => ({ implementation: [], technical: [], milestones: [] })
  },
  analysisData: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['next-step'])

const route = useRoute()
const router = useRouter()
const planning = usePlanningStore()
const membersStore = useTeamMembersStore()
const userStore = useUserStoreWithOut()
// 里程碑管理（界面骨架状态）
const msMgr = ref({ visible: false, keyword: '', newName: '', newDate: '', rows: [], loading: false })
const openMilestoneMgr = async () => { 
  msMgr.value.visible = true
  msMgr.value.loading = true
  await refreshMilestones()
  msMgr.value.loading = false
}
const msRows = computed(() => {
  const kw = (msMgr.value.keyword || '').toLowerCase()
  const list = (planning.milestones || []).map(m => {
    // 查找关联的任务
    const relatedTasks = (planning.tasks || []).filter(t => {
      // 检查任务是否关联到当前里程碑
      // 双向关联：1. 任务中的milestoneId或primaryMilestoneId指向里程碑ID
      //         2. 里程碑中的taskId指向任务ID
      // 确保类型匹配，将ID转换为数字进行比较
      return Number(t.milestoneId) === Number(m.id) || 
             Number(t.primaryMilestoneId) === Number(m.id) || 
             (m.taskId && Number(m.taskId) === Number(t.id))
    })
    
    // 通过taskId获取任务名称
    const taskNameByTaskId = m.taskId ? getTaskNameById(m.taskId) : ''
    
    return {
      id: m.id,
      name: m.name,
      date: m.plannedDate,
      statusText: '',
      taskCount: relatedTasks.length,
      taskNames: taskNameByTaskId || relatedTasks.map(t => t.name || t.taskTitle || t.title).filter(Boolean).join(', ')
    }
  })
  return kw ? list.filter(x => (x.name||'').toLowerCase().includes(kw) || (x.date||'').includes(msMgr.value.keyword)) : list
})
const msTableData = computed(() => msRows.value)
const msColumns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '计划日期', dataIndex: 'date', key: 'date', width: 150 },
  // { title: '关联任务数量', dataIndex: 'taskCount', key: 'taskCount', width: 120 },
  { title: '关联任务名称', dataIndex: 'taskNames', key: 'taskNames', width: 200 },
  { title: '操作', key: 'actions', width: 140 }
]
const refreshMilestones = async () => {
  if (!currentProjectId.value) return
  try {
    const params = { projectId: String(currentProjectId.value), pageNo: 1, pageSize: 100 }
    const res = await getMilestonePage(params)
    const dataAny = res?.data ?? res
    const list = (dataAny?.list ?? dataAny?.records ?? dataAny?.items ?? []).map((m) => transformMilestoneFromBackend(m))
    planning.milestones = Array.isArray(list) ? [...list] : []
    apiLog({ action: '刷新里程碑列表', api: 'getMilestonePage', method: 'GET', url: '/technological/milestone/page', params })
  } catch (e) {
    console.error('刷新里程碑失败', e)
  }
}

const msQuickAdd = async () => {
  if (!currentProjectId.value) { message.warning('请先选择项目'); return }
  const name = (msMgr.value.newName || '').trim()
  if (!name) { message.warning('请输入里程碑名称'); return }
  // 前端去重：名称唯一（忽略大小写与前后空格）
  const norm = (s) => (s || '').trim().toLowerCase()
  const exists = (planning.milestones || []).some(m => norm(m.name) === norm(name))
  if (exists) { message.warning('同名里程碑已存在，禁止重复创建'); return }
  const payload = {
    projectId: Number(currentProjectId.value),
    milestoneName: name,
    plannedDate: msMgr.value.newDate || undefined
  }
  apiLog({ action: '创建里程碑', api: 'createMilestone', method: 'POST', url: '/technological/milestone/create', params: payload })
  await createMilestone(payload)
  message.success('已创建里程碑')
  msMgr.value.newName = ''
  msMgr.value.newDate = ''
  await refreshMilestones()
}

// 里程碑编辑弹窗状态
const msEditModal = ref({
  visible: false,
  item: null,
  name: '',
  date: ''
})

// 打开里程碑编辑弹窗
const msEdit = (item) => {
  if (!item?.id) return
  msEditModal.value = {
    visible: true,
    item,
    name: item.name,
    date: item.date || ''
  }
}

// 确认编辑里程碑
const confirmMsEdit = async () => {
  const { item, name, date } = msEditModal.value
  if (!item?.id) return
  
  const norm = (s) => (s || '').trim().toLowerCase()
  if (!name.trim()) { 
    message.warning('名称不能为空'); 
    return 
  }
  
  if ((planning.milestones || []).some(m => m.id !== item.id && norm(m.name) === norm(name))) {
    message.warning('同名里程碑已存在，禁止重名');
    return
  }
  
  const payload = {
    id: Number(item.id),
    projectId: Number(currentProjectId.value),
    milestoneName: name,
    plannedDate: date || undefined
  }
  
  try {
    apiLog({ action: '更新里程碑', api: 'updateMilestone', method: 'PUT', url: '/technological/milestone/update', params: payload })
    await updateMilestone(payload)
    message.success('已更新里程碑')
    msEditModal.value.visible = false
    await refreshMilestones()
  } catch (error) {
    console.error('更新里程碑失败', error)
    message.error('更新里程碑失败')
  }
}

const msRemove = async (item) => {
  if (!item?.id) return
  
  // 前端引用校验
  const used = (planning.tasks || []).some(t => t.primaryMilestoneId === item.id)
  if (used) {
    message.warning('已有任务引用该里程碑，请先取消关联或归档任务')
    return
  }
  
  // 添加确认弹窗
  Modal.confirm({
    title: '确认删除里程碑',
    content: `确定要删除里程碑"${item.name}"吗？此操作不可撤销。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        apiLog({ action: '删除里程碑', api: 'deleteMilestone', method: 'DELETE', url: '/technological/milestone/delete', params: { id: Number(item.id) } })
        await deleteMilestone(Number(item.id))
        message.success('已删除里程碑')
        await refreshMilestones()
      } catch (error) {
        console.error('删除里程碑失败', error)
        message.error('删除里程碑失败')
      }
    }
  })
}

// ========== 项目选择相关状态 ==========
const currentProjectId = ref(null)
const selectedProject = ref(null)
const availableProjects = ref([])
const projectsLoading = ref(false)

// 显示的项目负责人：优先后端返回；否则兜底为当前登录用户昵称
const displayProjectLeader = computed(() => {
  const backend = selectedProject.value?.projectLeader
  if (backend && String(backend).trim()) return backend
  try {
    const nick = userStore.getUser?.nickname || ''
    return nick || '未设置'
  } catch { return '未设置' }
})

// 项目ID记忆功能（与其他页面共享）
const LAST_PROJECT_ID_KEY = 'implV3:lastProjectId'

// 展示统计
const totalTasks = computed(() => planning.totalTasks)
const unassignedCount = computed(() => planning.unassignedCount)
const assignedCount = computed(() => totalTasks.value - unassignedCount.value)
const involvedMilestoneCount = computed(() => planning.involvedMilestoneCount)

// 统计未计划时间的任务数量
const unsetTimeCount = computed(() => {
  return (planning.tasks || []).filter(task => {
    // 检查是否缺少时间设置（开始时间、结束时间或截止时间）
    return !task.startDate && !task.endDate && !task.dueDate
  }).length
})

// 统计未设置里程碑的任务数量
const unsetMilestoneCount = computed(() => {
  // 获取所有在里程碑中设置了taskId的任务ID
  const taskIdsInMilestones = new Set(
    (planning.milestones || [])
      .filter(m => m.taskId)
      .map(m => Number(m.taskId))
  )
  
  return (planning.tasks || []).filter(task => {
    // 检查是否未关联里程碑（既没有primaryMilestoneId，也没有在里程碑的taskId中）
    return !task.primaryMilestoneId && !taskIdsInMilestones.has(Number(task.id))
  }).length
})

// 统计已设置里程碑的任务数量
const setMilestoneCount = computed(() => {
  // 获取所有在里程碑中设置了taskId的任务ID
  const taskIdsInMilestones = new Set(
    (planning.milestones || [])
      .filter(m => m.taskId)
      .map(m => Number(m.taskId))
  )

  return (planning.tasks || []).filter(task => {
    // 检查是否已关联里程碑（有primaryMilestoneId或在里程碑的taskId中）
    return task.primaryMilestoneId || taskIdsInMilestones.has(Number(task.id))
  }).length
})

// 统计已设置时间的任务数量
const setTimeCount = computed(() => {
  return (planning.tasks || []).filter(task => {
    // 检查是否设置了时间（开始时间、结束时间或截止时间中的任意一个）
    return task.startDate || task.endDate || task.dueDate
  }).length
})

// 统计已设置里程碑的任务数量

const coverageText = computed(() => {
  const total = planning.totalTasks
  const assigned = total - planning.unassignedCount
  if (total === 0) return '0%'
  return Math.round((assigned / total) * 100) + '%'
})

// 筛选
const activeFilter = ref('all')
const setFilter = (f) => { activeFilter.value = f }
// 新筛选UI状态
const filterMode = ref('all') // all | phase | mile | unassigned
const filterValue = ref('')

// 分页相关状态
const taskPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const taskKeywordRaw = ref('')
const taskKeyword = ref('')
// 200ms 防抖
let kwTimer = null
watch(taskKeywordRaw, (v) => {
  if (kwTimer) clearTimeout(kwTimer)
  kwTimer = setTimeout(() => { taskKeyword.value = v }, 200)
})
// 扁平化筛选后的任务列表（按时间排序）
const filteredTasks = computed(() => {
  const assignedIds = new Set((planning.assignments || []).map(a => a.taskId))
  const kw = taskKeyword.value.toLowerCase()
  
  // 筛选任务
  let filtered = (planning.tasks || []).filter(t => {
    // 状态筛选
    if (activeFilter.value === 'unassigned') {
      if (assignedIds.has(t.id)) return false
    } else if (activeFilter.value === 'assigned') {
      if (!assignedIds.has(t.id)) return false
    } else if (activeFilter.value === 'no_time') {
      // 筛选未计划时间的任务
      if (t.startDate || t.endDate || t.dueDate) return false
    } else if (activeFilter.value === 'has_time') {
      // 筛选已设置时间的任务
      if (!t.startDate && !t.endDate && !t.dueDate) return false
    } else if (activeFilter.value === 'no_milestone') {
      // 筛选未设置里程碑的任务
      // 获取所有在里程碑中设置了taskId的任务ID
      const taskIdsInMilestones = new Set(
        (planning.milestones || [])
          .filter(m => m.taskId)
          .map(m => Number(m.taskId))
      )
      if (t.primaryMilestoneId || taskIdsInMilestones.has(Number(t.id))) return false
    } else if (activeFilter.value === 'has_milestone') {
      // 筛选已设置里程碑的任务
      // 获取所有在里程碑中设置了taskId的任务ID
      const taskIdsInMilestones = new Set(
        (planning.milestones || [])
          .filter(m => m.taskId)
          .map(m => Number(m.taskId))
      )
      if (!t.primaryMilestoneId && !taskIdsInMilestones.has(Number(t.id))) return false
    }
    
    // 搜索筛选
    if (!kw) return true
    return (t.name || '').toLowerCase().includes(kw)
  })
  
  // 排序：有截止时间的任务按时间从近到远，无时间的新任务在上老任务在下
  return filtered.sort((a, b) => {
    // 有截止时间的任务优先
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    
    // 都有截止时间，按时间从近到远
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    
    // 都没有截止时间，新任务在上（按创建时间倒序）
    const aTime = a.createdAt || a.id
    const bTime = b.createdAt || b.id
    return bTime.localeCompare(aTime)
  })
})

// 分页计算属性：获取当前页的任务
const paginatedTasks = computed(() => {
  const startIndex = (taskPagination.value.current - 1) * taskPagination.value.pageSize
  const endIndex = startIndex + taskPagination.value.pageSize
  return filteredTasks.value.slice(startIndex, endIndex)
})

// 侦听 filteredTasks 的变化，更新分页总数
watch(
  () => filteredTasks.value.length,
  (newLength) => {
    taskPagination.value.total = newLength
    // 如果当前页码超出范围，重置到第一页
    const maxPage = Math.ceil(newLength / taskPagination.value.pageSize) || 1
    if (taskPagination.value.current > maxPage) {
      taskPagination.value.current = 1
    }
  }
)

// 分页变化处理
const handleTaskPageChange = (page, pageSize) => {
  taskPagination.value.current = page
  if (pageSize) {
    taskPagination.value.pageSize = pageSize
  }
}

// 分页大小变化处理
const handleTaskSizeChange = (current, size) => {
  taskPagination.value.pageSize = size
  taskPagination.value.current = 1 // 重置到第一页
}

// 清理废弃的阶段相关代码已移除

// 成员列表
const memberKeyword = ref('')
const filteredMembers = computed(() => {
  const kw = memberKeyword.value.trim().toLowerCase()
  const activeMembers = membersStore.activeMembers || []
  return activeMembers.filter(m => {
    if (!kw) return true
    return (m.name || '').toLowerCase().includes(kw) || (m.role || '').toLowerCase().includes(kw)
  })
})

// 负载显示（简化：按分配任务数/10 计算）
const backendTaskCountMap = ref(new Map())
const getAssignedCount = (memberId) => {
  // 统一使用字符串类型进行匹配
  const memberIdStr = String(memberId)
  const assignments = planning.getMemberAssignments(memberIdStr)
  const localCount = assignments.length
  // 优先使用本地分配数量（更准确、实时），后端统计仅作为回退
  if (localCount > 0) {
    // console.log(`📊 成员 ${memberIdStr} 使用本地分配数据:`, { count: localCount, assignments })
    return localCount
  }
  const id = Number(memberId)
  if (backendTaskCountMap.value.has(id)) {
    const count = backendTaskCountMap.value.get(id)
    console.log(`📊 成员 ${memberIdStr} 使用后端统计数据:`, count)
    return count
  }
  console.log(`📊 成员 ${memberIdStr} 无分配数据（本地/后端均为0）`)
  return 0
}
const memberLoadText = (memberId) => `已分配 ${getAssignedCount(memberId)} 个任务`

// ========== 人员面板：展开/收起与任务列表 ==========
const expandedMembers = ref(new Set())
const isMemberExpanded = (memberId) => expandedMembers.value.has(memberId)
const toggleMemberExpand = (memberId) => {
  const s = new Set(expandedMembers.value)
  if (s.has(memberId)) s.delete(memberId)
  else s.add(memberId)
  expandedMembers.value = s
}
// 该成员的任务分配
const memberTasks = (memberId) => {
  const memberIdStr = String(memberId)
  const assignments = planning.getMemberAssignments ? planning.getMemberAssignments(memberIdStr) : []
  // console.log(`📋 获取成员 ${memberIdStr} 的任务分配:`, assignments)
  return assignments
}
// 根据任务ID取名称
const getTaskNameById = (taskId) => {
  // 确保类型匹配，将taskId转换为数字进行比较
  const taskIdNum = Number(taskId)
  const t = (planning.tasks || []).find(it => Number(it.id) === taskIdNum)
  return t ? (t.name || t.title || t.taskTitle || `任务${taskId}`) : `任务${taskId}`
}

// 判断任务是否未设置里程碑
const isTaskWithoutMilestone = (task) => {
  // 获取所有在里程碑中设置了taskId的任务ID
  const taskIdsInMilestones = new Set(
    (planning.milestones || [])
      .filter(m => m.taskId)
      .map(m => Number(m.taskId))
  )
  // 检查是否未关联里程碑（既没有primaryMilestoneId，也没有在里程碑的taskId中）
  return !task.primaryMilestoneId && !taskIdsInMilestones.has(Number(task.id))
}

// 获取任务关联的里程碑名称
const getTaskMilestoneName = (task) => {
  // 首先检查任务的primaryMilestoneId
  if (task.primaryMilestoneId) {
    const milestone = (planning.milestones || []).find(m => Number(m.id) === Number(task.primaryMilestoneId))
    if (milestone) return milestone.name
  }
  
  // 然后检查里程碑中是否有taskId指向当前任务
  const milestone = (planning.milestones || []).find(m => Number(m.taskId) === Number(task.id))
  if (milestone) return milestone.name
  
  // 如果都没有找到，返回默认文本
  return '已设置里程碑'
}

// 增强版的里程碑显示函数，考虑里程碑中的taskId字段，返回所有关联的里程碑
const getMilestoneDisplayEnhanced = (task) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    } catch {
      return dateStr
    }
  }
  
  // 收集所有关联的里程碑
  const milestones = []
  
  // 1. 检查任务的primaryMilestoneId
  if (task.primaryMilestoneId) {
    const primaryMilestone = planning.milestones.find(m => Number(m.id) === Number(task.primaryMilestoneId))
    if (primaryMilestone) {
      milestones.push({
        name: primaryMilestone.name,
        date: primaryMilestone.plannedDate ? formatDate(primaryMilestone.plannedDate) : null,
        id: primaryMilestone.id,
        isPrimary: true
      })
    }
  }
  
  // 2. 检查里程碑中是否有taskId指向当前任务
  const taskMilestones = (planning.milestones || []).filter(m => Number(m.taskId) === Number(task.id))
  taskMilestones.forEach(m => {
    // 避免重复添加已经在primaryMilestoneId中的里程碑
    if (!milestones.find(ms => ms.id === m.id)) {
      milestones.push({
        name: m.name,
        date: m.plannedDate ? formatDate(m.plannedDate) : null,
        id: m.id,
        isPrimary: false
      })
    }
  })
  
  return milestones.length > 0 ? milestones : null
}

// 调试函数：检查分配关系状态
const debugAssignments = () => {
  console.log('🔍 当前分配关系状态调试:')
  console.log('planning.assignments:', planning.assignments)
  console.log('planning.tasks 数量:', planning.tasks?.length || 0)
  console.log('membersStore.activeMembers 数量:', membersStore.activeMembers?.length || 0)
  
  // 检查每个成员的分配情况
  if (membersStore.activeMembers) {
    membersStore.activeMembers.forEach(member => {
      const memberIdStr = String(member.id)
      const assignments = planning.getMemberAssignments(memberIdStr)
      console.log(`成员 ${member.name}(${memberIdStr}):`, assignments)
    })
  }
}

// 在控制台暴露调试函数
if (typeof window !== 'undefined') {
  window.debugAssignments = debugAssignments
}
const memberLoadPercent = (memberId) => '0%'

// 阶段下拉（AutoComplete）选项：合并现有阶段 + 本次保存后新增阶段
const customPhases = ref([])
const phaseOptions = computed(() => {
  const arr = Array.from(new Set([...(planning.phaseFilters || []), ...customPhases.value]))
  return arr.map(p => ({ value: p }))
})

const addPhaseIfNeeded = (val) => {
  const p = (val || '').trim()
  if (!p) return
  if (!customPhases.value.includes(p)) customPhases.value.push(p)
}
// 阶段相关函数已移除

// 任务-成员 操作
const taskName = (taskId) => planning.tasks.find(t => t.id === taskId)?.name || taskId
const assigneeName = (taskId) => {
  const memberId = planning.getTaskAssignee(taskId)
  if (!memberId) return ''
  const m = (membersStore.activeMembers || []).find(x => x.id === memberId)
  return m?.name || memberId
}

// ========== 阶段分组与排序 ==========
const getTaskTime = (t) => {
  const parse = (d) => {
    if (!d) return null
    // 支持 dayjs/moment 对象、字符串(YYYY-MM-DD) 与 Date
    if (typeof d === 'object' && d !== null) {
      if (typeof d.toDate === 'function') {
        const dd = d.toDate()
        return isNaN(dd.getTime()) ? null : dd
      }
      if (d instanceof Date) return isNaN(d.getTime()) ? null : d
    }
    const date = new Date(d)
    return isNaN(date.getTime()) ? null : date
  }
  const sd = parse(t.startDate)
  const ed = parse(t.endDate)
  const dd = parse(t.dueDate)
  return { sd, ed, dd }
}

// 阶段显示函数已移除

const buildPhaseList = (tasks) => {
  const byPhase = new Map()
  tasks.forEach(t => {
    const pid = t.phaseId || '__NO_PHASE__'
    if (!byPhase.has(pid)) byPhase.set(pid, [])
    byPhase.get(pid).push(t)
  })
  const phases = []
  byPhase.forEach((list, pid) => {
    // 阶段时间：取最早的 start/due/end
    let earliest = null
    list.forEach(t => {
      const { sd, ed, dd } = getTaskTime(t)
      const candidates = [sd, dd, ed].filter(Boolean)
      candidates.forEach(d => { if (!earliest || d < earliest) earliest = d })
    })
    const displayName = pid === '__NO_PHASE__' ? '未设定阶段' : phaseDisplayName(pid)
    const timeSummary = earliest ? earliest.toLocaleDateString() : ''
    // 阶段内任务排序：时间近->远，无时间最后；同等按优先级与 order
    const priorityWeight = (p) => p === '高' ? 3 : p === '中' ? 2 : p === '低' ? 1 : 0
    const sortedTasks = list.slice().sort((a, b) => {
      const ta = getTaskTime(a)
      const tb = getTaskTime(b)
      const fa = ta.sd || ta.dd || ta.ed
      const fb = tb.sd || tb.dd || tb.ed
      if (fa && fb) return fa - fb || priorityWeight(b.priority) - priorityWeight(a.priority) || (a.order||0) - (b.order||0)
      if (fa && !fb) return -1
      if (!fa && fb) return 1
      return priorityWeight(b.priority) - priorityWeight(a.priority) || (a.order||0) - (b.order||0)
    })
    phases.push({ id: pid, displayName, timeSummary, earliest, tasks: sortedTasks })
  })
  // 阶段排序：近->远；未设定时间最后
  phases.sort((a, b) => {
    if (a.earliest && b.earliest) return a.earliest - b.earliest
    if (a.earliest && !b.earliest) return -1
    if (!a.earliest && b.earliest) return 1
    return a.displayName.localeCompare(b.displayName)
  })
  return phases
}

const groupedPhases = computed(() => buildPhaseList(filteredTasks.value))

// 阶段折叠与时间摘要
const collapsedPhases = ref(new Set())
const togglePhase = (pid) => {
  const s = collapsedPhases.value
  if (s.has(pid)) {
    s.delete(pid)
  } else {
    s.add(pid)
  }
  collapsedPhases.value = new Set(s)
}
const isPhaseCollapsed = (pid) => collapsedPhases.value.has(pid)
const taskTimeSummary = (t) => {
  const { sd, ed, dd } = getTaskTime(t)
  if (sd && ed) return `${sd.toLocaleDateString()} ~ ${ed.toLocaleDateString()}`
  if (dd) return `至 ${dd.toLocaleDateString()}`
  if (sd) return `${sd.toLocaleDateString()}`
  return ''
}

// 优化的任务时间显示方法（支持多种时间组合）
const getTaskTimeDisplay = (task) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  // 格式化日期显示
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return dateStr
    }
  }
  
  const timeItems = []
  
  // 处理时间区间（开始时间 -> 结束时间）
  if (task.startDate && task.endDate) {
    const isOverdue = task.endDate < today
    const startFormatted = formatDate(task.startDate)
    const endFormatted = formatDate(task.endDate)
    const timeRange = `${startFormatted} ~ ${endFormatted}`
    timeItems.push({
      text: isOverdue ? `⚠️ ${timeRange} (已逾期)` : `📅 ${timeRange}`,
      type: 'range',
      isOverdue
    })
  } else {
    // 单独处理开始时间
    if (task.startDate) {
      const startFormatted = formatDate(task.startDate)
      timeItems.push({
        text: `🚀 ${startFormatted} 开始`,
        type: 'start',
        isOverdue: false
      })
    }
    
    // 单独处理结束时间
    if (task.endDate) {
      const isOverdue = task.endDate < today
      const endFormatted = formatDate(task.endDate)
      timeItems.push({
        text: isOverdue ? `⚠️ 结束 ${endFormatted} (已逾期)` : `🏁 结束 ${endFormatted}`,
        type: 'end',
        isOverdue
      })
    }
  }
  
  // 处理截止时间（独立于时间区间）
  if (task.dueDate) {
    const isOverdue = task.dueDate < today
    const dueFormatted = formatDate(task.dueDate)
    const dueText = `截止 ${dueFormatted}`
    timeItems.push({
      text: isOverdue ? `⚠️ ${dueText} (已逾期)` : `⏰ ${dueText}`,
      type: 'due',
      isOverdue
    })
  }
  
  return timeItems
}

// 获取里程碑显示信息
const getMilestoneDisplay = (task) => {
  if (!task.primaryMilestoneId) return null
  
  const milestone = planning.milestones.find(m => m.id === task.primaryMilestoneId)
  if (!milestone) return null
  
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    } catch {
      return dateStr
    }
  }
  
  return {
    name: milestone.name,
    date: milestone.plannedDate ? formatDate(milestone.plannedDate) : null,
    id: milestone.id
  }
}

const originText = (origin) => {
  if (!origin) return ''
  const map = { verbatim: '原文', inferred: '推理', generated: '生成' }
  const base = map[origin.type] || origin.type
  if (origin.confidence) return `${base} 置信度${Math.round(origin.confidence*100)}%`
  return base
}

const assigneePickerVisible = ref(false)
const pickerForTask = ref(null)
const pickerKeyword = ref('')
const pickerMembers = computed(() => {
  const kw = pickerKeyword.value.trim().toLowerCase()
  return (membersStore.activeMembers || []).filter(m => !kw || (m.name||'').toLowerCase().includes(kw))
})
const pickAssignee = (task) => {
  pickerForTask.value = task
  // 若任务已分配，给出提示并阻止继续选择
  const already = planning.getTaskAssignee && planning.getTaskAssignee(task.id)
  if (already) {
    const name = assigneeName(task.id) || already
    message.warning(`此任务已分配给 ${name}。请先取消分配或选择其他任务。`)
    return
  }
  assigneePickerVisible.value = true
}
const onPick = async (member) => {
  if (!pickerForTask.value) return
  const success = planning.assignTaskToMember(pickerForTask.value.id, member.id)
  assigneePickerVisible.value = false
  if (success) {
    message.success(`✅ 已将"${pickerForTask.value.name}"分配给 ${member.name}`, 3)
    // 添加视觉反馈效果
    addAssignmentFeedback(pickerForTask.value.id)
    // 分配后持久化到后端（任务 + 分配表）
    await persistAssignmentToBackend(pickerForTask.value.id, member.id)
    // 分配表幂等：已存在则更新，否则创建
    try {
      const existed = await getTaskAssignmentsByTask(Number(pickerForTask.value.id))
      const raw = existed?.data ?? existed
      const first = Array.isArray(raw?.list) ? raw.list[0]
        : Array.isArray(raw?.records) ? raw.records[0]
        : Array.isArray(raw?.items) ? raw.items[0]
        : (raw?.data || raw)
      if (first && first.id) {
        if (String(first.assigneeMemberId) !== String(member.id)) {
          await updateTaskAssignment({ id: Number(first.id), projectId: Number(currentProjectId.value), taskId: Number(pickerForTask.value.id), assigneeMemberId: Number(member.id), assigneeName: member.name })
        }
      } else {
        await createTaskAssignment({ projectId: Number(currentProjectId.value), taskId: Number(pickerForTask.value.id), assigneeMemberId: Number(member.id), assigneeName: member.name })
      }
    } catch (err) {
      console.error('❌ 分配表upsert失败:', err)
      try { planning.unassignTask(pickerForTask.value.id) } catch {}
      message.error('分配保存失败（分配表），已回滚')
      return
    }
    // 自动展开该成员任务列表并持久化本地
    try { expandedMembers.value.add(member.id) } catch {}
    try { planning.saveToLocal() } catch {}
    // 分配表已创建，无需重复创建
  } else {
    message.error('分配失败，请重试')
  }
}

const unassignTask = async (taskId) => {
  if (!taskId) {
    message.error('任务ID不能为空')
    return
  }

  const task = (planning.tasks || []).find(t => t.id === taskId)
  if (!task) {
    message.error('任务不存在')
    return
  }

  // 添加确认提示
  Modal.confirm({
    title: '确认取消分配',
    content: `确定要取消任务"${task.name}"的分配吗？`,
    okText: '确认取消',
    cancelText: '取消',
    onOk() {
      // 用户确认后执行取消分配操作
      return executeUnassignTask(taskId, task);
    }
  });
}

// 实际执行取消任务分配的函数
const executeUnassignTask = async (taskId, task) => {
  // 乐观更新：先本地移除分配
  planning.unassignTask(taskId)

  try {
    const payload = {
      id: Number(taskId),
      projectId: Number(currentProjectId.value),
      taskTitle: task.name || task.taskTitle || '',
      taskDescription: task.description,
      priority: task.priority,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.dueDate,
      milestoneId: task.primaryMilestoneId ? Number(task.primaryMilestoneId) : (task.milestoneId ? Number(task.milestoneId) : undefined),
      assigneeMemberId: null,
      assigneeName: null,
      taskStatus: 1
    }

    apiLog({
      action: '取消任务分配',
      api: 'updateTask',
      method: 'POST',
      url: '/technological/task/unassign',
      params: payload,
      expect: '清空负责人，任务变为未分配'
    })

    const res = await unassign({ taskId: Number(taskId) })
    apiLog({ action: '取消任务分配', api: 'unassign', method: 'POST', url: '/technological/task/unassign', params: { taskId: Number(taskId) }, res })

    // 删除分配表中的记录
    try {
      const listRes = await getTaskAssignmentsByTask(Number(taskId))
      const list = (listRes && listRes.data) ? (listRes.data.list || listRes.data.records || listRes.data.items || []) : []
      const first = Array.isArray(list) && list.length > 0 ? list[0] : null
      if (first && first.id) {
        await deleteTaskAssignment(Number(first.id))
      }
    } catch (e) {
      console.warn('⚠️ 删除分配记录失败:', e)
    }

    // 强制刷新任务列表，确保后端数据同步到前端
    await loadTasksFromBackend(currentProjectId.value)
    
    message.success('已取消分配')
    // 持久化与UI更新
    try { planning.saveToLocal() } catch {}
  } catch (e) {
    console.error('取消分配失败', e)
    // 回滚本地变更
    try { 
      if (task.assigneeMemberId) {
        planning.assignTaskToMember(taskId, task.assigneeMemberId)
      }
    } catch {}
    message.error('取消分配失败，已恢复')
  }
}

// 右侧人员面板：在任务 chip 上直接取消分配（落库）
const cancelMemberAssignment = async (memberId, taskId) => {
  if (!taskId) return
  const task = (planning.tasks || []).find(t => t.id === taskId)
  if (!task) { message.error('任务不存在'); return }

  // 添加确认提示
  Modal.confirm({
    title: '确认取消分配',
    content: `确定要取消任务"${task.name}"的分配吗？`,
    okText: '确认取消',
    cancelText: '取消',
    onOk() {
      // 用户确认后执行取消分配操作
      return executeCancelMemberAssignment(memberId, taskId, task);
    }
  });
}

// 实际执行取消成员分配的函数
const executeCancelMemberAssignment = async (memberId, taskId, task) => {
  const prevMemberId = memberId
  // 乐观更新：先本地移除分配
  planning.unassignTask(taskId)

  try {
    const payload = {
      id: Number(taskId),
      projectId: Number(currentProjectId.value),
      taskTitle: task.name || task.taskTitle || '',
      taskDescription: task.description,
      priority: task.priority,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.dueDate,
      milestoneId: task.primaryMilestoneId ? Number(task.primaryMilestoneId) : (task.milestoneId ? Number(task.milestoneId) : undefined),
      assigneeMemberId: null,
      assigneeName: null,
      taskStatus: 1
    }
    apiLog({
      action: '取消任务分配',
      api: 'updateTask',
      method: 'PUT',
      url: '/technological/task/update',
      params: payload,
      expect: '清空负责人，任务变为未分配'
    })
    const res = await updateTask(payload)
    apiLog({ action: '取消任务分配', api: 'updateTask', method: 'PUT', url: '/technological/task/update', params: payload }, res)

    // 删除分配表中的记录
    try {
      const listRes = await getTaskAssignmentsByTask(Number(taskId))
      const list = (listRes && listRes.data) ? (listRes.data.list || listRes.data.records || listRes.data.items || []) : []
      const first = Array.isArray(list) && list.length > 0 ? list[0] : null
      if (first && first.id) {
        await deleteTaskAssignment(Number(first.id))
      }
    } catch (e) {
      console.warn('⚠️ 删除分配记录失败:', e)
    }
    message.success('已取消分配')
    // 持久化与UI更新
    try { planning.saveToLocal() } catch {}
    try {
      if (expandedMembers.value.has(prevMemberId)) expandedMembers.value.delete(prevMemberId)
    } catch {}
  } catch (e) {
    console.error('取消分配失败', e)
    // 回滚本地变更
    try { planning.assignTaskToMember(taskId, prevMemberId) } catch {}
    message.error('取消分配失败，已恢复')
  }
}

// 将任务分配持久化到后端
const persistAssignmentToBackend = async (taskId, memberId) => {
  try {
    const task = (planning.tasks || []).find(t => t.id === taskId)
    if (!task) return
    const member = (membersStore.activeMembers || []).find(m => m.id === memberId)
    const memberName = member?.name || ''

    const payload = {
      id: Number(taskId),
      projectId: Number(currentProjectId.value),
      taskTitle: task.name || task.taskTitle || '',
      taskDescription: task.description,
      priority: task.priority,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.dueDate,
      milestoneId: task.primaryMilestoneId ? Number(task.primaryMilestoneId) : (task.milestoneId ? Number(task.milestoneId) : undefined),
      assigneeMemberId: Number(memberId),
      assigneeName: memberName,
      taskStatus: Number(memberId) ? 2 : 1
    }
    
    console.log('💾 即将持久化任务分配到后端:', {
      taskId: String(taskId),
      memberId: String(memberId),
      memberName,
      payload: { ...payload, assigneeMemberId: payload.assigneeMemberId, assigneeName: payload.assigneeName }
    })
    
    apiLog({ action: '分配任务到成员（持久化）', api: 'updateTask', method: 'PUT', url: '/technological/task/update', params: payload, expect: '更新负责人后刷新仍保持' })
    const updateResult = await updateTask(payload)
    apiLog({ action: '分配任务到成员（持久化）', api: 'updateTask', method: 'PUT', url: '/technological/task/update', params: payload }, updateResult)
    
    console.log('✅ 任务分配已持久化到后端，响应:', updateResult)
    
    // 立即验证：重新查询该任务的负责人信息
    try {
      const verifyResult = await getTask(Number(taskId))
      console.log('🔍 验证任务负责人信息:', {
        taskId: String(taskId),
        assigneeMemberId: verifyResult?.data?.assigneeMemberId,
        assigneeName: verifyResult?.data?.assigneeName
      })
    } catch (e) {
      console.warn('⚠️ 验证任务负责人信息失败:', e)
    }
  } catch (e) {
    console.error('分配持久化失败', e)
    // 回滚本地指派
    try { planning.unassignTask(taskId) } catch {}
    message.error('分配保存失败，已回滚')
  }
}

// 添加任务分配成功的视觉反馈
const addAssignmentFeedback = (taskId) => {
  // 查找任务元素并添加短暂的高亮效果
  setTimeout(() => {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`)
    if (taskElement) {
      taskElement.style.transition = 'all 0.5s ease'
      taskElement.style.backgroundColor = '#f6ffed'
      taskElement.style.boxShadow = '0 0 8px rgba(82, 196, 26, 0.5)'
      setTimeout(() => {
        taskElement.style.backgroundColor = ''
        taskElement.style.boxShadow = ''
      }, 2000)
    }
  }, 100)
}

// 草稿功能已移除，采用实时保存机制
// 下一步：跳转到进展监控步骤
const goToNextStep = () => {
  // 检查是否有未分配任务，给出提示但不强制阻止
  if (planning.unassignedCount > 0) {
    Modal.confirm({
      title: '存在未分配任务',
      content: `当前还有 ${planning.unassignedCount} 个任务未分配给团队成员。是否要在未完成分配的情况下进入下一步？`,
      okText: '继续下一步',
      cancelText: '返回分配',
      onOk: () => {
        // 先保存当前草稿
        planning.saveToLocal()
        // 通知父组件切换到下一步，并直接路由跳转兜底
        emit('next-step', 4)
        try { router.push({ path: '/th-qd-implementation-v3/progress-monitoring' }) } catch {}
        message.success('已进入：进展监控')
      }
    })
  } else {
    // 所有任务已分配，直接进入下一步
    planning.saveToLocal()
    emit('next-step', 4)
    try { router.push({ path: '/th-qd-implementation-v3/progress-monitoring' }) } catch {}
    message.success('任务分配完成，已进入：进展监控')
  }
}

// 导入与示例数据
const importFromAnalysis = () => {
  try {
    // 从 localStorage 或全局窗口中尝试读取解析结果
    // 优先：window.__doubaoResults / __analysisData（调试注入）
    const win = typeof window !== 'undefined' ? window : {}
    let doubao = win.__doubaoResults
    let analysis = win.__analysisData
    if (!doubao) {
      const raw = localStorage.getItem('doubaoAnalysisResults')
      if (raw) doubao = JSON.parse(raw)
    }
    if (!analysis) {
      const raw2 = localStorage.getItem('analysisData')
      if (raw2) analysis = JSON.parse(raw2)
    }
    if (!doubao && !analysis) {
      message.warning('未找到解析结果，请先在解析页完成数据粘贴/保存')
      return
    }
    // 生成任务与里程碑（简化映射：从实施方案/技术路线提取）
    const { tasks, milestones } = generateFromAnalysis(doubao, analysis)
    // 预览差异并确认
    const diff = planning.previewMerge(tasks)
    // 打开提案窗口
    proposal.value.visible = true
    proposal.value.loading = false
    proposal.value.sourceTasks = tasks
    proposal.value.milestones = milestones
    proposal.value.schedule = analysis?.schedule || ''
    proposal.value.diff = diff
    proposal.value.options = { applyAdditions: true, applyUpdates: false, archiveRemovals: false }
  } catch (e) {
    console.error(e)
    message.error('导入失败，请检查数据结构')
  }
}

// 从后端解析结果读取（仅追加新任务）
const importFromBackendAnalysis = async () => {
  if (!canAutoImport.value) { return }
  try {
    if (!currentProjectId.value || currentProjectId.value === 'ALL_PROJECTS') {
      message.warning('请先选择具体项目')
      return
    }

    const pid = Number(currentProjectId.value)
    message.loading({ content: '正在从后端读取解析结果…', key: 'imp-backend', duration: 0 })

    const backendData = await loadAnalysisFromBackend(pid)
    apiLog({ action: '从后端读取解析结果', api: 'loadAnalysisFromBackend', method: 'GET', url: '/technological/proposal-analysis/get-by-project', params: { projectId: pid } }, backendData)

    const hasAny = backendData && (backendData.technicalRoute || backendData.implementation)
    if (!hasAny) {
      message.destroy('imp-backend')
      message.info('后端暂无解析结果，请先在申报书解析页完成解析并保存')
      return
    }

    // 适配 generateFromAnalysis 的入参结构
    const doubao = {
      technicalRoute: backendData.technicalRoute || null,
      implementation: backendData.implementation
        ? (backendData.implementation.implementationPlan ? backendData.implementation : { implementationPlan: backendData.implementation })
        : null
    }
    const analysis = {
      technicalRoute: backendData.technicalRoute || null,
      implementationPlan: backendData.implementation?.implementationPlan ? backendData.implementation.implementationPlan : backendData.implementation || null,
      schedule: backendData?.implementation?.implementationPlan?.totalDuration || ''
    }

    const { tasks, milestones } = generateFromAnalysis(doubao, analysis)

    // 预览差异并仅默认追加新增
    const diff = planning.previewMerge(tasks)
    if (!canAutoImport.value) return
    proposal.value.visible = true
    proposal.value.loading = false
    proposal.value.sourceTasks = tasks
    proposal.value.milestones = milestones
    proposal.value.schedule = analysis?.schedule || ''
    proposal.value.diff = diff
    proposal.value.options = { applyAdditions: true, applyUpdates: false, archiveRemovals: false }

    message.destroy('imp-backend')
    message.success('已读取后端解析结果，生成变更提案（仅追加）')
  } catch (e) {
    message.destroy('imp-backend')
    console.error(e)
    message.error('读取失败，请稍后重试')
  }
}

const initWithSamples = () => {
  const tasks = []
  const milestones = []
  planning.setData({ tasks, milestones, assignments: [], draftPlan: { totalDuration: '9个月', milestones: milestones.map(m => ({ name:m.name, plannedDate:m.plannedDate, criteria:m.criteria })) } })
  message.success('已载入示例数据')
}

const generateFromAnalysis = (doubao, analysis) => {
  const tasks = []
  const milestones = []
  // 技术路线 phases → 任务（名称、主要任务/交付物转为描述，这里仅取名称）
  try {
    // 支持两种结构：
    // 1) doubao.technicalRoute = { phases: [...] }
    // 2) analysis.technicalRoute 为 JSON 字符串或对象
    let tr = null
    if (doubao && doubao.technicalRoute) tr = doubao.technicalRoute
    else if (analysis && analysis.technicalRoute) tr = typeof analysis.technicalRoute === 'string' ? JSON.parse(analysis.technicalRoute) : analysis.technicalRoute
    if (tr && Array.isArray(tr.phases)) {
      tr.phases.forEach((p, idx) => {
        const phaseName = p?.name || p?.phaseName || `阶段${idx+1}`
        const items = Array.isArray(p?.tasks) ? p.tasks : Array.isArray(p?.mainTasks) ? p.mainTasks : []
        items.forEach((it, j) => {
          const name = typeof it === 'string' ? it : (it?.name || it?.task || `${phaseName}-任务${j+1}`)
          tasks.push({
            id: `TR-${idx+1}-${j+1}`,
            name,
            phaseId: phaseName,
            estimate: typeof it === 'object' ? (it?.estimateDays || undefined) : undefined,
            priority: typeof it === 'object' ? (it?.priority || undefined) : undefined,
            origin: { type: 'verbatim' }
          })
        })
      })
    }
  } catch {}
  // 实施方案 phases → 任务 + 里程碑
  try {
    // 支持三种结构：
    // 1) doubao.implementation.implementationPlan = { phases: [...] }
    // 2) doubao.implementation = { phases: [...] }
    // 3) analysis.implementationPlan 为 JSON 字符串或对象（可能直接就是 implementationPlan 或包含该字段）
    let implPlan = null
    if (doubao && doubao.implementation) {
      if (doubao.implementation.implementationPlan) implPlan = doubao.implementation.implementationPlan
      else if (doubao.implementation.phases) implPlan = doubao.implementation
    } else if (analysis && analysis.implementationPlan) {
      const parsed = typeof analysis.implementationPlan === 'string' ? JSON.parse(analysis.implementationPlan) : analysis.implementationPlan
      implPlan = parsed?.implementationPlan ? parsed.implementationPlan : parsed
    }
    if (implPlan && Array.isArray(implPlan.phases)) {
      implPlan.phases.forEach((p, idx) => {
        const phaseName = p?.name || p?.phaseName || `阶段${idx+1}`
        const items = Array.isArray(p?.activities) ? p.activities : []
        items.forEach((it, j) => {
          const name = typeof it === 'string' ? it : (it?.name || it?.activity || `${phaseName}-活动${j+1}`)
          tasks.push({
            id: `IM-${idx+1}-${j+1}`,
            name,
            phaseId: phaseName,
            estimate: typeof it === 'object' ? (it?.estimateDays || undefined) : undefined,
            priority: typeof it === 'object' ? (it?.priority || undefined) : undefined,
            origin: { type: 'verbatim' }
          })
        })
        const ms = Array.isArray(p?.milestones) ? p.milestones : []
        ms.forEach((m, k) => {
          const id = `M-${idx+1}-${k+1}`
          const mName = typeof m === 'string' ? m : (m?.name || `阶段${idx+1}-里程碑${k+1}`)
          const plannedDate = typeof m === 'object' ? m?.plannedDate : undefined
          const criteria = typeof m === 'object' ? (m?.criteria || []) : []
          milestones.push({ id, name: mName, plannedDate, criteria })
          if (k === 0) {
            tasks.forEach(t => { if (t.phaseId === phaseName && !t.primaryMilestoneId) t.primaryMilestoneId = id })
          }
        })
      })
    }
  } catch {}
  return { tasks, milestones }
}

// ========== 变更提案状态与方法 ==========
/**
 * 变更提案的本地状态，用于让用户选择是否应用"更新/归档"。
 * 默认策略：仅新增（applyAdditions=true）。
 */
const proposal = ref({
  visible: false,
  loading: false,
  sourceTasks: [],
  milestones: [],
  schedule: '',
  diff: { additions: [], updates: [], removals: [] },
  options: { applyAdditions: true, applyUpdates: false, archiveRemovals: false },
  autoMode: false,
  page: 1,
  pageSize: 10,
  pagedAdditions: []
})

const closeProposal = () => {
  // 若是自动模式，认为用户主动忽略，写入24h抑制
  if (proposal.value.autoMode && currentProjectId.value) {
    markAutoCreateDismissed(String(currentProjectId.value))
  }
  proposal.value.visible = false
}

const applyProposal = async () => {
  try {
    proposal.value.loading = true
    const opts = proposal.value.options
    
    // 保存新增任务到后端
    if (opts.applyAdditions && proposal.value.diff.additions.length > 0) {
      const projectId = Number(currentProjectId.value)
      if (!projectId) {
        message.warning('请选择项目后再执行操作')
        return
      }
      
      try {
        const templateConfig ="{\"title\":\"默认模板\",\"sections\":[{\"title\":\"发现结论\",\"required\":true},{\"title\":\"详细描述\",\"required\":false},{\"title\":\"发现来源\",\"required\":false},{\"title\":\" 下一步计划\",\"required\":true},{\"title\":\" 遇到的困难\",\"required\":false}],\"requireAttachment\":true,\"templateId\":2}"
        const createList = proposal.value.diff.additions.map(t => ({ ...t, projectId, templateConfig }))
        const results = await Promise.allSettled(createList.map(t => createTask(transformTaskToBackend(t))))
        const successCount = results.filter(r => r.status === 'fulfilled').length
        
        if (successCount > 0) {
          message.success(`已成功保存 ${successCount} 个新任务到数据库`)
          // 重新从后端加载任务，确保获取到最新数据
          await loadTasksFromBackend(projectId)
        } else {
          message.warning('保存任务到数据库失败')
        }
      } catch (err) {
        console.error('保存任务到数据库失败:', err)
        message.error('保存任务到数据库失败，但已添加到本地')
      }
    }
    
    // 应用变更到前端状态
    planning.mergeBaseline(proposal.value.sourceTasks, { ...opts, useNameDedup: true })
    
    // 里程碑：仅在草稿为空时初始化，避免覆盖
    if (Array.isArray(proposal.value.milestones) && proposal.value.milestones.length > 0) {
      if (!planning.draftPlan?.milestones || planning.draftPlan.milestones.length === 0) {
        planning.draftPlan = {
          totalDuration: proposal.value.schedule || '',
          milestones: proposal.value.milestones.map(m => ({ name:m.name, plannedDate:m.plannedDate, criteria:m.criteria }))
        }
      }
    }
    
    message.success('已应用变更：新增/更新/归档按选择生效，您的编辑与分配已保留')
    proposal.value.visible = false
  } catch (err) {
    console.error(err)
    message.error('应用变更失败')
  } finally {
    proposal.value.loading = false
  }
}

// ========== 任务编辑：打开/保存 ==========
const edit = ref({ visible: false, target: null, form: { name: '', description: '', primaryMilestoneId: '', priority: undefined, startDate: '', endDate: '', dueDate: '' }, attachFiles: [], reportTemplateId: '', reportTemplate: { title: '', requireAttachment: false, sections: [] } })
// 富文本编辑器
const rteRef = ref(null)
const rteCmd = (cmd) => document.execCommand(cmd, false)
const rteClear = () => document.execCommand('removeFormat', false)
const syncRte = () => { if (rteRef.value) edit.value.form.description = rteRef.value.innerHTML }
const phaseInputRef = ref(null)

// 附件上传功能
const beforeAttachUpload = async (file) => {
  try {
    // 显示上传中提示
    message.loading({ content: '正在上传文件...', key: 'fileUpload' })
    
    // 调用上传API，直接传递File对象和可选的目录参数
    const response = await uploadTechnologicalFile(file, 'technological_task')
    console.log('上传响应:', response)
    // 上传成功处理
    // 根据实际响应格式判断是否成功
    const isSuccess = response && (response.code === 200 || response.fileUrl || response.data?.fileUrl || response.data?.url);
    
    if (isSuccess) {
      // 根据实际响应结构获取文件数据
      const fileData = response.data || response;
      const url = URL.createObjectURL(file) // 本地预览URL
      
      // 创建新的附件对象
      const newAttachment = {
        uid: file.uid || Date.now(), // 确保有唯一ID
        name: file.name,
        size: file.size,
        type: file.type,
        url: url, // 本地预览URL
        fileUrl: fileData.fileUrl || fileData.url || '', // 服务器文件URL
        fileSuffix: fileData.path ? fileData.path.split('.').pop() : file.name.split('.').pop(), // 文件后缀
        sort: edit.value.attachFiles.length // 排序
      };
      
      // 添加到附件列表
      edit.value.attachFiles.push(newAttachment);
      
      // 调试日志
      console.log('文件上传成功，附件列表更新:', edit.value.attachFiles);
      console.log('新添加的附件:', newAttachment);
      
      message.success({ content: '文件上传成功', key: 'fileUpload' })
      return false // 阻止默认上传行为
    } else {
      // 上传失败
      const errorMsg = response?.msg || response?.message || response?.error || '未知错误';
      message.error({ content: '文件上传失败: ' + errorMsg, key: 'fileUpload' })
      return false // 阻止默认上传行为
    }
  } catch (error) {
    console.error('文件上传异常:', error)
    message.error({ content: '文件上传异常: ' + error.message, key: 'fileUpload' })
    return false // 阻止默认上传行为
  }
}
const onAttachRemove = (file) => {
  const idx = edit.value.attachFiles.findIndex(f => f.uid === file.uid)
  if (idx >= 0) {
    try { 
      // 释放本地URL对象
      URL.revokeObjectURL(edit.value.attachFiles[idx].url) 
    } catch {}
    // 从附件列表中移除
    edit.value.attachFiles.splice(idx, 1)
  }
}

// 提报模板编辑
const addTplSection = () => { edit.value.reportTemplate.sections.push({ title: '', required: false }) }
const removeTplSection = (idx) => { if (idx>=0) edit.value.reportTemplate.sections.splice(idx,1) }
const newMs = ref({ name: '', date: '' })
const createMs = () => {
  if (!newMs.value.name) return message.warning('请输入里程碑名称')
  // 名称唯一校验
  const norm = (s) => (s || '').trim().toLowerCase()
  if ((planning.milestones || []).some(m => norm(m.name) === norm(newMs.value.name))) {
    message.warning('同名里程碑已存在，禁止重复创建')
    return
  }
  // 改为后端创建
  const payload = { 
    projectId: Number(currentProjectId.value), 
    taskId: Number(edit.value.target?.id), 
    milestoneName: newMs.value.name, 
    plannedDate: newMs.value.date,
    creator: userInfo.userInfo?.nickname || '',

  }
  createMilestone(payload).then(async () => {
    message.success('已新增里程碑并选中')
    await refreshMilestones()
    const just = (planning.milestones || []).find(m => m.name === newMs.value.name && m.plannedDate === newMs.value.date)
    if (just) edit.value.form.primaryMilestoneId = just.id
    newMs.value = { name: '', date: '' }
  }).catch(() => { message.error('新增里程碑失败') })
}

const msSelectRef = ref()
const confirmRemoveMs = (id) => {
  Modal.confirm({
    title: `确认删除里程碑`,
    onOk: async () => {
      try {
        await deleteMilestone(Number(id))
        if (edit.value.form.primaryMilestoneId === id) edit.value.form.primaryMilestoneId = ''
        message.success('已删除里程碑')
        await refreshMilestones()
      } catch { message.error('删除里程碑失败') }
      try { msSelectRef.value?.blur?.() } catch {}
    }
  })
}

const openEdit = async (task) => {
  edit.value.visible = true
  edit.value.target = task
  
  // 确保附件列表初始化为空数组
  edit.value.attachFiles = [];
  
  // 进入时拉取后端详情回填
  try {
    const idNum = Number(task?.id)
    if (Number.isFinite(idNum)) {
      const res = await getTask(idNum)
      console.log('getTask API原始响应:', res);
      
      const dataAny = res?.data ?? res
      console.log('处理后的数据:', dataAny);
      
      // 检查后端返回的数据中是否包含附件信息
      if (dataAny && dataAny.taskFilesDOList) {
        console.log('后端返回的taskFilesDOList:', dataAny.taskFilesDOList);
      } else {
        console.log('后端返回的数据中没有taskFilesDOList字段');
      }
      
      const latest = dataAny ? transformTaskFromBackend(dataAny) : task
      console.log('转换后的任务对象:', latest);
      
      edit.value.form = { 
        name: latest.name, 
        description: latest.description || '', 
        primaryMilestoneId: latest.primaryMilestoneId, 
        priority: latest.priority, 
        startDate: latest.startDate || '', 
        endDate: latest.endDate || '', 
        dueDate: latest.dueDate || '' 
      }
      
      // 从后端返回的数据中加载附件信息
      console.log('从后端获取的任务详情:', latest);
      
      // 优先从taskFilesDOList加载附件信息
      if (latest.taskFilesDOList && Array.isArray(latest.taskFilesDOList) && latest.taskFilesDOList.length > 0) {
        edit.value.attachFiles = latest.taskFilesDOList.map((file, index) => ({
          uid: file.uid || `file-${index}-${Date.now()}`,
          name: file.fileName || file.name || '',
          size: file.fileSize || file.size || 0,
          type: file.type || 'application/octet-stream',
          url: file.fileUrl || '', // 直接使用服务器URL作为预览URL
          fileUrl: file.fileUrl || '',
          fileSuffix: file.fileSuffix || (file.fileName || '').split('.').pop() || '',
          sort: file.sort || index
        }));
        console.log('从taskFilesDOList加载附件:', edit.value.attachFiles.length, '个文件');
      }
      // 其次从attachFiles加载附件信息
      else if (latest.attachFiles && Array.isArray(latest.attachFiles) && latest.attachFiles.length > 0) {
        edit.value.attachFiles = latest.attachFiles.map((file, index) => ({
          uid: file.uid || `file-${index}-${Date.now()}`,
          name: file.fileName || file.name || '',
          size: file.fileSize || file.size || 0,
          type: file.type || 'application/octet-stream',
          url: file.fileUrl || file.url || '',
          fileUrl: file.fileUrl || '',
          fileSuffix: file.fileSuffix || (file.name || '').split('.').pop() || '',
          sort: file.sort || index
        }));
        console.log('从attachFiles加载附件:', edit.value.attachFiles.length, '个文件');
      }
    } else {
      // 非持久化任务：跳过后端请求，直接使用现有数据
      edit.value.form = { 
        name: task.name, 
        description: task.description || '', 
        primaryMilestoneId: task.primaryMilestoneId, 
        priority: task.priority, 
        startDate: task.startDate || '', 
        endDate: task.endDate || '', 
        dueDate: task.dueDate || '' 
      }
      
      // 从本地任务数据中加载附件信息
      if (task.attachFiles && Array.isArray(task.attachFiles) && task.attachFiles.length > 0) {
        edit.value.attachFiles = task.attachFiles.map((file, index) => ({
          uid: file.uid || `file-${index}-${Date.now()}`,
          name: file.fileName || file.name || '',
          size: file.fileSize || file.size || 0,
          type: file.type || 'application/octet-stream',
          url: file.fileUrl || file.url || '',
          fileUrl: file.fileUrl || '',
          fileSuffix: file.fileSuffix || (file.name || '').split('.').pop() || '',
          sort: file.sort || index
        }));
        console.log('从本地任务数据加载附件:', edit.value.attachFiles.length, '个文件');
      }
      
      // 从本地taskFilesDOList中加载附件信息
      if (task.taskFilesDOList && Array.isArray(task.taskFilesDOList) && task.taskFilesDOList.length > 0) {
        const filesFromTaskFiles = task.taskFilesDOList.map((file, index) => ({
          uid: file.uid || `file-${index}-${Date.now()}`,
          name: file.fileName || file.name || '',
          size: file.fileSize || file.size || 0,
          type: file.type || 'application/octet-stream',
          url: file.fileUrl || '',
          fileSuffix: file.fileSuffix || (file.fileName || '').split('.').pop() || '',
          sort: file.sort || index
        }));
        
        // 合并附件列表，避免重复
        filesFromTaskFiles.forEach(file => {
          if (!edit.value.attachFiles.some(existingFile => existingFile.fileUrl === file.fileUrl)) {
            edit.value.attachFiles.push(file);
          }
        });
        console.log('从本地taskFilesDOList加载附件:', filesFromTaskFiles.length, '个文件');
      }
    }
  } catch (error) {
    console.error('加载任务详情失败:', error);
    edit.value.form = { 
      name: task.name, 
      description: task.description || '', 
      primaryMilestoneId: task.primaryMilestoneId, 
      priority: task.priority, 
      startDate: task.startDate || '', 
      endDate: task.endDate || '', 
      dueDate: task.dueDate || '' 
    }
    
    // 从本地任务数据中加载附件信息（作为后备方案）
    if (task.attachFiles && Array.isArray(task.attachFiles) && task.attachFiles.length > 0) {
      edit.value.attachFiles = task.attachFiles.map((file, index) => ({
        uid: file.uid || `file-${index}-${Date.now()}`,
        name: file.fileName || file.name || '',
        size: file.fileSize || file.size || 0,
        type: file.type || 'application/octet-stream',
        url: file.fileUrl || file.url || '',
        fileUrl: file.fileUrl || '',
        fileSuffix: file.fileSuffix || (file.name || '').split('.').pop() || '',
        sort: file.sort || index
      }));
      console.log('从本地任务数据加载附件(后备方案):', edit.value.attachFiles.length, '个文件');
    }
  }
  
  // 调试日志
  console.log('打开任务编辑，最终附件列表:', edit.value.attachFiles);
  
  // 模板优先展示任务绑定的模板，否则展示默认模板
  const boundTpl = task.reportTemplate || planning.getDefaultReportTemplate() || { title: '', requireAttachment: false, sections: [] }
  edit.value.reportTemplateId = planning.getReportTemplateById(boundTpl.id) ? boundTpl.id : (planning.getDefaultReportTemplate()?.id || '')
  edit.value.reportTemplate = JSON.parse(JSON.stringify(boundTpl))
  // 将富文本内容写入编辑器
  setTimeout(() => { if (rteRef.value) rteRef.value.innerHTML = edit.value.form.description || '' }, 0)
}

const saveEdit = async () => {
  const t = edit.value.target
  if (!t) {
    // 新增 → 直接落库到后端
    // 确保附件列表不为空且格式正确
    const taskFiles = edit.value.attachFiles && edit.value.attachFiles.length > 0 
      ? edit.value.attachFiles.map(file => ({
          fileName: file.name,
          fileUrl: file.fileUrl || '',
          fileSize: file.size,
          fileSuffix: file.fileSuffix || file.name.split('.').pop(),
          sort: file.sort || 0
        }))
      : [];
      
    const newTask = {
      name: edit.value.form.name,
      description: edit.value.form.description,
      priority: edit.value.form.priority,
      startDate: edit.value.form.startDate,
      endDate: edit.value.form.endDate,
      dueDate: edit.value.form.dueDate,
      primaryMilestoneId: edit.value.form.primaryMilestoneId,
      // 添加附件信息
      taskFilesDOList: taskFiles
    }
    
    console.log('保存新任务，附件列表:', taskFiles);
    const ok = await saveTaskToBackend({ ...newTask, projectId: currentProjectId.value })
    edit.value.visible = false
    if (ok) {
      await loadTasksFromBackend(currentProjectId.value)
      message.success('已创建任务并与后端同步')
    }
    return
  }
  // 编辑：保存用户覆写（保护字段）并提交后端
  const sk = t.stableKey || ''
  planning.saveUserEdit(sk, { ...edit.value.form, attachFiles: edit.value.attachFiles, reportTemplate: edit.value.reportTemplate })

  // 后端同步
  const idNum2 = Number(t.id)
  
  // 确保附件列表不为空且格式正确
  const taskFiles = edit.value.attachFiles && edit.value.attachFiles.length > 0 
    ? edit.value.attachFiles.map(file => ({
        fileName: file.name,
        fileUrl: file.fileUrl || '',
        fileSize: file.size,
        fileSuffix: file.fileSuffix || file.name.split('.').pop(),
        sort: file.sort || 0
      }))
    : [];
    
  const payload = {
    ...(Number.isFinite(idNum2) ? { id: idNum2 } : {}),
    projectId: currentProjectId.value,
    name: edit.value.form.name,
    description: edit.value.form.description,
    priority: edit.value.form.priority,
    startDate: edit.value.form.startDate,
    endDate: edit.value.form.endDate,
    dueDate: edit.value.form.dueDate,
    primaryMilestoneId: edit.value.form.primaryMilestoneId,
    // 添加附件信息
    taskFilesDOList: taskFiles
  }
  
  console.log('更新任务，附件列表:', taskFiles);
  await saveTaskToBackend(payload)

  // 从后端重新加载任务数据以确保数据一致性
  await loadTasksFromBackend(currentProjectId.value)

  // 关键修复：强制触发UI更新
  setTimeout(() => {
    const currentBaseline = planning.baseline
    if (currentBaseline && currentBaseline.tasks) {
      currentBaseline.tasks = [...currentBaseline.tasks]
    }
    planning.saveToLocal()
  }, 0)

  edit.value.visible = false
  message.success('已保存任务编辑（已同步后端）')
}

// ========== 归档区动作 ==========
const restore = (task) => {
  const sk = task.stableKey || ''
  planning.restoreTask(sk)
  message.success('已恢复任务')
}

// ========== 拖拽分配（简化实现） ==========
const draggingTask = ref(null)
// 稳定快照，避免 dragend 与 drop 触发顺序导致的空引用
const dragSnapshot = ref({ id: '', name: '' })
const dropHighlight = ref(null)

const onDragStart = (task) => {
  draggingTask.value = task
  dragSnapshot.value = { id: String(task?.id || ''), name: String(task?.name || '') }
}
const onDragEnd = () => { /* 清理推迟到 drop 后 */ }
const enterDrop = (memberId) => { dropHighlight.value = memberId }
const leaveDrop = (memberId) => { if (dropHighlight.value === memberId) dropHighlight.value = null }
const onDropToMember = async (memberId) => {
  const taskId = dragSnapshot.value.id || draggingTask.value?.id
  const taskName = dragSnapshot.value.name || draggingTask.value?.name
  if (!taskId) { message.error('未捕获到拖拽任务'); return }
  // 已分配则提示阻止
  const existedAssignee = planning.getTaskAssignee && planning.getTaskAssignee(taskId)
  if (existedAssignee && String(existedAssignee) !== String(memberId)) {
    const currentName = assigneeName(taskId) || existedAssignee
    message.warning(`此任务已分配给 ${currentName}。请先取消分配或选择其他任务。`)
    dropHighlight.value = null
    draggingTask.value = null
    dragSnapshot.value = { id: '', name: '' }
    return
  }
  const success = planning.assignTaskToMember(taskId, memberId)
  const memberName = (membersStore.activeMembers || []).find(m => m.id === memberId)?.name || memberId
  if (success) {
    message.success(`✅ 已将"${taskName}"拖拽分配给 ${memberName}`, 3)
    addAssignmentFeedback(taskId)
    // 分配后持久化到后端（任务 + 分配表）
    await persistAssignmentToBackend(taskId, memberId)
    // 分配表幂等：已存在则更新，否则创建
    try {
      const existed = await getTaskAssignmentsByTask(Number(taskId))
      const raw = existed?.data ?? existed
      const first = Array.isArray(raw?.list) ? raw.list[0]
        : Array.isArray(raw?.records) ? raw.records[0]
        : Array.isArray(raw?.items) ? raw.items[0]
        : (raw?.data || raw)
      if (first && first.id) {
        // 若负责人相同，直接视为成功；不同则更新
        if (String(first.assigneeMemberId) !== String(memberId)) {
          await updateTaskAssignment({ id: Number(first.id), projectId: Number(currentProjectId.value), taskId: Number(taskId), assigneeMemberId: Number(memberId), assigneeName: memberName })
        }
      } else {
        await createTaskAssignment({ projectId: Number(currentProjectId.value), taskId: Number(taskId), assigneeMemberId: Number(memberId), assigneeName: memberName })
      }
    } catch (err) {
      console.error('❌ 分配表upsert失败:', err)
      try { planning.unassignTask(taskId) } catch {}
      message.error('分配保存失败（分配表），已回滚')
      dropHighlight.value = null
      draggingTask.value = null
      dragSnapshot.value = { id: '', name: '' }
      return
    }
    // 自动展开该成员任务列表并持久化本地
    try { expandedMembers.value.add(memberId) } catch {}
    try { planning.saveToLocal() } catch {}
    // 分配表已创建，无需重复创建
  } else {
    message.error('拖拽分配失败，请重试')
  }
  dropHighlight.value = null
  draggingTask.value = null
  dragSnapshot.value = { id: '', name: '' }
}

// 成员内排序：记录源任务与目标任务
const dragState = ref({ memberId: null, taskId: null })
const onDragStartTaskInMember = (memberId, taskId) => { dragState.value = { memberId, taskId } }
const onDragOverTaskInMember = (memberId, taskId) => { /* 仅用于允许放置 */ }
const onDropReorder = (memberId, targetTaskId) => {
  const { memberId: srcMemberId, taskId } = dragState.value || {}
  if (!taskId || srcMemberId !== memberId) return
  const ok = planning.reorderWithinMember(memberId, taskId, targetTaskId)
  if (ok) message.success('已调整顺序')
}

// 新增与归档
const openAddTask = () => {
  edit.value.visible = true
  edit.value.target = null
  edit.value.form = { name: '', description: '', primaryMilestoneId: '', priority: undefined, startDate: '', endDate: '', dueDate: ''}
  // 确保附件列表初始化为空数组
  edit.value.attachFiles = []
  
  // 调试日志
  console.log('打开新增任务，附件列表初始化:', edit.value.attachFiles);
  
  // 默认带出默认模板
  const tpl = planning.getDefaultReportTemplate() || { title: '', requireAttachment: false, sections: [] }
  edit.value.reportTemplateId = tpl.id || ''
  edit.value.reportTemplate = JSON.parse(JSON.stringify(tpl))
  setTimeout(() => { if (rteRef.value) rteRef.value.innerHTML = '' }, 0)
}

const onPickTpl = (id) => {
  const tpl = planning.getReportTemplateById(id)
  if (!tpl) return
  edit.value.reportTemplate = JSON.parse(JSON.stringify(tpl))
}

// 模板管理逻辑
const tplMgr = ref({ visible: false })
const openTplMgr = () => { tplMgr.value.visible = true }
const goReportTemplateMaintenance = () => {
  try {
    router.push({ path: '/th-qd-maintenance/report-templates' })
  } catch (e) {
    console.error('跳转提报模板维护失败', e)
  }
}
const addNewTpl = () => {
  const id = `tpl-${Date.now()}`
  planning.upsertReportTemplate({ id, name: `新模板-${id.slice(-4)}`, requireAttachment: false, sections: [ { title: '内容', required: true } ] })
}
const setAsDefault = (id) => { planning.setDefaultReportTemplate(id); message.success('已设为默认模板') }
const removeTpl = (id) => { planning.removeReportTemplate(id); message.success('已删除模板') }
const editTpl = (item) => {
  Modal.confirm({
    title: '编辑模板名称',
    content: `当前：${item.name}`,
    onOk: () => {
      const name = prompt('新的模板名称', item.name)
      if (!name) return
      planning.upsertReportTemplate({ ...item, name })
      message.success('已更新模板名称')
    }
  })
}
// 归档相关代码已移除

// 字段保护相关代码已移除

// 删除操作直接调用 confirmDelete，不再需要 onMoreMenuClick



// 删除任务（带二次确认和软删除逻辑）
const confirmDelete = (task) => {
  // 检查任务是否已分配
  const isAssigned = planning.assignments && planning.assignments.some(a => a.taskId === task.id)
  
  // 模拟检查任务是否有进展报告（实际应该从后端API获取）
  const hasProgress = task.hasProgress || Math.random() > 0.7 // 模拟30%的任务有进展
  
  if (isAssigned && hasProgress) {
    // 有进展的已分配任务：软删除
    Modal.confirm({
      title: '确认删除此任务？',
      content: h('div', [
        h('p', { style: 'color: #faad14; margin-bottom: 12px;' }, '⚠️ 此任务已分配且有进展记录'),
        h('p', { style: 'margin-bottom: 8px;' }, '删除后将会：'),
        h('ul', { style: 'margin-left: 20px; color: #666;' }, [
          h('li', '从任务计划列表中移除'),
          h('li', '在进展监控页面保持可见'),
          h('li', '数据用于工作量统计'),
          h('li', '任务执行记录将被保留')
        ]),
        h('p', { style: 'color: #d4380d; margin-top: 12px;' }, '确认要执行软删除操作吗？')
      ]),
      okText: '确认软删除',
      cancelText: '取消',
      okType: 'warning',
      width: 480,
      onOk: async () => {
        // 软删除场景：先调用后端删除，再本地刷新
        const ok = await deleteTaskFromBackend(task.id)
        if (ok) {
          await loadTasksFromBackend(currentProjectId.value)
          message.success('任务已删除（后端）')
        }
      }
    })
  } else if (isAssigned) {
    // 已分配但无进展的任务：二次确认
    Modal.confirm({
      title: '确认删除已分配的任务？',
      content: h('div', [
        h('p', { style: 'color: #faad14; margin-bottom: 12px;' }, '⚠️ 此任务已分配给团队成员但无进展记录'),
        h('p', { style: 'margin-bottom: 8px;' }, '删除后将会：'),
        h('ul', { style: 'margin-left: 20px; color: #666;' }, [
          h('li', '从任务计划列表中移除'),
          h('li', '完全移除任务和分配关系'),
          h('li', '团队成员将无法查看此任务'),
          h('li', '相关数据将永久删除')
        ]),
        h('p', { style: 'color: #d4380d; margin-top: 12px;' }, '确认要永久删除此任务吗？')
      ]),
      okText: '确认永久删除',
      cancelText: '取消',
      okType: 'danger',
      width: 480,
      onOk: async () => {
        const ok = await deleteTaskFromBackend(task.id)
        if (ok) {
          await loadTasksFromBackend(currentProjectId.value)
          message.success('任务已删除（后端）')
        }
      }
    })
  } else {
    // 未分配任务：简单确认
    Modal.confirm({
      title: '确认删除未分配的任务？',
      content: h('div', [
        h('p', { style: 'color: #1890ff; margin-bottom: 12px;' }, 'ℹ️ 此任务尚未分配给任何团队成员'),
        h('p', { style: 'margin-bottom: 8px;' }, '删除后将会：'),
        h('ul', { style: 'margin-left: 20px; color: #666;' }, [
          h('li', '从任务计划列表中移除'),
          h('li', '任务数据将被彻底清除'),
          h('li', '不会影响其他任务或团队成员')
        ]),
        h('p', { style: 'color: #d4380d; margin-top: 12px;' }, '确认要删除此未分配任务吗？')
      ]),
      okText: '确认删除',
      cancelText: '取消',
      okType: 'primary',
      width: 480,
      onOk: async () => {
        const ok = await deleteTaskFromBackend(task.id)
        if (ok) {
          await loadTasksFromBackend(currentProjectId.value)
          message.success('任务已删除（后端）')
        }
      }
    })
  }
}

// 快照相关代码已移除

// 页面初始化：尝试加载本地草稿
const tryAutoImportFromAnalysis = () => {
  try {
    const rawDoubao = localStorage.getItem('doubaoAnalysisResults')
    const rawAnalysis = localStorage.getItem('analysisData')
    if (!rawDoubao && !rawAnalysis) return false
    const doubao = rawDoubao ? JSON.parse(rawDoubao) : null
    const analysis = rawAnalysis ? JSON.parse(rawAnalysis) : null
    const { tasks, milestones } = generateFromAnalysis(doubao, analysis)
    if (!Array.isArray(tasks) || tasks.length === 0) return false
    const diff = planning.previewMerge(tasks)
    if (diff.additions.length + diff.updates.length + diff.removals.length === 0) return false
    planning.mergeBaseline(tasks, { applyAdditions: true, applyUpdates: false, archiveRemovals: false, useNameDedup: true })
    if (Array.isArray(milestones) && milestones.length > 0) {
      if (!planning.draftPlan?.milestones || planning.draftPlan.milestones.length === 0) {
        planning.draftPlan = { totalDuration: analysis?.schedule || '', milestones: milestones.map(m => ({ name:m.name, plannedDate:m.plannedDate, criteria:m.criteria })) }
      }
    }
    message.success('已从解析结果自动生成任务（默认仅新增）')
    return true
  } catch (e) {
    console.warn('自动导入解析结果失败', e)
    return false
  }
}

// 自动导入 props 传递的建议任务
// 记录已导入的任务，避免重复导入
const importedTaskIds = ref(new Set())

const autoImportFromProps = () => {
  // console.log('📋 检查 props 传递的建议任务:', props.extractedTasks)
  
  if (!props.extractedTasks || 
      (!props.extractedTasks.implementation?.length && 
       !props.extractedTasks.technical?.length && 
       !props.extractedTasks.milestones?.length)) {
    // console.log('⚠️ Props 中无有效任务数据')
    return false
  }
  
  const tasks = [
    ...(props.extractedTasks.implementation || []),
    ...(props.extractedTasks.technical || [])
  ]
  
  // 获取当前已存在的任务ID集合
  const existingTaskIds = new Set(planning.tasks.map(t => t.id))
  
  // 筛选出尚未导入的新任务
  const newTasks = tasks.filter(task => {
    return !existingTaskIds.has(task.id) && !importedTaskIds.value.has(task.id)
  })
  
  if (newTasks.length === 0) {
    console.log('✅ 所有任务已导入，跳过重复导入')
    return true
  }
  
  // console.log(`🔄 开始导入 ${newTasks.length} 个新任务（跳过 ${tasks.length - newTasks.length} 个已存在任务）`)
  
  // 导入新任务
  newTasks.forEach(task => {
    planning.addTask({
      id: task.id,
      name: task.name,
      description: task.description || '',
      priority: task.priority || 'medium',
      duration: task.duration,
      deliverables: task.deliverables,
      difficulty: task.difficulty,
      keyTechnologies: task.keyTechnologies || [],
      origin: { type: 'verbatim' },
      primaryMilestoneId: task.primaryMilestoneId
    })
    
    // 记录已导入的任务ID
    importedTaskIds.value.add(task.id)
  })
  
  // 导入里程碑
  const milestones = props.extractedTasks.milestones || []
  milestones.forEach(milestone => {
    planning.addMilestone({
      id: milestone.id,
      name: milestone.name,
      description: milestone.description || '',
      plannedDate: milestone.plannedDate,
      status: 'pending',
      criteria: milestone.criteria || []
    })
  })
  
  console.log(`✅ 成功导入 ${newTasks.length} 个新任务`)
  
  if (newTasks.length > 0) {
    message.success(`已导入 ${newTasks.length} 个新任务${milestones.length > 0 ? ` 和 ${milestones.length} 个里程碑` : ''}`)
  }
  return true
}

// 避免首次空白：当无 props/localStorage 时，仅自动尝试一次从后端读取解析结果
const attemptedBackendAuto = ref(false)

// 一键落库防重复：同一项目仅提示/执行一次
const attemptedFormalAutoCreate = ref(false)

// 自动检测并确认一键落库（仅在正式任务为0时触发）
const detectAndOfferAutoCreate = async (projectId) => {
  try {
    if (!projectId || attemptedFormalAutoCreate.value) return
    if (!canAutoImport.value) return
    const pid = String(projectId)
    if (isAutoCreateDone(pid) || isAutoCreateDismissed(pid)) return
    // 查正式任务
    const pageRes = await getTaskPage({ projectId: Number(projectId), pageNo: 1, pageSize: 1 })
    const total = Number(pageRes?.data?.total ?? pageRes?.total ?? 0)
    if (total > 0) return

    // 读取解析记录
    isFetchingAnalysis.value = true
    const backendData = await loadAnalysisFromBackend(Number(projectId))
    const hasAny = backendData && (backendData.technicalRoute || backendData.implementation)
    if (!hasAny) return

    // 适配 generateFromAnalysis 入参
    const doubao = {
      technicalRoute: backendData.technicalRoute || null,
      implementation: backendData.implementation
        ? (backendData.implementation.implementationPlan ? backendData.implementation : { implementationPlan: backendData.implementation })
        : null
    }
    const analysis = {
      technicalRoute: backendData.technicalRoute || null,
      implementationPlan: backendData.implementation?.implementationPlan ? backendData.implementation.implementationPlan : backendData.implementation || null,
      schedule: backendData?.implementation?.implementationPlan?.totalDuration || ''
    }

    const { tasks } = generateFromAnalysis(doubao, analysis)
    const diff = planning.previewMerge(tasks)
    if (!diff || !Array.isArray(diff.additions) || diff.additions.length === 0) return

    attemptedFormalAutoCreate.value = true
    // 打开统一弹窗（自动模式）
    proposal.value.visible = true
    proposal.value.loading = false
    proposal.value.sourceTasks = tasks
    proposal.value.milestones = []
    proposal.value.schedule = analysis?.schedule || ''
    proposal.value.diff = diff
    proposal.value.options = { applyAdditions: true, applyUpdates: false, archiveRemovals: false }
    proposal.value.autoMode = true
    proposal.value.page = 1
    proposal.value.pageSize = 10
    // 在关闭时标记dismiss，防止本次刷新后再次弹出
    const origClose = closeProposal
    // 注意：不覆盖函数引用，只在关闭时写入标记
  } catch (e) {
    console.warn('自动检测一键落库失败/已跳过：', e)
  } finally {
    isFetchingAnalysis.value = false
  }
}

// ========== 项目选择相关方法 ==========

/**
 * 获取项目列表
 */
const fetchProjectList = async (searchKeyword = '') => {
  try {
    projectsLoading.value = true
    const params = {
      pageNo: 1,
      pageSize: 50,
      projectName: searchKeyword,
      applicant: useUserStore().getUser.nickname,
      status: 8 // 只获取立项通过的项目 (PROJECT_APPROVED = 8)
    }
    
    console.log('🔍 获取项目列表:', params)
    const response = await fetchProjects(params)
    
    const projects = response?.data?.list || response?.list || []
    availableProjects.value = projects.map(project => ({
      id: project.id,
      projectName: project.projectName || project.name,
      projectStatus: project.projectStatus || project.status,
      projectLeader: project.projectLeader || project.leader,
      createTime: project.createTime
    }))
    
    apiLog({ 
      action: '获取项目列表', 
      api: 'fetchProjects', 
      method: 'GET', 
      url: '/technologicalproject/technological-project/page',
      params 
    }, { count: availableProjects.value.length })
    
    console.log(`✅ 成功获取 ${availableProjects.value.length} 个项目`)
    
  } catch (error) {
    console.error('❌ 获取项目列表失败:', error)
    message.error('获取项目列表失败，请重试')
    availableProjects.value = []
  } finally {
    projectsLoading.value = false
  }
}

/**
 * 获取项目详细信息
 */
const fetchProjectDetail = async (projectId) => {
  if (!projectId) return null
  
  try {
    console.log('🔍 获取项目详情:', projectId)
    const response = await fetchProjectInfo(projectId)
    
    const project = response?.data || response
    if (project) {
      selectedProject.value = {
        id: project.id,
        projectName: project.projectName || project.name,
        projectStatus: project.projectStatus || project.status,
        projectLeader: project.projectLeader || project.leader,
        createTime: project.createTime
      }
      
      apiLog({ 
        action: '获取项目详情', 
        api: 'fetchProjectInfo', 
        method: 'GET', 
        url: '/technologicalproject/technological-project/get',
        params: { id: projectId } 
      }, selectedProject.value)
      
      console.log('✅ 项目详情获取成功:', selectedProject.value)
      return selectedProject.value
    }
  } catch (error) {
    console.error('❌ 获取项目详情失败:', error)
    message.error('获取项目详情失败')
    return null
  }
}

/**
 * 项目搜索
 */
const handleProjectSearch = async (searchValue) => {
  if (searchValue.trim()) {
    await fetchProjectList(searchValue.trim())
  } else {
    await fetchProjectList()
  }
}

/**
 * 项目选择变化处理
 */
const handleProjectSelect = async (projectId) => {
  if (!projectId) {
    currentProjectId.value = null
    selectedProject.value = null
    localStorage.removeItem(LAST_PROJECT_ID_KEY)
    // 清空任务数据
    planning.clearTasks()
    return
  }
  
  console.log('🔄 项目选择变化:', projectId)
  
  // 保存项目ID到localStorage
  localStorage.setItem(LAST_PROJECT_ID_KEY, String(projectId))
  
  // 获取项目详细信息
  await fetchProjectDetail(projectId)
  
  // 优化：优先加载"活跃成员"（已加入项目）用于人员面板；
  // 成员完整信息在后台按需加载，不阻塞首屏
  await membersStore.loadActiveMembers(String(projectId))
  membersStore.loadMembers(String(projectId)).catch(() => {})
  
  // 从后端加载任务数据
  await loadTasksFromBackend(projectId)
  await refreshMemberTaskCounts()
  
  message.success(`已切换到项目：${selectedProject.value?.projectName || projectId}`)
}

/**
 * 下拉框展开时加载项目列表
 */
const onProjectDropdownChange = async (open) => {
  if (open && availableProjects.value.length === 0) {
    await fetchProjectList()
  }
}

/**
 * 初始化项目选择
 */
const initializeProjectSelection = async () => {
  console.log('🚀 初始化项目选择...')
  
  // 优先检查路由参数
  const routeProjectId = route.query.projectId
  if (routeProjectId) {
    console.log('📍 从路由参数获取项目ID:', routeProjectId)
    const pidNum = Number(routeProjectId)
    const pid = Number.isNaN(pidNum) ? routeProjectId : pidNum
    currentProjectId.value = pid
    await handleProjectSelect(pid)
    return
  }
  
  // 其次检查localStorage
  const savedProjectId = localStorage.getItem(LAST_PROJECT_ID_KEY)
  if (savedProjectId && savedProjectId !== 'ALL_PROJECTS') {
    console.log('💾 从localStorage恢复项目ID:', savedProjectId)
    
    // 先加载项目列表，确保下拉选项可用
    await fetchProjectList()
    
    // 然后设置项目ID和获取详情
    const pidNum2 = Number(savedProjectId)
    const pid2 = Number.isNaN(pidNum2) ? savedProjectId : pidNum2
    currentProjectId.value = pid2
    await fetchProjectDetail(pid2)
    await membersStore.loadActiveMembers(String(pid2))
    membersStore.loadMembers(String(pid2)).catch(() => {})
    try { await loadReportTemplatesFromBackend() } catch {}
    await loadTasksFromBackend(pid2)
    await refreshMemberTaskCounts()
    
    console.log('✅ 项目选择已恢复')
  } else {
    console.log('📋 无保存的项目ID，等待用户选择')
    // 预加载项目列表供用户选择
    await fetchProjectList()
    // 自动选中第一个立项项目，避免空白与ID显示问题
    const first = Array.isArray(availableProjects.value) && availableProjects.value.length > 0 ? availableProjects.value[0] : null
    if (first) {
      currentProjectId.value = first.id
      await handleProjectSelect(first.id)
    }
  }
}

// ========== 任务数据管理方法 ==========

/**
 * 从后端加载任务数据
 */
const loadTasksFromBackend = async (projectId) => {
  if (!projectId) {
    console.warn('⚠️ 项目ID为空，跳过后端任务加载')
    return
  }
  
  try {
    console.log('🌐 开始从后端加载任务数据...', projectId)
    isLoadingTasks.value = true
    showEmptyBanner.value = false
    message.destroy('load-tasks')

    // 加载任务列表
    const taskParams = {
      projectId: Number(projectId),
      pageNo: 1,
      pageSize: 100 // 后端最大100
    }

    // 并行请求里程碑，先不阻塞任务渲染
    const milestoneParams = {
      projectId: Number(projectId),
      pageNo: 1,
      pageSize: 100
    }
    const msPromise = getMilestonePage(milestoneParams)

    const taskResponse = await getTaskPage(taskParams)
    const taskDataAny = taskResponse && taskResponse.data != null ? taskResponse.data : taskResponse
    const backendTasks = (taskDataAny?.list ?? taskDataAny?.records ?? taskDataAny?.items ?? [])
    const totalTasksFromRes = Number(taskDataAny?.total ?? taskResponse?.total ?? backendTasks?.length ?? 0)
    apiLog({
      action: '从后端加载任务数据',
      api: 'getTaskPage',
      method: 'GET',
      url: '/technological/task/page',
      params: taskParams,
      expect: 'total>0 直接渲染任务；total=0 则显示Banner并尝试自动检测一键落库'
    }, { total: totalTasksFromRes, list: backendTasks })

    console.log(`🔍 从后端获取到 ${backendTasks.length} 个任务`)

    // 转换后端数据格式为前端格式
    const frontendTasks = backendTasks.map(task => transformTaskFromBackend(task))

    // 标记后端是否已有任务，以阻止自动导入/自动检测
    hasBackendTasks.value = totalTasksFromRes > 0

    // 更新planning store
    console.log('🔍 准备更新planning store，任务数量:', frontendTasks.length)
    // 无论是否有任务，都更新planning store，确保切换项目时清空旧任务
    console.log('✅ 进入任务处理分支，开始写入baseline.tasks')
    // Pinia中未提供 setTasks，这里直接写入 baseline.tasks 并使用新数组以确保触发响应
    try {
      planning.baseline.tasks = Array.isArray(frontendTasks) ? [...frontendTasks] : []
      console.log('✅ baseline.tasks 写入成功，任务数量:', frontendTasks.length)
    } catch (e) {
      console.error('写入 baseline.tasks 失败:', e)
    }

    // 派生后端负责人 → 前端分配关系，用于人员面板显示与刷新持久
    console.log('🎯 即将进入派生分配关系代码块')
    try {
        console.log('🔍 开始派生分配关系，任务数量:', frontendTasks.length)
        console.log('🔍 前3个任务的负责人信息:', frontendTasks.slice(0, 3).map(t => ({
          id: t.id,
          name: t.name,
          assigneeMemberId: t.assigneeMemberId,
          assigneeName: t.assigneeName
        })))
        
        const derivedAssignments = []
        for (const t of frontendTasks) {
          if (t.assigneeMemberId) {
            // 确保ID类型一致：都转为字符串
            const assignment = { 
              taskId: String(t.id), 
              memberId: String(t.assigneeMemberId), 
              order: 0 
            }
            derivedAssignments.push(assignment)
            console.log(`✅ 派生分配: 任务${t.name}(${t.id}) → 成员${t.assigneeName}(${t.assigneeMemberId})`)
          }
        }
        
      // 无论是否有任务，都先清空分配关系，避免显示上一个项目的分配关系
      planning.assignments = []
      // 然后采用任务负责人字段派生
      if (frontendTasks.length > 0) {
        planning.assignments = derivedAssignments
      }
      // 若后端分页未返回负责人，尝试从分配表恢复（逐任务 get-by-task）
      if (derivedAssignments.length === 0 && Array.isArray(frontendTasks) && frontendTasks.length > 0) {
        console.log('🧩 负责人字段缺失，尝试从分配表恢复分配关系...')
        const results = await Promise.all(
          frontendTasks.map(async (t) => {
            try {
              const res = await getTaskAssignmentsByTask(Number(t.id))
              const raw = (res && res.data != null) ? res.data : res
              // 兼容数组与单对象
              const first = Array.isArray(raw?.list) ? raw.list[0]
                : Array.isArray(raw?.records) ? raw.records[0]
                : Array.isArray(raw?.items) ? raw.items[0]
                : (raw?.data || raw) // 单对象
              if (first && (first.assigneeMemberId != null)) {
                return { taskId: String(t.id), memberId: String(first.assigneeMemberId), order: 0 }
              }
            } catch (e) { /* ignore single task failure */ }
            return null
          })
        )
        const restored = results.filter(Boolean)
        if (restored.length > 0) {
          planning.assignments = restored
          console.log(`🧩 已从分配表恢复 ${restored.length} 条分配关系`, restored.slice(0,3))
        }
      }

      // 强制触发响应更新
      try { planning.assignments = [...planning.assignments] } catch {}
      console.log(`🔄 从任务负责人/分配表派生分配关系: ${planning.assignments.length} 条`, planning.assignments.slice(0, 3))
      apiLog({ action: '同步负责人为分配关系', api: 'LOCAL derive assignments', method: 'LOCAL', url: '/local/assignments/derive', params: { count: derivedAssignments.length } })
    } catch (e) { console.warn('同步分配关系失败/跳过：', e) }
    console.log(`✅ 已加载 ${frontendTasks.length} 个任务到前端`)
    try {
      apiLog({
        action: '渲染任务面板（数据就绪）',
        api: 'planning.setTasks → filteredTasks',
        method: 'LOCAL',
        url: '/local/render/tasks',
        params: {
          loadedCount: frontendTasks.length,
          activeFilter: activeFilter.value,
          keyword: taskKeyword.value
        },
        expect: 'filteredCount 应大于 0；否则是筛选条件导致列表为空'
      }, { filteredCount: (filteredTasks?.value || []).length })
    } catch {}

    // 里程碑异步完成后再写入，不阻塞任务显示
    try {
      const milestoneResponse = await msPromise
      const msDataAny = milestoneResponse && milestoneResponse.data != null ? milestoneResponse.data : milestoneResponse
      const backendMilestones = (msDataAny?.list ?? msDataAny?.records ?? msDataAny?.items ?? [])
      apiLog({
        action: '从后端加载里程碑',
        api: 'getMilestonePage',
        method: 'GET',
        url: '/technological/milestone/page',
        params: milestoneParams,
        expect: '里程碑用于统计与展示，不影响是否弹窗'
      }, { total: Number(msDataAny?.total ?? milestoneResponse?.total ?? backendMilestones?.length ?? 0), list: backendMilestones })
      const frontendMs = backendMilestones.map(milestone => transformMilestoneFromBackend(milestone))
      if (frontendMs.length > 0) {
        try { planning.milestones = [...frontendMs] } catch {}
        console.log(`✅ 已加载 ${frontendMs.length} 个里程碑到前端`)
      }
    } catch (e) {
      console.warn('里程碑加载失败/跳过：', e)
    }

    // 记录API调用
    apiLog({
      action: '从后端加载任务数据',
      api: 'getTaskPage',
      method: 'GET',
      url: '/technological/task/page',
      params: taskParams,
      expect: 'total>0 直接渲染任务；total=0 则显示Banner并尝试自动检测一键落库'
    }, taskResponse)

    if (!hasBackendTasks.value) {
      // 自动检测并提示一键落库，带抑制
      const pid = String(projectId)
      if (!isAutoCreateDone(pid) && !isAutoCreateDismissed(pid)) {
        await detectAndOfferAutoCreate(projectId)
      }
      // 若依然无任务，则显示顶部说明 banner
      showEmptyBanner.value = true
      // 允许从后端解析结果导入
      canAutoImport.value = true
    } else {
      message.success(`已从后端加载 ${frontendTasks.length} 个任务`)
      showEmptyBanner.value = false
      // 有任务时也允许导入，以便追加新任务
      canAutoImport.value = true
    }

  } catch (error) {
    console.error('❌ 从后端加载任务数据失败:', error)
    message.error('加载任务数据失败，请重试')
  } finally {
    isLoadingTasks.value = false
  }
}

/**
 * 保存任务到后端
 */
const saveTaskToBackend = async (taskData) => {
  if (!currentProjectId.value) {
    message.error('请先选择项目')
    return false
  }
  
  try {
    console.log('💾 保存任务到后端:', taskData)
    
    // 构造模板配置：优先使用编辑弹窗内的配置
    const tplId = edit.value?.reportTemplateId
    const tplCfgObj = {
      title: edit.value?.reportTemplate?.title || '',
      sections: Array.isArray(edit.value?.reportTemplate?.sections) ? edit.value.reportTemplate.sections : [],
      requireAttachment: !!(edit.value?.reportTemplate?.requireAttachment)
    }
    let templateIdForTask = tplId && String(tplId).trim() !== '' ? Number(tplId) : undefined
    let templateConfigStr

    // 保存模板库（若选择了模板ID则更新；否则创建）
    try {
      if (templateIdForTask) {
        const updatePayload = {
          id: Number(templateIdForTask),
          templateConfig: JSON.stringify(tplCfgObj)
        }
        const resp = await updateReportTemplate(updatePayload)
        apiLog({ action: '同步更新提报模板', api: 'updateReportTemplate', method: 'PUT', url: '/technological/template/update', params: updatePayload }, resp)
      } else {
        const createPayload = {
          templateCode: `TPL_${Date.now()}`,
          templateName: tplCfgObj.title || `任务模板_${Date.now()}`,
          templateConfig: JSON.stringify(tplCfgObj),
          requireAttachment: tplCfgObj.requireAttachment,
          templateType: 'task',
          projectId: Number(currentProjectId.value)
        }
        const resp = await createReportTemplate(createPayload)
        apiLog({ action: '创建提报模板', api: 'createReportTemplate', method: 'POST', url: '/technological/template/create', params: createPayload }, resp)
        const newId = (resp && resp.data != null) ? resp.data : resp
        if (typeof newId === 'number') {
          templateIdForTask = newId
          edit.value.reportTemplateId = newId
        }
      }
    } catch (tplErr) {
      console.warn('⚠️ 模板库同步失败，继续仅保存任务：', tplErr)
      message.warning('模板库保存失败，仅保存任务内容')
    }

    // 组装给任务的 templateConfig
    try {
      const payloadObj = { ...tplCfgObj }
      if (templateIdForTask) payloadObj.templateId = Number(templateIdForTask)
      templateConfigStr = JSON.stringify(payloadObj)
    } catch {}

    // 转换前端数据格式为后端格式
    console.log('保存任务到后端，附件列表:', taskData.taskFilesDOList);
    
    const backendData = transformTaskToBackend({
      ...taskData,
      projectId: currentProjectId.value,
      templateConfig: templateConfigStr,
      taskFilesDOList: taskData.taskFilesDOList
    })
    
    let response
    if (taskData.id) {
      // 更新现有任务
      response = await updateTask(backendData)
      console.log('✅ 任务更新成功')
    } else {
      // 创建新任务
      response = await createTask(backendData)
      console.log('✅ 任务创建成功')
    }
    
    // 记录API调用
    apiLog({ 
      action: taskData.id ? '更新任务' : '创建任务', 
      api: taskData.id ? 'updateTask' : 'createTask', 
      method: taskData.id ? 'PUT' : 'POST', 
      url: taskData.id ? '/technological/task/update' : '/technological/task/create',
      data: backendData 
    }, response)
    
    return true
    
  } catch (error) {
    console.error('❌ 保存任务到后端失败:', error)
    message.error('保存任务失败，请重试')
    return false
  }
}

/**
 * 删除任务从后端
 */
const deleteTaskFromBackend = async (taskId) => {
  if (!taskId) {
    message.error('任务ID不能为空')
    return false
  }
  
  try {
    console.log('🗑️ 从后端删除任务:', taskId)
    
    await deleteTask(Number(taskId))
    
    // 记录API调用
    apiLog({ 
      action: '删除任务', 
      api: 'deleteTask', 
      method: 'DELETE', 
      url: '/technological/task/delete',
      params: { id: taskId } 
    })
    
    console.log('✅ 任务删除成功')
    return true
    
  } catch (error) {
    console.error('❌ 从后端删除任务失败:', error)
    message.error('删除任务失败，请重试')
    return false
  }
}

// 处理数据导入的统一方法
const handleDataImport = () => {
  // console.log('🚀 TaskPlanning 数据导入检查...')
  
  // 优先检查 props 传递的建议任务
  const importedFromProps = autoImportFromProps()
  if (importedFromProps) {
    // console.log('✅ 已从 props 成功导入任务，跳过其他数据源')
    // 清除可能存在的旧localStorage数据，避免冲突
    try {
      localStorage.removeItem('planning.v1')
      // console.log('🗑️ 已清除旧的planning草稿数据，避免冲突')
    } catch (e) {
      console.warn('清除旧数据失败:', e)
    }
    return true // 成功从 props 导入
  }
  
  // console.log('📋 Props 中无任务数据，尝试加载本地草稿...')
  
  const loaded = planning.loadFromLocal()
  if (loaded) {
    // console.log('📂 成功加载本地草稿数据')
    // 如果草稿为空，仍尝试从解析结果导入
    if (!planning.tasks || planning.tasks.length === 0) {
      // console.log('⚠️ 本地草稿为空，尝试从localStorage解析结果导入...')
      const ok = tryAutoImportFromAnalysis()
      if (!ok) message.info('当前暂无任务，请点击"导入→从解析结果导入"或"使用示例数据"')
    } else {
      // console.log(`✅ 从本地草稿恢复了 ${planning.tasks.length} 个任务`)
      // message.success('已从本地草稿恢复')
    }
    return true
  }
  
  console.log('📂 无本地草稿，尝试从localStorage解析结果导入...')
  // 无草稿则尝试自动导入
  const ok = tryAutoImportFromAnalysis()
  if (!ok) {
    console.log('⚠️ 无任何数据源可用')
    // 若已选择具体项目且尚未自动尝试，从后端解析结果读取（仅追加）以避免首次空白
    if (!attemptedBackendAuto.value && currentProjectId.value && currentProjectId.value !== 'ALL_PROJECTS') {
      attemptedBackendAuto.value = true
      // 仅触发提案弹窗，不自动应用或落库
      importFromBackendAnalysis()
    } else {
      message.info('当前暂无任务，请点击"从后端解析结果读取（仅追加）"或"使用示例数据"')
    }
  }
  return ok
}

// 监听props变化，当有新的解析任务传入时自动导入
watch(() => props.extractedTasks, (newExtractedTasks) => {
  console.log('👀 检测到 extractedTasks props 变化:', newExtractedTasks)
  
  if (newExtractedTasks && 
      (newExtractedTasks.implementation?.length > 0 || 
       newExtractedTasks.technical?.length > 0 || 
       newExtractedTasks.milestones?.length > 0)) {
    console.log('🔄 Props 数据更新，重新导入任务...')
    const success = autoImportFromProps()
    if (success) {
      console.log('🎉 Props 数据更新导入成功！')
      // 清除旧数据
      try {
        localStorage.removeItem('planning.v1')
        console.log('🗑️ 已清除旧的planning草稿数据')
      } catch (e) {
        console.warn('清除旧数据失败:', e)
      }
    }
  }
}, { deep: true, immediate: false })

onMounted(async () => {
  console.log('🚀 TaskPlanning 组件首次挂载')
  
  // 首先初始化项目选择
  await initializeProjectSelection()
  // 非恢复路径下也加载一次模板
  try { await loadReportTemplatesFromBackend() } catch {}
  
  // 然后处理数据导入
  handleDataImport()
})

// 加载成员任务统计（后端）
const refreshMemberTaskCounts = async () => {
  try {
    const actives = membersStore.activeMembers || []
    const pairs = await Promise.allSettled(actives.map(m => getMemberTaskStatistics(Number(m.id), Number(currentProjectId.value))))
    const map = new Map()
    pairs.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        const dataAny = r.value?.data ?? r.value
        const total = Number(dataAny?.totalTasks ?? dataAny?.total ?? 0)
        map.set(Number(actives[idx].id), total)
      }
    })
    backendTaskCountMap.value = map
  } catch {}
}

// 从后端加载提报模板（启用）并写入 planning（供任务编辑弹窗选择）
const loadReportTemplatesFromBackend = async () => {
  try {
    const res = await getReportTemplateList({ templateStatus: RTplStatus.ENABLED })
    const raw = (res && res.data != null) ? res.data : res
    const arr = Array.isArray(raw?.list) ? raw.list : (Array.isArray(raw) ? raw : [])
    const front = arr.map((t) => convertToFrontendConfig(t))
    try {
      planning.reportTemplates = front
      const def = arr.find((t) => t.isSystemDefault)
      if (def && def.id) planning.setDefaultReportTemplate(def.id)
    } catch {}
    console.log(`🧩 已加载启用提报模板 ${front.length} 个供任务编辑选择`)
  } catch (e) {
    console.warn('⚠️ 加载提报模板失败（忽略，仍可本地选择）:', (e && e.message) || e)
  }
}

// 仅对新增列表做分页
const pagedAdditions = computed(() => {
  const list = proposal.value?.diff?.additions || []
  const size = proposal.value.pageSize || 10
  const page = Math.max(1, proposal.value.page || 1)
  const start = (page - 1) * size
  return list.slice(start, start + size)
})

// 主按钮点击：
// - autoMode: 直接批量 createTask 并刷新
// - 非 autoMode: 如果未勾选"应用新增"，直接关闭（仅预览）；否则按 applyProposal 合并草稿
const onClickPrimary = async () => {
  if (proposal.value.autoMode) {
    try {
      const projectId = Number(currentProjectId.value)
      if (!projectId) { message.warning('请选择项目后再执行一键落库'); return }
      proposal.value.loading = true
      const createList = (proposal.value.diff?.additions || []).map((t) => ({ ...t, projectId }))
      const results = await Promise.allSettled(createList.map((t) => createTask(transformTaskToBackend(t))))
      const ok = results.filter(r => r.status === 'fulfilled').length
      if (ok > 0) {
        message.success(`已落库 ${ok} 条正式任务`)
        await loadTasksFromBackend(projectId)
        // 成功后永久抑制该项目的自动弹窗
        markAutoCreateDone(String(projectId))
      } else {
        message.error('落库失败，请稍后重试')
      }
      proposal.value.visible = false
    } catch (e) {
      console.error(e)
      message.error('一键落库失败，请稍后重试')
    } finally {
      proposal.value.loading = false
    }
    return
  }

  if (!proposal.value.options.applyAdditions) {
    // 仅预览：未勾选应用新增则直接关闭
    proposal.value.visible = false
    return
  }
  await applyProposal()
}

// 加载/提示与自动落库抑制状态
const isLoadingTasks = ref(false)
const isFetchingAnalysis = ref(false)
const showEmptyBanner = ref(false)
const hasBackendTasks = ref(false)
const canAutoImport = ref(false) // 仅当确认后端无任务时，才允许任何自动导入/弹窗

const doneKey = (pid) => `implV3:autoCreateDone:${pid}`
const dismissedKey = (pid) => `implV3:autoCreateDismissed:${pid}`
const markAutoCreateDone = (pid) => { try { localStorage.setItem(doneKey(pid), '1') } catch {} }
const isAutoCreateDone = (pid) => { try { return !!localStorage.getItem(doneKey(pid)) } catch { return false } }
const markAutoCreateDismissed = (pid) => { try { localStorage.setItem(dismissedKey(pid), String(Date.now())) } catch {} }
const isAutoCreateDismissed = (pid, ttlMs = 24*60*60*1000) => {
  try {
    const raw = localStorage.getItem(dismissedKey(pid))
    const ts = raw ? Number(raw) : 0
    if (!ts) return false
    return (Date.now() - ts) < ttlMs
  } catch { return false }
}

</script>

<style scoped>
.task-planning-page{width:100%;}

/* 项目选择区 */
.project-selector-section {
  margin-bottom: 16px;
}

.selector-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(35, 79, 162, 0.08);
}

.selector-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-select {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-select label {
  font-weight: 600;
  color: #234fa2;
  white-space: nowrap;
  margin: 0;
}

.project-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.project-name {
  font-weight: 500;
  color: #262626;
  flex: 1;
  margin-right: 8px;
}

.project-id {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 8px;
}

.project-info {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #f6f8ff;
  border-radius: 6px;
  font-size: 12px;
}

.project-info .project-id {
  color: #1890ff;
  font-weight: 500;
}


/* 任务分页样式 */
.task-pagination {
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
}

.project-info .project-leader {
  color: #595959;
}

/* 统计概览区 */
.overview-section{margin-bottom:20px;}
.stats-cards{display:flex;gap:16px;justify-content:flex-start;}
.stat-card{
  background:#fff;
  border:1px solid #e6eaf2;
  border-radius:8px;
  padding:16px 20px;
  text-align:center;
  box-shadow:0 2px 8px rgba(35,79,162,0.08);
  min-width:100px;
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
}
.stat-label{
  font-size:12px;
  color:#8c8c8c;
  margin-bottom:6px;
  font-weight:400;
  line-height:1.3;
  white-space:nowrap;
}
.stat-value{
  font-size:20px;
  font-weight:600;
  color:#234fa2;
  line-height:1;
  margin:0;
}
.filters{display:flex;gap:8px;margin:8px 0}
.main{display:flex;gap:12px;margin-top:16px}
.col{background:#fff;border:1px solid #e6eaf2;border-radius:12px;box-shadow:0 8px 24px rgba(35,79,162,0.12);display:flex;flex-direction:column;min-height:60vh}
.col.left{flex:1.4}
.col.right{flex:1}
.col .hd{padding:12px 14px;border-bottom:1px solid #e6eaf2;display:flex;justify-content:space-between;align-items:center}
.col .hd .h{font-weight:700;color:#234fa2;white-space:nowrap;flex:0 0 auto}
.toolbar{display:flex;gap:10px;align-items:center;flex:1;justify-content:flex-end;flex-wrap:nowrap}
.chip-scroll{overflow:auto;white-space:nowrap;padding:6px 12px;border-bottom:1px dashed #e6eaf2;background:#fafcff}
.list{padding:10px;overflow:auto}
.phase-table{width:100%;border-collapse:separate;border-spacing:0 8px}
.phase-table .phase-cell{vertical-align:top;background:#fafcff;border:1px solid #e6eaf2;border-right:none;border-radius:10px 0 0 10px;padding:10px}
.phase-table .phase-cell__name{font-weight:600;color:#234fa2;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.phase-table .phase-cell__name .caret{display:inline-block;width:0;height:0;margin-right:6px;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #234fa2;transition:transform .2s}
.phase-table .phase-cell__name .caret.up{transform:rotate(180deg)}
.phase-table .phase-cell__time{color:#8c8c8c;font-size:12px}
.phase-table .phase-cell__count{color:#8c8c8c;font-size:12px;margin-top:4px}
.phase-collapsed-tip{color:#8c8c8c;text-align:center;cursor:pointer}
.phase-table .task-row td:last-child{background:#fff;border:1px solid #e6eaf2;border-left:none;border-radius:0 10px 10px 0;padding:8px}
/* 扁平化任务列表样式 */
.flat-task-list{padding:10px;overflow:auto}
.task-items{display:flex;flex-direction:column;gap:8px}
.task-item{border:1px solid #e6eaf2;border-radius:10px;padding:12px;background:#fff;cursor:move;transition:all 0.2s ease}
.task-item--assigned{border-color:#91caff;background:#f6ffed}
.task-item:hover{border-color:#234fa2;box-shadow:0 2px 8px rgba(35,79,162,0.15)}
.task-content{display:flex;flex-direction:column;gap:8px}
.task-header{display:flex;justify-content:space-between;align-items:flex-start}
.task-name{font-weight:600;color:#333;flex:1;margin-right:12px;line-height:1.4}
.task-actions{display:flex;gap:4px;align-items:center;flex-shrink:0}
.task-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px;line-height:1.4}
.task-priority{color:#234fa2;background:#f0f5ff;border:1px solid #d6e1ff;border-radius:12px;padding:2px 8px}

/* 时间显示区域优化 */
.task-times{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.task-time{border-radius:12px;padding:2px 8px;font-family:monospace;letter-spacing:0.5px;font-size:11px;border:1px solid;white-space:nowrap}

/* 庄重的时间颜色方案 - 基于主色系 */
.task-time.time-range{color:#234fa2;background:#f0f5ff;border-color:#d6e1ff}
.task-time.time-start{color:#234fa2;background:#f0f5ff;border-color:#d6e1ff}
.task-time.time-end{color:#595959;background:#f5f5f5;border-color:#d9d9d9}
.task-time.time-due{color:#fa8c16;background:#fff9f0;border-color:#ffe7ba}
.task-time.overdue{color:#d4380d !important;background:#fff1f0 !important;border-color:#ffa39e !important}

/* 里程碑信息样式 - 更庄重的色调 */
.task-milestone{color:#234fa2;background:#f0f5ff;border:1px solid #d6e1ff;border-radius:12px;padding:2px 8px;font-weight:500;display:inline-flex;align-items:center;gap:2px}
.task-milestone .milestone-date{color:#595959;font-size:10px;font-weight:400}

.task-assignee{border-radius:12px;padding:2px 8px;border:1px solid}
.task-assignee.assigned{color:#52c41a;background:#f6ffed;border-color:#b7eb8f}
.task-assignee.unassigned{color:#d4380d;background:#fff7e6;border-color:#ffd6bf}
.tasks-panel{margin-top:6px}
.tasks-list{display:flex;flex-direction:column;gap:4px;margin-top:4px}
.task-chip{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border:1px solid #e6eaf2;border-radius:6px;background:#fafafa}
.task-name{color:#262626}
.task-origin{color:#8c8c8c;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:12px;padding:2px 8px}

/* 保留原有任务样式（用于其他地方） */
.task{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff;display:grid;grid-template-columns:1fr auto;gap:8px}
.task .name{font-weight:600}
.task .meta{display:flex;gap:6px;align-items:center;font-size:12px;color:#666}
.pill{border:1px solid #e6eaf2;border-radius:999px;padding:2px 8px;font-size:12px;background:#fafbff}
.pill.blue{color:#234fa2;border-color:#d6e1ff}
.pill.red{color:#d4380d;border-color:#ffd6bf;background:#fff7e6}
.pill.green{color:#389e0d;border-color:#c2f0c2;background:#f6ffed}
.pill.assign{border-color:#e6eaf2}
.pill.assigned{color:#1d39c4;border-color:#adc6ff;background:#f0f5ff}
.pill.unassigned{color:#d4380d;border-color:#ffa39e;background:#fff1f0}
.origin{font-size:11px;border-radius:4px;padding:2px 6px;background:#f0f5ff;color:#3f5fb6;border:1px solid #d6e4ff}
.segmented-filter{display:flex;align-items:center;gap:8px}
.chip-row{width:100%;margin-top:6px}
.member{border:1px solid #e6eaf2;border-radius:10px;padding:10px;margin:10px;background:#fff}
.member.member--highlight{border-color:#4e7be6; box-shadow:0 0 0 3px rgba(78,123,230,0.15)}
.member .row{display:flex;justify-content:space-between;align-items:center}
.avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#cfd8ff,#e3ecff);display:inline-flex;align-items:center;justify-content:center;color:#2b4db8;font-weight:700}
.cap{font-size:12px;color:#666}
.load{height:6px;border-radius:999px;background:#f0f0f0;overflow:hidden;margin-top:8px}
.load .bar{height:100%;background:linear-gradient(90deg,#69c0ff,#4e7be6)}
.drop{margin-top:10px;border:1px dashed #e6eaf2;border-radius:8px;padding:8px;background:#fafcff}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #e6eaf2;border-radius:999px;padding:3px 8px;margin:4px;background:#fff;font-size:12px}
.footer{position:sticky;bottom:0;background:rgba(255,255,255,.92);backdrop-filter:saturate(180%) blur(8px);border-top:1px solid #e6eaf2;padding:10px;margin-top:16px}
.btns{display:flex;gap:10px;justify-content:flex-end}
.hint{font-size:12px;color:#666;margin-top:6px}
.rte-toolbar{margin-bottom:6px}
.rte-editor{min-height:140px;border:1px solid #e6eaf2;border-radius:8px;padding:8px}
@media (max-width:1400px){
  .stats-cards{gap:10px;flex-wrap:wrap;}
  .stat-card{padding:12px 16px;min-width:95px;flex:1 1 calc(14.2% - 9px);}
  .stat-value{font-size:18px;}
}

@media (max-width:1200px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(25% - 6px);min-width:90px;}
  .stat-value{font-size:17px;}
  .stat-label{font-size:11px;}
}

@media (max-width:1024px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(33.33% - 6px);min-width:85px;}
  .stat-value{font-size:16px;}
  .main{flex-direction:column}
  .col.left,.col.right{flex:unset}
}

@media (max-width:900px){
  .stats-cards{gap:8px;}
  .stat-card{flex:1 1 calc(50% - 4px);min-width:80px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;}
}

@media (max-width:768px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:70px;flex:1 1 calc(50% - 3px);padding:10px 12px;}
  .stat-value{font-size:15px;}
  .stat-label{font-size:10px;margin-bottom:3px;line-height:1.2;}
  
  /* 移动端任务信息优化 */
  .task-meta{gap:6px;}
  .task-times{gap:3px;margin:2px 0;}
  .task-time{font-size:10px;padding:1px 6px;}
  .task-milestone{font-size:10px;padding:1px 6px;}
  .task-milestone .milestone-date{font-size:9px;}
}

@media (max-width:600px){
  .stats-cards{flex-wrap:wrap;gap:6px;}
  .stat-card{min-width:65px;flex:1 1 calc(50% - 3px);padding:8px 10px;}
  .stat-value{font-size:14px;}
  .stat-label{font-size:9px;margin-bottom:2px;line-height:1.1;}
  
  /* 更小屏幕的任务信息优化 */
  .task-time{font-size:9px;padding:1px 5px;}
  .task-milestone{font-size:9px;padding:1px 5px;}
}

@media (max-width:480px){
  .stats-cards{flex-wrap:wrap;gap:4px;}
  .stat-card{min-width:60px;flex:1 1 calc(50% - 2px);padding:6px 8px;}
  .stat-value{font-size:13px;}
  .stat-label{font-size:8px;margin-bottom:2px;line-height:1.1;}
  
  /* 最小屏幕的任务信息优化 */
  .task-meta{flex-direction:column;align-items:flex-start;gap:4px;}
  .task-times{width:100%;}
  .task-time{font-size:8px;padding:1px 4px;}
  .task-milestone{font-size:8px;padding:1px 4px;}
  .task-milestone .milestone-date{font-size:8px;}
}
</style>
<style scoped>
.ms-row{margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.ms-quick{display:flex;gap:8px;align-items:center}
</style>


