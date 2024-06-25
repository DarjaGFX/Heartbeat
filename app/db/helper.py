"""
helper to interact with redis as db
"""
import json
import datetime
import logging
from redis import Redis


logger = logging.getLogger(__name__)

try:
    r = Redis()
except Exception as e:
    logger.exception(e)


async def clear_up():
    """
    remove records and clear db
    """
    services = await get_services()
    for i in services:
        await remove_service(i)


async def get_services():
    """
    get all registered service names
    """
    s = r.smembers('services')
    return [i.decode(encoding='utf-8') for i in s]


async def get_service_config(service_name: str) -> dict | None:
    """
    get config of given service(name)
    """
    s = r.hgetall(name=service_name)
    return {i[0].decode(encoding='utf-8'):i[1].decode(encoding='utf-8') for i in s.items()}


async def add_service(kwargs: dict):
    """
    register a new service
    """
    name = kwargs.get("service_name")
    services = await get_services()
    if name in services:
        raise ValueError("Service Name Already Exists.")
    r.sadd("services", name)
    if 'data' in kwargs:
        if kwargs["data"] == {}:
            kwargs.pop("data")
    r.hset(name=name, mapping=kwargs)


async def update_service_status(sname: str, status: dict):
    """
    update db record of a service status
    """
    status.update({
        "timestamp": datetime.datetime.now(datetime.UTC).timestamp()
    })
    new_status = json.dumps(status)
    r.sadd(f"{sname}_status", new_status)


async def get_service_status(sname: str):
    """
    get status of given service
    """
    return r.smembers(name=f"{sname}_status")


async def remove_service(name: str):
    """
    remove all db records of a given service
    """
    r.srem("services", name)
    r.delete(name)
    r.delete(f"{name}_status")
