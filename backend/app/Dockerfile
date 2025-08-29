FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy and install all requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create the 'backend' directory structure that your Python code expects
# and copy your application code into it. This fixes the ModuleNotFoundError.
RUN mkdir -p /app/backend
COPY ./app /app/backend/app

# The command now uses the full path to start the app
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]