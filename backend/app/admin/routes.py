import os
from fastapi import APIRouter, Depends, HTTPException , Request
from fastapi.responses import HTMLResponse, JSONResponse
from app.models import User, UserActivity , URLFlag , URLFeedback , BlogPost
from app.auth.token import admin_required
from bson import ObjectId  # Assuming you're using ObjectId for MongoDB\\
from datetime import datetime

admin_router = APIRouter()

@admin_router.post("/admin/create-super-admin")
async def create_super_admin(request: Request, admin: dict = Depends(admin_required)):
    body = await request.json()
    full_name = body.get("full_name")
    email = body.get("email")
    password = body.get("password")

    if not full_name or not email or not password:
        return JSONResponse(content={'message': 'Full name, email, and password are required.', "success": False}, status_code=400)

    existing_user = User.find_by_email(email)
    if existing_user:
        return JSONResponse(content={'message': 'User with this email already exists.', "success": False}, status_code=409)

    super_admin = User(full_name=full_name, email=email, role='admin')
    super_admin.set_password(password)
    super_admin.save()

    return JSONResponse(content={'message': 'Super admin created successfully.', "success": True}, status_code=201)

# Route to get all users (Updated)
@admin_router.get("/users")
async def get_users(admin: dict = Depends(admin_required)):
    try:
        user_data = []
        users = User.collection.find()
        for u in users:
            user_activities = UserActivity.find_by_user_id(str(u["_id"]))
            u_data = {'id': str(u["_id"]), 
                    'full_name': u["full_name"], 
                    'email': u["email"], 
                    'role': u["role"],
                    "user_activities" : user_activities
                    } 
            user_data.append(u_data)
        return JSONResponse(content={"success":True,"user_data":user_data}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"success":False,"error":str(e)}, status_code=400)

# Route to update a user (Updated)
@admin_router.put("/user/{user_id}")
async def update_user(user_id: str, request: Request, admin: dict = Depends(admin_required)):
    body = await request.json()
    user = User.collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        return JSONResponse(content={'error': "User not found", "success": False}, status_code=404)

    if 'full_name' in body:
        user['full_name'] = body['full_name']
    if 'email' in body:
        user['email'] = body['email']
    if 'role' in body and body['role'] in ['user', 'admin']:
        user['role'] = body['role']

    User.collection.update_one({"_id": ObjectId(user_id)}, {"$set": user})

    return JSONResponse(content={'message': 'User updated successfully', "success": True}, status_code=200)

# Route to delete a user (Updated)
@admin_router.delete("/user/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(admin_required)):
    user = User.collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        return JSONResponse(content={'error': "User not found", "success": False}, status_code=404)

    User.collection.delete_one({"_id": ObjectId(user_id)})

    return JSONResponse(content={'message': 'User deleted successfully', "success": True}, status_code=200)

@admin_router.post("/flag-url")
async def flag_url(request: Request, dmin: dict = Depends(admin_required)):
    body = await request.json()
    url = body.get("url")
    flagged = body.get("flagged")

    existing_url = URLFlag.find_by_url(url)
    
    if existing_url:
        # Update the existing URL's flag
        url_flag = URLFlag(
            url=existing_url["url"],
            flagged=flagged,
            created_at=existing_url["created_at"],
            updated_at=datetime.utcnow(),
            _id=existing_url["_id"]
        )
    else:
        # Create a new URL entry
        url_flag = URLFlag(url=url, flagged=flagged)

    # Save the URL to the collection
    result = url_flag.save()
    
    return JSONResponse(
        content={"success":True, "message": "URL flag updated" if existing_url else "New URL flagged"},
        status_code=200
    )


@admin_router.get("/get-report", response_class=HTMLResponse)
async def get_report(report_type: str, admin: dict = Depends(admin_required)):
    # Check if the input is either 'EDA' or 'Train'
    if report_type not in ["EDA", "Train","Used_for_website_2"]:
        return JSONResponse(content={"error": "Invalid report type. Only 'EDA' and 'Train' are allowed.", "success": False}, status_code=400)

    # Set the report path based on the report type
    report_file = f"{report_type}.html"
    report_path = os.path.join("app", "Templates", report_file)

    try:
        # Load and return the HTML report content
        with open(report_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except Exception as e:
        return JSONResponse(content={"error": f"Error loading report: {str(e)}", "success": False}, status_code=500)
    
@admin_router.get("/get-all-feedback")
async def get_all_feedback(user: dict = Depends(admin_required)):
    feedbacks = URLFeedback.find_all()

    if not feedbacks:
        return JSONResponse(content={"message": "No feedback found", "success": True}, status_code=404)
    
    return {"success": True, "feedbacks": feedbacks}


@admin_router.post("/create-blog")
async def create_blog(request: Request, user: dict = Depends(admin_required)):
    body = await request.json()
    url = body.get("url")
    image_url = body.get("image_url")
    title = body.get("title")
    description = body.get("description")
    
    if not url or not title:  # Add any required field checks
        raise HTTPException(status_code=400, detail="URL and Title are required fields.")
    
    blog_post = BlogPost(url=url, image_url=image_url, title=title, description=description)
    result = blog_post.save()
    if result.modified_count == 0:
        return JSONResponse(content={"message": "Blog post created successfully", "success": True}, status_code=201)
    return JSONResponse(content={"message": "Blog post already exists, updated instead", "success": True}, status_code=200)

@admin_router.get("/get-all-blogs")
async def get_all_blogs(request: Request):
    blog_posts = BlogPost.find_all()
    if not blog_posts:
        return JSONResponse(content={"message": "No blog posts found", "success": True}, status_code=200)
    
    return {"success": True, "blogs": blog_posts}

@admin_router.put("/update-blog/{blog_id}")
async def update_blog(blog_id: str, request: Request, user: dict = Depends(admin_required)):
    body = await request.json()
    image_url = body.get("image_url")
    title = body.get("title")
    description = body.get("description")

    blog_post = BlogPost.collection.find_one({"_id": ObjectId(blog_id)})
    if not blog_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_data = {}
    if image_url is not None:
        update_data["image_url"] = image_url
    if title is not None:
        update_data["title"] = title
    if description is not None:
        update_data["description"] = description

    BlogPost.collection.update_one({"_id": ObjectId(blog_id)}, {"$set": update_data})
    
    return JSONResponse(content={"message": "Blog post updated successfully", "success": True}, status_code=200)

@admin_router.delete("/delete-blog/{blog_id}")
async def delete_blog(blog_id: str, user: dict = Depends(admin_required)):
    result = BlogPost.collection.delete_one({"_id": ObjectId(blog_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return JSONResponse(content={"message": "Blog post deleted successfully", "success": True}, status_code=200)