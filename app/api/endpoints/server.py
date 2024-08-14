"""
SSH SERVER API ENDPOINT
"""

import asyncio
import sqlalchemy.exc
from fastapi import (APIRouter, File, Form, HTTPException, Query, Response,
                     UploadFile, WebSocket, WebSocketDisconnect, status)

from app import crud
from app.api.deps import SessionDep, savefile
from app.models import (Server, ServerCreate, ServerDetail, ServerPublic,
                        ServerUpdate)
from app.schema import HTTPError
from app.src import checker, connection_manager

router = APIRouter()


@router.get("/{id_server}",responses={
            200: {"model": ServerDetail},
            404: {"model": HTTPError},
        }
    )
async def get_server_by_id(
        session: SessionDep,
        response: Response,
        id_server: int,
    ):
    """
    get SSH Server by id
    """
    s = await crud.server.get_server_by_id(session=session, id_server=id_server)
    if s:
        return ServerDetail.model_validate(s)
    response.status_code = status.HTTP_404_NOT_FOUND
    return HTTPException(status_code=404)


@router.get("/",responses={
            200: {"model": list[ServerPublic]},
        }
    )
async def get_all_servers(
        session: SessionDep,
        response: Response,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=10, ge=1)
    ):
    """
    get all SSH Servers
    """
    s = await crud.server.get_all_servers(session=session, offset=offset, limit=limit)
    if s:
        return [ServerPublic.model_validate(i) for i in s]
    return []


@router.post("/",responses={
            201: {"model": ServerDetail},
            400: {"model": HTTPError},
            406: {"model": HTTPError},
        }
    )
async def creata_server(
        session: SessionDep,
        response: Response,
        name: str = Form(...),
        ip: str = Form(...),
        port: int = Form(...),
        username: str = Form(...),
        password: str | None = Form(default=None),
        keyfile: UploadFile = File(default=None),
    ):
    """
    Create New SSH Server
    """
    kfn = None
    if keyfile:
        kfn = keyfile.filename
    elif password is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return HTTPException(
            status_code=response.status_code,
            detail="both password and keyfile could not be empty"
        )
    try:
        server_in = ServerCreate(
            name=name,
            ip=ip,
            port=port,
            username=username,
            password=password
        )
        in_db_server = await crud.server.create_server(
            session=session,
            server_create=server_in,
            keyfilename=kfn
        )
        sf = in_db_server.id_server
        if not sf:
            response.status_code=status.HTTP_400_BAD_REQUEST
            return HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Creating new SSH Server Failed"
            )
        if kfn:
            content = await keyfile.read()
            sf = str(sf)
            await savefile(content=content, filename=kfn, sub_folder=sf)
        response.status_code = status.HTTP_201_CREATED
        return ServerDetail.model_validate(in_db_server)
    except sqlalchemy.exc.IntegrityError:
        response.status_code=status.HTTP_406_NOT_ACCEPTABLE
        return HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Server name already taken"
        )
    except Exception as e:
        response.status_code=status.HTTP_400_BAD_REQUEST
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/",responses={
            200: {"model": ServerDetail},
            404: {"model": HTTPError},
            406: {"model": HTTPError},
        },
    )
async def update_server(
        session: SessionDep,
        response: Response,
        id_server: int = Form(...),
        name: str | None= Form(default=None),
        ip: str | None= Form(default=None),
        port: int | None= Form(default=None),
        username: str | None= Form(default=None),
        password: str | None = Form(default=None),
        keyfile: UploadFile = File(default=None),
    ):
    """
    Update Existing SSH Server
    """
    kfn = None
    if keyfile:
        kfn = keyfile.filename
        cont = await keyfile.read()
        if kfn:
            await savefile(content=cont, filename=kfn, sub_folder=str(id_server))
    try:
        server_in = ServerUpdate(
            name=name,
            ip=ip,
            port=port,
            username=username,
            password=password,
            keyfilename=kfn
        )
        db_obj = await crud.server.update_server(session=session, id_server=id_server, server=server_in)
        if not db_obj:
            response.status_code = status.HTTP_404_NOT_FOUND
            return HTTPException(
                status_code=response.status_code,
                detail="Server not found"
            )
        return ServerDetail.model_validate(db_obj)
    except ValueError as e:
        response.status_code = status.HTTP_406_NOT_ACCEPTABLE
        return HTTPException(
            status_code=response.status_code,
            detail=str(e)
        )


@router.delete("/{id_server}",responses={
            status.HTTP_202_ACCEPTED: {"model": dict},
            status.HTTP_404_NOT_FOUND: {"model": HTTPError},
        },
    )
async def delete_server_by_id(
        session: SessionDep,
        response: Response,
        id_server: int
    ):
    """
    delete a SSH Server
    """
    obj = await crud.server.delete_server_by_id(session=session, id_server=id_server)
    if obj:
        response.status_code = status.HTTP_202_ACCEPTED
        return {"ok": True}
    response.status_code = status.HTTP_404_NOT_FOUND
    return HTTPException(status_code=response.status_code, detail="Server not found")


@router.websocket("/{id_server}")
async def get_server_services_beats(
        websocket: WebSocket,
        session: SessionDep,
        id_server: int
    ):
    """
    stream heartbeat status of all services of a server with given id
    """
    ws_manager = connection_manager.ConnectionManager()
    _server = session.get(Server, id_server)
    if _server:
        await ws_manager.connect(websocket=websocket, channel=-1*id_server)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            ws_manager.disconnect(websocket)
