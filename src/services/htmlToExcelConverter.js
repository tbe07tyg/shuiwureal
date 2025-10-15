/**
 * HTML转Excel服务
 * @description 将HTML内容转换为Excel文件
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import * as XLSX from 'xlsx'

/**
 * HTML转Excel转换器类
 */
export class HtmlToExcelConverter {
  /**
   * 将HTML内容转换为Excel文件
   * @param {string} htmlContent - HTML内容
   * @param {string} fileName - 文件名
   * @returns {Promise<File>} Excel文件
   */
  static async convertToExcel(htmlContent, fileName = 'generated_spreadsheet') {
    try {
      console.log('🔄 开始HTML转Excel转换...')
      
      // 1. 解析HTML中的表格
      const tables = this.extractTablesFromHtml(htmlContent)
      
      if (tables.length === 0) {
        throw new Error('HTML内容中没有找到表格')
      }
      
      // 2. 创建工作簿
      const workbook = XLSX.utils.book_new()
      
      // 3. 处理每个表格
      tables.forEach((table, index) => {
        const worksheet = this.createWorksheetFromTable(table)
        const sheetName = tables.length > 1 ? `Sheet${index + 1}` : 'Sheet1'
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      })
      
      // 4. 生成Excel文件
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // 5. 创建File对象
      const excelFile = new File([excelBuffer], `${fileName}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      console.log('✅ HTML转Excel转换完成')
      return excelFile
      
    } catch (error) {
      console.error('❌ HTML转Excel转换失败:', error)
      throw new Error(`HTML转Excel转换失败: ${error.message}`)
    }
  }
  
  /**
   * 从HTML中提取表格数据
   * @param {string} htmlContent - HTML内容
   * @returns {Array} 表格数据数组
   */
  static extractTablesFromHtml(htmlContent) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const tables = doc.querySelectorAll('table')
    
    return Array.from(tables).map(table => {
      const rows = []
      const tableRows = table.querySelectorAll('tr')
      
      tableRows.forEach(row => {
        const cells = []
        const tableCells = row.querySelectorAll('td, th')
        
        tableCells.forEach(cell => {
          cells.push(cell.textContent.trim())
        })
        
        if (cells.length > 0) {
          rows.push(cells)
        }
      })
      
      return rows
    })
  }
  
  /**
   * 从表格数据创建工作表
   * @param {Array} tableData - 表格数据
   * @returns {Object} XLSX工作表对象
   */
  static createWorksheetFromTable(tableData) {
    if (!tableData || tableData.length === 0) {
      return XLSX.utils.aoa_to_sheet([['']])
    }
    
    // 确定最大列数
    const maxCols = Math.max(...tableData.map(row => row.length))
    
    // 补齐所有行的列数
    const normalizedData = tableData.map(row => {
      const normalizedRow = [...row]
      while (normalizedRow.length < maxCols) {
        normalizedRow.push('')
      }
      return normalizedRow
    })
    
    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(normalizedData)
    
    // 设置列宽
    const colWidths = []
    for (let i = 0; i < maxCols; i++) {
      let maxWidth = 10
      normalizedData.forEach(row => {
        const cellValue = row[i] || ''
        maxWidth = Math.max(maxWidth, cellValue.length)
      })
      colWidths.push({ wch: Math.min(maxWidth + 2, 50) })
    }
    worksheet['!cols'] = colWidths
    
    return worksheet
  }
  
  /**
   * 清理HTML内容
   * @param {string} htmlContent - HTML内容
   * @returns {string} 清理后的HTML内容
   */
  static cleanHtmlContent(htmlContent) {
    // 移除script标签
    htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    
    // 移除style标签
    htmlContent = htmlContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    
    // 移除注释
    htmlContent = htmlContent.replace(/<!--[\s\S]*?-->/g, '')
    
    return htmlContent
  }
}

export default HtmlToExcelConverter
