"""
Main file of heartbeat service
"""
import json
import logging
import threading
from contextlib import asynccontextmanager
from typing import List
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect, status
from fastapi.encoders import jsonable_encoder

from app import schema
from app.db import helper
from app.src import callbacks, connection_manager

ws_manager = connection_manager.ConnectionManager()



with open('app/logging.json', encoding="utf-8") as f:
    logging.config.dictConfig(config=json.loads(f.read())) # type: ignore

logger = logging.getLogger(__name__)

logger.info("statring ...")

THREADS: List[threading.Thread] = []

@asynccontextmanager
async def lifespan(fapp: FastAPI):
    """
    FastAPI app lifespan
    """
    # Loading
    try:
        await helper.clear_up()
    except Exception as e:
        logger.exception(e)
    # serve
    yield
    # Clean up
    try:
        await helper.clear_up()
    except Exception as e:
        logger.exception(e)


app = FastAPI(lifespan=lifespan)

app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"]
)


@app.get("/service/{name}")
async def get_service(
    response: Response,
    name: str
):
    """
    Endpoint to get a service object in detail
    """
    services = await helper.get_services()
    if name in services:
        response.status_code = status.HTTP_200_OK
        return await helper.get_service_config(service_name=name)
    response.status_code = status.HTTP_404_NOT_FOUND
    return {
        "status_code": status.HTTP_404_NOT_FOUND,
        "msg": "service not found"
    }


@app.get("/service")
async def get_services():
    """
    Endpoint to get all service names
    """
    return await helper.get_services()


@app.post("/service")
async def add_service(
    response: Response,
    service: schema.JournalReport | schema.OnlineService | schema.SystemdService
):
    """
    Endpoint to add a new service
    """
    match type(service):
        case schema.OnlineService:
            stype = "OnlineService"
        case schema.SystemdService:
            stype = "SystemdServiceStatus"
        case schema.JournalReport:
            stype = "Journalctl"
    service_dict: dict = jsonable_encoder(service)
    service_dict.update({
        "type": stype
    })
    try:
        await helper.add_service(service_dict)
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            "status_code": status.HTTP_400_BAD_REQUEST,
            "msg": str(e)
        }
    # from starlette.concurrency import run_in_threadpool
    # await run_in_threadpool(task.run_beater, service.service_name)
    # bgtask.add_task(task.run_beater, service.service_name)
    # from threading import Thread
    # t = Thread(target=task.run_beater, args=(service.service_name,))
    # t.run()
    _thread = threading.Thread(target=callbacks.beater_callback, args=(service.service_name,))
    _thread.start()
    THREADS.append(_thread)
    return {
        "status_code": status.HTTP_201_CREATED,
        "msg": "service added"
    }


@app.delete("/service/{service}")
async def delete_service(
    response: Response,
    service: str
):
    """
    Endpoint to delete a service object
    """
    if service in await helper.get_services():
        await helper.remove_service(name=service)
        response.status_code = status.HTTP_202_ACCEPTED
        return {
            "status_code": status.HTTP_202_ACCEPTED,
            "msg": "service deleted."
        }
    response.status_code = status.HTTP_404_NOT_FOUND
    return {
        "status_code": status.HTTP_404_NOT_FOUND,
        "msg": "service not found"
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    web socket to stream service heartbeat status
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)




#######################################
# @app.get("/status") # WS !!
# async def get_heartbeats():
#     services = await helper.get_services()
#     statuses = []
#     for s in services:
#         status = await helper.get_service_status(sname=s)
#         try:
#             st = [json.loads(i.decode('utf-8')) for i in status]
#             if st:
#                 statuses.append(st)
#         except Exception as e:
#             logger.exception(e)
#     return statuses


# @app.websocket("/ws/{client_id}")
# async def websocket_endpoint(websocket: WebSocket, client_id: int):
#     await ws_manager.connect(websocket)
#     try:
#         while True:
#             data = await websocket.receive_text()
#             await ws_manager.send_personal_message(f"You wrote: {data}", websocket)
#             await ws_manager.broadcast(f"Client #{client_id} says: {data}")
#     except WebSocketDisconnect:
#         ws_manager.disconnect(websocket)
#         await ws_manager.broadcast(f"Client #{client_id} left the chat")
