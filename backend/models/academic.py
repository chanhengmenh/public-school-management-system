"""
Pydantic models for Class and Subject operations
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================
# CLASS MODELS
# ============================================

class ClassBase(BaseModel):
    """Base class model"""
    name: str
    academic_year: str
    home_teacher_id: Optional[str] = None


class ClassCreate(ClassBase):
    """Class creation model"""
    pass


class ClassUpdate(BaseModel):
    """Class update model"""
    name: Optional[str] = None
    academic_year: Optional[str] = None
    home_teacher_id: Optional[str] = None


class ClassResponse(ClassBase):
    """Class response model"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# SUBJECT MODELS
# ============================================

class SubjectBase(BaseModel):
    """Base subject model"""
    name: str
    code: str
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    """Subject creation model"""
    pass


class SubjectUpdate(BaseModel):
    """Subject update model"""
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class SubjectResponse(SubjectBase):
    """Subject response model"""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# ENROLLMENT MODELS
# ============================================

class EnrollmentCreate(BaseModel):
    """Enrollment creation model"""
    student_id: str
    class_id: str


class EnrollmentResponse(BaseModel):
    """Enrollment response model"""
    student_id: str
    class_id: str
    enrolled_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# CLASS-SUBJECT ASSIGNMENT MODELS
# ============================================

class ClassSubjectAssignment(BaseModel):
    """Assign subject to class with teacher"""
    class_id: str
    subject_id: str
    teacher_id: str


class ClassSubjectResponse(BaseModel):
    """Class-Subject assignment response"""
    class_id: str
    subject_id: str
    teacher_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
