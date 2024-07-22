"""
Beat model (based on SQLModel)
"""
from sqlmodel import Field, Relationship, SQLModel

# from .service import Service


class BeatCreate(SQLModel):
    """
    Beat Create Schema
    """
    id_service: int = Field(foreign_key='service.id_service', nullable=False, index=True)
    Active: bool = Field(nullable=False)
    latency: float = Field(nullable=True)
    timestamp: float = Field(nullable=False)


class Beat(BeatCreate, table=True):
    """
    Service Beats Table Model
    """
    id_beat: int | None = Field(default=None, primary_key=True)

    # service: Service = Relationship(back_populates='beats')
