from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

router = APIRouter()

@router.get("/{user_id}", response_model=schemas.UserSettingsResponse)
def get_settings(user_id: int, db: Session = Depends(get_db)):
    db_settings = crud.get_settings(db, user_id=user_id)
    if not db_settings:
        # Return default settings if none exist
        return {
            "id": 0,
            "user_id": user_id,
            "theme": "light",
            "notifications_enabled": True,
            "language": "en",
            "updated_at": "2024-01-01T00:00:00"
        }
    return db_settings

@router.put("/{user_id}", response_model=schemas.UserSettingsResponse)
def update_settings(user_id: int, settings: schemas.UserSettingsUpdate, db: Session = Depends(get_db)):
    return crud.update_settings(db, user_id=user_id, settings=settings)
