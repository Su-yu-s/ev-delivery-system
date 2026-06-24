// 个人资料页面交互脚本
console.log('[Profile] 脚本已加载, sessionStorage:', sessionStorage.getItem('currentUser') ? '存在' : '不存在');

class ProfileManager {
  constructor() {
    console.log('[Profile] ProfileManager 构造函数执行');
    this.currentTab = 'basic';
    this.isEditing = false;
    this.originalData = {};
    this.currentUser = null;
    this.initRetryCount = 0;
    this.maxRetries = 5;  // 增加重试次数
    // 延迟初始化，确保浏览器存储完全就绪
    this.delayedInit();
  }

  // 延迟初始化 - 解决页面跳转后存储读取时序问题
  delayedInit() {
    console.log('[Profile] delayedInit 调用');
    // 使用较长的延迟时间，确保DOM和存储都就绪
    setTimeout(() => {
      this.init();
    }, 200);  // 增加到200ms
  }

  init() {
    // 调试输出到终端（通过后端API）
    this.logToServer('[Profile] 开始初始化...');
    
    // 先加载用户数据，然后检查登录状态
    this.currentUser = this.loadUserFromStorage();
    
    if (!this.currentUser || !this.currentUser.id) {
      // 尝试从URL参数获取用户ID作为备用方案
      const urlUserId = this.getUrlParam('userId');
      if (urlUserId) {
        this.logToServer('[Profile] 尝试从URL参数恢复用户ID: ' + urlUserId);
        // 使用URL参数中的userId，后续会从API获取完整用户数据
        this.currentUser = { id: urlUserId };
      }
    }
    
    // 再次检查
    if (!this.currentUser || !this.currentUser.id) {
      // 如果还是没有，可能是时序问题，重试几次
      if (this.initRetryCount < this.maxRetries) {
        this.initRetryCount++;
        this.logToServer('[Profile] 用户数据未就绪，重试第' + this.initRetryCount + '次...');
        setTimeout(() => this.init(), 100 * this.initRetryCount);
        return;
      }
      
      // 重试次数用尽，跳转到登录页
      this.logToServer('[Profile] 用户未登录，跳转到登录页');
      window.location.href = '/html/login.html';
      return;
    }
    
    this.logToServer('[Profile] 用户验证通过: ' + this.currentUser.id);
    this.updateNavStatus();
    this.bindEvents();
    this.loadUserData();
    this.setupTabNavigation();
  }

  // 获取URL参数
  getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // 输出日志（仅控制台，不发送到后端）
  logToServer(message) {
    console.log(message);
  }

  // 从存储中加载用户数据
  loadUserFromStorage() {
    // 优先从sessionStorage获取
    let rawData = sessionStorage.getItem('currentUser');
    this.logToServer('[Profile] sessionStorage.currentUser: ' + (rawData ? '存在' : '不存在'));
    
    // 如果sessionStorage没有，尝试从 localStorage 获取
    if (!rawData) {
      rawData = localStorage.getItem('currentUser');
      this.logToServer('[Profile] localStorage.currentUser: ' + (rawData ? '存在' : '不存在'));
      if (rawData) {
        // 同步到 sessionStorage
        sessionStorage.setItem('currentUser', rawData);
        this.logToServer('[Profile] 从 localStorage 恢复用户数据到 sessionStorage');
      }
    }
    
    if (!rawData) {
      this.logToServer('[Profile] 存储中没有用户数据');
      return null;
    }
    
    try {
      const storedData = JSON.parse(rawData);
      // 兼容 {user, token} 格式和直接存储用户对象的格式
      const user = storedData.user || storedData;
      this.logToServer('[Profile] 解析用户数据成功: id=' + user.id + ', username=' + user.username);
      return user;
    } catch (e) {
      this.logToServer('[Profile] 解析用户数据失败: ' + e.message);
      return null;
    }
  }

  // 更新导航栏状态
  updateNavStatus() {
    const authNav = document.getElementById('authNav');
    const profileNav = document.getElementById('profileNav');
    const navUsername = document.getElementById('navUsername');

    if (authNav) authNav.style.display = 'none';
    if (profileNav) profileNav.style.display = 'flex';
    if (navUsername && this.currentUser) {
      navUsername.textContent = this.currentUser.name || this.currentUser.username || '用户';
    }
  }

  bindEvents() {
    // 标签页切换 - 只绑定左侧导航栏的nav-item
    document.querySelectorAll('.left-sidebar .nav-item').forEach(item => {
      // 排除首页链接
      if (!item.dataset.tab) return;
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab(item.dataset.tab);
      });
    });

    // 保存按钮
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveProfile();
    });

    // 取消按钮
    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.cancelEdit();
    });

    // 修改密码按钮
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
      this.changePassword();
    });

    // 注销账号按钮
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
      this.deleteAccount();
    });

    // 退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // 表单验证
    this.setupFormValidation();
  }

  // 退出登录 - 调用统一的 common-layout 方法
  logout() {
    // 使用 common-layout.js 中的统一退出登录方法
    if (commonLayoutInstance && typeof commonLayoutInstance.logout === 'function') {
      commonLayoutInstance.logout();
    } else {
      // 备用方案
      if (confirm('确认退出登录吗？')) {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        window.location.href = '/html/login.html';
      }
    }
  }

  setupTabNavigation() {
    // 检查URL中hash，如果有则显示对应标签页
    const hash = window.location.hash;
    if (hash) {
      const tabName = hash.substring(1); // 移除#号
      if (tabName === 'security' || tabName === 'account' || tabName === 'basic') {
        this.switchTab(tabName);
        return;
      }
    }
    
    // 默认显示基本信息标签页
    this.switchTab('basic');
  }

  switchTab(tabName) {
    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });

    // 移除所有导航项的激活状态 - 只处理左侧导航栏
    document.querySelectorAll('.left-sidebar .nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // 显示选中的标签页
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // 激活对应的导航项
    const targetNav = document.querySelector(`.left-sidebar .nav-item[data-tab="${tabName}"]`);
    if (targetNav) {
      targetNav.classList.add('active');
    }

    this.currentTab = tabName;
  }

  async loadUserData() {
    try {
      // 使用已加载的用户ID
      const userId = this.currentUser ? this.currentUser.id : null;
      const token = localStorage.getItem('authToken');
      
      if (!userId) {
        console.log('[Profile] loadUserData: 无用户ID');
        return;
      }

      // 构建请求头（带token）
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 从后端API获取用户详细信息
      const response = await fetch(`/api/user/get/${userId}`, { headers });
      const result = await response.json();
      
      if (result.code === 200) {
        const userData = result.data;
        this.originalData = { ...userData };
        this.populateForm(userData);
        this.updateDisplay(userData);
        console.log('[Profile] 用户数据加载成功');
      } else {
        throw new Error(result.message || '获取用户信息失败');
      }

    } catch (error) {
      console.error('[Profile] 加载用户数据失败:', error);
      this.showError('加载用户数据失败，请刷新页面重试');
    }
  }

  populateForm(data) {
    // 填充表单字段
    document.getElementById('username').value = data.username || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('name').value = data.name || '';
    document.getElementById('gender').value = data.gender || '0';
    document.getElementById('age').value = data.age || '';
    document.getElementById('email').value = data.email || '';
  }

  updateDisplay(data) {
    // 更新显示信息
    // 注：新的HTML结构中没有displayName和userRole，如果需要可以更新头部用户名
    const navUsername = document.getElementById('navUsername');
    if (navUsername && data.username) {
      navUsername.textContent = data.username;
    }
    
    // 更新账号信息
    const createTimeDisplay = document.getElementById('createTimeDisplay');
    const updateTimeDisplay = document.getElementById('updateTimeDisplay');
    
    if (createTimeDisplay) {
      createTimeDisplay.textContent = data.createTime || '-';
    }
    if (updateTimeDisplay) {
      updateTimeDisplay.textContent = data.updateTime || '-';
    }
  }

  setupFormValidation() {
    // 用户名验证
    document.getElementById('username').addEventListener('blur', () => {
      this.validateUsername();
    });

    // 手机号验证
    document.getElementById('phone').addEventListener('blur', () => {
      this.validatePhone();
    });

    // 邮箱验证
    document.getElementById('email').addEventListener('blur', () => {
      this.validateEmail();
    });

    // 密码验证
    document.getElementById('newPassword').addEventListener('blur', () => {
      this.validatePassword();
    });

    document.getElementById('confirmNewPassword').addEventListener('blur', () => {
      this.validateConfirmPassword();
    });
  }

  validateUsername() {
    const username = document.getElementById('username').value.trim();
    const errorElement = document.getElementById('usernameError');
    
    if (!username) {
      this.showFieldError(errorElement, '用户名不能为空');
      return false;
    }
    
    if (username.length < 3 || username.length > 20) {
      this.showFieldError(errorElement, '用户名长度应为3-20个字符');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.showFieldError(errorElement, '用户名只能包含字母、数字和下划线');
      return false;
    }
    
    this.clearFieldError(errorElement);
    return true;
  }

  validatePhone() {
    const phone = document.getElementById('phone').value.trim();
    const errorElement = document.getElementById('phoneError');
    
    if (!phone) {
      this.showFieldError(errorElement, '手机号不能为空');
      return false;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.showFieldError(errorElement, '请输入正确的手机号格式');
      return false;
    }
    
    this.clearFieldError(errorElement);
    return true;
  }

  validateEmail() {
    const email = document.getElementById('email').value.trim();
    const errorElement = document.getElementById('emailError');
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showFieldError(errorElement, '请输入正确的邮箱格式');
      return false;
    }
    
    this.clearFieldError(errorElement);
    return true;
  }

  validatePassword() {
    const password = document.getElementById('newPassword').value;
    const errorElement = document.getElementById('newPasswordError');
    
    if (password && password.length < 6) {
      this.showFieldError(errorElement, '密码长度不能少于6位');
      return false;
    }
    
    this.clearFieldError(errorElement);
    return true;
  }

  validateConfirmPassword() {
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const errorElement = document.getElementById('confirmNewPasswordError');
    
    if (password && confirmPassword && password !== confirmPassword) {
      this.showFieldError(errorElement, '两次输入的密码不一致');
      return false;
    }
    
    this.clearFieldError(errorElement);
    return true;
  }

  showFieldError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  clearFieldError(element) {
    element.textContent = '';
    element.style.display = 'none';
  }

  async saveProfile() {
    // 验证表单
    if (!this.validateUsername() || !this.validatePhone() || !this.validateEmail()) {
      return;
    }

    try {
      // 获取当前登录用户信息（兼容 {user, token} 格式）
      const storedData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      const currentUser = storedData.user || storedData;
      const token = storedData.token || localStorage.getItem('authToken');
      
      if (!currentUser.id) {
        this.showError('用户未登录，请先登录');
        return;
      }

      // 收集表单数据
      const formData = {
        id: currentUser.id,
        username: document.getElementById('username').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        name: document.getElementById('name').value.trim(),
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        email: document.getElementById('email').value.trim()
      };

      // 构建请求头（带token）
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 调用后端API更新用户信息
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        // 显示成功消息
        this.showSuccess('个人资料更新成功！');
        
        // 更新sessionStorage中的用户信息（保持原有格式）
        const updatedUser = { ...currentUser, ...formData, updateTime: new Date().toISOString() };
        if (storedData.token) {
          // 保持 {user, token} 格式
          sessionStorage.setItem('currentUser', JSON.stringify({ user: updatedUser, token: storedData.token }));
        } else {
          sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        
        // 更新显示信息
        this.updateDisplay({
          ...this.originalData,
          ...formData,
          updateTime: new Date().toLocaleString('zh-CN')
        });
        
        // 更新原始数据
        this.originalData = { ...this.originalData, ...formData };
      } else {
        throw new Error(result.message || '更新失败');
      }

    } catch (error) {
      console.error('保存失败:', error);
      this.showError('保存失败，请稍后重试');
    }
  }

  cancelEdit() {
    // 恢复原始数据
    this.populateForm(this.originalData);
    this.clearAllErrors();
  }

  async changePassword() {
    // 验证密码
    if (!this.validatePassword() || !this.validateConfirmPassword()) {
      return;
    }

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    if (!oldPassword) {
      this.showFieldError(document.getElementById('oldPasswordError'), '请输入当前密码');
      return;
    }

    try {
      // 获取当前登录用户信息（兼容 {user, token} 格式）
      const storedData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      const currentUser = storedData.user || storedData;
      const token = storedData.token || localStorage.getItem('authToken');
      
      if (!currentUser.id) {
        this.showError('用户未登录，请先登录');
        return;
      }

      // 构建请求头（带token）
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 调用后端API验证旧密码并修改密码
      const params = new URLSearchParams();
      params.append('oldPassword', oldPassword);
      params.append('newPassword', newPassword);
      
      const response = await fetch(`/api/user/updatePassword/${currentUser.id}?${params.toString()}`, {
        method: 'PUT',
        headers: headers
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        // 显示成功消息
        this.showSuccess('密码修改成功！请重新登录');
        
        // 清空密码字段
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
        this.clearAllErrors();
        
        // 延迟2秒后跳转到登录页面
        setTimeout(() => {
          // 清除用户登录状态
          sessionStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          // 跳转到登录页面
          window.location.href = '/html/login.html';
        }, 2000);
      } else {
        throw new Error(result.message || '修改密码失败');
      }

    } catch (error) {
      console.error('修改密码失败:', error);
      this.showError('修改密码失败，请检查当前密码是否正确');
    }
  }

  async deleteAccount() {
    if (confirm('⚠️ 确定要注销账号吗？此操作不可恢复，所有数据将被永久删除！')) {
      if (confirm('最后一次确认：真的要注销账号吗？')) {
        try {
          // 获取当前登录用户信息（兼容 {user, token} 格式）
          const storedData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
          const currentUser = storedData.user || storedData;
          const token = storedData.token || localStorage.getItem('authToken');
          
          if (!currentUser.id) {
            this.showError('用户未登录，请先登录');
            return;
          }

          // 构建请求头（带token）
          const headers = { 'Content-Type': 'application/json' };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // 调用后端API删除用户账号
          const response = await fetch(`/api/user/delete/${currentUser.id}`, {
            method: 'DELETE',
            headers: headers
          });
          
          const result = await response.json();
          
          if (result.code === 200) {
            // 显示成功消息
            this.showSuccess('账号注销成功，即将跳转到登录页面...');
            
            // 清除用户登录状态
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            
            // 延迟2秒后跳转到登录页面
            setTimeout(() => {
              window.location.href = '/html/login.html';
            }, 2000);
          } else {
            throw new Error(result.message || '注销账号失败');
          }

        } catch (error) {
          console.error('注销账号失败:', error);
          this.showError('注销账号失败，请稍后重试');
        }
      }
    }
  }



  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;

    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;

    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(element => {
      this.clearFieldError(element);
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new ProfileManager();
});

