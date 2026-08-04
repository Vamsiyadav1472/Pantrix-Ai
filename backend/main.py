"""
PantrixAI – FastAPI application entry point
"""

import os
from datetime import date, datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from database import engine, Base, SessionLocal, check_db_connection, get_db
from routes import (
    users, pantry, scanner, recipes, 
    grocery, meal_planner, notifications, 
    settings, ai_results, scan_history,
    auth, dashboard, profile, ai
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# ── Create all tables on startup ──────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Seed default user (ID=1) if not present ───────────────────────────────────
def seed_default_user():
    """Ensure a default user with id=1 exists for development/testing."""
    import models
    from passlib.context import CryptContext
    _pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.id == 1).first()
        if not existing:
            default_user = models.User(
                id=1,
                username="alex",
                email="alex@pantrixai.com",
                full_name="Alex (Default User)",
                password_hash=_pwd.hash("Password123"),
            )
            db.add(default_user)
            db.commit()
            print("[Startup] Default user (id=1) created.")
        else:
            print(f"[Startup] Default user OK: {existing.username}")
    except Exception as e:
        print(f"[Startup] Could not seed default user: {e}")
    finally:
        db.close()

seed_default_user()

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Pantrix AI API",
    description="AI-Driven Smart Pantry API",
    version="1.0.0",
)

# ── Mount Static Files for Uploads ────────────────────────────────────────────
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"DEBUG: Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

from sqlalchemy.exc import SQLAlchemyError

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    print(f"DEBUG: SQLAlchemy Error: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Database operation failed. Invalid data or constraint violation.", "error": str(exc)},
    )

@app.exception_handler(ValueError)
async def value_error_exception_handler(request, exc):
    print(f"DEBUG: Value Error: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid data provided.", "error": str(exc)},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    print(f"DEBUG: Unhandled Exception: {str(exc)}")
    return JSONResponse(
        status_code=400, # Converting unhandled generic exceptions to 400 Bad Request to strictly avoid 500 on bad data
        content={"detail": "An unexpected error occurred processing the request.", "error": str(exc)},
    )


# ── CORS (allow React Native / Expo dev client) ───────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy.orm import Session
from fastapi import Depends
import models
import schemas
from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

from routes import ai

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,          prefix="/api")
app.include_router(dashboard.router,     prefix="/api")
app.include_router(pantry.router,        prefix="/api")
app.include_router(scanner.router) # Prefix is now inside the scanner.py file (/api/scanner)
app.include_router(recipes.router,       prefix="/api")
app.include_router(grocery.router,       prefix="/api")
app.include_router(meal_planner.router,  prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(profile.router,       prefix="/api")
app.include_router(settings.router,      prefix="/api/settings", tags=["Settings"])
app.include_router(users.router,         prefix="/api/users",    tags=["Users"])
app.include_router(ai_results.router,    prefix="/api/ai-results", tags=["AI Results"])
app.include_router(scan_history.router,  prefix="/api/scan-history", tags=["Scan History"])
app.include_router(ai.router,            prefix="/api/ai",       tags=["AI"])

# ── Profile Stats Endpoint ────────────────────────────────────────────────────
@app.get("/api/profile-stats/{user_id}", tags=["Profile Stats"])
def get_profile_stats(user_id: int, db: Session = Depends(get_db)):
    pantry_model = getattr(models, "PantryItem", None)

    total_items = 0
    fresh_items = 0
    freshness = 0

    if pantry_model:
        pantry_items = db.query(pantry_model).filter(pantry_model.user_id == user_id).all()
        total_items = len(pantry_items)

        today = date.today()

        for item in pantry_items:
            expiry_date = (
                getattr(item, "expiry_date", None)
                or getattr(item, "expiration_date", None)
                or getattr(item, "expiryDate", None)
            )

            if expiry_date:
                if hasattr(expiry_date, 'date'):
                    expiry_date = expiry_date.date()
                
                # Check if we can safely compare
                import datetime
                if isinstance(expiry_date, datetime.date):
                    if expiry_date >= today:
                        fresh_items += 1

        if total_items > 0:
            freshness = round((fresh_items / total_items) * 100)

    cooked = 0
    badges = 0

    if freshness >= 80:
        badges += 1

    if total_items >= 10:
        badges += 1

    if cooked >= 5:
        badges += 1

    return {
        "cooked": cooked,
        "badges": badges,
        "freshness": freshness
    }

# ── AI Recipe Generator Endpoint ──────────────────────────────────────────────
class AIRecipeRequest(BaseModel):
    user_id: int
    prompt: str


@app.post("/api/ai-recipe-generate", tags=["AI Recipe"])
def generate_ai_recipe(request: AIRecipeRequest, db: Session = Depends(get_db)):
    user_prompt = request.prompt.strip()

    if not user_prompt:
        return JSONResponse(
            status_code=400,
            content={"detail": "Recipe prompt is required"}
        )

    system_prompt = f"""
You are an expert culinary AI and clinical nutritionist.

User request: {user_prompt}

CRITICAL RULES:
1. Exact Match Only: You MUST generate a recipe EXACTLY for the food requested by the user. If the user asks for "Chicken Biryani", you MUST generate "Chicken Biryani". DO NOT hallucinate, substitute, or generate a generic recipe.
2. Realistic Nutrition: You MUST provide highly accurate and realistic nutritional data (USDA level). DO NOT use placeholder values or zeros for nutrition. Include realistic values for all fields based on standard serving sizes.
3. No Markdown: You MUST output ONLY a strictly formatted JSON object. Do not include markdown code block wrappers (like ```json).

The JSON MUST strictly follow this exact format:
{{
  "recipe_name": "Exact matching name",
  "description": "Brief engaging description",
  "servings": 4,
  "cooking_time": "30 mins",
  "difficulty": "Medium",
  "nutrition": {{
    "calories": 350,
    "protein": 25.5,
    "carbs": 30.0,
    "fat": 15.0,
    "fiber": 4.5,
    "sugar": 5.0,
    "sodium": 400.0,
    "cholesterol": 60.0,
    "vitamins": "Vitamin C, Vitamin A",
    "minerals": "Iron, Calcium",
    "serving_size": "1 plate"
  }},
  "ingredients": [
    {{"name": "Ingredient 1", "amount": "100g"}}
  ],
  "steps": [
    "Step 1...",
    "Step 2..."
  ],
  "tips": ["Tip 1..."]
}}
"""

    try:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        if api_key:
            import google.generativeai as genai

            genai.configure(api_key=api_key)

            model_names = [
                "gemini-2.5-flash",
                "gemini-2.5-pro",
                "gemini-2.0-flash",
                "gemini-2.0-flash-lite",
                "gemini-1.5-flash",
                "gemini-1.5-pro",
            ]

            ai_response = None
            last_error = None

            for model_name in model_names:
                try:
                    print(f"Trying Gemini model: {model_name}")
                    model = genai.GenerativeModel(model_name)
                    ai_response = model.generate_content(system_prompt)
                    print(f"Gemini model worked: {model_name}")
                    break
                except Exception as model_error:
                    last_error = model_error
                    print(f"Gemini model failed: {model_name} - {model_error}")

            if ai_response is None:
                print("Trying automatic Gemini model detection...")

                available_models = genai.list_models()

                for available_model in available_models:
                    try:
                        supported_methods = getattr(
                            available_model,
                            "supported_generation_methods",
                            []
                        )

                        model_name = getattr(available_model, "name", "")

                        if "generateContent" in supported_methods:
                            print(f"Trying available Gemini model: {model_name}")
                            model = genai.GenerativeModel(model_name)
                            ai_response = model.generate_content(system_prompt)
                            print(f"Available Gemini model worked: {model_name}")
                            break

                    except Exception as auto_model_error:
                        last_error = auto_model_error
                        print(
                            f"Available Gemini model failed: "
                            f"{getattr(available_model, 'name', '')} - {auto_model_error}"
                        )

            if ai_response is None:
                if last_error is not None:
                    raise last_error
                raise Exception("Failed to generate content: no valid model found.")

            import json
            import re
            
            raw_text = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
            
            try:
                recipe_object = json.loads(raw_text)
            except json.JSONDecodeError:
                # Try to find JSON object in the text
                json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
                match = re.search(json_pattern, raw_text)
                if match:
                    try:
                        recipe_object = json.loads(match.group(0))
                    except:
                        raise ValueError("Could not parse JSON from AI response")
                else:
                    raise ValueError("Could not parse JSON from AI response")
            
            generated_recipe = recipe_object
        else:
            generated_recipe = {
                "name": user_prompt,
                "description": "Please add Gemini API key in backend .env file to generate AI recipe materials automatically.",
                "image": "N/A",
                "ingredients": [],
                "instructions": [
                    "Step 1: Add GEMINI_API_KEY in .env file.",
                    "Step 2: Restart FastAPI backend.",
                    "Step 3: Try again from the app."
                ],
                "nutrition": {
                    "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "fiber": 0
                },
                "cooking_time": "N/A",
                "servings": 1,
                "difficulty": "Unknown",
                "tips": []
            }

        saved_recipe_id = None

        recipe_model = getattr(models, "Recipe", None)

        if recipe_model:
            try:
                columns = recipe_model.__table__.columns.keys()

                recipe_data = {}

                if "user_id" in columns:
                    recipe_data["user_id"] = request.user_id

                if "title" in columns:
                    recipe_data["title"] = user_prompt
                elif "name" in columns:
                    recipe_data["name"] = user_prompt
                elif "recipe_name" in columns:
                    recipe_data["recipe_name"] = user_prompt

                import json
                db_recipe_str = json.dumps(generated_recipe) if isinstance(generated_recipe, dict) else str(generated_recipe)
                
                if "description" in columns:
                    recipe_data["description"] = db_recipe_str
                elif "content" in columns:
                    recipe_data["content"] = db_recipe_str
                elif "instructions" in columns:
                    recipe_data["instructions"] = db_recipe_str
                elif "making_process" in columns:
                    recipe_data["making_process"] = db_recipe_str

                if "ingredients" in columns:
                    recipe_data["ingredients"] = []

                if "created_at" in columns:
                    recipe_data["created_at"] = datetime.utcnow()

                new_recipe = recipe_model(**recipe_data)
                db.add(new_recipe)
                db.commit()
                db.refresh(new_recipe)

                saved_recipe_id = getattr(new_recipe, "id", None)

            except Exception as save_error:
                db.rollback()
                print(f"AI recipe generated but save failed: {save_error}")

        return {
            "success": True,
            "user_id": request.user_id,
            "prompt": user_prompt,
            "recipe": generated_recipe,
            "saved_recipe_id": saved_recipe_id
        }

    except Exception as e:
        print(f"AI Recipe Generation Error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "AI recipe generation failed",
                "error": str(e)
            }
        )

# ── Root & health endpoints ───────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    db_url = os.getenv("DATABASE_URL", "")
    db_type = "PostgreSQL" if "postgresql" in db_url else "SQLite"
    return {
        "message": "Pantrix AI API is running 🥦",
        "version":  "1.0.0",
        "database": db_type,
        "docs":     "/docs",
    }

@app.get("/health", tags=["Root"])
def health_check():
    db_ok = check_db_connection()
    return {
        "status":   "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
    }