# 🛡️ RAKSHAK — Complete Project Summary
### AI-Powered Silent Guardian System | Team Kavach
> **Version:** 1.0.0 &nbsp;|&nbsp; **Status:** All services healthy ✅ &nbsp;|&nbsp; **Last verified:** 17 Feb 2026

---

## 📋 Table of Contents
1. [What is RAKSHAK?](#1-what-is-rakshak)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure (File Map)](#3-project-structure-file-map)
4. [Cloud Services & Configuration](#4-cloud-services--configuration)
5. [Frontend — Landing Page](#5-frontend--landing-page)
6. [Frontend — Authentication System](#6-frontend--authentication-system)
7. [Frontend — Dashboard (Protected)](#7-frontend--dashboard-protected)
8. [Backend — API Routes](#8-backend--api-routes)
9. [Backend — Utility Modules](#9-backend--utility-modules)
10. [Backend — Infrastructure](#10-backend--infrastructure)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [Database Schema (MongoDB Atlas)](#12-database-schema-mongodb-atlas)
13. [Security Features](#13-security-features)
14. [Current Service Status](#14-current-service-status)
15. [How to Run Locally](#15-how-to-run-locally)
16. [What's Working vs What's Pending](#16-whats-working-vs-whats-pending)

---

## 1. What is RAKSHAK?

RAKSHAK (meaning "protector" in Hindi) is an **AI-powered silent guardian system** designed for women's safety in rural India. The concept:

- An **on-device AI** (on Android) silently detects distress through **voice patterns, gestures, and behavior**
- When distress is detected, the system **silently triggers an alert** (no visible action on phone)
- **Guardians** (family/friends/authorities) are notified via **email** with GPS coordinates
- All AI processing happens **on-device** — no audio/video is ever uploaded (privacy-first)
- **Evidence** (voice clips, screenshots) is encrypted and auto-deleted after 30 days

This web platform is the **management dashboard + landing page** for the system.

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.1 | UI framework |
| **Vite** | 6.0.5 | Build tool & dev server |
| **React Router DOM** | 7.13.0 | Client-side routing |
| **Axios** | 1.13.5 | HTTP client for API calls |
| **amazon-cognito-identity-js** | 6.3.16 | AWS Cognito auth SDK |
| **Lucide React** | 0.570.0 | Icon library |
| **Vanilla CSS** | — | Custom styling (no Tailwind) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11 | Runtime |
| **Flask** | latest | Local dev server |
| **PyMongo** | 4.6.1 | MongoDB driver |
| **Boto3** | ≥1.34.0 | AWS SDK (S3, SES) |
| **python-jose** | ≥3.3.0 | JWT token verification |
| **Requests** | ≥2.31.0 | HTTP client (for JWKS) |

### Cloud Services (AWS + MongoDB)
| Service | Purpose |
|---|---|
| **AWS Cognito** | User authentication (signup, login, email verification) |
| **MongoDB Atlas** | Database (user profiles, guardians, alert history) |
| **AWS SES** | Email notifications to guardians |
| **AWS S3** | Encrypted evidence storage (AES-256) |
| **AWS Lambda** (planned) | Serverless backend deployment |
| **AWS API Gateway** (planned) | REST API endpoint |

---

## 3. Project Structure (File Map)

```
Kavach.AI/
├── 📄 .env                         # Frontend environment variables (4 vars)
├── 📄 .env.example                  # Template for frontend .env
├── 📄 .gitignore                    # Excludes .env, node_modules, dist, __pycache__
├── 📄 index.html                    # Root HTML entry point
├── 📄 package.json                  # npm dependencies and scripts
├── 📄 vite.config.js                # Vite configuration
│
├── 📁 src/                          # ── FRONTEND ──
│   ├── 📄 main.jsx                  # React entry point (BrowserRouter + AuthProvider)
│   ├── 📄 App.jsx                   # Route definitions (10 routes)
│   ├── 📄 config.js                 # Central config (reads VITE_ env vars)
│   ├── 📄 index.css                 # Global styles + design tokens + animations
│   │
│   ├── 📁 components/               # Landing page components (22 files)
│   │   ├── AnimatedBackground.jsx   # Canvas particle network animation
│   │   ├── Navbar.jsx + .css        # Sticky nav with scroll effect & hamburger menu
│   │   ├── Hero.jsx + .css          # Hero section with animated orbs & shield SVG
│   │   ├── Problem.jsx + .css       # Problem statement section
│   │   ├── Solution.jsx + .css      # How RAKSHAK works (3-step flow)
│   │   ├── TechStack.jsx + .css     # Technology overview cards
│   │   ├── Privacy.jsx + .css       # Privacy-first approach section
│   │   ├── RiskMitigation.jsx + .css # Risk analysis section
│   │   ├── CTA.jsx + .css           # Call-to-action section
│   │   ├── Team.jsx + .css          # Team members section
│   │   ├── Footer.jsx + .css        # Footer with links
│   │   └── ProtectedRoute.jsx       # Route guard (redirects unauthenticated users)
│   │
│   ├── 📁 context/
│   │   └── AuthContext.jsx          # Auth state management (Cognito integration)
│   │
│   ├── 📁 services/
│   │   └── api.js                   # Axios instance + all API endpoint functions
│   │
│   └── 📁 pages/
│       ├── 📁 auth/
│       │   ├── Auth.css             # Shared auth page styles
│       │   ├── Login.jsx            # Login page (email + password)
│       │   ├── Signup.jsx           # Signup page (name, email, phone, password)
│       │   └── Verify.jsx           # Email verification (6-digit code)
│       │
│       └── 📁 dashboard/
│           ├── Dashboard.jsx + .css # Dashboard layout (sidebar + outlet)
│           ├── Overview.jsx         # Welcome page with stats & quick actions
│           ├── Profile.jsx          # User profile management (name, phone, location)
│           ├── Guardians.jsx        # Guardian CRUD (add/edit/delete, max 3)
│           ├── SimulateAlert.jsx    # Trigger test alert (mock GPS, notifies guardians)
│           ├── AlertHistory.jsx     # View all past alerts from MongoDB
│           └── Evidence.jsx         # Evidence vault status (S3 bucket check)
│
└── 📁 backend/                      # ── BACKEND ──
    ├── 📄 .env                      # Backend environment variables (8 vars)
    ├── 📄 .env.example              # Template for backend .env
    ├── 📄 requirements.txt          # Python dependencies (4 packages)
    ├── 📄 run_local.py              # Flask dev server (port 3001)
    ├── 📄 handler.py                # Lambda-style router (dispatches to route handlers)
    ├── 📄 db.py                     # MongoDB connection (lazy singleton)
    ├── 📄 template.yaml             # AWS SAM template for Lambda deployment
    │
    ├── 📁 routes/
    │   ├── __init__.py
    │   ├── health.py                # GET /health — system status check
    │   ├── user.py                  # GET/PUT /user/profile
    │   ├── guardians.py             # CRUD /user/guardians
    │   └── alerts.py                # POST /alert/simulate, GET /alert/history
    │
    └── 📁 utils/
        ├── __init__.py
        ├── jwt_verify.py            # Cognito JWT token verification (RS256 + JWKS)
        ├── email_notify.py          # AWS SES email sender (HTML + plaintext)
        └── s3_utils.py              # S3 presigned URLs + bucket health check
```

**Total files:** 48 (22 components + 12 pages + 7 backend routes/handlers + 7 config/infra)

---

## 4. Cloud Services & Configuration

### Frontend `.env` (4 variables)
| Variable | Value | Purpose |
|---|---|---|
| `VITE_COGNITO_USER_POOL_ID` | `ap-southeast-2_pnneeX2EX` | Cognito user pool identifier |
| `VITE_COGNITO_CLIENT_ID` | `1q8ms3en5pcl9mr9dujgcfsmro` | Cognito app client ID |
| `VITE_AWS_REGION` | `ap-southeast-2` | AWS region (Sydney) |
| `VITE_API_URL` | `http://localhost:3001` | Backend API URL |

### Backend `.env` (8 variables)
| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (ClusterKavach) |
| `MONGODB_DB` | Database name (`rakshak`) |
| `COGNITO_USER_POOL_ID` | Same pool ID as frontend |
| `COGNITO_CLIENT_ID` | Same client ID as frontend |
| `COGNITO_REGION` | `ap-southeast-2` |
| `SES_SENDER_EMAIL` | Verified email for sending alerts |
| `SES_REGION` | `ap-southeast-2` |
| `S3_EVIDENCE_BUCKET` | `rakshak-evidence-kavach` |
| `S3_REGION` | `ap-southeast-2` |

### AWS Credentials
- Configured via `aws configure` on local machine
- IAM user: `rakshak-local-dev` with policies: `AmazonS3FullAccess`, `AmazonSESFullAccess`, `AmazonCognitoPowerUser`
- Access Key: `AKIAUGDEHAWRQIMD5VK2`

---

## 5. Frontend — Landing Page

The landing page is a **single-page scrolling website** with 10 sections:

| Section | Component | What it shows |
|---|---|---|
| **Navbar** | `Navbar.jsx` | Sticky header with logo, nav links (smooth scroll), Login/Dashboard CTA, hamburger menu on mobile |
| **Hero** | `Hero.jsx` + `AnimatedBackground.jsx` | Animated particle network canvas, floating gradient orbs, shield SVG, tagline "The Silent Guardian That Protects Without Being Seen" |
| **Problem** | `Problem.jsx` | Statistics about women's safety issues in India |
| **Solution** | `Solution.jsx` | 3-step visual flow: Detect → Alert → Protect |
| **Tech Stack** | `TechStack.jsx` | Cards showing the technologies used |
| **Privacy** | `Privacy.jsx` | Privacy-first approach (on-device AI, no cloud uploads) |
| **Risk Mitigation** | `RiskMitigation.jsx` | Risk analysis and mitigation strategies |
| **CTA** | `CTA.jsx` | Call-to-action with signup button |
| **Team** | `Team.jsx` | Team member profiles |
| **Footer** | `Footer.jsx` | Links and copyright |

### Design System (index.css)
- **Color palette:** Dark theme with CSS custom properties (`--bg-primary: #0b1120`, `--accent-blue: #4f6ef7`, etc.)
- **Typography:** Inter font from Google Fonts
- **Animations:** `fadeInUp`, `slideInLeft`, `shimmer`, `float` keyframes
- **Responsive:** Mobile-first with breakpoints at 768px and 480px
- **Effects:** Glassmorphism, gradient borders, blur backdrops

---

## 6. Frontend — Authentication System

### Auth Flow
```
Signup → Email Verification (6-digit OTP) → Login → Dashboard
```

### Pages

| Page | File | Features |
|---|---|---|
| **Login** | `Login.jsx` | Email + password form, error handling, redirect to dashboard on success, link to signup |
| **Signup** | `Signup.jsx` | Name, email, phone (optional), password + confirm, auto-redirects to verify page |
| **Verify** | `Verify.jsx` | 6-digit OTP code entry, "Resend code" button, auto-redirect to login on success |

### AuthContext.jsx — State Management
The `AuthContext` wraps the entire app and provides:

| Function | What it does |
|---|---|
| `signup(email, password, name, phone)` | Registers user with Cognito (email + name + optional phone attributes) |
| `verify(email, code)` | Confirms registration with 6-digit OTP |
| `login(email, password)` | Authenticates and stores JWT token + user info (`sub`, `email`, `username`) |
| `logout()` | Clears Cognito session + React state |
| `refreshToken()` | Gets a fresh JWT from Cognito session |
| `isAuthenticated` | Computed boolean (`!!user && !!token`) |
| `cognitoConfigured` | Checks if VITE_COGNITO env vars are set |

### ProtectedRoute.jsx
- Wraps dashboard routes
- Shows loading spinner while auth state resolves
- Redirects to `/auth/login` if not authenticated

---

## 7. Frontend — Dashboard (Protected)

The dashboard is a **sidebar layout** with 6 pages:

### Dashboard Layout (`Dashboard.jsx`)
- Sidebar with navigation links (using `NavLink` for active styling)
- User avatar (first 2 letters of email) + email display
- Sign Out button
- `<Outlet />` renders the active page
- Automatically sets `Authorization` header on API client when token changes

### Dashboard Pages

#### 7.1 Overview (`Overview.jsx`)
- **Welcome message** with user's name (extracted from email)
- **Stats cards:** Guardian count, Alert count, System status (fetched via API)
- **Quick Actions:** Links to Manage Guardians + Simulate Alert
- **Privacy Reminder:** Explains on-device AI processing

#### 7.2 Profile (`Profile.jsx`)
- **View/Edit mode** toggle
- **Fields:** Full Name, Email (read-only), Phone Number, Home Location
- **API calls:** `GET /user/profile` (load), `PUT /user/profile` (save)
- Uses MongoDB `upsert` so profile is created on first save
- Validation: Name is required

#### 7.3 Guardians (`Guardians.jsx`)
- **Full CRUD** with modal form
- **Fields:** Name, Email, Phone, Relationship
- **Max 3 guardians** per user (enforced on both frontend and backend)
- **Add** → opens modal with empty form
- **Edit** → opens modal pre-filled with guardian data
- **Delete** → confirmation + removes from MongoDB
- Empty state shows "No guardians yet" with add button

#### 7.4 Simulate Alert (`SimulateAlert.jsx`)
- **Trigger button** that sends a mock distress alert
- Generates **random GPS coordinates** near Bangalore
- Sends `POST /alert/simulate` with `{ location, detectionType: "voice_distress", confidence: 0.92 }`
- Displays result: Alert ID, Timestamp, Location, Delivery Method, Status, Guardians Notified
- **Rate limited** to 1 alert per 10 seconds (server-side)

#### 7.5 Alert History (`AlertHistory.jsx`)
- Lists all past alerts from MongoDB (sorted by timestamp, newest first, max 50)
- Shows: Alert ID, Detection Type, Location, Timestamp, Status badge, Guardians Notified
- Empty state: "No alerts yet"

#### 7.6 Evidence Vault (`Evidence.jsx`)
- Checks S3 bucket status via `/health` endpoint
- Shows ✅ or ❌ for S3 readiness
- Displays info about AES-256 encryption and 30-day auto-deletion
- Evidence upload is **placeholder** (pre-signed URL utility exists but no upload UI yet)

---

## 8. Backend — API Routes

### Router Architecture
The backend uses a **Lambda-style handler** pattern:
1. `run_local.py` (Flask server for local dev) catches ALL requests
2. Constructs a Lambda-like `event` object with `httpMethod`, `path`, `headers`, `body`
3. Passes it to `handler.py` → `lambda_handler(event, context)`
4. `lambda_handler` dispatches to the correct route handler based on path

This design means the **same code runs locally (Flask) and in production (AWS Lambda)** without changes.

### Route Handlers

#### `health.py` — GET /health (Public)
- Checks MongoDB connection (fresh `MongoClient` + `admin.command("ping")`)
- Checks S3 bucket existence (`head_bucket`)
- Returns `{ status, services: { api, mongodb, s3 }, version }`

#### `user.py` — /user/profile (Protected)
- **GET:** Returns user profile from MongoDB `users` collection
- **PUT:** Updates profile (allowed fields: `name`, `phone`, `homeLocation`), uses `upsert=True`

#### `guardians.py` — /user/guardians (Protected)
- **GET:** Lists all guardians for the authenticated user
- **POST:** Adds new guardian (max 3, requires name + email)
- **PUT /user/guardians/{id}:** Updates guardian fields
- **DELETE /user/guardians/{id}:** Removes guardian
- Uses `bson.ObjectId` for MongoDB document IDs

#### `alerts.py` — /alert/* (Protected)
- **POST /alert/simulate:** Creates alert record in MongoDB `alerts` collection, fetches user's guardians, sends email to each via SES, updates alert with delivery status
- **GET /alert/history:** Returns last 50 alerts for the user (sorted newest first)

---

## 9. Backend — Utility Modules

### `jwt_verify.py` — JWT Token Verification
- Fetches Cognito **JWKS public keys** from `https://cognito-idp.{region}.amazonaws.com/{pool_id}/.well-known/jwks.json`
- Caches JWKS for **1 hour** to avoid repeated HTTP calls
- Verifies JWT signature using **RS256 algorithm**
- Validates `audience` (client ID) and `issuer` (Cognito pool URL)
- Checks token expiration
- Returns decoded claims (includes `sub` for user identification)

### `email_notify.py` — Email Alerts via AWS SES
- Sends styled **HTML + plaintext** distress alert emails
- Template includes: Detection Type, GPS Location, Timestamp, Guardian's name, instructions to contact authorities
- Dark-themed email design matching the app's aesthetic
- Returns `{ status: "delivered", messageId }` or `{ status: "failed", error }`

### `s3_utils.py` — S3 Evidence Storage
- `check_s3_ready()`: Checks if evidence bucket exists (`head_bucket`)
- `generate_presigned_upload_url(user_id, alert_id, file_extension)`: Creates pre-signed S3 PUT URL for direct browser upload
- Object key format: `evidence/{user_id}/{alert_id}.{ext}`
- **AES-256 server-side encryption** enabled on all uploads

---

## 10. Backend — Infrastructure

### `db.py` — MongoDB Connection
- Lazy singleton pattern (creates connection on first use)
- `get_db()` returns the database instance
- `get_collection(name)` returns a specific collection
- Connection timeout: 5 seconds

### `run_local.py` — Local Development Server
- Flask app on **port 3001** with **debug mode** enabled (auto-reload on file changes)
- Loads `backend/.env` using explicit path with `override=True`
- CORS enabled for all origins
- Wraps every request into a Lambda-like event and passes to `lambda_handler`
- Error handling with 500 response

### `template.yaml` — AWS SAM Template (Production)
- **Lambda function:** Python 3.11, 256MB RAM, 30s timeout
- **S3 Bucket:** AES-256 encryption, 30-day lifecycle (auto-delete), all public access blocked
- **API Gateway:** Routes for health, profile, guardians, alerts, CORS preflight
- **IAM Policies:** SES CRUD + S3 CRUD (least privilege)
- **Parameters:** MongoDB URI (NoEcho), Cognito IDs, SES sender email

---

## 11. API Endpoints Reference

| Method | Path | Auth | Handler | Description |
|---|---|---|---|---|
| `GET` | `/health` | ❌ Public | `health.py` | System status (API, MongoDB, S3) |
| `GET` | `/user/profile` | ✅ JWT | `user.py` | Get user profile |
| `PUT` | `/user/profile` | ✅ JWT | `user.py` | Update user profile |
| `GET` | `/user/guardians` | ✅ JWT | `guardians.py` | List all guardians |
| `POST` | `/user/guardians` | ✅ JWT | `guardians.py` | Add guardian (max 3) |
| `PUT` | `/user/guardians/{id}` | ✅ JWT | `guardians.py` | Update guardian |
| `DELETE` | `/user/guardians/{id}` | ✅ JWT | `guardians.py` | Delete guardian |
| `POST` | `/alert/simulate` | ✅ JWT | `alerts.py` | Trigger test alert |
| `GET` | `/alert/history` | ✅ JWT | `alerts.py` | List past alerts |
| `OPTIONS` | `/*` | — | `handler.py` | CORS preflight |

---

## 12. Database Schema (MongoDB Atlas)

**Cluster:** ClusterKavach (Free M0 tier)  
**Database:** `rakshak`  
**Region:** Sydney (ap-southeast-2)

### Collections

#### `users`
```json
{
    "userId": "cognito-sub-uuid",     // Cognito user sub (partition key)
    "name": "Vismay",
    "phone": "+91XXXXXXXXXX",
    "homeLocation": "Bangalore, Karnataka"
}
```

#### `guardians`
```json
{
    "_id": "ObjectId",
    "userId": "cognito-sub-uuid",
    "name": "Guardian Name",
    "email": "guardian@email.com",
    "phone": "+91XXXXXXXXXX",
    "relationship": "Mother"
}
```

#### `alerts`
```json
{
    "_id": "ObjectId",
    "userId": "cognito-sub-uuid",
    "location": { "lat": 12.9716, "lng": 77.5946 },
    "detectionType": "voice_distress",
    "confidence": 0.92,
    "timestamp": "2026-02-17T17:00:00Z",
    "deliveryMethod": "email",
    "status": "delivered",           // delivered | partial | failed | no_guardians
    "guardiansNotified": 2
}
```

---

## 13. Security Features

| Feature | Implementation |
|---|---|
| **Authentication** | AWS Cognito (managed, includes MFA capability) |
| **JWT Verification** | RS256 signature validation against Cognito JWKS |
| **CORS Headers** | Enabled on all responses (`Access-Control-Allow-Origin: *`) |
| **Rate Limiting** | Alert simulation rate-limited to 1 per 10 seconds per user |
| **Secrets Protection** | `.env` files excluded from Git via `.gitignore` |
| **S3 Encryption** | AES-256 server-side encryption on all evidence uploads |
| **S3 Access** | All public access blocked (BlockPublicAcls, etc.) |
| **Evidence Lifecycle** | Auto-deleted after 30 days (S3 lifecycle rule) |
| **Password Rules** | Enforced by Cognito (configurable in user pool) |
| **Guardian Limit** | Max 3 guardians per user (server-side enforcement) |
| **On-Device AI** | No audio/video transmitted — processing happens locally |
| **MongoDB Auth** | Password-protected database user |
| **IAM Least Privilege** | Separate IAM user with only SES, S3, Cognito permissions |

---

## 14. Current Service Status

```json
{
    "status": "healthy",
    "services": {
        "api": "healthy",
        "mongodb": "connected",
        "s3": "ready"
    },
    "version": "1.0.0"
}
```

| Service | Status | Details |
|---|---|---|
| **Frontend (Vite)** | ✅ Running | `http://localhost:5173` |
| **Backend (Flask)** | ✅ Running | `http://localhost:3001` |
| **MongoDB Atlas** | ✅ Connected | ClusterKavach, `rakshak` database |
| **AWS Cognito** | ✅ Configured | User pool `ap-southeast-2_pnneeX2EX` |
| **AWS S3** | ✅ Ready | Bucket `rakshak-evidence-kavach` exists |
| **AWS SES** | ⚠️ Sandbox | Only verified emails can receive (needs production access) |
| **Build** | ✅ Passes | 382.22 kB bundle, 0 errors, 1875 modules |

---

## 15. How to Run Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- AWS CLI configured (`aws configure`)

### Frontend
```bash
npm install
npm run dev          # → http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt flask flask-cors python-dotenv
cd ..
python backend/run_local.py    # → http://localhost:3001
```

### Verify Health
```bash
curl http://localhost:3001/health
```

---

## 16. What's Working vs What's Pending

### ✅ Fully Working
- [x] Landing page with all 10 sections + animations
- [x] Responsive design (mobile + desktop)
- [x] User signup with Cognito (email + password + name + phone)
- [x] Email verification (6-digit OTP from Cognito)
- [x] User login (email + password → JWT token)
- [x] Session persistence (stays logged in on refresh)
- [x] Protected routes (redirect if not logged in)
- [x] Dashboard layout with sidebar navigation
- [x] Overview page with live stats from API
- [x] User profile (view, edit, save to MongoDB)
- [x] Guardian management (add, edit, delete — max 3)
- [x] Alert simulation (creates record + emails guardians)
- [x] Alert history (view past alerts from MongoDB)
- [x] Evidence vault status page (S3 health check)
- [x] Health check endpoint (API, MongoDB, S3)
- [x] JWT verification (RS256 + JWKS from Cognito)
- [x] Rate limiting on alert simulation (10s cooldown)
- [x] Email notifications via AWS SES (HTML + plaintext)
- [x] S3 pre-signed URL generation utility
- [x] MongoDB Atlas connection (ClusterKavach)
- [x] CORS handling on all API responses
- [x] Git repository with proper .gitignore
- [x] Production build passes (0 errors)
- [x] AWS SAM template ready for Lambda deployment

### ⚠️ Partially Working
- [ ] AWS SES — in **sandbox mode** (can only email verified addresses; needs AWS support ticket for production)
- [ ] Evidence upload UI — backend utility exists (`s3_utils.py`) but no upload interface in the dashboard

### 🔮 Future / Not Yet Built
- [ ] Actual on-device AI model (Android app with TensorFlow Lite)
- [ ] Real-time distress detection (voice, gesture, behavior analysis)
- [ ] Push notifications (currently email-only)
- [ ] SMS alerts (via AWS SNS)
- [ ] GPS tracking integration
- [ ] Production deployment to AWS Lambda + API Gateway
- [ ] Custom domain + HTTPS
- [ ] Admin panel for monitoring all users
- [ ] Analytics dashboard (alert frequency, response times)
- [ ] Multi-language support (Hindi, Kannada, etc.)

---

> **Built by Team Kavach** 🛡️ — An intelligent guardian system that protects without being seen.
