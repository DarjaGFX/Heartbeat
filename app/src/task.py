"""
modulefor repetetive tasks like checking service status and sending results
"""
import json
import logging
import os
import time

from dotenv import load_dotenv

from app.db import helper
from app.src import checker

logger = logging.getLogger(__name__)
load_dotenv()
MAX_CHART_BARS = -1 * int(os.getenv("MAX_CHART_BARS", "50"))

async def run_beater(name: str):
    """
    run a beater for given service based on service config
    """
    conf = await helper.get_service_config(service_name=name)
    while True:
        match conf.get("type"):
            case "OnlineService":
                res = await checker.online_service(
                    method=conf.get("method"),
                    url=conf.get("url"),
                    desired_response=conf.get("desired_response"),
                    operator=conf.get("operator"),
                    target=conf.get("target"),
                    data=conf.get("data", {}),
                )
                if res:
                    result = {
                        "Active": True,
                        "latency": res[1]
                    }
                else:
                    result = {
                        "Active": False
                    }
                await helper.update_service_status(sname=name, status=result)
            case "SystemdServiceStatus":
                res = await checker.systemd_service_status(service_name=name)
                await helper.update_service_status(sname=name, status={"Active": res})
            case "Journalctl":
                res = await checker.journalctl(
                    service_name=name,
                    desired_response=conf.get("desired_response"),
                    operator=conf.get("operator")
                )
                await helper.update_service_status(sname=name, status={"Active": res})
        time.sleep(float(conf.get("period_sec")))


async def update_live_board(cm):
    """
    update status board with latest check results and send to clients using WS connection manager
    """
    while True:
        try:
            services = await helper.get_services()
            charts: dict = {}
            for s in services:
                status = []
                ret = list(await helper.get_service_status(sname=s))
                ret = [json.loads(_.decode(encoding='utf-8')) for _ in ret]
                ret = sorted(ret, key=lambda x: x["timestamp"])
                for res in ret[MAX_CHART_BARS:]:
                    status.append(res)
                charts.update({s: status})
            await cm.broadcast(charts)
        except Exception as e:
            logger.exception(e)
        time.sleep(10)
