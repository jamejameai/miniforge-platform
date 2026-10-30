from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class BotConnectRequest(BaseModel):
    bot_token: str
    mini_app_url: Optional[str] = None

class BotStatusOut(BaseModel):
    is_connected: bool
    bot_username: str
    menu_button_configured: bool
    webhook_configured: bool
    last_health_check: Optional[datetime] = None

class TelegramVerifyRequest(BaseModel):
    init_data: str

class TelegramVerifyResponse(BaseModel):
    is_valid: bool
    telegram_user: Optional[Dict[str, Any]] = None
    session_token: Optional[str] = None
    message: Optional[str] = None
