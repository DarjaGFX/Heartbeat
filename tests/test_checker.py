import pytest
# from redis import Redis

# from app.src.checker import journalctl, online_service, systemd_service_status

# pytest_plugins = ('pytest_asyncio',)

# r = Redis()

# r.sadd('services', 'redis', 'google')

# r.hset(
#     name="tor",
#     mapping={
#         "type": "systemd",
#         "service_name": "redis",
#         "period_sec": "5"
#     }
# )
# r.hset(
#     name="google",
#     mapping= {
#         "type": "online",
#         "method": "get",
#         "url": "https://google.com",
#         "period_sec": "10"
#     }
# )


# @pytest.mark.asyncio
# async def test_online_service_status_code():
#     """
#     test Online service check by status code
#     """
#     res = await online_service(method='get', url='https://google.com')
#     if isinstance(res, bool):
#         assert res is True
#     else:
#         assert res[0] is True
    # assert Oservice(method='get', url='https://mail.google.com/mail/u/0/#inbox') == False


# @pytest.mark.asyncio
# async def test_online_service_operator():
#     """
#     test Online service by different operators
#     """
#     res = await online_service(
#         method='get',
#         url='https://google.com',
#         desired_response='script',
#         target='content',
#         operator='in'
#         )
#     if isinstance(res, bool):
#         assert res is True
#     else:
#         assert res[0] is True
#     res = await online_service(
#         method='get',
#         url='https://google.com',
#         desired_response='script',
#         target='content',
#         operator='not in'
#         )
#     assert res is False


# @pytest.mark.asyncio
# async def test_systemd():
#     """
#     test systemd service status
#     """
#     assert await systemd_service_status(service_name='redis') is True
#     assert await systemd_service_status(service_name='Noservice') is False


# @pytest.mark.asyncio
# async def test_journalctl():
#     """
#     test journalctl status report
#     """
#     assert await journalctl(
#         service_name='systemd-journald.service',
#         desired_response=':',
#         operator='in'
#         ) is True
#     assert await journalctl(
#         service_name='systemd-journald.service',
#         desired_response='checker',
#         operator='in'
#     ) is False

# s = r.smembers('services')
# services =  [i.decode(encoding='utf-8') for i in s]

# for i in services:
#     r.srem("services", i)
#     r.delete(i)
#     r.delete(f"{i}_status")
