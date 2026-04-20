"""enforce one class per student

Revision ID: 4d5e6f7a8b9c
Revises: 3c4d5e6f7a8b
Create Date: 2026-04-19 00:00:00.000000

"""
from alembic import op

revision = '4d5e6f7a8b9c'
down_revision = '3c4d5e6f7a8b'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint("uq_enrollment", "enrollments", type_="unique")
    op.create_unique_constraint("uq_student_enrollment", "enrollments", ["student_id"])


def downgrade():
    op.drop_constraint("uq_student_enrollment", "enrollments", type_="unique")
    op.create_unique_constraint("uq_enrollment", "enrollments", ["student_id", "class_id"])
