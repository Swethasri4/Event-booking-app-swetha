from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "#3f51b5"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# TimeSlot Schemas
class TimeSlotBase(BaseModel):
    category_id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

class TimeSlotCreate(TimeSlotBase):
    pass

class TimeSlotUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class BookingInfo(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    booked_at: datetime

    class Config:
        from_attributes = True

class TimeSlot(TimeSlotBase):
    id: int
    created_at: datetime
    created_by: Optional[int]
    category: Category
    booking: Optional[BookingInfo] = None
    is_available: bool = True

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCreate(BaseModel):
    timeslot_id: int

class Booking(BaseModel):
    id: int
    timeslot_id: int
    user_id: int
    booked_at: datetime
    timeslot: TimeSlot

    class Config:
        from_attributes = True

# User Preferences Schema
class UserPreferences(BaseModel):
    category_ids: List[int]

class UserPreferencesResponse(BaseModel):
    categories: List[Category]

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
