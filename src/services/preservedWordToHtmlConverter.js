/**
 * 保持格式的Word转HTML转换器
 * 解决段落拆分、表格结构变化、样式丢失等问题
 * @description 保持原始文档结构的Word到HTML转换
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import * as mammoth from 'mammoth'

/**
 * 保持格式的Word转HTML转换器类
 */
export class PreservedWordToHtmlConverter {
  
  /**
   * 将Word文档转换为可编辑HTML - 保持原始结构
   * @param {Blob} wordBlob - Word文档Blob对象
   * @param {string} fileName - 文件名
   * @returns {Promise<string>} 可编辑的HTML内容
   */
  static async convertToEditableHtml(wordBlob, fileName) {
    try {
      console.log('🔄 开始保持格式的Word转HTML转换...')
      
      // 1. 检查文件类型
      const fileType = this.getWordFileType(wordBlob)
      console.log(`📄 检测到Word文件类型: ${fileType}`)
      
      // 2. 转换为ArrayBuffer
      const arrayBuffer = await wordBlob.arrayBuffer()
      
      // 3. 使用mammoth.js进行转换 - 保持原始结构
      let result
      const convertOptions = {
        arrayBuffer,
        // 保持原始样式映射
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh", 
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='List Paragraph'] => p:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em",
          "r[style-name='Underline'] => u"
        ],
        // 保持原始表格样式
        includeEmbeddedStyleMap: true,
        // 保持原始图片
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer
            }
          })
        }),
        // 保持原始段落结构
        transformDocument: function(document) {
          return document;
        }
      }
      
      if (fileType === 'doc') {
        console.log('⚠️ 检测到.doc文件，尝试转换（可能效果有限）')
        result = await mammoth.convertToHtml(convertOptions)
      } else {
        result = await mammoth.convertToHtml(convertOptions)
      }
      
      // 4. 处理HTML内容 - 保持原始结构
      const editableHtml = this.processHtmlForEditingPreserved(result.value, fileName)
      
      // 5. 创建完整的编辑页面 - 保持原始结构
      const fullHtml = this.createEditableDocumentPreserved(editableHtml, fileName)
      
      console.log('✅ 保持格式的Word转HTML转换完成')
      return fullHtml
      
    } catch (error) {
      console.error('❌ 保持格式的Word转HTML转换失败:', error)
      
      // 如果是.doc文件转换失败，提供友好的错误提示
      const fileType = this.getWordFileType(wordBlob)
      if (fileType === 'doc') {
        throw new Error('DOC格式文件转换失败。建议将文件另存为DOCX格式后重试，或者使用传统上传方式。')
      }
      
      throw new Error(`保持格式的Word转HTML转换失败: ${error.message}`)
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
    if (mimeType.includes('word') || mimeType.includes('document')) {
      if (mimeType.includes('officedocument.wordprocessingml')) {
        return 'docx'
      } else if (mimeType.includes('msword')) {
        return 'doc'
      }
    }
    
    // 根据文件扩展名判断
    const extension = fileName.toLowerCase().split('.').pop()
    if (extension === 'docx') {
      return 'docx'
    } else if (extension === 'doc') {
      return 'doc'
    }
    
    // 默认返回docx
    return 'docx'
  }
  
  /**
   * 处理HTML内容用于编辑 - 保持原始结构
   * @param {string} htmlContent - 原始HTML内容
   * @param {string} fileName - 文件名
   * @returns {string} 处理后的HTML内容
   */
  static processHtmlForEditingPreserved(htmlContent, fileName) {
    // 直接返回原始HTML内容，不做任何结构修改
    return htmlContent
  }
  
  /**
   * 创建可编辑文档 - 保持原始结构
   * @param {string} htmlContent - HTML内容
   * @param {string} fileName - 文件名
   * @returns {string} 完整的可编辑HTML文档
   */
  static createEditableDocumentPreserved(htmlContent, fileName) {
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
            font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
            line-height: 1.5;
            color: #000;
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
          /* 保持原始段落格式 */
          p {
            margin: 6px 0;
            text-align: left;
          }
          /* 保持原始标题格式 */
          h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 12px 0 6px 0;
          }
          h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 10px 0 5px 0;
          }
          h3 {
            font-size: 12pt;
            font-weight: bold;
            margin: 8px 0 4px 0;
          }
          /* 保持原始表格格式 */
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          /* 保持原始文本格式 */
          strong, b {
            font-weight: bold;
          }
          em, i {
            font-style: italic;
          }
          u {
            text-decoration: underline;
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
}

export default PreservedWordToHtmlConverter
