from typing import Any
from .hf_client import hf_generate

SYSTEM_PROMPT = (
    "You are MyVisaAssistant, a helpful travel visa expert. "
    "Answer questions about visa requirements, necessary documents, application procedures, "
    "embassy locations, and stay durations. Be concise and accurate. "
    "If you don't know something, say so clearly."
)


async def answer_general_question(
    message: str,
    lang: str,
    history: list[dict],
    state: dict[str, Any],
) -> str:

    recent = history[-6:]
    if lang == "mk":
        context_block = "\n".join(
            f"{'Корисник' if t['role'] == 'user' else 'Асистент'}: {t['content']}"
            for t in recent
        )
    else:
        context_block = "\n".join(
            f"{'User' if t['role'] == 'user' else 'Assistant'}: {t['content']}"
            for t in recent
        )

    known: list[str] = []
    if state.get("citizenship_iso2"):
        known.append(
            f"Државјанство: {state['citizenship_iso2']}"
            if lang == "mk"
            else f"Citizenship: {state['citizenship_iso2']}"
        )
    if state.get("destination_iso2"):
        known.append(
            f"Дестинација: {state['destination_iso2']}"
            if lang == "mk"
            else f"Destination: {state['destination_iso2']}"
        )
    if state.get("purpose"):
        known.append(
            f"Цел: {state['purpose']}"
            if lang == "mk"
            else f"Purpose: {state['purpose']}"
        )

    known_block = "\n".join(known)

    if lang == "mk":
        prompt = (
            "<s>[INST] "
            f"{SYSTEM_PROMPT}\n\n"
            + (f"Познати информации за корисникот:\n{known_block}\n\n" if known_block else "")
            + f"Историја на разговорот:\n{context_block}\n\n"
            f"Корисник: {message}\n"
            "Одговори на македонски јазик, концизно и точно."
            "[/INST]"
        )
    else:
        prompt = (
            "<s>[INST] "
            f"{SYSTEM_PROMPT}\n\n"
            + (f"Known user context:\n{known_block}\n\n" if known_block else "")
            + f"Conversation history:\n{context_block}\n\n"
            f"User: {message}\n"
            "Answer in English, concisely and accurately."
            "[/INST]"
        )

    return await hf_generate(prompt, max_new_tokens=500, temperature=0.5, timeout_s=25)