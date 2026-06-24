/* admin-tasks.js - 管理员任务管理页面脚本 */

// 单位里程耗电率 (kWh/km)
const POWER_CONSUMPTION_RATE = 0.2;

// 全局变量
let allTasks = [];
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  checkAdminPermission();
  initializePage();
  setupEventListeners();
});

/**
 * 检查管理员权限
 */
function checkAdminPermission() {
  const userDataStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
  
  if (!userDataStr) {
    showToast('请先登录', 'error');
    setTimeout(() => {
      window.location.href = '/html/login.html';
    }, 1500);
    return;
  }
  
  try {
    const userData = JSON.parse(userDataStr);
    const user = userData.user;
    
    if (!user || user.role !== 'ADMIN') {
      showToast('您没有管理员权限', 'error');
      setTimeout(() => {
        window.location.href = '/html/index.html';
      }, 1500);
      return;
    }
    
    // 更新导航栏用户信息
    updateNavUsername(user.name || user.username || '管理员');
  } catch (error) {
    console.error('解析用户数据失败:', error);
    window.location.href = '/html/login.html';
  }
}

/**
 * 更新导航栏用户名
 */
function updateNavUsername(name) {
  const navUsername = document.getElementById('navUsername');
  if (navUsername) {
    navUsername.textContent = name;
  }
}

/**
 * 初始化页面
 */
async function initializePage() {
  await loadTasks();
  await loadUsers();
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 搜索框回车事件
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchTasks();
      }
    });
  }
  
  // 退出登录
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // 下拉菜单
  const userInfoBtn = document.getElementById('userInfoBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userInfoBtn && userDropdown) {
    userInfoBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function() {
      userDropdown.classList.remove('show');
    });
  }
}

/**
 * 加载任务列表
 */
async function loadTasks() {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const tableBody = document.getElementById('taskTableBody');
  
  if (loadingState) loadingState.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';
  if (tableBody) tableBody.innerHTML = '';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/task/list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      allTasks = result.data || [];
      updateStatistics();
      renderTasks();
    } else {
      showToast('加载任务失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('加载任务列表失败:', error);
    showToast('加载任务列表失败', 'error');
  } finally {
    if (loadingState) loadingState.style.display = 'none';
  }
}

/**
 * 加载用户列表（用于任务分配）
 */
async function loadUsers() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/user/list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      allUsers = result.data || [];
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
}

/**
 * 更新统计数据
 */
function updateStatistics() {
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === '待配送').length,
    active: allTasks.filter(t => t.status === '配送中').length,
    completed: allTasks.filter(t => t.status === '配送完成').length
  };
  
  document.getElementById('statTotal').textContent = stats.total;
  document.getElementById('statPending').textContent = stats.pending;
  document.getElementById('statActive').textContent = stats.active;
  document.getElementById('statCompleted').textContent = stats.completed;
}

/**
 * 渲染任务列表
 */
function renderTasks() {
  const tableBody = document.getElementById('taskTableBody');
  const emptyState = document.getElementById('emptyState');
  const taskCount = document.getElementById('taskCount');
  
  // 筛选和搜索
  let filteredTasks = allTasks;
  
  if (currentFilter !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === currentFilter);
  }
  
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      (t.id && t.id.toLowerCase().includes(searchLower)) ||
      (t.startAddr && t.startAddr.toLowerCase().includes(searchLower)) ||
      (t.endAddr && t.endAddr.toLowerCase().includes(searchLower)) ||
      (t.userId && t.userId.toLowerCase().includes(searchLower))
    );
  }
  
  // 更新分页信息
  pagination.totalRecords = filteredTasks.length;
  pagination.totalPages = Math.ceil(filteredTasks.length / pagination.pageSize);
  
  // 确保当前页有效
  if (pagination.currentPage > pagination.totalPages) {
    pagination.currentPage = Math.max(1, pagination.totalPages);
  }
  
  // 更新任务数量
  if (taskCount) {
    taskCount.textContent = `共 ${filteredTasks.length} 条任务`;
  }
  
  // 空状态
  if (filteredTasks.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';
    renderPagination();
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  // 分页截取数据
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const pageTasks = filteredTasks.slice(startIndex, endIndex);
  
  // 渲染表格
  const html = pageTasks.map(task => {
    const statusClass = getStatusClass(task.status);
    const userName = getUserName(task.userId);
    
    return `
      <tr data-task-id="${task.id}">
        <td>${task.id || '-'}</td>
        <td class="address-cell" title="${task.startAddr || ''}">${task.startAddr || '-'}</td>
        <td class="address-cell" title="${task.endAddr || ''}">${task.endAddr || '-'}</td>
        <td>${task.mileage ? task.mileage.toFixed(1) + ' km' : '-'}</td>
        <td>${task.time !== undefined && task.time !== null ? formatDuration(task.time) : '-'}</td>
        <td>${task.energy !== undefined && task.energy !== null ? task.energy.toFixed(1) + ' %' : '-'}</td>
        <td><span class="status-badge ${statusClass}">${task.status || '-'}</span></td>
        <td>${userName ? `<span class="user-badge">${userName}</span>` : '<span class="user-badge unassigned">未分配</span>'}</td>
        <td>${task.createTime ? formatDate(task.createTime) : '-'}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" onclick="viewTask('${task.id}')">查看</button>
            <button class="action-btn edit" onclick="editTask('${task.id}')">编辑</button>
            <button class="action-btn assign" onclick="showAssignModal('${task.id}')">分配</button>
            ${task.status !== '配送中' ? `<button class="action-btn delete" onclick="confirmDeleteTask('${task.id}')">删除</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
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
  
  pageButtons += `<button class="pagination-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>首页</button>`;
  pageButtons += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
  
  if (startPage > 1) {
    pageButtons += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) pageButtons += `<span class="pagination-ellipsis">...</span>`;
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageButtons += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pageButtons += `<span class="pagination-ellipsis">...</span>`;
    pageButtons += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }
  
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
      <div class="pagination-nav">${pageButtons}</div>
    </div>
    <div class="pagination-status">第 ${currentPage} 页 / 共 ${totalPages} 页</div>
  `;
}

function goToPage(page) {
  if (page < 1 || page > pagination.totalPages) return;
  pagination.currentPage = page;
  renderTasks();
}

function changePageSize(size) {
  pagination.pageSize = parseInt(size);
  pagination.currentPage = 1;
  renderTasks();
}

/**
 * 获取状态样式类
 */
function getStatusClass(status) {
  switch (status) {
    case '待配送': return 'pending';
    case '配送中': return 'active';
    case '配送完成': return 'completed';
    default: return '';
  }
}

/**
 * 获取用户名称
 */
function getUserName(userId) {
  if (!userId) return null;
  const user = allUsers.find(u => u.id === userId);
  return user ? (user.name || user.username || userId) : userId;
}

/**
 * 格式化时间
 */
function formatDuration(minutes) {
  if (!minutes) return '-';
  if (minutes < 60) return `${Math.round(minutes)} 分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours} 小时 ${mins} 分钟`;
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * 搜索任务
 */
function searchTasks() {
  const searchInput = document.getElementById('searchInput');
  currentSearch = searchInput ? searchInput.value.trim() : '';
  pagination.currentPage = 1;
  renderTasks();
}

/**
 * 筛选任务
 */
function filterTasks() {
  const statusFilter = document.getElementById('statusFilter');
  currentFilter = statusFilter ? statusFilter.value : 'all';
  pagination.currentPage = 1;
  renderTasks();
}

/**
 * 显示新建任务弹窗
 */
function showAddTaskModal() {
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (modalTitle) modalTitle.textContent = '新建配送任务';
  if (modalBody) {
    modalBody.innerHTML = `
      <form id="addTaskForm">
        <div class="form-row">
          <div class="form-group">
            <label>起点地址 *</label>
            <input type="text" id="taskStartAddr" placeholder="请输入起点地址" required>
          </div>
          <div class="form-group">
            <label>终点地址 *</label>
            <input type="text" id="taskEndAddr" placeholder="请输入终点地址" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>预计里程 (km)</label>
            <input type="number" id="taskMileage" placeholder="系统自动计算" step="0.1" min="0" readonly>
            <small class="help-text">输入地址后自动计算</small>
          </div>
          <div class="form-group">
            <label>预计耗电 (kWh)</label>
            <input type="number" id="taskPowerUsage" placeholder="系统自动计算" step="0.1" min="0" readonly>
            <small class="help-text">基于里程自动估算</small>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>任务状态</label>
            <select id="taskStatus">
              <option value="待配送">待配送</option>
              <option value="配送中">配送中</option>
              <option value="配送完成">已完成</option>
            </select>
          </div>
          <div class="form-group">
            <label>分配用户</label>
            <select id="taskUserId">
              <option value="">-- 不分配 --</option>
              ${allUsers.filter(u => u.role !== 'ADMIN').map(u => 
                `<option value="${u.id}">${u.name || u.username} (${u.phone || u.id})</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea id="taskRemark" placeholder="可选备注信息" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="closeTaskModal()">取消</button>
          <button type="submit" class="btn-primary">创建任务</button>
        </div>
      </form>
    `;
    
    // 添加地址输入事件监听器，用于自动计算里程
    const startAddrInput = document.getElementById('taskStartAddr');
    const endAddrInput = document.getElementById('taskEndAddr');
    
    if (startAddrInput && endAddrInput) {
      const calculateRoute = async () => {
        const startAddr = startAddrInput.value.trim();
        const endAddr = endAddrInput.value.trim();
        
        if (startAddr && endAddr) {
          try {
            // 显示加载状态
            const mileageInput = document.getElementById('taskMileage');
            const powerUsageInput = document.getElementById('taskPowerUsage');
            
            if (mileageInput) {
              mileageInput.placeholder = '计算中...';
              mileageInput.value = '';
            }
            if (powerUsageInput) {
              powerUsageInput.placeholder = '计算中...';
              powerUsageInput.value = '';
            }
            
            // 调用后端路线规划API
            const token = localStorage.getItem('authToken');
            // 确保中文字符正确编码
            const response = await fetch('/api/route/calculate', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=UTF-8'
              },
              body: JSON.stringify({
                startAddr: encodeURIComponent(startAddr),
                endAddr: encodeURIComponent(endAddr)
              })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
              const distance = result.data.distance; // 公里
              const duration = result.data.duration; // 分钟
              
              // 基于距离估算耗电量
              const powerUsage = distance * POWER_CONSUMPTION_RATE;
              
              if (mileageInput) {
                mileageInput.value = distance.toFixed(2);
                mileageInput.placeholder = '系统自动计算';
              }
              if (powerUsageInput) {
                powerUsageInput.value = powerUsage.toFixed(2);
                powerUsageInput.placeholder = '系统自动计算';
              }
              
              // 保存时间信息到全局变量，供提交任务时使用
              window.adminLastCalculatedDuration = duration;
              
              showToast('路线信息已自动计算', 'success');
            } else {
              showToast('路线计算失败: ' + (result.message || '地址可能无效'), 'error');
              if (mileageInput) mileageInput.placeholder = '系统自动计算';
              if (powerUsageInput) powerUsageInput.placeholder = '系统自动计算';
            }
          } catch (error) {
            console.error('路线计算失败:', error);
            showToast('路线计算失败，请检查地址格式', 'error');
            const mileageInput = document.getElementById('taskMileage');
            const powerUsageInput = document.getElementById('taskPowerUsage');
            if (mileageInput) mileageInput.placeholder = '系统自动计算';
            if (powerUsageInput) powerUsageInput.placeholder = '系统自动计算';
          }
        }
      };
      
      // 添加防抖功能
      let timeoutId;
      const debouncedCalculateRoute = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(calculateRoute, 500); // 500ms 防抖
      };
      
      startAddrInput.addEventListener('input', debouncedCalculateRoute);
      endAddrInput.addEventListener('input', debouncedCalculateRoute);
    }
    
    // 绑定表单提交
    document.getElementById('addTaskForm').addEventListener('submit', submitAddTask);
  }
  
  if (modal) modal.style.display = 'flex';
}

/**
 * 提交新建任务
 */
async function submitAddTask(e) {
  e.preventDefault();
  
  const startAddr = document.getElementById('taskStartAddr').value.trim();
  const endAddr = document.getElementById('taskEndAddr').value.trim();
  const mileage = document.getElementById('taskMileage').value;
  const powerUsage = document.getElementById('taskPowerUsage').value;
  const status = document.getElementById('taskStatus').value;
  const userId = document.getElementById('taskUserId').value;
  const remark = document.getElementById('taskRemark').value.trim();
  
  if (!startAddr || !endAddr) {
    showToast('请填写起点和终点地址', 'warning');
    return;
  }
  
  const taskData = {
    startAddr,
    endAddr,
    status,
    itinerary: `${startAddr} -> ${endAddr}`
  };
  
  if (mileage) taskData.mileage = parseFloat(mileage);
  if (powerUsage) taskData.energy = parseFloat(powerUsage);
  if (window.adminLastCalculatedDuration) taskData.time = parseInt(window.adminLastCalculatedDuration);
  if (userId) taskData.userId = userId;
  if (remark) taskData.remark = remark;
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/task/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      showToast('任务创建成功', 'success');
      closeTaskModal();
      loadTasks();
    } else {
      showToast('创建失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('创建任务失败:', error);
    showToast('创建任务失败', 'error');
  }
}

/**
 * 查看任务详情
 */
async function viewTask(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) {
    showToast('任务不存在', 'error');
    return;
  }
  
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  const userName = getUserName(task.userId);
  
  if (modalTitle) modalTitle.textContent = '任务详情';
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="task-detail">
        <div class="detail-row">
          <div class="detail-item">
            <label>任务ID</label>
            <div class="value">${task.id || '-'}</div>
          </div>
          <div class="detail-item">
            <label>状态</label>
            <div class="value"><span class="status-badge ${getStatusClass(task.status)}">${task.status || '-'}</span></div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item detail-full">
            <label>起点地址</label>
            <div class="value">${task.startAddr || '-'}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item detail-full">
            <label>终点地址</label>
            <div class="value">${task.endAddr || '-'}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>预计里程</label>
            <div class="value">${task.mileage ? task.mileage.toFixed(1) + ' km' : '-'}</div>
          </div>
          <div class="detail-item">
            <label>预计时间</label>
            <div class="value">${task.time !== undefined && task.time !== null ? formatDuration(task.time) : '-'}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>预计耗电</label>
            <div class="value">${task.energy !== undefined && task.energy !== null ? task.energy.toFixed(1) + ' %' : '-'}</div>
          </div>
          <div class="detail-item">
            <label>分配用户</label>
            <div class="value">${userName || '<span style="color: #999;">未分配</span>'}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>创建时间</label>
            <div class="value">${task.createTime ? formatDate(task.createTime) : '-'}</div>
          </div>
          <div class="detail-item">
            <label>更新时间</label>
            <div class="value">${task.updateTime ? formatDate(task.updateTime) : '-'}</div>
          </div>
        </div>
        ${task.remark ? `
        <div class="detail-row">
          <div class="detail-item detail-full">
            <label>备注</label>
            <div class="value">${task.remark}</div>
          </div>
        </div>
        ` : ''}
      </div>
      <div class="form-actions">
        <button class="btn-secondary" onclick="closeTaskModal()">关闭</button>
        <button class="btn-primary" onclick="editTask('${task.id}')">编辑</button>
      </div>
    `;
  }
  
  if (modal) modal.style.display = 'flex';
}

/**
 * 编辑任务
 */
function editTask(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) {
    showToast('任务不存在', 'error');
    return;
  }
  
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (modalTitle) modalTitle.textContent = '编辑任务';
  if (modalBody) {
    modalBody.innerHTML = `
      <form id="editTaskForm">
        <input type="hidden" id="editTaskId" value="${task.id}">
        <div class="form-row">
          <div class="form-group">
            <label>起点地址 *</label>
            <input type="text" id="editStartAddr" value="${task.startAddr || ''}" required>
          </div>
          <div class="form-group">
            <label>终点地址 *</label>
            <input type="text" id="editEndAddr" value="${task.endAddr || ''}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>预计里程 (km)</label>
            <input type="number" id="editMileage" value="${task.mileage || ''}" step="0.1" min="0">
          </div>
          <div class="form-group">
            <label>预计耗电 (%)</label>
            <input type="number" id="editPowerUsage" value="${task.energy || ''}" step="0.1" min="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>任务状态</label>
            <select id="editStatus">
              <option value="待配送" ${task.status === '待配送' ? 'selected' : ''}>待配送</option>
              <option value="配送中" ${task.status === '配送中' ? 'selected' : ''}>配送中</option>
              <option value="配送完成" ${task.status === '配送完成' ? 'selected' : ''}>已完成</option>
            </select>
          </div>
          <div class="form-group">
            <label>分配用户</label>
            <select id="editUserId">
              <option value="">-- 不分配 --</option>
              ${allUsers.filter(u => u.role !== 'ADMIN').map(u => 
                `<option value="${u.id}" ${task.userId === u.id ? 'selected' : ''}>${u.name || u.username} (${u.phone || u.id})</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea id="editRemark" rows="3">${task.remark || ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="closeTaskModal()">取消</button>
          <button type="submit" class="btn-primary">保存修改</button>
        </div>
      </form>
    `;
    
    document.getElementById('editTaskForm').addEventListener('submit', submitEditTask);
  }
  
  if (modal) modal.style.display = 'flex';
}

/**
 * 提交编辑任务
 */
async function submitEditTask(e) {
  e.preventDefault();
  
  const taskId = document.getElementById('editTaskId').value;
  const startAddr = document.getElementById('editStartAddr').value.trim();
  const endAddr = document.getElementById('editEndAddr').value.trim();
  const mileage = document.getElementById('editMileage').value;
  const powerUsage = document.getElementById('editPowerUsage').value;
  const status = document.getElementById('editStatus').value;
  const userId = document.getElementById('editUserId').value;
  const remark = document.getElementById('editRemark').value.trim();
  
  if (!startAddr || !endAddr) {
    showToast('请填写起点和终点地址', 'warning');
    return;
  }
  
  const taskData = {
    id: taskId,
    startAddr,
    endAddr,
    status,
    itinerary: `${startAddr} -> ${endAddr}`,
    userId: userId || null,
    remark: remark || null
  };
  
  if (mileage !== undefined && mileage !== null && mileage !== '') taskData.mileage = parseFloat(mileage);
  if (powerUsage !== undefined && powerUsage !== null && powerUsage !== '') taskData.energy = parseFloat(powerUsage);
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/task/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      showToast('任务更新成功', 'success');
      closeTaskModal();
      loadTasks();
    } else {
      showToast('更新失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('更新任务失败:', error);
    showToast('更新任务失败', 'error');
  }
}

/**
 * 显示分配用户弹窗
 */
function showAssignModal(taskId) {
  const modal = document.getElementById('assignModal');
  const taskIdInput = document.getElementById('assignTaskId');
  const userSelect = document.getElementById('assignUserSelect');
  
  if (taskIdInput) taskIdInput.value = taskId;
  
  if (userSelect) {
    const task = allTasks.find(t => t.id === taskId);
    userSelect.innerHTML = `
      <option value="">-- 请选择用户 --</option>
      ${allUsers.filter(u => u.role !== 'ADMIN').map(u => 
        `<option value="${u.id}" ${task && task.userId === u.id ? 'selected' : ''}>${u.name || u.username} (${u.phone || u.id})</option>`
      ).join('')}
    `;
  }
  
  if (modal) modal.style.display = 'flex';
}

/**
 * 关闭分配弹窗
 */
function closeAssignModal() {
  const modal = document.getElementById('assignModal');
  if (modal) modal.style.display = 'none';
}

/**
 * 提交任务分配
 */
async function submitAssignTask() {
  const taskId = document.getElementById('assignTaskId').value;
  const userId = document.getElementById('assignUserSelect').value;
  
  if (!userId) {
    showToast('请选择要分配的用户', 'warning');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/task/assign?taskId=${taskId}&userId=${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      showToast('任务分配成功', 'success');
      closeAssignModal();
      loadTasks();
    } else {
      showToast('分配失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('分配任务失败:', error);
    showToast('分配任务失败', 'error');
  }
}

/**
 * 确认删除任务
 */
function confirmDeleteTask(taskId) {
  const modal = document.getElementById('confirmModal');
  const taskIdInput = document.getElementById('confirmTaskId');
  const message = document.getElementById('confirmMessage');
  
  if (taskIdInput) taskIdInput.value = taskId;
  if (message) message.textContent = `确定要删除任务 ${taskId} 吗? 此操作不可恢复。`;
  
  if (modal) modal.style.display = 'flex';
}

/**
 * 关闭确认弹窗
 */
function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  if (modal) modal.style.display = 'none';
}

/**
 * 执行删除操作
 */
async function executeConfirm() {
  const taskId = document.getElementById('confirmTaskId').value;
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/task/delete/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      showToast('任务删除成功', 'success');
      closeConfirmModal();
      loadTasks();
    } else {
      showToast('删除失败: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    showToast('删除任务失败', 'error');
  }
}

/**
 * 关闭任务弹窗
 */
function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  if (modal) modal.style.display = 'none';
}

/**
 * 显示 Toast 消息
 */
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

/**
 * 退出登录
 */
function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
  showToast('已退出登录', 'info');
  setTimeout(() => {
    window.location.href = '/html/login.html';
  }, 1000);
}

/**
 * 跳转到用户管理（通过首页弹窗）
 */
function goToUserManagement() {
  window.location.href = '/html/index.html?adminPanel=users';
}

/**
 * 跳转到数据看板（通过首页弹窗）
 */
function goToDashboard() {
  window.location.href = '/html/index.html?adminPanel=dashboard';
}
