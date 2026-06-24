package com.peisong.service;

import com.peisong.entity.DeliveryTask;

import java.util.List;

/**
 * 配送任务服务接口
 */
public interface DeliveryTaskService {
    
    /**
     * 根据ID查询配送任务
     */
    DeliveryTask getById(String id);
    
    /**
     * 查询所有配送任务
     */
    List<DeliveryTask> getAll();
    
    /**
     * 根据状态查询配送任务
     */
    List<DeliveryTask> getByStatus(String status);
    
    /**
     * 根据用户ID查询配送任务
     */
    List<DeliveryTask> getByUserId(String userId);
    
    /**
     * 创建配送任务
     */
    boolean create(DeliveryTask deliveryTask);
    
    /**
     * 更新配送任务
     */
    boolean update(DeliveryTask deliveryTask);
    
    /**
     * 开始配送任务
     */
    boolean startDelivery(String id);
    
    /**
     * 完成配送任务
     */
    boolean completeDelivery(String id);
    
    /**
     * 取消配送任务（将配送中的任务改为待配送）
     */
    boolean cancelDelivery(String id);
    
    /**
     * 删除配送任务
     */
    boolean delete(String id);
    
    /**
     * 批量删除配送任务
     */
    boolean deleteBatch(List<String> ids);
    
    /**
     * 分配配送任务给用户
     */
    boolean assignTask(String taskId, String userId);
}