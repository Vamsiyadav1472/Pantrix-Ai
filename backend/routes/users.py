from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import random
from utils.email import send_verification_code
import models
import os
import shutil
import uuid
router = APIRouter()

# Temporary store for codes (In production use Redis or DB)
verification_codes = {}

# Temporary store for registration data
registration_queue = {}

@router.post("/register-request")
def register_request(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Duplicate Check (Checks if the user is ALREADY in the permanent database)
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(
            status_code=400, 
            detail="This email is already fully registered. Please go to the Login page."
        )
    
    # 2. Generate Code
    code = str(random.randint(100000, 999999))
    registration_queue[user.email] = {
        "user_data": user.dict(),
        "code": code
    }
    
    # 3. Send Email
    sent = send_verification_code(user.email, code)
    if not sent:
        # We still continue for testing, but log the error
        print(f"ERROR: Could not send email to {user.email}. Check SMTP settings.")
    
    return {"message": "Verification code sent to email."}

@router.post("/register-verify")
def register_verify(data: schemas.VerifyCode, db: Session = Depends(get_db)):
    if data.email not in registration_queue:
        raise HTTPException(status_code=400, detail="Registration session expired.")
    
    reg_data = registration_queue[data.email]
    if reg_data["code"] != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code.")
    
    # Code matches! Create the user now.
    user_create = schemas.UserCreate(**reg_data["user_data"])
    new_user = crud.create_user(db, user_create)
    
    # Cleanup queue
    del registration_queue[data.email]
    
    return new_user

@router.post("/login")
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=login_data.email)
    
    # 1. No account check
    if not db_user:
        raise HTTPException(
            status_code=404, 
            detail="No account detected with this email. Please sign up first."
        )
    
    # 2. Password check
    if not crud.verify_password(login_data.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
    
    return {
        "message": "Login successful", 
        "user_id": db_user.id, 
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name
    }

@router.post("/forgot-password")
def forgot_password(data: schemas.PasswordReset, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=data.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="No account found with this email.")
    
    # Generate 6-digit code
    code = str(random.randint(100000, 999999))
    verification_codes[data.email] = code
    
    # Send via SMTP
    email_sent = send_verification_code(data.email, code, reason="forgot_password")
    
    response_data = {"message": "Verification code sent to your email."}
    if not email_sent:
        response_data["debug_note"] = "SMTP credentials missing or invalid in .env. Check backend terminal for OTP."
    return response_data

@router.post("/verify-reset-code")
def verify_reset_code(data: schemas.VerifyCode):
    if data.email in verification_codes and verification_codes[data.email] == data.code:
        return {"message": "Code verified. You can now reset your password."}
    raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

@router.post("/reset-password")
def reset_password(data: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    # 1. Verify code again
    if data.email not in verification_codes or verification_codes[data.email] != data.code:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
    
    # 2. Get user
    user = crud.get_user_by_email(db, email=data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # 3. Update password
    user.password_hash = crud.hash_password(data.new_password)
    db.commit()
    
    # 4. Cleanup code
    del verification_codes[data.email]
    
    return {"message": "Password reset successfully. Please login with your new password."}

@router.get("/profile/{user_id}", response_model=schemas.UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        # Return a default profile instead of 404 as requested
        return {
            "id": user_id,
            "username": f"user_{user_id}",
            "email": "notset@example.com",
            "full_name": "New Pantrix User",
            "created_at": "2026-01-01T00:00:00"
        }
    return db_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return None




@router.post("/google-login")
def google_login(data: schemas.GoogleLogin, db: Session = Depends(get_db)):
    from passlib.context import CryptContext
    _pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    
    # Verify if user exists by googleId or email
    user = db.query(models.User).filter((models.User.google_id == data.googleId) | (models.User.email == data.email)).first()
    
    if not user:
        # Create new user
        new_username = data.email.split('@')[0]
        # Check if username exists, if so append random digits
        import random
        while db.query(models.User).filter(models.User.username == new_username).first():
            new_username += str(random.randint(1, 999))
            
        user = models.User(
            username=new_username,
            email=data.email,
            full_name=data.name,
            avatar_url=data.photoUrl,
            google_id=data.googleId,
            password_hash=_pwd_context.hash(data.googleId + "dummy"), # Dummy password for google users
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update google_id and photo if not present
        if not user.google_id:
            user.google_id = data.googleId
        if data.photoUrl and not user.avatar_url:
            user.avatar_url = data.photoUrl
        db.commit()
        db.refresh(user)

    return {
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url
    }

@router.post("/upload-avatar")
def upload_avatar(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    new_filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join("uploads", "avatars", new_filename)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Note: assuming backend is running on the same host/port.
    # We will store the path relative to the domain (e.g. /uploads/avatars/filename.ext)
    # The frontend will prepend the API_URL. Or we can just store the relative path.
    user.avatar_url = f"/uploads/avatars/{new_filename}"
    db.commit()
    db.refresh(user)
    
    return {"message": "Avatar updated successfully", "avatar_url": user.avatar_url}
