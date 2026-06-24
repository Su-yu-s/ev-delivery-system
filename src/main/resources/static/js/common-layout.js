// common-layout.js - 通用布局功能
// 提供统一的导航栏、用户状态管理和管理员权限检查

class CommonLayout {
  constructor() {
    this.currentUser = null;
    this.isAdmin = false;
    this.isShowingLogoutDialog = false; // 添加标志来跟踪是否正在显示退出登录对话框
    this.init();
  }

  init() {
    this.loadUserData();
    this.checkLoginStatus();
    this.checkAdminPermission();
    this.bindEvents();
    this.setActiveNav();
    this.setupDropdownMenu();
  }

  // 加载用户数据
  loadUserData() {
    let rawData = sessionStorage.getItem('currentUser');
    if (!rawData) {
      rawData = localStorage.getItem('currentUser');
      if (rawData) {
        sessionStorage.setItem('currentUser', rawData);
      }
    }
    
    if (rawData) {
      try {
        const storedData = JSON.parse(rawData);
        this.currentUser = storedData.user || storedData;
        this.isAdmin = this.currentUser && this.currentUser.role === 'ADMIN';
      } catch (e) {
        console.error('[CommonLayout] 解析用户数据失败:', e);
        this.currentUser = null;
        this.isAdmin = false;
      }
    }
  }

  // 检查登录状态
  checkLoginStatus() {
    const authNav = document.getElementById('authNav');
    const profileNav = document.getElementById('profileNav');
    const navUsername = document.getElementById('navUsername');
    const adminBadge = document.getElementById('adminBadge');

    if (this.currentUser && this.currentUser.id) {
      // 已登录
      if (authNav) authNav.style.display = 'none';
      if (profileNav) {
        profileNav.style.display = 'flex';
        profileNav.classList.remove('hidden');
      }
      if (navUsername) {
        navUsername.textContent = this.currentUser.name || this.currentUser.username || '用户';
      }
      // 显示管理员徽章
      if (adminBadge) {
        adminBadge.style.display = this.isAdmin ? 'inline-flex' : 'none';
      }
    } else {
      // 未登录
      if (authNav) authNav.style.display = 'flex';
      if (profileNav) {
        profileNav.style.display = 'none';
        profileNav.classList.add('hidden');
      }
      if (adminBadge) adminBadge.style.display = 'none';
    }
  }

  // 检查管理员权限并显示/隐藏管理员菜单
  checkAdminPermission() {
    // 左侧导航栏的管理员菜单
    const adminMenuSection = document.getElementById('adminMenuSection');
    // 顶部下拉菜单的管理员快捷入口
    const adminQuickMenu = document.getElementById('adminQuickMenu');
    
    if (this.isAdmin) {
      // 显示管理员菜单
      if (adminMenuSection) adminMenuSection.style.display = 'block';
      if (adminQuickMenu) adminQuickMenu.style.display = 'block';
    } else {
      // 隐藏管理员菜单
      if (adminMenuSection) adminMenuSection.style.display = 'none';
      if (adminQuickMenu) adminQuickMenu.style.display = 'none';
    }
  }

  // 设置下拉菜单交互
  setupDropdownMenu() {
    const userInfoBtn = document.getElementById('userInfoBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userInfoBtn && userDropdown) {
      // 点击按钮切换下拉菜单
      userInfoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });
      
      // 点击页面其他位置关闭下拉菜单
      document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
      });
      
      // 阻止下拉菜单内部点击冒泡
      userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  // 绑定事件
  bindEvents() {
    // 退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 阻止事件冒泡，避免触发其他事件处理器
        this.logout();
      });
    }
    
    // 拦截所有指向 profile.html 的链接，确保用户数据正确传递
    this.setupProfileLinks();
  }

  // 设置 profile 链接的点击处理
  setupProfileLinks() {
    // 查找所有指向 profile.html 的链接
    const profileLinks = document.querySelectorAll('a[href*="profile.html"]');
    
    profileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // 如果用户未登录，跳转到登录页
        if (!this.currentUser || !this.currentUser.id) {
          e.preventDefault();
          console.log('[CommonLayout] 用户未登录，跳转到登录页');
          window.location.href = '/html/login.html';
          return;
        }
        
        // 阻止默认跳转
        e.preventDefault();
        
        // 确保用户数据同时存在于 sessionStorage 和 localStorage
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
          localStorage.setItem('currentUser', userData);
          console.log('[CommonLayout] 已同步用户数据到 localStorage');
        }
        
        // 获取原始链接地址
        let targetUrl = link.getAttribute('href');
        
        // 添加 userId 参数作为备用
        const url = new URL(targetUrl, window.location.origin);
        url.searchParams.set('userId', this.currentUser.id);
        
        console.log('[CommonLayout] 跳转到 profile 页面:', url.toString());
        
        // 执行跳转
        window.location.href = url.toString();
      });
    });
  }

  // 设置当前页面的导航项为激活状态
  setActiveNav() {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    
    // 首先移除所有激活状态
    navItems.forEach(item => item.classList.remove('active'));
    
    // 根据当前路径设置激活状态
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) return;
      
      // 处理带hash的链接
      if (href.includes('#')) {
        const [path, hash] = href.split('#');
        if (currentPath.includes(path) && currentHash === '#' + hash) {
          item.classList.add('active');
        }
      } else {
        // 精确匹配路径
        const hrefPath = href.replace(/\.html$/, '');
        const cleanCurrentPath = currentPath.replace(/\.html$/, '');
        if (cleanCurrentPath.endsWith(hrefPath.replace('/html/', '/'))) {
          item.classList.add('active');
        }
      }
    });
  }

  // 退出登录 - 显示确认对话框
  logout() {
    this.showLogoutConfirmDialog();
  }

  // 显示退出登录确认对话框
  showLogoutConfirmDialog() {
    // 检查是否已有对话框存在或正在显示，避免重复创建
    if (this.isShowingLogoutDialog || document.querySelector('.logout-confirm-overlay')) {
      return;
    }
    
    // 设置标志表示正在显示对话框
    this.isShowingLogoutDialog = true;
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'logout-confirm-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'logout-confirm-dialog';
    dialog.style.cssText = `
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      animation: scaleIn 0.3s ease;
    `;

    // 对话框内容
    const content = document.createElement('div');
    content.innerHTML = `

      <h3 style="
        color: #1e293b;
        margin-bottom: 1rem;
        font-size: 1.25rem;
        font-weight: 600;
      ">
        确定要退出登录吗？
      </h3>
      <p style="
        color: #64748b;
        margin-bottom: 1.5rem;
        line-height: 1.5;
        font-size: 0.875rem;
      ">
        退出后需要重新登录才能访问个人功能
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="confirmLogoutBtn" style="
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s ease;
          flex: 1;
        ">确定退出</button>
        <button id="cancelLogoutBtn" style="
          background: #e2e8f0;
          color: #475569;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s ease;
          flex: 1;
        ">取消</button>
      </div>
    `;
    dialog.appendChild(content);
    overlay.appendChild(dialog);

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes scaleOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.9); opacity: 0; }
      }
      .logout-confirm-dialog button:hover {
        opacity: 0.9;
      }
      #confirmLogoutBtn:hover {
        background: #dc2626;
      }
      #cancelLogoutBtn:hover {
        background: #cbd5e1;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // 关闭对话框函数
    const closeDialog = () => {
      this.isShowingLogoutDialog = false; // 重置标志
      overlay.style.animation = 'fadeOut 0.3s ease';
      dialog.style.animation = 'scaleOut 0.3s ease';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 280);
    };

    // 执行退出登录
    const doLogout = () => {
      this.isShowingLogoutDialog = false; // 重置标志
      // 清除存储的用户数据
      sessionStorage.removeItem('currentUser');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      
      // 显示退出成功提示
      this.showToast('已退出登录', 'success');
      
      // 延迟跳转到登录页
      setTimeout(() => {
        window.location.href = '/html/login.html';
      }, 800);
    };

    // 绑定事件
    const confirmBtn = overlay.querySelector('#confirmLogoutBtn');
    const cancelBtn = overlay.querySelector('#cancelLogoutBtn');

    confirmBtn.addEventListener('click', () => {
      closeDialog();
      doLogout();
    });

    cancelBtn.addEventListener('click', closeDialog);

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog();
      }
    });

    // ESC 键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // 显示 Toast 提示
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 500;
      font-size: 1rem;
      z-index: 10001;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    `;

    const colors = {
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      info: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
    };

    toast.style.background = colors[type] || colors.info;
    toast.style.color = '#ffffff';
    toast.textContent = message;

    // 添加滑入动画
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(toastStyle);
    document.body.appendChild(toast);

    // 自动消失
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        if (toastStyle.parentNode) toastStyle.parentNode.removeChild(toastStyle);
      }, 280);
    }, 2500);
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }

  // 检查是否为管理员
  isAdminUser() {
    return this.isAdmin;
  }

  // 检查是否已登录
  isLoggedIn() {
    return this.currentUser && this.currentUser.id;
  }
}

// 全局实例
let commonLayoutInstance = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  commonLayoutInstance = new CommonLayout();
});

// 导出工具函数供其他脚本使用
function getCommonLayout() {
  return commonLayoutInstance;
}

function isUserAdmin() {
  return commonLayoutInstance ? commonLayoutInstance.isAdminUser() : false;
}

function isUserLoggedIn() {
  return commonLayoutInstance ? commonLayoutInstance.isLoggedIn() : false;
}

function getCurrentUserData() {
  return commonLayoutInstance ? commonLayoutInstance.getCurrentUser() : null;
}
