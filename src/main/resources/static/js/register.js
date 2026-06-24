// 注册页面JavaScript功能

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('注册页面初始化完成');
    
    // 添加表单交互效果
    addFormInteractions();
    
    // 添加输入框焦点效果
    addInputFocusEffects();
});

// 表单验证和提交逻辑
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 清除之前的错误信息
    clearErrors();
    
    // 获取表单数据
    const formData = {
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // 验证表单
    if (!validateForm(formData)) {
        return;
    }
    
    // 提交表单
    submitForm(formData);
});

// 表单验证函数
function validateForm(data) {
    let isValid = true;
    
    // 验证手机号
    if (!data.phone) {
        showError('phoneError', '请输入手机号');
        isValid = false;
    } else if (!/^1[0-9]\d{9}$/.test(data.phone)) {
        showError('phoneError', '请输入正确的手机号');
        isValid = false;
    }
    
    // 验证密码
    if (!data.password) {
        showError('passwordError', '请输入密码');
        isValid = false;
    } else if (data.password.length < 6) {
        showError('passwordError', '密码至少6个字符');
        isValid = false;
    }
    
    // 验证确认密码
    if (!data.confirmPassword) {
        showError('confirmPasswordError', '请确认密码');
        isValid = false;
    } else if (data.password !== data.confirmPassword) {
        showError('confirmPasswordError', '两次输入的密码不一致');
        isValid = false;
    }
    
    return isValid;
}

// 显示错误信息
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(elementId.replace('Error', ''));
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    inputElement.classList.add('error');
    
    // 添加错误动画效果
    inputElement.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        inputElement.style.animation = '';
    }, 500);
}

// 清除错误信息
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('input');
    
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
    
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

// 提交表单
async function submitForm(formData) {
    const btn = document.getElementById('registerBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    
    // 显示加载状态
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    // 添加加载动画
    btn.style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
    
    try {
        const response = await fetch('/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: formData.phone,
                password: formData.password
            })
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            // 注册成功
            showSuccessMessage();
            
            // 添加成功动画
            const successMessage = document.getElementById('successMessage');
            successMessage.style.animation = 'fadeInUp 0.6s ease-out';
            
            // 3秒后跳转到登录页面
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            // 注册失败
            showError('phoneError', result.message || '注册失败，请重试');
            
            // 恢复按钮状态
            resetButtonState(btn, btnText, btnLoading);
        }
    } catch (error) {
        console.error('注册失败:', error);
        showError('phoneError', '网络错误，请检查网络连接后重试');
        
        // 恢复按钮状态
        resetButtonState(btn, btnText, btnLoading);
    }
}

// 显示成功消息
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // 添加成功图标动画
    successMessage.innerHTML = '✅ ' + successMessage.innerHTML;
}

// 恢复按钮状态
function resetButtonState(btn, btnText, btnLoading) {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    btn.style.background = 'var(--gradient-primary)';
}

// 实时验证手机号是否已存在
document.getElementById('phone').addEventListener('blur', async function() {
    const phone = this.value.trim();
    if (phone && /^1[0-9]\d{9}$/.test(phone)) {
        try {
            const response = await fetch(`/api/user/checkPhone/${phone}`);
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                showError('phoneError', '手机号已存在');
            }
        } catch (error) {
            console.error('检查手机号失败:', error);
        }
    }
});

// 添加表单交互效果
function addFormInteractions() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // 输入时实时验证
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                const errorId = this.id + 'Error';
                const errorElement = document.getElementById(errorId);
                if (errorElement) {
                    errorElement.style.display = 'none';
                    this.classList.remove('error');
                }
            }
        });
        
        // 添加输入框动画效果
        input.addEventListener('focus', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// 添加输入框焦点效果
function addInputFocusEffects() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input');
        const label = group.querySelector('label');
        
        if (input && label) {
            input.addEventListener('focus', function() {
                label.style.color = 'var(--primary)';
                label.style.transform = 'translateY(-5px)';
                label.style.fontSize = '0.9rem';
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    label.style.color = 'var(--dark)';
                    label.style.transform = 'translateY(0)';
                    label.style.fontSize = '1rem';
                }
            });
        }
    });
}

// 添加摇动动画
// 已移除样式注入，相关样式已迁移到CSS文件中
// const style = document.createElement('style');
// style.textContent = `
//     @keyframes shake {
//         0%, 100% { transform: translateX(0); }
//         25% { transform: translateX(-5px); }
//         75% { transform: translateX(5px); }
//     }
//     
//     @keyframes fadeInUp {
//         from {
//             opacity: 0;
//             transform: translateY(20px);
//         }
//         to {
//             opacity: 1;
//             transform: translateY(0);
//         }
//     }
// `;
// document.head.appendChild(style);

// 回车键提交表单
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('registerForm').dispatchEvent(new Event('submit'));
    }
});

// 页面加载动画
window.addEventListener('load', function() {
    const container = document.querySelector('.register-container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.6s ease-out';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
});