import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Request, HTTPException, Depends
from functools import wraps
from os import getenv
from starlette.status import HTTP_403_FORBIDDEN, HTTP_401_UNAUTHORIZED
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Load the SECRET_KEY from environment variables or define it here
SECRET_KEY = "javainuse-secret-key"

auth_scheme = HTTPBearer()

def encode_token(user_id, role, email , full_name):
    now = datetime.now(timezone.utc)
    
    payload = {
        'exp': now + timedelta(minutes=30),
        'iat': now,
        'sub': user_id,
        'role': role,
        'email':email,
        'full_name':full_name
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token  # In FastAPI, there's no need to call decode() for the token


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def token_required(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials  # Get the token from the Authorization header
    if not token:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Token is missing!")

    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Token is invalid or expired!")

    return user_id  # Return user_id to use in route


async def admin_required(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials  # Get the token from the Authorization header

    if not token:
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Token is missing!")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])  # Decode JWT token

        # Check if the user is an admin
        if payload.get('role') != 'admin':
            raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Admin access required!")
        
        return payload  # Optionally return the payload if you need it
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Token has expired!")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Invalid token!")

