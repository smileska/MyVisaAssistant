import httpx
from core.config import settings


async def hf_generate(
    prompt: str,
    max_new_tokens: int,
    temperature: float,
    timeout_s: float = 20,
) -> str:
    if not settings.hugging_face_api_key:
        raise RuntimeError("Hugging Face API key is not configured")

    headers = {"Authorization": f"Bearer {settings.hugging_face_api_key}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_new_tokens,
            "temperature": temperature,
            "return_full_text": False,  # only new tokens, not the prompt
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

    if isinstance(result, list) and result:
        first = result[0]
        if isinstance(first, dict) and "generated_text" in first:
            return str(first["generated_text"]).strip()

    if isinstance(result, dict) and "error" in result:
        raise RuntimeError(f"HuggingFace error: {result['error']}")

    raise RuntimeError(f"Unexpected HuggingFace response format: {result}")