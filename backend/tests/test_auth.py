"""Tests for authentication flows."""
import pytest
from app.models.user import User, UserRole
from app.core.security import hash_password, create_access_token, create_refresh_token


def make_user(db, role=UserRole.student, email="test@test.com", password="pass"):
    user = User(
        email=email,
        full_name="Test User",
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


class TestLogin:
    def test_valid_credentials_returns_tokens(self, client, db):
        make_user(db, email="login@test.com")
        r = client.post("/auth/login", json={"email": "login@test.com", "password": "pass"})
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert "refresh_token" in body

    def test_wrong_password_returns_401(self, client, db):
        make_user(db, email="wrongpass@test.com")
        r = client.post("/auth/login", json={"email": "wrongpass@test.com", "password": "wrong"})
        assert r.status_code == 401

    def test_unknown_email_returns_401(self, client, db):
        r = client.post("/auth/login", json={"email": "nobody@test.com", "password": "pass"})
        assert r.status_code == 401


class TestRefresh:
    def test_valid_refresh_token_returns_new_access_token(self, client, db):
        make_user(db, email="refresh@test.com")
        login_r = client.post("/auth/login", json={"email": "refresh@test.com", "password": "pass"})
        refresh_token = login_r.json()["refresh_token"]
        r = client.post("/auth/refresh", json={"refresh_token": refresh_token})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_access_token_as_refresh_returns_401(self, client, db):
        make_user(db, email="badrefresh@test.com")
        login_r = client.post("/auth/login", json={"email": "badrefresh@test.com", "password": "pass"})
        access_token = login_r.json()["access_token"]
        r = client.post("/auth/refresh", json={"refresh_token": access_token})
        assert r.status_code == 401


class TestProtectedEndpoints:
    def test_no_token_returns_401(self, client, db):
        r = client.get("/users/me")
        assert r.status_code == 401

    def test_invalid_token_returns_401(self, client, db):
        r = client.get("/users/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert r.status_code == 401

    def test_valid_token_allows_access(self, client, db):
        user = make_user(db, email="validtoken@test.com")
        login_r = client.post("/auth/login", json={"email": "validtoken@test.com", "password": "pass"})
        access_token = login_r.json()["access_token"]
        r = client.get("/users/me", headers={"Authorization": f"Bearer {access_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == "validtoken@test.com"
