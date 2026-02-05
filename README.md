# Intelligent Academic Management System (IAMS)

A comprehensive full-stack academic management platform combining LMS features with assignment integrity monitoring and learning analytics.

## 🎯 Project Overview

This system provides:
- **Canvas-like LMS**: Complete assignment and resource management
- **Behavior Analytics**: Real-time tracking of typing vs copy-paste patterns
- **Learning Analytics**: Comprehensive student performance insights
- **Role-Based Access**: 5 distinct roles (Admin, Teacher, Home-Class Teacher, Student, Class Monitor)
- **Dark/Light Themes**: Fully responsive with modern UI design

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React, TypeScript)
- **Styling**: CSS Variables with Tailwind CSS
- **Icons**: Lucide React
- **Theme**: Dark/Light mode with localStorage persistence

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT with role-based access control
- **Analytics**: Pandas, NumPy for behavior analysis
- **Storage**: Supabase Storage for files

## 📁 Project Structure

```
final_year_project/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Theme)
│   └── lib/              # Utilities and API client
├── backend/              # FastAPI application
│   ├── models/           # Pydantic models
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic
│   ├── utils/            # Utilities (auth, etc.)
│   ├── main.py           # FastAPI entry point
│   └── config.py         # Configuration
├── database/             # Database schema
│   └── schema.sql        # PostgreSQL schema
└── docs/                 # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL (or Supabase account)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Run the server
python main.py
```

The backend will run on `http://localhost:8000`

### Database Setup

1. Create a local PostgreSQL database (recommended for dev) or a Supabase project (production)
2. Run the schema:
```bash
psql -U postgres -d your_database -f database/schema.sql
```

### Local PostgreSQL Setup (Windows)

1. Install PostgreSQL 15+ from https://www.postgresql.org/download/windows/
2. Ensure `psql` is available in your PATH
3. Create a database for the project:
```bash
createdb -U postgres iams
```
4. Update backend environment:
	- Set `DATABASE_URL=postgresql://postgres:<your_password>@localhost:5432/iams` in [backend/.env](backend/.env)
5. Apply the schema:
```bash
psql -U postgres -d iams -f database/schema.sql
```

### Supabase Configuration (Production)

When you are ready to deploy:
1. Create a Supabase project and copy the project URL, anon key, and service role key.
2. Set these in [backend/.env](backend/.env) (or your deployment secrets):
	- `SUPABASE_URL`
	- `SUPABASE_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
3. Set the `DATABASE_URL` to your Supabase Postgres connection string:
	- `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres`

## ✨ Key Features

### 1. Color-Coded Text Input
- **Blue text**: Manually typed content
- **Orange text**: Copy-pasted content
- Real-time statistics (typing speed, paste ratio)

### 2. Behavior Analytics
- Keystroke tracking
- Paste event detection
- Focus/blur monitoring
- Engagement time calculation

### 3. Theme System
- Dark and Light modes
- Smooth transitions
- System preference detection
- localStorage persistence

### 4. Role-Based Access Control
- **Admin**: Full system access
- **Teacher**: Assignment and grading management
- **Home-Class Teacher**: Cross-subject analytics for their class
- **Student**: View assignments, submit work, track progress
- **Class Monitor**: Student privileges + attendance management

## 🎨 Demo

Visit `/demo` to see the behavior tracking feature in action!

Try:
1. Type some text manually (appears in blue)
2. Copy and paste text (appears in orange)
3. Watch the real-time statistics update
4. Toggle between dark and light themes

## 📊 Database Schema

The system uses 20+ tables including:
- Users and authentication
- Classes, subjects, enrollments
- Assignments and submissions
- Behavior logs
- Grades and rankings
- Attendance records
- Learning resources

See `database/schema.sql` for complete schema.

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- SQL injection prevention (parameterized queries)

## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🎓 Academic Context

This project is designed for academic evaluation and demonstration purposes. It showcases:
- Full-stack development skills
- Database design and normalization
- Real-time data tracking
- Analytics implementation
- Modern UI/UX design
- Security best practices

## 📄 License

This is an academic project for educational purposes.

## 👥 Author

Final Year Project - Spring 2026
