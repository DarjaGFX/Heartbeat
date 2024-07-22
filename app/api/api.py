from fastapi import APIRouter
api_router = APIRouter()

from .endpoints import server, service, beat

api_router.include_router(server.router, prefix="/server", tags=["Server"])
api_router.include_router(service.router, prefix="/service", tags=["Service"])
api_router.include_router(beat.router, prefix="/beat", tags=["Beat"])
