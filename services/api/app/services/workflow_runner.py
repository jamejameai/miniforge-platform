import time
from typing import Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.workflow import Workflow, WorkflowExecution
from app.models.telegram import TelegramBot
from app.core.security import decrypt_secret
from app.services.telegram_service import TelegramService

class WorkflowRunner:
    @staticmethod
    def evaluate_condition(condition: Dict[str, Any], payload: Dict[str, Any]) -> bool:
        field = condition.get("field", "")
        operator = condition.get("operator", "equals")
        target_val = condition.get("value")

        actual_val = payload.get(field)

        if operator == "equals":
            return str(actual_val) == str(target_val)
        elif operator == "not_equals":
            return str(actual_val) != str(target_val)
        elif operator == "greater_than":
            try:
                return float(actual_val) > float(target_val)
            except (ValueError, TypeError):
                return False
        elif operator == "less_than":
            try:
                return float(actual_val) < float(target_val)
            except (ValueError, TypeError):
                return False
        elif operator == "contains":
            return str(target_val).lower() in str(actual_val).lower()
        elif operator == "is_empty":
            return actual_val is None or actual_val == ""
        return False

    @classmethod
    async def execute_workflow(
        cls,
        db: AsyncSession,
        workflow: Workflow,
        trigger_payload: Dict[str, Any]
    ) -> WorkflowExecution:
        start_time = time.time()
        logs: List[str] = [f"Workflow '{workflow.name}' triggered."]
        actions_executed = 0
        error_msg = ""
        status = "SUCCESS"

        try:
            # 1. Evaluate conditions
            conditions = workflow.conditions or []
            passed_conditions = True
            for cond in conditions:
                matched = cls.evaluate_condition(cond, trigger_payload)
                logs.append(f"Condition '{cond.get('field')} {cond.get('operator')} {cond.get('value')}': {'Passed' if matched else 'Failed'}")
                if not matched:
                    passed_conditions = False
                    break

            if not passed_conditions:
                status = "SKIPPED"
                logs.append("Workflow conditions not met. Execution skipped.")
            else:
                # 2. Execute actions
                actions = workflow.actions or []
                for action in actions:
                    act_type = action.get("type")
                    params = action.get("params", {})
                    logs.append(f"Executing action: {act_type}")

                    if act_type == "TELEGRAM_NOTIFICATION":
                        # Fetch bot token
                        bot_stmt = select(TelegramBot).where(
                            TelegramBot.app_id == workflow.app_id,
                            TelegramBot.tenant_id == workflow.tenant_id
                        )
                        bot_res = await db.execute(bot_stmt)
                        bot = bot_res.scalar_one_or_none()

                        msg_template = params.get("message", "MiniForge Notification")
                        # Format template variables
                        for k, v in trigger_payload.items():
                            msg_template = msg_template.replace(f"{{{{{k}}}}}", str(v))

                        chat_id = params.get("chat_id") or trigger_payload.get("customer_telegram_id")
                        if bot and bot.encrypted_bot_token and chat_id:
                            decrypted_token = decrypt_secret(bot.encrypted_bot_token)
                            ok, err = await TelegramService.send_message(decrypted_token, str(chat_id), msg_template)
                            if ok:
                                logs.append(f"Telegram message sent to {chat_id}.")
                            else:
                                logs.append(f"Telegram send failed: {err}")
                        else:
                            logs.append("Telegram notification skipped: Bot not configured or no recipient chat_id.")

                    actions_executed += 1

        except Exception as e:
            status = "FAILED"
            error_msg = str(e)
            logs.append(f"Execution failed with error: {error_msg}")

        duration_ms = int((time.time() - start_time) * 1000)

        execution = WorkflowExecution(
            tenant_id=workflow.tenant_id,
            workflow_id=workflow.id,
            status=status,
            trigger_payload=trigger_payload,
            execution_logs=logs,
            error_message=error_msg,
            duration_ms=duration_ms
        )
        db.add(execution)
        await db.commit()
        await db.refresh(execution)
        return execution

