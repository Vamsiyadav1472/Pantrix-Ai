import traceback
from database import engine, SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    # Safely truncate meal plans since we are completely overhauling it
    db.execute(text('TRUNCATE TABLE meal_plans CASCADE;'))
    
    # Drop old meal_plans columns
    columns_to_drop = ['start_date', 'end_date', 'plan_date', 'meal_type', 'recipe_name', 'calories', 'meals', 'name', 'notes']
    for col in columns_to_drop:
        try:
            db.execute(text(f'ALTER TABLE meal_plans DROP COLUMN IF EXISTS {col};'))
        except Exception:
            pass
            
    # Add new meal_plans columns
    new_mp_cols = [
        'date DATE NOT NULL DEFAULT CURRENT_DATE',
        'breakfast JSON',
        'lunch JSON',
        'snack JSON',
        'dinner JSON',
        'total_calories FLOAT DEFAULT 0.0',
        'total_protein FLOAT DEFAULT 0.0',
        'total_carbs FLOAT DEFAULT 0.0',
        'total_fats FLOAT DEFAULT 0.0',
        'status VARCHAR(50) DEFAULT \'active\''
    ]
    for col in new_mp_cols:
        try:
            # PostgreSQL syntax to add column if not exists is not natively supported in older versions, 
            # so we just try and catch.
            db.execute(text(f'ALTER TABLE meal_plans ADD COLUMN {col};'))
        except Exception:
            pass

    # Add settings columns
    new_set_cols = [
        'health_goal VARCHAR(50)',
        'cuisine_preferences JSON',
        'disliked_foods JSON',
        'cooking_time_preference INTEGER'
    ]
    for col in new_set_cols:
        try:
            db.execute(text(f'ALTER TABLE settings ADD COLUMN {col};'))
        except Exception:
            pass
            
    db.commit()
    print('Database schema updated manually.')
except Exception as e:
    print('Error:', e)
    traceback.print_exc()
finally:
    db.close()
