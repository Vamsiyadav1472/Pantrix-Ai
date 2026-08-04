# PantrixAI Implementation Plan - 3 Parts

## ✅ PART 1: PostgreSQL Backend Setup - COMPLETE

**What was implemented:**
- PostgreSQL database configuration with `.env` file
- 12 comprehensive SQLAlchemy models with relationships
- Pydantic schemas for all entities with validation
- CRUD API endpoints for all data models:
  - User management (create, read, update)
  - Pantry items (CRUD + expiry tracking + stats)
  - Recipes (CRUD + nutrition tracking)
  - Meal plans (CRUD + meal scheduling)
  - Grocery lists (CRUD + shopping tracking)
  - User settings (preferences, dietary goals)
  - Favorites, notifications, scan history
- CORS configuration for React Native frontend
- Error handling and database connection pooling

**Files created/modified:**
- ✅ `backend/.env.example` - Environment variable template
- ✅ `backend/requirements.txt` - Added PostgreSQL dependencies
- ✅ `backend/database.py` - PostgreSQL connection configuration
- ✅ `backend/models.py` - 12 SQLAlchemy models
- ✅ `backend/schemas.py` - Pydantic validation schemas
- ✅ `backend/routes/main_api.py` - All CRUD endpoints
- ✅ `backend/main.py` - Updated with CORS & new router
- ✅ `BACKEND_SETUP.md` - Complete setup guide

**How to test Part 1:**
```bash
# 1. Create .env from template
cp backend/.env.example backend/.env

# 2. Update .env with PostgreSQL credentials
# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Create database and tables
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"

# 5. Run backend
cd backend
uvicorn main:app --reload

# 6. Visit http://localhost:8000/docs to test endpoints
```

---

## 🔄 PART 2: Gemini AI Integration (Next)

**What will be implemented:**
1. Backend Gemini Vision API integration
   - Initialize Gemini client with API key
   - Create food detection endpoint `/scanner/analyze-food`
   - Extract: food name, confidence, nutrition, ingredients with measurements
   - Extract: step-by-step recipe/making process
   - Error handling with retry logic
   - Graceful fallbacks for API failures

2. Image processing pipeline
   - Handle base64 encoded images from frontend
   - Save images to storage (optional)
   - Log scan results to database

3. Response formatting
   - Structure: {food_name, confidence, nutrition{}, ingredients[], making_process}
   - Validate nutrition data completeness
   - Generate health score

**Expected API endpoint:**
```
POST /scanner/analyze-food
Request: { image_data: base64_string, image_format: "jpg|png" }
Response: {
  status: "success",
  food_name: "Biryani",
  confidence: 95.5,
  nutrition: {
    calories: 450,
    protein: 18,
    carbs: 65,
    fat: 12,
    fiber: 3,
    sugar: 2,
    health_score: 78
  },
  ingredients: [
    {name: "Basmati Rice", quantity: 200, unit: "grams"},
    {name: "Chicken", quantity: 500, unit: "grams"},
    ...
  ],
  making_process: "1. Soak rice...\n2. Marinate chicken...\n3. Layer and cook..."
}
```

---

## 📱 PART 3: React Native Camera & Gallery Feature (Final)

**What will be implemented:**

1. Enhanced ImageRecognitionScreen component
   - Camera capture with live preview
   - Gallery image upload
   - Image cropping/preview before submission
   - Clear focus rectangle UI

2. Loading & progress states
   - Animated spinner during analysis
   - Progress text ("Analyzing food...", "Detecting ingredients...")
   - Loading percentage

3. Error handling & retry
   - Network error detection
   - User-friendly error messages
   - Retry button with exponential backoff
   - Offline mode fallback

4. Results display
   - Nutrition facts card with gauges/bars
   - Ingredient list with measurements
   - Step-by-step cooking instructions
   - "Add to Pantry" button
   - "View Recipe Details" button

5. Integration with backend
   - Send image to `/scanner/analyze-food`
   - Store results in scan_history table
   - Display results from database

**Updated components:**
- `frontend/screens/ImageRecognitionScreen.js` - Full rewrite
- `frontend/services/api.js` - Add image upload endpoints
- `frontend/components/NutritionCard.js` - Display nutrition (new)
- `frontend/components/IngredientsList.js` - Display ingredients (new)
- `frontend/components/CookingInstructions.js` - Display recipe (new)

---

## Timeline & Dependencies

```
Part 1: PostgreSQL Backend ✅
    ↓
Part 2: Gemini AI Integration
    ↓
Part 3: React Native UI
```

**Each part is independent** - but Part 2 requires Part 1 database setup, and Part 3 requires Part 2 API endpoint.

---

## API Security Notes

⚠️ **Important:** Your Gemini API key should be:
- ✅ Stored in `.env` file (never in code)
- ✅ Only used on backend (never sent to frontend)
- ✅ Restricted to specific API (Vision API only)
- ✅ Rate limited to prevent abuse
- ✅ Rotated periodically

---

## Quick Reference

### Part 1 Complete Checklist:
- [x] PostgreSQL configured
- [x] Database models created (12 tables)
- [x] Pydantic schemas written
- [x] CRUD endpoints implemented
- [x] CORS enabled
- [x] Error handling added
- [x] Documentation written

### Part 2 TODO:
- [ ] Install google-generativeai package
- [ ] Create `/scanner/analyze-food` endpoint
- [ ] Implement image-to-text with Gemini Vision
- [ ] Parse nutrition & ingredients from response
- [ ] Add retry logic & error handling
- [ ] Test with sample images
- [ ] Document API response format

### Part 3 TODO:
- [ ] Rewrite ImageRecognitionScreen
- [ ] Add camera & gallery picker
- [ ] Implement loading states
- [ ] Create result display components
- [ ] Add error handling UI
- [ ] Connect to backend endpoints
- [ ] Test E2E flow

---

## Next Command

When ready for Part 2, run:
```bash
# Install Gemini AI package
pip install google-generativeai

# Update backend/routes/scanner.py with Gemini integration
```

Let me know when you're ready to proceed with Part 2! 🚀
