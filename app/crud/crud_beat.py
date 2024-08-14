"""
CRUD for SSH Servers
"""
from sqlmodel import Session, select

from app.models import Beat, BeatCreate


async def create_beat(session: Session, beat_create: BeatCreate) -> Beat:
    """
    create beat crud
    """
    db_obj = Beat.model_validate(beat_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj
