from database import engine
from models import User
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
session = Session()

try:
    num_deleted = session.query(User).delete()
    session.commit()
    print(f"SUCCESS: Deleted {num_deleted} test users.")
    print("You can now sign up with your email again!")
except Exception as e:
    session.rollback()
    print(f"ERROR: {e}")
finally:
    session.close()
