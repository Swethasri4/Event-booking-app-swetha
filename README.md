# Event Booking Application

A full-stack web application for booking events from pre-defined calendar slots, built with **Angular 17** and **FastAPI** (Python).

---

## Quick Start (5 Minutes)

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Seed Database (First Time Only)
Open browser: **http://localhost:8000/api/seed**

Creates demo accounts:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

### 3. Frontend Setup (New Terminal)
```powershell
cd frontend
npm install
ng serve
```

### 4. Access Application
Open: **http://localhost:4200** and login!

### 5. What to Try
- **Admin**: Go to Admin Panel → Create timeslots
- **User**: Set Preferences → Book events from Calendar

---

## Project Overview

This application allows users to:
- View event timeslots in a weekly calendar view
- Select event category preferences
- Book and cancel event timeslots
- Admin functionality to create and manage timeslots

## Features

### User Features
- **User Preferences**: Select interested event categories (Cat 1, Cat 2, Cat 3)
- **Calendar View**: 
  - Week-scoped calendar display
  - Navigate between weeks
  - Filter by category preferences
  - Book available timeslots
  - Cancel your own bookings
  - View booking status (available/booked)
- **Authentication**: Secure login and registration

### Admin Features
- **Admin Panel**: Create new timeslots for different categories
- **Timeslot Management**: View all timeslots and their booking status
- **User Tracking**: See which user booked each timeslot

### Technical Features
- **Concurrent Booking Prevention**: Only one user can book each timeslot (database-enforced)
- **Real-time Updates**: Calendar refreshes after booking/canceling
- **Responsive Design**: Works on desktop, tablet, and mobile
- **RESTful API**: Clean API architecture with automatic documentation
- **Type Safety**: TypeScript (frontend) and Pydantic (backend)
- **Material Design**: Professional UI with Angular Material

## Tech Stack

### Frontend
- **Framework**: Angular 17
- **UI Library**: Angular Material
- **Language**: TypeScript
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient
- **Styling**: SCSS

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (development), PostgreSQL-ready (production)

## Prerequisites

- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **Python**: 3.10+ ([Download](https://www.python.org/downloads/))
- **Angular CLI**: `npm install -g @angular/cli`
- **Git**: For cloning the repository

## Installation & Setup

### 1. Clone the Repository

```powershell
git clone <repository-url>
```

### 2. Backend Setup (FastAPI)

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database and seed data
# (On first run, database will be created automatically)
```

### 3. Frontend Setup (Angular)

```powershell
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend Server

```powershell
# From backend directory
cd backend

# Activate virtual environment (if not already activated)
.\venv\Scripts\Activate.ps1

# Run FastAPI server
uvicorn main:app --reload
```

**Backend will run on**: `http://localhost:8000`
**API Documentation (Swagger)**: `http://localhost:8000/docs`

### Start Frontend Server

```powershell
# From frontend directory (in a new terminal)
cd frontend

# Run Angular development server
ng serve
```

**Frontend will run on**: `http://localhost:4200`

## Default Accounts

The application comes with pre-seeded demo accounts:

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Permissions**: Can create timeslots, view all bookings

### Regular User Account
- **Email**: `user@example.com`
- **Password**: `user123`
- **Permissions**: Can book/cancel timeslots, set preferences

### Creating New Accounts
You can register new accounts through the registration page with custom credentials.

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category (Admin) |

### Timeslot Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timeslots` | Get timeslots (with filters) |
| POST | `/api/timeslots` | Create timeslot (Admin) |
| DELETE | `/api/timeslots/{id}` | Delete timeslot (Admin) |

**Query Parameters for GET /api/timeslots:**
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `category_ids`: Comma-separated category IDs (e.g., "1,2,3")

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user's bookings |
| POST | `/api/bookings` | Create a booking |
| DELETE | `/api/bookings/{id}` | Cancel a booking |

### User Preferences Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/preferences` | Get user preferences |
| PUT | `/api/user/preferences` | Update user preferences |

## 🗄️ Database Schema

### User
- `id`: Integer (Primary Key)
- `email`: String (Unique)
- `name`: String
- `hashed_password`: String
- `is_admin`: Boolean
- `created_at`: DateTime

### Category
- `id`: Integer (Primary Key)
- `name`: String (Unique)
- `description`: String
- `color`: String (Hex color code)

### TimeSlot
- `id`: Integer (Primary Key)
- `category_id`: Integer (Foreign Key)
- `title`: String
- `description`: String
- `start_time`: DateTime
- `end_time`: DateTime
- `created_by`: Integer (Foreign Key to User)
- `created_at`: DateTime

### Booking
- `id`: Integer (Primary Key)
- `timeslot_id`: Integer (Foreign Key, **Unique**)
- `user_id`: Integer (Foreign Key)
- `booked_at`: DateTime

**Note**: The `timeslot_id` has a unique constraint ensuring only one booking per timeslot.

## Project Structure

```
Book_App/
├── backend/
│   ├── main.py                 # FastAPI application & routes
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── auth.py                 # Authentication logic
│   ├── database.py             # Database configuration
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables
│   └── event_booking.db        # SQLite database (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── login/          # Login & Registration
│   │   │   │   ├── calendar/       # Main calendar view
│   │   │   │   ├── preferences/    # User preferences
│   │   │   │   └── admin/          # Admin panel
│   │   │   ├── services/           # API services
│   │   │   ├── models/             # TypeScript interfaces
│   │   │   ├── guards/             # Route guards
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   ├── app.component.*     # Root component
│   │   │   ├── app.module.ts       # App module
│   │   │   └── app-routing.module.ts # Routing config
│   │   ├── environments/           # Environment configs
│   │   ├── styles.scss             # Global styles
│   │   └── index.html              # Entry HTML
│   ├── angular.json                # Angular configuration
│   ├── package.json                # npm dependencies
│   └── tsconfig.json               # TypeScript config
│
├── TECHNICAL_DECISIONS_GUIDE.md   # L3 Interview prep guide
└── README.md                       # This file
```

## Design Decisions

### Why FastAPI over Django/Flask?

**Modern & Fast**: Async support, high performance comparable to Node.js
**Auto Documentation**: Automatic Swagger UI generation for API testing
**Type Safety**: Python type hints provide better code quality
**Easy to Learn**: Clean, intuitive syntax
**Perfect for Angular**: RESTful API with automatic validation

### Why Angular with Material?

**Full Framework**: Complete solution with routing, forms, HTTP built-in
**TypeScript First**: Strong typing for better maintainability
**Material Design**: Professional UI components out-of-the-box
**Enterprise Ready**: Backed by Google, proven in large-scale apps

### Key Architectural Patterns

1. **RESTful API Design**: Stateless, scalable communication
2. **JWT Authentication**: Secure, token-based auth
3. **Component-Based UI**: Reusable Angular components
4. **Service Layer**: Centralized API communication
5. **Route Guards**: Protect authenticated routes
6. **HTTP Interceptors**: Automatic token injection
7. **Database Constraints**: Ensure data integrity

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password storage
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Pydantic validation on backend
- **SQL Injection Prevention**: SQLAlchemy ORM
- **Route Protection**: Auth and admin guards
- **Unique Constraints**: Database-level booking enforcement

---
