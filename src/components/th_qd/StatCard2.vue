<!--
/**
 * @fileoverview 统计卡片组件2.0
 * @description 增强版统计卡片，支持研发投入强度、战新比等关键指标展示
 * @author AI助手
 * @version 2.0
 * @since 2025-01-17
 */
-->
<template>
  <div class="stat-card-v2" :class="cardClass">
    <div class="card-header">
      <div class="icon-wrapper" :style="iconStyle">
        <span class="card-icon">{{ icon }}</span>
      </div>
      <div class="header-info">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="trend-indicator" v-if="trend !== undefined">
        <span class="trend-arrow" :class="trendClass">
          <CaretUpOutlined v-if="trend > 0" />
          <CaretDownOutlined v-if="trend < 0" />
          <MinusOutlined v-if="trend === 0" />
        </span>
        <span class="trend-value">{{ Math.abs(trend) }}%</span>
      </div>
    </div>
    
    <div class="card-content">
      <div class="main-value">
        <span class="value-number">{{ formatValue(value) }}</span>
        <span class="value-unit" v-if="unit">{{ unit }}</span>
      </div>
      
      <!-- 进度条显示 -->
      <div class="progress-section" v-if="showProgress">
        <div class="progress-bar">
          <div class="progress-fill" :style="progressStyle"></div>
        </div>
        <div class="progress-info">
          <span>完成度: {{ progressPercentage }}%</span>
          <span v-if="target">目标: {{ target }}{{ unit }}</span>
        </div>
      </div>
      
      <!-- 详细信息 -->
      <div class="detail-info" v-if="details && details.length">
        <div class="detail-item" v-for="detail in details" :key="detail.label">
          <span class="detail-label">{{ detail.label }}:</span>
          <span class="detail-value">{{ detail.value }}</span>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="mini-chart" v-if="chartData && chartData.length" ref="miniChart"></div>
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { CaretUpOutlined, CaretDownOutlined, MinusOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'

export default {
  name: 'StatCard2',
  components: {
    CaretUpOutlined,
    CaretDownOutlined,
    MinusOutlined
  },
  props: {
    // 基础属性
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: '📊'
    },
    
    // 样式属性
    type: {
      type: String,
      default: 'default', // default, primary, success, warning, danger, info
      validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    gradient: {
      type: Boolean,
      default: false
    },
    customColors: {
      type: Object,
      default: () => ({})
    },
    
    // 趋势相关
    trend: {
      type: Number,
      default: undefined
    },
    
    // 进度相关
    showProgress: {
      type: Boolean,
      default: false
    },
    target: {
      type: [Number, String],
      default: null
    },
    
    // 详细信息
    details: {
      type: Array,
      default: () => []
    },
    
    // 图表数据
    chartData: {
      type: Array,
      default: () => []
    },
    chartType: {
      type: String,
      default: 'line', // line, bar, area
      validator: (value) => ['line', 'bar', 'area'].includes(value)
    }
  },
  setup(props) {
    const miniChart = ref(null)
    let chartInstance = null

    // 计算属性
    const cardClass = computed(() => {
      return [
        `stat-card-${props.type}`,
        {
          'gradient-bg': props.gradient,
          'has-chart': props.chartData && props.chartData.length > 0
        }
      ]
    })

    const iconStyle = computed(() => {
      const baseStyle = {}
      
      if (props.customColors.iconBg) {
        baseStyle.backgroundColor = props.customColors.iconBg
      }
      
      return baseStyle
    })

    const trendClass = computed(() => {
      if (props.trend > 0) return 'trend-up'
      if (props.trend < 0) return 'trend-down'
      return 'trend-neutral'
    })

    const progressPercentage = computed(() => {
      if (!props.target || !props.value) return 0
      return Math.min(Math.round((Number(props.value) / Number(props.target)) * 100), 100)
    })

    const progressStyle = computed(() => {
      return {
        width: `${progressPercentage.value}%`,
        backgroundColor: props.customColors.progressColor || getProgressColor(progressPercentage.value)
      }
    })

    // 方法
    const formatValue = (value) => {
      if (typeof value === 'number') {
        if (value >= 10000) {
          return (value / 10000).toFixed(1) + '万'
        } else if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'k'
        }
        return value.toLocaleString()
      }
      return value
    }

    const getProgressColor = (percentage) => {
      if (percentage >= 90) return '#52c41a'
      if (percentage >= 70) return '#1890ff'
      if (percentage >= 50) return '#faad14'
      return '#ff4d4f'
    }

    const initMiniChart = () => {
      if (!miniChart.value || !props.chartData || props.chartData.length === 0) {
        return
      }

      if (chartInstance) {
        chartInstance.dispose()
      }

      chartInstance = echarts.init(miniChart.value)
      
      const option = {
        grid: {
          left: 0,
          right: 0,
          top: 5,
          bottom: 5,
          containLabel: false
        },
        xAxis: {
          type: 'category',
          data: props.chartData.map((_, index) => index),
          show: false
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [{
          data: props.chartData,
          type: props.chartType,
          smooth: props.chartType === 'line',
          symbol: 'none',
          lineStyle: {
            color: props.customColors.chartColor || '#1890ff',
            width: 2
          },
          areaStyle: props.chartType === 'area' ? {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]
            }
          } : null,
          itemStyle: {
            color: props.customColors.chartColor || '#1890ff'
          }
        }]
      }

      chartInstance.setOption(option)
    }

    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initMiniChart()
      })
    })

    // 监听数据变化
    watch(() => props.chartData, () => {
      nextTick(() => {
        initMiniChart()
      })
    }, { deep: true })

    return {
      miniChart,
      cardClass,
      iconStyle,
      trendClass,
      progressPercentage,
      progressStyle,
      formatValue
    }
  }
}
</script>

<style scoped>
.stat-card-v2 {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card-v2:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.stat-card-v2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #722ed1);
}

.stat-card-primary::before {
  background: linear-gradient(90deg, #1890ff, #40a9ff);
}

.stat-card-success::before {
  background: linear-gradient(90deg, #52c41a, #73d13d);
}

.stat-card-warning::before {
  background: linear-gradient(90deg, #faad14, #ffc53d);
}

.stat-card-danger::before {
  background: linear-gradient(90deg, #ff4d4f, #ff7875);
}

.stat-card-info::before {
  background: linear-gradient(90deg, #13c2c2, #36cfc9);
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.gradient-bg .card-title,
.gradient-bg .card-subtitle,
.gradient-bg .detail-label,
.gradient-bg .detail-value {
  color: rgba(255, 255, 255, 0.9);
}

.card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.card-icon {
  font-size: 24px;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #262626;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 12px;
  color: #8c8c8c;
  margin: 0;
  line-height: 1.2;
}

.trend-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.trend-arrow {
  font-size: 16px;
  margin-bottom: 2px;
}

.trend-arrow.trend-up {
  color: #52c41a;
}

.trend-arrow.trend-down {
  color: #ff4d4f;
}

.trend-arrow.trend-neutral {
  color: #8c8c8c;
}

.trend-value {
  font-size: 12px;
  font-weight: 500;
}

.card-content {
  margin-bottom: 16px;
}

.main-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.value-number {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  line-height: 1;
}

.gradient-bg .value-number {
  color: white;
}

.value-unit {
  font-size: 16px;
  color: #8c8c8c;
  margin-left: 4px;
}

.progress-section {
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8c8c8c;
}

.detail-info {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #8c8c8c;
  font-weight: 400;
}

.detail-value {
  color: #262626;
  font-weight: 500;
}

.mini-chart {
  height: 60px;
  margin-top: 12px;
}

.has-chart .card-content {
  margin-bottom: 8px;
}

.card-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-card-v2 {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .trend-indicator {
    align-self: flex-end;
    margin-top: -40px;
  }
  
  .value-number {
    font-size: 28px;
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }
  
  .card-icon {
    font-size: 20px;
  }
}
</style> 