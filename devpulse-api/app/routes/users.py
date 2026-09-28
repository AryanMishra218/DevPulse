"""
User lookup endpoints (read-only — creating an account happens
through /api/auth/register instead, which also sets a password):
  GET  /api/users        - list all users (used to populate an
                            "assign to" dropdown in the frontend)
  GET  /api/users/<id>   - get one user
"""

from flask import Blueprint, jsonify
from app.models import User
from app.errors import ApiError
from app.auth import login_required

users_bp = Blueprint("users", __name__)


@users_bp.before_request
@login_required
def _require_login():
    pass


@users_bp.route("", methods=["GET"])
def list_users():
    users = User.query.order_by(User.id).all()
    return jsonify([u.to_dict() for u in users]), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise ApiError("User not found.", 404)
    return jsonify(user.to_dict()), 200
