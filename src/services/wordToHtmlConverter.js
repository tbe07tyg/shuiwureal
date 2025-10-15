/**
 * Word转HTML服务（基于FilePreview.vue的实现）
 * @description 将Word文档转换为可编辑的HTML，用于在线填报功能
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import * as mammoth from 'mammoth'
import { StylePreservationService } from './stylePreservationService.js'

/**
 * Word转HTML转换器类
 */
export class WordToHtmlConverter {
  /**
   * 将Word文档转换为可编辑HTML
   * @param {Blob} wordBlob - Word文档Blob对象
   * @param {string} fileName - 文件名
   * @returns {Promise<string>} 可编辑的HTML内容
   */
  static async convertToEditableHtml(wordBlob, fileName) {
    try {
      console.log('🔄 开始Word转HTML转换...')
      
      // 1. 检查文件类型
      const fileType = this.getWordFileType(wordBlob)
      console.log(`📄 检测到Word文件类型: ${fileType}`)
      
      // 2. 转换为ArrayBuffer
      const arrayBuffer = await wordBlob.arrayBuffer()
      
      // 3. 根据文件类型选择转换方式，并尝试保持更多样式
      let result
      const convertOptions = {
        arrayBuffer,
        // 尝试保持更多样式
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em",
          // 保持段落样式
          "p[style-name='Normal'] => p",
          // 保持表格样式
          "table => table",
          "tr => tr",
          "td => td",
          "th => th"
        ],
        // 保持内嵌样式映射
        includeEmbeddedStyleMap: true,
        // 转换图片
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer,
              style: "max-width: 100%; height: auto;"
            }
          })
        }),
        // 保持原始格式
        transformDocument: mammoth.transforms.paragraph(function(element) {
          // 保持原始段落格式
          return element
        })
      }
      
      if (fileType === 'doc') {
        console.log('⚠️ 检测到.doc文件，尝试转换（可能效果有限）')
        result = await mammoth.convertToHtml(convertOptions)
      } else {
        result = await mammoth.convertToHtml(convertOptions)
      }
      
      // 4. 处理HTML内容，添加编辑功能
      const editableHtml = this.processHtmlForEditing(result.value, fileName)
      
      // 5. 创建完整的编辑页面
      const fullHtml = this.createEditableDocument(editableHtml, fileName)
      
      console.log('✅ Word转HTML转换完成')
      return fullHtml
      
    } catch (error) {
      console.error('❌ Word转HTML转换失败:', error)
      
      // 如果是.doc文件转换失败，提供友好的错误提示
      const fileType = this.getWordFileType(wordBlob)
      if (fileType === 'doc') {
        throw new Error('DOC格式文件转换失败。建议将文件另存为DOCX格式后重试，或者使用传统上传方式。')
      }
      
      throw new Error(`Word转HTML转换失败: ${error.message}`)
    }
  }
  
  /**
   * 获取Word文件类型
   * @param {Blob} wordBlob - Word文档Blob对象
   * @returns {string} 文件类型 ('doc' 或 'docx')
   */
  static getWordFileType(wordBlob) {
    const mimeType = wordBlob.type.toLowerCase()
    const fileName = wordBlob.name || ''
    
    // 根据MIME类型判断
    if (mimeType.includes('msword') && !mimeType.includes('wordprocessingml')) {
      return 'doc'
    } else if (mimeType.includes('wordprocessingml')) {
      return 'docx'
    }
    
    // 根据文件扩展名判断
    const extension = fileName.toLowerCase().split('.').pop()
    if (extension === 'doc') {
      return 'doc'
    } else if (extension === 'docx') {
      return 'docx'
    }
    
    // 默认返回docx
    return 'docx'
  }
  
  /**
   * 处理HTML内容，保持原始格式
   * @param {string} htmlContent - 原始HTML内容
   * @param {string} fileName - 文件名
   * @returns {string} 处理后的HTML内容
   */
  static processHtmlForEditing(htmlContent, fileName) {
    try {
      // 使用样式保持服务来增强样式
      const enhancedHtml = StylePreservationService.enhanceStylePreservation(htmlContent, 'word')
      return enhancedHtml
    } catch (error) {
      console.warn('样式增强失败，使用原始内容:', error)
      return htmlContent
    }
  }
  
  /**
   * 使字段可编辑
   * @param {Document} doc - DOM文档对象
   */
  static makeFieldsEditable(doc) {
    // 查找可能的表单字段标识
    const fieldSelectors = [
      '[data-field]',           // 自定义字段标识
      '.form-field',            // 表单字段类
      'input[type="text"]',     // 文本输入框
      'textarea',               // 文本域
      'td',                     // 表格单元格
      'p',                      // 段落
      'div'                     // 容器
    ]
    
    fieldSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector)
      elements.forEach(element => {
        // 检查是否包含表单字段特征
        if (this.isFormField(element)) {
          element.setAttribute('contenteditable', 'true')
          element.classList.add('editable-field')
          element.setAttribute('data-original-text', element.textContent.trim())
        }
      })
    })
    
    // 为空的段落或单元格添加编辑功能
    const emptyElements = doc.querySelectorAll('p:empty, td:empty, div:empty')
    emptyElements.forEach(element => {
      if (!element.querySelector('img, table, ul, ol')) {
        element.setAttribute('contenteditable', 'true')
        element.classList.add('editable-field', 'empty-field')
        element.innerHTML = '<span class="placeholder">点击填写内容</span>'
      }
    })
  }
  
  /**
   * 判断是否为表单字段
   * @param {Element} element - DOM元素
   * @returns {boolean} 是否为表单字段
   */
  static isFormField(element) {
    const text = element.textContent.trim()
    
    // 检查是否包含常见的表单字段关键词
    const fieldKeywords = [
      '姓名', '申请人', '项目名称', '单位', '部门', '电话', '邮箱',
      '预算', '经费', '周期', '时间', '日期', '年度', '编号',
      '背景', '内容', '目标', '成果', '方案', '计划', '说明',
      '：', ':', '（', '）', '(', ')', '【', '】', '[', ']'
    ]
    
    return fieldKeywords.some(keyword => text.includes(keyword))
  }
  
  /**
   * 添加数据绑定
   * @param {Document} doc - DOM文档对象
   */
  static addDataBinding(doc) {
    const editableFields = doc.querySelectorAll('.editable-field')
    
    editableFields.forEach((field, index) => {
      field.setAttribute('data-field-id', `field_${index}`)
      field.setAttribute('data-field-name', this.extractFieldName(field.textContent))
    })
  }
  
  /**
   * 提取字段名称
   * @param {string} text - 文本内容
   * @returns {string} 字段名称
   */
  static extractFieldName(text) {
    // 提取冒号前的文本作为字段名
    const match = text.match(/^([^：:]+)[：:]/)
    return match ? match[1].trim() : text.substring(0, 20)
  }
  
  /**
   * 优化样式
   * @param {Document} doc - DOM文档对象
   */
  static optimizeStyles(doc) {
    // 添加样式标签
    const style = doc.createElement('style')
    style.textContent = this.getEditableStyles()
    doc.head.appendChild(style)
  }
  
  /**
   * 创建可编辑文档页面
   * @param {string} htmlContent - HTML内容
   * @param {string} fileName - 文件名
   * @returns {string} 完整的HTML文档
   */
  static createEditableDocument(htmlContent, fileName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
          }
          .editable-content {
            outline: none;
            min-height: 500px;
          }
          /* 保持原始Word样式 */
          * {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div class="editable-content" contenteditable="true">
          ${htmlContent}
        </div>
        
        <script>
          // 简单的保存功能
          function saveDocument() {
            const content = document.querySelector('.editable-content').innerHTML;
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'save',
                content: content,
                fileName: '${fileName}'
              }, '*');
            }
          }
          
          // 监听内容变化
          document.addEventListener('input', function() {
            // 可以添加自动保存逻辑
          });
        </script>
      </body>
      </html>
    `
  }
  
  /**
   * 获取可编辑样式
   * @returns {string} CSS样式字符串
   */
  static getEditableStyles() {
    return `
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        color: #333;
        line-height: 1.6;
      }
      
      .editable-container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        min-height: 100vh;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      
      .document-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-bottom: 3px solid #1890ff;
      }
      
      .document-header h1 {
        margin: 0 0 15px 0;
        font-size: 24px;
        font-weight: 600;
      }
      
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      
      .btn-primary {
        background: #1890ff;
        color: white;
      }
      
      .btn-primary:hover {
        background: #40a9ff;
        transform: translateY(-1px);
      }
      
      .btn-secondary {
        background: #f0f0f0;
        color: #333;
      }
      
      .btn-secondary:hover {
        background: #e0e0e0;
        transform: translateY(-1px);
      }
      
      .btn-warning {
        background: #faad14;
        color: white;
      }
      
      .btn-warning:hover {
        background: #ffc53d;
        transform: translateY(-1px);
      }
      
      .document-content {
        padding: 30px;
        min-height: 500px;
      }
      
      .editable-content {
        font-size: 14px;
        line-height: 1.8;
        outline: none;
      }
      
      /* 可编辑字段样式 */
      .editable-field {
        border: 1px dashed transparent;
        padding: 4px 8px;
        margin: 2px;
        min-height: 24px;
        background: #f8f9fa;
        border-radius: 4px;
        transition: all 0.3s ease;
      }
      
      .editable-field:hover {
        border-color: #1890ff;
        background: #e6f7ff;
      }
      
      .editable-field:focus {
        border: 2px solid #1890ff;
        background: white;
        outline: none;
        box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
      }
      
      .empty-field .placeholder {
        color: #999;
        font-style: italic;
      }
      
      .empty-field:focus .placeholder {
        display: none;
      }
      
      /* 表格样式 */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
        border: 1px solid #ddd;
      }
      
      table th, table td {
        border: 1px solid #ddd;
        padding: 12px 8px;
        text-align: left;
      }
      
      table th {
        background: #f5f5f5;
        font-weight: 600;
      }
      
      /* 标题样式 */
      h1, h2, h3, h4, h5, h6 {
        color: #1890ff;
        margin: 20px 0 10px 0;
      }
      
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      h4 { font-size: 16px; }
      
      /* 段落样式 */
      p {
        margin: 12px 0;
      }
      
      /* 列表样式 */
      ul, ol {
        padding-left: 20px;
      }
      
      li {
        margin: 6px 0;
      }
      
      /* 图片样式 */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .document-footer {
        background: #fafafa;
        padding: 15px 30px;
        border-top: 1px solid #e8e8e8;
      }
      
      .status-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        color: #666;
      }
      
      .separator {
        color: #ccc;
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .editable-container {
          margin: 0;
          box-shadow: none;
        }
        
        .document-header {
          padding: 15px 20px;
        }
        
        .document-content {
          padding: 20px;
        }
        
        .toolbar {
          flex-wrap: wrap;
        }
        
        .btn {
          font-size: 12px;
          padding: 6px 12px;
        }
      }
    `
  }
  
  /**
   * 获取可编辑脚本
   * @param {string} fileName - 文件名
   * @returns {string} JavaScript代码字符串
   */
  static getEditableScripts(fileName) {
    return `
      let originalContent = '';
      let isModified = false;
      
      // 初始化
      document.addEventListener('DOMContentLoaded', function() {
        const editableContent = document.querySelector('.editable-content');
        originalContent = editableContent.innerHTML;
        
        // 监听内容变化
        editableContent.addEventListener('input', function() {
          isModified = true;
          updateWordCount();
          updateStatus('已修改');
        });
        
        // 监听焦点事件
        editableContent.addEventListener('focus', function(e) {
          if (e.target.classList.contains('editable-field')) {
            e.target.classList.add('focused');
          }
        });
        
        editableContent.addEventListener('blur', function(e) {
          if (e.target.classList.contains('editable-field')) {
            e.target.classList.remove('focused');
          }
        });
        
        updateWordCount();
        updateStatus('就绪');
      });
      
      // 保存文档
      function saveDocument() {
        const content = document.querySelector('.editable-content').innerHTML;
        
        // 发送消息给父窗口
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'save',
            content: content,
            fileName: '${fileName || '未命名文档'}'
          }, '*');
        }
        
        updateStatus('已保存');
        isModified = false;
      }
      
      // 预览文档
      function previewDocument() {
        const content = document.querySelector('.editable-content').innerHTML;
        
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'preview',
            content: content
          }, '*');
        }
      }
      
      // 重置文档
      function resetDocument() {
        if (confirm('确定要重置文档吗？所有修改将丢失。')) {
          document.querySelector('.editable-content').innerHTML = originalContent;
          isModified = false;
          updateStatus('已重置');
          updateWordCount();
        }
      }
      
      // 更新字数统计
      function updateWordCount() {
        const content = document.querySelector('.editable-content').textContent;
        const wordCount = content.length;
        document.getElementById('word-count').textContent = \`字数: \${wordCount}\`;
      }
      
      // 更新状态
      function updateStatus(status) {
        document.getElementById('status').textContent = status;
      }
      
      // 键盘快捷键
      document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
          switch(e.key) {
            case 's':
              e.preventDefault();
              saveDocument();
              break;
            case 'z':
              e.preventDefault();
              document.execCommand('undo');
              break;
            case 'y':
              e.preventDefault();
              document.execCommand('redo');
              break;
          }
        }
      });
      
      // 防止意外关闭
      window.addEventListener('beforeunload', function(e) {
        if (isModified) {
          e.preventDefault();
          e.returnValue = '文档已修改，确定要离开吗？';
        }
      });
    `
  }
}

export default WordToHtmlConverter
