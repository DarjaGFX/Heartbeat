"""
Config Service model (based on SQLModel)
"""
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .service import Service


class MethodEnum(str, Enum):
    """
    Method Options
    """
    POST = "POST"
    GET = "GET"


class OnlineOperatorEnaum(str, Enum):
    """
    Online Operator Options
    """
    IN = "in"
    NOTIN = "not in"
    EQ = "=="
    NE = "!="


class JournalOperatorEnaum(str, Enum):
    """
    Journal Operator Options
    """
    IN = "in"
    NOTIN = "not in"


class TargetEnaum(str, Enum):
    """
    Target Options
    """
    STATUS = "status_code"
    CONTENT = "content"


class ConfigBase(SQLModel):
    """
    Config base config
    """
    interval: float = Field(nullable=False, default=1800, ge=10.0)


class ConfigBaseSystemd(ConfigBase):
    """
    Systemd base config model
    """
    pass


class ConfigBaseJournal(ConfigBase):
    """
    Journal base config model
    """
    desired_response: str = Field(nullable=False)
    operator: JournalOperatorEnaum = Field(nullable=False, default=JournalOperatorEnaum.IN)


class ConfigBaseOnline(ConfigBase):
    """
    Online base config model
    """
    method: MethodEnum = Field(default=MethodEnum.GET, nullable=False)
    url: str = Field(nullable=False)
    desired_response: str = Field(nullable=False)
    operator: OnlineOperatorEnaum = Field(nullable=False, default=OnlineOperatorEnaum.EQ)
    target: TargetEnaum = Field(nullable=False, default=TargetEnaum.STATUS)
    data: dict | None = Field(nullable=True, default=None)


class ConfigCreate(ConfigBase):
    """
    Config create config
    """
    id_service: int = Field(foreign_key='service.id_service', nullable=True, ondelete="CASCADE")
    method: MethodEnum | None = Field(default=None)
    url: str | None = Field(default=None)
    desired_response: str | None = Field(default=None)
    operator: OnlineOperatorEnaum | None = Field(default=None)
    target: TargetEnaum | None = Field(default=None)
    data: str | None = Field(nullable=True, default=None)


class ConfigUpdateSystemd(SQLModel):
    """
    Systemd Update config model
    """
    interval: float | None = Field(default=None, ge=10.0)


class ConfigUpdateJournal(ConfigBase):
    """
    Journal Update config model
    """
    interval: float | None = Field(default=None, ge=10.0)
    desired_response: str | None = Field(default=None)
    operator: JournalOperatorEnaum | None = Field(default=None)


class ConfigUpdateOnline(ConfigBase):
    """
    Online Update config model
    """
    interval: float | None = Field(default=None, ge=10.0)
    method: MethodEnum | None = Field(default=None)
    url: str | None = Field(default=None)
    desired_response: str | None = Field(default=None)
    operator: OnlineOperatorEnaum | None = Field(default=None)
    target: TargetEnaum | None = Field(default=None)
    data: str | None = Field(nullable=True, default=None)


class ConfigUpdate(SQLModel):
    """
    Config update
    """
    method: MethodEnum | None = Field(default=None)
    url: str | None = Field(default=None)
    desired_response: str | None = Field(default=None)
    operator: OnlineOperatorEnaum | None = Field(default=None)
    target: TargetEnaum | None = Field(default=None)
    data: str | None = Field(nullable=True, default=None)
    interval: float | None = Field(default=None, ge=10.0)


class Config(ConfigCreate, table=True):
    """
    Service Config Table Class
    """
    id_config: int | None = Field(default=None, primary_key=True)


    service: "Service" = Relationship(back_populates="config")


class ConfigWithService(ConfigCreate):
    """
    Config with service object for response
    """
    service: Optional["Service"] = None


from .service import Service

ConfigWithService.model_rebuild()
