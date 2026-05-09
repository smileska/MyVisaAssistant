import json
import re
from dataclasses import dataclass
from typing import Any, Optional

_CYRILLIC_RE = re.compile(r"[\u0400-\u04FF]")
_ISO2_RE = re.compile(r"^[A-Z]{2}$")


@dataclass
class TravelIntent:
    language: str  # "mk" | "en"
    citizenship: Optional[str] = None
    destination: Optional[str] = None
    purpose: Optional[str] = None


def detect_language(text: str) -> str:
    # Lightweight heuristic: if message contains Cyrillic, treat as Macedonian.
    return "mk" if _CYRILLIC_RE.search(text or "") else "en"


def extract_json_object(text: str) -> Optional[dict[str, Any]]:
    """Best-effort JSON object extraction from an LLM output."""
    if not text:
        return None
    try:
        obj = json.loads(text)
        return obj if isinstance(obj, dict) else None
    except Exception:
        pass

    m = re.search(r"\{[\s\S]*}", text)
    if not m:
        return None
    try:
        obj = json.loads(m.group(0))
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None


def intent_followup(lang: str, missing: list[str]) -> str:
    if lang == "mk":
        if "citizenship" in missing and "destination" in missing:
            return "За да проверам виза, кажи ми државјанство и дестинација (пример: 'Македонец за Канада')."
        if "citizenship" in missing:
            return "Кое е твоето државјанство? (пример: Македонија / MK)"
        if "destination" in missing:
            return "Која е дестинацијата/државата каде патуваш? (пример: Канада / CA)"
        return "Можеш ли да појасниш со државјанство и дестинација?"

    if "citizenship" in missing and "destination" in missing:
        return "To check visa requirements, tell me your citizenship and destination (e.g., 'Macedonian to Canada')."
    if "citizenship" in missing:
        return "What is your citizenship? (e.g., North Macedonia / MK)"
    if "destination" in missing:
        return "What is your destination country? (e.g., Canada / CA)"
    return "Could you clarify your citizenship and destination?"


def is_iso2(value: Optional[str]) -> bool:
    if not value:
        return False
    return bool(_ISO2_RE.match(value.strip().upper()))


def iso2_followup(lang: str, field: str) -> str:
    if lang == "mk":
        if field == "citizenship":
            return "Те молам напиши ISO2 код за државјанство (пример: MK, US, DE)."
        if field == "destination":
            return "Те молам напиши ISO2 код за дестинацијата (пример: CA, FR, IT)."
        return "Те молам напиши ISO2 код (пример: MK, US, DE)."

    if field == "citizenship":
        return "Please provide the ISO2 code for your citizenship (e.g., MK, US, DE)."
    if field == "destination":
        return "Please provide the ISO2 code for your destination (e.g., CA, FR, IT)."
    return "Please provide the ISO2 code (e.g., MK, US, DE)."
