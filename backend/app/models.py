from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from bson import ObjectId  # MongoDB uses ObjectId for IDs
import os

# MongoDB setup
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client['ml_website1']  # MongoDB database

class User:
    collection = db['users']  # MongoDB collection for users

    def __init__(self, full_name, email, password=None, role='user', otp=None, otp_expires=None, password_hash=None, _id=None):
        self._id = _id if _id else ObjectId()  # Set a new ObjectId if not provided
        self.full_name = full_name
        self.email = email
        self.password_hash = generate_password_hash(password) if password else password_hash  # Use password_hash if provided
        self.role = role
        self.otp = otp  # Initialize OTP
        self.otp_expires = otp_expires  # Initialize OTP expiration

    def save(self):
        """Insert or update the user in MongoDB."""
        user_data = {
            "full_name": self.full_name,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "otp": self.otp,
            "otp_expires": self.otp_expires
        }
        result = self.collection.update_one(
            {"email": self.email}, {"$set": user_data}, upsert=True
        )
        return result

    @classmethod
    def find_by_email(cls, email):
        """Find a user by email."""
        user_data = cls.collection.find_one({"email": email})
        if user_data:
            return cls(**user_data)
        return None
    
    @classmethod
    def find_by_id(cls, _id):
        """Find a document by its ID."""
        if not ObjectId.is_valid(_id):
            return None  # Return None if the ID is not valid

        user_data = cls.collection.find_one({"_id": ObjectId(_id)})
        if user_data:
            return cls(**user_data)
        return None


    def set_password(self, password):
        """Set and hash the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check the user's password."""
        if self.password_hash is None:
            return False  # Prevent NoneType error
        return check_password_hash(self.password_hash, password)

    def set_otp(self):
        """Generate a 6-digit OTP and set its expiry."""
        from random import randint
        self.otp = str(randint(100000, 999999))  # Generates a 6-digit OTP
        self.otp_expires = datetime.utcnow() + timedelta(minutes=5)  # OTP valid for 5 minutes
        self.save()

    def clear_otp(self):
        """Clear the OTP after use or expiration."""
        self.otp = None
        self.otp_expires = None
        self.save()


class UserActivity:
    collection = db['user_activities']  # MongoDB collection for user activities

    def __init__(self, user_id, url, result, model, details=None, _id=None):
        self._id = _id if _id else ObjectId()  # Set a new ObjectId if not provided
        self.user_id = user_id
        self.url = url
        self.result = result
        self.model = model
        self.details = details
        self.timestamp = datetime.utcnow()

    def save(self):
        """Insert the user activity into MongoDB."""
        activity_data = {
            "user_id": self.user_id,
            "url": self.url,
            "result": self.result,
            "model": self.model,
            "details": self.details,
            "timestamp": self.timestamp
        }
        result = self.collection.insert_one(activity_data)
        return result

    @classmethod
    def find_by_user_id(cls, user_id):
        """Find activities by user_id."""
        activities = cls.collection.find({"user_id": user_id}).sort("timestamp", -1)
        activity_list = []
        for activity in activities:
            activity['_id'] = str(activity['_id'])  # Convert ObjectId to string
            activity["timestamp"] = str(activity['timestamp'])
            activity_list.append(activity)
        
        return activity_list if activity_list else []
    
    @classmethod
    def find_by_url(cls, url):
        """Find the latest activity by URL with URL normalization (removing slashes and spaces)."""
        normalized_url = url.strip().rstrip('/')

        # Perform the query with the normalized URL
        activities = cls.collection.find_one({"url": normalized_url}, sort=[("timestamp", -1)])

        if activities:
            latest_activity = activities # Get the latest activity (first after sorting)
            latest_activity['_id'] = str(latest_activity['_id'])  # Convert ObjectId to string
            latest_activity["timestamp"] = str(latest_activity["timestamp"])
            return latest_activity
        else:
            print(f"No activity found for URL: {url}")
            return None


class URLFlag:
    collection = db['urls_collection']  # MongoDB collection for flagged URLs

    def __init__(self, url, flagged, created_at=None, updated_at=None, _id=None):
        self._id = _id if _id else ObjectId()  # Set a new ObjectId if not provided
        self.url = url
        self.flagged = flagged  # Boolean: True for safe, False for not safe
        self.created_at = created_at if created_at else datetime.utcnow()  # Default to current time
        self.updated_at = updated_at if updated_at else datetime.utcnow()  # Default to current time

    def save(self):
        """Insert or update the URL flagging status in MongoDB."""
        flag_data = {
            "url": self.url,
            "flagged": self.flagged,
            "created_at": self.created_at,
            "updated_at": datetime.utcnow()  # Automatically update 'updated_at' when saving
        }
        result = self.collection.update_one(
            {"url": self.url}, {"$set": flag_data}, upsert=True
        )
        return result

    @classmethod
    def find_by_url(cls, url):
        """Find a flagged URL by its URL."""
        flag_data = cls.collection.find_one({"url": url})
        return flag_data if flag_data else None

    @classmethod
    def find_all(cls):
        """Retrieve all flagged URLs."""
        urls = cls.collection.find({})
        return list(urls)

    def set_flag(self, flagged):
        """Set the flag status and update the updated_at timestamp."""
        self.flagged = flagged
        self.updated_at = datetime.utcnow()
        self.save()


class URLFeedback:
    collection = db['url_feedback']  # MongoDB collection for feedback on predictions

    def __init__(self, url, predicted_flag, user_feedback,reason, user_id, created_at=None, updated_at=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.url = url
        self.predicted_flag = predicted_flag  # String: "Safe" or "Not Safe"
        self.user_feedback = user_feedback  # String: "Safe" or "Not Safe"
        self.reason = reason
        self.user_id = user_id 
        self.created_at = created_at if created_at else datetime.utcnow()
        self.updated_at = updated_at if updated_at else datetime.utcnow()

    def save(self):
        """Insert or update the feedback status in MongoDB."""
        feedback_data = {
            "url": self.url,
            "predicted_flag": self.predicted_flag,
            "user_feedback": self.user_feedback,
            "reason" : self.reason,
            "user_id": self.user_id,
            "created_at": self.created_at,
            "updated_at": datetime.utcnow()  # Automatically update 'updated_at'
        }
        result = self.collection.update_one(
            {"url": self.url, "user_id": self.user_id}, {"$set": feedback_data}, upsert=True
        )
        return result

    @classmethod
    def find_all(cls):
        """Retrieve all feedback entries."""
        feedbacks = cls.collection.find({})
        feedback_list = []
        for feedback in feedbacks:
            feedback['_id'] = str(feedback['_id'])  # Convert ObjectId to string
            feedback["created_at"] = str(feedback['created_at'])
            feedback["updated_at"] = str(feedback['updated_at'])
            feedback_list.append(feedback)
        
        return feedback_list if feedback_list else []


class BlogPost:
    collection = db['blog_posts']  # MongoDB collection for blog posts

    def __init__(self, url, image_url, title, description, created_at=None, updated_at=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.url = url
        self.image_url = image_url
        self.title = title
        self.description = description
        self.created_at = created_at if created_at else datetime.utcnow()
        self.updated_at = updated_at if updated_at else datetime.utcnow()

    def save(self):
        """Insert or update the blog post in MongoDB."""
        blog_post_data = {
            "url": self.url,
            "image_url": self.image_url,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": datetime.utcnow()  # Automatically update 'updated_at'
        }
        result = self.collection.update_one(
            {"url": self.url}, {"$set": blog_post_data}, upsert=True
        )
        return result

    @classmethod
    def find_all(cls):
        """Retrieve all blog posts."""
        blog_posts = cls.collection.find({})
        blog_post_list = []
        for post in blog_posts:
            post['_id'] = str(post['_id'])  # Convert ObjectId to string
            post["created_at"] = str(post['created_at'])
            post["updated_at"] = str(post['updated_at'])
            blog_post_list.append(post)
        
        return blog_post_list if blog_post_list else []

    @classmethod
    def find_by_id(cls, _id):
        """Retrieve a blog post by its ID."""
        post = cls.collection.find_one({"_id": ObjectId(_id)})
        if post:
            post['_id'] = str(post['_id'])
            post["created_at"] = str(post['created_at'])
            post["updated_at"] = str(post['updated_at'])
        return post