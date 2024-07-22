"""
SSH SERVER API ENDPOINT
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import col, delete, func, select

import app.crud as crud
from app.api.deps import SessionDep
from app.crud import crud_beat
from app.models import beat

router = APIRouter()


# @router.get("/{id_beat}")
# async def get_server_by_id(
#         session: SessionDep,
#         response: Response,
#         id_beat: int,
# ) -> Any:
#     """
#     get beat by id
#     """
#     s = crud.beat.get(db=db, id=id_server)
#     if s:
#         return s
#     # response.status_code = status.HTTP_404_NOT_FOUND
#     # return HTTPException(status_code=404)


@router.post("/", response_model=beat.Beat)
async def creata_beat(
        session: SessionDep,
        response: Response,
        beat_in: beat.BeatCreate
) -> Any:
    return crud_beat.create_beat(session=session, beat_create=beat_in)
