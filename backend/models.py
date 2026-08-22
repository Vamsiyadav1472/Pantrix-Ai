"""
PantrixAI Database Models
All 12 tables: users, pantry_items, ingredients, scan_history, recipes,
               meal_plans, grocery_list, expiry_alerts, favorites,
               notifications, settings, ai_results
"""

from sqlalchemy import (
    Column, Integer, String, Date, Float, Text,
    DateTime, Boolean, ForeignKey, JSON
)
from database import Base
from datetime import datetime, date


# ─────────────────────────────── Users ───────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(50),  unique=True, index=True, nullable=False)
    email         = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name     = Column(String(100))
    avatar_url    = Column(String(500))
    google_id     = Column(String(100), unique=True, index=True, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ────────────────────────────── Pantry Items ─────────────────────────────────
class PantryItem(Base):
    __tablename__ = "pantry_items"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name        = Column(String(100), nullable=False)
    category    = Column(String(50))
    quantity    = Column(Float, default=1.0)
    unit        = Column(String(20))
    expiry_date = Column(DateTime)
    added_on    = Column(Date,     default=date.today)
    added_date  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    icon        = Column(String(10), default="🥫")
    calories    = Column(Float)
    protein     = Column(Float)
    carbs       = Column(Float)
    fat         = Column(Float)
    fiber       = Column(Float)
    sugar       = Column(Float)
    location    = Column(String(50))
    notes       = Column(Text)


# ────────────────────────────── Ingredients ──────────────────────────────────
class Ingredient(Base):
    __tablename__ = "ingredients"

    id             = Column(Integer, primary_key=True, index=True)
    pantry_item_id = Column(Integer, ForeignKey("pantry_items.id", ondelete="CASCADE"), nullable=False)
    name           = Column(String(100), nullable=False)
    quantity       = Column(Float, nullable=False)
    unit           = Column(String(20), default="gram")
    allergen       = Column(Boolean, default=False)
    allergen_type  = Column(String(50))


# ─────────────────────────────── Recipes ─────────────────────────────────────
class Recipe(Base):
    __tablename__ = "recipes"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name         = Column(String(150), nullable=False)
    description  = Column(Text)
    ingredients  = Column(Text)
    steps        = Column(Text)
    prep_time    = Column(Integer)
    cook_time    = Column(Integer)
    servings     = Column(Integer, default=1)
    calories     = Column(Float)
    difficulty   = Column(String(20))
    tags         = Column(String(200))
    ai_generated = Column(Integer, default=0)
    image_url    = Column(String(500))
    nutrition    = Column(JSON)
    is_favorite  = Column(Boolean, default=False)
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ─────────────────────────────── Meal Plans ──────────────────────────────────
class MealPlan(Base):
    __tablename__ = "meal_plans"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date           = Column(Date, nullable=False, index=True)
    breakfast      = Column(JSON)
    lunch          = Column(JSON)
    snack          = Column(JSON)
    dinner         = Column(JSON)
    total_calories = Column(Float, default=0.0)
    total_protein  = Column(Float, default=0.0)
    total_carbs    = Column(Float, default=0.0)
    total_fats     = Column(Float, default=0.0)
    status         = Column(String(50), default="active")
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MealItem(Base):
    __tablename__ = "meal_items"

    id           = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    meal_type    = Column(String(50), nullable=False) # breakfast, lunch, snack, dinner
    recipe_id    = Column(Integer, nullable=True)
    meal_name    = Column(String(150), nullable=False)
    ingredients  = Column(JSON)
    nutrition    = Column(JSON)
    cooking_time = Column(Integer)
    difficulty   = Column(String(50))
    completed    = Column(Boolean, default=False)


# ────────────────────────────── Scan History ─────────────────────────────────
class ScanHistory(Base):
    __tablename__ = "scan_history"

    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_name            = Column(String(100), nullable=False)
    confidence           = Column(Float)
    category             = Column(String(50))
    calories             = Column(Float)
    protein              = Column(Float)
    carbs                = Column(Float)
    fat                  = Column(Float)
    fiber                = Column(Float)
    sugar                = Column(Float)
    health_score         = Column(Integer)
    image_url            = Column(String(500))
    nutrition_data       = Column(JSON)
    ingredients_detected = Column(JSON)
    making_process       = Column(Text)
    scanned_at           = Column(DateTime, default=datetime.utcnow)


# ────────────────────────────── Grocery List ─────────────────────────────────
class GroceryList(Base):
    __tablename__ = "grocery_list"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name        = Column(String(100), nullable=False)
    items       = Column(JSON)
    total_price = Column(Float)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ────────────────────────────── Expiry Alerts ────────────────────────────────
class ExpiryAlert(Base):
    __tablename__ = "expiry_alerts"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pantry_item_id  = Column(Integer, ForeignKey("pantry_items.id", ondelete="CASCADE"), nullable=False)
    item_name       = Column(String(100), nullable=False)
    expiry_date     = Column(Date, nullable=False)
    days_remaining  = Column(Integer)
    alert_type      = Column(String(20), default="expiring_soon")  # expiring_soon | expired
    is_dismissed    = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)


# ────────────────────────────── Favorites ────────────────────────────────────
class Favorite(Base):
    __tablename__ = "favorites"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id     = Column(Integer)
    name          = Column(String(150))
    image_url     = Column(String(500))
    favorite_type = Column(String(20))
    added_at      = Column(DateTime, default=datetime.utcnow)


# ────────────────────────────── Notifications ────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title             = Column(String(150), nullable=False)
    message           = Column(Text)
    notification_type = Column(String(50))
    is_read           = Column(Boolean, default=False)
    related_item_id   = Column(Integer)
    created_at        = Column(DateTime, default=datetime.utcnow)


# ─────────────────────────── User Settings ───────────────────────────────────
class UserSettings(Base):
    __tablename__ = "settings"

    id                     = Column(Integer, primary_key=True, index=True)
    user_id                = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme                  = Column(String(20),  default="light")
    notifications_enabled  = Column(Boolean,     default=True)
    language               = Column(String(10),  default="en")
    diet_preference        = Column(String(50))
    allergies              = Column(JSON)
    daily_calorie_goal     = Column(Integer)
    daily_protein_goal     = Column(Integer)
    daily_carbs_goal       = Column(Integer)
    daily_fat_goal         = Column(Integer)
    health_goal            = Column(String(50))
    cuisine_preferences    = Column(JSON)
    disliked_foods         = Column(JSON)
    cooking_time_preference= Column(Integer)
    updated_at             = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ─────────────────────────────── AI Results ──────────────────────────────────
class AIResult(Base):
    __tablename__ = "ai_results"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    result_type    = Column(String(50), nullable=False)   # recipe | nutrition | suggestion
    prompt         = Column(Text)
    result_data    = Column(JSON)
    model_used     = Column(String(50))
    tokens_used    = Column(Integer)
    processing_ms  = Column(Integer)
    created_at     = Column(DateTime, default=datetime.utcnow)


# ─────────────────────────────── Profile ──────────────────────────────────────
class Profile(Base):
    __tablename__ = "profiles"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio        = Column(Text)
    birthday   = Column(Date)
    phone      = Column(String(20))
    address    = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ────────────────────────── Diet Preferences ──────────────────────────────────
class DietPreference(Base):
    __tablename__ = "diet_preferences"
    
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preference = Column(String(100)) # Vegan, Keto, etc.
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ────────────────────────── Allergy Settings ──────────────────────────────────
class AllergySetting(Base):
    __tablename__ = "allergy_settings"
    
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    allergy    = Column(String(100))
    severity   = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


# ────────────────────────── Family Members ───────────────────────────────────
class FamilyMember(Base):
    __tablename__ = "family_members"
    
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name          = Column(String(100), nullable=False)
    relationship  = Column(String(50))
    age           = Column(Integer)
    diet_notes    = Column(Text)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ────────────────────────── Meal Feedback ────────────────────────────────────
class MealFeedback(Base):
    __tablename__ = "meal_feedback"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meal_name     = Column(String(150), nullable=False)
    meal_type     = Column(String(50)) # breakfast, lunch, snack, dinner
    feedback_type = Column(String(50)) # liked, disliked, skipped, replaced, custom
    rating        = Column(Integer, nullable=True) # 1-5, optional
    created_at    = Column(DateTime, default=datetime.utcnow)
