/**
 * 项目立项API调试助手
 * 
 * 用于快速诊断API连接问题和响应格式问题
 */

import { getTechnologicalProjectPage } from './index'

/**
 * API连接诊断工具
 * 在控制台执行: await debugApiConnection()
 */
export const debugApiConnection = async () => {
  console.log('🔧 开始API连接诊断...')
  console.log('='.repeat(50))
  
  // 步骤1: 检查基础配置
  console.log('📋 步骤1: 检查基础配置')
  console.log('🌐 当前页面URL:', window.location.href)
  console.log('🔗 API基础URL:', (window as any).__API_BASE_URL__ || '从axios配置获取')
  
  // 步骤2: 检查认证信息
  console.log('\n📋 步骤2: 检查认证信息')
  try {
    const token = localStorage.getItem('ACCESS_TOKEN') || sessionStorage.getItem('ACCESS_TOKEN')
    console.log('🔑 Token存在:', !!token)
    if (token) {
      console.log('🔑 Token长度:', token.length)
      console.log('🔑 Token前缀:', token.substring(0, 20) + '...')
    }
    
    const tenantId = localStorage.getItem('TENANT_ID') || sessionStorage.getItem('TENANT_ID')
    console.log('🏢 租户ID:', tenantId || '未设置')
  } catch (error) {
    console.error('❌ 获取存储信息失败:', error)
  }
  
  // 步骤3: 测试基础网络连接
  console.log('\n📋 步骤3: 测试网络连接')
  try {
    const response = await fetch('/admin-api/technologicalproject/technological-project/page?pageNo=1&pageSize=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 不添加认证头，先测试基础连接
      }
    })
    
    console.log('✅ 基础网络连接状态:', response.status, response.statusText)
    console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('📄 原始响应内容:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    
    try {
      const responseJson = JSON.parse(responseText)
      console.log('📊 解析后的JSON:', responseJson)
    } catch (jsonError) {
      console.warn('⚠️ 响应不是有效的JSON格式')
    }
    
  } catch (fetchError) {
    console.error('❌ 网络连接失败:', fetchError)
    
    if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
      console.log('💡 可能的原因:')
      console.log('  - CORS跨域问题')
      console.log('  - 网络连接问题')
      console.log('  - API服务器未启动')
    }
  }
  
  // 步骤4: 测试通过axios的API调用
  console.log('\n📋 步骤4: 测试通过axios的API调用')
  try {
    const axiosResponse = await getTechnologicalProjectPage({
      pageNo: 1,
      pageSize: 1
    })
    
    console.log('✅ Axios调用成功')
    console.log('📊 完整响应对象:', axiosResponse)
    console.log('📄 响应数据类型:', typeof axiosResponse)
    console.log('📄 响应数据结构:', Object.keys(axiosResponse || {}))
    
    if (axiosResponse && axiosResponse.data) {
      console.log('📋 response.data类型:', typeof axiosResponse.data)
      console.log('📋 response.data结构:', Object.keys(axiosResponse.data || {}))
      console.log('📋 response.data内容:', axiosResponse.data)
      
      if (axiosResponse.data.code !== undefined) {
        console.log('✅ 标准响应格式检测成功')
        console.log('🔢 状态码:', axiosResponse.data.code)
        console.log('💬 消息:', axiosResponse.data.msg)
        console.log('📊 数据:', axiosResponse.data.data)
      } else {
        console.warn('⚠️ 非标准响应格式，缺少code字段')
      }
    } else {
      console.warn('⚠️ response.data不存在或为空')
    }
    
  } catch (axiosError) {
    console.error('❌ Axios调用失败:', axiosError)
    
    if (axiosError && typeof axiosError === 'object') {
      const error = axiosError as any
      
      if (error.response) {
        console.error('🌐 HTTP错误响应:')
        console.error('  状态码:', error.response.status)
        console.error('  状态文本:', error.response.statusText)
        console.error('  响应头:', error.response.headers)
        console.error('  响应数据:', error.response.data)
      } else if (error.request) {
        console.error('📡 请求已发送但无响应:')
        console.error('  请求对象:', error.request)
      } else {
        console.error('🔧 请求配置错误:')
        console.error('  错误消息:', error.message)
      }
      
      if (error.config) {
        console.error('⚙️ 请求配置:')
        console.error('  URL:', error.config.url)
        console.error('  方法:', error.config.method)
        console.error('  请求头:', error.config.headers)
      }
    }
  }
  
  // 步骤5: 环境检查
  console.log('\n📋 步骤5: 环境检查')
  console.log('🌍 用户代理:', navigator.userAgent)
  console.log('🔗 当前域名:', window.location.hostname)
  console.log('🔌 在线状态:', navigator.onLine)
  
  // 检查开发者工具
  console.log('\n💡 调试建议:')
  console.log('1. 打开浏览器开发者工具的Network面板')
  console.log('2. 重新执行API调用，观察网络请求')
  console.log('3. 检查请求的URL、请求头、响应状态')
  console.log('4. 如果是CORS错误，检查服务器CORS配置')
  console.log('5. 如果是401错误，检查Token是否有效')
  
  console.log('='.repeat(50))
  console.log('🔧 API连接诊断完成')
}

/**
 * 简化的连接测试（用于快速验证）
 */
export const quickTest = async () => {
  console.log('⚡ 快速连接测试...')
  
  try {
    const response = await getTechnologicalProjectPage({
      pageNo: 1,
      pageSize: 1
    })
    
    if (response?.data?.code === 0) {
      console.log('✅ 连接正常')
      return true
    } else if (response?.data) {
      console.log('⚠️ 连接异常，错误:', response.data.msg || response.data.code)
      return false
    } else {
      console.log('❌ 响应格式异常')
      console.log('原始响应:', response)
      return false
    }
  } catch (error) {
    console.log('❌ 连接失败:', error)
    return false
  }
}

/**
 * 检查项目环境配置
 */
export const checkEnvironment = () => {
  console.log('🌍 环境配置检查:')
  console.log('NODE_ENV:', import.meta.env.NODE_ENV)
  console.log('BASE_URL:', import.meta.env.BASE_URL)
  console.log('VITE_APP_TENANT_ENABLE:', import.meta.env.VITE_APP_TENANT_ENABLE)
  console.log('所有环境变量:', import.meta.env)
}

// 导出所有诊断工具
export default {
  debugApiConnection,
  quickTest,
  checkEnvironment
}

// 自动在控制台输出使用说明
console.log(`
🔧 API调试助手已加载

🚀 快速使用:
// 完整诊断
await debugApiConnection()

// 快速测试
await quickTest()

// 环境检查
checkEnvironment()

📝 诊断功能:
- 检查认证信息 (Token, 租户ID)
- 测试基础网络连接
- 分析响应格式
- 提供调试建议
`)