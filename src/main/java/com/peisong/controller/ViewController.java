package com.peisong.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 视图控制器，用于返回HTML页面
 */
@Controller
public class ViewController {
    
    /**
     * 访问根路径时重定向到index.html
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/html/index.html";
    }
    
    /**
     * 直接访问index路径时也重定向到index.html
     */
    @GetMapping("/index")
    public String index2() {
        return "redirect:/html/index.html";
    }
    
    /**
     * 访问登录页面
     */
    @GetMapping("/login")
    public String login() {
        return "redirect:/html/login.html";
    }
    
    /**
     * 访问注册页面
     */
    @GetMapping("/register")
    public String register() {
        return "redirect:/html/register.html";
    }
    
    /**
     * 访问个人资料页面
     */
    @GetMapping("/profile")
    public String profile() {
        return "redirect:/html/profile.html";
    }
    
    /**
     * 访问管理员任务管理页面
     */
    @GetMapping("/admin/tasks")
    public String adminTasks() {
        return "redirect:/html/admin-tasks.html";
    }
    
    /**
     * 访问管理员用户管理页面
     */
    @GetMapping("/admin/users")
    public String adminUsers() {
        return "redirect:/html/admin-users.html";
    }
    
    /**
     * 访问管理员数据看板页面
     */
    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "redirect:/html/admin-dashboard.html";
    }
}