# LearnSphere — Online Course Platform

A full-stack online course platform built with the **MERN stack** (MongoDB, Express, React, Node.js), featuring JWT auth, Razorpay test payments, and a Silver Chrome Minimal UI.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (port 3000) |
| Backend | Node.js + Express (port 5000) |
| Database | MongoDB + Mongoose |
| Auth | JWT (7-day expiry) + bcryptjs |
| Payments | Razorpay Test Mode |
| Styling | Vanilla CSS — Silver Chrome Minimal |

## 📁 Project Structure

```
course-platform/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/  (Navbar, CourseCard, LessonSidebar, ProgressBar, AdminRoute)
│       ├── pages/       (Login, Register, Dashboard, CourseDetail, LearnPage, AdminPanel)
│       ├── context/     (AuthContext)
│       └── utils/       (api.js — Axios instance)
└── backend/           # Node.js + Express API
    ├── models/          (User, Course, Progress)
    ├── routes/          (auth, courses, payment, learn, admin)
    ├── middleware/      (protect, adminOnly)
    ├── seed.js          # Database seeder
    └── server.js        # Main entry
```

## ⚙️ Setup

### 1. Backend

```bash
cd backend
# Fill in your values in .env
npm install
npm run seed    # Seeds 6 sample courses + admin + student
npm run dev     # Runs on http://localhost:5000
```

**.env** (backend):
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:3000
```

## 👤 Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@courseplatform.com | admin123 |
| Student | student@courseplatform.com | student123 |

## ✨ Features

- 🔐 **Auth** — Register, Login, JWT tokens, protected routes
- 📚 **Courses** — Browse, search, filter by category
- 💳 **Payments** — Razorpay test mode checkout
- 📖 **Learning** — Video player, lesson completion, progress bar
- 🛠️ **Admin** — Course CRUD, user list, enrollment overview

## 🧪 Razorpay Test Card

Use card number `4111 1111 1111 1111` in Razorpay test checkout.
