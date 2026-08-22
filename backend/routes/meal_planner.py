from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
from typing import List, Optional
from datetime import date
import os
import json

import ml_meal_service

router = APIRouter(prefix="/meal-plans", tags=["Meal Planner"])

@router.get("/all/{user_id}", response_model=List[schemas.MealPlanResponse])
def get_all_meal_plans(user_id: int, db: Session = Depends(get_db)):
    import models
    return db.query(models.MealPlan).filter(models.MealPlan.user_id == user_id).all()

@router.get("/{user_id}", response_model=Optional[schemas.MealPlanResponse])
def get_meal_plan_by_date(user_id: int, target_date: date = Query(...), db: Session = Depends(get_db)):
    plan = crud.get_meal_plan_by_date(db, user_id=user_id, target_date=target_date)
    if not plan:
        return None
    return plan

@router.get("/items/{plan_id}", response_model=List[schemas.MealItemResponse])
def get_meal_items(plan_id: int, db: Session = Depends(get_db)):
    return crud.get_meal_items(db, plan_id=plan_id)

@router.post("/generate", response_model=schemas.MealPlanResponse)
def generate_meal_plan(req: schemas.GenerateMealPlanRequest, db: Session = Depends(get_db)):
    user = crud.get_user(db, req.user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        data = ml_meal_service.generate_daily_plan(db, req.user_id, req.date)
    except Exception as e:
        print(f"[MealPlanner] ML Generation Failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate meal plan using local ML model.")
        
    existing = crud.get_meal_plan_by_date(db, req.user_id, date.fromisoformat(req.date))
    if existing:
        db.delete(existing)
        db.commit()

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
        
    items = crud.get_meal_items(db, plan.id)
    target_item = next((i for i in items if i.meal_type.lower() == req.meal_type.lower()), None)
    
    current_meal_name = target_item.meal_name if target_item else None

    # Track replacement as feedback
    if current_meal_name:
        feedback = schemas.MealFeedbackCreate(
            meal_name=current_meal_name,
            meal_type=req.meal_type,
            feedback_type="replaced"
        )
        crud.add_meal_feedback(db, req.user_id, feedback)

    try:
        new_data = ml_meal_service.recommend_replacement(db, req.user_id, req.meal_type.capitalize(), current_meal_name)
    except Exception as e:
        print(f"[MealPlanner] Replace meal failed: {e}")
        new_data = {
            "meal_name": f"Healthy {req.meal_type.capitalize()} Bowl",
            "cooking_time": 20,
            "difficulty": "Easy",
            "ingredients": [{"name": "Fresh Harvest Greens & Protein", "quantity": 200, "unit": "g"}],
            "nutrition": {"calories": 420, "protein": 24, "carbs": 40, "fat": 14, "fiber": 6}
        }
        
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
        
    plan_update = schemas.MealPlanUpdate()
    setattr(plan_update, req.meal_type.lower(), new_data)
    
    # Recalculate totals
    if getattr(plan, req.meal_type.lower()):
        old_nut = getattr(plan, req.meal_type.lower()).get("nutrition", {})
        plan_update.total_calories = max(0, plan.total_calories - old_nut.get("calories", 0) + new_data.get("nutrition", {}).get("calories", 0))
        plan_update.total_protein = max(0, plan.total_protein - old_nut.get("protein", 0) + new_data.get("nutrition", {}).get("protein", 0))
        plan_update.total_carbs = max(0, plan.total_carbs - old_nut.get("carbs", 0) + new_data.get("nutrition", {}).get("carbs", 0))
        plan_update.total_fats = max(0, plan.total_fats - old_nut.get("fat", 0) + new_data.get("nutrition", {}).get("fat", 0))

    crud.update_meal_plan(db, plan.id, plan_update)
        
    return updated_item

@router.post("/feedback", response_model=schemas.MealFeedbackResponse)
def submit_feedback(req: schemas.MealFeedbackCreate, user_id: int = Query(...), db: Session = Depends(get_db)):
    feedback = crud.add_meal_feedback(db, user_id, req)
    return feedback

@router.post("/custom-meal", response_model=schemas.MealPlanResponse)
def add_custom_meal(req: schemas.CustomMealCreate, db: Session = Depends(get_db)):
    # Add custom meal logic. Replace the current meal with the user's custom meal.
    target_date = date.fromisoformat(req.date)
    plan = crud.get_meal_plan_by_date(db, req.user_id, target_date)
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found for this date. Generate a plan first.")

    new_data = {
        "meal_name": req.meal_name,
        "cooking_time": req.cooking_time,
        "difficulty": req.difficulty,
        "ingredients": req.ingredients or [],
        "nutrition": req.nutrition or {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}
    }
    
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
        crud.update_meal_item(db, target_item.id, item_update)
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
        crud.create_meal_item(db, item_create)

    plan_update = schemas.MealPlanUpdate()
    setattr(plan_update, req.meal_type.lower(), new_data)
    
    # Store feedback that user added a custom meal
    feedback = schemas.MealFeedbackCreate(
        meal_name=req.meal_name,
        meal_type=req.meal_type,
        feedback_type="custom"
    )
    crud.add_meal_feedback(db, req.user_id, feedback)

    updated_plan = crud.update_meal_plan(db, plan.id, plan_update)
    return updated_plan


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
    item = crud.get_meal_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    plan = crud.get_meal_plan(db, item.meal_plan_id)
    if plan:
        plan_update = schemas.MealPlanUpdate()
        setattr(plan_update, item.meal_type.lower(), None)
        crud.update_meal_plan(db, plan.id, plan_update)
        
    crud.delete_meal_item(db, item_id)
    return {"message": "Deleted"}
