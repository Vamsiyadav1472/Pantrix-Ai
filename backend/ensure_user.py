"""
Ensure a default test user (id=1) exists in PostgreSQL.
Run once: python ensure_user.py
"""
import os
from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine, Base
import models
from crud import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    existing = db.query(models.User).filter(models.User.id == 1).first()
    if existing:
        print(f"[OK] User ID=1 already exists: {existing.username} ({existing.email})")
    else:
        user = models.User(
            id=1,
            username="alex",
            email="alex@pantrixai.com",
            full_name="Alex (Default User)",
            password_hash=hash_password("Password123"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[CREATED] Default user: {user.username} (id={user.id})")
finally:
    db.close()
