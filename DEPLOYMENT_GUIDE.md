# 🎓 Student Grievance Portal — Complete Deployment Guide

## 📁 Project Structure
```
grievance-system/
├── backend/
│   ├── server.js       ← All backend logic (Node + Express + MongoDB)
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   └── App.jsx     ← All frontend components (React)
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## STEP 1 — Run Locally

### 1A. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# → Edit .env with your MongoDB URI and JWT secret
npm run dev          # starts on http://localhost:5000
```

### 1B. Setup Frontend
```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

> In local dev, Vite proxies `/api` calls to `localhost:5000` automatically (via `vite.config.js`).

---

## STEP 2 — MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Sign Up (free)
2. Create a **Free Cluster** (M0 tier)
3. **Database Access** → Add DB User → username + password
4. **Network Access** → Add IP Address → click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. **Connect** → Connect your application → copy the connection string
6. Replace `<username>` and `<password>` in the URI, set dbname to `grievanceDB`
7. Paste into your `backend/.env` as `MONGO_URI`

---

## STEP 3 — Push to GitHub

```bash
# In the root grievance-system/ folder:
git init
git add .
git commit -m "Initial commit: MERN Grievance System"
```

1. Go to https://github.com → **New repository** → name it `grievance-system`
2. Copy the remote URL shown, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/grievance-system.git
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy Backend on Render

1. Go to https://render.com → Sign up → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
4. Add **Environment Variables**:
   - `MONGO_URI` → your Atlas connection string
   - `JWT_SECRET` → any strong random string (e.g. `mySuperSecret123!`)
   - `PORT` → `5000`
5. Click **Deploy** — wait ~2 min
6. Copy your Render URL: `https://grievance-backend-xxxx.onrender.com`

---

## STEP 5 — Deploy Frontend on Render

1. **New → Static Site** on Render
2. Connect same GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL` → your backend Render URL (from Step 4), e.g.:
     `https://grievance-backend-xxxx.onrender.com`
5. Click **Deploy**
6. Your frontend URL: `https://grievance-frontend-xxxx.onrender.com`

---

## STEP 6 — Test All API Endpoints (Postman/Thunder Client)

### Auth
| Method | URL | Body |
|--------|-----|------|
| POST | `/api/register` | `{ "name": "Rahul", "email": "r@test.com", "password": "123456" }` |
| POST | `/api/login` | `{ "email": "r@test.com", "password": "123456" }` → returns `token` |

### Grievances (add `Authorization: Bearer <token>` header)
| Method | URL | Body |
|--------|-----|------|
| POST | `/api/grievances` | `{ "title": "WiFi issue", "description": "...", "category": "Hostel" }` |
| GET | `/api/grievances` | — |
| GET | `/api/grievances/:id` | — |
| PUT | `/api/grievances/:id` | `{ "status": "Resolved" }` |
| DELETE | `/api/grievances/:id` | — |
| GET | `/api/grievances/search?title=wifi` | — |

---

## STEP 7 — What to Include in PDF Submission

- [ ] Code screenshots (or paste code from files above)
- [ ] Screenshots of app running locally (Register, Login, Dashboard, Submit, Edit, Delete, Search)
- [ ] Postman screenshots for all 8 endpoints above
- [ ] MongoDB Atlas screenshot showing documents stored in `grievances` collection
- [ ] Render dashboard screenshot showing **Deploy successful** ✅
- [ ] Live Render URLs for each endpoint tested

---

## 🔑 Quick Reference

| | Local | Production |
|---|---|---|
| Backend | `http://localhost:5000` | `https://your-backend.onrender.com` |
| Frontend | `http://localhost:5173` | `https://your-frontend.onrender.com` |
| MongoDB | Local `.env` | Atlas URI in Render env vars |
