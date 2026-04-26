from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.types import ASGIApp, Receive, Scope, Send
from app.config import settings
from app.routers import (
    auth, users, classes, subjects, class_subjects,
    enrollments, assignments, submissions, behavior_logs,
    grades, attendance, files, analytics, grade_categories,
    schedules, notifications, announcements, audit_logs, materials,
)

_fastapi_app = FastAPI(
    title="PSMS API",
    description="Public School Management System",
    version="1.0.0",
)

_fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@_fastapi_app.middleware("http")
async def force_https_redirects(request: Request, call_next):
    response = await call_next(request)
    if response.status_code in (301, 302, 307, 308):
        location = response.headers.get("location", "")
        if location.startswith("http://"):
            response.headers["location"] = "https://" + location[7:]
    return response

_fastapi_app.include_router(auth.router)
_fastapi_app.include_router(users.router)
_fastapi_app.include_router(classes.router)
_fastapi_app.include_router(subjects.router)
_fastapi_app.include_router(class_subjects.router)
_fastapi_app.include_router(enrollments.router)
_fastapi_app.include_router(assignments.router)
_fastapi_app.include_router(submissions.router)
_fastapi_app.include_router(behavior_logs.router)
_fastapi_app.include_router(grades.router)
_fastapi_app.include_router(attendance.router)
_fastapi_app.include_router(files.router)
_fastapi_app.include_router(analytics.router)
_fastapi_app.include_router(grade_categories.router)
_fastapi_app.include_router(schedules.router)
_fastapi_app.include_router(notifications.router)
_fastapi_app.include_router(announcements.router)
_fastapi_app.include_router(audit_logs.router)
_fastapi_app.include_router(materials.router)


@_fastapi_app.get("/health")
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


_ALLOWED_ORIGINS = set(settings.ALLOWED_ORIGINS.split(","))


class _CORSSafetyNet:
    """
    Outermost ASGI wrapper — runs outside Starlette's ServerErrorMiddleware.
    Guarantees Access-Control-Allow-Origin is present on every response,
    including raw 500s that ServerErrorMiddleware emits without CORS headers.
    """

    def __init__(self, inner: ASGIApp, origins: set) -> None:
        self._inner = inner
        self._origins = origins

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self._inner(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        origin = headers.get(b"origin", b"").decode()

        async def _patched_send(message):
            if message["type"] == "http.response.start" and origin in self._origins:
                raw = list(message.get("headers", []))
                has_acao = any(k.lower() == b"access-control-allow-origin" for k, _ in raw)
                if not has_acao:
                    raw += [
                        (b"access-control-allow-origin", origin.encode()),
                        (b"access-control-allow-credentials", b"true"),
                        (b"vary", b"Origin"),
                    ]
                    message = {**message, "headers": raw}
            await send(message)

        await self._inner(scope, receive, _patched_send)


# Uvicorn imports `app.main:app` — this is the outermost ASGI callable.
app = _CORSSafetyNet(_fastapi_app, _ALLOWED_ORIGINS)
