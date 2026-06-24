<p align="center">
  <img src="src/main/resources/static/images/logo.png" alt="EVRouter Logo" width="80">
</p>

<h1 align="center">⚡ EVRouter</h1>
<p align="center"><em>Intelligent Electric-Vehicle Delivery Management System</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.5.8-brightgreen?logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-17-orange?logo=java" alt="Java 17">
  <img src="https://img.shields.io/badge/MyBatis-3.0-blue" alt="MyBatis">
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## 📖 Overview

**EVRouter** is a full-stack web application designed for managing electric-vehicle delivery operations in urban environments. It combines real-time Amap (高德地图) route planning, DeepSeek-powered AI assistance, charging-station discovery, and role-based access control into a unified platform — making green logistics smarter and more efficient.

## ✨ Key Features

| Category | Features |
|----------|----------|
| 🗺️ **Route Planning** | Input start/end addresses, auto-calculate distance, duration, and energy consumption via Amap API |
| ⚡ **Charging Stations** | Discover nearby charging stations along the route; visual markers on the interactive map |
| 🚚 **Task Management** | Full lifecycle: create → pending → in-progress → completed; filtering and pagination |
| 🤖 **AI Assistant** | DeepSeek-powered chatbot for route optimization, weather queries, and delivery tips |
| 👥 **User System** | Registration, login, profile management with JWT authentication |
| 🔐 **RBAC** | Admin and User roles with fine-grained API permissions (`sys_role` / `sys_permission`) |
| 📊 **Admin Dashboard** | User management, task oversight, and data analytics panels |

## 🏗️ Tech Stack

```
Frontend  │  HTML5 · CSS3 · Vanilla JavaScript · Amap JS API 2.0
Backend   │  Spring Boot 3.5.8 · Spring Security · JWT (jjwt 0.12)
ORM       │  MyBatis 3.0 with XML mappers
Database  │  MySQL 8.0
AI        │  DeepSeek API (chat/completions)
Build     │  Maven
```

## 🚀 Quick Start

### Prerequisites

- **JDK 17** or higher
- **MySQL 8.0** or higher
- **Maven 3.8+**

### 1. Clone the Repository

```bash
git clone https://github.com/Su-yu-s/ev-delivery-system.git
cd ev-delivery-system
```

### 2. Set Up the Database

Run the SQL script to create tables and seed sample data:

```bash
mysql -u root -p < src/main/resources/db/psdb.sql
```

### 3. Configure Application Properties

```bash
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties
```

Edit `application.properties` with your own credentials:

```properties
# Database
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

# Amap API (get yours at https://lbs.amap.com/)
amap.key=your_amap_key
amap.security-code=your_amap_security_code

# DeepSeek API (get yours at https://platform.deepseek.com/)
deepseek.api-key=your_deepseek_api_key

# JWT
jwt.secret=your_256bit_secret_key
```

### 4. Build & Run

```bash
mvn clean package -DskipTests
java -jar target/ev-delivery-system-1.0-SNAPSHOT.jar
```

The application will start at **http://localhost:8088**.

### 5. Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `123456` |
| User | `Once` | `123456` |

## 📁 Project Structure

```
src/main/java/com/peisong/
├── EvDeliverySystemApplication.java    # Entry point
├── config/                             # Security, CORS, JWT filter, Amap config
├── controller/                         # REST controllers
├── entity/                             # POJOs (User, DeliveryTask, ChargingStation)
├── mapper/                             # MyBatis mapper interfaces
├── service/                            # Business logic interfaces & implementations
└── util/                               # JWT utility, Amap API utility

src/main/resources/
├── application.properties.example      # Configuration template
├── db/psdb.sql                          # Database schema & seed data
├── mapper/                              # MyBatis XML mappers
└── static/                              # Frontend (HTML, CSS, JS, images)
```

## 📸 Screenshots

| Home | Admin Dashboard |
|------|-----------------|
| Main page with Amap route planning, task list, and AI assistant sidebar | Admin panel for user & task management |

## 🛡️ Security

- **JWT-based authentication** with configurable expiration
- **BCrypt** password encoding via Spring Security
- **RBAC** with `sys_role`, `sys_permission`, `role_permission`, and `user_role` tables
- **CORS** and character encoding filters pre-configured
- Sensitive credentials excluded from version control via `.gitignore`

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for greener urban logistics 🌿
</p>
