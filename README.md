# 🥦 Pantrix AI

> AI-Driven Smart Pantry for Meal Planning, Expiry Monitoring, and Recipe Recommendation

## Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React Native (JavaScript)
- **Database**: SQLite (dev) → PostgreSQL (production)
- **AI**: OpenAI GPT-4o-mini for recipe recommendations

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd pantrix-ai/backend
pip install -r requirements.txt
```

Create a `.env` file (already included):
```
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=sqlite:///./pantrix_ai.db
```

Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Frontend Setup

> First install React Native CLI and Android Studio with an emulator.

```bash
cd pantrix-ai/frontend
npm install
npx react-native run-android
```

> **Note**: The API URL in all screens is set to `http://10.0.2.2:8000` which maps to your localhost from the Android emulator. If using a real device, replace with your machine's local IP (e.g. `http://192.168.1.x:8000`).

---

## 📁 Project Structure

```
pantrix-ai/
├── backend/
│   ├── main.py              ← FastAPI app entry point
│   ├── models.py            ← SQLAlchemy database models
│   ├── database.py          ← DB connection & session
│   ├── .env                 ← Environment variables
│   ├── requirements.txt
│   └── routes/
│       ├── pantry.py        ← CRUD for pantry items
│       ├── recipes.py       ← Recipe management
│       ├── mealplan.py      ← Meal planning routes
│       └── ai.py            ← AI recipe recommendations
│
└── frontend/
    ├── App.js               ← Navigation setup
    ├── screens/
    │   ├── HomeScreen.js    ← Dashboard + expiry alerts
    │   ├── PantryScreen.js  ← Pantry items management
    │   ├── RecipesScreen.js ← AI recipe suggestions
    │   └── MealPlanScreen.js← Weekly meal planner
    └── components/
        ├── ExpiryCard.js
        ├── RecipeCard.js
        └── BottomNav.js
```

---

## 📱 App Screens

| Screen | Description |
|--------|-------------|
| 🏠 Home | Stats overview, AI suggestions, expiring items |
| 🥡 Pantry | All items with category filter, add/delete |
| 🍳 Recipes | AI-generated recipes from pantry contents |
| 📅 Meal Plan | Weekly calendar with calorie tracking |

---

## 🔑 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /pantry/ | Get all pantry items |
| POST | /pantry/ | Add new item |
| DELETE | /pantry/{id} | Delete item |
| GET | /pantry/stats | Pantry statistics |
| GET | /pantry/expiring-soon | Items expiring in N days |
| POST | /ai/recommend-recipes | Get AI recipe suggestions |
| GET | /ai/expiry-alert | Get expiry alerts + suggestion |
| GET | /mealplan/ | Get meal plans (filter by date) |
| POST | /mealplan/ | Add meal to plan |
