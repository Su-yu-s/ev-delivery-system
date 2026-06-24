package com.peisong.service;

import com.peisong.entity.User;

import java.util.List;

/**
 * 用户服务接口
 */
public interface UserService {
    
    /**
     * 根据ID查询用户
     */
    User getById(String id);
    
    /**
     * 根据用户名查询用户
     */
    User getByUsername(String username);
    
    /**
     * 根据手机号查询用户
     */
    User getByPhone(String phone);
    
    /**
     * 查询所有用户
     */
    List<User> getAll();
    
    /**
     * 根据状态查询用户
     */
    List<User> getByStatus(String status);
    
    /**
     * 用户注册
     */
    boolean register(User user);
    
    /**
     * 用户登录（手机号+密码）
     */
    User login(String phone, String password);
    
    /**
     * 更新用户信息
     */
    boolean update(User user);
    
    /**
     * 更新用户状态
     */
    boolean updateStatus(String id, String status);
    
    /**
     * 更新用户密码（需验证旧密码）
     */
    boolean updatePassword(String id, String oldPassword, String newPassword);
    
    /**
     * 更新用户密码（管理员重置，不验证旧密码）
     */
    boolean updatePassword(String id, String newPassword);
    
    /**
     * 删除用户
     */
    boolean delete(String id);
    
    /**
     * 批量删除用户
     */
    boolean deleteBatch(List<String> ids);
    
    /**
     * 验证用户名是否已存在
     */
    boolean isUsernameExists(String username);
    
    /**
     * 验证手机号是否已存在
     */
    boolean isPhoneExists(String phone);
}