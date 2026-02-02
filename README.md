# 🎫 Device Ticket Management & Resolution System

A professional full-stack solution designed to streamline device error reporting, technical analysis, and manufacturer coordination. This system features dynamic UI adaptation based on server-side user roles.



---

## 🏗 Project Structure
This repository contains both the frontend and backend services:
* **/backend**: Node.js Express API with MongoDB integration.
* **/frontend**: React.js application styled with Tailwind CSS and Lucide Icons.

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance or MongoDB Atlas connection string)
* **Git**

## Backend Installation
```bash
cd backend
npm install
```
### 1. Environment Configuration: Create a .env file in the backend/ folder and add:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
```

### 2. Open a new terminal with backend/ folder and 
```bash
npm start or npm run dev
```
## Frontend Installation

### 1. Open a new terminal window:
```bash
cd frontend
npm install
```

### 2. Start frontend
```bash
npm start or npm run dev
```

## 🛠 Technical Stack
### Frontend: React 18, Tailwind CSS, Lucide-React Icons, Axios.
### Backend: Node.js, Express.js.
### Database: MongoDB via Mongoose ODM.
### Security: JWT Authentication, Bcrypt Password Hashing, CORS Protection.


## 📂 File Map for Reference
.
├── backend/
│   ├── models/        # Database Schemas (Ticket, User)
│   ├── routes/        # API Endpoints (Auth, Tickets)
│   ├── middleware/    # Auth & Role verification
│   ├── server.js      # Entry Point
│   └── .env           # Private Config (Excluded from Git)
└── frontend/
    ├── src/
    │   ├── api/       # Axios Instance
    │   ├── components/# Reusable UI Elements (MainLayout)
    │   ├── pages/     # TicketForm, TicketDetails, Dashboard
    │   └── context/   # Global State (Toast, Auth)
    └── tailwind.config.js


## 1. Frontend Libraries (/frontend)
### These handle the user interface, styling, and server communication.
Library	Purpose
react-router-dom	    Handles page navigation (Form page, Details page, etc.).
axios	                Makes the API calls to your backend (e.g., GET /me, POST /tickets).
lucide-react	        Provides the modern, clean icons used in the UI.
clsx & tailwind-merge	Helps manage dynamic Tailwind classes (useful for the blue/red color coding).

### Installation Command
```bash
npm install react-router-dom axios lucide-react clsx tailwind-merge
```

## 2. Backend Libraries

### Installation Command
```bash
npm install express mongoose jsonwebtoken bcryptjs cors dotenv
```

## 3. Development Tools (Both Sides)
```bash
npm install -D tailwindcss postcss autoprefixer
npm install --save-dev nodemon
```