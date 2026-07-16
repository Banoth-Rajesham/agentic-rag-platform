from sqlalchemy import Column 
from sqlalchemy import Integer
from sqlalchemy import String

from src.database.base import Base

class User(Base):
    
    __tablename__ = "users"
    
    id = Column(Integer,primary_key=True)
    
    name = Column(String(100), nullable=False)
    
    email = Column(String(100), unique=True, nullable=False)
    
    password = Column(String(255),nullable=False)
    
    
    
    

