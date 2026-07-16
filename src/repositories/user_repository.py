from sqlalchemy.orm import Session
from src.models.user import User
from src.database.session import SessionLocal

session = SessionLocal()


def get_all_users():
    return session.query(User).all()


def create_user(name: str, email: str, password: str):

    user = User(
        name=name,
        email=email,
        password=password
    )

    session.add(user)

    session.commit()

    session.refresh(user)

    return user


def get_user_by_email(email: str):

    return (
        session.query(User)
        .filter(User.email == email)
        .first()
    )