"""
API module 
including routers
"""
from fastapi import APIRouter

from .endpoints import server, service

api_router = APIRouter()

api_router.include_router(server.router, prefix="/server", tags=["Server"])
api_router.include_router(service.router, prefix="/service", tags=["Service"])
