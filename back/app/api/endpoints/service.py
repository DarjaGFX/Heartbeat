"""
Service API ENDPOINT
"""

import json
from threading import Thread

from fastapi import (APIRouter, HTTPException, Query, Response, WebSocket,
                     WebSocketDisconnect, status)

from app import crud
from app.api.deps import SessionDep
from app.core.logging import get_configed_logging
from app.models import (ConfigBaseJournal, ConfigBaseOnline, ConfigBaseSystemd,
                        ConfigCreate, Server, Service, ServiceCreate,
                        ServiceTypeEnum, ServiceUpdate, ServiceWithConfig)
from app.models.config import (ConfigUpdate, ConfigUpdateJournal,
                               ConfigUpdateOnline, ConfigUpdateSystemd)
from app.schema import HTTPError
from app.src import callbacks, connection_manager

logging = get_configed_logging()
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
        "/{id_service}",
        response_model=ServiceWithConfig|HTTPError,
        response_model_exclude_none=True,
        # response_model_exclude_unset=True,
        responses={
            200: {"model": ServiceWithConfig},
            404: {"model": HTTPError},
        }
    )
async def get_server_by_id(
        session: SessionDep,
        response: Response,
        id_service: int,
    ):
    """
    get SSH Server by id
    """
    s = await crud.service.get_service_by_id(session=session, id_service=id_service)
    if s:
        return s
    response.status_code = status.HTTP_404_NOT_FOUND
    return HTTPException(status_code=response.status_code, detail="Service Not Found.")


@router.get(
        "/server/{id_server}", 
        response_model=list[ServiceWithConfig]|HTTPError,
        response_model_exclude_none=True,
        responses={
            200: {"model": list[ServiceWithConfig]},
            404: {"model": HTTPError},
        }
    )
async def get_all_services_of_a_server(
        session: SessionDep,
        response: Response,
        id_server: int,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=10, ge=1)
    ):
    """
    get all Services of a server
    """
    s = await crud.service.get_all_services_by_server(
        session=session,
        id_server=id_server,
        offset=offset,
        limit=limit
    )
    if s:
        return s
    response.status_code = status.HTTP_404_NOT_FOUND
    return HTTPException(status_code=response.status_code, detail="Server Not Found")


@router.get(
        "/", 
        response_model=list[ServiceWithConfig],
        response_model_exclude_none=True,
        responses={
            200: {"model": list[ServiceWithConfig]},
        }
    )
async def get_all_services(
        session: SessionDep,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=10, ge=1)
    ):
    """
    get all Services
    """
    s = await crud.service.get_all_services(session=session, offset=offset, limit=limit)
    if s:
        return s
    return []


@router.post("/",responses={
            201: {"model": Service},
            400: {"model": HTTPError}
        },
        response_model_exclude={"password"}
    )
async def creata_service(
        session: SessionDep,
        response: Response,
        service: ServiceCreate,
        config: ConfigBaseOnline | ConfigBaseJournal | ConfigBaseSystemd
    ):
    """
    Create Service
    """
    try:
        server = session.get(Server, service.id_server)
        if not server:
            raise ValueError(f"invalid server id {service.id_server}")
        data = None
        if isinstance(config, ConfigBaseOnline):
            stype = ServiceTypeEnum.ONLINE
            if config.data is not None:
                data = json.dumps(config.data)
            else:
                data = "{}"
        elif isinstance(config, ConfigBaseJournal):
            stype = ServiceTypeEnum.JOURNAL
        else:
            stype = ServiceTypeEnum.SYSTEMD

        service_data = ServiceCreate.model_validate(service)
        service_db = await crud.service.create_service(
            session=session,
            serv=service_data,
            service_type=stype
        )
        confcreate = ConfigCreate.model_validate(
            config,
            update={"id_service": service_db.id_service, "data": data}
        )
        resp = service_db.model_copy()
        await crud.config.create_config(session=session, conf=confcreate)
        if resp.id_service:
            Thread(target=callbacks.beater_callback, args=(resp.id_service,), daemon=True, name="beater callback").start()
        response.status_code = status.HTTP_201_CREATED
        return resp
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return HTTPException(
            status_code=response.status_code,
            detail=str(e)
        )


@router.put("/{id_service}", response_model=ServiceWithConfig | HTTPError,
            responses={
                200: {"model": ServiceWithConfig},
                404: {"model": HTTPError},
                406: {"model": HTTPError},
            },
        )
async def update_service(
        session: SessionDep,
        response: Response,
        id_service: int,
        service: ServiceUpdate,
        config: ConfigUpdateOnline | ConfigUpdateJournal | ConfigUpdateSystemd
    ):
    """
    Update Existing SSH Server
    """
    try:
        # if isinstance(config, ConfigBaseSystemd):
        #     stype = ServiceTypeEnum.SYSTEMD
        # elif isinstance(config, ConfigBaseOnline):
        #     stype = ServiceTypeEnum.ONLINE
        # else:
        #     stype = ServiceTypeEnum.JOURNAL
        serv = session.get(Service, id_service)
        if not serv:
            response.status_code = status.HTTP_404_NOT_FOUND
            return HTTPException(
                status_code=response.status_code,
                detail="Service Not Found"
            )
        # if stype != serv.service_type:
        #     response.status_code = status.HTTP_406_NOT_ACCEPTABLE
        #     return HTTPException(
        #         status_code=response.status_code,
        #         detail="Service type can not change."
        #     )
        confupdate = ConfigUpdate.model_validate(config)
        conf_id = serv.config.id_config
        if conf_id:
            await crud.config.update_config(session=session, id_config=conf_id, conf=confupdate)
        else:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return HTTPException(
                status_code=response.status_code,
                detail="Service had no Config!"
            )
        db_obj = await crud.service.update_service(
            session=session,
            id_service=id_service,
            service_data=service
        )

        if not db_obj:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return HTTPException(
                status_code=response.status_code,
                detail="Update Failed!"
            )
        return db_obj
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return HTTPException(
            status_code=response.status_code,
            detail=str(e)
        )


@router.delete("/{id_service}", responses={
            status.HTTP_202_ACCEPTED: {"model": dict},
            status.HTTP_400_BAD_REQUEST: {"model": HTTPError},
            status.HTTP_406_NOT_ACCEPTABLE: {"model": HTTPError},
        },
    )
async def delete_service_by_id(
        session: SessionDep,
        response: Response,
        id_service: int
    ):
    """
    delete a SSH Server
    """
    obj = await crud.service.delete_service_by_id(session=session, id_service=id_service)
    if obj:
        response.status_code = status.HTTP_202_ACCEPTED
        return {"ok": True}
    response.status_code = status.HTTP_404_NOT_FOUND
    return HTTPException(status_code=response.status_code, detail="Service not found")


@router.websocket("/")
async def get_service_beats(websocket: WebSocket):
    """
    stream heartbeat status of all services
    """
    ws_manager = connection_manager.ServiceConnectionManager()
    await ws_manager.connect(websocket=websocket, channel=0)
    try:
        while True:
            message = await websocket.receive_json()
            if "id_server" in message:
                await ws_manager.change_channel(
                    websocket=websocket,
                    channel= -1 * int(message["id_server"])
                    )
            elif "id_service" in message:
                await ws_manager.change_channel(
                    websocket=websocket,
                    channel=int(message["id_service"])
                    )
    except WebSocketDisconnect as e:
        logger.exception(e)
        ws_manager.disconnect(websocket)
