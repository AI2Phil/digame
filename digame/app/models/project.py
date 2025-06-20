import sqlalchemy
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, index=True)
    name = sqlalchemy.Column(sqlalchemy.String, index=True)
    description = sqlalchemy.Column(sqlalchemy.String)
    required_skills = sqlalchemy.Column(sqlalchemy.JSON)  # Store as a list of strings
    created_at = sqlalchemy.Column(sqlalchemy.DateTime(timezone=True), server_default=sqlalchemy.func.now())
    owner_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'))  # Assuming a User model in digame/app/models/user.py with a table named users
    owner = relationship("User")
