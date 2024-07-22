"""
CRUD for Systemd Service
"""
import logging

from sqlmodel import Session

from app.models import (SystemdService, SystemdServiceCreate,
                        SystemdServiceUpdate)

logger = logging.getLogger(__name__)


async def create_systemd_config(
        session: Session,
        conf: SystemdServiceCreate
    ) -> SystemdService:
    """
    create systemd config
    """
    db_obj = SystemdService.model_validate(conf)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


async def update_systemd_config(
        session: Session,
        id_config: int,
        conf: SystemdServiceUpdate
    ) -> SystemdService | None:
    """
    update systemd config
    """
    db_obj = session.get(SystemdService, id_config)
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
