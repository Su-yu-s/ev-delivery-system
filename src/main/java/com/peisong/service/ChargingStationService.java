package com.peisong.service;

import com.peisong.entity.ChargingStation;

import java.util.List;

/**
 * 充电站点服务接口
 */
public interface ChargingStationService {
    
    /**
     * 根据ID查询充电站点
     */
    ChargingStation getById(String id);
    
    /**
     * 查询所有充电站点
     */
    List<ChargingStation> getAll();
    
    /**
     * 根据状态查询充电站点
     */
    List<ChargingStation> getByStatus(String status);
    
    /**
     * 根据位置搜索附近充电站
     */
    List<ChargingStation> searchNearby(double longitude, double latitude, int radius);
    
    /**
     * 创建充电站点
     */
    boolean create(ChargingStation chargingStation);
    
    /**
     * 更新充电站点
     */
    boolean update(ChargingStation chargingStation);
    
    /**
     * 更新充电站点状态
     */
    boolean updateStatus(String id, String status);
    
    /**
     * 更新可用充电桩数量
     */
    boolean updateAvailableCount(String id, Integer availableCount);
    
    /**
     * 删除充电站点
     */
    boolean delete(String id);
    
    /**
     * 批量删除充电站点
     */
    boolean deleteBatch(List<String> ids);
}