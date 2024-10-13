import os
import time
from fastapi import FastAPI
from fastapi_mail import FastMail, ConnectionConfig
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from werkzeug.security import generate_password_hash

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Enable CORS for the entire app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client['ml_website1']  # MongoDB database

# FastAPI-Mail Configuration
conf = ConnectionConfig(
    MAIL_USERNAME='AKIAWOAVSCRU6FH6JTX2',
    MAIL_PASSWORD='BIsT283HOqqWt9Ykwr3ljfXiyQ5d8R+XKM8QruabB6zA',
    MAIL_FROM='pansara52@gmail.com',
    MAIL_PORT=587,
    MAIL_SERVER='email-smtp.ap-southeast-2.amazonaws.com',
    MAIL_STARTTLS=True,  # Set this to True or False depending on your needs
    MAIL_SSL_TLS=False,  # Add this if needed
)

fast_mail = FastMail(conf)

# Import routers (equivalent to Flask blueprints)
from app.auth.routes import router as auth_router
from app.ml.routes import ml_router as ml_router
from app.admin.routes import admin_router as admin_router
from app.user.routes import user_router as user_router

app.include_router(auth_router, prefix="/auth")
app.include_router(ml_router, prefix="/ml")
app.include_router(admin_router, prefix="/admin")
app.include_router(user_router, prefix="/user")

# Define a function to create the default admin in MongoDB
def create_default_admin():
    """Create an admin user if no admin exists in the database."""
    try:
        admin_exists = db['users'].find_one({"role": "admin"})
        if not admin_exists:
            admin_user = {
                "full_name": "satish",
                "email": "pansara52@gmail.com",
                "role": "admin",
                "password_hash": generate_password_hash('1234@')
            }
            db['users'].insert_one(admin_user)
            print("Admin user created successfully.")
        else:
            print("Admin user already exists.")
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")

# Try to create the default admin on startup
attempts = 5
for attempt in range(attempts):
    try:
        create_default_admin()  # Check and create the admin user if needed
        print("Connected to MongoDB and created admin user successfully.")
        break
    except Exception as e:
        print(f"Attempt {attempt + 1} of {attempts}: MongoDB connection failed. Retrying in 5 seconds...")
        time.sleep(5)
else:
    print("Failed to connect to MongoDB after multiple attempts.")
