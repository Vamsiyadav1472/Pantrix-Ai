import sqlite3; conn = sqlite3.connect('pantrix_ai.db'); cursor = conn.cursor(); cursor.execute(\
DELETE
FROM
recipes
WHERE
name
=
Smart Fallback Veggie Bowl
\); conn.commit(); print(f'Deleted {cursor.rowcount} rows'); conn.close()
