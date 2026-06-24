package com.peisong.entity;

import java.io.Serializable;
import java.util.Date;

/**
 * 配送任务实体类
 */
public class DeliveryTask implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String id;         // 任务ID
    private String itinerary;  // 行程路线
    private Double mileage;    // 里程（公里）
    private Integer time;      // 预计时间（分钟）
    private Double energy;     // 耗电量（百分比）
    private String status;     // 配送状态（待配送、配送中、配送完成）
    private Date createTime;   // 创建时间
    private Date startTime;    // 开始配送时间
    private Date endTime;      // 完成配送时间
    private String startAddr;  // 起点地址
    private String endAddr;    // 终点地址
    private String userId;     // 用户ID
    
    // Getter and Setter methods
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getItinerary() {
        return itinerary;
    }
    
    public void setItinerary(String itinerary) {
        this.itinerary = itinerary;
    }
    
    public Double getMileage() {
        return mileage;
    }
    
    public void setMileage(Double mileage) {
        this.mileage = mileage;
    }
    
    public Integer getTime() {
        return time;
    }
    
    public void setTime(Integer time) {
        this.time = time;
    }
    
    public Double getEnergy() {
        return energy;
    }
    
    public void setEnergy(Double energy) {
        this.energy = energy;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Date getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }
    
    public Date getStartTime() {
        return startTime;
    }
    
    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }
    
    public Date getEndTime() {
        return endTime;
    }
    
    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }
    
    public String getStartAddr() {
        return startAddr;
    }
    
    public void setStartAddr(String startAddr) {
        this.startAddr = startAddr;
    }
    
    public String getEndAddr() {
        return endAddr;
    }
    
    public void setEndAddr(String endAddr) {
        this.endAddr = endAddr;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    @Override
    public String toString() {
        return "DeliveryTask{" +
                "id='" + id + '\'' +
                ", itinerary='" + itinerary + '\'' +
                ", mileage=" + mileage +
                ", time=" + time +
                ", energy=" + energy +
                ", status='" + status + '\'' +
                ", createTime=" + createTime +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", startAddr='" + startAddr + '\'' +
                ", endAddr='" + endAddr + '\'' +
                ", userId='" + userId + '\'' +
                '}';
    }
}