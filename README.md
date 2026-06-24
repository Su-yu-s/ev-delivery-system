<p align="center">
  <img src="src/main/resources/static/images/logo.png" alt="EVRouter Logo" width="80">
</p>

<h1 align="center">EVRouter</h1>
<p align="center"><em>Intelligent Electric-Vehicle Delivery Management System</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.5.8-brightgreen?logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-17-orange?logo=java" alt="Java 17">
  <img src="https://img.shields.io/badge/MyBatis-3.0-blue" alt="MyBatis">
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## Overview

**EVRouter** is a full-stack web application for managing electric-vehicle delivery operations in urban environments. It combines real-time Amap route planning, DeepSeek-powered AI assistance, charging-station discovery, and RBAC into a unified platform -- making green logistics smarter and more efficient.

## Tech Stack

```
Frontend  │  HTML5 · CSS3 · Vanilla JavaScript · Amap JS API 2.0
Backend   │  Spring Boot 3.5.8 · Spring Security · JWT (jjwt 0.12)
ORM       │  MyBatis 3.0 with XML mappers
Database  │  MySQL 8.0
AI        │  DeepSeek API (chat/completions)
Build     │  Maven
```

---

## Quick Start

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

# Amap API -- get yours at https://lbs.amap.com/
amap.key=your_amap_key
amap.security-code=your_amap_security_code

# DeepSeek API -- get yours at https://platform.deepseek.com/
deepseek.api-key=your_deepseek_api_key

# JWT
jwt.secret=your_256bit_secret_key
```

### 4. Build & Run

```bash
mvn clean package -DskipTests
java -jar target/ev-delivery-system-1.0-SNAPSHOT.jar
```

The application starts at **http://localhost:8088**.

---

## Project Structure

```
src/main/java/com/peisong/
├── EvDeliverySystemApplication.java    # Spring Boot entry point
├── config/                             # Security, CORS, JWT filter, Amap config
├── controller/                         # REST API controllers
├── entity/                             # POJOs (User, DeliveryTask, ChargingStation)
├── mapper/                             # MyBatis mapper interfaces
├── service/                            # Service interfaces & implementations
└── util/                               # JWT utility, Amap API helper

src/main/resources/
├── application.properties.example      # Configuration template
├── db/psdb.sql                          # Database schema & seed data
├── mapper/                              # MyBatis XML mappers
└── static/                              # Frontend (HTML, CSS, JS, images)
```

---

## Module Walkthrough

---

### 1. Home -- Route Planning & Task Dashboard

> **Page:** `/html/index.html`

The landing page is the central hub where users plan delivery routes on an interactive Amap, manage their task list, and interact with the AI assistant.

**Key Capabilities:**
- **Interactive Map** -- Amap-powered map with real-time route rendering, drag-to-adjust waypoints, and charging-station markers along the route
- **Route Planner** -- Enter start/end addresses to auto-calculate distance, estimated time, and energy consumption
- **Task Table** -- Filterable task list (All / Pending / In-Progress / Completed) with pagination; status badges and action buttons
- **AI Assistant Sidebar** -- Collapsible chatbot panel with quick-action buttons for route planning, charging-station lookup, weather query, and optimization tips
- **Tips Carousel** -- Rotating delivery tips covering weather, energy saving, safety, charging advice, and motivational quotes


<p align="center">
<img width="2547" height="1233" alt="image" src="https://github.com/user-attachments/assets/0e28d38d-cd6e-4eef-8d30-fc64721686f7" />

</p>

---

### 2. Authentication -- Login & Register

> **Pages:** `/html/login.html` · `/html/register.html`

Clean, centered form pages with client-side validation and JWT-based authentication flow.

**Key Capabilities:**
- **Phone-number login** with password
- **Registration** with username, phone, password, and optional profile fields
- **Client-side validation** with inline error messages
- **Auto-redirect** to home page after successful login
- **Animated entrance** with fade-in-up transitions

>  -- Login Page
<p align="center">
<img width="2241" height="1051" alt="image" src="https://github.com/user-attachments/assets/3955fde3-3d35-4508-ac10-7f1b565a5113" />

</p>

> -- Register Page
<p align="center">
<img width="2499" height="1170" alt="image" src="https://github.com/user-attachments/assets/c83628ab-7448-473f-a15e-c1b9b3000579" />

</p>

---

### 3. Profile -- Personal Center

> **Page:** `/html/profile.html`

A tabbed personal center where users view and edit their account information.

**Sections:**
- **Profile Info** -- View/edit avatar, name, gender, age, email, phone number
- **Security Settings** -- Change password with old/new/confirm password validation
- **Account Management** -- View account creation time and status

**UI Features:**
- Click-to-change avatar with instant preview
- Tab-based navigation (Profile / Security / Account)
- Success/error toast notifications

> -- Profile Page
<p align="center">
<img width="2523" height="1212" alt="image" src="https://github.com/user-attachments/assets/205dfd5c-727f-4e92-ad2d-0e9b98df9ade" />

</p>

---

### 4. Admin -- Data Dashboard

> **Page:** `/html/admin-dashboard.html` · **Role:** Admin only

A centralized analytics panel giving administrators an at-a-glance overview of the system.

**Key Capabilities:**
- **Statistics Cards** -- Total users, total tasks, pending tasks, completed tasks with trend indicators
- **Charts & Graphs** -- Visual breakdown of task status distribution and user activity
- **Quick Search** -- Look up users or tasks directly from the dashboard

> r -- Admin Dashboard
<p align="center">
<img width="2535" height="1239" alt="image" src="https://github.com/user-attachments/assets/71b6c5c7-af2e-4aca-aa9c-0c6512b29c0d" />

</p>

---




## Security

- **JWT-based authentication** with configurable expiration (default 24h)
- **BCrypt** password encoding via Spring Security
- **RBAC** with 4 dedicated tables: `sys_role`, `sys_permission`, `role_permission`, `user_role`
- **CORS** and **character encoding** filters pre-configured
- Sensitive credentials excluded from version control via `.gitignore`

### Permission Matrix

| Permission      | Admin | User |
|-----------------|:-----:|:----:|
| View all users  |  Yes  |  No  |
| CRUD users      |  Yes  |  No  |
| View all tasks  |  Yes  |  No  |
| CRUD tasks      |  Yes  |  Yes |
| View stations   |  Yes  |  Yes |

---

## License

This project is licensed under the **MIT License** -- see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made for greener urban logistics
</p>
