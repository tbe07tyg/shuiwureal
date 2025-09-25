export interface ApiLogContext {
  action: string; // 用户操作/按钮
  api: string; // 接口方法名（前端封装）
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string;
  url: string;
  params?: unknown;
}

export const apiLog = (ctx: ApiLogContext, response?: unknown) => {
  try {
    const timestamp = new Date().toLocaleTimeString()
    
    if (response !== undefined) {
      // 响应日志 - 成功完成
      console.log(`🔄 [${timestamp}] API响应 ${ctx.method} ${ctx.url}`)
      console.log(`   📍 触发操作: ${ctx.action}`)
      console.log(`   🔧 前端方法: ${ctx.api}`)
      console.log(`   📤 请求参数:`, ctx.params)
      console.log(`   📥 响应数据:`, response)
      console.log(`   ✅ 调用完成`)
    } else {
      // 请求日志 - 开始调用
      console.log(`🚀 [${timestamp}] API请求 ${ctx.method} ${ctx.url}`)
      console.log(`   📍 触发操作: ${ctx.action}`)
      console.log(`   🔧 前端方法: ${ctx.api}`)
      console.log(`   📤 请求参数:`, ctx.params)
    }
  } catch (e) {
    // 最低保真日志
    console.log('API_LOG', ctx, response)
  }
}


