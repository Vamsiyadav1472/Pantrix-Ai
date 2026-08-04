from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import models
from typing import List

router = APIRouter(prefix="/recipes", tags=["Recipes"])

@router.post("/generate")
async def generate_recipe(user_id: int, ingredients: List[str], db: Session = Depends(get_db)):
    # This should call the AI service logic
    from routes.ai import generate_recipe_logic
    return await generate_recipe_logic(user_id, ingredients, db)

@router.post("/save/{user_id}", response_model=schemas.RecipeResponse)
def save_recipe(user_id: int, recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    return crud.create_recipe(db, user_id=user_id, recipe=recipe)

@router.get("/{user_id}", response_model=List[schemas.RecipeResponse])
def get_recipes(user_id: int, db: Session = Depends(get_db)):
    return crud.get_recipes(db, user_id=user_id)

@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    success = crud.delete_recipe(db, recipe_id=recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"message": "Recipe deleted successfully"}

# ══════════════════════════════ FAVORITES ══════════════════════════════════

@router.get("/favorites/{user_id}", response_model=List[schemas.FavoriteResponse])
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    return crud.get_favorites(db, user_id=user_id)

@router.post("/favorites/{user_id}", response_model=schemas.FavoriteResponse)
def add_favorite(user_id: int, favorite: schemas.FavoriteCreate, db: Session = Depends(get_db)):
    return crud.add_favorite(db, user_id=user_id, favorite=favorite)

@router.delete("/favorites/{favorite_id}")
def remove_favorite(favorite_id: int, db: Session = Depends(get_db)):
    db_fav = db.query(models.Favorite).filter(models.Favorite.id == favorite_id).first()
    if not db_fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(db_fav)
    db.commit()
    return {"message": "Favorite removed successfully"}
