# PantrixAI Database Schema Reference

## Complete Database Structure

### 1. USERS Table
```sql
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE, EmailStr)
├── password_hash
├── full_name
├── avatar_url
├── created_at (DateTime)
└── updated_at (DateTime)
```

**Relationships:**
- One user → Many pantry_items
- One user → Many scan_history
- One user → Many recipes
- One user → Many meal_plans
- One user → Many grocery_lists
- One user → Many favorites
- One user → Many notifications
- One user → One settings

---

### 2. PANTRY_ITEMS Table
```sql
pantry_items
├── id (PK)
├── user_id (FK → users)
├── name
├── category
├── quantity
├── unit (piece, gram, ml, etc.)
├── expiry_date (Date)
├── added_date (DateTime)
├── updated_at (DateTime)
├── location (Fridge, Pantry, Freezer)
├── notes (Text)
├── calories (Float)
├── protein (Float)
├── carbs (Float)
├── fat (Float)
├── fiber (Float)
└── sugar (Float)
```

**Features:**
- Expiry date tracking
- Nutrition information per 100g
- Storage location tracking
- Notes for custom info

**Relationships:**
- One pantry_item → Many ingredients

---

### 3. INGREDIENTS Table
```sql
ingredients
├── id (PK)
├── pantry_item_id (FK → pantry_items)
├── name
├── quantity
├── unit
├── allergen (Boolean)
└── allergen_type (peanuts, gluten, dairy, etc.)
```

**Purpose:** Detailed ingredient breakdown for recipes

---

### 4. RECIPES Table
```sql
recipes
├── id (PK)
├── user_id (FK → users)
├── name
├── description (Text)
├── ingredients (Text/JSON)
├── steps (Text)
├── prep_time (minutes)
├── cook_time (minutes)
├── servings
├── calories (total)
├── difficulty (Easy/Medium/Hard)
├── tags (CSV)
├── ai_generated (Boolean)
├── image_url
├── nutrition (JSON - full breakdown)
├── is_favorite (Boolean)
├── created_at (DateTime)
└── updated_at (DateTime)
```

**Features:**
- AI-generated recipe tracking
- Full nutrition breakdown
- Time estimation
- Difficulty level
- Favorite marking

---

### 5. MEAL_PLANS Table
```sql
meal_plans
├── id (PK)
├── user_id (FK → users)
├── name
├── start_date
├── end_date
├── plan_date (Date)
├── meal_type (breakfast/lunch/dinner/snack)
├── recipe_name
├── calories (for that meal)
├── meals (JSON: {date: {breakfast, lunch, dinner, snack}})
├── notes (Text)
├── created_at (DateTime)
└── updated_at (DateTime)
```

**Features:**
- Date range planning
- Multiple meals per day
- Nutrition tracking per meal
- Flexible JSON structure for complex plans

---

### 6. SCAN_HISTORY Table
```sql
scan_history
├── id (PK)
├── user_id (FK → users)
├── food_name
├── confidence (0-100 float)
├── category
├── calories
├── protein
├── carbs
├── fat
├── fiber
├── sugar
├── health_score (0-100)
├── image_url
├── nutrition_data (JSON - full nutrition)
├── ingredients_detected (JSON - array of ingredients)
├── making_process (Text - step-by-step recipe)
└── scanned_at (DateTime)
```

**Features:**
- Food image analysis history
- Confidence score from AI
- Full nutrition extracted
- Detected ingredients
- Step-by-step cooking instructions

---

### 7. GROCERY_LIST Table
```sql
grocery_list
├── id (PK)
├── user_id (FK → users)
├── name
├── items (JSON: [{name, quantity, unit, bought, price}])
├── total_price
├── created_at (DateTime)
└── updated_at (DateTime)
```

**Features:**
- Multiple lists per user
- Track purchased vs pending
- Price tracking per item
- Total cost calculation

---

### 8. FAVORITES Table
```sql
favorites
├── id (PK)
├── user_id (FK → users)
├── recipe_id
├── name
├── image_url
├── favorite_type (recipe/ingredient/meal)
└── added_at (DateTime)
```

**Features:**
- Save favorite recipes
- Mark favorite ingredients
- Track favorite meals
- Quick access

---

### 9. NOTIFICATIONS Table
```sql
notifications
├── id (PK)
├── user_id (FK → users)
├── title
├── message (Text)
├── notification_type (expiry/alert/suggestion/news)
├── is_read (Boolean)
├── related_item_id (FK to any item)
└── created_at (DateTime)
```

**Types:**
- **expiry** - Item expiring soon
- **alert** - Dietary alert
- **suggestion** - Recipe/meal suggestion
- **news** - App updates/tips

---

### 10. SETTINGS Table
```sql
settings
├── id (PK)
├── user_id (FK → users, UNIQUE)
├── theme (light/dark)
├── notifications_enabled (Boolean)
├── language (en/es/fr/etc.)
├── diet_preference (vegan/keto/vegetarian/normal)
├── allergies (JSON: [array of allergens])
├── daily_calorie_goal
├── daily_protein_goal
├── daily_carbs_goal
├── daily_fat_goal
└── updated_at (DateTime)
```

**Features:**
- User preferences
- Dietary restrictions
- Nutritional goals
- Allergy tracking
- Theme preference

---

## Relationships Diagram

```
User (1) ──→ (Many) PantryItems
    ├─→ (Many) ScanHistory
    ├─→ (Many) Recipes
    ├─→ (Many) MealPlans
    ├─→ (Many) GroceryLists
    ├─→ (Many) Favorites
    ├─→ (Many) Notifications
    └─→ (One) Settings

PantryItem (1) ──→ (Many) Ingredients
```

---

## Data Types Used

| Type | SQL Equivalent | Use Case |
|------|---|---|
| Integer | INT | IDs, counts, scores |
| String(N) | VARCHAR(N) | Names, categories |
| Float | FLOAT/DECIMAL | Nutrition, prices |
| Boolean | BOOLEAN | Flags (is_favorite, is_read) |
| Text | TEXT | Long descriptions, instructions |
| DateTime | TIMESTAMP | When records created/updated |
| Date | DATE | Expiry dates, meal dates |
| JSON | JSON/JSONB | Complex nested data |

---

## API Response Examples

### GET /api/pantry/1 (Get all pantry items)
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Chicken Breast",
    "category": "Proteins",
    "quantity": 500,
    "unit": "grams",
    "expiry_date": "2026-05-15",
    "location": "Fridge",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "fiber": 0,
    "sugar": 0,
    "added_date": "2026-05-07T10:30:00",
    "updated_at": "2026-05-07T10:30:00"
  }
]
```

### GET /api/pantry/stats/1 (Get pantry statistics)
```json
{
  "total_items": 25,
  "total_calories": 5250,
  "categories": ["Proteins", "Vegetables", "Fruits", "Grains"],
  "avg_items_per_category": 6.25
}
```

### GET /api/pantry/expiring/1?days=7
```json
{
  "items": [
    {
      "id": 3,
      "name": "Spinach",
      "expiry_date": "2026-05-10",
      "days_left": 3
    }
  ],
  "count": 1
}
```

### POST /api/recipes (Create recipe)
```json
{
  "name": "Grilled Chicken Salad",
  "description": "Healthy grilled chicken with fresh vegetables",
  "ingredients": "Chicken 500g, Mixed greens 200g, Tomatoes 150g",
  "steps": "1. Grill chicken\n2. Mix vegetables\n3. Serve",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 2,
  "calories": 350,
  "difficulty": "Easy"
}
```

### POST /api/meal-plans
```json
{
  "name": "Weekly Meal Plan",
  "start_date": "2026-05-07",
  "end_date": "2026-05-13",
  "meals": {
    "2026-05-07": {
      "breakfast": "Oatmeal with fruits",
      "lunch": "Grilled chicken salad",
      "dinner": "Vegetable curry with rice"
    }
  }
}
```

---

## Indexes (for Performance)

```sql
-- Primary indexes (auto-created)
user_id_idx on pantry_items(user_id)
user_id_idx on scan_history(user_id)
user_id_idx on recipes(user_id)

-- Additional recommended indexes
expiry_date_idx on pantry_items(expiry_date)
category_idx on pantry_items(category)
favorite_idx on recipes(is_favorite)
created_at_idx on scan_history(created_at)
```

---

## Migration Commands (When Using Alembic)

```bash
# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1

# View migration history
alembic history
```

---

## Backup & Restore

```bash
# Backup PostgreSQL database
pg_dump -U pantrixai_user -d pantrixai_db > backup.sql

# Restore from backup
psql -U pantrixai_user pantrixai_db < backup.sql

# Backup specific table
pg_dump -U pantrixai_user -d pantrixai_db -t pantry_items > pantry_backup.sql
```

---

## Reference Implementation

All tables are created automatically when you run:

```python
from database import engine
from models import Base

Base.metadata.create_all(bind=engine)
```

No manual SQL needed! 🎉
