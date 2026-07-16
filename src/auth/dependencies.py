from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer

from src.auth.jwt import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    
    if payload in None:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token"
        )
        
    return payload    

