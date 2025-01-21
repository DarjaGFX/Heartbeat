"""
Main file of heartbeat service
"""
import asyncio
import json
import logging
import logging.config
import os
from contextlib import asynccontextmanager
from threading import Thread

from fastapi import FastAPI
from sqlmodel import select
from starlette.middleware.cors import CORSMiddleware

from app import crud
from app.api.api import api_router
from app.api.deps import get_db
from app.models.server import Server
from app.src import callbacks
from app.src.connection_manager import (ServerConnectionManager,
                                        ServiceConnectionManager, SSHManager,
                                        get_ssh_clint)
from app.src.task import update_live_board, update_server_load_board

os.makedirs('app/logs', exist_ok=True)
with open('app/logging.json', encoding="utf-8") as f:
    logging.config.dictConfig(config=json.loads(f.read())) # type: ignore

logger = logging.getLogger(__name__)

logger.info("statring ...")


@asynccontextmanager
async def lifespan(_):
    """
    FastAPI app lifespan
    """
    def update_live_board_runner():
        asyncio.run(update_live_board())

    def update_server_load_board_runner():
        asyncio.run(update_server_load_board())

    sshm = SSHManager()
    ServerConnectionManager()
    ServiceConnectionManager()
    # STARTING UP
    with next(get_db()) as session:
        servers = session.exec(select(Server)).all()
        for i in servers:
            # asyncio.create_task(sshm.get_ssh_client(id_server=i.id_server, server=None))
            Thread(target=get_ssh_clint, args=(i.id_server,), daemon=True, name="get ssh client").start()
        services = await crud.service.get_all_services(session=session, offset=0, limit=-1)
        ids = [i.id_service for i in services]
        for i in ids:
            if i:
                callbacks.beater_callback(args=i)

    Thread(
        target=update_live_board_runner,
        daemon=True,
        name="update_live_board"
    ).start()
    Thread(
        target=update_server_load_board_runner,
        daemon=True,
        name="update_server_load_board"
    ).start()

    yield

    # SHUTTING DOWN


app = FastAPI(lifespan=lifespan, title="HeartBeat")

app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"]
)

app.include_router(api_router, prefix='/api')
