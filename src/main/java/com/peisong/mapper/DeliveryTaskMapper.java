package com.peisong.mapper;

import com.peisong.entity.DeliveryTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 配送任务Mapper接口
 */
@Mapper
public interface DeliveryTaskMapper {
    
    /**
     * 根据ID查询配送任务
     */
    DeliveryTask selectById(String id);
    
    /**
     * 查询所有配送任务
     */
    List<DeliveryTask> selectAll();
    
    /**
     * 根据状态查询配送任务
     */
    List<DeliveryTask> selectByStatus(String status);
    
    /**
     * 根据驾驶员ID查询配送任务
     */
    List<DeliveryTask> selectByDriverId(String driverId);
    
    /**
     * 根据用户ID查询配送任务
     */
    List<DeliveryTask> selectByUserId(String userId);
    
    /**
     * 新增配送任务
     */
    int insert(DeliveryTask deliveryTask);
    
    /**
     * 更新配送任务
     */
    int update(DeliveryTask deliveryTask);
    
    /**
     * 更新配送任务状态
     */
    int updateStatus(@Param("id") String id, @Param("status") String status);
    
    /**
     * 删除配送任务
     */
    int delete(String id);
    
    /**
     * 批量删除配送任务
     */
    int deleteBatch(List<String> ids);
}