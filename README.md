<div align="center">

# 🥇 MetalTracker

**A full-stack precious metals tracking platform** — live gold, silver & copper prices, historical charts, price predictions with a community leaderboard, price alerts, and PDF reporting.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://metaltracker.onrender.com)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

[Live Demo](https://metaltracker.onrender.com) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference)

</div>

---

## 📖 Overview

MetalTracker is a full-stack web application that helps users track live gold, silver, and copper prices, convert them across units and currencies, visualize historical trends, and even test their market instincts by submitting price predictions against a global leaderboard.

Built end-to-end — a custom REST API, JWT authentication with email verification, a PostgreSQL database (Supabase), scheduled background jobs, and a fully responsive vanilla JS frontend — with no frontend framework, just clean HTML/CSS/JS and Chart.js.

**🔗 Live app:** [metaltracker.onrender.com](https://metaltracker.onrender.com)

---

## ✨ Features

### 📊 Live Market Data
- Real-time gold, silver, and copper prices with automatic refresh
- Interactive historical price charts (2-day / 1-week views) powered by Chart.js
- Side-by-side comparison bar chart across all three metals
- Live USD ⇄ PKR exchange rate conversion

### 🧮 Metal Calculator
- Convert any amount between **Tola, Gram, and Troy Ounce**
- Instant value conversion in **USD or PKR**

### 🔮 Price Predictions & Leaderboard
- Submit a "going up" / "going down" prediction on any metal
- Predictions are automatically scored 24 hours later by a scheduled cron job
- Global leaderboard ranks users by prediction accuracy

### 🔔 Price Alerts & Watchlist
- Star metals to add them to a personal watchlist
- Get in-app notifications when a watched metal crosses a threshold

### 📰 Market News
- Curated, latest precious-metals news pulled from a live news API

### 📄 PDF Reports
- One-click, on-demand PDF export of current prices and trends

### 🔐 Secure Authentication
- Email OTP verification on signup (via Brevo/SMTP)
- JWT-based session handling with bcrypt password hashing
- Profile management: change email, password, profile picture (Cloudinary), theme, currency & unit preferences

### 📱 Fully Responsive UI
- Dark/light theme toggle
- Mobile-first responsive layout with pull-to-refresh support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (hosted on Supabase) |
| **Auth** | JWT, bcrypt, Email OTP (Nodemailer + Brevo SMTP) |
| **Media Storage** | Cloudinary (profile picture uploads) |
| **Scheduled Jobs** | node-cron (prediction result grading) |
| **PDF Generation** | PDFKit |
| **External APIs** | Metals price API, Exchange rate API, News API |
| **Deployment** | Render (backend + static frontend), Supabase (database) |


## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com) PostgreSQL project
- SMTP credentials (e.g. [Brevo](https://www.brevo.com)) for sending verification emails
- API keys: [metals.dev](https://metals.dev), an exchange-rate API, and a news API
- A [Cloudinary](https://cloudinary.com) account (for profile picture uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Azeen-Fatima/MetalTracker.git
   cd MetalTracker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**

   Run `database/schema.sql` once in your Supabase SQL editor to create all required tables.

4. **Configure environment variables**

   Create a `backend/.env` file:
   ```env
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your_jwt_secret

   EMAIL_HOST=smtp-relay.brevo.com
   EMAIL_PORT=587
   EMAIL_USER=your_smtp_login
   EMAIL_PASS=your_smtp_password
   EMAIL_FROM=your_verified_sender_email

   METALS_API_KEY=your_metals_api_key
   EXCHANGE_API_KEY=your_exchange_api_key
   NEWS_API_KEY=your_news_api_key

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   ALLOWED_ORIGINS=
   ```

5. **Run the server**
   ```bash
   npm start
   ```

   The app (frontend + API) will be available at `http://localhost:5000`.

---

## 📡 API Reference

All protected routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-verification` | Send email OTP for signup / email change |
| `POST` | `/api/auth/verify-code` | Verify OTP code |
| `POST` | `/api/auth/signup` | Create a new account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/user/profile` | Get current user profile |
| `PUT` | `/api/user/update` | Update profile / preferences |
| `PUT` | `/api/user/change-password` | Change account password |
| `POST` | `/api/user/upload-pic` | Upload profile picture |
| `GET` | `/api/metals/prices` | Current gold/silver/copper prices |
| `GET` | `/api/metals/historical` | Historical price data by timeframe |
| `GET` | `/api/metals/news` | Latest market news |
| `GET` | `/api/metals/exchange` | Current USD/PKR exchange rate |
| `GET` / `POST` / `DELETE` | `/api/watchlist` | Manage watchlisted metals |
| `GET` / `POST` | `/api/predictions` | View / submit price predictions |
| `GET` | `/api/alerts` | Get unread price alerts |
| `GET` | `/api/pdf/report` | Download a PDF price report |

---

## 🎯 Highlights for Reviewers

- Designed a **MySQL-style → PostgreSQL compatibility layer** (`database.js`) so all queries use familiar `?` placeholders while running on Supabase Postgres under the hood.
- Implemented **automated prediction grading** via a scheduled cron job that evaluates user predictions 24 hours after submission.
- Built a **theming system** entirely with CSS custom properties, supporting instant dark/light switching across the whole app.
- Handled **email deliverability edge cases** (SMTP sender verification, async error handling) for a reliable OTP-based signup flow.
- Fully responsive, mobile-first UI with pull-to-refresh and safe-area handling — no CSS framework used.

---

## 👩‍💻 Author

**Azeen Fatima**
[GitHub](https://github.com/Azeen-Fatima) · [Live Demo](https://metaltracker.onrender.com)

---

