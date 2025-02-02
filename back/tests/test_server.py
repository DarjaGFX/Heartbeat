"""
Testing Server APIs
"""
import os

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.deps import get_db
from app.main import app
from app.models.server import Server

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
async def test_create_server(client: TestClient):
    """
    Test create server API
    """
    response = client.post(
        "/api/server/",
        data={
            "name": "server_240",
            "ip": "127.0.0.1",
            "port": 22,
            "username": USERNAME,
            "password": PASSWORD
        }  # type: ignore
    )
    data = response.json()
    assert response.status_code == 201
    assert data["name"] == "server_240"
    assert data["ip"] == "127.0.0.1"
    assert data["port"] == 22
    assert data["username"] == USERNAME


@pytest.mark.asyncio
async def test_get_server_by_id(session: Session, client: TestClient):
    """
    Test get server by id API
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


# @pytest.mark.asyncio
# async def test_get_server_by_invalid_id(client: TestClient):
#     """
#     Test get server by id API
#     """
#     response = client.get(
#         "/api/server/99",
#     )
#     assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_all_servers(session: Session, client: TestClient):
    """
    Test get all servers API
    """
    server1 = Server(
        name="local_server",
        ip="localhost",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    server2 = Server(
        name="local_server2",
        ip="127.0.0.1",
        port=22,
        username=USERNAME,
        password=PASSWORD
    )
    session.add(server1)
    session.add(server2)
    session.commit()
    response = client.get(
        "/api/server/",
    )
    data = response.json()

    assert response.status_code == 200
    assert data[0]["name"] == "local_server"
    assert data[0]["id_server"] == server1.id_server
    assert data[1]["name"] == "local_server2"
    assert data[1]["id_server"] == server2.id_server


@pytest.mark.asyncio
async def test_update_server(session: Session, client: TestClient):
    """
    test update server API
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

    response = client.put(
        f"api/server/{server.id_server}",
        data={
            "name": "updated_name",
            "ip": "127.0.0.1",
            "port": 22000,
            "username": "new_username",
            "password": "new_pass_phrase"
        } # type: ignore
    )
    data = response.json()
    assert response.status_code == 200
    assert data["name"] == "updated_name"
    assert data["ip"] == "127.0.0.1"
    assert data["port"] == 22000
    assert data["username"] == "new_username"


@pytest.mark.asyncio
async def test_delete_server(session: Session, client: TestClient):
    """
    test delete server API
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

    response = client.delete(f"api/server/{server.id_server}")
    data = response.json()
    assert response.status_code == 202
    assert data["ok"] is True
    assert session.get(Server, server.id_server) is None


@pytest.mark.asyncio
async def test_delete_server_invalid(client: TestClient):
    """
    test delete server API
    """

    response = client.delete("api/server/2")
    assert response.status_code == 404
