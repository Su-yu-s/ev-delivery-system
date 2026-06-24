package com.peisong.entity;

import java.io.Serializable;

/**
 * 通用响应类
 */
public class Response<T> implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Integer code;      // 响应码，200表示成功，非200表示失败
    private String message;    // 响应消息
    private T data;            // 响应数据
    
    // 构造方法
    public Response() {
    }
    
    public Response(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public Response(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
    
    // 成功响应
    public static <T> Response<T> success() {
        return new Response<>(200, "success");
    }
    
    public static <T> Response<T> success(T data) {
        return new Response<>(200, "success", data);
    }
    
    // 失败响应
    public static <T> Response<T> fail(Integer code, String message) {
        return new Response<>(code, message);
    }
    
    public static <T> Response<T> fail(String message) {
        return new Response<>(500, message);
    }
    
    // Getter and Setter methods
    public Integer getCode() {
        return code;
    }
    
    public void setCode(Integer code) {
        this.code = code;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    @Override
    public String toString() {
        return "Response{" +
                "code=" + code +
                ", message='" + message + '\'' +
                ", data=" + data +
                '}';
    }
}