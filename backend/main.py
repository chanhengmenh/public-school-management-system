from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from init_db import init_database_postgres

# Import routers (will be created)
# from routers import auth, users, classes, subjects, assignments, submissions, grades, analytics, attendance, resources

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="A comprehensive academic management system with assignment integrity monitoring and learning analytics",
    version="1.0.0",
    debug=settings.debug
)


@app.on_event("startup")
async def startup_init_db():
    """Ensure PostgreSQL tables exist on startup"""
    init_database_postgres()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Intelligent Academic Management System API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Include routers
from routers import (
    auth,
    users,
    classes,
    subjects,
    assignments,
    grading,
    analytics,
    navigation,
    announcements,
    files,
    messages,
    collaborations,
    profile,
    attendance
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(classes.router, prefix="/api/classes", tags=["Classes"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(grading.router, prefix="/api/grading", tags=["Grading"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(navigation.router, prefix="/api/navigation", tags=["Navigation"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(collaborations.router, prefix="/api/collaborations", tags=["Collaborations"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
# app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
# app.include_router(grades.router, prefix="/api/grades", tags=["Grades"])
# app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
# app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
