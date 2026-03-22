# AgentHub — MERN Stack Agent Management Appppppppp


A full-stack web application for managing agents and distributing contact lists, built with MongoDB, Express.js, React.js, and Node.js.

---

## 📋 Features

- **Admin Authentication** — Secure JWT-based login with hashed passwords
- **Agent Management** — Create, edit, and delete agents with full contact details
- **CSV/Excel Upload** — Upload `.csv`, `.xlsx`, or `.xls` files with automatic validation
- **Smart Distribution** — Equally distribute list items among all active agents (round-robin)
- **History View** — Browse all previous upload batches with expandable distributions

---

## 🏗 Project Structure

```
mern-app/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── User.js           # Admin user model
│   │   ├── Agent.js          # Agent model
│   │   └── DistributedList.js # Distributed list model
│   ├── routes/
│   │   ├── auth.js           # Login / register routes
│   │   ├── agents.js         # Agent CRUD routes
│   │   └── lists.js          # Upload & distribution routes
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── server.js             # Express server entry point
│   ├── seed.js               # Database seeder (sample data)
│   ├── .env                  # Environment configuration
│   └── package.json
│
├── frontend/                 # React.js SPA
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js      # Login & admin setup page
│   │   │   ├── Dashboard.js  # Overview & stats
│   │   │   ├── Agents.js     # Agent management
│   │   │   └── Lists.js      # CSV upload & distribution
│   │   ├── components/
│   │   │   └── Layout.js     # Sidebar + layout shell
│   │   ├── utils/
│   │   │   └── api.js        # Axios API calls
│   │   ├── App.js            # Routes & app entry
│   │   └── App.css           # Global styles
│   ├── public/index.html
│   ├── .env
│   └── package.json
│
├── sample.csv                # Sample CSV for testing
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v16 or higher — [Download](https://nodejs.org/)
- **MongoDB** v5 or higher — [Download](https://www.mongodb.com/try/download/community)
- **npm** v8 or higher (comes with Node.js)

---

## 🚀 Setup & Installation

### Step 1 — Clone the repository
```bash
git clone <repo-url>
cd mern-app
```

### Step 2 — Configure the Backend
```bash
cd backend
```

Edit `.env` if needed (defaults work for local MongoDB):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-agent-app
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRES_IN=7d
```

### Step 3 — Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 4 — Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 5 — Seed the Database (Recommended)
Run this to create a sample admin and 5 agents:
```bash
cd ../backend
node seed.js
```

This creates:
- **Admin:** `admin@example.com` / `admin123`
- **5 Sample Agents** ready for list distribution

---

## ▶️ Running the Application

You need **two terminal windows**.

### Terminal 1 — Backend API
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

---

## 🧪 Testing the App

1. **Open** `http://localhost:3000`
2. **Login** with `admin@example.com` / `admin123`
3. **Navigate to Agents** to view or add agents
4. **Navigate to Lists** to upload `sample.csv` (included in project root)
5. **View results** — 25 items distributed equally among 5 agents (5 each)

### CSV Format
The uploaded file must have these columns (case-insensitive):
```csv
FirstName,Phone,Notes
John,1234567890,Call in morning
Jane,9876543210,Interested in Plan A
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/register` | Create admin (first-time setup) |
| GET | `/api/auth/me` | Get current user |

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | Get all agents |
| POST | `/api/agents` | Create an agent |
| PUT | `/api/agents/:id` | Update an agent |
| DELETE | `/api/agents/:id` | Delete an agent |

### Lists
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lists/upload` | Upload & distribute CSV |
| GET | `/api/lists` | Get all batches |
| DELETE | `/api/lists/batch/:batchId` | Delete a batch |

---

## 🔐 Authentication

All API routes (except `/api/auth/login` and `/api/auth/register`) require a Bearer token:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 📊 Distribution Logic

Items are distributed using a **round-robin** algorithm:
- Item 1 → Agent 1
- Item 2 → Agent 2
- Item 3 → Agent 3
- ...continuing until all items are assigned

**Example:** 25 items ÷ 5 agents = 5 items each  
**Example:** 27 items ÷ 5 agents = agents 1-2 get 6 items, agents 3-5 get 5 items

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB + Mongoose |
| Backend | Node.js + Express.js |
| Frontend | React.js 18 + React Router v6 |
| Auth | JWT + bcryptjs |
| File Parsing | xlsx (SheetJS) |
| File Upload | Multer |
| HTTP Client | Axios |
| Notifications | React Toastify |

---

## 📝 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-agent-app
JWT_SECRET=change_this_to_a_strong_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚨 Troubleshooting

**MongoDB not connecting?**
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check your `MONGODB_URI` in `.env`

**CORS errors?**
- Make sure the backend is running on port 5000
- The `proxy` field in `frontend/package.json` handles this in development

**Port conflicts?**
- Change `PORT` in `backend/.env` and update `REACT_APP_API_URL` in `frontend/.env`

---

## 📜 License

MIT — Free to use and modify.
