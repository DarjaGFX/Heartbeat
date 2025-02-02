"""
Callback module for running async tasks
"""
import asyncio

from app.src.task import run_beater


def beater_callback(args: int):
    """
    callback to run async func of run beater task
    """
    asyncio.run(run_beater(id_service=args))
