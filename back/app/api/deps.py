"""
deps
authenticate users and get db session
"""
from collections.abc import Generator
import os
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.core.db import engine


def get_db() -> Generator[Session, None, None]:
    """
    returns db session
    """
    with Session(engine) as session:
        yield session


async def savefile(content, filename: str, sub_folder: str =""):
    """
    Stores SSH key file in keyfiles direcotry
    Args:
        `sub_folder`: should be equal to server id
    """
    try:
        if sub_folder != "":
            sub_folder = sub_folder+'/'
        dirpath = f"app/keyfiles/{sub_folder}"
        filepath = f"{dirpath}{filename}"
        try:
            os.makedirs(dirpath)
        except FileExistsError:
            pass
        with open(filepath, "wb") as f:
            f.write(content)
        return filepath
    except Exception as e:
        return Exception(f"savefile failed: {str(e)}")


SessionDep = Annotated[Session, Depends(get_db)]
