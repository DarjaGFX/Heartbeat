"""
API input schema module
"""
from pydantic import BaseModel


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
