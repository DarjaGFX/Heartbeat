"""
Server model (based on SQLModel)
"""
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .service import Service



class ServerBase(SQLModel):
    """
    ServerBase model
    """
    name: str = Field(nullable=False, index=True, unique=True)
    ip: str = Field(nullable=False)
    port: int = Field(default=22, nullable=False)
    username: str = Field(nullable=False)


class ServerCreate(ServerBase):
    """
    ServerCreate model
    """
    password: str | None = Field(default=None, nullable=True)


class ServerUpdate(SQLModel):
    """
    ServerUpdate model
    """
    name: str | None = Field(nullable=False, index=True, unique=True)
    ip: str | None = Field(nullable=False)
    port: int | None = Field(default=22, nullable=False)
    username: str | None = Field(nullable=False)
    password: str | None = Field(default=None, nullable=True)
    keyfilename: str | None = Field(default=None, nullable=True)


class Server(ServerCreate, table=True):
    """
    Server Table Class
    """
    id_server: int | None = Field(default=None, primary_key=True)
    keyfilename: str | None = Field(default=None, nullable=True)

    services: list["Service"] = Relationship(back_populates="server", cascade_delete=True)


class ServerPublic(SQLModel):
    """
    ServerPublic model
    """
    id_server: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, index=True, unique=True)


class ServerDetail(ServerBase):
    """
    ServerDetail model
    """
    id_server: int | None = Field(default=None, primary_key=True)
    keyfilename: str | None = Field(default=None, nullable=True)
