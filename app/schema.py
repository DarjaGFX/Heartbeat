"""
API input schema module
"""
from typing import Literal
from pydantic import BaseModel, Field


# class OnlineService(BaseModel):
#     """
#     Online Service Object Schema
#     """
#     service_name: str
#     method: Literal["post", "get", "put"]
#     url: str
#     desired_response: int
#     operator: Literal["==", "!=", "in", "not in"]
#     target: Literal["status_code", "content"]
#     data: dict | None
#     period_sec: float = Field(ge=10)


# class SystemdService(BaseModel):
#     """
#     Systemd Service Object Schema
#     """
#     service_name: str
#     period_sec: float = Field(ge=10)


# class JournalReport(BaseModel):
#     """
#     Journal Report Object Schema
#     """
#     service_name: str
#     desired_response: str
#     operator: Literal["in", "not in"]
#     period_sec: float = Field(ge=10)


class HTTPError(BaseModel):
    """
    HTTP ERROR pydantic model
    """
    detail: str

    class Config:
        """
        HTTPError Config Class
        """
        json_schema_extra = {
            "example": {"detail": "HTTPException raised."},
        }
