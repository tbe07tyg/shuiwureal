<template>
  <PageContainer
    title="📈 统计分析中心"
    description="数据决策支持，绩效考核依据">
    
    <!-- 页面操作区 -->
    <template #actions>
      <a-space>
        <a-button @click="refreshData">
          <ReloadOutlined />
          刷新数据
        </a-button>
        <a-button type="primary" @click="exportReport">
          <DownloadOutlined />
          导出报告
        </a-button>
        <a-button @click="showSettings">
          <SettingOutlined />
          配置
        </a-button>
      </a-space>
    </template>

    <!-- 核心指标统计总览区域 -->
    <div class="stats-overview">
      <a-row :gutter="[16, 16]">
        <!-- 研发投入强度 - 重点指标 -->
        <a-col :span="8">
          <div class="stat-card highlight rd-intensity">
            <div class="stat-header">
              <div class="stat-icon">🧬</div>
              <div class="stat-info">
                <div class="stat-title">研发投入强度</div>
                <div class="stat-subtitle">R&D Investment Intensity</div>
              </div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.rdIntensity }}%</div>
              <div class="stat-trend" :class="statistics.rdTrend > 0 ? 'up' : 'down'">
                <CaretUpOutlined v-if="statistics.rdTrend > 0" />
                <CaretDownOutlined v-else />
                {{ Math.abs(statistics.rdTrend) }}%
              </div>
            </div>
            <div class="stat-details">
              <div class="detail-item">
                <span>总投入:</span>
                <span>{{ statistics.totalRdInvestment }}万</span>
              </div>
              <div class="detail-item">  
                <span>占比目标:</span>
                <span>{{ statistics.rdTarget }}%</span>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 智慧水务比重 - 重点指标 -->
        <a-col :span="8">
          <div class="stat-card highlight strategic-ratio">
            <div class="stat-header">
              <div class="stat-icon">💧</div>
              <div class="stat-info">
                <div class="stat-title">智慧水务项目比重</div>
                <div class="stat-subtitle">Smart Water Management</div>
              </div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.strategicRatio }}%</div>
              <div class="stat-trend" :class="statistics.strategicTrend > 0 ? 'up' : 'down'">
                <CaretUpOutlined v-if="statistics.strategicTrend > 0" />
                <CaretDownOutlined v-else />
                {{ Math.abs(statistics.strategicTrend) }}%
              </div>
            </div>
            <div class="stat-details">
              <div class="detail-item">
                <span>智慧水务:</span>
                <span>{{ statistics.strategicProjects }}个</span>
              </div>
              <div class="detail-item">
                <span>总项目数:</span>
                <span>{{ statistics.totalProjects }}个</span>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 成果转化率 -->
        <a-col :span="8">
          <div class="stat-card achievement-conversion">
            <div class="stat-header">
              <div class="stat-icon">🏆</div>
              <div class="stat-info">
                <div class="stat-title">成果转化率</div>
                <div class="stat-subtitle">Achievement Conversion</div>
              </div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.conversionRate }}%</div>
              <div class="stat-trend" :class="statistics.conversionTrend > 0 ? 'up' : 'down'">
                <CaretUpOutlined v-if="statistics.conversionTrend > 0" />
                <CaretDownOutlined v-else />
                {{ Math.abs(statistics.conversionTrend) }}%
              </div>
            </div>
            <div class="stat-details">
              <div class="detail-item">
                <span>已转化:</span>
                <span>{{ statistics.convertedAchievements }}项</span>
              </div>
              <div class="detail-item">
                <span>总成果:</span>
                <span>{{ statistics.totalAchievements }}项</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 基础统计指标 -->
      <a-row :gutter="[16, 16]" style="margin-top: 16px;">
        <a-col :span="4">
          <div class="stat-card basic">
            <div class="stat-icon">📂</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalProjects }}</div>
              <div class="stat-label">项目总数</div>
              <div class="stat-change">+{{ statistics.projectsChange }}</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card basic">
            <div class="stat-icon">🔄</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.ongoingProjects }}</div>
              <div class="stat-label">进行中</div>
              <div class="stat-change">{{ statistics.ongoingChange > 0 ? '+' : '' }}{{ statistics.ongoingChange }}</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card basic">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.completedProjects }}</div>
              <div class="stat-label">已完成</div>
              <div class="stat-change">+{{ statistics.completedChange }}</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card basic warning">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.overdueProjects }}</div>
              <div class="stat-label">逾期</div>
              <div class="stat-change">{{ statistics.overdueChange > 0 ? '+' : '' }}{{ statistics.overdueChange }}</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card basic">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalBudget }}</div>
              <div class="stat-label">总预算(万)</div>
              <div class="stat-change">+{{ statistics.budgetChange }}%</div>
            </div>
          </div>
        </a-col>
        <a-col :span="4">
          <div class="stat-card basic">
            <div class="stat-icon">💸</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.usedBudget }}</div>
              <div class="stat-label">已支出(万)</div>
              <div class="stat-change">{{ statistics.spendingRate }}%</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 图表分析区域 -->
    <div class="charts-section">
      <a-row :gutter="[16, 16]">
        <!-- 研发投入强度趋势图 -->
        <a-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>📈 研发投入强度趋势</h3>
            </div>
            <div class="chart-content" ref="rdIntensityChartRef"></div>
          </div>
        </a-col>

        <!-- 水务项目分布图 -->
        <a-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>💧 水务项目领域分布</h3>
            </div>
            <div class="chart-content" ref="strategicChartRef"></div>
          </div>
        </a-col>

        <!-- 成果分析图表 -->
        <a-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>🏆 成果分析统计</h3>
            </div>
            <div class="chart-content" ref="achievementChartRef"></div>
          </div>
        </a-col>

        <!-- 绩效考核排行 -->
        <a-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>🏅 部门绩效排行</h3>
            </div>
            <div class="chart-content" ref="performanceChartRef"></div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 详细分析表格 -->
    <div class="analysis-table">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="rd-detail" tab="🧬 研发投入明细">
          <div class="table-section">
            <a-table
              :columns="rdDetailColumns"
              :data-source="rdDetailData"
              :pagination="{ pageSize: 10 }"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'intensity'">
                  <div class="intensity-cell">
                    <div class="intensity-bar">
                      <div 
                        class="intensity-fill" 
                        :style="{ width: record.intensity + '%' }"
                      ></div>
                    </div>
                    <span class="intensity-text">{{ record.intensity }}%</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ record.status }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane key="strategic-detail" tab="💧 水务项目明细">
          <div class="table-section">
            <a-table
              :columns="strategicDetailColumns"
              :data-source="strategicDetailData"
              :pagination="{ pageSize: 10 }"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'industry'">
                  <a-tag color="blue">{{ record.industry }}</a-tag>
                </template>
                <template v-else-if="column.key === 'isStrategic'">
                  <a-tag :color="record.isStrategic ? 'green' : 'default'">
                    {{ record.isStrategic ? '💧 智慧水务' : '🔧 传统水务' }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane key="achievement-detail" tab="🏆 成果转化明细">
          <div class="table-section">
            <a-table
              :columns="achievementDetailColumns"
              :data-source="achievementDetailData"
              :pagination="{ pageSize: 10 }"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'type'">
                  <a-tag :color="getAchievementTypeColor(record.type)">
                    {{ getAchievementTypeIcon(record.type) }} {{ record.type }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'converted'">
                  <a-tag :color="record.converted ? 'green' : 'orange'">
                    {{ record.converted ? '✅ 已转化' : '⏳ 待转化' }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import {
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  CaretUpOutlined,
  CaretDownOutlined
} from '@ant-design/icons-vue'
import PageContainer from '@/components/th_qd/PageContainer.vue'

// 统计数据
const statistics = reactive({
  // 研发投入强度相关
  rdIntensity: 4.8,
  rdTrend: 0.5,
  totalRdInvestment: 12500,
  rdTarget: 5.0,
  
  // 智慧水务比重相关
  strategicRatio: 68.5,
  strategicTrend: 3.2,
  strategicProjects: 45,
  
  // 成果转化相关
  conversionRate: 85.6,
  conversionTrend: 2.1,
  convertedAchievements: 156,
  totalAchievements: 182,
  
  // 基础统计
  totalProjects: 123,
  projectsChange: 12,
  ongoingProjects: 45,
  ongoingChange: -3,
  completedProjects: 70,
  completedChange: 18,
  overdueProjects: 8,
  overdueChange: 2,
  totalBudget: 2000,
  budgetChange: 8.5,
  usedBudget: 1500,
  spendingRate: 75
})

const activeTab = ref('rd-detail')

// 图表引用
const rdIntensityChartRef = ref(null)
const strategicChartRef = ref(null)
const achievementChartRef = ref(null)
const performanceChartRef = ref(null)

// 表格数据
const rdDetailColumns = [
  { title: '部门', dataIndex: 'department', key: 'department' },
  { title: '项目数', dataIndex: 'projectCount', key: 'projectCount' },
  { title: '研发投入(万)', dataIndex: 'rdInvestment', key: 'rdInvestment' },
  { title: '总收入(万)', dataIndex: 'totalRevenue', key: 'totalRevenue' },
  { title: '投入强度', dataIndex: 'intensity', key: 'intensity' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

const rdDetailData = ref([
  {
    key: '1',
    department: '技术部',
    projectCount: 28,
    rdInvestment: 5600,
    totalRevenue: 95000,
    intensity: 5.9,
    status: '达标'
  },
  {
    key: '2', 
    department: '研发中心',
    projectCount: 35,
    rdInvestment: 4800,
    totalRevenue: 78000,
    intensity: 6.2,
    status: '达标'
  },
  {
    key: '3',
    department: '创新部',
    projectCount: 22,
    rdInvestment: 2100,
    totalRevenue: 56000,
    intensity: 3.8,
    status: '待提升'
  }
])

const strategicDetailColumns = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName' },
  { title: '水务领域', dataIndex: 'industry', key: 'industry' },
  { title: '项目类型', dataIndex: 'isStrategic', key: 'isStrategic' },
  { title: '投资额(万)', dataIndex: 'investment', key: 'investment' },
  { title: '完成进度', dataIndex: 'progress', key: 'progress' },
  { title: '负责人', dataIndex: 'manager', key: 'manager' }
]

const strategicDetailData = ref([
  {
    key: '1',
    projectName: 'AI智能水质监测系统',
    industry: '智慧水务',
    isStrategic: true,
    investment: 1200,
    progress: '95%',
    manager: '张三'
  },
  {
    key: '2',
    projectName: '智慧供水管网改造',
    industry: '供水管网',
    isStrategic: true, 
    investment: 980,
    progress: '78%',
    manager: '李四'
  },
  {
    key: '3',
    projectName: '传统水处理设备维护',
    industry: '污水处理',
    isStrategic: false,
    investment: 450,
    progress: '100%',
    manager: '王五'
  },
  {
    key: '4',
    projectName: '节水灌溉技术推广',
    industry: '节水技术',
    isStrategic: true,
    investment: 680,
    progress: '85%',
    manager: '赵六'
  },
  {
    key: '5',
    projectName: '水资源调度优化平台',
    industry: '水资源管理',
    isStrategic: true,
    investment: 1500,
    progress: '60%',
    manager: '孙七'
  }
])

const achievementDetailColumns = [
  { title: '成果名称', dataIndex: 'achievementName', key: 'achievementName' },
  { title: '成果类型', dataIndex: 'type', key: 'type' },
  { title: '转化状态', dataIndex: 'converted', key: 'converted' },
  { title: '转化价值(万)', dataIndex: 'value', key: 'value' },
  { title: '完成时间', dataIndex: 'completedTime', key: 'completedTime' },
  { title: '负责人', dataIndex: 'manager', key: 'manager' }
]

const achievementDetailData = ref([
  {
    key: '1',
    achievementName: '智能水质监测算法专利',
    type: '发明专利',
    converted: true,
    value: 280,
    completedTime: '2024-12-15',
    manager: '张三'
  },
  {
    key: '2',
    achievementName: '水处理技术论文',
    type: 'SCI论文',
    converted: false,
    value: 0,
    completedTime: '2024-11-20',
    manager: '李四'
  },
  {
    key: '3',
    achievementName: '节水设备软件著作权',
    type: '软件著作权',
    converted: true,
    value: 150,
    completedTime: '2024-10-08',
    manager: '王五'
  }
])

// 方法
const refreshData = () => {
  message.success('数据已刷新')
  nextTick(() => {
    initCharts()
  })
}

const exportReport = () => {
  message.success('报告导出中...')
}

const showSettings = () => {
  message.info('打开配置面板')
}

const getStatusColor = (status) => {
  const colors = {
    '达标': 'green',
    '待提升': 'orange',
    '不达标': 'red'
  }
  return colors[status] || 'default'
}

const getAchievementTypeColor = (type) => {
  const colors = {
    '发明专利': 'blue',
    'SCI论文': 'green',
    '软件著作权': 'purple',
    '实用新型': 'orange'
  }
  return colors[type] || 'default'
}

const getAchievementTypeIcon = (type) => {
  const icons = {
    '发明专利': '🔬',
    'SCI论文': '📄',
    '软件著作权': '💻',
    '实用新型': '🔧'
  }
  return icons[type] || '📋'
}

// 初始化图表
const initCharts = () => {
  // 研发投入强度趋势图
  if (rdIntensityChartRef.value) {
    const rdChart = echarts.init(rdIntensityChartRef.value)
    rdChart.setOption({
      title: {
        text: '研发投入强度变化趋势',
        textStyle: { fontSize: 14 }
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['2021Q1', '2021Q2', '2021Q3', '2021Q4', '2022Q1', '2022Q2', '2022Q3', '2022Q4', '2023Q1', '2023Q2', '2023Q3', '2023Q4']
      },
      yAxis: {
        type: 'value',
        name: '强度(%)',
        axisLabel: { formatter: '{value}%' }
      },
      series: [{
        name: '研发投入强度',
        type: 'line',
        data: [3.2, 3.5, 3.8, 4.1, 4.3, 4.0, 4.2, 4.5, 4.6, 4.4, 4.7, 4.8],
        smooth: true,
        lineStyle: { color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
        areaStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ]
          }
        }
      }]
    })
  }

  // 水务项目分布图
  if (strategicChartRef.value) {
    const strategicChart = echarts.init(strategicChartRef.value)
    strategicChart.setOption({
      title: {
        text: '水务项目领域分布',
        textStyle: { fontSize: 14 }
      },
      tooltip: { trigger: 'item' },
      series: [{
        name: '水务领域分布',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 18, name: '智慧水务', itemStyle: { color: '#1890ff' } },
          { value: 15, name: '水质监测', itemStyle: { color: '#52c41a' } },
          { value: 12, name: '节水技术', itemStyle: { color: '#faad14' } },
          { value: 8, name: '污水处理', itemStyle: { color: '#f5222d' } },
          { value: 6, name: '供水管网', itemStyle: { color: '#722ed1' } },
          { value: 4, name: '水资源管理', itemStyle: { color: '#13c2c2' } }
        ],
        label: {
          formatter: '{b}: {c}个\n({d}%)'
        }
      }]
    })
  }

  // 成果分析图表
  if (achievementChartRef.value) {
    const achievementChart = echarts.init(achievementChartRef.value)
    achievementChart.setOption({
      title: {
        text: '成果类型分布统计',
        textStyle: { fontSize: 14 }
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['发明专利', 'SCI论文', '软件著作权', '实用新型', '标准制定', '产品转化']
      },
      yAxis: { type: 'value' },
      series: [{
        name: '成果数量',
        type: 'bar',
        data: [45, 38, 28, 22, 15, 34],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#ff7875' },
              { offset: 1, color: '#ff4d4f' }
            ]
          }
        }
      }]
    })
  }

  // 部门绩效排行图
  if (performanceChartRef.value) {
    const performanceChart = echarts.init(performanceChartRef.value)
    performanceChart.setOption({
      title: {
        text: '部门综合绩效排行',
        textStyle: { fontSize: 14 }
      },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', max: 100 },
      yAxis: {
        type: 'category',
        data: ['行政部', '财务部', '采购部', '技术部']
      },
      series: [{
        name: '绩效得分',
        type: 'bar',
        data: [82.7, 85.3, 89.6, 95.2],
        itemStyle: {
          color: (params) => {
            const colors = ['#faad14', '#f5222d', '#52c41a', '#1890ff']
            return colors[params.dataIndex]
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}分'
        }
      }]
    })
  }
}

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})
</script>

<style scoped>
.analytics-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content .page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

.header-content .page-desc {
  margin: 8px 0 0 0;
  color: #8c8c8c;
  font-size: 14px;
}

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.highlight .stat-title,
.stat-card.highlight .stat-subtitle {
  color: rgba(255,255,255,0.9);
}

.stat-card.rd-intensity {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.strategic-ratio {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card.achievement-conversion {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.stat-card.achievement-conversion .stat-title,
.stat-card.achievement-conversion .stat-subtitle {
  color: #333;
}

.stat-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.stat-icon {
  font-size: 32px;
  margin-right: 12px;
}

.stat-info .stat-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-info .stat-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  margin-right: 8px;
}

.stat-trend {
  font-size: 14px;
  font-weight: 500;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

.stat-details {
  font-size: 12px;
  opacity: 0.8;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.stat-card.basic {
  text-align: center;
}

.stat-card.basic .stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.stat-card.basic .stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.stat-card.basic .stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin: 4px 0;
}

.stat-card.basic .stat-change {
  font-size: 12px;
  color: #52c41a;
}

.stat-card.basic.warning .stat-number {
  color: #ff4d4f;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.chart-content {
  height: 320px;
}

.analysis-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-section {
  margin-top: 16px;
}

.intensity-cell {
  display: flex;
  align-items: center;
}

.intensity-bar {
  width: 60px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
}

.intensity-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #1890ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.intensity-text {
  font-weight: 500;
  color: #1890ff;
}
</style> 