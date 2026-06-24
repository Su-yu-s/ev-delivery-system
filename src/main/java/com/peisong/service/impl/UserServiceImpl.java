package com.peisong.service.impl;

import com.peisong.entity.User;
import com.peisong.mapper.UserMapper;
import com.peisong.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public User getById(String id) {
        return userMapper.selectById(id);
    }
    
    @Override
    public User getByUsername(String username) {
        return userMapper.selectByUsername(username);
    }
    
    @Override
    public User getByPhone(String phone) {
        return userMapper.selectByPhone(phone);
    }
    
    @Override
    public List<User> getAll() {
        return userMapper.selectAll();
    }
    
    @Override
    public List<User> getByStatus(String status) {
        return userMapper.selectByStatus(status);
    }
    
    @Override
    @Transactional
    public boolean register(User user) {
        // 验证必填字段
        if (!StringUtils.hasText(user.getUsername()) || 
            !StringUtils.hasText(user.getPhone()) || 
            !StringUtils.hasText(user.getPassword())) {
            return false;
        }
        
        // 验证用户名和手机号是否已存在
        if (isUsernameExists(user.getUsername())) {
            return false;
        }
        
        if (isPhoneExists(user.getPhone())) {
            return false;
        }
        
        // 生成唯一ID（统一格式：USER_ + 8位数字）
        if (user.getId() == null) {
            user.setId(generateUserId());
        }
        
        // 设置默认状态为正常（1）- status字段在XML中直接设置为1
        // 所以这里不需要设置
        
        // 设置默认角色为普通用户
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        
        // 对密码进行BCrypt加密
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        
        return userMapper.insert(user) > 0;
    }
    
    @Override
    public User login(String phone, String password) {
        if (!StringUtils.hasText(phone) || !StringUtils.hasText(password)) {
            return null;
        }
        
        // 验证手机号格式
        if (!phone.matches("^1[0-9]\\d{9}$")) {
            return null;
        }
        
        // 根据手机号查找用户
        User user = userMapper.selectByPhone(phone);
        if (user == null) {
            return null;
        }
        
        // 检查用户状态
        if (user.getStatus() == null || user.getStatus() != 1) {
            return null;
        }
        
        // 密码验证：直接比对明文密码的MD5值
        String md5Password = md5(password);
        boolean passwordMatch = md5Password.equals(user.getPassword());
        
        return passwordMatch ? user : null;
    }
    
    @Override
    @Transactional
    public boolean update(User user) {
        if (user == null || user.getId() == null) {
            return false;
        }
        
        // 验证用户名和手机号是否与其他用户冲突
        User existingUser = userMapper.selectById(user.getId());
        if (existingUser == null) {
            return false;
        }
        
        if (!existingUser.getUsername().equals(user.getUsername())) {
            if (isUsernameExists(user.getUsername())) {
                return false;
            }
        }
        
        if (!existingUser.getPhone().equals(user.getPhone())) {
            if (isPhoneExists(user.getPhone())) {
                return false;
            }
        }
        
        return userMapper.update(user) > 0;
    }
    
    @Override
    @Transactional
    public boolean updateStatus(String id, String status) {
        return userMapper.updateStatus(id, status) > 0;
    }
    
    @Override
    @Transactional
    public boolean updatePassword(String id, String oldPassword, String newPassword) {
        if (!StringUtils.hasText(newPassword)) {
            return false;
        }
        
        // 获取用户信息
        User user = userMapper.selectById(id);
        if (user == null) {
            return false;
        }
        
        // 验证旧密码
        boolean oldPasswordMatch = false;
        try {
            oldPasswordMatch = passwordEncoder.matches(oldPassword, user.getPassword());
        } catch (Exception e) {
            // BCrypt验证失败，尝试MD5
        }
        
        if (!oldPasswordMatch) {
            // 尝试MD5验证
            String md5OldPassword = md5(oldPassword);
            oldPasswordMatch = md5OldPassword.equals(user.getPassword());
        }
        
        if (!oldPasswordMatch) {
            return false; // 旧密码不正确
        }
        
        // 对新密码进行BCrypt加密
        String encryptedPassword = passwordEncoder.encode(newPassword);
        return userMapper.updatePassword(id, encryptedPassword) > 0;
    }
    
    @Override
    @Transactional
    public boolean updatePassword(String id, String newPassword) {
        // 这个方法保留为管理员重置密码使用
        if (!StringUtils.hasText(newPassword)) {
            return false;
        }
        
        // 对密码进行BCrypt加密
        String encryptedPassword = passwordEncoder.encode(newPassword);
        return userMapper.updatePassword(id, encryptedPassword) > 0;
    }
    
    @Override
    @Transactional
    public boolean delete(String id) {
        return userMapper.delete(id) > 0;
    }
    
    @Override
    @Transactional
    public boolean deleteBatch(List<String> ids) {
        return userMapper.deleteBatch(ids) > 0;
    }
    
    @Override
    public boolean isUsernameExists(String username) {
        User user = userMapper.selectByUsername(username);
        return user != null;
    }
    
    @Override
    public boolean isPhoneExists(String phone) {
        User user = userMapper.selectByPhone(phone);
        return user != null;
    }
    
    /**
     * 生成用户ID（统一格式：USER + 3位数字）
     */
    private String generateUserId() {
        // 查询当前最大用户ID
        List<User> allUsers = userMapper.selectAll();
        int maxId = 0;
        
        for (User user : allUsers) {
            if (user.getId() != null && user.getId().startsWith("USER")) {
                try {
                    // 提取数字部分（支持USER001和USER_00000001两种格式）
                    String numberPart = user.getId().replace("USER", "").replace("_", "");
                    if (numberPart.matches("^\\d+$")) {
                        int currentId = Integer.parseInt(numberPart);
                        if (currentId > maxId) {
                            maxId = currentId;
                        }
                    }
                } catch (NumberFormatException e) {
                    // 忽略格式不正确的ID
                }
            }
        }
        
        // 生成新的用户ID（从最大ID+1开始）
        int newId = maxId + 1;
        return String.format("USER%03d", newId);
    }
    
    /**
     * MD5加密方法
     */
    private String md5(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5加密失败", e);
        }
    }
}