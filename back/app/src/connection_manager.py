"""
Connection Manager to manage websockets and ssh clients
"""
import asyncio
from typing import Optional

import paramiko
import paramiko.util
import paramiko.ssh_exception
from fastapi import WebSocket

from app.api.deps import get_db
from app.core.logging import get_configed_logging
from app.models import Server


logging = get_configed_logging()
logger = logging.getLogger(__name__)

# paramiko.util.log_to_file("paramiko.log", level=10)

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


class SSHManager(Singleton):
    """
    Singleton based class to manage SSH Clients
    """
    @classmethod
    def __init__(cls):
        try:
            cls.active_connections: dict[int, paramiko.SSHClient] = {}
            logger.debug("SSH Manager initialized")
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def __connect(cls, ssh: paramiko.SSHClient, channel: int):
        """
        add a SSH client to manager
        """
        try:
            cls.active_connections.update({channel: ssh})
            logger.debug("channel : %d created and new ssh client subscribed.", channel)
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def disconnect(cls, ssh: paramiko.SSHClient | None = None, channel: int | None = None):
        """"
        remove ssh from manager
        """
        try:
            logger.debug("disconnecting ssh client from channel :%d, current active connections %s", channel, cls.active_connections)
            if channel is not None and channel in cls.active_connections:
                cls.active_connections.pop(channel)
            elif ssh is not None:
                for ch in cls.active_connections.items():
                    if ssh == ch[1]:
                        channel = ch[0]
                        break
                cls.active_connections.pop(channel) # type: ignore
            else:
                raise ValueError("both ssh and channel can not be None")

            logger.debug("ssh client unsubscribed from channel :%d", channel)
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def renew_client(cls, ssh: paramiko.SSHClient | None, id_server: int | None):
        """
        try to reconnect to ssh host or renew if congif updated
        """
        if id_server is None:
            for ac in cls.active_connections.items():
                if ac[1] == ssh:
                    id_server = ac[0]
                    break
        await cls.disconnect(ssh=ssh, channel=id_server)
        return await cls.get_ssh_client(server=None, id_server=id_server)


    @classmethod
    async def is_active(cls, ssh: paramiko.SSHClient, retry: int = 1) -> bool:
        """
        Check if 
        """
        try:
            if ssh.get_transport():
                res = ssh.get_transport().is_active()
            else:
                if retry > 0:
                    await cls.renew_client(ssh=ssh, id_server=None)
                    return await cls.is_active(ssh=ssh, retry=retry-1)
            return res
        except Exception:
            return False


    @classmethod
    async def get_server_status(cls, ssh: paramiko.SSHClient, retry: int = 1):
        """
        get system resource balance
        """
        try:
            # check memory status
            _, stdout, _ = ssh.exec_command("free -m")
            output = stdout.read().decode("utf-8")
            splited_output = [i.strip().split() for i in output.split('\n')]
            memory = int(splited_output[1][1])
            used_memory = int(splited_output[1][2])

            # check dick status
            _, stdout, _ = ssh.exec_command("df")
            output = stdout.read().decode("utf-8")
            splited_output = [
                i.strip().split() for i in output.split('\n') if len(
                    i.strip().split()) and "/dev/sd" in i.strip().split()[0]
                ]
            disk = sum([int(i[1]) for i in splited_output])
            used_disk = sum([int(i[2]) for i in splited_output])

            # check cpu status
            _, stdout, _ = ssh.exec_command("top -b -n1 | grep 'Cpu(s)'")
            output = stdout.read().decode("utf-8")

            cpu_usage_line = output.strip()
            cpu_usage_parts = cpu_usage_line.split(',')

            idle_percentage = float(
                [part.split()[0] for part in cpu_usage_parts if 'id' in part][0]
            )
            cpu_usage_percent = 100 - idle_percentage

            return  {
                "cpu_usage_percentage": float("{:.2f}".format(cpu_usage_percent)),
                "total_memory_in_KB": memory,
                "used_memory_in_KB": used_memory,
                "total_disk_in_KB": disk,
                "used_disk_in_KB": used_disk
            }
        except Exception:
            if retry > 0:
                return await cls.get_server_status(ssh=ssh, retry=retry-1)
            return None


    @classmethod
    async def get_ssh_client(
        cls,
        server: Server | None,
        id_server: int | None
        ) -> Optional[paramiko.SSHClient]:
        """
        returns ssh client
        """
        try:
            if id_server in cls.active_connections:
                return cls.active_connections[id_server]
            elif server and server.id_server in cls.active_connections:
                return cls.active_connections[server.id_server]
            else:
                return await cls.__create_new_client(server=server, id_server=id_server)
        except Exception as e:
            logger.exception(e)
            return None
            # raise Exception(e) from e


    @classmethod
    async def __create_new_client(
        cls,
        server: Server | None,
        id_server: int | None
    ) -> Optional[paramiko.SSHClient]:
        """
        create new ssh client
        """
        ssh = paramiko.SSHClient()
        try:
            if server is None and id_server is None:
                raise ValueError("Both server and id_server can not be None")
            if id_server:
                session = next(get_db())
                server = session.get(Server, id_server)
            if server is None:
                raise ValueError("server does not exist")
            await cls.__connect(ssh=ssh, channel=server.id_server) # type: ignore
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            if server.password:
                ssh.connect(
                    hostname=server.ip,
                    port=server.port,
                    username=server.username,
                    password=server.password
                )
                return ssh
            elif server.keyfilename:
                k = paramiko.RSAKey.from_private_key_file(server.keyfilename)
                ssh.connect(
                    hostname=server.ip,
                    port=server.port,
                    username=server.username,
                    pkey=k
                )
                return ssh
            else:
                raise ValueError("Both `Password` and `keyfile` can not be None")

        except paramiko.ssh_exception.NoValidConnectionsError as e:
            logger.debug("ssh connection error. id_server: %d", server.id_server) # type: ignore
            logger.exception(e)
            return ssh
        except Exception as e:
            logger.exception(e)
            return ssh


class ServiceConnectionManager(Singleton):
    """
    Singleton based class to manage Service websockets
    """

    @classmethod
    def __init__(cls):
        try:
            cls.active_connections: dict[int, list[WebSocket]] = {}
            logger.debug("Service Connection Manager initialized")
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
                logger.debug("new Service websocket subscribed to channel :%d", channel)
            else:
                cls.active_connections.update({channel: [websocket]})
                logger.debug("channel : %d created and new Service websocket subscribed.", channel)
        except Exception as e:
            logger.exception(e)


    @classmethod
    def disconnect(cls, websocket: WebSocket):
        """
        disconnect a websocket and remove from manager
        """
        try:
            for ch in cls.active_connections.items():
                if websocket in cls.active_connections[ch[0]]:
                    cls.active_connections[ch[0]].remove(websocket)
                    logger.debug("Service websocket unsubscribed from channel :%d", ch[0])
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def change_channel(cls, websocket: WebSocket, channel: int):
        """
        change websocket channel
        channel: 
            `0` for all services
            `positive int for service`
            `negative int for service`
        """
        try:
            for i in cls.active_connections.items():
                if websocket in i[1]:
                    i[1].remove(websocket)
            if channel in cls.active_connections:
                cls.active_connections[channel].append(websocket)
            else:
                cls.active_connections.update({
                    channel: [websocket]
                })
            logger.debug("Service ws channel changed to %d", channel)
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def send_personal_message(cls, message: str, websocket: WebSocket):
        """
        send a message to a websocket
        """
        try:
            await websocket.send_text(message)
            logger.debug("message: %s , sent to Service ws", message)
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
                    # logger.debug(
                    #     "message: %s , broadcasted to Service channel %d",
                    #     message,
                    #     channel
                    # )
            # else:
            #     logger.debug("Service connection channel %s does not exist...", channel)
        except Exception as e:
            logger.exception(e)


class ServerConnectionManager(Singleton):
    """
    Singleton based class to manage Server websockets
    """
    @classmethod
    def __init__(cls):
        try:
            cls.active_connections: list[WebSocket] = []
            logger.debug("Server Connection Manager initialized")
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
            logger.debug("new Server websocket subscribed.")
        except Exception as e:
            logger.exception(e)


    @classmethod
    def disconnect(cls, websocket: WebSocket):
        """"
        disconnect a Server websocket and remove from manager
        """
        try:
            cls.active_connections.remove(websocket)
            logger.debug("Server websocket unsubscribed")
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def send_personal_message(cls, message: str, websocket: WebSocket):
        """
        send a message to a Server websocket
        """
        try:
            await websocket.send_text(message)
            logger.debug("message: %s , sent to Server ws", message)
        except Exception as e:
            logger.exception(e)


    @classmethod
    async def broadcast(cls, message: dict):
        """
        send a message to all existing Server websockets
        """
        try:
            for connection in cls.active_connections:
                await connection.send_json(message)
            # logger.debug("message: %s , broadcasted")
        except Exception as e:
            logger.exception(e)



def get_ssh_clint(i):
    """
    run async get ssh client function. (to be used in separated Thread)
    """
    asyncio.run(SSHManager().get_ssh_client(id_server=i, server=None))


def renew_ssh_clint(i):
    """
    run async renew ssh client function. (to be used in separated Thread)
    """
    asyncio.run(SSHManager().renew_client(id_server=i, ssh=None))
