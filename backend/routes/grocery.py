from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import models
from typing import List

router = APIRouter(prefix="/grocery-items", tags=["Grocery"])

@router.post("/{user_id}", response_model=schemas.GroceryListResponse)
def create_grocery_list(user_id: int, data: schemas.GroceryListCreate, db: Session = Depends(get_db)):
    return crud.create_grocery_list(db, user_id=user_id, data=data)

@router.get("/{user_id}", response_model=List[schemas.GroceryListResponse])
def get_grocery_lists(user_id: int, db: Session = Depends(get_db)):
    return crud.get_grocery_lists(db, user_id=user_id)

@router.put("/{item_id}", response_model=schemas.GroceryListResponse)
def update_grocery_list(item_id: int, data: schemas.GroceryListUpdate, db: Session = Depends(get_db)):
    # Reusing update logic for grocery list/item
    db_list = db.query(models.GroceryList).filter(models.GroceryList.id == item_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(db_list, k, v)
    db.commit()
    db.refresh(db_list)
    return db_list

@router.delete("/{item_id}")
def delete_grocery_list(item_id: int, db: Session = Depends(get_db)):
    db_list = db.query(models.GroceryList).filter(models.GroceryList.id == item_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_list)
    db.commit()
    return {"message": "Item deleted"}
