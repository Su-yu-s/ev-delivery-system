/* admin-users.js - 管理员用户管理页面脚本 */

let allUsers = [];
let currentFilter = 'all';
let currentSearch = '';

// 分页配置
let pagination = {
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
  await loadUsers();
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') searchUsers();
    });
  }
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

async function loadUsers() {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const tableBody = document.getElementById('userTableBody');
  
  if (loadingState) loadingState.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';
  if (tableBody) tableBody.innerHTML = '';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/user/list', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      allUsers = result.data || [];
      updateStatistics();
      renderUsers();
    } else {
      showToast('加载用户失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
    showToast('加载用户列表失败', 'error');
  } finally {
    if (loadingState) loadingState.style.display = 'none';
  }
}

function updateStatistics() {
  const stats = {
    total: allUsers.length,
    admin: allUsers.filter(u => u.role === 'ADMIN').length,
    normal: allUsers.filter(u => u.role !== 'ADMIN').length,
    active: allUsers.filter(u => u.status === 1).length
  };
  document.getElementById('statTotal').textContent = stats.total;
  document.getElementById('statAdmin').textContent = stats.admin;
  document.getElementById('statNormal').textContent = stats.normal;
  document.getElementById('statActive').textContent = stats.active;
}

function renderUsers() {
  const tableBody = document.getElementById('userTableBody');
  const emptyState = document.getElementById('emptyState');
  const userCount = document.getElementById('userCount');
  
  // 筛选数据
  let filteredUsers = allUsers;
  if (currentFilter !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.role === currentFilter);
  }
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      (u.id && u.id.toLowerCase().includes(searchLower)) ||
      (u.username && u.username.toLowerCase().includes(searchLower)) ||
      (u.phone && u.phone.toLowerCase().includes(searchLower)) ||
      (u.name && u.name.toLowerCase().includes(searchLower))
    );
  }
  
  // 更新分页信息
  pagination.totalRecords = filteredUsers.length;
  pagination.totalPages = Math.ceil(filteredUsers.length / pagination.pageSize);
  
  // 确保当前页有效
  if (pagination.currentPage > pagination.totalPages) {
    pagination.currentPage = Math.max(1, pagination.totalPages);
  }
  
  if (userCount) userCount.textContent = `共 ${filteredUsers.length} 个用户`;
  
  if (filteredUsers.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';
    renderPagination();
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  
  // 分页截取数据
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const pageUsers = filteredUsers.slice(startIndex, endIndex);
  
  const html = pageUsers.map(user => `
    <tr data-user-id="${user.id}">
      <td>${user.id || '-'}</td>
      <td>${user.username || '-'}</td>
      <td>${user.phone || '-'}</td>
      <td>${user.name || '-'}</td>
      <td><span class="role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}">${user.role === 'ADMIN' ? '管理员' : '普通用户'}</span></td>
      <td><span class="status-badge ${user.status === 1 ? 'active' : 'disabled'}">${user.status === 1 ? '正常' : '禁用'}</span></td>
      <td>${user.createTime ? formatDate(user.createTime) : '-'}</td>
      <td>
        <div class="action-btns">
          ${user.role !== 'ADMIN' ? `
            <button class="action-btn edit" onclick="editUser('${user.id}')">编辑</button>
            <button class="action-btn reset" onclick="showResetPwdModal('${user.id}', '${user.name || user.username}')">重置密码</button>
            <button class="action-btn delete" onclick="confirmDeleteUser('${user.id}', '${user.name || user.username}')">删除</button>
          ` : '<span style="color: #999; font-size: 12px;">不可操作</span>'}
        </div>
      </td>
    </tr>
  `).join('');
  
  if (tableBody) tableBody.innerHTML = html;
  
  // 渲染分页控件
  renderPagination();
}

// 渲染分页控件
function renderPagination() {
  const container = document.getElementById('paginationContainer');
  if (!container) return;
  
  const { currentPage, pageSize, totalRecords, totalPages } = pagination;
  
  if (totalRecords === 0) {
    container.innerHTML = '';
    return;
  }
  
  // 生成页码按钮
  let pageButtons = '';
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // 首页按钮
  pageButtons += `<button class="pagination-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>首页</button>`;
  pageButtons += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
  
  // 页码按钮
  if (startPage > 1) {
    pageButtons += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      pageButtons += `<span class="pagination-ellipsis">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageButtons += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageButtons += `<span class="pagination-ellipsis">...</span>`;
    }
    pageButtons += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }
  
  // 下一页和末页按钮
  pageButtons += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
  pageButtons += `<button class="pagination-btn" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>`;
  
  container.innerHTML = `
    <div class="pagination-wrapper">
      <div class="pagination-info">
        <span class="total-records">共 ${totalRecords} 条记录</span>
        <div class="page-size-selector">
          <label>每页显示</label>
          <select onchange="changePageSize(this.value)">
            <option value="5" ${pageSize === 5 ? 'selected' : ''}>5条</option>
            <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条</option>
            <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条</option>
            <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条</option>
          </select>
        </div>
      </div>
      <div class="pagination-nav">
        ${pageButtons}
      </div>
    </div>
    <div class="pagination-status">第 ${currentPage} 页 / 共 ${totalPages} 页</div>
  `;
}

// 跳转到指定页
function goToPage(page) {
  if (page < 1 || page > pagination.totalPages) return;
  pagination.currentPage = page;
  renderUsers();
}

// 改变每页显示数量
function changePageSize(size) {
  pagination.pageSize = parseInt(size);
  pagination.currentPage = 1;
  renderUsers();
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return dateStr; }
}

function searchUsers() {
  const searchInput = document.getElementById('searchInput');
  currentSearch = searchInput ? searchInput.value.trim() : '';
  pagination.currentPage = 1; // 搜索时重置到第一页
  renderUsers();
}

function filterUsers() {
  const roleFilter = document.getElementById('roleFilter');
  currentFilter = roleFilter ? roleFilter.value : 'all';
  pagination.currentPage = 1; // 筛选时重置到第一页
  renderUsers();
}

function showAddUserModal() {
  const modal = document.getElementById('userModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (modalTitle) modalTitle.textContent = '添加用户';
  if (modalBody) {
    modalBody.innerHTML = `
      <form id="addUserForm">
        <div class="form-row">
          <div class="form-group">
            <label>手机号 *</label>
            <input type="text" id="userPhone" placeholder="请输入手机号" required>
          </div>
          <div class="form-group">
            <label>密码 *</label>
            <input type="password" id="userPassword" placeholder="请输入密码（至少6位）" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="userUsername" placeholder="可选，默认使用手机号">
          </div>
          <div class="form-group">
            <label>姓名</label>
            <input type="text" id="userName" placeholder="可选">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>角色</label>
            <select id="userRole">
              <option value="USER">普通用户</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select id="userStatus">
              <option value="1">正常</option>
              <option value="0">禁用</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="closeUserModal()">取消</button>
          <button type="submit" class="btn-primary">确认添加</button>
        </div>
      </form>
    `;
    document.getElementById('addUserForm').addEventListener('submit', submitAddUser);
  }
  if (modal) modal.style.display = 'flex';
}

async function submitAddUser(e) {
  e.preventDefault();
  const phone = document.getElementById('userPhone').value.trim();
  const password = document.getElementById('userPassword').value;
  const username = document.getElementById('userUsername').value.trim();
  const name = document.getElementById('userName').value.trim();
  const role = document.getElementById('userRole').value;
  const status = parseInt(document.getElementById('userStatus').value);
  
  if (!phone || !password) { showToast('请填写手机号和密码', 'warning'); return; }
  if (password.length < 6) { showToast('密码至少6位', 'warning'); return; }
  
  const userData = { phone, password, role, status };
  if (username) userData.username = username;
  if (name) userData.name = name;
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/user/add', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const result = await response.json();
    if (result.code === 200) {
      showToast('用户添加成功', 'success');
      closeUserModal();
      loadUsers();
    } else {
      showToast('添加失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('添加用户失败:', error);
    showToast('添加用户失败', 'error');
  }
}

function editUser(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) { showToast('用户不存在', 'error'); return; }
  
  const modal = document.getElementById('userModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (modalTitle) modalTitle.textContent = '编辑用户';
  if (modalBody) {
    modalBody.innerHTML = `
      <form id="editUserForm">
        <input type="hidden" id="editUserId" value="${user.id}">
        <div class="form-row">
          <div class="form-group">
            <label>手机号</label>
            <input type="text" id="editPhone" value="${user.phone || ''}">
          </div>
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="editUsername" value="${user.username || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" id="editName" value="${user.name || ''}">
          </div>
          <div class="form-group">
            <label>角色</label>
            <select id="editRole">
              <option value="USER" ${user.role !== 'ADMIN' ? 'selected' : ''}>普通用户</option>
              <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>管理员</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>状态</label>
          <select id="editStatus">
            <option value="1" ${user.status === 1 ? 'selected' : ''}>正常</option>
            <option value="0" ${user.status !== 1 ? 'selected' : ''}>禁用</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="closeUserModal()">取消</button>
          <button type="submit" class="btn-primary">保存修改</button>
        </div>
      </form>
    `;
    document.getElementById('editUserForm').addEventListener('submit', submitEditUser);
  }
  if (modal) modal.style.display = 'flex';
}

async function submitEditUser(e) {
  e.preventDefault();
  const userData = {
    id: document.getElementById('editUserId').value,
    phone: document.getElementById('editPhone').value.trim(),
    username: document.getElementById('editUsername').value.trim(),
    name: document.getElementById('editName').value.trim(),
    role: document.getElementById('editRole').value,
    status: parseInt(document.getElementById('editStatus').value)
  };
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/user/update', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const result = await response.json();
    if (result.code === 200) {
      showToast('用户更新成功', 'success');
      closeUserModal();
      loadUsers();
    } else {
      showToast('更新失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('更新用户失败:', error);
    showToast('更新用户失败', 'error');
  }
}

function showResetPwdModal(userId, userName) {
  const modal = document.getElementById('resetPwdModal');
  document.getElementById('resetUserId').value = userId;
  document.getElementById('resetUserInfo').textContent = `正在为用户 "${userName}" 重置密码`;
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  if (modal) modal.style.display = 'flex';
}

function closeResetPwdModal() {
  const modal = document.getElementById('resetPwdModal');
  if (modal) modal.style.display = 'none';
}

async function submitResetPassword() {
  const userId = document.getElementById('resetUserId').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!newPassword) { showToast('请输入新密码', 'warning'); return; }
  if (newPassword.length < 6) { showToast('密码至少6位', 'warning'); return; }
  if (newPassword !== confirmPassword) { showToast('两次输入的密码不一致', 'warning'); return; }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/user/resetPassword/${userId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword })
    });
    const result = await response.json();
    if (result.code === 200) {
      showToast('密码重置成功', 'success');
      closeResetPwdModal();
    } else {
      showToast('重置失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('重置密码失败:', error);
    showToast('重置密码失败', 'error');
  }
}

function confirmDeleteUser(userId, userName) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmUserId').value = userId;
  document.getElementById('confirmMessage').textContent = `确定要删除用户 "${userName}" 吗? 此操作不可恢复。`;
  if (modal) modal.style.display = 'flex';
}

function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  if (modal) modal.style.display = 'none';
}

async function executeConfirm() {
  const userId = document.getElementById('confirmUserId').value;
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/user/delete/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    if (result.code === 200) {
      showToast('用户删除成功', 'success');
      closeConfirmModal();
      loadUsers();
    } else {
      showToast('删除失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('删除用户失败:', error);
    showToast('删除用户失败', 'error');
  }
}

function closeUserModal() {
  const modal = document.getElementById('userModal');
  if (modal) modal.style.display = 'none';
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
