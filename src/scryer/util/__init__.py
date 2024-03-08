import uuid

from scryer.util import asyncit, shelves

type UUID = uuid.UUID


def request_uuid(value: str | None = None) -> uuid.UUID:
    """Generate a new generic `UUID`."""

    if not value:
        return uuid.uuid1()
    return uuid.UUID(value)
