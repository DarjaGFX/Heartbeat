"""
Service model (based on SQLModel)
"""
from enum import Enum
from sqlmodel import Field, Relationship, SQLModel

# from .beat import Beat
# from .server import Server
# from .service_journal import JournalService
# from .service_online import OnlineService
# from .service_systemd import SystemdService


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
    id_server: int | None = Field(foreign_key='server.id_server', nullable=True)
    service_name: str = Field(nullable=False, index=True, unique=True)
    service_type:  ServiceTypeEnum = Field(nullable=False, index=True)


class ServiceCreate(ServiceBase):
    """
    Service Create model
    """
    id_config: int = Field(nullable=False)


class ServiceUpdate(SQLModel):
    """
    Service Update Model
    """
    id_server: int | None = Field(foreign_key='server.id_server', nullable=True)
    service_name: str | None = Field(nullable=False, index=True, unique=True)
    service_type: ServiceTypeEnum | None = Field(nullable=False, index=True)
    id_config: int | None = Field(nullable=False)



class Service(ServiceCreate, table=True):
    """
    Service Table Class
    """
    id_service: int | None = Field(default=None, primary_key=True)

    # config: OnlineService | JournalService | SystemdService = Relationship(back_populates="service")
    # server: Server = Relationship(back_populates="services")
    # beats: list[Beat] = Relationship(back_populates="service")
