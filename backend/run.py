import uvicorn
from app import app

if __name__ == "__main__":
    # Run the FastAPI application with Uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
