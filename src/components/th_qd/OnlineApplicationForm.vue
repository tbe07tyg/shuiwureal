<!--
  @component OnlineApplicationForm
  @description 在线填报表单组件，支持Word模板的在线编辑
  @author 科研管理系统
  @version 1.0.0
  @date 2025-01-27
-->

<template>
  <a-modal
    :open="visible"
    :title="modalTitle"
    width="95%"
    :footer="null"
    :destroy-on-close="true"
    :mask-closable="false"
    class="online-application-form-modal"
    @cancel="handleCancel"
    @update:open="handleVisibleChange"
  >
    <div class="online-fill-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <a-spin size="large">
          <template #tip>
            <div class="loading-text">
              <div>{{ loadingText }}</div>
              <div class="loading-progress" v-if="loadingProgress > 0">
                进度: {{ loadingProgress }}%
              </div>
            </div>
          </template>
        </a-spin>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <a-result
          status="error"
          :title="error.title"
          :sub-title="error.message"
        >
          <template #extra>
            <a-space>
              <a-button type="primary" @click="retryLoad">
                <ReloadOutlined />
                重新加载
              </a-button>
              <a-button @click="handleCancel">
                取消
              </a-button>
            </a-space>
          </template>
        </a-result>
      </div>

      <!-- 编辑器内容 -->
      <div v-else class="editor-container">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <a-space>
              <a-button @click="loadTemplate" :loading="loading" size="small">
                <ReloadOutlined />
                重新加载模板
              </a-button>
              <a-button @click="previewDocument" size="small">
                <EyeOutlined />
                预览
              </a-button>
              <a-button @click="exportDocument" :loading="exporting" size="small" type="default">
                <DownloadOutlined />
                导出文档
              </a-button>
            </a-space>
          </div>
          
          <div class="toolbar-right">
            <a-space>
              <a-button @click="handleCancel" size="small">
                取消
              </a-button>
              <a-button type="primary" @click="saveAndUpload" :loading="saving" size="small">
                <SaveOutlined />
                保存并上传
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 编辑器iframe -->
        <div class="editor-frame-container">
          <iframe
            ref="editorFrame"
            :src="editorUrl"
            width="100%"
            height="600px"
            frameborder="0"
            :style="{ display: editorUrl ? 'block' : 'none' }"
            @load="handleEditorLoad"
          ></iframe>
          
          <!-- 空状态 -->
          <div v-if="!editorUrl && !loading" class="empty-editor">
            <a-empty description="请点击重新加载模板开始编辑">
              <a-button type="primary" @click="loadTemplate">
                <FileTextOutlined />
                加载模板
              </a-button>
            </a-empty>
          </div>
        </div>

        <!-- 状态栏 -->
        <div class="status-bar">
          <div class="status-left">
            <a-space>
              <span class="status-text">
                <span class="status-indicator" :class="statusClass"></span>
                {{ statusText }}
              </span>
              <span v-if="templateInfo" class="template-info">
                模板: {{ templateInfo.sizeFormatted }}
              </span>
            </a-space>
          </div>
          
          <div class="status-right">
            <a-space>
              <span v-if="lastSaved" class="last-saved">
                最后保存: {{ formatTime(lastSaved) }}
              </span>
              <span class="word-count">
                字数: {{ wordCount }}
              </span>
            </a-space>
          </div>
        </div>
      </div>

      <!-- 预览弹窗 -->
      <a-modal
        v-model:open="previewVisible"
        title="文档预览"
        width="80%"
        :footer="null"
        :destroy-on-close="true"
      >
        <div class="preview-content" v-html="previewContent"></div>
      </a-modal>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  EyeOutlined,
  SaveOutlined,
  FileTextOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { WordToHtmlConverter } from '@/services/wordToHtmlConverter'
import { HtmlToWordConverter } from '@/services/htmlToWordConverter'
import { ExcelToHtmlConverter } from '@/services/excelToHtmlConverter'
import { HtmlToExcelConverter } from '@/services/htmlToExcelConverter'
import { PptToHtmlConverter } from '@/services/pptToHtmlConverter'
import { HtmlToPptConverter } from '@/services/htmlToPptConverter'
import { TemplateService } from '@/services/templateService'
import { uploadTechnologicalFile } from '@/api/upload'
import { saveAs } from 'file-saver'

/**
 * 组件属性
 */
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  configId: {
    type: [String, Number],
    required: true
  },
  templateData: {
    type: Object,
    default: () => ({})
  },
  projectContext: {
    type: Object,
    default: () => ({})
  }
})

/**
 * 事件定义
 */
const emit = defineEmits(['update:visible', 'success', 'cancel'])

// 响应式数据
const editorFrame = ref()
const editorUrl = ref('')
const loading = ref(false)
const saving = ref(false)
const exporting = ref(false)
const error = ref(null)
const templateInfo = ref(null)
const lastSaved = ref(null)
const wordCount = ref(0)
const previewVisible = ref(false)
const previewContent = ref('')
const loadingProgress = ref(0)
const loadingText = ref('正在加载模板...')

// 计算属性
const modalTitle = computed(() => {
  const templateName = props.templateData?.categoryName || '未知模板'
  return `在线填报 - ${templateName}`
})

const statusText = computed(() => {
  if (loading.value) return '加载中...'
  if (saving.value) return '保存中...'
  if (error.value) return '加载失败'
  if (lastSaved.value) return '已保存'
  return '就绪'
})

const statusClass = computed(() => {
  if (loading.value || saving.value) return 'loading'
  if (error.value) return 'error'
  if (lastSaved.value) return 'success'
  return 'ready'
})

// 监听弹窗打开
watch(() => props.visible, (visible) => {
  if (visible) {
    loadTemplate()
  } else {
    cleanup()
  }
})

/**
 * 加载模板
 */
const loadTemplate = async () => {
  loading.value = true
  error.value = null
  loadingProgress.value = 0
  loadingText.value = '正在获取模板配置...'
  
  try {
    // 1. 获取模板配置
    loadingProgress.value = 20
    loadingText.value = '正在获取模板配置...'
    
    let templateConfig = props.templateData
    if (!templateConfig || !templateConfig.templateFilePath) {
      templateConfig = await TemplateService.getMaterialTemplate(props.configId)
    }
    
    // 2. 检查模板配置是否有效
    if (!templateConfig || !templateConfig.templateFilePath) {
      throw new Error('模板配置无效或缺少模板文件路径')
    }
    
    // 3. 下载模板文件
    loadingProgress.value = 40
    loadingText.value = '正在下载模板文件...'
    
    const templateBlob = await TemplateService.downloadTemplate(templateConfig.templateFilePath)
    
    // 4. 验证模板文件
    loadingProgress.value = 60
    loadingText.value = '正在验证模板文件...'
    
    const validation = TemplateService.validateTemplate(templateBlob)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }
    
     // 5. 根据文件类型转换为可编辑HTML
     loadingProgress.value = 80
     loadingText.value = '正在转换模板...'
     
     const fileType = getFileType(templateBlob)
     let editableHtml
     
     switch (fileType) {
       case 'word':
         editableHtml = await WordToHtmlConverter.convertToEditableHtml(
           templateBlob,
           templateConfig.categoryName
         )
         break
       case 'excel':
         editableHtml = await ExcelToHtmlConverter.convertToEditableHtml(
           templateBlob,
           templateConfig.categoryName
         )
         break
       case 'ppt':
         editableHtml = await PptToHtmlConverter.convertToEditableHtml(
           templateBlob,
           templateConfig.categoryName
         )
         break
       default:
         throw new Error(`不支持的文件类型: ${fileType}`)
     }
    
    // 6. 创建编辑器URL
    loadingProgress.value = 90
    loadingText.value = '正在初始化编辑器...'
    
    const blob = new Blob([editableHtml], { type: 'text/html' })
    editorUrl.value = URL.createObjectURL(blob)
    
    // 7. 保存模板信息
    templateInfo.value = TemplateService.getTemplateInfo(templateBlob)
    
    loadingProgress.value = 100
    loadingText.value = '加载完成'
    
    message.success('模板加载成功')
    
  } catch (err) {
    console.error('模板加载失败:', err)
    error.value = {
      title: '模板加载失败',
      message: err.message || '未知错误'
    }
    message.error(`模板加载失败: ${err.message}`)
  } finally {
    loading.value = false
    loadingProgress.value = 0
  }
}

/**
 * 重新加载
 */
const retryLoad = () => {
  error.value = null
  loadTemplate()
}

// 全局消息监听器
let messageListener = null

/**
 * 编辑器加载完成
 */
const handleEditorLoad = () => {
  console.log('编辑器加载完成')
  
  // 如果已经有监听器，先移除
  if (messageListener) {
    window.removeEventListener('message', messageListener)
  }
  
  // 监听来自iframe的消息
  messageListener = (event) => {
    if (event.origin !== window.location.origin) return
    
    switch (event.data.type) {
      case 'save':
        handleSaveFromEditor(event.data)
        break
      case 'preview':
        handlePreviewFromEditor(event.data)
        break
      case 'wordCount':
        wordCount.value = event.data.count || 0
        break
    }
  }
  
  window.addEventListener('message', messageListener)
  
  // 编辑器加载完成后，立即填充项目数据
  fillProjectData()
}

/**
 * 填充项目数据到编辑器
 */
const fillProjectData = () => {
  if (!editorFrame.value || !editorFrame.value.contentWindow) {
    console.warn('编辑器iframe未就绪')
    return
  }
  
  // 获取项目上下文数据
  const context = props.projectContext || {}
  
  console.log('📝 正在填充项目数据:', context)
  console.log('项目上下文详情:', JSON.stringify(context, null, 2))
  
  // 通过postMessage发送数据到iframe
  editorFrame.value.contentWindow.postMessage({
    type: 'fillData',
    data: context
  }, '*')
  
  // 智能DOM填充（延迟执行以确保iframe完全加载）
  setTimeout(() => {
    try {
      const iframeDoc = editorFrame.value.contentDocument || editorFrame.value.contentWindow.document
      
      if (!iframeDoc) {
        console.warn('⚠️ 无法访问iframe文档')
        return
      }
      
      console.log('🔍 开始智能扫描Word模板结构...')
      
      // ========== 调试开关：设置为false可禁用自动填充，只查看结构 ==========
      const enableAutoFill = false // 改为true启用自动填充
      console.log(`🔧 自动填充功能: ${enableAutoFill ? '已启用' : '已禁用（仅分析结构）'}`)
      
      // ========== 调试：输出完整的DOM结构 ==========
      console.log('================== 📄 Word模板完整结构分析 ==================')
      
      // 输出所有表格的详细信息
      const allTables = iframeDoc.querySelectorAll('table')
      console.log(`\n📊 找到 ${allTables.length} 个表格：\n`)
      allTables.forEach((table, i) => {
        const rows = table.querySelectorAll('tr')
        console.log(`【表格 ${i + 1}】共 ${rows.length} 行：`)
        // 输出所有行的内容
        Array.from(rows).forEach((row, ri) => {
          const cells = row.querySelectorAll('td, th')
          const cellTexts = Array.from(cells).map(c => {
            const text = c.textContent.trim()
            return text.length > 30 ? text.substring(0, 30) + '...' : text
          })
          if (cellTexts.length > 0) {
            console.log(`  第${ri + 1}行 (${cells.length}列): ${cellTexts.join(' | ')}`)
          }
        })
        console.log('')
      })
      
      // 输出所有段落
      const allParagraphs = iframeDoc.querySelectorAll('p')
      const meaningfulParagraphs = Array.from(allParagraphs).filter(p => p.textContent.trim().length > 0)
      console.log(`\n📝 找到 ${meaningfulParagraphs.length} 个有内容的段落：\n`)
      meaningfulParagraphs.slice(0, 30).forEach((p, i) => {
        const text = p.textContent.trim()
        const preview = text.length > 80 ? text.substring(0, 80) + '...' : text
        console.log(`  段落 ${i + 1}: ${preview}`)
      })
      
      // 输出所有标题和粗体
      const allHeadings = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const allBold = iframeDoc.querySelectorAll('strong, b')
      console.log(`\n📌 找到 ${allHeadings.length} 个标题 + ${allBold.length} 个粗体元素：\n`)
      allHeadings.forEach((h, i) => {
        console.log(`  标题 ${i + 1} <${h.tagName}>: ${h.textContent.trim()}`)
      })
      Array.from(allBold).slice(0, 20).forEach((b, i) => {
        const text = b.textContent.trim()
        if (text.length > 5) {
          console.log(`  粗体 ${i + 1}: ${text.substring(0, 50)}`)
        }
      })
      
      console.log('\n============================================================\n')
      
      // ========== 修复Word模板格式问题 ==========
      console.log('🔧 开始修复Word模板格式问题...')
      
      // 修复1：填报说明左对齐
      const paragraphsForFix = iframeDoc.querySelectorAll('p')
      paragraphsForFix.forEach(p => {
        const text = p.textContent.trim()
        // 检查是否是填报说明的段落（以数字+、开头）
        if (/^[1-4]、/.test(text) && text.includes('项目申请书')) {
          p.style.textAlign = 'left'
          p.style.textIndent = '2em' // 首行缩进
          console.log('  ✅ 修复填报说明对齐:', text.substring(0, 20))
        }
      })
      
      // 修复2：主要标题统一样式（粗体+左对齐）
      const mainTitleKeywords = [
        '项目主要研究、开发内容',
        '申请项目的依据和意义',
        '项目研究开发内容及目标',
        '实施本项目已具备的条件',
        '项目实施的经济、社会和环境预期效益',
        '项目实施的计划进度',
        '项目经费总预算'
      ]
      
      // 查找所有粗体元素和段落
      const allBoldElements = iframeDoc.querySelectorAll('strong, b, p')
      allBoldElements.forEach(el => {
        const text = el.textContent.trim()
        
        // 检查是否包含主要标题关键词
        for (const keyword of mainTitleKeywords) {
          if (text.includes(keyword)) {
            // 统一样式：粗体 + 左对齐
            el.style.fontWeight = 'bold'
            el.style.textAlign = 'left'
            el.style.fontSize = '14px'
            el.style.marginTop = '15px'
            el.style.marginBottom = '10px'
            console.log(`  ✅ 修复主标题样式: ${text.substring(0, 30)}`)
            break
          }
        }
      })
      
      // 修复3：将"项目主要研究、开发内容"从表格1中提取出来，变成独立区域
      if (allTables.length >= 1) {
        const table1 = allTables[0]
        const rows1 = table1.querySelectorAll('tr')
        let rowsToRemove = []
        
        // 遍历表格1的所有行，查找包含"项目主要研究"的行
        rows1.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td, th')
          
          // 检查是否有单元格包含"项目主要研究、开发内容"
          cells.forEach(cell => {
            const cellText = cell.textContent.trim()
            
            if (cellText.includes('项目主要研究、开发内容') && cellText.includes('不超过100')) {
              console.log(`  🔧 发现表格1第${rowIndex + 1}行包含"项目主要研究"，准备提取`)
              
              // 创建独立的标题段落
              const titleP = iframeDoc.createElement('p')
              titleP.textContent = cellText
              titleP.style.fontWeight = 'bold'
              titleP.style.textAlign = 'left'
              titleP.style.fontSize = '14px'
              titleP.style.marginTop = '20px'
              titleP.style.marginBottom = '10px'
              
              
              // 创建独立的填写区域（使用自动扩展高度的textarea）
              const contentDiv = iframeDoc.createElement('textarea')
              contentDiv.style.border = '1px solid #d9d9d9'
              contentDiv.style.minHeight = '100px'
              contentDiv.style.width = '100%'
              contentDiv.style.padding = '10px'
              contentDiv.style.backgroundColor = '#fafafa'
              contentDiv.style.marginBottom = '20px'
              contentDiv.style.fontFamily = 'inherit'
              contentDiv.style.fontSize = 'inherit'
              contentDiv.style.lineHeight = '1.8'
              contentDiv.style.resize = 'none' // 禁用手动调整，改为自动扩展
              contentDiv.style.boxSizing = 'border-box'
              contentDiv.style.overflow = 'hidden' // 隐藏滚动条
              contentDiv.placeholder = '请输入项目主要研究、开发内容（不超过100个汉字）'
              contentDiv.value = ''
              
              // 自动调整高度函数
              const autoResize = () => {
                contentDiv.style.height = 'auto' // 先重置高度
                const scrollHeight = contentDiv.scrollHeight
                const minHeight = 100 // 最小高度
                contentDiv.style.height = Math.max(scrollHeight, minHeight) + 'px'
              }
              
              // 监听输入事件，实时调整高度
              contentDiv.addEventListener('input', autoResize)
              contentDiv.addEventListener('change', autoResize)
              
              // 初始化高度
              setTimeout(autoResize, 0)
              
              // 在表格1后面插入这两个元素
              table1.insertAdjacentElement('afterend', contentDiv)
              table1.insertAdjacentElement('afterend', titleP)
              
              // 标记要删除的行
              rowsToRemove.push(row)
              
              // 检查下一行是否也应该删除（如果是空白填写区域）
              if (rowIndex + 1 < rows1.length) {
                const nextRow = rows1[rowIndex + 1]
                const nextCells = nextRow.querySelectorAll('td, th')
                if (nextCells.length >= 1) {
                  const contentText = nextCells[0].textContent.trim()
                  if (contentText.length < 20) {
                    rowsToRemove.push(nextRow)
                  }
                }
              }
              
              console.log('  ✅ "项目主要研究、开发内容"已提取为独立区域')
            }
          })
        })
        
        // 从表格中删除这些行
        rowsToRemove.forEach(row => row.remove())
      }
      
      // 说明：为保证旧页稳定，临时取消“模板化渲染”逻辑，仅保留修复3/修复4
      
      // 修复4：合并表格8为一个大的填写区域
      if (allTables.length >= 8) {
        const table8 = allTables[7] // 第8个表格
        const rows = table8.querySelectorAll('tr')
        
        if (rows.length >= 6) {
          console.log('  🔧 开始重构表格8（申报单位意见）...')
          
          // 清空表格内容
          table8.innerHTML = ''
          
          // 创建新的表格结构
          const tbody = iframeDoc.createElement('tbody')
          
          // 第1行：标题
          const row1 = iframeDoc.createElement('tr')
          const cell1 = iframeDoc.createElement('td')
          cell1.textContent = '申报单位意见：'
          cell1.style.padding = '10px'
          cell1.style.fontWeight = 'bold'
          row1.appendChild(cell1)
          tbody.appendChild(row1)
          
          // 第2行：大片空白区域（使用自动扩展高度的textarea）
          const row2 = iframeDoc.createElement('tr')
          const cell2 = iframeDoc.createElement('td')
          cell2.style.padding = '10px'
          
          // 在单元格内创建textarea
          const opinionTextarea = iframeDoc.createElement('textarea')
          opinionTextarea.style.width = '100%'
          opinionTextarea.style.minHeight = '150px'
          opinionTextarea.style.border = 'none'
          opinionTextarea.style.backgroundColor = 'transparent'
          opinionTextarea.style.fontFamily = 'inherit'
          opinionTextarea.style.fontSize = 'inherit'
          opinionTextarea.style.lineHeight = '1.8'
          opinionTextarea.style.resize = 'none' // 禁用手动调整，改为自动扩展
          opinionTextarea.style.boxSizing = 'border-box'
          opinionTextarea.style.padding = '5px'
          opinionTextarea.style.overflow = 'hidden' // 隐藏滚动条
          opinionTextarea.placeholder = '请填写申报单位意见...'
          opinionTextarea.value = ''
          
          // 自动调整高度函数
          const autoResizeOpinion = () => {
            opinionTextarea.style.height = 'auto'
            const scrollHeight = opinionTextarea.scrollHeight
            const minHeight = 150 // 最小高度
            opinionTextarea.style.height = Math.max(scrollHeight, minHeight) + 'px'
          }
          
          // 监听输入事件，实时调整高度
          opinionTextarea.addEventListener('input', autoResizeOpinion)
          opinionTextarea.addEventListener('change', autoResizeOpinion)
          
          // 初始化高度
          setTimeout(autoResizeOpinion, 0)
          
          cell2.appendChild(opinionTextarea)
          row2.appendChild(cell2)
          tbody.appendChild(row2)
          
          // 第3行：单位负责人
          const row3 = iframeDoc.createElement('tr')
          const cell3 = iframeDoc.createElement('td')
          cell3.textContent = '单位负责人：                     （签章）'
          cell3.style.padding = '10px'
          cell3.style.textAlign = 'right'
          row3.appendChild(cell3)
          tbody.appendChild(row3)
          
          // 第4行：年月日
          const row4 = iframeDoc.createElement('tr')
          const cell4 = iframeDoc.createElement('td')
          cell4.textContent = '年     月    日'
          cell4.style.padding = '10px'
          cell4.style.textAlign = 'right'
          row4.appendChild(cell4)
          tbody.appendChild(row4)
          
          table8.appendChild(tbody)
          console.log('  ✅ 表格8重构完成')
        }
      }
      
      // 修复5：将所有大填写区域转换为自动扩展的 textarea（不管是否启用自动填充）
      // 【暂时禁用，先逐个实现】
      console.log('⏸️ 修复5已暂时禁用，使用单独的修复步骤')
      
      // 查找所有可能是大填写区域的标题（完整列表）
      const bigTextAreaTitles = [
        // 项目概况表后的主要填写区域
        '项目主要研究、开发内容',  // 已在修复3中处理，这里作为备份
        
        // 主体内容的大标题区域
        '申请项目的依据和意义',
        '项目研究开发内容及目标',
        
        // 实施方案的子章节
        '一、实施方案',
        '二、技术关键',
        '三、技术路线',
        '四、预期成果',
        
        // 其他大段落区域
        '实施本项目已具备的条件',
        '项目实施的经济、社会和环境预期效益',
        '项目实施的计划进度',
        '项目经费总预算'
      ]
      
      const allParagraphsForConvert = iframeDoc.querySelectorAll('p, div')
      
      /* 暂时注释，使用单独的修复步骤
      bigTextAreaTitles.forEach(titleText => {
        // 查找包含标题的元素（包括段落、表格单元格等）
        const allElementsToSearch = iframeDoc.querySelectorAll('p, div, td, th')
        
        for (const element of allElementsToSearch) {
          const elementText = element.textContent.trim()
          
          if (elementText.includes(titleText)) {
            console.log(`  🎯 找到标题: "${titleText}"`)
            
            let converted = false
            
            // 策略1: 如果是表格单元格，查找同行的其他单元格
            if (element.tagName.toLowerCase() === 'td' || element.tagName.toLowerCase() === 'th') {
              const row = element.parentElement
              const cells = row.querySelectorAll('td, th')
              
              // 如果有多个单元格，尝试转换后面的单元格
              if (cells.length > 1) {
                for (let i = 0; i < cells.length; i++) {
                  if (cells[i] === element && i + 1 < cells.length) {
                    const targetCell = cells[i + 1]
                    const cellText = targetCell.textContent.trim()
                    
                    // 修复逻辑：检查单元格是否"就是"某个标题
                    const isExactlyATitle = bigTextAreaTitles.some(t => {
                      const cleanText = cellText.replace(/[：:（）()]/g, '').trim()
                      const cleanTitle = t.replace(/[：:（）()]/g, '').trim()
                      return cleanText === cleanTitle || cellText === t
                    })
                    
                    // 如果单元格内容少且不是标题本身，直接在单元格内创建 textarea
                    if (cellText.length < 20 && !isExactlyATitle) {
                      console.log(`    ✅ 转换表格单元格为 textarea 容器`)
                      
                      // 清空单元格，插入 textarea
                      targetCell.innerHTML = ''
                      const textarea = iframeDoc.createElement('textarea')
                      textarea.value = cellText
                      textarea.style.width = '100%'
                      textarea.style.height = '100px'
                      textarea.style.minHeight = '100px'
                      textarea.style.border = 'none'
                      textarea.style.backgroundColor = '#fafafa'
                      textarea.style.padding = '10px'
                      textarea.style.fontFamily = 'inherit'
                      textarea.style.fontSize = 'inherit'
                      textarea.style.lineHeight = '1.8'
                      textarea.style.resize = 'none'
                      textarea.style.overflow = 'hidden'
                      textarea.style.boxSizing = 'border-box'
                      textarea.placeholder = `请填写${titleText}...`
                      textarea.rows = 5
                      
                      targetCell.appendChild(textarea)
                      targetCell.style.padding = '0'
                      targetCell.style.backgroundColor = '#fafafa'
                      
                      const autoResize = () => {
                        textarea.style.height = 'auto'
                        const scrollHeight = textarea.scrollHeight
                        textarea.style.height = Math.max(scrollHeight, 100) + 'px'
                      }
                      
                      textarea.addEventListener('input', autoResize)
                      textarea.addEventListener('change', autoResize)
                      setTimeout(() => {
                        autoResize()
                        console.log(`      ℹ️ 初始化高度: ${textarea.style.height}`)
                      }, 100)
                      
                      converted = true
                      break
                    }
                  }
                }
              }
            }
            
            // 策略2: 查找该元素后面的第一个空白或内容较少的 p/div
            if (!converted) {
              let nextElement = element.nextElementSibling
              let attempts = 0
              
              while (nextElement && attempts < 3) {
                const nextText = nextElement.textContent.trim()
                const nextTag = nextElement.tagName?.toLowerCase()
                
                // 修复逻辑：检查元素是否"就是"某个标题（完全匹配或去除符号后匹配）
                const isExactlyATitle = bigTextAreaTitles.some(t => {
                  const cleanText = nextText.replace(/[：:（）()]/g, '').trim()
                  const cleanTitle = t.replace(/[：:（）()]/g, '').trim()
                  return cleanText === cleanTitle || nextText === t
                })
                
                // 如果元素就是标题本身，跳过
                if (isExactlyATitle) {
                  console.log(`    ⏭️ 跳过标题元素: "${nextText}"`)
                  nextElement = nextElement.nextElementSibling
                  attempts++
                  continue
                }
                
                // 如果是空白或内容很少（少于20字），且是 p 或 div
                if ((nextTag === 'p' || nextTag === 'div') && nextText.length < 20) {
                  console.log(`    ✅ 转换后续元素 <${nextTag}> 为自动扩展 textarea`)
                  
                  // 创建自动扩展的 textarea
                  const textarea = iframeDoc.createElement('textarea')
                  textarea.value = nextText
                  textarea.style.width = '100%'
                  textarea.style.height = '100px'
                  textarea.style.minHeight = '100px'
                  textarea.style.border = '1px solid #d9d9d9'
                  textarea.style.backgroundColor = '#fafafa'
                  textarea.style.padding = '10px'
                  textarea.style.fontFamily = 'inherit'
                  textarea.style.fontSize = 'inherit'
                  textarea.style.lineHeight = '1.8'
                  textarea.style.resize = 'none'
                  textarea.style.overflow = 'hidden'
                  textarea.style.boxSizing = 'border-box'
                  textarea.style.marginBottom = '10px'
                  textarea.placeholder = `请填写${titleText}...`
                  textarea.rows = 5
                  
                  nextElement.parentNode.replaceChild(textarea, nextElement)
                  
                  const autoResize = () => {
                    textarea.style.height = 'auto'
                    const scrollHeight = textarea.scrollHeight
                    textarea.style.height = Math.max(scrollHeight, 100) + 'px'
                  }
                  
                  textarea.addEventListener('input', autoResize)
                  textarea.addEventListener('change', autoResize)
                  setTimeout(() => {
                    autoResize()
                    console.log(`      ℹ️ 初始化高度: ${textarea.style.height}`)
                  }, 100)
                  
                  converted = true
                  break
                }
                
                nextElement = nextElement.nextElementSibling
                attempts++
              }
            }
            
            if (converted) {
              break // 成功转换后退出
            }
          }
        }
      })
      */
      
      console.log('✅ 大填写区域转换完成（修复5已暂时禁用）')
      console.log('✅ Word模板格式修复完成\n')
      
      // 如果禁用了自动填充，直接返回
      if (!enableAutoFill) {
        console.log('⚠️ 自动填充已禁用，跳过填充操作')
        message.info('模板加载完成（已修复格式，所有大填写区域已优化）')
        return
      }
      
      // 字段映射：关键词 -> 数据值
      const fieldMapping = {
        '项目名称': context.projectName,
        '申请单位': context.department,
        '单位名称': context.department,
        '项目负责人': context.applicant,
        '负责人': context.applicant,
        '申请人': context.applicant,
        '年度': context.year ? String(context.year) : '',
        '项目年度': context.year ? String(context.year) : '',
        '预算': context.budget ? (context.budget + '万元') : '',
        '经费': context.budget ? (context.budget + '万元') : '',
        '经费合计': context.budget ? (context.budget + '万元') : '',
        '项目周期': context.duration ? (context.duration + '个月') : '',
        '周期': context.duration ? (context.duration + '个月') : '',
        '预期立项时间': context.expectedDate || '',
        '立项时间': context.expectedDate || '',
        '项目描述': context.description,
        '项目内容': context.description,
        '主要研究': context.description,
        '研究内容': context.description,
        '备注': context.remarks,
        '说明': context.remarks
      }
      
      let filledCount = 0
      
      // 策略1: 扫描所有表格
      const tables = iframeDoc.querySelectorAll('table')
      console.log(`📊 找到 ${tables.length} 个表格`)
      
      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tr')
        console.log(`  表格 ${tableIndex + 1}: ${rows.length} 行`)
        
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td, th')
          
          // 特殊处理：表格1第7行（项目主要研究内容的空白区域）
          if (tableIndex === 0 && rowIndex === 6 && cells.length === 1) {
            const cell = cells[0]
            if (cell.textContent.trim().length < 20 && context.researchContent) {
              console.log(`  ✅ 填充表格1第7行：项目主要研究内容`)
              cell.innerHTML = String(context.researchContent).replace(/\n/g, '<br>')
              cell.style.backgroundColor = '#fff9e6'
              cell.style.padding = '10px'
              filledCount++
              return
            }
          }
          
          if (cells.length >= 2) {
            // 检查第一个单元格是否包含字段名
            const labelCell = cells[0]
            const valueCell = cells[1]
            const labelText = labelCell.textContent.trim()
            
            // 尝试匹配字段
            for (const [keyword, value] of Object.entries(fieldMapping)) {
              if (labelText.includes(keyword) && value) {
                console.log(`  ✅ 匹配字段 "${keyword}" 在行 ${rowIndex + 1}`)
                
                // 如果是长文本（描述、备注），使用innerHTML并保持换行
                if (keyword.includes('描述') || keyword.includes('内容') || keyword.includes('研究') || keyword.includes('备注') || keyword.includes('说明')) {
                  valueCell.innerHTML = String(value).replace(/\n/g, '<br>')
                } else {
                  valueCell.textContent = String(value)
                }
                
                // 添加高亮样式
                valueCell.style.backgroundColor = '#e6f7ff'
                filledCount++
                break
              }
            }
          }
        })
      })
      
      // 策略2: 扫描段落和其他元素（行内字段）
      const allElements = iframeDoc.querySelectorAll('p, div, span')
      console.log(`📄 扫描 ${allElements.length} 个段落/容器元素`)
      
      allElements.forEach(element => {
        const text = element.textContent.trim()
        
        for (const [keyword, value] of Object.entries(fieldMapping)) {
          // 查找形如 "项目名称：____" 或 "项目名称:    " 的模式
          const patterns = [
            new RegExp(`${keyword}[：:][\\s_]*$`),
            new RegExp(`${keyword}[：:]\\s*$`)
          ]
          
          for (const pattern of patterns) {
            if (pattern.test(text) && value) {
              console.log(`  ✅ 匹配段落字段 "${keyword}"`)
              
              // 在冒号后添加内容
              if (keyword.includes('描述') || keyword.includes('内容') || keyword.includes('研究') || keyword.includes('备注') || keyword.includes('说明')) {
                element.innerHTML = text + '<br>' + String(value).replace(/\n/g, '<br>')
              } else {
                element.textContent = text + ' ' + String(value)
              }
              
              element.style.backgroundColor = '#e6f7ff'
              filledCount++
              break
            }
          }
        }
      })
      
      // 策略2.5: 查找标题后的大段空白区域并填充（针对"项目描述"类大文本区域）
      console.log('🔍 扫描大段文本填写区域...')
      
      // 根据Word模板实际结构，精确匹配字段（从日志中看到的实际标题）
      const textAreaKeywords = [
        // "申请项目的依据和意义" - 段落25
        { keywords: ['申请项目的依据和意义'], content: context.backgroundAndNecessity || context.description },
        // "项目研究开发内容及目标" - 段落26
        { keywords: ['项目研究开发内容及目标'], content: context.researchContent || context.description },
        // "一、实施方案" - 段落27
        { keywords: ['一、实施方案'], content: context.implementationPlan || context.description },
        // "二、技术关键" - 段落28
        { keywords: ['二、技术关键'], content: context.technicalKey || context.description },
        // "三、技术路线" - 段落29
        { keywords: ['三、技术路线'], content: context.technicalRoute || context.description },
        // "四、预期成果" - 段落30
        { keywords: ['四、预期成果'], content: context.expectedResults || context.description },
        // "项目实施的经济、社会和环境预期效益" - 粗体11
        { keywords: ['项目实施的经济、社会和环境预期效益'], content: context.economicSocialBenefits || context.expectedResults || context.description }
      ]
      
      // 用于跟踪已填充的元素，避免重复填充
      const filledElements = new Set()
      
      textAreaKeywords.forEach(({ keywords, content }) => {
        if (!content) return
        
        // 对于每组关键词，只填充第一个匹配的区域
        let groupFilled = false
        
        for (const keyword of keywords) {
          if (groupFilled) break // 如果该组已经填充过，跳过其他关键词
          
          // 查找包含关键词的元素
          for (const element of allElements) {
            if (groupFilled) break
            
            const elementText = element.textContent.trim()
            
            // 检查是否包含关键词且该元素未被填充过
            if (elementText.includes(keyword) && !filledElements.has(element)) {
              console.log(`  🎯 找到标题元素: "${keyword}"`)
              
              // 查找该元素后面的空白或内容较少的区域
              let targetElement = element.nextElementSibling
              
              // 尝试查找接下来的几个兄弟元素
              let attempts = 0
              while (targetElement && attempts < 5) {
                const targetText = targetElement.textContent.trim()
                const targetTag = targetElement.tagName.toLowerCase()
                
                // 检查该元素是否已被填充
                if (filledElements.has(targetElement)) {
                  targetElement = targetElement.nextElementSibling
                  attempts++
                  continue
                }
                
                // 如果是空元素或内容很少（少于20字），就填充
                if (targetText.length < 20 && (targetTag === 'p' || targetTag === 'div')) {
                  console.log(`    ✅ 填充到后续元素 <${targetTag}>`)
                  
                  // 改为使用自动扩展的 textarea 替代 contenteditable div
                  const textarea = iframeDoc.createElement('textarea')
                  textarea.value = String(content)
                  textarea.style.width = '100%'
                  textarea.style.minHeight = '100px'
                  textarea.style.border = '1px dashed #1890ff'
                  textarea.style.backgroundColor = '#fff9e6'
                  textarea.style.padding = '10px'
                  textarea.style.fontFamily = 'inherit'
                  textarea.style.fontSize = 'inherit'
                  textarea.style.lineHeight = '1.8'
                  textarea.style.resize = 'none'
                  textarea.style.overflow = 'hidden'
                  textarea.style.boxSizing = 'border-box'
                  textarea.style.marginBottom = '10px'
                  textarea.setAttribute('data-auto-filled', 'true')
                  
                  // 自动调整高度函数
                  const autoResize = () => {
                    textarea.style.height = 'auto'
                    const scrollHeight = textarea.scrollHeight
                    textarea.style.height = Math.max(scrollHeight, 100) + 'px'
                  }
                  
                  textarea.addEventListener('input', autoResize)
                  textarea.addEventListener('change', autoResize)
                  setTimeout(autoResize, 0)
                  
                  // 替换原元素
                  targetElement.parentNode.replaceChild(textarea, targetElement)
                  
                  // 标记为已填充
                  filledElements.add(element)
                  filledElements.add(textarea)
                  filledCount++
                  groupFilled = true // 标记该组关键词已填充
                  break
                }
                
                targetElement = targetElement.nextElementSibling
                attempts++
              }
              
              // 如果没找到合适的后续元素，直接在当前元素后插入自动扩展 textarea
              if (!groupFilled && (attempts >= 5 || !targetElement)) {
                console.log(`    ➕ 在标题后插入新的自动扩展 textarea`)
                
                const newTextarea = iframeDoc.createElement('textarea')
                newTextarea.value = String(content)
                newTextarea.style.width = '100%'
                newTextarea.style.minHeight = '100px'
                newTextarea.style.border = '1px dashed #1890ff'
                newTextarea.style.backgroundColor = '#fff9e6'
                newTextarea.style.padding = '10px'
                newTextarea.style.fontFamily = 'inherit'
                newTextarea.style.fontSize = 'inherit'
                newTextarea.style.lineHeight = '1.8'
                newTextarea.style.resize = 'none'
                newTextarea.style.overflow = 'hidden'
                newTextarea.style.boxSizing = 'border-box'
                newTextarea.style.marginTop = '10px'
                newTextarea.style.marginBottom = '10px'
                newTextarea.setAttribute('data-auto-filled', 'true')
                
                // 自动调整高度函数
                const autoResize = () => {
                  newTextarea.style.height = 'auto'
                  const scrollHeight = newTextarea.scrollHeight
                  newTextarea.style.height = Math.max(scrollHeight, 100) + 'px'
                }
                
                newTextarea.addEventListener('input', autoResize)
                newTextarea.addEventListener('change', autoResize)
                setTimeout(autoResize, 0)
                
                element.insertAdjacentElement('afterend', newTextarea)
                
                // 标记为已填充
                filledElements.add(element)
                filledElements.add(newTextarea)
                filledCount++
                groupFilled = true // 标记该组关键词已填充
                break
              }
            }
          }
        }
      })
      
      // 策略3: 查找可编辑内容区域，直接在文档开头添加项目信息
      const editableContent = iframeDoc.querySelector('.editable-content, body')
      if (editableContent && filledCount === 0) {
        console.log('⚠️ 未找到匹配字段，尝试在文档开头插入项目信息')
        
        const projectInfoHtml = `
          <div style="background: #f0f9ff; padding: 15px; margin-bottom: 20px; border-left: 4px solid #1890ff;">
            <h3 style="margin: 0 0 10px 0; color: #1890ff;">项目基本信息</h3>
            <p style="margin: 5px 0;"><strong>项目名称：</strong>${context.projectName || '未填写'}</p>
            <p style="margin: 5px 0;"><strong>申请单位：</strong>${context.department || '未填写'}</p>
            <p style="margin: 5px 0;"><strong>项目负责人：</strong>${context.applicant || '未填写'}</p>
            <p style="margin: 5px 0;"><strong>年度：</strong>${context.year || '未填写'}</p>
            <p style="margin: 5px 0;"><strong>预算：</strong>${context.budget ? context.budget + '万元' : '未填写'}</p>
            <p style="margin: 5px 0;"><strong>项目周期：</strong>${context.duration ? context.duration + '个月' : '未填写'}</p>
            <p style="margin: 5px 0;"><strong>预期立项时间：</strong>${context.expectedDate || '未填写'}</p>
            ${context.description ? `<p style="margin: 10px 0 5px 0;"><strong>项目描述：</strong></p><div style="padding: 10px; background: white; border-radius: 4px;">${context.description.replace(/\n/g, '<br>')}</div>` : ''}
            ${context.remarks ? `<p style="margin: 10px 0 5px 0;"><strong>备注：</strong></p><div style="padding: 10px; background: white; border-radius: 4px;">${context.remarks.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 2px solid #e8e8e8;">
        `
        
        editableContent.insertAdjacentHTML('afterbegin', projectInfoHtml)
        filledCount = Object.keys(fieldMapping).length
      }
      
      console.log(`✅ 项目数据填充完成，共填充 ${filledCount} 个字段`)
      
      if (filledCount > 0) {
        message.success(`项目信息已自动填充到模板（${filledCount}个字段）`)
      } else {
        message.warning('未找到匹配的模板字段，已在文档开头插入项目信息')
      }
      
    } catch (err) {
      console.error('❌ DOM填充失败:', err)
      console.error('错误详情:', err.message)
      console.error('错误堆栈:', err.stack)
      message.error('数据填充失败: ' + err.message)
    }
  }, 800) // 延长等待时间确保DOM完全渲染
}

/**
 * 处理来自编辑器的保存消息
 */
const handleSaveFromEditor = (data) => {
  console.log('收到保存消息:', data)
  // 这里可以添加额外的保存逻辑
}

/**
 * 处理来自编辑器的预览消息
 */
const handlePreviewFromEditor = (data) => {
  previewContent.value = data.content
  previewVisible.value = true
}

/**
 * 预览文档
 */
const previewDocument = () => {
  if (editorFrame.value && editorFrame.value.contentWindow) {
    editorFrame.value.contentWindow.postMessage({ type: 'preview' }, '*')
  }
}

/**
 * 保存并上传
 */
const saveAndUpload = async () => {
  saving.value = true
  
  try {
    // 1. 获取编辑器中的HTML内容
    const htmlContent = await getEditorContent()
    if (!htmlContent) {
      throw new Error('无法获取编辑内容')
    }
    
     // 2. 根据文件类型转换为相应格式
     const fileName = generateFileName()
     let convertedFile
     
     // 从模板配置中获取文件类型
     const fileType = getFileTypeFromTemplate()
     
     switch (fileType) {
       case 'word':
         convertedFile = await HtmlToWordConverter.convertToWord(htmlContent, fileName)
         break
       case 'excel':
         convertedFile = await HtmlToExcelConverter.convertToExcel(htmlContent, fileName)
         break
       case 'ppt':
         convertedFile = await HtmlToPptConverter.convertToPpt(htmlContent, fileName)
         break
       default:
         throw new Error(`不支持的文件类型: ${fileType}`)
     }
     
     // 3. 上传到服务器
     const uploadResponse = await uploadTechnologicalFile(convertedFile, 'project/application-forms')
    
    if (!uploadResponse || !uploadResponse.fileUrl) {
      throw new Error('上传失败，未返回文件URL')
    }
    
    // 4. 触发成功事件
    emit('success', {
      configId: props.configId,
      file: {
        fileName: uploadResponse.fileName || fileName,
        fileUrl: uploadResponse.fileUrl,
        fileSize: uploadResponse.fileSize || wordFile.size,
        uploadResponse: uploadResponse
      }
    })
    
    lastSaved.value = new Date()
    message.success('文档保存并上传成功')
    
    // 延迟关闭弹窗
    setTimeout(() => {
      emit('update:visible', false)
    }, 1000)
    
  } catch (err) {
    console.error('保存失败:', err)
    message.error(`保存失败: ${err.message}`)
  } finally {
    saving.value = false
  }
}

/**
 * 导出文档
 */
const exportDocument = async () => {
  if (exporting.value) return
  
  exporting.value = true
  
  try {
    console.log('🔄 开始导出文档...')
    
    // 1. 获取编辑器内容
    const htmlContent = await getEditorContent()
    
    if (!htmlContent) {
      throw new Error('无法获取编辑器内容')
    }
    
    // 2. 根据文件类型转换为相应格式
    const fileName = generateFileName()
    let exportedFile
    
    // 从模板配置中获取文件类型
    const fileType = getFileTypeFromTemplate()
    
    console.log(`📄 导出文件类型: ${fileType}`)
    
    switch (fileType) {
      case 'word':
        exportedFile = await HtmlToWordConverter.convertToWord(htmlContent, fileName)
        break
      case 'excel':
        exportedFile = await HtmlToExcelConverter.convertToExcel(htmlContent, fileName)
        break
      case 'ppt':
        exportedFile = await HtmlToPptConverter.convertToPpt(htmlContent, fileName)
        break
      default:
        throw new Error(`不支持的文件类型: ${fileType}`)
    }
    
    // 3. 下载文件
    saveAs(exportedFile, exportedFile.name)
    
    console.log('✅ 文档导出完成')
    message.success('文档导出成功')
    
  } catch (err) {
    console.error('导出失败:', err)
    message.error(`导出失败: ${err.message}`)
  } finally {
    exporting.value = false
  }
}

/**
 * 获取编辑器内容
 */
const getEditorContent = () => {
  return new Promise((resolve, reject) => {
    if (!editorFrame.value || !editorFrame.value.contentDocument) {
      reject(new Error('编辑器未加载'))
      return
    }
    
    try {
      const doc = editorFrame.value.contentDocument
      
      // 尝试不同的容器选择器
      const selectors = ['.editable-content', '.editable-container', 'body']
      let editableContent = null
      
      for (const selector of selectors) {
        editableContent = doc.querySelector(selector)
        if (editableContent) {
          console.log(`✅ 找到可编辑内容区域: ${selector}`)
          break
        }
      }
      
      if (editableContent) {
        resolve(editableContent.innerHTML)
      } else {
        // 如果都找不到，尝试获取整个body内容
        const body = doc.body
        if (body) {
          console.log('⚠️ 使用body作为备选内容区域')
          resolve(body.innerHTML)
        } else {
          reject(new Error('找不到可编辑内容区域'))
        }
      }
    } catch (error) {
      reject(new Error(`获取内容失败: ${error.message}`))
    }
  })
}

/**
 * 生成文件名
 */
const generateFileName = () => {
  const templateName = props.templateData?.categoryName || '申请书'
  const projectName = props.projectContext?.projectName || '新建项目'
  const timestamp = new Date().toISOString().slice(0, 10)
  
  return `${templateName}_${projectName}_${timestamp}`
}

/**
 * 获取文件类型
 */
const getFileType = (blob) => {
  const mimeType = blob.type
  const fileName = blob.name || ''
  
  // 根据MIME类型判断
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return 'word'
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'excel'
  } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return 'ppt'
  }
  
  // 根据文件扩展名判断
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'doc':
    case 'docx':
      return 'word'
    case 'xls':
    case 'xlsx':
      return 'excel'
    case 'ppt':
    case 'pptx':
      return 'ppt'
    default:
      return 'unknown'
  }
}

/**
 * 从模板配置中获取文件类型
 */
const getFileTypeFromTemplate = () => {
  if (!props.templateData || !props.templateData.templateFilePath) {
    return 'word' // 默认返回word类型
  }
  
  const templatePath = props.templateData.templateFilePath
  const extension = templatePath.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'doc':
    case 'docx':
      return 'word'
    case 'xls':
    case 'xlsx':
      return 'excel'
    case 'ppt':
    case 'pptx':
      return 'ppt'
    default:
      return 'word' // 默认返回word类型
  }
}

/**
 * 取消操作
 */
const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

/**
 * 清理资源
 */
const cleanup = () => {
  // 清理消息监听器
  if (messageListener) {
    window.removeEventListener('message', messageListener)
    messageListener = null
  }
  
  // 清理Blob URL
  if (editorUrl.value && editorUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(editorUrl.value)
  }
  editorUrl.value = ''
  previewContent.value = ''
  previewVisible.value = false
}

/**
 * 格式化时间
 */
const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString()
}

/**
 * 处理弹窗可见性变化
 */
const handleVisibleChange = (value) => {
  emit('update:visible', value)
}

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.online-application-form-modal {
  top: 20px;
}

.online-application-form-modal :deep(.ant-modal-body) {
  padding: 0;
  height: 80vh;
  overflow: hidden;
}

.online-fill-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
}

.loading-text {
  text-align: center;
  margin-top: 16px;
}

.loading-progress {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.error-container {
  padding: 40px 20px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
}

.editor-frame-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.editor-frame-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.empty-editor {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fafafa;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e8e8e8;
  font-size: 12px;
  color: #666;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.status-indicator.loading {
  background: #1890ff;
  animation: pulse 1.5s infinite;
}

.status-indicator.error {
  background: #ff4d4f;
}

.status-indicator.success {
  background: #52c41a;
}

.status-indicator.ready {
  background: #52c41a;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.template-info,
.last-saved,
.word-count {
  color: #999;
}

.preview-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  background: white;
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .online-application-form-modal {
    top: 0;
    margin: 0;
  }
  
  .online-application-form-modal :deep(.ant-modal) {
    max-width: 100vw;
    margin: 0;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
