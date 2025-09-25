<template>
  <div class="research-record-item">
    <div class="record-header">
      <div class="record-info">
        <h4 class="record-location">{{ record.location }}</h4>
        <div class="record-meta">
          <span class="record-date">{{ record.date }}</span>
          <span class="record-recorder">记录人：{{ record.recorder }}</span>
        </div>
      </div>
      <div class="record-actions">
        <a-button type="link" size="small" @click="$emit('edit', record)">
          <EditOutlined /> 编辑
        </a-button>
        <a-button type="link" size="small" @click="$emit('delete', record)" danger>
          <DeleteOutlined /> 删除
        </a-button>
      </div>
    </div>
    
    <div class="record-content">
      <p class="content-text">{{ record.content }}</p>
      
      <div class="findings-section" v-if="record.findings && record.findings.length">
        <h5>主要发现：</h5>
        <ul class="findings-list">
          <li v-for="finding in record.findings" :key="finding">
            {{ finding }}
          </li>
        </ul>
      </div>
      
      <div class="photos-section" v-if="record.photos && record.photos.length">
        <h5>调研照片：</h5>
        <div class="photo-thumbnails">
          <div 
            v-for="(photo, index) in record.photos" 
            :key="index"
            class="photo-thumbnail"
            @click="$emit('view-photos', record.photos)"
          >
            <img :src="photo.url" :alt="photo.description" />
            <div class="photo-overlay">
              <EyeOutlined />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['edit', 'delete', 'view-photos'])
</script>

<style scoped>
.research-record-item {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 16px;
  margin-bottom: 16px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.record-info {
  flex: 1;
}

.record-location {
  margin: 0 0 8px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.record-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.record-content {
  line-height: 1.6;
}

.content-text {
  color: #64748b;
  margin: 0 0 16px 0;
}

.findings-section,
.photos-section {
  margin-bottom: 16px;
}

.findings-section h5,
.photos-section h5 {
  margin: 0 0 8px 0;
  color: #234fa2;
  font-size: 14px;
  font-weight: 600;
}

.findings-list {
  margin: 0;
  padding-left: 20px;
}

.findings-list li {
  color: #64748b;
  margin-bottom: 4px;
  font-size: 14px;
}

.photo-thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photo-thumbnail {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-thumbnail:hover .photo-overlay {
  opacity: 1;
}

.photo-thumbnail:hover img {
  transform: scale(1.1);
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {
  .record-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .record-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .photo-thumbnail {
    width: 60px;
    height: 60px;
  }
}
</style> 