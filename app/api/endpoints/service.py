"""
Service API ENDPOINT
"""

import sqlalchemy.exc
from fastapi import APIRouter, HTTPException, Query, Response, status

from app import crud
from app.api.deps import SessionDep
from app.models import (Service, ServiceBase, ServiceCreate, ServiceUpdate,
                        SystemdServiceBase, SystemdServiceCreate)
from app.schema import HTTPError

router = APIRouter()


# @router.get("/{id_server}",responses={
#             200: {"model": ServerDetail},
#             404: {"model": HTTPError},
#         }
#     )
# async def get_server_by_id(
#         session: SessionDep,
#         response: Response,
#         id_server: int,
#     ):
#     """
#     get SSH Server by id
#     """
#     s = crud.server.get_server_by_id(session=session, id_server=id_server)
#     if s:
#         return ServerDetail.model_validate(s)
#     response.status_code = status.HTTP_404_NOT_FOUND
#     return HTTPException(status_code=404)


@router.get("/",responses={
            200: {"model": list[Service]},
        }
    )
async def get_all_services(
        session: SessionDep,
        response: Response,
        offset: int = Query(default=0, ge=0),
        limit: int = Query(default=10, ge=1)
    ):
    """
    get all Services
    """
    s = await crud.service.get_all_services(session=session, offset=offset, limit=limit)
    if s:
        return s
    response.status_code = status.HTTP_404_NOT_FOUND
    return HTTPException(status_code=404)


@router.post("/",responses={
            201: {"model": Service},
            400: {"model": HTTPError},
            406: {"model": HTTPError},
        },
        response_model_exclude={"password"}
    )
async def creata_service(
        session: SessionDep,
        response: Response,
        service: ServiceBase,
        config: SystemdServiceBase # | OnlineServiceBase | JournalServiceBase
    ):
    """
    Create Service
    """
    try:
        confcreate = SystemdServiceCreate.model_validate(config, update={"service_name": service.service_name})
        conf = await crud.systemd.create_systemd_config(session=session, conf=confcreate)
        service_data = ServiceCreate.model_validate(service, update={"id_config": conf.id_config})
        service_db = await crud.service.create_service(session=session, conf=service_data)
        response.status_code = status.HTTP_201_CREATED
        return service_db
    except sqlalchemy.exc.IntegrityError:
        response.status_code=status.HTTP_406_NOT_ACCEPTABLE
        return HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Service name already taken"
        )
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return HTTPException(
            status_code=response.status_code,
            detail=str(e)
        )


# @router.put("/",responses={
#             200: {"model": ServerDetail},
#             404: {"model": HTTPError},
#             406: {"model": HTTPError},
#         },
#     )
# async def update_server(
#         session: SessionDep,
#         response: Response,
#         id_server: int = Form(...),
#         name: str | None= Form(default=None),
#         ip: str | None= Form(default=None),
#         port: int | None= Form(default=None),
#         username: str | None= Form(default=None),
#         password: str | None = Form(default=None),
#         keyfile: UploadFile = File(default=None),
#     ):
#     """
#     Update Existing SSH Server
#     """
#     kfn = None
#     if keyfile:
#         kfn = keyfile.filename
#         cont = await keyfile.read()
#         if kfn:
#             await savefile(content=cont, filename=kfn, sub_folder=str(id_server))
#     try:
#         server_in = ServerUpdate(
#             name=name,
#             ip=ip,
#             port=port,
#             username=username,
#             password=password,
#             keyfilename=kfn
#         )
#         db_obj = crud.server.update_server(session=session, id_server=id_server, server=server_in)
#         if not db_obj:
#             response.status_code = status.HTTP_404_NOT_FOUND
#             return HTTPException(
#                 status_code=response.status_code,
#                 detail="Server not found"
#             )
#         return ServerDetail.model_validate(db_obj)
#     except ValueError as e:
#         response.status_code = status.HTTP_406_NOT_ACCEPTABLE
#         return HTTPException(
#             status_code=response.status_code,
#             detail=str(e)
#         )


# @router.delete("/{id_server}",responses={
#             status.HTTP_202_ACCEPTED: {"model": Server},
#             status.HTTP_400_BAD_REQUEST: {"model": HTTPError},
#             status.HTTP_406_NOT_ACCEPTABLE: {"model": HTTPError},
#         },
#     )
# async def delete_server_by_id(
#         session: SessionDep,
#         response: Response,
#         id_server: int
#     ):
#     """
#     delete a SSH Server
#     """
#     obj = crud.server.delete_server_by_id(session=session, id_server=id_server)
#     if obj:
#         response.status_code = status.HTTP_202_ACCEPTED
#         return {"ok": True}
#     response.status_code = status.HTTP_404_NOT_FOUND
#     return HTTPException(status_code=response.status_code, detail="Server not found")
