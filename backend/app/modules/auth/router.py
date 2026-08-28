from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.modules.auth import schemas, service
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import UserModel

router = APIRouter()

@router.post("/register", response_model=schemas.TokenResponse)
async def register(data: schemas.RegisterRequest, db: AsyncSession = Depends(get_db_session)):
    return await service.register_user(db, data)

@router.post("/login", response_model=schemas.TokenResponse)
async def login(data: schemas.LoginRequest, db: AsyncSession = Depends(get_db_session)):
    return await service.authenticate_user(db, data)

@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user