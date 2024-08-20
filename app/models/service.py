"""
Service model (based on SQLModel)
"""
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .beat import Beat
    from .config import Config
    from .server import Server

# from .service_journal import JournalService


class ServiceTypeEnum(str, Enum):
    """
    Service Type Enum
    """
    ONLINE = "OnlineService"
    JOURNAL = "Journalctl"
    SYSTEMD = "SystemdServiceStatus"


class ServiceBase(SQLModel):
    """
    ServiceBase Model
    """
    id_server: int | None = Field(foreign_key='server.id_server', nullable=True, ondelete="CASCADE")
    service_name: str | None = Field(nullable=False, index=True, unique=True)


class ServiceCreate(ServiceBase):
    """
    Service Create model
    """
    id_server: int = Field(foreign_key='server.id_server', nullable=True, ondelete="CASCADE")
    service_name: str = Field(nullable=False, index=True, unique=True)


class ServiceUpdate(SQLModel):
    """
    Service Update Model
    """
    service_name: str | None = Field(nullable=False, index=True, unique=True)


class Service(ServiceCreate, table=True):
    """
    Service Table Class
    """
    id_service: int | None = Field(default=None, primary_key=True)
    service_type: ServiceTypeEnum = Field(nullable=False, index=True)

    server: "Server" = Relationship(back_populates="services")
    config: "Config" = Relationship(
        back_populates="service",
        cascade_delete=True
    )
    # beats: list["Beat"] = Relationship(back_populates="beat", cascade_delete=True)
    beats: list["Beat"] = Relationship(cascade_delete=True) # (back_populates="service")


class ServiceWithConfig(ServiceBase):
    """
    Service with config class for response
    """
    service_type: ServiceTypeEnum = Field(nullable=False, index=True)
    config: Optional["Config"] = None


class ServiceWithBeats(SQLModel):
    """
    Service with beats list
    """
    service_name: str | None = Field(nullable=False, index=True, unique=True)
    beats: Optional[list["BeatPublic"]] = []


from .beat import BeatPublic
from .config import Config

ServiceWithConfig.model_rebuild()
ServiceWithBeats.model_rebuild()
