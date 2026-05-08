from typing import Any
from utils.intent_utils import TravelIntent


def format_visa_reply(
    lang: str,
    intent: TravelIntent,
    passport_code: str,
    destination_code: str,
    visa: Any,
) -> str:
   
    dest_name = getattr(visa.destination, "name", destination_code)
    visa_name = getattr(visa.visa_rule, "name", "")
    duration = getattr(visa.visa_rule, "duration", None)
    embassy_url = getattr(visa.destination, "embassy_url", None)

    purpose_line = ""
    if intent.purpose:
        purpose_line = (
            f"\n• Цел на патување: {intent.purpose}"
            if lang == "mk"
            else f"\n• Purpose: {intent.purpose}"
        )

    if lang == "mk":
        msg = (
            f"🌍 **Визен статус**\n"
            f"Државјанство: `{passport_code}` → Дестинација: **{dest_name}** (`{destination_code}`)\n\n"
            f"• Визен режим: **{visa_name}**"
            + (f"\n• Максимален престој: **{duration}**" if duration else "")
            + purpose_line
        )
        if embassy_url:
            msg += f"\n• Амбасада / инфо: {embassy_url}"
        msg += "\n\n_Ако сакаш, кажи ми и период на патување за дополнителни насоки._"

    else:
        msg = (
            f"🌍 **Visa Status**\n"
            f"Citizenship: `{passport_code}` → Destination: **{dest_name}** (`{destination_code}`)\n\n"
            f"• Visa type: **{visa_name}**"
            + (f"\n• Max stay: **{duration}**" if duration else "")
            + purpose_line
        )
        if embassy_url:
            msg += f"\n• Embassy / info: {embassy_url}"
        msg += "\n\n_Share your travel dates if you'd like extra guidance._"

    return msg