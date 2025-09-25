import dayjs from 'dayjs'
import {
  createTechnologicalMeeting,
  updateTechnologicalMeeting,
  getTechnologicalMeetingPage,
  createTechnologicalMeetingParticipant,
  createTechnologicalMeetingMaterial,
  updateTechnologicalProject
} from '@/api/th_qd/approval'
import { uploadTechnologicalFile } from '@/api/upload'

export function useMeetingScheduler() {
  const uploadMeetingFile = async (file) => {
    console.log('=== 开始上传文件 ===')
    console.log('原始文件:', file)
    
    const resp = await uploadTechnologicalFile(file)
    console.log('上传API响应:', resp)
    
    const data = resp && (resp.data || resp)
    console.log('处理后的数据:', data)
    
    if (!resp || (resp.code !== 0 && !data?.fileUrl)) {
      console.error('上传失败:', resp)
      throw new Error(resp?.msg || '上传失败')
    }
    
    const d = data
    console.log('最终使用的数据:', d)
    console.log('d.fileUrl:', d.fileUrl)
    console.log('d.url:', d.url)
    console.log('d.data:', d.data)
    
    // 确保 fileUrl 字段正确设置 - 尝试多个可能的路径
    let fileUrl = d.fileUrl
    if (!fileUrl) fileUrl = d.url
    if (!fileUrl && d.data) fileUrl = d.data.fileUrl || d.data.url
    
    // 如果还是没找到，尝试从响应对象中查找任何可能的URL字段
    if (!fileUrl) {
      const findUrlInObject = (obj) => {
        if (!obj || typeof obj !== 'object') return null
        for (const key in obj) {
          if (typeof obj[key] === 'string' && (obj[key].includes('http') || obj[key].includes('/admin-api/'))) {
            return obj[key]
          }
          if (typeof obj[key] === 'object') {
            const found = findUrlInObject(obj[key])
            if (found) return found
          }
        }
        return null
      }
      fileUrl = findUrlInObject(d)
    }
    
    console.log('最终确定的文件URL:', fileUrl)
    
    // 构建返回的文件对象
    const result = {
      // 与 center.vue 的文件对象结构保持一致
      ...file,
      url: fileUrl,
      fileUrl: fileUrl, // 确保 fileUrl 字段正确设置
      uploaded: true,
      uploadTime: new Date().toISOString(),
      uploadResponse: d,
      name: d.fileName || d.materialName || file.name, // 确保name属性存在，与显示时使用的属性名一致
      fileName: d.fileName || file.name, // 保留fileName属性以兼容现有代码
      size: d.fileSize || file.size, // 确保size属性存在，与显示时使用的属性名一致
      fileSize: d.fileSize || file.size, // 保留fileSize属性以兼容现有代码
      fileType: d.fileType || file.type,
      fileMd5: d.fileMd5,
      uploader: d.uploader,
      description: d.description
    }
    
    console.log('返回的文件对象:', result)
    return result
  }

  const pickList = (pageLike) => {
    if (!pageLike) return []
    if (pageLike.data && Array.isArray(pageLike.data.list)) return pageLike.data.list
    if (Array.isArray(pageLike.list)) return pageLike.list
    return []
  }

  const arrangeMeeting = async (project, form) => {
    const toMeetingTypeNum = (t) => (t === 'offline' ? 0 : t === 'online' ? 1 : 2)
    // 完全对齐 center.vue 提交结构与字段
    const meetingPayload: any = {
      projectId: Number(project.id || 0),
      meetingNo: `${project.projectName || '项目'} - 立项评审会议`,
      meetingName: `${project.projectName || '项目'}`,
      meetingType: toMeetingTypeNum(form.type),
      meetingTime: dayjs(form.datetime).valueOf(),
      meetingPlace: form.location,
      meetingInstructions: form.description,
      meetingStatus: 1,
      meetingParticipantReqVOList: [
        ...(form.hosts || []).map((name) => ({ participantName: name, participantRole: 0 })),
        ...(form.experts || []).map((name) => ({ participantName: name, participantRole: 1 }))
      ],
      technologicalMeetingMaterialSaveReqVOList: (form.materials || []).map((f, index) => ({
        materialSource: 1,
        materialName: f.fileName || f.name,
        fileUrl: f.fileUrl || f.url,
        fileSize: f.fileSize || f.size,
        fileSuffix: f.fileSuffix || (f.name ? f.name.split('.').pop() : null),
        sort: index + 1
      }))
    }

    const page = await getTechnologicalMeetingPage({ pageNo: 1, pageSize: 1, projectId: Number(project.id || 0) })
    const existing = pickList(page)
    let meetingId
    if ((existing?.length || 0) > 0) {
      const updatePayload: any = { ...meetingPayload, id: existing[0].id }
      await updateTechnologicalMeeting(updatePayload as any)
      meetingId = updatePayload.id
    } else {
      await createTechnologicalMeeting(meetingPayload as any)
      const latest = await getTechnologicalMeetingPage({ pageNo: 1, pageSize: 1, projectId: Number(project.id || 0) })
      const latestList = pickList(latest)
      meetingId = latestList?.[0]?.id
    }

    if (!meetingId) throw new Error('未获取到会议ID')

    await updateTechnologicalProject({
      id: Number(project.id),
      status: 4,
      projectNo: project.projectNo || '',
      projectName: project.projectName || '',
      yearly: Number(project.yearly || new Date().getFullYear()),
      applicant: project.applicant || '',
      applicantUnit: project.applicantUnit || '',
      projectCycle: Number(project.projectCycle || 12),
      budget: Number(project.budget || 0)
    })

    return {
      meetingId,
      meetingTime: meetingPayload.meetingTime,
      meetingDescription: meetingPayload.meetingInstructions,
      meetingPlace: meetingPayload.meetingPlace,
      meetingType: meetingPayload.meetingType
    }
  }

  return { uploadMeetingFile, arrangeMeeting }
}


