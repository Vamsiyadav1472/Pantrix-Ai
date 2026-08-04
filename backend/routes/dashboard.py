from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import models

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard-stats/{user_id}")
def get_dashboard_stats(user_id: int, db: Session = Depends(get_db)):
    stats = crud.get_pantry_stats(db, user_id)
    # Add any other stats needed for the dashboard
    return stats
