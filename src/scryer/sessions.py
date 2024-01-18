import uuid

from scryer.services import Session, ShelfBroker

class SessionShelver(ShelfBroker[Session]):
    """
    Implementation of `SessionBroker` which stores
    session data using the `shelve` module.

    This allows data to be stored persistently,
    but in a way that can be accessed at runtime
    as if it were in-memory. This would be similar
    to how we'd want our application to behave in
    production, but easier to manipulate in
    development.
    """

    async def create(self) -> tuple[str, Session]:
        # TODO: move to a separate function.
        session = self.resource_cls.new_instance()
        key     = str(uuid.uuid1())

        with self as opened:
            opened.shelf[key] = session
        return (key, session)

    async def modify(self, key: str, resource: Session):
        with self as opened:
            opened.shelf[key] = resource
