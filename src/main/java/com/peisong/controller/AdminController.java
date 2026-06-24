package com.peisong.controller;

import com.peisong.entity.DeliveryTask;
import com.peisong.entity.Response;
import com.peisong.entity.User;
import com.peisong.service.DeliveryTaskService;
import com.peisong.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理员控制器
 * 提供管理员专用的用户管理和任务管理接口
 * 所有接口都需要 ADMIN 角色权限
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private DeliveryTaskService deliveryTaskService;
    
    // ============ 权限验证辅助方法 ============
    
    /**
     * 验证当前用户是否为管理员
     */
    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
    
    /**
     * 获取当前登录用户ID
     */
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            return auth.getName();
        }
        return null;
    }
    
    // ============ 用户管理接口 ============
    
    /**
     * 获取所有用户列表（管理员）
     */
    @GetMapping("/user/list")
    public Response<List<User>> getAllUsers() {
        List<User> users = userService.getAll();
        // 不返回密码信息
        users.forEach(user -> user.setPassword(null));
        return Response.success(users);
    }
    
    /**
     * 获取用户统计信息
     */
    @GetMapping("/user/stats")
    public Response<Map<String, Object>> getUserStats() {
        List<User> allUsers = userService.getAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", allUsers.size());
        stats.put("activeUsers", allUsers.stream().filter(u -> u.getStatus() != null && u.getStatus() == 1).count());
        stats.put("adminUsers", allUsers.stream().filter(u -> "ADMIN".equals(u.getRole())).count());
        stats.put("normalUsers", allUsers.stream().filter(u -> !"ADMIN".equals(u.getRole())).count());
        
        return Response.success(stats);
    }
    
    /**
     * 管理员添加用户
     */
    @PostMapping("/user/add")
    public Response<Boolean> addUser(@RequestBody User user) {
        // 参数验证
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            return Response.fail(400, "手机号不能为空");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return Response.fail(400, "密码不能为空");
        }
        
        // 手机号格式验证
        if (!user.getPhone().matches("^1[0-9]\\d{9}$")) {
            return Response.fail(400, "手机号格式不正确");
        }
        
        // 自动生成用户名
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            user.setUsername(user.getPhone());
        }
        
        // 自动生成姓名
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            user.setName("用户" + user.getPhone().substring(user.getPhone().length() - 4));
        }
        
        // 默认角色为普通用户
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        }
        
        boolean result = userService.register(user);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("用户添加成功");
            return response;
        } else {
            return Response.fail(400, "添加失败，手机号或用户名已存在");
        }
    }
    
    /**
     * 管理员删除用户
     */
    @DeleteMapping("/user/delete/{id}")
    public Response<Boolean> deleteUser(@PathVariable String id) {
        // 不允许删除自己
        String currentUserId = getCurrentUserId();
        if (id.equals(currentUserId)) {
            return Response.fail(400, "不能删除自己的账号");
        }
        
        // 检查用户是否存在
        User user = userService.getById(id);
        if (user == null) {
            return Response.fail(404, "用户不存在");
        }
        
        // 不允许删除其他管理员
        if ("ADMIN".equals(user.getRole())) {
            return Response.fail(400, "不能删除管理员账号");
        }
        
        boolean result = userService.delete(id);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("用户删除成功");
            return response;
        } else {
            return Response.fail(400, "删除失败");
        }
    }
    
    /**
     * 管理员更新用户角色
     */
    @PutMapping("/user/updateRole/{id}")
    public Response<Boolean> updateUserRole(@PathVariable String id, @RequestParam String role) {
        // 验证角色值
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            return Response.fail(400, "无效的角色值");
        }
        
        // 不允许修改自己的角色
        String currentUserId = getCurrentUserId();
        if (id.equals(currentUserId)) {
            return Response.fail(400, "不能修改自己的角色");
        }
        
        User user = userService.getById(id);
        if (user == null) {
            return Response.fail(404, "用户不存在");
        }
        
        user.setRole(role);
        boolean result = userService.update(user);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("角色更新成功");
            return response;
        } else {
            return Response.fail(400, "更新失败");
        }
    }
    
    /**
     * 管理员更新用户信息
     */
    @PutMapping("/user/update")
    public Response<Boolean> updateUser(@RequestBody User user) {
        if (user.getId() == null || user.getId().trim().isEmpty()) {
            return Response.fail(400, "用户ID不能为空");
        }
        
        // 检查用户是否存在
        User existingUser = userService.getById(user.getId());
        if (existingUser == null) {
            return Response.fail(404, "用户不存在");
        }
        
        // 不允许修改自己的角色为普通用户
        String currentUserId = getCurrentUserId();
        if (user.getId().equals(currentUserId) && "USER".equals(user.getRole())) {
            return Response.fail(400, "不能取消自己的管理员权限");
        }
        
        // 更新用户信息
        if (user.getPhone() != null) existingUser.setPhone(user.getPhone());
        if (user.getUsername() != null) existingUser.setUsername(user.getUsername());
        if (user.getName() != null) existingUser.setName(user.getName());
        if (user.getRole() != null) existingUser.setRole(user.getRole());
        if (user.getStatus() != null) existingUser.setStatus(user.getStatus());
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            existingUser.setPassword(user.getPassword());
        }
        
        boolean result = userService.update(existingUser);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("用户信息更新成功");
            return response;
        } else {
            return Response.fail(400, "更新失败");
        }
    }
    
    /**
     * 管理员重置用户密码
     */
    @PutMapping("/user/resetPassword/{id}")
    public Response<Boolean> resetUserPassword(@PathVariable String id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return Response.fail(400, "新密码不能为空");
        }
        
        if (newPassword.length() < 6) {
            return Response.fail(400, "密码长度不能少于6位");
        }
        
        // 检查用户是否存在
        User user = userService.getById(id);
        if (user == null) {
            return Response.fail(404, "用户不存在");
        }
        
        // 不允许重置管理员密码
        if ("ADMIN".equals(user.getRole())) {
            return Response.fail(400, "不能重置管理员密码");
        }
        
        boolean result = userService.updatePassword(id, newPassword);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("密码重置成功");
            return response;
        } else {
            return Response.fail(400, "重置失败");
        }
    }
    
    // ============ 任务管理接口 ============
    
    /**
     * 获取所有配送任务（管理员可查看所有用户的任务）
     */
    @GetMapping("/task/list")
    public Response<List<DeliveryTask>> getAllTasks() {
        List<DeliveryTask> tasks = deliveryTaskService.getAll();
        return Response.success(tasks);
    }
    
    /**
     * 获取单个配送任务详情
     */
    @GetMapping("/task/get/{id}")
    public Response<DeliveryTask> getTaskById(@PathVariable String id) {
        DeliveryTask task = deliveryTaskService.getById(id);
        if (task == null) {
            return Response.fail(404, "任务不存在");
        }
        return Response.success(task);
    }
    
    /**
     * 获取任务统计信息
     */
    @GetMapping("/task/stats")
    public Response<Map<String, Object>> getTaskStats() {
        List<DeliveryTask> allTasks = deliveryTaskService.getAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", allTasks.size());
        stats.put("pendingTasks", allTasks.stream().filter(t -> "待配送".equals(t.getStatus())).count());
        stats.put("activeTasks", allTasks.stream().filter(t -> "配送中".equals(t.getStatus())).count());
        stats.put("completedTasks", allTasks.stream().filter(t -> "配送完成".equals(t.getStatus())).count());
        
        return Response.success(stats);
    }
    
    /**
     * 管理员创建配送任务
     */
    @PostMapping("/task/create")
    public Response<Boolean> createTask(@RequestBody DeliveryTask task) {
        // 参数验证
        if (task.getStartAddr() == null || task.getStartAddr().trim().isEmpty()) {
            return Response.fail(400, "起点地址不能为空");
        }
        if (task.getEndAddr() == null || task.getEndAddr().trim().isEmpty()) {
            return Response.fail(400, "终点地址不能为空");
        }
        
        // 设置默认状态
        if (task.getStatus() == null || task.getStatus().trim().isEmpty()) {
            task.setStatus("待配送");
        }
        
        boolean result = deliveryTaskService.create(task);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("任务创建成功");
            return response;
        } else {
            return Response.fail(400, "创建失败");
        }
    }
    
    /**
     * 管理员修改配送任务
     */
    @PutMapping("/task/update")
    public Response<Boolean> updateTask(@RequestBody DeliveryTask task) {
        if (task.getId() == null || task.getId().trim().isEmpty()) {
            return Response.fail(400, "任务ID不能为空");
        }
        
        // 检查任务是否存在
        DeliveryTask existingTask = deliveryTaskService.getById(task.getId());
        if (existingTask == null) {
            return Response.fail(404, "任务不存在");
        }
        
        boolean result = deliveryTaskService.update(task);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("任务更新成功");
            return response;
        } else {
            return Response.fail(400, "更新失败");
        }
    }
    
    /**
     * 管理员删除配送任务
     */
    @DeleteMapping("/task/delete/{id}")
    public Response<Boolean> deleteTask(@PathVariable String id) {
        // 检查任务是否存在
        DeliveryTask task = deliveryTaskService.getById(id);
        if (task == null) {
            return Response.fail(404, "任务不存在");
        }
        
        // 配送中的任务不允许删除
        if ("配送中".equals(task.getStatus())) {
            return Response.fail(400, "配送中的任务不能删除，请先取消配送");
        }
        
        boolean result = deliveryTaskService.delete(id);
        if (result) {
            Response<Boolean> response = Response.success(true);
            response.setMessage("任务删除成功");
            return response;
        } else {
            return Response.fail(400, "删除失败");
        }
    }
    
    /**
     * 管理员分配任务给用户
     */
    @PostMapping("/task/assign")
    public Response<Boolean> assignTask(@RequestParam String taskId, @RequestParam String userId) {
        // 检查任务是否存在
        DeliveryTask task = deliveryTaskService.getById(taskId);
        if (task == null) {
            return Response.fail(404, "任务不存在");
        }
        
        // 检查用户是否存在
        User user = userService.getById(userId);
        if (user == null) {
            return Response.fail(404, "用户不存在");
        }
        
        try {
            boolean result = deliveryTaskService.assignTask(taskId, userId);
            if (result) {
                Response<Boolean> response = Response.success(true);
                response.setMessage("任务分配成功");
                return response;
            } else {
                return Response.fail(400, "分配失败");
            }
        } catch (Exception e) {
            return Response.fail(400, e.getMessage());
        }
    }
    
    /**
     * 获取管理员仪表盘数据
     */
    @GetMapping("/dashboard")
    public Response<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        // 用户统计
        List<User> allUsers = userService.getAll();
        dashboard.put("totalUsers", allUsers.size());
        dashboard.put("adminCount", allUsers.stream().filter(u -> "ADMIN".equals(u.getRole())).count());
        
        // 任务统计
        List<DeliveryTask> allTasks = deliveryTaskService.getAll();
        dashboard.put("totalTasks", allTasks.size());
        dashboard.put("pendingTasks", allTasks.stream().filter(t -> "待配送".equals(t.getStatus())).count());
        dashboard.put("activeTasks", allTasks.stream().filter(t -> "配送中".equals(t.getStatus())).count());
        dashboard.put("completedTasks", allTasks.stream().filter(t -> "配送完成".equals(t.getStatus())).count());
        
        return Response.success(dashboard);
    }
}
