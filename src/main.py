from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from src.database.session import SessionLocal
from src.models.user import User
from src.repositories.user_repository import get_all_users
from src.schemas.user_schema import UserResponse
from src.routes.auth import router as auth_router
from src.routes.upload import router as upload_router


app = FastAPI()

@app.on_event("startup")
def startup_event():
    # Pre-warm RAG service cache
    from src.rag.rag_service import preload_rag_documents
    preload_rag_documents()
    
    # Pre-warm OCR service (optional lazy load trigger)
    from src.services.ocr_service import get_ocr_reader
    # Trigger lazy load in background thread or async if desired, or simple warm check
    print("Pre-warming services completed.")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)

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
        

    



