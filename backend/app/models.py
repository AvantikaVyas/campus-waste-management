from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

def now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="student")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Location(Base):
    __tablename__ = "locations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True)
    building: Mapped[str] = mapped_column(String(160), default="")
    area_type: Mapped[str] = mapped_column(String(80), default="Other")
    latitude: Mapped[float] = mapped_column(Float, default=13.0100)
    longitude: Mapped[float] = mapped_column(Float, default=74.7940)
    active: Mapped[int] = mapped_column(Integer, default=1)

class Dustbin(Base):
    __tablename__ = "dustbins"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    bin_type: Mapped[str] = mapped_column(String(80))
    capacity_litres: Mapped[int] = mapped_column(Integer, default=50)
    status: Mapped[str] = mapped_column(String(40), default="Functional")
    notes: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    location: Mapped[Location] = relationship()

class WasteReport(Base):
    __tablename__ = "waste_reports"
    id: Mapped[int] = mapped_column(primary_key=True)
    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    bin_id: Mapped[int | None] = mapped_column(ForeignKey("dustbins.id"), nullable=True)
    issue_type: Mapped[str] = mapped_column(String(80))
    waste_type: Mapped[str] = mapped_column(String(80))
    bin_type: Mapped[str] = mapped_column(String(80), default="Not applicable")
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(40), default="Submitted")
    priority: Mapped[str] = mapped_column(String(20), default="Normal")
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    resolution_note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    reporter: Mapped[User] = relationship(foreign_keys=[reporter_id])
    assignee: Mapped[User | None] = relationship(foreign_keys=[assigned_to])
    location: Mapped[Location] = relationship()
    bin: Mapped[Dustbin | None] = relationship()

class ReportHistory(Base):
    __tablename__ = "report_history"
    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("waste_reports.id"))
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    old_status: Mapped[str] = mapped_column(String(40))
    new_status: Mapped[str] = mapped_column(String(40))
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
