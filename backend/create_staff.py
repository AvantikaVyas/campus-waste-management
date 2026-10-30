from app.database import SessionLocal
from app import models
from app.security import hash_password
from getpass import getpass

db = SessionLocal()

try:
    name = input("Staff name: ").strip()
    email = input("Staff email: ").strip().lower()
    password = getpass("Set password: ")

    if not name or not email or not password:
        raise ValueError("All fields are required.")

    if db.query(models.User).filter_by(email=email).first():
        raise ValueError("This email is already registered.")

    staff = models.User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role="staff"
    )

    db.add(staff)
    db.commit()

    print("Staff account created successfully!")

except Exception as e:
    db.rollback()
    print("Error:", e)

finally:
    db.close()