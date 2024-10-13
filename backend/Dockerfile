# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the container
COPY . .

# Expose port 8000 for FastAPI (internally)
EXPOSE 8000

# Define environment variables
ENV PYTHONUNBUFFERED=1
ENV MONGO_URL=mongodb://db:27017/ml_website1

# Command to run the FastAPI application using run.py
CMD ["python", "run.py"]
