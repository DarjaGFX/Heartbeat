import pytest
from redis import Redis

from app.db.helper import (add_service, get_service_config, get_services,
                                 remove_service)

pytest_plugins = ('pytest_asyncio',)

r = Redis()

r.sadd('services', 'redis', 'google')

r.hset(
    name="redis",
    mapping={
        "type": "systemd",
        "service_name": "redis",
        "period_sec": "5"
    }
)
r.hset(
    name="google",
    mapping= {
        "type": "online",
        "method": "get",
        "url": "https://google.com",
        "period_sec": "10"
    }
)

@pytest.mark.asyncio
async def test_load_basic_servies():
    """
    test load service
    """
    assert sorted(await get_services()) == sorted(['redis', 'google'])


@pytest.mark.asyncio
async def test_add_servies():
    """
    test add new service
    """
    await add_service({
        "service_name": "yahoo",
        "type": "online",
        "url": "https://yahoo.com"
    })
    assert sorted(await get_services()) == sorted(['redis', 'google', 'yahoo'])
    assert sorted(await get_service_config(service_name='yahoo')) == sorted({ # type: ignore
        "service_name": "yahoo",
        "type": "online",
        "url": "https://yahoo.com"
    })


@pytest.mark.asyncio
async def test_remove_servies():
    """
    test remove a service
    """
    await remove_service(name='yahoo')
    assert sorted(await get_services()) == ['google', 'redis']
    assert await get_service_config('yahoo') == {}


# s = r.smembers('services')
# services =  [i.decode(encoding='utf-8') for i in s]

# for i in services:
#     r.srem("services", i)
#     r.delete(i)
#     r.delete(f"{i}_status")
