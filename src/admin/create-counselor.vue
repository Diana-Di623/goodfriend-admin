<template>
  <div class="create-counselor">
    <div class="header">
      <h1>添加咨询师</h1>
      <button @click="$router.back()" class="back-btn">
        ← 返回
      </button>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="counselor-form">
        <div class="form-section">
          <h3>基本信息</h3>
          
          <div class="form-group">
            <label for="name">姓名 <span class="required">*</span></label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="请输入咨询师姓名"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="phone">手机号 <span class="required">*</span></label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="请输入手机号"
              pattern="^1[3-9]\d{9}$"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">登录密码 <span class="required">*</span></label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入登录密码"
              required
              minlength="6"
              class="form-input"
            />
            <small class="form-hint">密码至少6位字符</small>
          </div>

          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱地址"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-section">
          <h3>专业信息</h3>
          
          <div class="form-group">
            <label for="title">职称</label>
            <select id="title" v-model="form.title" class="form-input">
              <option value="">请选择职称</option>
              <option value="助理咨询师">助理咨询师</option>
              <option value="咨询师">咨询师</option>
              <option value="高级咨询师">高级咨询师</option>
              <option value="主任咨询师">主任咨询师</option>
            </select>
          </div>

          <div class="form-group">
            <label for="experience">从业经验（年）</label>
            <input
              id="experience"
              v-model.number="form.experience"
              type="number"
              min="0"
              max="50"
              placeholder="请输入从业年限"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="specialties">专业领域</label>
            <textarea
              id="specialties"
              v-model="form.specialties"
              placeholder="请输入专业领域，如：焦虑症、抑郁症治疗、家庭关系咨询等"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="education">教育背景</label>
            <textarea
              id="education"
              v-model="form.education"
              placeholder="请输入教育背景"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="certificates">资格证书</label>
            <textarea
              id="certificates"
              v-model="form.certificates"
              placeholder="请输入相关资格证书"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>个人简介</h3>
          
          <div class="form-group">
            <label for="introduction">个人简介</label>
            <textarea
              id="introduction"
              v-model="form.introduction"
              placeholder="请输入个人简介"
              rows="5"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="consultationStyle">咨询风格</label>
            <textarea
              id="consultationStyle"
              v-model="form.consultationStyle"
              placeholder="请描述咨询风格"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="resetForm" class="reset-btn">
            重置
          </button>
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            {{ isSubmitting ? '提交中...' : '添加咨询师' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { adminAPI } from '@/utils/adminAPI.js'

const router = useRouter()
const isSubmitting = ref(false)

// 表单数据
const form = reactive({
  name: '徭磊',
  phone: '13280345767',
  password: 'LatY6C3cvQ4QARW',
  email: '',
  title: '',
  experience: null,
  specialties: '',
  education: '',
  certificates: '',
  introduction: '',
  consultationStyle: ''
})

// 提交表单
async function handleSubmit() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // 构建提交数据
    const submitData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      password: form.password.trim(),
      email: form.email?.trim() || undefined,
      title: form.title || undefined,
      experience: form.experience || undefined,
      specialties: form.specialties?.trim() || undefined,
      education: form.education?.trim() || undefined,
      certificates: form.certificates?.trim() || undefined,
      introduction: form.introduction?.trim() || undefined,
      consultationStyle: form.consultationStyle?.trim() || undefined
    }
    
    console.log('提交咨询师数据：', submitData)
    
    // 调用API
    const response = await adminAPI.createCounselor(submitData)
    
    console.log('创建咨询师响应：', response)
    
    alert('咨询师添加成功！')
    router.push('/admin/counselors')
    
  } catch (error) {
    console.error('创建咨询师失败：', error)
    
    let errorMessage = '创建失败，请重试'
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(`创建失败：${errorMessage}`)
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
function resetForm() {
  if (confirm('确定要重置表单吗？')) {
    Object.assign(form, {
      name: '',
      phone: '',
      password: '',
      email: '',
      title: '',
      experience: null,
      specialties: '',
      education: '',
      certificates: '',
      introduction: '',
      consultationStyle: ''
    })
  }
}
</script>

<style scoped>
.create-counselor {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
}

.back-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  background: #7f8c8d;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 40px;
}

.form-section:last-of-type {
  margin-bottom: 30px;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #34495e;
  font-weight: 500;
}

.required {
  color: #e74c3c;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.form-hint {
  display: block;
  margin-top: 4px;
  color: #7f8c8d;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.reset-btn, .submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reset-btn {
  background: #95a5a6;
  color: white;
}

.reset-btn:hover {
  background: #7f8c8d;
}

.submit-btn {
  background: #27ae60;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #229954;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-counselor {
    padding: 15px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .reset-btn, .submit-btn {
    width: 100%;
  }
}
</style>
