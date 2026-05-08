import uuid
from typing import Any

from services.visa_service import fetch_visa_info
from utils.intent_utils import (
    TravelIntent,
    detect_language,
    intent_followup,
    is_iso2,
    iso2_followup,
)
from .chatbot.intent_extractor import extract_travel_intent
from .chatbot.doc_explainer import format_visa_reply_with_docs
from .chatbot.qa_handler import answer_general_question


_sessions: dict[str, list[dict]] = {}
_session_state: dict[str, dict[str, Any]] = {}

# Keywords that trigger general free-form Q&A (4.4)
_GENERAL_KEYWORDS = [
    "how", "when", "where", "why", "can i", "should",
    "embassy", "амбасада", "процедура", "procedure",
    "apply", "аплицира", "апликација", "application",
    "cost", "fee", "цена", "такса", "колку", "time",
]


async def chat(message: str, session_id: str | None) -> tuple[str, str]:

    sid = session_id or str(uuid.uuid4())
    history: list[dict] = _sessions.setdefault(sid, [])
    state: dict[str, Any] = _session_state.setdefault(
        sid,
        {
            "language": None,
            "citizenship_iso2": None,
            "destination_iso2": None,
            "purpose": None,
        },
    )

    history.append({"role": "user", "content": message})

    intent = await extract_travel_intent(message, history)

    if intent.language:
        state["language"] = intent.language
    if intent.citizenship:
        state["citizenship_iso2"] = str(intent.citizenship).strip().upper()
    if intent.destination:
        state["destination_iso2"] = str(intent.destination).strip().upper()
    if intent.purpose:
        state["purpose"] = str(intent.purpose).strip()

    lang: str = state.get("language") or detect_language(message)

    current_intent = TravelIntent(
        language=lang,
        citizenship=state.get("citizenship_iso2") or intent.citizenship,
        destination=state.get("destination_iso2") or intent.destination,
        purpose=state.get("purpose") or intent.purpose,
    )

    missing: list[str] = []
    if not state.get("citizenship_iso2"):
        missing.append("citizenship")
    if not state.get("destination_iso2"):
        missing.append("destination")

    if missing:
        reply = intent_followup(lang, missing)
        history.append({"role": "assistant", "content": reply})
        return reply, sid

    if not is_iso2(state.get("citizenship_iso2")):
        reply = iso2_followup(lang, "citizenship")
        history.append({"role": "assistant", "content": reply})
        return reply, sid

    if not is_iso2(state.get("destination_iso2")):
        reply = iso2_followup(lang, "destination")
        history.append({"role": "assistant", "content": reply})
        return reply, sid

    passport_code = str(state["citizenship_iso2"])
    destination_code = str(state["destination_iso2"])


    lower = message.lower()

    if any(kw in lower for kw in _GENERAL_KEYWORDS):

        reply = await answer_general_question(message, lang, history, state)
    else:

        visa = await fetch_visa_info(passport_code, destination_code)
        reply = await format_visa_reply_with_docs(
            lang, current_intent, passport_code, destination_code, visa
        )

    history.append({"role": "assistant", "content": reply})
    return reply, sid