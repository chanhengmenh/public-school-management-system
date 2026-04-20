"""add gender to users

Revision ID: 3c4d5e6f7a8b
Revises: 2b3c4d5e6f7a
Create Date: 2026-04-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '3c4d5e6f7a8b'
down_revision = '2b3c4d5e6f7a'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE TYPE usergender AS ENUM ('male', 'female', 'other')")
    op.add_column(
        'users',
        sa.Column('gender', sa.Enum('male', 'female', 'other', name='usergender'), nullable=True)
    )


def downgrade():
    op.drop_column('users', 'gender')
    op.execute("DROP TYPE usergender")
