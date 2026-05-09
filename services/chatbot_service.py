import uuid
from typing import Any

from huggingface_hub import InferenceClient

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


client = InferenceClient(
    api_key=settings.hugging_face_api_key
)


_sessions: dict[str, list[dict]] = {}

_session_state: dict[str, dict[str, Any]] = {}


def _hf_generate(
    system_prompt: str,
    user_prompt: str,
    max_new_tokens: int,
    temperature: float,
) -> str:

    try:
        completion = client.chat.completions.create(
            model=settings.hugging_face_model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            max_tokens=max_new_tokens,
            temperature=temperature,
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        raise RuntimeError(f"HuggingFace generation failed: {str(e)}")


async def _extract_travel_intent(
    message: str,
    context: list[dict[str, str]],
) -> TravelIntent:

    lang = detect_language(message)

    recent_user_msgs = [
        t["content"]
        for t in context[-6:]
        if t.get("role") == "user"
    ]

    context_block = "\n".join(
        f"- {m}"
        for m in recent_user_msgs
    )

    system_prompt = """
You are an information extraction system for a travel visa assistant.

Extract the user's travel intent.

Return ONLY valid JSON.

Format:
{
  "language": "mk" or "en",
  "citizenship": "...",
  "destination": "...",
  "purpose": "..."
}

Rules:
- use null if missing
- citizenship and destination should be ISO2 country codes when possible
- convert country names to ISO2 codes
- purpose should be short
- no markdown
- no explanation
"""

    user_prompt = f"""
Conversation context:
{context_block}

User message:
{message}
"""

    raw = _hf_generate(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_new_tokens=128,
        temperature=0.0,
    )

    obj = extract_json_object(raw)

    if not obj:
        return TravelIntent(language=lang)

    extracted_lang = obj.get("language") or lang
    extracted_lang = (
        "mk"
        if str(extracted_lang).lower().startswith("mk")
        else "en"
    )

    return TravelIntent(
        language=extracted_lang,
        citizenship=obj.get("citizenship"),
        destination=obj.get("destination"),
        purpose=obj.get("purpose"),
    )


async def generate_personalized_reply(
    lang: str,
    user_message: str,
    intent: TravelIntent,
    visa: Any,
) -> str:

    destination = visa.destination
    visa_rule = visa.visa_rule
    mandatory = visa.mandatory_registration

    response_language = (
        "Macedonian"
        if lang == "mk"
        else "English"
    )

    system_prompt = f"""
You are MyVisaAssistant, an AI travel visa assistant.

Your job is to help users understand visa requirements clearly and accurately.

Rules:
- Always answer in {response_language}
- Be concise but helpful
- Never invent information
- Use ONLY the provided visa information
- Explain things in simple language
- Mention stay duration if available
- Mention required registration if available
- Mention embassy URL if available
- Be friendly and professional
"""

    visa_context = f"""
USER QUESTION:
{user_message}

TRAVEL INFORMATION:

Citizenship: {intent.citizenship}

Destination:
- Name: {destination.name}
- Code: {destination.code}
- Capital: {destination.capital}
- Continent: {destination.continent}

VISA RULE:
- Name: {visa_rule.name}
- Duration: {visa_rule.duration}
- Category: {visa_rule.color}
- Link: {visa_rule.link}

ADDITIONAL INFO:
- Passport validity: {destination.passport_validity}
- Embassy URL: {destination.embassy_url}

MANDATORY REGISTRATION:
- {mandatory.name if mandatory else "None"}

TRAVEL PURPOSE:
- {intent.purpose}
"""

    try:
        completion = client.chat.completions.create(
            model=settings.hugging_face_model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": visa_context,
                },
            ],
            max_tokens=350,
            temperature=0.4,
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        raise RuntimeError(f"Failed to generate personalized reply: {str(e)}")



async def chat(
    message: str,
    session_id: str | None,
) -> tuple[str, str]:

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

    history.append({
        "role": "user",
        "content": message,
    })

    intent = await _extract_travel_intent(
        message,
        history,
    )

    state["language"] = (
        intent.language
        or state.get("language")
    )

    if intent.citizenship:
        state["citizenship_iso2"] = (
            str(intent.citizenship)
            .strip()
            .upper()
        )

    if intent.destination:
        state["destination_iso2"] = (
            str(intent.destination)
            .strip()
            .upper()
        )

    if intent.purpose:
        state["purpose"] = (
            str(intent.purpose)
            .strip()
        )

    lang = (
        state.get("language")
        or detect_language(message)
    )

    current_intent = TravelIntent(
        language=lang,
        citizenship=(
            state.get("citizenship_iso2")
            or intent.citizenship
        ),
        destination=(
            state.get("destination_iso2")
            or intent.destination
        ),
        purpose=(
            state.get("purpose")
            or intent.purpose
        ),
    )

    missing: list[str] = []

    if not state.get("citizenship_iso2"):
        missing.append("citizenship")

    if not state.get("destination_iso2"):
        missing.append("destination")

    if missing:
        reply = intent_followup(lang, missing)

        history.append({
            "role": "assistant",
            "content": reply,
        })

        return reply, sid

    if not is_iso2(state.get("citizenship_iso2")):
        reply = iso2_followup(
            lang,
            "citizenship",
        )

        history.append({
            "role": "assistant",
            "content": reply,
        })

        return reply, sid

    if not is_iso2(state.get("destination_iso2")):
        reply = iso2_followup(
            lang,
            "destination",
        )

        history.append({
            "role": "assistant",
            "content": reply,
        })

        return reply, sid

    passport_code = str(
        state["citizenship_iso2"]
    )

    destination_code = str(
        state["destination_iso2"]
    )

    visa = await fetch_visa_info(
        passport_code,
        destination_code,
    )

    reply = await generate_personalized_reply(
        lang=lang,
        user_message=message,
        intent=current_intent,
        visa=visa,
    )

    history.append({
        "role": "assistant",
        "content": reply,
    })

    return reply, sid