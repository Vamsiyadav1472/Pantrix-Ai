from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from google import genai
import os
import json
import crud
import schemas

router = APIRouter(prefix="", tags=["AI"])

def get_ai_client():
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "AIzaSyDummyKeyForInitialization"
    return genai.Client(api_key=key)

from pydantic import BaseModel
from typing import List, Optional

class GenerateRecipeRequest(BaseModel):
    user_id: int
    ingredients: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_assistant(data: ChatRequest):
    try:
        client = get_ai_client()
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=f"You are a helpful Pantrix AI kitchen assistant. Keep it short. User says: {data.message}"
        )
        return {"answer": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-recipe")
def generate_recipe(data: GenerateRecipeRequest, db: Session = Depends(get_db)):
    try:
        # Get user's pantry items if ingredients not provided
        items_str = ""
        if data.ingredients and len(data.ingredients) > 0:
            items_str = ", ".join(data.ingredients)
        else:
            pantry = crud.get_pantry_items(db, user_id=data.user_id)
            if not pantry:
                raise HTTPException(status_code=400, detail="No ingredients provided and pantry is empty")
            items_str = ", ".join([f"{i.name}" for i in pantry])
            
        cache_key = items_str[:200]

        # 1. Check cache (if exact same ingredients used before)
        from models import Recipe
        existing_recipe = db.query(Recipe).filter(
            Recipe.user_id == data.user_id,
            Recipe.ai_generated == 1,
            Recipe.tags == cache_key
        ).first()

        if existing_recipe:
            return {"status": "cached", "message": "Loaded from cache", "recipe": existing_recipe}

        # 2. Try Gemini
        # Improved prompt for exact matching and realistic nutrition
        prompt = f'''Create an exact, realistic recipe using mainly: {items_str}.
CRITICAL: DO NOT hallucinate. Include highly accurate, realistic nutritional values based on standard USDA serving sizes (do not use 0 or placeholders).
Return ONLY a strictly formatted JSON object: {{"name":"Exact Name","description":"Brief engaging desc","prep_time":10,"cook_time":15,"servings":2,"calories":350,"protein":25,"carbs":30,"fat":15,"difficulty":"Easy","ingredients":"1. Item\\n2. Item","steps":"1. Step\\n2. Step","tags":"Healthy"}}'''

        try:
            client = get_ai_client()
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )
            text = response.text.strip().replace("```json", "").replace("```", "").strip()
            recipe_data = json.loads(text)
            status_msg = "success"
            
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "resource_exhausted" in error_str:
                # 3. Fallback on 429 Quota Exceeded
                recipe_data = {
                    "name": "Smart Fallback Veggie Bowl",
                    "description": "A quick and healthy bowl using available ingredients (AI limit reached).",
                    "prep_time": 10,
                    "cook_time": 15,
                    "servings": 2,
                    "calories": 350,
                    "difficulty": "Easy",
                    "ingredients": items_str,
                    "steps": "1. Prepare all ingredients.\n2. Mix them in a bowl.\n3. Serve fresh.",
                    "tags": cache_key
                }
                status_msg = "fallback"
            else:
                raise HTTPException(status_code=500, detail=str(e))

        # 4. Save to PostgreSQL
        recipe_create = schemas.RecipeCreate(
            name=recipe_data.get("name", "Generated Recipe"),
            description=recipe_data.get("description", ""),
            prep_time=recipe_data.get("prep_time", 0),
            cook_time=recipe_data.get("cook_time", 0),
            servings=recipe_data.get("servings", 1),
            calories=recipe_data.get("calories", 0),
            difficulty=recipe_data.get("difficulty", "Medium"),
            ingredients=recipe_data.get("ingredients", ""),
            steps=recipe_data.get("steps", ""),
            tags=cache_key
        )

        db_recipe = crud.create_recipe(db, user_id=data.user_id, recipe=recipe_create)
        db_recipe.ai_generated = 1
        db.commit()

        # Log to ai_results table
        crud.save_ai_result(db, user_id=data.user_id, result={
            "result_type": "recipe",
            "prompt": prompt if status_msg == "success" else "fallback_used",
            "result_data": recipe_data,
            "model_used": "gemini-3.5-flash",
            "tokens_used": 0,
            "processing_ms": 0
        })

        if status_msg == "fallback":
            return {"status": "fallback", "message": "AI limit reached, showing smart fallback recipe", "recipe": db_recipe}
            
        return {"status": "success", "recipe": db_recipe}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Recipe Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))