        </div>

        <!-- 关联里程碑展示 -->
        <div v-if="edit.target && getMilestoneDisplayEnhanced(edit.target)" style="margin-bottom: 12px;">
          <div style="margin-bottom: 6px; font-size: 14px;">已关联里程碑</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background-color: #f9f9f9; border-radius: 4px;">
            <div 
              v-for="milestone in getMilestoneDisplayEnhanced(edit.target)" 
              :key="milestone.id" 
              style="display: flex; align-items: center; background: white; border: 1px solid #d9d9d9; border-radius: 4px; padding: 4px 8px;"
            >
              <span>{{ milestone.name }}</span>
              <a-tag v-if="milestone.date" size="small" color="blue" style="margin-left: 6px;">{{ milestone.date }}</a-tag>
              <a-tag v-if="milestone.isPrimary" size="small" color="purple" style="margin-left: 6px;">主</a-tag>
              <a-button 
                type="link" 
                size="small" 
                danger 
                style="margin-left: 6px; padding: 0 4px;" 
                @click.stop="confirmRemoveMs(milestone.id)"
              >
                删除
              </a-button>
            </div>
          </div>
        </div>

        <!-- 无关联里程碑提示 -->
        <div v-if="edit.target && !getMilestoneDisplayEnhanced(edit.target)" style="padding: 8px; color: #8c8c8c; text-align: center; background-color: #f9f9f9; border-radius: 4px;">
          暂无关联里程碑
        </div>

        <!-- 关联里程碑显示 -->