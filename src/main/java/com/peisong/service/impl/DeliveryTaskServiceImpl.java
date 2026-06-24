package com.peisong.service.impl;

import com.peisong.entity.DeliveryTask;
import com.peisong.mapper.DeliveryTaskMapper;
import com.peisong.service.DeliveryTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 配送任务服务实现类
 */
@Service
public class DeliveryTaskServiceImpl implements DeliveryTaskService {
    
    @Autowired
    private DeliveryTaskMapper deliveryTaskMapper;
    
    @Override
    public DeliveryTask getById(String id) {
        return deliveryTaskMapper.selectById(id);
    }
    
    @Override
    public List<DeliveryTask> getAll() {
        return deliveryTaskMapper.selectAll();
    }
    
    @Override
    public List<DeliveryTask> getByStatus(String status) {
        return deliveryTaskMapper.selectByStatus(status);
    }
    
    @Override
    public List<DeliveryTask> getByUserId(String userId) {
        return deliveryTaskMapper.selectByUserId(userId);
    }
    
    @Override
    @Transactional
    public boolean create(DeliveryTask deliveryTask) {
        // 生成唯一ID
        if (deliveryTask.getId() == null) {
            deliveryTask.setId("PSRW_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        // 设置默认状态为待配送
        if (deliveryTask.getStatus() == null) {
            deliveryTask.setStatus("待配送");
        }
        
        // 设置创建时间
        if (deliveryTask.getCreateTime() == null) {
            deliveryTask.setCreateTime(new Date());
        }
        
        return deliveryTaskMapper.insert(deliveryTask) > 0;
    }
    
    @Override
    @Transactional
    public boolean update(DeliveryTask deliveryTask) {
        return deliveryTaskMapper.update(deliveryTask) > 0;
    }
    
    @Override
    @Transactional
    public boolean startDelivery(String id) {
        if (id == null) {
            throw new IllegalArgumentException("配送任务ID不能为空");
        }
        
        DeliveryTask task = deliveryTaskMapper.selectById(id);
        if (task == null) {
            throw new RuntimeException("配送任务不存在，ID: " + id);
        }
        
        // 检查该用户是否已有配送中的任务
        if (task.getUserId() != null) {
            List<DeliveryTask> userActiveTasks = deliveryTaskMapper.selectByUserId(task.getUserId());
            if (userActiveTasks != null) {
                for (DeliveryTask userTask : userActiveTasks) {
                    if ("配送中".equals(userTask.getStatus())) {
                        throw new RuntimeException("您当前已有配送中的任务，请先完成或取消当前任务");
                    }
                }
            }
        }
        
        if (!"待配送".equals(task.getStatus())) {
            throw new RuntimeException("只有待配送状态的任务才能开始配送，当前状态: " + task.getStatus());
        }
        
        try {
            task.setStatus("配送中");
            task.setStartTime(new Date());
            return deliveryTaskMapper.update(task) > 0;
        } catch (Exception e) {
            throw new RuntimeException("开始配送任务失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public boolean completeDelivery(String id) {
        if (id == null) {
            throw new IllegalArgumentException("配送任务ID不能为空");
        }
        
        DeliveryTask task = deliveryTaskMapper.selectById(id);
        if (task == null) {
            throw new RuntimeException("配送任务不存在，ID: " + id);
        }
        
        if (!"配送中".equals(task.getStatus())) {
            throw new RuntimeException("只有配送中状态的任务才能完成配送，当前状态: " + task.getStatus());
        }
        
        try {
            task.setStatus("配送完成");
            task.setEndTime(new Date());
            return deliveryTaskMapper.update(task) > 0;
        } catch (Exception e) {
            throw new RuntimeException("完成配送任务失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public boolean delete(String id) {
        return deliveryTaskMapper.delete(id) > 0;
    }
    
    @Override
    @Transactional
    public boolean deleteBatch(List<String> ids) {
        return deliveryTaskMapper.deleteBatch(ids) > 0;
    }
    
    @Override
    @Transactional
    public boolean cancelDelivery(String id) {
        if (id == null) {
            throw new IllegalArgumentException("配送任务ID不能为空");
        }
        
        DeliveryTask task = deliveryTaskMapper.selectById(id);
        if (task == null) {
            throw new RuntimeException("配送任务不存在，ID: " + id);
        }
        
        if (!"配送中".equals(task.getStatus())) {
            throw new RuntimeException("只有配送中状态的任务才能取消配送，当前状态: " + task.getStatus());
        }
        
        try {
            task.setStatus("待配送");
            task.setStartTime(null); // 清除开始时间
            return deliveryTaskMapper.update(task) > 0;
        } catch (Exception e) {
            throw new RuntimeException("取消配送任务失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public boolean assignTask(String taskId, String userId) {
        if (taskId == null || taskId.trim().isEmpty()) {
            throw new IllegalArgumentException("配送任务ID不能为空");
        }
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        
        // 检查任务是否存在
        DeliveryTask task = deliveryTaskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("配送任务不存在，ID: " + taskId);
        }
        
        // 检查用户是否存在（这里需要用户服务，暂时跳过用户验证）
        // 在实际应用中，应该调用用户服务验证用户是否存在
        
        // 更新任务的用户ID
        task.setUserId(userId);
        
        // 如果任务状态是"待配送"，可以保持原状态
        // 如果任务已经被分配过，可以更新分配信息
        
        return deliveryTaskMapper.update(task) > 0;
    }
}