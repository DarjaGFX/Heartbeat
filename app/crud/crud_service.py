"""
CRUD for Service
"""
import logging
from typing import Sequence

from sqlmodel import Session, select

from app.models import Service, ServiceCreate, ServiceUpdate, ServiceTypeEnum

logger = logging.getLogger(__name__)


async def create_service(
        session: Session,
        serv: ServiceCreate,
        service_type: ServiceTypeEnum
    ) -> Service:
    """
    create service
    """
    db_obj = Service.model_validate(serv, update={"service_type": service_type})
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


async def get_service_by_id(session: Session, id_service: int) -> Service | None:
    """
    Get service by id
    """
    return session.get(Service, id_service)


async def get_all_services_by_server(session: Session, id_server:int, offset: int = 0, limit: int = 0) -> Sequence[Service]:
    """
    Get All Services of a server
    """
    services = session.exec(
            select(
                Service
            ).where(
                Service.id_server == id_server
            ).offset(
                offset
            ).limit(
                limit
            )
        ).all()
    return services


async def get_all_services(session: Session, offset: int = 0, limit: int = 10) -> Sequence[Service]:
    """
    Get All Services
    """
    services = session.exec(select(Service).offset(offset).limit(limit)).all()
    return services


async def update_service(
        session: Session,
        id_service: int,
        service_data: ServiceUpdate
    ) -> Service | None:
    """
    update service
    """
    db_obj = session.get(Service, id_service)
    if not db_obj:
        return None
    try:
        obj_data = service_data.model_dump(exclude_unset=True, exclude_none=True)
        db_obj.sqlmodel_update(obj_data)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj
    except Exception as e:
        logger.debug(str(e))
        raise Exception(str(e)) from e


async def delete_service_by_id(session: Session, id_service: int) -> Service | None:
    """
    delete a service by id
    """
    db_obj = session.get(Service, id_service)
    if db_obj:
        session.delete(db_obj)
        session.commit()
        return db_obj
    return None
