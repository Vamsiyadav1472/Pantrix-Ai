from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import List, Optional, Dict, Any

# ==================== User Schemas ====================
class UserBase(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8) # Updated to 8 chars

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyOTPData(BaseModel):
    email: EmailStr
    otp: str

class GoogleLogin(BaseModel):
    idToken: str
    email: EmailStr
    name: Optional[str] = None
    photoUrl: Optional[str] = None
    googleId: str

class PasswordReset(BaseModel):
    email: EmailStr

class VerifyCode(BaseModel):
    email: EmailStr
    code: str

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== Pantry Item Schemas ====================
class IngredientSchema(BaseModel):
    name: str
    quantity: float
    unit: str = "gram"
    allergen: bool = False
    allergen_type: Optional[str] = None

class PantryItemBase(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str = "piece"
    expiry_date: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class PantryItemNutrition(BaseModel):
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    sugar: Optional[float] = None

class PantryItemCreate(PantryItemBase, PantryItemNutrition):
    pass

class PantryItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expiry_date: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class PantryItemResponse(PantryItemBase, PantryItemNutrition):
    id: int
    user_id: int
    added_date: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ==================== Recipe Schemas ====================
class RecipeBase(BaseModel):
    name: str
    description: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: int = 1
    calories: Optional[float] = None
    difficulty: Optional[str] = "Medium"
    tags: Optional[str] = None

class RecipeCreate(RecipeBase):
    ingredients: Optional[str] = None
    steps: Optional[str] = None
    image_url: Optional[str] = None

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    steps: Optional[str] = None
    image_url: Optional[str] = None
    is_favorite: Optional[bool] = None

class RecipeResponse(RecipeBase):
    id: int
    user_id: int
    ingredients: Optional[str]
    steps: Optional[str]
    image_url: Optional[str]
    is_favorite: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ==================== Meal Plan Schemas ====================
class MealItemBase(BaseModel):
    meal_type: str
    recipe_id: Optional[int] = None
    meal_name: str
    ingredients: Optional[List[Dict[str, Any]]] = None
    nutrition: Optional[Dict[str, Any]] = None
    cooking_time: Optional[int] = None
    difficulty: Optional[str] = None
    completed: bool = False

class MealItemCreate(MealItemBase):
    meal_plan_id: int

class MealItemUpdate(BaseModel):
    meal_type: Optional[str] = None
    recipe_id: Optional[int] = None
    meal_name: Optional[str] = None
    ingredients: Optional[List[Dict[str, Any]]] = None
    nutrition: Optional[Dict[str, Any]] = None
    cooking_time: Optional[int] = None
    difficulty: Optional[str] = None
    completed: Optional[bool] = None

class MealItemResponse(MealItemBase):
    id: int
    meal_plan_id: int
    
    class Config:
        from_attributes = True

class MealPlanBase(BaseModel):
    date: date
    breakfast: Optional[Dict[str, Any]] = None
    lunch: Optional[Dict[str, Any]] = None
    snack: Optional[Dict[str, Any]] = None
    dinner: Optional[Dict[str, Any]] = None
    total_calories: Optional[float] = 0.0
    total_protein: Optional[float] = 0.0
    total_carbs: Optional[float] = 0.0
    total_fats: Optional[float] = 0.0
    status: str = "active"

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanUpdate(BaseModel):
    date: Optional[date] = None
    breakfast: Optional[Dict[str, Any]] = None
    lunch: Optional[Dict[str, Any]] = None
    snack: Optional[Dict[str, Any]] = None
    dinner: Optional[Dict[str, Any]] = None
    total_calories: Optional[float] = None
    total_protein: Optional[float] = None
    total_carbs: Optional[float] = None
    total_fats: Optional[float] = None
    status: Optional[str] = None

class MealPlanResponse(MealPlanBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class GenerateMealPlanRequest(BaseModel):
    user_id: int
    date: str

class ReplaceMealRequest(BaseModel):
    user_id: int
    meal_plan_id: int
    meal_type: str

# ==================== Scan History Schemas ====================
class ScanHistoryBase(BaseModel):
    food_name: str
    confidence: Optional[float] = None
    category: Optional[str] = None

class ScanHistoryCreate(ScanHistoryBase):
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    health_score: Optional[int] = None
    image_url: Optional[str] = None
    ingredients_detected: Optional[List[Dict[str, Any]]] = None
    making_process: Optional[str] = None
    nutrition_data: Optional[Dict[str, Any]] = None

class ScanHistoryResponse(ScanHistoryCreate):
    id: int
    user_id: int
    scanned_at: datetime
    
    class Config:
        from_attributes = True

# ==================== Grocery List Schemas ====================
class GroceryListItem(BaseModel):
    name: str
    quantity: float
    unit: str = "piece"
    bought: bool = False
    price: Optional[float] = None

class GroceryListBase(BaseModel):
    name: str
    items: List[GroceryListItem] = []

class GroceryListCreate(GroceryListBase):
    total_price: Optional[float] = None

class GroceryListUpdate(BaseModel):
    name: Optional[str] = None
    items: Optional[List[GroceryListItem]] = None
    total_price: Optional[float] = None

class GroceryListResponse(GroceryListBase):
    id: int
    user_id: int
    total_price: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ==================== Favorite Schemas ====================
class FavoriteCreate(BaseModel):
    recipe_id: Optional[int] = None
    name: str
    image_url: Optional[str] = None
    favorite_type: str

class FavoriteResponse(FavoriteCreate):
    id: int
    user_id: int
    added_at: datetime
    
    class Config:
        from_attributes = True

# ==================== Notification Schemas ====================
class NotificationBase(BaseModel):
    title: str
    message: Optional[str] = None
    notification_type: str

class NotificationCreate(NotificationBase):
    related_item_id: Optional[int] = None

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    related_item_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== User Settings Schemas ====================
class UserSettingsCreate(BaseModel):
    theme: str = "light"
    notifications_enabled: bool = True
    language: str = "en"
    diet_preference: Optional[str] = None
    allergies: Optional[List[str]] = None
    daily_calorie_goal: Optional[int] = None
    daily_protein_goal: Optional[int] = None
    daily_carbs_goal: Optional[int] = None
    daily_fat_goal: Optional[int] = None
    health_goal: Optional[str] = None
    cuisine_preferences: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None
    cooking_time_preference: Optional[int] = None

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    language: Optional[str] = None
    diet_preference: Optional[str] = None
    allergies: Optional[List[str]] = None
    daily_calorie_goal: Optional[int] = None
    daily_protein_goal: Optional[int] = None
    daily_carbs_goal: Optional[int] = None
    daily_fat_goal: Optional[int] = None
    health_goal: Optional[str] = None
    cuisine_preferences: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None
    cooking_time_preference: Optional[int] = None

class UserSettingsResponse(UserSettingsCreate):
    id: int
    user_id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Profile Schemas ====================
class ProfileBase(BaseModel):
    bio: Optional[str] = None
    birthday: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Diet Preference Schemas ====================
class DietPreferenceBase(BaseModel):
    preference: str

class DietPreferenceCreate(DietPreferenceBase):
    pass

class DietPreferenceResponse(DietPreferenceBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Allergy Setting Schemas ====================
class AllergySettingBase(BaseModel):
    allergy: str
    severity: Optional[str] = "mild"

class AllergySettingCreate(AllergySettingBase):
    pass

class AllergySettingResponse(AllergySettingBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Family Member Schemas ====================
class FamilyMemberBase(BaseModel):
    name: str
    relationship: Optional[str] = None
    age: Optional[int] = None
    diet_notes: Optional[str] = None

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberResponse(FamilyMemberBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
