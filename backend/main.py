from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

import models
import schemas
from database import engine, get_db
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
    get_current_admin_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Event Booking API",
    description="API for booking events from pre-defined calendar slots",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Authentication Routes ====================

@app.post("/api/auth/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=schemas.User)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


# ==================== Category Routes ====================

@app.get("/api/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    """Get all event categories"""
    categories = db.query(models.Category).all()
    return categories


@app.post("/api/categories", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create a new category (Admin only)"""
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


# ==================== User Preferences Routes ====================

@app.get("/api/user/preferences", response_model=schemas.UserPreferencesResponse)
def get_user_preferences(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's preferred categories"""
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    return {"categories": user.preferred_categories}


@app.put("/api/user/preferences", response_model=schemas.UserPreferencesResponse)
def update_user_preferences(
    preferences: schemas.UserPreferences,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's preferred categories"""
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    
    # Clear existing preferences
    user.preferred_categories = []
    
    # Add new preferences
    for category_id in preferences.category_ids:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if category:
            user.preferred_categories.append(category)
    
    db.commit()
    db.refresh(user)
    return {"categories": user.preferred_categories}


# ==================== TimeSlot Routes ====================

@app.get("/api/timeslots", response_model=List[schemas.TimeSlot])
def get_timeslots(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category_ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get timeslots with optional filters
    - start_date: Filter by start date
    - end_date: Filter by end date
    - category_ids: Comma-separated category IDs (e.g., "1,2,3")
    """
    query = db.query(models.TimeSlot)
    
    if start_date:
        query = query.filter(models.TimeSlot.start_time >= start_date)
    if end_date:
        query = query.filter(models.TimeSlot.start_time <= end_date)
    if category_ids:
        cat_ids = [int(x) for x in category_ids.split(",")]
        query = query.filter(models.TimeSlot.category_id.in_(cat_ids))
    
    timeslots = query.order_by(models.TimeSlot.start_time).all()
    
    # Add booking info and availability
    result = []
    for slot in timeslots:
        slot_dict = {
            "id": slot.id,
            "category_id": slot.category_id,
            "title": slot.title,
            "description": slot.description,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "created_at": slot.created_at,
            "created_by": slot.created_by,
            "category": slot.category,
            "booking": None,
            "is_available": True
        }
        
        if slot.booking:
            slot_dict["is_available"] = False
            slot_dict["booking"] = {
                "id": slot.booking.id,
                "user_id": slot.booking.user_id,
                "user_name": slot.booking.user.name,
                "user_email": slot.booking.user.email,
                "booked_at": slot.booking.booked_at
            }
        
        result.append(slot_dict)
    
    return result


@app.post("/api/timeslots", response_model=schemas.TimeSlot, status_code=status.HTTP_201_CREATED)
def create_timeslot(
    timeslot: schemas.TimeSlotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create a new timeslot (Admin only)"""
    # Validate category exists
    category = db.query(models.Category).filter(models.Category.id == timeslot.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Validate time range
    if timeslot.end_time <= timeslot.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")
    
    db_timeslot = models.TimeSlot(
        **timeslot.dict(),
        created_by=current_user.id
    )
    db.add(db_timeslot)
    db.commit()
    db.refresh(db_timeslot)
    
    return {
        **timeslot.dict(),
        "id": db_timeslot.id,
        "created_at": db_timeslot.created_at,
        "created_by": db_timeslot.created_by,
        "category": category,
        "booking": None,
        "is_available": True
    }


@app.delete("/api/timeslots/{timeslot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeslot(
    timeslot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Delete a timeslot (Admin only)"""
    timeslot = db.query(models.TimeSlot).filter(models.TimeSlot.id == timeslot_id).first()
    if not timeslot:
        raise HTTPException(status_code=404, detail="Timeslot not found")
    
    db.delete(timeslot)
    db.commit()
    return None


# ==================== Booking Routes ====================

@app.get("/api/bookings", response_model=List[schemas.Booking])
def get_user_bookings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's bookings"""
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).all()
    return bookings


@app.post("/api/bookings", response_model=schemas.Booking, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Book a timeslot"""
    # Check if timeslot exists
    timeslot = db.query(models.TimeSlot).filter(
        models.TimeSlot.id == booking.timeslot_id
    ).first()
    if not timeslot:
        raise HTTPException(status_code=404, detail="Timeslot not found")
    
    # Check if already booked
    existing_booking = db.query(models.Booking).filter(
        models.Booking.timeslot_id == booking.timeslot_id
    ).first()
    if existing_booking:
        raise HTTPException(status_code=409, detail="Timeslot already booked")
    
    # Create booking
    db_booking = models.Booking(
        timeslot_id=booking.timeslot_id,
        user_id=current_user.id
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@app.delete("/api/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    return None


# ==================== Seed Data (Development) ====================

@app.post("/api/seed", status_code=status.HTTP_201_CREATED)
def seed_database(db: Session = Depends(get_db)):
    """Seed database with initial data (Development only)"""
    # Check if already seeded
    if db.query(models.Category).count() > 0:
        return {"message": "Database already seeded"}
    
    # Create categories
    categories = [
        models.Category(name="Cat 1", description="Category 1 Events", color="#3f51b5"),
        models.Category(name="Cat 2", description="Category 2 Events", color="#4caf50"),
        models.Category(name="Cat 3", description="Category 3 Events", color="#ff9800"),
    ]
    db.add_all(categories)
    db.commit()
    
    # Create admin user
    admin = models.User(
        email="admin@example.com",
        name="Admin User",
        hashed_password=get_password_hash("admin123"),
        is_admin=True
    )
    db.add(admin)
    db.commit()
    
    # Create regular user
    user = models.User(
        email="user@example.com",
        name="Regular User",
        hashed_password=get_password_hash("user123"),
        is_admin=False
    )
    db.add(user)
    db.commit()
    
    return {
        "message": "Database seeded successfully",
        "admin": {"email": "admin@example.com", "password": "admin123"},
        "user": {"email": "user@example.com", "password": "user123"}
    }


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Event Booking API",
        "docs": "/docs",
        "version": "1.0.0"
    }
