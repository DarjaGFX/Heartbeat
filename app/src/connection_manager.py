"""
A Connection Manager to manage websockets
"""
import logging
import threading

from fastapi import WebSocket

from app.src.callbacks import live_board_callback

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
            cls.active_connections: list[WebSocket] = []
            _thread = threading.Thread(target=live_board_callback, args=(cls,))
            _thread.start()
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def connect(cls, websocket: WebSocket):
        """
        add a websocket to manager
        """
        try:
            await websocket.accept()
            cls.active_connections.append(websocket)
        except Exception as e:
            logger.exception(e)


    @classmethod
    def disconnect(cls, websocket: WebSocket):
        """"
        disconnect a websocket and remove from manager
        """
        try:
            cls.active_connections.remove(websocket)
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def send_personal_message(cls, message: str, websocket: WebSocket):
        """
        send a message to a websocket
        """
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def broadcast(cls, message: dict):
        """
        send a message to all existing websockets
        """
        try:
            for connection in cls.active_connections:
                await connection.send_json(message)
        except Exception as e:
            logger.exception(e)
