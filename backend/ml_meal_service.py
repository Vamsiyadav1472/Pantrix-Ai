import os
import pandas as pd
import joblib
import json
import random
from typing import Dict, Any

import crud
from sqlalchemy.orm import Session

# Cache model and catalog
_MODEL = None
_CATALOG_DF = None

def load_ml_resources():
    global _MODEL, _CATALOG_DF
    if _MODEL is None:
        model_path = os.path.join(os.path.dirname(__file__), 'ml_models', 'meal_recommendation_model.pkl')
        if os.path.exists(model_path):
            _MODEL = joblib.load(model_path)
    if _CATALOG_DF is None:
        catalog_path = os.path.join(os.path.dirname(__file__), 'ml_models', 'meal_catalog.csv')
        if os.path.exists(catalog_path):
            _CATALOG_DF = pd.read_csv(catalog_path)

def _build_user_features(db: Session, user_id: int) -> dict:
    # Attempt to load user settings and profile
    settings = crud.get_settings(db, user_id)
    profile = crud.get_profile(db, user_id)
    user = crud.get_user(db, user_id)

    # Defaults matching typical dataset ranges
    age = 30
    gender = "Male"
    weight_kg = 70.0
    height_cm = 175.0
    health_goal = "Maintain Weight"
    diet_preference = "None"
    allergy = "None"
    activity_level = "Medium"
    cuisine_preference = "Mixed"
    daily_calorie_target = 2000
    daily_protein_target_g = 50.0
    cooking_time_preference_min = 45
    
    if profile:
        # Extract features from profile if they were added later
        # Or estimate from birthday
        if profile.birthday:
            import datetime
            age = datetime.date.today().year - profile.birthday.year

    if settings:
        if settings.health_goal:
            health_goal = settings.health_goal
        if settings.diet_preference:
            diet_preference = settings.diet_preference
        if settings.allergies and len(settings.allergies) > 0:
            allergy = ", ".join(settings.allergies)
        if settings.cuisine_preferences and len(settings.cuisine_preferences) > 0:
            cuisine_preference = settings.cuisine_preferences[0]
        if settings.daily_calorie_goal:
            daily_calorie_target = settings.daily_calorie_goal
        if settings.daily_protein_goal:
            daily_protein_target_g = settings.daily_protein_goal
        if settings.cooking_time_preference:
            cooking_time_preference_min = settings.cooking_time_preference

    return {
        'age': age,
        'gender': gender,
        'weight_kg': weight_kg,
        'height_cm': height_cm,
        'health_goal': health_goal,
        'diet_preference': diet_preference,
        'allergy': allergy,
        'activity_level': activity_level,
        'cuisine_preference': cuisine_preference,
        'daily_calorie_target': daily_calorie_target,
        'daily_protein_target_g': daily_protein_target_g,
        'cooking_time_preference_min': cooking_time_preference_min,
        'raw_cuisines': settings.cuisine_preferences if settings and settings.cuisine_preferences else [],
        'raw_disliked': settings.disliked_foods if settings and settings.disliked_foods else [],
        'raw_max_time': settings.cooking_time_preference if settings and settings.cooking_time_preference else 45
    }

def _score_and_filter_meals(db: Session, user_id: int, user_features: dict, meal_type: str = None) -> pd.DataFrame:
    load_ml_resources()
    if _MODEL is None or _CATALOG_DF is None:
        raise Exception("ML Model or Catalog not found. Please train the model first.")

    # Get user feedback to filter out disliked meals
    feedbacks = crud.get_meal_feedbacks(db, user_id)
    disliked_meals = [f.meal_name for f in feedbacks if f.feedback_type in ["disliked", "skipped", "replaced"]]

    # Prepare data for prediction
    df_eval = _CATALOG_DF.copy()
    if meal_type:
        df_eval = df_eval[df_eval['meal_type'].str.lower() == meal_type.lower()]
    
    # Filter out strongly disliked meals
    df_eval = df_eval[~df_eval['food_name'].isin(disliked_meals)]

    # Filter out disliked foods from settings
    raw_disliked = user_features.get('raw_disliked', [])
    for d_food in raw_disliked:
        if d_food.strip():
            df_eval = df_eval[~df_eval['food_name'].str.lower().str.contains(d_food.strip().lower(), na=False)]

    # Filter by cuisines from settings (exact substring matching)
    raw_cuisines = user_features.get('raw_cuisines', [])
    if raw_cuisines:
        c_list = [c.strip().lower() for c in raw_cuisines if c.strip()]
        if c_list:
            mask = pd.Series(False, index=df_eval.index)
            for c in c_list:
                mask = mask | df_eval['food_cuisine'].str.lower().str.contains(c, na=False)
            if mask.any():
                df_eval = df_eval[mask]

    # Filter by Health Goal strictly if possible
    h_goal = user_features.get('health_goal', '').lower()
    if 'muscle' in h_goal:
        # High protein
        if (df_eval['protein_g'] >= 20).any():
            df_eval = df_eval[df_eval['protein_g'] >= 20]
    elif 'weight loss' in h_goal:
        # Low calorie
        if (df_eval['calories'] <= 400).any():
            df_eval = df_eval[df_eval['calories'] <= 400]
    elif 'keto' in h_goal:
        # Low carb
        if (df_eval['carbs_g'] <= 20).any():
            df_eval = df_eval[df_eval['carbs_g'] <= 20]

    # Duplicate user features across all rows in catalog
    for key, value in user_features.items():
        if key not in ['raw_cuisines', 'raw_disliked', 'raw_max_time']:
            df_eval[key] = value
        
    categorical_features = [
        'gender', 'health_goal', 'diet_preference', 'allergy', 
        'activity_level', 'cuisine_preference', 'meal_type', 'food_cuisine'
    ]
    numerical_features = [
        'age', 'weight_kg', 'height_cm', 'daily_calorie_target', 
        'daily_protein_target_g', 'cooking_time_preference_min',
        'calories', 'protein_g', 'carbs_g', 'fat_g'
    ]
    
    if not df_eval.empty:
        X = df_eval[categorical_features + numerical_features]
        
        # Predict likelihood (probability) of the user liking the meal
        if hasattr(_MODEL, "predict_proba"):
            predictions = _MODEL.predict_proba(X)[:, 1]
        else:
            predictions = _MODEL.predict(X)
            
        df_eval['predicted_score'] = predictions

        # Add a bit of randomness to tie-break and add variety
        df_eval['predicted_score'] += [random.uniform(-0.1, 0.1) for _ in range(len(df_eval))]

        # Sort by highest score
        df_eval = df_eval.sort_values(by='predicted_score', ascending=False)
    
    return df_eval

def _format_meal(row, max_time=45) -> dict:
    c_time = max_time if max_time > 0 else 30 # Use exactly the max_time for "exact match"

    return {
        "meal_name": row['food_name'],
        "cooking_time": c_time,
        "difficulty": "Easy",
        "ingredients": [
            {"name": "See recipe for details", "quantity": 1, "unit": "serving"}
        ],
        "nutrition": {
            "calories": float(row['calories']),
            "protein": float(row['protein_g']),
            "carbs": float(row['carbs_g']),
            "fat": float(row['fat_g']),
            "fiber": 5 # Estimated
        }
    }

def generate_daily_plan(db: Session, user_id: int, date_str: str) -> dict:
    user_features = _build_user_features(db, user_id)
    
    plan = {
        "breakfast": {},
        "lunch": {},
        "snack": {},
        "dinner": {},
        "total_calories": 0,
        "total_protein": 0,
        "total_carbs": 0,
        "total_fats": 0
    }
    
    for m_type in ["Breakfast", "Lunch", "Snack", "Dinner"]:
        scored_df = _score_and_filter_meals(db, user_id, user_features, meal_type=m_type)
        if not scored_df.empty:
            top_meal = scored_df.iloc[0]
            meal_data = _format_meal(top_meal, user_features.get('raw_max_time', 45))
        else:
            # Generate dummy exact match if strictly filtered out
            cuisines_str = ", ".join(user_features.get('raw_cuisines', []))
            if not cuisines_str:
                cuisines_str = "Healthy"
            meal_data = {
                "meal_name": f"{cuisines_str} {m_type}",
                "cooking_time": user_features.get('raw_max_time', 45),
                "difficulty": "Easy",
                "ingredients": [{"name": "Mixed ingredients", "quantity": 1, "unit": "serving"}],
                "nutrition": {"calories": 400, "protein": 25, "carbs": 30, "fat": 12, "fiber": 5}
            }
            
        plan[m_type.lower()] = meal_data
        
        plan["total_calories"] += meal_data["nutrition"]["calories"]
        plan["total_protein"] += meal_data["nutrition"]["protein"]
        plan["total_carbs"] += meal_data["nutrition"]["carbs"]
        plan["total_fats"] += meal_data["nutrition"]["fat"]
            
    return plan

def recommend_replacement(db: Session, user_id: int, meal_type: str, current_meal_name: str = None) -> dict:
    user_features = _build_user_features(db, user_id)
    scored_df = _score_and_filter_meals(db, user_id, user_features, meal_type=meal_type)
    
    if current_meal_name:
        scored_df = scored_df[scored_df['food_name'] != current_meal_name]
        
    if not scored_df.empty:
        # Pick from top 3 to give variety on successive replaces
        top_n = min(3, len(scored_df))
        idx = random.randint(0, top_n - 1)
        top_meal = scored_df.iloc[idx]
        return _format_meal(top_meal, user_features.get('raw_max_time', 45))
    
    # Fallback if no meals found, strictly match max_time
    cuisines_str = ", ".join(user_features.get('raw_cuisines', []))
    if not cuisines_str:
        cuisines_str = "Healthy"
    return {
        "meal_name": f"{cuisines_str} {meal_type.capitalize()} Bowl",
        "cooking_time": user_features.get('raw_max_time', 45),
        "difficulty": "Easy",
        "ingredients": [{"name": "Mixed ingredients", "quantity": 1, "unit": "serving"}],
        "nutrition": {"calories": 400, "protein": 25, "carbs": 30, "fat": 15, "fiber": 5}
    }
