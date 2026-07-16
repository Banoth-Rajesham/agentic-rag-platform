from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from src.database.session import SessionLocal
from src.models.user import User
from src.repositories.user_repository import get_all_users
from src.schemas.user_schema import UserResponse
from src.routes.auth import router as auth_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

session = SessionLocal()



@app.get("/")
def home():
    return {"message": "Welcome to Agent DNA"}


@app.get("/users", response_model=List[UserResponse])
def get_users():
    users = get_all_users()
    
    result = []
    
    for user in users:
        
        result.append({
            "id":user.id,
            "name":user.name,
            "email":user.email
        })
        
    return result    
        

    



