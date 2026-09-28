"""
AI-powered endpoints:
  POST /api/ai/generate-description  - write a project description from just a name
  POST /api/ai/suggest-tasks         - suggest a task breakdown for a project

Both call Groq's API (an OpenAI-compatible chat completion API,
running Llama models very fast and with a generous free tier).
Get a free API key at https://console.groq.com and put it in your
.env as GROQ_API_KEY — never hard-code it in source files.
"""

import requests
from flask import Blueprint, request, jsonify, current_app
from app.errors import ApiError
from app.validators import require_fields
from app.auth import login_required

ai_bp = Blueprint("ai", __name__)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def _call_groq(system_prompt, user_prompt, max_tokens=600):
    api_key = current_app.config.get("GROQ_API_KEY")
    if not api_key:
        raise ApiError(
            "AI feature is not configured. Set GROQ_API_KEY in your .env file.",
            503,
        )

    try:
        response = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": current_app.config["GROQ_MODEL"],
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                # gpt-oss models "think" first, and that thinking counts
                # against this limit. "low" keeps it short, and the larger
                # max_tokens leaves room for the actual answer.
                "reasoning_effort": "low",
                "max_tokens": max_tokens,
                "temperature": 0.7,
            },
            timeout=30,
        )
    except requests.exceptions.RequestException as e:
        raise ApiError(f"Could not reach the AI service: {e}", 502)

    if not response.ok:
        # Show Groq's REAL error message (e.g. "model does not exist"),
        # not just a status code, so problems are easy to diagnose.
        try:
            detail = response.json()["error"]["message"]
        except Exception:
            detail = response.text[:200]
        raise ApiError(f"AI service error ({response.status_code}): {detail}", 502)

    text = response.json()["choices"][0]["message"].get("content") or ""
    if not text.strip():
        raise ApiError("The AI returned an empty response. Please try again.", 502)
    return text.strip()


@ai_bp.route("/generate-description", methods=["POST"])
@login_required
def generate_description():
    data = request.get_json(silent=True) or {}
    require_fields(data, ["name"])

    text = _call_groq(
        system_prompt=(
            "You write short, professional software project descriptions. "
            "Respond with ONLY the description, 1-2 sentences, no preamble."
        ),
        user_prompt=f"Write a project description for a project called: {data['name']}",
        max_tokens=500,
    )
    return jsonify({"description": text}), 200


@ai_bp.route("/suggest-tasks", methods=["POST"])
@login_required
def suggest_tasks():
    data = request.get_json(silent=True) or {}
    require_fields(data, ["name"])
    description = data.get("description", "")

    text = _call_groq(
        system_prompt=(
            "You break software projects into concrete starter tasks. "
            "Respond with ONLY a numbered list of 5 short task titles, "
            "one per line, no extra commentary."
        ),
        user_prompt=f"Project: {data['name']}\nDescription: {description}",
        max_tokens=700,
    )

    # Turn the AI's numbered-list text into a clean array the
    # frontend can loop over directly, e.g. ["Set up repo", ...]
    suggestions = []
    for line in text.split("\n"):
        cleaned = line.strip().lstrip("0123456789.-) ").strip()
        if cleaned:
            suggestions.append(cleaned)

    return jsonify({"suggestions": suggestions}), 200
