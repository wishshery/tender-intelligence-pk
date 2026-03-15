"""Initial schema — all tables

Revision ID: 0001
Revises:
Create Date: 2026-03-15 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("role", sa.Enum("user", "admin", name="user_role"), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("verification_token", sa.String(255), nullable=True),
        sa.Column("reset_token", sa.String(255), nullable=True),
        sa.Column("reset_token_expires", sa.DateTime(), nullable=True),
        sa.Column("preferred_currency", sa.Enum("PKR", "USD", "GBP", name="currency_enum"), nullable=False, server_default="PKR"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── sectors ─────────────────────────────────────────────────
    op.create_table(
        "sectors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("icon", sa.String(20), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sectors_code", "sectors", ["code"], unique=True)

    # ── tenders ──────────────────────────────────────────────────
    op.create_table(
        "tenders",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ckan_id", sa.String(255), nullable=True),
        sa.Column("ckan_package_id", sa.String(255), nullable=True),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("issuing_authority", sa.String(500), nullable=True),
        sa.Column("issuing_authority_type", sa.String(100), nullable=True),
        sa.Column("reference_number", sa.String(255), nullable=True),
        sa.Column("sector_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("industry_tags", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("estimated_value_pkr", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(10), nullable=True, server_default="PKR"),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("publication_date", sa.DateTime(), nullable=True),
        sa.Column("submission_deadline", sa.DateTime(), nullable=True),
        sa.Column("opening_date", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="active"),
        sa.Column("ai_summary_short", sa.Text(), nullable=True),
        sa.Column("ai_summary_detailed", sa.Text(), nullable=True),
        sa.Column("sme_insights", sa.Text(), nullable=True),
        sa.Column("eligibility_criteria", sa.Text(), nullable=True),
        sa.Column("opportunity_score", sa.Float(), nullable=True),
        sa.Column("is_high_value", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("ai_processed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("ai_processed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["sector_id"], ["sectors.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tenders_ckan_id", "tenders", ["ckan_id"], unique=True)
    op.create_index("ix_tenders_sector_id", "tenders", ["sector_id"])
    op.create_index("ix_tenders_submission_deadline", "tenders", ["submission_deadline"])
    op.create_index("ix_tenders_is_high_value", "tenders", ["is_high_value"])
    op.create_index("ix_tenders_ai_processed", "tenders", ["ai_processed"])

    # ── tender_documents ────────────────────────────────────────
    op.create_table(
        "tender_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tender_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("doc_type", sa.String(10), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_data", sa.LargeBinary(), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["tender_id"], ["tenders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── subscription_plans ──────────────────────────────────────
    op.create_table(
        "subscription_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("slug", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price_pkr", sa.Float(), nullable=False, server_default="0"),
        sa.Column("price_usd", sa.Float(), nullable=False, server_default="0"),
        sa.Column("price_gbp", sa.Float(), nullable=False, server_default="0"),
        sa.Column("stripe_price_id_pkr", sa.String(255), nullable=True),
        sa.Column("stripe_price_id_usd", sa.String(255), nullable=True),
        sa.Column("stripe_price_id_gbp", sa.String(255), nullable=True),
        sa.Column("monthly_tender_limit", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("can_download_documents", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("can_view_detailed_analysis", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("max_keyword_alerts", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("max_sector_subscriptions", sa.Integer(), nullable=False, server_default="2"),
        sa.Column("has_api_access", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("has_weekly_digest", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("max_team_members", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_subscription_plans_slug", "subscription_plans", ["slug"], unique=True)

    # ── subscriptions ───────────────────────────────────────────
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="active"),
        sa.Column("currency", sa.String(10), nullable=False, server_default="PKR"),
        sa.Column("payment_method", sa.String(50), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.Column("easypaisa_ref", sa.String(255), nullable=True),
        sa.Column("current_period_start", sa.DateTime(), nullable=True),
        sa.Column("current_period_end", sa.DateTime(), nullable=True),
        sa.Column("monthly_tender_views", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("usage_reset_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["plan_id"], ["subscription_plans.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])

    # ── alerts ──────────────────────────────────────────────────
    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("keyword", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("match_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_matched_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alerts_user_id", "alerts", ["user_id"])

    # ── alert_matches ───────────────────────────────────────────
    op.create_table(
        "alert_matches",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("alert_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tender_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("match_type", sa.String(50), nullable=False, server_default="keyword"),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("email_sent", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["alert_id"], ["alerts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tender_id"], ["tenders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alert_matches_user_id", "alert_matches", ["user_id"])
    op.create_index("ix_alert_matches_is_read", "alert_matches", ["is_read"])

    # ── user_sector_subscriptions ───────────────────────────────
    op.create_table(
        "user_sector_subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sector_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["sector_id"], ["sectors.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("user_sector_subscriptions")
    op.drop_table("alert_matches")
    op.drop_table("alerts")
    op.drop_table("subscriptions")
    op.drop_table("subscription_plans")
    op.drop_table("tender_documents")
    op.drop_table("tenders")
    op.drop_table("sectors")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS user_role")
    op.execute("DROP TYPE IF EXISTS currency_enum")
