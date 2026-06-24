/* admin-dashboard.js - 数据看板页面脚本 */

let dashboardData = {};
let allTasks = [];
let allUsers = [];

// 分页配置
let tasksPagination = {
  currentPage: 1,
  pageSize: 5,
  totalRecords: 0,
  totalPages: 0
};

let usersPagination = {
  currentPage: 1,
  pageSize: 5,
  totalRecords: 0,
  totalPages: 0
};

document.addEventListener('DOMContentLoaded', function() {
  checkAdminPermission();
  initializePage();
  setupEventListeners();
});

function checkAdminPermission() {
  const userDataStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
  if (!userDataStr) {
    showToast('请先登录', 'error');
    setTimeout(() => window.location.href = '/html/login.html', 1500);
    return;
  }
  try {
    const userData = JSON.parse(userDataStr);
    const user = userData.user;
    if (!user || user.role !== 'ADMIN') {
      showToast('您没有管理员权限', 'error');
      setTimeout(() => window.location.href = '/html/index.html', 1500);
      return;
    }
    updateNavUsername(user.name || user.username || '管理员');
  } catch (error) {
    console.error('解析用户数据失败:', error);
    window.location.href = '/html/login.html';
  }
}

function updateNavUsername(name) {
  const navUsername = document.getElementById('navUsername');
  if (navUsername) navUsername.textContent = name;
}

async function initializePage() {
  await loadDashboardData();
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  const userInfoBtn = document.getElementById('userInfoBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userInfoBtn && userDropdown) {
    userInfoBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => userDropdown.classList.remove('show'));
  }
}

async function loadDashboardData() {
  try {
    const token = localStorage.getItem('authToken');
    
    // 并行加载数据
    const [dashboardRes, tasksRes, usersRes] = await Promise.all([
      fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }),
      fetch('/api/admin/task/list', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }),
      fetch('/api/admin/user/list', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    ]);
    
    const dashboardResult = await dashboardRes.json();
    const tasksResult = await tasksRes.json();
    const usersResult = await usersRes.json();
    
    if (dashboardResult.code === 200) {
      dashboardData = dashboardResult.data;
      updateMainStats();
      updateStatusBars();
    }
    
    if (tasksResult.code === 200) {
      allTasks = tasksResult.data || [];
      renderRecentTasks();
    }
    
    if (usersResult.code === 200) {
      allUsers = usersResult.data || [];
      renderRecentUsers();
    }
    
  } catch (error) {
    console.error('加载仪表盘数据失败:', error);
    showToast('加载数据失败', 'error');
  }
}

function updateMainStats() {
  const d = dashboardData;
  
  // 主要统计
  document.getElementById('totalUsers').textContent = d.totalUsers || 0;
  document.getElementById('adminCount').textContent = d.adminCount || 0;
  document.getElementById('normalCount').textContent = (d.totalUsers - d.adminCount) || 0;
  
  document.getElementById('totalTasks').textContent = d.totalTasks || 0;
  document.getElementById('pendingCount').textContent = d.pendingTasks || 0;
  document.getElementById('activeCount').textContent = d.activeTasks || 0;
  
  document.getElementById('completedTasks').textContent = d.completedTasks || 0;
  
  // 完成率
  const total = d.totalTasks || 0;
  const completed = d.completedTasks || 0;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('completionRate').textContent = rate + '%';
}

function updateStatusBars() {
  const total = dashboardData.totalTasks || 0;
  const pending = dashboardData.pendingTasks || 0;
  const active = dashboardData.activeTasks || 0;
  const completed = dashboardData.completedTasks || 0;
  
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // 更新百分比
  document.getElementById('pendingPercent').textContent = pendingPercent + '%';
  document.getElementById('activePercent').textContent = activePercent + '%';
  document.getElementById('completedPercent').textContent = completedPercent + '%';
  
  // 更新数量
  document.getElementById('pendingNum').textContent = pending + ' 个';
  document.getElementById('activeNum').textContent = active + ' 个';
  document.getElementById('completedNum').textContent = completed + ' 个';
  
  // 更新条形图 (添加延迟以触发动画)
  setTimeout(() => {
    document.getElementById('pendingBar').style.width = pendingPercent + '%';
    document.getElementById('activeBar').style.width = activePercent + '%';
    document.getElementById('completedBar').style.width = completedPercent + '%';
  }, 100);
}

function renderRecentTasks() {
  const container = document.getElementById('recentTasksList');
  if (!container) return;
  
  // 更新分页信息
  tasksPagination.totalRecords = allTasks.length;
  tasksPagination.totalPages = Math.ceil(allTasks.length / tasksPagination.pageSize);
  
  if (tasksPagination.currentPage > tasksPagination.totalPages) {
    tasksPagination.currentPage = Math.max(1, tasksPagination.totalPages);
  }
  
  if (allTasks.length === 0) {
    container.innerHTML = '<div class="loading-mini">暂无任务数据</div>';
    return;
  }
  
  // 分页截取数据
  const startIndex = (tasksPagination.currentPage - 1) * tasksPagination.pageSize;
  const endIndex = startIndex + tasksPagination.pageSize;
  const pageTasks = allTasks.slice(startIndex, endIndex);
  
  const html = pageTasks.map(task => {
    const statusClass = getStatusClass(task.status);
    const statusText = task.status || '未知';
    const title = task.itinerary || (task.startAddr + ' -> ' + task.endAddr) || '无地址';
    
    return `
      <div class="recent-item">
        <div class="recent-icon task">T</div>
        <div class="recent-info">
          <div class="recent-title" title="${title}">${truncate(title, 30)}</div>
          <div class="recent-subtitle">${task.id || '-'}</div>
        </div>
        <span class="recent-badge ${statusClass}">${statusText}</span>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html + renderTasksPagination();
}

function renderTasksPagination() {
  const { currentPage, pageSize, totalRecords, totalPages } = tasksPagination;
  
  if (totalRecords === 0 || totalPages <= 1) return '';
  
  let pageButtons = '';
  for (let i = 1; i <= totalPages; i++) {
    pageButtons += `
      <button class="pagination-btn-mini ${i === currentPage ? 'active' : ''}" 
              onclick="goToTasksPage(${i})">${i}</button>
    `;
  }
  
  return `
    <div class="pagination-mini">
      <span class="pagination-info-mini">第 ${currentPage}/${totalPages} 页，共 ${totalRecords} 条</span>
      <div class="pagination-btns-mini">
        <button class="pagination-btn-mini" onclick="goToTasksPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>
        ${pageButtons}
        <button class="pagination-btn-mini" onclick="goToTasksPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>
      </div>
    </div>
  `;
}

function goToTasksPage(page) {
  if (page < 1 || page > tasksPagination.totalPages) return;
  tasksPagination.currentPage = page;
  renderRecentTasks();
}

function renderRecentUsers() {
  const container = document.getElementById('recentUsersList');
  if (!container) return;
  
  // 更新分页信息
  usersPagination.totalRecords = allUsers.length;
  usersPagination.totalPages = Math.ceil(allUsers.length / usersPagination.pageSize);
  
  if (usersPagination.currentPage > usersPagination.totalPages) {
    usersPagination.currentPage = Math.max(1, usersPagination.totalPages);
  }
  
  if (allUsers.length === 0) {
    container.innerHTML = '<div class="loading-mini">暂无用户数据</div>';
    return;
  }
  
  // 分页截取数据
  const startIndex = (usersPagination.currentPage - 1) * usersPagination.pageSize;
  const endIndex = startIndex + usersPagination.pageSize;
  const pageUsers = allUsers.slice(startIndex, endIndex);
  
  const html = pageUsers.map(user => {
    const roleClass = user.role === 'ADMIN' ? 'admin' : 'user';
    const roleText = user.role === 'ADMIN' ? '管理员' : '用户';
    const name = user.name || user.username || '未命名';
    
    return `
      <div class="recent-item">
        <div class="recent-icon user">U</div>
        <div class="recent-info">
          <div class="recent-title">${name}</div>
          <div class="recent-subtitle">${user.phone || user.id || '-'}</div>
        </div>
        <span class="recent-badge ${roleClass}">${roleText}</span>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html + renderUsersPagination();
}

function renderUsersPagination() {
  const { currentPage, pageSize, totalRecords, totalPages } = usersPagination;
  
  if (totalRecords === 0 || totalPages <= 1) return '';
  
  let pageButtons = '';
  for (let i = 1; i <= totalPages; i++) {
    pageButtons += `
      <button class="pagination-btn-mini ${i === currentPage ? 'active' : ''}" 
              onclick="goToUsersPage(${i})">${i}</button>
    `;
  }
  
  return `
    <div class="pagination-mini">
      <span class="pagination-info-mini">第 ${currentPage}/${totalPages} 页，共 ${totalRecords} 条</span>
      <div class="pagination-btns-mini">
        <button class="pagination-btn-mini" onclick="goToUsersPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>
        ${pageButtons}
        <button class="pagination-btn-mini" onclick="goToUsersPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>
      </div>
    </div>
  `;
}

function goToUsersPage(page) {
  if (page < 1 || page > usersPagination.totalPages) return;
  usersPagination.currentPage = page;
  renderRecentUsers();
}

function getStatusClass(status) {
  switch (status) {
    case '待配送': return 'pending';
    case '配送中': return 'active';
    case '配送完成': return 'completed';
    default: return '';
  }
}

function truncate(str, maxLen) {
  if (!str) return '-';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastSlideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
  showToast('已退出登录', 'info');
  setTimeout(() => window.location.href = '/html/login.html', 1000);
}
