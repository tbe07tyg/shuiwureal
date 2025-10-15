<template>
  <div class="online-budget-container">
    <div class="page-header">
      <h1 class="page-title">研发项目经费预算</h1>
      <div class="actions no-print">
        <a-button @click="printPage">打印</a-button>
        <a-button type="primary" @click="saveBudget" style="margin-left: 10px;">保存</a-button>   
        <a-button type="default" @click="updateBudget" style="margin-left: 10px;">更新</a-button>
        <a-button @click="goBack" style="margin-left: 10px;">返回</a-button>
      </div>
    </div>

    <div class="form-content-wrapper">
      <div class="form-row">
        <label class="label">项目名称：</label>
        <a-input v-model:value="projectName" placeholder="请输入项目名称" style="max-width: 480px" />
      </div>

      <div class="form-row">
        <label class="label">填报日期：</label>
        <a-select v-model:value="year" :options="yearOptions" style="width: 120px" />
        <span class="mx">年</span>
        <a-select v-model:value="month" :options="monthOptions" style="width: 96px" />
        <span class="mx">月</span>
        <a-select v-model:value="day" :options="dayOptionsComputed" style="width: 96px" />
        <span class="mx">日</span>
      </div>

      <!-- 研发经费总预算（与申报书页一致） -->
      <div class="form-section">
        <h3 class="section-title">项目经费总预算</h3>
        <table class="info-table budget-table" border="1" cellspacing="0" style="table-layout: fixed; width: 100%;">
          <colgroup>
            <col style="width: 40%;" />
            <col style="width: 20%;" />
            <col style="width: 20%;" />
            <col style="width: 20%;" />
          </colgroup>
          <tr>
            <td class="label-cell">研发经费项目</td>
            <td class="label-cell">预算金额（万元）</td>
            <td class="label-cell">占研发经费总预算比例（%）</td>
            <td class="label-cell">简要说明</td>
          </tr>
          <tr v-for="(row, idx) in budgetTable" :key="idx">
            <td class="value-cell">{{ idx + 1 }}、{{ budgetItemNames[idx] }}</td>
            <td class="value-cell">
              <input type="number" class="input-field" :value="row.amount" @input="e => row.amount = Number(e.target.value)" placeholder="0" />
            </td>
          <td class="value-cell">
            <input type="number" class="input-field" :value="getRatio(idx)" readonly />
          </td>
            <td class="value-cell">
              <div
                class="cell-multiline"
                contenteditable="true"
                :data-index="idx"
                @input="onBudgetRemarkInput($event, idx)"
                @keydown="onBudgetCellKeydown($event)"
                v-html="row.remark"
              ></div>
            </td>
          </tr>
          <tr>
            <td class="label-cell">研发经费总预算</td>
            <td class="value-cell"><input type="number" class="input-field" :value="budgetTotalAmount" readonly /></td>
          <td class="value-cell"><input type="number" class="input-field" :value="budgetTotalRatio" readonly /></td>
            <td class="value-cell"></td>
          </tr>
        </table>
      </div>

      <!-- 研发经费预算详细说明 -->
      <div class="form-section">
        <h3 class="section-title">研发经费预算详细说明</h3>
        <div v-for="(name, idx) in budgetItemNames" :key="'desc-'+idx" class="detail-block">
          <div class="subsection-title">{{ idx + 1 }}、{{ name }}</div>
          <div
            class="rich-textarea"
            contenteditable="true"
            :data-index="idx"
            @input="handleDetailInput(idx, ($event.target as any).innerHTML)"
            @keydown="onTextAreaKeydown($event)"
            @focus="showToolbarNow($event)"
            @click="showToolbarNow($event)"
            @mouseup="showToolbarNow($event)"
            data-placeholder="请填写该项费用的预算构成、测算依据等，可回车换行"
          ></div>
        </div>
      </div>
      <!-- 文本悬浮工具条 -->
      <div
        v-if="textToolbar.visible"
        class="text-toolbar no-print"
        :style="textToolbar.style"
        @mousedown.stop
        @click.stop
      >
        <select class="tt-fontsize" @mousedown.stop @change="applyFontSize($event)">
          <option value="">字号</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
          <option value="32">32</option>
        </select>
        <button class="tt-btn" @mousedown.prevent="execCmd('bold')"><b>B</b></button>
        <button class="tt-btn" @mousedown.prevent="execCmd('italic')"><i>I</i></button>
        <button class="tt-btn underline-btn" @mousedown.prevent="execCmd('underline')">U</button>
        <button class="tt-btn" @mousedown.prevent="applyQuickList('cn')">一、</button>
        <button class="tt-btn" @mousedown.prevent="applyQuickList('num')">1）</button>
        <button class="tt-btn" @mousedown.prevent="applyQuickList('dot')">•</button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { CSSProperties } from 'vue'
import { useRoute } from 'vue-router'

import { 
  thQdBudgetResearchDocumentsCreate,
  thQdBudgetResearchDocumentsUpdate,
  thQdBudgetResearchDocumentsDelete,
  thQdBudgetResearchDocumentsPage,
  thQdBudgetResearchDocumentsDetail,
} from '@/api/th_qd/approvalSubmit/budget'

import { 
  thQdBudgetTotalPage,
  thQdBudgetTotalDetail,
  thQdBudgetTotalUpdate,
} from '@/api/th_qd/approvalSubmit/form'
const projectName = ref('')
const budgetId = ref<number | null>(null)
const route = useRoute()
const projectId = ref<number | null>(null)

const now = new Date()
const currentYear = now.getFullYear()
const yearOptions = Array.from({ length: 11 }, (_, i) => {
  const y = currentYear - 5 + i
  return { label: String(y), value: y }
})
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: i + 1 }))

const year = ref(currentYear)
const month = ref(now.getMonth() + 1)
const day = ref(now.getDate())

const router = useRouter()

const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate()
const dayOptionsComputed = computed(() => {
  const total = daysInMonth(year.value, month.value)
  return Array.from({ length: total }, (_, i) => ({ label: String(i + 1), value: i + 1 }))
})

// 返回列表
const goBack = () => {
  router.push('/th-qd-project/approval/approval/applicant/manage')
}

const printPage = () => window.print()

// ========== 研发经费预算表 数据（与 submit-online.vue 一致） ==========
const budgetItemNames = [
  '人员人工费用',
  '直接投入费用',
  '折旧费与长期待摊费用',
  '无形资产摊销费用',
  '设计费',
  '装备调试费与试验费用',
  '委托外部研究开发费用',
  '其他费用（包括论文、知识产权申请费、科技成果评估费等）'
]

interface BudgetRow { amount: number | null; remark: string }
const budgetTable = reactive<BudgetRow[]>(budgetItemNames.map(() => ({ amount: null, remark: '' })))
const budgetTotalAmount = computed(() => budgetTable.reduce((sum, r) => sum + (Number(r.amount) || 0), 0))
const budgetTotalRatio = computed(() => {
  const total = budgetTotalAmount.value
  if (!total) return 0
  // 自动计算占比总和（理论应为100），用于合计行展示
  const sumRatio = budgetTable.reduce((acc, r) => acc + ((Number(r.amount) || 0) / total * 100), 0)
  return Number(sumRatio.toFixed(2))
})

const getRatio = (idx: number) => {
  const total = budgetTotalAmount.value
  const amt = Number(budgetTable[idx].amount) || 0
  if (!total) return 0
  return Number(((amt / total) * 100).toFixed(2))
}

const onBudgetRemarkInput = (e: Event, idx: number) => {
  const el = e.target as HTMLDivElement
  budgetTable[idx].remark = el.innerHTML
}

const insertHtmlAtCaret = (html: string) => {
  restoreSavedSelection()
  document.execCommand('insertHTML', false, html)
}

const applyQuickList = (type: 'cn' | 'num' | 'dot') => {
  const prefix = type === 'cn' ? '一、' : type === 'num' ? '1）' : '• '
  insertHtmlAtCaret(`<span class="auto-li-prefix" data-type="${type}" data-n="1">${prefix}</span>\u200B`)
}

const nextCn = (n: number) => {
  const arr = '零一二三四五六七八九'
  if (n <= 10) return ['零','一','二','三','四','五','六','七','八','九','十'][n]
  if (n < 20) return '十' + arr[n - 10]
  const tens = Math.floor(n / 10), ones = n % 10
  return arr[tens] + '十' + (ones ? arr[ones] : '')
}

const insertNextLinePrefix = (container: HTMLElement) => {
  const spans = Array.from(container.querySelectorAll('.auto-li-prefix')) as HTMLElement[]
  if (spans.length === 0) return false
  const last = spans[spans.length - 1]
  const type = (last.dataset.type as 'cn' | 'num' | 'dot') || 'cn'
  const cur = Number(last.dataset.n || '1') + 1
  const next = type === 'cn' ? `${nextCn(cur)}、` : type === 'num' ? `${cur}）` : '• '
  insertHtmlAtCaret(`<br><span class="auto-li-prefix" data-type="${type}" data-n="${cur}">${next}</span>\u200B`)
  return true
}

const onTextAreaKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return
  const editor = (e.target as HTMLElement)?.closest?.('.rich-textarea') as HTMLElement | null
  if (!editor) return
  e.preventDefault()
  if (!insertNextLinePrefix(editor)) {
    document.execCommand('insertHTML', false, '<br>\u200B')
  }
}

const onBudgetCellKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return
  const editor = (e.target as HTMLElement) as HTMLElement
  const inBudget = editor?.closest?.('.budget-table')
  if (!inBudget) return
  e.preventDefault()
  if (!insertNextLinePrefix(editor)) {
    document.execCommand('insertHTML', false, '<br>\u200B')
  }
}

// ======= 文本悬浮工具条状态与方法 =======
const textToolbar = reactive({ visible: false, style: { top: '0px', left: '0px', position: 'absolute' } as CSSProperties })
let savedSelection: Range | null = null
let currentEditorEl: HTMLElement | null = null

const restoreSavedSelection = () => {
  if (!savedSelection) return
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(savedSelection)
}

const execCmd = (cmd: 'bold' | 'italic' | 'underline') => {
  restoreSavedSelection()
  document.execCommand(cmd, false)
}

const applyFontSize = (e: Event) => {
  const selectEl = e.target as HTMLSelectElement
  const val = selectEl.value
  if (!val) return
  // 恢复之前保存的选区
  restoreSavedSelection()
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0)
    if (!range.collapsed) {
      const span = document.createElement('span')
      span.style.fontSize = `${val}px`
      try {
        range.surroundContents(span)
        const newRange = document.createRange()
        newRange.selectNodeContents(span)
        sel.removeAllRanges()
        sel.addRange(newRange)
        savedSelection = newRange.cloneRange()
      } catch {
        // fallback
        document.execCommand('fontSize', false, '7')
      }
    }
  }
  // 重置下拉框并阻止冒泡
  selectEl.value = ''
}

let isMouseDownInEditor = false

document.addEventListener('mousedown', (e) => {
  isMouseDownInEditor = !!(e.target as HTMLElement)?.closest?.('.rich-textarea')
})

document.addEventListener('selectionchange', () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) {
    if (!isMouseDownInEditor) textToolbar.visible = false
    return
  }
  const range = sel.getRangeAt(0)
  const node = range.commonAncestorContainer as Node
  const baseEl = (node.nodeType === 1 ? (node as Element) : (node as any).parentElement) as Element | null
  const editor = baseEl?.closest?.('.rich-textarea') as HTMLElement | null

  const stillInEditor =
    (!!editor && (!!currentEditorEl && editor === currentEditorEl)) ||
    (!!currentEditorEl && currentEditorEl.contains(document.activeElement as Node)) ||
    isMouseDownInEditor

  if (!stillInEditor) {
    textToolbar.visible = false
    return
  }
  savedSelection = range.cloneRange()
  const rect = range.getBoundingClientRect()
  const baseRect = (rect.width || rect.height || sel.isCollapsed) ? rect : (currentEditorEl as HTMLElement).getBoundingClientRect()
  const top = baseRect.top + window.scrollY - 40
  const left = baseRect.left + window.scrollX
  textToolbar.style = { top: `${top}px`, left: `${left}px`, position: 'absolute' } as any
  textToolbar.visible = true
})

// 当编辑区获得焦点但尚未有选区时，创建折叠选区并显示工具条
document.addEventListener('focusin', (e) => {
  const el = (e.target as HTMLElement)?.closest?.('.rich-textarea') as HTMLElement | null
  if (!el) return
  currentEditorEl = el
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  sel?.removeAllRanges()
  sel?.addRange(range)
  savedSelection = range.cloneRange()
  const rect = range.getBoundingClientRect()
  const baseRect = (rect.width || rect.height) ? rect : el.getBoundingClientRect()
  textToolbar.style = { top: `${baseRect.top + window.scrollY - 40}px`, left: `${baseRect.left + window.scrollX}px`, position: 'absolute' } as any
  textToolbar.visible = true
})

// 失焦后延迟隐藏，避免点击浮窗时马上消失
document.addEventListener('focusout', (e) => {
  const el = (e.target as HTMLElement)?.closest?.('.rich-textarea') as HTMLElement | null
  if (!el) return
  setTimeout(() => {
    const inEditor = currentEditorEl && currentEditorEl.contains(document.activeElement as Node)
    const inToolbar = (document.activeElement as HTMLElement | null)?.closest?.('.text-toolbar')
    if (!inEditor && !inToolbar) {
      textToolbar.visible = false
    }
  }, 120)
})

const showToolbarNow = (e: Event) => {
  const el = (e.target as HTMLElement)?.closest?.('.rich-textarea') as HTMLElement | null
  if (!el) return
  currentEditorEl = el
  // 建立折叠选区到编辑区末尾
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  sel?.removeAllRanges()
  sel?.addRange(range)
  savedSelection = range.cloneRange()
  const rect = range.getBoundingClientRect()
  const baseRect = (rect.width || rect.height) ? rect : el.getBoundingClientRect()
  textToolbar.style = { top: `${baseRect.top + window.scrollY - 40}px`, left: `${baseRect.left + window.scrollX}px`, position: 'absolute' } as any
  textToolbar.visible = true
}

// 详细说明内容（与科目一一对应）
const detailNotes = reactive<string[]>(budgetItemNames.map(() => ''))

// 获取路由参数中的projectId并加载预算数据
onMounted(async () => {
  // 从路由参数中获取projectId和projectName
  const routeProjectId = route.query.projectId
  const routeProjectName = route.query.projectName
  
  if (routeProjectId) {
    projectId.value = Number(routeProjectId)
    console.log('获取到项目ID:', projectId.value)
  }
  
  if (routeProjectName) {
    // 对URL编码的项目名称进行解码
    projectName.value = decodeURIComponent(routeProjectName as string)
    console.log('获取到项目名称:', projectName.value)
    
    try {
      // 根据projectId获取项目经费总预算表信息
      const response = await thQdBudgetTotalPage({
        pageNo: 1,
        pageSize: 10,
        projectId: projectId.value
      })
      
      // 根据projectId获取研发经费预算详细说明
      const detailResponse = await thQdBudgetResearchDocumentsPage({
        pageNo: 1,
        pageSize: 10,
        projectId: projectId.value
      })
      
      console.log('获取到的预算数据:', response)
      console.log('获取到的详细说明数据:', detailResponse)
      
      // 处理详细说明数据
      if (detailResponse && detailResponse.list && detailResponse.list.length > 0) {
        const detailData = detailResponse.list[0];
        
        // 填充详细说明数据
        if (detailData.laborCosts) detailNotes[0] = detailData.laborCosts;
        if (detailData.directInputCosts) detailNotes[1] = detailData.directInputCosts;
        if (detailData.depreciationCosts) detailNotes[2] = detailData.depreciationCosts;
        if (detailData.amortizationCosts) detailNotes[3] = detailData.amortizationCosts;
        if (detailData.designCosts) detailNotes[4] = detailData.designCosts;
        if (detailData.equipmentTestingCosts) detailNotes[5] = detailData.equipmentTestingCosts;
        if (detailData.externalRdCosts) detailNotes[6] = detailData.externalRdCosts;
        if (detailData.otherCosts) detailNotes[7] = detailData.otherCosts;
        
        // 更新详细说明显示
        setTimeout(() => {
          const richTextareas = document.querySelectorAll('.rich-textarea');
          richTextareas.forEach((textarea, idx) => {
            if (detailNotes[idx]) {
              (textarea as HTMLElement).innerHTML = detailNotes[idx];
            }
          });
        }, 100);
        
        console.log('详细说明数据回显完成');
        
        // 保存详细说明数据的ID，用于后续更新
        if (detailData.id) {
          budgetId.value = detailData.id;
          console.log('保存详细说明ID:', budgetId.value);
        }
      }
      
      // 如果有数据，则回显到表单
      if (response && response.list && response.list.length > 0) {
        // 返回的是研究文档列表，需要根据budgetItem映射到对应的表格行
        const researchDocuments = response.list
        
        // 获取第一个文档的projectId
        if (researchDocuments[0].projectId) {
          projectId.value = researchDocuments[0].projectId
        }
        
        // 处理每个预算项目
        researchDocuments.forEach((doc: any) => {
          // 根据预算项目名称找到对应的索引
          const index = budgetItemNames.findIndex(name => name === doc.budgetItem)
          
          if (index !== -1) {
            // 设置预算金额
            if (doc.budgetAmount !== undefined && doc.budgetAmount !== null) {
              budgetTable[index].amount = Number(doc.budgetAmount)
            }
            
            // 设置项目描述
            if (doc.itemDescription) {
              // 总是设置预算表格中的简要说明
              budgetTable[index].remark = doc.itemDescription
              
              // 只有当detailNotes[index]为空时才设置，避免覆盖从thQdBudgetResearchDocumentsPage获取的数据
              if (!detailNotes[index]) {
                detailNotes[index] = doc.itemDescription
              }
            }
            
            // 设置预算ID（如果需要）
            if (doc.id && !budgetId.value) {
              budgetId.value = doc.id
            }
          }
        })
        
        // 确保表格中的简要说明能够正确显示
        setTimeout(() => {
          const cells = document.querySelectorAll('.cell-multiline');
          cells.forEach((cell, idx) => {
            if (budgetTable[idx].remark) {
              (cell as HTMLElement).innerHTML = budgetTable[idx].remark;
            }
          });
        }, 100);
        
        console.log('数据回显完成')
      } else {
        console.log('未找到项目预算数据')
      }
    } catch (error) {
      console.error('获取项目预算数据失败:', error)
    }
  }
})

// replace direct template assignment usage with a function
const handleDetailInput = (idx: number, html: string) => {
  detailNotes[idx] = html
}

// 保存预算数据
const saveBudget = async () => {
  try {
    // 准备提交数据 - 转换日期为字符串格式
    const budgetDate = `${year.value}-${month.value.toString().padStart(2, '0')}-${day.value.toString().padStart(2, '0')}`;
    
    // 确保所有预算数据都被正确获取
    console.log("预算数据:", budgetTable.map(item => item.amount));
    
    // 创建研究文档数组
    const researchDocuments: any[] = [];
    
    // 遍历每个预算项目，创建研究文档
    for (let i = 0; i < budgetItemNames.length; i++) {
      const item = budgetTable[i];
      const researchDocument = {
        budgetItem: budgetItemNames[i],
        budgetAmount: Number(item.amount) || 0,
        totalBudgetPercentage: getRatio(i),
        itemDescription: detailNotes[i] || item.remark,
        sort: i + 1
      };
      researchDocuments.push(researchDocument);
    }
    
    // 创建主预算数据
    // const rdBudgetCategoriesSaveReq: any = {
    //   projectId: projectId.value,
    //   dateSubmission: budgetDate,
    //   laborCosts: (budgetTable[0].amount || 0).toString(),
    //   directInputCosts: (budgetTable[1].amount || 0).toString(),
    //   depreciationCosts: (budgetTable[2].amount || 0).toString(),
    //   amortizationCosts: (budgetTable[3].amount || 0).toString(),
    //   designCosts: (budgetTable[4].amount || 0).toString(),
    //   equipmentTestingCosts: (budgetTable[5].amount || 0).toString(),
    //   externalRdCosts: (budgetTable[6].amount || 0).toString(),
    //   otherCosts: (budgetTable[7].amount || 0).toString(),
    // };
    
    // console.log("提交的数据:", rdBudgetCategoriesSaveReq);
    
    // // 为每个研究文档添加projectId
    // researchDocuments.forEach(doc => {
    //   doc.projectId = projectId.value;
    // });

    // console.log("提交的研究文档数据:", researchDocuments);

    // 使用thQdBudgetResearchDocumentsCreate API创建研发经费预算详细说明
    const response = await thQdBudgetResearchDocumentsCreate({
      projectId: projectId.value,
      laborCosts: detailNotes[0] || (budgetTable[0].amount || 0).toString(),//人员人工费详情
      directInputCosts: detailNotes[1] || (budgetTable[1].amount || 0).toString(),//直接投入费用详情
      depreciationCosts: detailNotes[2] || (budgetTable[2].amount || 0).toString(),//折旧费用详情
      amortizationCosts: detailNotes[3] || (budgetTable[3].amount || 0).toString(),//摊销费用详情
      designCosts: detailNotes[4] || (budgetTable[4].amount || 0).toString(),//设计费详情
      equipmentTestingCosts: detailNotes[5] || (budgetTable[5].amount || 0).toString(),//设备调试费用详情
      externalRdCosts: detailNotes[6] || (budgetTable[6].amount || 0).toString(),//外协研发费用详情
      otherCosts: detailNotes[7] || (budgetTable[7].amount || 0).toString(),//其他费用详情
      dateSubmission: budgetDate, // 使用字符串格式的日期
    });
    console.log("保存响应:", response);
    
    // 保存成功后记录ID
    if (response && response.id) {
      budgetId.value = response.id;
      console.log('预算ID已保存:', budgetId.value);
    }
    
    // 保存成功提示
    console.log('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
  }
};

// 更新预算数据
const updateBudget = async () => {
  try {
    // 准备提交数据 - 转换日期为字符串格式
    const budgetDate = `${year.value}-${month.value.toString().padStart(2, '0')}-${day.value.toString().padStart(2, '0')}`;
    
    // 确保所有预算数据都被正确获取
    console.log("预算数据:", budgetTable.map(item => item.amount));
    
    // 创建研究文档数组
    const researchDocuments: any[] = [];
    
    // 遍历每个预算项目，创建研究文档
    for (let i = 0; i < budgetItemNames.length; i++) {
      const item = budgetTable[i];
      const researchDocument = {
        budgetItem: budgetItemNames[i],
        budgetAmount: Number(item.amount) || 0,
        totalBudgetPercentage: getRatio(i),
        itemDescription: detailNotes[i] || item.remark,
        sort: i + 1
      };
      researchDocuments.push(researchDocument);
    }
    
    // 创建主预算数据
    const rdBudgetCategoriesSaveReq: any = {
      // id: budgetId.value, // 使用实际的预算ID
      projectId: projectId.value ,
      dateSubmission: budgetDate, // 使用字符串格式的日期
      laborCosts: (budgetTable[0].amount || 0).toString(),
      directInputCosts: (budgetTable[1].amount || 0).toString(),
      depreciationCosts: (budgetTable[2].amount || 0).toString(),
      amortizationCosts: (budgetTable[3].amount || 0).toString(),
      designCosts: (budgetTable[4].amount || 0).toString(),
      equipmentTestingCosts: (budgetTable[5].amount || 0).toString(),
      externalRdCosts: (budgetTable[6].amount || 0).toString(),
      otherCosts: (budgetTable[7].amount || 0).toString(),
      // researchDocuments: researchDocuments
    };
    
    console.log("更新的数据:", rdBudgetCategoriesSaveReq);
    
    // 为每个研究文档添加ID和projectId
    researchDocuments.forEach(doc => {
      doc.id = budgetId.value;
      doc.projectId = projectId.value;
    });

    console.log("更新的研究文档数据:", researchDocuments);

    // 确保所有详细说明数据都是最新的
    const richTextareas = document.querySelectorAll('.rich-textarea');
    richTextareas.forEach((textarea, idx) => {
      if (textarea.innerHTML) {
        detailNotes[idx] = textarea.innerHTML;
      }
    });
    
    // 使用thQdBudgetResearchDocumentsUpdate API更新研发经费预算详细说明
    console.log("使用详细说明数据更新:", {
      id: budgetId.value,
      projectId: projectId.value,
      laborCosts: detailNotes[0] || (budgetTable[0].amount || 0).toString(),//人员人工费详情
      directInputCosts: detailNotes[1] || (budgetTable[1].amount || 0).toString(),//直接投入费用详情
      depreciationCosts: detailNotes[2] || (budgetTable[2].amount || 0).toString(),//折旧费用详情
      amortizationCosts: detailNotes[3] || (budgetTable[3].amount || 0).toString(),//摊销费用详情
      designCosts: detailNotes[4] || (budgetTable[4].amount || 0).toString(),//设计费详情
      equipmentTestingCosts: detailNotes[5] || (budgetTable[5].amount || 0).toString(),//设备调试费用详情
      externalRdCosts: detailNotes[6] || (budgetTable[6].amount || 0).toString(),//外协研发费用详情
      otherCosts: detailNotes[7] || (budgetTable[7].amount || 0).toString(),//其他费用详情
      dateSubmission: budgetDate, // 使用字符串格式的日期
    });
    
    let response;
    try {
      response = await thQdBudgetResearchDocumentsUpdate({
        id: budgetId.value,
        projectId: projectId.value,
        laborCosts: detailNotes[0] || (budgetTable[0].amount || 0).toString(),//人员人工费详情
        directInputCosts: detailNotes[1] || (budgetTable[1].amount || 0).toString(),//直接投入费用详情
        depreciationCosts: detailNotes[2] || (budgetTable[2].amount || 0).toString(),//折旧费用详情
        amortizationCosts: detailNotes[3] || (budgetTable[3].amount || 0).toString(),//摊销费用详情
        designCosts: detailNotes[4] || (budgetTable[4].amount || 0).toString(),//设计费详情
        equipmentTestingCosts: detailNotes[5] || (budgetTable[5].amount || 0).toString(),//设备调试费用详情
        externalRdCosts: detailNotes[6] || (budgetTable[6].amount || 0).toString(),//外协研发费用详情
        otherCosts: detailNotes[7] || (budgetTable[7].amount || 0).toString(),//其他费用详情
        dateSubmission: budgetDate, // 使用字符串格式的日期
      });
    } catch (updateError) {
      console.error("更新研发经费预算详细说明失败:", updateError);
      // 如果更新失败，尝试创建新的研发经费预算详细说明
      console.log("尝试创建新的研发经费预算详细说明");
      response = await thQdBudgetResearchDocumentsCreate({
        projectId: projectId.value,
        laborCosts: detailNotes[0] || (budgetTable[0].amount || 0).toString(),//人员人工费详情
        directInputCosts: detailNotes[1] || (budgetTable[1].amount || 0).toString(),//直接投入费用详情
        depreciationCosts: detailNotes[2] || (budgetTable[2].amount || 0).toString(),//折旧费用详情
        amortizationCosts: detailNotes[3] || (budgetTable[3].amount || 0).toString(),//摊销费用详情
        designCosts: detailNotes[4] || (budgetTable[4].amount || 0).toString(),//设计费详情
        equipmentTestingCosts: detailNotes[5] || (budgetTable[5].amount || 0).toString(),//设备调试费用详情
        externalRdCosts: detailNotes[6] || (budgetTable[6].amount || 0).toString(),//外协研发费用详情
        otherCosts: detailNotes[7] || (budgetTable[7].amount || 0).toString(),//其他费用详情
        dateSubmission: budgetDate, // 使用字符串格式的日期
      });
      
      // 更新budgetId以便下次可以正确更新
      if (response && response.id) {
        budgetId.value = response.id;
        console.log("已创建新的研发经费预算详细说明，ID:", budgetId.value);
      }
    }
    
    console.log("更新响应:", response);
    
    // 更新成功提示
    console.log('更新成功');
  } catch (error) {
    console.error('更新失败:', error);
  }
};
</script>

<style scoped lang="scss">
.online-budget-container {
  font-family: '宋体','SimSun',serif !important;
  background: #f5f7fa;
  min-height: 100vh;
  padding: 20px;
}
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.page-title { font-weight: 700; font-size: 22px; color: #234fa2; margin: 0; }
.form-content-wrapper { background: #fff; padding: 16px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.label { width: 88px; text-align: right; color: #333; }
.mx { margin: 0 8px 0 4px; color: #333; }

/* 表单区块 + 标题样式（与申报书页一致） */
.form-section { margin-top: 16px; margin-bottom: 32px; }
.form-section .section-title {
  font-size: 16px;
  font-family: '宋体', 'SimSun', serif !important;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #234fa2;
}

/* 表格与多行单元格样式（与申报书页一致） */
.info-table { width: 100%; border-collapse: collapse; border: 1px solid #d9d9d9;
  td { padding: 12px 16px; border: 1px solid #d9d9d9; line-height: 1.6; }
  .label-cell { background: #fafafa; font-weight: 600; text-align: center; }
  .value-cell { background: #fff;
    .input-field { width: 100%; border: none; outline: none; background: transparent; font-size: 14px; padding: 4px 8px;
      &:focus { background: #f0f7ff; }
    }
  }
}
.budget-table .cell-multiline { min-height: 36px; padding: 6px 8px; outline: none; white-space: pre-wrap; word-wrap: break-word; }

/* 详细说明块样式 */
.detail-block { margin-bottom: 16px; }
.subsection-title {
  font-weight: 600;
  margin: 8px 0;
  color: #333;
}
.rich-textarea {
  min-height: 120px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
  line-height: 1.8;
  outline: none;
}
.rich-textarea:focus {
  border-color: #234fa2;
  background: #fff;
  box-shadow: 0 0 6px rgba(35,79,162,.15);
}
.rich-textarea[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: #999;
  font-style: italic;
}
.auto-li-prefix { white-space: pre; }

/* 文本悬浮工具条 */
.text-toolbar {
  position: absolute;
  z-index: 2000;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  padding: 4px 6px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.text-toolbar .tt-btn {
  border: 1px solid #d9d9d9;
  background: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
}
.text-toolbar .tt-fontsize { height: 26px; }
.underline-btn { text-decoration: underline; font-weight: 600; }
@media print {
  .no-print { display: none !important; }
  .online-budget-container { background: #fff; padding: 0; }
  .form-content-wrapper { box-shadow: none; padding: 20px; }
}
</style>


