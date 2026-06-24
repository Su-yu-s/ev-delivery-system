package com.peisong.mapper;

import com.peisong.entity.ChargingStation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 充电站点Mapper接口
 */
@Mapper
public interface ChargingStationMapper {
    
    /**
     * 根据ID查询充电站点
     */
    ChargingStation selectById(String id);
    
    /**
     * 查询所有充电站点
     */
    List<ChargingStation> selectAll();
    
    /**
     * 根据状态查询充电站点
     */
    List<ChargingStation> selectByStatus(String status);
    
    /**
     * 根据位置附近搜索充电站点
     * @param longitude 经度
     * @param latitude 纬度
     * @param radius 搜索半径（米）
     * @return 充电站点列表
     */
    List<ChargingStation> getByLocation(@Param("longitude") Double longitude, 
                                        @Param("latitude") Double latitude, 
                                        @Param("radius") Integer radius);
    
    /**
     * 新增充电站点
     */
    int insert(ChargingStation chargingStation);
    
    /**
     * 更新充电站点
     */
    int update(ChargingStation chargingStation);
    
    /**
     * 更新充电站点状态
     */
    int updateStatus(@Param("id") String id, @Param("status") String status);
    
    /**
     * 更新可用充电桩数量
     */
    int updateAvailableCount(@Param("id") String id, @Param("availableCount") Integer availableCount);
    
    /**
     * 删除充电站点
     */
    int delete(String id);
    
    /**
     * 批量删除充电站点
     */
    int deleteBatch(List<String> ids);
}