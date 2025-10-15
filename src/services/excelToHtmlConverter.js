/**
 * Excel转HTML服务
 * @description 将Excel文件转换为可编辑的HTML内容
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import * as XLSX from 'xlsx'
import { StylePreservationService } from './stylePreservationService.js'

/**
 * Excel转HTML转换器类
 */
export class ExcelToHtmlConverter {
  /**
   * 将Excel文档转换为可编辑HTML
   * @param {Blob} excelBlob - Excel文档Blob对象
   * @param {string} fileName - 文件名
   * @returns {Promise<string>} 可编辑的HTML内容
   */
  static async convertToEditableHtml(excelBlob, fileName) {
    try {
      console.log('🔄 开始Excel转HTML转换...')
      
      // 1. 转换为ArrayBuffer
      const arrayBuffer = await excelBlob.arrayBuffer()
      
      // 2. 读取Excel文件
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // 3. 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // 4. 转换为HTML，尝试保持更多样式
      const htmlContent = XLSX.utils.sheet_to_html(worksheet, {
        header: '',
        footer: '',
        editable: true,
        // 尝试保持样式
        raw: false,
        // 保持单元格格式
        cellStyles: true
      })
      
      // 5. 增强样式保持
      const enhancedHtml = StylePreservationService.enhanceStylePreservation(htmlContent, 'excel')
      
      // 6. 创建可编辑的HTML文档
      const editableHtml = this.createEditableDocument(enhancedHtml, fileName)
      
      console.log('✅ Excel转HTML转换完成')
      return editableHtml
      
    } catch (error) {
      console.error('❌ Excel转HTML转换失败:', error)
      throw new Error(`Excel转HTML转换失败: ${error.message}`)
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
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 1em 0; 
          }
          table, th, td { 
            border: 1px solid #d9d9d9; 
          }
          th, td { 
            padding: 8px 12px; 
            text-align: left; 
          }
          th { 
            background: #fafafa; 
            font-weight: bold;
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

export default ExcelToHtmlConverter