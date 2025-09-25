<template>
  <Form ref="formRef" :labelWidth="200" :rules="rules" :schema="schema">
    <template #sex="form">
      <el-radio-group v-model="form['sex']">
        <el-radio :value="1">{{ t('profile.user.man') }}</el-radio>
        <el-radio :value="2">{{ t('profile.user.woman') }}</el-radio>
      </el-radio-group>
    </template>
  </Form>
  <div style="text-align: center">
    <XButton :title="t('common.save')" type="primary" @click="submit()" />
    <XButton :title="t('common.reset')" type="danger" @click="init()" />
  </div>
</template>
<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import { FormSchema } from '@/types/form'
import type { FormExpose } from '@/components/Form'
import {
  getUserProfile,
  updateUserProfile,
  UserProfileUpdateReqVO
} from '@/api/system/user/profile'
import { useUserStore } from '@/store/modules/user'
import { getTechnologicalProjectPage, updateTechnologicalProject } from '@/api/th_qd/approval'
defineOptions({ name: 'BasicInfo' })

const { t } = useI18n()
const message = useMessage() // 消息弹窗
const userStore = useUserStore()

// 定义事件
const emit = defineEmits<{
  (e: 'success'): void
}>()

// 表单校验
const rules = reactive<FormRules>({
  nickname: [{ required: true, message: t('profile.rules.nickname'), trigger: 'blur' }],
  email: [
    { required: true, message: t('profile.rules.mail'), trigger: 'blur' },
    {
      type: 'email',
      message: t('profile.rules.truemail'),
      trigger: ['blur', 'change']
    }
  ],
  mobile: [
    { required: true, message: t('profile.rules.phone'), trigger: 'blur' },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t('profile.rules.truephone'),
      trigger: 'blur'
    }
  ]
})
const schema = reactive<FormSchema[]>([
  {
    field: 'nickname',
    label: t('profile.user.nickname'),
    component: 'Input'
  },
  {
    field: 'mobile',
    label: t('profile.user.mobile'),
    component: 'Input'
  },
  {
    field: 'email',
    label: t('profile.user.email'),
    component: 'Input'
  },
  {
    field: 'sex',
    label: t('profile.user.sex'),
    component: 'InputNumber',
    value: 0
  }
])
const formRef = ref<FormExpose>() // 表单 Ref
const submit = () => {
  const elForm = unref(formRef)?.getElFormRef()
  if (!elForm) return
  elForm.validate(async (valid) => {
    if (valid) {
      const data = unref(formRef)?.formModel as UserProfileUpdateReqVO
      
      // 获取当前用户的昵称（新昵称）
      const newNickname = data.nickname
      console.log("新昵称:", newNickname)
      
      // 在更新用户信息前，先获取当前的用户信息作为旧信息
      const currentProfile = await getUserProfile()
      const oldNickname = currentProfile.nickname
      console.log("旧昵称:", oldNickname)
      
      // 更新用户信息
      await updateUserProfile(data)
      
      try {
        
        // 只有当昵称确实发生变化时才更新项目信息
        if (oldNickname !== newNickname) {
          // 使用旧昵称获取当前用户的项目列表
          const projectsRes = await getTechnologicalProjectPage({
            pageNo: 1,
            pageSize: 100,
            applicant: oldNickname
          })
          console.log("项目列表:", projectsRes)
        
          // 更新每个项目的申请人信息为新昵称
          if (projectsRes.list && projectsRes.list.length > 0) {
            for (const project of projectsRes.list) {
              await updateTechnologicalProject({
                id: project.id,
                applicant: newNickname
              })
              console.log(`已更新项目 ${project.id} 的申请人为 ${newNickname}`)
            }
          }
        } else {
          console.log("昵称未发生变化，无需更新项目信息")
        }
      } catch (error) {
        // 如果获取项目列表失败或用户没有项目，忽略错误继续执行
        console.log("用户暂无项目信息或获取项目列表失败", error)
      }
      
      message.success(t('common.updateSuccess'))
      const profile = await init()
      userStore.setUserNicknameAction(profile.nickname)
      // 发送成功事件
      emit('success')
    }
  })
}
const init = async () => {
  const res = await getUserProfile()
  unref(formRef)?.setValues(res)
  return res
}
onMounted(async () => {
  await init()
})
</script>
