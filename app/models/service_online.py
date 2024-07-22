"""
Online Service model (based on SQLModel)
"""
from enum import Enum
from typing import Literal

from sqlmodel import Field, Relationship, SQLModel

# from .service import Service



class MethodEnum(str, Enum):
    POST = "POST"
    GET = "GET"

class OperatorEnaum(str, Enum):
    IN = "in"
    NOTIN = "not in"
    EQ = "=="
    NE = "!="

class TargetEnaum(str, Enum):
    STATUS = "status_code"
    CONTENT = "content"


class OnlineService(SQLModel, table=True):
    """
    Online Service Table Class
    """
    id_config: int | None = Field(default=None, primary_key=True)
    service_name: str = Field(nullable=False, index=True)
    method: MethodEnum = Field(default=MethodEnum.GET, nullable=False)
    url: str = Field(nullable=False)
    desired_response: str = Field(nullable=False)
    operator: OperatorEnaum = Field(nullable=False, default=OperatorEnaum.EQ)
    target: TargetEnaum = Field(nullable=False, default=TargetEnaum.STATUS)
    period_sec: float = Field(nullable=False, ge=10.0)

    # service: Service = Relationship(back_populates="config")
