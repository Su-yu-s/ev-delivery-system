/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50722
Source Host           : localhost:3306
Source Database       : psdb

Target Server Type    : MYSQL
Target Server Version : 50722
File Encoding         : 65001

Date: 2026-01-18 18:09:25
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `delivery_task`
-- ----------------------------
DROP TABLE IF EXISTS `delivery_task`;
CREATE TABLE `delivery_task` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itinerary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mileage` double DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `energy` double DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `start_addr` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_addr` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_delivery_task_status` (`status`),
  KEY `idx_delivery_task_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of delivery_task
-- ----------------------------
INSERT INTO `delivery_task` VALUES ('PSRW_000EA03B', '南京 -> 上海', '269.66', '323', '53.93', '待配送', '2026-01-18 10:06:20', null, null, '南京', '上海', 'USER001');
INSERT INTO `delivery_task` VALUES ('PSRW_001', '北京市朝阳区→北京市海淀区', '25.5', '45', '15.2', '待配送', '2025-11-18 15:36:03', null, null, '北京市朝阳区建国门外大街1号', '北京市海淀区中关村大街1号', 'USER001');
INSERT INTO `delivery_task` VALUES ('PSRW_002', '上海市黄浦区→上海市浦东新区', '18.3', '35', '11.8', '待配送', '2025-11-21 16:38:11', '2025-11-22 19:18:33', null, '上海市黄浦区南京东路1号', '上海市浦东新区陆家嘴环路1号', 'USER002');
INSERT INTO `delivery_task` VALUES ('PSRW_003', '广州市天河区→广州市越秀区', '12.7', '25', '8.5', '配送完成', '2025-11-22 14:20:29', null, null, '广州市天河区天河路1号', '广州市越秀区中山五路1号', 'USER003');
INSERT INTO `delivery_task` VALUES ('PSRW_004', '深圳市南山区→深圳市福田区', '15.8', '30', '9.7', '待配送', '2025-11-22 13:47:45', null, null, '深圳市南山区深南大道1号', '深圳市福田区福华路1号', 'USER004');
INSERT INTO `delivery_task` VALUES ('PSRW_005', '北京市西城区→北京市东城区', '8.2', '20', '5.1', '待配送', '2025-11-18 15:36:03', null, null, '北京市西城区金融大街1号', '北京市东城区王府井大街1号', 'USER005');
INSERT INTO `delivery_task` VALUES ('PSRW_006', '上海市静安区→上海市长宁区', '10.5', '25', '6.8', '待配送', '2025-11-21 16:38:11', null, null, '上海市静安区南京西路1号', '上海市长宁区延安西路1号', 'USER007');
INSERT INTO `delivery_task` VALUES ('PSRW_007', '广州市白云区→广州市荔湾区', '14.3', '30', '9.2', '配送完成', '2025-11-22 14:20:29', null, null, '广州市白云区机场路1号', '广州市荔湾区上下九路1号', 'USER008');
INSERT INTO `delivery_task` VALUES ('PSRW_008', '深圳市宝安区→深圳市龙岗区', '22.7', '40', '13.5', '待配送', '2025-11-22 13:47:45', null, null, '深圳市宝安区宝安大道1号', '深圳市龙岗区龙岗大道1号', 'USER009');
INSERT INTO `delivery_task` VALUES ('PSRW_009', '杭州市西湖区→杭州市滨江区', '16.5', '32', '10.8', '待配送', '2025-11-18 15:36:03', null, null, '杭州市西湖区文三路1号', '杭州市滨江区滨盛路1号', 'USER010');
INSERT INTO `delivery_task` VALUES ('PSRW_010', '成都市武侯区→成都市高新区', '13.8', '28', '8.9', '待配送', '2025-11-21 16:38:11', null, null, '成都市武侯区科华北路1号', '成都市高新区天府大道1号', 'USER011');
INSERT INTO `delivery_task` VALUES ('PSRW_011', '武汉市江汉区→武汉市洪山区', '19.2', '36', '12.3', '配送完成', '2025-11-22 14:20:29', null, null, '武汉市江汉区解放大道1号', '武汉市洪山区珞喻路1号', 'USER012');
INSERT INTO `delivery_task` VALUES ('PSRW_012', '西安市雁塔区→西安市碑林区', '11.6', '24', '7.5', '待配送', '2025-11-22 13:47:45', null, null, '西安市雁塔区科技路1号', '西安市碑林区南大街1号', 'USER013');
INSERT INTO `delivery_task` VALUES ('PSRW_013', '南京市鼓楼区→南京市玄武区', '9.8', '22', '6.2', '待配送', '2025-11-18 15:36:03', null, null, '南京市鼓楼区中山路1号', '南京市玄武区珠江路1号', 'USER001');
INSERT INTO `delivery_task` VALUES ('PSRW_014', '苏州市姑苏区→苏州市工业园区', '17.4', '34', '11.5', '待配送', '2025-11-21 16:38:11', null, null, '苏州市姑苏区观前街1号', '苏州市工业园区星湖街1号', 'USER002');
INSERT INTO `delivery_task` VALUES ('PSRW_015', '重庆市渝中区→重庆市江北区', '14.7', '29', '9.4', '配送完成', '2025-11-22 14:20:29', null, null, '重庆市渝中区解放碑1号', '重庆市江北区观音桥1号', 'USER003');
INSERT INTO `delivery_task` VALUES ('PSRW_016', '天津市和平区→天津市河西区', '10.2', '23', '6.5', '待配送', '2025-11-22 13:47:45', null, null, '天津市和平区南京路1号', '天津市河西区友谊路1号', 'USER004');
INSERT INTO `delivery_task` VALUES ('PSRW_017', '长沙市岳麓区→长沙市芙蓉区', '15.9', '31', '10.2', '待配送', '2025-11-18 15:36:03', null, null, '长沙市岳麓区麓山南路1号', '长沙市芙蓉区五一大道1号', 'USER005');
INSERT INTO `delivery_task` VALUES ('PSRW_TEST_001', '南京市鼓楼区→南京市秦淮区', '8', '20', '5', '待配送', '2025-11-22 14:20:29', null, null, '南京市鼓楼区', '南京市秦淮区', 'USER007');

-- ----------------------------
-- Table structure for `role_permission`
-- ----------------------------
DROP TABLE IF EXISTS `role_permission`;
CREATE TABLE `role_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_perm` (`role_id`,`permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of role_permission
-- ----------------------------
INSERT INTO `role_permission` VALUES ('1', '1', '1', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('2', '1', '2', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('3', '1', '3', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('4', '1', '4', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('5', '1', '5', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('6', '1', '6', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('7', '1', '7', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('8', '1', '8', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('9', '1', '9', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('10', '1', '10', '2026-01-17 18:54:03');
INSERT INTO `role_permission` VALUES ('16', '2', '10', '2026-01-17 18:54:09');
INSERT INTO `role_permission` VALUES ('17', '2', '9', '2026-01-17 18:54:09');
INSERT INTO `role_permission` VALUES ('18', '2', '6', '2026-01-17 18:54:09');
INSERT INTO `role_permission` VALUES ('19', '2', '5', '2026-01-17 18:54:09');
INSERT INTO `role_permission` VALUES ('20', '2', '7', '2026-01-17 18:54:09');
INSERT INTO `role_permission` VALUES ('21', '2', '2', '2026-01-17 18:54:09');
INSERT INTO `role_permission` VALUES ('22', '2', '3', '2026-01-17 18:54:09');

-- ----------------------------
-- Table structure for `sys_permission`
-- ----------------------------
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `perm_code` varchar(50) NOT NULL,
  `perm_name` varchar(100) NOT NULL,
  `resource_type` varchar(20) DEFAULT 'api',
  `url` varchar(200) DEFAULT NULL,
  `parent_id` int(11) DEFAULT '0',
  `sort_order` int(11) DEFAULT '0',
  `status` tinyint(4) DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `perm_code` (`perm_code`),
  KEY `idx_perm_code` (`perm_code`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_permission
-- ----------------------------
INSERT INTO `sys_permission` VALUES ('1', 'user:list', 'userlist', 'api', '/api/user/list', '0', '1', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('2', 'user:get', 'userget', 'api', '/api/user/get/*', '0', '2', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('3', 'user:update', 'userupdate', 'api', '/api/user/update', '0', '3', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('4', 'user:delete', 'userdelete', 'api', '/api/user/delete/*', '0', '4', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('5', 'task:list', 'tasklist', 'api', '/api/task/list', '0', '10', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('6', 'task:create', 'taskcreate', 'api', '/api/task/create', '0', '11', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('7', 'task:update', 'taskupdate', 'api', '/api/task/update', '0', '12', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('8', 'task:delete', 'taskdelete', 'api', '/api/task/delete/*', '0', '13', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('9', 'station:list', 'stationlist', 'api', '/api/station/list', '0', '20', '1', '2026-01-17 18:53:58');
INSERT INTO `sys_permission` VALUES ('10', 'station:get', 'stationget', 'api', '/api/station/get/*', '0', '21', '1', '2026-01-17 18:53:58');

-- ----------------------------
-- Table structure for `sys_role`
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_code` varchar(20) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_code` (`role_code`),
  KEY `idx_role_code` (`role_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
INSERT INTO `sys_role` VALUES ('1', 'ADMIN', 'admin', 'admin', '1', '2026-01-17 18:53:50');
INSERT INTO `sys_role` VALUES ('2', 'USER', 'user', 'user', '1', '2026-01-17 18:53:50');

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` tinyint(4) DEFAULT '0',
  `age` int(11) DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint(4) DEFAULT '1',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'USER' COMMENT '??????',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_user_username` (`username`),
  KEY `idx_user_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('ADMIN001', 'admin', '19851663610', 'e10adc3949ba59abbe56e057f20f883e', 'admin', '1', '30', null, 'admin@peisong.com', '2026-01-17 18:48:52', '2026-01-18 09:47:38', '1', 'ADMIN');
INSERT INTO `user` VALUES ('USER001', 'Once', '19851663611', 'e10adc3949ba59abbe56e057f20f883e', '苏', '1', '20', null, 'admin@example.com', '2025-11-18 23:12:23', '2026-01-18 15:44:38', '1', 'USER');
INSERT INTO `user` VALUES ('USER002', 'driver1', '13800138001', 'e10adc3949ba59abbe56e057f20f883e', '张三', '1', '28', null, 'driver1@example.com', '2025-11-18 23:12:23', '2025-11-23 17:59:25', '1', 'USER');
INSERT INTO `user` VALUES ('USER003', 'driver2', '13800138002', 'e10adc3949ba59abbe56e057f20f883e', '李四', '1', '32', null, 'driver2@example.com', '2025-11-18 23:12:23', '2025-11-23 17:59:25', '1', 'USER');
INSERT INTO `user` VALUES ('USER004', 'testuser002', '13800138004', 'e10adc3949ba59abbe56e057f20f883e', 'test2', null, null, null, null, '2025-11-21 18:36:43', '2025-11-23 17:59:25', '1', 'USER');
INSERT INTO `user` VALUES ('USER005', 'testuser001', '13800138003', 'e10adc3949ba59abbe56e057f20f883e', 'test2', null, null, null, null, '2025-11-21 18:34:15', '2025-11-23 17:59:25', '1', 'USER');
INSERT INTO `user` VALUES ('USER007', '12345678910', '12345678910', 'e10adc3949ba59abbe56e057f20f883e', '用户8910', null, null, null, null, '2025-11-21 15:04:19', '2025-11-23 17:59:25', '1', 'USER');
INSERT INTO `user` VALUES ('USER008', '13815352577', '13815352577', 'e10adc3949ba59abbe56e057f20f883e', '用户2577', null, null, null, null, '2025-11-21 22:21:30', '2025-11-23 17:59:25', '1', 'USER');
INSERT INTO `user` VALUES ('USER009', '13815352575', '13815352575', 'e10adc3949ba59abbe56e057f20f883e', '用户2575', null, null, null, null, '2025-11-21 22:27:37', '2025-11-23 17:59:25', '1', 'USER');
INSERT INTO `user` VALUES ('USER010', '17321667661', '17321667661', 'e10adc3949ba59abbe56e057f20f883e', '用户7661', null, null, null, null, '2025-11-23 18:00:31', '2025-11-23 18:00:31', '1', 'USER');
INSERT INTO `user` VALUES ('USER011', '13900000001', '13900000001', 'e10adc3949ba59abbe56e057f20f883e', '用户0001', null, null, null, null, '2025-11-23 18:03:21', '2025-11-23 18:03:21', '1', 'USER');
INSERT INTO `user` VALUES ('USER012', '13912345678', '13912345678', 'e10adc3949ba59abbe56e057f20f883e', '用户5678', null, null, null, null, '2025-11-25 18:04:44', '2025-11-25 18:04:44', '1', 'USER');
INSERT INTO `user` VALUES ('USER013', '17321667660', '17321667660', 'e10adc3949ba59abbe56e057f20f883e', '用户7660', null, null, null, null, '2025-11-25 18:05:12', '2025-11-25 18:05:12', '1', 'USER');

-- ----------------------------
-- Table structure for `user_role`
-- ----------------------------
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `role_id` int(11) NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of user_role
-- ----------------------------
INSERT INTO `user_role` VALUES ('1', 'ADMIN001', '1', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('2', 'USER001', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('3', 'USER002', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('4', 'USER003', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('5', 'USER004', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('6', 'USER005', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('7', 'USER007', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('8', 'USER008', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('9', 'USER009', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('10', 'USER010', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('11', 'USER011', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('12', 'USER012', '2', '2026-01-17 18:54:46');
INSERT INTO `user_role` VALUES ('13', 'USER013', '2', '2026-01-17 18:54:46');
