from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import encrypt_secret, decrypt_secret, verify_telegram_init_data, create_access_token
from app.models.tenant import User
from app.models.app import App
from app.models.telegram import TelegramBot
from app.schemas.telegram import (
    BotConnectRequest, BotStatusOut,
    TelegramVerifyRequest, TelegramVerifyResponse
)
from app.services.telegram_service import TelegramService
from app.api.deps import get_current_user

router = APIRouter(prefix="/apps/{app_id}/bot", tags=["Telegram Bot Studio"])

@router.get("/status", response_model=BotStatusOut)
async def get_bot_status(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(TelegramBot).where(
        TelegramBot.app_id == app_id,
        TelegramBot.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    bot = res.scalar_one_or_none()

    if not bot or not bot.is_connected:
        return BotStatusOut(
            is_connected=False,
            bot_username="",
            menu_button_configured=False,
            webhook_configured=False,
            last_health_check=None
        )

    return BotStatusOut(
        is_connected=bot.is_connected,
        bot_username=bot.bot_username or "",
        menu_button_configured=bot.menu_button_configured,
        webhook_configured=bool(bot.webhook_url),
        last_health_check=bot.last_health_check
    )

@router.post("/connect", response_model=BotStatusOut)
async def connect_bot(
    app_id: str,
    req: BotConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    app_stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    app_res = await db.execute(app_stmt)
    app = app_res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    # 1. Verify token with Telegram Bot API
    is_valid, bot_username, err = await TelegramService.verify_bot_token(req.bot_token)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Telegram verification failed: {err}")

    # 2. Encrypt token with AES-256-GCM
    encrypted = encrypt_secret(req.bot_token)

    # 3. Find or create bot record
    bot_stmt = select(TelegramBot).where(TelegramBot.app_id == app_id)
    bot_res = await db.execute(bot_stmt)
    bot = bot_res.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if not bot:
        bot = TelegramBot(
            app_id=app.id,
            tenant_id=current_user.tenant_id,
            bot_username=bot_username or "",
            encrypted_bot_token=encrypted,
            is_connected=True,
            last_health_check=now
        )
        db.add(bot)
    else:
        bot.bot_username = bot_username or ""
        bot.encrypted_bot_token = encrypted
        bot.is_connected = True
        bot.last_health_check = now

    await db.commit()
    await db.refresh(bot)

    return BotStatusOut(
        is_connected=True,
        bot_username=bot.bot_username,
        menu_button_configured=bot.menu_button_configured,
        webhook_configured=bool(bot.webhook_url),
        last_health_check=bot.last_health_check
    )

@router.post("/menu-button")
async def configure_menu_button(
    app_id: str,
    web_app_url: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    bot_stmt = select(TelegramBot).where(
        TelegramBot.app_id == app_id,
        TelegramBot.tenant_id == current_user.tenant_id
    )
    bot_res = await db.execute(bot_stmt)
    bot = bot_res.scalar_one_or_none()
    if not bot or not bot.is_connected or not bot.encrypted_bot_token:
        raise HTTPException(status_code=400, detail="Telegram bot is not connected.")

    token = decrypt_secret(bot.encrypted_bot_token)
    ok, err = await TelegramService.configure_menu_button(token, web_app_url)
    if not ok:
        raise HTTPException(status_code=400, detail=f"Failed to configure menu button: {err}")

    bot.menu_button_configured = True
    await db.commit()
    return {"message": "Telegram Mini App menu button successfully configured."}

@router.post("/disconnect")
async def disconnect_bot(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    bot_stmt = select(TelegramBot).where(
        TelegramBot.app_id == app_id,
        TelegramBot.tenant_id == current_user.tenant_id
    )
    bot_res = await db.execute(bot_stmt)
    bot = bot_res.scalar_one_or_none()
    if bot:
        bot.is_connected = False
        bot.encrypted_bot_token = ""
        bot.menu_button_configured = False
        await db.commit()

    return {"message": "Telegram bot disconnected."}

# ==========================================
# Official Telegram Mini App initData Verification
# ==========================================
@router.post("/verify-telegram", response_model=TelegramVerifyResponse)
async def verify_telegram_identity(
    app_id: str,
    req: TelegramVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint for Telegram Mini App clients.
    Validates HMAC-SHA256 signature against the app's connected bot token.
    Issues an authenticated session token upon verification.
    """
    bot_stmt = select(TelegramBot).where(TelegramBot.app_id == app_id)
    bot_res = await db.execute(bot_stmt)
    bot = bot_res.scalar_one_or_none()

    if not bot or not bot.is_connected or not bot.encrypted_bot_token:
        return TelegramVerifyResponse(
            is_valid=False,
            message="No active bot connected to this application."
        )

    bot_token = decrypt_secret(bot.encrypted_bot_token)
    is_valid, parsed = verify_telegram_init_data(req.init_data, bot_token)

    if not is_valid or not parsed:
        return TelegramVerifyResponse(
            is_valid=False,
            message="Invalid or expired Telegram signature."
        )

    telegram_user = parsed.get("user")
    tg_id = str(telegram_user.get("id")) if isinstance(telegram_user, dict) else "unknown"

    # Generate customer session token
    session_token = create_access_token({
        "sub": f"tg_{tg_id}",
        "tenant_id": bot.tenant_id,
        "app_id": app_id,
        "role": "customer",
        "telegram_user": telegram_user
    })

    return TelegramVerifyResponse(
        is_valid=True,
        telegram_user=telegram_user,
        session_token=session_token,
        message="Telegram identity verified successfully."
    )

