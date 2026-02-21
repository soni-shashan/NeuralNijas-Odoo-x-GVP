# FleetFlow — Fleet & Logistics Management System

A production-ready full-stack Fleet Management System built with **React**, **Node.js**, **Express.js**, and **PostgreSQL (Sequelize)**. This enterprise-grade application provides comprehensive fleet operations management including vehicle tracking, trip dispatching, maintenance scheduling, expense tracking, driver performance monitoring, and real-time analytics.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Quick Start](#quick-start)
5. [Project Structure](#project-structure)
6. [Environment Variables](#environment-variables)
7. [Frontend](#frontend)
8. [Backend](#backend)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [User Roles & Permissions](#user-roles--permissions)
12. [Authentication Flow](#authentication-flow)
13. [Screenshots](#screenshots)
14. [Seed & Demo Data](#seed--demo-data)
15. [Contributing](#contributing)

---

## Overview

FleetFlow is a comprehensive Fleet & Logistics Management platform designed to streamline fleet operations for logistics companies, delivery services, and transportation businesses. It provides:

- **Admin Portal** — Full control over vehicles, trips, maintenance, drivers, expenses, and analytics
- **Dispatcher Portal** — Manage assigned trips and log expenses with role-restricted access

The system implements real-world fleet management workflows including vehicle lifecycle management, trip status transitions, automated maintenance tracking, fuel efficiency analytics, and CSV data export capabilities.

---

## Features

### Vehicle Registry
- Full CRUD operations for fleet vehicles
- Track registration number, make, model, year, fuel type, and odometer
- Vehicle status lifecycle: `available` → `on-trip` → `in-shop` → `idle` → `retired`
- Maximum load capacity tracking (in tons)
- Region-based fleet organization
- Search and filter by type (truck/van/bike), status, and keyword

### Trip Dispatching
- Create and manage trips with origin, destination, cargo, and driver assignment
- **Smart resource allocation** — only shows available vehicles and on-duty drivers
- **Overload protection** — warns when cargo weight exceeds vehicle capacity
- **License validation** — blocks assignment of drivers with expired licenses or suspended status
- Auto-generated trip numbers
- Trip status workflow: `draft` → `dispatched` → `completed` / `cancelled`
- Vehicle automatically marked as `on-trip` when dispatched, released on completion/cancellation

### Maintenance & Service Management
- 9 issue categories: Engine, Brakes, Tires, Electrical, Transmission, Oil Change, Inspection, Bodywork, Other
- Auto-generated log numbers
- Vehicles automatically moved to `in-shop` status when a log is created
- Vehicles released back to `available` when all open logs are completed
- Status workflow: `new` → `in-progress` → `completed`
- Cost tracking per service log

### Expense & Fuel Tracking
- Link expenses to completed trips and vehicles
- 5 expense types: Fuel, Toll, Repair, Parking, Misc
- Fuel-specific fields: liters consumed, fuel cost, distance traveled
- Auto-calculated total amount (fuel cost + misc expense)
- **Per-vehicle cost summary** — aggregates fuel, misc, and maintenance costs into total operational cost
- Filter and search across all expense records

### Driver Performance & Compliance
- Track all dispatchers as drivers with performance metrics
- **License management** — license number, expiry date, expired license detection
- **Safety scoring** — 0–100 safety score with color-coded indicators
- **Complaint tracking** — count and monitor driver complaints
- **Trip completion rate** — calculated from total/completed/cancelled trips
- **Duty status management** — toggle between on-duty, off-duty, and suspended
- Drivers with expired licenses are automatically blocked from new trip assignments

### Analytics & Reporting
- **KPI Dashboard** — Total fuel cost, fleet ROI, utilization rate, completed vs total trips
- **Fuel Efficiency** — km/L ranking per vehicle (horizontal bar chart)
- **Top 5 Costliest Vehicles** — ranked by total expense + maintenance cost
- **Monthly Financial Summary** — revenue, fuel cost, maintenance cost, net profit by month
- **CSV Export** — download expenses, maintenance logs, or trip data as CSV files

### Dashboard (Command Center)
- Real-time KPI cards: Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo
- Searchable, filterable trip list with pagination
- Vehicle type, status, and region filters
- Role-aware views (dispatchers see only their own trips)

### Authentication & Security
- **Email OTP verification** — 6-digit OTP sent via Gmail SMTP on registration
- **JWT-based authentication** — 24-hour token expiry (configurable)
- **Role-based access control** — Admin and Dispatcher roles with granular permissions
- **Password hashing** — bcrypt with automatic hashing on user creation
- OTP resend with 60-second cooldown
- Auto-redirect on 401 (expired/invalid token)

---

## Technology Stack

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | React | 19.2.0 |
| **Build Tool** | Vite | 7.3.1 |
| **Styling** | Tailwind CSS | 3.4.19 |
| **HTTP Client** | Axios | 1.13.5 |
| **Routing** | React Router DOM | 7.13.0 |
| **Charts** | Recharts | 3.7.0 |
| **Icons** | React Icons (Heroicons) | 5.5.0 |
| **Notifications** | React Hot Toast | 2.6.0 |

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | Latest LTS |
| **Framework** | Express.js | 4.22.1 |
| **ORM** | Sequelize | 6.37.7 |
| **Database** | PostgreSQL | 13+ |
| **Authentication** | JSON Web Token | 9.0.3 |
| **Encryption** | bcryptjs | 3.0.3 |
| **Validation** | express-validator | 7.3.1 |
| **Email** | Nodemailer | 8.0.1 |
| **Security** | Helmet | 8.1.0 |
| **Logging** | Morgan | 1.10.1 |

---

## Quick Start

### Prerequisites

- **Node.js** v18+ (recommended)
- **PostgreSQL** v13+
- **npm** or **yarn**
- **Gmail account** with App Password (for OTP emails)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd FleetFlow
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and email credentials (see Environment Variables section)

# Start the server (auto-creates tables & seeds demo accounts)
npm start

# Or for development with auto-reload
npm run dev

# (Optional) Seed full dummy data for testing
npm run db:seed
```

### Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| API Health Check | http://localhost:5000/api/health |

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin.manager@fleetflow.com` | `admin123` |
| **Dispatcher** | `dispatchers@fleetflow.com` | `user123` |

> These demo accounts are auto-created on server startup and are pre-verified (no OTP needed).

---

## Project Structure

```
FleetFlow/
├── frontend/                          # React Frontend Application
│   ├── public/
│   │   └── favicon.svg               # FleetFlow truck icon
│   ├── src/
│   │   ├── App.jsx                   # Route definitions & auth guards
│   │   ├── main.jsx                  # Application entry point
│   │   ├── index.css                 # Global styles & Tailwind imports
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx   # Sidebar + content layout wrapper
│   │   │   └── Sidebar.jsx           # Collapsible navigation sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # JWT auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Split-screen login with demo creds
│   │   │   ├── Register.jsx          # Role-based registration form
│   │   │   ├── VerifyOTP.jsx         # 6-digit OTP verification
│   │   │   ├── Dashboard.jsx         # Command center with KPIs & trips
│   │   │   ├── VehicleRegistry.jsx   # Vehicle CRUD management
│   │   │   ├── TripDispatcher.jsx    # Trip lifecycle management
│   │   │   ├── Maintenance.jsx       # Service log tracker
│   │   │   ├── ExpenseFuelLog.jsx    # Expense & fuel tracking
│   │   │   ├── DriverPerformance.jsx # Driver compliance monitoring
│   │   │   └── Analytics.jsx         # Charts, KPIs & CSV export
│   │   └── services/
│   │       └── api.js                # Axios instance & API modules
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                           # Node.js Backend API
│   ├── server.js                     # Express app entry & server startup
│   ├── config/
│   │   └── database.js               # Sequelize + PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js         # Register, login, OTP, profile
│   │   ├── dashboardController.js    # Stats, trips, vehicle summary
│   │   ├── vehicleController.js      # Vehicle CRUD + status toggle
│   │   ├── tripController.js         # Trip CRUD + status transitions
│   │   ├── maintenanceController.js  # Service logs + vehicle status
│   │   ├── expenseController.js      # Expenses + cost summary
│   │   ├── driverController.js       # Driver list + profile updates
│   │   └── analyticsController.js    # KPIs, charts, CSV export
│   ├── middleware/
│   │   └── auth.js                   # JWT authenticate + role authorize
│   ├── models/
│   │   ├── index.js                  # Model associations & exports
│   │   ├── User.js                   # User/Driver model
│   │   ├── Vehicle.js                # Vehicle model
│   │   ├── Trip.js                   # Trip model
│   │   ├── Expense.js                # Expense model
│   │   └── MaintenanceLog.js         # Maintenance log model
│   ├── routes/
│   │   ├── auth.js                   # /api/auth/*
│   │   ├── dashboard.js              # /api/dashboard/*
│   │   ├── vehicles.js               # /api/vehicles/*
│   │   ├── trips.js                  # /api/trips/*
│   │   ├── maintenance.js            # /api/maintenance/*
│   │   ├── expenses.js               # /api/expenses/*
│   │   ├── drivers.js                # /api/drivers/*
│   │   └── analytics.js              # /api/analytics/*
│   ├── utils/
│   │   ├── emailService.js           # OTP generation & Gmail SMTP
│   │   ├── jwtHelper.js              # JWT sign & verify
│   │   ├── seed.js                   # Demo account seeder (auto-run)
│   │   └── seedDummyData.js          # Full dummy data seeder
│   └── package.json
│
└── README.md                          # This file
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleetflow
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=5000

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRES_IN=24h

# Email (Gmail SMTP for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@fleetflow.com
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords to generate one.

### Frontend

The API base URL is configured in `frontend/src/services/api.js`:
```js
const API = axios.create({ baseURL: 'http://localhost:5000/api' });
```

---

## Frontend

### Pages & Features

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Split-screen login with animated gradient, demo credential quick-fill buttons |
| **Register** | `/register` | Role-based registration (Admin gets Company/Department fields) |
| **Verify OTP** | `/verify-otp` | 6-digit individual input boxes with auto-focus, paste support, 60s resend cooldown |
| **Dashboard** | `/dashboard` | KPI cards (Active Fleet, Maintenance Alerts, Utilization, Pending Cargo) + searchable trip table |
| **Vehicle Registry** | `/vehicles` | Full CRUD table with type icons, status badges, search/filter, edit/delete modals |
| **Trip Dispatcher** | `/trips` | Trip lifecycle table with inline status actions, smart vehicle/driver selection modal |
| **Maintenance** | `/maintenance` | Service log tracker with 9 issue types, workflow buttons, auto vehicle status sync |
| **Expense & Fuel** | `/expenses` | Expense table + per-vehicle cost summary cards, link expenses to completed trips |
| **Driver Performance** | `/performance` | Driver compliance table with license expiry alerts, safety scores, inline duty toggle |
| **Analytics** | `/analytics` | KPI cards + Recharts bar charts + monthly financial table + CSV export |

### UI Design System

- **Dark glassmorphism theme** — semi-transparent cards with backdrop blur (`bg-white/[0.03]`, `border-white/[0.06]`)
- **Custom color palette** (`fleet-bg`, `fleet-card`, `fleet-accent`, etc.) defined in Tailwind config
- **Inter font family** with custom weight scale
- **Consistent patterns** across all pages: search bar → collapsible filter panel → paginated table → modal forms
- **Color-coded status badges** — green (success), blue (active), amber (warning), red (danger)
- **Responsive design** — collapsible sidebar, mobile hamburger menu, responsive grid layouts
- **Fade-in animations** on page transitions

### Running Frontend

```bash
cd frontend
npm install
npm run dev        # Development mode (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint check
```

---

## Backend

### Key Features

1. **RESTful API** — Full CRUD with proper HTTP status codes and consistent JSON responses
2. **Sequelize ORM** — Auto-creates and syncs PostgreSQL tables on startup (`sequelize.sync({ alter: true })`)
3. **Authentication** — JWT Bearer tokens with email OTP verification
4. **Authorization** — Role-based middleware (`authenticate` + `authorize('admin')`)
5. **Business Logic** — Vehicle capacity validation, license expiry checks, trip status state machine, auto vehicle status sync
6. **Pagination** — All list endpoints support `page` and `limit` query params
7. **Search & Filter** — Case-insensitive search (Sequelize `iLike`) with multi-field filters
8. **CSV Export** — Download expenses, maintenance, or trip data as CSV
9. **Security** — Helmet headers, CORS, bcrypt password hashing, Morgan request logging

### Running Backend

```bash
cd backend
npm install
npm start          # Start server (creates tables + seeds demo accounts)
npm run dev        # Development with nodemon auto-reload
npm run db:seed    # Seed full dummy data (12 vehicles, 4 drivers, 17 trips, etc.)
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user + send OTP email |
| POST | `/api/auth/verify-otp` | Public | Verify 6-digit OTP, get JWT |
| POST | `/api/auth/login` | Public | Login with email/password, get JWT |
| POST | `/api/auth/resend-otp` | Public | Resend OTP to unverified user |
| GET | `/api/auth/me` | Authenticated | Get current user profile |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | Authenticated | Fleet KPIs (active, maintenance, idle, pending) |
| GET | `/api/dashboard/trips` | Authenticated | Paginated trip list with filters |
| GET | `/api/dashboard/vehicles` | Authenticated | Vehicle summary for dropdowns |

### Vehicles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/vehicles/` | Admin | Paginated vehicle list with search/filter |
| GET | `/api/vehicles/:id` | Admin | Get single vehicle |
| POST | `/api/vehicles/` | Admin | Create new vehicle |
| PUT | `/api/vehicles/:id` | Admin | Update vehicle |
| PATCH | `/api/vehicles/:id/toggle-status` | Admin | Toggle retired ↔ available |
| DELETE | `/api/vehicles/:id` | Admin | Delete vehicle |

### Trips

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trips/` | Authenticated | List trips (dispatchers see own only) |
| GET | `/api/trips/available-resources` | Authenticated | Available vehicles + eligible drivers |
| POST | `/api/trips/` | Authenticated | Create trip (validates capacity + license) |
| PATCH | `/api/trips/:id/status` | Authenticated | Transition: draft→dispatched→completed/cancelled |
| DELETE | `/api/trips/:id` | Authenticated | Delete draft trips only |

### Maintenance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/maintenance/` | Admin | Paginated maintenance logs |
| GET | `/api/maintenance/vehicles` | Admin | Non-retired vehicles for dropdown |
| POST | `/api/maintenance/` | Admin | Create log (vehicle → in-shop) |
| PATCH | `/api/maintenance/:id/status` | Admin | Progress: new→in-progress→completed |
| DELETE | `/api/maintenance/:id` | Admin | Delete log (release vehicle if no open logs) |

### Expenses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/expenses/` | Authenticated | List expenses (dispatchers see own trips only) |
| GET | `/api/expenses/cost-summary` | Authenticated | Per-vehicle aggregated cost breakdown |
| GET | `/api/expenses/completed-trips` | Authenticated | Completed trips for expense linking |
| POST | `/api/expenses/` | Authenticated | Create expense (auto-calc total) |
| DELETE | `/api/expenses/:id` | Authenticated | Delete expense |

### Drivers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/drivers/` | Admin | List drivers with trip stats + license info |
| PATCH | `/api/drivers/:id/duty-status` | Admin | Update duty status (on-duty/off-duty/suspended) |
| PATCH | `/api/drivers/:id/profile` | Admin | Update license, safety score, complaints |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/overview` | Authenticated | KPIs: fuel, ROI, utilization, revenue, profit |
| GET | `/api/analytics/fuel-efficiency` | Authenticated | km/L per vehicle |
| GET | `/api/analytics/costliest-vehicles` | Authenticated | Top 5 by total cost |
| GET | `/api/analytics/monthly-summary` | Authenticated | Monthly revenue/cost/profit breakdown |
| GET | `/api/analytics/export-csv` | Authenticated | Export expenses/maintenance/trips as CSV |

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | API status and timestamp |

---

## Database Schema

### Models & Relationships

```
┌──────────┐      ┌──────────┐      ┌──────────────────┐
│   User   │      │ Vehicle  │      │ MaintenanceLog   │
│ (Driver) │      │          │      │                  │
│──────────│      │──────────│      │──────────────────│
│ id (PK)  │◄──┐  │ id (PK)  │◄──┬──│ vehicleId (FK)   │
│ fullName │   │  │ regNum   │   │  │ logNumber        │
│ email    │   │  │ type     │   │  │ issueType        │
│ password │   │  │ make     │   │  │ description      │
│ role     │   │  │ model    │   │  │ cost             │
│ isVerified│  │  │ status   │   │  │ status           │
│ otp      │   │  │ capacity │   │  │ serviceDate      │
│ license  │   │  │ fuelType │   │  │ completedDate    │
│ dutyStatus│  │  │ mileage  │   │  └──────────────────┘
│ safetyScore│ │  │ region   │   │
│ complaints│  │  └──────────┘   │  ┌──────────────────┐
└──────────┘   │       │         │  │     Expense      │
               │       │         │  │──────────────────│
               │       ▼         ├──│ vehicleId (FK)   │
               │  ┌──────────┐   │  │ tripId (FK)      │
               │  │   Trip   │   │  │ type             │
               │  │──────────│   │  │ fuelLiters       │
               └──│ driverId │   │  │ fuelCost         │
                  │ vehicleId│───┘  │ miscExpense      │
                  │ tripNum  │◄─────│ totalAmount      │
                  │ origin   │      │ distance         │
                  │ destination│    │ expenseDate      │
                  │ cargo    │      └──────────────────┘
                  │ status   │
                  │ startDate│
                  │ endDate  │
                  └──────────┘
```

### Associations

| Relationship | Description |
|-------------|-------------|
| Vehicle → Trip | One vehicle has many trips (`vehicleId` FK) |
| User → Trip | One driver has many trips (`driverId` FK) |
| Vehicle → MaintenanceLog | One vehicle has many maintenance logs (`vehicleId` FK) |
| Vehicle → Expense | One vehicle has many expenses (`vehicleId` FK) |
| Trip → Expense | One trip has many expenses (`tripId` FK) |

### Enum Values

| Field | Values |
|-------|--------|
| User.role | `admin`, `dispatcher` |
| User.dutyStatus | `on-duty`, `off-duty`, `suspended` |
| Vehicle.type | `truck`, `van`, `bike` |
| Vehicle.status | `available`, `on-trip`, `in-shop`, `idle`, `retired` |
| Vehicle.fuelType | `diesel`, `petrol`, `electric`, `cng` |
| Trip.status | `draft`, `dispatched`, `completed`, `cancelled` |
| Expense.type | `fuel`, `toll`, `repair`, `parking`, `misc` |
| MaintenanceLog.issueType | `engine`, `brakes`, `tires`, `electrical`, `transmission`, `oil-change`, `inspection`, `bodywork`, `other` |
| MaintenanceLog.status | `new`, `in-progress`, `completed` |

---

## User Roles & Permissions

### Admin

Full access to all features:

| Module | Permissions |
|--------|------------|
| Dashboard | View all fleet KPIs, all trips, all vehicles |
| Vehicle Registry | Create, read, update, delete, toggle status |
| Trip Dispatcher | Create, dispatch, complete, cancel, delete trips |
| Maintenance | Create, update status, delete service logs |
| Expense & Fuel | Create, view all expenses, cost summary, delete |
| Driver Performance | View all drivers, update duty status, edit profiles |
| Analytics | View all KPIs, charts, export CSV |

### Dispatcher

Limited access with data filtering:

| Module | Permissions |
|--------|------------|
| Dashboard | View own trips only, fleet KPIs |
| Trip Dispatcher | Create, manage own trips only |
| Expense & Fuel | Create, view expenses linked to own trips only |

> Dispatchers **cannot** access: Vehicle Registry, Maintenance, Driver Performance, or Analytics pages. The sidebar automatically hides these navigation items based on role.

---

## Authentication Flow

```
┌──────────┐    ┌─────────┐     ┌──────────┐     ┌───────────┐
│ Register │───►│ OTP Sent│────►│ Verify   │────►│ Dashboard │
│ (email,  │    │ (email) │     │ OTP      │     │ (JWT auth)│
│  pass,   │    └─────────┘     │ (6-digit)│     └───────────┘
│  role)   │        │           └──────────┘         ▲
└──────────┘        │               │                │
                    ▼               │                │
               ┌──────────┐         │          ┌─────────┐
               │ Resend   │─────────┘          │  Login  │
               │ OTP (60s)│                    │ (email, │
               └──────────┘                    │  pass)  │
                                               └─────────┘
```

1. **Register** — User submits name, email, password, role → 6-digit OTP emailed → user marked `isVerified: false`
2. **Verify OTP** — User enters OTP within 10 minutes → account verified → JWT token issued
3. **Login** — Verified users login with email + password → JWT token issued (24h expiry)
4. **Protected Routes** — All API calls include `Authorization: Bearer <token>` header
5. **Auto-Logout** — Frontend interceptor catches 401 responses → clears token → redirects to login

---

---

## Seed & Demo Data

### Auto-Seed (on server startup)

Every time the backend starts, it automatically creates two demo accounts if they don't already exist:

| Account | Email | Password | Role | Status |
|---------|-------|----------|------|--------|
| Admin | `admin.manager@fleetflow.com` | `admin123` | admin | Pre-verified |
| Dispatcher | `dispatchers@fleetflow.com` | `user123` | dispatcher | Pre-verified |

### Full Dummy Data Seed

For testing and demos, run the full data seeder:

```bash
cd backend
npm run db:seed
```

This creates:
- **12 vehicles** — mix of trucks, vans, and bikes across different fuel types and statuses
- **4 additional drivers** — with various duty statuses and license configurations
- **17 trips** — covering all status types (draft, dispatched, completed, cancelled)
- **9 maintenance logs** — across different issue types and statuses
- **27 expenses** — spanning 5 months with all expense types

> ⚠️ Running `db:seed` will **clear existing** Expense, MaintenanceLog, Trip, and Vehicle records before seeding.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


