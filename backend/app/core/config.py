import re
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from environment variables / backend/.env. There are deliberately no credential defaults."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Enterprise Business Insights API"
    app_version: str = "0.4.0"
    database_url: str  # required: DATABASE_URL
    # All calendar dates ("today", this month, custom ranges, daily buckets) are interpreted in this zone.
    business_timezone: str = "Asia/Kolkata"

    # Native Expo apps are not subject to CORS; Expo *web* (browser) is. Allow localhost/LAN dev origins.
    cors_origin_regex: str = (
        r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$"
    )
    cors_origins: str = ""  # comma-separated extra origins

    @field_validator("database_url")
    @classmethod
    def _use_psycopg3_driver(cls, v: str) -> str:
        """Accept postgresql://, postgres:// and +psycopg2 URLs; the project uses the psycopg (v3) driver."""
        for prefix in ("postgresql+psycopg2://", "postgresql://", "postgres://"):
            if v.startswith(prefix):
                return "postgresql+psycopg://" + v[len(prefix):]
        return v

    @field_validator("business_timezone")
    @classmethod
    def _valid_timezone(cls, v: str) -> str:
        if not re.fullmatch(r"[A-Za-z0-9_+\-/]+", v):
            raise ValueError("BUSINESS_TIMEZONE must be an IANA name such as Asia/Kolkata")
        try:
            ZoneInfo(v)
        except ZoneInfoNotFoundError as exc:
            raise ValueError(f"Unknown time zone '{v}' (on Windows run: pip install tzdata)") from exc
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()  # type: ignore[call-arg]
