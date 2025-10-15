/**
 * HTML转Word文档服务
 * @description 将HTML内容转换为Word文档，用于在线填报功能
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx'

/**
 * HTML转Word转换器类
 */
export class HtmlToWordConverter {
  /**
   * 将HTML内容转换为Word文档
   * @param {string} htmlContent - HTML内容字符串
   * @param {string} fileName - 文件名
   * @returns {Promise<File>} Word文档文件
   */
  static async convertToWord(htmlContent, fileName = 'generated_document') {
    try {
      console.log('🔄 开始HTML转Word转换...')
      
      // 1. 解析HTML内容
      const docElements = await this.parseHtmlToWordElements(htmlContent)
      
      // 2. 创建Word文档
      const doc = new Document({
        sections: [{
          properties: {},
          children: docElements
        }]
      })
      
      // 3. 生成Word文档 (在浏览器环境中使用 toBlob)
      const blob = await Packer.toBlob(doc)
      
      // 4. 创建File对象
      const wordFile = new File([blob], `${fileName}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      
      console.log('✅ HTML转Word转换完成')
      return wordFile
      
    } catch (error) {
      console.error('❌ HTML转Word转换失败:', error)
      throw new Error(`HTML转Word转换失败: ${error.message}`)
    }
  }
  
  /**
   * 解析HTML内容为Word元素
   * @param {string} htmlContent - HTML内容
   * @returns {Promise<Array>} Word元素数组
   */
  static async parseHtmlToWordElements(htmlContent) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const elements = []
    
    // 遍历body的所有子元素
    for (const node of doc.body.childNodes) {
      const wordElement = await this.convertNodeToWordElement(node)
      if (wordElement) {
        if (Array.isArray(wordElement)) {
          elements.push(...wordElement)
        } else {
          elements.push(wordElement)
        }
      }
    }
    
    return elements
  }
  
  /**
   * 将DOM节点转换为Word元素
   * @param {Node} node - DOM节点
   * @returns {Promise<Object|Array|null>} Word元素
   */
  static async convertNodeToWordElement(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim()
      if (text) {
        return new Paragraph({
          children: [new TextRun({ text })]
        })
      }
      return null
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node
      const tagName = element.tagName.toLowerCase()
      const textContent = element.textContent.trim()
      
      if (!textContent) return null
      
      // 解析元素样式
      const styles = this.parseElementStyles(element)
      
      switch (tagName) {
        case 'h1':
          return new Paragraph({
            children: [new TextRun({ 
              text: textContent, 
              bold: styles.bold || true,
              size: styles.fontSize || 32
            })],
            heading: HeadingLevel.HEADING_1,
            alignment: styles.alignment || AlignmentType.CENTER
          })
        
        case 'h2':
          return new Paragraph({
            children: [new TextRun({ 
              text: textContent, 
              bold: styles.bold || true,
              size: styles.fontSize || 28
            })],
            heading: HeadingLevel.HEADING_2,
            alignment: styles.alignment
          })
        
        case 'h3':
          return new Paragraph({
            children: [new TextRun({ 
              text: textContent, 
              bold: styles.bold || true,
              size: styles.fontSize || 24
            })],
            heading: HeadingLevel.HEADING_3,
            alignment: styles.alignment
          })
        
        case 'h4':
        case 'h5':
        case 'h6':
          return new Paragraph({
            children: [new TextRun({ 
              text: textContent, 
              bold: styles.bold || true,
              size: styles.fontSize || 20
            })],
            alignment: styles.alignment
          })
        
        case 'p':
          return new Paragraph({
            children: [new TextRun({ 
              text: textContent,
              bold: styles.bold,
              italics: styles.italics,
              size: styles.fontSize,
              color: styles.color
            })],
            alignment: styles.alignment
          })
        
        case 'table':
          return await this.convertTableToWord(element)
        
        case 'ul':
        case 'ol':
          return await this.convertListToWord(element)
        
        case 'br':
          return new Paragraph({ children: [new TextRun({ text: '' })] })
        
        case 'strong':
        case 'b':
          return new Paragraph({
            children: [new TextRun({ 
              text: textContent, 
              bold: true 
            })]
          })
        
        case 'em':
        case 'i':
          return new Paragraph({
            children: [new TextRun({ 
              text: textContent, 
              italics: true 
            })]
          })
        
        default:
          // 对于其他标签，返回普通段落
          return new Paragraph({
            children: [new TextRun({ text: textContent })]
          })
      }
    }
    
    return null
  }
  
  /**
   * 将HTML表格转换为Word表格
   * @param {Element} tableElement - HTML表格元素
   * @returns {Promise<Table>} Word表格
   */
  static async convertTableToWord(tableElement) {
    const rows = []
    const tableRows = tableElement.querySelectorAll('tr')
    
    for (const row of tableRows) {
      const cells = []
      const tableCells = row.querySelectorAll('td, th')
      
      for (const cell of tableCells) {
        // 解析单元格样式
        const cellStyles = this.parseElementStyles(cell)
        const isHeader = cell.tagName.toLowerCase() === 'th'
        
        const cellParagraph = new Paragraph({
          children: [new TextRun({ 
            text: cell.textContent.trim(),
            bold: isHeader || cellStyles.bold,
            italics: cellStyles.italics,
            size: cellStyles.fontSize,
            color: cellStyles.color,
            underline: cellStyles.underline
          })],
          alignment: cellStyles.alignment || (isHeader ? AlignmentType.CENTER : AlignmentType.LEFT)
        })
        
        cells.push(new TableCell({
          children: [cellParagraph],
          width: {
            size: 100 / tableCells.length,
            type: WidthType.PERCENTAGE
          }
        }))
      }
      
      rows.push(new TableRow({ children: cells }))
    }
    
    return new Table({
      rows: rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      }
    })
  }
  
  /**
   * 将HTML列表转换为Word元素
   * @param {Element} listElement - HTML列表元素
   * @returns {Promise<Array>} Word段落数组
   */
  static async convertListToWord(listElement) {
    const elements = []
    const isOrdered = listElement.tagName.toLowerCase() === 'ol'
    const listItems = listElement.querySelectorAll('li')
    
    listItems.forEach((item, index) => {
      const prefix = isOrdered ? `${index + 1}. ` : '• '
      elements.push(new Paragraph({
        children: [new TextRun({ 
          text: `${prefix}${item.textContent.trim()}`,
          indent: { left: 720 } // 缩进
        })]
      }))
    })
    
    return elements
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
  
  /**
   * 解析元素样式
   * @param {Element} element - DOM元素
   * @returns {Object} 样式对象
   */
  static parseElementStyles(element) {
    const styles = {}
    
    // 获取计算后的样式
    const computedStyle = window.getComputedStyle(element)
    
    // 解析文本对齐
    const textAlign = element.style.textAlign || computedStyle.textAlign
    if (textAlign) {
      switch (textAlign) {
        case 'center':
          styles.alignment = AlignmentType.CENTER
          break
        case 'right':
          styles.alignment = AlignmentType.RIGHT
          break
        case 'left':
          styles.alignment = AlignmentType.LEFT
          break
        case 'justify':
          styles.alignment = AlignmentType.JUSTIFIED
          break
      }
    }
    
    // 解析字体样式
    const fontWeight = element.style.fontWeight || computedStyle.fontWeight
    if (fontWeight === 'bold' || fontWeight === '700' || fontWeight === 'bolder') {
      styles.bold = true
    }
    
    const fontStyle = element.style.fontStyle || computedStyle.fontStyle
    if (fontStyle === 'italic') {
      styles.italics = true
    }
    
    // 解析字体大小
    const fontSize = element.style.fontSize || computedStyle.fontSize
    if (fontSize) {
      const size = parseFloat(fontSize)
      if (!isNaN(size)) {
        styles.fontSize = size * 2 // 转换为Word的点数
      }
    }
    
    // 解析字体颜色
    const color = element.style.color || computedStyle.color
    if (color && color !== 'rgb(0, 0, 0)' && color !== '#000000') {
      styles.color = this.parseColorToHex(color)
    }
    
    // 解析下划线
    const textDecoration = element.style.textDecoration || computedStyle.textDecoration
    if (textDecoration && textDecoration.includes('underline')) {
      styles.underline = true
    }
    
    return styles
  }
  
  /**
   * 解析颜色为十六进制
   * @param {string} color - 颜色值
   * @returns {string} 十六进制颜色
   */
  static parseColorToHex(color) {
    // 如果是十六进制颜色
    if (color.startsWith('#')) {
      return color
    }
    
    // 如果是RGB颜色
    if (color.startsWith('rgb')) {
      const rgb = color.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        const r = parseInt(rgb[0])
        const g = parseInt(rgb[1])
        const b = parseInt(rgb[2])
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      }
    }
    
    // 预定义颜色映射
    const colorMap = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#008000',
      'black': '#000000',
      'white': '#ffffff',
      'yellow': '#ffff00',
      'purple': '#800080',
      'orange': '#ffa500',
      'gray': '#808080',
      'grey': '#808080'
    }
    
    return colorMap[color.toLowerCase()] || '#000000'
  }
}

export default HtmlToWordConverter