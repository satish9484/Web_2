from fastapi import APIRouter, Depends, HTTPException, Request ,  File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
import os
from io import StringIO
from app.auth.token import token_required, admin_required
from .feature_details import URLDetailExtraction
from app.models import UserActivity
from .predict import prediction , check_url_flag , process_and_send_csv

ml_router = APIRouter()

# Route to check health of the system
@ml_router.get("/health")
async def health(user_id: str = Depends(token_required)):
    return JSONResponse(content={'message': 'Aye Aye Captain'}, status_code=200)


# Route to extract feature details from a given URL
@ml_router.post("/feature-detail")
async def feature_extraction(request: Request, user_id: str = Depends(token_required)):
    body = await request.json()
    url = body.get("url")
    obj = URLDetailExtraction(url)
    feature_details_dict = obj.get_detailed_info()

    predict_details = UserActivity.find_by_url(url)

    if predict_details:
        feature_details_dict["ml_details"] = predict_details["details"]["probabilities"]
        feature_details_dict["ml_feature"] = predict_details["details"]["feature_importances"]

    else:
        feature_details_dict["ml_details"] = None
        feature_details_dict["ml_feature"] = None

    if not feature_details_dict:
        return JSONResponse(content={"error": f"Details for this URL: {url} not found","success":False}, status_code=404)
    
    return JSONResponse(content={"success": True, "detail": [feature_details_dict]}, status_code=200)
    


# Route to perform URL prediction
@ml_router.post("/predict")
async def url_prediction(request: Request, user_id: str = Depends(token_required)):
    body = await request.json()
    url = body.get("url")
    model = "bagging"

    if not url or not model:
        return JSONResponse(content={"success": False, "error": "url and model are required fields"}, status_code=400)
    
    flag_status = check_url_flag(url)

    if flag_status:
        # Return the flag status if found in the collection
        return JSONResponse(content={"success": True, "result": flag_status}, status_code=200)

    result = prediction(url, model, user_id)

    if result:
        return JSONResponse(content={"success": True, "result": result}, status_code=200)
    
    return JSONResponse(content={"error": f"Prediction for this URL: {url} not found","success":False}, status_code=404)

    
@ml_router.post("/predict-csv")
async def url_prediction_csv(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    user_id: str = Depends(token_required)
):
    if file.content_type != 'text/csv':
        return JSONResponse(content={"error": "Invalid file format. Please upload a CSV file.","success":False}, status_code=400)
    
    # Read and decode the contents of the uploaded CSV file
    contents = await file.read()
    decoded_content = contents.decode('utf-8')
    
    # Return immediate response to the user
    response_message = "We are analyzing all the records and shortly we will share the file to your email."
    response = JSONResponse(content={"message": response_message, "success": True}, status_code=200)

    # Start background tasks to analyze the file and send results
    background_tasks.add_task(process_and_send_csv, decoded_content, user_id)

    return response
