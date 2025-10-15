<template>
  <div>

  </div>
</template>
<script lang="ts" setup>

import { getUserProfile, ProfileVO } from '@/api/system/user/profile'

defineOptions({ name: 'ProfileUser' })

const router = useRouter()
const userInfo = ref({} as ProfileVO)
const getUserInfo = async () => {
  const users = await getUserProfile()
  userInfo.value = users

  // 获取用户角色
  if (users.roles && users.roles.length > 0) {
    const firstRoleName = users.roles[0].name

    // 根据角色名称判断跳转路径
    if (firstRoleName === '超级管理员' || firstRoleName === '项目审核员') {
      // 跳转到dashboard/index
    //   window.location.href = '/dashboard/index'
        router.push('/dashboard/index')
    } else {
      // 跳转到dashboard/user
    //   window.location.href = '/dashboard/user'
        router.push('/dashboard/user')
    }
  }
}

// 暴露刷新方法
defineExpose({
  refresh: getUserInfo
})

// 在组件挂载前就执行跳转逻辑，避免显示加载状态
const initAndRedirect = async () => {
  try {
    const users = await getUserProfile()

    // 获取用户角色
    if (users.roles && users.roles.length > 0) {
      const firstRoleName = users.roles[0].name

      // 根据角色名称判断跳转路径
      if (firstRoleName === '超级管理员' || firstRoleName === '项目审核员') {
        // 跳转到dashboard/index
        router.push('/dashboard/index')
      } else {
        // 跳转到dashboard/user
        router.push('/dashboard/user')
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 在组件创建前执行
initAndRedirect()

onMounted(async () => {
  await getUserInfo()
})
</script>

<style scoped>
.text-center {
  position: relative;
  height: 120px;
  text-align: center;
}

.list-group-striped > .list-group-item {
  padding-right: 0;
  padding-left: 0;
  border-right: 0;
  border-left: 0;
  border-radius: 0;
}

.list-group {
  padding-left: 0;
  list-style: none;
}

.list-group-item {
  padding: 11px 0;
  margin-bottom: -1px;
  font-size: 13px;
  border-top: 1px solid #e7eaec;
  border-bottom: 1px solid #e7eaec;
}

.pull-right {
  float: right !important;
}
</style>
