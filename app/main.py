"""
Main file of heartbeat service
"""
import json
import logging
from contextlib import asynccontextmanager
import logging.config

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app import crud
from app.api.api import api_router
from app.api.deps import get_db
from app.src import callbacks

with open('app/logging.json', encoding="utf-8") as f:
    logging.config.dictConfig(config=json.loads(f.read())) # type: ignore

logger = logging.getLogger(__name__)

logger.info("statring ...")

@asynccontextmanager
async def lifespan(_):
    """
    FastAPI app lifespan
    """
    # STARTING UP
    with get_db().send(None) as session:
        services = await crud.service.get_all_services(session=session, offset=0, limit=-1)
        ids = [i.id_service for i in services]
        for i in ids:
            if i:
                callbacks.beater_callback(args=i)

    yield

    # SHUTTING DOWN


app = FastAPI(lifespan=lifespan, title="HeartBeat")

app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"]
)

app.include_router(api_router, prefix='/api')
