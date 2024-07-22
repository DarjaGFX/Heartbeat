"""
CRUD for SSH Servers
"""
import logging
from typing import Sequence

import sqlalchemy.exc
from sqlmodel import Session, select

from app.models import Server, ServerCreate, ServerUpdate

logger = logging.getLogger(__name__)


async def create_server(
        session: Session,
        server_create: ServerCreate,
        keyfilename: str | None = None
    ) -> Server:
    """
    create server
    """
    _update = None
    if keyfilename:
        _update = {
            "keyfilename": keyfilename
        }
    db_obj = Server.model_validate(server_create, update=_update)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


async def get_server_by_id(session: Session, id_server: int) -> Server | None:
    """
    get server by id_server
    """
    server = session.exec(select(Server).where(Server.id_server==id_server)).one_or_none()
    return server


async def get_all_servers(session: Session, offset: int = 0, limit: int = 0) -> Sequence[Server]:
    """
    get all servers
    """
    servers = session.exec(select(Server).offset(offset).limit(limit)).all()
    return servers


async def update_server(session: Session, id_server: int, server: ServerUpdate) -> Server | None:
    """
    update server
    """
    db_server = session.get(Server, id_server)
    if not db_server:
        return None
    try:
        server_data = server.model_dump(exclude_unset=True, exclude_none=True)
        db_server.sqlmodel_update(server_data)
        session.add(db_server)
        session.commit()
        session.refresh(db_server)
        return db_server
    except sqlalchemy.exc.IntegrityError as e:
        logger.debug(str(e))
        raise ValueError("Server name already taken") from e


async def delete_server_by_id(session: Session, id_server: int) -> Server | None:
    """
    delete a server
    """
    db_obj = session.get(Server, id_server)
    if db_obj:
        session.delete(db_obj)
        session.commit()
        return db_obj
    return None
