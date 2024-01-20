import uuid

from scryer.util import asyncit, shelves


def request_uuid() -> uuid.UUID:
    """Generate a new generic `UUID`."""

    return uuid.uuid1()
