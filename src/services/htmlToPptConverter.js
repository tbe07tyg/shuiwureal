/**
 * HTML转PPT服务
 * @description 将HTML内容转换为PPT文件
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

/**
 * HTML转PPT转换器类
 */
export class HtmlToPptConverter {
  /**
   * 将HTML内容转换为PPT文件
   * @param {string} htmlContent - HTML内容
   * @param {string} fileName - 文件名
   * @returns {Promise<File>} PPT文件
   */
  static async convertToPpt(htmlContent, fileName = 'generated_presentation') {
    try {
      console.log('🔄 开始HTML转PPT转换...')
      
      // 注意：由于浏览器环境限制，PPT生成比较复杂
      // 这里提供一个基础的实现，实际项目中可能需要服务端支持
      
      // 1. 解析HTML中的幻灯片
      const slides = this.extractSlidesFromHtml(htmlContent)
      
      // 2. 创建简化的PPT内容（这里生成一个包含所有内容的Word文档作为替代）
      const pptContent = this.createPptContent(slides)
      
      // 3. 由于浏览器限制，这里返回一个包含PPT内容的文本文件
      // 实际项目中可能需要调用服务端API来生成真正的PPT文件
      const pptFile = new File([pptContent], `${fileName}.txt`, {
        type: 'text/plain'
      })
      
      console.log('✅ HTML转PPT转换完成（生成文本文件）')
      console.warn('⚠️ 注意：由于浏览器限制，生成了文本文件而非PPT文件。实际项目中建议使用服务端API生成PPT。')
      
      return pptFile
      
    } catch (error) {
      console.error('❌ HTML转PPT转换失败:', error)
      throw new Error(`HTML转PPT转换失败: ${error.message}`)
    }
  }
  
  /**
   * 从HTML中提取幻灯片内容
   * @param {string} htmlContent - HTML内容
   * @returns {Array} 幻灯片内容数组
   */
  static extractSlidesFromHtml(htmlContent) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const slides = doc.querySelectorAll('.slide')
    
    if (slides.length === 0) {
      // 如果没有找到.slide元素，将整个内容作为一个幻灯片
      return [{
        title: '幻灯片 1',
        content: doc.body.textContent.trim()
      }]
    }
    
    return Array.from(slides).map((slide, index) => {
      const title = slide.querySelector('h1, h2, h3')?.textContent.trim() || `幻灯片 ${index + 1}`
      const content = slide.textContent.trim()
      
      return {
        title,
        content
      }
    })
  }
  
  /**
   * 创建PPT内容
   * @param {Array} slides - 幻灯片数组
   * @returns {string} PPT内容文本
   */
  static createPptContent(slides) {
    let content = `演示文稿\n`
    content += `生成时间: ${new Date().toLocaleString()}\n`
    content += `幻灯片数量: ${slides.length}\n\n`
    
    slides.forEach((slide, index) => {
      content += `========== 幻灯片 ${index + 1} ==========\n`
      content += `标题: ${slide.title}\n`
      content += `内容:\n${slide.content}\n\n`
    })
    
    content += `\n注意：这是一个文本格式的演示文稿内容。\n`
    content += `要生成真正的PPT文件，请使用专业的PPT生成服务。\n`
    
    return content
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

export default HtmlToPptConverter
