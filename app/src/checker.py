"""
Check HB of a service in different ways such as:
http request, systemctl status and journalctl reports
"""
import logging
import subprocess
from typing import Any, Literal

import requests

logger = logging.getLogger(__name__)


async def online_service(
        method: Literal["post", "get", "put"],
        url: str,
        desired_response: str = "200",
        operator: Literal["==", "!=", "in", "not in"] = '==',
        target: Literal["status_code", "content"] = 'status_code',
        data: Any = None
        ) -> bool | tuple:
    """
    Online Service HB Check
    """
    try:
        logger.debug({
            "method": method,
            "url": url,
            "desired_response": desired_response,
            "operator": operator,
            "target": target,
            "data": data
        })
        args = {
            "url":url
        }
        if method != 'Get' and data is not None:
            args.update({
                "data":data
            })
        r = eval(f"requests.{method}(**args)")
        condition = f"'{desired_response}' {operator} str(r.{target})"
        if eval(condition):
            return (True, r.elapsed.total_seconds())
        return False
    except Exception as e:
        logger.exception(e)
        return False


async def systemd_service_status(service_name: str) -> bool:
    """
    Systemd service HB Check
    """
    try:
        logger.debug(service_name)
        for ch in '~!@#$%^&*()_+|}{<>?":\'\\/.,':
            if ch in service_name:
                logger.info("service_name must not contain non-alphanumeric characters")
                raise ValueError("service_name must not contain non-alphanumeric characters")
        s = subprocess.run(
            [
                'systemctl',
                'status',
                service_name
            ],
            capture_output=True,
            text=True
        ).stdout
        return 'Active: active' in s
    except Exception as e:
        logger.exception(e)
        return False


async def journalctl(
        service_name: str,
        desired_response: str,
        operator: Literal["in", "not in"]
        ) -> bool:
    """
    Journalctl reports HB Check
    """
    try:
        logger.debug({
            "service_name": service_name,
            "desired_response": desired_response,
            "operator": operator
        })
        js = subprocess.Popen(["journalctl", "-u", service_name], stdout=subprocess.PIPE)
        s = subprocess.check_output(["tail"], stdin=js.stdout).decode(encoding="utf-8").splitlines()
        condition_str = f'"{desired_response}" {operator} "{''.join(s)}"'
        # print(condition_str)
        condition = eval(condition_str)
        return condition
    except Exception as e:
        logger.exception(e)
        return False
