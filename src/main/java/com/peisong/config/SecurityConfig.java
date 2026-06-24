package com.peisong.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security配置
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    /**
     * 密码编码器 - 使用BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * 安全过滤链配置
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF（因为使用JWT）
            .csrf(csrf -> csrf.disable())
            
            // 配置跨域
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                corsConfig.addAllowedOriginPattern("*");
                corsConfig.addAllowedMethod("*");
                corsConfig.addAllowedHeader("*");
                corsConfig.setAllowCredentials(true);
                return corsConfig;
            }))
            
            // 不使用Session
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 配置请求授权
            .authorizeHttpRequests(auth -> auth
                // 静态资源允许访问
                .requestMatchers("/", "/html/**", "/css/**", "/js/**", "/images/**", "/markers/**").permitAll()
                
                // 登录注册相关接口允许匿名访问
                .requestMatchers("/api/user/login", "/api/user/register").permitAll()
                .requestMatchers("/api/user/checkPhone/**", "/api/user/checkUsername/**").permitAll()
                
                // 用户信息查询接口允许访问（个人资料页面需要）
                .requestMatchers("/api/user/get/**", "/api/user/getByUsername/**", "/api/user/getByPhone/**").permitAll()
                
                // 调试接口允许访问
                .requestMatchers("/api/debug/**").permitAll()
                
                // AI配置接口允许访问（获取API配置）
                .requestMatchers("/api/config/**").permitAll()
                
                // 高德地图相关（公开）
                .requestMatchers("/api/amap/**").permitAll()
                
                // 路线规划相关（需要认证）
                .requestMatchers(HttpMethod.POST, "/api/route/calculate").authenticated()
                
                // 充电站查询（公开）
                .requestMatchers(HttpMethod.GET, "/api/charging/station/**").permitAll()
                
                // 配送任务查询接口（允许登录用户访问）
                .requestMatchers("/api/delivery/task/list", "/api/delivery/task/listByUser/**", "/api/delivery/task/listByStatus/**", "/api/delivery/task/get/**").permitAll()
                .requestMatchers("/api/delivery/task/create", "/api/delivery/task/start/**", "/api/delivery/task/complete/**", "/api/delivery/task/cancel/**").permitAll()
                
                // ============ 管理员专用接口 ============
                // 管理员控制台接口（仅管理员）
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // 用户管理（仅管理员）
                .requestMatchers("/api/user/list").hasRole("ADMIN")
                .requestMatchers("/api/user/delete/**", "/api/user/deleteBatch").hasRole("ADMIN")
                .requestMatchers("/api/user/resetPassword/**").hasRole("ADMIN")
                
                // 任务管理（仅管理员）
                .requestMatchers("/api/delivery/task/delete/**", "/api/delivery/task/deleteBatch").hasRole("ADMIN")
                .requestMatchers("/api/delivery/task/update", "/api/delivery/task/assign").hasRole("ADMIN")
                
                // 其他接口需要认证
                .anyRequest().authenticated()
            )
            
            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
