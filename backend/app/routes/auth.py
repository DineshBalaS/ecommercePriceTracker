from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import EmailStr
from backend.app.models.user import UserCreate, UserInDB, UserOut
from backend.app.services.auth_utils import (
    hash_password, verify_password, create_access_token, decode_access_token
)
from backend.app.config import db
from datetime import timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, APIKeyHeader
from datetime import datetime

auth_router = APIRouter()
user_collection = db["users"]

oauth2_scheme = APIKeyHeader(name="Authorization")

# -----------------------
# Helper: Get user by email
# -----------------------
def get_user_by_email(email: str):
    user_data = user_collection.find_one({"email": email})
    if user_data:
        return UserInDB.model_validate(user_data)  # 👈 Use this instead of **
    return None

# -----------------------
# Dependency: Get current user from token
# -----------------------
def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    print("🔐 Raw token received:", token)
    
    # REMOVE 'Bearer ' prefix if present
    if token.startswith("Bearer "):
        token = token.replace("Bearer ", "").strip()

    payload = decode_access_token(token)
    print("📦 Decoded payload:", payload)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    user = get_user_by_email(payload["sub"])
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    print("👤 Authenticated user:", user.email)
    return user

# -----------------------
# POST /signup
# -----------------------
@auth_router.post("/signup", response_model=UserOut)
def signup(user: UserCreate):
    existing = user_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["hashed_password"] = hash_password(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()
    user_dict["product_history"] = []
    user_dict["currently_tracking"] = []
    
    inserted = user_collection.insert_one(user_dict)
    new_user = user_collection.find_one({"_id": inserted.inserted_id})
    user_obj = UserInDB.model_validate(new_user)
    return UserOut(**user_obj.model_dump())


# -----------------------
# POST /login
# -----------------------
@auth_router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
    
# -----------------------
# GET /me
# -----------------------
@auth_router.get("/me", response_model=UserOut)
def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return UserOut(**current_user.model_dump())


