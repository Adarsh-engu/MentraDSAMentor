import os
import sys
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL, SessionLocal
from app.models import Platform

def run():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Adding 'college' column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN college VARCHAR;"))
            conn.commit()
            print("Successfully added 'college'.")
        except Exception as e:
            print(f"Column 'college' might already exist or error occurred: {e}")
            conn.rollback()

        print("Adding 'dob' column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN dob TIMESTAMP;"))
            conn.commit()
            print("Successfully added 'dob'.")
        except Exception as e:
            print(f"Column 'dob' might already exist or error occurred: {e}")
            conn.rollback()

        print("Adding 'summary' column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN summary VARCHAR;"))
            conn.commit()
            print("Successfully added 'summary'.")
        except Exception as e:
            print(f"Column 'summary' might already exist or error occurred: {e}")
            conn.rollback()

    db = SessionLocal()
    platforms_to_add = [
        {"name": "GeeksforGeeks", "base_url": "https://www.geeksforgeeks.org/user/"},
        {"name": "Hive", "base_url": ""},
        {"name": "SmartInterviews", "base_url": "https://smartinterviews.in/profile/"},
    ]

    for p in platforms_to_add:
        existing = db.query(Platform).filter(Platform.name == p["name"]).first()
        if not existing:
            new_platform = Platform(name=p["name"], base_url=p["base_url"])
            db.add(new_platform)
            print(f"Added platform: {p['name']}")
        else:
            print(f"Platform already exists: {p['name']}")

    db.commit()
    db.close()
    print("Database migration and seeding completed.")

if __name__ == "__main__":
    run()
