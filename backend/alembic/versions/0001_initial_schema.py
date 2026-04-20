"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-02-19 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- users ---
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum(
            'admin', 'teacher', 'home_teacher', 'student', 'class_monitor',
            name='userrole'
        ), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # --- classes ---
    op.create_table(
        'classes',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('academic_year', sa.String(), nullable=False),
        sa.Column('home_teacher_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
    )

    # --- subjects ---
    op.create_table(
        'subjects',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('code', sa.String(), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=True),
    )

    # --- class_subjects ---
    op.create_table(
        'class_subjects',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('class_id', sa.Integer(), sa.ForeignKey('classes.id'), nullable=False),
        sa.Column('subject_id', sa.Integer(), sa.ForeignKey('subjects.id'), nullable=False),
        sa.Column('teacher_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.UniqueConstraint('class_id', 'subject_id', name='uq_class_subject'),
    )

    # --- enrollments ---
    op.create_table(
        'enrollments',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('class_id', sa.Integer(), sa.ForeignKey('classes.id'), nullable=False),
        sa.UniqueConstraint('student_id', 'class_id', name='uq_enrollment'),
    )

    # --- assignments ---
    op.create_table(
        'assignments',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('class_subject_id', sa.Integer(), sa.ForeignKey('class_subjects.id'), nullable=False),
        sa.Column('publisher_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('max_score', sa.Integer(), nullable=False, server_default=sa.text('100')),
        sa.Column('status', sa.Enum('draft', 'published', 'closed', name='assignmentstatus'),
                  nullable=False, server_default='draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # --- assignment_submissions ---
    op.create_table(
        'assignment_submissions',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('assignment_id', sa.Integer(), sa.ForeignKey('assignments.id'), nullable=False),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('submission_type', sa.String(), nullable=True, server_default=sa.text("'text'")),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('is_late', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )

    # --- submission_files ---
    op.create_table(
        'submission_files',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('submission_id', sa.Integer(), sa.ForeignKey('assignment_submissions.id'), nullable=False),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=True),
        sa.Column('original_filename', sa.String(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # --- behavior_logs ---
    op.create_table(
        'behavior_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('submission_id', sa.Integer(), sa.ForeignKey('assignment_submissions.id'), nullable=False),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('event_type', sa.Enum(
            'keypress', 'paste', 'focus_gain', 'focus_loss', 'copy', 'cut',
            name='eventtype'
        ), nullable=False),
        sa.Column('event_data', sa.JSON(), nullable=True),
        sa.Column('client_ts', sa.BigInteger(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # --- grades ---
    op.create_table(
        'grades',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('submission_id', sa.Integer(), sa.ForeignKey('assignment_submissions.id'),
                  nullable=False, unique=True),
        sa.Column('score', sa.Numeric(5, 2), nullable=False),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('graded_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('graded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # --- attendance ---
    op.create_table(
        'attendance',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('class_id', sa.Integer(), sa.ForeignKey('classes.id'), nullable=False),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('status', sa.Enum('present', 'absent', 'late', 'excused', name='attendancestatus'),
                  nullable=False),
        sa.Column('marked_by_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('note', sa.String(), nullable=True),
        sa.UniqueConstraint('class_id', 'student_id', 'date', name='uq_attendance'),
    )


def downgrade() -> None:
    op.drop_table('attendance')
    op.drop_table('grades')
    op.drop_table('behavior_logs')
    op.drop_table('submission_files')
    op.drop_table('assignment_submissions')
    op.drop_table('assignments')
    op.drop_table('enrollments')
    op.drop_table('class_subjects')
    op.drop_table('subjects')
    op.drop_table('classes')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS attendancestatus')
    op.execute('DROP TYPE IF EXISTS eventtype')
    op.execute('DROP TYPE IF EXISTS assignmentstatus')
    op.execute('DROP TYPE IF EXISTS userrole')
