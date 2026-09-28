from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    # We NEVER store the real password — only a one-way hash of it.
    # Even if the database leaked, no one could read actual passwords.
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    projects = db.relationship("Project", backref="owner", lazy=True)
    tasks_assigned = db.relationship(
        "Task", backref="assignee", lazy=True, foreign_keys="Task.assignee_id"
    )

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        # Deliberately excludes password_hash — this is what gets
        # sent back to the frontend, and a password hash should
        # never leave the server.
        return {"id": self.id, "name": self.name, "email": self.email}
