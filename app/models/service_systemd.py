"""
Systemd Service model (based on SQLModel)
"""
from sqlmodel import Field, Relationship, SQLModel

# from .service import Service


class SystemdServiceBase(SQLModel):
    """
    systemd base config
    """
    period_sec: float = Field(nullable=False, ge=10.0)


class SystemdServiceCreate(SystemdServiceBase):
    """
    systemd base config
    """
    service_name: str = Field(nullable=False, index=True)


class SystemdServiceUpdate(SQLModel):
    """
    systemd update config
    """
    service_name: str | None = Field(default=None, nullable=False, index=True)
    period_sec: float | None = Field(default=1800, nullable=False, ge=10.0)


class SystemdService(SystemdServiceCreate, table=True):
    """
    systemd Service model
    """
    id_config: int | None = Field(default=None, primary_key=True)

    # service: Service = Relationship(back_populates="config")
