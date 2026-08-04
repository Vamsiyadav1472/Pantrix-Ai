from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
import crud
import schemas
from typing import List, Optional

router = APIRouter(prefix="/pantry-items", tags=["Pantry"])

@router.get("/{user_id}", response_model=List[schemas.PantryItemResponse])
def get_pantry_items(user_id: int, category: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_pantry_items(db, user_id=user_id, category=category)

@router.post("/{user_id}", response_model=schemas.PantryItemResponse)
def add_pantry_item(user_id: int, item: schemas.PantryItemCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_pantry_item(db, user_id=user_id, item=item)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"DB integrity error: {str(e.orig)}. User ID {user_id} may not exist."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add item: {str(e)}")

@router.put("/{item_id}", response_model=schemas.PantryItemResponse)
def update_pantry_item(item_id: int, data: schemas.PantryItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.update_pantry_item(db, item_id=item_id, data=data)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.delete("/{item_id}")
def delete_pantry_item(item_id: int, db: Session = Depends(get_db)):
    success = crud.delete_pantry_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

@router.get("/{user_id}/expiring", response_model=List[schemas.PantryItemResponse])
def get_expiring_items(user_id: int, days: int = 7, db: Session = Depends(get_db)):
    return crud.get_expiring_items(db, user_id=user_id, days=days)

@router.get("/{user_id}/stats")
def get_pantry_stats(user_id: int, db: Session = Depends(get_db)):
    return crud.get_pantry_stats(db, user_id=user_id)
