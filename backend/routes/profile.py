from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
from typing import List

router = APIRouter(tags=["Profile & Settings"])

# --- Profile ---
@router.get("/profile/{user_id}", response_model=schemas.ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    db_profile = crud.get_profile(db, user_id=user_id)
    if not db_profile:
        # Create empty profile if not exists
        return crud.create_or_update_profile(db, user_id=user_id, profile_data=schemas.ProfileCreate())
    return db_profile

@router.put("/profile/{user_id}", response_model=schemas.ProfileResponse)
def update_profile(user_id: int, profile_data: schemas.ProfileCreate, db: Session = Depends(get_db)):
    return crud.create_or_update_profile(db, user_id=user_id, profile_data=profile_data)

# --- Diet Preferences ---
@router.get("/diet-preferences/{user_id}")
def get_diet_preference(user_id: int, db: Session = Depends(get_db)):
    return crud.get_diet_preference(db, user_id=user_id)

@router.put("/diet-preferences/{user_id}")
def update_diet_preference(user_id: int, preference: str = Query(...), db: Session = Depends(get_db)):
    return crud.update_diet_preference(db, user_id=user_id, preference=preference)

# --- Allergies ---
@router.get("/allergies/{user_id}", response_model=List[schemas.AllergySettingResponse])
def get_allergies(user_id: int, db: Session = Depends(get_db)):
    return crud.get_allergies(db, user_id=user_id)

@router.post("/allergies/{user_id}", response_model=schemas.AllergySettingResponse)
def add_allergy(user_id: int, allergy_data: schemas.AllergySettingCreate, db: Session = Depends(get_db)):
    return crud.add_allergy(db, user_id=user_id, allergy_data=allergy_data)

@router.delete("/allergies/{allergy_id}")
def delete_allergy(allergy_id: int, user_id: int = None, db: Session = Depends(get_db)):
    # Note: user_id is optional for flexibility, though allergy_id should be unique per user
    if not crud.delete_allergy(db, user_id=user_id or 0, allergy_id=allergy_id):
        raise HTTPException(status_code=404, detail="Allergy not found")
    return {"message": "Allergy deleted"}

# --- Family Members ---
@router.get("/family-members/{user_id}", response_model=List[schemas.FamilyMemberResponse])
def get_family_members(user_id: int, db: Session = Depends(get_db)):
    return crud.get_family_members(db, user_id=user_id)

@router.post("/family-members/{user_id}", response_model=schemas.FamilyMemberResponse)
def add_family_member(user_id: int, member_data: schemas.FamilyMemberCreate, db: Session = Depends(get_db)):
    return crud.add_family_member(db, user_id=user_id, member_data=member_data)

@router.put("/family-members/{member_id}", response_model=schemas.FamilyMemberResponse)
def update_family_member(member_id: int, member_data: schemas.FamilyMemberCreate, db: Session = Depends(get_db)):
    db_member = crud.update_family_member(db, member_id=member_id, member_data=member_data)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    return db_member

@router.delete("/family-members/{member_id}")
def delete_family_member(member_id: int, db: Session = Depends(get_db)):
    if not crud.delete_family_member(db, member_id=member_id):
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted"}
