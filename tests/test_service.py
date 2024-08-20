"""
Testing Service APIs
"""
import os

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.deps import get_db
from app.main import app
from app.models import Config, Server, Service, ServiceTypeEnum

load_dotenv('.env_test')

USERNAME = os.getenv("HOST_USER_NAME", "root")
PASSWORD = os.getenv("HOST_PASSWORD", "admin")


@pytest.fixture(name="session")
def session_fixture():
    """
    db session fixture for testing
    """
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    client fixture for testing
    """
    def get_session_override():
        return session

    app.dependency_overrides[get_db] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_service(session: Session, client: TestClient):
    """
    Test create service API
    """

    server = Server(
        name="localhost",
        ip="127.0.0.1",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    session.add(server)
    session.commit()

    service1 = client.post(
        "/api/service/",
        json={
            "service": {
                "id_server": server.id_server,
                "service_name": "online_service"
            },
            "config": {
                "interval": 10,
                "method": "GET",
                "url": "https://www.google.com",
                "desired_response": "200",
                "operator": "==",
                "target": "status_code",
                "data": {}
            }
        }
    )

    service2 = client.post(
        "/api/service/",
        json={
            "service": {
                "id_server": server.id_server,
                "service_name": "journal_service"
            },
            "config": {
                "interval": 10,
                "desired_response": ":",
                "operator": "in"
            }
        }
    )

    service3 = client.post(
        "/api/service/",
        json={
            "service": {
                "id_server": server.id_server,
                "service_name": "systemd_service"
            },
            "config": {
                "interval": 10
            }
        }
    )
    
    data1 = service1.json()
    data2 = service2.json()
    data3 = service3.json()

    assert service1.status_code == 201
    assert data1["id_service"] == 1
    assert data1["id_server"] == 1
    assert data1["service_type"] == "OnlineService"
    assert data1["service_name"] == "online_service"

    assert service2.status_code == 201
    assert data2["id_service"] == 2
    assert data2["id_server"] == 1
    assert data2["service_type"] == "Journalctl"
    assert data2["service_name"] == "journal_service"

    assert service3.status_code == 201
    assert data3["id_service"] == 3
    assert data3["id_server"] == 1
    assert data3["service_type"] == "SystemdServiceStatus"
    assert data3["service_name"] == "systemd_service"


@pytest.mark.asyncio
async def test_get_service_by_id(session: Session, client: TestClient):
    """
    Test get service by id API
    """
    server = Server(
        name="local_server",
        ip="localhost",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    session.add(server)
    session.commit()

    response = client.get(
        f"/api/server/{server.id_server}",
    )
    data = response.json()
    assert response.status_code == 200
    assert data["name"] == "local_server"
    assert data["ip"] == "localhost"
    assert data["port"] == 22
    assert data["username"] == USERNAME


@pytest.mark.asyncio
async def test_get_service_by_id_invalid(client: TestClient):
    """
    Test get service by invalid id API
    """
    response = client.get("/api/server/1")
    data = response.json()
    assert response.status_code == 404
    assert data["detail"] == "Not Found"


@pytest.mark.asyncio
async def test_get_all_services(session: Session, client: TestClient):
    """
    Test get all services API
    """
    server1 = Server(
        name="local_server",
        ip="localhost",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    service1 = Service(
        id_server=1,
        service_name="local_service1",
        service_type=ServiceTypeEnum.SYSTEMD
    )
    config1 = Config(
        interval=10,
        id_service=1
    )

    server2 = Server(
        name="local_server2",
        ip="127.0.0.1",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    service2 = Service(
        id_server=2,
        service_name="local_service2",
        service_type=ServiceTypeEnum.SYSTEMD
    )
    config2 = Config(
        interval=10,
        id_service=2
    )
    session.add(server1)
    session.add(service1)
    session.add(config1)
    session.add(server2)
    session.add(service2)
    session.add(config2)
    session.commit()
    response = client.get(
        "/api/service/",
    )
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 2
    assert data[0]["id_server"] == server1.id_server
    assert data[0]["service_name"] == service1.service_name
    assert data[0]["service_type"] == service1.service_type
    assert data[1]["id_server"] == server2.id_server
    assert data[1]["service_name"] == service2.service_name
    assert data[1]["service_type"] == service2.service_type

@pytest.mark.asyncio
async def test_get_all_services_by_server(session: Session, client: TestClient):
    """
    Test get all services API
    """
    server1 = Server(
        name="local_server",
        ip="localhost",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    service1 = Service(
        id_server=1,
        service_name="local_service1",
        service_type=ServiceTypeEnum.SYSTEMD
    )
    config1 = Config(
        interval=10,
        id_service=1
    )

    server2 = Server(
        name="local_server2",
        ip="127.0.0.1",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    service2 = Service(
        id_server=2,
        service_name="local_service2",
        service_type=ServiceTypeEnum.SYSTEMD
    )
    config2 = Config(
        interval=10,
        id_service=2
    )
    session.add(server1)
    session.add(service1)
    session.add(config1)
    session.add(server2)
    session.add(service2)
    session.add(config2)
    session.commit()
    response = client.get(
        f"/api/service/server/{server1.id_server}",
    )
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["id_server"] == server1.id_server
    assert data[0]["service_name"] == service1.service_name
    assert data[0]["service_type"] == service1.service_type
    response = client.get(
        f"/api/service/server/{server2.id_server}",
    )
    data = response.json()
    
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["id_server"] == server2.id_server
    assert data[0]["service_name"] == service2.service_name
    assert data[0]["service_type"] == service2.service_type


@pytest.mark.asyncio
async def test_update_service(session: Session, client: TestClient):
    """
    test update service API
    """
    server = Server(
        name="local_server",
        ip="localhost",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    service = Service(
        id_server=1,
        service_name="local_service",
        service_type=ServiceTypeEnum.SYSTEMD
    )
    config = Config(
        interval=10,
        id_service=1
    )

    session.add(server)
    session.add(service)
    session.add(config)
    session.commit()

    response = client.put(
        f"api/service/{service.id_service}",
        json={
            "service": {
                "service_name": "tor",
            },
            "config": {
                "interval": 1800
            }
        }
    )
    data = response.json()
    print(f"{response.content=}")
    print(f"{response.status_code=}")
    assert response.status_code == 200
    assert data["service_name"] == "tor"
    assert data["config"]["interval"] == 1800


@pytest.mark.asyncio
async def test_delete_server(session: Session, client: TestClient):
    """
    test delete server API
    """
    server = Server(
        name="localhost",
        ip="127.0.0.1",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    service = Service(
        id_server=1,
        service_name="local_backend",
        service_type=ServiceTypeEnum.ONLINE
    )
    config = Config(
        interval=10,
        id_service=1
    )
    session.add(server)
    session.add(service)
    session.add(config)
    session.commit()

    response = client.delete(f"/api/service/{service.id_service}")
    data = response.json()

    assert response.status_code == 202
    assert data["ok"] is True
    assert session.get(Service, service.id_service) is None
    assert session.get(Config, config.id_config) is None


@pytest.mark.asyncio
async def test_delete_service_invalid(client: TestClient):
    """
    test delete Service API
    """
    response = client.delete("/api/service/2")
    data = response.json()

    assert response.status_code == 404
    assert data["detail"] == "Service not found"
