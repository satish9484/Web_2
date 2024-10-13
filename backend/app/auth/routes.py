from fastapi import APIRouter, Depends, Request, HTTPException
from app.auth.token import encode_token, admin_required
from fastapi.responses import JSONResponse
from app.models import User
from datetime import datetime
from passlib.context import CryptContext
from .otputils import send_otp_email

router = APIRouter()

# Create a CryptContext for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Utility functions for hashing and verifying passwords
def generate_password_hash(password: str):
    return pwd_context.hash(password)

def check_password_hash(hashed_password: str, password: str):
    return pwd_context.verify(password, hashed_password)


@router.post("/register")
async def register(request: Request):
    data = await request.json()
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')  # Default role is 'user'

    # Ensure only an admin can register another admin
    if role == 'admin':
        await admin_required(request)

    if User.find_by_email(email):
        return JSONResponse({"message":"Email already exists","success":False},status_code=400)

    user = User(full_name=full_name, email=email, password=password, role=role)
    user.save()  # Use the save method to insert the user
    return {"message": f"{role.capitalize()} registered successfully", "success": True}


@router.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get('email')
    password = data.get('password')

    user = User.find_by_email(email)

    if user is None or user.password_hash is None:
        return JSONResponse({"message":"Invalid credentials","success":False},status_code=401)

    if user.check_password(password):
        token = encode_token(str(user._id), user.role, user.email ,user.full_name)
        return {"token": token, "role": user.role , "success":True}

    return JSONResponse({"message":"Invalid credentials","success":False},status_code=401)


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully", "success": True}


@router.post("/forgot-password")
async def forgot_password(request: Request):
    data = await request.json()
    email = data.get('email')

    user = User.find_by_email(email)

    if not user:
        return JSONResponse({"message":"No account found with this email","success":False},status_code=404)

    user.set_otp()  # Set the OTP and expiry time

    # Send the OTP via email
    await send_otp_email(user.email, user.otp)

    return {"message": "OTP sent to your email.", "success": True}


@router.post("/reset-password")
async def reset_password(request: Request):
    data = await request.json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    user = User.find_by_email(email)

    if not user:
        return JSONResponse({"message":"Invalid email","success":False},status_code=404)

    if user.otp != otp or user.otp_expires < datetime.utcnow():
        return JSONResponse({"message":"Invalid or expired OTP","success":False},status_code=400)

    user.set_password(new_password)  # Set the new password
    user.clear_otp()  # Clear the OTP after use

    return {"message": "Password reset successfully", "success": True}


@router.get("/users")
async def get_users(user_id: str = Depends(admin_required)):
    users = User.collection.find()
    user_data = [{"id": str(u["_id"]), "full_name": u["full_name"], "email": u["email"], "role": u["role"]} for u in users]
    return {"user_data": user_data , "success":True}


@router.put("/user/{user_id}")
async def update_user(user_id: str, data: dict, _: str = Depends(admin_required)):
    user = User.collection.find_one({"_id": user_id})

    if not user:
        return JSONResponse({"message":"User not found","success":False},status_code=404)


    User.collection.update_one({"_id": user_id}, {"$set": data})

    return {"message": "User updated successfully", "success": True}


@router.delete("/user/{user_id}")
async def delete_user(user_id: str, _: str = Depends(admin_required)):
    user = User.collection.find_one({"_id": user_id})

    if not user:
        return JSONResponse({"message":"User not found","success":False},status_code=404)
    User.collection.delete_one({"_id": user_id})

    return {"message": "User deleted successfully", "success": True}
