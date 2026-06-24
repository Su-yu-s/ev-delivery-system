package com.peisong.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 高德地图配置属性类
 * 用于消除application.properties中的警告
 */
@Component
@ConfigurationProperties(prefix = "amap")
public class AmapProperties {
    
    /**
     * 高德地图API密钥
     */
    private String key;
    
    /**
     * 高德地图安全码
     */
    private String securityCode;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSecurityCode() {
        return securityCode;
    }

    public void setSecurityCode(String securityCode) {
        this.securityCode = securityCode;
    }
}