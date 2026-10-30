import httpx
from typing import Optional, Dict, Any, Tuple
from app.core.security import verify_telegram_init_data, encrypt_secret, decrypt_secret

TELEGRAM_API_BASE = "https://api.telegram.org/bot"

class TelegramService:
    @staticmethod
    async def verify_bot_token(bot_token: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Calls Telegram Bot API getMe to verify if the token is valid.
        Returns: (is_valid, bot_username, error_message)
        """
        if not bot_token:
            return False, None, "Bot token cannot be empty."

        # If sandbox / dummy token for local dev/testing
        if bot_token.startswith("TEST_TOKEN_") or bot_token == "mock-bot-token":
            return True, "miniforge_test_bot", None

        url = f"{TELEGRAM_API_BASE}{bot_token}/getMe"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                data = resp.json()
                if data.get("ok"):
                    username = data.get("result", {}).get("username", "")
                    return True, username, None
                else:
                    return False, None, data.get("description", "Invalid bot token.")
        except Exception as e:
            return False, None, f"Network error contacting Telegram API: {str(e)}"

    @staticmethod
    async def configure_menu_button(bot_token: str, web_app_url: str) -> Tuple[bool, Optional[str]]:
        """
        Sets the default chat menu button to launch the Mini App.
        Calls setChatMenuButton.
        """
        if bot_token.startswith("TEST_TOKEN_") or bot_token == "mock-bot-token":
            return True, None

        url = f"{TELEGRAM_API_BASE}{bot_token}/setChatMenuButton"
        payload = {
            "menu_button": {
                "type": "web_app",
                "text": "Open App",
                "web_app": {
                    "url": web_app_url
                }
            }
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                data = resp.json()
                if data.get("ok"):
                    return True, None
                return False, data.get("description", "Failed to configure menu button.")
        except Exception as e:
            return False, str(e)

    @staticmethod
    async def send_message(bot_token: str, chat_id: str, text: str) -> Tuple[bool, Optional[str]]:
        """
        Sends a message via the tenant's connected bot.
        """
        if bot_token.startswith("TEST_TOKEN_") or bot_token == "mock-bot-token":
            return True, None

        url = f"{TELEGRAM_API_BASE}{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                data = resp.json()
                if data.get("ok"):
                    return True, None
                return False, data.get("description", "Failed to send message.")
        except Exception as e:
            return False, str(e)
