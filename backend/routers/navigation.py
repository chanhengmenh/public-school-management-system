"""
Navigation router - role-based sidebar configuration
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from models.user import UserRole
from utils.auth import get_current_user

router = APIRouter()


class SidebarItem(BaseModel):
    """Sidebar item model"""
    id: str
    label: str


class SidebarResponse(BaseModel):
    """Sidebar response model"""
    role: UserRole
    items: List[SidebarItem]


def build_sidebar(role: UserRole) -> List[SidebarItem]:
    """Return sidebar items for a role"""
    return [
        SidebarItem(id="dashboard", label="Dashboard"),
        SidebarItem(id="subjects", label="Subjects"),
        SidebarItem(id="assignments", label="Assignments"),
        SidebarItem(id="grades", label="Grades"),
        SidebarItem(id="messages", label="Messages"),
        SidebarItem(id="collaborations", label="Collaborations"),
        SidebarItem(id="files", label="Files"),
        SidebarItem(id="analytics", label="Analytics"),
        SidebarItem(id="profile", label="Profile"),
        SidebarItem(id="classmates", label="Classmates"),
        SidebarItem(id="teachers", label="Teachers"),
        SidebarItem(id="attendance", label="Attendance"),
        SidebarItem(id="users", label="Users"),
        SidebarItem(id="classes", label="Classes"),
        SidebarItem(id="announcements", label="Announcements"),
        SidebarItem(id="reports", label="Reports"),
        SidebarItem(id="system-analytics", label="System Analytics"),
    ]


@router.get("/sidebar", response_model=SidebarResponse)
async def get_sidebar(current_user = Depends(get_current_user)):
    """
    Get sidebar items for the current user's role.
    """
    return SidebarResponse(role=current_user.role, items=build_sidebar(current_user.role))
