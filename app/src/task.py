"""
modulefor repetetive tasks like checking service status and sending results
"""
import asyncio
import datetime
import logging
import os
from typing import TYPE_CHECKING

from dotenv import load_dotenv
from fastapi.encoders import jsonable_encoder

from app import crud
from app.api.deps import get_db
from app.models import BeatCreate, Service, ServiceTypeEnum, ServiceWithBeats
from app.src import checker

if TYPE_CHECKING:
    from app.src.connection_manager import (ServerConnectionManager,
                                            ServiceConnectionManager,
                                            SSHManager)

logger = logging.getLogger(__name__)
load_dotenv()
MAX_CHART_BARS = int(os.getenv("MAX_CHART_BARS", "50"))


async def run_beater(id_service: int):
    """
    run a beater for given service based on service config
    """
    while True:
        ts = datetime.datetime.now(datetime.UTC)
        session = next(get_db())
        service = session.get(Service, id_service)
        if not service:
            logger.warning("service with id %d not found!", id_service)
            return
        match service.service_type:
            case ServiceTypeEnum.ONLINE:
                res = await checker.online_service(service=service)
                bc = BeatCreate(
                    id_service=id_service,
                    Active=res[0],
                    latency=res[1],
                    server_status=res[2],
                    timestamp=ts.timestamp()
                    )
                await crud.beat.create_beat(
                    session=session,
                    beat_create=bc
                )
            case ServiceTypeEnum.SYSTEMD:
                res = await checker.systemd_service_status(service=service)
                bc = BeatCreate(
                    id_service=id_service,
                    Active=res[0],
                    server_status=res[1],
                    timestamp=ts.timestamp()
                )
                await crud.beat.create_beat(
                    session=session,
                    beat_create=bc
                )
            case ServiceTypeEnum.JOURNAL:
                res = await checker.journalctl(service=service)
                bc = BeatCreate(
                    id_service=id_service,
                    Active=res[0],
                    server_status=res[1],
                    timestamp=ts.timestamp()
                )
                await crud.beat.create_beat(
                    session=session,
                    beat_create=bc
                )
        delay = (datetime.datetime.now(datetime.UTC)-ts).total_seconds()
        interval = float(service.config.interval)
        sleep = interval-delay
        i = 2
        if sleep < 0:
            while sleep < 0:
                sleep = (i * interval) - delay
            logger.info(
                "service id: %d. beater delayed so long. %d ticks will be skipped.",
                id_service,
                i
            )
        session.close()
        await asyncio.sleep(sleep)


async def update_live_board(cm: "ServiceConnectionManager"):
    """
    update status board with latest check results and send to clients using WS connection manager
    """
    while True:
        session = next(get_db())
        try:
            if len(cm.active_connections):
                services = await crud.service.get_all_services(session=session)
                message = {}
                for s in services:
                    s.beats = s.beats[::-1][:MAX_CHART_BARS]
                    swb = ServiceWithBeats.model_validate(s)
                    swb = jsonable_encoder(swb)

                    # Service Monitor
                    message.update({
                        s.id_server: swb
                    })

                    # Server Monitor
                    if -1 * s.id_server in message:
                        message[-1 * s.id_server].append(swb)
                    else:
                        message.update({
                            -1 * s.id_server: [swb]
                        })

                    # Monitor All Services
                    if 0 in message:
                        if s.id_server in message[0]:
                            message[0][s.id_server].append(swb)
                        else:
                            message[0].update({
                                s.id_server: [swb]
                            })    
                    else:
                        message.update({
                            0: {
                                s.id_server: [swb]
                            }
                        })

                await cm.auto_broadcast(message)
        except Exception as e:
            logger.exception(e)
        session.close()
        await asyncio.sleep(10)


async def update_server_load_board(cm: "ServerConnectionManager", sshm: "SSHManager"):
    """
    update status board with latest check results and send to clients using WS connection manager
    """
    while True:
        try:
            if len(cm.active_connections):
                response = {}
                for s in sshm.active_connections.items():
                    active = await sshm.is_active(ssh=s[1], retry=0)
                    status = await sshm.get_server_status(ssh=s[1], retry=0)
                    response.update({
                        s[0]: {
                            "active": active,
                            "status": status
                        }
                    })
                await cm.broadcast(message=response)
        except Exception as e:
            logger.exception(e)
        await asyncio.sleep(1)
