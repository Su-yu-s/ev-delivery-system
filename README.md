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

### 5. Default Accounts

| Role  | Username | Password |
|-------|----------|----------|
| Admin | `admin`  | `123456` |
| User  | `Once`   | `123456` |

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

> Screenshot placeholder -- Home Page
<p align="center">
  <img src="screenshots/home.png" alt="Home Page" width="800">
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

> Screenshot placeholder -- Login Page
<p align="center">
  <img src="screenshots/login.png" alt="Login Page" width="400">
</p>

> Screenshot placeholder -- Register Page
<p align="center">
  <img src="screenshots/register.png" alt="Register Page" width="400">
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

> Screenshot placeholder -- Profile Page
<p align="center">
  <img src="screenshots/profile.png" alt="Profile Page" width="800">
</p>

---

### 4. Admin -- Data Dashboard

> **Page:** `/html/admin-dashboard.html` · **Role:** Admin only

A centralized analytics panel giving administrators an at-a-glance overview of the system.

**Key Capabilities:**
- **Statistics Cards** -- Total users, total tasks, pending tasks, completed tasks with trend indicators
- **Charts & Graphs** -- Visual breakdown of task status distribution and user activity
- **Quick Search** -- Look up users or tasks directly from the dashboard

> Screenshot placeholder -- Admin Dashboard
<p align="center">
  <img src="screenshots/admin-dashboard.png" alt="Admin Dashboard" width="800">
</p>

---

### 5. Admin -- User Management

> **Page:** `/html/admin-users.html` · **Role:** Admin only

A full CRUD interface for managing all registered users in the system.

**Key Capabilities:**
- **User Table** -- Sortable columns with ID, username, phone, email, role, status
- **Search & Filter** -- Search by username or phone; filter by role (Admin/User) or status (Active/Disabled)
- **Add User** -- Modal form for creating new users with role assignment
- **Edit User** -- Inline or modal editing of user details
- **Delete User** -- Soft-delete with confirmation dialog
- **Pagination** -- Server-side pagination for large user bases

> Screenshot placeholder -- Admin User Management
<p align="center">
  <img src="screenshots/admin-users.png" alt="Admin User Management" width="800">
</p>

---

### 6. Admin -- Task Management

> **Page:** `/html/admin-tasks.html` · **Role:** Admin only

Centralized oversight of all delivery tasks across the system, with advanced filtering and batch operations.

**Key Capabilities:**
- **All-Tasks Table** -- View every user's tasks with sortable columns (ID, itinerary, mileage, time, energy, status)
- **Advanced Filters** -- Filter by task status, date range, or specific user
- **Create Task** -- Modal form for creating new delivery tasks on behalf of any user
- **Edit Task** -- Modify task details such as itinerary, mileage, time, and energy
- **Delete Task** -- Remove tasks with confirmation
- **Status Transition** -- Manually advance task status (Pending to In-Progress to Completed)
- **Pagination** -- Efficient navigation through large task datasets

> Screenshot placeholder -- Admin Task Management
<p align="center">
  <img src="screenshots/admin-tasks.png" alt="Admin Task Management" width="800">
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
