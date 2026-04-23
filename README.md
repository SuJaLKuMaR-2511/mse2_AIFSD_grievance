# 🎓 Student Grievance Management System
### MERN Stack | AI308B — AI Driven Full Stack Development

A full-stack web application that allows college students to register, login, submit grievances, and manage their complaints with full CRUD functionality.

---

## 🔗 Live Links

| Service | URL |
|--------|-----|
| 🌐 Frontend | `https://grievancesystem-mse2-aifsd-1.onrender.com/` |
| ⚙️ Backend API | `https://grievancesystem-mse2-aifsd.onrender.com` |
| 🗄️ Database | MongoDB Atlas |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Password | bcryptjs |
| Deployment | Render (frontend + backend), MongoDB Atlas |

---

## 📁 Project Structure

```
grievance-system/
├── backend/
│   ├── server.js          # Express server, routes, models
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # All React components
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── DEPLOYMENT_GUIDE.md
```

---

## ⚙️ API Endpoints

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Register new student | ❌ |
| POST | `/api/login` | Login & get JWT token | ❌ |

### Grievance Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/grievances` | Submit new grievance | ✅ |
| GET | `/api/grievances` | Get all grievances | ✅ |
| GET | `/api/grievances/:id` | Get grievance by ID | ✅ |
| PUT | `/api/grievances/:id` | Update grievance | ✅ |
| DELETE | `/api/grievances/:id` | Delete grievance | ✅ |
| GET | `/api/grievances/search?title=xyz` | Search by title | ✅ |

> All protected routes require `Authorization: Bearer <token>` header.

---

## 🗃️ MongoDB Schemas

### Student
```js
{
  name:     String (required),
  email:    String (required, unique),
  password: String (hashed with bcrypt)
}
```

### Grievance
```js
{
  title:       String (required),
  description: String (required),
  category:    Enum → Academic | Hostel | Transport | Other,
  date:        Date (auto),
  status:      Enum → Pending | Resolved (default: Pending),
  studentId:   ObjectId (ref: Student)
}
```

---

## 🚀 Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/UtkarshPandey04/grievance-system.git
cd grievance-system/grievance-system
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
# Runs on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend `.env`
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/grievanceDB
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
# Change to Render URL after deployment
```

---

## 📱 Features

- ✅ Student Registration & Login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Submit, view, edit, delete grievances
- ✅ Search grievances by title
- ✅ Category tagging (Academic / Hostel / Transport / Other)
- ✅ Status tracking (Pending / Resolved)
- ✅ Protected routes — only logged-in users can manage grievances
- ✅ Error handling (duplicate email, invalid login, unauthorized access)
- ✅ Fully deployed on Render + MongoDB Atlas

---

## 👨‍💻 Author

**SuJaL KuMaR**  
B.Tech 4th Semester — AI308B  
MSE-2 Examination, Even Sem 2025-26
