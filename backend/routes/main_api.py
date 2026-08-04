from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from models import User, PantryItem, Recipe, MealPlan, ScanHistory, GroceryList, Favorite, Notification, UserSettings
from schemas import (
    UserCreate, UserResponse, UserUpdate,
    PantryItemCreate, PantryItemResponse, PantryItemUpdate,
    RecipeCreate, RecipeResponse, RecipeUpdate,
    MealPlanCreate, MealPlanResponse, MealPlanUpdate,
    ScanHistoryCreate, ScanHistoryResponse,
    GroceryListCreate, GroceryListResponse, GroceryListUpdate,
    FavoriteCreate, FavoriteResponse,
    NotificationCreate, NotificationResponse, NotificationUpdate,
    UserSettingsCreate, UserSettingsResponse, UserSettingsUpdate
)

router = APIRouter()

# ==================== User Routes ====================

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Hash password in production - for demo using plain text
    new_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        password_hash=user.password  # TODO: Use bcrypt or similar in production
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# ==================== Pantry Item Routes ====================

@router.post("/pantry", response_model=PantryItemResponse, status_code=status.HTTP_201_CREATED)
def add_pantry_item(user_id: int, item: PantryItemCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_item = PantryItem(**item.model_dump(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/pantry/{user_id}", response_model=list[PantryItemResponse])
def get_pantry_items(
    user_id: int,
    category: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PantryItem).filter(PantryItem.user_id == user_id)
    
    if category:
        query = query.filter(PantryItem.category == category)
    
    return query.all()

@router.get("/pantry/item/{item_id}", response_model=PantryItemResponse)
def get_pantry_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PantryItem).filter(PantryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    return item

@router.put("/pantry/{item_id}", response_model=PantryItemResponse)
def update_pantry_item(item_id: int, item_update: PantryItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(PantryItem).filter(PantryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/pantry/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pantry_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(PantryItem).filter(PantryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    
    db.delete(db_item)
    db.commit()

@router.get("/pantry/expiring/{user_id}")
def get_expiring_items(user_id: int, days: int = Query(7), db: Session = Depends(get_db)):
    today = datetime.now().date()
    future_date = today + timedelta(days=days)
    
    items = db.query(PantryItem).filter(
        PantryItem.user_id == user_id,
        PantryItem.expiry_date.isnot(None),
        PantryItem.expiry_date >= today,
        PantryItem.expiry_date <= future_date
    ).all()
    
    return {"items": items, "count": len(items)}

@router.get("/pantry/stats/{user_id}")
def get_pantry_stats(user_id: int, db: Session = Depends(get_db)):
    items = db.query(PantryItem).filter(PantryItem.user_id == user_id).all()
    
    total_calories = sum(item.calories or 0 for item in items)
    total_items = len(items)
    categories = list(set(item.category for item in items if item.category))
    
    return {
        "total_items": total_items,
        "total_calories": total_calories,
        "categories": categories,
        "avg_items_per_category": total_items / len(categories) if categories else 0
    }

# ==================== Recipe Routes ====================

@router.post("/recipes", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(user_id: int, recipe: RecipeCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_recipe = Recipe(**recipe.model_dump(), user_id=user_id)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.get("/recipes/{user_id}", response_model=list[RecipeResponse])
def get_recipes(user_id: int, db: Session = Depends(get_db)):
    return db.query(Recipe).filter(Recipe.user_id == user_id).all()

@router.get("/recipes/item/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.put("/recipes/{recipe_id}", response_model=RecipeResponse)
def update_recipe(recipe_id: int, recipe_update: RecipeUpdate, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    update_data = recipe_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_recipe, key, value)
    
    db_recipe.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.delete("/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db.delete(db_recipe)
    db.commit()

# ==================== Meal Plan Routes ====================

@router.post("/meal-plans", response_model=MealPlanResponse, status_code=status.HTTP_201_CREATED)
def create_meal_plan(user_id: int, plan: MealPlanCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_plan = MealPlan(**plan.model_dump(), user_id=user_id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/meal-plans/{user_id}", response_model=list[MealPlanResponse])
def get_meal_plans(user_id: int, db: Session = Depends(get_db)):
    return db.query(MealPlan).filter(MealPlan.user_id == user_id).all()

@router.put("/meal-plans/{plan_id}", response_model=MealPlanResponse)
def update_meal_plan(plan_id: int, plan_update: MealPlanUpdate, db: Session = Depends(get_db)):
    db_plan = db.query(MealPlan).filter(MealPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    update_data = plan_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_plan, key, value)
    
    db_plan.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/meal-plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal_plan(plan_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(MealPlan).filter(MealPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    db.delete(db_plan)
    db.commit()

# ==================== Grocery List Routes ====================

@router.post("/grocery-list", response_model=GroceryListResponse, status_code=status.HTTP_201_CREATED)
def create_grocery_list(user_id: int, list_data: GroceryListCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_list = GroceryList(**list_data.model_dump(), user_id=user_id)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list

@router.get("/grocery-list/{user_id}", response_model=list[GroceryListResponse])
def get_grocery_lists(user_id: int, db: Session = Depends(get_db)):
    return db.query(GroceryList).filter(GroceryList.user_id == user_id).all()

@router.put("/grocery-list/{list_id}", response_model=GroceryListResponse)
def update_grocery_list(list_id: int, list_update: GroceryListUpdate, db: Session = Depends(get_db)):
    db_list = db.query(GroceryList).filter(GroceryList.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    
    update_data = list_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_list, key, value)
    
    db_list.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_list)
    return db_list

@router.delete("/grocery-list/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grocery_list(list_id: int, db: Session = Depends(get_db)):
    db_list = db.query(GroceryList).filter(GroceryList.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    
    db.delete(db_list)
    db.commit()

# ==================== Settings Routes ====================

@router.post("/settings/{user_id}", response_model=UserSettingsResponse, status_code=status.HTTP_201_CREATED)
def create_user_settings(user_id: int, settings: UserSettingsCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_settings = UserSettings(**settings.model_dump(), user_id=user_id)
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

@router.get("/settings/{user_id}", response_model=UserSettingsResponse)
def get_user_settings(user_id: int, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="User settings not found")
    return settings

@router.put("/settings/{user_id}", response_model=UserSettingsResponse)
def update_user_settings(user_id: int, settings_update: UserSettingsUpdate, db: Session = Depends(get_db)):
    db_settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not db_settings:
        raise HTTPException(status_code=404, detail="User settings not found")
    
    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)
    
    db_settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_settings)
    return db_settings
