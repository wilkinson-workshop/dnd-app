import uuid

from scryer.util import asyncit, shelves

type UUID = uuid.UUID


def request_uuid(value: str | UUID | None = None) -> UUID:
    """Generate a new generic `UUID`."""

    if not value:
        return uuid.uuid1()
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(value)
