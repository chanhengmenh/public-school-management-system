from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    auth, users, classes, subjects, class_subjects,
    enrollments, assignments, submissions, behavior_logs,
    grades, attendance, files, analytics, grade_categories,
    schedules, notifications, announcements, audit_logs, materials,
)

app = FastAPI(
    title="PSMS API",
    description="Public School Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(classes.router)
app.include_router(subjects.router)
app.include_router(class_subjects.router)
app.include_router(enrollments.router)
app.include_router(assignments.router)
app.include_router(submissions.router)
app.include_router(behavior_logs.router)
app.include_router(grades.router)
app.include_router(attendance.router)
app.include_router(files.router)
app.include_router(analytics.router)
app.include_router(grade_categories.router)
app.include_router(schedules.router)
app.include_router(notifications.router)
app.include_router(announcements.router)
app.include_router(audit_logs.router)
app.include_router(materials.router)


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
