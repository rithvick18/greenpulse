from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator


class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General
    DEBUG: bool = Field(default=True)
    ENVIRONMENT: str = Field(default="development")
    APP_NAME: str = Field(default="GreenPulse OS Backend")
    API_V1_STR: str = Field(default="/api/v1")

    # JWT Security
    SECRET_KEY: str = Field(
        default="change_this_super_secret_jwt_key_for_production_environment_32bytes"
    )
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/greenpulse"
    )

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # MQTT Broker
    MQTT_BROKER_HOST: Optional[str] = Field(default="localhost")
    MQTT_BROKER_PORT: int = Field(default=1883)
    MQTT_TOPIC_SUB: str = Field(default="sensors/+/telemetry")

    # Simulation Mode
    SIMULATION_ENABLED: bool = Field(default=True)

    # Celery (Optional)
    CELERY_BROKER_URL: Optional[str] = Field(default=None)
    CELERY_RESULT_BACKEND: Optional[str] = Field(default=None)

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)
    WS_CONNECTION_LIMIT_PER_MINUTE: int = Field(default=10)

    @model_validator(mode="after")
    def validate_simulation_and_broker(self) -> "Settings":
        # Enable simulation automatically in debug mode unless explicitly disabled
        if self.DEBUG and self.SIMULATION_ENABLED is None:
            self.SIMULATION_ENABLED = True
        return self


settings = Settings()
