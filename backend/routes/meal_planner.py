from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
from typing import List, Optional
from datetime import date
import os
import requests
import json

router = APIRouter(prefix="/meal-plans", tags=["Meal Planner"])

def call_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise Exception("GEMINI_API_KEY not found in environment")
        
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    
    # Try gemini-2.5-flash which is the new standard
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    try:
        response = model.generate_content(prompt)
        # Strip potential markdown block wraps around json
        raw_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        return raw_text
    except Exception as e:
        raise Exception(f"AI API Error: {str(e)}")

@router.get("/all/{user_id}", response_model=List[schemas.MealPlanResponse])
def get_all_meal_plans(user_id: int, db: Session = Depends(get_db)):
    import models
    return db.query(models.MealPlan).filter(models.MealPlan.user_id == user_id).all()

@router.get("/{user_id}", response_model=Optional[schemas.MealPlanResponse])
def get_meal_plan_by_date(user_id: int, target_date: date = Query(...), db: Session = Depends(get_db)):
    plan = crud.get_meal_plan_by_date(db, user_id=user_id, target_date=target_date)
    if not plan:
        return None
    # We also need to fetch and attach the meal items since the schema just expects them.
    # To conform to standard, we can return the meal plan. The frontend will fetch items or they are attached.
    return plan

@router.get("/items/{plan_id}", response_model=List[schemas.MealItemResponse])
def get_meal_items(plan_id: int, db: Session = Depends(get_db)):
    return crud.get_meal_items(db, plan_id=plan_id)

@router.post("/generate", response_model=schemas.MealPlanResponse)
def generate_meal_plan(req: schemas.GenerateMealPlanRequest, db: Session = Depends(get_db)):
    user = crud.get_user(db, req.user_id)
    settings = crud.get_settings(db, req.user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    prefs = ""
    if settings:
        prefs = f"""
        Diet: {settings.diet_preference}
        Allergies: {settings.allergies}
        Health Goal: {settings.health_goal}
        Cuisines: {settings.cuisine_preferences}
        Dislikes: {settings.disliked_foods}
        Daily Calorie Target: {settings.daily_calorie_goal}
        Cooking Time limit: {settings.cooking_time_preference} mins
        """

    prompt = f"""
    You are a professional AI nutritionist. Generate a healthy, delicious daily meal plan for a user with the following preferences:
    {prefs}
    
    Return a strictly formatted JSON object exactly like this:
    {{
        "breakfast": {{"meal_name": "...", "cooking_time": 15, "difficulty": "Easy", "ingredients": [{{"name":"Oats", "quantity": 50, "unit": "g"}}], "nutrition": {{"calories": 300, "protein": 10, "carbs": 40, "fat": 5, "fiber": 5}}}},
        "lunch": {{"meal_name": "...", "cooking_time": 30, "difficulty": "Medium", "ingredients": [], "nutrition": {{"calories": 600, "protein": 30, "carbs": 60, "fat": 20, "fiber": 10}}}},
        "snack": {{"meal_name": "...", "cooking_time": 5, "difficulty": "Easy", "ingredients": [], "nutrition": {{"calories": 200, "protein": 5, "carbs": 20, "fat": 10, "fiber": 2}}}},
        "dinner": {{"meal_name": "...", "cooking_time": 40, "difficulty": "Medium", "ingredients": [], "nutrition": {{"calories": 500, "protein": 25, "carbs": 40, "fat": 15, "fiber": 8}}}},
        "total_calories": 1600,
        "total_protein": 70,
        "total_carbs": 160,
        "total_fats": 50
    }}
    """
    
    try:
        result_text = call_gemini(prompt)
        data = json.loads(result_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Check if a plan already exists for this date, if so, delete it
    existing = crud.get_meal_plan_by_date(db, req.user_id, date.fromisoformat(req.date))
    if existing:
        db.delete(existing)
        db.commit()

    # Create the new plan
    plan_create = schemas.MealPlanCreate(
        date=date.fromisoformat(req.date),
        breakfast=data.get("breakfast"),
        lunch=data.get("lunch"),
        snack=data.get("snack"),
        dinner=data.get("dinner"),
        total_calories=data.get("total_calories"),
        total_protein=data.get("total_protein"),
        total_carbs=data.get("total_carbs"),
        total_fats=data.get("total_fats"),
        status="active"
    )
    
    db_plan = crud.create_meal_plan(db, req.user_id, plan_create)
    
    # Create the Meal Items
    for m_type in ["breakfast", "lunch", "snack", "dinner"]:
        item_data = data.get(m_type)
        if item_data:
            item_create = schemas.MealItemCreate(
                meal_plan_id=db_plan.id,
                meal_type=m_type.capitalize(),
                meal_name=item_data.get("meal_name", ""),
                ingredients=item_data.get("ingredients", []),
                nutrition=item_data.get("nutrition", {}),
                cooking_time=item_data.get("cooking_time", 0),
                difficulty=item_data.get("difficulty", "Easy")
            )
            crud.create_meal_item(db, item_create)
            
    return db_plan

@router.post("/replace", response_model=schemas.MealItemResponse)
def replace_meal(req: schemas.ReplaceMealRequest, db: Session = Depends(get_db)):
    plan = crud.get_meal_plan(db, req.meal_plan_id)
    if not plan or plan.user_id != req.user_id:
        raise HTTPException(status_code=404, detail="Meal plan not found")
        
    settings = crud.get_settings(db, req.user_id)
    prefs = ""
    if settings:
        prefs = f"Diet: {settings.diet_preference}, Allergies: {settings.allergies}, Goal: {settings.health_goal}"
        
    prompt = f"""
    You are an AI nutritionist. A user wants a replacement for their {req.meal_type}.
    Their preferences: {prefs}.
    
    Return a strictly formatted JSON object for the replacement meal:
    {{
        "meal_name": "...", "cooking_time": 20, "difficulty": "Easy", "ingredients": [], "nutrition": {{"calories": 400, "protein": 20, "carbs": 30, "fat": 15, "fiber": 5}}
    }}
    """
    try:
        result_text = call_gemini(prompt)
        new_data = json.loads(result_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Find existing meal item and update
    items = crud.get_meal_items(db, plan.id)
    target_item = next((i for i in items if i.meal_type.lower() == req.meal_type.lower()), None)
    
    if target_item:
        item_update = schemas.MealItemUpdate(
            meal_name=new_data.get("meal_name"),
            ingredients=new_data.get("ingredients"),
            nutrition=new_data.get("nutrition"),
            cooking_time=new_data.get("cooking_time"),
            difficulty=new_data.get("difficulty")
        )
        updated_item = crud.update_meal_item(db, target_item.id, item_update)
    else:
        item_create = schemas.MealItemCreate(
            meal_plan_id=plan.id,
            meal_type=req.meal_type.capitalize(),
            meal_name=new_data.get("meal_name"),
            ingredients=new_data.get("ingredients"),
            nutrition=new_data.get("nutrition"),
            cooking_time=new_data.get("cooking_time"),
            difficulty=new_data.get("difficulty")
        )
        updated_item = crud.create_meal_item(db, item_create)
        
    # Update plan JSON reference
    plan_update = schemas.MealPlanUpdate()
    setattr(plan_update, req.meal_type.lower(), new_data)
    crud.update_meal_plan(db, plan.id, plan_update)
        
    return updated_item

@router.put("/meal-items/{item_id}/complete")
def complete_meal_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.get_meal_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    crud.update_meal_item(db, item_id, schemas.MealItemUpdate(completed=not item.completed))
    return {"message": "Toggled complete status", "completed": not item.completed}

@router.put("/meal-items/{item_id}", response_model=schemas.MealItemResponse)
def update_meal_item_route(item_id: int, item_data: schemas.MealItemUpdate, db: Session = Depends(get_db)):
    updated = crud.update_meal_item(db, item_id, item_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated

@router.delete("/meal-items/{item_id}")
def delete_meal_item_route(item_id: int, db: Session = Depends(get_db)):
    if not crud.delete_meal_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted"}
