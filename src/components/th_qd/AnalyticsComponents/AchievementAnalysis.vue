<!--
/**
 * @fileoverview 成果分析组件
 * @description 专门用于展示科研成果分析和转化情况的组件
 * @author AI助手
 * @version 1.0
 * @since 2025-01-17
 */
-->
<template>
  <div class="achievement-analysis">
    <div class="analysis-header">
      <h3 class="analysis-title">🏆 成果分析与转化</h3>
      <div class="analysis-controls">
        <a-radio-group v-model:value="viewMode" size="small">
          <a-radio-button value="overview">总览</a-radio-button>
          <a-radio-button value="conversion">转化分析</a-radio-button>
          <a-radio-button value="comparison">对比分析</a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 成果总览模式 -->
    <div v-if="viewMode === 'overview'" class="overview-section">
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="stat in achievementStats" :key="stat.key">
          <div class="achievement-stat-card" :class="stat.type">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-content">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
                {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 成果分布图表 -->
      <div class="charts-row">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="chart-container">
              <h4>成果类型分布</h4>
              <div class="chart-content" ref="achievementTypeChart"></div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="chart-container">
              <h4>成果等级分析</h4>
              <div class="chart-content" ref="achievementLevelChart"></div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 转化分析模式 -->
    <div v-if="viewMode === 'conversion'" class="conversion-section">
      <div class="conversion-overview">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="conversion-card highlight">
              <div class="card-header">
                <span class="card-icon">🔄</span>
                <div class="card-info">
                  <h4>转化率</h4>
                  <p>Achievement Conversion Rate</p>
                </div>
              </div>
              <div class="card-content">
                <div class="conversion-rate">{{ conversionData.rate }}%</div>
                <div class="conversion-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: conversionData.rate + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="conversion-card">
              <div class="card-header">
                <span class="card-icon">💰</span>
                <div class="card-info">
                  <h4>转化价值</h4>
                  <p>Conversion Value</p>
                </div>
              </div>
              <div class="card-content">
                <div class="conversion-value">{{ conversionData.value }}万</div>
                <div class="value-breakdown">
                  <span>已实现: {{ conversionData.realized }}万</span>
                  <span>预期: {{ conversionData.expected }}万</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="conversion-card">
              <div class="card-header">
                <span class="card-icon">⏱️</span>
                <div class="card-info">
                  <h4>转化周期</h4>
                  <p>Conversion Cycle</p>
                </div>
              </div>
              <div class="card-content">
                <div class="conversion-cycle">{{ conversionData.avgCycle }}天</div>
                <div class="cycle-range">
                  <span>最快: {{ conversionData.minCycle }}天</span>
                  <span>最慢: {{ conversionData.maxCycle }}天</span>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 转化流程图 -->
      <div class="conversion-flow">
        <h4>成果转化流程</h4>
        <div class="flow-chart" ref="conversionFlowChart"></div>
      </div>

      <!-- 转化明细表 -->
      <div class="conversion-table">
        <h4>转化项目明细</h4>
        <a-table
          :columns="conversionColumns"
          :data-source="conversionTableData"
          :pagination="{ pageSize: 8 }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getConversionStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'value'">
              <span class="value-text">{{ record.value }}万</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 对比分析模式 -->
    <div v-if="viewMode === 'comparison'" class="comparison-section">
      <div class="comparison-controls">
        <a-space>
          <span>对比维度:</span>
          <a-select v-model:value="comparisonDimension" style="width: 120px">
            <a-select-option value="department">按部门</a-select-option>
            <a-select-option value="year">按年度</a-select-option>
            <a-select-option value="type">按类型</a-select-option>
          </a-select>
          <span>时间范围:</span>
          <a-range-picker v-model:value="comparisonDateRange" />
        </a-space>
      </div>

      <div class="comparison-charts">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="chart-container">
              <h4>成果数量对比</h4>
              <div class="chart-content" ref="comparisonQuantityChart"></div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="chart-container">
              <h4>转化效率对比</h4>
              <div class="chart-content" ref="comparisonEfficiencyChart"></div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 综合排名 -->
      <div class="ranking-section">
        <h4>综合成果排名</h4>
        <div class="ranking-list">
          <div 
            v-for="(item, index) in rankingData" 
            :key="item.name"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank-number">
              <span v-if="index === 0" class="gold">🥇</span>
              <span v-else-if="index === 1" class="silver">🥈</span>
              <span v-else-if="index === 2" class="bronze">🥉</span>
              <span v-else class="number">{{ index + 1 }}</span>
            </div>
            <div class="rank-info">
              <div class="rank-name">{{ item.name }}</div>
              <div class="rank-details">
                <span>成果数: {{ item.achievementCount }}</span>
                <span>转化率: {{ item.conversionRate }}%</span>
                <span>价值: {{ item.totalValue }}万</span>
              </div>
            </div>
            <div class="rank-score">
              <div class="score-number">{{ item.score }}</div>
              <div class="score-label">综合分</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'AchievementAnalysis',
  setup() {
    const viewMode = ref('overview')
    const comparisonDimension = ref('department')
    const comparisonDateRange = ref([])

    // 成果统计数据
    const achievementStats = reactive([
      {
        key: 'total',
        icon: '📊',
        label: '总成果数',
        value: 182,
        trend: 15.2,
        type: 'primary'
      },
      {
        key: 'converted',
        icon: '🔄',
        label: '已转化',
        value: 156,
        trend: 12.8,
        type: 'success'
      },
      {
        key: 'high-value',
        icon: '💎',
        label: '高价值成果',
        value: 45,
        trend: 8.5,
        type: 'warning'
      },
      {
        key: 'pending',
        icon: '⏳',
        label: '待转化',
        value: 26,
        trend: -5.2,
        type: 'info'
      }
    ])

    // 转化数据
    const conversionData = reactive({
      rate: 85.7,
      value: 3250,
      realized: 2890,
      expected: 4100,
      avgCycle: 185,
      minCycle: 45,
      maxCycle: 365
    })

    // 转化表格列
    const conversionColumns = [
      { title: '成果名称', dataIndex: 'name', key: 'name' },
      { title: '类型', dataIndex: 'type', key: 'type' },
      { title: '转化状态', dataIndex: 'status', key: 'status' },
      { title: '转化价值', dataIndex: 'value', key: 'value' },
      { title: '完成时间', dataIndex: 'completedTime', key: 'completedTime' },
      { title: '负责人', dataIndex: 'manager', key: 'manager' }
    ]

    // 转化表格数据
    const conversionTableData = ref([
      {
        key: '1',
        name: '智能水质监测系统专利',
        type: '发明专利',
        status: '已转化',
        value: 280,
        completedTime: '2024-12-15',
        manager: '张三'
      },
      {
        key: '2',
        name: '水处理节能技术',
        type: '实用新型',
        status: '转化中',
        value: 150,
        completedTime: '进行中',
        manager: '李四'
      },
      {
        key: '3',
        name: '污水处理工艺优化',
        type: '技术成果',
        status: '已转化',
        value: 320,
        completedTime: '2024-11-28',
        manager: '王五'
      }
      // ... 更多数据
    ])

    // 排名数据
    const rankingData = ref([
      {
        name: '技术研发部',
        achievementCount: 68,
        conversionRate: 92.5,
        totalValue: 1580,
        score: 95.2
      },
      {
        name: '创新中心',
        achievementCount: 52,
        conversionRate: 88.1,
        totalValue: 1240,
        score: 89.6
      },
      {
        name: '工程技术部',
        achievementCount: 43,
        conversionRate: 85.3,
        totalValue: 980,
        score: 85.8
      },
      {
        name: '质量检测部',
        achievementCount: 19,
        conversionRate: 78.9,
        totalValue: 450,
        score: 78.2
      }
    ])

    // 图表引用
    const achievementTypeChart = ref(null)
    const achievementLevelChart = ref(null)
    const conversionFlowChart = ref(null)
    const comparisonQuantityChart = ref(null)
    const comparisonEfficiencyChart = ref(null)

    // 方法
    const getConversionStatusColor = (status) => {
      const colors = {
        '已转化': 'green',
        '转化中': 'orange',
        '待转化': 'blue',
        '暂缓': 'red'
      }
      return colors[status] || 'default'
    }

    const initCharts = () => {
      // 成果类型分布图
      if (achievementTypeChart.value) {
        const chart = echarts.init(achievementTypeChart.value)
        chart.setOption({
          tooltip: { trigger: 'item' },
          series: [{
            name: '成果类型',
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 45, name: '发明专利', itemStyle: { color: '#1890ff' } },
              { value: 38, name: 'SCI论文', itemStyle: { color: '#52c41a' } },
              { value: 28, name: '软件著作权', itemStyle: { color: '#faad14' } },
              { value: 22, name: '实用新型', itemStyle: { color: '#f5222d' } },
              { value: 15, name: '标准制定', itemStyle: { color: '#722ed1' } },
              { value: 34, name: '其他', itemStyle: { color: '#13c2c2' } }
            ],
            label: {
              formatter: '{b}\n{c}项 ({d}%)'
            }
          }]
        })
      }

      // 成果等级分析图
      if (achievementLevelChart.value) {
        const chart = echarts.init(achievementLevelChart.value)
        chart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: ['国际领先', '国际先进', '国内领先', '国内先进', '一般']
          },
          yAxis: { type: 'value' },
          series: [{
            name: '成果数量',
            type: 'bar',
            data: [12, 28, 45, 67, 30],
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

      // 转化流程图
      if (conversionFlowChart.value) {
        const chart = echarts.init(conversionFlowChart.value)
        chart.setOption({
          tooltip: { trigger: 'item' },
          series: [{
            type: 'sankey',
            data: [
              { name: '技术成果' },
              { name: '专利申请' },
              { name: '技术转让' },
              { name: '产业化' },
              { name: '市场应用' }
            ],
            links: [
              { source: '技术成果', target: '专利申请', value: 80 },
              { source: '专利申请', target: '技术转让', value: 65 },
              { source: '技术转让', target: '产业化', value: 45 },
              { source: '产业化', target: '市场应用', value: 38 }
            ],
            itemStyle: { borderWidth: 1 },
            lineStyle: { opacity: 0.6, curveness: 0.5 }
          }]
        })
      }
    }

    onMounted(() => {
      nextTick(() => {
        initCharts()
      })
    })

    watch(viewMode, () => {
      nextTick(() => {
        initCharts()
      })
    })

    return {
      viewMode,
      comparisonDimension,
      comparisonDateRange,
      achievementStats,
      conversionData,
      conversionColumns,
      conversionTableData,
      rankingData,
      achievementTypeChart,
      achievementLevelChart,
      conversionFlowChart,
      comparisonQuantityChart,
      comparisonEfficiencyChart,
      getConversionStatusColor
    }
  }
}
</script>

<style scoped>
.achievement-analysis {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.analysis-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.achievement-stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.achievement-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.achievement-stat-card.primary {
  border-left: 4px solid #1890ff;
}

.achievement-stat-card.success {
  border-left: 4px solid #52c41a;
}

.achievement-stat-card.warning {
  border-left: 4px solid #faad14;
}

.achievement-stat-card.info {
  border-left: 4px solid #13c2c2;
}

.stat-icon {
  font-size: 32px;
  margin-right: 12px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin: 4px 0;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.positive {
  color: #52c41a;
}

.stat-trend.negative {
  color: #ff4d4f;
}

.charts-row {
  margin-top: 20px;
}

.chart-container {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  height: 300px;
}

.chart-container h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.chart-content {
  height: 250px;
}

.conversion-overview {
  margin-bottom: 20px;
}

.conversion-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 140px;
}

.conversion-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 24px;
  margin-right: 8px;
}

.card-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.card-info p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
}

.conversion-rate {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.conversion-value,
.conversion-cycle {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.conversion-progress {
  margin-top: 8px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255,255,255,0.9);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.value-breakdown,
.cycle-range {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.8;
}

.conversion-flow {
  margin: 20px 0;
}

.flow-chart {
  height: 300px;
  background: #fafafa;
  border-radius: 8px;
}

.conversion-table {
  margin-top: 20px;
}

.value-text {
  font-weight: 600;
  color: #1890ff;
}

.comparison-controls {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.comparison-charts {
  margin-bottom: 20px;
}

.ranking-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: #f0f0f0;
}

.ranking-item.top-three {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%);
  border: 1px solid #faad14;
}

.rank-number {
  width: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
}

.rank-number .number {
  font-size: 20px;
  font-weight: 700;
  color: #8c8c8c;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.rank-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.rank-score {
  text-align: center;
}

.score-number {
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  color: #8c8c8c;
}
</style> 