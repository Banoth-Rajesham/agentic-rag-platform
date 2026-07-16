from src.database.session import SessionLocal
from src.models.user import User


session = SessionLocal()

User = session.query(User).filter(User.id ==1).first()

session.delete(User)

session.commit()
print("User Deleted Successfully")