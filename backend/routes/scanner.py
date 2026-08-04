from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import models
from google import genai
from google.genai import types
import os, json, base64
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/scanner", tags=["Scanner"])

# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def safe_float(value, default=0.0):
    try:
        if isinstance(value, str):
            # Remove any non-numeric characters except decimal point
            import re
            clean_val = re.sub(r'[^\d.]', '', value)
            return float(clean_val) if clean_val else default
        return float(value) if value is not None else default
    except:
        return default


def normalize_ingredients(value: Any) -> List[Dict[str, Any]]:
    if isinstance(value, list):
        normalized = []
        for item in value:
            if isinstance(item, dict):
                normalized.append({
                    "name": str(item.get("name", "")).strip(),
                    "amount": str(item.get("amount", "")).strip() if item.get("amount") is not None else ""
                })
            else:
                normalized.append({"name": str(item).strip(), "amount": ""})
        return [item for item in normalized if item["name"]]

    if isinstance(value, str):
        parts = [part.strip() for part in value.replace(";", "\n").splitlines() if part.strip()]
        return [{"name": part, "amount": ""} for part in parts]

    return []


def parse_ai_json(text: str) -> Dict[str, Any]:
    text = text.replace("```json", "").replace("```", "").strip()
    if not text:
        raise ValueError("Empty AI response text")
    try:
        result = json.loads(text)
        if isinstance(result, dict):
            return result
        if isinstance(result, list) and len(result) > 0 and isinstance(result[0], dict):
            return result[0]
        raise ValueError("AI response JSON is not an object")
    except json.JSONDecodeError:
        import re
        # Try to find JSON object in the text
        json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
        match = re.search(json_pattern, text)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                pass
        # If still fails, try to extract key-value pairs manually
        # But for now, raise
        raise ValueError(f"Could not parse JSON from: {text[:100]}...")


# Initialize Gemini Client lazily or inside function to ensure .env is loaded
def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"[Scanner] GEMINI_API_KEY loaded: {bool(api_key)}")
    if not api_key:
        print("[Scanner] Error: GEMINI_API_KEY is not set in .env")
        return None
    return genai.Client(api_key=api_key)

@router.post("/analyze-food")
async def analyze_food(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        print(f"\n[Scanner] === NEW REQUEST FROM USER {user_id} ===")
        print(f"[Scanner] File: {file.filename}, Type: {file.content_type}")

        client = get_gemini_client()
        if not client:
            print("[Scanner] Gemini client not created - API key missing")
            raise HTTPException(status_code=500, detail="Gemini API key is missing or invalid.")
        else:
            image_bytes = await file.read()
            print(f"[Scanner] Image bytes length: {len(image_bytes) if image_bytes else 0}")
            if not image_bytes:
                print("[Scanner] Error: Empty image bytes")
                raise HTTPException(status_code=400, detail="Empty image received.")
            else:
                # Try Gemini models in order: 1.5 Flash first, then 2.0 Flash Exp
                models_to_try = [
                    ("gemini-2.5-flash", "Gemini 2.5 Flash"),
                    ("gemini-2.5-pro", "Gemini 2.5 Pro"),
                    ("gemini-2.0-flash", "Gemini 2.0 Flash")
                ]
                
                data = None
                for model_name, model_display in models_to_try:
                    try:
                        print(f"[Scanner] Trying {model_display}...")
                        response = client.models.generate_content(
                            model=model_name,
                            contents=[
                                types.Part.from_bytes(
                                    data=image_bytes,
                                    mime_type=file.content_type or "image/jpeg"
                                ),
                                (
                                    "You are an expert food analyst and clinical nutritionist. Analyze this food image carefully and identify the EXACT specific dish or food item shown. "
                                    "CRITICAL: Do NOT use placeholder values (like 0) for nutrition. You MUST estimate realistic, highly accurate USDA-level nutritional values for the detected food and its estimated serving size. "
                                    "Provide accurate, detailed analysis. Return ONLY a strictly formatted JSON object exactly matching this format with no markdown formatting: "
                                    "{\n"
                                    "  \"food_name\": \"Chicken Caesar Salad\",\n"
                                    "  \"description\": \"Fresh romaine lettuce...\",\n"
                                    "  \"estimated_weight\": \"250g\",\n"
                                    "  \"confidence\": 0.95,\n"
                                    "  \"category\": \"Healthy Main Course\",\n"
                                    "  \"nutrition\": {\n"
                                    "    \"calories\": 320,\n"
                                    "    \"protein\": 28,\n"
                                    "    \"carbs\": 15,\n"
                                    "    \"fat\": 18,\n"
                                    "    \"fiber\": 4,\n"
                                    "    \"sugar\": 6,\n"
                                    "    \"sodium\": 450\n"
                                    "  },\n"
                                    "  \"ingredients\": [{\"name\": \"Romaine Lettuce\", \"amount\": \"150g\"}],\n"
                                    "  \"cooking_suggestions\": [\"Toss leaves with dressing\"],\n"
                                    "  \"cooking_time\": \"10 mins\",\n"
                                    "  \"difficulty\": \"Easy\",\n"
                                    "  \"health_score\": 8,\n"
                                    "  \"dietary_info\": [\"Low Carb\"],\n"
                                    "  \"allergens\": [\"Dairy\", \"Fish\"],\n"
                                    "  \"tips\": [\"Use fresh lemon\"]\n"
                                    "}"
                                )
                            ]
                        )

                        raw_text = getattr(response, "text", None)
                        if not raw_text:
                            print(f"[Scanner] {model_display} returned no text")
                            continue

                        print(f"[Scanner] {model_display} raw response: {raw_text[:300]}...")
                        data = parse_ai_json(raw_text)
                        if not isinstance(data, dict) or not data.get("food_name"):
                            print(f"[Scanner] {model_display} output missing food_name")
                            continue
                        
                        data.setdefault("status", "success")
                        print(f"[Scanner] {model_display} successfully parsed: {data.get('food_name')}")
                        break  # Success, exit the loop
                        
                    except Exception as ai_err:
                        err_str = str(ai_err)
                        print(f"[Scanner] {model_display} Error: {err_str}")
                        if any(keyword in err_str.lower() for keyword in ["429", "quota", "resource_exhausted", "rate_limit"]):
                            print(f"[Scanner] {model_display} quota exceeded, trying next model...")
                            continue
                        elif "timeout" in err_str.lower() or "deadline" in err_str.lower():
                            print(f"[Scanner] {model_display} timeout, trying next model...")
                            continue
                        else:
                            print(f"[Scanner] {model_display} failed with error, trying next model...")
                            continue
                
                # If all models failed, raise an error instead of returning mock data
                if not data:
                    print("[Scanner] All Gemini models failed")
                    raise HTTPException(status_code=503, detail="Gemini AI could not process the image at this time due to high demand. Please try again.")

        if not isinstance(data, dict):
            raise HTTPException(status_code=500, detail="Unexpected response format from Gemini AI.")

        making_proc = data.get("cooking_suggestions", data.get("making_process", []))
        if isinstance(making_proc, str):
            making_proc_list = [line.strip() for line in making_proc.splitlines() if line.strip()]
        elif isinstance(making_proc, list):
            making_proc_list = [str(item).strip() for item in making_proc if str(item).strip()]
        else:
            making_proc_list = [str(making_proc)] if making_proc is not None else []

        making_proc_str = "\n".join(making_proc_list)
        ingredient_list = normalize_ingredients(data.get("ingredients", []))

        nutrition = data.get("nutrition", {})
        try:
            scan_create = schemas.ScanHistoryCreate(
                food_name=data.get("food_name", "Unknown Food"),
                confidence=safe_float(data.get("confidence"), 0.5),
                category=data.get("category", "Uncategorized"),
                calories=safe_float(nutrition.get("calories", data.get("calories"))),
                protein=safe_float(nutrition.get("protein", data.get("protein"))),
                carbs=safe_float(nutrition.get("carbs", data.get("carbs"))),
                fat=safe_float(nutrition.get("fat", nutrition.get("fats", data.get("fat")))),
                fiber=safe_float(nutrition.get("fiber", data.get("fiber"))),
                sugar=safe_float(nutrition.get("sugar", data.get("sugar"))),
                health_score=int(safe_float(data.get("health_score", 0))),
                ingredients_detected=ingredient_list,
                making_process=making_proc_str,
                nutrition_data=data
            )

            saved_scan = crud.create_scan(db, user_id=user_id, scan=scan_create)
            print(f"[Scanner] Saved to DB with ID: {saved_scan.id}")

            crud.save_ai_result(db, user_id=user_id, result={
                "result_type": "scanner",
                "prompt": "food_analysis",
                "result_data": data,
                "model_used": "gemini-2.0-flash",
                "tokens_used": 0,
                "processing_ms": 0
            })

            result = data.copy()
            result["id"] = saved_scan.id
            result["user_id"] = saved_scan.user_id
            result["scanned_at"] = saved_scan.scanned_at.isoformat()
            return result

        except Exception as db_err:
            print(f"[Scanner] DB Error: {str(db_err)}")
            data["id"] = 0
            data["db_error"] = str(db_err)
            return data

    except Exception as e:
        print(f"[Scanner] UNHANDLED CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/save-history/{user_id}", response_model=schemas.ScanHistoryResponse)
def save_history(user_id: int, scan: schemas.ScanHistoryCreate, db: Session = Depends(get_db)):
    return crud.create_scan(db, user_id=user_id, scan=scan)

@router.get("/history/{user_id}", response_model=List[schemas.ScanHistoryResponse])
def get_history(user_id: int, db: Session = Depends(get_db)):
    return crud.get_scan_history(db, user_id=user_id)

def get_mock_response(message: str = "Mock data"):
    return {
        "status": "mock",
        "message": message,
        "food_name": "Grilled Chicken Salad",
        "description": "Fresh mixed greens with grilled chicken breast, cherry tomatoes, cucumber, and light vinaigrette dressing.",
        "confidence": 0.85,
        "category": "Healthy Main Course",
        "estimated_weight": "300g",
        "nutrition": {
            "calories": 320,
            "protein": 28,
            "carbs": 15,
            "fat": 18,
            "fiber": 4,
            "sugar": 6,
            "sodium": 450
        },
        "ingredients": [
            {"name": "Chicken Breast", "amount": "150g"},
            {"name": "Mixed Greens", "amount": "100g"},
            {"name": "Cherry Tomatoes", "amount": "50g"},
            {"name": "Cucumber", "amount": "50g"},
            {"name": "Olive Oil", "amount": "1 tbsp"},
            {"name": "Lemon Juice", "amount": "1 tbsp"}
        ],
        "cooking_suggestions": [
            "Season chicken breast with salt and pepper",
            "Grill chicken for 6-8 minutes per side until cooked through",
            "Slice grilled chicken into strips",
            "Wash and chop vegetables",
            "Mix olive oil and lemon juice for dressing",
            "Toss greens, vegetables, and chicken with dressing",
            "Serve immediately"
        ],
        "cooking_time": "15 mins",
        "difficulty": "Easy",
        "health_score": 9,
        "dietary_info": ["High Protein", "Low Carb", "Gluten-Free"],
        "allergens": ["None"],
        "tips": ["Use fresh, organic vegetables for best flavor", "Grill chicken to internal temperature of 165°F"]
    }