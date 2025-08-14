<template>
  <div class="avatar-upload-container">
    <div class="upload-header">
      <h2>头像管理</h2>
      <p>上传新头像，支持 JPG、PNG格式</p>
    </div>

    <div class="upload-form">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="filename">头像文件名(不要加后缀.jpg/.png)</label>
          <input 
            id="filename" 
            type="text" 
            v-model="uploadForm.filename" 
            placeholder="请输入头像文件名"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">描述信息</label>
          <textarea 
            id="description" 
            v-model="uploadForm.description" 
            placeholder="头像描述信息（可选）"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="file">选择头像图片 </label>
          <div class="file-input-container">
            <input 
              id="file" 
              type="file" 
              ref="fileInput"
              @change="handleFileChange"
              accept="image/*"
              required
            />
            <small class="file-hint">建议尺寸：100x100 像素，文件大小不超过 1MB</small>
            <div v-if="selectedFile" class="file-info">
              <p><strong>已选择文件:</strong> {{ selectedFile.name }}</p>
              <p><strong>文件大小:</strong> {{ formatFileSize(selectedFile.size) }}</p>
              <p><strong>文件类型:</strong> {{ selectedFile.type || '未知' }}</p>
            </div>
          </div>
        </div>

        <!-- 头像预览 -->
        <div v-if="previewUrl" class="form-group">
          <label>头像预览</label>
          <div class="avatar-preview">
            <img :src="previewUrl" alt="头像预览" class="preview-image" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="uploading || !selectedFile" class="btn-primary">
            {{ uploading ? '上传中...' : '上传头像' }}
          </button>
          <button type="button" @click="resetForm" class="btn-secondary">
            重置
          </button>
        </div>
      </form>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p>上传进度: {{ uploadProgress }}%</p>
    </div>

    <!-- 用户头像库 -->
    <div class="user-avatar-library">
      <h3>用户头像库</h3>
      <div v-if="userAvatars.length > 0" class="avatar-list">
        <div 
          v-for="avatar in userAvatars" 
          :key="'user-lib-' + avatar.id" 
          :class="['avatar-item', { 
            selected: selectedAvatarId === avatar.id,
            disabled: avatar.valid === false
          }]"
          @click="showDeleteMenu(avatar, $event)"
        >
          <img :src="getAvatarUrl(avatar.filename)" :alt="avatar.description || '用户头像'" />
          <div class="avatar-info">
            <p class="avatar-name">{{ avatar.filename }}</p>
            <p class="avatar-date">{{ formatDate(avatar.createdAt) }}</p>
            <p v-if="avatar.valid === false" class="avatar-status disabled">已失效</p>
          </div>
        </div>
      </div>
      <div v-else class="no-avatars">
        暂无用户头像
      </div>
    </div>

    <!-- 删除确认菜单 -->
    <div v-if="deleteMenu.visible" class="delete-menu" :style="{ left: deleteMenu.x + 'px', top: deleteMenu.y + 'px' }">
      <div class="delete-menu-item" @click="toggleAvatarStatus">
        <span class="status-icon">{{ deleteMenu.avatar && deleteMenu.avatar.valid === false ? '✅' : '❌' }}</span>
        {{ deleteMenu.avatar && deleteMenu.avatar.valid === false ? '恢复头像' : '失效头像' }}
      </div>
      <div class="delete-menu-item" @click="confirmDeleteAvatar">
        <span class="delete-icon">🗑️</span>
        删除头像
      </div>
      <div class="delete-menu-item cancel" @click="hideDeleteMenu">
        <span class="cancel-icon">❌</span>
        取消
      </div>
    </div>

    <!-- 点击遮罩层关闭菜单 -->
    <div v-if="deleteMenu.visible" class="delete-overlay" @click="hideDeleteMenu"></div>
  </div>
</template>

<script>
import { adminAPI } from '@/utils/adminAPI.js'

export default {
  name: 'AvatarUpload',
  data() {
    return {
      uploadForm: {
        filename: '',
        description: '',
      },
      selectedFile: null,
      previewUrl: null,
      uploading: false,
      uploadProgress: 0,
      uploadResult: null,
      // 用户头像库
      userAvatars: [],
      // 删除菜单状态
      deleteMenu: {
        visible: false,
        x: 0,
        y: 0,
        avatar: null
      }
    }
  },
  mounted() {
    // 加载用户头像库
    this.loadUserAvatars()
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          alert('请选择图片文件')
          return
        }
        
        // 验证文件大小（1MB）
        if (file.size > 1 * 1024 * 1024) {
          alert('文件大小不能超过 1MB')
          return
        }

        this.selectedFile = file
        
        // 如果没有设置文件名，使用文件的原始名称
        if (!this.uploadForm.filename) {
          this.uploadForm.filename = file.name
        }

        // 创建预览URL
        this.createPreview(file)
      }
    },

    createPreview(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
      }
      reader.readAsDataURL(file)
    },

    async handleSubmit() {
      if (!this.selectedFile) {
        alert('请选择要上传的文件')
        return
      }

      this.uploading = true
      this.uploadProgress = 0
      this.uploadResult = null

      try {
        // 创建 FormData
        const formData = new FormData()
        formData.append('scope', 'user')  // 写死为 user
        formData.append('category', 'avatars')  // 写死为 avatars
        formData.append('filename', this.uploadForm.filename)
        if (this.uploadForm.description) {
          formData.append('description', this.uploadForm.description)
        }
        formData.append('file', this.selectedFile)

        // 模拟上传进度
        const progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += Math.random() * 30
          }
        }, 200)

        // 调用上传 API
        const result = await adminAPI.uploadStaticFile(formData)
        
        clearInterval(progressInterval)
        this.uploadProgress = 100

        // 上传成功后重置表单并刷新页面
        this.resetForm()
        
        // 显示成功提示
        alert('头像上传成功!')
        
        // 自动刷新页面
        window.location.reload()

      } catch (error) {
        console.error('上传失败:', error)
        alert('上传失败: ' + (error.message || '请重试'))
      } finally {
        this.uploading = false
      }
    },

    resetForm() {
      this.uploadForm = {
        filename: '',
        description: '',
      }
      this.selectedFile = null
      this.previewUrl = null
      this.uploadProgress = 0
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 加载用户头像库
    async loadUserAvatars() {
      try {
        console.log('🔄 加载用户头像库...')
        
        // 从API加载头像数据
        const response = await adminAPI.getStaticFiles()
        console.log('📥 头像数据响应：', response)
        
        // 使用新的数据结构
        if (response && response.userAvatars) {
          this.userAvatars = response.userAvatars
        } else {
          console.log('暂无用户头像')
          this.userAvatars = []
        }
        
      } catch (error) {
        console.error('❌ 加载用户头像失败：', error)
        this.userAvatars = []
      }
    },

    // 获取头像URL
    getAvatarUrl(avatar) {
      // 如果avatar有url属性，直接使用
      if (avatar && avatar.url) {
        return avatar.url
      }
      
      // 兼容旧格式：如果传入的是filename字符串
      if (typeof avatar === 'string') {
        return `http://127.0.0.1:8080/static/user/avatars/${avatar}`
      }
      
      // 如果avatar对象有filename，构建URL
      if (avatar && avatar.filename) {
        return `http://127.0.0.1:8080/static/user/avatars/${avatar.filename}`
      }
      
      // 默认头像
      return '/logo.png'
    },

    // 选择头像
    selectAvatar(avatar) {
      console.log('✅ 已选择头像：', avatar)
      
      // 触发事件告诉父组件选择的头像
      this.$emit('avatar-selected', {
        url: avatar.url || this.getAvatarUrl(avatar),
        filename: avatar.filename,
        description: avatar.description
      })
      
      alert(`已选择头像：${avatar.filename}`)
    },

    // 显示删除菜单
    showDeleteMenu(avatar, event) {
      this.deleteMenu = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        avatar: avatar
      }
    },

    // 隐藏删除菜单
    hideDeleteMenu() {
      this.deleteMenu.visible = false
      this.deleteMenu.avatar = null
    },

    // 确认删除头像
    async confirmDeleteAvatar() {
      if (!this.deleteMenu.avatar) return
      
      try {
        console.log('🗑️ 删除头像：', this.deleteMenu.avatar)
        
        // 调用删除API
        await adminAPI.deleteStaticFile(this.deleteMenu.avatar.id)
        
        // 从列表中移除
        this.userAvatars = this.userAvatars.filter(avatar => avatar.id !== this.deleteMenu.avatar.id)
        
        // 隐藏菜单
        this.hideDeleteMenu()
        
        alert('头像删除成功')
        
      } catch (error) {
        console.error('❌ 删除头像失败：', error)
        alert('删除头像失败：' + error.message)
        this.hideDeleteMenu()
      }
    },

    // 切换头像状态（失效/恢复）
    async toggleAvatarStatus() {
      if (!this.deleteMenu.avatar) return
      
      try {
        const currentValid = this.deleteMenu.avatar.valid !== false // 默认为true，除非明确为false
        const newValid = !currentValid
        
        console.log('🔄 切换头像状态：', this.deleteMenu.avatar)
        console.log('当前状态:', currentValid, '新状态:', newValid)
        
        // 调用状态更新API
        await adminAPI.updateStaticFileStatus(this.deleteMenu.avatar, newValid)
        
        // 更新本地状态
        const avatarIndex = this.userAvatars.findIndex(avatar => avatar.id === this.deleteMenu.avatar.id)
        if (avatarIndex !== -1) {
          this.userAvatars[avatarIndex].valid = newValid
        }
        
        // 隐藏菜单
        this.hideDeleteMenu()
        
        alert(newValid ? '头像已恢复' : '头像已失效')
        
      } catch (error) {
        console.error('❌ 切换头像状态失败：', error)
        alert('操作失败：' + error.message)
        this.hideDeleteMenu()
      }
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('zh-CN')
      } catch (error) {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
.avatar-upload-container {
  max-width: 1400px;
  width: 100%;
  min-width: 900px;
  margin: 0 auto;
  padding: 40px 60px;
  box-sizing: border-box;
}

.upload-header {
  text-align: center;
  margin-bottom: 30px;
}

.upload-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.upload-header p {
  color: #666;
  margin: 0;
}

.upload-form {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,.25);
}

.file-input-container {
  position: relative;
}

.file-hint {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.file-info {
  margin-top: 10px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 13px;
}

.file-info p {
  margin: 5px 0;
}

/* 头像预览样式 */
.avatar-preview {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.preview-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ddd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 上传结果中的头像样式 */
.uploaded-avatar {
  text-align: center;
  margin-top: 15px;
}

.result-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #28a745;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary,
.btn-small {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-small {
  padding: 5px 10px;
  background: #28a745;
  color: white;
  font-size: 12px;
}

.btn-small:hover {
  background: #1e7e34;
}

.upload-progress {
  margin-bottom: 30px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.upload-result {
  margin-bottom: 30px;
}

.success-message,
.error-message {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

/* 用户头像库样式 */
.user-avatar-library {
  margin-top: 48px;
  padding: 64px 120px 24px 0px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1.5px solid #e9ecef;
}

.user-avatar-library h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.user-avatar-library .avatar-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 56px 80px;
  justify-items: center;
}

.user-avatar-library .avatar-item {
  background: white;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.user-avatar-library .avatar-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #007bff;
}

.user-avatar-library .avatar-item.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.user-avatar-library .avatar-item img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}

.user-avatar-library .avatar-info {
  font-size: 12px;
}

.user-avatar-library .avatar-name {
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
}

.user-avatar-library .avatar-date {
  color: #666;
  margin: 0;
}

.user-avatar-library .no-avatars {
  text-align: center;
  color: #666;
  padding: 40px;
  font-style: italic;
}

/* 删除菜单样式 */
.delete-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 120px;
}

.delete-menu-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.delete-menu-item:hover {
  background: #f5f5f5;
}

.delete-menu-item:first-child {
  color: #007bff;
  border-radius: 8px 8px 0 0;
}

.delete-menu-item:nth-child(2) {
  color: #dc3545;
}

.delete-menu-item.cancel {
  color: #6c757d;
  border-top: 1px solid #eee;
  border-radius: 0 0 8px 8px;
}

/* 失效头像样式 */
.user-avatar-library .avatar-item.disabled {
  opacity: 0.5;
  filter: grayscale(0.7);
}

.user-avatar-library .avatar-item.disabled img {
  filter: grayscale(0.8);
}

.avatar-status.disabled {
  color: #dc3545;
  font-size: 11px;
  font-weight: bold;
  margin: 2px 0 0 0;
}

.delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-upload-container {
    padding: 10px;
  }
  
  .upload-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .history-actions {
    align-self: flex-end;
  }
  
  .preview-image {
    width: 100px;
    height: 100px;
  }
}
</style>
