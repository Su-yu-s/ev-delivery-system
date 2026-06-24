package com.peisong.mapper;

import com.peisong.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户Mapper接口
 */
@Mapper
public interface UserMapper {
    
    /**
     * 根据ID查询用户
     */
    User selectById(String id);
    
    /**
     * 根据用户名查询用户
     */
    User selectByUsername(String username);
    
    /**
     * 根据手机号查询用户
     */
    User selectByPhone(String phone);
    
    /**
     * 查询所有用户
     */
    List<User> selectAll();
    
    /**
     * 根据状态查询用户
     */
    List<User> selectByStatus(String status);
    
    /**
     * 新增用户
     */
    int insert(User user);
    
    /**
     * 更新用户信息
     */
    int update(User user);
    
    /**
     * 更新用户状态
     */
    int updateStatus(@Param("id") String id, @Param("status") String status);
    
    /**
     * 更新用户密码
     */
    int updatePassword(@Param("id") String id, @Param("password") String password);
    
    /**
     * 删除用户
     */
    int delete(String id);
    
    /**
     * 批量删除用户
     */
    int deleteBatch(List<String> ids);
    
    /**
     * 验证用户名和密码
     */
    User authenticate(@Param("username") String username, @Param("password") String password);
    
    /**
     * 验证手机号和密码
     */
    User authenticateByPhone(@Param("phone") String phone, @Param("password") String password);
}