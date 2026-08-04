import psycopg2
import sys

def create_database():
    try:
        # Connect to the default 'postgres' database
        conn = psycopg2.connect(
            host='localhost',
            user='postgres',
            password='Vamsi@1472',
            dbname='postgres'
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # Check if database already exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'pantrixAi'")
        exists = cur.fetchone()
        
        if not exists:
            print("Creating database 'pantrixAi'...")
            cur.execute('CREATE DATABASE "pantrixAi"')
            print("Database created successfully!")
        else:
            print("Database 'pantrixAi' already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_database()
