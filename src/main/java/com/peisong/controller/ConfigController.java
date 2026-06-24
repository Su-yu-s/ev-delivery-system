package com.peisong.controller;

import com.peisong.entity.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 配置Controller - 提供前端需要的配置信息
 */
@RestController
@RequestMapping("/api/config")
public class ConfigController {
    
    @Value("${amap.key}")
    private String amapKey;
    
    @Value("${amap.security-code}")
    private String amapSecurityCode;
    
    @Value("${deepseek.api-key}")
    private String deepseekApiKey;
    
    @Value("${deepseek.api-url}")
    private String deepseekApiUrl;
    
    /**
     * 获取高德地图配置
     */
    @GetMapping("/amap")
    public Response<Map<String, String>> getAmapConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("key", amapKey);
        config.put("securityCode", amapSecurityCode);
        return Response.success(config);
    }
    
    /**
     * 获取AI助手配置
     */
    @GetMapping("/ai")
    public Response<Map<String, String>> getAIConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("apiKey", deepseekApiKey);
        config.put("apiUrl", deepseekApiUrl);
        return Response.success(config);
    }
}
