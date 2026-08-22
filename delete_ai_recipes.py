import sqlite3
import os

db_path = os.path.join("backend", "pantrix_ai.db")
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM recipes WHERE ai_generated = 1")
    conn.commit()
    print(f"Deleted {cursor.rowcount} AI generated recipes")
    conn.close()
