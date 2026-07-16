from src.database.session import SessionLocal
from src.models.user import User

session = SessionLocal()

user = session.query(User).filter(User.id ==1 ).first()

user.name = "Banoth Rajesham"

session.commit()

print("User Updated Successfully")
