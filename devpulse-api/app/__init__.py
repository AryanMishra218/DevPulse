from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.errors import ApiError
from app.extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # CORS ("Cross-Origin Resource Sharing") tells the browser that
    # it's OK for our React app (running on a different port,
    # localhost:5173) to call this API (localhost:5000). Without
    # this, the browser blocks the request for security reasons.
    CORS(app, origins=[app.config["ALLOWED_ORIGIN"]], supports_credentials=True)

    from app import models  # noqa: F401

    with app.app_context():
        db.create_all()

    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.projects import projects_bp
    from app.routes.tasks import tasks_bp
    from app.routes.ai import ai_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(404)
    def handle_404(error):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(405)
    def handle_405(error):
        return jsonify({"error": "Method not allowed on this endpoint."}), 405

    @app.errorhandler(500)
    def handle_500(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error."}), 500

    @app.route("/")
    def index():
        return jsonify(
            {
                "service": "DevPulse API",
                "status": "running",
                "database": app.config["SQLALCHEMY_DATABASE_URI"].split("://")[0],
                "docs": "See README.md for all endpoints.",
            }
        )

    return app
