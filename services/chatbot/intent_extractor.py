from utils.intent_utils import TravelIntent, detect_language, extract_json_object
from .hf_client import hf_generate


async def extract_travel_intent(
    message: str,
    context: list[dict],
) -> TravelIntent:
    
    lang = detect_language(message)

    recent_user_msgs = [t["content"] for t in context[-6:] if t.get("role") == "user"]
    context_block = "\n".join(f"- {m}" for m in recent_user_msgs)

    prompt = (
        "<s>[INST] "
        "You are an information extraction system for a travel visa assistant. "
        "Extract the user's travel intent from the message and conversation context. "
        "Return ONLY a valid JSON object — no prose, no markdown fences. "
        "Keys: language (\"mk\" or \"en\"), citizenship, destination, purpose. "
        "Use null if a value is missing. "
        "citizenship and destination MUST be ISO-3166-1 alpha-2 country codes (e.g. MK, US, DE). "
        "If the user wrote a country or nationality name, convert it to the ISO2 code. "
        "purpose is one of: tourism | business | study | work | transit — or null.\n\n"
        f"Recent conversation context:\n{context_block}\n\n"
        f"Current user message: {message}\n"
        "[/INST]"
    )

    raw = await hf_generate(prompt, max_new_tokens=128, temperature=0.0, timeout_s=15)
    obj = extract_json_object(raw)

    if not obj:
        return TravelIntent(language=lang)

    extracted_lang = str(obj.get("language") or lang).lower()
    extracted_lang = "mk" if extracted_lang.startswith("mk") else "en"

    return TravelIntent(
        language=extracted_lang,
        citizenship=obj.get("citizenship"),
        destination=obj.get("destination"),
        purpose=obj.get("purpose"),
    )