from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import models
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

OTP_STORE = {}


router = APIRouter(prefix="/auth", tags=["Authentication"])
_pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    OTP_STORE[user.email] = {
        "otp": otp,
        "expires_at": expires_at,
        "user_data": user
    }
    
    # Send actual email
    from utils.email import send_verification_code
    send_verification_code(user.email, otp)
    
    return {"message": "OTP sent successfully", "email": user.email, "status": "pending_verification"}

@router.post("/verify-otp")
def verify_otp(data: schemas.VerifyOTPData, db: Session = Depends(get_db)):
    record = OTP_STORE.get(data.email)
    if not record:
        raise HTTPException(status_code=400, detail="No pending verification for this email")
    
    if datetime.utcnow() > record["expires_at"]:
        raise HTTPException(status_code=400, detail="Verification code expired.")
        
    if record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid verification code.")
        
    # Valid OTP, create user
    user_in = record["user_data"]
    new_user = crud.create_user(db=db, user=user_in)
    
    # Clean up OTP store
    del OTP_STORE[data.email]
    
    return {
        "message": "Account created successfully.",
        "user_id": new_user.id
    }

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    
    if not db_user:
        if user.email in OTP_STORE:
            raise HTTPException(status_code=403, detail="Please verify your email before logging in.")
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not _pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "access_token": f"mock_jwt_token_{db_user.id}",
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "avatar_url": db_user.avatar_url
    }

@router.post("/google")
def google_login(data: schemas.GoogleLogin, db: Session = Depends(get_db)):
    # Simple mock google login for now, in production you'd verify idToken
    db_user = crud.get_user_by_email(db, email=data.email)
    if not db_user:
        # Auto-register if doesn't exist
        user_in = schemas.UserCreate(
            username=data.email.split('@')[0],
            email=data.email,
            full_name=data.name,
            password="GoogleUser" + data.googleId[:8]
        )
        db_user = crud.create_user(db=db, user=user_in)
        db_user.google_id = data.googleId
        db_user.avatar_url = data.photoUrl
        db.commit()
        db.refresh(db_user)
    
    return {
        "access_token": f"mock_google_token_{db_user.id}",
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "avatar_url": db_user.avatar_url
    }
