"""
Journal Service model (based on SQLModel)
"""
from enum import Enum
from typing import Literal
from sqlmodel import Field, Relationship, SQLModel

# from .service import Service


class OperatorEnaum(str, Enum):
    IN = "in"
    NOTIN = "not in"


class JournalService(SQLModel, table=True):
    """
    Journal Service Table Class
    """
    id_config: int | None = Field(default=None, primary_key=True)
    service_name: str = Field(nullable=False, index=True)
    desired_response: str = Field(nullable=False)
    operator: OperatorEnaum = Field(nullable=False, default=OperatorEnaum.IN)
    period_sec: float = Field(nullable=False, ge=10.0)

    # service: Service = Relationship(back_populates="config")
