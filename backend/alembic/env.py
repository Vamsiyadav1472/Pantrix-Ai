"""
Alembic env.py for PantrixAI.
Reads DATABASE_URL from .env – never hardcoded.
Supports both online and offline migration modes.
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# ── Make sure 'backend/' is on the path so we can import our modules ──────────
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# ── Load environment variables from backend/.env ──────────────────────────────
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# ── Alembic Config object (gives access to alembic.ini values) ───────────────
config = context.config

# ── Override sqlalchemy.url with the real value from .env ────────────────────
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL is not set in backend/.env")
config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))

# ── Set up Python logging from alembic.ini ───────────────────────────────────
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Import the shared Base metadata so Alembic can autogenerate diffs ─────────
from database import Base   # noqa: E402
import models               # noqa: E402, F401  – registers all models on Base

target_metadata = Base.metadata


# ─────────────────────────────────────────────────────────────────────────────
# OFFLINE migration  (generates SQL without connecting to the DB)
# ─────────────────────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ─────────────────────────────────────────────────────────────────────────────
# ONLINE migration  (connects to the DB and applies changes)
# ─────────────────────────────────────────────────────────────────────────────
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
