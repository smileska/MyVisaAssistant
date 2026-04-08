import httpx
import uuid
from core.config import settings

_sessions: dict[str, list[dict]] = {}

SYSTEM_PROMPT = (
    "You are MyVisaAssistant, a helpful travel visa expert. "
    "Answer questions about visa requirements, necessary documents, application procedures, "
    "embassy locations, and stay durations. Be concise and accurate. "
    "If you don't know something, say so clearly."
)


async def chat(message: str, session_id: str | None) -> tuple[str, str]:
    sid = session_id or str(uuid.uuid4())
    history = _sessions.setdefault(sid, [])

    history.append({"role": "user", "content": message})

    prompt = f"<s>[INST] {SYSTEM_PROMPT} [/INST]</s>"
    for turn in history[-10:]:
        if turn["role"] == "user":
            prompt += f"[INST] {turn['content']} [/INST]"
        else:
            prompt += f" {turn['content']} </s>"

    headers = {"Authorization": f"Bearer {settings.hugging_face_api_key}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 512, "temperature": 0.7},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"https://api-inference.huggingface.co/models/{settings.hugging_face_model}",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        result = resp.json()

    reply = result[0]["generated_text"].split("[/INST]")[-1].strip()
    history.append({"role": "assistant", "content": reply})
    _sessions[sid] = history

    return reply, sid