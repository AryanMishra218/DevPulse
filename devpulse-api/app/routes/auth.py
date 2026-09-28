"""
Auth endpoints:
  POST /api/auth/register  - create an account
  POST /api/auth/login     - exchange email+password for a token
  GET  /api/auth/me        - return the currently logged-in user (protected)
"""

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User
from app.errors import ApiError
from app.validators import require_fields, validate_email
from app.auth import encode_token, login_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    require_fields(data, ["name", "email", "password"])
    validate_email(data["email"])

    if len(data["password"]) < 6:
        raise ApiError("Password must be at least 6 characters.", 400)

    email = data["email"].strip()
    if User.query.filter_by(email=email).first():
        raise ApiError("A user with this email already exists.", 409)

    user = User(name=data["name"].strip(), email=email)
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    token = encode_token(user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    require_fields(data, ["email", "password"])

    user = User.query.filter_by(email=data["email"].strip()).first()

    # Deliberately the SAME error message whether the email doesn't
    # exist or the password is wrong. If we said "email not found"
    # vs "wrong password" separately, an attacker could use that to
    # figure out which emails are registered. This is a real
    # security practice, not just tidiness.
    if not user or not user.check_password(data["password"]):
        raise ApiError("Invalid email or password.", 401)

    token = encode_token(user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    user = User.query.get(request.user_id)
    if not user:
        raise ApiError("User not found.", 404)
    return jsonify(user.to_dict()), 200
