from typing import Any
from utils.intent_utils import TravelIntent
from .hf_client import hf_generate
from .formatter import format_visa_reply


async def explain_documents(lang: str, documents: list[str]) -> str:
   
    if not documents:
        return ""

    doc_list = "\n".join(f"- {d}" for d in documents)

    if lang == "mk":
        prompt = (
            "<s>[INST] "
            "Ти си асистент за визи. "
            "За секој документ од листата подолу, дај кратко и едноставно објаснување "
            "(1-2 реченици) на македонски јазик. "
            "Објасни: (1) што е тој документ и (2) зошто е потребен за виза. "
            "Формат — секој документ на нов ред:\n"
            "Име на документот: објаснување\n\n"
            f"Документи:\n{doc_list}\n"
            "[/INST]"
        )
    else:
        prompt = (
            "<s>[INST] "
            "You are a visa assistant. "
            "For each document in the list below, give a short plain-language explanation "
            "(1-2 sentences) in English. "
            "Explain: (1) what the document is and (2) why it is required for the visa. "
            "Format — one document per line:\n"
            "Document name: explanation\n\n"
            f"Documents:\n{doc_list}\n"
            "[/INST]"
        )

    return await hf_generate(prompt, max_new_tokens=400, temperature=0.3, timeout_s=25)


async def format_visa_reply_with_docs(
    lang: str,
    intent: TravelIntent,
    passport_code: str,
    destination_code: str,
    visa: Any,
) -> str:

    reply = format_visa_reply(lang, intent, passport_code, destination_code, visa)

    documents: list[str] = getattr(visa, "required_documents", None) or []

    if documents:
        explained = await explain_documents(lang, documents)
        header = "📄 **Потребни документи**" if lang == "mk" else "📄 **Required Documents**"
        reply += f"\n\n{header}\n{explained}"
    else:
        no_docs = (
            "_Нема конкретна листа на документи за оваа рута._"
            if lang == "mk"
            else "_No specific document list available for this route._"
        )
        reply += f"\n\n{no_docs}"

    return reply