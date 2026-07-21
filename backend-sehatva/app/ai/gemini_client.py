"""
Thin wrapper around the Google Gemini REST API (Generative Language API).

Requires GEMINI_API_KEY to be set in the environment (.env). Get a free key at
https://aistudio.google.com/app/apikey

Docs: https://ai.google.dev/api/generate-content
"""
import base64
import json
from typing import Any, Optional
import httpx

from app.core.config import settings
from json_repair import repair_json

class GeminiNotConfiguredError(Exception):
    """Raised when GEMINI_API_KEY is missing so callers can return a clean 503."""


class GeminiRequestError(Exception):
    """Raised when the Gemini API call itself fails."""


GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


def _require_key() -> str:
    if not settings.GEMINI_API_KEY:
        raise GeminiNotConfiguredError(
            "GEMINI_API_KEY is not set. Add it to backend/.env to enable AI features."
        )
    return settings.GEMINI_API_KEY


async def generate_json(
    prompt: str,
    *,
    system_instruction: Optional[str] = None,
    inline_file: Optional[tuple[bytes, str]] = None,  # (raw_bytes, mime_type)
    model: Optional[str] = None,
    timeout: float = 60.0,
) -> dict[str, Any]:
    """
    Calls Gemini asking for a strict JSON response and returns the parsed dict.
    Raises GeminiNotConfiguredError / GeminiRequestError on failure so callers
    can decide how to degrade gracefully.
    """
    api_key = _require_key()
    model_name = model or settings.GEMINI_MODEL
    url = f"{GEMINI_BASE_URL}/{model_name}:generateContent?key={api_key}"

    parts: list[dict[str, Any]] = [{"text": prompt}]
    if inline_file:
        raw_bytes, mime_type = inline_file
        parts.append(
            {
                "inline_data": {
                    "mime_type": mime_type,
                    "data": base64.b64encode(raw_bytes).decode("utf-8"),
                }
            }
        )

    body: dict[str, Any] = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "temperature": 0.4,
            "responseMimeType": "application/json",
        },
    }
    if system_instruction:
        body["systemInstruction"] = {"role": "system", "parts": [{"text": system_instruction}]}

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(url, json=body)
        except httpx.HTTPError as exc:
            raise GeminiRequestError(f"Failed to reach Gemini API: {exc}") from exc

    if response.status_code != 200:
        raise GeminiRequestError(f"Gemini API error {response.status_code}: {response.text}")

    data = response.json()
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise GeminiRequestError(f"Unexpected Gemini response shape: {data}") from exc


async def generate_text(
    prompt: str,
    *,
    system_instruction: Optional[str] = None,
    history: Optional[list[dict[str, str]]] = None,
    model: Optional[str] = None,
    timeout: float = 60.0,
) -> str:
    """Plain-text chat completion, optionally with prior turns as history."""
    api_key = _require_key()
    model_name = model or settings.GEMINI_MODEL
    url = f"{GEMINI_BASE_URL}/{model_name}:generateContent?key={api_key}"

    contents: list[dict[str, Any]] = []
    for turn in history or []:
        role = "model" if turn.get("role") == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": turn.get("message", "")}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    body: dict[str, Any] = {"contents": contents, "generationConfig": {"temperature": 0.6}}
    if system_instruction:
        body["systemInstruction"] = {"role": "system", "parts": [{"text": system_instruction}]}

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(url, json=body)
        except httpx.HTTPError as exc:
            raise GeminiRequestError(f"Failed to reach Gemini API: {exc}") from exc

    if response.status_code != 200:
        raise GeminiRequestError(f"Gemini API error {response.status_code}: {response.text}")

    data = response.json()
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise GeminiRequestError(f"Unexpected Gemini response shape: {data}") from exc

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Gemini occasionally stutters/duplicates the tail of its output, which breaks
        # strict JSON parsing. json_repair fixes these malformed-but-recoverable cases.
        try:
            return json.loads(repair_json(text))
        except Exception as exc:
            raise GeminiRequestError(f"Could not parse Gemini JSON output: {text}") from exc
