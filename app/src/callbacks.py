"""
Callback module for running async tasks
"""
import asyncio

from app.src.task import run_beater, update_live_board


def live_board_callback(args):
    """
    call back to run async func of update live board task
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(update_live_board(args))
    loop.close()


def beater_callback(args):
    """
    call back to run async func of run beater task
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(run_beater(args))
    loop.close()
