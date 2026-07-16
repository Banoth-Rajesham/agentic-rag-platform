from sqlalchemy.orm import sessionmaker

from src.database.connection import engine

SessionLocal = sessionmaker(bind=engine)