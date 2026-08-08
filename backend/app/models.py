from sqlalchemy import Column, String, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    email = Column(String)
    image = Column(String)
    college = Column(String, nullable=True)
    dob = Column(DateTime, nullable=True)
    summary = Column(String, nullable=True)

class Platform(Base):
    __tablename__ = "platforms"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    base_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserPlatform(Base):
    __tablename__ = "user_platforms"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform_id = Column(UUID(as_uuid=True), ForeignKey("platforms.id", ondelete="CASCADE"), nullable=False)
    handle = Column(String, nullable=False)
    auth_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    platform = relationship("Platform")

class Problem(Base):
    __tablename__ = "problems"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform_id = Column(UUID(as_uuid=True), ForeignKey("platforms.id", ondelete="CASCADE"), nullable=False)
    platform_problem_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    difficulty = Column(String)
    url = Column(String)
    tags = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    platform = relationship("Platform")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False)
    language = Column(String)
    submitted_at = Column(DateTime, nullable=False)
    runtime_ms = Column(Integer)
    memory_kb = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem")

