from src.auth.jwt import create_access_token
from src.auth.jwt import verify_access_token

token = create_access_token(
    {
        "sub": "rajesh"
    }
)

token = token[:-1] + "A"

print("TOKEN:")
print(token)

print("\nVERIFY:")

payload = verify_access_token(token)

print(payload)