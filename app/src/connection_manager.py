"""
A Connection Manager to manage websockets
"""
import asyncio
import logging
from typing import Self

from fastapi import WebSocket

from app.src.task import update_live_board

logger = logging.getLogger(__name__)



class Singleton:
    """
    Singleton BaseClass
    """
    __initialized = False

    def __new__(cls, *args, **kwargs):
        if not cls.__initialized:
            cls.__init__(*args, **kwargs)
            cls.__initialized = True
        return cls



class ConnectionManager(Singleton):
    """
    Singleton based class to manage websockets
    """
    @classmethod
    def __init__(cls):
        try:
            cls.active_connections: dict[int, list[WebSocket]] = {}
            asyncio.create_task(update_live_board(cls))
            logger.debug("Connection Manager initialized")
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def connect(cls, websocket: WebSocket, channel: int):
        """
        add a websocket to manager
        """
        try:
            await websocket.accept()
            if channel in cls.active_connections:
                cls.active_connections[channel].append(websocket)
                logger.debug("new websocket subscribed to channel :%d", channel)
            else:
                cls.active_connections.update({channel: [websocket]})
                logger.debug("channel : %d created and new websocket subscribed.", channel)
        except Exception as e:
            logger.exception(e)


    @classmethod
    def disconnect(cls, websocket: WebSocket):
        """"
        disconnect a websocket and remove from manager
        """
        try:
            for ch in cls.active_connections.items():
                if websocket in cls.active_connections[ch[0]]:
                    cls.active_connections[ch[0]].remove(websocket)
                    logger.debug("websocket unsubscribed from channel :%d", ch[0])
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def send_personal_message(cls, message: str, websocket: WebSocket):
        """
        send a message to a websocket
        """
        try:
            await websocket.send_text(message)
            logger.debug("message: %s , sent to ws", message)
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def auto_broadcast(cls, msg: dict):
        """
        gives dict which keys are channel ids and values are messages
        and broadcast each message to its channel.
        """
        try:
            for i in msg.items():
                await cls.broadcast(message=i[1], channel=i[0])
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def broadcast(cls, message: dict, channel: int):
        """
        send a message to all existing websockets
        """
        try:
            if channel in cls.active_connections:
                for connection in cls.active_connections[channel]:
                    await connection.send_json(message)
                    logger.debug("message: %s , broadcasted to channel %d", message, channel)
            else:
                logger.debug("connection channel %s does not exist...", channel)
        except Exception as e:
            logger.exception(e)
