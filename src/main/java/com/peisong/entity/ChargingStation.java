package com.peisong.entity;

import java.io.Serializable;

/**
 * 充电站点实体类
 */
public class ChargingStation implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String id;         // 站点ID
    private String name;       // 站点名称
    private String address;    // 站点地址
    private Double longitude;  // 经度
    private Double latitude;   // 纬度
    private String phone;      // 联系电话
    private String status;     // 站点状态（开放、关闭、维护）
    private Integer availableCount; // 可用充电桩数量
    private Integer totalCount;    // 总充电桩数量
    private String businessHours;  // 营业时间
    
    // Getter and Setter methods
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getAvailableCount() {
        return availableCount;
    }
    
    public void setAvailableCount(Integer availableCount) {
        this.availableCount = availableCount;
    }
    
    public Integer getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
    
    public String getBusinessHours() {
        return businessHours;
    }
    
    public void setBusinessHours(String businessHours) {
        this.businessHours = businessHours;
    }
    
    @Override
    public String toString() {
        return "ChargingStation{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", longitude=" + longitude +
                ", latitude=" + latitude +
                ", phone='" + phone + '\'' +
                ", status='" + status + '\'' +
                ", availableCount=" + availableCount +
                ", totalCount=" + totalCount +
                ", businessHours='" + businessHours + '\'' +
                '}';
    }
}