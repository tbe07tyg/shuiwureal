import { Layout } from '@/utils/routerHelper'


const { t } = useI18n()
/**
 * redirect: noredirect        当设置 noredirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'          设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * meta : {
 hidden: true              当设置 true 的时候该路由不会再侧边栏出现 如404，login等页面(默认 false)

 alwaysShow: true          当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式，
 只有一个时，会将那个子路由当做根路由显示在侧边栏，
 若你想不管路由下面的 children 声明的个数都显示你的根路由，
 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，
 一直显示根路由(默认 false)

 title: 'title'            设置该路由在侧边栏和面包屑中展示的名字

 icon: 'svg-name'          设置该路由的图标

 noCache: true             如果设置为true，则不会被 <keep-alive> 缓存(默认 false)

 breadcrumb: false         如果设置为false，则不会在breadcrumb面包屑中显示(默认 true)

 affix: true               如果设置为true，则会一直固定在tag项中(默认 false)

 noTagsView: true          如果设置为true，则不会出现在tag中(默认 false)

 activeMenu: '/dashboard'  显示高亮的路由路径

 followAuth: '/dashboard'  跟随哪个路由进行权限过滤

 canTo: true               设置为true即使hidden为true，也依然可以进行路由跳转(默认 false)
 }
 **/
const remainingRouter: AppRouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  // TH项目管理 - 团队成员工作台 v2
  {
    path: '/th-qd-workbenchv2',
    component: Layout,
    name: 'ThQdWorkbenchV2',
    meta: {
      hidden: true,
      alwaysShow: true,
      title: '团队成员工作台',
      icon: 'ep:monitor',
      rank: 111
    },
    children: [
      {
        path: 'mytasklist',
        name: 'ThQdWorkbenchV2Home',
        component: () => import('@/views/th_qd/team-workbench-v2/index.vue'),
        meta: { title: '我的工作台', icon: 'ep:monitor' }
      }
    ]
  },
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/index',
  //   name: 'Home',
  //   meta: {},
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/Home/Index.vue'),
  //       name: 'Index',
  //       meta: {
  //         title: t('router.home'),
  //         icon: 'ep:home-filled',
  //         noCache: false,
  //         affix: true
  //       }
  //     }
  //   ]
  // },
  {
    path: '/user',
    component: Layout,
    name: 'UserInfo',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'profile',
        component: () => import('@/views/Profile/Index.vue'),
        name: 'Profile',
        meta: {
          canTo: true,
          hidden: true,
          noTagsView: false,
          icon: 'ep:user',
          title: t('common.profile')
        }
      },
      {
        path: 'notify-message',
        component: () => import('@/views/system/notify/my/index.vue'),
        name: 'MyNotifyMessage',
        meta: {
          canTo: true,
          hidden: true,
          noTagsView: false,
          icon: 'ep:message',
          title: '我的站内信'
        }
      }
    ]
  },
  {
    path: '/dict',
    component: Layout,
    name: 'dict',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'type/data/:dictType',
        component: () => import('@/views/system/dict/data/index.vue'),
        name: 'SystemDictData',
        meta: {
          title: '字典数据',
          noCache: true,
          hidden: true,
          canTo: true,
          icon: '',
          activeMenu: '/system/dict'
        }
      }
    ]
  },

  {
    path: '/codegen',
    component: Layout,
    name: 'CodegenEdit',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'edit',
        component: () => import('@/views/infra/codegen/EditTable.vue'),
        name: 'InfraCodegenEditTable',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:edit',
          title: '修改生成配置',
          activeMenu: 'infra/codegen/index'
        }
      }
    ]
  },
  {
    path: '/job',
    component: Layout,
    name: 'JobL',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'job-log',
        component: () => import('@/views/infra/job/logger/index.vue'),
        name: 'InfraJobLog',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:edit',
          title: '调度日志',
          activeMenu: 'infra/job/index'
        }
      }
    ]
  },
  {
    path: '/login',
    // component: () => import('@/views/Login/Login.vue'),
        component: () => import('@/views/th_qd/login/index.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/login1',
    component: () => import('@/views/th_qd/login/index.vue'),
    name: 'Login1',
    meta: {
      hidden: true,
      title: '登录',
      noTagsView: true
    }
  },
  {
    path: '/sso',
    component: () => import('@/views/Login/Login.vue'),
    name: 'SSOLogin',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/social-login',
    component: () => import('@/views/Login/SocialLogin.vue'),
    name: 'SocialLogin',
    meta: {
      hidden: true,
      title: t('router.socialLogin'),
      noTagsView: true
    }
  },
  {
    path: '/403',
    component: () => import('@/views/Error/403.vue'),
    name: 'NoAccess',
    meta: {
      hidden: true,
      title: '403',
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFound',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  },
  {
    path: '/500',
    component: () => import('@/views/Error/500.vue'),
    name: 'Error',
    meta: {
      hidden: true,
      title: '500',
      noTagsView: true
    }
  },
  {
    path: '/bpm',
    component: Layout,
    name: 'bpm',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'manager/form/edit',
        component: () => import('@/views/bpm/form/editor/index.vue'),
        name: 'BpmFormEditor',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '设计流程表单',
          activeMenu: '/bpm/manager/form'
        }
      },
      {
        path: 'manager/definition',
        component: () => import('@/views/bpm/model/definition/index.vue'),
        name: 'BpmProcessDefinition',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '流程定义',
          activeMenu: '/bpm/manager/model'
        }
      },
      {
        path: 'process-instance/detail',
        component: () => import('@/views/bpm/processInstance/detail/index.vue'),
        name: 'BpmProcessInstanceDetail',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '流程详情',
          activeMenu: '/bpm/task/my'
        },
        props: (route) => ({
          id: route.query.id,
          taskId: route.query.taskId,
          activityId: route.query.activityId
        })
      },
      {
        path: 'process-instance/report',
        component: () => import('@/views/bpm/processInstance/report/index.vue'),
        name: 'BpmProcessInstanceReport',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '数据报表',
          activeMenu: '/bpm/manager/model'
        }
      },
      {
        path: 'oa/leave/create',
        component: () => import('@/views/bpm/oa/leave/create.vue'),
        name: 'OALeaveCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '发起 OA 请假',
          activeMenu: '/bpm/oa/leave'
        }
      },
      {
        path: 'oa/leave/detail',
        component: () => import('@/views/bpm/oa/leave/detail.vue'),
        name: 'OALeaveDetail',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '查看 OA 请假',
          activeMenu: '/bpm/oa/leave'
        }
      },
      {
        path: 'manager/model/create',
        component: () => import('@/views/bpm/model/form/index.vue'),
        name: 'BpmModelCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '创建流程',
          activeMenu: '/bpm/manager/model'
        }
      },
      {
        path: 'manager/model/:type/:id',
        component: () => import('@/views/bpm/model/form/index.vue'),
        name: 'BpmModelUpdate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '修改流程',
          activeMenu: '/bpm/manager/model'
        }
      }
    ]
  },
  {
    path: '/mall/product', // 商品中心
    component: Layout,
    name: 'ProductCenter',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'spu/add',
        component: () => import('@/views/mall/product/spu/form/index.vue'),
        name: 'ProductSpuAdd',
        meta: {
          noCache: false, // 需要缓存
          hidden: true,
          canTo: true,
          icon: 'ep:edit',
          title: '商品添加',
          activeMenu: '/mall/product/spu'
        }
      },
      {
        path: 'spu/edit/:id(\\d+)',
        component: () => import('@/views/mall/product/spu/form/index.vue'),
        name: 'ProductSpuEdit',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:edit',
          title: '商品编辑',
          activeMenu: '/mall/product/spu'
        }
      },
      {
        path: 'spu/detail/:id(\\d+)',
        component: () => import('@/views/mall/product/spu/form/index.vue'),
        name: 'ProductSpuDetail',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:view',
          title: '商品详情',
          activeMenu: '/mall/product/spu'
        }
      },
      {
        path: 'property/value/:propertyId(\\d+)',
        component: () => import('@/views/mall/product/property/value/index.vue'),
        name: 'ProductPropertyValue',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:view',
          title: '商品属性值',
          activeMenu: '/product/property'
        }
      }
    ]
  },
  {
    path: '/mall/trade', // 交易中心
    component: Layout,
    name: 'TradeCenter',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'order/detail/:id(\\d+)',
        component: () => import('@/views/mall/trade/order/detail/index.vue'),
        name: 'TradeOrderDetail',
        meta: { title: '订单详情', icon: 'ep:view', activeMenu: '/mall/trade/order' }
      },
      {
        path: 'after-sale/detail/:id(\\d+)',
        component: () => import('@/views/mall/trade/afterSale/detail/index.vue'),
        name: 'TradeAfterSaleDetail',
        meta: { title: '退款详情', icon: 'ep:view', activeMenu: '/mall/trade/after-sale' }
      }
    ]
  },
  {
    path: '/member',
    component: Layout,
    name: 'MemberCenter',
    meta: { hidden: true },
    children: [
      {
        path: 'user/detail/:id',
        name: 'MemberUserDetail',
        meta: {
          title: '会员详情',
          noCache: true,
          hidden: true
        },
        component: () => import('@/views/member/user/detail/index.vue')
      }
    ]
  },
  {
    path: '/pay',
    component: Layout,
    name: 'pay',
    meta: { hidden: true },
    children: [
      {
        path: 'cashier',
        name: 'PayCashier',
        meta: {
          title: '收银台',
          noCache: true,
          hidden: true
        },
        component: () => import('@/views/pay/cashier/index.vue')
      }
    ]
  },
  {
    path: '/diy',
    name: 'DiyCenter',
    meta: { hidden: true },
    component: Layout,
    children: [
      {
        path: 'template/decorate/:id',
        name: 'DiyTemplateDecorate',
        meta: {
          title: '模板装修',
          noCache: false,
          hidden: true,
          activeMenu: '/mall/promotion/diy-template/diy-template'
        },
        component: () => import('@/views/mall/promotion/diy/template/decorate.vue')
      },
      {
        path: 'page/decorate/:id',
        name: 'DiyPageDecorate',
        meta: {
          title: '页面装修',
          noCache: false,
          hidden: true,
          activeMenu: '/mall/promotion/diy-template/diy-page'
        },
        component: () => import('@/views/mall/promotion/diy/page/decorate.vue')
      }
    ]
  },
  {
    path: '/crm',
    component: Layout,
    name: 'CrmCenter',
    meta: { hidden: true },
    children: [
      {
        path: 'clue/detail/:id',
        name: 'CrmClueDetail',
        meta: {
          title: '线索详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/clue'
        },
        component: () => import('@/views/crm/clue/detail/index.vue')
      },
      {
        path: 'customer/detail/:id',
        name: 'CrmCustomerDetail',
        meta: {
          title: '客户详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/customer'
        },
        component: () => import('@/views/crm/customer/detail/index.vue')
      },
      {
        path: 'business/detail/:id',
        name: 'CrmBusinessDetail',
        meta: {
          title: '商机详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/business'
        },
        component: () => import('@/views/crm/business/detail/index.vue')
      },
      {
        path: 'contract/detail/:id',
        name: 'CrmContractDetail',
        meta: {
          title: '合同详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/contract'
        },
        component: () => import('@/views/crm/contract/detail/index.vue')
      },
      {
        path: 'receivable-plan/detail/:id',
        name: 'CrmReceivablePlanDetail',
        meta: {
          title: '回款计划详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/receivable-plan'
        },
        component: () => import('@/views/crm/receivable/plan/detail/index.vue')
      },
      {
        path: 'receivable/detail/:id',
        name: 'CrmReceivableDetail',
        meta: {
          title: '回款详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/receivable'
        },
        component: () => import('@/views/crm/receivable/detail/index.vue')
      },
      {
        path: 'contact/detail/:id',
        name: 'CrmContactDetail',
        meta: {
          title: '联系人详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/contact'
        },
        component: () => import('@/views/crm/contact/detail/index.vue')
      },
      {
        path: 'product/detail/:id',
        name: 'CrmProductDetail',
        meta: {
          title: '产品详情',
          noCache: true,
          hidden: true,
          activeMenu: '/crm/product'
        },
        component: () => import('@/views/crm/product/detail/index.vue')
      }
    ]
  },
  {
    path: '/ai',
    component: Layout,
    name: 'Ai',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'image/square',
        component: () => import('@/views/ai/image/square/index.vue'),
        name: 'AiImageSquare',
        meta: {
          title: '绘图作品',
          icon: 'ep:home-filled',
          noCache: false
        }
      },
      {
        path: 'knowledge/document',
        component: () => import('@/views/ai/knowledge/document/index.vue'),
        name: 'AiKnowledgeDocument',
        meta: {
          title: '知识库文档',
          icon: 'ep:document',
          noCache: false,
          activeMenu: '/ai/knowledge'
        }
      },
      {
        path: 'knowledge/document/create',
        component: () => import('@/views/ai/knowledge/document/form/index.vue'),
        name: 'AiKnowledgeDocumentCreate',
        meta: {
          title: '创建文档',
          icon: 'ep:plus',
          noCache: true,
          hidden: true,
          activeMenu: '/ai/knowledge'
        }
      },
      {
        path: 'knowledge/document/update',
        component: () => import('@/views/ai/knowledge/document/form/index.vue'),
        name: 'AiKnowledgeDocumentUpdate',
        meta: {
          title: '修改文档',
          icon: 'ep:edit',
          noCache: true,
          hidden: true,
          activeMenu: '/ai/knowledge'
        }
      },
      {
        path: 'knowledge/retrieval',
        component: () => import('@/views/ai/knowledge/knowledge/retrieval/index.vue'),
        name: 'AiKnowledgeRetrieval',
        meta: {
          title: '文档召回测试',
          icon: 'ep:search',
          noCache: true,
          hidden: true,
          activeMenu: '/ai/knowledge'
        }
      },
      {
        path: 'knowledge/segment',
        component: () => import('@/views/ai/knowledge/segment/index.vue'),
        name: 'AiKnowledgeSegment',
        meta: {
          title: '知识库分段',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/ai/knowledge'
        }
      },
      {
        path: 'console/workflow/create',
        component: () => import('@/views/ai/workflow/form/index.vue'),
        name: 'AiWorkflowCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '设计 AI 工作流',
          activeMenu: '/ai/console/workflow'
        }
      },
      {
        path: 'console/workflow/:type/:id',
        component: () => import('@/views/ai/workflow/form/index.vue'),
        name: 'AiWorkflowUpdate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '设计 AI 工作流',
          activeMenu: '/ai/console/workflow'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Error/404.vue'),
    name: '',
    meta: {
      title: '404',
      hidden: true,
      breadcrumb: false
    }
  },
  {
    path: '/iot',
    component: Layout,
    name: 'IOT',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'product/product/detail/:id',
        name: 'IoTProductDetail',
        meta: {
          title: '产品详情',
          noCache: true,
          hidden: true,
          activeMenu: '/iot/device/product'
        },
        component: () => import('@/views/iot/product/product/detail/index.vue')
      },
      {
        path: 'device/detail/:id',
        name: 'IoTDeviceDetail',
        meta: {
          title: '设备详情',
          noCache: true,
          hidden: true,
          activeMenu: '/iot/device/device'
        },
        component: () => import('@/views/iot/device/device/detail/index.vue')
      },
      {
        path: 'plugin/detail/:id',
        name: 'IoTPluginDetail',
        meta: {
          title: '插件详情',
          noCache: true,
          hidden: true,
          activeMenu: '/iot/plugin'
        },
        component: () => import('@/views/iot/plugin/detail/index.vue')
      }
    ]
  },
  






































































































  // TH项目管理系统
  {
    path: '/',
    component: Layout,
    name: 'ThQd',
    redirect: '/index',
    meta: {
      hidden: true,
      title: 'TH项目管理',
      icon: 'ep:office-building',
      rank: 100
    },
    children: [
      {
        path: 'index',
        name: 'ThQdDashboard',
        component: () => import('@/views/th_qd/dashboard/index.vue'),
        meta: {
          title: '工作台',
          icon: 'ep:monitor'
        }
        
      }
    ]
  },
  
  // TH项目管理 - 项目管理
  {
    path: '/th-qd-project',
    component: Layout,
    name: 'ThQdProject',
    meta: {
      title: '项目管理',
      icon: 'ep:folder',
      hidden: true,
    },
    children: [
      {
        path: 'list',
        name: 'ThQdProjectList',
        component: () => import('@/views/th_qd/project/index.vue'),
        meta: {
          title: '项目列表',
          icon: 'ep:document'
        },
      },
      {
        path: 'create',
        name: 'ThQdProjectCreate',
        component: () => import('@/views/th_qd/project/create.vue'),
        meta: {
          title: '创建项目',
          icon: 'ep:plus'
        }
      },
      {
        path: 'detail/:id',
        name: 'ThQdProjectDetail',
        component: () => import('@/views/th_qd/project/detail.vue'),
        meta: {
          title: '项目详情',
          hidden: true,
          noTagsView: false,
          canTo: true,
          activeMenu: '/th-qd-project/list'
        },
      },
      // TH项目管理 - 项目调研
      {
        path: 'research',
        name: 'ThQdResearch',
        meta: {
          title: '项目调研',
          icon: 'ep:search',
          rank: 102
        },
        children: [
          {
            path: 'requirements',
            name: 'ThQdResearchRequirements',
            component: () => import('@/views/th_qd/research/requirements/index.vue'),
            meta: {
              title: '需求调研',
              icon: 'ep:edit'
            }
          },
          {
            path: 'results',
            name: 'ThQdResearchResults',
            component: () => import('@/views/th_qd/research/results/index.vue'),
            meta: {
              title: '调研结果',
              icon: 'ep:view'
            }
          }
        ]
      },
      // TH项目管理 - 项目立项
      {
        path: 'approval',
        name: 'ThQdApproval',
        redirect: '/th-qd-approval/index',
        meta: {
          title: '项目立项',
          icon: 'ep:document-checked',
          rank: 103
        },
        children: [
          {
            path: 'index',
            name: 'ThQdApprovalIndex',
            component: () => import('@/views/th_qd/approval/index.vue'),
            meta: {
              title: '项目立项',
              icon: 'ep:document-checked'
            }
          },
          {
            path: 'applicant/manage',
            name: 'ThQdApprovalApplicantManage',
            component: () => import('@/views/th_qd/approval/applicant/manage.vue'),
            meta: {
              title: '项目立项申请管理',
              icon: 'ep:folder',
              hidden: true
            }
          },
          {
            //approval/applicant/submit
            path: 'applicant/submit',
            name: 'ThQdApprovalApplicantSubmit',
            component: () => import('@/views/th_qd/approval/applicant/submit.vue'),
            meta: {
              title: '项目立项提交',
              icon: 'ep:upload',
              hidden: true
            }
          },
          {
            path: 'management/center',
            name: 'ThQdApprovalManagementCenter',
            component: () => import('@/views/th_qd/approval/management/center.vue'),
            meta: {
              title: '项目立项管理中心',
              icon: 'ep:setting',
              hidden: true
            }
          },
          {
            path: 'management/conclusion',
            name: 'ThQdApprovalManagementConclusion',
            component: () => import('@/views/th_qd/approval/management/conclusion.vue'),
            meta: {
              title: '项目立项会议管理',
              icon: 'ep:chat-dot-round',
              hidden: true
            }
          }

        ]
      },
      // TH项目管理 - 项目实施
      {
        path: 'implementation',
        name: 'ThQdImplementation',
        meta: {
          title: '项目实施',
          icon: 'ep:operation',
          rank: 107
        },
        children: [
          // TH项目管理 - 项目开题
          {
            path: 'opening',
            name: 'ThQdOpening',
            redirect: 'opening/index',
            meta: {
              title: '项目开题',
              icon: 'ep:sunny',
              rank: 104
            },
            children: [
              {
                path: 'index',
                name: 'ThQdOpeningIndex',
                component: () => import('@/views/th_qd/opening/index.vue'),
                meta: {
                  title: '项目开题',
                  icon: 'ep:sunny'
                }
              },
              {
                path: 'applicant/manage',
                name: 'ThQdOpeningApplicantManage',
                component: () => import('@/views/th_qd/opening/applicant/manage.vue'),
                meta: {
                  title: '项目开题申请管理',
                  icon: 'ep:folder',
                  hidden: true
                }
              },
              {
                path: 'opening/applicant/submit',
                name: 'ThQdOpeningApplicantSubmit',
                component: () => import('@/views/th_qd/opening/applicant/submit.vue'),
                meta: {
                  title: '项目开题提交',
                  icon: 'ep:upload',
                  hidden: true
                }
              },
              {
                path: 'management/center',
                name: 'ThQdOpeningManagementCenter',
                component: () => import('@/views/th_qd/opening/management/center.vue'),
                meta: {
                  title: '项目开题管理中心',
                  icon: 'ep:setting',
                  hidden: true
                }
              },
              {
                path: 'management/conclusion',
                name: 'ThQdOpeningManagementConclusion',
                component: () => import('@/views/th_qd/opening/management/conclusion.vue'),
                meta: {
                  title: '项目开题会议管理',
                  icon: 'ep:chat-dot-round',
                  hidden: true
                }
              }
            ]
          },
          // TH项目管理 - 项目中期
          {
            path: 'midterm',
            name: 'ThQdMidterm',
            redirect:'midterm/index',
            meta: {
              title: '项目中期',
              icon: 'ep:pie-chart',
              rank: 105
            },
            children: [
              {
                path: 'index',
                name: 'ThQdMidtermIndex',
                component: () => import('@/views/th_qd/midterm/index.vue'),
                meta: {
                  title: '项目中期',
                  icon: 'ep:pie-chart'
                }
              },
              {
                //midterm/applicant/manage
                path: 'applicant/manage',
                name: 'ThQdMidtermApplicantManage',
                component: () => import('@/views/th_qd/midterm/applicant/manage.vue'),
                meta: {
                  title: '项目中期申请管理',
                  icon: 'ep:folder',
                  hidden: true
                }
              },
              {
                path: 'midtermapplicant/submit',
                name: 'ThQdMidtermApplicantSubmit',
                component: () => import('@/views/th_qd/midterm/applicant/submit.vue'),
                meta: {
                  title: '项目中期提交',
                  icon: 'ep:upload',
                  hidden: true
                }
              },
              {
                path: 'management/center',
                name: 'ThQdMidtermManagementCenter',
                component: () => import('@/views/th_qd/midterm/management/center.vue'),
                meta: {
                  title: '项目中期管理中心',
                  icon: 'ep:setting',
                  hidden: true
                }
              },
              {
                path: 'management/conclusion',
                name: 'ThQdMidtermManagementConclusion',
                component: () => import('@/views/th_qd/midterm/management/conclusion.vue'),
                meta: {
                  title: '项目中期会议管理',
                  icon: 'ep:chat-dot-round',
                  hidden: true
                }
              }
            ]
          },

  {
            path: 'contract',
            name: 'ThQdImplementationContract',
            component: () => import('@/views/th_qd/implementation/contract/index.vue'),
            meta: {
              title: '合同管理',
              icon: 'ep:document'
            }
          },
          {
            path: 'payment',
            name: 'ThQdImplementationPayment',
            component: () => import('@/views/th_qd/implementation/payment/index.vue'),
            meta: {
              title: '经费执行进度',
              icon: 'ep:money'
            }
          },
          
        ]
      },
      // TH项目管理 - 项目验收
      {
        path: 'acceptance',
        name: 'ThQdAcceptance',
        redirect: '/th-qd-project/acceptance/index',
        meta: {
          title: '项目验收',
          icon: 'ep:circle-check',
          rank: 106
        },
        children: [
          {
            path: 'index',
            name: 'ThQdAcceptanceIndex',
            component: () => import('@/views/th_qd/acceptance/index.vue'),
            meta: {
              title: '项目验收',
              icon: 'ep:circle-check',
              hidden: true
            }
          },
          {
            path: 'applicant/manage',
            name: 'ThQdAcceptanceApplicantManage',
            component: () => import('@/views/th_qd/acceptance/applicant/manage.vue'),
            meta: {
              title: '项目验收申请管理',
              icon: 'ep:folder',
              hidden: true
            }
          },
          {
            path: 'applicant/submit',
            name: 'ThQdAcceptanceApplicantSubmit',
            component: () => import('@/views/th_qd/acceptance/applicant/submit.vue'),
            meta: {
              title: '项目验收提交',
              icon: 'ep:upload',
              hidden: true
            }
          },
          {
            path: 'management/center',
            name: 'ThQdAcceptanceManagementCenter',
            component: () => import('@/views/th_qd/acceptance/management/center.vue'),
            meta: {
              title: '项目验收管理中心',
              icon: 'ep:setting',
              hidden: true
            }
          },
          {
            path: 'management/conclusion',
            name: 'ThQdAcceptanceManagementConclusion',
            component: () => import('@/views/th_qd/acceptance/management/conclusion.vue'),
            meta: {
              title: '项目验收会议管理',
              icon: 'ep:chat-dot-round',
              hidden: true
            }
          }
        ]
      },
    ]
  },
  // TH项目管理 - 成果与分析
  {
    path: '/th-qd-results',
    component: Layout,
    name: 'ThQdResults',
    meta: {
      hidden: true,
      title: '成果与分析',
      icon: 'ep:data-analysis',
      rank: 108
    },
    children: [
      {
        path: 'achievements',
        name: 'ThQdAchievements',
        component: () => import('@/views/th_qd/achievements/index.vue'),
        meta: {
          title: '成果管理',
          icon: 'ep:trophy'
        }
      },
      {
        path: 'analytics',
        name: 'ThQdAnalytics',
        component: () => import('@/views/th_qd/analytics/index.vue'),
        meta: {
          title: '统计分析中心',
          icon: 'ep:data-line'
        }
      }
    ]
  },
  {
    path: '/th-qd-maintenance',
    component: Layout,
    name: 'ThQdMaintenance',
    meta: {
      hidden: true,
      title: '日常维护',
      icon: 'ep:tools',
      rank: 109
    },
    children: [
      // 文献管理作为单独一级菜单，暂不从“日常维护”进入
      // {
      //   path: 'literature',
      //   name: 'ThQdLiterature',
      //   component: () => import('@/views/th_qd/literature/index.vue'),
      //   meta: {
      //     title: '文献管理',
      //     icon: 'ep:reading'
      //   }
      // },
      // 文献管理另设一级菜单，此处暂时注释
      // {
      //   path: 'literature',
      //   name: 'ThQdLiterature',
      //   component: () => import('@/views/th_qd/literature/index.vue'),
      //   meta: {
      //     title: '文献管理',
      //     icon: 'ep:reading'
      //   }
      // },
      {
        path: 'report-templates',
        name: 'ThQdReportTemplates',
        component: () => import('@/views/th_qd/maintenance/report-templates/index.vue'),
        meta: {
          title: '提报模板',
          icon: 'ep:document'
        }
      },
      {
        path: 'material-template',
        name: 'ThQdMaterialTemplate',
          component: () => import('@/views/th_qd/maintenance/material-template/index.vue'),
        meta: {
          title: '材料模板维护',
          icon: 'ep:document-copy'
        }
      },
      
    ]
  },
  
  // TH项目管理 - 系统管理
  {
    path: '/th-qd-system',
    component: Layout,
    name: 'ThQdSystem',
    meta: {
      hidden: true,
      title: '系统管理',
      icon: 'ep:tools',
      rank: 109
    },
    children: [
      {
        path: 'literature',
        name: 'ThQdLiterature',
        component: () => import('@/views/th_qd/literature/index.vue'),
        meta: {
          title: '文献管理',
          icon: 'ep:reading'
        }
      }
    ]
  },
  // TH项目管理 - 项目实施管理v3
  {
    path: '/th-qd-implementation-v3',
    component: Layout,
    name: 'ThQdImplementationV3',
    meta: {
      hidden: true,
      title: '项目实施管理v3',
      icon: 'ep:operation',
      rank: 110
    },
    children: [
      {
        path: 'team',
        name: 'ThQdTeamCenter',
        component: () => import('@/views/th_qd/implementation-v3/center/components/TeamConfigurationStep.vue'),
        meta: {
          title: '团队配置',
          icon: 'ep:setting'
        }
      },
      {
        path: 'proposal-analysis',
        name: 'ThQdTeamProposalAnalysis',
        component: () => import('@/views/th_qd/implementation-v3/center/components/ProposalAnalysisStep-Simple.vue'),
        meta: {
          title: '申报书解析',
          icon: 'ep:document'
        }
      },
      {
        path: 'task-planning',
        name: 'ThQdTeamTaskPlanning',
        component: () => import('@/views/th_qd/implementation-v3/center/pages/TaskPlanning.vue'),
        meta: {
          title: '任务计划与分配',
          icon: 'ep:data-analysis'
        }
      },
      {
        path: 'progress-monitoring',
        name: 'ThQdTeamProgressMonitoring',
        component: () => import('@/views/th_qd/implementation-v3/center/components/ProgressMonitoringStep.vue'),
        meta: {
          title: '进展监控',
          icon: 'ep:monitor'
        }
      }
    ]
  }
]

export default remainingRouter
