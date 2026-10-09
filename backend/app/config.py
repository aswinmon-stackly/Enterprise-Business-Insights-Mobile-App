from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Enterprise Business Insights API"
    app_version: str = "0.2.0"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/business_insights"
    # Native Expo apps are not subject to CORS; Expo *web* (browser) is. Allow localhost/LAN dev origins.
    cors_origin_regex: str = (
        r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$"
    )
    cors_origins: str = ""  # comma-separated extra origins

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
