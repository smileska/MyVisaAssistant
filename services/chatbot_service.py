import httpx
import uuid
from typing import Any

from core.config import settings
from services.visa_service import fetch_visa_info
from utils.intent_utils import (
    TravelIntent,
    detect_language,
    extract_json_object,
    intent_followup,
    is_iso2,
    iso2_followup,
)

_sessions: dict[str, list[dict]] = {}

# Per-session extracted context ("slot filling")
_session_state: dict[str, dict[str, Any]] = {}

SYSTEM_PROMPT = (
    "You are MyVisaAssistant, a helpful travel visa expert. "
    "Answer questions about visa requirements, necessary documents, application procedures, "
    "embassy locations, and stay durations. Be concise and accurate. "
    "If you don't know something, say so clearly."
)


async def _hf_generate(prompt: str, max_new_tokens: int, temperature: float, timeout_s: float = 15) -> str:
    if not settings.hugging_face_api_key:
        raise RuntimeError("Hugging Face API key is not configured")

    headers = {"Authorization": f"Bearer {settings.hugging_face_api_key}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_new_tokens,
            "temperature": temperature,
            "return_full_text": True,
        },
    }

    async with httpx.AsyncClient(timeout=timeout_s) as client:
        resp = await client.post(
            f"https://api-inference.huggingface.co/models/{settings.hugging_face_model}",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        result = resp.json()

    # HF text-generation usually returns: [{"generated_text": "..."}]
    if isinstance(result, list) and result and isinstance(result[0], dict) and "generated_text" in result[0]:
        return str(result[0]["generated_text"])
    # Sometimes it returns an error JSON
    if isinstance(result, dict) and "error" in result:
        raise RuntimeError(f"HuggingFace error: {result['error']}")
    raise RuntimeError("Unexpected HuggingFace response format")


async def _extract_travel_intent(message: str, context: list[dict[str, str]]) -> TravelIntent:
    """Extract citizenship/destination/purpose using Mistral as a strict JSON extractor."""
    lang = detect_language(message)
    # Keep context short for speed; only recent user turns
    recent_user_msgs = [t["content"] for t in context[-6:] if t.get("role") == "user"]
    context_block = "\n".join(f"- {m}" for m in recent_user_msgs)

    extractor_prompt = (
        "<s>[INST] "
        "You are an information extraction system for a travel visa assistant. "
        "Extract the user's travel intent from the message and conversation context. "
        "Return ONLY a valid JSON object, no prose, no markdown. "
        "Keys: language (\"mk\" or \"en\"), citizenship, destination, purpose. "
        "Use null if missing. "
        "citizenship and destination should be ISO2 country codes when possible. "
        "If the user wrote a country or nationality name, convert it to ISO2. "
        "purpose is a short string like tourism, business, study, work, transit if present. "
        f"Conversation context (recent user messages):\n{context_block}\n\n"
        f"User message: {message}\n"
        "[/INST]"
    )

    # Use low temperature and small token budget for speed/consistency
    raw = await _hf_generate(extractor_prompt, max_new_tokens=128, temperature=0.0, timeout_s=15)
    obj = extract_json_object(raw)
    if not obj:
        # Fallback: at least return language so followups are localized
        return TravelIntent(language=lang)

    extracted_lang = (obj.get("language") or lang)
    extracted_lang = "mk" if str(extracted_lang).lower().startswith("mk") else "en"
    return TravelIntent(
        language=extracted_lang,
        citizenship=obj.get("citizenship"),
        destination=obj.get("destination"),
        purpose=obj.get("purpose"),
    )


def _format_visa_reply(lang: str, intent: TravelIntent, passport_code: str, destination_code: str, visa: Any) -> str:
    # `visa` is schemas.visa.VisaCheckResponse
    dest_name = getattr(visa.destination, "name", destination_code)
    visa_name = getattr(visa.visa_rule, "name", "")
    duration = getattr(visa.visa_rule, "duration", None)
    embassy_url = getattr(visa.destination, "embassy_url", None)

    purpose_line = ""
    if intent.purpose:
        purpose_line = (
            f"\nЦел на патување: {intent.purpose}" if lang == "mk" else f"\nPurpose: {intent.purpose}"
        )

    if lang == "mk":
        msg = (
            f"За државјанство {passport_code} и дестинација {dest_name} ({destination_code}):\n"
            f"• Визен режим: {visa_name}" + (f"\n• Максимален престој: {duration}" if duration else "") +
            purpose_line
        )
        if embassy_url:
            msg += f"\n• Амбасада/инфо: {embassy_url}"
        msg += "\n\nАко сакаш, кажи ми и период на патување (датуми) за дополнителни насоки."
        return msg

    # English
    msg = (
        f"For citizenship {passport_code} and destination {dest_name} ({destination_code}):\n"
        f"• Visa status: {visa_name}" + (f"\n• Max stay: {duration}" if duration else "") +
        purpose_line
    )
    if embassy_url:
        msg += f"\n• Embassy/info: {embassy_url}"
    msg += "\n\nIf you want, share your travel dates for extra guidance."
    return msg


async def chat(message: str, session_id: str | None) -> tuple[str, str]:
    sid = session_id or str(uuid.uuid4())
    history = _sessions.setdefault(sid, [])

    state = _session_state.setdefault(
        sid,
        {
            "language": None,
            "citizenship_iso2": None,
            "destination_iso2": None,
            "purpose": None,
        },
    )

    history.append({"role": "user", "content": message})

    # 1) Extract intent (bilingual) and update session state
    intent = await _extract_travel_intent(message, history)
    state["language"] = intent.language or state.get("language")

    if intent.citizenship:
        state["citizenship_iso2"] = str(intent.citizenship).strip().upper()
    if intent.destination:
        state["destination_iso2"] = str(intent.destination).strip().upper()
    if intent.purpose:
        state["purpose"] = str(intent.purpose).strip()

    lang = state.get("language") or detect_language(message)
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

    # 2) If missing critical slots, ask a follow-up question (no API call)
    if missing:
        reply = intent_followup(lang, missing)
        history.append({"role": "assistant", "content": reply})
        return reply, sid

    # 2b) Single fallback: if model didn't return ISO2, ask user explicitly
    if not is_iso2(state.get("citizenship_iso2")):
        reply = iso2_followup(lang, "citizenship")
        history.append({"role": "assistant", "content": reply})
        return reply, sid
    if not is_iso2(state.get("destination_iso2")):
        reply = iso2_followup(lang, "destination")
        history.append({"role": "assistant", "content": reply})
        return reply, sid

    # 3) Call external visa API (backend) once we have the required slots
    passport_code = str(state["citizenship_iso2"])
    destination_code = str(state["destination_iso2"])
    visa = await fetch_visa_info(passport_code, destination_code)

    reply = _format_visa_reply(lang, current_intent, passport_code, destination_code, visa)
    history.append({"role": "assistant", "content": reply})
    return reply, sid