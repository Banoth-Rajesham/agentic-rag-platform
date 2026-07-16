from src.auth.security import hash_password
from src.auth.security import verify_password

password = "rajesham123"

hashed_password = hash_password(password)

print(hashed_password)

print(
    verify_password(
        password,
        hashed_password
    )
)