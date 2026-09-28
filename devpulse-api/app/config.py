"""
Why this file exists:
Every secret (JWT signing key, AI API key, DB credentials) is
read from environment variables — never written directly in code.
"""

import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-insecure-key")
    DEBUG = os.environ.get("FLASK_DEBUG", "true").lower() == "true"

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///" + os.path.join(os.getcwd(), "app.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Used to SIGN authentication tokens. If someone else knew this
    # value, they could forge valid login tokens for any user — so
    # it must be a long random string in production, kept secret.
    JWT_SECRET = os.environ.get("JWT_SECRET", "dev-only-insecure-jwt-secret")

    # Used to call Groq's AI API. Free key from https://console.groq.com
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

    # Which frontend origin is allowed to call this API from a
    # browser. In development, the React dev server runs on 5173.
    ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "http://localhost:5173")
