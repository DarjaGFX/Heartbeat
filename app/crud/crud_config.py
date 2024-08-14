"""
CRUD for Service Config
"""
import logging

from sqlmodel import Session

from app.models import Config, ConfigCreate, ConfigUpdate

logger = logging.getLogger(__name__)


async def create_config(
        session: Session,
        conf: ConfigCreate
    ) -> Config:
    """
    create config
    """
    db_obj = Config.model_validate(conf)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


async def update_config(
        session: Session,
        id_config: int,
        conf: ConfigUpdate
    ) -> Config | None:
    """
    update config
    """
    db_obj = session.get(Config, id_config)
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
