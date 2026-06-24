package com.peisong.service.impl;

import com.peisong.entity.ChargingStation;
import com.peisong.mapper.ChargingStationMapper;
import com.peisong.service.ChargingStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 充电站点服务实现类
 */
@Service
public class ChargingStationServiceImpl implements ChargingStationService {
    
    @Autowired
    private ChargingStationMapper chargingStationMapper;
    
    @Override
    public ChargingStation getById(String id) {
        return chargingStationMapper.selectById(id);
    }
    
    @Override
    public List<ChargingStation> getAll() {
        return chargingStationMapper.selectAll();
    }
    
    @Override
    public List<ChargingStation> getByStatus(String status) {
        return chargingStationMapper.selectByStatus(status);
    }
    
    @Override
    public List<ChargingStation> searchNearby(double longitude, double latitude, int radius) {
        return chargingStationMapper.getByLocation(longitude, latitude, radius);
    }
    
    @Override
    @Transactional
    public boolean create(ChargingStation chargingStation) {
        // 生成唯一ID
        if (chargingStation.getId() == null) {
            chargingStation.setId("CS_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        // 设置默认状态为ACTIVE
        if (chargingStation.getStatus() == null) {
            chargingStation.setStatus("ACTIVE");
        }
        
        // 默认可用数量等于总数
        if (chargingStation.getAvailableCount() == null && chargingStation.getTotalCount() != null) {
            chargingStation.setAvailableCount(chargingStation.getTotalCount());
        }
        
        return chargingStationMapper.insert(chargingStation) > 0;
    }
    
    @Override
    @Transactional
    public boolean update(ChargingStation chargingStation) {
        return chargingStationMapper.update(chargingStation) > 0;
    }
    
    @Override
    @Transactional
    public boolean updateStatus(String id, String status) {
        return chargingStationMapper.updateStatus(id, status) > 0;
    }
    
    @Override
    @Transactional
    public boolean updateAvailableCount(String id, Integer availableCount) {
        // 获取充电站信息
        ChargingStation station = chargingStationMapper.selectById(id);
        if (station == null) {
            return false;
        }
        
        // 确保可用数量不超过总数
        if (availableCount > station.getTotalCount()) {
            availableCount = station.getTotalCount();
        }
        
        // 确保可用数量不为负数
        if (availableCount < 0) {
            availableCount = 0;
        }
        
        return chargingStationMapper.updateAvailableCount(id, availableCount) > 0;
    }
    
    @Override
    @Transactional
    public boolean delete(String id) {
        return chargingStationMapper.delete(id) > 0;
    }
    
    @Override
    @Transactional
    public boolean deleteBatch(List<String> ids) {
        return chargingStationMapper.deleteBatch(ids) > 0;
    }
}