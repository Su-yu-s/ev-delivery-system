/* login.js - 电动汽车物资配送系统登录页面交互功能 */

// 全局变量
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    checkRememberedUser();
    
    // 添加页面加载动画
    addLoadingAnimations();
});

// 初始化页面
function initializePage() {
    // 检查URL参数，显示相应消息
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type');
    
    if (message) {
        showMessage(message, type || 'info');
    }
    
    // 检查是否从注册页面跳转
    const registered = urlParams.get('registered');
    if (registered === 'true') {
        showSuccess('注册成功！请登录您的账户');
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // 实时表单验证
    const loginIdInput = document.getElementById('loginId');
    const passwordInput = document.getElementById('password');
    
    if (loginIdInput) {
        loginIdInput.addEventListener('input', validatePhone);
        loginIdInput.addEventListener('blur', validatePhone);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
        passwordInput.addEventListener('blur', validatePassword);
    }
    
    // 记住我选项
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        rememberMe.addEventListener('change', toggleRememberMe);
    }
    
    // 忘记密码链接
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
    
    // 输入框聚焦效果
    setupInputFocusEffects();
}

// 显示忘记密码页面
function showForgotPassword() {
    const loginContainer = document.getElementById('loginContainer');
    const forgotContainer = document.getElementById('forgotContainer');
    
    if (loginContainer && forgotContainer) {
        loginContainer.style.display = 'none';
        forgotContainer.style.display = 'block';
    }
}

// 显示登录页面
function showLogin() {
    const loginContainer = document.getElementById('loginContainer');
    const forgotContainer = document.getElementById('forgotContainer');
    
    if (loginContainer && forgotContainer) {
        forgotContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    }
}

// 处理忘记密码（弹窗方式，已弃用，保留兼容）
function handleForgotPassword(e) {
    e.preventDefault();
    // 直接调用页面切换方式
    showForgotPassword();
    return;
    
    // 以下为旧的弹窗代码，已不使用
    const modal = document.createElement('div');
    modal.className = 'forgot-password-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>忘记密码</h2>
                <button class="close-btn" onclick="this.closest('.forgot-password-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>如果您忘记了密码，请通过以下方式重置：</p>
                <div class="reset-options">
                    <div class="reset-option">
                        <span class="option-icon">[电话]</span>
                        <div class="option-content">
                            <h4>联系管理员</h4>
                            <p>请联系系统管理员帮助重置密码</p>
                        </div>
                    </div>
                    <div class="reset-option">
                        <span class="option-icon">[邮件]</span>
                        <div class="option-content">
                            <h4>发送邮件</h4>
                            <p>发送邮件到 admin@peisong.com 请求重置</p>
                        </div>
                    </div>
                </div>
                <p class="modal-note">注：为了账户安全，重置密码需要验证身份</p>
            </div>
        </div>
    `;
    
    // 添加样式
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .forgot-password-modal .modal-content {
            background: var(--glass-bg-light, rgba(255,255,255,0.9));
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            animation: slideInUp 0.3s ease;
        }
        .forgot-password-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .forgot-password-modal .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
            color: var(--primary-blue, #0a6cff);
        }
        .forgot-password-modal .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
            padding: 0;
            line-height: 1;
        }
        .forgot-password-modal .close-btn:hover {
            color: #333;
        }
        .forgot-password-modal .modal-body p {
            color: #666;
            margin-bottom: 16px;
            line-height: 1.5;
        }
        .forgot-password-modal .reset-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
        }
        .forgot-password-modal .reset-option {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: rgba(10, 108, 255, 0.05);
            border-radius: 8px;
            border: 1px solid rgba(10, 108, 255, 0.1);
        }
        .forgot-password-modal .option-icon {
            font-size: 1.5rem;
        }
        .forgot-password-modal .option-content h4 {
            margin: 0 0 4px 0;
            font-size: 0.95rem;
            color: #333;
        }
        .forgot-password-modal .option-content p {
            margin: 0;
            font-size: 0.85rem;
            color: #666;
        }
        .forgot-password-modal .modal-note {
            font-size: 0.8rem;
            color: #999;
            font-style: italic;
        }
        @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}

// 检查记住的用户
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        try {
            const userData = JSON.parse(rememberedUser);
            const loginIdInput = document.getElementById('loginId');
            const rememberMe = document.getElementById('rememberMe');
            
            if (loginIdInput && userData.username) {
                loginIdInput.value = userData.username;
            }
            
            if (rememberMe) {
                rememberMe.checked = true;
            }
        } catch (error) {
            console.error('解析记住的用户数据失败:', error);
            localStorage.removeItem('rememberedUser');
        }
    }
}

// 处理登录表单提交
async function handleLoginSubmit(event) {
    event.preventDefault();
    
    // 验证表单
    if (!validateForm()) {
        return;
    }
    
    // 检查登录尝试次数
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        showError('登录尝试次数过多，请稍后再试');
        disableLoginForm();
        return;
    }
    
    const formData = new FormData(event.target);
    const phone = formData.get('loginId').trim();
    const password = formData.get('password');
    
    try {
        showLoading('正在登录...');
        
        // 使用URL编码参数格式发送请求
        const params = new URLSearchParams();
        params.append('phone', phone);
        params.append('password', password);
        
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            // 登录成功 - 新的响应格式包含token和user
            const { token, user: userData } = result.data;
            
            // 保存Token到localStorage
            if (token) {
                localStorage.setItem('authToken', token);
            }
            
            // 同时保存到 sessionStorage 和 localStorage（确保跨页面可用）
            const userDataObj = { user: userData, token: token };
            sessionStorage.setItem('currentUser', JSON.stringify(userDataObj));
            localStorage.setItem('currentUser', JSON.stringify(userDataObj));
            
            handleLoginSuccess(userData);
        } else {
            // 登录失败
            loginAttempts++;
            // 如果是401错误，显示更具体的错误信息
            if (result.code === 401) {
                throw new Error('手机号或密码错误');
            } else {
                throw new Error(result.message || '登录失败');
            }
        }
        
    } catch (error) {
        console.error('登录失败:', error);
        handleLoginFailure(error.message);
    } finally {
        hideLoading();
    }
}

// 处理登录成功
function handleLoginSuccess(userData) {
    // 处理记住我选项
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe && rememberMe.checked) {
        localStorage.setItem('rememberedUser', JSON.stringify({
            username: userData.username,
            timestamp: Date.now()
        }));
    } else {
        localStorage.removeItem('rememberedUser');
    }
    
    // 显示成功消息
    showSuccess(`欢迎回来，${userData.name || userData.username}！`);
    
    // 延迟跳转到首页
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// 处理登录失败
function handleLoginFailure(errorMessage) {
    const remainingAttempts = MAX_LOGIN_ATTEMPTS - loginAttempts;
    const message = `${errorMessage} (剩余尝试次数: ${remainingAttempts})`;
    
    showError(message);
    
    // 添加震动效果
    shakeLoginForm();
    
    // 如果尝试次数过多，禁用表单
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        disableLoginForm();
        showError('账户已被暂时锁定，请30分钟后再试');
    }
}

// 表单验证
function validateForm() {
    let isValid = true;
    clearErrors();
    
    const phone = document.getElementById('loginId').value.trim();
    const password = document.getElementById('password').value;
    
    // 验证手机号
    if (!phone) {
        showFieldError('loginIdError', '请输入手机号');
        isValid = false;
    } else if (!isValidPhone(phone)) {
        showFieldError('loginIdError', '请输入正确的手机号格式');
        isValid = false;
    }
    
    // 验证密码
    if (!password) {
        showFieldError('passwordError', '请输入密码');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('passwordError', '密码至少6个字符');
        isValid = false;
    }
    
    return isValid;
}

// 验证手机号
function validatePhone() {
    const phone = this.value.trim();
    const errorElement = document.getElementById('loginIdError');
    
    if (!phone) {
        hideError('loginIdError');
        return;
    }
    
    if (!isValidPhone(phone)) {
        showFieldError('loginIdError', '请输入正确的手机号格式');
    } else {
        hideError('loginIdError');
    }
}

// 验证手机号格式
function isValidPhone(phone) {
    // 支持13、14、15、16、17、18、19开头的手机号
    const phoneRegex = /^1[0-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// 验证密码
function validatePassword() {
    const password = this.value;
    const errorElement = document.getElementById('passwordError');
    
    if (!password) {
        hideError('passwordError');
        return;
    }
    
    if (password.length < 6) {
        showFieldError('passwordError', '密码至少6个字符');
    } else {
        hideError('passwordError');
        
        // 密码强度检查（可选功能）
        checkPasswordStrength(password);
    }
}

// 检查密码强度
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    if (!strengthIndicator) return;
    
    let strength = 0;
    let message = '';
    let color = '';
    
    // 简单的密码强度检查
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch (strength) {
        case 0:
        case 1:
            message = '密码强度：弱';
            color = 'var(--danger)';
            break;
        case 2:
            message = '密码强度：中';
            color = 'var(--warning)';
            break;
        case 3:
        case 4:
            message = '密码强度：强';
            color = 'var(--success)';
            break;
    }
    
    strengthIndicator.textContent = message;
    strengthIndicator.style.color = color;
    strengthIndicator.style.display = 'block';
}

// 切换记住我选项
function toggleRememberMe() {
    const rememberMe = this.checked;
    
    if (!rememberMe) {
        // 如果取消记住我，清除本地存储
        localStorage.removeItem('rememberedUser');
    }
}

// 设置输入框聚焦效果
function setupInputFocusEffects() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // 添加输入动画
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });
}

// 添加加载动画
function addLoadingAnimations() {
    // 为表单容器添加入场动画
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        loginContainer.classList.add('fade-in-up');
    }
    
    // 为输入框添加序列动画
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${0.2 + index * 0.1}s`;
        group.classList.add('fade-in-up');
    });
    
    // 为按钮添加悬停效果
    const buttons = document.querySelectorAll('.login-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('hover-lift');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('hover-lift');
        });
    });
}

// 显示表单字段错误消息
function showFieldError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // 添加错误样式到对应的输入框
        const inputElement = errorElement.previousElementSibling;
        if (inputElement && inputElement.classList.contains('form-input')) {
            inputElement.classList.add('error');
        }
    }
}

// 隐藏错误消息
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.remove('show');
        
        // 移除错误样式
        const inputElement = errorElement.previousElementSibling;
        if (inputElement && inputElement.classList.contains('form-input')) {
            inputElement.classList.remove('error');
        }
    }
}

// 清除所有错误消息
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.classList.remove('show');
    });
    
    const inputElements = document.querySelectorAll('.form-input');
    inputElements.forEach(input => {
        input.classList.remove('error');
    });
}

// 显示消息
function showMessage(message, type = 'info') {
    // 创建消息容器
    const messageContainer = document.createElement('div');
    messageContainer.className = `${type}-message show`;
    messageContainer.textContent = message;
    messageContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(messageContainer);
    
    setTimeout(() => {
        messageContainer.remove();
    }, 5000);
}

// 显示成功消息
function showSuccess(message) {
    showMessage(message, 'success');
}

// 显示错误消息（全局）
function showError(message) {
    showMessage(message, 'error');
}

// 显示加载状态
function showLoading(message = '加载中...') {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = `<span class="loading"></span>${message}`;
    }
}

// 隐藏加载状态
function hideLoading() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
}

// 震动登录表单
function shakeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }
}

// 禁用登录表单
function disableLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const inputs = loginForm.querySelectorAll('input');
    const button = loginForm.querySelector('button');
    
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    if (button) {
        button.disabled = true;
        button.textContent = '账户已锁定';
    }
}

// 添加CSS动画
// 已移除样式注入，相关样式已迁移到CSS文件中
// const style = document.createElement('style');
// style.textContent = `
//     @keyframes slideInRight {
//         from {
//             transform: translateX(100%);
//             opacity: 0;
//         }
//         to {
//             transform: translateX(0);
//             opacity: 1;
//         }
//     }
//     
//     .shake {
//         animation: shake 0.5s ease-in-out;
//     }
//     
//     @keyframes shake {
//         0%, 100% { transform: translateX(0); }
//         25% { transform: translateX(-10px); }
//         50% { transform: translateX(10px); }
//         75% { transform: translateX(-10px); }
//     }
//     
//     .form-group.focused label {
//         color: var(--primary-light);
//         transform: translateY(-5px);
//         font-size: 0.9rem;
//     }
//     
//     .form-input.has-value {
//         background: rgba(255, 255, 255, 0.15);
//     }
//     
//     #passwordStrength {
//         font-size: 0.8rem;
//         margin-top: 0.5rem;
//         display: none;
//     }
// `;
// 
// document.head.appendChild(style);

// 导出函数供其他脚本使用
window.LoginApp = {
    validateForm,
    handleLoginSubmit,
    showMessage,
    showSuccess,
    showError,
    showForgotPassword,
    showLogin
};

// 确保全局可访问
window.showForgotPassword = showForgotPassword;
window.showLogin = showLogin;