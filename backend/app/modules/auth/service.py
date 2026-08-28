from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.auth.models import UserModel
from app.modules.auth.schemas import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from fastapi import HTTPException

async def get_user_by_email(db: AsyncSession, email: str) -> UserModel:
    result = await db.execute(select(UserModel).where(UserModel.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> UserModel:
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    return result.scalars().first()

async def register_user(db: AsyncSession, data: RegisterRequest):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = UserModel(email=data.email, password_hash=hash_password(data.password), full_name=data.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)})
    }

async def authenticate_user(db: AsyncSession, data: LoginRequest):
    user = await get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)})
    }