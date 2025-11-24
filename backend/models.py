from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# Association table for user preferences (many-to-many)
user_preferences = Table(
    'user_preferences',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('category_id', Integer, ForeignKey('categories.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    preferred_categories = relationship("Category", secondary=user_preferences, back_populates="users")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    color = Column(String, default="#3f51b5")  # Material blue

    # Relationships
    users = relationship("User", secondary=user_preferences, back_populates="preferred_categories")
    timeslots = relationship("TimeSlot", back_populates="category", cascade="all, delete-orphan")


class TimeSlot(Base):
    __tablename__ = "timeslots"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="timeslots")
    booking = relationship("Booking", back_populates="timeslot", uselist=False, cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    timeslot_id = Column(Integer, ForeignKey("timeslots.id"), unique=True, nullable=False)  # Unique constraint
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booked_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    timeslot = relationship("TimeSlot", back_populates="booking")
    user = relationship("User", back_populates="bookings")
