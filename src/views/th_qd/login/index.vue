<template>
  <div class="login-bg">
    <div class="login-main">
      <div class="login-side">
        <div class="side-title">科技创新管控系统</div>
        <div class="side-desc">让科研管理更高效、更智能</div>
      </div>
      <div class="login-form-wrap">
        <div class="login-form-box">
          <div class="login-card">
            <!-- 登录/注册切换标签 -->
            <div class="login-custom-tabs">
              <div 
                :class="['login-custom-tab', activeTab === 'login' && 'active']" 
                @click="activeTab = 'login'"
              >
                账号登录
              </div>
              <div 
                :class="['login-custom-tab', activeTab === 'register' && 'active']" 
                @click="activeTab = 'register'"
              >
                注册账号
              </div>
            </div>
            
            <div class="login-form-content">
              <!-- 账号登录表单 -->
              <template v-if="activeTab === 'login'">
                <a-form 
                  :model="loginForm" 
                  :rules="loginRules" 
                  ref="loginFormRef" 
                  @finish="handleLogin" 
                  layout="vertical"
                >
                  <a-form-item name="username">
                    <a-input 
                      v-model:value="loginForm.username" 
                      size="large" 
                      placeholder="请输入用户名" 
                      style="width:100%;" 
                    />
                  </a-form-item>
                  <a-form-item name="password">
                    <a-input-password 
                      v-model:value="loginForm.password" 
                      size="large" 
                      placeholder="请输入密码" 
                    />
                  </a-form-item>
                  <a-form-item>
                    <el-row justify="space-between" style="width: 100%">
                      <el-col :span="12">
                        <el-checkbox v-model="loginForm.rememberMe">
                          记住我
                        </el-checkbox>
                      </el-col>
                      <el-col :span="12">
                        <el-link style="float: right" type="primary" @click="handleForgetPassword">
                          忘记密码
                        </el-link>
                      </el-col>
                    </el-row>
                  </a-form-item>
                  <a-form-item class="login-btn-row">
                    <a-tooltip :title="loginHistoryTitle">
                      <a-button 
                        type="primary" 
                        html-type="submit" 
                        class="full-width-btn" 
                        :loading="loading" 
                        style="background:#234fa2;border:none;color:#fff;" 
                        block
                      >
                        登录
                      </a-button>
                    </a-tooltip>
                  </a-form-item>
                </a-form>
              </template>

              <!-- 注册表单（整合RegisterForm功能并去掉手机号验证） -->
              <template v-if="activeTab === 'register'">
                <a-form 
                  :model="registerForm" 
                  :rules="registerRules" 
                  ref="registerFormRef" 
                  @finish="handleRegister" 
                  layout="vertical"
                >
                  <!-- 租户输入（可选） -->
                  <!-- <a-form-item v-if="tenantEnable" name="tenantName">
                    <a-input
                      v-model:value="registerForm.tenantName"
                      placeholder="请输入租户名称"
                      size="large"
                      style="width:100%;"
                    />
                  </a-form-item> -->
                  
                  <a-form-item name="username">
                    <a-input 
                      v-model:value="registerForm.username" 
                      size="large" 
                      placeholder="请设置用户名" 
                      style="width:100%;" 
                    />
                  </a-form-item>
                  
                  <a-form-item name="nickname">
                    <a-input 
                      v-model:value="registerForm.nickname" 
                      size="large" 
                      placeholder="请输入昵称" 
                      style="width:100%;" 
                    />
                  </a-form-item>
                  
                  <a-form-item name="password">
                    <a-input-password 
                      v-model:value="registerForm.password" 
                      size="large" 
                      placeholder="请设置密码" 
                    />
                  </a-form-item>
                  
                  <a-form-item name="confirmPassword">
                    <a-input-password 
                      v-model:value="registerForm.confirmPassword" 
                      size="large" 
                      placeholder="请确认密码" 
                    />
                  </a-form-item>

                  <!-- 验证码组件（如果启用） -->
                  <Verify
                    v-if="captchaEnable === 'true'"
                    ref="verify"
                    :captchaType="captchaType"
                    :imgSize="{ width: '100%', height: '200px' }"
                    mode="pop"
                    @success="handleRegisterWithCaptcha"
                  />
                  
                  <a-form-item class="login-btn-row">
                    <a-button 
                      type="primary" 
                      html-type="submit" 
                      class="full-width-btn" 
                      :loading="registerLoading" 
                      style="background:#234fa2;border:none;color:#fff;" 
                      block
                    >
                      注册
                    </a-button>
                  </a-form-item>
                </a-form>
              </template>
            </div>
          </div>
          
          <!-- 强制修改密码弹窗 -->
          <a-modal 
            v-model:open="showForcePwd" 
            title="首次登录请修改密码" 
            @ok="onForcePwdOk" 
            :closable="false" 
            :maskClosable="false"
          >
            <a-form 
              :model="forcePwdForm" 
              :rules="forcePwdRules" 
              ref="forcePwdRef" 
              @finish="onForcePwdSubmit" 
              layout="vertical"
            >
              <a-form-item name="newPwd">
                <a-input-password 
                  v-model:value="forcePwdForm.newPwd" 
                  size="large" 
                  placeholder="请输入新密码" 
                />
              </a-form-item>
              <a-form-item name="confirmPwd">
                <a-input-password 
                  v-model:value="forcePwdForm.confirmPwd" 
                  size="large" 
                  placeholder="请再次输入新密码" 
                />
              </a-form-item>
            </a-form>
          </a-modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { ElCheckbox, ElRow, ElCol, ElLink, ElLoading } from 'element-plus'
import * as LoginApi from '@/api/login'
import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
// import Verify from './Verify.vue' // 假设验证码组件路径

// 状态管理
const activeTab = ref('login') // login/register
const loading = ref(false)
const registerLoading = ref(false)
const showForcePwd = ref(false)
const verify = ref()
const captchaType = ref('blockPuzzle') // 滑块验证码
const captchaEnable = import.meta.env.VITE_APP_CAPTCHA_ENABLE
const tenantEnable = import.meta.env.VITE_APP_TENANT_ENABLE !== 'false'

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || ''
})

// 登录表单规则
const loginRules = {
  // tenantName: [
  //   { required: tenantEnable, trigger: 'blur', message: '请输入您所属的租户' },
  //   { min: 2, max: 20, message: '租户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
  // ],
  username: [
    { required: true, message: '请输入用户名' }
  ],
  password: [
    { required: true, message: '请输入密码' }
  ]
}

// 注册表单（整合RegisterForm功能）
const registerForm = reactive({
  tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  captchaVerification: ''
})

// 注册表单规则（去掉手机号验证）
const registerRules = {
  // tenantName: [
  //   { required: tenantEnable, trigger: 'blur', message: '请输入您所属的租户' },
  //   { min: 2, max: 20, message: '租户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
  // ],
  username: [
    { required: true, trigger: 'blur', message: '请输入您的账号' },
    { min: 4, max: 30, message: '用户账号长度必须介于 4 和 30 之间', trigger: 'blur' }
  ],
  nickname: [
    { required: true, trigger: 'blur', message: '请输入您的昵称' },
    { min: 0, max: 30, message: '昵称长度必须介于 0 和 30 之间', trigger: 'blur' }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入您的密码' },
    { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' },
    { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\\ |', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '请再次输入您的密码' },
    { 
      validator: (_, value) => {
        if (value !== registerForm.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      }
    }
  ]
}

// 表单引用
const loginFormRef = ref()
const registerFormRef = ref()
const forcePwdRef = ref()

// 登录历史提示
const loginHistory = []
const loginHistoryTitle = computed(() =>
  loginHistory.map(item =>
    `<span style='color:${item.abnormal ? 'red' : '#333'}'>${item.ip}（${item.time}）</span>`
  ).join('<br/>')
)

// 强制修改密码表单
const forcePwdForm = reactive({ newPwd: '', confirmPwd: '' })
const forcePwdRules = {
  newPwd: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度不能少于6位' }
  ],
  confirmPwd: [
    { required: true, message: '请再次输入新密码' },
    { 
      validator: (_, value) => {
        if (value !== forcePwdForm.newPwd) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      }
    }
  ]
}

// 路由相关
const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()
const redirect = ref('')

// 登录处理
const handleLogin = async () => {
  loading.value = true
  try {
    // 获取租户ID
    if (tenantEnable) {
      const tenantId = await LoginApi.getTenantIdByName(loginForm.tenantName)
      authUtil.setTenantId(tenantId)
    }

    // 调用登录接口
    const res = await LoginApi.login({
      username: loginForm.username,
      password: loginForm.password
      // captchaVerification: params.captchaVerification,
    })

    // 处理记住密码
    if (loginForm.rememberMe) {
      authUtil.setLoginForm(loginForm)
    } else {
      authUtil.removeLoginForm()
    }

    // 存储token
    authUtil.setToken(res)

    // 判断是否需要强制修改密码
    if (res.needForceChangePwd) {
      showForcePwd.value = true
      return
    }

    // 跳转首页
    const redirectPath = route.query.redirect || permissionStore.addRouters[0]?.path || '/'
    router.push(redirectPath)
  } catch (error) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  // 验证码处理
  if (captchaEnable === 'true') {
    verify.value.show()
    return
  }
  
  // 无验证码直接提交
  await submitRegister()
}

// 带验证码的注册处理
const handleRegisterWithCaptcha = async (params) => {
  registerForm.captchaVerification = params.captchaVerification
  await submitRegister()
}

// 实际注册提交逻辑
const submitRegister = async () => {
  registerLoading.value = true
  try {
    // // 处理租户信息
    // if (tenantEnable) {
    //   await getTenantId()
    //   registerForm.tenantId = authUtil.getTenantId()
    // }

    // 调用注册接口
    const res = await LoginApi.register(registerForm)
    if (!res) return

    message.success('注册成功，请登录')
    activeTab.value = 'login'
    // 自动填充用户名
    loginForm.username = registerForm.username
    
    // 显示加载状态并跳转
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    authUtil.setToken(res)
    const redirectPath = redirect.value || permissionStore.addRouters[0]?.path || '/'
    if (redirectPath.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      router.push(redirectPath)
    }

    loadingInstance.close()
  } catch (error) {
    message.error(error.message || '注册失败')
  } finally {
    registerLoading.value = false
  }
}

// 获取租户ID
const getTenantId = async () => {
  if (tenantEnable) {
    const res = await LoginApi.getTenantIdByName(registerForm.tenantName)
    authUtil.setTenantId(res)
  }
}

// 根据域名获取租户信息
const getTenantByWebsite = async () => {
  if (tenantEnable) {
    const website = location.host
    const res = await LoginApi.getTenantByWebsite(website)
    if (res) {
      registerForm.tenantName = res.name
      authUtil.setTenantId(res.id)
    }
  }
}

// 忘记密码处理
const handleForgetPassword = () => {
  message.info('忘记密码功能待实现')
}

// 强制修改密码确认
const onForcePwdOk = () => {
  forcePwdRef.value.validate().then(() => {
    LoginApi.updatePassword({
      newPassword: forcePwdForm.newPwd
    }).then(() => {
      showForcePwd.value = false
      message.success('密码修改成功，正在跳转...')
      router.push('/th-qd-project')
    }).catch(err => {
      message.error(err.message || '修改失败')
    })
  })
}

const onForcePwdSubmit = () => {
  onForcePwdOk()
}

// 监听路由变化
watch(
  () => route,
  (currentRoute) => {
    redirect.value = currentRoute.query.redirect as string
  },
  { immediate: true }
)

// 页面挂载时处理
onMounted(() => {
  // 如果已登录则跳转首页
  if (localStorage.getItem('token') && route.path === '/login') {
    router.push('/index')
  }

  // 读取记住的登录信息
  const savedLoginForm = authUtil.getLoginForm()
  if (savedLoginForm) {
    Object.assign(loginForm, savedLoginForm)
  }

  // 获取租户信息
  getTenantByWebsite()
})
</script>

<style scoped>
/* 原有样式保持不变 */
.login-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f8ff;
}
.login-main {
  display: flex;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(35,79,162,0.10);
  overflow: hidden;
  width: 720px;
  min-height: 420px;
}
.login-side {
  background: linear-gradient(135deg, #234fa2 0%, #4e7be6 100%);
  color: #fff;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}
.side-title {
  font-size: 1.7rem;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 2px;
}
.side-desc {
  font-size: 1.1rem;
  opacity: 0.85;
}
.login-form-wrap {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  height: 100%;
}
.login-form-box {
  width: 100%;
  height: 100%;
  display: flex;
}
.login-card {
  background: #fff;
  border-radius: 0 18px 18px 0;
  box-shadow: none;
  padding: 40px 36px 28px 36px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 420px;
  height: 100%;
}
.login-custom-tabs {
  display: flex;
  border-bottom: 2px solid #e6eaf2;
  margin-bottom: 32px;
}
.login-custom-tab {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #234fa2;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: border 0.2s, color 0.2s;
  background: transparent;
}
.login-custom-tab.active {
  border-bottom: 3px solid #234fa2;
  color: #234fa2;
  background: #f5f8ff;
}
.login-form-content {
  margin-top: 16px;
  min-height: 240px;
  position: relative;
  padding-bottom: 64px;
}
.captcha-row {
  display: flex;
  gap: 8px;
}
.get-captcha-btn {
  height: 44px;
  min-width: 120px;
  background: #f5f8ff;
  color: #234fa2;
  border: 1.5px solid #e6eaf2;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  margin-left: 8px;
  transition: all 0.2s;
  box-shadow: none;
  padding: 0 12px;
}
.get-captcha-btn:hover, .get-captcha-btn:focus {
  background: #234fa2;
  color: #fff;
  border-color: #234fa2;
}
.login-btn-row {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  margin: 0;
  padding: 0;
}
.full-width-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 1px;
}
:deep(.ant-input-affix-wrapper) {
  width: 100% !important;
  min-width: 0;
  height: 44px !important;
  border-radius: 6px !important;
  border: 1.5px solid #e6eaf2 !important;
  font-size: 16px;
  box-shadow: none !important;
}
:deep(.ant-input:focus), :deep(.ant-input-affix-wrapper-focused) {
  border-color: #234fa2 !important;
  box-shadow: 0 0 0 2px rgba(35,79,162,0.08) !important;
}
:deep(.ant-form-item) {
  margin-bottom: 24px !important;
}
@media (max-width: 800px) {
  .login-main {
    width: 100vw;
    min-width: 0;
    border-radius: 0;
  }
  .login-side {
    display: none;
  }
  .login-form-box {
    width: 100vw;
    min-width: 0;
    padding: 0 12px;
  }
  .login-card {
    border-radius: 0;
    min-height: 100vh;
  }
}
</style>