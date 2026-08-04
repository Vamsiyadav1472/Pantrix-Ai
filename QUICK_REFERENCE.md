# ⚡ PantrixAI Quick Reference Card

## 🎯 Current Status: PART 1 COMPLETE ✅

### Fast Facts
- **Backend**: FastAPI + PostgreSQL ready
- **Tables**: 12 SQLAlchemy models created
- **Endpoints**: 50+ CRUD operations
- **Schemas**: 15+ Pydantic validators
- **Documentation**: 6 markdown files

---

## 📂 Key Files Location

```
backend/
├── .env                    ← Create this (PostgreSQL credentials)
├── .env.example           ← Template to copy from
├── main.py                ← FastAPI app (updated)
├── database.py            ← PostgreSQL connection (updated)
├── models.py              ← 12 SQLAlchemy tables (updated)
├── schemas.py             ← Pydantic validation (NEW)
├── requirements.txt       ← Dependencies (updated)
└── routes/
    └── main_api.py        ← CRUD endpoints (NEW)
```

---

## 🚀 Commands to Get Started

### Install & Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Create .env from template
cp backend/.env.example backend/.env
# Edit .env with your PostgreSQL password

# Create database tables
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"

# Run server
cd backend
uvicorn main:app --reload
```

### Test API
```bash
# Swagger UI
http://localhost:8000/docs

# ReDoc
http://localhost:8000/redoc

# Health check
curl http://localhost:8000/health
```

---

## 📊 Database Tables (Quick Reference)

| Name | Purpose | Key Feature |
|------|---------|-------------|
| users | Accounts | Email unique |
| pantry_items | Inventory | Expiry date tracking |
| ingredients | Breakdown | Allergen tracking |
| recipes | Collections | Nutrition data |
| meal_plans | Scheduling | Date range support |
| scan_history | AI results | Confidence score |
| grocery_list | Shopping | Price tracking |
| favorites | Bookmarks | Multiple types |
| notifications | Alerts | Read status |
| settings | Preferences | Dietary goals |

---

## 🔌 Most Used API Endpoints

```
# User
POST   /api/users
GET    /api/users/{id}

# Pantry
POST   /api/pantry?user_id=1
GET    /api/pantry/{user_id}
PUT    /api/pantry/{item_id}
DELETE /api/pantry/{item_id}

# Recipes
POST   /api/recipes?user_id=1
GET    /api/recipes/{user_id}

# Settings
GET    /api/settings/{user_id}
PUT    /api/settings/{user_id}
```

---

## ⚙️ Environment Variables

```bash
# Required for Part 1
DATABASE_URL=postgresql://user:password@localhost:5432/pantrixai_db
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Needed for Part 2
GEMINI_API_KEY=your_new_key_here

# Frontend
FRONTEND_URL=http://192.168.137.202:19000
```

---

## ✅ Part 1 Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] `.env` file created with correct password
- [ ] `pip install -r backend/requirements.txt` completed
- [ ] Database tables created successfully
- [ ] `uvicorn main:app --reload` runs without errors
- [ ] http://localhost:8000/docs loads in browser
- [ ] Can create user via POST /api/users
- [ ] Can add pantry item via POST /api/pantry

---

## 🔄 Next Phase: Part 2 (Gemini AI)

**Checklist:**
- [ ] Revoke exposed API key in Google Cloud
- [ ] Generate new Gemini API key
- [ ] Update .env with GEMINI_API_KEY
- [ ] Update backend/routes/scanner.py

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "could not translate host name" | Check PostgreSQL is running, correct URL |
| "password authentication failed" | Wrong password in .env |
| "database does not exist" | Run createdb -U postgres pantrixai_db |
| "ModuleNotFoundError: psycopg2" | pip install psycopg2-binary |
| Port 8000 already in use | uvicorn main:app --port 8001 |

---

## 📈 Architecture Overview

```
React Native App
     ↓
API Gateway (CORS Enabled)
     ↓
FastAPI Routes
├── /api/users
├── /api/pantry
├── /api/recipes
├── /api/meal-plans
└── /api/settings
     ↓
SQLAlchemy ORM
     ↓
PostgreSQL Database
├── users
├── pantry_items
├── recipes
└── 9 more tables...
```

---

## 🛡️ Security Checklist

- ✅ Credentials in .env (not in code)
- ✅ PostgreSQL user has limited privileges
- ✅ CORS configured for frontend
- ⚠️ TODO: Hash passwords in production
- ⚠️ TODO: Add JWT authentication
- ⚠️ TODO: Enable HTTPS in production

---

## 📖 Documentation Map

| Document | Purpose |
|----------|---------|
| README_PART1.md | Complete Part 1 summary |
| BACKEND_SETUP.md | Step-by-step PostgreSQL setup |
| DATABASE_SCHEMA.md | Full schema with examples |
| IMPLEMENTATION_PLAN.md | 3-phase roadmap |
| PART1_COMPLETE.md | Quick summary |

---

## 🎓 Learning Path

**Part 1 (Now):** PostgreSQL + FastAPI + Database Design ✅

**Part 2 (Next):** Gemini Vision API + Food Detection
- Image processing
- AI analysis
- Nutrition extraction
- Recipe generation

**Part 3 (Final):** React Native UI
- Camera capture
- Gallery upload
- Loading states
- Results display

---

## 📝 Code Examples

### Create User
```python
POST /api/users
{
  "username": "john",
  "email": "john@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

### Add Item
```python
POST /api/pantry?user_id=1
{
  "name": "Chicken",
  "category": "Proteins",
  "quantity": 500,
  "unit": "grams",
  "expiry_date": "2026-05-20"
}
```

### Get Stats
```python
GET /api/pantry/stats/1
# Returns: {total_items, total_calories, categories, avg_items_per_category}
```

---

## 🆘 Need Help?

1. Check **BACKEND_SETUP.md** for PostgreSQL setup
2. Check **DATABASE_SCHEMA.md** for data structure
3. Visit **http://localhost:8000/docs** for API documentation
4. Run `python -c "from database import engine; engine.connect()"` to test DB connection

---

**Status: Ready for Part 2! 🚀**

Revoke exposed API key → Generate new → Update .env → Proceed with Gemini integration
