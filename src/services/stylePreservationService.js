/**
 * 样式保持服务
 * @description 尝试保持文档的原始样式和格式
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

/**
 * 样式保持服务类
 */
export class StylePreservationService {
  /**
   * 增强HTML样式保持
   * @param {string} htmlContent - 原始HTML内容
   * @param {string} originalType - 原始文件类型
   * @returns {string} 增强后的HTML内容
   */
  static enhanceStylePreservation(htmlContent, originalType) {
    try {
      console.log(`🔄 开始增强${originalType}样式保持...`)
      
      // 创建临时DOM来处理HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      // 根据文件类型应用不同的样式增强
      switch (originalType) {
        case 'word':
          this.enhanceWordStyles(doc)
          break
        case 'excel':
          this.enhanceExcelStyles(doc)
          break
        case 'ppt':
          this.enhancePptStyles(doc)
          break
      }
      
      // 添加通用样式增强
      this.addCommonStyleEnhancements(doc)
      
      const enhancedHtml = doc.body.innerHTML
      console.log(`✅ ${originalType}样式增强完成`)
      
      return enhancedHtml
      
    } catch (error) {
      console.warn('样式增强失败，使用原始内容:', error)
      return htmlContent
    }
  }
  
  /**
   * 增强Word文档样式
   * @param {Document} doc - DOM文档对象
   */
  static enhanceWordStyles(doc) {
    // 增强表格样式
    const tables = doc.querySelectorAll('table')
    tables.forEach(table => {
      table.style.borderCollapse = 'collapse'
      table.style.width = '100%'
      table.style.border = '1px solid #000'
      table.style.margin = '10px 0'
      
      // 增强表格单元格样式
      const cells = table.querySelectorAll('td, th')
      cells.forEach(cell => {
        cell.style.border = '1px solid #000'
        cell.style.padding = '8px'
        cell.style.verticalAlign = 'top'
        
        // 尝试解析文本对齐
        this.parseTextAlignment(cell)
        
        // 尝试解析字体样式
        this.parseFontStyles(cell)
      })
    })
    
    // 增强段落样式
    const paragraphs = doc.querySelectorAll('p')
    paragraphs.forEach(p => {
      p.style.margin = '12px 0'
      p.style.lineHeight = '1.6'
      
      // 尝试解析段落对齐
      this.parseTextAlignment(p)
      
      // 尝试解析字体样式
      this.parseFontStyles(p)
    })
    
    // 增强标题样式
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      heading.style.fontSize = `${24 - level * 2}px`
      heading.style.fontWeight = 'bold'
      heading.style.margin = '20px 0 10px 0'
      heading.style.color = '#333'
      
      // 标题通常居中
      heading.style.textAlign = 'center'
      
      // 尝试解析标题对齐
      this.parseTextAlignment(heading)
    })
    
    // 增强文本样式
    const textElements = doc.querySelectorAll('span, div, td, th, p')
    textElements.forEach(element => {
      this.parseFontStyles(element)
    })
  }
  
  /**
   * 增强Excel表格样式
   * @param {Document} doc - DOM文档对象
   */
  static enhanceExcelStyles(doc) {
    const tables = doc.querySelectorAll('table')
    tables.forEach(table => {
      // 设置表格为固定布局以保持列宽
      table.style.tableLayout = 'fixed'
      table.style.borderCollapse = 'collapse'
      table.style.width = '100%'
      table.style.margin = '10px 0'
      
      // 增强单元格样式
      const cells = table.querySelectorAll('td, th')
      cells.forEach(cell => {
        cell.style.border = '1px solid #d0d0d0'
        cell.style.padding = '6px 8px'
        cell.style.textAlign = 'left'
        cell.style.verticalAlign = 'middle'
        cell.style.minWidth = '60px'
        
        // 尝试保持数字格式
        const cellText = cell.textContent.trim()
        if (this.isNumber(cellText)) {
          cell.style.textAlign = 'right'
          // 如果是小数，保持小数位数
          if (cellText.includes('.')) {
            const decimalPlaces = cellText.split('.')[1].length
            cell.style.fontVariantNumeric = 'tabular-nums'
          }
        }
        
        // 检查日期格式
        if (this.isDate(cellText)) {
          cell.style.textAlign = 'center'
        }
        
        // 尝试解析文本对齐
        this.parseTextAlignment(cell)
        
        // 尝试解析字体样式
        this.parseFontStyles(cell)
      })
      
      // 表头样式
      const headers = table.querySelectorAll('th')
      headers.forEach(th => {
        th.style.backgroundColor = '#f5f5f5'
        th.style.fontWeight = 'bold'
        th.style.borderBottom = '2px solid #d0d0d0'
        th.style.textAlign = 'center'
      })
    })
  }
  
  /**
   * 增强PPT样式
   * @param {Document} doc - DOM文档对象
   */
  static enhancePptStyles(doc) {
    // 为幻灯片添加样式
    const slides = doc.querySelectorAll('.slide')
    slides.forEach(slide => {
      slide.style.margin = '20px 0'
      slide.style.padding = '30px'
      slide.style.border = '1px solid #ddd'
      slide.style.borderRadius = '8px'
      slide.style.backgroundColor = '#fff'
      slide.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
    })
    
    // 增强标题样式
    const titles = doc.querySelectorAll('h1, h2, h3')
    titles.forEach(title => {
      title.style.color = '#1890ff'
      title.style.marginBottom = '15px'
    })
  }
  
  /**
   * 添加通用样式增强
   * @param {Document} doc - DOM文档对象
   */
  static addCommonStyleEnhancements(doc) {
    // 添加基础样式
    const style = doc.createElement('style')
    style.textContent = `
      body {
        font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
      }
      
      /* 保持原始格式的通用样式 */
      * {
        box-sizing: border-box;
      }
      
      /* 列表样式 */
      ul, ol {
        padding-left: 20px;
        margin: 10px 0;
      }
      
      li {
        margin: 5px 0;
      }
      
      /* 链接样式 */
      a {
        color: #1890ff;
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      /* 强调文本 */
      strong, b {
        font-weight: bold;
      }
      
      em, i {
        font-style: italic;
      }
      
      /* 图片样式 */
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px 0;
      }
    `
    
    doc.head.appendChild(style)
  }
  
  /**
   * 解析文本对齐方式
   * @param {Element} element - DOM元素
   */
  static parseTextAlignment(element) {
    const text = element.textContent.trim()
    
    // 根据文本内容推断对齐方式
    if (text.length === 0) return
    
    // 检查是否包含居中标识
    if (text.includes('居中') || text.includes('center')) {
      element.style.textAlign = 'center'
      return
    }
    
    // 检查是否包含右对齐标识
    if (text.includes('右对齐') || text.includes('right')) {
      element.style.textAlign = 'right'
      return
    }
    
    // 检查是否包含左对齐标识
    if (text.includes('左对齐') || text.includes('left')) {
      element.style.textAlign = 'left'
      return
    }
    
    // 智能识别需要居中的内容
    if (this.shouldBeCentered(text, element)) {
      element.style.textAlign = 'center'
      return
    }
    
    // 检查数字是否右对齐（常见于表格）
    if (this.isNumber(text)) {
      element.style.textAlign = 'right'
      return
    }
    
    // 检查是否包含日期格式
    if (this.isDate(text)) {
      element.style.textAlign = 'center'
      return
    }
    
    // 默认左对齐
    element.style.textAlign = 'left'
  }
  
  /**
   * 判断文本是否应该居中
   * @param {string} text - 文本内容
   * @param {Element} element - DOM元素
   * @returns {boolean} 是否应该居中
   */
  static shouldBeCentered(text, element) {
    // 标题类文本通常居中
    const titlePatterns = [
      /^第[一二三四五六七八九十\d]+章/,  // 第X章
      /^第[一二三四五六七八九十\d]+节/,  // 第X节
      /^[一二三四五六七八九十\d]+[、.]/, // 1. 2. 等
      /^[（(][一二三四五六七八九十\d]+[）)]/, // (1) (2) 等
      /^[一二三四五六七八九十\d]+[、.]/, // 一、二、等
      /^[（(][一二三四五六七八九十\d]+[）)]/, // (一) (二) 等
    ]
    
    if (titlePatterns.some(pattern => pattern.test(text))) {
      return true
    }
    
    // 短文本且包含特定关键词的居中
    const centerKeywords = [
      '标题', '题目', '主题', '中心', '摘要', '总结', '结论',
      '目录', '索引', '附录', '参考文献', '致谢', '封面',
      '申请表', '申请书', '报告', '说明', '简介'
    ]
    
    if (text.length <= 20 && centerKeywords.some(keyword => text.includes(keyword))) {
      return true
    }
    
    // 包含居中符号的文本
    const centerSymbols = ['※', '★', '●', '◆', '▲', '■', '◎', '○']
    if (centerSymbols.some(symbol => text.includes(symbol))) {
      return true
    }
    
    // 表格中的表头通常居中
    if (element && element.tagName === 'TH') {
      return true
    }
    
    // 标题标签通常居中
    if (element && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
      return true
    }
    
    // 短文本（可能是标题）居中
    if (text.length <= 10 && text.length > 0) {
      return true
    }
    
    // 包含特定格式的文本居中
    const centerFormats = [
      /^[A-Z][A-Z\s]+$/,  // 全大写英文
      /^[A-Z][a-z]+\s[A-Z][a-z]+/,  // 英文标题格式
    ]
    
    if (centerFormats.some(format => format.test(text))) {
      return true
    }
    
    // 时间相关文本通常居中
    if (this.isDate(text)) {
      return true
    }
    
    // 时间相关关键词居中
    const timeKeywords = [
      '时间', '日期', '开始时间', '结束时间', '创建时间', '更新时间',
      '提交时间', '审核时间', '截止时间', '发布时间', '生效时间',
      '开始日期', '结束日期', '创建日期', '更新日期', '提交日期',
      '审核日期', '截止日期', '发布日期', '生效日期'
    ]
    
    if (timeKeywords.some(keyword => text.includes(keyword))) {
      return true
    }
    
    return false
  }
  
  /**
   * 解析字体样式
   * @param {Element} element - DOM元素
   */
  static parseFontStyles(element) {
    const text = element.textContent.trim()
    if (text.length === 0) return
    
    // 检查加粗标识
    if (text.includes('**') || text.includes('加粗') || text.includes('粗体')) {
      element.style.fontWeight = 'bold'
    }
    
    // 检查斜体标识
    if (text.includes('*') || text.includes('斜体') || text.includes('italic')) {
      element.style.fontStyle = 'italic'
    }
    
    // 检查下划线标识
    if (text.includes('下划线') || text.includes('underline')) {
      element.style.textDecoration = 'underline'
    }
    
    // 检查字体大小标识
    const fontSizeMatch = text.match(/字体大小[：:]\s*(\d+)/)
    if (fontSizeMatch) {
      element.style.fontSize = `${fontSizeMatch[1]}px`
    }
    
    // 检查字体名称标识
    const fontFamilyMatch = text.match(/字体[：:]\s*([^，,]+)/)
    if (fontFamilyMatch) {
      const fontName = fontFamilyMatch[1].trim()
      element.style.fontFamily = `"${fontName}", "Microsoft YaHei", Arial, sans-serif`
    }
    
    // 检查颜色标识
    const colorMatch = text.match(/颜色[：:]\s*([^，,]+)/)
    if (colorMatch) {
      const color = colorMatch[1].trim()
      element.style.color = this.parseColor(color)
    }
  }
  
  /**
   * 检查是否为日期时间格式
   * @param {string} str - 要检查的字符串
   * @returns {boolean} 是否为日期时间
   */
  static isDate(str) {
    const dateTimePatterns = [
      // 日期格式
      /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/, // YYYY-MM-DD
      /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/, // MM-DD-YYYY
      /^\d{4}年\d{1,2}月\d{1,2}日$/,   // YYYY年MM月DD日
      /^\d{1,2}月\d{1,2}日$/,          // MM月DD日
      
      // 时间格式
      /^\d{1,2}:\d{1,2}$/,             // HH:MM
      /^\d{1,2}:\d{1,2}:\d{1,2}$/,     // HH:MM:SS
      /^\d{1,2}时\d{1,2}分$/,          // HH时MM分
      /^\d{1,2}时\d{1,2}分\d{1,2}秒$/, // HH时MM分SS秒
      
      // 日期时间格式
      /^\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{1,2}$/, // YYYY-MM-DD HH:MM
      /^\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{1,2}:\d{1,2}$/, // YYYY-MM-DD HH:MM:SS
      /^\d{4}年\d{1,2}月\d{1,2}日\s+\d{1,2}:\d{1,2}$/,   // YYYY年MM月DD日 HH:MM
      /^\d{4}年\d{1,2}月\d{1,2}日\s+\d{1,2}:\d{1,2}:\d{1,2}$/, // YYYY年MM月DD日 HH:MM:SS
      
      // 相对时间格式
      /^\d+天前$/,                     // X天前
      /^\d+小时前$/,                   // X小时前
      /^\d+分钟前$/,                   // X分钟前
      /^\d+秒前$/,                     // X秒前
      /^\d+个月前$/,                   // X个月前
      /^\d+年前$/,                     // X年前
      
      // 特殊时间格式
      /^今天$/,                        // 今天
      /^昨天$/,                        // 昨天
      /^明天$/,                        // 明天
      /^本周$/,                        // 本周
      /^上周$/,                        // 上周
      /^下周$/,                        // 下周
      /^本月$/,                        // 本月
      /^上月$/,                        // 上月
      /^下月$/,                        // 下月
      /^今年$/,                        // 今年
      /^去年$/,                        // 去年
      /^明年$/,                        // 明年
      
      // 时间范围格式
      /^\d{4}年\d{1,2}月$/,           // YYYY年MM月
      /^\d{1,2}月$/,                  // MM月
      /^\d{4}年$/,                    // YYYY年
      
      // 时间段格式
      /^\d{1,2}:\d{1,2}-\d{1,2}:\d{1,2}$/, // HH:MM-HH:MM
      /^\d{1,2}时\d{1,2}分-\d{1,2}时\d{1,2}分$/, // HH时MM分-HH时MM分
    ]
    
    return dateTimePatterns.some(pattern => pattern.test(str))
  }
  
  /**
   * 解析颜色值
   * @param {string} colorStr - 颜色字符串
   * @returns {string} 颜色值
   */
  static parseColor(colorStr) {
    const colorMap = {
      '红色': '#ff0000',
      '蓝色': '#0000ff',
      '绿色': '#008000',
      '黑色': '#000000',
      '白色': '#ffffff',
      '黄色': '#ffff00',
      '紫色': '#800080',
      '橙色': '#ffa500',
      '灰色': '#808080',
      '红色': '#ff0000',
      '蓝色': '#0000ff',
      '绿色': '#008000'
    }
    
    // 检查是否为预定义颜色
    if (colorMap[colorStr]) {
      return colorMap[colorStr]
    }
    
    // 检查是否为十六进制颜色
    if (colorStr.match(/^#[0-9a-fA-F]{6}$/)) {
      return colorStr
    }
    
    // 检查是否为RGB颜色
    if (colorStr.match(/^rgb\(\d+,\s*\d+,\s*\d+\)$/)) {
      return colorStr
    }
    
    // 默认返回黑色
    return '#000000'
  }
  
  /**
   * 检查是否为数字
   * @param {string} str - 要检查的字符串
   * @returns {boolean} 是否为数字
   */
  static isNumber(str) {
    return !isNaN(parseFloat(str)) && isFinite(str)
  }
}

export default StylePreservationService
