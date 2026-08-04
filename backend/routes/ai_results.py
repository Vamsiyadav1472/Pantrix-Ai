from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
from typing import List, Any

router = APIRouter()

@router.post("/{user_id}")
def save_ai_result(user_id: int, result: dict, db: Session = Depends(get_db)):
    return crud.save_ai_result(db, user_id=user_id, result=result)

@router.get("/{user_id}")
def get_ai_results(user_id: int, db: Session = Depends(get_db)):
    return crud.get_ai_results(db, user_id=user_id)
