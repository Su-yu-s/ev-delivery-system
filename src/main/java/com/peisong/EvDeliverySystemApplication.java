package com.peisong;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.client.RestTemplate;

/**
 * 电动车配送系统Spring Boot启动类
 */
@SpringBootApplication
@MapperScan("com.peisong.mapper")
public class EvDeliverySystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvDeliverySystemApplication.class, args);
    }
    
    /**
     * 配置RestTemplate用于HTTP请求
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
}