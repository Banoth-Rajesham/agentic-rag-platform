from src.database.session import SessionLocal

session = SessionLocal()

print(session)

session.close()

print("Session Closed Successfully")