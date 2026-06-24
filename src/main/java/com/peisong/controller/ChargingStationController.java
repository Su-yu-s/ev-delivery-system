package com.peisong.controller;

import com.peisong.entity.ChargingStation;
import com.peisong.entity.Response;
import com.peisong.service.ChargingStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 充电站Controller
 */
@RestController
@RequestMapping("/api/charging/station")
public class ChargingStationController {
    
    @Autowired
    private ChargingStationService chargingStationService;
    
    /**
     * 根据ID获取充电站
     */
    @GetMapping("/get/{id}")
    public Response<ChargingStation> getById(@PathVariable String id) {
        ChargingStation station = chargingStationService.getById(id);
        if (station != null) {
            return Response.success(station);
        } else {
            return Response.fail(404, "充电站不存在");
        }
    }
    
    /**
     * 获取所有充电站
     */
    @GetMapping("/list")
    public Response<List<ChargingStation>> getAll() {
        List<ChargingStation> stations = chargingStationService.getAll();
        return Response.success(stations);
    }
    
    /**
     * 根据状态获取充电站
     */
    @GetMapping("/listByStatus/{status}")
    public Response<List<ChargingStation>> getByStatus(@PathVariable String status) {
        List<ChargingStation> stations = chargingStationService.getByStatus(status);
        return Response.success(stations);
    }
    
    /**
     * 根据位置搜索附近充电站
     */
    @GetMapping("/searchNearby")
    public Response<List<ChargingStation>> searchNearby(
            @RequestParam double longitude,
            @RequestParam double latitude,
            @RequestParam(defaultValue = "5000") int radius) {
        
        // 经纬度参数验证
        if (longitude < -180 || longitude > 180) {
            return Response.fail(400, "经度范围必须在-180到180之间");
        }
        if (latitude < -90 || latitude > 90) {
            return Response.fail(400, "纬度范围必须在-90到90之间");
        }
        
        // 搜索半径验证
        if (radius <= 0 || radius > 50000) {
            return Response.fail(400, "搜索半径必须在1到50000米之间");
        }
        
        List<ChargingStation> stations = chargingStationService.searchNearby(longitude, latitude, radius);
        return Response.success(stations);
    }
    
    /**
     * 创建充电站
     */
    @PostMapping("/create")
    public Response<Boolean> create(@RequestBody ChargingStation station) {
        boolean result = chargingStationService.create(station);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("创建充电站失败");
        }
    }
    
    /**
     * 更新充电站
     */
    @PutMapping("/update")
    public Response<Boolean> update(@RequestBody ChargingStation station) {
        boolean result = chargingStationService.update(station);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("更新充电站失败");
        }
    }
    
    /**
     * 更新充电站状态
     */
    @PutMapping("/updateStatus/{id}/{status}")
    public Response<Boolean> updateStatus(@PathVariable String id, @PathVariable String status) {
        boolean result = chargingStationService.updateStatus(id, status);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("更新充电站状态失败");
        }
    }
    
    /**
     * 更新可用充电桩数量
     */
    @PutMapping("/updateAvailableCount/{id}/{count}")
    public Response<Boolean> updateAvailableCount(@PathVariable String id, @PathVariable int count) {
        boolean result = chargingStationService.updateAvailableCount(id, count);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("更新可用充电桩数量失败");
        }
    }
    
    /**
     * 删除充电站
     */
    @DeleteMapping("/delete/{id}")
    public Response<Boolean> delete(@PathVariable String id) {
        boolean result = chargingStationService.delete(id);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("删除充电站失败");
        }
    }
    
    /**
     * 批量删除充电站
     */
    @DeleteMapping("/deleteBatch")
    public Response<Boolean> deleteBatch(@RequestBody List<String> ids) {
        boolean result = chargingStationService.deleteBatch(ids);
        if (result) {
            return Response.success(true);
        } else {
            return Response.fail("批量删除充电站失败");
        }
    }
}