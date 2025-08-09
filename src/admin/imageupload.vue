<template>
  <div class="avatar-upload-container">
    <div class="upload-header">
      <h2>用户头像上传</h2>
      <p>上传用户头像图片，支持 JPG、PNG格式</p>
    </div>

    <div class="upload-form">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="filename">头像文件名 *</label>
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
          <label for="file">选择头像图片 *</label>
          <div class="file-input-container">
            <input 
              id="file" 
              type="file" 
              ref="fileInput"
              @change="handleFileChange"
              accept="image/*"
              required
            />
            <small class="file-hint">建议尺寸：200x200 像素，文件大小不超过 2MB</small>
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

    <!-- 上传结果 -->
    <div v-if="uploadResult" class="upload-result">
      <div v-if="uploadResult.success" class="success-message">
        <h3>✅ 头像上传成功!</h3>
        <p><strong>头像URL:</strong> {{ uploadResult.url }}</p>
        <p><strong>文件ID:</strong> {{ uploadResult.fileId }}</p>
        <div class="uploaded-avatar">
          <img :src="uploadResult.url" alt="已上传的头像" class="result-avatar" />
        </div>
      </div>
      <div v-else class="error-message">
        <h3>❌ 头像上传失败</h3>
        <p>{{ uploadResult.error }}</p>
      </div>
    </div>

    <!-- 上传历史 -->
    <div class="upload-history">
      <h3>最近上传的头像</h3>
      <div v-if="uploadHistory.length === 0" class="no-history">
        暂无头像上传记录
      </div>
      <div v-else class="history-list">
        <div v-for="(item, index) in uploadHistory" :key="index" class="history-item">
          <div class="history-avatar">
            <img :src="item.url" alt="历史头像" class="history-avatar-img" />
          </div>
          <div class="history-info">
            <p><strong>{{ item.filename }}</strong></p>
            <p class="upload-time">{{ formatTime(item.uploadTime) }}</p>
          </div>
          <div class="history-actions">
            <button @click="copyUrl(item.url)" class="btn-small">复制链接</button>
          </div>
        </div>
      </div>
    </div>
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
      uploadHistory: []
    }
  },
  mounted() {
    // 加载上传历史
    this.loadUploadHistory()
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
        
        // 验证文件大小（2MB）
        if (file.size > 2 * 1024 * 1024) {
          alert('文件大小不能超过 2MB')
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

        // 处理上传结果
        this.uploadResult = {
          success: true,
          url: result.url || result,
          fileId: result.fileId || 'N/A'
        }

        // 添加到历史记录
        this.addToHistory({
          filename: this.uploadForm.filename,
          url: this.uploadResult.url,
          uploadTime: new Date()
        })

        // 重置表单
        this.resetForm()

      } catch (error) {
        console.error('上传失败:', error)
        this.uploadResult = {
          success: false,
          error: error.message || '上传失败，请重试'
        }
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

    formatTime(date) {
      return new Date(date).toLocaleString('zh-CN')
    },

    copyUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        alert('链接已复制到剪贴板')
      }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('链接已复制到剪贴板')
      })
    },

    loadUploadHistory() {
      // 从 localStorage 加载头像上传历史记录
      const history = localStorage.getItem('avatarUploadHistory')
      if (history) {
        this.uploadHistory = JSON.parse(history)
      }
    },

    addToHistory(item) {
      this.uploadHistory.unshift(item)
      // 只保留最近 10 条头像记录
      if (this.uploadHistory.length > 10) {
        this.uploadHistory = this.uploadHistory.slice(0, 10)
      }
      // 保存到 localStorage
      localStorage.setItem('avatarUploadHistory', JSON.stringify(this.uploadHistory))
    }
  }
}
</script>

<style scoped>
.avatar-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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

.upload-history {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.upload-history h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.no-history {
  text-align: center;
  color: #666;
  font-style: italic;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid #e9ecef;
  gap: 15px;
}

/* 历史记录中的头像样式 */
.history-avatar {
  flex-shrink: 0;
}

.history-avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.history-info {
  flex-grow: 1;
}

.history-info p {
  margin: 2px 0;
  font-size: 14px;
}

.upload-time {
  color: #666;
  font-size: 12px !important;
}

.history-actions {
  flex-shrink: 0;
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
