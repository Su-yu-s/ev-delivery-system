package com.peisong.controller;

import com.peisong.entity.Response;
import com.peisong.entity.User;
import com.peisong.service.UserService;
import com.peisong.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户Controller
 */
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 调试接口：记录前端存储状态
     */
    @PostMapping("/debug/storage")
    public Response<Boolean> debugStorage(@RequestBody java.util.Map<String, String> data) {
        System.out.println("========== [Profile Debug] 前端存储状态 ==========");
        System.out.println("sessionStorage: " + data.get("sessionStorage"));
        System.out.println("localStorage: " + data.get("localStorage"));
        System.out.println("=================================================");
        return Response.success(true);
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Response<Boolean> register(@RequestBody User user) {
        // 参数验证
        if (user == null || user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            return Response.fail(400, "手机号不能为空");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return Response.fail(400, "密码不能为空");
        }
        
        // 手机号格式验证
        if (!user.getPhone().matches("^1[0-9]\\d{9}$")) {
            return Response.fail(400, "手机号格式不正确");
        }
        
        // 密码强度验证
        if (user.getPassword().length() < 6) {
            return Response.fail(400, "密码长度不能少于6个字符");
        }
        
        // 自动生成用户名（使用手机号作为用户名）
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            user.setUsername(user.getPhone());
        }
        
        // 自动生成姓名（使用"用户"+手机号后4位）
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            user.setName("用户" + user.getPhone().substring(user.getPhone().length() - 4));
        }
        
        boolean result = userService.register(user);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("注册成功");
            return response;
        } else {
            return Response.fail(400, "注册失败，手机号已存在");
        }
    }
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Response<?> login(@RequestParam String phone, @RequestParam String password) {
        // 参数验证
        if (phone == null || phone.trim().isEmpty()) {
            return Response.fail(400, "手机号不能为空");
        }
        if (password == null || password.trim().isEmpty()) {
            return Response.fail(400, "密码不能为空");
        }
        
        // 手机号格式验证
        if (!phone.matches("^1[0-9]\\d{9}$")) {
            return Response.fail(400, "手机号格式不正确");
        }
        
        // 防止SQL注入攻击 - 基本字符过滤
        if (phone.contains("'") || phone.contains("\"") || phone.contains(";")) {
            return Response.fail(400, "手机号包含非法字符");
        }
        
        User user = userService.login(phone, password);
        if (user != null) {
            // 不返回密码信息
            user.setPassword(null);
            
            // 生成JWT Token（如果失败则跳过）
            String token = null;
            try {
                token = jwtUtil.generateToken(
                    user.getId(), 
                    user.getUsername(), 
                    user.getRole() != null ? user.getRole() : "USER"
                );
            } catch (Exception e) {
                // JWT生成失败，不影响登录
            }
            
            // 构建返回数据
            Map<String, Object> data = new HashMap<>();
            if (token != null) {
                data.put("token", token);
            }
            data.put("user", user);
            
            Response<Map<String, Object>> response = Response.success(data);
            response.setMessage("登录成功");
            return response;
        } else {
            return Response.fail(401, "登录失败，手机号或密码错误");
        }
    }
    
    /**
     * 根据ID获取用户信息
     */
    @GetMapping("/get/{id}")
    public Response<User> getById(@PathVariable String id) {
        // 参数验证
        if (id == null || id.trim().isEmpty()) {
            return Response.fail(400, "用户ID不能为空");
        }
        
        User user = userService.getById(id);
        if (user != null) {
            // 不返回密码信息
            user.setPassword(null);
            return Response.success(user);
        } else {
            return Response.fail(404, "用户不存在");
        }
    }
    
    /**
     * 根据用户名获取用户信息
     */
    @GetMapping("/getByUsername/{username}")
    public Response<User> getByUsername(@PathVariable String username) {
        User user = userService.getByUsername(username);
        if (user != null) {
            // 不返回密码信息
            user.setPassword(null);
            return Response.success(user);
        } else {
            return Response.fail(404, "用户不存在");
        }
    }
    
    /**
     * 根据手机号获取用户信息
     */
    @GetMapping("/getByPhone/{phone}")
    public Response<User> getByPhone(@PathVariable String phone) {
        User user = userService.getByPhone(phone);
        if (user != null) {
            // 不返回密码信息
            user.setPassword(null);
            return Response.success(user);
        } else {
            return Response.fail(404, "用户不存在");
        }
    }
    
    /**
     * 获取所有用户
     */
    @GetMapping("/list")
    public Response<List<User>> getAll() {
        List<User> users = userService.getAll();
        // 不返回密码信息
        users.forEach(user -> user.setPassword(null));
        return Response.success(users);
    }
    
    /**
     * 根据状态获取用户
     */
    @GetMapping("/listByStatus/{status}")
    public Response<List<User>> getByStatus(@PathVariable String status) {
        List<User> users = userService.getByStatus(status);
        // 不返回密码信息
        users.forEach(user -> user.setPassword(null));
        return Response.success(users);
    }
    
    /**
     * 更新用户信息
     */
    @PutMapping("/update")
    public Response<Boolean> update(@RequestBody User user) {
        boolean result = userService.update(user);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("更新成功");
            return response;
        } else {
            return Response.fail(400, "更新失败，用户名或手机号已存在");
        }
    }
    
    /**
     * 更新用户状态
     */
    @PutMapping("/updateStatus/{id}/{status}")
    public Response<Boolean> updateStatus(@PathVariable String id, @PathVariable String status) {
        boolean result = userService.updateStatus(id, status);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("更新状态成功");
            return response;
        } else {
            return Response.fail(400, "更新状态失败");
        }
    }
    
    /**
     * 更新用户密码（需验证旧密码）
     */
    @PutMapping("/updatePassword/{id}")
    public Response<Boolean> updatePassword(
            @PathVariable String id, 
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        // 参数验证
        if (id == null || id.trim().isEmpty()) {
            return Response.fail(400, "用户ID不能为空");
        }
        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            return Response.fail(400, "当前密码不能为空");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return Response.fail(400, "新密码不能为空");
        }
        
        // 密码强度验证
        if (newPassword.length() < 6) {
            return Response.fail(400, "密码长度不能少于6个字符");
        }
        
        boolean result = userService.updatePassword(id, oldPassword, newPassword);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("密码更新成功");
            return response;
        } else {
            return Response.fail(400, "密码更新失败，请检查当前密码是否正确");
        }
    }
    
    /**
     * 重置用户密码（管理员操作，不需旧密码）
     */
    @PutMapping("/resetPassword/{id}")
    public Response<Boolean> resetPassword(@PathVariable String id, @RequestParam String newPassword) {
        // 参数验证
        if (id == null || id.trim().isEmpty()) {
            return Response.fail(400, "用户ID不能为空");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return Response.fail(400, "新密码不能为空");
        }
        
        // 密码强度验证
        if (newPassword.length() < 6) {
            return Response.fail(400, "密码长度不能少于6个字符");
        }
        
        boolean result = userService.updatePassword(id, newPassword);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("密码重置成功");
            return response;
        } else {
            return Response.fail(400, "密码重置失败");
        }
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/delete/{id}")
    public Response<Boolean> delete(@PathVariable String id) {
        boolean result = userService.delete(id);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("删除成功");
            return response;
        } else {
            return Response.fail(400, "删除失败");
        }
    }
    
    /**
     * 批量删除用户
     */
    @DeleteMapping("/deleteBatch")
    public Response<Boolean> deleteBatch(@RequestBody List<String> ids) {
        boolean result = userService.deleteBatch(ids);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("批量删除成功");
            return response;
        } else {
            return Response.fail(400, "批量删除失败");
        }
    }
    
    /**
     * 验证用户名是否已存在
     */
    @GetMapping("/checkUsername/{username}")
    public Response<Boolean> checkUsername(@PathVariable String username) {
        boolean exists = userService.isUsernameExists(username);
        return Response.success(exists);
    }
    
    /**
     * 验证手机号是否已存在
     */
    @GetMapping("/checkPhone/{phone}")
    public Response<Boolean> checkPhone(@PathVariable String phone) {
        boolean exists = userService.isPhoneExists(phone);
        return Response.success(exists);
    }
    
}