package com.peisong.controller;

import com.peisong.entity.Response;
import com.peisong.util.AmapUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 路线规划Controller - 提供路线计算功能
 */
@RestController
@RequestMapping("/api/route")
public class RouteController {

    @Autowired
    private AmapUtil amapUtil;

    /**
     * 计算路线距离和时间
     */
    @PostMapping("/calculate")
    public Response<Map<String, Object>> calculateRoute(@RequestBody Map<String, String> request) {
        String startAddr = request.get("startAddr");
        String endAddr = request.get("endAddr");

        if (startAddr == null || startAddr.trim().isEmpty() || endAddr == null || endAddr.trim().isEmpty()) {
            return Response.fail("起点和终点地址不能为空");
        }

        try {
            System.out.println("开始计算路线: " + startAddr + " -> " + endAddr);
            
            System.out.println("接收到的原始地址: " + startAddr + " -> " + endAddr);
            
            // 尝试解码前端发送的encodeURIComponent编码的地址
            try {
                if (startAddr != null) {
                    startAddr = java.net.URLDecoder.decode(startAddr, "UTF-8");
                }
                if (endAddr != null) {
                    endAddr = java.net.URLDecoder.decode(endAddr, "UTF-8");
                }
            } catch (Exception e) {
                System.out.println("地址解码失败: " + e.getMessage());
            }
            
            System.out.println("地址处理后: " + startAddr + " -> " + endAddr);
            
            // 首先将地址转换为经纬度
            Map<String, Double> startLocation = amapUtil.geocode(startAddr.trim());
            System.out.println("起点地址解析结果: " + startLocation);
            
            Map<String, Double> endLocation = amapUtil.geocode(endAddr.trim());
            System.out.println("终点地址解析结果: " + endLocation);

            // 即使地理编码失败，我们也尝试使用模拟数据继续处理
            if (startLocation == null) {
                System.out.println("起点地址解析失败，使用模拟数据");
                // 尝试使用模拟方法解析地址
                startLocation = amapUtil.simulateGeocode(startAddr.trim());
                if (startLocation == null) {
                    return Response.fail("起点地址无法解析，请检查地址格式: " + startAddr.trim());
                }
            }

            if (endLocation == null) {
                System.out.println("终点地址解析失败，使用模拟数据");
                // 尝试使用模拟方法解析地址
                endLocation = amapUtil.simulateGeocode(endAddr.trim());
                if (endLocation == null) {
                    return Response.fail("终点地址无法解析，请检查地址格式: " + endAddr.trim());
                }
            }

            // 使用经纬度进行路线规划
            String origin = startLocation.get("longitude") + "," + startLocation.get("latitude");
            String destination = endLocation.get("longitude") + "," + endLocation.get("latitude");
            
            System.out.println("路线规划参数: origin=" + origin + ", destination=" + destination);

            Map<String, Object> routeResult = amapUtil.planRoute(origin, destination);
            System.out.println("路线规划结果: " + routeResult);

            // 确保正确处理模拟路线规划结果
            Boolean success = (Boolean) routeResult.get("success");
            if (success == null) success = false; // 防止空指针异常
            
            if (success) {
                java.util.HashMap<String, Object> result = new java.util.HashMap<>();
                result.put("distance", routeResult.get("distance"));
                result.put("duration", routeResult.get("duration"));
                System.out.println("路线计算成功，距离: " + routeResult.get("distance") + "km, 时间: " + routeResult.get("duration") + "分钟");
                return Response.success(result);
            } else {
                String errorMessage = (String) routeResult.getOrDefault("message", "路线规划失败");
                System.out.println("路线规划失败: " + errorMessage);
                return Response.fail(errorMessage);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("路线计算过程中发生错误: " + e.getMessage());
            return Response.fail("路线计算过程中发生错误: " + e.getMessage());
        }
    }
    

}