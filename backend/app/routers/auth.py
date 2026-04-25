from fastapi import APIRouter, Depends, Request, Response, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.auth import LoginRequest, TokenResponse, AccessTokenResponse
from app.services import auth_service
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days
_IS_PROD = settings.ENVIRONMENT == "production"


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=_IS_PROD,
        samesite="none" if _IS_PROD else "lax",
        max_age=_COOKIE_MAX_AGE,
        path="/auth/refresh",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=_IS_PROD,
        samesite="none" if _IS_PROD else "lax",
        path="/auth/refresh",
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    tokens = auth_service.login(db, data.email, data.password)
    _set_refresh_cookie(response, tokens["refresh_token"])
    return TokenResponse(access_token=tokens["access_token"])


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    access_token = auth_service.refresh_access_token(db, refresh_token)
    return AccessTokenResponse(access_token=access_token)


@router.post("/logout")
def logout(response: Response):
    _clear_refresh_cookie(response)
    return {"message": "Logged out"}
