"""
logging module
"""
import json
import logging
import os


def get_configed_logging():
    """
    config logging and return logger
    """
    os.makedirs('app/logs', exist_ok=True)
    with open('app/logging.json', encoding="utf-8") as f:
        logging.config.dictConfig(config=json.loads(f.read())) # type: ignore
    return logging
