"""
PantrixAI CRUD helpers.
All database logic lives here; routes import these functions.
"""

from sqlalchemy.orm import Session
from sqlalchemy import asc
from datetime import datetime, date, timedelta
from typing import Optional, List
from passlib.context import CryptContext

import models
import schemas

# ── Password hashing ──────────────────────────────────────────────────────────
_pwd_ctx = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(plain: str) -> str:
    return _pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_ctx.verify(plain, hashed)


# ══════════════════════════════ USERS ════════════════════════════════════════

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        password_hash=hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, data: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(db_user, k, v)
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return db_user


# ══════════════════════════════ PANTRY ITEMS ═════════════════════════════════

def get_pantry_items(
    db: Session, user_id: int, category: Optional[str] = None
) -> List[models.PantryItem]:
    q = db.query(models.PantryItem).filter(models.PantryItem.user_id == user_id)
    if category:
        q = q.filter(models.PantryItem.category == category)
    return q.order_by(asc(models.PantryItem.expiry_date)).all()

def get_pantry_item(db: Session, item_id: int) -> Optional[models.PantryItem]:
    return db.query(models.PantryItem).filter(models.PantryItem.id == item_id).first()

def _upsert_expiry_alert(db: Session, pantry_item: models.PantryItem) -> None:
    """Create or update an ExpiryAlert row for a given pantry item."""
    if not pantry_item.expiry_date:
        # No expiry date → remove any existing alert
        db.query(models.ExpiryAlert).filter(
            models.ExpiryAlert.pantry_item_id == pantry_item.id
        ).delete()
        return

    today = date.today()
    exp_date = pantry_item.expiry_date.date() if isinstance(pantry_item.expiry_date, datetime) else pantry_item.expiry_date
    days_remaining = (exp_date - today).days

    if days_remaining < 0:
        alert_type = "expired"
    elif days_remaining <= 7:
        alert_type = "expiring_soon"
    else:
        alert_type = "fresh"

    # Check if alert already exists (update) or needs to be created
    existing = db.query(models.ExpiryAlert).filter(
        models.ExpiryAlert.pantry_item_id == pantry_item.id
    ).first()

    if existing:
        existing.item_name      = pantry_item.name
        existing.expiry_date    = pantry_item.expiry_date
        existing.days_remaining = days_remaining
        existing.alert_type     = alert_type
        existing.is_dismissed   = False
    else:
        alert = models.ExpiryAlert(
            user_id        = pantry_item.user_id,
            pantry_item_id = pantry_item.id,
            item_name      = pantry_item.name,
            expiry_date    = pantry_item.expiry_date,
            days_remaining = days_remaining,
            alert_type     = alert_type,
        )
        db.add(alert)


def create_pantry_item(
    db: Session, user_id: int, item: schemas.PantryItemCreate
) -> models.PantryItem:
    db_item = models.PantryItem(**item.model_dump(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    # Auto-create expiry alert if expiry_date is set
    _upsert_expiry_alert(db, db_item)
    db.commit()
    return db_item

def update_pantry_item(
    db: Session, item_id: int, data: schemas.PantryItemUpdate
) -> Optional[models.PantryItem]:
    db_item = get_pantry_item(db, item_id)
    if not db_item:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(db_item, k, v)
    db_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    # Sync expiry alert
    _upsert_expiry_alert(db, db_item)
    db.commit()
    return db_item

def delete_pantry_item(db: Session, item_id: int) -> bool:
    db_item = get_pantry_item(db, item_id)
    if not db_item:
        return False
    db.delete(db_item)  # CASCADE removes expiry_alert row automatically
    db.commit()
    return True

def get_expiring_items(db: Session, user_id: int, days: int = 7) -> List[models.PantryItem]:
    today = datetime.utcnow()
    cutoff = today + timedelta(days=days)
    return (
        db.query(models.PantryItem)
        .filter(
            models.PantryItem.user_id == user_id,
            models.PantryItem.expiry_date.isnot(None),
            models.PantryItem.expiry_date >= today,
            models.PantryItem.expiry_date <= cutoff,
        )
        .order_by(asc(models.PantryItem.expiry_date))
        .all()
    )

def get_pantry_stats(db: Session, user_id: int) -> dict:
    today = datetime.utcnow()
    cutoff_soon = today + timedelta(days=7)

    items = db.query(models.PantryItem).filter(models.PantryItem.user_id == user_id).all()
    total_items = len(items)

    expired = sum(
        1 for item in items
        if item.expiry_date and item.expiry_date < today
    )
    expiring_soon = sum(
        1 for item in items
        if item.expiry_date
        and today <= item.expiry_date <= cutoff_soon
    )

    total_calories = sum(item.calories or 0 for item in items)
    categories = list(set(item.category for item in items if item.category))

    return {
        "total_items": total_items,
        "expiring_soon": expiring_soon,
        "expired": expired,
        "total_calories": total_calories,
        "categories_count": len(categories),
        "categories": categories,
    }


# ══════════════════════════════ SCAN HISTORY ══════════════════════════════════

def create_scan(
    db: Session, user_id: int, scan: schemas.ScanHistoryCreate
) -> models.ScanHistory:
    db_scan = models.ScanHistory(**scan.model_dump(), user_id=user_id)
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

def get_scan_history(
    db: Session, user_id: int, limit: int = 50
) -> List[models.ScanHistory]:
    return (
        db.query(models.ScanHistory)
        .filter(models.ScanHistory.user_id == user_id)
        .order_by(models.ScanHistory.scanned_at.desc())
        .limit(limit)
        .all()
    )


# ══════════════════════════════ RECIPES ══════════════════════════════════════

def create_recipe(
    db: Session, user_id: int, recipe: schemas.RecipeCreate
) -> models.Recipe:
    db_recipe = models.Recipe(**recipe.model_dump(), user_id=user_id)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

def get_recipes(db: Session, user_id: int) -> List[models.Recipe]:
    return db.query(models.Recipe).filter(models.Recipe.user_id == user_id).all()

def get_recipe(db: Session, recipe_id: int) -> Optional[models.Recipe]:
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

def update_recipe(
    db: Session, recipe_id: int, data: schemas.RecipeUpdate
) -> Optional[models.Recipe]:
    db_recipe = get_recipe(db, recipe_id)
    if not db_recipe:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(db_recipe, k, v)
    db_recipe.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

def delete_recipe(db: Session, recipe_id: int) -> bool:
    db_recipe = get_recipe(db, recipe_id)
    if not db_recipe:
        return False
    db.delete(db_recipe)
    db.commit()
    return True


# ══════════════════════════════ MEAL PLANS ════════════════════════════════════

def get_meal_plan_by_date(db: Session, user_id: int, target_date: date) -> Optional[models.MealPlan]:
    return db.query(models.MealPlan).filter(models.MealPlan.user_id == user_id, models.MealPlan.date == target_date).first()

def create_meal_plan(
    db: Session, user_id: int, plan: schemas.MealPlanCreate
) -> models.MealPlan:
    data = plan.model_dump(exclude_unset=True)
    db_plan = models.MealPlan(**data, user_id=user_id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def update_meal_plan(db: Session, plan_id: int, plan: schemas.MealPlanUpdate) -> Optional[models.MealPlan]:
    db_plan = db.query(models.MealPlan).filter(models.MealPlan.id == plan_id).first()
    if not db_plan:
        return None
    for k, v in plan.model_dump(exclude_unset=True).items():
        setattr(db_plan, k, v)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_meal_items(db: Session, plan_id: int) -> List[models.MealItem]:
    return db.query(models.MealItem).filter(models.MealItem.meal_plan_id == plan_id).all()

def get_meal_item(db: Session, item_id: int) -> Optional[models.MealItem]:
    return db.query(models.MealItem).filter(models.MealItem.id == item_id).first()

def create_meal_item(db: Session, item: schemas.MealItemCreate) -> models.MealItem:
    db_item = models.MealItem(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_meal_item(db: Session, item_id: int, item: schemas.MealItemUpdate) -> Optional[models.MealItem]:
    db_item = db.query(models.MealItem).filter(models.MealItem.id == item_id).first()
    if not db_item:
        return None
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(db_item, k, v)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_meal_item(db: Session, item_id: int) -> bool:
    db_item = db.query(models.MealItem).filter(models.MealItem.id == item_id).first()
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True


# ══════════════════════════════ GROCERY LIST ══════════════════════════════════

def create_grocery_list(
    db: Session, user_id: int, data: schemas.GroceryListCreate
) -> models.GroceryList:
    db_list = models.GroceryList(**data.model_dump(), user_id=user_id)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list

def get_grocery_lists(db: Session, user_id: int) -> List[models.GroceryList]:
    return db.query(models.GroceryList).filter(models.GroceryList.user_id == user_id).all()

def add_grocery_item(
    db: Session, list_id: int, item: schemas.GroceryListItem
) -> Optional[models.GroceryList]:
    db_list = db.query(models.GroceryList).filter(models.GroceryList.id == list_id).first()
    if not db_list:
        return None
    existing = db_list.items or []
    existing.append(item.model_dump())
    db_list.items = existing
    db_list.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_list)
    return db_list


# ══════════════════════════════ EXPIRY ALERTS ════════════════════════════════

def get_expiry_alerts(db: Session, user_id: int) -> List[models.ExpiryAlert]:
    return db.query(models.ExpiryAlert).filter(models.ExpiryAlert.user_id == user_id).all()

def create_expiry_alert(db: Session, user_id: int, alert: dict) -> models.ExpiryAlert:
    db_alert = models.ExpiryAlert(**alert, user_id=user_id)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


# ══════════════════════════════ AI RESULTS ═══════════════════════════════════

def save_ai_result(db: Session, user_id: int, result: dict) -> models.AIResult:
    db_result = models.AIResult(**result, user_id=user_id)
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def get_ai_results(db: Session, user_id: int) -> List[models.AIResult]:
    return db.query(models.AIResult).filter(models.AIResult.user_id == user_id).all()


# ══════════════════════════════ FAVORITES ════════════════════════════════════

def add_favorite(db: Session, user_id: int, favorite: schemas.FavoriteCreate) -> models.Favorite:
    db_fav = models.Favorite(**favorite.model_dump(), user_id=user_id)
    db.add(db_fav)
    db.commit()
    db.refresh(db_fav)
    return db_fav

def get_favorites(db: Session, user_id: int) -> List[models.Favorite]:
    return db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()


# ══════════════════════════════ NOTIFICATIONS ════════════════════════════════

def get_notifications(db: Session, user_id: int) -> List[models.Notification]:
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).all()

def create_notification(db: Session, user_id: int, notif: schemas.NotificationCreate) -> models.Notification:
    db_notif = models.Notification(**notif.model_dump(), user_id=user_id)
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif


# ══════════════════════════════ SETTINGS ═════════════════════════════════════

def get_settings(db: Session, user_id: int) -> Optional[models.UserSettings]:
    return db.query(models.UserSettings).filter(models.UserSettings.user_id == user_id).first()

def update_settings(db: Session, user_id: int, settings: schemas.UserSettingsUpdate) -> models.UserSettings:
    db_settings = get_settings(db, user_id)
    if not db_settings:
        db_settings = models.UserSettings(user_id=user_id)
        db.add(db_settings)
    
    for k, v in settings.model_dump(exclude_unset=True).items():
        setattr(db_settings, k, v)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings


# ══════════════════════════════ PROFILE ═══════════════════════════════════════

def get_profile(db: Session, user_id: int) -> Optional[models.Profile]:
    return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()

def create_or_update_profile(db: Session, user_id: int, profile_data: schemas.ProfileCreate) -> models.Profile:
    db_profile = get_profile(db, user_id)
    if not db_profile:
        db_profile = models.Profile(user_id=user_id, **profile_data.model_dump())
        db.add(db_profile)
    else:
        for k, v in profile_data.model_dump(exclude_unset=True).items():
            setattr(db_profile, k, v)
    db.commit()
    db.refresh(db_profile)
    return db_profile


# ══════════════════════════ DIET PREFERENCES ══════════════════════════════════

def get_diet_preference(db: Session, user_id: int) -> Optional[models.DietPreference]:
    return db.query(models.DietPreference).filter(models.DietPreference.user_id == user_id).first()

def update_diet_preference(db: Session, user_id: int, preference: str) -> models.DietPreference:
    db_pref = get_diet_preference(db, user_id)
    if not db_pref:
        db_pref = models.DietPreference(user_id=user_id, preference=preference)
        db.add(db_pref)
    else:
        db_pref.preference = preference
    db.commit()
    db.refresh(db_pref)
    return db_pref


# ══════════════════════════ ALLERGY SETTINGS ══════════════════════════════════

def get_allergies(db: Session, user_id: int) -> List[models.AllergySetting]:
    return db.query(models.AllergySetting).filter(models.AllergySetting.user_id == user_id).all()

def add_allergy(db: Session, user_id: int, allergy_data: schemas.AllergySettingCreate) -> models.AllergySetting:
    db_allergy = models.AllergySetting(user_id=user_id, **allergy_data.model_dump())
    db.add(db_allergy)
    db.commit()
    db.refresh(db_allergy)
    return db_allergy

def delete_allergy(db: Session, user_id: int, allergy_id: int) -> bool:
    db_allergy = db.query(models.AllergySetting).filter(
        models.AllergySetting.id == allergy_id, 
        models.AllergySetting.user_id == user_id
    ).first()
    if not db_allergy:
        return False
    db.delete(db_allergy)
    db.commit()
    return True


# ══════════════════════════ FAMILY MEMBERS ════════════════════════════════════

def get_family_members(db: Session, user_id: int) -> List[models.FamilyMember]:
    return db.query(models.FamilyMember).filter(models.FamilyMember.user_id == user_id).all()

def add_family_member(db: Session, user_id: int, member_data: schemas.FamilyMemberCreate) -> models.FamilyMember:
    db_member = models.FamilyMember(user_id=user_id, **member_data.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def update_family_member(db: Session, member_id: int, member_data: schemas.FamilyMemberCreate) -> Optional[models.FamilyMember]:
    db_member = db.query(models.FamilyMember).filter(models.FamilyMember.id == member_id).first()
    if not db_member:
        return None
    for k, v in member_data.model_dump(exclude_unset=True).items():
        setattr(db_member, k, v)
    db.commit()
    db.refresh(db_member)
    return db_member

def delete_family_member(db: Session, member_id: int) -> bool:
    db_member = db.query(models.FamilyMember).filter(models.FamilyMember.id == member_id).first()
    if not db_member:
        return False
    db.delete(db_member)
    db.commit()
    return True
