from fastapi import APIRouter, HTTPException

from src.schemas.user_schema import UserCreate, UserLogin

from src.repositories.user_repository import (
    create_user,
    get_user_by_email
)

from src.auth.security import (
    hash_password,
    verify_password
)

from src.auth.jwt import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/test")
def test():
    return {
        "message": "Authentication route is working!"
    }


@router.post("/register")
def register(user: UserCreate):

    existing_user = get_user_by_email(user.email)

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = create_user(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


@router.post("/login")
def login(user: UserLogin):

    db_user = get_user_by_email(user.email)

    print("Entered Email:", user.email)
    print("Entered Password:", user.password)

    print("Database User:", db_user)

    if db_user:
        print("Database Email:", db_user.email)
        print("Database Password:", db_user.password)

    if db_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    print(
        verify_password(
            user.password,
            db_user.password
        )
    )

    if not verify_password(
        user.password,
        db_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }