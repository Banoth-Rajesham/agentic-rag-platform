from src.database.session import SessionLocal
from src.models.user import User

session = SessionLocal()

users = session.query(User).all()

for user in users:
    print(user.id)
    print(user.name)
    print(user.email)
    print("----------------")