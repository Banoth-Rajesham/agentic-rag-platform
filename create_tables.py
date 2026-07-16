from src.database.connection import engine
from src.database.base import Base
from src.models.user import User

Base.metadata.create_all(bind=engine)

print("Tables Created Successfully")