import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.tenant import Tenant, User
from app.schemas.auth import LoginRequest, RegisterRequest, Token, UserOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    stmt = select(User).where(User.email == req.email.lower())
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Create tenant
    tenant_slug = re.sub(r"[^a-z0-9]+", "-", req.tenant_name.lower()).strip("-")
    # Verify unique slug
    slug_stmt = select(Tenant).where(Tenant.slug == tenant_slug)
    slug_res = await db.execute(slug_stmt)
    if slug_res.scalar_one_or_none():
        import uuid
        tenant_slug = f"{tenant_slug}-{uuid.uuid4().hex[:4]}"

    tenant = Tenant(name=req.tenant_name, slug=tenant_slug)
    db.add(tenant)
    await db.flush()

    # Create owner user
    hashed = get_password_hash(req.password)
    user = User(
        tenant_id=tenant.id,
        email=req.email.lower(),
        hashed_password=hashed,
        full_name=req.full_name,
        role="owner"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "tenant_id": tenant.id, "role": user.role})
    return Token(access_token=token, tenant_id=tenant.id, role=user.role)

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email.lower())
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")

    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id, "role": user.role})
    return Token(access_token=token, tenant_id=user.tenant_id, role=user.role)

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
