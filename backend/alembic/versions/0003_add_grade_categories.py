"""add grade_categories table and category_id to assignments

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-16 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'grade_categories',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('class_subject_id', sa.Integer,
                  sa.ForeignKey('class_subjects.id'), nullable=False),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('weight', sa.Numeric(5, 4), nullable=False),
    )
    op.create_index(
        'ix_grade_categories_class_subject_id',
        'grade_categories',
        ['class_subject_id'],
    )
    op.add_column(
        'assignments',
        sa.Column(
            'category_id',
            sa.Integer,
            sa.ForeignKey('grade_categories.id', ondelete='SET NULL'),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column('assignments', 'category_id')
    op.drop_index('ix_grade_categories_class_subject_id', table_name='grade_categories')
    op.drop_table('grade_categories')
