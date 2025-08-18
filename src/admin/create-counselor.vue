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
              maxlength="11"
              required
              class="form-input"
            />
            <small class="form-hint">手机号将作为登录账号</small>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="resetForm" class="reset-btn">
            重置
          </button>
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            {{ isSubmitting ? '添加中...' : '添加咨询师' }}
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

// 简化表单数据，只包含必需的两个字段
const form = reactive({
  name: '',
  phone: ''
})

// 提交表单
async function handleSubmit() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // 构建提交数据，只包含 name 和 phone
    const submitData = {
      name: form.name.trim(),
      phone: form.phone.trim()
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
    form.name = ''
    form.phone = ''
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
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.back-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #5a6268;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  width: 620px;
  max-width: 100%;
  margin: 0 auto;
}

.counselor-form {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-section {
  margin-bottom: 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.form-group {
  margin-bottom: 20px;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-input {
  width: 280px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-hint {
  display: block;
  margin-top: 5px;
  color: #6c757d;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.reset-btn {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #5a6268;
}

.submit-btn {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .create-counselor {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .counselor-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
