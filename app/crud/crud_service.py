"""
CRUD for Service
"""
import logging
from typing import Sequence

from sqlmodel import Session, select

from app.models import Service, ServiceCreate, ServiceUpdate

logger = logging.getLogger(__name__)


async def create_service(
        session: Session,
        conf: ServiceCreate
    ) -> Service:
    """
    create service
    """
    db_obj = Service.model_validate(conf)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


async def get_all_services(session: Session, offset: int = 0, limit: int = 0) -> Sequence[Service]:
    """
    Get All Services
    """
    services = session.exec(select(Service).offset(offset).limit(limit)).all()
    return services


async def update_service(
        session: Session,
        id_config: int,
        conf: ServiceUpdate
    ) -> Service | None:
    """
    update service
    """
    db_obj = session.get(Service, id_config)
    if not db_obj:
        return None
    try:
        obj_data = conf.model_dump(exclude_unset=True, exclude_none=True)
        db_obj.sqlmodel_update(obj_data)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj
    except Exception as e:
        logger.debug(str(e))
        raise Exception(str(e)) from e
