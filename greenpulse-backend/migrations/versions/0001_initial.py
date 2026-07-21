"""Initial database schema with TimescaleDB hypertable

Revision ID: 0001_initial
Revises: 
Create Date: 2026-07-21 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Users Table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False, server_default="analyst"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # 2. Create Nodes Table
    op.create_table(
        "nodes",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("location_lat", sa.Float(), nullable=False),
        sa.Column("location_lon", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="online"),
        sa.Column("node_type", sa.String(length=50), nullable=False, server_default="air_quality"),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_nodes_id"), "nodes", ["id"], unique=False)

    # 3. Create Telemetry Table
    op.create_table(
        "telemetry",
        sa.Column("time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("node_id", sa.String(length=50), nullable=False),
        sa.Column("metric_name", sa.String(length=50), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("time", "node_id", "metric_name"),
    )
    op.create_index("idx_telemetry_node_metric_time", "telemetry", ["node_id", "metric_name", "time"], unique=False)

    # 4. Create Alert Rules Table
    op.create_table(
        "alert_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("node_id", sa.String(length=50), nullable=True),
        sa.Column("metric_name", sa.String(length=50), nullable=False),
        sa.Column("condition", sa.String(length=10), nullable=False),
        sa.Column("threshold", sa.Float(), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False, server_default="warning"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["node_id"], ["nodes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_alert_rules_id"), "alert_rules", ["id"], unique=False)

    # 5. Create Alerts Table
    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("rule_id", sa.Integer(), nullable=False),
        sa.Column("node_id", sa.String(length=50), nullable=False),
        sa.Column("metric_name", sa.String(length=50), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("threshold", sa.Float(), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("message", sa.String(length=255), nullable=False),
        sa.Column("triggered_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["rule_id"], ["alert_rules.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_alerts_id"), "alerts", ["id"], unique=False)

    # 6. TimescaleDB Extension & Hypertable (PostgreSQL Dialect only, optional)
    # Check if timescaledb is available before attempting to create it.
    # Trying to CREATE EXTENSION inside a transaction when it's not installed
    # will abort the transaction and prevent Alembic from recording the version.
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        result = bind.execute(
            sa.text(
                "SELECT COUNT(*) FROM pg_available_extensions WHERE name = 'timescaledb'"
            )
        )
        timescaledb_available = result.scalar() > 0
        if timescaledb_available:
            try:
                op.execute(sa.text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE"))
                op.execute(sa.text("SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE)"))
                print("Notice: TimescaleDB hypertable created successfully.")
            except Exception as e:
                print(f"Notice: TimescaleDB hypertable creation failed: {e}")
        else:
            print("Notice: TimescaleDB extension not available on this PostgreSQL instance — skipping hypertable creation. Telemetry will work as a regular table.")


def downgrade() -> None:
    op.drop_index(op.f("ix_alerts_id"), table_name="alerts")
    op.drop_table("alerts")
    op.drop_index(op.f("ix_alert_rules_id"), table_name="alert_rules")
    op.drop_table("alert_rules")
    op.drop_index("idx_telemetry_node_metric_time", table_name="telemetry")
    op.drop_table("telemetry")
    op.drop_index(op.f("ix_nodes_id"), table_name="nodes")
    op.drop_table("nodes")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
