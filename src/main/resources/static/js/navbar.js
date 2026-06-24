/* ==================== 导航栏交互功能 ==================== */

class NavigationBar {
  constructor() {
    this.init();
  }

  init() {
    this.initDropdown();
    this.initLogout();
    this.updateUserInfo();
    this.highlightCurrentPage();
  }

  // 初始化下拉菜单
  initDropdown() {
    const userInfoBtn = document.getElementById('userInfoBtn');
    const dropdown = document.getElementById('userDropdown');

    if (userInfoBtn && dropdown) {
      // 点击用户按钮切换下拉菜单
      userInfoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.opacity === '1';
        
        if (isVisible) {
          this.closeDropdown();
        } else {
          this.openDropdown();
        }
      });

      // 点击页面其他地方关闭下拉菜单
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !userInfoBtn.contains(e.target)) {
          this.closeDropdown();
        }
      });
    }
  }

  openDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.style.opacity = '1';
      dropdown.style.visibility = 'visible';
      dropdown.style.transform = 'translateY(0)';
    }
  }

  closeDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.style.opacity = '0';
      dropdown.style.visibility = 'hidden';
      dropdown.style.transform = 'translateY(-10px)';
    }
  }

  // 初始化退出登录功能
  initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('确定要退出登录吗？')) {
          this.logout();
        }
      });
    }
  }

  // 退出登录
  logout() {
    try {
      // 清除sessionStorage
      sessionStorage.removeItem('currentUser');
      
      // 显示退出成功消息
      this.showMessage('退出登录成功！', 'success');
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        window.location.href = '/html/login.html';
      }, 1000);
    } catch (error) {
      console.error('退出登录失败:', error);
      this.showMessage('退出登录失败，请重试', 'error');
    }
  }

  // 更新用户信息显示
  updateUserInfo() {
    const currentUserData = sessionStorage.getItem('currentUser');
    const authNav = document.getElementById('authNav');
    const profileNav = document.getElementById('profileNav');
    const navUsername = document.getElementById('navUsername');
    const navProfile = document.getElementById('navProfile');

    if (currentUserData) {
      try {
        // 兼容 {user, token} 格式
        const storedData = JSON.parse(currentUserData);
        const currentUser = storedData.user || storedData;
        
        // 显示用户信息，隐藏登录/注册按钮
        if (authNav) authNav.style.display = 'none';
        if (profileNav) profileNav.style.display = 'block';
        
        // 更新用户名显示
        if (navUsername) {
          navUsername.textContent = currentUser.username || currentUser.name || '用户';
        }
        
        // 启用个人中心导航
        if (navProfile) {
          navProfile.style.pointerEvents = 'auto';
          navProfile.style.opacity = '1';
        }
      } catch (error) {
        console.error('解析用户数据失败:', error);
        this.showNotLoggedIn();
      }
    } else {
      this.showNotLoggedIn();
    }
  }

  // 显示未登录状态
  showNotLoggedIn() {
    const authNav = document.getElementById('authNav');
    const profileNav = document.getElementById('profileNav');
    const navProfile = document.getElementById('navProfile');

    if (authNav) authNav.style.display = 'flex';
    if (profileNav) profileNav.style.display = 'none';
    
    // 禁用个人中心导航（未登录时点击跳转到登录页）
    if (navProfile) {
      navProfile.addEventListener('click', (e) => {
        const currentUserData = sessionStorage.getItem('currentUser');
        if (!currentUserData) {
          e.preventDefault();
          this.showMessage('请先登录', 'warning');
          setTimeout(() => {
            window.location.href = '/html/login.html';
          }, 1000);
        }
      });
    }
  }

  // 高亮当前页面导航项
  highlightCurrentPage() {
    const currentPage = window.location.pathname;
    const navItems = document.querySelectorAll('.navbar-menu .nav-item');

    navItems.forEach(item => {
      const page = item.getAttribute('data-page');
      
      // 移除所有active类
      item.classList.remove('active');
      
      // 根据当前页面URL高亮对应导航项
      if (currentPage.includes('index.html') && page === 'index') {
        item.classList.add('active');
      } else if (currentPage.includes('profile.html') && page === 'profile') {
        item.classList.add('active');
      }
    });
  }

  // 显示消息提示
  showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 90px;
      right: 20px;
      z-index: 2000;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-weight: 500;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
    `;

    const colors = {
      success: { bg: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' },
      error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' },
      warning: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' },
      info: { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }
    };

    const style = colors[type] || colors.info;
    messageDiv.style.background = style.bg;
    messageDiv.style.color = style.color;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 300);
    }, 3000);
  }
}

// 页面加载完成后初始化导航栏
document.addEventListener('DOMContentLoaded', () => {
  window.navigationBar = new NavigationBar();
});

