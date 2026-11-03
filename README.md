# Grand Horizon — Modern Hotel Management System with Dynamic Billing

A complete, enterprise-grade, responsive **Hotel Management System (HMS)** with a real-time **Dynamic Billing Engine**, room inventory control, customer reservation scheduling, turnover housekeeping, and statistical occupancy analytics.

---

## 🌟 Key Features

### 1. 📊 Executive Admin Dashboard
- **8 Core Real-time KPI Cards**: Total Rooms, Available Rooms, Occupied Rooms, Reserved Rooms, Today's Check-ins, Today's Check-outs, Total Revenue, and Room Occupancy Percentage.
- **7-Day Dynamic Revenue Trend Chart** (Recharts area graph).
- **Room Category Distribution** (Recharts donut pie chart).
- **Turnover Housekeeping Summary Counters** (Clean, Dirty, Cleaning, Maintenance).
- **Recent Bookings Ledger** with instant invoice links.

### 2. 🛏️ Room Inventory Management
- **Full CRUD Operations**: Add, Edit, Delete, and View rooms.
- **Room Categorization**:
  - Single Room
  - Double Room
  - Deluxe Room
  - Suite Room
- Room details: Room Number, Price per Night, Floor, Capacity, Description, Amenities (Wi-Fi, AC, TV, Mini Bar, Balcony, Jacuzzi), and Live Availability Status (*Available, Occupied, Reserved, Maintenance*).
- **Dynamic Search & Sorting**: Search by room number, filter by category and availability, sort by price (*Low to High / High to Low*) or capacity.
- **Deletion Safety Check**: System prevents accidental deletion of rooms with active or upcoming reservations.

### 3. 📅 Customer Booking Management & Overlap Prevention
- **Guest Profiles**: Full Name, Phone, Email, Physical Address, ID Type (*Passport, Driving License, National ID*), and ID Number.
- **Dynamic Date Search**: Real-time room availability verification based on check-in and check-out dates.
- **Automatic Duration Calculation**: Computes the exact number of nights automatically.
- **Overlap & Double-Booking Guard**: Mathematically verifies date ranges to prevent double-booking of any room.
- **Unique Booking ID Generation** (e.g. `BK-2026-XXXXX`).

### 4. 🔑 Check-in / Check-out Management
- **Upcoming Reservations & Daily Schedule**.
- **Customer Check-In**: Instantly switches room status to **Occupied** and records timestamp.
- **Customer Check-Out**: Automatically finalizes the dynamic bill, releases the room, and switches the room's cleaning status to **Dirty** to trigger turnover housekeeping.
- **Complete Booking History Tab** for post-departure audit.

### 5. 💳 Dynamic Billing System (Core Engine)
- **Automatic Room Charges**: $\text{Room Price} \times \text{Number of Nights}$.
- **Itemized Additional Services**:
  - 🍽️ Food & Restaurant (Continental Breakfast, Gourmet Dinners)
  - 🧺 Laundry & Dry Cleaning
  - 🛎️ 24/7 In-Room Dining & Fruit Platters
  - 💆 Luxury Spa & Aromatherapy
  - 🛏️ Rollaway Extra Beds & Baby Cribs
  - 🚗 Airport Limousine & Boardroom Rentals
- **Comprehensive Final Bill Calculation**:
  $$\text{Grand Total} = (\text{Room Charges} + \text{Services} + \text{Extra Incidentals} - \text{Discount}) + \text{GST Tax (12\%)}$$
- **Real-Time Dynamic Recalculation**: Adjust discounts, taxes, or extra fees with immediate balance updates.
- **Multiple Payment Channels**: Cash, Credit/Debit Card, UPI / QR, Bank Transfer.
- **Payment Status Tracking**: *Paid*, *Partially Paid*, *Pending*.
- **Printable Invoices**: Native browser print styling.
- **Vector PDF Download**: Generates formal hotel letterhead PDF invoices with itemized tables using `jsPDF` and `jspdf-autotable`.

### 6. 🧹 Housekeeping Management
- Track room cleanliness status: **Clean**, **Dirty**, **Cleaning**, **Maintenance**.
- **Turnover Alert Banner**: Flags all rooms that need cleaning after guest check-out.
- Assign dedicated housekeeping staff and set cleaning priorities (*Low, Medium, High, Urgent*).
- Automatic bidirectional synchronization between Housekeeping and Room Inventory.

### 7. 📈 Occupancy Reports & Business Analytics
- **Dual-Axis Composed Chart**: Daily Occupancy Rate % vs Daily Collected Revenue.
- **Revenue by Service Category**: Performance breakdown of Food, Spa, Laundry, etc.
- **Payment Gateway Distribution**: Cash vs Card vs UPI share.
- **Room Category Performance**: Bookings volume, cumulative revenue, and average length of stay.
- **Time Range Selector**: 7 Days, 30 Days, or 90 Days.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js 18, Vite 5, Tailwind CSS, React Router v6 |
| **Icons & Charts** | Lucide React, Recharts |
| **PDF Generation** | jsPDF, jsPDF-AutoTable |
| **Backend** | Node.js (v24), Express.js |
| **Database** | MongoDB (Native Mongoose ODM with embedded local fallback) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing |

---

## 📂 Project Architecture

```
hotel-management-system/
├── package.json                   # Root scripts to run concurrently
├── README.md                      # Documentation & instructions
├── backend/                       # Node.js + Express API
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express application entry point
│   ├── config/
│   │   └── db.js                  # Resilient MongoDB connector
│   ├── models/                    # Mongoose Schemas & ObjectId relations
│   │   ├── User.js                # Staff / Admin accounts
│   │   ├── Room.js                # Room inventory & rates
│   │   ├── Customer.js            # Guest directory
│   │   ├── Booking.js             # Reservations & date ranges
│   │   ├── Service.js             # Catalog of additional services
│   │   ├── Bill.js                # Dynamic billing engine
│   │   ├── Payment.js             # Payment transactions
│   │   └── Housekeeping.js        # Cleaning schedules & staff
│   ├── controllers/               # Business logic controllers
│   ├── routes/                    # Protected REST API endpoints
│   ├── middleware/                # JWT protect & error middleware
│   └── utils/
│       └── seed.js                # Demo database seeder
└── frontend/                      # Vite + React + Tailwind CSS
    ├── index.html                 # App container & typography
    ├── vite.config.js             # Vite configuration with API proxy
    ├── tailwind.config.js         # Custom palette & styling
    └── src/
        ├── App.jsx                # Router & protected route guards
        ├── main.jsx               # React DOM entry
        ├── context/
        │   ├── AuthContext.jsx    # Session & JWT state
        │   └── ToastContext.jsx   # Animated feedback toasts
        ├── services/
        │   └── api.js             # Axios instance with auth interceptor
        ├── components/
        │   ├── common/            # Navbar, Sidebar, Modal, StatCard, Badges
        │   ├── rooms/             # RoomModal
        │   ├── bookings/          # BookingModal with live search
        │   ├── billing/           # InvoiceModal, AddServiceModal, PaymentModal
        │   ├── housekeeping/      # HousekeepingModal
        │   └── services/          # ServiceModal
        └── pages/
            ├── Login.jsx          # Admin authentication
            ├── Dashboard.jsx      # Metrics, charts & quick actions
            ├── Rooms.jsx          # Room inventory management
            ├── Bookings.jsx       # Customer reservation list
            ├── CheckInOut.jsx     # Daily check-in & check-out
            ├── Billing.jsx        # Invoices & dynamic balance engine
            ├── Housekeeping.jsx   # Room cleanliness & staff
            ├── Services.jsx       # Services catalog
            └── Reports.jsx        # BI occupancy analytics
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **NPM** (v9 or higher)

### Installation

1. Navigate to the project directory:
```bash
cd C:\Users\daivi\.gemini\antigravity\scratch\hotel-management-system
```

2. Install all dependencies across root, backend, and frontend:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
cd ..
```

---

## 🏃 Running the Application

### Option A: Run Both Frontend & Backend Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### Option B: Run Individually in Separate Terminals

**Terminal 1 — Backend API**:
```bash
cd backend
npm run dev
# Server will run on: http://localhost:5000
```

**Terminal 2 — Frontend UI**:
```bash
cd frontend
npm run dev
# Web application will open on: http://localhost:5173
```

---

## 🔐 Demo Credentials

The database is pre-seeded with realistic hotel rooms, guests, bookings, and invoices. You can log in with:

| Role | Email | Password |
|---|---|---|
| **Hotel Administrator** | `admin@grandhotel.com` | `password123` |
| **Front Desk Receptionist**| `receptionist@grandhotel.com` | `password123` |

*(Quick one-click login buttons are also available on the Login screen)*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & get JWT | Public |
| `GET` | `/api/auth/me` | Get current user session | Bearer JWT |
| `GET` | `/api/dashboard/stats` | Comprehensive live KPIs & chart data | Bearer JWT |
| `GET` | `/api/rooms` | Query rooms (search, filter, sort) | Bearer JWT |
| `GET` | `/api/rooms/check-availability` | Check available rooms for dates | Bearer JWT |
| `POST` | `/api/rooms` | Create new room inventory item | Bearer JWT |
| `PUT` | `/api/rooms/:id` | Update room pricing/status | Bearer JWT |
| `DELETE` | `/api/rooms/:id` | Delete vacant room | Bearer JWT |
| `GET` | `/api/bookings` | List all customer bookings | Bearer JWT |
| `POST` | `/api/bookings` | Create new booking & auto-generate bill | Bearer JWT |
| `PUT` | `/api/bookings/:id/check-in` | Check in guest & mark room Occupied | Bearer JWT |
| `PUT` | `/api/bookings/:id/check-out` | Check out guest & mark room Dirty | Bearer JWT |
| `PUT` | `/api/bookings/:id/cancel` | Cancel booking & release room | Bearer JWT |
| `GET` | `/api/bills` | List all customer bills | Bearer JWT |
| `GET` | `/api/bills/:id` | Get itemized invoice & payment history | Bearer JWT |
| `POST` | `/api/bills/:id/add-service` | Charge food/laundry/spa to bill | Bearer JWT |
| `DELETE`| `/api/bills/:id/services/:sid` | Remove service charge line | Bearer JWT |
| `PUT` | `/api/bills/:id/update-charges` | Adjust discount, tax %, extra fees | Bearer JWT |
| `POST` | `/api/bills/:id/payments` | Record Cash/Card/UPI payment | Bearer JWT |
| `GET` | `/api/housekeeping` | List housekeeping assignments | Bearer JWT |
| `PUT` | `/api/housekeeping/:id` | Update cleaning status & staff | Bearer JWT |
| `GET` | `/api/services` | Additional services catalog | Bearer JWT |
| `GET` | `/api/reports/analytics` | Statistical occupancy & revenue reports | Bearer JWT |
