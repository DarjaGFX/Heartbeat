"""
Check HB of a service in different ways such as:
http request, systemctl status and journalctl reports
"""


from app.core.logging import get_configed_logging
from app.models import Service
from app.models.config import MethodEnum

logging = get_configed_logging()
logger = logging.getLogger(__name__)


async def curl_response_parser(response: str) -> tuple[str, str, float]:
    """
    parse curl response.
    returns: (status_code, content, response_time)
    """
    lines = response.splitlines()
    content = '\n'.join(lines[:-2])
    response_time = float(lines[-1].split(' ')[2][:-1])
    status_code = lines[-2].split(' ')[2]
    return (status_code, content, response_time)


async def online_service(
        service: Service
        ) -> tuple[bool, float|None, bool]:
    """
    Online Service HB Check
    """
    try:
        from app.src.connection_manager import SSHManager
        logger.debug({
            "method": service.config.method,
            "url": service.config.url,
            "desired_response": service.config.desired_response,
            "operator": service.config.operator,
            "target": service.config.target,
            "data": service.config.data
        })
        sshm = SSHManager()
        ssh = await sshm.get_ssh_client(server=service.server, id_server=None)
        if ssh is None:
            raise ConnectionError("connection could not be stablished")

        if not service.config.url:
            raise ValueError("url can not be None for Online Services")
        if service.config.method == MethodEnum.GET:
            command = 'curl -s -w "\nStatus Code: %{http_code}\nResponse Time: '\
                    '%{time_total}s\n" -o /dev/stdout ' + service.config.url
        elif service.config.method == MethodEnum.POST:
            data = service.config.data if service.config.data else ' '
            command = f'curl -s -w "\nStatus Code: %{{http_code}}\nResponse Time: ' \
                    f'%{{time_total}}s\n" -o /dev/stdout -X "POST" -H "accept: application/json" '\
                    f"-H 'Content-Type: application/json' -d '{data}' " \
                    + service.config.url


        stdin, stdout, stderr = ssh.exec_command(command)
        output = stdout.read().decode("utf-8")

        status, content, latency = await curl_response_parser(response=output)
        operand = status if service.config.target.value == "status_code" else content # type: ignore
        condition = f"'{
            service.config.desired_response
            }' {service.config.operator.value} '{operand}'" # type: ignore
        if eval(condition):
            return (True, latency, True)
        return (False, None, True)
    except Exception as e:
        logger.exception(e)
        return (False, None, False)


async def systemd_service_status(service: Service) -> tuple[bool, bool]:
    """
    Systemd service HB Check
    """
    try:
        from app.src.connection_manager import SSHManager
        logger.debug({
            "service_name": service.service_name,
            "desired_response": service.config.desired_response,
            "operator": service.config.operator
        })
        for ch in '~!@#$%^&*()_+|}{<>?":\'\\/,':
            if ch in service.service_name:
                logger.info("service name must not contain non-alphanumeric characters")
                raise ValueError("service name must not contain non-alphanumeric characters")
        sshm = SSHManager()
        ssh = await sshm.get_ssh_client(server=service.server, id_server=None)
        if ssh is None:
            raise ConnectionError("connection could not be stablished")

        stdin, stdout, stderr = ssh.exec_command(f"systemctl status {service.service_name}")
        output = stdout.read().decode("utf-8")
        logger.debug(
            "service checker output for service '%s' : %s",
            service.service_name,
            output
        )
        # ssh.close()
        return 'Active: active' in output, True
    except Exception as e:
        logger.exception(e)
        return False, False


async def journalctl(
        service: Service
        ) -> tuple[bool, bool]:
    """
    Journalctl reports HB Check
    """
    try:
        from app.src.connection_manager import SSHManager
        logger.debug({
            "service_name": service.service_name,
            "desired_response": service.config.desired_response,
            "operator": service.config.operator
        })
        for ch in '~!@#$%^&*()_+|}{<>?":\'\\/.,':
            if ch in service.service_name:
                logger.info("service name must not contain non-alphanumeric characters")
                raise ValueError("service name must not contain non-alphanumeric characters")
        sshm = SSHManager()
        ssh = await sshm.get_ssh_client(server=service.server, id_server=None)
        if ssh is None:
            raise ConnectionError("connection could not be stablished")
        stdin, stdout, stderr = ssh.exec_command(f"journalctl -u {service.service_name} | tail")
        output = stdout.read().decode("utf-8")
        condition_str = f'"{
            service.config.desired_response
            }" {service.config.operator.value} """{output}"""'
        condition = eval(condition_str)
        return condition, True
    except Exception as e:
        logger.exception(e)
        return False, False
