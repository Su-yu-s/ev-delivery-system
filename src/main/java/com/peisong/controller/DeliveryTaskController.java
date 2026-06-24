package com.peisong.controller;

import com.peisong.entity.DeliveryTask;
import com.peisong.entity.Response;
import com.peisong.service.DeliveryTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 配送任务Controller
 */
@RestController
@RequestMapping("/api/delivery/task")
public class DeliveryTaskController {
    
    @Autowired
    private DeliveryTaskService deliveryTaskService;
    
    /**
     * 根据ID获取配送任务
     */
    @GetMapping("/get/{id}")
    public Response<DeliveryTask> getById(@PathVariable String id) {
        DeliveryTask task = deliveryTaskService.getById(id);
        if (task != null) {
            return Response.success(task);
        } else {
            return Response.fail(404, "配送任务不存在");
        }
    }
    
    /**
     * 获取所有配送任务
     */
    @GetMapping("/list")
    public Response<List<DeliveryTask>> getAll() {
        List<DeliveryTask> tasks = deliveryTaskService.getAll();
        return Response.success(tasks);
    }
    
    /**
     * 根据状态获取配送任务
     */
    @GetMapping("/listByStatus/{status}")
    public Response<List<DeliveryTask>> getByStatus(@PathVariable String status) {
        List<DeliveryTask> tasks = deliveryTaskService.getByStatus(status);
        return Response.success(tasks);
    }
    
    /**
     * 根据用户ID获取配送任务
     */
    @GetMapping("/listByUser/{userId}")
    public Response<List<DeliveryTask>> getByUserId(@PathVariable String userId) {
        List<DeliveryTask> tasks = deliveryTaskService.getByUserId(userId);
        return Response.success(tasks);
    }
    
    /**
     * 创建配送任务
     */
    @PostMapping("/create")
    public Response<Boolean> create(@RequestBody DeliveryTask task) {
        boolean result = deliveryTaskService.create(task);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("创建配送任务失败");
        }
    }
    
    /**
     * 更新配送任务
     */
    @PutMapping("/update")
    public Response<Boolean> update(@RequestBody DeliveryTask task) {
        boolean result = deliveryTaskService.update(task);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("更新配送任务失败");
        }
    }
    
    /**
     * 开始配送
     */
    @PutMapping("/start/{id}")
    public Response<Boolean> startDelivery(@PathVariable String id) {
        boolean result = deliveryTaskService.startDelivery(id);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("开始配送失败，任务不存在或状态不正确");
        }
    }
    
    /**
     * 完成配送
     */
    @PutMapping("/complete/{id}")
    public Response<Boolean> completeDelivery(@PathVariable String id) {
        try {
            boolean result = deliveryTaskService.completeDelivery(id);
            if (result) {
                return Response.success(true);
            } else {
                return Response.fail("完成配送失败，任务不存在或状态不正确");
            }
        } catch (IllegalArgumentException e) {
            return Response.fail(e.getMessage());
        } catch (RuntimeException e) {
            return Response.fail(e.getMessage());
        } catch (Exception e) {
            return Response.fail("服务器内部错误: " + e.getMessage());
        }
    }
    
    /**
     * 取消配送（将配送中的任务改为待配送）
     */
    @PutMapping("/cancel/{id}")
    public Response<Boolean> cancelDelivery(@PathVariable String id) {
        try {
            boolean result = deliveryTaskService.cancelDelivery(id);
            if (result) {
                return Response.success(true);
            } else {
                return Response.fail("取消配送失败，任务不存在或状态不正确");
            }
        } catch (IllegalArgumentException e) {
            return Response.fail(e.getMessage());
        } catch (RuntimeException e) {
            return Response.fail(e.getMessage());
        } catch (Exception e) {
            return Response.fail("服务器内部错误: " + e.getMessage());
        }
    }
    
    /**
     * 删除配送任务
     */
    @DeleteMapping("/delete/{id}")
    public Response<Boolean> delete(@PathVariable String id) {
        boolean result = deliveryTaskService.delete(id);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("删除配送任务失败");
        }
    }
    
    /**
     * 批量删除配送任务
     */
    @DeleteMapping("/deleteBatch")
    public Response<Boolean> deleteBatch(@RequestBody List<String> ids) {
        boolean result = deliveryTaskService.deleteBatch(ids);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("批量删除配送任务失败");
        }
    }
    
    /**
     * 分配配送任务给用户
     */
    @PostMapping("/assign")
    public Response<Boolean> assignTask(@RequestParam String taskId, @RequestParam String userId) {
        try {
            boolean result = deliveryTaskService.assignTask(taskId, userId);
            if (result) {
                return Response.success(true);
            } else {
                return Response.fail("分配配送任务失败");
            }
        } catch (IllegalArgumentException e) {
            return Response.fail(e.getMessage());
        } catch (RuntimeException e) {
            return Response.fail(e.getMessage());
        } catch (Exception e) {
            return Response.fail("服务器内部错误: " + e.getMessage());
        }
    }
}