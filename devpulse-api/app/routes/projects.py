"""
Project endpoints:
  POST   /api/projects        - create a project
  GET    /api/projects        - list all projects
  GET    /api/projects/<id>   - get one project (with task stats)
  PUT    /api/projects/<id>   - edit a project (owner only)
  DELETE /api/projects/<id>   - delete a project (owner only)
"""

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Project, User
from app.errors import ApiError
from app.validators import require_fields
from app.auth import login_required

projects_bp = Blueprint("projects", __name__)


@projects_bp.before_request
@login_required
def _require_login():
    # Runs before EVERY route in this blueprint. Simpler than
    # adding @login_required above each function individually,
    # and impossible to forget on a new route later.
    pass


@projects_bp.route("", methods=["POST"])
def create_project():
    data = request.get_json(silent=True) or {}
    require_fields(data, ["name"])

    # The project's owner is always the logged-in user making the
    # request — never trust a client-supplied owner_id for this.
    project = Project(
        name=data["name"].strip(),
        description=data.get("description", "").strip(),
        owner_id=request.user_id,
    )
    db.session.add(project)
    db.session.commit()

    return jsonify(project.to_dict()), 201


@projects_bp.route("", methods=["GET"])
def list_projects():
    projects = Project.query.order_by(Project.id).all()
    return jsonify([p.to_dict() for p in projects]), 200


@projects_bp.route("/<int:project_id>", methods=["GET"])
def get_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        raise ApiError("Project not found.", 404)

    # project.tasks works because of the `relationship()` we
    # defined in the Task model — SQLAlchemy runs the JOIN query
    # for us automatically the first time we access it.
    result = project.to_dict()
    result["task_count"] = len(project.tasks)
    result["tasks_done"] = sum(1 for t in project.tasks if t.status == "done")
    return jsonify(result), 200


@projects_bp.route("/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        raise ApiError("Project not found.", 404)

    # Only the owner can edit their own project — a basic but
    # essential authorization check beyond just "are you logged in".
    if project.owner_id != request.user_id:
        raise ApiError("You do not have permission to edit this project.", 403)

    data = request.get_json(silent=True) or {}
    if "name" in data:
        if not str(data["name"]).strip():
            raise ApiError("name cannot be empty.", 400)
        project.name = data["name"].strip()
    if "description" in data:
        project.description = data["description"].strip()

    db.session.commit()
    return jsonify(project.to_dict()), 200


@projects_bp.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        raise ApiError("Project not found.", 404)

    if project.owner_id != request.user_id:
        raise ApiError("You do not have permission to delete this project.", 403)

    db.session.delete(project)  # cascades and deletes its tasks too
    db.session.commit()
    return "", 204
