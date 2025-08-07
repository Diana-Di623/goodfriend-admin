<template>
  <div style="padding: 20px; text-align: center; background-color: #f0f0f0; min-height: 100vh;">
    <h1>这是登录页面测试</h1>
    <p>如果您看到这个页面，说明路由工作正常</p>
    <div style="margin-top: 20px;">
      <input type="text" placeholder="用户名" style="padding: 10px; margin: 5px;" />
      <br>
      <input type="password" placeholder="密码" style="padding: 10px; margin: 5px;" />
      <br>
      <button style="padding: 10px 20px; margin: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px;">登录</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestLogin'
}
</script>
