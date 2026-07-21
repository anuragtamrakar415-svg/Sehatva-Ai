from sqlalchemy.orm import Session

from app.ai.gemini_client import GeminiNotConfiguredError, GeminiRequestError, generate_text
from app.ai.prompts import HEALTH_ASSISTANT_SYSTEM
from app.models.chat import ChatMessage

NOT_CONFIGURED_REPLY = (
    "The AI health assistant isn't configured yet (missing GEMINI_API_KEY on the "
    "backend), so I can't chat right now. In general: take medicines on schedule, "
    "stay hydrated, follow your recovery roadmap, and contact your doctor for any "
    "diagnosis-related questions or emergencies."
)

TEMPORARILY_UNAVAILABLE_REPLY = (
    "The AI health assistant is temporarily unavailable right now (it may be busy or "
    "rate-limited) — please try again in a little while. In general: take medicines on "
    "schedule, stay hydrated, follow your recovery roadmap, and contact your doctor for "
    "any diagnosis-related questions or emergencies."
)


async def send_chat_message(db: Session, user_id: str, message: str) -> str:
    history_rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    history = [{"role": m.role, "message": m.message} for m in reversed(history_rows)]

    db.add(ChatMessage(user_id=user_id, role="user", message=message))

    try:
        reply = await generate_text(message, system_instruction=HEALTH_ASSISTANT_SYSTEM, history=history)
    except GeminiNotConfiguredError:
        reply = NOT_CONFIGURED_REPLY
    except GeminiRequestError as exc:
        print("🔴 CHAT GEMINI ERROR:", repr(exc))
        reply = TEMPORARILY_UNAVAILABLE_REPLY

    db.add(ChatMessage(user_id=user_id, role="assistant", message=reply))
    db.commit()
    return reply