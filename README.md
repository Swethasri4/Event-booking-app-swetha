# Event Booking Application

A full-stack web application for booking events from pre-defined calendar slots. Built with **Angular 17** (frontend) and **FastAPI** (backend).

## Features

### User Features
- ✅ Select event category preferences (Cat 1, Cat 2, Cat 3)
- ✅ View weekly calendar with available time slots
- ✅ Filter events by category
- ✅ Sign up for available time slots
- ✅ Unsubscribe from booked events
- ✅ Navigate between weeks

### Admin Features
- ✅ Create time slots for event categories
- ✅ View all time slots with booking status
- ✅ Edit and delete time slots
- ✅ See which users booked which slots

### Technical Features
- ✅ One user per time slot enforcement
- ✅ Real-time booking status updates
- ✅ RESTful API with FastAPI
- ✅ Modern Angular with Material Design
- ✅ Responsive UI design
- ✅ SQLite database (easily switchable to PostgreSQL/MySQL)

## Project Structure

```
book_proj/
├── backend/              # FastAPI backend
│   ├── main.py          # API routes and application entry point
│   ├── models.py        # SQLAlchemy database models
│   ├── schemas.py       # Pydantic validation schemas
│   ├── database.py      # Database configuration
│   ├── requirements.txt # Python dependencies
│   ├── .env.example     # Environment variables template
│   └── README.md        # Backend documentation
│
└── frontend/            # Angular frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/  # UI components
    │   │   ├── services/    # API and state services
    │   │   ├── models/      # TypeScript interfaces
    │   │   └── app.module.ts
    │   └── ...
    ├── package.json
    ├── angular.json
    └── README.md        # Frontend documentation
```

## Prerequisites

### Backend Requirements
- Python 3.8 or higher
- pip (Python package manager)

### Frontend Requirements
- Node.js 18.x or higher
- npm (comes with Node.js)
- Angular CLI 17

## Quick Start Guide

### Step 1: Set Up Backend

1. **Navigate to backend directory:**
```powershell
cd backend
```

2. **Create virtual environment:**
```powershell
python -m venv venv
```

3. **Activate virtual environment:**
```powershell
.\venv\Scripts\activate
```

4. **Install dependencies:**
```powershell
pip install -r requirements.txt
```

5. **Create environment file:**
```powershell
copy .env.example .env
```

6. **Run the backend server:**
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Backend is now running at:** http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

---

### Step 2: Set Up Frontend

1. **Open a NEW terminal** (keep backend running in the first terminal)

2. **Navigate to frontend directory:**
```powershell
cd frontend
```

3. **Install dependencies:**
```powershell
npm install
```

4. **Run the development server:**
```powershell
npm start
# or
ng serve
```

✅ **Frontend is now running at:** http://localhost:4200

---

## Running the Complete Application

### Both Services Running:
1. **Terminal 1 (Backend):** `cd backend` → `.\venv\Scripts\activate` → `uvicorn main:app --reload`
2. **Terminal 2 (Frontend):** `cd frontend` → `npm start`
3. **Open Browser:** http://localhost:4200

### Default Test Users
The backend automatically creates test users on first startup:
- **Regular User:** username: `user1`, email: `user1@example.com`
- **Admin User:** username: `admin`, email: `admin@example.com`

### Default Categories
- Cat 1
- Cat 2
- Cat 3

## Using the Application

### As a Regular User:

1. **Set Preferences:**
   - Navigate to "Preferences" tab
   - Select your interested event categories
   - Categories persist for your session

2. **View Calendar:**
   - Main calendar view shows weekly time slots
   - Use arrows to navigate between weeks
   - Filter by category using dropdown
   - Only categories from your preferences show by default

3. **Book Events:**
   - Click "Sign Up" button on available slots
   - Booked slots show "Booked by you" with "Unsubscribe" button
   - Slots booked by others show "Already Booked"

### As an Admin:

1. **Navigate to Admin Panel:**
   - Click "Admin" tab in navigation

2. **Create Time Slots:**
   - Fill in the form: Title, Category, Start Time, End Time, Description
   - Click "Create Time Slot"

3. **Manage Time Slots:**
   - View all time slots in the table
   - See booking status and user information
   - Edit or delete time slots as needed

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get user with preferences
- `POST /api/users` - Create new user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Time Slots
- `GET /api/timeslots` - Get time slots (supports filtering)
- `POST /api/timeslots` - Create time slot
- `PUT /api/timeslots/{id}` - Update time slot
- `DELETE /api/timeslots/{id}` - Delete time slot

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/{id}` - Delete booking
- `DELETE /api/timeslots/{id}/booking` - Delete booking by timeslot

### User Preferences
- `GET /api/users/{user_id}/preferences` - Get preferences
- `POST /api/users/{user_id}/preferences` - Update preferences

## Building for Production

### Backend
```powershell
cd backend
# Production server with Gunicorn (install: pip install gunicorn)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```powershell
cd frontend
npm run build
# Output will be in dist/ folder
# Serve with any static file server
```

## Development Notes

### Code Quality
- **Backend:**
  - Type hints throughout
  - Pydantic validation
  - SQLAlchemy ORM for type-safe database operations
  - Proper error handling with HTTP status codes
  - RESTful API design

- **Frontend:**
  - TypeScript strict mode
  - Angular Material for consistent UI
  - Reactive programming with RxJS
  - Service-based architecture
  - Component-based design

### Database
- Default: SQLite (file-based, no setup required)
- Production: Change `DATABASE_URL` in `.env` to PostgreSQL/MySQL

Example PostgreSQL:
```
DATABASE_URL=postgresql://user:password@localhost/event_booking
```

### CORS Configuration
Backend is configured to accept requests from `http://localhost:4200` by default. To add more origins, edit `.env`:
```
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
```

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```powershell
uvicorn main:app --reload --port 8001
```
Update frontend API URL in `src/environments/environment.ts`

**Database locked:**
Close all connections and restart, or delete `event_booking.db` to start fresh

**Import errors:**
Make sure virtual environment is activated: `.\venv\Scripts\activate`

### Frontend Issues

**Port 4200 already in use:**
```powershell
ng serve --port 4201
```

**Module not found errors:**
```powershell
rm -rf node_modules
npm install
```

**API connection errors:**
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Verify `apiUrl` in `src/environments/environment.ts`

## Testing

### Backend
The API documentation at http://localhost:8000/docs provides an interactive testing interface.

### Frontend
```powershell
cd frontend
npm test
```

## Technology Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation using Python type hints
- **Uvicorn**: ASGI server
- **SQLite**: Lightweight database (production-ready alternatives available)

### Frontend
- **Angular 17**: Modern web application framework
- **Angular Material**: Material Design components
- **RxJS**: Reactive programming library
- **TypeScript**: Type-safe JavaScript

## License

This project is created as a demonstration of full-stack development best practices.

## Support

For issues or questions:
1. Check the API documentation: http://localhost:8000/docs
2. Review backend logs in the terminal
3. Check browser console for frontend errors
4. Verify both services are running on correct ports
