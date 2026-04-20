"""consolidate roles: remove home_teacher/class_monitor, add boolean flags

Revision ID: 0002
Revises: 0001
Create Date: 2026-02-19 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add new boolean flag columns
    op.add_column('users', sa.Column(
        'is_home_teacher', sa.Boolean(), nullable=False,
        server_default=sa.text('false')
    ))
    op.add_column('users', sa.Column(
        'is_class_monitor', sa.Boolean(), nullable=False,
        server_default=sa.text('false')
    ))

    # 2. Migrate data: convert old roles to new roles + set flags
    op.execute(
        "UPDATE users SET role = 'teacher', is_home_teacher = true "
        "WHERE role = 'home_teacher'"
    )
    op.execute(
        "UPDATE users SET role = 'student', is_class_monitor = true "
        "WHERE role = 'class_monitor'"
    )

    # 3. Recreate the userrole enum without home_teacher / class_monitor.
    #    PostgreSQL does not support removing enum values directly, so we:
    #    a) rename the old type
    #    b) create the new type
    #    c) alter the column to use the new type
    #    d) drop the old type
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")
    op.execute("CREATE TYPE userrole AS ENUM ('admin', 'teacher', 'student')")
    op.execute(
        "ALTER TABLE users "
        "ALTER COLUMN role TYPE userrole "
        "USING role::text::userrole"
    )
    op.execute("DROP TYPE userrole_old")


def downgrade() -> None:
    # Reverse: recreate old enum with all 5 values
    op.execute("ALTER TYPE userrole RENAME TO userrole_new")
    op.execute(
        "CREATE TYPE userrole AS ENUM "
        "('admin', 'teacher', 'home_teacher', 'student', 'class_monitor')"
    )
    op.execute(
        "ALTER TABLE users "
        "ALTER COLUMN role TYPE userrole "
        "USING role::text::userrole"
    )
    op.execute("DROP TYPE userrole_new")

    # Restore rows where flags are set (best-effort; original role values are gone)
    op.execute(
        "UPDATE users SET role = 'home_teacher' "
        "WHERE role = 'teacher' AND is_home_teacher = true"
    )
    op.execute(
        "UPDATE users SET role = 'class_monitor' "
        "WHERE role = 'student' AND is_class_monitor = true"
    )

    op.drop_column('users', 'is_class_monitor')
    op.drop_column('users', 'is_home_teacher')
