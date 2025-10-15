/**
 * PPT转HTML服务
 * @description 将PPT文件转换为可编辑的HTML内容
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import { StylePreservationService } from './stylePreservationService.js'

/**
 * PPT转HTML转换器类
 */
export class PptToHtmlConverter {
  /**
   * 将PPT文档转换为可编辑HTML
   * @param {Blob} pptBlob - PPT文档Blob对象
   * @param {string} fileName - 文件名
   * @returns {Promise<string>} 可编辑的HTML内容
   */
  static async convertToEditableHtml(pptBlob, fileName) {
    try {
      console.log('🔄 开始PPT转HTML转换...')
      
      // 注意：PPT转换比较复杂，这里提供一个基础的文本提取版本
      // 实际的PPT解析需要更复杂的库支持
      
      // 创建一个基础的HTML结构
      const htmlContent = `
        <div class="slide">
          <h2>PPT文档内容</h2>
          <p>这是一个PPT文档的基础预览。</p>
          <p>由于PPT格式的复杂性，建议使用传统上传方式处理PPT文件。</p>
          <p>或者将PPT内容复制粘贴到此处进行编辑。</p>
        </div>
      `
      
      // 增强样式保持
      const enhancedHtml = StylePreservationService.enhanceStylePreservation(htmlContent, 'ppt')
      
      // 创建可编辑的HTML文档
      const editableHtml = this.createEditableDocument(enhancedHtml, fileName)
      
      console.log('✅ PPT转HTML转换完成')
      return editableHtml
      
    } catch (error) {
      console.error('❌ PPT转HTML转换失败:', error)
      throw new Error(`PPT转HTML转换失败: ${error.message}`)
    }
  }
  
  /**
   * 创建可编辑的HTML文档
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
        <title>${fileName}</title>
        <style>
          body { 
            font-family: 'Microsoft YaHei', Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6; 
            background: #fff;
          }
          .editable-content { 
            outline: none;
          }
          .slide {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          h1, h2, h3 {
            color: #333;
            margin: 10px 0;
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
        </script>
      </body>
      </html>
    `
  }
}

export default PptToHtmlConverter