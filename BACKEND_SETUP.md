# PantrixAI PostgreSQL Database Setup Guide

## Part 1: PostgreSQL Backend Setup ✅ COMPLETE

This guide covers setting up PostgreSQL database integration for PantrixAI with FastAPI, SQLAlchemy, and secure environment configuration.

---

## Prerequisites

- Python 3.9+
- PostgreSQL 12+ installed
- pip package manager
- Terminal/Command Prompt access

---

## Step 1: Install PostgreSQL

### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer, set password for `postgres` user
3. Note the port (default: 5432)
4. Add PostgreSQL to PATH

### Mac:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## Step 2: Create Database

### Using pgAdmin (GUI):
1. Open pgAdmin (comes with PostgreSQL)
2. Right-click "Databases" → Create → Database
3. Name: `pantrixai_db`
4. Click Save

### Using psql (Command Line):
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pantrixai_db;

# Create user with password
CREATE USER pantrixai_user WITH PASSWORD 'secure_password_123';

# Grant privileges
ALTER ROLE pantrixai_user SET client_encoding TO 'utf8';
ALTER ROLE pantrixai_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE pantrixai_user SET default_transaction_deferrable TO on;
ALTER ROLE pantrixai_user SET default_transaction_read_committed TO off;
GRANT ALL PRIVILEGES ON DATABASE pantrixai_db TO pantrixai_user;

# Quit psql
\q
```

---

## Step 3: Configure Environment Variables

### Create `.env` file in backend folder:

```bash
# Backend Configuration
DATABASE_URL=postgresql://pantrixai_user:secure_password_123@localhost:5432/pantrixai_db

# Gemini AI Configuration  
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
DEBUG=True

# CORS Configuration
FRONTEND_URL=http://192.168.137.202:19000
```

**IMPORTANT:** 
- Copy `.env.example` to `.env` first
- Update password with your PostgreSQL password
- Add your Gemini API key (see Part 2)
- Never commit `.env` to git (add to `.gitignore`)

---

## Step 4: Install Python Dependencies

```bash
cd backend

# Install required packages
pip install -r requirements.txt

# Verify installation
pip list | grep -E "fastapi|sqlalchemy|psycopg2|pydantic"
```

**Dependencies installed:**
- `fastapi==0.111.0` - Web framework
- `sqlalchemy==2.0.30` - ORM
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `pydantic==2.7.1` - Data validation
- `python-dotenv==1.0.1` - Environment variables
- `alembic==1.13.1` - Database migrations
- `google-generativeai==0.3.0` - Gemini AI integration
- `python-multipart==0.0.6` - File upload support

---

## Step 5: Initialize Alembic (Database Migrations)

```bash
# Initialize Alembic in your backend folder
alembic init alembic

# Update alembic/env.py to use your models
# This is done automatically in our setup
```

---

## Step 6: Test Database Connection

```bash
# Start Python REPL
python

# Run these commands:
from database import engine
from models import Base

# Test connection
with engine.connect() as conn:
    print("✅ Database connection successful!")

# Create all tables
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")

# Exit
exit()
```

---

## Step 7: Run Backend Server

```bash
# From backend directory
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Output should show:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

**Visit API Docs:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Database Tables Created

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | id, username, email, password_hash |
| `pantry_items` | Food inventory | id, user_id, name, category, quantity, expiry_date |
| `ingredients` | Detailed ingredients | id, pantry_item_id, name, quantity, allergen |
| `recipes` | Recipe data | id, user_id, name, ingredients, instructions |
| `meal_plans` | Meal planning | id, user_id, start_date, end_date, meals |
| `scan_history` | Food scan logs | id, user_id, food_name, nutrition_data, image_url |
| `grocery_list` | Shopping lists | id, user_id, name, items, total_price |
| `favorites` | Favorite recipes | id, user_id, recipe_id, favorite_type |
| `notifications` | User alerts | id, user_id, title, message, type |
| `settings` | User preferences | id, user_id, theme, diet_preference, goals |

---

## Core API Endpoints (Available Now)

### User Management
- `POST /api/users` - Create new user
- `GET /api/users/{user_id}` - Get user profile
- `PUT /api/users/{user_id}` - Update user

### Pantry Items
- `POST /api/pantry` - Add item (requires user_id)
- `GET /api/pantry/{user_id}` - Get all items
- `GET /api/pantry/item/{item_id}` - Get specific item
- `PUT /api/pantry/{item_id}` - Update item
- `DELETE /api/pantry/{item_id}` - Delete item
- `GET /api/pantry/expiring/{user_id}?days=7` - Get expiring items
- `GET /api/pantry/stats/{user_id}` - Get statistics

### Recipes
- `POST /api/recipes` - Create recipe (requires user_id)
- `GET /api/recipes/{user_id}` - Get all recipes
- `GET /api/recipes/item/{recipe_id}` - Get specific recipe
- `PUT /api/recipes/{recipe_id}` - Update recipe
- `DELETE /api/recipes/{recipe_id}` - Delete recipe

### Meal Plans
- `POST /api/meal-plans` - Create meal plan (requires user_id)
- `GET /api/meal-plans/{user_id}` - Get all meal plans
- `PUT /api/meal-plans/{plan_id}` - Update meal plan
- `DELETE /api/meal-plans/{plan_id}` - Delete meal plan

### Grocery Lists
- `POST /api/grocery-list` - Create list (requires user_id)
- `GET /api/grocery-list/{user_id}` - Get all lists
- `PUT /api/grocery-list/{list_id}` - Update list
- `DELETE /api/grocery-list/{list_id}` - Delete list

### Settings
- `POST /api/settings/{user_id}` - Create settings
- `GET /api/settings/{user_id}` - Get settings
- `PUT /api/settings/{user_id}` - Update settings

---

## Example API Requests

### Create User
```bash
curl -X POST "http://localhost:8000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

### Add Pantry Item
```bash
curl -X POST "http://localhost:8000/api/pantry?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Breast",
    "category": "Proteins",
    "quantity": 500,
    "unit": "grams",
    "expiry_date": "2026-05-15",
    "location": "Fridge",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6
  }'
```

### Get Pantry Stats
```bash
curl "http://localhost:8000/api/pantry/stats/1"
```

---

## Troubleshooting

### Error: "could not translate host name"
- Database URL is incorrect
- Check PostgreSQL is running: `pg_isready`

### Error: "FATAL:  password authentication failed"
- Database password is wrong in .env
- Reset PostgreSQL user password in psql

### Error: "database "pantrixai_db" does not exist"
- Create database: `createdb -U postgres pantrixai_db`

### Error: "ModuleNotFoundError: No module named 'psycopg2'"
- Install: `pip install psycopg2-binary`

### Tables not created
- Run: `python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"`

---

## Next Steps

**Part 2 - Gemini AI Integration:**
- Set up Gemini Vision API
- Add food detection endpoint
- Implement image processing

**Part 3 - React Native Camera:**
- Build camera capture UI
- Add gallery upload feature  
- Integrate with backend

---

## Security Checklist

- ✅ Password is strong (16+ chars, mixed case, numbers, symbols)
- ✅ PostgreSQL user has limited privileges (not superuser)
- ✅ `.env` file is in `.gitignore`
- ✅ Database URL not hardcoded in code
- ✅ CORS configured for specific frontend URL
- ✅ API uses HTTPS in production

---

## Useful PostgreSQL Commands

```bash
# Connect to database
psql -U pantrixai_user -d pantrixai_db

# List tables
\dt

# Describe table
\d pantry_items

# Count rows
SELECT COUNT(*) FROM pantry_items;

# Reset database (delete all data)
DROP DATABASE pantrixai_db;
CREATE DATABASE pantrixai_db;

# Backup database
pg_dump -U pantrixai_user pantrixai_db > backup.sql

# Restore database
psql -U pantrixai_user pantrixai_db < backup.sql
```

---

## File Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── database.py            # PostgreSQL connection
├── models.py              # SQLAlchemy models (12 tables)
├── schemas.py             # Pydantic validation schemas
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (SECURE)
├── .env.example          # Template for .env
├── routes/
│   ├── __init__.py
│   ├── main_api.py       # Core CRUD endpoints (NEW)
│   ├── pantry.py         # Pantry operations
│   ├── recipes.py        # Recipe operations
│   ├── mealplan.py       # Meal plan operations
│   ├── ai.py             # AI operations
│   └── scanner.py        # Food scanner integration
└── alembic/              # Database migrations (optional)
```

---

**Status: ✅ PART 1 COMPLETE**

Your PostgreSQL database is now fully integrated with FastAPI and ready for PART 2: Gemini AI Integration.
