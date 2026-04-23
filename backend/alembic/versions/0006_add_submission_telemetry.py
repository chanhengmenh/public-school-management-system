"""add submission telemetry table

Revision ID: 0006_submission_telemetry
Revises: fdb6de1dc3a2
Create Date: 2026-04-23

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0006_submission_telemetry'
down_revision: Union[str, None] = 'fdb6de1dc3a2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'submission_telemetry',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('submission_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('typed_chars', sa.Integer(), nullable=True),
        sa.Column('paste_count', sa.Integer(), nullable=True),
        sa.Column('pasted_chars', sa.Integer(), nullable=True),
        sa.Column('keystroke_count', sa.Integer(), nullable=True),
        sa.Column('active_typing_seconds', sa.Float(), nullable=True),
        sa.Column('avg_wpm', sa.Float(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['student_id'], ['users.id']),
        sa.ForeignKeyConstraint(['submission_id'], ['assignment_submissions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('submission_id'),
    )
    op.create_index(op.f('ix_submission_telemetry_id'), 'submission_telemetry', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_submission_telemetry_id'), table_name='submission_telemetry')
    op.drop_table('submission_telemetry')
