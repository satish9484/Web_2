from fastapi import APIRouter, Depends ,Request
from fastapi.responses import JSONResponse
from app.models import  UserActivity ,URLFeedback , BlogPost
from app.auth.token import token_required
from datetime import datetime

user_router = APIRouter()


# Route to get all users (Updated)
@user_router.get("/user-activity")
async def get_users_activity(user_id: str = Depends(token_required)):

    # Fetch user activities by user_id
    user_activities = UserActivity.find_by_user_id(user_id)

    if not user_activities:
        return JSONResponse(content={'message': '"No user activities found', "success": True}, status_code=404)

    return {"success": True, "activities": user_activities}

@user_router.post("/submit-feedback")
async def submit_feedback(request: Request ,  user_id: str = Depends(token_required)):
    body = await request.json()
    url = body.get("url")
    predicted_flag = body.get("predicted_flag")
    user_feedback = body.get("user_feedback")
    reason = body.get("reason")

    if predicted_flag not in ["Safe", "Not Safe"] or user_feedback not in ["Safe", "Not Safe"]:
        return JSONResponse(content={'message': "Invalid feedback values. Must be 'Safe' or 'Not Safe'.", "success": False}, status_code=400)

    feedback = URLFeedback(url=url, predicted_flag=predicted_flag, user_feedback=user_feedback,reason=reason, user_id=user_id)
    result = feedback.save()
    
    if result.upserted_id or result.modified_count:
        return JSONResponse(content={"message": "Feedback submitted successfully", "success": True})
    else:
        return JSONResponse(content={'message':"Failed to submit feedback", "success": False}, status_code=400)
    
@user_router.get("/get-all-blogs")
async def get_all_blogs(user_id: str = Depends(token_required)):
    # Fetch all blog posts
    blog_posts = BlogPost.find_all()
    
    if not blog_posts:
        return JSONResponse(content={"message": "No blog posts found", "success": True}, status_code=200)

    return {"success": True, "blogs": blog_posts}
