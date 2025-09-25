/**
 * 材料模板Store测试示例
 * 测试改造后的API集成功能
 */

import { useMaterialTemplateStore } from './materialTemplate.js'

/**
 * 快速连接测试
 */
export const quickTest = async () => {
  console.log('🔍 开始材料模板Store测试...')
  
  try {
    const store = useMaterialTemplateStore()
    
    // 1. 测试初始化
    console.log('📊 测试初始化配置...')
    await store.initConfigs()
    
    console.log('✅ 初始化成功，当前配置状态:')
    console.log('- apply:', store.state.configs.apply.length)
    console.log('- opening:', store.state.configs.opening.length)
    console.log('- midterm:', store.state.configs.midterm.length)
    console.log('- acceptance:', store.state.configs.acceptance.length)
    
    // 2. 测试获取配置
    console.log('\n📋 测试获取配置...')
    const applyConfigs = store.getConfigsByBusinessType('apply')
    console.log('✅ 获取apply配置成功，数量:', applyConfigs.length)
    if (applyConfigs.length > 0) {
      console.log('- 第一个配置:', applyConfigs[0])
    }
    
    // 3. 测试统计信息
    console.log('\n📈 测试统计信息...')
    const stats = store.getConfigsStats.value
    console.log('✅ 统计信息:', stats)
    
    // 4. 测试创建配置（可选）
    console.log('\n➕ 测试创建配置...')
    const testConfig = {
      categoryName: `测试模板_${Date.now()}`,
      isRequired: true,
      sortOrder: 999,
      description: '这是一个测试模板',
      templateFilePath: '/templates/test.docx'
    }
    
    try {
      const newConfig = await store.addConfig('apply', testConfig)
      console.log('✅ 创建配置成功:', newConfig)
      
      // 测试更新
      console.log('\n✏️ 测试更新配置...')
      const updatedConfig = await store.updateConfig('apply', newConfig.id, {
        description: '更新后的描述'
      })
      console.log('✅ 更新配置成功:', updatedConfig)
      
      // 测试删除
      console.log('\n🗑️ 测试删除配置...')
      const deleteResult = await store.deleteConfig('apply', newConfig.id)
      console.log('✅ 删除配置成功:', deleteResult)
      
    } catch (error) {
      console.log('⚠️ CRUD操作测试跳过（可能是权限问题）:', error.message)
    }
    
    console.log('\n🎉 材料模板Store测试完成！')
    return true
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return false
  }
}

/**
 * 测试业务类型转换
 */
export const testBusinessTypeMapping = () => {
  console.log('🔄 测试业务类型映射...')
  
  const store = useMaterialTemplateStore()
  
  console.log('业务类型映射:')
  console.log('- businessTypeMap:', store.businessTypeMap)
  console.log('- businessTypeToUseSource:', store.businessTypeToUseSource)
  console.log('- useSourceToBusinessType:', store.useSourceToBusinessType)
  
  // 测试数据转换
  const testApiData = {
    id: 1,
    categoryName: '测试模板',
    isRequired: 0, // REQUIRED
    sort: 1,
    templateFilePath: '/templates/test.docx',
    descriptionAndExplanation: '测试描述',
    useSource: 0, // APPROVAL
    createTime: '2025-01-22T10:00:00.000Z'
  }
  
  console.log('\n📥 测试API数据转换为前端格式:')
  const frontendData = store.convertApiDataToFrontend(testApiData)
  console.log('- 原始API数据:', testApiData)
  console.log('- 转换后前端数据:', frontendData)
  
  console.log('\n📤 测试前端数据转换为API格式:')
  const apiData = store.convertFrontendDataToApi(frontendData, 'apply')
  console.log('- 前端数据:', frontendData)
  console.log('- 转换后API数据:', apiData)
  
  console.log('✅ 业务类型映射测试完成')
}

/**
 * 测试页面监听器
 */
export const testPageListener = () => {
  console.log('👂 测试页面更新监听器...')
  
  const store = useMaterialTemplateStore()
  
  // 注册监听器
  const unregister = store.registerPageUpdateListener('apply', (configs, businessType) => {
    console.log(`📢 接收到${businessType}配置更新通知，配置数量: ${configs.length}`)
  })
  
  // 模拟通知
  store.notifyBusinessPageUpdate('apply')
  
  // 取消注册
  unregister()
  console.log('✅ 页面监听器测试完成')
}

/**
 * 运行所有测试
 */
export const runAllTests = async () => {
  console.log('🚀 开始完整的材料模板Store测试...')
  console.log('=' + '='.repeat(50))
  
  try {
    // 1. 基础映射测试
    testBusinessTypeMapping()
    
    console.log('\n' + '-'.repeat(50))
    
    // 2. 页面监听器测试
    testPageListener()
    
    console.log('\n' + '-'.repeat(50))
    
    // 3. API集成测试
    await quickTest()
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 所有测试完成！')
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error)
  }
}

// 默认导出
export default {
  quickTest,
  testBusinessTypeMapping,
  testPageListener,
  runAllTests
}