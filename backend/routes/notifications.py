from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import models
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/{user_id}", response_model=List[schemas.NotificationResponse])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    return crud.get_notifications(db, user_id=user_id)

@router.put("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    db_notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not db_notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db_notif.is_read = True
    db.commit()
    db.refresh(db_notif)
    return db_notif
