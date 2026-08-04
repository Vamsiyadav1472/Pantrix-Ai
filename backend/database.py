"""
PantrixAI – Database connection & session management.
Reads DATABASE_URL exclusively from the .env file (never hardcoded).
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load .env from the same directory as this file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Add it to backend/.env  (e.g. postgresql://postgres:password@localhost:5432/pantrixai_db)"
    )

# ── Engine ────────────────────────────────────────────────────────────────────
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        DATABASE_URL,
        echo=False,           # set True to log all SQL statements
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,   # test connections before handing them out
        pool_recycle=3600,    # recycle connections every 1 hour
    )
else:
    # SQLite fallback (development/testing only)
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

# ── Session factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Declarative base (shared across all models) ───────────────────────────────
Base = declarative_base()


# ── Dependency for FastAPI route handlers ─────────────────────────────────────
def get_db():
    """Yield a DB session and guarantee it is closed afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Connectivity check (used at startup) ─────────────────────────────────────
def check_db_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        print(f"[DB] Connection failed: {exc}")
        return False
