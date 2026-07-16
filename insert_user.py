from src.database.session import SessionLocal
from src.models.user import User

session = SessionLocal()

new_user = User()

new_user.name = "Rajesham"
new_user.email = "banoth.rajesham.dev@gmail.com"

session.add(new_user)
session.commit()
print("User Added Successfully")

