"""
Why this file exists:
A JWT ("JSON Web Token") is how a stateless API remembers who
you are between requests, without storing sessions on the server.

The flow is:
1. You POST your email+password to /api/auth/login
2. The server checks them, then creates a signed token containing
   your user id and an expiry time
3. Your browser (or, later, our React app) stores that token and
   sends it back on every future request in a header:
   Authorization: Bearer <token>
4. `login_required` below reads that header, verifies the token's
   signature (proving it wasn't tampered with) and expiry, and
   attaches the user's id to `request.user_id` for the route to use
"""

import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, current_app
from app.errors import ApiError

TOKEN_EXPIRY_HOURS = 24


def encode_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def decode_token(token):
    try:
        payload = jwt.decode(
            token, current_app.config["JWT_SECRET"], algorithms=["HS256"]
        )
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise ApiError("Token has expired. Please log in again.", 401)
    except jwt.InvalidTokenError:
        raise ApiError("Invalid authentication token.", 401)


def login_required(view_func):
    """
    A "decorator" — wraps a route function to run a check BEFORE
    the route's own code runs. Put @login_required above any
    route and it will reject the request with 401 unless a valid
    token was sent.
    """

    @wraps(view_func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise ApiError("Missing or malformed Authorization header.", 401)

        token = auth_header.split(" ", 1)[1]
        request.user_id = decode_token(token)
        return view_func(*args, **kwargs)

    return wrapper
